from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


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

    if "top-measurements-observations-block-v1" in source:
        print("Top Measurements / Observations block already applied.")
        return

    source = "/* top-measurements-observations-block-v1 */\n" + source

    block = """
      {/* top-measurements-observations-block-v1 */}
      <div style={{ marginTop: 16 }}>
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
          <div style={{ fontWeight: 900, fontSize: 16 }}>Step 2B — Quick Measurements / Observations</div>
          <SmallHint>
            Add the first key reading(s) here before going deeper into diagnosis.
          </SmallHint>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: 10,
            }}
          >
            <div>
              <label style={{ fontWeight: 900 }}>Label</label>
              <input
                value={obsLabel}
                onChange={(e) => setObsLabel(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>Value</label>
              <input
                value={obsValue}
                onChange={(e) => setObsValue(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>Unit</label>
              <select
                value={obsUnit}
                onChange={(e) => setObsUnit(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={{ fontWeight: 900 }}>Note (optional)</label>
              <input
                value={obsNote}
                onChange={(e) => setObsNote(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
              />
              Auto-convert (kPa→psi, °C→°F, Pa→inWC)
            </label>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={addMeasurement}
                style={{
                  padding: "10px 14px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                Add Measurement
              </button>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid #cfcfcf",
                  background: "#fafafa",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                Observations Entered: {Array.isArray(observations) ? observations.length : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

"""

    source = insert_before_once(
        source,
        '{/* step-wrappers-page-reflow-v1-step-3 */}',
        block,
        "Top Measurements / Observations block",
    )

    backup = PAGE.with_name(PAGE.name + ".top-measurements-observations-block-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
