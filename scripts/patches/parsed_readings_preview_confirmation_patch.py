from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "smart-readings-preview-v1" in source:
        print("Parsed readings preview / confirmation patch already applied.")
        return

    helper_block = """      // smart-readings-preview-v1
      const [smartReadingsPreviewRows, setSmartReadingsPreviewRows] = useState<Observation[]>([]);

      function mergeSmartReadingRows(
        base: Observation[],
        rows: Observation[]
      ): Observation[] {
        const next = [...base];

        for (const row of rows) {
          const normalizedLabel = row.label.trim().toLowerCase();
          const existingIndex = next.findIndex(
            (item) => String(item?.label || "").trim().toLowerCase() === normalizedLabel
          );

          if (existingIndex >= 0) {
            next[existingIndex] = row;
          } else {
            next.push(row);
          }
        }

        return next;
      }

      function applySmartReadingsPreview() {
        if (!smartReadingsPreviewRows.length) {
          setSmartReadingsMessage("No parsed readings are waiting for confirmation.");
          return;
        }

        setSmartReadingsUndoSnapshot(
          Array.isArray(observations) ? observations.map((item) => ({ ...item })) : []
        );

        setObservations((prev) => mergeSmartReadingRows(prev, smartReadingsPreviewRows));
        setSmartReadingsMessage(
          "Applied to observations: " +
            smartReadingsPreviewRows
              .map((row) => `${row.label}: ${row.value}${row.unit ? ` ${row.unit}` : ""}`)
              .join(" • ")
        );
        setSmartReadingsPreviewRows([]);
      }

      function cancelSmartReadingsPreview() {
        setSmartReadingsPreviewRows([]);
        setSmartReadingsMessage("Parsed readings preview cleared.");
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "preview helpers",
    )

    old_apply_block = """        if (parsedObservationRows.length) {
          setSmartReadingsUndoSnapshot(
            Array.isArray(observations) ? observations.map((item) => ({ ...item })) : []
          );

          setObservations((prev) => {
            const next = [...prev];

            for (const row of parsedObservationRows) {
              const normalizedLabel = row.label.trim().toLowerCase();
              const existingIndex = next.findIndex(
                (item) => String(item?.label || "").trim().toLowerCase() === normalizedLabel
              );

              if (existingIndex >= 0) {
                next[existingIndex] = row;
              } else {
                next.push(row);
              }
            }

            return next;
          });
        }

        if (!applied.length) {
          setSmartReadingsMessage(
            "Nothing was recognized. Try entries like: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58 box 10"
          );
          return;
        }

        setSmartReadingsMessage("Applied to observations: " + applied.join(" • "));
      }
"""
    new_apply_block = """        if (!applied.length) {
          setSmartReadingsPreviewRows([]);
          setSmartReadingsMessage(
            "Nothing was recognized. Try entries like: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58 box 10"
          );
          return;
        }

        setSmartReadingsPreviewRows(parsedObservationRows);
        setSmartReadingsMessage("Preview ready: " + applied.join(" • "));
      }
"""
    source = replace_once(source, old_apply_block, new_apply_block, "apply parser preview conversion")

    old_clear_block = """      function clearSmartReadingsParser() {
        setSmartReadingsInput("");
        setSmartReadingsMessage("");
      }

"""
    new_clear_block = """      function clearSmartReadingsParser() {
        setSmartReadingsInput("");
        setSmartReadingsMessage("");
        setSmartReadingsPreviewRows([]);
      }

"""
    source = replace_once(source, old_clear_block, new_clear_block, "clear parser preview reset")

    old_message_block = """              {smartReadingsMessage ? (
                <SmallHint>
                  <b>Parser Result:</b> {smartReadingsMessage}
                </SmallHint>
              ) : null}
"""
    new_message_block = """              {smartReadingsMessage ? (
                <SmallHint>
                  <b>Parser Result:</b> {smartReadingsMessage}
                </SmallHint>
              ) : null}

              {smartReadingsPreviewRows.length ? (
                <div
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 10,
                    padding: 12,
                    background: "#fffdf7",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    Parsed Readings Preview
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {smartReadingsPreviewRows.map((row, idx) => (
                      <div
                        key={`${row.label}-${idx}`}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 10,
                          padding: 10,
                          background: "#fafafa",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
                          {row.label}
                        </div>
                        <div style={{ marginTop: 4, fontWeight: 700 }}>
                          {row.value}{row.unit ? ` ${row.unit}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={applySmartReadingsPreview}
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
                      Apply Parsed Readings
                    </button>

                    <button
                      type="button"
                      onClick={cancelSmartReadingsPreview}
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
                      Cancel Preview
                    </button>
                  </div>
                </div>
              ) : null}
"""
    source = replace_once(source, old_message_block, new_message_block, "preview UI")

    backup = PAGE.with_name(PAGE.name + ".parsed-readings-preview-confirmation.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
