from __future__ import annotations

import re
import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_one_of(text: str, olds: list[str], new: str, label: str) -> str:
    for old in olds:
        if old in text:
            print(f"Patched: {label}")
            return text.replace(old, new, 1)
    print(f"Skipped: {label}")
    return text


def replace_all(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count:
        print(f"Patched {count} occurrence(s): {label}")
        return text.replace(old, new)
    print(f"Skipped: {label}")
    return text


def remove_duplicate_loadunit_lines(text: str) -> str:
    pattern = (
        r'\n\s*setOutcomeStatus\(record\.outcomeStatus \|\| "Not Set"\);'
        r'\n\s*setCallbackOccurred\(record\.callbackOccurred \|\| "No"\);'
    )
    matches = list(re.finditer(pattern, text))
    if len(matches) >= 2:
        # remove the second duplicate pair only
        start, end = matches[1].span()
        text = text[:start] + text[end:]
        print("Patched: removed duplicate loadUnit outcome/callback lines")
    else:
        print("Skipped: duplicate loadUnit outcome/callback cleanup")
    return text


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "circuit-persistence-safe-patch-v1" in source:
        print("Circuit persistence safe patch already applied.")
        return

    source = "/* circuit-persistence-safe-patch-v1 */\n" + source

    source = replace_one_of(
        source,
        ['  setTechCloseoutNotes(event.tech_closeout_notes || "");'],
        '  setTechCloseoutNotes(hydrateCircuitFromNotes(event.tech_closeout_notes || ""));',
        "loadServiceEventIntoForm hydrate circuit",
    )

    source = replace_one_of(
        source,
        [
            """  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setServiceEventPhotoUrls([]);
""",
            """  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setServiceEventPhotoUrls([]);
  setServiceEventPhotoMessage("");
""",
        ],
        """  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setCircuitCount("1");
  setSelectedCircuit("Circuit 1");
  setCustomCircuitLabel("");
  setServiceEventPhotoUrls([]);
""",
        "cancelEditingServiceEvent reset circuit",
    )

    source = replace_all(
        source,
        '      tech_closeout_notes: techCloseoutNotes || "",',
        '      tech_closeout_notes: buildTechNotesWithCircuit(techCloseoutNotes || ""),',
        "raw tech_closeout_notes saves",
    )

    source = replace_one_of(
        source,
        [
            '    setTechCloseoutNotes(mergedRecord.techCloseoutNotes || "");',
            '    setTechCloseoutNotes(record.techCloseoutNotes || "");',
        ],
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(record.techCloseoutNotes || ""));',
        "loadUnit hydrate circuit (record)",
    )

    source = source.replace(
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(record.techCloseoutNotes || ""));',
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(record.techCloseoutNotes || ""));'
    )
    source = source.replace(
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(mergedRecord.techCloseoutNotes || ""));',
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(mergedRecord.techCloseoutNotes || ""));'
    )

    source = remove_duplicate_loadunit_lines(source)

    backup = PAGE.with_name(PAGE.name + ".circuit-persistence-safe-patch-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
