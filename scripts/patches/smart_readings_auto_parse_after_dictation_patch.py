from __future__ import annotations

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

    if "smart-readings-auto-parse-v1" in source:
        print("Smart readings auto-parse patch already applied.")
        return

    # 1) Let parser accept direct text input override
    source = replace_once(
        source,
        """      function applySmartReadingsParser() {
        // smart-readings-parser-observations-v1
        const parsed = parseSmartReadingsInput(smartReadingsInput);
        const applied: string[] = [];
""",
        """      function applySmartReadingsParser(inputOverride?: string) {
        // smart-readings-parser-observations-v1
        // smart-readings-auto-parse-v1
        const parserInput =
          typeof inputOverride === "string" ? inputOverride : smartReadingsInput;
        const parsed = parseSmartReadingsInput(parserInput);
        const applied: string[] = [];
""",
        "applySmartReadingsParser signature",
    )

    # 2) Change dictation result handler to auto-parse the combined text
    source = replace_once(
        source,
        """          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            setSmartReadingsInput((prev) =>
              [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setSmartReadingsMessage(
              "Dictation captured. Review the text and tap Parse Readings."
            );
          };
""",
        """          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            const nextText = [String(smartReadingsInput || "").trim(), cleaned]
              .filter(Boolean)
              .join(" ");

            setSmartReadingsInput(nextText);
            applySmartReadingsParser(nextText);
            setSmartReadingsMessage(
              "Dictation captured and auto-parsed. Review the parser result below."
            );
          };
""",
        "dictation onresult auto-parse",
    )

    backup = PAGE.with_name(PAGE.name + ".smart-readings-auto-parse.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()