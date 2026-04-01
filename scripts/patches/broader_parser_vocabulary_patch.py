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

    if "broader-parser-vocabulary-v1" in source:
        print("Broader parser vocabulary patch already applied.")
        return

    replacements = [
        (
            """          suctionPressure: findValue([
            /(?:suction|low\\s*side|low)\\s*(?:pressure|psi)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          suctionPressure: findValue([
            // broader-parser-vocabulary-v1
            /(?:suction\\s*pressure|suction\\s*psi|suction|low\\s*side\\s*pressure|low\\s*side\\s*psi|low\\s*side|low\\s*pressure|low\\s*psi|low)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:psi)?\\s*(?:on\\s*)?(?:suction|low\\s*side|low)\\b/i,
          ]),""",
            "suctionPressure",
        ),
        (
            """          headPressure: findValue([
            /(?:head|high\\s*side|high|discharge)\\s*(?:pressure|psi)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          headPressure: findValue([
            /(?:head\\s*pressure|head\\s*psi|head|high\\s*side\\s*pressure|high\\s*side\\s*psi|high\\s*side|high\\s*pressure|high\\s*psi|high|discharge\\s*pressure|discharge\\s*psi|discharge)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:psi)?\\s*(?:on\\s*)?(?:head|high\\s*side|high|discharge)\\b/i,
          ]),""",
            "headPressure",
        ),
        (
            """          superheat: findValue([
            /(?:superheat|sh)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          superheat: findValue([
            /(?:superheat|sh)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:degrees?|°f|f)?\\s*(?:of\\s*)?(?:superheat|sh)\\b/i,
          ]),""",
            "superheat",
        ),
        (
            """          subcool: findValue([
            /(?:subcool|sub\\s*cool|sc)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          subcool: findValue([
            /(?:subcool|sub\\s*cool|sc|subcooling)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:degrees?|°f|f)?\\s*(?:of\\s*)?(?:subcool|sub\\s*cool|sc|subcooling)\\b/i,
          ]),""",
            "subcool",
        ),
        (
            """          suctionTemp: findValue([
            /(?:suction\\s*temp|suction\\s*line\\s*temp|vapor\\s*line\\s*temp|slt)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          suctionTemp: findValue([
            /(?:suction\\s*temp|suction\\s*line\\s*temp|suction\\s*line|vapor\\s*line\\s*temp|vapor\\s*line|slt)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:degrees?|°f|f)?\\s*(?:on\\s*)?(?:suction\\s*line|suction\\s*temp|vapor\\s*line|slt)\\b/i,
          ]),""",
            "suctionTemp",
        ),
        (
            """          liquidTemp: findValue([
            /(?:liquid\\s*temp|liquid\\s*line\\s*temp|llt)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          liquidTemp: findValue([
            /(?:liquid\\s*temp|liquid\\s*line\\s*temp|liquid\\s*line|llt)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:degrees?|°f|f)?\\s*(?:on\\s*)?(?:liquid\\s*line|liquid\\s*temp|llt)\\b/i,
          ]),""",
            "liquidTemp",
        ),
        (
            """          returnAir: findValue([
            /(?:return\\s*air|return)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          returnAir: findValue([
            /(?:return\\s*air\\s*temp|return\\s*air|return\\s*temp|return)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:degrees?|°f|f)?\\s*(?:return\\s*air|return\\s*temp|return)\\b/i,
          ]),""",
            "returnAir",
        ),
        (
            """          supplyAir: findValue([
            /(?:supply\\s*air|supply)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          supplyAir: findValue([
            /(?:supply\\s*air\\s*temp|supply\\s*air|supply\\s*temp|supply)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:degrees?|°f|f)?\\s*(?:supply\\s*air|supply\\s*temp|supply)\\b/i,
          ]),""",
            "supplyAir",
        ),
        (
            """          boxTemp: findValue([
            /(?:box\\s*temp|box|space\\s*temp|case\\s*temp|room\\s*temp)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          boxTemp: findValue([
            /(?:box\\s*temp|box|space\\s*temp|case\\s*temp|room\\s*temp|beer\\s*temp|product\\s*temp)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:degrees?|°f|f)?\\s*(?:box|box\\s*temp|space\\s*temp|case\\s*temp|room\\s*temp|beer\\s*temp|product\\s*temp)\\b/i,
          ]),""",
            "boxTemp",
        ),
        (
            """          ambientTemp: findValue([
            /(?:ambient\\s*temp|ambient|outside\\s*temp|outdoor\\s*ambient|oa\\s*temp)\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
          ]),""",
            """          ambientTemp: findValue([
            /(?:ambient\\s*temp|ambient|outside\\s*temp|outdoor\\s*ambient|outdoor\\s*temp|oa\\s*temp)\\s*(?:is|at|of)?\\s*[:=]?\\s*(-?\\d+(?:\\.\\d+)?)/i,
            /(-?\\d+(?:\\.\\d+)?)\\s*(?:degrees?|°f|f)?\\s*(?:ambient|outside\\s*temp|outdoor\\s*ambient|outdoor\\s*temp|oa\\s*temp)\\b/i,
          ]),""",
            "ambientTemp",
        ),
    ]

    for old, new, label in replacements:
        source = replace_once(source, old, new, label)

    backup = PAGE.with_name(PAGE.name + ".broader-parser-vocabulary.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
