"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type SimilarCase = {
  savedAt: string;
  symptom: string;
  finalConfirmedCause: string;
  actualFixPerformed: string;
  outcomeStatus: string;
  callbackOccurred: string;
};

export function SimilarPriorCases({ cases }: { cases: SimilarCase[] }) {
  const { lang } = useLang();
  if (!cases.length) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 900 }}>{t("similar_prior_cases_title", lang)}</div>
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        {cases.map((item, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <SmallHint>
              <b>{t("label_saved_colon", lang)}</b> {item.savedAt ? new Date(item.savedAt).toLocaleString() : "-"}
            </SmallHint>
            <SmallHint style={{ marginTop: 4 }}>
              <b>{t("label_symptom_colon", lang)}</b> {item.symptom || "-"}
            </SmallHint>
            <SmallHint style={{ marginTop: 4 }}>
              <b>{t("label_confirmed_cause_colon", lang)}</b> {item.finalConfirmedCause || "-"}
            </SmallHint>
            <SmallHint style={{ marginTop: 4 }}>
              <b>{t("label_actual_fix_colon", lang)}</b> {item.actualFixPerformed || "-"}
            </SmallHint>
            <SmallHint style={{ marginTop: 4 }}>
              <b>{t("label_outcome_colon", lang)}</b> {item.outcomeStatus || "-"} • <b>{t("label_callback_colon", lang)}</b> {item.callbackOccurred || "-"}
            </SmallHint>
          </div>
        ))}
      </div>
    </div>
  );
}
