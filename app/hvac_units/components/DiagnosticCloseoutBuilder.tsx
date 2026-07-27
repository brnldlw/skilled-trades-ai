"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type Drafts = {
  customerSummary: string;
  internalSummary: string;
  followUp: string;
};

function browserSupportsFollowUpDictation() {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

const btnStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontWeight: 900,
  border: "1px solid #cfcfcf",
  borderRadius: 10,
  background: "#ffffff",
  color: "#111",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

export function DiagnosticCloseoutBuilder({
  drafts,
  onDraftFieldChange,
  message,
  onGenerate,
  onPushInternalSummary,
  onCopy,
  onAutoGrow,
  followUpListening,
  followUpDictationMessage,
  onStartFollowUpDictation,
  onStopFollowUpDictation,
}: {
  drafts: Drafts;
  onDraftFieldChange: (field: keyof Drafts, value: string) => void;
  message: string;
  onGenerate: () => void;
  onPushInternalSummary: () => void;
  onCopy: (field: keyof Drafts) => void;
  onAutoGrow: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  followUpListening: boolean;
  followUpDictationMessage: string;
  onStartFollowUpDictation: () => void;
  onStopFollowUpDictation: () => void;
}) {
  const { lang } = useLang();
  const followUpDictationSupported = browserSupportsFollowUpDictation();

  return (
    <div
      style={{
        marginTop: 12,
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 12,
        background: "#fafafa",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16 }}>
        {t("closeout_builder_title", lang)}
      </div>

      <SmallHint>
        {t("closeout_builder_hint", lang)}
      </SmallHint>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={onGenerate} style={btnStyle}>
          {t("btn_generate_closeout_drafts", lang)}
        </button>

        <button type="button" onClick={onPushInternalSummary} style={btnStyle}>
          {t("btn_add_internal_summary", lang)}
        </button>
      </div>

      {message ? (
        <SmallHint>
          <b>{t("label_closeout_builder_colon", lang)}</b> {message}
        </SmallHint>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>{t("label_customer_summary", lang)}</div>
          <textarea
            data-auto-grow="true"
            onInput={onAutoGrow}
            value={drafts.customerSummary}
            onChange={(e) => onDraftFieldChange("customerSummary", e.target.value)}
            rows={8}
            style={{ width: "100%", padding: 8 }}
          />
          <button type="button" onClick={() => onCopy("customerSummary")} style={btnStyle}>
            {t("btn_copy_customer_summary", lang)}
          </button>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>{t("label_internal_tech_summary", lang)}</div>
          <textarea
            data-auto-grow="true"
            onInput={onAutoGrow}
            value={drafts.internalSummary}
            onChange={(e) => onDraftFieldChange("internalSummary", e.target.value)}
            rows={8}
            style={{ width: "100%", padding: 8 }}
          />
          <button type="button" onClick={() => onCopy("internalSummary")} style={btnStyle}>
            {t("btn_copy_internal_summary", lang)}
          </button>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>{t("label_recommended_followup", lang)}</div>
          <textarea
            data-auto-grow="true"
            onInput={onAutoGrow}
            value={drafts.followUp}
            onChange={(e) => onDraftFieldChange("followUp", e.target.value)}
            rows={8}
            style={{ width: "100%", padding: 8 }}
          />

          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onStartFollowUpDictation}
              disabled={!followUpDictationSupported || followUpListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: followUpListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !followUpDictationSupported || followUpListening ? "not-allowed" : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: !followUpDictationSupported || followUpListening ? 0.7 : 1,
              }}
            >
              {followUpListening ? t("dictation_listening", lang) : t("btn_start_followup_dictation", lang)}
            </button>

            <button
              type="button"
              onClick={onStopFollowUpDictation}
              disabled={!followUpListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: followUpListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: followUpListening ? 1 : 0.7,
              }}
            >
              {t("btn_stop_dictation", lang)}
            </button>
          </div>

          {!followUpDictationSupported ? (
            <SmallHint style={{ marginTop: 6 }}>
              {t("dictation_not_supported", lang)}
            </SmallHint>
          ) : null}

          {followUpDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>{t("label_followup_dictation_colon", lang)}</b> {followUpDictationMessage}
            </SmallHint>
          ) : null}

          <button type="button" onClick={() => onCopy("followUp")} style={btnStyle}>
            {t("btn_copy_followup", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
