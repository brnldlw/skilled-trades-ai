"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

function browserSupportsPartsReplacedDictation() {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function PartsReplacedField({
  value,
  onChange,
  listening,
  dictationMessage,
  onStartDictation,
  onStopDictation,
  chips,
  onAddChip,
}: {
  value: string;
  onChange: (value: string) => void;
  listening: boolean;
  dictationMessage: string;
  onStartDictation: () => void;
  onStopDictation: () => void;
  chips: string[];
  onAddChip: (chip: string) => void;
}) {
  const { lang } = useLang();
  const dictationSupported = browserSupportsPartsReplacedDictation();

  return (
    <>
      <label style={{ fontWeight: 900 }}>{t("label_parts_replaced_field", lang)}</label>
      <br />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Example: dual run capacitor, condenser fan motor, TXV, contactor"
        style={{ width: "100%", padding: 8 }}
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
          {listening ? t("dictation_listening", lang) : t("btn_start_parts_replaced_dictation", lang)}
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
          <b>{t("label_parts_replaced_dictation_colon", lang)}</b> {dictationMessage}
        </SmallHint>
      ) : null}

      {chips.length ? (
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          <SmallHint>
            <b>{t("quick_parts_chips_label", lang)}</b> {t("quick_parts_chips_hint", lang)}
          </SmallHint>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {chips.slice(0, 10).map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onAddChip(chip)}
                style={{
                  padding: "6px 10px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 999,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
