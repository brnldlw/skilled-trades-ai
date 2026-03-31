from __future__ import annotations

import re
import shutil
import textwrap
from pathlib import Path

TARGET = Path("app/hvac_units/page.tsx")
BACKUP_SUFFIX = ".repeat-call-banner-v5.bak"
SENTINEL = "repeat-call-banner-v3"


def insert_before_historical_mode(source: str, block: str) -> tuple[str, bool]:
    if SENTINEL in source:
        return source, False

    anchor = "{!historicalEntryMode ? ("
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError('Could not find historicalEntryMode anchor: "{!historicalEntryMode ? ("')

    injected = textwrap.indent(block.strip("\n"), "") + "\n\n"
    return source[:idx] + injected + source[idx:], True


def main() -> None:
    if not TARGET.exists():
        raise FileNotFoundError(f"Could not find target file: {TARGET}")

    original = TARGET.read_text(encoding="utf-8")

    banner_block = """
{/* repeat-call-banner-v3 */}
{(() => {
  const __repeatCallHistory =
    (Array.isArray(unitServiceTimeline) && unitServiceTimeline.length
      ? unitServiceTimeline
      : Array.isArray(unitProfileTimeline)
        ? unitProfileTimeline
        : []);

  if (!__repeatCallHistory.length) return null;

  const __repeatCallGetRecord = (event: unknown): Record<string, unknown> | null => {
    if (event && typeof event === "object") {
      return event as Record<string, unknown>;
    }
    return null;
  };

  const __repeatCallGetString = (event: unknown, keys: string[]) => {
    const record = __repeatCallGetRecord(event);
    if (!record) return "";
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (typeof value === "number") return String(value);
    }
    return "";
  };

  const __repeatCallGetBool = (event: unknown, keys: string[]) => {
    const record = __repeatCallGetRecord(event);
    if (!record) return false;
    for (const key of keys) {
      const value = record[key];
      if (
        value === true ||
        value === "true" ||
        value === "yes" ||
        value === "Yes" ||
        value === 1 ||
        value === "1"
      ) {
        return true;
      }
    }
    return false;
  };

  const __repeatCallGetTime = (event: unknown) => {
    const raw =
      __repeatCallGetString(event, ["service_date", "created_at", "updated_at", "date"]) || "";
    if (!raw) return 0;
    const ms = new Date(raw).getTime();
    return Number.isFinite(ms) ? ms : 0;
  };

  const __repeatCallSorted = [...__repeatCallHistory].sort(
    (a, b) => __repeatCallGetTime(b) - __repeatCallGetTime(a)
  );

  const __repeatCallLast = __repeatCallSorted[0] ?? null;
  const __repeatCallLastDateRaw =
    __repeatCallGetString(__repeatCallLast, ["service_date", "created_at", "updated_at", "date"]) || "";
  const __repeatCallLastDateLabel = __repeatCallLastDateRaw
    ? new Date(__repeatCallLastDateRaw).toLocaleDateString()
    : "";

  const __repeatCallLastSymptom =
    __repeatCallGetString(__repeatCallLast, ["symptom", "customer_complaint", "complaint"]) || "";

  const __repeatCallLastCause =
    __repeatCallGetString(__repeatCallLast, [
      "confirmed_cause",
      "confirmedCause",
      "cause",
      "diagnosis",
      "root_cause",
      "rootCause",
    ]) || "";

  const __repeatCallLastFix =
    __repeatCallGetString(__repeatCallLast, [
      "actual_fix",
      "actualFix",
      "fix",
      "repair_action",
      "repairAction",
      "resolution",
    ]) || "";

  const __repeatCallLastParts =
    __repeatCallGetString(__repeatCallLast, [
      "parts_replaced",
      "partsReplaced",
      "parts_used",
      "partsUsed",
      "parts",
      "part",
    ]) || "";

  const __repeatCallSameSymptomCount = __repeatCallLastSymptom
    ? __repeatCallHistory.filter((event) => {
        const symptom =
          __repeatCallGetString(event, ["symptom", "customer_complaint", "complaint"]) || "";
        return symptom && symptom.toLowerCase() == __repeatCallLastSymptom.toLowerCase();
      }).length
    : 0;

  const __repeatCallHasCallbackHistory = __repeatCallHistory.some((event) =>
    __repeatCallGetBool(event, [
      "callback",
      "is_callback",
      "isCallback",
      "callback_visit",
      "callbackVisit",
    ])
  );

  return (
    <div
      style={{
        marginTop: 16,
        border: "1px solid #f0c36d",
        borderRadius: 12,
        padding: 12,
        background: "#fff8e8",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16 }}>
        Repeat Call / Prior Visit Signal
      </div>

      <div style={{ marginTop: 4, fontSize: 13, color: "#555" }}>
        This unit already has service history. Review the last visit before entering a new call.
      </div>

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Last Call Date
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastDateLabel || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Last Symptom
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastSymptom || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Most Recent Cause
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastCause || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Most Recent Fix
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastFix || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Last Parts Used
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastParts || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            History Signal
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {__repeatCallSameSymptomCount > 1
              ? `${__repeatCallSameSymptomCount} similar symptom calls`
              : "Prior service history found"}
            {__repeatCallHasCallbackHistory ? " • Callback history" : ""}
          </div>
        </div>
      </div>
    </div>
  );
})()}
"""

    updated, changed = insert_before_historical_mode(original, banner_block)

    if not changed:
        print("No changes applied.")
        return

    backup_path = TARGET.with_name(TARGET.name + BACKUP_SUFFIX)
    shutil.copy2(TARGET, backup_path)
    TARGET.write_text(updated, encoding="utf-8")

    print(f"Patched {TARGET}")
    print(f"Backup written to {backup_path}")


if __name__ == "__main__":
    main()