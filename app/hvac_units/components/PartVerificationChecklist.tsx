"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type ChecklistPayload = {
  selectedPart: string;
  availableParts: string[];
  checklist: string[];
  notes: string[];
};

export function PartVerificationChecklist({
  payload,
  onSelectPart,
  onAddPartsReplaced,
}: {
  payload: ChecklistPayload;
  onSelectPart: (part: string) => void;
  onAddPartsReplaced: (part: string) => void;
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
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 900 }}>{t("part_verif_selected_to_verify", lang)}</label>
          <select
            value={payload.selectedPart}
            onChange={(e) => onSelectPart(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">{t("choose_a_part", lang)}</option>
            {payload.availableParts.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_current_part_focus", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.selectedPart || t("choose_a_part", lang)}
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
        <div style={{ fontWeight: 900 }}>{t("label_verification_checklist", lang)}</div>
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          {payload.checklist.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
        <div style={{ fontWeight: 900 }}>{t("label_context_notes", lang)}</div>
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          {payload.notes.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>

      {payload.selectedPart ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => onAddPartsReplaced(payload.selectedPart)}
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
            {t("btn_add_selected_part_to_replaced", lang)}
          </button>
        </div>
      ) : null}
    </div>
  );
}
