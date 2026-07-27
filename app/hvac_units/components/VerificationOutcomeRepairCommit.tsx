"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t, type TranslationKey } from "../../lib/translations";

const OUTCOMES = [
  "Verified bad",
  "Tested good",
  "Needs more testing",
  "Replaced",
  "Not the cause",
];

const OUTCOME_KEYS: Record<string, TranslationKey> = {
  "Verified bad": "outcome_verified_bad",
  "Tested good": "outcome_tested_good",
  "Needs more testing": "outcome_needs_more_testing",
  "Replaced": "outcome_replaced",
  "Not the cause": "outcome_not_the_cause",
};

export function VerificationOutcomeRepairCommit({
  selectedPart,
  selectedOutcome,
  onSelectOutcome,
  note,
  onNoteChange,
  onApply,
  message,
}: {
  selectedPart: string;
  selectedOutcome: string;
  onSelectOutcome: (outcome: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onApply: () => void;
  message: string;
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
            {t("label_current_part_focus", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {selectedPart || t("label_choose_part_in_checklist", lang)}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_current_outcome", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {selectedOutcome ? (OUTCOME_KEYS[selectedOutcome] ? t(OUTCOME_KEYS[selectedOutcome], lang) : selectedOutcome) : t("label_not_selected", lang)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {OUTCOMES.map((outcome) => {
          const active = selectedOutcome === outcome;
          return (
            <button
              key={outcome}
              type="button"
              onClick={() => onSelectOutcome(outcome)}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 999,
                background: active ? "#eef6ff" : "#ffffff",
                color: "#111",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              {t(OUTCOME_KEYS[outcome], lang)}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontWeight: 900 }}>{t("label_verification_note_optional", lang)}</label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: 8 }}
          placeholder={t("verification_note_placeholder", lang)}
        />
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
          {t("btn_apply_verification_outcome", lang)}
        </button>
      </div>

      {message ? (
        <SmallHint>
          <b>{t("label_verification_outcome_colon", lang)}</b> {message}
        </SmallHint>
      ) : null}
    </div>
  );
}
