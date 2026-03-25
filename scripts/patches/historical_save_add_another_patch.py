from pathlib import Path
import re

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# ---------- A) Add helper after saveCurrentCallAsServiceEvent ----------
func_pat = re.compile(
    r'async function saveCurrentCallAsServiceEvent\(\)\s*\{.*?\n\}',
    re.S,
)

m = func_pat.search(text)
if not m:
    raise SystemExit("Could not find saveCurrentCallAsServiceEvent function.")

if "async function saveHistoricalCallAndReset()" not in text:
    helper = """

async function saveHistoricalCallAndReset() {
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
    setServiceEventPhotoUrls([]);
    setServiceEventPhotoMessage("");
    alert("Historical call saved. Enter the next call for this same unit.");
  } catch (err) {
    console.error("SAVE HISTORICAL CALL FAILED", err);
    alert("Could not save historical call. Check browser console.");
  }
}
"""
    text = text[:m.end()] + helper + text[m.end():]

# ---------- B) Add button after the existing save button ----------
if 'text="Save & Add Another"' not in text:
    click_idx = text.find("onClick={saveCurrentCallAsServiceEvent}")
    if click_idx == -1:
        raise SystemExit("Could not find onClick={saveCurrentCallAsServiceEvent} in JSX.")

    tag_start = text.rfind("<", 0, click_idx)
    if tag_start == -1:
        raise SystemExit("Could not find start of Save Current Call element.")

    # Prefer self-closing tag
    self_close = text.find("/>", click_idx)
    close_button = text.find("</button>", click_idx)

    if self_close != -1 and (close_button == -1 or self_close < close_button):
        insert_at = self_close + 2
        button_markup = '\n              <PillButton text="Save & Add Another" onClick={saveHistoricalCallAndReset} />'
        text = text[:insert_at] + button_markup + text[insert_at:]
    elif close_button != -1:
        insert_at = close_button + len("</button>")
        button_markup = """
              <button
                onClick={saveHistoricalCallAndReset}
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
                Save & Add Another
              </button>"""
        text = text[:insert_at] + button_markup + text[insert_at:]
    else:
        raise SystemExit("Could not determine how the Save Current Call element closes.")

path.write_text(text)
print("Added Historical Call Entry v1: Save & Add Another.")