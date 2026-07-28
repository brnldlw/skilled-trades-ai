"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function HelpQuickStart() {
  const { lang } = useLang();
  const [showQuickStartInline, setShowQuickStartInline] = useState(true);

  return (
    <>
      <button
        onClick={() => setShowQuickStartInline((v) => !v)}
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
        {showQuickStartInline ? t("btn_hide_quick_start", lang) : t("btn_show_quick_start", lang)}
      </button>

      {showQuickStartInline ? (
        <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("hqs_1_title", lang)}</div>
            <SmallHint>{t("hqs_1_body", lang)}</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("hqs_2_title", lang)}</div>
            <SmallHint>{t("hqs_2_body", lang)}</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("hqs_3_title", lang)}</div>
            <SmallHint>{t("hqs_3_body", lang)}</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("hqs_4_title", lang)}</div>
            <SmallHint>{t("hqs_4_body", lang)}</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("hqs_5_title", lang)}</div>
            <SmallHint>{t("hqs_5_body", lang)}</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("hqs_faq_title", lang)}</div>
            <SmallHint><b>{t("hqs_faq_1_q", lang)}</b> {t("hqs_faq_1_a", lang)}</SmallHint>
            <SmallHint><b>{t("hqs_faq_2_q", lang)}</b> {t("hqs_faq_2_a", lang)}</SmallHint>
            <SmallHint><b>{t("hqs_faq_3_q", lang)}</b> {t("hqs_faq_3_a", lang)}</SmallHint>
            <SmallHint><b>{t("hqs_faq_4_q", lang)}</b> {t("hqs_faq_4_a", lang)}</SmallHint>
            <SmallHint><b>{t("hqs_faq_5_q", lang)}</b> {t("hqs_faq_5_a", lang)}</SmallHint>
          </div>
        </div>
      ) : (
        <SmallHint style={{ marginTop: 12 }}>
          {t("hqs_hidden", lang)}
        </SmallHint>
      )}
    </>
  );
}
