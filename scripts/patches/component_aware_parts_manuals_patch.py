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

    if "component-aware-parts-manuals-v1" in source:
        print("Component-aware Parts & Manuals patch already applied.")
        return

    if "component-aware-parts-manuals-helpers-v1" not in source:
        helper_block = """      // component-aware-parts-manuals-helpers-v1
      function normalizeComponentAssistText(value: unknown) {
        return String(value || "").trim().toLowerCase();
      }

      function getCurrentAffectedComponentLabelForAssist() {
        return String(affectedComponentLabel || "").trim() || getPrimaryAffectedComponentLabel();
      }

      function getSameComponentHistoryForAssist() {
        const allEvents = Array.isArray(unitServiceTimeline) ? unitServiceTimeline : [];
        if (systemType === "single") return allEvents;

        const selectedLabel = String(affectedComponentLabel || "").trim();
        if (!selectedLabel) return [];

        return allEvents.filter((event) => {
          const label = String(getAffectedComponentDisplayForEvent(event) || "").trim();
          return label === selectedLabel;
        });
      }

      function getRecentSameComponentPartsForAssist() {
        const history = getSameComponentHistoryForAssist();
        const seen = new Set<string>();
        const parts: string[] = [];

        for (const event of history) {
          const raw = String(event?.parts_replaced || "").trim();
          if (!raw) continue;

          for (const part of raw.split(/[;,]/)) {
            const cleaned = part.trim();
            const key = cleaned.toLowerCase();
            if (!cleaned || seen.has(key)) continue;
            seen.add(key);
            parts.push(cleaned);
          }
        }

        return parts.slice(0, 6);
      }

      function getMostRecentSameComponentFixForAssist() {
        const history = getSameComponentHistoryForAssist();
        if (!history.length) return "";
        const sorted = [...history].sort((a, b) => {
          const aTime = a?.service_date ? new Date(String(a.service_date)).getTime() : 0;
          const bTime = b?.service_date ? new Date(String(b.service_date)).getTime() : 0;
          return bTime - aTime;
        });
        return String(sorted[0]?.actual_fix_performed || "").trim();
      }

      function uniqueAssistList(items: string[]) {
        const seen = new Set<string>();
        const out: string[] = [];
        for (const item of items) {
          const cleaned = item.trim();
          const key = cleaned.toLowerCase();
          if (!cleaned || seen.has(key)) continue;
          seen.add(key);
          out.push(cleaned);
        }
        return out;
      }

      function getComponentAwareLikelyParts() {
        const componentLabel = normalizeComponentAssistText(getCurrentAffectedComponentLabelForAssist());
        const equipment = normalizeComponentAssistText(equipmentType);
        const issue = normalizeComponentAssistText(symptom);
        const priorParts = getRecentSameComponentPartsForAssist();

        const parts: string[] = [...priorParts];

        if (componentLabel.includes("evaporator") || componentLabel.includes("indoor head")) {
          parts.push(
            "Evaporator fan motor",
            "Fan blade / wheel",
            "Defrost heater",
            "Defrost termination / sensor",
            "TXV / EEV",
            "Drain heater",
            "Drain pan heater",
            "Distributor / nozzle / check distributor circuit",
          );
        }

        if (
          componentLabel.includes("condensing") ||
          componentLabel.includes("outdoor") ||
          componentLabel.includes("condenser")
        ) {
          parts.push(
            "Contactor",
            "Run capacitor",
            "Condenser fan motor",
            "Fan blade",
            "Pressure control",
            "Compressor overload / start components",
            "Crankcase heater",
          );
        }

        if (componentLabel.includes("furnace")) {
          parts.push(
            "Control board",
            "Ignitor",
            "Flame sensor",
            "Pressure switch",
            "Inducer motor",
            "Gas valve",
            "Limit switch",
          );
        }

        if (componentLabel.includes("air handler") || componentLabel.includes("indoor unit")) {
          parts.push(
            "Blower motor",
            "Blower capacitor / module",
            "Fan relay / board",
            "Electric heat sequencer",
            "Float switch",
            "Control board",
          );
        }

        if (equipment.includes("walk-in")) {
          parts.push(
            "Defrost timer / board",
            "Defrost termination",
            "Door heater / frame heater",
            "Drain line heat",
            "Evaporator fan delay",
          );
        }

        if (equipment.includes("ice machine")) {
          parts.push(
            "Water valve",
            "Water pump",
            "Bin control",
            "Hot gas valve",
            "Thermistor / probe",
            "Curtain switch / sensor",
          );
        }

        if (issue.includes("no cool") || issue.includes("not cooling")) {
          parts.push(
            "Contactor",
            "Capacitor",
            "Fan motor",
            "Control board / relay",
            "TXV / metering device",
          );
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          parts.push(
            "Defrost heater",
            "Defrost control",
            "Fan motor",
            "TXV / EEV",
            "Drain heater",
          );
        }

        if (issue.includes("heat")) {
          parts.push(
            "Ignitor",
            "Flame sensor",
            "Pressure switch",
            "Gas valve",
            "Heat relay / sequencer",
          );
        }

        return uniqueAssistList(parts).slice(0, 10);
      }

      function getComponentAwareVerifyFirst() {
        const componentLabel = normalizeComponentAssistText(getCurrentAffectedComponentLabelForAssist());
        const equipment = normalizeComponentAssistText(equipmentType);
        const issue = normalizeComponentAssistText(symptom);

        const steps: string[] = [
          "Verify the call is tied to the correct affected component before ordering parts.",
          "Compare the current symptom against prior same-component history first.",
        ];

        if (
          componentLabel.includes("condensing") ||
          componentLabel.includes("outdoor") ||
          componentLabel.includes("condenser")
        ) {
          steps.push(
            "Verify line voltage, contactor pull-in, capacitor value, and condenser fan operation.",
            "Check condenser coil condition and airflow before condemning refrigeration components.",
          );
        }

        if (componentLabel.includes("evaporator") || componentLabel.includes("indoor head")) {
          steps.push(
            "Verify fan operation, coil condition, drain condition, and any defrost circuit before replacing parts.",
            "Check for airflow / frost pattern issues before condemning TXV or refrigerant charge.",
          );
        }

        if (componentLabel.includes("furnace")) {
          steps.push(
            "Verify call for heat, board outputs, safeties, ignitor, and flame sense before replacing parts.",
          );
        }

        if (componentLabel.includes("air handler") || componentLabel.includes("indoor unit")) {
          steps.push(
            "Verify blower operation, board / relay outputs, and drain safety before replacing indoor components.",
          );
        }

        if (equipment.includes("walk-in")) {
          steps.push(
            "Verify box temp, defrost schedule, fan delay, and door / drain heat conditions before ordering parts.",
          );
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          steps.push(
            "Check airflow, fan operation, defrost operation, and frost pattern before replacing refrigeration parts.",
          );
        }

        if (issue.includes("no cool") || issue.includes("not cooling")) {
          steps.push(
            "Verify power, controls, airflow, and obvious electrical failures before replacing higher-cost parts.",
          );
        }

        return uniqueAssistList(steps).slice(0, 8);
      }

      function getComponentAwareManualTargets() {
        const componentLabel = normalizeComponentAssistText(getCurrentAffectedComponentLabelForAssist());
        const equipment = normalizeComponentAssistText(equipmentType);

        const targets: string[] = [
          "OEM installation / service manual for the exact model",
          "Wiring diagram for the affected component",
        ];

        if (
          componentLabel.includes("condensing") ||
          componentLabel.includes("outdoor") ||
          componentLabel.includes("condenser")
        ) {
          targets.push(
            "Condenser section electrical diagram",
            "Compressor and condenser fan motor wiring / sequence of operation",
          );
        }

        if (componentLabel.includes("evaporator") || componentLabel.includes("indoor head")) {
          targets.push(
            "Evaporator / indoor section wiring and fan circuit",
            "Defrost sequence and sensor / termination information",
            "TXV / metering device information and refrigerant circuit diagram",
          );
        }

        if (componentLabel.includes("furnace")) {
          targets.push(
            "Furnace ignition sequence / safety diagram",
            "Board pinout / pressure switch / inducer wiring information",
          );
        }

        if (componentLabel.includes("air handler") || componentLabel.includes("indoor unit")) {
          targets.push(
            "Indoor blower section wiring diagram",
            "Electric heat / sequencer / blower relay information",
          );
        }

        if (equipment.includes("walk-in")) {
          targets.push(
            "Walk-in defrost control sequence",
            "Evaporator fan delay / heater / drain heat documentation",
          );
        }

        if (equipment.includes("ice machine")) {
          targets.push(
            "Harvest / freeze sequence chart",
            "Water system and sensor diagnostic chart",
          );
        }

        return uniqueAssistList(targets).slice(0, 8);
      }

"""
        source = insert_before_once(
            source,
            'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
            helper_block,
            "component-aware parts/manuals helpers",
        )

    ui_block = """      {/* component-aware-parts-manuals-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Component-Aware Parts & Manuals Target">
          <SmallHint>
            Uses the selected affected component, system structure, symptom, and same-component history
            to point you toward the most likely parts and the most useful manuals / info to open first.
          </SmallHint>

          {(() => {
            const componentLabel = getCurrentAffectedComponentLabelForAssist();
            const sameComponentHistory = getSameComponentHistoryForAssist();
            const likelyParts = getComponentAwareLikelyParts();
            const verifyFirst = getComponentAwareVerifyFirst();
            const manualTargets = getComponentAwareManualTargets();
            const priorParts = getRecentSameComponentPartsForAssist();
            const recentFix = getMostRecentSameComponentFixForAssist();

            return (
              <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
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
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{componentLabel || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Same-Component History Count
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{sameComponentHistory.length}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Recent Same-Component Fix
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{recentFix || "—"}</div>
                  </div>
                </div>

                {systemType !== "single" && !affectedComponentLabel ? (
                  <div
                    style={{
                      border: "1px solid #f0c36d",
                      borderRadius: 10,
                      padding: 10,
                      background: "#fff8e8",
                      fontWeight: 700,
                    }}
                  >
                    Select an affected component to tighten the parts/manuals targeting for this system.
                  </div>
                ) : null}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Likely Parts for This Component</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {likelyParts.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Verify First Before Replacing</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {verifyFirst.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Manuals / Info to Open First</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {manualTargets.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {priorParts.length ? (
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Recent Same-Component Parts History</div>
                    <SmallHint style={{ marginTop: 6 }}>
                      {priorParts.join(" • ")}
                    </SmallHint>
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
        '<div style={{ marginTop: 16, display: showSavedUnitHistory ? "block" : "none" }}>',
        ui_block,
        "component-aware parts/manuals UI anchor",
    )

    backup = PAGE.with_name(PAGE.name + ".component-aware-parts-manuals.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()