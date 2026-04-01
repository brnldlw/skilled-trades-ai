from __future__ import annotations

import shutil
from pathlib import Path

TARGET = Path("app/hvac_units/page.tsx")


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
    if not TARGET.exists():
        raise FileNotFoundError(f"Missing file: {TARGET}")

    source = TARGET.read_text(encoding="utf-8")

    if "failure-intelligence-dashboard-v1" in source:
        print("Failure intelligence dashboard patch already applied.")
        return

    source = replace_once(
        source,
        """  createServiceEventForCurrentUser,
""",
        """  createServiceEventForCurrentUser,
  listServiceEventsForCurrentUser,
""",
        "import listServiceEventsForCurrentUser",
    )

    helper_block = """      // failure-intelligence-dashboard-v1
      const [failureDashboardEvents, setFailureDashboardEvents] = useState<
        import("../lib/supabase/work-orders").ServiceEventRow[]
      >([]);
      const [failureDashboardLoading, setFailureDashboardLoading] = useState(false);
      const [failureDashboardError, setFailureDashboardError] = useState("");
      const [failureDashboardRefreshedAt, setFailureDashboardRefreshedAt] = useState("");

      async function loadFailureIntelligenceDashboardData() {
        setFailureDashboardLoading(true);
        setFailureDashboardError("");

        try {
          const rows = await listServiceEventsForCurrentUser();
          setFailureDashboardEvents(Array.isArray(rows) ? rows : []);
          setFailureDashboardRefreshedAt(new Date().toISOString());
        } catch (err) {
          console.error("LOAD FAILURE DASHBOARD FAILED", err);
          setFailureDashboardError("Could not load failure intelligence dashboard.");
        } finally {
          setFailureDashboardLoading(false);
        }
      }

      function buildFailureIntelligenceDashboard() {
        const unitMap = new Map(savedUnits.map((unit) => [unit.id, unit]));
        const events = Array.isArray(failureDashboardEvents) ? failureDashboardEvents : [];

        const componentCounts: Record<string, number> = {};
        const componentCallbackCounts: Record<string, number> = {};
        const equipmentCounts: Record<string, number> = {};
        const siteCounts: Record<string, number> = {};
        const symptomCounts: Record<string, number> = {};
        const causeFixCounts: Record<string, number> = {};
        const partCounts: Record<string, number> = {};

        for (const event of events) {
          const unit = unitMap.get(String(event.unit_id || "")) || null;
          const componentLabel = String(
            event.affected_component_label_snapshot ||
              getAffectedComponentDisplayForEvent(event) ||
              (unit?.unitNickname ? `Primary component — ${unit.unitNickname}` : "Primary component")
          ).trim() || "Primary component";

          const siteLabel = String(unit?.siteName || unit?.siteAddress || "Unknown site").trim();
          const equipmentLabel = String(unit?.equipmentType || "Unknown equipment").trim();
          const symptomLabel = String(event?.symptom || "").trim();
          const causeLabel = String(event?.final_confirmed_cause || "").trim();
          const fixLabel = String(event?.actual_fix_performed || "").trim();
          const callbackValue = String(event?.callback_occurred || "").trim().toLowerCase();
          const causeFixLabel = [causeLabel, fixLabel].filter(Boolean).join(" → ");

          componentCounts[componentLabel] = (componentCounts[componentLabel] || 0) + 1;
          equipmentCounts[equipmentLabel] = (equipmentCounts[equipmentLabel] || 0) + 1;
          siteCounts[siteLabel] = (siteCounts[siteLabel] || 0) + 1;

          if (callbackValue === "yes" || callbackValue === "true") {
            componentCallbackCounts[componentLabel] = (componentCallbackCounts[componentLabel] || 0) + 1;
          }

          if (symptomLabel) {
            symptomCounts[symptomLabel] = (symptomCounts[symptomLabel] || 0) + 1;
          }

          if (causeFixLabel) {
            causeFixCounts[causeFixLabel] = (causeFixCounts[causeFixLabel] || 0) + 1;
          }

          const rawParts = String(event?.parts_replaced || "").trim();
          if (rawParts) {
            for (const rawPart of rawParts.split(/[;,]/)) {
              const part = rawPart.trim();
              if (!part) continue;
              partCounts[part] = (partCounts[part] || 0) + 1;
            }
          }
        }

        const sortCounts = (counts: Record<string, number>) =>
          Object.entries(counts)
            .filter(([key]) => key.trim())
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

        const totalEvents = events.length;
        const callbackEvents = events.filter((event) => {
          const value = String(event?.callback_occurred || "").trim().toLowerCase();
          return value === "yes" || value === "true";
        }).length;

        return {
          totalEvents,
          callbackEvents,
          topComponents: sortCounts(componentCounts).slice(0, 5),
          topCallbackComponents: sortCounts(componentCallbackCounts).slice(0, 5),
          topEquipmentTypes: sortCounts(equipmentCounts).slice(0, 5),
          topSites: sortCounts(siteCounts).slice(0, 5),
          topSymptoms: sortCounts(symptomCounts).slice(0, 5),
          topCauseFixes: sortCounts(causeFixCounts).slice(0, 5),
          topParts: sortCounts(partCounts).slice(0, 5),
        };
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "failure dashboard helpers",
    )

    effect_block = """
  useEffect(() => {
    void loadFailureIntelligenceDashboardData();
  }, [savedUnits]);

"""
    source = insert_before_once(
        source,
        "async function updateCurrentLoadedUnit() {",
        effect_block,
        "failure dashboard useEffect",
    )

    source = replace_once(
        source,
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    alert("Service event updated.");
""",
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    alert("Service event updated.");
""",
        "refresh dashboard after update service event",
    )

    source = replace_once(
        source,
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    setServiceEventPhotoUrls([]);
""",
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    setServiceEventPhotoUrls([]);
""",
        "refresh dashboard after save current call",
    )

    source = replace_once(
        source,
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    setServiceDate(new Date().toISOString().slice(0, 10));
""",
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    setServiceDate(new Date().toISOString().slice(0, 10));
""",
        "refresh dashboard after save historical call",
    )

    ui_block = """      {/* failure-intelligence-dashboard-v1 */}
      <div style={{ marginTop: 16 }}>
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
      </div>

"""
    source = insert_before_once(
        source,
        '<div style={{ marginTop: 16, display: showSavedUnitHistory ? "block" : "none" }}>',
        ui_block,
        "failure dashboard UI",
    )

    backup = TARGET.with_name(TARGET.name + ".failure-dashboard.bak")
    shutil.copy2(TARGET, backup)
    TARGET.write_text(source, encoding="utf-8")

    print(f"Patched {TARGET}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
