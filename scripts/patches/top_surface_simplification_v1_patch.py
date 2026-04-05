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

    if "top-surface-simplification-v1" in source:
        print("Top surface simplification already applied.")
        return

    source = "/* top-surface-simplification-v1 */\n" + source

    # 1) Rename Current Call Summary -> Current Call
    source = replace_once(
        source,
        """              <div style={{ fontWeight: 900, fontSize: 15 }}>
                Current Call Summary
              </div>
""",
        """              <div style={{ fontWeight: 900, fontSize: 15 }}>
                Current Call
              </div>
""",
        "rename Current Call Summary",
    )

    # 2) Add Circuit pill after Symptom pill
    source = replace_once(
        source,
        """                  <SmallHint>
                    <b>Symptom:</b> {symptom || "-"}
                  </SmallHint>
                </div>

                <div
""",
        """                  <SmallHint>
                    <b>Symptom:</b> {symptom || "-"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Circuit:</b> {getSelectedCircuitDisplay() || "-"}
                  </SmallHint>
                </div>

                <div
""",
        "add Circuit pill",
    )

    # 3) Replace Dashboard pill with Error Code(s) pill
    source = replace_once(
        source,
        """                  <SmallHint>
                    <b>Dashboard:</b> {showFailureDashboard ? "Open" : "Hidden"}
                  </SmallHint>
""",
        """                  <SmallHint>
                    <b>Error Code(s):</b> {errorCode?.trim() ? errorCode.trim() : "-"}
                  </SmallHint>
""",
        "replace Dashboard pill with Error Code(s)",
    )

    # 4) Rename Field Action Bar -> Quick Actions
    source = replace_once(
        source,
        """                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  Field Action Bar
                </div>
""",
        """                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  Quick Actions
                </div>
""",
        "rename Field Action Bar",
    )

    backup = PAGE.with_name(PAGE.name + ".top-surface-simplification-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
