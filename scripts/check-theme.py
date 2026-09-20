#!/usr/bin/env python3
"""Страж темы: показывает зашитые цвета там, где они ломают тёмную тему.

Что проверяем: свойства, которые ОБЯЗАНЫ переключаться по теме —
color, background-color, border-color, fill, stroke.
Что НЕ проверяем: box-shadow, background-image (градиенты брендовых карт и оверлеи поверх
фото — они осознанно не зависят от темы), а также значения, собранные через var().

Запуск:  python3 scripts/check-theme.py [путь-к-css] [--strict]
Без --strict — печатает отчёт и возвращает 0 (это долг, а не падение сборки).
С --strict — возвращает 1, если находки есть (для подключения в CI, когда долг закрыт).
"""
import re
import sys
from pathlib import Path

args = [a for a in sys.argv[1:] if not a.startswith("--")]
strict = "--strict" in sys.argv
CSS = Path(args[0] if args else "css/lovii.css")

RAW = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(")
PROPS = ("color", "background-color", "border-color", "fill", "stroke")
# осознанные исключения: рисунок самих карт LOVII PAY и наложения поверх фото
ALLOW = re.compile(
    r"\.paycard|\.mini-card|\.pay-|\.home-banner__ad|\.promo-card|\.qr-card|\.mascot"
    # текст на брендовых тёмных подложках: они остаются тёмными в обеих темах,
    # поэтому белый цвет здесь — осознанное решение, а не пропущенный токен
    r"|\.loyalty|\.mentor-card|\.connect-copy|\.roi-card|\.msp-mobile-head|\.prof-phone|\.pay-face"
)

src = re.sub(r"/\*.*?\*/", "", CSS.read_text(encoding="utf-8"), flags=re.S)

# границы слоя tokens — его содержимое пропускаем: там цвета и живут
spans = []
for m in re.finditer(r"@layer\s+tokens\s*\{", src):
    depth, j = 1, m.end()
    while j < len(src) and depth:
        if src[j] == "{":
            depth += 1
        elif src[j] == "}":
            depth -= 1
        j += 1
    spans.append((m.start(), j))


def in_tokens(pos):
    return any(a <= pos < b for a, b in spans)


problems = []
for m in re.finditer(r"([^{}]*)\{([^{}]*)\}", src):
    if in_tokens(m.start()):
        continue
    head = re.sub(r"\s+", " ", m.group(1).strip())
    if not head or head.startswith("@") or ALLOW.search(head):
        continue
    for pm in re.finditer(r"([a-z-]+)\s*:\s*([^;]+);", m.group(2)):
        prop, val = pm.group(1), pm.group(2)
        if prop in PROPS and RAW.search(val) and "var(" not in val:
            problems.append((head[:66], prop, val.strip()[:44]))

if not problems:
    print(f"тема: чисто — зашитых цветов в темо-критичных свойствах нет ({CSS})")
    sys.exit(0)

print(f"тема: {len(problems)} зашитых цветов в color/background-color/border-color вне токен-слоя")
print("(тёмная тема их не переключит; box-shadow и градиенты карт в проверку не входят)\n")
for sel, prop, val in sorted(problems):
    print(f"  {sel:<68} {prop}: {val}")
print("\nкак чинить: заменить на ближайший токен --lv-*; если оттенок уникальный — вынести в канон")
sys.exit(1 if strict else 0)
