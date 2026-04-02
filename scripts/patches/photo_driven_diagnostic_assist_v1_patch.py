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

    if "photo-driven-diagnostic-assist-v1" in source:
        print("Photo-Driven Diagnostic Assist v1 already applied.")
        return

    helper_block = """      // photo-driven-diagnostic-assist-v1
      const [photoAssistSubject, setPhotoAssistSubject] = useState("iced_coil");
      const [photoAssistMessage, setPhotoAssistMessage] = useState("");

      function buildPhotoDrivenDiagnosticAssistPayload() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLabelLower = targetComponent.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const warnings = getComponentAwareWarningSignals().slice(0, 3);
        const photoCount = Array.isArray(serviceEventPhotoUrls) ? serviceEventPhotoUrls.length : 0;

        const inspect: string[] = [];
        const verifyNext: string[] = [];
        const watchOuts: string[] = [];
        const summaryParts: string[] = [];

        summaryParts.push(
          `${photoCount ? `${photoCount} photo${photoCount === 1 ? "" : "s"} attached` : "No photos attached yet"}.`
        );
        summaryParts.push(`Target component: ${targetComponent}.`);

        if (sameComponentHistory.length) {
          summaryParts.push(
            `This component has ${sameComponentHistory.length} prior same-component event${sameComponentHistory.length === 1 ? "" : "s"} in history.`
          );
        }

        if (photoAssistSubject === "iced_coil") {
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

        if (photoAssistSubject === "contactor_capacitor") {
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

        if (photoAssistSubject === "control_board") {
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

        if (photoAssistSubject === "wiring") {
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

        if (photoAssistSubject === "nameplate_tag") {
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

        if (photoAssistSubject === "drain_defrost") {
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

        if (photoAssistSubject === "dirty_coil_airflow") {
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

        if (photoAssistSubject === "compressor_section") {
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

        if (issue.includes("ice") || issue.includes("icing") || issue.includes("freeze")) {
          verifyNext.push(
            "Because the complaint involves icing/freezing, compare the photo with fan operation, airflow, drain condition, and defrost behavior."
          );
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          verifyNext.push(
            "Because this is a no-cool complaint, use the photo to support or eliminate electrical, airflow, and heat-rejection issues before major part replacement."
          );
        }

        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          verifyNext.push(
            "Outdoor/condensing-side photos should be tied back to contactor, capacitor, fan, coil, and heat rejection checks first."
          );
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          verifyNext.push(
            "Evaporator/indoor-side photos should be tied back to fan, ice pattern, drain, airflow, and defrost/feed checks first."
          );
        }

        if (equipment.includes("walk-in")) {
          verifyNext.push(
            "For walk-ins, compare the photo against actual box temp, defrost schedule, door openings, and load."
          );
        }

        for (const warning of warnings) {
          watchOuts.push(warning);
        }

        const dedupe = (items: string[]) => {
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
      }

      function generatePhotoDrivenDiagnosticAssist() {
        const payload = buildPhotoDrivenDiagnosticAssistPayload();
        if (!payload.inspect.length && !payload.verifyNext.length && !payload.watchOuts.length) {
          setPhotoAssistMessage("No photo assist guidance was generated.");
          return;
        }
        setPhotoAssistMessage("Photo diagnostic assist refreshed.");
      }

      function addPhotoAssistToTechCloseoutNotes() {
        const payload = buildPhotoDrivenDiagnosticAssistPayload();
        const text = [
          "Photo Diagnostic Assist",
          payload.summary,
          payload.inspect.length ? "Inspect:\n- " + payload.inspect.join("\n- ") : "",
          payload.verifyNext.length ? "Verify Next:\n- " + payload.verifyNext.join("\n- ") : "",
          payload.watchOuts.length ? "Watch-Outs:\n- " + payload.watchOuts.join("\n- ") : "",
        ]
          .filter(Boolean)
          .join("\\n\\n");

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), text].filter(Boolean).join("\\n\\n")
        );
        setPhotoAssistMessage("Photo assist added to Tech Closeout Notes.");
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "photo assist helpers",
    )

    ui_block = """          {/* photo-driven-diagnostic-assist-v1 */}
          <div
            style={{
              marginTop: 12,
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 12,
              background: "#fafafa",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              Photo-Driven Diagnostic Assist
            </div>

            <SmallHint>
              Choose what the photo is of and the app will turn the current component, symptom, and history into practical inspection guidance.
            </SmallHint>

            {(() => {
              const payload = buildPhotoDrivenDiagnosticAssistPayload();

              return (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Attached Service Event Photos
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        {Array.isArray(serviceEventPhotoUrls) ? serviceEventPhotoUrls.length : 0}
                      </div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Target Component
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        {getCurrentAffectedComponentLabelForAssist() || "Primary component"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontWeight: 900 }}>What is this photo of?</label>
                    <select
                      value={photoAssistSubject}
                      onChange={(e) => setPhotoAssistSubject(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    >
                      <option value="iced_coil">Iced coil / frost pattern</option>
                      <option value="contactor_capacitor">Contactor / capacitor</option>
                      <option value="control_board">Control board</option>
                      <option value="wiring">Wiring</option>
                      <option value="nameplate_tag">Nameplate / tag</option>
                      <option value="drain_defrost">Drain / defrost issue</option>
                      <option value="dirty_coil_airflow">Dirty coil / airflow issue</option>
                      <option value="compressor_section">Compressor section</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={generatePhotoDrivenDiagnosticAssist}
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
                      Refresh Photo Assist
                    </button>

                    <button
                      type="button"
                      onClick={addPhotoAssistToTechCloseoutNotes}
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
                      Add Photo Assist to Tech Notes
                    </button>
                  </div>

                  {photoAssistMessage ? (
                    <SmallHint>
                      <b>Photo Assist:</b> {photoAssistMessage}
                    </SmallHint>
                  ) : null}

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <SmallHint>{payload.summary}</SmallHint>
                  </div>

                  <div
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
                </>
              );
            })()}
          </div>

"""
    source = insert_before_once(
        source,
        '<label style={{ fontWeight: 900 }}>Tech Closeout Notes</label>',
        ui_block,
        "photo assist UI insert",
    )

    backup = PAGE.with_name(PAGE.name + ".photo-driven-diagnostic-assist-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
