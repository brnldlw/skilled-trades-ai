"use client";

import { SmallHint } from "./SmallHint";
import type { ErrorCodeGuidance } from "../lib/errorCodeGuidance";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function ErrorCodeGuidancePanel({ guidance }: { guidance: ErrorCodeGuidance | null }) {
  const { lang } = useLang();
  if (!guidance) {
    return (
      <SmallHint>
        {t("error_code_empty", lang)}
      </SmallHint>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 10,
        padding: 10,
        background: "#fafafa",
      }}
    >
      <div style={{ fontWeight: 900 }}>{guidance.title}</div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>{t("label_summary", lang)}</div>
        <SmallHint style={{ marginTop: 4 }}>{guidance.summary}</SmallHint>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>{t("label_first_checks", lang)}</div>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {guidance.firstChecks.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>{t("label_warnings", lang)}</div>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {guidance.warnings.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>{t("label_what_to_check_next", lang)}</div>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {guidance.nextSteps.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
