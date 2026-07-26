"use client";

import { SmallHint } from "./SmallHint";

type SimilarCase = {
  savedAt: string;
  symptom: string;
  finalConfirmedCause: string;
  actualFixPerformed: string;
  outcomeStatus: string;
  callbackOccurred: string;
};

export function SimilarPriorCases({ cases }: { cases: SimilarCase[] }) {
  if (!cases.length) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 900 }}>Similar prior cases</div>
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        {cases.map((item, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <SmallHint>
              <b>Saved:</b> {item.savedAt ? new Date(item.savedAt).toLocaleString() : "-"}
            </SmallHint>
            <SmallHint style={{ marginTop: 4 }}>
              <b>Symptom:</b> {item.symptom || "-"}
            </SmallHint>
            <SmallHint style={{ marginTop: 4 }}>
              <b>Confirmed cause:</b> {item.finalConfirmedCause || "-"}
            </SmallHint>
            <SmallHint style={{ marginTop: 4 }}>
              <b>Actual fix:</b> {item.actualFixPerformed || "-"}
            </SmallHint>
            <SmallHint style={{ marginTop: 4 }}>
              <b>Outcome:</b> {item.outcomeStatus || "-"} • <b>Callback:</b> {item.callbackOccurred || "-"}
            </SmallHint>
          </div>
        ))}
      </div>
    </div>
  );
}
