#!/usr/bin/env python3
# ============================================================
# Фото для витрины: генерация и скачивание в репозиторий.
#
# Сервис: PicSUM:DEV (https://www.picsum.dev) — бесплатный, без ключей.
#   · случайная картинка:      GET /{w}/{h}?blur=&grayscale=&seed=&static
#   · картинка из галереи:     GET /i/{id}/{w}/{h}
#   · генерация по описанию:   POST /gallery/generate  (нужен CSRF-токен)
#
# Политика проекта: картинки НЕ хотлинкаем. Скачиваем один раз,
# уменьшаем и кладём в assets/photos/ — витрина работает без внешней
# сети и не зависит от чужого сервиса.
#
# Запуск (из корня витрины):
#   python3 scripts/fetch-photos.py            # сгенерировать недостающие
#   python3 scripts/fetch-photos.py --only daily,sloyka
#   python3 scripts/fetch-photos.py --list     # что уже есть
# ============================================================
import argparse, json, pathlib, re, subprocess, sys, time, urllib.request, http.cookiejar

BASE = "https://www.picsum.dev"
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "photos"
MANIFEST = OUT / "photos.json"
SIZE = 512          # итоговый размер квадрата
UA = "Mozilla/5.0 (lovii-demo photo fetcher)"

# По теме: фраза-стиль по категории товара/заведения (английский лучше понимается моделью)
CATEGORY_PROMPT = {
    "bakery":   "fresh bakery pastry, food photography, soft warm light, light background",
    "coffee":   "coffee drink in a paper cup, food photography, warm light",
    "flowers":  "fresh flower bouquet, soft daylight, minimal background",
    "sushi":    "sushi set on a slate board, food photography",
    "pizza":    "italian pizza, top view, food photography",
    "grocery":  "fresh groceries, vegetables and greens, top view, light background",
    "burgers":  "juicy burger with fries, food photography, warm light",
    "pharmacy": "pharmacy products on a clean white background",
    "laundry":  "clean folded clothes and laundry service, minimal",
    "beauty":   "beauty salon tools, soft pink background, minimal",
    "tailor":   "tailoring workshop, fabric and scissors, warm light",
    "sweets":   "chocolate and sweets, food photography, warm light",
    "dairy":    "dairy products, milk and cheese, light background",
    "shoes":    "leather shoes repair, workshop, warm light",
    "default":  "product photo, clean light background, soft shadow",
}


# Категории сервиса (свои!), а не демо: сервис принимает только свой список.
SERVICE_CATEGORY = {
    "bakery": "food", "coffee": "food", "sweets": "food", "dairy": "food",
    "sushi": "food", "pizza": "food", "burgers": "food", "grocery": "food",
    "flowers": "nature",
    "pharmacy": "business", "laundry": "business", "beauty": "business",
    "tailor": "business", "shoes": "business",
}
DEFAULT_SERVICE_CATEGORY = "food"


# Позиции, которых нет в data.js (встречаются только в зеркале витрины).
# donor — взять кадр другой позиции (одно фото на несколько заведений — это нормально).
EXTRA = {
    "fitness": {"service": "sports", "name": "Клуб «Сила»",
                "prompt": "modern gym interior, dumbbells, mats, clean light space"},
    "cvety":   {"name": "Цветы «Бутон»", "donor": "flowers"},
}


def service_category(cat):
    return SERVICE_CATEGORY.get(cat, DEFAULT_SERVICE_CATEGORY)


def read_data():
    """Берём заведения и товары прямо из data.js (slug, name, category)."""
    src = (ROOT / "js" / "data.js").read_text(encoding="utf-8")
    items = []
    for kind in ("stores", "products"):
        block = src.split(kind + ": [", 1)
        if len(block) < 2:
            continue
        body = block[1].split("\n  ]", 1)[0]
        for m in re.finditer(r"slug:\s*'([^']+)'[^}]*?name:\s*'([^']+)'[^}]*?category:\s*'([^']+)'", body, re.S):
            items.append({"slug": m.group(1), "name": m.group(2), "category": m.group(3), "kind": kind})
    # уникальные по slug, заведения важнее
    seen, out = set(), []
    for it in sorted(items, key=lambda x: 0 if x["kind"] == "stores" else 1):
        if it["slug"] in seen:
            continue
        seen.add(it["slug"]); out.append(it)
    return out


def opener():
    cj = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))


def get_csrf(op):
    req = urllib.request.Request(BASE + "/gallery", headers={"User-Agent": UA})
    html = op.open(req, timeout=60).read().decode("utf-8", "ignore")
    m = re.search(r'name="csrf-token"\s+content="([^"]+)"', html)
    if not m:
        raise RuntimeError("не найден csrf-token")
    return m.group(1)


def generate(op, token, category, prompt):
    body = json.dumps({"category": category, "prompt": prompt}).encode()
    req = urllib.request.Request(BASE + "/gallery/generate", data=body, method="POST", headers={
        "Content-Type": "application/json", "Accept": "application/json",
        "X-CSRF-TOKEN": token, "User-Agent": UA})
    data = json.loads(op.open(req, timeout=180).read().decode("utf-8", "ignore"))
    if not data.get("success"):
        raise RuntimeError(data.get("message") or "генерация не удалась")
    return data


def download(op, url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    raw = op.open(req, timeout=180).read()
    tmp = dest.with_suffix(".raw")
    tmp.write_bytes(raw)
    if subprocess.run(["sips", "-Z", str(SIZE), str(tmp), "--out", str(dest)],
                      capture_output=True).returncode != 0:
        dest.write_bytes(raw)          # sips нет — кладём как есть
    tmp.unlink(missing_ok=True)


def write_js_map(manifest):
    """Карта slug → файл для витрины: работает офлайн и кэшируется PWA."""
    by_slug = ", ".join(f'"{k}": "{v["file"]}"' for k, v in sorted(manifest.items()))
    by_name = ", ".join(f'"{str(v.get("name","")).strip().lower()}": "{v["file"]}"'
                        for k, v in sorted(manifest.items()) if v.get("name"))
    js = ("/* Карта фото: по slug позиции и по названию (в зеркале витрины идентификаторы отличаются) */\n"
          f"window.LOVII_PHOTOS = {{{by_slug}}};\n"
          f"window.LOVII_PHOTO_NAMES = {{{by_name}}};\n")
    (ROOT / "js" / "photos.js").write_text(js, encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    if args.list:
        for k, v in sorted(manifest.items()):
            print(f"  {k:<20} {v.get('prompt','')[:60]}")
        print(f"всего: {len(manifest)}")
        return 0

    items = read_data()
    only = [s.strip() for s in args.only.split(",") if s.strip()]
    if only:
        items = [i for i in items if i["slug"] in only]
    todo = [i for i in items if i["slug"] not in manifest]
    if args.limit:
        todo = todo[:args.limit]
    print(f"фото есть: {len(manifest)}; к генерации: {len(todo)}")

    # сначала «зеркальные» позиции: переиспользование чужого кадра или отдельная генерация
    for slug, meta in EXTRA.items():
        if slug in manifest:
            continue
        try:
            if meta.get("donor"):
                srcf = OUT / f"{meta['donor']}.jpg"
                dest = OUT / f"{slug}.jpg"
                dest.write_bytes(srcf.read_bytes())
                manifest[slug] = {"file": f"assets/photos/{slug}.jpg", "from": f"assets/photos/{meta['donor']}.jpg",
                                  "prompt": f"переиспользован кадр «{meta['donor']}»", "name": meta.get("name", ""),
                                  "fetched": time.strftime("%Y-%m-%d")}
                print(f"  = {slug:<20} переиспользован {meta['donor']}")
            else:
                need_token = None
                op_tmp = opener()
                token_tmp = get_csrf(op_tmp)
                res = generate(op_tmp, token_tmp, meta.get("service", "business"), meta["prompt"])
                dest = OUT / f"{slug}.jpg"
                download(op_tmp, res["url"], dest)
                manifest[slug] = {"file": f"assets/photos/{slug}.jpg", "id": res.get("id"), "prompt": meta["prompt"],
                                  "category": meta.get("service"), "source": res.get("url"), "detail": res.get("detail"),
                                  "fetched": time.strftime("%Y-%m-%d"), "name": meta.get("name", "")}
                print(f"  + {slug:<20} {dest.stat().st_size // 1024} КБ")
            MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
        except Exception as e:
            print(f"  ! {slug}: {e}")

    op = opener()
    token = None
    for it in todo:
        prompt = CATEGORY_PROMPT.get(it["category"], CATEGORY_PROMPT["default"]) + f" — {it['name']}"
        try:
            if token is None:
                token = get_csrf(op)
            res = generate(op, token, service_category(it["category"]), prompt)
            dest = OUT / f"{it['slug']}.jpg"
            download(op, res["url"], dest)
            manifest[it["slug"]] = {
                "file": f"assets/photos/{it['slug']}.jpg", "id": res.get("id"),
                "prompt": prompt, "category": service_category(it["category"]),
                "source": res.get("url"), "detail": res.get("detail"), "fetched": time.strftime("%Y-%m-%d"),
                "name": it["name"],
            }
            MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
            print(f"  + {it['slug']:<20} {dest.stat().st_size // 1024} КБ")
        except Exception as e:
            print(f"  ! {it['slug']}: {e}")
            token = None               # токен мог протухнуть — берём новый
            time.sleep(1)
    write_js_map(manifest)
    print(f"готово, всего фото: {len(manifest)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
