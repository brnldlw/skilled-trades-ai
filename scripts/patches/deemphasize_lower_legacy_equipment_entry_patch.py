from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(text: str, anchor: str, block: str, label: str) -> str:
    idx = text.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    print(f"Inserted: {label}")
    return text[:idx] + block + text[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "deemphasize-lower-legacy-equipment-entry-v2" in source:
        print("Lower legacy equipment entry note already applied.")
        return

    source = "/* deemphasize-lower-legacy-equipment-entry-v2 */\n" + source

    anchor = """                              {/* sticky-mini-summary-banner-v1 */}"""

    block = """
          <div style={{ gridColumn: "1 / -1", marginTop: 10 }}>
            <div
              style={{
                border: "1px dashed #d6d6d6",
                borderRadius: 10,
                padding: 10,
                background: "#f7f7f7",
              }}
            >
              <SmallHint>
                <b>Legacy lower equipment entry area:</b> Use <b>Step 1 — Identify Equipment</b> and <b>Step 1B — Equipment Details</b> at the top of the page as the main place to enter equipment information. These older lower fields remain for continuity while the page is being cleaned up.
              </SmallHint>
            </div>
          </div>

"""

    updated = insert_before_once(source, anchor, block, "legacy equipment entry note")

    backup = PAGE.with_name(PAGE.name + ".deemphasize-lower-legacy-equipment-entry-v2.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(updated, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
