from __future__ import annotations

import re
import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def try_replace_once(text: str, pattern: str, replacement: str, label: str) -> str:
    new_text, count = re.subn(pattern, replacement, text, count=1, flags=re.DOTALL)
    print(f"{label}: {'patched' if count else 'skipped'}")
    return new_text


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "top-surface-simplification-no-fail-v1" in source:
        print("Top surface simplification no-fail patch already applied.")
        return

    source = "/* top-surface-simplification-no-fail-v1 */\n" + source

    # 1) Rename Current Call Summary -> Current Call
    source = try_replace_once(
        source,
        r'(fontSize:\s*15\s*\}>\s*)Current Call Summary(\s*</div>)',
        r'\1Current Call\2',
        "rename Current Call Summary",
    )

    # 2) Add Circuit pill after Symptom pill in the top summary row
    source = try_replace_once(
        source,
        r'(<b>Symptom:</b>\s*\{symptom\s*\|\|\s*"-"\}\s*</SmallHint>\s*</div>\s*)(<div)',
        r'''\1
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

                \2''',
        "add Circuit pill after Symptom",
    )

    # 3) Rename Field Action Bar -> Quick Actions if present
    source = try_replace_once(
        source,
        r'(fontSize:\s*16\s*\}>\s*)Field Action Bar(\s*</div>)',
        r'\1Quick Actions\2',
        "rename Field Action Bar",
    )

    backup = PAGE.with_name(PAGE.name + ".top-surface-simplification-no-fail-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
