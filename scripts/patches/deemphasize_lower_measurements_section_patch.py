from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_if_present(text: str, old: str, new: str, label: str) -> str:
    if old in text:
        print(f"Patched: {label}")
        return text.replace(old, new, 1)
    print(f"Skipped: {label}")
    return text


def insert_before_once(text: str, anchor: str, block: str, label: str) -> str:
    idx = text.find(anchor)
    if idx == -1:
        print(f"Skipped: {label}")
        return text
    print(f"Inserted: {label}")
    return text[:idx] + block + text[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "deemphasize-lower-measurements-section-v1" in source:
        print("Lower Measurements / Observations de-emphasis already applied.")
        return

    source = "/* deemphasize-lower-measurements-section-v1 */\n" + source

    anchor = '<SectionCard title="Measurements / Observations">'
    note_block = """
<div style={{ marginTop: 12 }}>
  <div
    style={{
      border: "1px dashed #d6d6d6",
      borderRadius: 10,
      padding: 10,
      background: "#f7f7f7",
    }}
  >
    <SmallHint>
      <b>Legacy lower measurements area:</b> Use the top <b>Step 2 — Complaint + Evidence</b> and
      <b> Step 2B — Quick Measurements / Observations</b> first. This deeper section remains for
      full entry and review while the page flow is being cleaned up.
    </SmallHint>
  </div>
</div>

"""
    source = insert_before_once(source, anchor, note_block, "legacy measurements note")

    source = replace_if_present(
        source,
        '<SectionCard title="Measurements / Observations">',
        '<SectionCard title="Legacy Measurements / Observations">',
        "rename lower Measurements / Observations section",
    )

    backup = PAGE.with_name(PAGE.name + ".deemphasize-lower-measurements-section-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
