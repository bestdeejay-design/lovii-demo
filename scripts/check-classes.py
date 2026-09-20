#!/usr/bin/env python3
"""Страж словаря: следит, чтобы в CSS не появлялись новые классы «из головы».

Зачем: самая частая ошибка на этом проекте — нарисовать свой блок вместо системного
(пример: .auth-channel вместо .row-item + .list-card). Правило простое:
новый класс — это осознанное решение. Скрипт сравнивает текущий набор классов с эталоном
(scripts/class-baseline.json) и показывает добавленные и удалённые.

Запуск:
  python3 scripts/check-classes.py            # отчёт, код 0
  python3 scripts/check-classes.py --strict   # код 1, если появились новые классы (для CI)
  python3 scripts/check-classes.py --update   # перезаписать эталон (после осознанного решения)

Перед добавлением нового класса спросите себя: это композиция системных
(.row-item/.list-card/.sr-ico/.ri-mid/.chev/.app-badge/.acc-field/.acct__btn/.card) —
или новая визуальная роль? Во втором случае сначала канонизация, потом класс.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "css/lovii.css"
BASE = ROOT / "scripts/class-baseline.json"

strict = "--strict" in sys.argv
update = "--update" in sys.argv


def classes_of(text: str) -> list[str]:
    nc = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    out = set()
    for m in re.finditer(r"(^|\})([^{}]+)\{", nc):
        for name in re.findall(r"\.([a-zA-Z][\w-]*)", m.group(2)):
            out.add(name)
    return sorted(out)


current = classes_of(CSS.read_text(encoding="utf-8"))
baseline = json.loads(BASE.read_text(encoding="utf-8")) if BASE.exists() else {"classes": []}
known = set(baseline.get("classes", []))

if update or not BASE.exists():
    BASE.write_text(json.dumps({"classes": current}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"эталон обновлён: {len(current)} классов → {BASE}")
    sys.exit(0)

added = sorted(set(current) - known)
removed = sorted(known - set(current))

if not added and not removed:
    print(f"словарь: чисто — {len(current)} классов, новых нет")
    sys.exit(0)

if added:
    print(f"словарь: {len(added)} новых классов — это осознанное решение?")
    for c in added:
        print(f"  + .{c}")
    print("  если класс собирает системные блоки — используйте их вместо нового;\n"
          "  если это новая визуальная роль — канонизируйте и только потом добавляйте.\n"
          "  после осознанного решения: python3 scripts/check-classes.py --update")
if removed:
    print(f"\nсловарь: {len(removed)} классов исчезло (проверьте, не осталось ли ссылок в разметке):")
    for c in removed[:40]:
        print(f"  − .{c}")

sys.exit(1 if strict else 0)
