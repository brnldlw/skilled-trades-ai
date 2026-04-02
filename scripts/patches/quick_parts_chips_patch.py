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

    if "quick-parts-chips-v1" in source:
        print("Quick Parts Chips patch already applied.")
        return

    anchor = """          {partsReplacedDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Parts Replaced Dictation:</b> {partsReplacedDictationMessage}
            </SmallHint>
          ) : null}
"""

    block = """
          {/* quick-parts-chips-v1 */}
          {(() => {
            const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "").toLowerCase();
            const equipment = String(equipmentType || "").toLowerCase();
            const issue = String(symptom || "").toLowerCase();

            const suggestedFromRepairPanel =
              typeof buildRepairDecisionPanelItems === "function"
                ? buildRepairDecisionPanelItems().map((item) => item.part)
                : [];

            const chips = [];

            for (const item of suggestedFromRepairPanel) {
              if (item && !chips.includes(item)) chips.push(item);
            }

            const addChip = (label: string) => {
              if (label && !chips.includes(label)) chips.push(label);
            };

            if (
              targetComponent.includes("condensing") ||
              targetComponent.includes("outdoor") ||
              targetComponent.includes("condenser")
            ) {
              addChip("Contactor");
              addChip("Run Capacitor");
              addChip("Condenser Fan Motor");
            }

            if (targetComponent.includes("evaporator") || targetComponent.includes("indoor head")) {
              addChip("Evaporator Fan Motor");
              addChip("Defrost Heater");
              addChip("TXV");
            }

            if (targetComponent.includes("furnace")) {
              addChip("Ignitor");
              addChip("Flame Sensor");
              addChip("Pressure Switch");
            }

            if (targetComponent.includes("air handler") || targetComponent.includes("indoor unit")) {
              addChip("Blower Motor");
              addChip("Float Switch");
              addChip("Relay / Sequencer");
            }

            if (equipment.includes("walk-in")) {
              addChip("Defrost Termination");
              addChip("Defrost Control");
              addChip("Evaporator Fan Motor");
            }

            if (equipment.includes("ice machine")) {
              addChip("Water Valve");
              addChip("Water Pump");
              addChip("Sensor");
            }

            if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
              addChip("Defrost Heater");
              addChip("Defrost Termination");
              addChip("Drain Heater");
            }

            if (issue.includes("not cooling") || issue.includes("no cool")) {
              addChip("Contactor");
              addChip("Run Capacitor");
              addChip("Blower Motor");
            }

            if (!chips.length) return null;

            return (
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                <SmallHint>
                  <b>Quick Parts Chips:</b> Tap to add common replacement parts faster.
                </SmallHint>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {chips.slice(0, 10).map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setPartsReplaced((prev) => {
                          const current = String(prev || "").trim();
                          const existing = current
                            .split(/[;,]/)
                            .map((item) => item.trim().toLowerCase())
                            .filter(Boolean);

                          if (existing.includes(chip.trim().toLowerCase())) {
                            return current;
                          }

                          return [current, chip].filter(Boolean).join(", ");
                        })
                      }
                      style={{
                        padding: "6px 10px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 999,
                        background: "#ffffff",
                        color: "#111",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
"""

    updated = insert_after_once(source, anchor, block, "quick parts chips insert")

    backup = PAGE.with_name(PAGE.name + ".quick-parts-chips-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(updated, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
