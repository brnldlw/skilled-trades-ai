cat > scripts/patches/locate_section_card_regex.py <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def main() -> None:
    if len(sys.argv) < 2:
        print('Usage: python scripts/patches/locate_section_card_regex.py "Section Title"')
        raise SystemExit(1)

    title = re.escape(sys.argv[1])
    text = PAGE.read_text(encoding="utf-8")

    pattern = re.compile(
        rf'<SectionCard\b[\s\S]*?title="{title}"[\s\S]*?</SectionCard>',
        re.MULTILINE,
    )
    match = pattern.search(text)
    if not match:
        print(f'Could not find SectionCard title="{sys.argv[1]}"')
        raise SystemExit(1)

    start = match.start()
    end = match.end()

    start_line = text.count("\n", 0, start) + 1
    end_line = text.count("\n", 0, end) + 1

    print(f'Title: {sys.argv[1]}')
    print(f'SectionCard start line: {start_line}')
    print(f'SectionCard end line: {end_line}')


if __name__ == "__main__":
    main()
PY