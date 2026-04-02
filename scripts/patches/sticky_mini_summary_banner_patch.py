from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "sticky-mini-summary-banner-v1" in source:
        print("Sticky mini summary banner patch already applied.")
        return

    banner_block = """          {/* sticky-mini-summary-banner-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 10,
                background: "#fffdf7",
                display: "grid",
                gap: 8,
                position: "sticky",
                top: 8,
                zIndex: 21,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 15 }}>
                Current Call Summary
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Unit:</b>{" "}
                    {currentLoadedUnitId
                      ? unitNickname || [manufacturer, model].filter(Boolean).join(" ") || "Loaded unit"
                      : "No unit loaded"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Site:</b> {siteName || siteAddress || customerName || "-"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Component:</b> {getCurrentAffectedComponentLabelForAssist() || primaryComponentRole || "Primary component"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Symptom:</b> {symptom || "-"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Mode:</b>{" "}
                    {editingServiceEventId
                      ? "Editing Event"
                      : historicalEntryMode
                        ? "Historical Entry"
                        : "Live Call"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Dashboard:</b> {showFailureDashboard ? "Open" : "Hidden"}
                  </SmallHint>
                </div>
              </div>
            </div>
          </div>

"""

    source = insert_before_once(
        source,
        "{/* field-action-bar-v1 */}",
        banner_block,
        "sticky mini summary banner UI",
    )

    source = replace_once(
        source,
        '''                position: "sticky",
                top: 8,
                zIndex: 20,''',
        '''                position: "sticky",
                top: 76,
                zIndex: 20,''',
        "field action bar sticky offset",
    )

    backup = PAGE.with_name(PAGE.name + ".sticky-mini-summary-banner-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
