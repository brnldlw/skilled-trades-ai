from __future__ import annotations

import re
import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def find_first_anchor(text: str, anchors: list[str]) -> tuple[str, int] | tuple[None, None]:
    for anchor in anchors:
        idx = text.find(anchor)
        if idx != -1:
            return anchor, idx
    return None, None


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "move-nameplate-reader-to-top-v2" in source:
        print("Nameplate reader move patch already applied.")
        return

    # Find a safe insertion point FIRST
    anchors = [
        "{/* top-complaint-evidence-block-v1 */}",
        "{/* top-evidence-quick-entry-v1 */}",
        "{/* restore-error-code-top-section-v1 */}",
        "{/* sticky-mini-summary-banner-v1 */}",
    ]
    anchor, insert_idx = find_first_anchor(source, anchors)
    if anchor is None:
        raise RuntimeError("Could not find a safe top insertion anchor.")

    # Find the current lower Nameplate Photo Reader card
    pattern = re.compile(
        r'<SectionCard\s+title="Nameplate Photo Reader"[\s\S]*?</SectionCard>',
        re.MULTILINE,
    )
    match = pattern.search(source)
    if not match:
        raise RuntimeError("Could not find Nameplate Photo Reader block.")

    card = match.group(0)

    # Remove the lower/original card
    source = source[:match.start()] + source[match.end():]

    moved_block = (
        "\n/* move-nameplate-reader-to-top-v2 */\n"
        '      <div style={{ marginTop: 16 }}>\n'
        f"{card}\n"
        "      </div>\n\n"
    )

    # Recompute insert index after removal if needed
    anchor, insert_idx = find_first_anchor(source, anchors)
    if anchor is None:
        raise RuntimeError("Could not find insertion anchor after removing original card.")

    source = source[:insert_idx] + moved_block + source[insert_idx:]

    backup = PAGE.with_name(PAGE.name + ".move-nameplate-reader-to-top-v2.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text("/* move-nameplate-reader-to-top-v2 */\n" + source, encoding="utf-8")

    print(f"Moved Nameplate Photo Reader before {anchor}")
    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
