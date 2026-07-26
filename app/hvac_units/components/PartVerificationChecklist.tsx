"use client";

import { SmallHint } from "./SmallHint";

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
          <label style={{ fontWeight: 900 }}>Selected Part To Verify</label>
          <select
            value={payload.selectedPart}
            onChange={(e) => onSelectPart(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">Choose a part</option>
            {payload.availableParts.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            Current Part Focus
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.selectedPart || "Choose a part"}
          </div>
        </div>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
        <div style={{ fontWeight: 900 }}>Verification Checklist</div>
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          {payload.checklist.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
        <div style={{ fontWeight: 900 }}>Context Notes</div>
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
            Add Selected Part to Parts Replaced
          </button>
        </div>
      ) : null}
    </div>
  );
}
