from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "guided-next-test-engine-v1" in source and "showFailureDashboard" in source:
        print("Guided next-test engine / dashboard toggle patch already applied.")
        return

    helper_block = """      // guided-next-test-engine-v1
      const [showFailureDashboard, setShowFailureDashboard] = useState(false);

      function buildGuidedNextTests() {
        const componentLabel = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLabelLower = componentLabel.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const recentParts = getRecentSameComponentPartsForAssist();
        const recentFix = getMostRecentSameComponentFixForAssist();
        const tests: Array<{
          title: string;
          tool: string;
          why: string;
          how: string;
        }> = [];

        tests.push({
          title: "Confirm the target component and actual call",
          tool: "Visual check + meter",
          why: "Do not chase the wrong section of the system.",
          how:
            "Verify the selected affected component, confirm the control call is present, and check disconnect / breaker / fuse / board output before deeper diagnosis.",
        });

        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          tests.push({
            title: "Verify outdoor electrical operation first",
            tool: "Meter + capacitor tester",
            why: "A lot of no-cool calls die right here.",
            how:
              "Check line voltage, contactor pull-in, capacitor value, condenser fan operation, and obvious coil fouling before condemning compressor or charge.",
          });

          tests.push({
            title: "Check heat rejection before refrigerant diagnosis",
            tool: "Visual + gauges",
            why: "Bad airflow and dirty coils distort the readings.",
            how:
              "Verify condenser airflow, fan direction, coil cleanliness, and ambient conditions before trusting head pressure conclusions.",
          });
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          tests.push({
            title: "Check fan / ice / drain condition first",
            tool: "Visual + amp check",
            why: "Evap-side airflow and frost issues cause a lot of false TXV / charge calls.",
            how:
              "Check fan operation, blade condition, drain condition, ice pattern, and any defrost circuit before replacing refrigeration parts.",
          });

          tests.push({
            title: "Read the frost pattern before changing parts",
            tool: "Visual + gauges / temperatures",
            why: "The frost pattern tells you whether this is airflow, feed, or defrost related.",
            how:
              "Compare coil pattern, suction / line temp, and box condition before condemning TXV, EEV, or charge.",
          });
        }

        if (componentLabelLower.includes("furnace")) {
          tests.push({
            title: "Run the heat sequence in order",
            tool: "Meter + visual",
            why: "Furnace issues are usually found in the sequence / safety chain.",
            how:
              "Verify call for heat, inducer, pressure switch, ignitor, flame sense, limits, and board outputs before replacing the board or gas valve.",
          });
        }

        if (componentLabelLower.includes("air handler") || componentLabelLower.includes("indoor unit")) {
          tests.push({
            title: "Check indoor airflow and safeties first",
            tool: "Meter + visual",
            why: "Indoor blower and drain safeties often mimic bigger problems.",
            how:
              "Verify blower motor operation, board / relay output, capacitor / module condition, and drain safety before replacing indoor components.",
          });
        }

        if (equipment.includes("walk-in")) {
          tests.push({
            title: "Verify walk-in control and defrost operation",
            tool: "Visual + control check",
            why: "Walk-in callbacks often come from defrost / delay / drain heat issues.",
            how:
              "Check box temp, defrost schedule, termination, fan delay, drain heat, and door / frame heat before ordering parts.",
          });
        }

        if (equipment.includes("ice machine")) {
          tests.push({
            title: "Separate water-side from refrigeration-side issues",
            tool: "Visual + sequence check",
            why: "Ice machines waste time when the sequence is not separated clearly.",
            how:
              "Check freeze / harvest sequence, water flow, water level, and sensor states before blaming refrigeration components.",
          });
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          tests.push({
            title: "Prove power and controls before expensive parts",
            tool: "Meter",
            why: "No-cool complaints often get over-diagnosed.",
            how:
              "Verify control call, line voltage, obvious electrical failures, and airflow first. Do not jump straight to compressor, TXV, or charge.",
          });
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          tests.push({
            title: "Treat icing as airflow / defrost / feed until proven otherwise",
            tool: "Visual + temperatures + controls",
            why: "Icing problems are often repeat issues when the wrong thing is replaced.",
            how:
              "Check airflow, fan operation, defrost operation, drain condition, and frost pattern before condemning refrigerant-side parts.",
          });
        }

        if (issue.includes("heat")) {
          tests.push({
            title: "Follow the heating safety chain",
            tool: "Meter + visual",
            why: "Heating failures are usually sequence-related before they are part-related.",
            how:
              "Verify the full sequence of operation and each safety before replacing a board, valve, or ignitor.",
          });
        }

        if (sameComponentHistory.length) {
          tests.push({
            title: "Compare with same-component history before replacing parts",
            tool: "History + current readings",
            why: "Repeat failures often come back because the root cause was not verified.",
            how:
              `Review the ${sameComponentHistory.length} prior same-component event(s), compare current conditions to the last repair, and verify the previous fix path before repeating it.`,
          });
        }

        if (recentParts.length || recentFix) {
          tests.push({
            title: "Verify the last repair path did not fail again",
            tool: "Visual + electrical / temperature checks",
            why: "A repeated fix can hide the real root cause.",
            how:
              `Recent same-component parts/fix history: ${[recentParts.join(", "), recentFix].filter(Boolean).join(" • ") || "See history"}. Confirm the replaced part, wiring, setup, and operating conditions before changing it again.`,
          });
        }

        const seen = new Set<string>();
        return tests.filter((test) => {
          const key = `${test.title}|${test.how}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 5);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "guided next-test helper insert",
    )

    source = replace_once(
        source,
        """      {/* failure-intelligence-dashboard-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Failure Intelligence Dashboard">
""",
        """      {/* failure-intelligence-dashboard-v1 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: showFailureDashboard ? 10 : 0,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            Failure Intelligence Dashboard
          </div>

          <button
            type="button"
            onClick={() => setShowFailureDashboard((prev) => !prev)}
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
            {showFailureDashboard ? "Hide Dashboard" : "Open Dashboard"}
          </button>
        </div>

        {showFailureDashboard ? (
        <SectionCard title="Failure Intelligence Dashboard">
""",
        "failure dashboard wrapper start",
    )

    source = replace_once(
        source,
        """        </SectionCard>
      </div>

""",
        """        </SectionCard>
        ) : null}
      </div>

""",
        "failure dashboard wrapper end",
    )

    guided_ui = """      {/* guided-next-test-engine-ui-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Guided Next-Test Engine">
          <SmallHint>
            Uses the selected affected component, current symptom, and same-component history to suggest
            the next field checks instead of making the tech guess.
          </SmallHint>

          {(() => {
            const tests = buildGuidedNextTests();
            const targetComponent = getCurrentAffectedComponentLabelForAssist();
            const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
            const warningSignals = getComponentAwareWarningSignals();

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
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{targetComponent || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Symptom
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{symptom || "—"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Same-Component History
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{sameComponentHistory.length}</div>
                  </div>
                </div>

                {warningSignals.length ? (
                  <div
                    style={{
                      border: "1px solid #f0c36d",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fff8e8",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>Pattern Warnings</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {warningSignals.slice(0, 3).map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div style={{ display: "grid", gap: 12 }}>
                  {tests.map((test, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 12,
                        background: "#fafafa",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        Test {idx + 1}: {test.title}
                      </div>

                      <SmallHint><b>Tool:</b> {test.tool}</SmallHint>
                      <SmallHint><b>Why:</b> {test.why}</SmallHint>
                      <SmallHint><b>What to do:</b> {test.how}</SmallHint>
                    </div>
                  ))}
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
        guided_ui,
        "guided next-test UI insert",
    )

    backup = PAGE.with_name(PAGE.name + ".guided-next-test-engine-dashboard-toggle.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
