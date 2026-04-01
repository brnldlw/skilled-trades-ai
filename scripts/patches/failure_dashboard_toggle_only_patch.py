from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    s = PAGE.read_text(encoding="utf-8")

    if "showFailureDashboard" in s and "failure-dashboard-toggle-only-v1" in s:
        print("Failure dashboard toggle patch already applied.")
        return

    state_line = 'const [showFailureDashboard, setShowFailureDashboard] = useState(false);'
    if state_line not in s:
        anchor = 'const [showBulkImportTools, setShowBulkImportTools] = useState(false);'
        idx = s.find(anchor)
        if idx == -1:
            raise RuntimeError("Could not find state anchor for failure dashboard toggle.")
        s = s[:idx] + f'      {state_line}\n' + s[idx:]

    start_marker = '{/* failure-intelligence-dashboard-v1 */}'
    end_anchor = '<div style={{ marginTop: 16, display: showSavedUnitHistory ? "block" : "none" }}>'

    start_idx = s.find(start_marker)
    end_idx = s.find(end_anchor)

    if start_idx == -1:
        raise RuntimeError("Could not find failure dashboard start marker.")
    if end_idx == -1 or end_idx <= start_idx:
        raise RuntimeError("Could not find failure dashboard end anchor.")

    replacement = """{/* failure-dashboard-toggle-only-v1 */}
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
            <SmallHint>
              Company-wide pattern view across saved service history. Shows callback hotspots, repeat symptoms,
              common cause/fix combinations, and the components getting hit most often.
            </SmallHint>

            {failureDashboardLoading ? (
              <div style={{ marginTop: 12 }}>
                <SmallHint>Loading failure intelligence...</SmallHint>
              </div>
            ) : failureDashboardError ? (
              <div style={{ marginTop: 12 }}>
                <SmallHint>{failureDashboardError}</SmallHint>
              </div>
            ) : (() => {
              const data = buildFailureIntelligenceDashboard();

              if (!data.totalEvents) {
                return (
                  <div style={{ marginTop: 12 }}>
                    <SmallHint>No service event history found yet.</SmallHint>
                  </div>
                );
              }

              const renderList = (title: string, items: Array<[string, number]>) => (
                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 12,
                    background: "#fafafa",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{title}</div>
                  {items.length ? (
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {items.map(([label, count], idx) => (
                        <li key={`${title}-${idx}`}>
                          <SmallHint>
                            {label} — <b>{count}</b>
                          </SmallHint>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <SmallHint style={{ marginTop: 8 }}>No data yet.</SmallHint>
                  )}
                </div>
              );

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
                        Total Service Events
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>{data.totalEvents}</div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Callback Events
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>{data.callbackEvents}</div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Top Failing Component
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        {data.topComponents.length ? data.topComponents[0][0] : "-"}
                      </div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Top Repeat Site
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        {data.topSites.length ? data.topSites[0][0] : "-"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => void loadFailureIntelligenceDashboardData()}
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
                      Refresh Dashboard
                    </button>

                    <SmallHint>
                      Last refreshed:{" "}
                      {failureDashboardRefreshedAt
                        ? new Date(failureDashboardRefreshedAt).toLocaleString()
                        : "-"}
                    </SmallHint>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {renderList("Top Failing Components", data.topComponents)}
                    {renderList("Callback Hotspots", data.topCallbackComponents)}
                    {renderList("Top Equipment Types", data.topEquipmentTypes)}
                    {renderList("Top Repeat Sites", data.topSites)}
                    {renderList("Top Repeat Symptoms", data.topSymptoms)}
                    {renderList("Top Cause / Fix Combinations", data.topCauseFixes)}
                    {renderList("Most Replaced Parts", data.topParts)}
                  </div>
                </div>
              );
            })()}
          </SectionCard>
        ) : null}
      </div>

"""

    s = s[:start_idx] + replacement + s[end_idx:]

    backup = PAGE.with_name(PAGE.name + ".failure-dashboard-toggle-only.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(s, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
