from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_after_once(text: str, anchor: str, block: str, label: str) -> str:
    idx = text.find(anchor)
    if idx == -1:
        print(f"Skipped: {label}")
        return text
    insert_at = idx + len(anchor)
    print(f"Inserted: {label}")
    return text[:insert_at] + block + text[insert_at:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "top-equipment-details-block-v1" in source:
        print("Top equipment details block already applied.")
        return

    source = "/* top-equipment-details-block-v1 */\n" + source

    anchor = """          {/* top-identify-equipment-block-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
            <div
              style={{
                border: "1px solid #dfe7f3",
                borderRadius: 12,
                padding: 12,
                background: "#f8fbff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>Step 1 — Identify Equipment</div>
              <SmallHint>
                Fill out the site, unit tag, property type, and equipment type first so the rest of the call stays tied to the right machine.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Customer Name</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Site Name</label>
                  <input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>Site Address</label>
                  <input
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Unit Nickname / Tag</label>
                  <input
                    value={unitNickname}
                    onChange={(e) => setUnitNickname(e.target.value)}
                    placeholder="RTU-1, WIC-1, AHU-2, Circuit A"
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Institutional">Institutional</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Equipment Type</label>
                  <select
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    {unitOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

"""

    block = """
          {/* top-equipment-details-block-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #dfe7f3",
                borderRadius: 12,
                padding: 12,
                background: "#f8fbff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>Step 1B — Equipment Details</div>
              <SmallHint>
                Fill in the make, model, serial, and refrigerant early so diagnosis, manuals, and parts guidance stay tied to the correct equipment.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Manufacturer</label>
                  <input
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Model</label>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Serial Number</label>
                  <input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Refrigerant Type</label>
                  <select
                    value={refrigerantType}
                    onChange={(e) => setRefrigerantType(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    {refrigerantOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

"""

    source = insert_after_once(source, anchor, block, "Top equipment details block")

    backup = PAGE.with_name(PAGE.name + ".top-equipment-details-block-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
