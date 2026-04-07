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

    if "stop-floating-current-loaded-unit-v1" in source:
        print("Stop floating Current Loaded Unit patch already applied.")
        return

    source = "/* stop-floating-current-loaded-unit-v1 */\n" + source

    source = replace_once(
        source,
        """        <div
          style={{
            marginTop: 16,
            position: "sticky",
            top: 12,
            zIndex: 20,
          }}
        >
          <SectionCard title="Current Loaded Unit (hidden)">""",
        """        <div
          style={{
            marginTop: 16,
          }}
        >
          <SectionCard title="Current Loaded Unit">""",
        "Current Loaded Unit stop floating",
    )

    backup = PAGE.with_name(PAGE.name + ".stop-floating-current-loaded-unit-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
