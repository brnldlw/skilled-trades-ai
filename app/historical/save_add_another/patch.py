from pathlib import Path
import re

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# ---------- A) Add the new save-and-reset helper ----------
func_pat = re.compile(
    r'async function saveCurrentCallAsServiceEvent\(\) \{.*?\n\}',
    re.S,
)

m = func_pat.search(text)
if not m:
    raise SystemExit("Could not find saveCurrentCallAsServiceEvent function.")

if "async function saveHistoricalCallAndReset()" not in text:
    new_func = m.group(0) + """

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
    text = text[:m.start()] + new_func + text[m.end():]

# ---------- B) Add the new button next to Save Current Call ----------
button_pat = re.compile(
    r'(<PillButton[^>]*onClick=\{saveCurrentCallAsServiceEvent\}[^>]*/>)'
)

if "saveHistoricalCallAndReset" not in text:
    raise SystemExit("Historical save helper did not get inserted.")

if 'text="Save & Add Another"' not in text:
    text, count = button_pat.subn(
        r'\1\n              <PillButton text="Save & Add Another" onClick={saveHistoricalCallAndReset} />',
        text,
        count=1,
    )
    if count != 1:
        raise SystemExit("Could not find Save Current Call button to extend.")

path.write_text(text)
print("Added Historical Call Entry v1: Save & Add Another.")