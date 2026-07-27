"use client";

import { SmallHint } from "./SmallHint";
import { useJobIdentity } from "../context/JobIdentity";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type LinkedComponent = {
  role: string;
  tag: string;
  manufacturer: string;
  model: string;
  serial: string;
};

export function CurrentLoadedUnit({
  currentLoadedUnitId,
  customerName,
  siteName,
  unitNickname,
  serialNumber,
  systemType,
  primaryComponentRole,
  linkedEquipmentComponents,
}: {
  currentLoadedUnitId: string;
  customerName: string;
  siteName: string;
  unitNickname: string;
  serialNumber: string;
  systemType: string;
  primaryComponentRole: string;
  linkedEquipmentComponents: LinkedComponent[];
}) {
  const { manufacturer, model } = useJobIdentity();
  const { lang } = useLang();

  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 12,
        background: currentLoadedUnitId ? "#f7fbff" : "#fafafa",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 8px",
            borderRadius: 999,
            border: "1px solid #cfcfcf",
            background: currentLoadedUnitId ? "#eefaf0" : "#f7f7f7",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {currentLoadedUnitId ? t("clu_unit_loaded", lang) : t("clu_no_unit_loaded", lang)}
        </span>

        {currentLoadedUnitId ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: 999,
              border: "1px solid #cfcfcf",
              background: "#f7f7f7",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            ID: {currentLoadedUnitId.slice(0, 8)}
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <div><b>{t("clu_customer", lang)}</b> {customerName || "-"}</div>
        <div><b>{t("clu_site", lang)}</b> {siteName || "-"}</div>
        <div><b>{t("clu_unit_tag", lang)}</b> {unitNickname || "-"}</div>
        <div><b>{t("clu_manufacturer", lang)}</b> {manufacturer || "-"}</div>
        <div><b>{t("clu_model", lang)}</b> {model || "-"}</div>
        <div><b>{t("clu_serial", lang)}</b> {serialNumber || "-"}</div>
        <div><b>{t("clu_system_type", lang)}</b> {systemType || "single"}</div>
        <div><b>{t("clu_primary_role", lang)}</b> {primaryComponentRole || "unit"}</div>
        <div style={{ gridColumn: "1 / -1" }}>
          <b>{t("clu_linked_equipment", lang)}</b>{" "}
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
            : t("clu_none", lang)}
        </div>
      </div>

      <SmallHint style={{ marginTop: 10 }}>
        {t("clu_hint", lang)}
      </SmallHint>
    </div>
  );
}
