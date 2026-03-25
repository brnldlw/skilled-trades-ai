from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if "title=\"Current Loaded Unit\"" in text:
    raise SystemExit("Current Loaded Unit banner already appears to exist.")

title_marker = 'title="Customer / Site / Unit"'
title_idx = text.find(title_marker)
if title_idx == -1:
    raise SystemExit('Could not find "Customer / Site / Unit" section.')

section_end = text.find("</SectionCard>", title_idx)
if section_end == -1:
    raise SystemExit('Could not find end of "Customer / Site / Unit" SectionCard.')

insert_at = section_end + len("</SectionCard>")

banner = """

        <div style={{ marginTop: 16 }}>
          <SectionCard title="Current Loaded Unit">
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: currentLoadedUnitId ? "#f7fbff" : "#fafafa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid #cfcfcf",
                    background: currentLoadedUnitId ? "#eefaf0" : "#f7f7f7",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {currentLoadedUnitId ? "UNIT LOADED" : "NO UNIT LOADED"}
                </span>

                {currentLoadedUnitId ? (
                  <span
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
                    ID: {currentLoadedUnitId.slice(0, 8)}
                  </span>
                ) : null}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div><b>Customer:</b> {customerName || "-"}</div>
                <div><b>Site:</b> {siteName || "-"}</div>
                <div><b>Unit Tag:</b> {unitNickname || "-"}</div>
                <div><b>Manufacturer:</b> {manufacturer || "-"}</div>
                <div><b>Model:</b> {model || "-"}</div>
                <div><b>Serial:</b> {serial || "-"}</div>
              </div>

              <SmallHint style={{ marginTop: 10 }}>
                Always verify this banner before saving historical calls so they stay attached to the correct unit.
              </SmallHint>
            </div>
          </SectionCard>
        </div>"""

text = text[:insert_at] + banner + text[insert_at:]
path.write_text(text)
print("Added Current Loaded Unit banner.")