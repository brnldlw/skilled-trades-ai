from pathlib import Path
import re

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# ---------- Outcome quick-picks ----------
outcome_pat = re.compile(
    r'(<label style=\{\{ fontWeight: 900 \}\}>Outcome Status</label>.*?<select.*?</select>)',
    re.S
)

outcome_repl = r'''\1

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <button
              onClick={() => setOutcomeStatus("Fixed")}
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
              Fixed
            </button>

            <button
              onClick={() => setOutcomeStatus("Needs Follow-Up")}
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
              Needs Follow-Up
            </button>

            <button
              onClick={() => setOutcomeStatus("Partial")}
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
              Partial
            </button>

            <button
              onClick={() => setOutcomeStatus("Not Set")}
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
              Not Set
            </button>
          </div>'''

# ---------- Callback quick-picks ----------
callback_pat = re.compile(
    r'(<label style=\{\{ fontWeight: 900 \}\}>Callback Occurred</label>.*?<select.*?</select>)',
    re.S
)

callback_repl = r'''\1

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <button
              onClick={() => setCallbackOccurred("No")}
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
              Callback No
            </button>

            <button
              onClick={() => setCallbackOccurred("Yes")}
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
              Callback Yes
            </button>
          </div>'''

if "Callback Yes" in text or "Needs Follow-Up" in text:
    raise SystemExit("Quick-pick buttons already appear to exist.")

text2, n1 = outcome_pat.subn(outcome_repl, text, count=1)
if n1 != 1:
    raise SystemExit("Could not find Outcome Status block.")

text3, n2 = callback_pat.subn(callback_repl, text2, count=1)
if n2 != 1:
    raise SystemExit("Could not find Callback Occurred block.")

path.write_text(text3)
print("Added historical entry quick-pick buttons for Outcome and Callback.")