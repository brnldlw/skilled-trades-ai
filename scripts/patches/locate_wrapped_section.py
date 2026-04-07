from __future__ import annotations

import sys
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def main() -> None:
    if len(sys.argv) < 2:
        print('Usage: python scripts/patches/locate_wrapped_section.py "Section Title"')
        raise SystemExit(1)

    title = sys.argv[1]
    text = PAGE.read_text(encoding="utf-8")
    needle = f'<SectionCard title="{title}"'
    card_start = text.find(needle)
    if card_start == -1:
        print(f'Could not find SectionCard title="{title}"')
        raise SystemExit(1)

    # Find wrapper start by walking upward to the nearest opening marginTop div
    wrapper_needle = '<div style={{ marginTop: 16 }}>'
    wrapper_start = text.rfind(wrapper_needle, 0, card_start)
    if wrapper_start == -1:
        wrapper_start = card_start

    # Find card close
    card_close = text.find("</SectionCard>", card_start)
    if card_close == -1:
        print("Could not find closing </SectionCard>")
        raise SystemExit(1)
    card_close_end = card_close + len("</SectionCard>")

    # Find wrapper close immediately after the card
    wrapper_close = text.find("</div>", card_close_end)
    if wrapper_close == -1:
        print("Could not find closing </div> after </SectionCard>")
        raise SystemExit(1)
    wrapper_close_end = wrapper_close + len("</div>")

    start_line = text.count("\n", 0, wrapper_start) + 1
    end_line = text.count("\n", 0, wrapper_close_end) + 1
    print(f'Title: {title}')
    print(f'Wrapper start line: {start_line}')
    print(f'Wrapper end line: {end_line}')


if __name__ == "__main__":
    main()