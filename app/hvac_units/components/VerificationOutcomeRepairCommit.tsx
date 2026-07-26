"use client";

import { SmallHint } from "./SmallHint";

const OUTCOMES = [
  "Verified bad",
  "Tested good",
  "Needs more testing",
  "Replaced",
  "Not the cause",
];

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
            Current Part Focus
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {selectedPart || "Choose a part in Part Verification Checklist"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            Current Outcome
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {selectedOutcome || "Not selected"}
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
              {outcome}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontWeight: 900 }}>Verification Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: 8 }}
          placeholder="Example: coil voltage present, contacts burnt, replaced contactor and rechecked operation"
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
          Apply Verification Outcome
        </button>
      </div>

      {message ? (
        <SmallHint>
          <b>Verification Outcome:</b> {message}
        </SmallHint>
      ) : null}
    </div>
  );
}
