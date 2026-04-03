from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def insert_before_first(source: str, anchors: list[str], block: str, label: str) -> str:
    for anchor in anchors:
        idx = source.find(anchor)
        if idx != -1:
            return source[:idx] + block + source[idx:]
    raise RuntimeError(f"Could not find any expected anchor for: {label}. Tried: {anchors}")


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "tighter-parts-manuals-assist-v3" in source:
        print("Tighter Parts & Manuals Assist v3 already applied.")
        return

    helper_block = """      // tighter-parts-manuals-assist-v3
      function buildTighterPartsManualsAssist() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLabelLower = targetComponent.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const photoSubject = String(photoAssistSubject || "").trim().toLowerCase();
        const modelContext = [manufacturer, model].filter(Boolean).join(" ").trim();

        const manualSections: string[] = [];
        const partsFocus: string[] = [];
        const lookupBiases: string[] = [];
        const boundaries: string[] = [];

        const addUnique = (items: string[], value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!items.some((item) => item.trim().toLowerCase() === clean.toLowerCase())) {
            items.push(clean);
          }
        };

        addUnique(lookupBiases, modelContext ? `Bias lookup to model-specific information for ${modelContext}.` : "Bias lookup to the currently entered make/model before using generic parts ideas.");
        addUnique(boundaries, `Stay on the selected component first: ${targetComponent}.`);

        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          addUnique(manualSections, "Outdoor/condensing unit wiring and sequence sections");
          addUnique(manualSections, "Contactor, capacitor, condenser fan, and compressor circuit sections");
          addUnique(partsFocus, "Contactor");
          addUnique(partsFocus, "Run Capacitor");
          addUnique(partsFocus, "Condenser Fan Motor");
          addUnique(partsFocus, "Compressor protection / start path");
          addUnique(boundaries, "Do not drift into evaporator/indoor parts unless readings or history clearly support that side.");
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          addUnique(manualSections, "Evaporator airflow, drain, frost pattern, and defrost sections");
          addUnique(manualSections, "Metering device and feed-path sections");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(partsFocus, "Defrost Heater");
          addUnique(partsFocus, "Defrost Termination / Defrost Control");
          addUnique(partsFocus, "TXV / EEV / Metering Device");
          addUnique(boundaries, "Do not jump to condensing-side parts when the selected component is evap/indoor.");
        }

        if (componentLabelLower.includes("furnace")) {
          addUnique(manualSections, "Heating sequence of operation and safety-chain sections");
          addUnique(manualSections, "Ignition, flame proving, inducer, and pressure-switch sections");
          addUnique(partsFocus, "Ignitor");
          addUnique(partsFocus, "Flame Sensor");
          addUnique(partsFocus, "Pressure Switch");
          addUnique(partsFocus, "Inducer-related proving path");
        }

        if (componentLabelLower.includes("air handler") || componentLabelLower.includes("indoor unit")) {
          addUnique(manualSections, "Indoor blower, relay/board output, and drain safety sections");
          addUnique(partsFocus, "Blower Motor / Module");
          addUnique(partsFocus, "Float Switch / Drain Safety");
          addUnique(partsFocus, "Relay / Sequencer");
        }

        if (equipment.includes("walk-in")) {
          addUnique(manualSections, "Walk-in defrost schedule, fan delay, drain heat, and box-control sections");
          addUnique(partsFocus, "Defrost Termination");
          addUnique(partsFocus, "Defrost Control");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(boundaries, "Keep the lookup focused on box temp, defrost path, and evap-side issues before broad refrigeration swaps.");
        }

        if (equipment.includes("ice machine")) {
          addUnique(manualSections, "Freeze/harvest sequence and water-system sections");
          addUnique(partsFocus, "Water Valve");
          addUnique(partsFocus, "Water Pump");
          addUnique(partsFocus, "Sensor / probe path");
          addUnique(boundaries, "Separate water-side sequence from refrigeration-side decisions.");
        }

        if (photoSubject == "nameplate_tag") {
          addUnique(lookupBiases, "Bias hard toward OEM model/serial lookup and the exact paired-equipment side shown on the tag.");
          addUnique(manualSections, "Nameplate/model-specific exploded views and parts lists");
        }

        if (photoSubject == "contactor_capacitor") {
          addUnique(lookupBiases, "Bias toward electrical service parts and wiring sections first.");
          addUnique(partsFocus, "Contactor");
          addUnique(partsFocus, "Run Capacitor");
          addUnique(partsFocus, "Condenser Fan Motor");
        }

        if (photoSubject == "control_board") {
          addUnique(lookupBiases, "Bias toward board input/output verification sections before replacement.");
          addUnique(partsFocus, "Control Board");
          addUnique(partsFocus, "Relay / Sequencer");
          addUnique(boundaries, "Do not call the board from appearance alone. Use the manual to verify inputs and outputs.");
        }

        if (photoSubject == "iced_coil" || photoSubject == "drain_defrost") {
          addUnique(lookupBiases, "Bias toward defrost, airflow, drain, and evap-side service sections.");
          addUnique(partsFocus, "Defrost Heater");
          addUnique(partsFocus, "Defrost Termination / Defrost Control");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(partsFocus, "TXV / EEV / Metering Device");
        }

        if (photoSubject == "dirty_coil_airflow") {
          addUnique(lookupBiases, "Bias toward airflow, fan, and coil-cleaning related service sections first.");
          addUnique(partsFocus, "Condenser Fan Motor");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(partsFocus, "Blower Motor");
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addUnique(manualSections, "Freeze-up, defrost, drain, and frost-pattern troubleshooting sections");
          addUnique(boundaries, "Keep the lookup anchored to airflow/defrost/feed verification before broad part swapping.");
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          addUnique(manualSections, "No-cool electrical checks and airflow/refrigerant decision sections");
          addUnique(boundaries, "Use the selected component and current readings to stay on the correct side of the system.");
        }

        if (issue.includes("heat")) {
          addUnique(manualSections, "Heat sequence and safety proving sections");
        }

        return {
          modelContext,
          targetComponent,
          photoSubjectLabel: photoSubject ? photoSubject.replaceAll("_", " ") : "not selected",
          manualSections: manualSections.slice(0, 6),
          partsFocus: partsFocus.slice(0, 6),
          lookupBiases: lookupBiases.slice(0, 5),
          boundaries: boundaries.slice(0, 5),
        };
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "tighter parts/manuals helpers",
    )

    ui_block = """      {/* tighter-parts-manuals-assist-v3 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Tighter Parts & Manuals Assist">
          <SmallHint>
            Uses the selected component, equipment type, symptom, and photo subject to keep manuals and parts lookup on the right side of the system.
          </SmallHint>

          {(() => {
            const assist = buildTighterPartsManualsAssist();

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
                      Model Context
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {assist.modelContext || "Use current make/model fields"}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Target Component
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {assist.targetComponent || "Primary component"}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Photo Subject
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {assist.photoSubjectLabel}
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
                      {assist.manualSections.map((item, idx) => (
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
                    <div style={{ fontWeight: 900 }}>Lookup Bias</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.lookupBiases.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Keep These Boundaries</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.boundaries.map((item, idx) => (
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
    source = insert_before_first(
        source,
        [
            '{/* component-aware-parts-manuals-patch */}',
            '{/* targeted-parts-manuals-assist-v2 */}',
            '<SectionCard title="Parts & Manuals Assist">',
            '<SectionCard title="Parts & Manuals">',
        ],
        ui_block,
        "tighter parts/manuals UI",
    )

    backup = PAGE.with_name(PAGE.name + ".tighter-parts-manuals-assist-v3.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
