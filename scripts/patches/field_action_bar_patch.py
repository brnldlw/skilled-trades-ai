from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "field-action-bar-v1" in source:
        print("Field action bar patch already applied.")
        return

    ui_block = """          {/* field-action-bar-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                display: "grid",
                gap: 10,
                position: "sticky",
                top: 8,
                zIndex: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  Field Action Bar
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {currentLoadedUnitId ? (
                    <span
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        background: "#fafafa",
                      }}
                    >
                      Loaded Unit
                    </span>
                  ) : null}

                  {editingServiceEventId ? (
                    <span
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        background: "#fff8e8",
                      }}
                    >
                      Editing Event
                    </span>
                  ) : null}

                  {historicalEntryMode ? (
                    <span
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        background: "#eef6ff",
                      }}
                    >
                      Historical Mode
                    </span>
                  ) : null}
                </div>
              </div>

              <SmallHint>
                Quick access to the main actions a tech uses on the live call.
              </SmallHint>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => applySmartReadingsParser()}
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
                  Parse Readings
                </button>

                <button
                  type="button"
                  onClick={buildDiagnosticCloseoutDrafts}
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
                  Generate Closeout
                </button>

                {!editingServiceEventId ? (
                  <button
                    type="button"
                    onClick={() => void saveCurrentCallAsServiceEvent()}
                    disabled={!currentLoadedUnitId}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: currentLoadedUnitId ? "pointer" : "not-allowed",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity: currentLoadedUnitId ? 1 : 0.7,
                    }}
                  >
                    Save Current Call
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void updateCurrentServiceEvent()}
                    disabled={!currentLoadedUnitId}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: currentLoadedUnitId ? "pointer" : "not-allowed",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity: currentLoadedUnitId ? 1 : 0.7,
                    }}
                  >
                    Update Event
                  </button>
                )}

                {editingServiceEventId ? (
                  <button
                    type="button"
                    onClick={cancelEditingServiceEvent}
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
                    Cancel Edit
                  </button>
                ) : null}

                {historicalEntryMode ? (
                  <button
                    type="button"
                    onClick={() => void saveHistoricalCallAndReset()}
                    disabled={!currentLoadedUnitId}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: currentLoadedUnitId ? "pointer" : "not-allowed",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity: currentLoadedUnitId ? 1 : 0.7,
                    }}
                  >
                    Save & Add Another
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setShowFailureDashboard((prev) => !prev);
                    if (!showFailureDashboard) {
                      void loadFailureIntelligenceDashboardData();
                    }
                  }}
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
                  {showFailureDashboard ? "Hide Dashboard" : "Open Dashboard"}
                </button>

                <button
                  type="button"
                  onClick={() => void loadFailureIntelligenceDashboardData()}
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
                  Refresh Dashboard
                </button>
              </div>
            </div>
          </div>

"""
    source = insert_before_once(
        source,
        "{/* smart-readings-parser-v1 */}",
        ui_block,
        "field action bar UI",
    )

    backup = PAGE.with_name(PAGE.name + ".field-action-bar-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
