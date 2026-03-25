from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

old = """                      <div style={{ marginTop: 4 }}>
                        <SmallHint>
                          <b>Outcome:</b> {event.outcome_status || "-"} • <b>Callback:</b> {event.callback_occurred || "-"}
                        </SmallHint>
                      </div>"""

new = """                      <div style={{ marginTop: 4 }}>
                        <SmallHint>
                          <b>Outcome:</b> {event.outcome_status || "-"} • <b>Callback:</b> {event.callback_occurred || "-"}
                        </SmallHint>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {event.outcome_status ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 8px",
                              borderRadius: 999,
                              border: "1px solid #cfcfcf",
                              background:
                                String(event.outcome_status || "").toLowerCase() === "fixed"
                                  ? "#eefaf0"
                                  : "#f7f7f7",
                              fontSize: 12,
                              fontWeight: 900,
                            }}
                          >
                            {String(event.outcome_status || "").toUpperCase()}
                          </span>
                        ) : null}

                        {String(event.callback_occurred || "").trim() ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 8px",
                              borderRadius: 999,
                              border: "1px solid #cfcfcf",
                              background:
                                String(event.callback_occurred || "").toLowerCase() === "yes"
                                  ? "#fff3e8"
                                  : "#f7f7f7",
                              fontSize: 12,
                              fontWeight: 900,
                            }}
                          >
                            CALLBACK {String(event.callback_occurred || "").toUpperCase()}
                          </span>
                        ) : null}
                      </div>"""

if old not in text:
    raise SystemExit("Could not find the Outcome/Callback block in Unit Profile timeline.")

text = text.replace(old, new, 1)
path.write_text(text)
print("Added outcome and callback badges to Unit Profile timeline.")