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

    if "targeted-parts-manuals-assist-v2" in source:
        print("Targeted Parts & Manuals Assist v2 already applied.")
        return

    helper_block = """      // targeted-parts-manuals-assist-v2
      function getTargetedComponentRecordForAssist() {
        const selectedId = String(affectedComponentId || "").trim();

        if (selectedId && Array.isArray(linkedEquipmentComponents)) {
          const linkedMatch = linkedEquipmentComponents.find(
            (component) => String(component?.id || "").trim() === selectedId
          );

          if (linkedMatch) {
            return {
              source: "linked",
              label: getCurrentAffectedComponentLabelForAssist(),
              role: String(linkedMatch.role || "").trim(),
              tag: String(linkedMatch.tag || "").trim(),
              manufacturer: String(linkedMatch.manufacturer || "").trim(),
              model: String(linkedMatch.model || "").trim(),
              serial: String(linkedMatch.serial || "").trim(),
            };
          }
        }

        return {
          source: "primary",
          label: getCurrentAffectedComponentLabelForAssist(),
          role: String(primaryComponentRole || "unit").trim(),
          tag: String(unitNickname || "").trim(),
          manufacturer: String(manufacturer || "").trim(),
          model: String(model || "").trim(),
          serial: String(serialNumber || nameplate?.serial || "").trim(),
        };
      }

      function getTargetedLikelyPartsV2() {
        const target = getTargetedComponentRecordForAssist();
        const role = String(target.role || "").toLowerCase();
        const issue = String(symptom || "").toLowerCase();
        const priorParts = getRecentSameComponentPartsForAssist();
        const items: string[] = [];

        if (priorParts.length) {
          items.push(...priorParts.map((part) => `${part} — already seen on this component`));
        }

        if (role.includes("condensing") || role.includes("outdoor") || role.includes("condenser")) {
          items.push(
            "Contactor — verify pull-in, contact wear, and voltage drop",
            "Run capacitor — verify actual value under load",
            "Condenser fan motor — verify amps, rotation, and blade condition",
            "Pressure control / fan cycling control — verify sequence and cut-in/cut-out",
            "Compressor protection / start components — verify before condemning compressor"
          );
        }

        if (role.includes("evaporator") || role.includes("indoor_head")) {
          items.push(
            "Evaporator fan motor — verify amps, rotation, and blade condition",
            "Defrost heater — verify continuity / amp draw during defrost",
            "Defrost termination / sensor — verify actual termination behavior",
            "Drain heater / drain path — verify water can clear during defrost",
            "TXV / EEV path — verify feed problem before replacement"
          );
        }

        if (role.includes("furnace")) {
          items.push(
            "Ignitor — verify operation during sequence",
            "Flame sensor — verify cleaning / flame rectification",
            "Pressure switch — verify actual pressure and tubing condition",
            "Inducer motor — verify start, amps, and wheel condition",
            "Board / gas valve path — verify outputs before replacement"
          );
        }

        if (role.includes("air_handler") || role.includes("indoor_unit")) {
          items.push(
            "Blower motor / module — verify amps and control signal",
            "Blower capacitor — verify actual capacitance",
            "Fan relay / board output — verify command and voltage",
            "Drain safety / float switch — verify open/closed state",
            "Electric heat sequencer / relay — verify call and output"
          );
        }

        if (String(equipmentType || "").toLowerCase().includes("walk-in")) {
          items.push(
            "Defrost timer / board — verify schedule and outputs",
            "Fan delay / defrost relay — verify fan restart timing",
            "Door heater / frame heater — verify operation if sweating or ice is present"
          );
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          items.push(
            "Control / call path — verify before major parts",
            "Airflow-related failure points — verify before refrigerant-side changes"
          );
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          items.push(
            "Defrost path — verify operation before replacing refrigeration parts",
            "Airflow / fan path — verify before condemning TXV or charge",
            "Drain / ice management path — verify before repeat repair"
          );
        }

        return uniqueAssistList(items).slice(0, 10);
      }

      function getTargetedManualQueriesV2() {
        const target = getTargetedComponentRecordForAssist();
        const role = String(target.role || "").toLowerCase();
        const makeModel = [target.manufacturer, target.model].filter(Boolean).join(" ").trim();
        const queries: string[] = [];

        if (makeModel) {
          queries.push(
            `${makeModel} service manual`,
            `${makeModel} wiring diagram`,
            `${makeModel} sequence of operation`
          );
        } else {
          queries.push("OEM service manual for the exact equipment", "OEM wiring diagram");
        }

        if (role.includes("condensing") || role.includes("outdoor") || role.includes("condenser")) {
          queries.push(
            "Outdoor / condensing section wiring diagram",
            "Contactor / capacitor / condenser fan circuit page",
            "Compressor protection / high-low pressure control page"
          );
        }

        if (role.includes("evaporator") || role.includes("indoor_head")) {
          queries.push(
            "Evaporator / indoor section wiring diagram",
            "Defrost sequence / termination / fan delay page",
            "Fan motor circuit and drain heat page",
            "TXV / EEV / feed circuit page"
          );
        }

        if (role.includes("furnace")) {
          queries.push(
            "Ignition sequence and safety chain page",
            "Board pinout / inducer / pressure switch wiring page"
          );
        }

        if (role.includes("air_handler") || role.includes("indoor_unit")) {
          queries.push(
            "Blower circuit / relay / board page",
            "Drain safety / float switch page",
            "Electric heat sequencer / strip heat page"
          );
        }

        if (String(equipmentType || "").toLowerCase().includes("walk-in")) {
          queries.push(
            "Walk-in defrost control page",
            "Walk-in evaporator fan delay / heater / drain heat page"
          );
        }

        return uniqueAssistList(queries).slice(0, 10);
      }

      function getTargetedVerifyChecklistV2() {
        const target = getTargetedComponentRecordForAssist();
        const role = String(target.role || "").toLowerCase();
        const items: string[] = [...getComponentAwareVerifyFirst()];

        if (target.tag) {
          items.unshift(`Verify you are on the correct tagged component: ${target.tag}.`);
        }

        if (role.includes("condensing") || role.includes("outdoor") || role.includes("condenser")) {
          items.push(
            "Verify line voltage, contactor status, capacitor value, and condenser fan operation before replacing parts.",
            "Verify condenser airflow / coil condition before refrigerant-side conclusions."
          );
        }

        if (role.includes("evaporator") || role.includes("indoor_head")) {
          items.push(
            "Verify fan operation, ice pattern, drain condition, and defrost behavior before ordering parts.",
            "Verify airflow and frost pattern before condemning TXV / EEV / charge."
          );
        }

        if (role.includes("furnace")) {
          items.push(
            "Verify the entire heat sequence and safety chain before replacing the board or valve."
          );
        }

        if (role.includes("air_handler") || role.includes("indoor_unit")) {
          items.push(
            "Verify blower output, motor operation, and drain safety before replacing indoor components."
          );
        }

        return uniqueAssistList(items).slice(0, 10);
      }

      function getTargetedHistoryBiasV2() {
        const history = getSameComponentHistoryForAssist();
        const items: string[] = [];
        const recentFix = getMostRecentSameComponentFixForAssist();
        const recentParts = getRecentSameComponentPartsForAssist();

        if (history.length) {
          items.push(
            `This component has ${history.length} prior same-component event${history.length === 1 ? "" : "s"}.`
          );
        }

        if (recentFix) {
          items.push(`Recent same-component fix: ${recentFix}`);
        }

        if (recentParts.length) {
          items.push(`Recent same-component parts: ${recentParts.join(" • ")}`);
        }

        const warnings = getComponentAwareWarningSignals();
        if (warnings.length) {
          items.push(...warnings);
        }

        return uniqueAssistList(items).slice(0, 8);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "targeted parts/manuals helpers",
    )

    ui_block = """      {/* targeted-parts-manuals-assist-v2 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Targeted Parts & Manuals Assist v2">
          <SmallHint>
            Focuses the tech on the exact component, the right make/model context, likely part bucket,
            what to verify before replacing, and what manual/wiring section to open first.
          </SmallHint>

          {(() => {
            const target = getTargetedComponentRecordForAssist();
            const likelyParts = getTargetedLikelyPartsV2();
            const manualQueries = getTargetedManualQueriesV2();
            const verifyChecklist = getTargetedVerifyChecklistV2();
            const historyBias = getTargetedHistoryBiasV2();
            const targetMakeModel = [target.manufacturer, target.model].filter(Boolean).join(" ").trim();

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
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{target.label || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Target Make / Model
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{targetMakeModel || "Use exact tag/manual when available"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Tag / Serial Context
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {[target.tag, target.serial].filter(Boolean).join(" • ") || "-"}
                    </div>
                  </div>
                </div>

                {systemType !== "single" && !affectedComponentLabel ? (
                  <div
                    style={{
                      border: "1px solid #f0c36d",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fff8e8",
                    }}
                  >
                    <SmallHint>
                      Select an affected component to tighten the target make/model and parts/manuals suggestions.
                    </SmallHint>
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
                    <div style={{ fontWeight: 900 }}>Likely Part Bucket</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {likelyParts.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Open These Manuals / Pages First</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {manualQueries.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Verify Before Replacing</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {verifyChecklist.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>History Bias</div>
                    {historyBias.length ? (
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {historyBias.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <SmallHint style={{ marginTop: 8 }}>
                        No component-specific history bias yet.
                      </SmallHint>
                    )}
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
        '{/* component-aware-troubleshooting-hints-v1 */}',
        ui_block,
        "targeted parts/manuals v2 UI",
    )

    backup = PAGE.with_name(PAGE.name + ".targeted-parts-manuals-assist-v2.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
