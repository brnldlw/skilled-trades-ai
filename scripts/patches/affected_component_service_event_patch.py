from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    page = PAGE.read_text(encoding="utf-8")

    # 1) Add state + helpers in component scope before showBulkImportTools
    if "affected-component-overlay-v1" not in page:
        block = """      // affected-component-overlay-v1
      const [affectedComponentId, setAffectedComponentId] = useState("");
      const [affectedComponentLabel, setAffectedComponentLabel] = useState("");

      type AffectedComponentOverlayRecord = {
        affectedComponentId: string;
        affectedComponentLabel: string;
      };

      const AFFECTED_COMPONENT_OVERLAY_KEY = "skilled_trades_ai_affected_component_overlay_v1";

      function loadAffectedComponentOverlayMap(): Record<string, AffectedComponentOverlayRecord> {
        if (typeof window === "undefined") return {};
        try {
          const raw = localStorage.getItem(AFFECTED_COMPONENT_OVERLAY_KEY);
          if (!raw) return {};
          const parsed = JSON.parse(raw);
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
          return {};
        }
      }

      function saveAffectedComponentOverlayMap(map: Record<string, AffectedComponentOverlayRecord>) {
        if (typeof window === "undefined") return;
        localStorage.setItem(AFFECTED_COMPONENT_OVERLAY_KEY, JSON.stringify(map));
      }

      function getPrimaryAffectedComponentLabel() {
        const roleLabel =
          primaryComponentRole
            ? primaryComponentRole.replaceAll("_", " ")
            : "primary component";

        const detail = [
          unitNickname || "",
          manufacturer || "",
          model || "",
          serialNumber || "",
        ].filter(Boolean).join(" • ");

        return detail ? `${roleLabel} — ${detail}` : roleLabel;
      }

      function getAffectedComponentOptions(): Array<{ id: string; label: string }> {
        const options: Array<{ id: string; label: string }> = [
          {
            id: "primary",
            label: getPrimaryAffectedComponentLabel(),
          },
        ];

        if (Array.isArray(linkedEquipmentComponents)) {
          for (const component of linkedEquipmentComponents) {
            const labelBits = [
              component.role ? String(component.role).replaceAll("_", " ") : "linked component",
              component.tag || "",
              component.manufacturer || "",
              component.model || "",
              component.serial || "",
            ].filter(Boolean);

            options.push({
              id: String(component.id || ""),
              label: labelBits.join(" • "),
            });
          }
        }

        return options.filter((option) => option.id && option.label);
      }

      function resolveAffectedComponentSelection() {
        const options = getAffectedComponentOptions();

        if (affectedComponentId.trim()) {
          const selected = options.find((option) => option.id === affectedComponentId.trim());
          return {
            id: affectedComponentId.trim(),
            label: affectedComponentLabel.trim() || selected?.label || affectedComponentId.trim(),
          };
        }

        if (systemType === "single" && options.length) {
          return options[0];
        }

        return { id: "", label: "" };
      }

      function saveAffectedComponentOverlayForEvent(eventId: string, componentId: string, componentLabel: string) {
        if (!eventId) return;
        const map = loadAffectedComponentOverlayMap();
        map[eventId] = {
          affectedComponentId: componentId,
          affectedComponentLabel: componentLabel,
        };
        saveAffectedComponentOverlayMap(map);
      }

      function getAffectedComponentOverlayForEvent(eventId: string) {
        if (!eventId) return null;
        const map = loadAffectedComponentOverlayMap();
        return map[eventId] || null;
      }

      function getAffectedComponentDisplayForEvent(event: any) {
        if (!event?.id) return "";
        const overlay = getAffectedComponentOverlayForEvent(String(event.id));
        return overlay?.affectedComponentLabel || "";
      }

"""
        page = insert_before_once(
            page,
            'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
            block,
            "affected component state/helpers",
        )

    # 2) Insert UI just before saved unit history block after Current Loaded Unit area
    if "affected-component-ui-v1" not in page:
        ui_block = """
      {/* affected-component-ui-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Affected Component for This Call">
          <SmallHint>
            Select the exact piece of equipment this call is about. This is required for split systems,
            walk-ins, mini-splits, and any multi-component setup so history stays tied to the right component.
          </SmallHint>

          {(() => {
            const options = getAffectedComponentOptions();
            return (
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                <select
                  value={affectedComponentId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const selected = options.find((option) => option.id === nextId);
                    setAffectedComponentId(nextId);
                    setAffectedComponentLabel(selected?.label || "");
                  }}
                  style={{ width: "100%", padding: 8 }}
                >
                  <option value="">Select affected component</option>
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {affectedComponentId ? (
                  <SmallHint>
                    Selected: <b>{affectedComponentLabel || affectedComponentId}</b>
                  </SmallHint>
                ) : systemType !== "single" ? (
                  <SmallHint>
                    Required for multi-component systems.
                  </SmallHint>
                ) : (
                  <SmallHint>
                    For single-equipment calls this will default to the primary component if you leave it blank.
                  </SmallHint>
                )}
              </div>
            );
          })()}
        </SectionCard>
      </div>

"""
        page = insert_before_once(
            page,
            '<div style={{ marginTop: 16, display: showSavedUnitHistory ? "block" : "none" }}>',
            ui_block,
            "affected component UI anchor",
        )

    # 3) loadServiceEventIntoForm(event)
    if 'setAffectedComponentId(overlay?.affectedComponentId || "");' not in page:
        page = replace_once(
            page,
            """function loadServiceEventIntoForm(event: any) {
  setEditingServiceEventId(event.id || "");
  setServiceDate(event.service_date ? String(event.service_date).slice(0, 10) : new Date().toISOString().slice(0, 10));
  setSymptom(event.symptom || "");
  setFinalConfirmedCause(event.final_confirmed_cause || "");
  setActualFixPerformed(event.actual_fix_performed || "");
  setPartsReplaced(event.parts_replaced || "");
  setOutcomeStatus(event.outcome_status || "Not Set");
  setCallbackOccurred(event.callback_occurred || "No");
  setTechCloseoutNotes(event.tech_closeout_notes || "");
  setServiceEventPhotoUrls(Array.isArray(event.photo_urls) ? event.photo_urls : []);
  setServiceEventPhotoMessage("");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
""",
            """function loadServiceEventIntoForm(event: any) {
  const overlay = getAffectedComponentOverlayForEvent(String(event?.id || ""));
  setEditingServiceEventId(event.id || "");
  setServiceDate(event.service_date ? String(event.service_date).slice(0, 10) : new Date().toISOString().slice(0, 10));
  setSymptom(event.symptom || "");
  setFinalConfirmedCause(event.final_confirmed_cause || "");
  setActualFixPerformed(event.actual_fix_performed || "");
  setPartsReplaced(event.parts_replaced || "");
  setOutcomeStatus(event.outcome_status || "Not Set");
  setCallbackOccurred(event.callback_occurred || "No");
  setTechCloseoutNotes(event.tech_closeout_notes || "");
  setServiceEventPhotoUrls(Array.isArray(event.photo_urls) ? event.photo_urls : []);
  setServiceEventPhotoMessage("");
  setAffectedComponentId(overlay?.affectedComponentId || "");
  setAffectedComponentLabel(overlay?.affectedComponentLabel || "");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
""",
            "loadServiceEventIntoForm",
        )

    # 4) cancelEditingServiceEvent
    if 'setAffectedComponentId("");' not in page:
        page = replace_once(
            page,
            """function cancelEditingServiceEvent() {
  setEditingServiceEventId("");
  setServiceDate(new Date().toISOString().slice(0, 10));
  setSymptom("");
  setFinalConfirmedCause("");
  setActualFixPerformed("");
  setPartsReplaced("");
  setOutcomeStatus("Not Set");
  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setServiceEventPhotoUrls([]);
  setServiceEventPhotoMessage("");
}
""",
            """function cancelEditingServiceEvent() {
  setEditingServiceEventId("");
  setServiceDate(new Date().toISOString().slice(0, 10));
  setSymptom("");
  setFinalConfirmedCause("");
  setActualFixPerformed("");
  setPartsReplaced("");
  setOutcomeStatus("Not Set");
  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setServiceEventPhotoUrls([]);
  setServiceEventPhotoMessage("");
  setAffectedComponentId("");
  setAffectedComponentLabel("");
}
""",
            "cancelEditingServiceEvent",
        )

    # 5) updateCurrentServiceEvent
    if "saveAffectedComponentOverlayForEvent(updatedEvent?.id || editingServiceEventId" not in page:
        page = replace_once(
            page,
            """async function updateCurrentServiceEvent() {
  if (!editingServiceEventId) {
    alert("No service event is being edited.");
    return;
  }

  if (!currentLoadedUnitId) {
    alert("Load a unit first.");
    return;
  }

  try {
    await updateServiceEventForCurrentUser(editingServiceEventId, {
      unit_id: currentLoadedUnitId,
      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      symptom: symptom || "",
      diagnosis_summary: parsed?.summary || "",
      final_confirmed_cause: finalConfirmedCause || "",
      parts_replaced: partsReplaced || "",
      actual_fix_performed: actualFixPerformed || "",
      outcome_status: outcomeStatus || "Not Set",
      callback_occurred: callbackOccurred || "No",
      tech_closeout_notes: techCloseoutNotes || "",
      photo_urls: serviceEventPhotoUrls,
    });

    await loadUnitServiceTimeline(currentLoadedUnitId);
    alert("Service event updated.");
    cancelEditingServiceEvent();
  } catch (err) {
    console.error("UPDATE SERVICE EVENT FAILED", err);
    alert("Could not update service event. Check browser console.");
  }
}
""",
            """async function updateCurrentServiceEvent() {
  if (!editingServiceEventId) {
    alert("No service event is being edited.");
    return;
  }

  if (!currentLoadedUnitId) {
    alert("Load a unit first.");
    return;
  }

  const affectedSelection = resolveAffectedComponentSelection();

  if (systemType !== "single" && !affectedSelection.id) {
    alert("Select the affected component before updating this service event.");
    return;
  }

  try {
    const updatedEvent = await updateServiceEventForCurrentUser(editingServiceEventId, {
      unit_id: currentLoadedUnitId,
      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      symptom: symptom || "",
      diagnosis_summary: parsed?.summary || "",
      final_confirmed_cause: finalConfirmedCause || "",
      parts_replaced: partsReplaced || "",
      actual_fix_performed: actualFixPerformed || "",
      outcome_status: outcomeStatus || "Not Set",
      callback_occurred: callbackOccurred || "No",
      tech_closeout_notes: techCloseoutNotes || "",
      photo_urls: serviceEventPhotoUrls,
    });

    saveAffectedComponentOverlayForEvent(
      updatedEvent?.id || editingServiceEventId,
      affectedSelection.id,
      affectedSelection.label
    );

    await loadUnitServiceTimeline(currentLoadedUnitId);
    alert("Service event updated.");
    cancelEditingServiceEvent();
  } catch (err) {
    console.error("UPDATE SERVICE EVENT FAILED", err);
    alert("Could not update service event. Check browser console.");
  }
}
""",
            "updateCurrentServiceEvent",
        )

    # 6) saveCurrentCallAsServiceEvent
    if "saveAffectedComponentOverlayForEvent(createdEvent?.id" not in page:
        page = replace_once(
            page,
            """async function saveCurrentCallAsServiceEvent() {
  if (!currentLoadedUnitId) {
    alert("Load a unit first, or save the unit before saving the current call.");
    return;
  }

  try {
    await createServiceEventForCurrentUser({
      id: makeId(),
      unit_id: currentLoadedUnitId,
      company_name: companyName || "",
      service_date: serviceDate
      ? new Date(`${serviceDate}T12:00:00`).toISOString()
      : new Date().toISOString(),
      symptom: symptom || "",
      diagnosis_summary: parsed?.summary || "",
      final_confirmed_cause: finalConfirmedCause || "",
      parts_replaced: partsReplaced || "",
      actual_fix_performed: actualFixPerformed || "",
      outcome_status: outcomeStatus || "Not Set",
      callback_occurred: callbackOccurred || "No",
      tech_closeout_notes: techCloseoutNotes || "",
      photo_urls: serviceEventPhotoUrls,
    });

    await loadUnitServiceTimeline(currentLoadedUnitId);
    setServiceEventPhotoUrls([]);
    setServiceEventPhotoMessage("");
    alert("Current call saved to the unit timeline.");
  } catch (err) {
    console.error("SAVE CURRENT CALL FAILED", err);
    alert("Could not save current call. Check browser console.");
  }
}
""",
            """async function saveCurrentCallAsServiceEvent() {
  if (!currentLoadedUnitId) {
    alert("Load a unit first, or save the unit before saving the current call.");
    return;
  }

  const affectedSelection = resolveAffectedComponentSelection();

  if (systemType !== "single" && !affectedSelection.id) {
    alert("Select the affected component before saving this service event.");
    return;
  }

  try {
    const createdEvent = await createServiceEventForCurrentUser({
      id: makeId(),
      unit_id: currentLoadedUnitId,
      company_name: companyName || "",
      service_date: serviceDate
      ? new Date(`${serviceDate}T12:00:00`).toISOString()
      : new Date().toISOString(),
      symptom: symptom || "",
      diagnosis_summary: parsed?.summary || "",
      final_confirmed_cause: finalConfirmedCause || "",
      parts_replaced: partsReplaced || "",
      actual_fix_performed: actualFixPerformed || "",
      outcome_status: outcomeStatus || "Not Set",
      callback_occurred: callbackOccurred || "No",
      tech_closeout_notes: techCloseoutNotes || "",
      photo_urls: serviceEventPhotoUrls,
    });

    saveAffectedComponentOverlayForEvent(
      createdEvent?.id || "",
      affectedSelection.id,
      affectedSelection.label
    );

    await loadUnitServiceTimeline(currentLoadedUnitId);
    setServiceEventPhotoUrls([]);
    setServiceEventPhotoMessage("");
    setAffectedComponentId(systemType === "single" ? "" : affectedSelection.id);
    setAffectedComponentLabel(systemType === "single" ? "" : affectedSelection.label);
    alert("Current call saved to the unit timeline.");
  } catch (err) {
    console.error("SAVE CURRENT CALL FAILED", err);
    alert("Could not save current call. Check browser console.");
  }
}
""",
            "saveCurrentCallAsServiceEvent",
        )

    # 7) saveHistoricalCallAndReset
    if "saveAffectedComponentOverlayForEvent(createdEvent?.id || \"\", affectedSelection.id" not in page:
        page = replace_once(
            page,
            """async function saveHistoricalCallAndReset() {
  if (!currentLoadedUnitId) {
    alert("Load a unit first, or save the unit before saving the current call.");
    return;
  }

  try {
    await createServiceEventForCurrentUser({
      id: makeId(),
      unit_id: currentLoadedUnitId,
      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      symptom: symptom || "",
      diagnosis_summary: parsed?.summary || "",
      final_confirmed_cause: finalConfirmedCause || "",
      parts_replaced: actualFixPerformed || "",
      actual_fix_performed: actualFixPerformed || "",
      outcome_status: outcomeStatus || "Not Set",
      callback_occurred: callbackOccurred || "No",
      tech_closeout_notes: techCloseoutNotes || "",
      photo_urls: serviceEventPhotoUrls,
    });

    await loadUnitServiceTimeline(currentLoadedUnitId);
    setServiceDate(new Date().toISOString().slice(0, 10));
    setSymptom("");
    setFinalConfirmedCause("");
    setActualFixPerformed("");
    setOutcomeStatus("Not Set");
    setCallbackOccurred("No");
    setTechCloseoutNotes("");
""",
            """async function saveHistoricalCallAndReset() {
  if (!currentLoadedUnitId) {
    alert("Load a unit first, or save the unit before saving the current call.");
    return;
  }

  const affectedSelection = resolveAffectedComponentSelection();

  if (systemType !== "single" && !affectedSelection.id) {
    alert("Select the affected component before saving this historical service event.");
    return;
  }

  try {
    const createdEvent = await createServiceEventForCurrentUser({
      id: makeId(),
      unit_id: currentLoadedUnitId,
      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      symptom: symptom || "",
      diagnosis_summary: parsed?.summary || "",
      final_confirmed_cause: finalConfirmedCause || "",
      parts_replaced: actualFixPerformed || "",
      actual_fix_performed: actualFixPerformed || "",
      outcome_status: outcomeStatus || "Not Set",
      callback_occurred: callbackOccurred || "No",
      tech_closeout_notes: techCloseoutNotes || "",
      photo_urls: serviceEventPhotoUrls,
    });

    saveAffectedComponentOverlayForEvent(
      createdEvent?.id || "",
      affectedSelection.id,
      affectedSelection.label
    );

    await loadUnitServiceTimeline(currentLoadedUnitId);
    setServiceDate(new Date().toISOString().slice(0, 10));
    setSymptom("");
    setFinalConfirmedCause("");
    setActualFixPerformed("");
    setOutcomeStatus("Not Set");
    setCallbackOccurred("No");
    setTechCloseoutNotes("");
    setAffectedComponentId("");
    setAffectedComponentLabel("");
""",
            "saveHistoricalCallAndReset",
        )

    # 8) Timeline display in current unit timeline
    if "affected-component-display-v1" not in page:
        page = replace_once(
            page,
            """            <div style={{ marginTop: 4 }}>
              <SmallHint><b>Confirmed Cause:</b> {event.final_confirmed_cause || "-"}</SmallHint>
            </div>

            <div style={{ marginTop: 4 }}>
              <SmallHint><b>Parts Replaced:</b> {event.parts_replaced || "-"}</SmallHint>
            </div>
""",
            """            <div style={{ marginTop: 4 }}>
              <SmallHint><b>Confirmed Cause:</b> {event.final_confirmed_cause || "-"}</SmallHint>
            </div>

            {getAffectedComponentDisplayForEvent(event) ? (
              <div style={{ marginTop: 4 }}>
                <SmallHint>
                  {/* affected-component-display-v1 */}
                  <b>Affected Component:</b> {getAffectedComponentDisplayForEvent(event)}
                </SmallHint>
              </div>
            ) : null}

            <div style={{ marginTop: 4 }}>
              <SmallHint><b>Parts Replaced:</b> {event.parts_replaced || "-"}</SmallHint>
            </div>
""",
            "unit service timeline affected component display",
        )

    # 9) Timeline display in unit profile timeline
    if "affected-component-display-v2" not in page:
        page = replace_once(
            page,
            """                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>Confirmed Cause:</b> {event.final_confirmed_cause || "-"}</SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>Parts Replaced:</b> {event.parts_replaced || "-"}</SmallHint>
                      </div>
""",
            """                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>Confirmed Cause:</b> {event.final_confirmed_cause || "-"}</SmallHint>
                      </div>

                      {getAffectedComponentDisplayForEvent(event) ? (
                        <div style={{ marginTop: 4 }}>
                          <SmallHint>
                            {/* affected-component-display-v2 */}
                            <b>Affected Component:</b> {getAffectedComponentDisplayForEvent(event)}
                          </SmallHint>
                        </div>
                      ) : null}

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>Parts Replaced:</b> {event.parts_replaced || "-"}</SmallHint>
                      </div>
""",
            "unit profile timeline affected component display",
        )

    backup = PAGE.with_name(PAGE.name + ".affected-component-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(page, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()