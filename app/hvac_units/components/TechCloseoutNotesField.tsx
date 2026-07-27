"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t, type TranslationKey } from "../../lib/translations";

const QUICK_NOTES: { labelKey: TranslationKey; valueKey: TranslationKey }[] = [
  { labelKey: "quick_note_verified_operation_label", valueKey: "quick_note_verified_operation_value" },
  { labelKey: "quick_note_advised_customer_label", valueKey: "quick_note_advised_customer_value" },
  { labelKey: "quick_note_recommend_followup_label", valueKey: "quick_note_recommend_followup_value" },
  { labelKey: "quick_note_monitor_unit_label", valueKey: "quick_note_monitor_unit_value" },
  { labelKey: "quick_note_temp_repair_label", valueKey: "quick_note_temp_repair_value" },
  { labelKey: "quick_note_parts_ordered_label", valueKey: "quick_note_parts_ordered_value" },
  { labelKey: "quick_note_operating_departure_label", valueKey: "quick_note_operating_departure_value" },
  { labelKey: "quick_note_customer_declined_label", valueKey: "quick_note_customer_declined_value" },
];

function browserSupportsTechCloseoutDictation() {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function TechCloseoutNotesField({
  value,
  onChange,
  onAutoGrow,
  listening,
  dictationMessage,
  onStartDictation,
  onStopDictation,
}: {
  value: string;
  onChange: (value: string) => void;
  onAutoGrow: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  listening: boolean;
  dictationMessage: string;
  onStartDictation: () => void;
  onStopDictation: () => void;
}) {
  const { lang } = useLang();
  const dictationSupported = browserSupportsTechCloseoutDictation();

  return (
    <>
      <label style={{ fontWeight: 900 }}>{t("label_tech_closeout_notes", lang)}</label>
      <br />
      <textarea
        data-auto-grow="true"
        onInput={onAutoGrow}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onStartDictation}
          disabled={!dictationSupported || listening}
          style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: listening ? "#f7f7f7" : "#ffffff",
            color: "#111",
            cursor: !dictationSupported || listening ? "not-allowed" : "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            opacity: !dictationSupported || listening ? 0.7 : 1,
          }}
        >
          {listening ? t("dictation_listening", lang) : t("btn_start_note_dictation", lang)}
        </button>

        <button
          type="button"
          onClick={onStopDictation}
          disabled={!listening}
          style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111",
            cursor: listening ? "pointer" : "not-allowed",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            opacity: listening ? 1 : 0.7,
          }}
        >
          {t("btn_stop_dictation", lang)}
        </button>
      </div>

      {!dictationSupported ? (
        <SmallHint style={{ marginTop: 6 }}>
          {t("dictation_not_supported", lang)}
        </SmallHint>
      ) : null}

      {dictationMessage ? (
        <SmallHint style={{ marginTop: 6 }}>
          <b>{t("label_dictation_colon", lang)}</b> {dictationMessage}
        </SmallHint>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {QUICK_NOTES.map((note) => (
          <button
            key={note.labelKey}
            onClick={() => onChange(t(note.valueKey, lang))}
            style={{
              padding: "8px 12px",
              fontWeight: 900,
              border: "1px solid #cfcfcf",
              borderRadius: 10,
              background: "#ffffff",
              color: "#111",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {t(note.labelKey, lang)}
          </button>
        ))}
      </div>

      <textarea
        placeholder="What proved the fault, what was replaced/repaired, any notes for the next tech, anything unusual"
        style={{ width: "100%", padding: 8, minHeight: 100 }}
      />
    </>
  );
}
