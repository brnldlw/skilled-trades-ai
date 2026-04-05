from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "hide-advanced-sections-by-default-v1" in source:
        print("Hide Advanced Sections by Default v1 already applied.")
        return

    helper_block = """      // hide-advanced-sections-by-default-v1
      const [showAdvancedAIOutput, setShowAdvancedAIOutput] = useState(false);
      const [showRealFlowchartEngine, setShowRealFlowchartEngine] = useState(false);

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "advanced section toggle state",
    )

    flowchart_old = """      <div style={{ marginTop: 16 }}>
        <SectionCard title="Real Flowchart Engine">"""
    flowchart_new = """      <div style={{ marginTop: 16 }}>
        <SectionCard
          title="Real Flowchart Engine"
          right={
            <button
              type="button"
              onClick={() => setShowRealFlowchartEngine((prev) => !prev)}
              style={{
                padding: "6px 10px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              {showRealFlowchartEngine ? "Hide" : "Show"}
            </button>
          }
        >
          {!showRealFlowchartEngine ? (
            <SmallHint>
              Hidden by default. Open this when you want deeper flowchart-style troubleshooting.
            </SmallHint>
          ) : null}

          {showRealFlowchartEngine ? (
"""
    source = replace_once(source, flowchart_old, flowchart_new, "real flowchart section header")

    flowchart_close_old = """        </SectionCard>
      </div>

      {/* smart-readings-parser-v1 */}"""
    flowchart_close_new = """          ) : null}
        </SectionCard>
      </div>

      {/* smart-readings-parser-v1 */}"""
    source = replace_once(source, flowchart_close_old, flowchart_close_new, "real flowchart section close")

    advanced_ai_old = """      <div style={{ marginTop: 16 }}>
        <SectionCard title="Advanced AI Output">"""
    advanced_ai_new = """      <div style={{ marginTop: 16 }}>
        <SectionCard
          title="Advanced AI Output"
          right={
            <button
              type="button"
              onClick={() => setShowAdvancedAIOutput((prev) => !prev)}
              style={{
                padding: "6px 10px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              {showAdvancedAIOutput ? "Hide" : "Show"}
            </button>
          }
        >
          {!showAdvancedAIOutput ? (
            <SmallHint>
              Hidden by default. Open this when you want the deeper AI output, raw detail, or extra reasoning support.
            </SmallHint>
          ) : null}

          {showAdvancedAIOutput ? (
"""
    source = replace_once(source, advanced_ai_old, advanced_ai_new, "advanced AI section header")

    advanced_ai_close_old = """        </SectionCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <SectionCard title="Charge Analysis">"""
    advanced_ai_close_new = """          ) : null}
        </SectionCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <SectionCard title="Charge Analysis">"""
    source = replace_once(source, advanced_ai_close_old, advanced_ai_close_new, "advanced AI section close")

    backup = PAGE.with_name(PAGE.name + ".hide-advanced-sections-by-default-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
