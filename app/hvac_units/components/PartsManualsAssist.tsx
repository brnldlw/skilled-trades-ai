"use client";

import { SmallHint } from "./SmallHint";
import { useJobIdentity } from "../context/JobIdentity";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type ServiceEvent = {
  final_confirmed_cause?: string | null;
  actual_fix_performed?: string | null;
  parts_replaced?: string | null;
};

export function PartsManualsAssist({
  equipmentType,
  serviceHistory,
}: {
  equipmentType: string;
  serviceHistory: ServiceEvent[];
}) {
  const { lang } = useLang();
  const { manufacturer, model, symptom } = useJobIdentity();

  const baseUnitQuery = [manufacturer, model, equipmentType]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const cleanedSymptom = String(symptom || "").trim();

  const causeCounts = serviceHistory.reduce<Record<string, number>>((acc, event) => {
    const key = String(event.final_confirmed_cause || "").trim();
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const fixCounts = serviceHistory.reduce<Record<string, number>>((acc, event) => {
    const key = String(
      event.parts_replaced || event.actual_fix_performed || ""
    ).trim();
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0];
  const topFix = Object.entries(fixCounts).sort((a, b) => b[1] - a[1])[0];

  const manualSearchQuery = `${baseUnitQuery} service manual pdf`
    .replace(/\s+/g, " ")
    .trim();

  const broadPartsSearchQuery = `${baseUnitQuery} ${cleanedSymptom || "parts"}`
    .replace(/\s+/g, " ")
    .trim();

  const historyAwarePartsSearchQuery = `${baseUnitQuery} ${topCause?.[0] || topFix?.[0] || cleanedSymptom || "parts"}`
    .replace(/\s+/g, " ")
    .trim();

  const likelyCheck = topCause?.[0] || topFix?.[0] || cleanedSymptom || "-";

  const partCounts = serviceHistory.reduce<Record<string, number>>((acc, event) => {
    const raw = String(
      event.parts_replaced || event.actual_fix_performed || ""
    ).trim();

    if (!raw) return acc;

    raw
      .split(/,|\/|;|\band\b/gi)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((part) => {
        acc[part] = (acc[part] || 0) + 1;
      });

    return acc;
  }, {});

  const historyTopParts = Object.entries(partCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);

  const inferLikelyParts = (value: string) => {
    const v = String(value || "").toLowerCase();
    const out: string[] = [];

    if (v.includes("capacitor")) out.push(t("part_capacitor", lang));
    if (v.includes("contactor")) out.push(t("part_contactor", lang));
    if (v.includes("motor") || v.includes("blower") || v.includes("fan")) out.push(t("part_motor", lang));
    if (v.includes("compressor")) out.push(t("part_compressor", lang));
    if (v.includes("refrigerant") || v.includes("low charge") || v.includes("low temp")) out.push(t("part_refrigerant_circuit", lang));
    if (v.includes("drier") || v.includes("filter")) out.push(t("part_filter_drier", lang));
    if (v.includes("sensor")) out.push(t("part_sensor", lang));
    if (v.includes("control") || v.includes("board")) out.push(t("part_control_board", lang));
    if (v.includes("drain") || v.includes("water leak") || v.includes("float")) out.push(t("part_drain_float_switch", lang));
    if (v.includes("txv")) out.push(t("part_txv", lang));

    return out;
  };

  const suggestedParts = Array.from(
    new Set([
      ...historyTopParts,
      ...inferLikelyParts(topCause?.[0] || ""),
      ...inferLikelyParts(topFix?.[0] || ""),
      ...inferLikelyParts(cleanedSymptom || ""),
    ])
  ).slice(0, 6);

  return !baseUnitQuery ? (
    <SmallHint>
      {t("pma_enter_manufacturer_hint", lang)}
    </SmallHint>
  ) : (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <div>
          <b>{t("pma_manual_search", lang)}</b> {manualSearchQuery || "-"}
        </div>
        <div>
          <b>{t("pma_current_symptom_search", lang)}</b> {broadPartsSearchQuery || "-"}
        </div>
      </div>

      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        <SmallHint>
          <b>{t("pma_history_hint", lang)}</b>{" "}
          {t("pma_history_hint_body", lang).split("{value}")[0]}
          <b>{likelyCheck}</b>
          {t("pma_history_hint_body", lang).split("{value}")[1]}
        </SmallHint>
      </div>

      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 8 }}>{t("pma_history_based_parts", lang)}</div>

        {suggestedParts.length ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {suggestedParts.map((part) => (
              <span
                key={part}
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
                {part}
              </span>
            ))}
          </div>
        ) : (
          <SmallHint>{t("pma_no_likely_parts", lang)}</SmallHint>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() =>
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(manualSearchQuery)}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
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
          {t("btn_open_manual_search", lang)}
        </button>

        <button
          onClick={() =>
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(broadPartsSearchQuery)}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
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
          {t("btn_open_broad_parts_search", lang)}
        </button>

        <button
          onClick={() =>
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(historyAwarePartsSearchQuery)}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
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
          {t("btn_open_history_aware_search", lang)}
        </button>
      </div>
    </div>
  );
}
