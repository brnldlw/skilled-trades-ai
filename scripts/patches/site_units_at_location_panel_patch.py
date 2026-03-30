from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if 'title="Site Units at This Location"' in text:
    raise SystemExit("Site Units at This Location panel already exists.")

# A) Add derived filtered site-units list
state_anchor = 'const [showQuickStartInline, setShowQuickStartInline] = useState(true);'
derived_block = """
const siteUnitsAtLocation = savedUnits.filter((u) => {
  const sameCustomer =
    String(u.customerName || "").trim().toLowerCase() ===
    String(customerName || "").trim().toLowerCase();

  const sameSite =
    String(u.siteName || "").trim().toLowerCase() ===
    String(siteName || "").trim().toLowerCase();

  return Boolean(customerName.trim() && siteName.trim() && sameCustomer && sameSite);
});
"""

if "const siteUnitsAtLocation = savedUnits.filter(" not in text:
    if state_anchor not in text:
        raise SystemExit("Could not find state anchor for site-units derived list.")
    text = text.replace(state_anchor, state_anchor + "\n" + derived_block, 1)

# B) Insert panel directly after Current Loaded Unit section
anchor = '<SectionCard title="Parts & Manuals Assist">'
idx = text.find(anchor)
if idx == -1:
    raise SystemExit('Could not find "Parts & Manuals Assist" anchor.')

block = """
        <div style={{ marginTop: 16 }}>
          <SectionCard title="Site Units at This Location">
            {!customerName.trim() || !siteName.trim() ? (
              <SmallHint>
                Enter customer and site to see other units already saved at this location.
              </SmallHint>
            ) : !siteUnitsAtLocation.length ? (
              <SmallHint>
                No saved units found yet for this customer/site.
              </SmallHint>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                <SmallHint>
                  Saved units already at this site: <b>{siteUnitsAtLocation.length}</b>
                </SmallHint>

                {siteUnitsAtLocation.map((unit) => (
                  <div
                    key={unit.id}
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 10,
                      padding: 10,
                      background:
                        currentLoadedUnitId && currentLoadedUnitId === unit.id
                          ? "#f7fbff"
                          : "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        {unit.unitNickname || "No Unit Tag"}
                      </div>

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
                        {unit.equipmentType || "Unknown Type"}
                      </span>

                      {currentLoadedUnitId && currentLoadedUnitId === unit.id ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: 999,
                            border: "1px solid #cfcfcf",
                            background: "#eefaf0",
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          CURRENTLY LOADED
                        </span>
                      ) : null}
                    </div>

                    <SmallHint style={{ marginTop: 6 }}>
                      {unit.manufacturer || "-"} {unit.model || "-"} • Serial: {unit.serialNumber || "-"}
                    </SmallHint>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

"""

text = text[:idx] + block + text[idx:]
path.write_text(text)
print("Added Site Units at This Location panel.")