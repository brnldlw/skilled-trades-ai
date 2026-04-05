from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_if_present(text: str, old: str, new: str, label: str) -> str:
    if old in text:
        count = text.count(old)
        print(f"Patched {count} occurrence(s): {label}")
        return text.replace(old, new)
    print(f"Skipped: {label}")
    return text


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "safe-cleanup-pass-current-file-v1" in source:
        print("Safe cleanup pass already applied.")
        return

    source = "/* safe-cleanup-pass-current-file-v1 */\n" + source

    # 1) loadServiceEventIntoForm -> hydrate circuit from notes
    source = replace_if_present(
        source,
        '  setTechCloseoutNotes(event.tech_closeout_notes || "");',
        '  setTechCloseoutNotes(hydrateCircuitFromNotes(event.tech_closeout_notes || ""));',
        "loadServiceEventIntoForm hydrate circuit",
    )

    # 2) updateCurrentServiceEvent -> save circuit-aware notes where still raw
    source = replace_if_present(
        source,
        '      tech_closeout_notes: techCloseoutNotes || "",',
        '      tech_closeout_notes: buildTechNotesWithCircuit(techCloseoutNotes || ""),',
        "raw service-event tech_closeout_notes saves",
    )

    # 3) loadUnit -> hydrate circuit from notes for mergedRecord variant
    source = replace_if_present(
        source,
        '    setTechCloseoutNotes(mergedRecord.techCloseoutNotes || "");',
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(mergedRecord.techCloseoutNotes || ""));',
        "loadUnit mergedRecord hydrate circuit",
    )

    # 4) loadUnit -> hydrate circuit from notes for record variant
    source = replace_if_present(
        source,
        '    setTechCloseoutNotes(record.techCloseoutNotes || "");',
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(record.techCloseoutNotes || ""));',
        "loadUnit record hydrate circuit",
    )

    # 5) cancelEditingServiceEvent -> also reset circuit state
    source = replace_if_present(
        source,
        """  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setServiceEventPhotoUrls([]);
""",
        """  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setCircuitCount("1");
  setSelectedCircuit("Circuit 1");
  setCustomCircuitLabel("");
  setServiceEventPhotoUrls([]);
""",
        "cancelEditingServiceEvent reset circuit",
    )

    # 6) Error Code UI: make it multiline so one unit can carry multiple active codes
    source = replace_if_present(
        source,
        """                <div>
                  <label style={{ fontWeight: 900 }}>Error Code</label>
                  <input
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    placeholder="Example: E1, HPS, 3 Flash, LP Lockout"
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>
""",
        """                <div>
                  <label style={{ fontWeight: 900 }}>Error Code(s)</label>
                  <textarea
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    placeholder={"Enter one or more codes. Example:\\nE1\\nHPS\\n3 Flash"}
                    rows={4}
                    style={{ width: "100%", padding: 8 }}
                  />
                  <SmallHint>
                    Enter multiple active codes one per line. The app will store them together in the current Error Code field.
                  </SmallHint>
                </div>
""",
        "Error Code input -> multiline textarea",
    )

    # 7) Error Code preview text: make it say codes, not single code
    source = replace_if_present(
        source,
        """                    <b>Current Error Code:</b> {errorCode.trim()} • <b>Source:</b> {errorCodeSource || "Unknown"}
""",
        """                    <b>Current Error Code(s):</b> {errorCode.trim()} • <b>Source:</b> {errorCodeSource || "Unknown"}
""",
        "Error Code preview label",
    )

    backup = PAGE.with_name(PAGE.name + ".safe-cleanup-pass-current-file-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
