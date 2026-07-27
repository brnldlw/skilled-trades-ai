"use client";

import { SmallHint } from "./SmallHint";
import { Badge } from "./Badge";
import { useLang } from "../../components/LanguageContext";
import { t, type TranslationKey } from "../../lib/translations";

const SOURCE_KEYS: Record<string, TranslationKey> = {
  entered: "source_entered",
  "pt-chart": "source_pt_chart",
  "gauge-photo": "source_gauge_photo",
  none: "source_none",
};

type ChargeAnalysis = {
  deltaT: number | null;
  superheat: number | null;
  subcool: number | null;
  evapSat: number | null;
  condSat: number | null;
  evapSatSource: "entered" | "pt-chart" | "gauge-photo" | "none";
  condSatSource: "entered" | "pt-chart" | "gauge-photo" | "none";
  summary: string;
  findings: string[];
};

export function PtChartChargeDiagnosis({ chargeAnalysis }: { chargeAnalysis: ChargeAnalysis }) {
  const { lang } = useLang();
  const translateSource = (source: string) => {
    const key = SOURCE_KEYS[source];
    return key ? t(key, lang) : source;
  };
  return (
    <>
      <SmallHint>
        {t("pt_chart_hint", lang)}
      </SmallHint>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginTop: 12,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>{t("label_delta_t", lang)}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {chargeAnalysis.deltaT !== null ? `${chargeAnalysis.deltaT}°F` : "—"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>{t("measure_superheat", lang)}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {chargeAnalysis.superheat !== null ? `${chargeAnalysis.superheat}°F` : "—"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>{t("measure_subcool", lang)}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {chargeAnalysis.subcool !== null ? `${chargeAnalysis.subcool}°F` : "—"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginTop: 10,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>
            {t("label_evap_saturation", lang)}
            <Badge text={translateSource(chargeAnalysis.evapSatSource)} />
          </div>
          <div style={{ marginTop: 6 }}>
            {chargeAnalysis.evapSat !== null ? `${chargeAnalysis.evapSat}°F` : "—"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>
            {t("label_condensing_saturation", lang)}
            <Badge text={translateSource(chargeAnalysis.condSatSource)} />
          </div>
          <div style={{ marginTop: 6 }}>
            {chargeAnalysis.condSat !== null ? `${chargeAnalysis.condSat}°F` : "—"}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 900 }}>{t("label_charge_condition", lang)}</div>
        <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
          {chargeAnalysis.summary}
        </div>
        {chargeAnalysis.findings.length ? (
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {chargeAnalysis.findings.map((f, i) => (
              <li key={i}>
                <SmallHint>{f}</SmallHint>
              </li>
            ))}
          </ul>
        ) : (
          <SmallHint style={{ marginTop: 8 }}>
            {t("charge_diagnosis_more_readings", lang)}
          </SmallHint>
        )}
      </div>
    </>
  );
}
