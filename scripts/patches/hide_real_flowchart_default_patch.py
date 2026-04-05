from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Could not find expected block for: {label}")
    print(f"Patched: {label}")
    return text.replace(old, new, 1)


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

    if "hide-real-flowchart-default-v1" in source:
        print("Hide Real Flowchart default patch already applied.")
        return

    source = "/* hide-real-flowchart-default-v1 */\n" + source

    state_anchor = 'const [showBulkImportTools, setShowBulkImportTools] = useState(false);'
    state_block = 'const [showRealFlowchartEngine, setShowRealFlowchartEngine] = useState(false);\n\n'
    source = insert_before_once(source, state_anchor, state_block, "showRealFlowchartEngine state")

    old_open = """        <SectionCard title="Real Flowchart Engine">
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
"""
    new_open = """        <SectionCard
          title="Real Flowchart Engine"
          right={
            <PillButton
              text={showRealFlowchartEngine ? "Hide" : "Show"}
              onClick={() => setShowRealFlowchartEngine((prev) => !prev)}
            />
          }
        >
          {!showRealFlowchartEngine ? (
            <div
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                background: "#fafafa",
              }}
            >
              <SmallHint>
                Hidden by default. Open this when you want deeper flowchart-style troubleshooting.
              </SmallHint>
            </div>
          ) : (
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
"""
    source = replace_once(source, old_open, new_open, "Real Flowchart Engine open block")

    old_close = """          </div>
        </SectionCard>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
"""
    new_close = """            </div>
          )}
        </SectionCard>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
"""
    source = replace_once(source, old_close, new_close, "Real Flowchart Engine close block")

    backup = PAGE.with_name(PAGE.name + ".hide-real-flowchart-default-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
