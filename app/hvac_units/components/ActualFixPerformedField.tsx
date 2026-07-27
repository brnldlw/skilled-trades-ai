"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t, type TranslationKey } from "../../lib/translations";

const QUICK_FIXES = [
  "Replaced Capacitor",
  "Replaced Contactor",
  "Replaced Motor",
  "Added Refrigerant",
  "Cleaned Condenser",
  "Replaced Filter/Drier",
  "Cleared Drain",
  "Replaced Sensor / Control",
];

const QUICK_FIX_KEYS: Record<string, TranslationKey> = {
  "Replaced Capacitor": "quick_fix_replaced_capacitor",
  "Replaced Contactor": "quick_fix_replaced_contactor",
  "Replaced Motor": "quick_fix_replaced_motor",
  "Added Refrigerant": "quick_fix_added_refrigerant",
  "Cleaned Condenser": "quick_fix_cleaned_condenser",
  "Replaced Filter/Drier": "quick_fix_replaced_filter",
  "Cleared Drain": "quick_fix_cleared_drain",
  "Replaced Sensor / Control": "quick_fix_replaced_sensor",
};

function browserSupportsFieldDictation() {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function ActualFixPerformedField({
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
  const dictationSupported = browserSupportsFieldDictation();

  return (
    <>
      <label style={{ fontWeight: 900 }}>{t("label_actual_fix_performed", lang)}</label>
      <br />
      <textarea
        data-auto-grow="true"
        onInput={onAutoGrow}
        rows={6}
        style={{ width: "100%", padding: 8, minHeight: 160, resize: "vertical" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></textarea>

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
          {listening ? t("dictation_listening", lang) : t("btn_start_actual_fix_dictation", lang)}
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
          <b>{t("label_actual_fix_dictation_colon", lang)}</b> {dictationMessage}
        </SmallHint>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {QUICK_FIXES.map((fix) => (
          <button
            key={fix}
            onClick={() => onChange(fix)}
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
            {t(QUICK_FIX_KEYS[fix], lang)}
          </button>
        ))}
      </div>

      <input
        placeholder="Example: replaced 45/5 capacitor, cleaned condenser, replaced water inlet valve"
        style={{ width: "100%", padding: 8 }}
      />
    </>
  );
}
