"use client";

import { SmallHint } from "./SmallHint";
import { useJobIdentity } from "../context/JobIdentity";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type RepairDecision = {
  part: string;
  why: string;
  verifyFirst: string;
  blindRisk: string;
};

export function RepairDecisionPanel({
  decisions,
  targetComponent,
  sameComponentHistoryCount,
  onAddPartsReplaced,
}: {
  decisions: RepairDecision[];
  targetComponent: string;
  sameComponentHistoryCount: number;
  onAddPartsReplaced: (part: string) => void;
}) {
  const { symptom } = useJobIdentity();
  const { lang } = useLang();

  if (!decisions.length) {
    return (
      <div style={{ marginTop: 12 }}>
        <SmallHint>{t("repair_decision_empty", lang)}</SmallHint>
      </div>
    );
  }

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
            {t("label_target_component", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{targetComponent || t("fallback_primary_component", lang)}</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_current_symptom", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{symptom || "—"}</div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_same_component_history", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{sameComponentHistoryCount}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {decisions.map((item, idx) => (
          <div
            key={`${item.part}-${idx}`}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 12,
              background: "#fafafa",
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 900 }}>
                {t("label_decision_n", lang)} {idx + 1}: {item.part}
              </div>

              <button
                type="button"
                onClick={() => onAddPartsReplaced(item.part)}
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
                {t("btn_add_part_to_replaced", lang)}
              </button>
            </div>

            <SmallHint><b>{t("label_why_in_play", lang)}</b> {item.why}</SmallHint>
            <SmallHint><b>{t("label_verify_before_replacing", lang)}</b> {item.verifyFirst}</SmallHint>
            <SmallHint><b>{t("label_blind_replace_risk", lang)}</b> {item.blindRisk}</SmallHint>
          </div>
        ))}
      </div>
    </div>
  );
}
