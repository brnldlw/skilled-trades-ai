"use client";

import { SmallHint } from "./SmallHint";
import { PillButton } from "./PillButton";
import type { SavedUnitRecord } from "../../lib/unit-store";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function SiteUnitsAtLocation({
  customerName,
  siteName,
  siteUnitsAtLocation,
  currentLoadedUnitId,
  onLoadUnit,
}: {
  customerName: string;
  siteName: string;
  siteUnitsAtLocation: SavedUnitRecord[];
  currentLoadedUnitId: string;
  onLoadUnit: (record: SavedUnitRecord) => void;
}) {
  const { lang } = useLang();

  if (!customerName.trim() || !siteName.trim()) {
    return (
      <SmallHint>
        {t("site_units_empty_prompt", lang)}
      </SmallHint>
    );
  }

  if (!siteUnitsAtLocation.length) {
    return (
      <SmallHint>
        {t("site_units_none_found", lang)}
      </SmallHint>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <SmallHint>
        {t("site_units_count", lang)} <b>{siteUnitsAtLocation.length}</b>
      </SmallHint>

      {siteUnitsAtLocation.map((unit) => (
        <div
          key={unit.id}
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 10,
            padding: 10,
            background:
              currentLoadedUnitId && currentLoadedUnitId === unit.id
                ? "#f7fbff"
                : "#fafafa",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 900 }}>
              {unit.unitNickname || t("site_units_no_tag", lang)}
            </div>

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
              {unit.equipmentType || t("site_units_unknown_type", lang)}
            </span>

            {currentLoadedUnitId && currentLoadedUnitId === unit.id ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: "1px solid #cfcfcf",
                  background: "#eefaf0",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {t("site_units_currently_loaded", lang)}
              </span>
            ) : null}
          </div>

          <SmallHint style={{ marginTop: 6 }}>
            {unit.manufacturer || "-"} {unit.model || "-"} • Serial: {unit.serialNumber || "-"}
          </SmallHint>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <PillButton text={t("btn_load_this_unit", lang)} onClick={() => onLoadUnit(unit)} />
          </div>
        </div>
      ))}
    </div>
  );
}
