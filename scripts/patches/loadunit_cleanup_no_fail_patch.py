from __future__ import annotations

import re
import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_if_present(text: str, old: str, new: str, label: str) -> str:
    if old in text:
        count = text.count(old)
        print(f"{label}: patched {count} occurrence(s)")
        return text.replace(old, new)
    print(f"{label}: skipped")
    return text


def remove_duplicate_record_tail(text: str) -> str:
    old = """    setOutcomeStatus(record.outcomeStatus || "Not Set");
    setCallbackOccurred(record.callbackOccurred || "No");
    setTechCloseoutNotes(record.techCloseoutNotes || "");
    setOutcomeStatus(record.outcomeStatus || "Not Set");
setCallbackOccurred(record.callbackOccurred || "No");
setTechCloseoutNotes(record.techCloseoutNotes || "");

loadUnitServiceTimeline(record.id);
"""
    new = """    setOutcomeStatus(record.outcomeStatus || "Not Set");
    setCallbackOccurred(record.callbackOccurred || "No");
    setTechCloseoutNotes(hydrateCircuitFromNotes(record.techCloseoutNotes || ""));

loadUnitServiceTimeline(record.id);
"""
    return replace_if_present(text, old, new, "record loadUnit duplicate tail cleanup")


def patch_merged_record_variant(text: str) -> str:
    return replace_if_present(
        text,
        '    setTechCloseoutNotes(mergedRecord.techCloseoutNotes || "");',
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(mergedRecord.techCloseoutNotes || ""));',
        "mergedRecord loadUnit hydrate circuit",
    )


def patch_record_variant_single(text: str) -> str:
    return replace_if_present(
        text,
        '    setTechCloseoutNotes(record.techCloseoutNotes || "");',
        '    setTechCloseoutNotes(hydrateCircuitFromNotes(record.techCloseoutNotes || ""));',
        "record loadUnit hydrate circuit",
    )


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "loadunit-cleanup-no-fail-v1" in source:
        print("loadUnit cleanup no-fail patch already applied.")
        return

    source = "/* loadunit-cleanup-no-fail-v1 */\n" + source

    source = patch_merged_record_variant(source)
    source = remove_duplicate_record_tail(source)
    source = patch_record_variant_single(source)

    backup = PAGE.with_name(PAGE.name + ".loadunit-cleanup-no-fail-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
