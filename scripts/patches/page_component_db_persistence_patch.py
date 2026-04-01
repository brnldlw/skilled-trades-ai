from __future__ import annotations

import shutil
from pathlib import Path

TARGET = Path("app/hvac_units/page.tsx")


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
    if not TARGET.exists():
        raise FileNotFoundError(f"Missing file: {TARGET}")

    source = TARGET.read_text(encoding="utf-8")

    if "db-component-persistence-v1" in source:
        print("Page component DB persistence patch already applied.")
        return

    source = replace_once(
        source,
        """  createServiceEventForCurrentUser,
""",
        """  createServiceEventForCurrentUser,
  listUnitComponentsForUnitForCurrentUser,
  replaceUnitComponentsForUnitForCurrentUser,
""",
        "import insert 1",
    )

    helper_block = """  // db-component-persistence-v1
  async function syncUnitComponentsToDb(unitId: string) {
    await replaceUnitComponentsForUnitForCurrentUser(
      unitId,
      (Array.isArray(linkedEquipmentComponents) ? linkedEquipmentComponents : []).map((component, index) => ({
        position: index,
        role: component.role || "",
        component_tag: component.tag || "",
        manufacturer: component.manufacturer || "",
        model: component.model || "",
        serial: component.serial || "",
        tag_status: component.tagStatus || "readable",
        tag_issue_reason: component.tagIssueReason || "",
        checked_inside_for_internal_label: Boolean(component.checkedInsideForInternalLabel),
      }))
    );
  }

  async function loadLinkedEquipmentComponentsFromDb(unitId: string) {
    if (!unitId) {
      setLinkedEquipmentComponents([]);
      return;
    }

    try {
      const rows = await listUnitComponentsForUnitForCurrentUser(unitId);
      setLinkedEquipmentComponents(
        (rows || []).map((row, index) => ({
          id: row.id || `${unitId}-${index}`,
          role: row.role || "linked_component",
          tag: row.component_tag || "",
          manufacturer: row.manufacturer || "",
          model: row.model || "",
          serial: row.serial || "",
          tagStatus:
            row.tag_status === "partial" || row.tag_status === "unreadable"
              ? row.tag_status
              : "readable",
          tagIssueReason: row.tag_issue_reason || "",
          checkedInsideForInternalLabel: Boolean(row.checked_inside_for_internal_label),
        }))
      );
    } catch (err) {
      console.error("LOAD UNIT COMPONENTS FAILED", err);
      setLinkedEquipmentComponents([]);
    }
  }

"""
    source = insert_before_once(
        source,
        "async function updateCurrentLoadedUnit() {",
        helper_block,
        "db helper insert",
    )

    source = replace_once(
        source,
        """    const updated = await updateUnitForCurrentUser(currentLoadedUnitId, {
      company_name: companyName || "",
      customer_name: customerName || "",
      site_name: siteName || "",
      site_address: siteAddress || "",
      unit_nickname: unitNickname || "",
      property_type: propertyType || "",
      equipment_type: equipmentType || "",
      manufacturer: manufacturer || "",
      model: model || "",
      serial: serialNumber || nameplate?.serial || "",
      refrigerant_type: refrigerantType || "",
    });

    saveLinkedEquipmentOverlayForUnit(updated.id || currentLoadedUnitId);
    setCurrentLoadedUnitId(updated.id || currentLoadedUnitId);

    alert("Loaded unit updated.");
""",
        """    const updated = await updateUnitForCurrentUser(currentLoadedUnitId, {
      company_name: companyName || "",
      customer_name: customerName || "",
      site_name: siteName || "",
      site_address: siteAddress || "",
      unit_nickname: unitNickname || "",
      property_type: propertyType || "",
      equipment_type: equipmentType || "",
      manufacturer: manufacturer || "",
      model: model || "",
      serial: serialNumber || nameplate?.serial || "",
      refrigerant_type: refrigerantType || "",
      system_type: systemType || "single",
      primary_component_role: primaryComponentRole || "unit",
      primary_tag_status: primaryTagStatus || "readable",
      primary_tag_issue_reason: primaryTagIssueReason || "",
      primary_checked_inside_for_internal_label: Boolean(primaryCheckedInsideForInternalLabel),
    });

    await syncUnitComponentsToDb(updated.id || currentLoadedUnitId);
    saveLinkedEquipmentOverlayForUnit(updated.id || currentLoadedUnitId);
    setCurrentLoadedUnitId(updated.id || currentLoadedUnitId);

    alert("Loaded unit updated.");
""",
        "update unit payload",
    )

    source = replace_once(
        source,
        """      const createdUnit = await createUnitForCurrentUser({
        id: record.id,
        customer_name: record.customerName,
        company_name: record.companyName || "",
        site_name: record.siteName,
        site_address: record.siteAddress,
        unit_nickname: record.unitNickname,
        property_type: record.propertyType,
        equipment_type: record.equipmentType,
        manufacturer: record.manufacturer,
        model: record.model,
        serial: record.serialNumber || record.nameplate?.serial || "",
        refrigerant_type: record.refrigerantType,
      });

      saveLinkedEquipmentOverlayForUnit(createdUnit.id || record.id);
""",
        """      const createdUnit = await createUnitForCurrentUser({
        id: record.id,
        customer_name: record.customerName,
        company_name: record.companyName || "",
        site_name: record.siteName,
        site_address: record.siteAddress,
        unit_nickname: record.unitNickname,
        property_type: record.propertyType,
        equipment_type: record.equipmentType,
        manufacturer: record.manufacturer,
        model: record.model,
        serial: record.serialNumber || record.nameplate?.serial || "",
        refrigerant_type: record.refrigerantType,
        system_type: record.systemType || "single",
        primary_component_role: record.primaryComponentRole || "unit",
        primary_tag_status: record.primaryTagStatus || "readable",
        primary_tag_issue_reason: record.primaryTagIssueReason || "",
        primary_checked_inside_for_internal_label: Boolean(record.primaryCheckedInsideForInternalLabel),
      });

      await syncUnitComponentsToDb(createdUnit.id || record.id);
      saveLinkedEquipmentOverlayForUnit(createdUnit.id || record.id);
""",
        "save unit payload",
    )

    source = source.replace(
        """          serialNumber: r.serial || "",
          refrigerantType: r.refrigerant_type || "",
""",
        """          serialNumber: r.serial || "",
          refrigerantType: r.refrigerant_type || "",
          systemType: r.system_type || "single",
          primaryComponentRole: r.primary_component_role || "unit",
          primaryTagStatus: r.primary_tag_status || "readable",
          primaryTagIssueReason: r.primary_tag_issue_reason || "",
          primaryCheckedInsideForInternalLabel: Boolean(r.primary_checked_inside_for_internal_label),
""",
    )

    source = replace_once(
        source,
        """      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      symptom: symptom || "",
""",
        """      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      affected_component_label_snapshot: affectedSelection.label || "",
      affected_component_role_snapshot: (affectedSelection.label || "").split("—")[0].trim(),
      symptom: symptom || "",
""",
        "update service event snapshot",
    )

    source = source.replace(
        """      company_name: companyName || "",
      service_date: serviceDate
      ? new Date(`${serviceDate}T12:00:00`).toISOString()
      : new Date().toISOString(),
      symptom: symptom || "",
""",
        """      company_name: companyName || "",
      service_date: serviceDate
      ? new Date(`${serviceDate}T12:00:00`).toISOString()
      : new Date().toISOString(),
      affected_component_label_snapshot: affectedSelection.label || "",
      affected_component_role_snapshot: (affectedSelection.label || "").split("—")[0].trim(),
      symptom: symptom || "",
""",
        1,
    )

    source = source.replace(
        """      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      symptom: symptom || "",
""",
        """      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      affected_component_label_snapshot: affectedSelection.label || "",
      affected_component_role_snapshot: (affectedSelection.label || "").split("—")[0].trim(),
      symptom: symptom || "",
""",
        1,
    )

    source = replace_once(
        source,
        """function loadServiceEventIntoForm(event: any) {
  const overlay = getAffectedComponentOverlayForEvent(String(event?.id || ""));
""",
        """function loadServiceEventIntoForm(event: any) {
  const overlay = getAffectedComponentOverlayForEvent(String(event?.id || ""));
  const persistedLabel = String(event?.affected_component_label_snapshot || "").trim();
""",
        "load event persisted label prelude",
    )

    source = replace_once(
        source,
        """  setServiceEventPhotoUrls(Array.isArray(event.photo_urls) ? event.photo_urls : []);
  setServiceEventPhotoMessage("");
  setAffectedComponentId(overlay?.affectedComponentId || "");
  setAffectedComponentLabel(overlay?.affectedComponentLabel || "");
""",
        """  setServiceEventPhotoUrls(Array.isArray(event.photo_urls) ? event.photo_urls : []);
  setServiceEventPhotoMessage("");
  setAffectedComponentId(overlay?.affectedComponentId || "");
  setAffectedComponentLabel(overlay?.affectedComponentLabel || persistedLabel || "");
""",
        "load event persisted label assign",
    )

    source = replace_once(
        source,
        """      function getAffectedComponentDisplayForEvent(event: any) {
        const persisted = String(event?.affected_component_label_snapshot || "").trim();
        if (persisted) return persisted;
        if (!event?.id) return "";
        const overlay = getAffectedComponentOverlayForEvent(String(event.id));
        return overlay?.affectedComponentLabel || "";
      }
""",
        """      function getAffectedComponentDisplayForEvent(event: any) {
        const persisted = String(event?.affected_component_label_snapshot || "").trim();
        if (persisted) return persisted;
        if (!event?.id) return "";
        const overlay = getAffectedComponentOverlayForEvent(String(event.id));
        return overlay?.affectedComponentLabel || "";
      }
""",
        "display helper persisted snapshot noop",
    )

    source = replace_once(
        source,
        """    setLinkedEquipmentComponents(
      Array.isArray(mergedRecord.linkedEquipmentComponents)
        ? mergedRecord.linkedEquipmentComponents.map((component) => ({ ...component }))
        : []
    );

    loadUnitServiceTimeline(mergedRecord.id);
}
""",
        """    setLinkedEquipmentComponents(
      Array.isArray(mergedRecord.linkedEquipmentComponents)
        ? mergedRecord.linkedEquipmentComponents.map((component) => ({ ...component }))
        : []
    );

    loadUnitServiceTimeline(mergedRecord.id);
    void loadLinkedEquipmentComponentsFromDb(mergedRecord.id);
}
""",
        "load linked components from db",
    )

    backup = TARGET.with_name(TARGET.name + ".page-component-db-persistence.bak")
    shutil.copy2(TARGET, backup)
    TARGET.write_text(source, encoding="utf-8")

    print(f"Patched {TARGET}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
