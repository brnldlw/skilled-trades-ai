"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t, type TranslationKey } from "../../lib/translations";

const QUICK_CAUSES = [
  "Bad Capacitor",
  "Failed Contactor",
  "Failed Motor",
  "Low Refrigerant",
  "Dirty Condenser",
  "Restricted Filter/Drier",
  "Drain Issue",
  "Sensor / Control Issue",
];

const QUICK_CAUSE_KEYS: Record<string, TranslationKey> = {
  "Bad Capacitor": "quick_cause_bad_capacitor",
  "Failed Contactor": "quick_cause_failed_contactor",
  "Failed Motor": "quick_cause_failed_motor",
  "Low Refrigerant": "quick_cause_low_refrigerant",
  "Dirty Condenser": "quick_cause_dirty_condenser",
  "Restricted Filter/Drier": "quick_cause_restricted_filter",
  "Drain Issue": "quick_cause_drain_issue",
  "Sensor / Control Issue": "quick_cause_sensor_control",
};

function browserSupportsFieldDictation() {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function FinalConfirmedCauseField({
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
      <label style={{ fontWeight: 900 }}>{t("label_final_confirmed_cause", lang)}</label>
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
          {listening ? t("dictation_listening", lang) : t("btn_start_confirmed_cause_dictation", lang)}
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
          <b>{t("label_confirmed_cause_dictation_colon", lang)}</b> {dictationMessage}
        </SmallHint>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {QUICK_CAUSES.map((cause) => (
          <button
            key={cause}
            onClick={() => onChange(cause)}
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
            {t(QUICK_CAUSE_KEYS[cause], lang)}
          </button>
        ))}
      </div>

      <input
        placeholder="Example: failed dual run capacitor, restricted filter-drier, dirty condenser, bad float switch"
        style={{ width: "100%", padding: 8 }}
      />
    </>
  );
}
