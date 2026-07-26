"use client";

import { SmallHint } from "./SmallHint";
import { PillButton } from "./PillButton";

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
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 900 }}>{node.title}</div>
      <div style={{ marginTop: 6, fontSize: 16 }}>{node.question}</div>
      {node.how ? (
        <SmallHint style={{ marginTop: 8 }}>How: {node.how}</SmallHint>
      ) : null}
      {node.suggestedMeasurement ? (
        <SmallHint style={{ marginTop: 8 }}>
          Suggested next reading: <b>{node.suggestedMeasurement}</b>
        </SmallHint>
      ) : null}

      {!node.terminal ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <PillButton text={node.passLabel || "PASS"} onClick={onPass} />
          <PillButton text={node.failLabel || "FAIL"} onClick={onFail} />
          <PillButton
            text="Use suggested reading"
            onClick={onUseSuggestedReading}
            disabled={!node.suggestedMeasurement}
          />
          <PillButton text="Reset flow" onClick={onResetFlow} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <PillButton text="Reset flow" onClick={onResetFlow} />
          <PillButton text="Diagnose now" onClick={onDiagnoseNow} />
        </div>
      )}
    </div>
  );
}
