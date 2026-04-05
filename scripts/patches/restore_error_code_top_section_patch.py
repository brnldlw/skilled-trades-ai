from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_after_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    insert_at = idx + len(anchor)
    return source[:insert_at] + block + source[insert_at:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "restore-error-code-top-section-v1" in source:
        print("Error code top section patch already applied.")
        return

    anchor = """          <div>
            <label style={{ fontWeight: 900 }}>Refrigerant Type</label>
            <br />
            <select
              value={refrigerantType}
              onChange={(e) => setRefrigerantType(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              {refrigerantOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
"""

    block = """
          {/* restore-error-code-top-section-v1 */}
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

    updated = insert_after_once(source, anchor, block, "error code top section")

    backup = PAGE.with_name(PAGE.name + ".restore-error-code-top-section-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(updated, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
