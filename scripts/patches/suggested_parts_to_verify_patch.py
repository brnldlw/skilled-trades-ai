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

    if "suggested-parts-to-verify-v1" in source:
        print("Suggested Parts to Verify patch already applied.")
        return

    helper_block = """      // suggested-parts-to-verify-v1
      function buildSuggestedPartsToVerifyItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const decisions = buildRepairDecisionPanelItems();

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

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const items = decisions.map((decision) => {
          let score = 1;
          const reasons: string[] = [];
          const prove: string[] = [];
          const partLower = decision.part.toLowerCase();

          reasons.push(`Target component: ${targetComponent}`);
          if (issue) reasons.push(`Current symptom: ${issue}`);

          prove.push(decision.verifyFirst);

          if (sameComponentHistory.length) {
            score += 1;
            reasons.push(
              `${sameComponentHistory.length} prior same-component event${sameComponentHistory.length === 1 ? "" : "s"}`
            );
          }

          if (
            partLower.includes("contactor") &&
            (targetComponent.toLowerCase().includes("condensing") ||
              targetComponent.toLowerCase().includes("outdoor") ||
              issue.includes("no cool") ||
              issue.includes("not cooling"))
          ) {
            score += 2;
            reasons.push("Outdoor / no-cool electrical path matches this part");
          }

          if (
            (partLower.includes("capacitor") || partLower.includes("run capacitor")) &&
            targetComponent.toLowerCase().includes("condensing")
          ) {
            score += 2;
            reasons.push("Condensing-side start/run failure pattern matches capacitor verification");
          }

          if (
            (partLower.includes("fan motor") || partLower.includes("blower motor")) &&
            ((deltaT !== null && deltaT < 14) ||
              issue.includes("ice") ||
              issue.includes("icing") ||
              issue.includes("freeze"))
          ) {
            score += 2;
            reasons.push("Airflow / freeze pattern says motor verification is important");
          }

          if (
            (partLower.includes("defrost") || partLower.includes("drain heater")) &&
            (issue.includes("ice") || issue.includes("icing") || issue.includes("freeze"))
          ) {
            score += 2;
            reasons.push("Freeze-up complaint supports defrost-path verification");
          }

          if (
            (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) &&
            superheat !== null &&
            subcool !== null &&
            ((superheat > 18 && subcool < 5) || (superheat > 18 && subcool > 15))
          ) {
            score += 2;
            reasons.push("Readings pattern supports feed / restriction verification");
          }

          if (
            partLower.includes("condenser fan motor") &&
            headPressure !== null &&
            ambientTemp !== null &&
            headPressure > ambientTemp * 3.2
          ) {
            score += 2;
            reasons.push("High head relative to ambient supports heat-rejection checks");
          }

          if (
            (partLower.includes("float switch") || partLower.includes("drain")) &&
            targetComponent.toLowerCase().includes("air handler")
          ) {
            score += 1;
            reasons.push("Indoor unit / drain safety path is in play");
          }

          if (
            (partLower.includes("ignitor") ||
              partLower.includes("flame sensor") ||
              partLower.includes("pressure switch")) &&
            targetComponent.toLowerCase().includes("furnace")
          ) {
            score += 2;
            reasons.push("Heating sequence path supports this verification");
          }

          let confidence = "Verify first";
          if (score >= 4) confidence = "High confidence";
          if (score <= 1) confidence = "Low confidence / callback risk";

          if (confidence === "High confidence") {
            prove.push("Prove this with meter/sequence/readings before replacing, but it is strongly in play.");
          } else if (confidence === "Verify first") {
            prove.push("This is in play, but the system still needs verification before a blind swap.");
          } else {
            prove.push("Do not replace this blindly unless you eliminate the stronger paths first.");
          }

          const seenReasons = new Set<string>();
          const dedupedReasons = reasons.filter((reason) => {
            const key = reason.trim().toLowerCase();
            if (!key || seenReasons.has(key)) return false;
            seenReasons.add(key);
            return true;
          });

          const seenProve = new Set<string>();
          const dedupedProve = prove.filter((entry) => {
            const key = entry.trim().toLowerCase();
            if (!key || seenProve.has(key)) return false;
            seenProve.add(key);
            return true;
          });

          return {
            part: decision.part,
            confidence,
            reasons: dedupedReasons.slice(0, 3),
            prove: dedupedProve.slice(0, 3),
            blindRisk: decision.blindRisk,
            score,
          };
        });

        return items.sort((a, b) => b.score - a.score || a.part.localeCompare(b.part)).slice(0, 6);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "suggested parts helpers",
    )

    ui_block = """      {/* suggested-parts-to-verify-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Suggested Parts to Verify Before Replacing">
          <SmallHint>
            Ranks suggested parts by confidence so the tech can verify the strongest repair path before making a blind swap.
          </SmallHint>

          {(() => {
            const items = buildSuggestedPartsToVerifyItems();

            if (!items.length) {
              return (
                <div style={{ marginTop: 12 }}>
                  <SmallHint>No suggested parts are ready yet. Add component, symptom, or readings to tighten the list.</SmallHint>
                </div>
              );
            }

            return (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                {items.map((item, idx) => (
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
                        Part {idx + 1}: {item.part}
                      </div>

                      <div
                        style={{
                          border: "1px solid #d9d9d9",
                          borderRadius: 999,
                          padding: "4px 10px",
                          fontSize: 12,
                          fontWeight: 800,
                          background:
                            item.confidence === "High confidence"
                              ? "#eef6ff"
                              : item.confidence === "Verify first"
                                ? "#fff8e8"
                                : "#fff1f1",
                        }}
                      >
                        {item.confidence}
                      </div>
                    </div>

                    <div>
                      <SmallHint><b>Why this part is in play:</b></SmallHint>
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {item.reasons.map((reason, reasonIdx) => (
                          <li key={reasonIdx}>
                            <SmallHint>{reason}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <SmallHint><b>Prove before replacing:</b></SmallHint>
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {item.prove.map((entry, proveIdx) => (
                          <li key={proveIdx}>
                            <SmallHint>{entry}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <SmallHint><b>Blind replace risk:</b> {item.blindRisk}</SmallHint>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() =>
                          setPartsReplaced((prev) => {
                            const current = String(prev || "").trim();
                            const existing = current
                              .split(/[;,]/)
                              .map((entry) => entry.trim().toLowerCase())
                              .filter(Boolean);

                            if (existing.includes(item.part.trim().toLowerCase())) {
                              return current;
                            }

                            return [current, item.part].filter(Boolean).join(", ");
                          })
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
                  </div>
                ))}
              </div>
            );
          })()}
        </SectionCard>
      </div>

"""
    source = insert_before_once(
        source,
        '{/* repair-decision-panel-v2 */}',
        ui_block,
        "suggested parts UI",
    )

    backup = PAGE.with_name(PAGE.name + ".suggested-parts-to-verify-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
