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

    if "selected-part-manuals-focus-assist-v1" in source:
        print("Selected Part → Manual / Parts Focus Assist already applied.")
        return

    helper_block = """      // selected-part-manuals-focus-assist-v1
      function buildSelectedPartManualsFocusAssist() {
        const partChecklist = buildPartVerificationChecklistItems();
        const selectedPart = String(partChecklist.selectedPart || "").trim();
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLower = targetComponent.toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const photoSubject = String(photoAssistSubject || "").trim().toLowerCase();
        const modelContext = [manufacturer, model].filter(Boolean).join(" ").trim();

        const manualFocus: string[] = [];
        const partsFocus: string[] = [];
        const sideFocus: string[] = [];
        const warnings: string[] = [];

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
            modelContext,
            manualFocus,
            partsFocus,
            sideFocus,
            warnings,
          };
        }

        const partLower = selectedPart.toLowerCase();

        addUnique(sideFocus, `Target component: ${targetComponent}`);
        addUnique(sideFocus, modelContext ? `Model context: ${modelContext}` : "Use current make/model before broad lookup.");

        if (partLower.includes("contactor")) {
          addUnique(manualFocus, "Condensing unit electrical sequence and contactor circuit");
          addUnique(manualFocus, "Line/load voltage path and contactor coil path");
          addUnique(partsFocus, "Contactor");
          addUnique(partsFocus, "Electrical service parts");
          addUnique(sideFocus, "Condensing / outdoor electrical side");
        }

        if (partLower.includes("capacitor")) {
          addUnique(manualFocus, "Run capacitor wiring and motor/compressor run circuit");
          addUnique(partsFocus, "Run Capacitor");
          addUnique(partsFocus, "Start / run electrical parts");
          addUnique(sideFocus, "Condensing / outdoor electrical side");
        }

        if (partLower.includes("condenser fan motor")) {
          addUnique(manualFocus, "Condenser fan wiring and heat-rejection section");
          addUnique(partsFocus, "Condenser Fan Motor");
          addUnique(partsFocus, "Outdoor airflow / heat-rejection parts");
          addUnique(sideFocus, "Condensing / outdoor airflow side");
        }

        if (partLower.includes("evaporator fan motor")) {
          addUnique(manualFocus, "Evaporator airflow and fan circuit section");
          addUnique(manualFocus, "Drain / ice / airflow related service section");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(partsFocus, "Evaporator airflow parts");
          addUnique(sideFocus, "Evaporator / indoor airflow side");
        }

        if (partLower.includes("defrost heater")) {
          addUnique(manualFocus, "Defrost heater circuit and defrost sequence section");
          addUnique(partsFocus, "Defrost Heater");
          addUnique(partsFocus, "Defrost system parts");
          addUnique(sideFocus, "Evaporator / defrost side");
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          addUnique(manualFocus, "Defrost control / termination / fan delay section");
          addUnique(partsFocus, "Defrost Termination");
          addUnique(partsFocus, "Defrost Control");
          addUnique(sideFocus, "Evaporator / defrost control side");
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          addUnique(manualFocus, "Metering device / feed path / distributor section");
          addUnique(manualFocus, "Restriction and evaporator feed verification section");
          addUnique(partsFocus, "TXV / EEV / Metering Device");
          addUnique(sideFocus, "Evaporator / feed side");
        }

        if (partLower.includes("blower motor")) {
          addUnique(manualFocus, "Indoor blower circuit and airflow sequence section");
          addUnique(partsFocus, "Blower Motor / Module");
          addUnique(partsFocus, "Indoor airflow parts");
          addUnique(sideFocus, "Indoor / air-handler airflow side");
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          addUnique(manualFocus, "Drain safety / condensate interrupt section");
          addUnique(partsFocus, "Float Switch / Drain Safety");
          addUnique(sideFocus, "Indoor drain / safety side");
        }

        if (partLower.includes("ignitor")) {
          addUnique(manualFocus, "Heating sequence / ignition section");
          addUnique(partsFocus, "Ignitor");
          addUnique(partsFocus, "Heating ignition parts");
          addUnique(sideFocus, "Furnace heating sequence side");
        }

        if (partLower.includes("flame sensor")) {
          addUnique(manualFocus, "Flame proving / ignition verification section");
          addUnique(partsFocus, "Flame Sensor");
          addUnique(partsFocus, "Heating proving parts");
          addUnique(sideFocus, "Furnace flame-proving side");
        }

        if (partLower.includes("pressure switch")) {
          addUnique(manualFocus, "Inducer / pressure proving / vent safety section");
          addUnique(partsFocus, "Pressure Switch");
          addUnique(partsFocus, "Heating proving parts");
          addUnique(sideFocus, "Furnace draft / proving side");
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          addUnique(manualFocus, "Water system / freeze-harvest sequence section");
          addUnique(partsFocus, selectedPart);
          addUnique(sideFocus, "Ice machine water / sequence side");
        }

        if (equipment.includes("walk-in")) {
          addUnique(sideFocus, "Walk-in refrigeration / box-control context");
        }

        if (photoSubject === "nameplate_tag") {
          addUnique(manualFocus, "Model-specific parts list / exploded view / OEM lookup");
          addUnique(warnings, "Use the photographed tag/model to avoid pulling the wrong paired-equipment parts.");
        }

        if (photoSubject === "contactor_capacitor") {
          addUnique(warnings, "Stay on electrical verification first before shifting into refrigerant-side lookup.");
        }

        if (photoSubject === "iced_coil" || photoSubject === "drain_defrost") {
          addUnique(warnings, "Freeze-up photo context means airflow/defrost/feed sections should stay ahead of broad part swapping.");
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addUnique(warnings, "The complaint is freeze/icing-related, so keep lookup anchored to airflow/defrost/feed verification.");
        }

        if (componentLower.includes("condensing") || componentLower.includes("outdoor")) {
          if (
            partLower.includes("evaporator") ||
            partLower.includes("defrost") ||
            partLower.includes("txv") ||
            partLower.includes("blower")
          ) {
            addUnique(warnings, "Selected part does not match the current outdoor/condensing-side focus. Re-check the target component.");
          }
        }

        if (componentLower.includes("evaporator") || componentLower.includes("indoor")) {
          if (
            partLower.includes("contactor") ||
            partLower.includes("capacitor") ||
            partLower.includes("condenser fan") ||
            partLower == "compressor"
          ) {
            addUnique(warnings, "Selected part does not match the current evap/indoor-side focus. Re-check the target component.");
          }
        }

        return {
          selectedPart,
          modelContext,
          manualFocus: manualFocus.slice(0, 5),
          partsFocus: partsFocus.slice(0, 5),
          sideFocus: sideFocus.slice(0, 5),
          warnings: warnings.slice(0, 4),
        };
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "selected part manuals focus helpers",
    )

    ui_block = """      {/* selected-part-manuals-focus-assist-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Selected Part → Manual / Parts Focus Assist">
          <SmallHint>
            Uses the selected part to point the tech toward the right manual section, parts category, and side of the system.
          </SmallHint>

          {(() => {
            const assist = buildSelectedPartManualsFocusAssist();

            if (!assist.selectedPart) {
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
                      {assist.selectedPart}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Model Context
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {assist.modelContext || "Use current make/model"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Manual Section Focus</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.manualFocus.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Parts Category Focus</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.partsFocus.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>System Side Focus</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.sideFocus.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Warnings</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.warnings.length ? (
                        assist.warnings.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))
                      ) : (
                        <li>
                          <SmallHint>No special focus warnings.</SmallHint>
                        </li>
                      )}
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
        '{/* tighter-parts-manuals-assist-v3 */}',
        ui_block,
        "selected part manuals focus UI",
    )

    backup = PAGE.with_name(PAGE.name + ".selected-part-manuals-focus-assist-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
