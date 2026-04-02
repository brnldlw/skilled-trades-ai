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

    if "repair-decision-panel-v1" in source:
        print("Repair Decision Panel patch already applied.")
        return

    helper_block = """      // repair-decision-panel-v1
      function buildRepairDecisionPanelItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLabelLower = targetComponent.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const recentParts = getRecentSameComponentPartsForAssist();
        const recentFix = getMostRecentSameComponentFixForAssist();

        const suctionPressure = getObservationValue(
          observations,
          (l) => l === "suction pressure" || (l.includes("suction") && l.includes("pressure")),
          "psi"
        );

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
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

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;
        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const decisions: Array<{
          part: string;
          why: string;
          verifyFirst: string;
          blindRisk: string;
        }> = [];

        function addDecision(part: string, why: string, verifyFirst: string, blindRisk: string) {
          decisions.push({ part, why, verifyFirst, blindRisk });
        }

        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          addDecision(
            "Contactor",
            "Outdoor / condensing section selected and many no-cool failures land on electrical switching first.",
            "Verify line/load voltage, coil voltage, contact drop, and whether the contactor is actually the failed point.",
            "Replacing a contactor without checking fan/compressor load can create a callback."
          );

          addDecision(
            "Run Capacitor",
            "Outdoor fan or compressor start/run complaints often track back to weak capacitor value.",
            "Test actual capacitance and compare against motor/compressor condition before replacing.",
            "A failed capacitor can be a symptom of a motor/compressor issue, not always the root cause."
          );

          addDecision(
            "Condenser Fan Motor",
            "Outdoor section and heat-rejection issues often drive high head and repeated no-cool calls.",
            "Verify fan rotation, amp draw, capacitor, voltage, and coil cleanliness before condemning the motor.",
            "Calling the fan motor too early can miss coil, control, or capacitor problems."
          );
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          addDecision(
            "Evaporator Fan Motor",
            "Evaporator-side airflow, icing, and weak box pull-down often start here.",
            "Verify fan operation, blade condition, voltage, amp draw, and airflow before replacing.",
            "Replacing the fan motor blindly can miss defrost, drain, or control problems."
          );

          addDecision(
            "Defrost Heater / Defrost Control",
            "Icing and repeat freeze-up patterns often point toward the defrost path on evaporator-side problems.",
            "Verify heater continuity, control output, termination, schedule, and drain condition before replacing.",
            "A repeated freeze-up will come back if the full defrost path is not checked."
          );

          addDecision(
            "TXV / EEV / Metering Device",
            "Evaporator-side feed issues are possible when frost pattern and readings suggest starvation or overfeed.",
            "Check airflow, frost pattern, superheat/subcool, restriction points, and feed behavior before condemning the metering device.",
            "Metering devices are overcalled when airflow or defrost is the real problem."
          );
        }

        if (componentLabelLower.includes("furnace")) {
          addDecision(
            "Ignitor / Flame Sensor",
            "Heat-sequence failures frequently land on ignition or flame proving before major boards/valves.",
            "Verify ignition sequence, flame sense signal, and safety chain first.",
            "Replacing boards or valves before checking ignition proof creates callbacks."
          );

          addDecision(
            "Pressure Switch / Inducer Path",
            "Heat complaints often fail in the draft/pressure proving side.",
            "Verify inducer operation, tubing, switch closure, venting, and board input before replacing.",
            "A pressure-switch swap without checking the full inducer path often does not solve the problem."
          );
        }

        if (componentLabelLower.includes("air handler") || componentLabelLower.includes("indoor unit")) {
          addDecision(
            "Blower Motor / Module",
            "Indoor airflow complaints commonly track to blower operation or control.",
            "Verify board/relay output, module power, motor amp draw, and wheel/airflow condition.",
            "Calling a blower motor too early can miss relay, board, or drain safety problems."
          );

          addDecision(
            "Float Switch / Drain Safety",
            "Indoor no-cool and intermittent shutdowns are often caused by drain safeties.",
            "Verify drain condition, switch operation, and control interruption before replacing bigger parts.",
            "Ignoring drain safety creates easy callbacks."
          );
        }

        if (equipment.includes("walk-in")) {
          addDecision(
            "Defrost Termination / Defrost Board",
            "Walk-ins with icing or poor box pull-down often point to control/termination issues.",
            "Verify schedule, termination, fan delay, drain heat, and actual box condition before replacing parts.",
            "Replacing refrigeration parts without verifying defrost logic leads to repeat calls."
          );
        }

        if (equipment.includes("ice machine")) {
          addDecision(
            "Water Valve / Water Pump / Sensor",
            "Ice-machine problems often come from sequence and water-side faults before refrigeration parts.",
            "Separate freeze/harvest sequence, water flow, fill, and sensor response before replacing refrigeration components.",
            "Calling refrigeration parts from an ice complaint without separating the sequence is risky."
          );
        }

        if (superheat !== null && subcool !== null && superheat > 18 && subcool < 5) {
          addDecision(
            "Metering Device / Restriction Path",
            "High superheat with low subcool leans toward underfeed, undercharge, or restriction.",
            "Verify airflow first, then check filter drier / restriction points and liquid feed path before replacing.",
            "Blind metering-device replacement can miss undercharge or airflow as the real problem."
          );
        }

        if (superheat !== null && subcool !== null && superheat < 6 && subcool > 15) {
          addDecision(
            "Airflow / Overfeed Verification Before Part Swap",
            "Low superheat with high subcool leans toward floodback, overfeed, or airflow trouble.",
            "Verify fan/blower operation and metering behavior before changing compressor or charge-related parts.",
            "A compressor or charge decision made here without airflow checks is high risk."
          );
        }

        if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
          addDecision(
            "Condenser Airflow / Heat Rejection Path",
            "Head pressure is high against ambient, which points to heat rejection first.",
            "Verify coil cleanliness, fan operation, rotation, and airflow blockage before replacing refrigerant-side parts.",
            "Blind part replacement can miss the actual heat-rejection problem."
          );
        }

        if (deltaT !== null && deltaT < 14 && (issue.includes("not cooling") || issue.includes("no cool"))) {
          addDecision(
            "Indoor Airflow / Control Path",
            "Weak split says verify airflow and control path before calling a major refrigerant-side repair.",
            "Check filter, coil, fan/blower, relay/board outputs, and compare against current readings.",
            "Replacing expensive parts with a weak split and no airflow verification is callback-prone."
          );
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addDecision(
            "Defrost / Fan / Drain Path",
            "The complaint itself says this may be more than just a part failure.",
            "Treat the repair decision as airflow/defrost/drain/feed verification until proven otherwise.",
            "Icing complaints come back when the root cause is not verified."
          );
        }

        if (recentParts.length || recentFix) {
          addDecision(
            "Re-verify the last repair path",
            `Recent same-component history exists: ${[recentParts.join(", "), recentFix].filter(Boolean).join(" • ") || "See history"}.`,
            "Check whether the previously replaced part failed again or whether operating conditions are causing repeated failure.",
            "Repeating the same replacement without proving why it failed again creates callbacks."
          );
        }

        const seen = new Set<string>();
        return decisions.filter((item) => {
          const key = item.part.trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 6);
      }

"""
    source = insert_before_once(
        source,
        '{/* guided-next-test-engine-v2 */}',
        helper_block,
        "repair decision helpers",
    )

    ui_block = """      {/* repair-decision-panel-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Repair Decision Panel">
          <SmallHint>
            Helps move from diagnosis into a smarter repair decision by showing likely parts to verify,
            why they are in play, what to prove first, and the callback risk if replaced blindly.
          </SmallHint>

          {(() => {
            const decisions = buildRepairDecisionPanelItems();
            const targetComponent = getCurrentAffectedComponentLabelForAssist();
            const sameComponentHistory = getSameComponentHistoryForTroubleshooting();

            if (!decisions.length) {
              return (
                <div style={{ marginTop: 12 }}>
                  <SmallHint>No repair decision items were generated yet. Add symptom, component, or readings to tighten the panel.</SmallHint>
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
                      Target Component
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{targetComponent || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Symptom
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{symptom || "—"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Same-Component History
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{sameComponentHistory.length}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {decisions.map((item, idx) => (
                    <div
                      key={`${item.part}-${idx}`}
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 12,
                        background: "#fafafa",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 900 }}>
                          Decision {idx + 1}: {item.part}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setPartsReplaced((prev) =>
                              [String(prev || "").trim(), item.part].filter(Boolean).join(", ")
                            )
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
                          Add Part Name to Parts Replaced
                        </button>
                      </div>

                      <SmallHint><b>Why this is in play:</b> {item.why}</SmallHint>
                      <SmallHint><b>Verify before replacing:</b> {item.verifyFirst}</SmallHint>
                      <SmallHint><b>Blind replace risk:</b> {item.blindRisk}</SmallHint>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

"""
    source = insert_before_once(
        source,
        '{/* guided-next-test-engine-v2 */}',
        ui_block,
        "repair decision UI",
    )

    backup = PAGE.with_name(PAGE.name + ".repair-decision-panel-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
