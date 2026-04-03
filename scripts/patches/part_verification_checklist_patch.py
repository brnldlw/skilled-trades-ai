from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "part-verification-checklist-v1" in source:
        print("Part Verification Checklist patch already applied.")
        return

    helper_block = """      // part-verification-checklist-v1
      const [selectedVerificationPart, setSelectedVerificationPart] = useState("");

      function buildPartVerificationChecklistItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const issue = String(symptom || "").trim();
        const suggestions = buildSuggestedPartsToVerifyItems();
        const suggestedPartNames = suggestions.map((item) => item.part);
        const selectedPart =
          String(selectedVerificationPart || "").trim() ||
          (suggestedPartNames.length ? suggestedPartNames[0] : "");

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const checklist: string[] = [];
        const notes: string[] = [];

        const add = (value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!checklist.some((item) => item.toLowerCase() === clean.toLowerCase())) {
            checklist.push(clean);
          }
        };

        const addNote = (value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!notes.some((item) => item.toLowerCase() == clean.toLowerCase())) {
            notes.push(clean);
          }
        };

        const partLower = selectedPart.toLowerCase();

        if (partLower.includes("contactor")) {
          add("Verify line voltage into the contactor.");
          add("Verify coil voltage when the call is present.");
          add("Check line-to-load contact drop under load.");
          add("Inspect for pitted contacts, overheated wires, and loose lugs.");
          addNote("Do not replace the contactor without checking whether compressor/fan load caused the failure.");
        }

        if (partLower.includes("capacitor")) {
          add("Test actual capacitance and compare against the rated µF.");
          add("Verify supply voltage to the motor/compressor circuit.");
          add("Check amp draw on the connected motor/compressor.");
          add("Inspect for swelling, oil leakage, or overheated terminals.");
          addNote("A failed capacitor can be the symptom of a weak motor or compressor.");
        }

        if (partLower.includes("condenser fan motor")) {
          add("Verify proper voltage to the fan motor.");
          add("Check fan rotation and blade condition.");
          add("Compare motor amp draw to expected operation.");
          add("Inspect the coil for dirt and confirm heat rejection is not the root issue.");
          if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
            addNote("High head relative to ambient supports heat-rejection verification before condemning the motor.");
          }
        }

        if (partLower.includes("evaporator fan motor")) {
          add("Verify fan operation and correct rotation.");
          add("Check voltage at the motor and any speed/module output.");
          add("Inspect blade/wheel condition and airflow path.");
          add("Check for ice, drain problems, and defrost issues affecting airflow.");
          if (deltaT is not None if False else False):
            pass
"""
    # overwrite with clean JS-only helper
    helper_block = """      // part-verification-checklist-v1
      const [selectedVerificationPart, setSelectedVerificationPart] = useState("");

      function buildPartVerificationChecklistItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const issue = String(symptom || "").trim();
        const suggestions = buildSuggestedPartsToVerifyItems();
        const suggestedPartNames = suggestions.map((item) => item.part);
        const selectedPart =
          String(selectedVerificationPart || "").trim() ||
          (suggestedPartNames.length ? suggestedPartNames[0] : "");

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const checklist: string[] = [];
        const notes: string[] = [];

        const add = (value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!checklist.some((item) => item.toLowerCase() === clean.toLowerCase())) {
            checklist.push(clean);
          }
        };

        const addNote = (value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!notes.some((item) => item.toLowerCase() === clean.toLowerCase())) {
            notes.push(clean);
          }
        };

        const partLower = selectedPart.toLowerCase();

        if (partLower.includes("contactor")) {
          add("Verify line voltage into the contactor.");
          add("Verify coil voltage when the call is present.");
          add("Check line-to-load contact drop under load.");
          add("Inspect for pitted contacts, overheated wires, and loose lugs.");
          addNote("Do not replace the contactor without checking whether compressor/fan load caused the failure.");
        }

        if (partLower.includes("capacitor")) {
          add("Test actual capacitance and compare against the rated µF.");
          add("Verify supply voltage to the motor/compressor circuit.");
          add("Check amp draw on the connected motor/compressor.");
          add("Inspect for swelling, oil leakage, or overheated terminals.");
          addNote("A failed capacitor can be the symptom of a weak motor or compressor.");
        }

        if (partLower.includes("condenser fan motor")) {
          add("Verify proper voltage to the fan motor.");
          add("Check fan rotation and blade condition.");
          add("Compare motor amp draw to expected operation.");
          add("Inspect the coil for dirt and confirm heat rejection is not the root issue.");
          if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
            addNote("High head relative to ambient supports heat-rejection verification before condemning the motor.");
          }
        }

        if (partLower.includes("evaporator fan motor")) {
          add("Verify fan operation and correct rotation.");
          add("Check voltage at the motor and any speed/module output.");
          add("Inspect blade/wheel condition and airflow path.");
          add("Check for ice, drain problems, and defrost issues affecting airflow.");
          if (deltaT !== null && deltaT < 14) {
            addNote("Weak split supports airflow/fan verification before deeper refrigerant-side part swaps.");
          }
        }

        if (partLower.includes("defrost heater")) {
          add("Ohm the heater for continuity with power isolated.");
          add("Verify control/board output to the heater during defrost.");
          add("Check termination and timer/schedule path.");
          add("Inspect drain and ice pattern to verify the heater failure matches the symptom.");
          addNote("A heater alone may not solve the issue if termination or schedule logic is wrong.");
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          add("Verify the defrost schedule and control output.");
          add("Check termination state and whether the heater circuit is actually being commanded.");
          add("Verify fan delay and drain heat path if applicable.");
          add("Compare the timing logic to the actual icing pattern and box condition.");
          addNote("Defrost control decisions should match the full sequence, not just the ice complaint.");
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          add("Verify airflow before condemning the metering device.");
          add("Compare frost pattern to superheat/subcool and overall load.");
          add("Check for restriction points such as a filter drier or liquid-line issue.");
          add("Confirm feed behavior matches the complaint before replacement.");
          if (superheat !== null && subcool !== null) {
            addNote(`Current SH/SC context: SH ${superheat}°F, SC ${subcool}°F.`);
          }
        }

        if (partLower.includes("blower motor")) {
          add("Verify board/relay/module output to the blower.");
          add("Check capacitor/module condition and motor amp draw.");
          add("Inspect wheel cleanliness and airflow restrictions.");
          add("Confirm drain safeties are not interrupting the indoor section.");
          if (deltaT !== null) {
            addNote(`Current air split is ${deltaT}°F, which should be considered before replacing the blower.`);
          }
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          add("Verify the drain condition and water level.");
          add("Confirm switch continuity/open state matches the actual drain condition.");
          add("Check whether the safety is interrupting the control circuit.");
          add("Rule out a real drain issue before replacing the safety.");
        }

        if (partLower.includes("ignitor")) {
          add("Verify call for heat and full ignition sequence.");
          add("Check ignitor resistance/current draw as appropriate.");
          add("Confirm board output to the ignitor.");
          add("Verify the pressure switch and safety chain before replacing.");
        }

        if (partLower.includes("flame sensor")) {
          add("Verify flame signal / proving before replacement.");
          add("Inspect flame quality and burner carryover.");
          add("Clean/test the sensor and confirm the board is receiving proof.");
          add("Verify the issue is not upstream in ignition or gas delivery.");
        }

        if (partLower.includes("pressure switch")) {
          add("Verify inducer operation and tubing condition.");
          add("Confirm pressure switch closure/opening against actual draft conditions.");
          add("Check venting and condensate traps if applicable.");
          add("Verify board input state before replacing the switch.");
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          add("Separate sequence issues from actual component failure.");
          add("Verify power/control to the component.");
          add("Check the component response during the expected cycle.");
          add("Confirm the symptom is water-side before replacing refrigeration-related parts.");
        }

        if (!checklist.length) {
          add("Verify the selected part actually matches the target component and complaint.");
          add("Check control call, power path, and the strongest repair-decision items first.");
          add("Use readings/history/photo context before making a blind replacement.");
        }

        if (issue) {
          addNote(`Current symptom context: ${issue}.`);
        }
        addNote(`Target component: ${targetComponent}.`);

        return {
          selectedPart,
          availableParts: suggestedPartNames,
          checklist: checklist.slice(0, 6),
          notes: notes.slice(0, 4),
        };
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "part verification helpers",
    )

    ui_block = """      {/* part-verification-checklist-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Part Verification Checklist">
          <SmallHint>
            Pick a likely part and the app gives the exact checks to perform before replacing it.
          </SmallHint>

          {(() => {
            const payload = buildPartVerificationChecklistItems();

            return (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontWeight: 900 }}>Selected Part To Verify</label>
                    <select
                      value={payload.selectedPart}
                      onChange={(e) => setSelectedVerificationPart(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    >
                      <option value="">Choose a part</option>
                      {payload.availableParts.map((part) => (
                        <option key={part} value={part}>
                          {part}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Part Focus
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {payload.selectedPart || "Choose a part"}
                    </div>
                  </div>
                </div>

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                  <div style={{ fontWeight: 900 }}>Verification Checklist</div>
                  <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                    {payload.checklist.map((item, idx) => (
                      <li key={idx}>
                        <SmallHint>{item}</SmallHint>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                  <div style={{ fontWeight: 900 }}>Context Notes</div>
                  <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                    {payload.notes.map((item, idx) => (
                      <li key={idx}>
                        <SmallHint>{item}</SmallHint>
                      </li>
                    ))}
                  </ul>
                </div>

                {payload.selectedPart ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() =>
                        setPartsReplaced((prev) => {
                          const current = String(prev || "").trim();
                          const existing = current
                            .split(/[;,]/)
                            .map((entry) => entry.trim().toLowerCase())
                            .filter(Boolean);

                          if (existing.includes(payload.selectedPart.trim().toLowerCase())) {
                            return current;
                          }

                          return [current, payload.selectedPart].filter(Boolean).join(", ");
                        })
                      }
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
                      Add Selected Part to Parts Replaced
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })()}
        </SectionCard>
      </div>

"""
    source = insert_before_once(
        source,
        '{/* suggested-parts-to-verify-v1 */}',
        ui_block,
        "part verification UI",
    )

    backup = PAGE.with_name(PAGE.name + ".part-verification-checklist-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
