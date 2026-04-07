from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_first(text: str, anchors: list[str], block: str, label: str) -> str:
    for anchor in anchors:
        idx = text.find(anchor)
        if idx != -1:
            print(f"Inserted: {label}")
            return text[:idx] + block + text[idx:]
    print(f"Skipped: {label}")
    return text


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "top-site-units-block-v1" in source:
        print("Top Site Units block already applied.")
        return

    source = "/* top-site-units-block-v1 */\n" + source

    block = """
          {/* top-site-units-block-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
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

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                        <PillButton text="Load This Unit" onClick={() => loadUnit(unit)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

"""

    source = insert_before_first(
        source,
        [
            "{/* top-equipment-details-block-v1 */}",
            "{/* top-complaint-evidence-block-v1 */}",
            "{/* restore-error-code-top-section-v1 */}",
        ],
        block,
        "Top Site Units block",
    )

    backup = PAGE.with_name(PAGE.name + ".top-site-units-block-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
