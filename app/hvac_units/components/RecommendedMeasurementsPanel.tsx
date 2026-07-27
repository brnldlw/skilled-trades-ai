"use client";

import { SmallHint } from "./SmallHint";
import type { MeasurementCoachingItem } from "../lib/measurementCoaching";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function RecommendedMeasurementsPanel({ items }: { items: MeasurementCoachingItem[] }) {
  const { lang } = useLang();
  return items.length ? (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 10,
            background: "#fafafa",
          }}
        >
          <div style={{ fontWeight: 900 }}>{item.measurement}</div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>{t("label_tool_to_use", lang)}</div>
            <SmallHint style={{ marginTop: 4 }}>{item.tool}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>{t("label_where_to_measure", lang)}</div>
            <SmallHint style={{ marginTop: 4 }}>{item.whereToMeasure}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>{t("label_expected_reading", lang)}</div>
            <SmallHint style={{ marginTop: 4 }}>{item.expectedResult}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>{t("label_if_high", lang)}</div>
            <SmallHint style={{ marginTop: 4 }}>{item.ifHigh}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>{t("label_if_low", lang)}</div>
            <SmallHint style={{ marginTop: 4 }}>{item.ifLow}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>{t("label_next_step", lang)}</div>
            <SmallHint style={{ marginTop: 4 }}>{item.nextStep}</SmallHint>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <SmallHint>
      {t("recommended_measurements_empty", lang)}
    </SmallHint>
  );
}
