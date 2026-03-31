from __future__ import annotations

import re
import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "repeat-call-banner-v4" in source:
        print("Component-aware repeat call banner already patched.")
        return

    patterns = [
        re.compile(
            r'\{/\*\s*repeat-call-banner-v3\s*\*/\}\s*\{\(\(\)\s*=>\s*\{.*?\}\)\(\)\}',
            re.DOTALL,
        ),
        re.compile(
            r'\{/\*\s*repeat-call-banner-v2\s*\*/\}\s*\{\(\(\)\s*=>\s*\{.*?\}\)\(\)\}',
            re.DOTALL,
        ),
    ]

    replacement = """{/* repeat-call-banner-v4 */}
{(() => {
  const __repeatCallAllHistory =
    (Array.isArray(unitServiceTimeline) && unitServiceTimeline.length
      ? unitServiceTimeline
      : Array.isArray(unitProfileTimeline)
        ? unitProfileTimeline
        : []);

  if (!__repeatCallAllHistory.length) return null;

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

  const __repeatCallSelectedComponentId = String(affectedComponentId || "").trim();
  const __repeatCallSelectedComponentLabel = String(affectedComponentLabel || "").trim();

  const __repeatCallMatchingComponentHistory =
    systemType !== "single" && (__repeatCallSelectedComponentId || __repeatCallSelectedComponentLabel)
      ? __repeatCallAllHistory.filter((event) => {
          const overlay = getAffectedComponentOverlayForEvent(String((event as { id?: string | number } | null)?.id || ""));
          if (!overlay) return false;

          if (__repeatCallSelectedComponentId && overlay.affectedComponentId === __repeatCallSelectedComponentId) {
            return true;
          }

          if (
            __repeatCallSelectedComponentLabel &&
            overlay.affectedComponentLabel === __repeatCallSelectedComponentLabel
          ) {
            return true;
          }

          return false;
        })
      : [];

  const __repeatCallHasComponentFocus =
    systemType !== "single" && !!(__repeatCallSelectedComponentId || __repeatCallSelectedComponentLabel);

  const __repeatCallHistory =
    __repeatCallHasComponentFocus && __repeatCallMatchingComponentHistory.length
      ? __repeatCallMatchingComponentHistory
      : __repeatCallAllHistory;

  const __repeatCallIsSystemFallback =
    __repeatCallHasComponentFocus && __repeatCallMatchingComponentHistory.length === 0;

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
      "final_confirmed_cause",
      "confirmed_cause",
      "confirmedCause",
      "cause",
      "diagnosis",
      "root_cause",
      "rootCause",
    ]) || "";

  const __repeatCallLastFix =
    __repeatCallGetString(__repeatCallLast, [
      "actual_fix_performed",
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
        return symptom && symptom.toLowerCase() === __repeatCallLastSymptom.toLowerCase();
      }).length
    : 0;

  const __repeatCallHasCallbackHistory = __repeatCallHistory.some((event) =>
    __repeatCallGetBool(event, [
      "callback",
      "is_callback",
      "isCallback",
      "callback_visit",
      "callbackVisit",
      "callback_occurred",
    ])
  );

  const __repeatCallScopeLabel = __repeatCallHasComponentFocus
    ? (__repeatCallSelectedComponentLabel || "Selected component")
    : (systemType === "single" ? "Primary component" : "System-wide history");

  const __repeatCallScopeMessage = __repeatCallHasComponentFocus
    ? (
        __repeatCallIsSystemFallback
          ? `No prior visits were found for ${__repeatCallScopeLabel}. Showing system-wide history instead.`
          : `Showing prior visits for ${__repeatCallScopeLabel}.`
      )
    : (
        systemType === "single"
          ? "Showing prior visits for the primary component."
          : "Select an affected component to see component-specific prior visits."
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
        {__repeatCallScopeMessage}
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
            Scope
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallScopeLabel || "System-wide history"}</div>
        </div>

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

        {__repeatCallHasComponentFocus ? (
          <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
              Component History Count
            </div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>
              {__repeatCallMatchingComponentHistory.length}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
})()}"""

    updated = None
    for pattern in patterns:
        if pattern.search(source):
            updated = pattern.sub(replacement, source, count=1)
            break

    if updated is None:
        raise RuntimeError("Could not find existing repeat-call banner block to replace.")

    backup = PAGE.with_name(PAGE.name + ".component-aware-repeat-call-banner.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(updated, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()