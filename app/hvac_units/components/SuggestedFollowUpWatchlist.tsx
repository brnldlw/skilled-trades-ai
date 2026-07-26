"use client";

import { SmallHint } from "./SmallHint";

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
            Selected Part
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.selectedPart || "Choose a part in Part Verification Checklist"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            Verification Outcome
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.selectedOutcome || "Choose an outcome in Verification Outcome + Repair Commit"}
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
          <div style={{ fontWeight: 900 }}>Watch Next</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.watchNext.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>Recheck Items</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.recheckItems.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>Callback Risk</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.callbackRisk.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>Monitoring Notes</div>
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
          Add Watchlist to Follow-Up + Tech Notes
        </button>
      </div>

      {message ? (
        <SmallHint>
          <b>Watchlist:</b> {message}
        </SmallHint>
      ) : null}
    </div>
  );
}
