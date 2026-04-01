from __future__ import annotations

import re
import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "smart-readings-parser-observations-v1" in source:
        print("Smart readings parser observations patch already applied.")
        return

    old_block = """      function applySmartReadingsParser() {
        const parsed = parseSmartReadingsInput(smartReadingsInput);
        const applied: string[] = [];
"""
    new_block = """      function applySmartReadingsParser() {
        // smart-readings-parser-observations-v1
        const parsed = parseSmartReadingsInput(smartReadingsInput);
        const applied: string[] = [];

        const observationDefinitions = [
          { key: "suctionPressure", label: "Suction Pressure", unit: "psi" },
          { key: "headPressure", label: "Head Pressure", unit: "psi" },
          { key: "superheat", label: "Superheat", unit: "°F" },
          { key: "subcool", label: "Subcool", unit: "°F" },
          { key: "suctionTemp", label: "Suction Line Temp", unit: "°F" },
          { key: "liquidTemp", label: "Liquid Line Temp", unit: "°F" },
          { key: "returnAir", label: "Return Air Temp", unit: "°F" },
          { key: "supplyAir", label: "Supply Air Temp", unit: "°F" },
          { key: "boxTemp", label: "Box Temp", unit: "°F" },
          { key: "ambientTemp", label: "Ambient Temp", unit: "°F" },
        ] as const;

        const parsedObservationRows = observationDefinitions
          .map((definition) => {
            const value = parsed[definition.key as keyof typeof parsed];
            if (value === null || value === undefined || String(value).trim() === "") return null;

            applied.push(`${definition.label}: ${value}`);

            return {
              label: definition.label,
              value: String(value),
              unit: definition.unit,
              note: "Added by Smart Readings Parser",
            };
          })
          .filter(Boolean) as Observation[];

        if (parsedObservationRows.length) {
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
"""
    if old_block not in source:
        raise RuntimeError("Could not find applySmartReadingsParser() start block.")

    source = replace_once(source, old_block, new_block, "applySmartReadingsParser start")

    old_message_block = """        if (!applied.length) {
          setSmartReadingsMessage(
            "Nothing matched existing reading fields yet. Try entries like: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58"
          );
          return;
        }

        setSmartReadingsMessage("Applied: " + applied.join(" • "));
      }
"""
    new_message_block = """        if (!applied.length) {
          setSmartReadingsMessage(
            "Nothing was recognized. Try entries like: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58 box 10"
          );
          return;
        }

        setSmartReadingsMessage("Applied to observations: " + applied.join(" • "));
      }
"""
    if old_message_block not in source:
        raise RuntimeError("Could not find applySmartReadingsParser() message block.")

    source = replace_once(source, old_message_block, new_message_block, "applySmartReadingsParser message block")

    backup = PAGE.with_name(PAGE.name + ".smart-readings-parser-observations.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()