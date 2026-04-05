from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def insert_after_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    insert_at = idx + len(anchor)
    return source[:insert_at] + block + source[insert_at:]


def insert_before_first(source: str, anchors: list[str], block: str, label: str) -> str:
    for anchor in anchors:
        idx = source.find(anchor)
        if idx != -1:
            return source[:idx] + block + source[idx:]
    raise RuntimeError(f"Could not find any expected anchor for: {label}. Tried: {anchors}")


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "step-wrappers-page-reflow-v1" in source:
        print("Step Wrappers / Page Reflow v1 already applied.")
        return

    step_2_header = """
          {/* step-wrappers-page-reflow-v1-step-2 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
            <div
              style={{
                border: "1px solid #dfe7f3",
                borderRadius: 12,
                padding: 12,
                background: "#f8fbff",
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>Step 2 — Complaint + Evidence</div>
              <SmallHint>
                Enter the complaint, select the affected component, and capture readings / photo / observations before using the deeper guidance tools.
              </SmallHint>
            </div>
          </div>

"""

    step_3_header = """
      {/* step-wrappers-page-reflow-v1-step-3 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid #dfe7f3",
            borderRadius: 12,
            padding: 12,
            background: "#f8fbff",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>Step 3 — Diagnose</div>
          <SmallHint>
            Use these sections to decide what to test next, which parts are really in play, and what still needs to be proven before replacement.
          </SmallHint>
        </div>
      </div>

"""

    step_4_header = """
      {/* step-wrappers-page-reflow-v1-step-4 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid #dfe7f3",
            borderRadius: 12,
            padding: 12,
            background: "#f8fbff",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>Step 4 — Repair</div>
          <SmallHint>
            Once a part is selected, use these sections to verify it correctly, focus on the right manual/parts area, and execute the repair safely.
          </SmallHint>
        </div>
      </div>

"""

    step_5_header = """
      {/* step-wrappers-page-reflow-v1-step-5 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid #dfe7f3",
            borderRadius: 12,
            padding: 12,
            background: "#f8fbff",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>Step 5 — Closeout + Follow-Up</div>
          <SmallHint>
            Commit what was verified or replaced, generate the closeout, and leave with a follow-up watchlist that lowers callback risk.
          </SmallHint>
        </div>
      </div>

"""

    step_6_header = """
      {/* step-wrappers-page-reflow-v1-step-6 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid #f0e6c8",
            borderRadius: 12,
            padding: 12,
            background: "#fffaf0",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>Step 6 — Advanced / Optional</div>
          <SmallHint>
            These sections are useful, but they are not the main live-call path. Use them when you need extra intelligence or deeper context.
          </SmallHint>
        </div>
      </div>

"""

    after_action_anchor = """                <button
                  type="button"
                  onClick={() => void loadFailureIntelligenceDashboardData()}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Refresh Dashboard
                </button>
"""
    source = insert_after_once(source, after_action_anchor, step_2_header, "Step 2 header")

    source = insert_before_once(
        source,
        '{/* repair-decision-panel-v2 */}',
        step_3_header,
        "Step 3 header",
    )

    source = insert_before_once(
        source,
        '{/* repair-execution-assist-v1 */}',
        step_4_header,
        "Step 4 header",
    )

    source = insert_before_once(
        source,
        '{/* suggested-follow-up-watchlist-v1 */}',
        step_5_header,
        "Step 5 header",
    )

    source = insert_before_first(
        source,
        [
            '{/* failure-intelligence-dashboard-v1 */}',
            '{/* failure-dashboard-toggle-only-v1 */}',
            '<SectionCard title="Failure Intelligence Dashboard">',
            '<SectionCard title="Advanced AI Output">',
            '<SectionCard title="Real Flowchart Engine">',
        ],
        step_6_header,
        "Step 6 header",
    )

    backup = PAGE.with_name(PAGE.name + ".step-wrappers-page-reflow-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
