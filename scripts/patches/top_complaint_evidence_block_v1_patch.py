from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_first(text: str, anchors: list[str], block: str, label: str) -> str:
    for anchor in anchors:
        idx = text.find(anchor)
        if idx != -1:
            print(f"Inserted: {label}")
            return text[:idx] + block + text[idx:]
    print(f"Skipped: {label}")
    return text


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "top-complaint-evidence-block-v1" in source:
        print("Top Complaint + Evidence block already applied.")
        return

    source = "/* top-complaint-evidence-block-v1 */\n" + source

    block = """
          {/* top-complaint-evidence-block-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #dfe7f3",
                borderRadius: 12,
                padding: 12,
                background: "#f8fbff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>Step 2 — Complaint + Evidence</div>
              <SmallHint>
                Enter the service date and complaint here first. Use the lower troubleshooting sections for deeper guidance.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Service Date</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Affected Component</label>
                  <div
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      background: "#fff",
                      minHeight: 38,
                    }}
                  >
                    {getCurrentAffectedComponentLabelForAssist() || "Set in lower component/troubleshooting section"}
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>Symptom / Complaint</label>
                  <textarea
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    rows={4}
                    placeholder="Example: not cooling, high head pressure, circuit 2 freezing, repeated defrost issue"
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>
              </div>
            </div>
          </div>

"""

    source = insert_before_first(
        source,
        [
            "{/* restore-error-code-top-section-v1 */}",
            "{/* circuit-awareness-v1 */}",
            "{/* sticky-mini-summary-banner-v1 */}",
        ],
        block,
        "Top Complaint + Evidence block",
    )

    backup = PAGE.with_name(PAGE.name + ".top-complaint-evidence-block-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
