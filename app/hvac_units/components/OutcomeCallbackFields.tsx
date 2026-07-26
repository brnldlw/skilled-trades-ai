"use client";

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
  return (
    <>
      <div>
        <label style={{ fontWeight: 900 }}>{"Outcome Status"}</label>
        <br />
        <select
          value={outcomeStatus}
          onChange={(e) => onOutcomeStatusChange(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option>Not Set</option>
          <option>Fixed</option>
          <option>Partially Fixed</option>
          <option>Needs More Work</option>
          <option>Monitoring</option>
        </select>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button onClick={() => onOutcomeStatusChange("Fixed")} style={btnStyle}>
            Fixed
          </button>
          <button onClick={() => onOutcomeStatusChange("Needs Follow-Up")} style={btnStyle}>
            Needs Follow-Up
          </button>
          <button onClick={() => onOutcomeStatusChange("Partial")} style={btnStyle}>
            Partial
          </button>
          <button onClick={() => onOutcomeStatusChange("Not Set")} style={btnStyle}>
            Not Set
          </button>
        </div>
      </div>

      <div>
        <label style={{ fontWeight: 900 }}>Callback Occurred</label>
        <br />
        <select
          value={callbackOccurred}
          onChange={(e) => onCallbackOccurredChange(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option>No</option>
          <option>Yes</option>
        </select>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button onClick={() => onCallbackOccurredChange("No")} style={btnStyle}>
            Callback No
          </button>
          <button onClick={() => onCallbackOccurredChange("Yes")} style={btnStyle}>
            Callback Yes
          </button>
        </div>
      </div>
    </>
  );
}
