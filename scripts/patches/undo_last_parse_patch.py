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

    if "smart-readings-undo-v1" in source:
        print("Undo Last Parse patch already applied.")
        return

    helper_block = """      // smart-readings-undo-v1
      const [smartReadingsUndoSnapshot, setSmartReadingsUndoSnapshot] = useState<Observation[] | null>(null);

      function undoLastSmartReadingsParse() {
        if (!smartReadingsUndoSnapshot) {
          setSmartReadingsMessage("No parsed readings to undo.");
          return;
        }

        setObservations(
          Array.isArray(smartReadingsUndoSnapshot)
            ? smartReadingsUndoSnapshot.map((item) => ({ ...item }))
            : []
        );
        setSmartReadingsUndoSnapshot(null);
        setSmartReadingsMessage("Last parsed readings were undone.");
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "undo helper block",
    )

    source = replace_once(
        source,
        """        if (parsedObservationRows.length) {
          setObservations((prev) => {
""",
        """        if (parsedObservationRows.length) {
          setSmartReadingsUndoSnapshot(
            Array.isArray(observations) ? observations.map((item) => ({ ...item })) : []
          );

          setObservations((prev) => {
""",
        "snapshot before parse",
    )

    undo_button_block = """
                <button
                  type="button"
                  onClick={undoLastSmartReadingsParse}
                  disabled={!smartReadingsUndoSnapshot}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: smartReadingsUndoSnapshot ? "pointer" : "not-allowed",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity: smartReadingsUndoSnapshot ? 1 : 0.7,
                  }}
                >
                  Undo Last Parse
                </button>

"""

    source = insert_before_once(
        source,
        """                <button
                  type="button"
                  onClick={startSmartReadingsDictation}""",
        undo_button_block,
        "undo button insertion",
    )

    backup = PAGE.with_name(PAGE.name + ".undo-last-parse.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
