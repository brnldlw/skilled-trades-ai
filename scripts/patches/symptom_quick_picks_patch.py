from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if "No Cooling" in text and "Maintenance" in text:
    raise SystemExit("Symptom quick-pick buttons already appear to exist.")

anchor = """              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}"""

insert = """              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <button
                onClick={() => setSymptom("No Cooling")}
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
                No Cooling
              </button>

              <button
                onClick={() => setSymptom("No Heat")}
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
                No Heat
              </button>

              <button
                onClick={() => setSymptom("Water Leak")}
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
                Water Leak
              </button>

              <button
                onClick={() => setSymptom("Not Running")}
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
                Not Running
              </button>

              <button
                onClick={() => setSymptom("Low Temp")}
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
                Low Temp
              </button>

              <button
                onClick={() => setSymptom("High Temp")}
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
                High Temp
              </button>

              <button
                onClick={() => setSymptom("Noise")}
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
                Noise
              </button>

              <button
                onClick={() => setSymptom("Maintenance")}
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
                Maintenance
              </button>
            </div>

            <input"""

if anchor not in text:
    raise SystemExit("Could not find symptom value/onChange anchor.")

text = text.replace(anchor, insert, 1)
path.write_text(text)
print("Added symptom quick-pick buttons.")