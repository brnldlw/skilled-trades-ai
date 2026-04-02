from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return text.replace(old, new, 1)


def find_function_block(text: str, signature: str) -> tuple[int, int]:
    start = text.find(signature)
    if start == -1:
        raise RuntimeError(f"Could not find function signature: {signature}")

    i = start
    depth = 0
    in_string = None
    escape = False

    while i < len(text):
        ch = text[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_string:
                in_string = None
        else:
            if ch in ("'", '"', "`"):
                in_string = ch
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return start, i + 1
        i += 1

    raise RuntimeError(f"Could not parse function block for: {signature}")


def replace_in_function(text: str, signature: str, old: str, new: str, label: str) -> str:
    start, end = find_function_block(text, signature)
    block = text[start:end]
    if old not in block:
        raise RuntimeError(f"Could not find expected function-local block for: {label}")
    block = block.replace(old, new, 1)
    return text[:start] + block + text[end:]


def insert_before_once(text: str, anchor: str, block: str, label: str) -> str:
    idx = text.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return text[:idx] + block + text[idx:]


def insert_after_once(text: str, anchor: str, block: str, label: str) -> str:
    idx = text.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    insert_at = idx + len(anchor)
    return text[:insert_at] + block + text[insert_at:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "last-saved-event-quick-reopen-v1" in source:
        print("Last Saved Event Quick Reopen patch already applied.")
        return

    # 1) state
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        '      // last-saved-event-quick-reopen-v1\n'
        '      const [lastSavedServiceEventId, setLastSavedServiceEventId] = useState("");\n\n',
        "last saved event state",
    )

    # 2) helper
    helper_block = """  function reopenLastSavedServiceEvent() {
    if (!lastSavedServiceEventId) {
      alert("No recently saved event is available yet.");
      return;
    }

    const match = (Array.isArray(unitProfileTimeline) ? unitProfileTimeline : []).find(
      (event) => String(event?.id || "") === String(lastSavedServiceEventId)
    );

    if (!match) {
      alert("The last saved event is not loaded in this unit timeline yet. Load the unit and try again.");
      return;
    }

    loadServiceEventIntoForm(match);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

"""
    source = insert_before_once(
        source,
        "async function updateCurrentLoadedUnit() {",
        helper_block,
        "last saved event helper",
    )

    # 3) update current service event -> remember edited event id
    source = replace_in_function(
        source,
        "async function updateCurrentServiceEvent() {",
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    alert("Service event updated.");
""",
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    setLastSavedServiceEventId(String(editingServiceEventId || ""));
    alert("Service event updated.");
""",
        "update current service event success block",
    )

    # 4) save current call -> capture created id
    source = replace_in_function(
        source,
        "async function saveCurrentCallAsServiceEvent() {",
        "    await createServiceEventForCurrentUser({",
        "    const createdEvent = await createServiceEventForCurrentUser({",
        "save current call create event",
    )

    source = replace_in_function(
        source,
        "async function saveCurrentCallAsServiceEvent() {",
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    setServiceEventPhotoUrls([]);
""",
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    setLastSavedServiceEventId(String(createdEvent?.id || ""));
    setServiceEventPhotoUrls([]);
""",
        "save current call success block",
    )

    # 5) save historical call -> capture created id
    source = replace_in_function(
        source,
        "async function saveHistoricalCallAndReset() {",
        "    await createServiceEventForCurrentUser({",
        "    const createdEvent = await createServiceEventForCurrentUser({",
        "save historical call create event",
    )

    source = replace_in_function(
        source,
        "async function saveHistoricalCallAndReset() {",
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    setServiceDate(new Date().toISOString().slice(0, 10));
""",
        """    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    setLastSavedServiceEventId(String(createdEvent?.id || ""));
    setServiceDate(new Date().toISOString().slice(0, 10));
""",
        "save historical call success block",
    )

    # 6) field action bar button
    action_anchor = """                <button
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
    action_block = """
                <button
                  type="button"
                  onClick={reopenLastSavedServiceEvent}
                  disabled={!lastSavedServiceEventId}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: lastSavedServiceEventId ? "pointer" : "not-allowed",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity: lastSavedServiceEventId ? 1 : 0.7,
                  }}
                >
                  Reopen Last Saved Event
                </button>
"""
    source = insert_after_once(
        source,
        action_anchor,
        action_block,
        "field action bar reopen button",
    )

    backup = PAGE.with_name(PAGE.name + ".last-saved-event-quick-reopen-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
