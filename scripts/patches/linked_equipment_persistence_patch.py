from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")
UNIT_STORE = Path("app/lib/unit-store.ts")


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
    if not UNIT_STORE.exists():
        raise FileNotFoundError(f"Missing file: {UNIT_STORE}")

    page = PAGE.read_text(encoding="utf-8")
    unit_store = UNIT_STORE.read_text(encoding="utf-8")

    # ------------------------------------------------------------------
    # app/lib/unit-store.ts
    # ------------------------------------------------------------------
    if "linkedEquipmentComponents?: LinkedEquipmentComponentRecord[];" not in unit_store:
        unit_store = replace_once(
            unit_store,
            """export type SavedUnitRecord = {
  id: string;
  savedAt: string;
  companyName?: string;
  customerName: string;
  siteName: string;
  siteAddress: string;
  unitNickname: string;
  propertyType: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  refrigerantType: string;
  errorCode?: string;
  errorCodeSource?: string;
  symptom: string;
  selectedPackId: string;
  flowNodeId: string;
  flowHistory: { nodeId: string; choice: "PASS" | "FAIL"; nextId: string | null }[];
  observations: Observation[];
  finalConfirmedCause?: string;
  actualFixPerformed?: string;
  outcomeStatus?: string;
  callbackOccurred?: string;
  techCloseoutNotes?: string;
  rawResult: string;
  nameplate: NameplateResult | null;
};
""",
            """export type LinkedEquipmentComponentRecord = {
  id: string;
  role: string;
  tag: string;
  manufacturer: string;
  model: string;
  serial: string;
  tagStatus: "readable" | "partial" | "unreadable";
  tagIssueReason: string;
  checkedInsideForInternalLabel: boolean;
};

export type SavedUnitRecord = {
  id: string;
  savedAt: string;
  companyName?: string;
  customerName: string;
  siteName: string;
  siteAddress: string;
  unitNickname: string;
  propertyType: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  refrigerantType: string;
  errorCode?: string;
  errorCodeSource?: string;
  symptom: string;
  selectedPackId: string;
  flowNodeId: string;
  flowHistory: { nodeId: string; choice: "PASS" | "FAIL"; nextId: string | null }[];
  observations: Observation[];
  finalConfirmedCause?: string;
  actualFixPerformed?: string;
  outcomeStatus?: string;
  callbackOccurred?: string;
  techCloseoutNotes?: string;
  rawResult: string;
  nameplate: NameplateResult | null;

  systemType?: "single" | "split_system" | "furnace_ac" | "heat_pump_air_handler" | "walk_in" | "mini_split" | "other_multi";
  primaryComponentRole?: string;
  primaryTagStatus?: "readable" | "partial" | "unreadable";
  primaryTagIssueReason?: string;
  primaryCheckedInsideForInternalLabel?: boolean;
  linkedEquipmentComponents?: LinkedEquipmentComponentRecord[];
};
""",
            "SavedUnitRecord extension",
        )

    # ------------------------------------------------------------------
    # app/hvac_units/page.tsx
    # ------------------------------------------------------------------

    # 1) Add local overlay helpers in component scope
    if "linked-equipment-overlay-v3" not in page:
        block = """      // linked-equipment-overlay-v3
      type LinkedEquipmentOverlayRecord = Pick<
        SavedUnitRecord,
        | "systemType"
        | "primaryComponentRole"
        | "primaryTagStatus"
        | "primaryTagIssueReason"
        | "primaryCheckedInsideForInternalLabel"
        | "linkedEquipmentComponents"
      >;

      const LINKED_EQUIPMENT_OVERLAY_KEY = "skilled_trades_ai_linked_equipment_overlay_v3";

      function loadLinkedEquipmentOverlayMap(): Record<string, LinkedEquipmentOverlayRecord> {
        if (typeof window === "undefined") return {};
        try {
          const raw = localStorage.getItem(LINKED_EQUIPMENT_OVERLAY_KEY);
          if (!raw) return {};
          const parsed = JSON.parse(raw);
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
          return {};
        }
      }

      function saveLinkedEquipmentOverlayMap(map: Record<string, LinkedEquipmentOverlayRecord>) {
        if (typeof window === "undefined") return;
        localStorage.setItem(LINKED_EQUIPMENT_OVERLAY_KEY, JSON.stringify(map));
      }

      function buildLinkedEquipmentOverlay(): LinkedEquipmentOverlayRecord {
        return {
          systemType,
          primaryComponentRole,
          primaryTagStatus,
          primaryTagIssueReason,
          primaryCheckedInsideForInternalLabel,
          linkedEquipmentComponents: Array.isArray(linkedEquipmentComponents)
            ? linkedEquipmentComponents.map((component) => ({ ...component }))
            : [],
        };
      }

      function saveLinkedEquipmentOverlayForUnit(unitId: string) {
        if (!unitId) return;
        const map = loadLinkedEquipmentOverlayMap();
        map[unitId] = buildLinkedEquipmentOverlay();
        saveLinkedEquipmentOverlayMap(map);
      }

      function mergeLinkedEquipmentOverlayIntoSavedUnit(record: SavedUnitRecord): SavedUnitRecord {
        const map = loadLinkedEquipmentOverlayMap();
        const overlay = map[record.id];
        if (!overlay) return record;
        return {
          ...record,
          ...overlay,
          linkedEquipmentComponents: Array.isArray(overlay.linkedEquipmentComponents)
            ? overlay.linkedEquipmentComponents.map((component) => ({ ...component }))
            : [],
        };
      }

      function mergeLinkedEquipmentOverlays(records: SavedUnitRecord[]): SavedUnitRecord[] {
        return records.map((record) => mergeLinkedEquipmentOverlayIntoSavedUnit(record));
      }

"""
        page = insert_before_once(
            page,
            'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
            block,
            "overlay helpers",
        )

    # 2) Extend record created in saveCurrentUnit
    if 'systemType,\n        primaryComponentRole,' not in page:
        page = replace_once(
            page,
            """      const record: SavedUnitRecord = {
        id: makeId(),
        savedAt: new Date().toISOString(),
        customerName,
        siteName,
        siteAddress,
        unitNickname,
        propertyType,
        equipmentType,
        manufacturer,
        model,
        refrigerantType,
        symptom,
        selectedPackId,
        flowNodeId,
        flowHistory,
        finalConfirmedCause,
        actualFixPerformed,
        outcomeStatus,
        callbackOccurred,
        techCloseoutNotes,
        observations,
        rawResult,
        nameplate,
        errorCode,
        errorCodeSource,
      };
""",
            """      const record: SavedUnitRecord = {
        id: makeId(),
        savedAt: new Date().toISOString(),
        companyName,
        customerName,
        siteName,
        siteAddress,
        unitNickname,
        propertyType,
        equipmentType,
        manufacturer,
        model,
        serialNumber,
        refrigerantType,
        symptom,
        selectedPackId,
        flowNodeId,
        flowHistory,
        finalConfirmedCause,
        actualFixPerformed,
        outcomeStatus,
        callbackOccurred,
        techCloseoutNotes,
        observations,
        rawResult,
        nameplate,
        errorCode,
        errorCodeSource,
        systemType,
        primaryComponentRole,
        primaryTagStatus,
        primaryTagIssueReason,
        primaryCheckedInsideForInternalLabel,
        linkedEquipmentComponents: Array.isArray(linkedEquipmentComponents)
          ? linkedEquipmentComponents.map((component) => ({ ...component }))
          : [],
      };
""",
            "saveCurrentUnit record payload",
        )

    # 3) Persist overlay after create + preserve serial in Supabase payload + merge overlays
    if "saveLinkedEquipmentOverlayForUnit(createdUnit.id || record.id);" not in page:
        page = replace_once(
            page,
            """      await createUnitForCurrentUser({
        id: record.id,
        customer_name: record.customerName,
        site_name: record.siteName,
        site_address: record.siteAddress,
        unit_nickname: record.unitNickname,
        property_type: record.propertyType,
        equipment_type: record.equipmentType,
        manufacturer: record.manufacturer,
        model: record.model,
        serial: "",
        refrigerant_type: record.refrigerantType,
      });

      const refreshed = await listUnitsForCurrentUser();
      const mapped = refreshed.map(
        (r: import("../lib/supabase/work-orders").UnitRow) => ({
          id: r.id,
          savedAt: r.created_at || "",
          customerName: r.customer_name || "",
          companyName: r.company_name || "",
          siteName: r.site_name || "",
          siteAddress: r.site_address || "",
          unitNickname: r.unit_nickname || "",
          propertyType: r.property_type || "",
          equipmentType: r.equipment_type || "",
          manufacturer: r.manufacturer || "",
          model: r.model || "",
          refrigerantType: r.refrigerant_type || "",
          symptom: "",
          errorCode: "",
          errorCodeSource: "",
          selectedPackId: "",
          flowNodeId: "",
          flowHistory: [],
          observations: [],
          rawResult: "",
          nameplate: null,
          finalConfirmedCause: "",
          actualFixPerformed: "",
          outcomeStatus: "Not Set",
          callbackOccurred: "No",
          techCloseoutNotes: "",
        })
      );

      setSavedUnits(mapped);
      alert("Unit saved.");
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
      });

      saveLinkedEquipmentOverlayForUnit(createdUnit.id || record.id);

      const refreshed = await listUnitsForCurrentUser();
      const mapped = refreshed.map(
        (r: import("../lib/supabase/work-orders").UnitRow) => ({
          id: r.id,
          savedAt: r.created_at || "",
          customerName: r.customer_name || "",
          companyName: r.company_name || "",
          siteName: r.site_name || "",
          siteAddress: r.site_address || "",
          unitNickname: r.unit_nickname || "",
          propertyType: r.property_type || "",
          equipmentType: r.equipment_type || "",
          manufacturer: r.manufacturer || "",
          model: r.model || "",
          serialNumber: r.serial || "",
          refrigerantType: r.refrigerant_type || "",
          symptom: "",
          errorCode: "",
          errorCodeSource: "",
          selectedPackId: "",
          flowNodeId: "",
          flowHistory: [],
          observations: [],
          rawResult: "",
          nameplate: null,
          finalConfirmedCause: "",
          actualFixPerformed: "",
          outcomeStatus: "Not Set",
          callbackOccurred: "No",
          techCloseoutNotes: "",
        })
      );

      setSavedUnits(mergeLinkedEquipmentOverlays(mapped));
      setCurrentLoadedUnitId(createdUnit.id || record.id);
      alert("Unit saved.");
""",
            "saveCurrentUnit create+refresh",
        )

    # 4) Persist overlay on updateCurrentLoadedUnit
    if "saveLinkedEquipmentOverlayForUnit(updated.id || currentLoadedUnitId);" not in page:
        page = replace_once(
            page,
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
      serial: serialNumber || "",
      refrigerant_type: refrigerantType || "",
    });

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
    });

    saveLinkedEquipmentOverlayForUnit(updated.id || currentLoadedUnitId);
    setCurrentLoadedUnitId(updated.id || currentLoadedUnitId);

    alert("Loaded unit updated.");
""",
            "updateCurrentLoadedUnit overlay",
        )

    # 5) Load overlay + serial + system structure
    if "const mergedRecord = mergeLinkedEquipmentOverlayIntoSavedUnit(record);" not in page:
        page = replace_once(
            page,
            """  function loadUnit(record: SavedUnitRecord) {
    setCurrentLoadedUnitId(record.id);
    setCompanyName(record.companyName || "");
    setCustomerName(record.customerName || "");
    setSiteName(record.siteName || "");
    setSiteAddress(record.siteAddress || "");
    setUnitNickname(record.unitNickname || "");
    setPropertyType(record.propertyType || "Commercial");
    setEquipmentType(record.equipmentType || "RTU");
    setManufacturer(record.manufacturer || "");
    setModel(record.model || "");
    setRefrigerantType(record.refrigerantType || "Unknown");
    setSymptom(record.symptom || "");
    setSelectedPackId(record.selectedPackId || "no_cooling");
    setFlowNodeId(record.flowNodeId || "");
    setFlowHistory(record.flowHistory || []);
    setObservations(record.observations || []);
    setRawResult(record.rawResult || "");
    setNameplate(record.nameplate || null);
    setErrorCode(record.errorCode || "");
    setErrorCodeSource(record.errorCodeSource || "Control Board");
    setFinalConfirmedCause(record.finalConfirmedCause || "");
    setPartsReplaced("");
    setActualFixPerformed(record.actualFixPerformed || "");
    setOutcomeStatus(record.outcomeStatus || "Not Set");
    setCallbackOccurred(record.callbackOccurred || "No");
    setTechCloseoutNotes(record.techCloseoutNotes || "");
    setOutcomeStatus(record.outcomeStatus || "Not Set");
setCallbackOccurred(record.callbackOccurred || "No");
setTechCloseoutNotes(record.techCloseoutNotes || "");

loadUnitServiceTimeline(record.id);
}
""",
            """  function loadUnit(record: SavedUnitRecord) {
    const mergedRecord = mergeLinkedEquipmentOverlayIntoSavedUnit(record);

    setCurrentLoadedUnitId(mergedRecord.id);
    setCompanyName(mergedRecord.companyName || "");
    setCustomerName(mergedRecord.customerName || "");
    setSiteName(mergedRecord.siteName || "");
    setSiteAddress(mergedRecord.siteAddress || "");
    setUnitNickname(mergedRecord.unitNickname || "");
    setPropertyType(mergedRecord.propertyType || "Commercial");
    setEquipmentType(mergedRecord.equipmentType || "RTU");
    setManufacturer(mergedRecord.manufacturer || "");
    setModel(mergedRecord.model || "");
    setSerialNumber(mergedRecord.serialNumber || "");
    setRefrigerantType(mergedRecord.refrigerantType || "Unknown");
    setSymptom(mergedRecord.symptom || "");
    setSelectedPackId(mergedRecord.selectedPackId || "no_cooling");
    setFlowNodeId(mergedRecord.flowNodeId || "");
    setFlowHistory(mergedRecord.flowHistory || []);
    setObservations(mergedRecord.observations || []);
    setRawResult(mergedRecord.rawResult || "");
    setNameplate(mergedRecord.nameplate || null);
    setErrorCode(mergedRecord.errorCode || "");
    setErrorCodeSource(mergedRecord.errorCodeSource || "Control Board");
    setFinalConfirmedCause(mergedRecord.finalConfirmedCause || "");
    setPartsReplaced("");
    setActualFixPerformed(mergedRecord.actualFixPerformed || "");
    setOutcomeStatus(mergedRecord.outcomeStatus || "Not Set");
    setCallbackOccurred(mergedRecord.callbackOccurred || "No");
    setTechCloseoutNotes(mergedRecord.techCloseoutNotes || "");

    setSystemType(mergedRecord.systemType || "single");
    setPrimaryComponentRole(mergedRecord.primaryComponentRole || "unit");
    setPrimaryTagStatus(mergedRecord.primaryTagStatus || "readable");
    setPrimaryTagIssueReason(mergedRecord.primaryTagIssueReason || "");
    setPrimaryCheckedInsideForInternalLabel(Boolean(mergedRecord.primaryCheckedInsideForInternalLabel));
    setLinkedEquipmentComponents(
      Array.isArray(mergedRecord.linkedEquipmentComponents)
        ? mergedRecord.linkedEquipmentComponents.map((component) => ({ ...component }))
        : []
    );

    loadUnitServiceTimeline(mergedRecord.id);
}
""",
            "loadUnit overlay restore",
        )

    # 6) Show linked equipment in Current Loaded Unit panel
    if "linked-equipment-summary-v3" not in page:
        page = replace_once(
            page,
            """                <div><b>Customer:</b> {customerName || "-"}</div>
                <div><b>Site:</b> {siteName || "-"}</div>
                <div><b>Unit Tag:</b> {unitNickname || "-"}</div>
                <div><b>Manufacturer:</b> {manufacturer || "-"}</div>
                <div><b>Model:</b> {model || "-"}</div>
                <div><b>Serial:</b> {serialNumber || "-"}</div>
              </div>

              <SmallHint style={{ marginTop: 10 }}>
""",
            """                <div><b>Customer:</b> {customerName || "-"}</div>
                <div><b>Site:</b> {siteName || "-"}</div>
                <div><b>Unit Tag:</b> {unitNickname || "-"}</div>
                <div><b>Manufacturer:</b> {manufacturer || "-"}</div>
                <div><b>Model:</b> {model || "-"}</div>
                <div><b>Serial:</b> {serialNumber || "-"}</div>
                <div><b>System Type:</b> {systemType || "single"}</div>
                <div><b>Primary Role:</b> {primaryComponentRole || "unit"}</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  {/* linked-equipment-summary-v3 */}
                  <b>Linked Equipment:</b>{" "}
                  {linkedEquipmentComponents.length
                    ? linkedEquipmentComponents.map((component, idx) => {
                        const bits = [
                          component.role || `component ${idx + 1}`,
                          component.tag || "",
                          component.manufacturer || "",
                          component.model || "",
                          component.serial || "",
                        ].filter(Boolean);
                        return bits.join(" • ");
                      }).join(" | ")
                    : "None"}
                </div>
              </div>

              <SmallHint style={{ marginTop: 10 }}>
""",
            "Current Loaded Unit linked equipment summary",
        )

    page_backup = PAGE.with_name(PAGE.name + ".linked-equipment-persistence-v3.bak")
    unit_store_backup = UNIT_STORE.with_name(UNIT_STORE.name + ".linked-equipment-persistence-v3.bak")

    shutil.copy2(PAGE, page_backup)
    shutil.copy2(UNIT_STORE, unit_store_backup)

    PAGE.write_text(page, encoding="utf-8")
    UNIT_STORE.write_text(unit_store, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {page_backup}")
    print(f"Patched {UNIT_STORE}")
    print(f"Backup written to {unit_store_backup}")


if __name__ == "__main__":
    main()