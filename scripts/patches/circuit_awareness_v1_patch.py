from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def insert_after_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    insert_at = idx + len(anchor)
    return source[:insert_at] + block + source[insert_at:]


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def replace_up_to_n(source: str, old: str, new: str, max_count: int) -> str:
    out = source
    count = 0
    while old in out and count < max_count:
        out = out.replace(old, new, 1)
        count += 1
    return out


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "circuit-awareness-v1" in source:
        print("Circuit Awareness v1 already applied.")
        return

    helper_block = """      // circuit-awareness-v1
      const [circuitCount, setCircuitCount] = useState("1");
      const [selectedCircuit, setSelectedCircuit] = useState("Circuit 1");
      const [customCircuitLabel, setCustomCircuitLabel] = useState("");

      function buildCircuitOptions(countValue: string) {
        const n = Number.parseInt(String(countValue || "1"), 10);
        const safeCount = Number.isFinite(n) && n > 0 ? Math.min(n, 8) : 1;
        const options: string[] = [];
        for (let i = 1; i <= safeCount; i += 1) {
          options.push(`Circuit ${i}`);
        }
        options.push("Custom");
        return options;
      }

      function getSelectedCircuitDisplay() {
        if (selectedCircuit === "Custom") {
          return String(customCircuitLabel || "").trim();
        }
        return String(selectedCircuit || "").trim();
      }

      function stripCircuitLineFromNotes(text: string) {
        return String(text || "")
          .split("\\n")
          .filter((line) => !line.trim().toLowerCase().startsWith("circuit:"))
          .join("\\n")
          .trim();
      }

      function buildTechNotesWithCircuit(baseText: string) {
        const clean = stripCircuitLineFromNotes(baseText);
        const circuitLabel = getSelectedCircuitDisplay();
        return [circuitLabel ? `Circuit: ${circuitLabel}` : "", clean].filter(Boolean).join("\\n");
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "circuit helpers",
    )

    error_code_anchor = """          {/* restore-error-code-top-section-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                Step 1A — Error Codes
              </div>

              <SmallHint>
                Enter the active error code early if the board, controller, thermostat, or display is showing one.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Error Code</label>
                  <input
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    placeholder="Example: E1, HPS, 3 Flash, LP Lockout"
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Error Code Source</label>
                  <select
                    value={errorCodeSource}
                    onChange={(e) => setErrorCodeSource(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="Control Board">Control Board</option>
                    <option value="Thermostat / Controller">Thermostat / Controller</option>
                    <option value="Display / HMI">Display / HMI</option>
                    <option value="VFD / Drive">VFD / Drive</option>
                    <option value="Sensor / Safety Circuit">Sensor / Safety Circuit</option>
                    <option value="Unknown">Unknown</option>
                  </select>
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
                {errorCode.trim() ? (
                  <SmallHint>
                    <b>Current Error Code:</b> {errorCode.trim()} • <b>Source:</b> {errorCodeSource || "Unknown"}
                  </SmallHint>
                ) : (
                  <SmallHint>No error code entered yet.</SmallHint>
                )}
              </div>
            </div>
          </div>

"""
    circuit_block = """          {/* circuit-awareness-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                Step 1B — Circuit Awareness
              </div>

              <SmallHint>
                Use this when the unit has more than one refrigeration circuit so the complaint, readings, and repair stay tied to the right circuit.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Circuit Count</label>
                  <select
                    value={circuitCount}
                    onChange={(e) => {
                      const next = e.target.value;
                      setCircuitCount(next);
                      const options = buildCircuitOptions(next);
                      if (!options.includes(selectedCircuit)) {
                        setSelectedCircuit(options[0] || "Circuit 1");
                      }
                    }}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="1">1 Circuit</option>
                    <option value="2">2 Circuits</option>
                    <option value="3">3 Circuits</option>
                    <option value="4">4 Circuits</option>
                    <option value="5">5 Circuits</option>
                    <option value="6">6 Circuits</option>
                    <option value="7">7 Circuits</option>
                    <option value="8">8 Circuits</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Selected Circuit</label>
                  <select
                    value={selectedCircuit}
                    onChange={(e) => setSelectedCircuit(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    {buildCircuitOptions(circuitCount).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCircuit === "Custom" ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontWeight: 900 }}>Custom Circuit Label</label>
                    <input
                      value={customCircuitLabel}
                      onChange={(e) => setCustomCircuitLabel(e.target.value)}
                      placeholder="Example: Circuit A, Lead Circuit, Compressor Circuit 3"
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 10,
                  background: "#fafafa",
                }}
              >
                <SmallHint>
                  <b>Current Circuit Context:</b> {getSelectedCircuitDisplay() || "Not set"}
                </SmallHint>
              </div>
            </div>
          </div>

"""
    source = insert_after_once(source, error_code_anchor, circuit_block, "circuit UI")

    old_summary = """                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Symptom:</b> {symptom || "-"}
                  </SmallHint>
                </div>

                <div
"""
    new_summary = """                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
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
"""
    source = replace_once(source, old_summary, new_summary, "sticky summary circuit")

    old_notes = '      tech_closeout_notes: techCloseoutNotes || "",'
    new_notes = '      tech_closeout_notes: buildTechNotesWithCircuit(techCloseoutNotes || ""),'
    source = replace_up_to_n(source, old_notes, new_notes, 3)

    backup = PAGE.with_name(PAGE.name + ".circuit-awareness-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
