"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function HistoricalEntryModeToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  const { lang } = useLang();
  return (
    <>
      <button
        onClick={onToggle}
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
        {enabled ? t("btn_historical_mode_off", lang) : t("btn_historical_mode_on", lang)}
      </button>

      <SmallHint style={{ marginTop: 12 }}>
        {enabled
          ? t("historical_mode_on_hint", lang)
          : t("historical_mode_off_hint", lang)}
      </SmallHint>
    </>
  );
}
