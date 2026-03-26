from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if "Likely Parts to Check" in text:
    raise SystemExit("Likely Parts to Check already appears to exist.")

anchor = """              const likelyCheck = topCause?.[0] || topFix?.[0] || cleanedSymptom || "-";"""

insert = """              const likelyCheck = topCause?.[0] || topFix?.[0] || cleanedSymptom || "-";

              const partCounts = unitServiceTimeline.reduce<Record[str, int] if False else Record<string, number>>((acc, event) => {
                const raw = String(
                  event.parts_replaced || event.actual_fix_performed || ""
                ).trim();

                if (!raw) return acc;

                raw
                  .split(/,|\\/|;|\\band\\b/gi)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .forEach((part) => {
                    acc[part] = (acc[part] || 0) + 1;
                  });

                return acc;
              }, {});

              const historyTopParts = Object.entries(partCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([name]) => name);

              const inferLikelyParts = (value: string) => {
                const v = String(value || "").toLowerCase();
                const out: string[] = [];

                if (v.includes("capacitor")) out.push("Capacitor");
                if (v.includes("contactor")) out.push("Contactor");
                if (v.includes("motor") || v.includes("blower") || v.includes("fan")) out.push("Motor");
                if (v.includes("compressor")) out.push("Compressor");
                if (v.includes("refrigerant") || v.includes("low charge") || v.includes("low temp")) out.push("Refrigerant Circuit");
                if (v.includes("drier") || v.includes("filter")) out.push("Filter/Drier");
                if (v.includes("sensor")) out.push("Sensor");
                if (v.includes("control") || v.includes("board")) out.push("Control Board");
                if (v.includes("drain") || v.includes("water leak") || v.includes("float")) out.push("Drain / Float Switch");
                if (v.includes("txv")) out.push("TXV");

                return out;
              };

              const suggestedParts = Array.from(
                new Set([
                  ...historyTopParts,
                  ...inferLikelyParts(topCause?.[0] || ""),
                  ...inferLikelyParts(topFix?.[0] || ""),
                  ...inferLikelyParts(cleanedSymptom || ""),
                ])
              ).slice(0, 6);"""

if anchor not in text:
    raise SystemExit("Could not find likelyCheck anchor in Parts & Manuals Assist panel.")

text = text.replace(anchor, insert, 1)

old_ui = """                  <div
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

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>"""

new_ui = """                  <div
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

                  <div
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 10,
                      padding: 10,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>Likely Parts to Check</div>

                    {suggestedParts.length ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {suggestedParts.map((part) => (
                          <span
                            key={part}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 8px",
                              borderRadius: 999,
                              border: "1px solid #cfcfcf",
                              background: "#f7f7f7",
                              fontSize: 12,
                              fontWeight: 900,
                            }}
                          >
                            {part}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <SmallHint>No likely parts yet. Add more history or a symptom to improve suggestions.</SmallHint>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>"""

if old_ui not in text:
    raise SystemExit("Could not find Parts & Manuals Assist UI anchor for likely parts block.")

text = text.replace(old_ui, new_ui, 1)

path.write_text(text)
print("Added history-aware likely parts list to Parts & Manuals Assist.")