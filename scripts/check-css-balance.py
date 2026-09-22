#!/usr/bin/env python3
"""Страж целостности CSS: баланс фигурных скобок и отсутствие «правил без закрытия».

Зачем: один потерянный `}` ломает разбор всего файла дальше — браузер молча
перестаёт применять сотни правил (так уже случалось дважды). Ни страж темы,
ни страж словаря, ни страж мёртвой привязки такого не видят.

Запуск: python3 scripts/check-css-balance.py [--strict]
"""
import pathlib, sys
p = pathlib.Path(__file__).resolve().parent.parent / "css" / "lovii.css"
t = p.read_text(encoding="utf-8")
o, cl = t.count("{"), t.count("}")
# глубина по строкам: отрицательная = лишняя закрывающая, в конце <> 0 = незакрытая
depth = 0
bad = []
for i, line in enumerate(t.splitlines(), 1):
    depth += line.count("{") - line.count("}")
    if depth < 0:
        bad.append((i, line.strip()[:70])); depth = 0
print(f"фигурных скобок: {{ {o} }} {cl} | глубина в конце: {depth}")
if bad:
    print("лишние закрывающие скобки:")
    for i, l in bad[:5]: print(f"  строка {i}: {l}")
print("незакрытых правил нет ✓" if depth == 0 and not bad else "ФАЙЛ НЕ СБАЛАНСИРОВАН ✗")
sys.exit(1 if (depth or bad) and "--strict" in sys.argv else 0)
