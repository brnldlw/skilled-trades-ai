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

    if "diagnostic-closeout-builder-v1" in source:
        print("Diagnostic closeout builder patch already applied.")
        return

    helper_block = """      // diagnostic-closeout-builder-v1
      const [diagnosticCloseoutDrafts, setDiagnosticCloseoutDrafts] = useState({
        customerSummary: "",
        internalSummary: "",
        followUp: "",
      });
      const [diagnosticCloseoutMessage, setDiagnosticCloseoutMessage] = useState("");

      function buildCloseoutReadingsSummary() {
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

        const boxTemp = getObservationValue(
          observations,
          (l) => l.includes("box temp"),
          "°F"
        );

        const parts: string[] = [];

        if (suctionPressure !== null) parts.push(`Suction ${suctionPressure} psi`);
        if (headPressure !== null) parts.push(`Head ${headPressure} psi`);
        if (chargeAnalysis?.superheat !== null) parts.push(`SH ${chargeAnalysis.superheat}°F`);
        if (chargeAnalysis?.subcool !== null) parts.push(`SC ${chargeAnalysis.subcool}°F`);
        if (returnAirTemp !== null) parts.push(`Return ${returnAirTemp}°F`);
        if (supplyAirTemp !== null) parts.push(`Supply ${supplyAirTemp}°F`);
        if (boxTemp !== null) parts.push(`Box ${boxTemp}°F`);

        return parts.join(" • ");
      }

      function buildDiagnosticCloseoutDrafts() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const cause = String(finalConfirmedCause || "").trim();
        const fix = String(actualFixPerformed || "").trim();
        const currentSymptom = String(symptom || "").trim();
        const outcome = String(outcomeStatus || "Not Set").trim();
        const callback = String(callbackOccurred || "No").trim();
        const recentHistoryCount = getSameComponentHistoryForTroubleshooting().length;
        const warnings = getComponentAwareWarningSignals().slice(0, 2);
        const readingsSummary = buildCloseoutReadingsSummary();
        const siteLabel = String(siteName || siteAddress || customerName || "this site").trim();
        const followUpItems: string[] = [];

        if (callback.lower if False else False):
            pass
"""
    # clean JS block follows
    helper_block = """      // diagnostic-closeout-builder-v1
      const [diagnosticCloseoutDrafts, setDiagnosticCloseoutDrafts] = useState({
        customerSummary: "",
        internalSummary: "",
        followUp: "",
      });
      const [diagnosticCloseoutMessage, setDiagnosticCloseoutMessage] = useState("");

      function buildCloseoutReadingsSummary() {
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

        const boxTemp = getObservationValue(
          observations,
          (l) => l.includes("box temp"),
          "°F"
        );

        const parts: string[] = [];

        if (suctionPressure !== null) parts.push(`Suction ${suctionPressure} psi`);
        if (headPressure !== null) parts.push(`Head ${headPressure} psi`);
        if (chargeAnalysis?.superheat !== null) parts.push(`SH ${chargeAnalysis.superheat}°F`);
        if (chargeAnalysis?.subcool !== null) parts.push(`SC ${chargeAnalysis.subcool}°F`);
        if (returnAirTemp !== null) parts.push(`Return ${returnAirTemp}°F`);
        if (supplyAirTemp !== null) parts.push(`Supply ${supplyAirTemp}°F`);
        if (boxTemp !== null) parts.push(`Box ${boxTemp}°F`);

        return parts.join(" • ");
      }

      function buildDiagnosticCloseoutDrafts() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const cause = String(finalConfirmedCause || "").trim();
        const fix = String(actualFixPerformed || "").trim();
        const currentSymptom = String(symptom || "").trim();
        const outcome = String(outcomeStatus || "Not Set").trim();
        const callback = String(callbackOccurred || "No").trim();
        const recentHistoryCount = getSameComponentHistoryForTroubleshooting().length;
        const warnings = getComponentAwareWarningSignals().slice(0, 2);
        const readingsSummary = buildCloseoutReadingsSummary();
        const siteLabel = String(siteName || siteAddress || customerName || "this site").trim();
        const followUpItems: string[] = [];

        if (callback.toLowerCase() === "yes") {
          followUpItems.push("Watch closely for callback risk because this issue has repeated.");
        }

        if (recentHistoryCount > 0) {
          followUpItems.push(
            `This component has ${recentHistoryCount} prior same-component event${recentHistoryCount === 1 ? "" : "s"} in history.`
          );
        }

        if (warnings.length) {
          followUpItems.push(...warnings);
        }

        if (outcome && outcome !== "Not Set") {
          followUpItems.push(`Current outcome status: ${outcome}.`);
        }

        if (!followUpItems.length) {
          followUpItems.push("No immediate follow-up flags were identified from the current call data.");
        }

        const customerSummaryLines = [
          `At ${siteLabel}, the reported issue was ${currentSymptom || "an equipment problem"} on ${targetComponent}.`,
          cause
            ? `The likely confirmed cause was ${cause}.`
            : "A confirmed cause has not been documented yet.",
          fix
            ? `Work performed: ${fix}.`
            : "A final repair action has not been documented yet.",
          outcome && outcome !== "Not Set"
            ? `Current system status: ${outcome}.`
            : "",
          readingsSummary ? `Key field readings: ${readingsSummary}.` : "",
        ].filter(Boolean);

        const internalSummaryLines = [
          `Affected component: ${targetComponent}`,
          currentSymptom ? `Complaint/symptom: ${currentSymptom}` : "",
          cause ? `Confirmed cause: ${cause}` : "Confirmed cause: not documented",
          fix ? `Actual fix: ${fix}` : "Actual fix: not documented",
          readingsSummary ? `Key readings: ${readingsSummary}` : "",
          outcome && outcome !== "Not Set" ? `Outcome: ${outcome}` : "",
          callback ? `Callback flag: ${callback}` : "",
          recentHistoryCount
            ? `Same-component history count: ${recentHistoryCount}`
            : "",
        ].filter(Boolean);

        const followUpLines = followUpItems.map((item) => `- ${item}`);

        setDiagnosticCloseoutDrafts({
          customerSummary: customerSummaryLines.join(" "),
          internalSummary: internalSummaryLines.join("\n"),
          followUp: followUpLines.join("\n"),
        });

        setDiagnosticCloseoutMessage("Closeout drafts generated.");
      }

      async function copyDiagnosticCloseoutText(
        key: "customerSummary" | "internalSummary" | "followUp"
      ) {
        const value = diagnosticCloseoutDrafts[key];
        if (!value.trim()) {
          setDiagnosticCloseoutMessage("Generate the closeout drafts first.");
          return;
        }

        try {
          await navigator.clipboard.writeText(value);
          setDiagnosticCloseoutMessage("Copied to clipboard.");
        } catch (err) {
          console.error("COPY DIAGNOSTIC CLOSEOUT FAILED", err);
          setDiagnosticCloseoutMessage("Could not copy to clipboard.");
        }
      }

      function pushInternalSummaryToTechCloseoutNotes() {
        const internalSummary = diagnosticCloseoutDrafts.internalSummary.trim();
        if (!internalSummary) {
          setDiagnosticCloseoutMessage("Generate the closeout drafts first.");
          return;
        }

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), internalSummary].filter(Boolean).join("\n\n")
        );
        setDiagnosticCloseoutMessage("Internal summary added to Tech Closeout Notes.");
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "diagnostic closeout helper insert",
    )

    ui_block = """          {/* diagnostic-closeout-builder-v1 */}
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
              One-Tap Diagnostic Closeout Builder
            </div>

            <SmallHint>
              Builds a customer-friendly explanation, an internal tech summary, and a follow-up note from the current call data.
            </SmallHint>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={buildDiagnosticCloseoutDrafts}
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
                Generate Closeout Drafts
              </button>

              <button
                type="button"
                onClick={pushInternalSummaryToTechCloseoutNotes}
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
                Add Internal Summary to Tech Notes
              </button>
            </div>

            {diagnosticCloseoutMessage ? (
              <SmallHint>
                <b>Closeout Builder:</b> {diagnosticCloseoutMessage}
              </SmallHint>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 900 }}>Customer Summary</div>
                <textarea
                  value={diagnosticCloseoutDrafts.customerSummary}
                  onChange={(e) =>
                    setDiagnosticCloseoutDrafts((prev) => ({
                      ...prev,
                      customerSummary: e.target.value,
                    }))
                  }
                  rows={8}
                  style={{ width: "100%", padding: 8 }}
                />
                <button
                  type="button"
                  onClick={() => void copyDiagnosticCloseoutText("customerSummary")}
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
                  Copy Customer Summary
                </button>
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 900 }}>Internal Tech Summary</div>
                <textarea
                  value={diagnosticCloseoutDrafts.internalSummary}
                  onChange={(e) =>
                    setDiagnosticCloseoutDrafts((prev) => ({
                      ...prev,
                      internalSummary: e.target.value,
                    }))
                  }
                  rows={8}
                  style={{ width: "100%", padding: 8 }}
                />
                <button
                  type="button"
                  onClick={() => void copyDiagnosticCloseoutText("internalSummary")}
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
                  Copy Internal Summary
                </button>
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 900 }}>Recommended Follow-Up</div>
                <textarea
                  value={diagnosticCloseoutDrafts.followUp}
                  onChange={(e) =>
                    setDiagnosticCloseoutDrafts((prev) => ({
                      ...prev,
                      followUp: e.target.value,
                    }))
                  }
                  rows={8}
                  style={{ width: "100%", padding: 8 }}
                />
                <button
                  type="button"
                  onClick={() => void copyDiagnosticCloseoutText("followUp")}
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
                  Copy Follow-Up
                </button>
              </div>
            </div>
          </div>

"""
    source = insert_before_once(
        source,
        '<label style={{ fontWeight: 900 }}>Tech Closeout Notes</label>',
        ui_block,
        "diagnostic closeout UI insert",
    )

    backup = PAGE.with_name(PAGE.name + ".diagnostic-closeout-builder.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
