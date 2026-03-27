from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# A) Split the single parts search into broad + history-aware searches
old_query = """              const partsSearchQuery = `${baseUnitQuery} ${topCause?.[0] || cleanedSymptom || topFix?.[0] || "parts"}`
                .replace(/\\s+/g, " ")
                .trim();

              const likelyCheck = topCause?.[0] || topFix?.[0] || cleanedSymptom || "-";"""

new_query = """              const broadPartsSearchQuery = `${baseUnitQuery} ${cleanedSymptom || "parts"}`
                .replace(/\\s+/g, " ")
                .trim();

              const historyAwarePartsSearchQuery = `${baseUnitQuery} ${topCause?.[0] || topFix?.[0] || cleanedSymptom || "parts"}`
                .replace(/\\s+/g, " ")
                .trim();

              const likelyCheck = topCause?.[0] || topFix?.[0] || cleanedSymptom || "-";"""

if old_query in text:
    text = text.replace(old_query, new_query, 1)
elif "const broadPartsSearchQuery =" not in text:
    raise SystemExit("Could not find partsSearchQuery block to split.")

# B) Clarify the top summary labels
old_summary = """                    <div>
                      <b>Manual Search:</b> {manualSearchQuery || "-"}
                    </div>
                    <div>
                      <b>Parts Search:</b> {partsSearchQuery || "-"}
                    </div>"""

new_summary = """                    <div>
                      <b>Manual Search:</b> {manualSearchQuery || "-"}
                    </div>
                    <div>
                      <b>Current Symptom Search:</b> {broadPartsSearchQuery || "-"}
                    </div>"""

if old_summary in text:
    text = text.replace(old_summary, new_summary, 1)
elif "<b>Current Symptom Search:</b>" not in text:
    raise SystemExit("Could not find top summary block to relabel.")

# C) Rename likely parts area so it is clearly history-based
old_label = '<div style={{ fontWeight: 900, marginBottom: 8 }}>Likely Parts to Check</div>'
new_label = '<div style={{ fontWeight: 900, marginBottom: 8 }}>History-Based Likely Parts</div>'

if old_label in text:
    text = text.replace(old_label, new_label, 1)
elif "History-Based Likely Parts" not in text:
    raise SystemExit("Could not find likely parts label.")

# D) Replace the single parts button area with broad + history-aware buttons
old_buttons = """                    <button
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
                    </button>"""

new_buttons = """                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(broadPartsSearchQuery)}`,
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
                      Open Broad Parts Search
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(historyAwarePartsSearchQuery)}`,
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
                      Open History-Aware Parts Search
                    </button>"""

if old_buttons in text:
    text = text.replace(old_buttons, new_buttons, 1)
elif "Open History-Aware Parts Search" not in text:
    raise SystemExit("Could not find parts button block to split.")

path.write_text(text)
print("Split Parts & Manuals Assist into broad current-symptom search and history-aware parts guidance.")