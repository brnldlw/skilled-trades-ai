from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

old = """        <div style={{ marginTop: 16 }}>
          <SectionCard title="Current Loaded Unit">
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: currentLoadedUnitId ? "#f7fbff" : "#fafafa",
              }}
            >"""

new = """        <div
          style={{
            marginTop: 16,
            position: "sticky",
            top: 12,
            zIndex: 20,
          }}
        >
          <SectionCard title="Current Loaded Unit">
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: currentLoadedUnitId ? "#f7fbff" : "#fafafa",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              }}
            >"""

if old not in text:
    raise SystemExit("Could not find Current Loaded Unit banner block.")

text = text.replace(old, new, 1)
path.write_text(text)
print("Made Current Loaded Unit banner sticky.")