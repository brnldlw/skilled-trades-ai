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

    if "top-surface-simplification-safe-v1" in source:
        print("Top surface simplification safe patch already applied.")
        return

    source = "/* top-surface-simplification-safe-v1 */\n" + source

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
        "add Circuit pill after Symptom",
    )

    backup = PAGE.with_name(PAGE.name + ".top-surface-simplification-safe-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
