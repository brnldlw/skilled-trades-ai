from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if 'title="Parts & Manuals Assist"' in text:
    raise SystemExit("Parts & Manuals Assist panel already exists in the file.")

anchor = '<SectionCard title="Service Event Photos">'
idx = text.find(anchor)
if idx == -1:
    raise SystemExit('Could not find "Service Event Photos" anchor.')

block = """
        <div style={{ marginTop: 16 }}>
          <SectionCard title="Parts & Manuals Assist">
            {(() => {
              const baseUnitQuery = [manufacturer, model, equipmentType]
                .filter(Boolean)
                .join(" ")
                .replace(/\\s+/g, " ")
                .trim();

              const cleanedSymptom = String(symptom || "").trim();

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

              const manualSearchQuery = `${baseUnitQuery} service manual pdf`
                .replace(/\\s+/g, " ")
                .trim();

              const partsSearchQuery = `${baseUnitQuery} ${topCause?.[0] || cleanedSymptom || topFix?.[0] || "parts"}`
                .replace(/\\s+/g, " ")
                .trim();

              const likelyCheck = topCause?.[0] || topFix?.[0] || cleanedSymptom || "-";

              return !baseUnitQuery ? (
                <SmallHint>
                  Enter manufacturer, model, and equipment type to improve manual and parts suggestions.
                </SmallHint>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <b>Manual Search:</b> {manualSearchQuery || "-"}
                    </div>
                    <div>
                      <b>Parts Search:</b> {partsSearchQuery || "-"}
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 10,
                      padding: 10,
                      background: "#fafafa",
                    }}
                  >
                    <SmallHint>
                      <b>History hint:</b> Based on this unit’s saved history, start by checking{" "}
                      <b>{likelyCheck}</b>.
                    </SmallHint>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(manualSearchQuery)}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      style={{
                        padding: "10px 14px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      Open Manual Search
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(partsSearchQuery)}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      style={{
                        padding: "10px 14px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      Open Parts Search
                    </button>
                  </div>
                </div>
              );
            })()}
          </SectionCard>
        </div>

"""

text = text[:idx] + block + text[idx:]
path.write_text(text)
print("Force-inserted Parts & Manuals Assist panel before Service Event Photos.")