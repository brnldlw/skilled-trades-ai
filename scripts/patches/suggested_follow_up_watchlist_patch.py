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

    if "suggested-follow-up-watchlist-v1" in source:
        print("Suggested Follow-Up Watchlist patch already applied.")
        return

    helper_block = """      // suggested-follow-up-watchlist-v1
      const [followUpWatchlistMessage, setFollowUpWatchlistMessage] = useState("");

      function buildSuggestedFollowUpWatchlist() {
        const checklist = buildPartVerificationChecklistItems();
        const selectedPart = String(checklist.selectedPart || selectedVerificationPart || "").trim();
        const selectedOutcome = String(selectedVerificationOutcome || "").trim();
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const issue = String(symptom || "").trim().toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const note = String(verificationOutcomeNote || "").trim();

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

        const boxTemp = getObservationValue(
          observations,
          (l) => l.includes("box temp"),
          "°F"
        );

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const watchNext: string[] = [];
        const callbackRisk: string[] = [];
        const recheckItems: string[] = [];
        const monitoringNote: string[] = [];

        const addUnique = (items: string[], value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!items.some((item) => item.trim().toLowerCase() === clean.toLowerCase())) {
            items.push(clean);
          }
        };

        addUnique(watchNext, `Selected part path: ${selectedPart || "No part selected yet"}.`);
        addUnique(watchNext, `Target component: ${targetComponent}.`);

        if (selectedOutcome) {
          addUnique(monitoringNote, `Verification outcome: ${selectedOutcome}.`);
        }

        const partLower = selectedPart.toLowerCase();

        if (partLower.includes("contactor")) {
          addUnique(watchNext, "Watch compressor and condenser fan operation after the call is satisfied.");
          addUnique(recheckItems, "Recheck line/load voltage and contact drop under load.");
          addUnique(recheckItems, "Inspect wire heat damage and lug tightness after operation.");
          addUnique(callbackRisk, "A new contactor can fail again if the real issue is motor/compressor load or wire heat.");
        }

        if (partLower.includes("capacitor")) {
          addUnique(watchNext, "Watch the motor/compressor start and run behavior after startup.");
          addUnique(recheckItems, "Recheck actual µF if symptoms return.");
          addUnique(recheckItems, "Compare connected motor/compressor amp draw after the repair.");
          addUnique(callbackRisk, "Capacitors often fail again when the attached motor/compressor is weak.");
        }

        if (partLower.includes("condenser fan motor")) {
          addUnique(watchNext, "Watch head pressure trend and condenser airflow after repair.");
          addUnique(recheckItems, "Recheck fan rotation, amp draw, and coil cleanliness.");
          if (headPressure !== null && ambientTemp !== null) {
            addUnique(monitoringNote, `Head/ambient context at diagnosis: ${headPressure} psi head with ${ambientTemp}°F ambient.`);
          }
          addUnique(callbackRisk, "Outdoor airflow callbacks happen when coil condition or voltage issues are missed.");
        }

        if (partLower.includes("evaporator fan motor")) {
          addUnique(watchNext, "Watch airflow, frost return, and drain condition after operation.");
          addUnique(recheckItems, "Recheck fan operation and airflow path after the box or space pulls down.");
          if (deltaT !== null) {
            addUnique(monitoringNote, `Air split context at diagnosis: ${deltaT}°F.`);
          }
          addUnique(callbackRisk, "Fan-related callbacks happen when the real issue is still defrost, drain, or blocked airflow.");
        }

        if (partLower.includes("defrost heater")) {
          addUnique(watchNext, "Watch the next full defrost cycle and confirm the ice pattern does not return.");
          addUnique(recheckItems, "Recheck termination, control output, and drain path.");
          if (boxTemp !== null) {
            addUnique(monitoringNote, `Box temperature context: ${boxTemp}°F.`);
          }
          addUnique(callbackRisk, "Heater replacement alone may not solve the call if termination/control logic is wrong.");
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          addUnique(watchNext, "Watch the next timed/initiated defrost and confirm heater/fan sequence.");
          addUnique(recheckItems, "Recheck fan delay, termination state, and drain heat path.");
          addUnique(callbackRisk, "Defrost callbacks happen when timing logic is not verified against actual ice pattern.");
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          addUnique(watchNext, "Watch superheat/subcool trend and frost pattern after the system stabilizes.");
          addUnique(recheckItems, "Recheck airflow and restriction path before assuming the feed path is fixed.");
          if (superheat !== null && subcool !== null) {
            addUnique(monitoringNote, `SH/SC context at diagnosis: SH ${superheat}°F, SC ${subcool}°F.`);
          }
          addUnique(callbackRisk, "Metering-device callbacks happen when airflow or restriction was the real cause.");
        }

        if (partLower.includes("blower motor")) {
          addUnique(watchNext, "Watch airflow, split, and drain safety behavior after the repair.");
          addUnique(recheckItems, "Recheck amp draw, wheel condition, and board/relay output.");
          if (deltaT !== null) {
            addUnique(monitoringNote, `Air split context at diagnosis: ${deltaT}°F.`);
          }
          addUnique(callbackRisk, "Blower callbacks happen when the true issue is control output or drain interruption.");
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          addUnique(watchNext, "Watch drain flow and whether the control interruption returns.");
          addUnique(recheckItems, "Recheck actual drain condition and switch state.");
          addUnique(callbackRisk, "Drain safety callbacks happen when the water problem was not corrected.");
        }

        if (partLower.includes("ignitor")) {
          addUnique(watchNext, "Watch the next heat cycle through ignition and flame prove.");
          addUnique(recheckItems, "Recheck board output and full heat sequence if symptoms return.");
          addUnique(callbackRisk, "Ignition callbacks happen when the full safety chain is not checked.");
        }

        if (partLower.includes("flame sensor")) {
          addUnique(watchNext, "Watch flame proving through multiple heat cycles.");
          addUnique(recheckItems, "Recheck flame signal, burner carryover, and ignition quality.");
          addUnique(callbackRisk, "Flame-sense callbacks happen when ignition quality or grounding is still weak.");
        }

        if (partLower.includes("pressure switch")) {
          addUnique(watchNext, "Watch the next full heat call and confirm pressure-proving stays stable.");
          addUnique(recheckItems, "Recheck inducer operation, tubing, venting, and condensate path.");
          addUnique(callbackRisk, "Pressure-switch callbacks happen when draft or drain issues were not corrected.");
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          addUnique(watchNext, "Watch the next full sequence and confirm water-side timing stays correct.");
          addUnique(recheckItems, "Recheck component response during the expected cycle.");
          addUnique(callbackRisk, "Sequence callbacks happen when the wrong side of the system was blamed.");
        }

        if (equipment.includes("walk-in")) {
          addUnique(watchNext, "Watch actual box pull-down and next defrost cycle.");
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addUnique(watchNext, "Watch for return ice pattern, drain issues, and airflow drop after the repair.");
          addUnique(callbackRisk, "Freeze-up complaints often return if airflow/defrost/feed verification was incomplete.");
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          addUnique(watchNext, "Watch temperature pull-down and whether the full call completes normally.");
        }

        if (selectedOutcome === "Tested good") {
          addUnique(monitoringNote, "Selected part tested good, so watch the stronger alternate path instead of replacing this part.");
        }

        if (selectedOutcome === "Needs more testing") {
          addUnique(monitoringNote, "More testing is still needed before committing the repair path.");
        }

        if (note) {
          addUnique(monitoringNote, `Tech note: ${note}`);
        }

        if (!watchNext.length) {
          addUnique(watchNext, "Watch system operation after the repair path is verified.");
        }

        if (!recheckItems.length) {
          addUnique(recheckItems, "Recheck the strongest measurement and sequence item tied to the selected part.");
        }

        if (!callbackRisk.length) {
          addUnique(callbackRisk, "Blind replacement without proving the full path is the main callback risk.");
        }

        return {
          selectedPart,
          selectedOutcome,
          watchNext: watchNext.slice(0, 5),
          callbackRisk: callbackRisk.slice(0, 4),
          recheckItems: recheckItems.slice(0, 5),
          monitoringNote: monitoringNote.slice(0, 4),
        };
      }

      function applySuggestedFollowUpWatchlist() {
        const payload = buildSuggestedFollowUpWatchlist();

        const text = [
          "Suggested Follow-Up Watchlist",
          payload.selectedPart ? `Part: ${payload.selectedPart}` : "",
          payload.selectedOutcome ? `Outcome: ${payload.selectedOutcome}` : "",
          payload.watchNext.length ? "Watch Next:\\n- " + payload.watchNext.join("\\n- ") : "",
          payload.recheckItems.length ? "Recheck Items:\\n- " + payload.recheckItems.join("\\n- ") : "",
          payload.callbackRisk.length ? "Callback Risk:\\n- " + payload.callbackRisk.join("\\n- ") : "",
          payload.monitoringNote.length ? "Monitoring Notes:\\n- " + payload.monitoringNote.join("\\n- ") : "",
        ]
          .filter(Boolean)
          .join("\\n\\n");

        setDiagnosticCloseoutDrafts((prev) => ({
          ...prev,
          followUp: [String(prev.followUp || "").trim(), text].filter(Boolean).join("\\n\\n"),
        }));

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), text].filter(Boolean).join("\\n\\n")
        );

        setFollowUpWatchlistMessage("Suggested watchlist added to Follow-Up and Tech Closeout Notes.");
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "follow-up watchlist helpers",
    )

    ui_block = """      {/* suggested-follow-up-watchlist-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Suggested Follow-Up Watchlist">
          <SmallHint>
            Builds a watchlist from the verified repair path so the tech knows what to monitor next and what may still trigger a callback.
          </SmallHint>

          {(() => {
            const payload = buildSuggestedFollowUpWatchlist();

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
                      {payload.selectedPart || "Choose a part in Part Verification Checklist"}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Verification Outcome
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {payload.selectedOutcome || "Choose an outcome in Verification Outcome + Repair Commit"}
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
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Watch Next</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.watchNext.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Recheck Items</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.recheckItems.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Callback Risk</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.callbackRisk.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Monitoring Notes</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.monitoringNote.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={applySuggestedFollowUpWatchlist}
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
                    Add Watchlist to Follow-Up + Tech Notes
                  </button>
                </div>

                {followUpWatchlistMessage ? (
                  <SmallHint>
                    <b>Watchlist:</b> {followUpWatchlistMessage}
                  </SmallHint>
                ) : null}
              </div>
            );
          })()}
        </SectionCard>
      </div>

"""
    source = insert_before_once(
        source,
        '{/* verification-outcome-repair-commit-v1 */}',
        ui_block,
        "follow-up watchlist UI",
    )

    backup = PAGE.with_name(PAGE.name + ".suggested-follow-up-watchlist-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
