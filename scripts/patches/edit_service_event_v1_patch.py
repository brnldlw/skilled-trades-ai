from pathlib import Path
import re

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# A) import
if "updateServiceEventForCurrentUser" not in text:
    old = '  updateUnitForCurrentUser,\n} from "../lib/supabase/work-orders";'
    new = '  updateServiceEventForCurrentUser,\n  updateUnitForCurrentUser,\n} from "../lib/supabase/work-orders";'
    if old not in text:
        raise SystemExit("Could not find import anchor.")
    text = text.replace(old, new, 1)

# B) state
state_anchor = 'const [serviceEventPhotoMessage, setServiceEventPhotoMessage] = useState("");'
if 'const [editingServiceEventId, setEditingServiceEventId] = useState("");' not in text:
    if state_anchor not in text:
        raise SystemExit("Could not find state anchor.")
    text = text.replace(
        state_anchor,
        state_anchor + '\nconst [editingServiceEventId, setEditingServiceEventId] = useState("");',
        1,
    )

# C) helpers
if "function loadServiceEventIntoForm(" not in text:
    func_anchor = "async function saveCurrentCallAsServiceEvent() {"
    if func_anchor not in text:
        raise SystemExit("Could not find saveCurrentCallAsServiceEvent anchor.")

    helpers = """
function loadServiceEventIntoForm(event: any) {
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

function cancelEditingServiceEvent() {
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

"""
    text = text.replace(func_anchor, helpers + func_anchor, 1)

# D) add Update / Cancel buttons after Save & Add Another block
if 'Update Event' not in text:
    save_add_another_pattern = re.compile(
        r'(<button\s+[^>]*onClick=\{saveHistoricalCallAndReset\}[\s\S]*?Save & Add Another[\s\S]*?</button>)',
        re.S,
    )
    m = save_add_another_pattern.search(text)
    if not m:
        raise SystemExit("Could not find Save & Add Another button block.")

    buttons = m.group(1) + """
              {editingServiceEventId ? (
                <button
                  onClick={updateCurrentServiceEvent}
                  style={{
                    padding: "10px 14px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Update Event
                </button>
              ) : null}

              {editingServiceEventId ? (
                <button
                  onClick={cancelEditingServiceEvent}
                  style={{
                    padding: "10px 14px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Cancel Edit
                </button>
              ) : null}"""
    text = text[:m.start()] + buttons + text[m.end():]

# E) editing badge
section_anchor = '<SectionCard title="Case Outcome / Learning Feedback">'
if "EDITING SAVED EVENT" not in text:
    if section_anchor not in text:
        raise SystemExit("Could not find Case Outcome section anchor.")
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

# F) add Edit Event button in Unit Service Timeline
if 'Edit Event' not in text:
    notes_pattern = re.compile(
        r'(<SmallHint><b>Notes:</b>\s*\{event\.tech_closeout_notes\s*\|\|\s*"-"\}</SmallHint>)',
        re.S,
    )
    m = notes_pattern.search(text)
    if not m:
        raise SystemExit("Could not find Unit Service Timeline notes block.")

    replacement = m.group(1) + """

              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => loadServiceEventIntoForm(event)}
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
                  Edit Event
                </button>
              </div>"""
    text = text[:m.start()] + replacement + text[m.end():]

path.write_text(text)
print("Added Edit Service Event v1 wiring.")