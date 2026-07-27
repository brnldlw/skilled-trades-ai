"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type WatchlistPayload = {
  selectedPart: string;
  selectedOutcome: string;
  watchNext: string[];
  recheckItems: string[];
  callbackRisk: string[];
  monitoringNote: string[];
};

export function SuggestedFollowUpWatchlist({
  payload,
  message,
  onApply,
}: {
  payload: WatchlistPayload;
  message: string;
  onApply: () => void;
}) {
  const { lang } = useLang();
  return (
    <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_selected_part", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.selectedPart || t("label_choose_part_in_checklist", lang)}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_verification_outcome", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.selectedOutcome || t("label_choose_outcome", lang)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>{t("label_watch_next", lang)}</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.watchNext.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>{t("label_recheck_items", lang)}</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.recheckItems.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>{t("label_callback_risk", lang)}</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.callbackRisk.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>{t("label_monitoring_notes", lang)}</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.monitoringNote.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onApply}
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
          {t("btn_add_watchlist_to_followup", lang)}
        </button>
      </div>

      {message ? (
        <SmallHint>
          <b>{t("label_watchlist_colon", lang)}</b> {message}
        </SmallHint>
      ) : null}
    </div>
  );
}
