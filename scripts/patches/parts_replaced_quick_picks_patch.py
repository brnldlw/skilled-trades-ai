from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if "Capacitor" in text and "Filter/Drier" in text and "Motor" in text:
    raise SystemExit("Parts Replaced quick-pick buttons may already exist.")

anchor = """          value={actualFixPerformed}
          onChange={(e) => setActualFixPerformed(e.target.value)}"""

insert = """          value={actualFixPerformed}
          onChange={(e) => setActualFixPerformed(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => setActualFixPerformed("Capacitor")}
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
            Capacitor
          </button>

          <button
            onClick={() => setActualFixPerformed("Contactor")}
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
            Contactor
          </button>

          <button
            onClick={() => setActualFixPerformed("Motor")}
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
            Motor
          </button>

          <button
            onClick={() => setActualFixPerformed("Fan Blade")}
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
            Fan Blade
          </button>

          <button
            onClick={() => setActualFixPerformed("Filter/Drier")}
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
            Filter/Drier
          </button>

          <button
            onClick={() => setActualFixPerformed("Sensor")}
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
            Sensor
          </button>

          <button
            onClick={() => setActualFixPerformed("Control Board")}
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
            Control Board
          </button>

          <button
            onClick={() => setActualFixPerformed("TXV")}
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
            TXV
          </button>
        </div>

        <input"""

if anchor not in text:
    raise SystemExit("Could not find actualFixPerformed anchor.")

text = text.replace(anchor, insert, 1)
path.write_text(text)
print("Added Parts Replaced quick-pick buttons.")