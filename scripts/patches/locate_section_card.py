from __future__ import annotations

import sys
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def main() -> None:
    if len(sys.argv) < 2:
        print('Usage: python scripts/patches/locate_section_card.py "Section Title"')
        raise SystemExit(1)

    title = sys.argv[1]
    text = PAGE.read_text(encoding="utf-8")
    needle = f'<SectionCard title="{title}"'
    start = text.find(needle)
    if start == -1:
        print(f'Could not find SectionCard title="{title}"')
        raise SystemExit(1)

    # line number for the opening tag
    start_line = text.count("\n", 0, start) + 1

    # find the matching </SectionCard>
    close_tag = "</SectionCard>"
    close = text.find(close_tag, start)
    if close == -1:
        print("Could not find closing </SectionCard>")
        raise SystemExit(1)

    end = close + len(close_tag)
    end_line = text.count("\n", 0, end) + 1

    print(f'Title: {title}')
    print(f'Opening line: {start_line}')
    print(f'Closing line: {end_line}')


if __name__ == "__main__":
    main()