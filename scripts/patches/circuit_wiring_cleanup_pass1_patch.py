from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Could not find expected block for: {label}")
    print(f"Patched: {label}")
    return text.replace(old, new, 1)


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "circuit-wiring-cleanup-pass1-v3" in source:
        print("Circuit wiring cleanup pass 1 v3 already applied.")
        return

    source = "/* circuit-wiring-cleanup-pass1-v3 */\n" + source

    # 1) Current Call Summary: add Circuit pill after Symptom pill
    old_summary = """                  <SmallHint>
                    <b>Symptom:</b> {symptom || "-"}
                  </SmallHint>
                </div>

                <div
"""
    new_summary = """                  <SmallHint>
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
                    <b>Circuit:</b> {getSelectedCircuitDisplay() || "-"}
                  </SmallHint>
                </div>

                <div
"""
    source = replace_once(source, old_summary, new_summary, "Current Call Summary circuit pill")

    # 2) loadServiceEventIntoForm: hydrate circuit from notes
    old_load_event = '  setTechCloseoutNotes(event.tech_closeout_notes || "");'
    new_load_event = '  setTechCloseoutNotes(hydrateCircuitFromNotes(event.tech_closeout_notes || ""));'
    source = replace_once(source, old_load_event, new_load_event, "loadServiceEventIntoForm hydrate circuit")

    # 3) cancelEditingServiceEvent: reset circuit state
    old_cancel = """  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setServiceEventPhotoUrls([]);
"""
    new_cancel = """  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setCircuitCount("1");
  setSelectedCircuit("Circuit 1");
  setCustomCircuitLabel("");
  setServiceEventPhotoUrls([]);
"""
    source = replace_once(source, old_cancel, new_cancel, "cancelEditingServiceEvent circuit reset")

    # 4) loadUnit (current mergedRecord version): hydrate circuit from notes
    old_load_unit = '    setTechCloseoutNotes(mergedRecord.techCloseoutNotes || "");'
    new_load_unit = '    setTechCloseoutNotes(hydrateCircuitFromNotes(mergedRecord.techCloseoutNotes || ""));'
    source = replace_once(source, old_load_unit, new_load_unit, "loadUnit hydrate circuit")

    backup = PAGE.with_name(PAGE.name + ".circuit-wiring-cleanup-pass1-v3.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
