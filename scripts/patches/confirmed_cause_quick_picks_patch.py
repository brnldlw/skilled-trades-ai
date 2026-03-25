from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if "Bad Capacitor" in text and "Restricted Filter/Drier" in text:
    raise SystemExit("Confirmed Cause quick-pick buttons already appear to exist.")

anchor = """          value={finalConfirmedCause}
          onChange={(e) => setFinalConfirmedCause(e.target.value)}"""

insert = """          value={finalConfirmedCause}
          onChange={(e) => setFinalConfirmedCause(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => setFinalConfirmedCause("Bad Capacitor")}
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
            Bad Capacitor
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Failed Contactor")}
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
            Failed Contactor
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Failed Motor")}
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
            Failed Motor
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Low Refrigerant")}
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
            Low Refrigerant
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Dirty Condenser")}
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
            Dirty Condenser
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Restricted Filter/Drier")}
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
            Restricted Filter/Drier
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Drain Issue")}
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
            Drain Issue
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Sensor / Control Issue")}
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
            Sensor / Control Issue
          </button>
        </div>

        <input"""

if anchor not in text:
    raise SystemExit("Could not find exact finalConfirmedCause anchor at current indentation.")

text = text.replace(anchor, insert, 1)
path.write_text(text)
print("Added Confirmed Cause quick-pick buttons.")