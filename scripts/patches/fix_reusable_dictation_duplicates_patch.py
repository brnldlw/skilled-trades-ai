from __future__ import annotations

import re
import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def remove_regex_once(text: str, pattern: str, label: str) -> tuple[str, bool]:
    new_text, count = re.subn(pattern, "", text, count=1, flags=re.DOTALL)
    return new_text, count > 0


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")
    original = source

    # Remove old one-off helper block if reusable helper exists after it.
    source, removed_helper = remove_regex_once(
        source,
        r"\n\s*// core-field-dictation-v1.*?(?=\n\s*// reusable-field-dictation-v1)",
        "old core field dictation helper block",
    )

    # Remove old one-off UI blocks so only reusable controls remain.
    source, removed_symptom_ui = remove_regex_once(
        source,
        r"\n\s*\{/\*\s*core-field-dictation-v1-symptom\s*\*/\}.*?(?=\n\s*\{/\*\s*core-field-dictation-v1-confirmed-cause\s*\*/\})",
        "old symptom dictation UI",
    )

    source, removed_confirmed_ui = remove_regex_once(
        source,
        r"\n\s*\{/\*\s*core-field-dictation-v1-confirmed-cause\s*\*/\}.*?(?=\n\s*\{/\*\s*core-field-dictation-v1-actual-fix\s*\*/\})",
        "old confirmed cause dictation UI",
    )

    source, removed_actual_fix_ui = remove_regex_once(
        source,
        r"\n\s*\{/\*\s*core-field-dictation-v1-actual-fix\s*\*/\}.*?(?=\n\s*<label style=\{\{ fontWeight: 900 \}\}>Tech Closeout Notes</label>)",
        "old actual fix dictation UI",
    )

    if source == original:
        print("No old core dictation duplicates were found to remove.")
        return

    backup = PAGE.with_name(PAGE.name + ".fix-reusable-dictation-duplicates.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")
    print(
        "Removed:",
        {
            "helper": removed_helper,
            "symptom_ui": removed_symptom_ui,
            "confirmed_cause_ui": removed_confirmed_ui,
            "actual_fix_ui": removed_actual_fix_ui,
        },
    )


if __name__ == "__main__":
    main()
