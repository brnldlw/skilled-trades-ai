from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if 'title="Unit History Troubleshooting Hints"' in text:
    raise SystemExit("Unit History Troubleshooting Hints panel already appears to exist.")

marker = 'title="Service Event Photos"'
title_idx = text.find(marker)
if title_idx == -1:
    raise SystemExit('Could not find "Service Event Photos" section.')

start = text.rfind('        <div style={{ marginTop: 16 }}>', 0, title_idx)
if start == -1:
    raise SystemExit('Could not find wrapper div before "Service Event Photos".')

panel = """
        <div style={{ marginTop: 16 }}>
          <SectionCard title="Unit History Troubleshooting Hints">
            {!currentLoadedUnitId ? (
              <SmallHint>Load a unit to see history-based troubleshooting hints.</SmallHint>
            ) : !unitServiceTimeline.length ? (
              <SmallHint>No saved service history yet for this unit.</SmallHint>
            ) : (
              (() => {
                const cleanedSymptom = String(symptom || "").trim().toLowerCase();

                const repeatedSymptomCount = cleanedSymptom
                  ? unitServiceTimeline.filter(
                      (event) => String(event.symptom || "").trim().toLowerCase() === cleanedSymptom
                    ).length
                  : 0;

                const causeCounts = unitServiceTimeline.reduce<Record<string, number>>((acc, event) => {
                  const key = String(event.final_confirmed_cause || "").trim();
                  if (key) acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {});

                const fixCounts = unitServiceTimeline.reduce<Record<string, number>>((acc, event) => {
                  const key = String(
                    event.parts_replaced || event.actual_fix_performed || ""
                  ).trim();
                  if (key) acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {});

                const topCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0];
                const topFix = Object.entries(fixCounts).sort((a, b) => b[1] - a[1])[0];
                const callbackCount = unitServiceTimeline.filter(
                  (event) => String(event.callback_occurred || "").toLowerCase() === "yes"
                ).length;

                return (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <div>
                        <b>Repeated Current Symptom:</b>{" "}
                        {cleanedSymptom ? repeatedSymptomCount : "Enter symptom"}
                      </div>
                      <div>
                        <b>Prior Callbacks:</b> {callbackCount}
                      </div>
                      <div>
                        <b>Most Common Confirmed Cause:</b>{" "}
                        {topCause ? `${topCause[0]} (${topCause[1]})` : "-"}
                      </div>
                      <div>
                        <b>Most Common Prior Fix/Part:</b>{" "}
                        {topFix ? `${topFix[0]} (${topFix[1]})` : "-"}
                      </div>
                    </div>

                    {cleanedSymptom && repeatedSymptomCount > 0 ? (
                      <div
                        style={{
                          border: "1px solid #e5e5e5",
                          borderRadius: 10,
                          padding: 10,
                          background: "#fafafa",
                        }}
                      >
                        <SmallHint>
                          This unit has seen the current symptom <b>{repeatedSymptomCount}</b>{" "}
                          {repeatedSymptomCount === 1 ? "time" : "times"} in saved history.
                        </SmallHint>
                      </div>
                    ) : null}
                  </div>
                );
              })()
            )}
          </SectionCard>
        </div>

"""

text = text[:start] + panel + text[start:]
path.write_text(text)
print("Added Unit History Troubleshooting Hints v1 panel.")