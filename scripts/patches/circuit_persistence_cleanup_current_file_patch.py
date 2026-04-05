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

    if "circuit-persistence-cleanup-current-file-v1" in source:
        print("Circuit persistence cleanup already applied.")
        return

    source = "/* circuit-persistence-cleanup-current-file-v1 */\n" + source

    source = replace_once(
        source,
        '  setTechCloseoutNotes(event.tech_closeout_notes || "");',
        '  setTechCloseoutNotes(hydrateCircuitFromNotes(event.tech_closeout_notes || ""));',
        "loadServiceEventIntoForm hydrate circuit",
    )

    source = replace_once(
        source,
        '      tech_closeout_notes: techCloseoutNotes || "",',
        '      tech_closeout_notes: buildTechNotesWithCircuit(techCloseoutNotes || ""),',
        "updateCurrentServiceEvent save circuit",
    )

    source = replace_once(
        source,
        '    setTechCloseoutNotes(mergedRecord.techCloseoutNotes || "");',
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(mergedRecord.techCloseoutNotes || ""));',
        "loadUnit hydrate circuit",
    )

    source = replace_once(
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

    backup = PAGE.with_name(PAGE.name + ".circuit-persistence-cleanup-current-file-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
