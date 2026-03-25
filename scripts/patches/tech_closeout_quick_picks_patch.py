from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if "Verified operation after repair." in text and "Recommend follow-up." in text:
    raise SystemExit("Tech closeout quick-pick buttons already appear to exist.")

anchor = """          value={techCloseoutNotes}
          onChange={(e) => setTechCloseoutNotes(e.target.value)}"""

insert = """          value={techCloseoutNotes}
          onChange={(e) => setTechCloseoutNotes(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => setTechCloseoutNotes("Verified operation after repair.")}
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
            Verified Operation
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Advised customer of findings and repair performed.")}
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
            Advised Customer
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Recommend follow-up.")}
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
            Recommend Follow-Up
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Monitor unit operation.")}
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
            Monitor Unit
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Temporary repair completed. Return visit may be needed.")}
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
            Temporary Repair
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Parts ordered. Return visit required after parts arrive.")}
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
            Parts Ordered
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Unit operating at departure.")}
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
            Operating At Departure
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Customer declined additional repair at this time.")}
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
            Customer Declined
          </button>
        </div>

        <textarea"""

if anchor not in text:
    raise SystemExit("Could not find techCloseoutNotes anchor.")

text = text.replace(anchor, insert, 1)
path.write_text(text)
print("Added Tech Closeout Note quick-pick buttons.")