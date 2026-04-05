from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Could not find expected block for: {label}")
    print(f"Patched: {label}")
    return text.replace(old, new, 1)


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "repair-execution-assist-visibility-cleanup-v1" in source:
        print("Repair Execution Assist visibility cleanup already applied.")
        return

    source = "/* repair-execution-assist-visibility-cleanup-v1 */\n" + source

    old_block = """          {(() => {
            const payload = buildRepairExecutionAssist();

            if (!payload.selectedPart) {
              return (
                <div style={{ marginTop: 12 }}>
                  <SmallHint>Select a part in Part Verification Checklist first.</SmallHint>
                </div>
              );
            }

            return (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
"""
    new_block = """          {(() => {
            const payload = buildRepairExecutionAssist();

            if (!payload.selectedPart) {
              return (
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 10,
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Current Part Focus
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        None selected yet
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 10,
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        What Unlocks This
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        Select a part in Part Verification Checklist
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 12,
                      padding: 12,
                      background: "#fffaf0",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>
                      Repair help is ready once a part is selected.
                    </div>

                    <SmallHint>This section will show:</SmallHint>

                    <ul style={{ marginTop: 0, paddingLeft: 18 }}>
                      <li><SmallHint>Verify First</SmallHint></li>
                      <li><SmallHint>Replace Steps</SmallHint></li>
                      <li><SmallHint>Safety / Shutdown</SmallHint></li>
                      <li><SmallHint>Common Mistakes</SmallHint></li>
                      <li><SmallHint>Watch After Repair</SmallHint></li>
                      <li><SmallHint>YouTube / Web repair search links</SmallHint></li>
                    </ul>

                    <SmallHint>
                      Pick a likely part in <b>Part Verification Checklist</b> and this section will automatically fill in.
                    </SmallHint>
                  </div>
                </div>
              );
            }

            return (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
"""
    source = replace_once(source, old_block, new_block, "Repair Execution Assist empty state")

    backup = PAGE.with_name(PAGE.name + ".repair-execution-assist-visibility-cleanup-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
