from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_first(source: str, anchors: list[str], block: str, label: str) -> str:
    for anchor in anchors:
        idx = source.find(anchor)
        if idx != -1:
            return source[:idx] + block + source[idx:]
    raise RuntimeError(f"Could not find expected anchor for: {label}. Tried: {anchors}")


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "unit-profile-component-intelligence-v3" in source:
        print("Unit profile component intelligence patch already applied.")
        return

    if "unit-profile-component-intelligence-helpers-v3" not in source:
        helper_block = """      // unit-profile-component-intelligence-helpers-v3
      function getTopCountEntry(counts: Record<string, number>) {
        const entries = Object.entries(counts).filter(([key]) => key.trim());
        if (!entries.length) return "";
        entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
        return entries[0][0];
      }

      function buildUnitProfileComponentIntelligence() {
        const events = Array.isArray(unitProfileTimeline) ? unitProfileTimeline : [];
        const groups: Record<
          string,
          {
            label: string;
            eventCount: number;
            callbackCount: number;
            lastServiceDate: string;
            symptomCounts: Record<string, number>;
            causeCounts: Record<string, number>;
            fixCounts: Record<string, number>;
            partCounts: Record<string, number>;
          }
        > = {};

        const primaryLabel =
          (unitProfileUnit?.unitNickname
            ? `Primary component — ${unitProfileUnit.unitNickname}`
            : "Primary component");

        for (const event of events) {
          const label = String(
            getAffectedComponentDisplayForEvent(event) ||
              event?.affected_component_label_snapshot ||
              primaryLabel
          ).trim() || primaryLabel;

          if (!groups[label]) {
            groups[label] = {
              label,
              eventCount: 0,
              callbackCount: 0,
              lastServiceDate: "",
              symptomCounts: {},
              causeCounts: {},
              fixCounts: {},
              partCounts: {},
            };
          }

          const group = groups[label];
          group.eventCount += 1;

          const callbackValue = String(event?.callback_occurred || "").trim().toLowerCase();
          if (callbackValue === "yes" || callbackValue === "true") {
            group.callbackCount += 1;
          }

          const serviceDate = String(event?.service_date || "").trim();
          if (serviceDate) {
            if (!group.lastServiceDate) {
              group.lastServiceDate = serviceDate;
            } else {
              const currentMs = new Date(group.lastServiceDate).getTime();
              const nextMs = new Date(serviceDate).getTime();
              if (Number.isFinite(nextMs) && nextMs > currentMs) {
                group.lastServiceDate = serviceDate;
              }
            }
          }

          const symptom = String(event?.symptom || "").trim();
          const cause = String(event?.final_confirmed_cause || "").trim();
          const fix = String(event?.actual_fix_performed || "").trim();
          const parts = String(event?.parts_replaced || "").trim();

          if (symptom) {
            group.symptomCounts[symptom] = (group.symptomCounts[symptom] || 0) + 1;
          }

          if (cause) {
            group.causeCounts[cause] = (group.causeCounts[cause] || 0) + 1;
          }

          if (fix) {
            group.fixCounts[fix] = (group.fixCounts[fix] || 0) + 1;
          }

          if (parts) {
            for (const rawPart of parts.split(/[;,]/)) {
              const part = rawPart.trim();
              if (!part) continue;
              group.partCounts[part] = (group.partCounts[part] || 0) + 1;
            }
          }
        }

        return Object.values(groups)
          .map((group) => ({
            ...group,
            topSymptom: getTopCountEntry(group.symptomCounts),
            topCause: getTopCountEntry(group.causeCounts),
            topFix: getTopCountEntry(group.fixCounts),
            topPart: getTopCountEntry(group.partCounts),
          }))
          .sort((a, b) => {
            const callbackDiff = b.callbackCount - a.callbackCount;
            if (callbackDiff) return callbackDiff;
            const eventDiff = b.eventCount - a.eventCount;
            if (eventDiff) return eventDiff;
            const aMs = a.lastServiceDate ? new Date(a.lastServiceDate).getTime() : 0;
            const bMs = b.lastServiceDate ? new Date(b.lastServiceDate).getTime() : 0;
            return bMs - aMs;
          });
      }

"""
        helper_anchor = 'const [showBulkImportTools, setShowBulkImportTools] = useState(false);'
        idx = source.find(helper_anchor)
        if idx == -1:
            raise RuntimeError("Could not find helper anchor for component intelligence.")
        source = source[:idx] + helper_block + source[idx:]

    ui_block = """                      {/* unit-profile-component-intelligence-v3 */}
                      {(() => {
                        const componentIntel = buildUnitProfileComponentIntelligence();

                        if (!componentIntel.length) {
                          return null;
                        }

                        const hotspot = componentIntel[0];

                        return (
                          <div
                            style={{
                              marginBottom: 12,
                              border: "1px solid #eee",
                              borderRadius: 10,
                              padding: 12,
                              background: "#fafafa",
                              display: "grid",
                              gap: 12,
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 900, fontSize: 16 }}>
                                Component Pattern Intelligence
                              </div>
                              <SmallHint style={{ marginTop: 6 }}>
                                Highlights which exact component is driving repeat service history, callbacks,
                                repeated symptoms, and the most common prior cause / fix / part on this unit.
                              </SmallHint>
                            </div>

                            <div
                              style={{
                                border: "1px solid #f0c36d",
                                borderRadius: 10,
                                padding: 12,
                                background: "#fff8e8",
                              }}
                            >
                              <div style={{ fontWeight: 900 }}>Top Component Signal</div>
                              <SmallHint style={{ marginTop: 6 }}>
                                <b>{hotspot.label}</b> has the strongest service signal right now with{" "}
                                <b>{hotspot.eventCount}</b> event{hotspot.eventCount === 1 ? "" : "s"}
                                {hotspot.callbackCount ? (
                                  <>
                                    {" "}and <b>{hotspot.callbackCount}</b> callback{hotspot.callbackCount === 1 ? "" : "s"}
                                  </>
                                ) : null}
                                .
                              </SmallHint>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                gap: 12,
                              }}
                            >
                              {componentIntel.map((component, idx) => (
                                <div
                                  key={`${component.label}-${idx}`}
                                  style={{
                                    border: "1px solid #eee",
                                    borderRadius: 10,
                                    padding: 12,
                                    background: "#fff",
                                    display: "grid",
                                    gap: 8,
                                  }}
                                >
                                  <div style={{ fontWeight: 900 }}>{component.label}</div>

                                  <SmallHint>
                                    <b>Events:</b> {component.eventCount} • <b>Callbacks:</b> {component.callbackCount}
                                  </SmallHint>

                                  <SmallHint>
                                    <b>Last Service:</b>{" "}
                                    {component.lastServiceDate
                                      ? new Date(component.lastServiceDate).toLocaleDateString()
                                      : "-"}
                                  </SmallHint>

                                  <SmallHint><b>Top Symptom:</b> {component.topSymptom || "-"}</SmallHint>
                                  <SmallHint><b>Top Cause:</b> {component.topCause || "-"}</SmallHint>
                                  <SmallHint><b>Top Fix:</b> {component.topFix || "-"}</SmallHint>
                                  <SmallHint><b>Top Part:</b> {component.topPart || "-"}</SmallHint>

                                  {component.callbackCount > 0 ? (
                                    <div
                                      style={{
                                        marginTop: 4,
                                        border: "1px solid #f0c36d",
                                        borderRadius: 10,
                                        padding: 10,
                                        background: "#fff8e8",
                                      }}
                                    >
                                      <SmallHint>
                                        This component has callback history. Verify root cause before repeating the same repair.
                                      </SmallHint>
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

"""

    source = insert_before_first(
        source,
        [
            'const __options = getTimelineComponentFilterOptions(unitProfileTimeline);',
            'value={unitProfileTimelineComponentFilter}',
            '/* component-filter-ui-profile-timeline-v1 */',
            '{__filteredEvents.length ? (',
        ],
        ui_block,
        "unit profile intelligence UI",
    )

    backup = PAGE.with_name(PAGE.name + ".unit-profile-component-intelligence-v3.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
