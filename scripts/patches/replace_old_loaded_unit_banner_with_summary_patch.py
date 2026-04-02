from __future__ import annotations

import re
import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")
    original = source

    if "replace-old-loaded-unit-banner-v1" in source:
        print("Old loaded unit banner replacement already applied.")
        return

    # Mark applied
    marker = "/* replace-old-loaded-unit-banner-v1 */\n"
    source = marker + source

    patterns = [
        # If the old banner was wrapped with a named sentinel comment
        r'\n\s*\{/\*\s*current-loaded-unit-banner.*?\*/\}.*?(?=\n\s*<div style=\{\{ gridColumn: "1 / -1", marginTop: 12 \}\}>\n\s*<div\n\s*style=\{\{\n\s*border: "1px solid #e5e5e5",\n\s*borderRadius: 12,\n\s*padding: 10,\n\s*background: "#fffdf7",)',
        r'\n\s*\{/\*\s*sticky-loaded-unit-banner.*?\*/\}.*?(?=\n\s*<div style=\{\{ gridColumn: "1 / -1", marginTop: 12 \}\}>\n\s*<div\n\s*style=\{\{\n\s*border: "1px solid #e5e5e5",\n\s*borderRadius: 12,\n\s*padding: 10,\n\s*background: "#fffdf7",)',
        # Title-based block removal for old banner
        r'\n\s*<div[^>]*>\s*\n\s*<div[^>]*>\s*\n\s*<div style=\{\{ fontWeight: 900, fontSize: 16 \}\}>\s*Current Loaded Unit\s*</div>.*?</div>\s*</div>\s*(?=\n\s*<div style=\{\{ gridColumn: "1 / -1", marginTop: 12 \}\}>)',
        # Title-based block removal for a sticky variant
        r'\n\s*<div[^>]*>\s*\n\s*<div[^>]*position: "sticky".*?>.*?<div style=\{\{ fontWeight: 900, fontSize: 16 \}\}>\s*Current Loaded Unit\s*</div>.*?</div>\s*</div>\s*(?=\n\s*<div style=\{\{ gridColumn: "1 / -1", marginTop: 12 \}\}>)',
    ]

    removed_any = False
    for pattern in patterns:
        source, count = re.subn(pattern, "\n", source, count=1, flags=re.DOTALL)
        if count:
            print(f"Removed old loaded unit banner using pattern: {pattern[:60]}...")
            removed_any = True
            break

    if not removed_any:
        # Safer fallback: hide the old title if we can at least find it
        source, count = re.subn(
            r'Current Loaded Unit',
            'Current Loaded Unit (hidden)',
            source,
            count=1,
        )
        if count:
            print("Could not safely remove the full old banner block, but hid the title text.")
            removed_any = True

    if source == original:
        print("No old loaded unit banner block was changed.")
        return

    backup = PAGE.with_name(PAGE.name + ".replace-old-loaded-unit-banner-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
