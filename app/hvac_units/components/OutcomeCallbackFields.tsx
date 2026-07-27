"use client";

import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

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

export function OutcomeCallbackFields({
  outcomeStatus,
  onOutcomeStatusChange,
  callbackOccurred,
  onCallbackOccurredChange,
}: {
  outcomeStatus: string;
  onOutcomeStatusChange: (value: string) => void;
  callbackOccurred: string;
  onCallbackOccurredChange: (value: string) => void;
}) {
  const { lang } = useLang();
  return (
    <>
      <div>
        <label style={{ fontWeight: 900 }}>{t("label_outcome_status", lang)}</label>
        <br />
        <select
          value={outcomeStatus}
          onChange={(e) => onOutcomeStatusChange(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="Not Set">{t("outcome_status_not_set", lang)}</option>
          <option value="Fixed">{t("outcome_status_fixed", lang)}</option>
          <option value="Partially Fixed">{t("outcome_status_partially_fixed", lang)}</option>
          <option value="Needs More Work">{t("outcome_status_needs_more_work", lang)}</option>
          <option value="Monitoring">{t("outcome_status_monitoring", lang)}</option>
        </select>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button onClick={() => onOutcomeStatusChange("Fixed")} style={btnStyle}>
            {t("outcome_status_fixed", lang)}
          </button>
          <button onClick={() => onOutcomeStatusChange("Needs Follow-Up")} style={btnStyle}>
            {t("btn_needs_followup", lang)}
          </button>
          <button onClick={() => onOutcomeStatusChange("Partial")} style={btnStyle}>
            {t("btn_partial", lang)}
          </button>
          <button onClick={() => onOutcomeStatusChange("Not Set")} style={btnStyle}>
            {t("outcome_status_not_set", lang)}
          </button>
        </div>
      </div>

      <div>
        <label style={{ fontWeight: 900 }}>{t("label_callback_occurred", lang)}</label>
        <br />
        <select
          value={callbackOccurred}
          onChange={(e) => onCallbackOccurredChange(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="No">{t("option_no", lang)}</option>
          <option value="Yes">{t("option_yes", lang)}</option>
        </select>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button onClick={() => onCallbackOccurredChange("No")} style={btnStyle}>
            {t("btn_callback_no", lang)}
          </button>
          <button onClick={() => onCallbackOccurredChange("Yes")} style={btnStyle}>
            {t("btn_callback_yes", lang)}
          </button>
        </div>
      </div>
    </>
  );
}
