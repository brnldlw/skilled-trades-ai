from pathlib import Path
import re

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# ---------- A) import ----------
old_import = """import {
  createCompanyForCurrentUser,
  createServiceEventForCurrentUser,
  createUnitForCurrentUser,
  deleteUnitForCurrentUser,
  findStrongUnitMatchForCurrentUser,
  getCurrentUserMembership,
  listServiceEventsForUnitForCurrentUser,
  listUnitsForCurrentUser,
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
  updateUnitForCurrentUser,
} from "../lib/supabase/work-orders";"""

if "updateUnitForCurrentUser," not in text:
    if old_import not in text:
        raise SystemExit("Could not find work-orders import block.")
    text = text.replace(old_import, new_import, 1)

# ---------- B) add update function ----------
if "async function updateCurrentLoadedUnit()" not in text:
    anchor = "async function saveCurrentUnit() {"
    idx = text.find(anchor)
    if idx == -1:
        raise SystemExit("Could not find saveCurrentUnit function anchor.")

    block = """
async function updateCurrentLoadedUnit() {
  if (!currentLoadedUnitId) {
    alert("Load a unit first.");
    return;
  }

  try {
    const updated = await updateUnitForCurrentUser(currentLoadedUnitId, {
      company_name: companyName || "",
      customer_name: customerName || "",
      site_name: siteName || "",
      site_address: siteAddress || "",
      unit_nickname: unitNickname || "",
      property_type: propertyType || "",
      equipment_type: equipmentType || "",
      manufacturer: manufacturer || "",
      model: model || "",
      serial: serialNumber || "",
      refrigerant_type: refrigerantType || "",
    });

    setCurrentLoadedUnitId(updated.id || currentLoadedUnitId);

    alert("Loaded unit updated.");
    const reloadedUnits = await listUnitsForCurrentUser();
setSavedUnits(
  reloadedUnits.map((u) => ({
    id: u.id,
    companyName: u.company_name || "",
    customerName: u.customer_name || "",
    siteName: u.site_name || "",
    siteAddress: u.site_address || "",
    unitNickname: u.unit_nickname || "",
    propertyType: u.property_type || "",
    equipmentType: u.equipment_type || "",
    manufacturer: u.manufacturer || "",
    model: u.model || "",
    serialNumber: u.serial || "",
    refrigerantType: u.refrigerant_type || "",
    savedAt: u.created_at || new Date().toISOString(),
  }))
);
  } catch (err) {
    console.error("UPDATE LOADED UNIT FAILED", err);
    alert("Could not update loaded unit. Check browser console.");
  }
}

"""
    text = text[:idx] + block + text[idx:]

# ---------- C) add button next to Save Current Unit ----------
button_anchor = '<PillButton text="Save Current Unit" onClick={saveCurrentUnit} />'
if 'text="Update Loaded Unit"' not in text:
    if button_anchor not in text:
        raise SystemExit("Could not find Save Current Unit button anchor.")
    text = text.replace(
        button_anchor,
        button_anchor + '\n              {currentLoadedUnitId ? <PillButton text="Update Loaded Unit" onClick={updateCurrentLoadedUnit} /> : null}',
        1,
    )

path.write_text(text)
print("Added Update Loaded Unit wiring.")