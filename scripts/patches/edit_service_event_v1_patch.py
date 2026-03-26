from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# ---------- A) add import ----------
old_import = """import {
  createCompanyForCurrentUser,
  createServiceEventForCurrentUser,
  createUnitForCurrentUser,
  deleteUnitForCurrentUser,
  findStrongUnitMatchForCurrentUser,
  getCurrentUserMembership,
  listServiceEventsForUnitForCurrentUser,
  listUnitsForCurrentUser,
  updateUnitForCurrentUser,
} from "../lib/supabase/work-orders";"""

new_import = """import {
  createCompanyForCurrentUser,
  createServiceEventForCurrentUser,
  createUnitForCurrentUser,
  deleteUnitForCurrentUser,
  findStrongUnitMatchForCurrentUser,
  getCurrentUserMembership,
  listServiceEventsForUnitForCurrentUser,
  listUnitsForCurrentUser,
  updateServiceEventForCurrentUser,
  updateUnitForCurrentUser,
} from "../lib/supabase/work-orders";"""

if "updateServiceEventForCurrentUser," not in text:
    if old_import not in text:
        raise SystemExit("Could not find work-orders import block.")
    text = text.replace(old_import, new_import, 1)

# ---------- B) add editing state ----------
state_anchor = 'const [serviceEventPhotoMessage, setServiceEventPhotoMessage] = useState("");'
state_insert = state_anchor + '\nconst [editingServiceEventId, setEditingServiceEventId] = useState("");'

if 'const [editingServiceEventId, setEditingServiceEventId] = useState("");' not in text:
    if state_anchor not in text:
        raise SystemExit("Could not find service event photo state anchor.")
    text = text.replace(state_anchor, state_insert, 1)

# ---------- C) add helpers above saveCurrentCallAsServiceEvent ----------
func_anchor = "async function saveCurrentCallAsServiceEvent() {"
if "function loadServiceEventIntoForm(" not in text:
    idx = text.find(func_anchor)
    if idx == -1:
        raise SystemExit("Could not find saveCurrentCallAsServiceEvent anchor.")

    helpers = """
function loadServiceEventIntoForm(event: any) {
  setEditingServiceEventId(event.id || "");
  setServiceDate(event.service_date ? String(event.service_date).slice(0, 10) : new Date().toISOString().slice(0, 10));
  setSymptom(event.symptom || "");
  setFinalConfirmedCause(event.final_confirmed_cause || "");
  setActualFixPerformed(event.actual_fix_performed || "");
  setOutcomeStatus(event.outcome_status || "Not Set");
  setCallbackOccurred(event.callback_occurred || "No");
  setTechCloseoutNotes(event.tech_closeout_notes || "");
  setServiceEventPhotoUrls(Array.isArray(event.photo_urls) ? event.photo_urls : []);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEditingServiceEvent() {
  setEditingServiceEventId("");
  setServiceDate(new Date().toISOString().slice(0, 10));
  setSymptom("");
  setFinalConfirmedCause("");
  setActualFixPerformed("");
  setOutcomeStatus("Not Set");
  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setServiceEventPhotoUrls([]);
  setServiceEventPhotoMessage("");
}

async function updateCurrentServiceEvent() {
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
      parts_replaced: actualFixPerformed || "",
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

"""
    text = text[:idx] + helpers + text[idx:]

# ---------- D) add Update Event + Cancel Edit buttons next to save buttons ----------
save_button_anchor = '<PillButton text="Save Current Call to Timeline" onClick={saveCurrentCallAsServiceEvent} />'
if 'text="Update Event"' not in text:
    if save_button_anchor not in text:
        raise SystemExit("Could not find Save Current Call button anchor.")
    text = text.replace(
        save_button_anchor,
        save_button_anchor
        + '\n              {editingServiceEventId ? <PillButton text="Update Event" onClick={updateCurrentServiceEvent} /> : null}'
        + '\n              {editingServiceEventId ? <PillButton text="Cancel Edit" onClick={cancelEditingServiceEvent} /> : null}',
        1,
    )

# ---------- E) add editing badge in Case Outcome section ----------
section_anchor = '<SectionCard title="Case Outcome / Learning Feedback">'
if "EDITING SAVED EVENT" not in text:
    text = text.replace(
        section_anchor,
        section_anchor + """
    {editingServiceEventId ? (
      <div style={{ marginTop: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 8px",
            borderRadius: 999,
            border: "1px solid #cfcfcf",
            background: "#fff3e8",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          EDITING SAVED EVENT
        </span>
      </div>
    ) : null}""",
        1,
    )

# ---------- F) add Edit Event button to Unit Service Timeline cards ----------
timeline_anchor = """              <div style={{ marginTop: 4 }}>
                <SmallHint><b>Notes:</b> {event.tech_closeout_notes || "-"}</SmallHint>
              </div>"""

if 'text="Edit Event"' not in text:
    if timeline_anchor not in text:
        raise SystemExit("Could not find Unit Service Timeline notes anchor.")
    text = text.replace(
        timeline_anchor,
        timeline_anchor + """

              <div style={{ marginTop: 8 }}>
                <PillButton text="Edit Event" onClick={() => loadServiceEventIntoForm(event)} />
              </div>""",
        1,
    )

path.write_text(text)
print("Added Edit Service Event v1 wiring.")