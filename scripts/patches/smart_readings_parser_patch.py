from __future__ import annotations

import re
import shutil
from pathlib import Path
from textwrap import dedent

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


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "smart-readings-parser-v1" in source:
        print("Smart readings parser patch already applied.")
        return

    # ------------------------------------------------------------------
    # Detect existing state setters so we only fill fields that exist
    # ------------------------------------------------------------------
    state_pairs = dict(
        re.findall(
            r"const \[(\w+),\s*(set\w+)\]\s*=\s*useState",
            source,
        )
    )

    field_candidates = {
        "suctionPressure": [
            "suctionPressure",
            "lowSidePressure",
            "lowPressure",
            "suctionPsi",
            "suctionPSI",
        ],
        "headPressure": [
            "headPressure",
            "highSidePressure",
            "highPressure",
            "dischargePressure",
            "headPsi",
            "dischargePsi",
        ],
        "superheat": [
            "superheat",
        ],
        "subcool": [
            "subcool",
            "subcooling",
        ],
        "suctionTemp": [
            "suctionLineTemp",
            "suctionTemp",
            "vaporLineTemp",
        ],
        "liquidTemp": [
            "liquidLineTemp",
            "liquidTemp",
        ],
        "returnAir": [
            "returnAirTemp",
            "returnAir",
            "returnTemp",
        ],
        "supplyAir": [
            "supplyAirTemp",
            "supplyAir",
            "supplyTemp",
        ],
        "boxTemp": [
            "boxTemp",
            "boxTemperature",
            "spaceTemp",
            "caseTemp",
            "roomTemp",
        ],
        "ambientTemp": [
            "ambientTemp",
            "ambientTemperature",
            "outdoorAmbient",
            "outsideTemp",
            "oaTemp",
        ],
    }

    detected: dict[str, tuple[str, str]] = {}
    for logical_name, candidates in field_candidates.items():
        for candidate in candidates:
            setter = state_pairs.get(candidate)
            if setter:
                detected[logical_name] = (candidate, setter)
                break

    # ------------------------------------------------------------------
    # Add parser state/helpers before bulk import state
    # ------------------------------------------------------------------
    if "smart-readings-parser-helpers-v1" not in source:
        apply_lines = []
        detected_labels = {
            "suctionPressure": "Suction Pressure",
            "headPressure": "Head Pressure",
            "superheat": "Superheat",
            "subcool": "Subcool",
            "suctionTemp": "Suction Temp",
            "liquidTemp": "Liquid Temp",
            "returnAir": "Return Air",
            "supplyAir": "Supply Air",
            "boxTemp": "Box Temp",
            "ambientTemp": "Ambient Temp",
        }

        for logical_name, (_, setter) in detected.items():
            label = detected_labels[logical_name]
            apply_lines.append(
                f"""        if (parsed.{logical_name} !== null) {{
          {setter}(String(parsed.{logical_name}));
          applied.push("{label}: " + parsed.{logical_name});
        }}"""
            )

        helper_block = f"""      // smart-readings-parser-helpers-v1
      const [smartReadingsInput, setSmartReadingsInput] = useState("");
      const [smartReadingsMessage, setSmartReadingsMessage] = useState("");

      function parseSmartReadingsInput(input: string) {{
        const text = String(input || "").toLowerCase();

        const findValue = (patterns: RegExp[]) => {{
          for (const pattern of patterns) {{
            const match = text.match(pattern);
            if (match && match[1]) {{
              return match[1];
            }}
          }}
          return null;
        }};

        return {{
          suctionPressure: findValue([
            /(?:suction|low\\s*side|low)\\s*(?:pressure|psi)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
          headPressure: findValue([
            /(?:head|high\\s*side|high|discharge)\\s*(?:pressure|psi)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
          superheat: findValue([
            /(?:superheat|sh)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
          subcool: findValue([
            /(?:subcool|sub\\s*cool|sc)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
          suctionTemp: findValue([
            /(?:suction\\s*temp|suction\\s*line\\s*temp|vapor\\s*line\\s*temp|slt)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
          liquidTemp: findValue([
            /(?:liquid\\s*temp|liquid\\s*line\\s*temp|llt)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
          returnAir: findValue([
            /(?:return\\s*air|return)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
          supplyAir: findValue([
            /(?:supply\\s*air|supply)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
          boxTemp: findValue([
            /(?:box\\s*temp|box|space\\s*temp|case\\s*temp|room\\s*temp)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
          ambientTemp: findValue([
            /(?:ambient\\s*temp|ambient|outside\\s*temp|outdoor\\s*ambient|oa\\s*temp)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),
        }};
      }}

      function applySmartReadingsParser() {{
        const parsed = parseSmartReadingsInput(smartReadingsInput);
        const applied: string[] = [];
{chr(10).join(apply_lines) if apply_lines else '        // No matching reading fields were detected in this page yet.'}

        if (!applied.length) {{
          setSmartReadingsMessage(
            "Nothing matched existing reading fields yet. Try entries like: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58"
          );
          return;
        }}

        setSmartReadingsMessage("Applied: " + applied.join(" • "));
      }}

      function clearSmartReadingsParser() {{
        setSmartReadingsInput("");
        setSmartReadingsMessage("");
      }}

"""
        source = insert_before_once(
            source,
            'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
            helper_block,
            "smart readings parser helpers",
        )

    # ------------------------------------------------------------------
    # Insert UI before Symptom field in the main form
    # ------------------------------------------------------------------
    ui_anchor = """          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontWeight: 900 }}>Symptom</label>
"""

    ui_block = """          {/* smart-readings-parser-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: "#fafafa",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                Smart Readings Parser
              </div>

              <SmallHint>
                Paste or type readings in one line and the app will auto-fill the matching fields it recognizes.
                Example: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58
              </SmallHint>

              <textarea
                value={smartReadingsInput}
                onChange={(e) => setSmartReadingsInput(e.target.value)}
                placeholder="Example: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58 box 10"
                rows={3}
                style={{ width: "100%", padding: 8 }}
              />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={applySmartReadingsParser}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Parse Readings
                </button>

                <button
                  type="button"
                  onClick={clearSmartReadingsParser}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Clear Parser
                </button>
              </div>

              {smartReadingsMessage ? (
                <SmallHint>
                  <b>Parser Result:</b> {smartReadingsMessage}
                </SmallHint>
              ) : null}
            </div>
          </div>

"""
    source = insert_before_once(
        source,
        ui_anchor,
        ui_block,
        "smart readings parser UI",
    )

    backup = PAGE.with_name(PAGE.name + ".smart-readings-parser.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")
    print("Detected reading fields:", ", ".join(sorted(detected.keys())) if detected else "none")
    

if __name__ == "__main__":
    main()