from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_after_once(text: str, anchor: str, block: str, label: str) -> str:
    idx = text.find(anchor)
    if idx == -1:
        print(f"Skipped: {label}")
        return text
    insert_at = idx + len(anchor)
    print(f"Inserted: {label}")
    return text[:insert_at] + block + text[insert_at:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "top-evidence-quick-entry-v1" in source:
        print("Top evidence quick entry already applied.")
        return

    source = "/* top-evidence-quick-entry-v1 */\n" + source

    anchor = """          {/* top-complaint-evidence-block-v1 */}
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
                  {(() => {
                    const options = getAffectedComponentOptions();
                    return (
                      <div style={{ display: "grid", gap: 8 }}>
                        <select
                          value={affectedComponentId}
                          onChange={(e) => {
                            const nextId = e.target.value;
                            const selected = options.find((option) => option.id === nextId);
                            setAffectedComponentId(nextId);
                            setAffectedComponentLabel(selected?.label || "");
                          }}
                          style={{ width: "100%", padding: 8 }}
                        >
                          <option value="">Select affected component</option>
                          {options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>

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
                          {getCurrentAffectedComponentLabelForAssist() || "Select the exact component for this call"}
                        </div>
                      </div>
                    );
                  })()}
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

    block = """
          {/* top-evidence-quick-entry-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 10 }}>
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
              <div style={{ fontWeight: 900, fontSize: 16 }}>Step 2A — Quick Evidence</div>
              <SmallHint>
                Set the photo subject early and quickly confirm whether photos and observations have been added for this call.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Photo Subject</label>
                  <select
                    value={photoAssistSubject}
                    onChange={(e) => setPhotoAssistSubject(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="iced_coil">Iced Coil</option>
                    <option value="contactor_capacitor">Contactor / Capacitor</option>
                    <option value="control_board">Control Board</option>
                    <option value="wiring">Wiring</option>
                    <option value="nameplate_tag">Nameplate / Tag</option>
                    <option value="drain_defrost">Drain / Defrost</option>
                    <option value="dirty_coil_airflow">Dirty Coil / Airflow</option>
                    <option value="compressor_section">Compressor Section</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Photos Attached</label>
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
                    {Array.isArray(serviceEventPhotoUrls) ? serviceEventPhotoUrls.length : 0}
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Observations Entered</label>
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
                    {Array.isArray(observations) ? observations.length : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

"""

    source = insert_after_once(source, anchor, block, "Top evidence quick entry block")

    backup = PAGE.with_name(PAGE.name + ".top-evidence-quick-entry-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
