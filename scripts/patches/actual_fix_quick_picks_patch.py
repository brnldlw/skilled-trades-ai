from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if "Replaced Capacitor" in text and "Cleared Drain" in text:
    raise SystemExit("Actual Fix quick-pick buttons already appear to exist.")

anchor = """          value={actualFixPerformed}
          onChange={(e) => setActualFixPerformed(e.target.value)}"""

insert = """          value={actualFixPerformed}
          onChange={(e) => setActualFixPerformed(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => setActualFixPerformed("Replaced Capacitor")}
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
            Replaced Capacitor
          </button>

          <button
            onClick={() => setActualFixPerformed("Replaced Contactor")}
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
            Replaced Contactor
          </button>

          <button
            onClick={() => setActualFixPerformed("Replaced Motor")}
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
            Replaced Motor
          </button>

          <button
            onClick={() => setActualFixPerformed("Added Refrigerant")}
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
            Added Refrigerant
          </button>

          <button
            onClick={() => setActualFixPerformed("Cleaned Condenser")}
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
            Cleaned Condenser
          </button>

          <button
            onClick={() => setActualFixPerformed("Replaced Filter/Drier")}
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
            Replaced Filter/Drier
          </button>

          <button
            onClick={() => setActualFixPerformed("Cleared Drain")}
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
            Cleared Drain
          </button>

          <button
            onClick={() => setActualFixPerformed("Replaced Sensor / Control")}
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
            Replaced Sensor / Control
          </button>
        </div>

        <input"""

if anchor not in text:
    raise SystemExit("Could not find actualFixPerformed anchor.")

text = text.replace(anchor, insert, 1)
path.write_text(text)
print("Added Actual Fix quick-pick buttons.")