#!/usr/bin/env python3
# ============================================================
# Страж «мёртвой привязки»: селекторы в css/lovii.css, которые
# ссылаются на классы, отсутствующие в разметке и скриптах.
#
# Зачем: именно так ломаются иконки. Правило вида
#   .row-rail .qty button svg{ width:16px }
# молча перестаёт работать, когда обёртку .row-rail убрали из
# разметки, — SVG растягивается на всю кнопку, а страж темы и
# страж словаря этого не видят (они про цвет и про имена).
#
# Запуск (из корня витрины):
#   python3 scripts/check-dead-scope.py            # отчёт
#   python3 scripts/check-dead-scope.py --strict   # код 1 при находках
# ============================================================
import re, sys, pathlib, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSS = ROOT / "css" / "lovii.css"
SOURCES = [ROOT / "index.html"] + sorted((ROOT / "js").glob("*.js")) + sorted((ROOT / "design").glob("**/*.html"))


def template_prefixes(text):
    pre = set()
    for m in re.finditer(r"[\"'`]([^\"'`]*?)\$\{", text):
        for tok in re.split(r"[\s\"'`]+", m.group(1)):
            if re.fullmatch(r"[A-Za-z][\w-]*", tok):
                pre.add(tok)
    return pre


def main() -> int:
    strict = "--strict" in sys.argv
    if not CSS.exists():
        print("нет css/lovii.css")
        return 1
    css = re.sub(r"/\*.*?\*/", "", CSS.read_text(encoding="utf-8"), flags=re.S)
    text = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in SOURCES if p.exists())
    tmpl = template_prefixes(text)

    def declared(name):
        if re.search(r"(?<![\w-])" + re.escape(name) + r"(?![\w-])", text):
            return True
        if re.search(r"class\s*=\s*[\"'`][^\"'`]*\b" + re.escape(name) + r"[\w-]*", text):
            return True
        for t in tmpl:
            if name == t or name.startswith(t) or t.startswith(name):
                return True
        return False

    offenders = collections.defaultdict(list)
    for m in re.finditer(r"([^{}]+)\{", css):
        sel = m.group(1).strip()
        if sel.startswith("@") or not sel:
            continue
        classes = re.findall(r"\.(-?[A-Za-z_][\w-]*)", sel)
        if not classes:
            continue
        dead = [c for c in classes if not declared(c)]
        if dead and len(dead) == len(classes):
            offenders[", ".join(dead)].append(sel)

    if not offenders:
        print("мёртвой привязки нет: все классы селекторов встречаются в разметке или собираются в JS ✓")
        return 0

    print(f"селекторов с классами, которых нет в разметке: {sum(len(v) for v in offenders.values())}")
    for classes, sels in sorted(offenders.items()):
        print(f"  · .{classes}")
        for s in sels[:3]:
            print(f"      {s[:96]}")
    print("\nэто не всегда ошибка: класс может быть заготовкой канона или собираться иначе — проверьте руками.")
    return 1 if strict else 0


if __name__ == "__main__":
    sys.exit(main())
