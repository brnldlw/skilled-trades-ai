from __future__ import annotations

import re
import shutil
from pathlib import Path
from textwrap import dedent

TARGET = Path("app/hvac_units/page.tsx")
BACKUP_SUFFIX = ".paired-equipment-v2.bak"

STATE_SENTINEL = "paired-equipment-state-v2"
UI_SENTINEL = "paired-equipment-ui-v2"
SAVE_SENTINEL = "paired-equipment-save-guard-v2"


def insert_after(source: str, anchor: str, block: str, sentinel: str) -> tuple[str, bool]:
    if sentinel in source:
        return source, False
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find anchor: {anchor!r}")
    insert_at = idx + len(anchor)
    return source[:insert_at] + block + source[insert_at:], True


def insert_before(source: str, anchor: str, block: str, sentinel: str) -> tuple[str, bool]:
    if sentinel in source:
        return source, False
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find anchor: {anchor!r}")
    return source[:idx] + block + "\n\n" + source[idx:], True


def main() -> None:
    if not TARGET.exists():
        raise FileNotFoundError(f"Could not find target file: {TARGET}")

    original = TARGET.read_text(encoding="utf-8")
    updated = original
    changed_any = False

    state_anchor = dedent("""\
      const [unitServiceTimeline, setUnitServiceTimeline] = useState<
      import("../lib/supabase/work-orders").ServiceEventRow[]
    >([]);
      const [unitServiceTimelineLoading, setUnitServiceTimelineLoading] = useState(false);
      const [unitServiceTimelineMessage, setUnitServiceTimelineMessage] = useState("");
    """)

    state_block = dedent("""\

      // paired-equipment-state-v2
      const [pairedEquipmentType, setPairedEquipmentType] = useState("none");
      const [secondaryUnitTag, setSecondaryUnitTag] = useState("");
      const [unitTagStatus, setUnitTagStatus] = useState<"readable" | "partial" | "unreadable">("readable");
      const [tagIssueReason, setTagIssueReason] = useState("");
      const [checkedInsideForInternalLabel, setCheckedInsideForInternalLabel] = useState(false);
    """)

    updated, changed = insert_after(updated, state_anchor, state_block, STATE_SENTINEL)
    changed_any = changed_any or changed

    ui_anchor = "{!historicalEntryMode ? ("

    ui_block = dedent("""\
      {/* paired-equipment-ui-v2 */}
      <SectionCard title="Paired Equipment / Tag Identity">
        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          <SmallHint>
            Use this when one call involves two linked pieces of equipment like outdoor + indoor,
            condensing unit + evaporator, furnace + AC, or mini-split outdoor + indoor.
          </SmallHint>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Paired Equipment Type</span>
              <select
                value={pairedEquipmentType}
                onChange={(e) => setPairedEquipmentType(e.target.value)}
                style={{
                  padding: 10,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#fff",
                }}
              >
                <option value="none">None / single piece of equipment</option>
                <option value="split_system">Split system</option>
                <option value="furnace_ac">Furnace + AC</option>
                <option value="heat_pump_air_handler">Heat pump + air handler</option>
                <option value="walk_in_condensing_evap">Walk-in condensing unit + evaporator</option>
                <option value="mini_split">Mini-split outdoor + indoor</option>
                <option value="other_paired">Other paired system</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Secondary / Mate Tag</span>
              <input
                value={secondaryUnitTag}
                onChange={(e) => setSecondaryUnitTag(e.target.value)}
                placeholder="Example: AHU-1, EVAP-1, Indoor Head 2"
                style={{
                  padding: 10,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#fff",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Tag Status</span>
              <select
                value={unitTagStatus}
                onChange={(e) => setUnitTagStatus(e.target.value as "readable" | "partial" | "unreadable")}
                style={{
                  padding: 10,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#fff",
                }}
              >
                <option value="readable">Readable</option>
                <option value="partial">Partial / damaged</option>
                <option value="unreadable">Unreadable / destroyed</option>
              </select>
            </label>
          </div>

          {pairedEquipmentType !== "none" && !secondaryUnitTag.trim() ? (
            <div
              style={{
                border: "1px solid #f0c36d",
                borderRadius: 10,
                padding: 10,
                background: "#fff8e8",
                fontWeight: 700,
              }}
            >
              This looks like paired equipment. Add the mate tag if available so indoor/outdoor or
              condensing/evaporator equipment does not get mixed up.
            </div>
          ) : null}

          {unitTagStatus !== "readable" ? (
            <div
              style={{
                border: "1px solid #f0c36d",
                borderRadius: 10,
                padding: 12,
                background: "#fff8e8",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900 }}>Damaged or unreadable tag workflow</div>

              <SmallHint>
                Some manufacturers place another label inside the electrical, fan, or control compartment.
                Check inside the unit before saving incomplete tag information.
              </SmallHint>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900 }}>Reason tag could not be fully read</span>
                <textarea
                  value={tagIssueReason}
                  onChange={(e) => setTagIssueReason(e.target.value)}
                  placeholder="Example: Outdoor tag sun-faded, serial unreadable. Checked inside electrical compartment and found partial model only."
                  rows={3}
                  style={{
                    padding: 10,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#fff",
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 700,
                }}
              >
                <input
                  type="checkbox"
                  checked={checkedInsideForInternalLabel}
                  onChange={(e) => setCheckedInsideForInternalLabel(e.target.checked)}
                />
                I checked inside the electrical / fan / control area for an internal label.
              </label>
            </div>
          ) : null}
        </div>
      </SectionCard>
    """)

    updated, changed = insert_before(updated, ui_anchor, ui_block, UI_SENTINEL)
    changed_any = changed_any or changed

    if SAVE_SENTINEL not in updated:
        save_patterns = [
            r'// unit-tag-save-guard-v1.*?if \(!proceedWithoutTag\) return;\s*\n\s*}\s*',
            r'async function saveCurrentUnit\s*\([^)]*\)\s*{',
            r'function saveCurrentUnit\s*\([^)]*\)\s*{',
            r'const saveCurrentUnit\s*=\s*async\s*\([^)]*\)\s*=>\s*{',
            r'const saveCurrentUnit\s*=\s*\([^)]*\)\s*=>\s*{',
        ]

        save_block = dedent("""\

        // paired-equipment-save-guard-v2
        const __pairedType = String(pairedEquipmentType ?? "").trim();
        const __secondaryTag = String(secondaryUnitTag ?? "").trim();
        const __unitTagState = String(unitTagStatus ?? "readable").trim();
        const __tagIssueReason = String(tagIssueReason ?? "").trim();
        const __hasPrimaryTag = String(unitNickname ?? "").trim().length > 0;
        const __hasSupportId =
          String(manufacturer ?? "").trim().length > 0 ||
          String(model ?? "").trim().length > 0 ||
          String(nameplate?.serial ?? "").trim().length > 0 ||
          __secondaryTag.length > 0;

        if (__pairedType && __pairedType !== "none" && !__secondaryTag) {
          const continueWithoutMateTag = window.confirm(
            "This looks like paired equipment. Add the secondary / mate tag if available so linked equipment does not get mixed up. Save anyway without the mate tag?"
          );
          if (!continueWithoutMateTag) return;
        }

        if (__unitTagState !== "readable") {
          if (!checkedInsideForInternalLabel) {
            window.alert(
              "Before saving a partial or unreadable tag, check inside the electrical, fan, or control area for an internal label and confirm that step."
            );
            return;
          }

          if (!__tagIssueReason) {
            window.alert(
              "Add a short reason explaining why the tag is partial or unreadable before saving."
            );
            return;
          }

          if (!__hasPrimaryTag && !__hasSupportId) {
            window.alert(
              "Do not save a damaged or unreadable tag without at least one supporting identifier like manufacturer, model, serial, or mate tag."
            );
            return;
          }
        }
        """)

        save_inserted = False
        for pattern in save_patterns:
            match = re.search(pattern, updated, re.DOTALL)
            if not match:
                continue
            insert_at = match.end(0)
            updated = updated[:insert_at] + save_block + updated[insert_at:]
            save_inserted = True
            break

        if not save_inserted:
            raise RuntimeError("Could not find saveCurrentUnit() or the existing unit-tag guard block.")

        changed_any = True

    if not changed_any:
        print("No changes applied.")
        return

    backup_path = TARGET.with_name(TARGET.name + BACKUP_SUFFIX)
    shutil.copy2(TARGET, backup_path)
    TARGET.write_text(updated, encoding="utf-8")

    print(f"Patched {TARGET}")
    print(f"Backup written to {backup_path}")


if __name__ == "__main__":
    main()