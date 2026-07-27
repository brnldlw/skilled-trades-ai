"use client";

import { SmallHint } from "./SmallHint";
import { PillButton } from "./PillButton";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";
import { translateMeasurementLabel } from "../data/presets";

type FlowNode = {
  title: string;
  question: string;
  how?: string;
  passLabel?: string;
  failLabel?: string;
  suggestedMeasurement?: string;
  terminal?: boolean;
};

export function RealFlowchartEngine({
  node,
  onPass,
  onFail,
  onUseSuggestedReading,
  onResetFlow,
  onDiagnoseNow,
}: {
  node: FlowNode;
  onPass: () => void;
  onFail: () => void;
  onUseSuggestedReading: () => void;
  onResetFlow: () => void;
  onDiagnoseNow: () => void;
}) {
  const { lang } = useLang();
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 900 }}>{node.title}</div>
      <div style={{ marginTop: 6, fontSize: 16 }}>{node.question}</div>
      {node.how ? (
        <SmallHint style={{ marginTop: 8 }}>{t("label_how", lang)} {node.how}</SmallHint>
      ) : null}
      {node.suggestedMeasurement ? (
        <SmallHint style={{ marginTop: 8 }}>
          {t("label_suggested_next_reading", lang)} <b>{translateMeasurementLabel(node.suggestedMeasurement, lang)}</b>
        </SmallHint>
      ) : null}

      {!node.terminal ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <PillButton text={node.passLabel || t("default_pass", lang)} onClick={onPass} />
          <PillButton text={node.failLabel || t("default_fail", lang)} onClick={onFail} />
          <PillButton
            text={t("btn_use_suggested_reading", lang)}
            onClick={onUseSuggestedReading}
            disabled={!node.suggestedMeasurement}
          />
          <PillButton text={t("btn_reset_flow", lang)} onClick={onResetFlow} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <PillButton text={t("btn_reset_flow", lang)} onClick={onResetFlow} />
          <PillButton text={t("btn_diagnose_now", lang)} onClick={onDiagnoseNow} />
        </div>
      )}
    </div>
  );
}
