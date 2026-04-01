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

    if "component-aware-troubleshooting-hints-v1" in source:
        print("Component-aware troubleshooting hints patch already applied.")
        return

    if "component-aware-troubleshooting-helpers-v1" not in source:
        helper_block = """      // component-aware-troubleshooting-helpers-v1
      function getSameComponentHistoryForTroubleshooting() {
        const allEvents = Array.isArray(unitServiceTimeline) ? unitServiceTimeline : [];
        if (systemType === "single") return allEvents;

        const selectedLabel = String(affectedComponentLabel || "").trim();
        if (!selectedLabel) return [];

        return allEvents.filter((event) => {
          const label = String(getAffectedComponentDisplayForEvent(event) || "").trim();
          return label === selectedLabel;
        });
      }

      function getComponentAwareTroubleshootingHints() {
        const componentLabel = String(getCurrentAffectedComponentLabelForAssist() || "").trim().toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const history = getSameComponentHistoryForTroubleshooting();

        const hints: string[] = [];
        const recentFixes = history
          .map((event) => String(event?.actual_fix_performed || "").trim())
          .filter(Boolean);

        const recentCauses = history
          .map((event) => String(event?.final_confirmed_cause || "").trim())
          .filter(Boolean);

        const callbackCount = history.filter((event) => {
          const value = String(event?.callback_occurred || "").trim().toLowerCase();
          return value === "yes" or value == "true"
        });

        hints.push("Verify the call is tied to the correct affected component before changing parts.");

        if (history.length) {
          hints.push(
            `This component has ${history.length} prior service entr${history.length === 1 ? "y" : "ies"} in history.`
          );
        }

        if (callbackCount.length) {
          hints.push(
            `This component has ${callbackCount.length} prior callback entr${callbackCount.length === 1 ? "y" : "ies"}. Slow down and verify root cause before replacing parts.`
          );
        }

        if (recentCauses.length) {
          hints.push(`Recent same-component cause: ${recentCauses[0]}`);
        }

        if (recentFixes.length) {
          hints.push(`Recent same-component fix: ${recentFixes[0]}`);
        }

        if (
          "condensing" in componentLabel or
          "outdoor" in componentLabel or
          "condenser" in componentLabel
        ):
            pass
"""
        # Use JS block below, not Python syntax
        helper_block = """      // component-aware-troubleshooting-helpers-v1
      function getSameComponentHistoryForTroubleshooting() {
        const allEvents = Array.isArray(unitServiceTimeline) ? unitServiceTimeline : [];
        if (systemType === "single") return allEvents;

        const selectedLabel = String(affectedComponentLabel || "").trim();
        if (!selectedLabel) return [];

        return allEvents.filter((event) => {
          const label = String(getAffectedComponentDisplayForEvent(event) || "").trim();
          return label === selectedLabel;
        });
      }

      function getComponentAwareTroubleshootingHints() {
        const componentLabel = String(getCurrentAffectedComponentLabelForAssist() || "").trim().toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const history = getSameComponentHistoryForTroubleshooting();

        const hints: string[] = [];
        const recentFixes = history
          .map((event) => String(event?.actual_fix_performed || "").trim())
          .filter(Boolean);

        const recentCauses = history
          .map((event) => String(event?.final_confirmed_cause || "").trim())
          .filter(Boolean);

        const callbackCount = history.filter((event) => {
          const value = String(event?.callback_occurred || "").trim().toLowerCase();
          return value === "yes" || value === "true";
        }).length;

        hints.push("Verify the call is tied to the correct affected component before changing parts.");

        if (history.length) {
          hints.push(
            `This component has ${history.length} prior service entr${history.length === 1 ? "y" : "ies"} in history.`
          );
        }

        if (callbackCount) {
          hints.push(
            `This component has ${callbackCount} prior callback entr${callbackCount === 1 ? "y" : "ies"}. Slow down and verify root cause before replacing parts.`
          );
        }

        if (recentCauses.length) {
          hints.push(`Recent same-component cause: ${recentCauses[0]}`);
        }

        if (recentFixes.length) {
          hints.push(`Recent same-component fix: ${recentFixes[0]}`);
        }

        if (
          componentLabel.includes("condensing") ||
          componentLabel.includes("outdoor") ||
          componentLabel.includes("condenser")
        ) {
          hints.push(
            "Check line voltage, contactor state, capacitor value, condenser fan operation, and coil condition before condemning the compressor or refrigeration circuit."
          );
          hints.push(
            "If this is a no-cool complaint, verify outdoor section power and fan operation first."
          );
        }

        if (componentLabel.includes("evaporator") || componentLabel.includes("indoor head")) {
          hints.push(
            "Check fan operation, coil condition, drain / ice condition, and any defrost circuit before replacing refrigeration parts."
          );
          hints.push(
            "Read the frost pattern before condemning TXV, charge, or control parts."
          );
        }

        if (componentLabel.includes("furnace")) {
          hints.push(
            "Check call for heat, ignition sequence, safeties, inducer, pressure switch, and flame sense before replacing the board or gas valve."
          );
        }

        if (componentLabel.includes("air handler") || componentLabel.includes("indoor unit")) {
          hints.push(
            "Check blower operation, relay / board output, and drain safety before replacing indoor components."
          );
        }

        if (equipment.includes("walk-in")) {
          hints.push(
            "On walk-ins, verify defrost schedule, termination, fan delay, drain heat, and box conditions before replacing parts."
          );
        }

        if (equipment.includes("ice machine")) {
          hints.push(
            "On ice machines, separate water-side, freeze/harvest sequence, and refrigeration-side issues before replacing components."
          );
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          hints.push(
            "For no-cool complaints, verify power, controls, airflow, and obvious electrical failures before replacing expensive components."
          );
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          hints.push(
            "For icing complaints, check airflow, fan operation, defrost operation, and frost pattern before condemning refrigeration parts."
          );
        }

        if (issue.includes("heat")) {
          hints.push(
            "For heating complaints, verify sequence of operation and safety chain first."
          );
        }

        const seen = new Set<string>();
        return hints.filter((hint) => {
          const key = hint.trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 10);
      }

      function getComponentAwareWarningSignals() {
        const history = getSameComponentHistoryForTroubleshooting();
        const warnings: string[] = [];

        const symptomCounts: Record<string, number> = {};
        for (const event of history) {
          const symptomValue = String(event?.symptom || "").trim();
          if (!symptomValue) continue;
          const key = symptomValue.toLowerCase();
          symptomCounts[key] = (symptomCounts[key] || 0) + 1;
        }

        Object.entries(symptomCounts).forEach(([symptomValue, count]) => {
          if (count >= 2) {
            warnings.push(`Repeat symptom on this component: "${symptomValue}" (${count} times)`);
          }
        });

        const callbackCount = history.filter((event) => {
          const value = String(event?.callback_occurred || "").trim().toLowerCase();
          return value === "yes" || value === "true";
        }).length;

        if (callbackCount >= 1) {
          warnings.push(`Callback history on this component: ${callbackCount}`);
        }

        const recentParts = getRecentSameComponentPartsForAssist();
        if (recentParts.length >= 2) {
          warnings.push(`Multiple prior parts tied to this component: ${recentParts.join(" • ")}`);
        }

        return warnings.slice(0, 6);
      }

"""
        source = insert_before_once(
            source,
            'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
            helper_block,
            "component-aware troubleshooting helpers",
        )

    ui_block = """      {/* component-aware-troubleshooting-hints-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Component-Aware Troubleshooting Hints">
          <SmallHint>
            Uses the selected affected component, same-component history, callbacks, and current symptom
            to point you toward the next checks for this exact part of the system.
          </SmallHint>

          {(() => {
            const componentLabel = getCurrentAffectedComponentLabelForAssist();
            const hints = getComponentAwareTroubleshootingHints();
            const warningSignals = getComponentAwareWarningSignals();
            const sameComponentHistory = getSameComponentHistoryForTroubleshooting();

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
                      Troubleshooting Target
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{componentLabel || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Same-Component History
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{sameComponentHistory.length}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Symptom
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{symptom || "—"}</div>
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
                    Select an affected component to tighten the troubleshooting hints for this system.
                  </div>
                ) : null}

                {warningSignals.length ? (
                  <div
                    style={{
                      border: "1px solid #f0c36d",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fff8e8",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>Warning Signals</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {warningSignals.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                  <div style={{ fontWeight: 900 }}>What to Check Next on This Component</div>
                  <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                    {hints.map((item, idx) => (
                      <li key={idx}>
                        <SmallHint>{item}</SmallHint>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

"""

    source = insert_before_once(
        source,
        '{/* component-aware-parts-manuals-v1 */}',
        ui_block,
        "component-aware troubleshooting UI anchor",
    )

    backup = PAGE.with_name(PAGE.name + ".component-aware-troubleshooting-hints.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()