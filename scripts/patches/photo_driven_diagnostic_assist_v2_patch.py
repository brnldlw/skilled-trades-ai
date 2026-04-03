from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "photo-driven-diagnostic-assist-v2" in source:
        print("Photo-Driven Diagnostic Assist v2 already applied.")
        return

    old_block = """        const inspect: string[] = [];
        const verifyNext: string[] = [];
        const watchOuts: string[] = [];
        const summaryParts: string[] = [];
"""
    new_block = """        const inspect: string[] = [];
        const verifyNext: string[] = [];
        const watchOuts: string[] = [];
        const repairDecisionEmphasis: string[] = [];
        const partsToVerifyEmphasis: string[] = [];
        const summaryParts: string[] = [];
"""
    source = replace_once(source, old_block, new_block, "photo assist arrays")

    old_block = """        if (photoAssistSubject === "iced_coil") {
          inspect.push(
            "Look for a full frost pattern versus a partial frost pattern.",
            "Check whether the fan is running and whether airflow is blocked by dirt or ice.",
            "Look for drain issues, ice bridging, and signs of repeated icing."
          );
          verifyNext.push(
            "Verify fan operation, airflow, and defrost operation before condemning charge or TXV/EEV.",
            "Compare frost pattern to current suction, superheat, and box/load condition."
          );
          watchOuts.push(
            "Do not jump straight to refrigerant-side parts if the photo points more toward airflow or defrost."
          );
        }
"""
    new_block = """        if (photoAssistSubject === "iced_coil") {
          inspect.push(
            "Look for a full frost pattern versus a partial frost pattern.",
            "Check whether the fan is running and whether airflow is blocked by dirt or ice.",
            "Look for drain issues, ice bridging, and signs of repeated icing."
          );
          verifyNext.push(
            "Verify fan operation, airflow, and defrost operation before condemning charge or TXV/EEV.",
            "Compare frost pattern to current suction, superheat, and box/load condition."
          );
          repairDecisionEmphasis.push(
            "Do not move into a refrigerant-side repair decision until airflow, drain, and defrost are checked.",
            "Use the frost pattern to decide whether this is airflow/defrost versus feed/restriction."
          );
          partsToVerifyEmphasis.push(
            "Evaporator Fan Motor",
            "Defrost Heater",
            "Defrost Termination / Defrost Control",
            "TXV / EEV / Metering Device"
          );
          watchOuts.push(
            "Do not jump straight to refrigerant-side parts if the photo points more toward airflow or defrost."
          );
        }
"""
    source = replace_once(source, old_block, new_block, "iced coil emphasis")

    old_block = """        if (photoAssistSubject === "contactor_capacitor") {
          inspect.push(
            "Look for pitted contacts, burnt insulation, swelling, oil leakage, or heat discoloration.",
            "Check wire terminations, loose lugs, and signs of overheating."
          );
          verifyNext.push(
            "Meter line/load voltage, verify coil pull-in, and test capacitor value before replacing other parts.",
            "Confirm the failed part is the root cause and not the result of another electrical problem."
          );
          watchOuts.push(
            "A bad contactor or capacitor can be the symptom of motor/compressor issues, not always the root cause."
          );
        }
"""
    new_block = """        if (photoAssistSubject === "contactor_capacitor") {
          inspect.push(
            "Look for pitted contacts, burnt insulation, swelling, oil leakage, or heat discoloration.",
            "Check wire terminations, loose lugs, and signs of overheating."
          );
          verifyNext.push(
            "Meter line/load voltage, verify coil pull-in, and test capacitor value before replacing other parts.",
            "Confirm the failed part is the root cause and not the result of another electrical problem."
          );
          repairDecisionEmphasis.push(
            "Bias the repair decision toward electrical verification first before refrigerant-side conclusions.",
            "Prove whether the contactor/capacitor is the failure or a symptom of motor/compressor load."
          );
          partsToVerifyEmphasis.push(
            "Contactor",
            "Run Capacitor",
            "Condenser Fan Motor",
            "Compressor"
          );
          watchOuts.push(
            "A bad contactor or capacitor can be the symptom of motor/compressor issues, not always the root cause."
          );
        }
"""
    source = replace_once(source, old_block, new_block, "contactor/capacitor emphasis")

    old_block = """        if (photoAssistSubject === "control_board") {
          inspect.push(
            "Look for burnt traces, loose plugs, water intrusion, and failed relays.",
            "Check whether the board is actually receiving the correct inputs before condemning it."
          );
          verifyNext.push(
            "Verify incoming power, control signals, safeties, and outputs with a meter before replacing the board."
          );
          watchOuts.push(
            "Board replacement without verifying inputs/outputs often creates callbacks."
          );
        }
"""
    new_block = """        if (photoAssistSubject === "control_board") {
          inspect.push(
            "Look for burnt traces, loose plugs, water intrusion, and failed relays.",
            "Check whether the board is actually receiving the correct inputs before condemning it."
          );
          verifyNext.push(
            "Verify incoming power, control signals, safeties, and outputs with a meter before replacing the board."
          );
          repairDecisionEmphasis.push(
            "Push the repair decision toward proving inputs and outputs instead of replacing the board from appearance alone."
          );
          partsToVerifyEmphasis.push(
            "Control Board",
            "Relay / Sequencer",
            "Pressure Switch",
            "Ignitor / Flame Sensor"
          );
          watchOuts.push(
            "Board replacement without verifying inputs/outputs often creates callbacks."
          );
        }
"""
    source = replace_once(source, old_block, new_block, "control board emphasis")

    old_block = """        if (photoAssistSubject === "wiring") {
          inspect.push(
            "Look for rubbed insulation, burnt conductors, loose terminations, and wrong landed wires.",
            "Check for signs of field modifications or bypassed safeties."
          );
          verifyNext.push(
            "Ohm/check continuity only after confirming safe isolation. Then verify live voltage path as needed."
          );
          watchOuts.push(
            "A wiring photo can explain repeated intermittent failures if connections are loose or heat damaged."
          );
        }
"""
    new_block = """        if (photoAssistSubject === "wiring") {
          inspect.push(
            "Look for rubbed insulation, burnt conductors, loose terminations, and wrong landed wires.",
            "Check for signs of field modifications or bypassed safeties."
          );
          verifyNext.push(
            "Ohm/check continuity only after confirming safe isolation. Then verify live voltage path as needed."
          );
          repairDecisionEmphasis.push(
            "Pause any part replacement until wiring integrity and landed connections are verified."
          );
          partsToVerifyEmphasis.push(
            "Contactor",
            "Control Board",
            "Relay / Sequencer",
            "Pressure Switch"
          );
          watchOuts.push(
            "A wiring photo can explain repeated intermittent failures if connections are loose or heat damaged."
          );
        }
"""
    source = replace_once(source, old_block, new_block, "wiring emphasis")

    old_block = """        if (photoAssistSubject === "nameplate_tag") {
          inspect.push(
            "Confirm model, serial, refrigerant, electrical data, and any internal/paired component relationship.",
            "Check whether the nameplate supports the selected affected component and equipment type."
          );
          verifyNext.push(
            "Use the tag to tighten parts/manuals lookup and confirm the correct system section is being diagnosed."
          );
          watchOuts.push(
            "Do not order parts off the wrong tag when paired equipment is involved."
          );
        }
"""
    new_block = """        if (photoAssistSubject === "nameplate_tag") {
          inspect.push(
            "Confirm model, serial, refrigerant, electrical data, and any internal/paired component relationship.",
            "Check whether the nameplate supports the selected affected component and equipment type."
          );
          verifyNext.push(
            "Use the tag to tighten parts/manuals lookup and confirm the correct system section is being diagnosed."
          );
          repairDecisionEmphasis.push(
            "Use the tag to narrow the repair path to the correct system section before ordering or replacing anything."
          );
          partsToVerifyEmphasis.push(
            "Model-specific OEM part verification",
            "Correct paired-equipment part lookup"
          );
          watchOuts.push(
            "Do not order parts off the wrong tag when paired equipment is involved."
          );
        }
"""
    source = replace_once(source, old_block, new_block, "nameplate emphasis")

    old_block = """        if (photoAssistSubject === "drain_defrost") {
          inspect.push(
            "Look for blocked drains, failed heat, ice build-up, and wiring/sensor issues in the defrost path.",
            "Check whether fan delay, termination, or schedule issues show up in the photo context."
          );
          verifyNext.push(
            "Verify defrost controls, termination, heaters, drain heat, and fan delay before replacing refrigeration parts."
          );
          watchOuts.push(
            "Repeated icing or water issues often come back if the defrost path is not fully checked."
          );
        }
"""
    new_block = """        if (photoAssistSubject === "drain_defrost") {
          inspect.push(
            "Look for blocked drains, failed heat, ice build-up, and wiring/sensor issues in the defrost path.",
            "Check whether fan delay, termination, or schedule issues show up in the photo context."
          );
          verifyNext.push(
            "Verify defrost controls, termination, heaters, drain heat, and fan delay before replacing refrigeration parts."
          );
          repairDecisionEmphasis.push(
            "Lean the repair decision toward the complete defrost path before refrigerant-side replacement."
          );
          partsToVerifyEmphasis.push(
            "Defrost Heater",
            "Defrost Termination",
            "Defrost Control",
            "Drain Heater"
          );
          watchOuts.push(
            "Repeated icing or water issues often come back if the defrost path is not fully checked."
          );
        }
"""
    source = replace_once(source, old_block, new_block, "drain/defrost emphasis")

    old_block = """        if (photoAssistSubject === "dirty_coil_airflow") {
          inspect.push(
            "Look for heavy dirt loading, matted fins, blocked return/supply path, and fan problems.",
            "Check whether the photo supports an airflow-driven complaint."
          );
          verifyNext.push(
            "Verify airflow and cleanliness first, then compare readings before calling charge/feed issues."
          );
          watchOuts.push(
            "Dirty coil / airflow problems can distort pressures, split, box temp, and frost pattern."
          );
        }
"""
    new_block = """        if (photoAssistSubject === "dirty_coil_airflow") {
          inspect.push(
            "Look for heavy dirt loading, matted fins, blocked return/supply path, and fan problems.",
            "Check whether the photo supports an airflow-driven complaint."
          );
          verifyNext.push(
            "Verify airflow and cleanliness first, then compare readings before calling charge/feed issues."
          );
          repairDecisionEmphasis.push(
            "Push the repair path toward airflow correction before refrigerant-side parts replacement."
          );
          partsToVerifyEmphasis.push(
            "Condenser Fan Motor",
            "Evaporator Fan Motor",
            "Blower Motor"
          );
          watchOuts.push(
            "Dirty coil / airflow problems can distort pressures, split, box temp, and frost pattern."
          );
        }
"""
    source = replace_once(source, old_block, new_block, "dirty coil emphasis")

    old_block = """        if (photoAssistSubject === "compressor_section") {
          inspect.push(
            "Look for oil staining, overheated terminals, damaged insulation, and start component condition.",
            "Check whether the compressor area photo suggests electrical failure versus system condition."
          );
          verifyNext.push(
            "Verify voltage, amp draw, start components, and compressor protection before condemning the compressor."
          );
          watchOuts.push(
            "Do not call a compressor from a photo alone. Verify electrically and against system conditions."
          );
        }
"""
    new_block = """        if (photoAssistSubject === "compressor_section") {
          inspect.push(
            "Look for oil staining, overheated terminals, damaged insulation, and start component condition.",
            "Check whether the compressor area photo suggests electrical failure versus system condition."
          );
          verifyNext.push(
            "Verify voltage, amp draw, start components, and compressor protection before condemning the compressor."
          );
          repairDecisionEmphasis.push(
            "Keep the repair decision on electrical and protection verification before calling the compressor."
          );
          partsToVerifyEmphasis.push(
            "Run Capacitor",
            "Contactor",
            "Compressor Protection",
            "Compressor"
          );
          watchOuts.push(
            "Do not call a compressor from a photo alone. Verify electrically and against system conditions."
          );
        }
"""
    source = replace_once(source, old_block, new_block, "compressor emphasis")

    old_block = """        const dedupe = (items: string[]) => {
          const seen = new Set<string>();
          return items.filter((item) => {
            const key = item.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        };

        return {
          summary: summaryParts.join(" "),
          inspect: dedupe(inspect).slice(0, 5),
          verifyNext: dedupe(verifyNext).slice(0, 5),
          watchOuts: dedupe(watchOuts).slice(0, 5),
        };
"""
    new_block = """        const dedupe = (items: string[]) => {
          const seen = new Set<string>();
          return items.filter((item) => {
            const key = item.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        };

        return {
          summary: summaryParts.join(" "),
          inspect: dedupe(inspect).slice(0, 5),
          verifyNext: dedupe(verifyNext).slice(0, 5),
          repairDecisionEmphasis: dedupe(repairDecisionEmphasis).slice(0, 5),
          partsToVerifyEmphasis: dedupe(partsToVerifyEmphasis).slice(0, 5),
          watchOuts: dedupe(watchOuts).slice(0, 5),
        };
"""
    source = replace_once(source, old_block, new_block, "photo assist return payload")

    old_block = """                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>What to Inspect</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.inspect.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>What to Verify Next</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.verifyNext.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>Watch-Outs</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.watchOuts.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
"""
    new_block = """                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>What to Inspect</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.inspect.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>What to Verify Next</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.verifyNext.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>Repair Decision Emphasis</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.repairDecisionEmphasis.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>Parts to Verify Emphasis</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.partsToVerifyEmphasis.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>Watch-Outs</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.watchOuts.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
"""
    source = replace_once(source, old_block, new_block, "photo assist UI columns")

    backup = PAGE.with_name(PAGE.name + ".photo-driven-diagnostic-assist-v2.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
