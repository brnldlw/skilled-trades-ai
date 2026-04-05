from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_after_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    insert_at = idx + len(anchor)
    return source[:insert_at] + block + source[insert_at:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "function hydrateCircuitFromNotes(" in source:
        print("hydrateCircuitFromNotes helper already exists.")
        return

    anchor = """      function buildTechNotesWithCircuit(baseText: string) {
        const clean = stripCircuitLineFromNotes(baseText);
        const circuitLabel = getSelectedCircuitDisplay();
        return [circuitLabel ? `Circuit: ${circuitLabel}` : "", clean].filter(Boolean).join("\\n");
      }

"""

    block = """      function hydrateCircuitFromNotes(text: string) {
        const raw = String(text || "");
        const lines = raw.split("\\n");
        const circuitLine = lines.find((line) => line.trim().toLowerCase().startsWith("circuit:"));

        if (!circuitLine) {
          setSelectedCircuit("Circuit 1");
          setCustomCircuitLabel("");
          return stripCircuitLineFromNotes(raw);
        }

        const value = circuitLine.split(":").slice(1).join(":").trim();
        const match = /^Circuit\\s+(\\d+)$/i.exec(value);

        if (match) {
          const num = Number.parseInt(match[1], 10);
          if (Number.isFinite(num) && num > 0) {
            setCircuitCount(String(Math.max(num, Number.parseInt(String(circuitCount || "1"), 10) || 1)));
            setSelectedCircuit(`Circuit ${num}`);
            setCustomCircuitLabel("");
          } else {
            setSelectedCircuit("Circuit 1");
            setCustomCircuitLabel("");
          }
        } else if (value) {
          setSelectedCircuit("Custom");
          setCustomCircuitLabel(value);
        } else {
          setSelectedCircuit("Circuit 1");
          setCustomCircuitLabel("");
        }

        return stripCircuitLineFromNotes(raw);
      }

"""

    updated = insert_after_once(source, anchor, block, "insert hydrateCircuitFromNotes helper")

    backup = PAGE.with_name(PAGE.name + ".add-missing-hydrate-circuit-helper.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(updated, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
