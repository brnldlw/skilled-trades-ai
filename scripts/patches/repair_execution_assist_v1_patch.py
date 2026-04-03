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

    if "repair-execution-assist-v1" in source:
        print("Repair Execution Assist v1 already applied.")
        return

    helper_block = """      // repair-execution-assist-v1
      function buildRepairExecutionAssist() {
        const checklist = buildPartVerificationChecklistItems();
        const selectedPart = String(checklist.selectedPart || selectedVerificationPart || "").trim();
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLower = targetComponent.toLowerCase();
        const equipment = String(equipmentType || "").trim();
        const equipmentLower = equipment.toLowerCase();
        const currentSymptom = String(symptom || "").trim();
        const makeModel = [manufacturer, model].filter(Boolean).join(" ").trim();
        const photoSubjectLabel = String(photoAssistSubject || "").trim().replaceAll("_", " ");
        const outcome = String(selectedVerificationOutcome || "").trim();

        const verifyFirst: string[] = [];
        const replaceSteps: string[] = [];
        const safety: string[] = [];
        const mistakes: string[] = [];
        const watchAfterRepair: string[] = [];

        const addUnique = (items: string[], value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!items.some((item) => item.trim().toLowerCase() === clean.toLowerCase())) {
            items.push(clean);
          }
        };

        if (!selectedPart) {
          return {
            selectedPart: "",
            title: "",
            verifyFirst,
            replaceSteps,
            safety,
            mistakes,
            watchAfterRepair,
            youtubeSearchUrl: "",
            webSearchUrl: "",
            searchQuery: "",
          };
        }

        const partLower = selectedPart.toLowerCase();

        addUnique(safety, "De-energize and verify power is actually off before opening or moving wires/components.");
        addUnique(safety, "Take a clear photo of wiring and component orientation before removal.");
        addUnique(safety, "Verify you are on the correct component side of the system before replacing parts.");

        if (partLower.includes("contactor")) {
          addUnique(verifyFirst, "Verify line voltage into the contactor.");
          addUnique(verifyFirst, "Verify coil voltage when there is an active call.");
          addUnique(verifyFirst, "Check contact drop and confirm the contactor is actually failing under load.");
          addUnique(replaceSteps, "Label/photograph wires before removal.");
          addUnique(replaceSteps, "Match coil voltage, pole configuration, and amp rating.");
          addUnique(replaceSteps, "Move one wire at a time and tighten all lugs properly.");
          addUnique(replaceSteps, "Recheck operation with the call active.");
          addUnique(mistakes, "Replacing the contactor without checking whether motor/compressor load caused the failure.");
          addUnique(mistakes, "Using the wrong coil voltage or mislanding line/load wires.");
          addUnique(watchAfterRepair, "Watch compressor and fan startup, line/load voltage, and wire heat after repair.");
        }

        if (partLower.includes("capacitor")) {
          addUnique(verifyFirst, "Test actual capacitance first.");
          addUnique(verifyFirst, "Compare connected motor/compressor amp draw to expected operation.");
          addUnique(replaceSteps, "Discharge capacitor safely before handling.");
          addUnique(replaceSteps, "Match capacitance and voltage rating exactly.");
          addUnique(replaceSteps, "Reconnect terminals carefully using your before photo.");
          addUnique(mistakes, "Swapping a capacitor before checking if the motor/compressor is causing repeat failure.");
          addUnique(mistakes, "Installing the wrong µF rating.");
          addUnique(watchAfterRepair, "Watch startup behavior, amp draw, and whether the symptom returns quickly.");
        }

        if (partLower.includes("condenser fan motor")) {
          addUnique(verifyFirst, "Verify voltage to the motor and correct fan rotation.");
          addUnique(verifyFirst, "Check capacitor, blade condition, and amp draw before replacement.");
          addUnique(replaceSteps, "Match RPM, horsepower, voltage, rotation, shaft, and mounting.");
          addUnique(replaceSteps, "Transfer blade carefully and set the blade height correctly.");
          addUnique(replaceSteps, "Verify capacitor sizing and wiring after installation.");
          addUnique(mistakes, "Calling the motor before checking coil condition, capacitor, and voltage.");
          addUnique(watchAfterRepair, "Watch head pressure, airflow, amp draw, and coil heat rejection after repair.");
        }

        if (partLower.includes("evaporator fan motor")) {
          addUnique(verifyFirst, "Verify fan command, voltage, and airflow path.");
          addUnique(verifyFirst, "Check for ice, drain issues, and defrost problems before replacement.");
          addUnique(replaceSteps, "Match voltage, rotation, speed/module type, and mounting.");
          addUnique(replaceSteps, "Verify blade/wheel position and airflow direction after replacement.");
          addUnique(mistakes, "Replacing the motor when the real issue is defrost, drain, or blocked airflow.");
          addUnique(watchAfterRepair, "Watch airflow, frost return, drain performance, and temperature pull-down.");
        }

        if (partLower.includes("defrost heater")) {
          addUnique(verifyFirst, "Check heater continuity and verify the control is actually calling for heat.");
          addUnique(verifyFirst, "Check termination/control path and drain condition.");
          addUnique(replaceSteps, "Confirm the replacement heater matches length, wattage, voltage, and mounting style.");
          addUnique(replaceSteps, "Route and secure wiring away from sharp edges and heat damage points.");
          addUnique(mistakes, "Replacing the heater without proving the defrost control/termination path.");
          addUnique(watchAfterRepair, "Watch the next full defrost cycle and confirm the ice pattern does not return.");
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          addUnique(verifyFirst, "Verify actual defrost timing, termination state, and heater output.");
          addUnique(replaceSteps, "Match the replacement control/termination part to the exact application.");
          addUnique(replaceSteps, "Verify fan delay / termination logic after installation.");
          addUnique(mistakes, "Changing control logic without verifying the actual sequence problem.");
          addUnique(watchAfterRepair, "Watch the next defrost cycle, fan delay, and box recovery.");
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          addUnique(verifyFirst, "Verify airflow first.");
          addUnique(verifyFirst, "Compare frost pattern, superheat, subcool, and restriction path before replacement.");
          addUnique(replaceSteps, "Use proper pump-down/recovery procedure as applicable.");
          addUnique(replaceSteps, "Protect the valve from overheating during brazing and follow OEM installation practice.");
          addUnique(replaceSteps, "Recheck airflow and SH/SC after the system stabilizes.");
          addUnique(mistakes, "Replacing the metering device when airflow or restriction was the real issue.");
          addUnique(watchAfterRepair, "Watch SH/SC trend, frost pattern, and system pull-down after repair.");
        }

        if (partLower.includes("blower motor")) {
          addUnique(verifyFirst, "Verify board/relay/module output and drain safety first.");
          addUnique(verifyFirst, "Check wheel, airflow restriction, and amp draw.");
          addUnique(replaceSteps, "Match speed/module type, voltage, rotation, and mounting.");
          addUnique(replaceSteps, "Verify blower wheel condition and correct wheel depth after install.");
          addUnique(mistakes, "Replacing the blower when the real issue is control output or drain interruption.");
          addUnique(watchAfterRepair, "Watch airflow, split, amp draw, and drain safety behavior.");
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          addUnique(verifyFirst, "Verify actual drain condition before replacing the switch.");
          addUnique(replaceSteps, "Install the switch so it trips at the correct water level and does not interfere with service access.");
          addUnique(mistakes, "Replacing the switch without fixing the actual drain problem.");
          addUnique(watchAfterRepair, "Watch drain flow and confirm the circuit no longer trips unexpectedly.");
        }

        if (partLower.includes("ignitor")) {
          addUnique(verifyFirst, "Verify the full heat call and board output first.");
          addUnique(replaceSteps, "Handle the ignitor carefully and avoid contaminating the element.");
          addUnique(mistakes, "Changing the ignitor without checking pressure-switch / board / flame-proving issues.");
          addUnique(watchAfterRepair, "Watch multiple ignition cycles and flame establishment.");
        }

        if (partLower.includes("flame sensor")) {
          addUnique(verifyFirst, "Verify flame signal and burner carryover before replacement.");
          addUnique(replaceSteps, "Use the correct sensor and confirm good grounding / flame contact path.");
          addUnique(mistakes, "Replacing the sensor when the real issue is ignition quality or grounding.");
          addUnique(watchAfterRepair, "Watch multiple heat cycles for stable flame proving.");
        }

        if (partLower.includes("pressure switch")) {
          addUnique(verifyFirst, "Verify inducer operation, tubing, venting, and condensate path first.");
          addUnique(replaceSteps, "Match the replacement switch to the correct pressure rating/application.");
          addUnique(mistakes, "Replacing the switch when the draft or drainage problem still exists.");
          addUnique(watchAfterRepair, "Watch the full heat cycle and verify pressure proving stays stable.");
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          addUnique(verifyFirst, "Separate sequence/control issues from actual component failure.");
          addUnique(replaceSteps, "Match the replacement part to the exact water-side function and sequence location.");
          addUnique(mistakes, "Replacing water-side parts before confirming the correct sequence fault.");
          addUnique(watchAfterRepair, "Watch the next full sequence and verify correct timing/response.");
        }

        if (!verifyFirst.length) {
          addUnique(verifyFirst, "Verify the selected part matches the complaint, component, and strongest test results first.");
          addUnique(replaceSteps, "Document wiring/orientation before removal and verify the exact replacement match.");
          addUnique(mistakes, "Do not replace the part blindly without proving the failure path.");
          addUnique(watchAfterRepair, "Watch the equipment through a full operating cycle after the repair.");
        }

        if (componentLower.includes("condensing") || componentLower.includes("outdoor")) {
          addUnique(safety, "Use extra caution around line voltage, condenser fan blade hazards, and compressor terminals.");
        }

        if (componentLower.includes("evaporator") || componentLower.includes("indoor")) {
          addUnique(safety, "Watch for ice, wet surfaces, and drain/water issues while servicing the indoor/evap side.");
        }

        if (equipmentLower.includes("walk-in")) {
          addUnique(safety, "Confirm box/product conditions and avoid creating a long outage during the replacement.");
        }

        if (currentSymptom) {
          addUnique(watchAfterRepair, `Confirm the original complaint "${currentSymptom}" is actually resolved before leaving.`);
        }

        const queryParts = [
          manufacturer,
          model,
          equipment,
          targetComponent,
          selectedPart,
          photoSubjectLabel,
          "repair"
        ].filter(Boolean);

        const searchQuery = queryParts.join(" ");
        const youtubeSearchUrl = selectedPart
          ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
          : "";
        const webSearchUrl = selectedPart
          ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
          : "";

        return {
          selectedPart,
          title: `${selectedPart} Repair Execution Assist`,
          verifyFirst: verifyFirst.slice(0, 5),
          replaceSteps: replaceSteps.slice(0, 5),
          safety: safety.slice(0, 4),
          mistakes: mistakes.slice(0, 4),
          watchAfterRepair: watchAfterRepair.slice(0, 5),
          youtubeSearchUrl,
          webSearchUrl,
          searchQuery,
        };
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "repair execution assist helpers",
    )

    ui_block = """      {/* repair-execution-assist-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Repair Execution Assist">
          <SmallHint>
            For the selected part, shows what to verify first, how to approach replacement, safety/watch-outs, common mistakes, and quick video/search links.
          </SmallHint>

          {(() => {
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Selected Part
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {payload.selectedPart}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Search Context
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {payload.searchQuery}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {payload.youtubeSearchUrl ? (
                    <a
                      href={payload.youtubeSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        textDecoration: "none",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      Open YouTube Repair Search
                    </a>
                  ) : null}

                  {payload.webSearchUrl ? (
                    <a
                      href={payload.webSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        textDecoration: "none",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      Open Web Search
                    </a>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Verify First</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.verifyFirst.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Replace Steps</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.replaceSteps.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Safety / Shutdown</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.safety.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Common Mistakes</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.mistakes.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Watch After Repair</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.watchAfterRepair.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

"""
    source = insert_before_once(
        source,
        '{/* part-verification-checklist-v1 */}',
        ui_block,
        "repair execution assist UI",
    )

    backup = PAGE.with_name(PAGE.name + ".repair-execution-assist-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
