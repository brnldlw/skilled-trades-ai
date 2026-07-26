"use client";

import { SmallHint } from "./SmallHint";

type Payload = {
  summary: string;
  inspect: string[];
  verifyNext: string[];
  repairDecisionEmphasis: string[];
  partsToVerifyEmphasis: string[];
  photoCanSupport: string[];
  photoCannotProve: string[];
  photoPartTieIn: string[];
  watchOuts: string[];
};

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

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
      <div style={{ fontWeight: 900 }}>{title}</div>
      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
        {items.map((item, idx) => (
          <li key={idx}>
            <SmallHint>{item}</SmallHint>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PhotoDrivenDiagnosticAssist({
  payload,
  photoCount,
  targetComponent,
  photoSubject,
  onPhotoSubjectChange,
  onRefresh,
  onAddToTechNotes,
  message,
}: {
  payload: Payload;
  photoCount: number;
  targetComponent: string;
  photoSubject: string;
  onPhotoSubjectChange: (value: string) => void;
  onRefresh: () => void;
  onAddToTechNotes: () => void;
  message: string;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 12,
        background: "#fafafa",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16 }}>
        Photo-Driven Diagnostic Assist
      </div>

      <SmallHint>
        Choose what the photo is of and the app will turn the current component, symptom, and history into practical inspection guidance.
      </SmallHint>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            Attached Service Event Photos
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {photoCount}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            Target Component
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {targetComponent || "Primary component"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontWeight: 900 }}>What is this photo of?</label>
        <select
          value={photoSubject}
          onChange={(e) => onPhotoSubjectChange(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="iced_coil">Iced coil / frost pattern</option>
          <option value="contactor_capacitor">Contactor / capacitor</option>
          <option value="control_board">Control board</option>
          <option value="wiring">Wiring</option>
          <option value="nameplate_tag">Nameplate / tag</option>
          <option value="drain_defrost">Drain / defrost issue</option>
          <option value="dirty_coil_airflow">Dirty coil / airflow issue</option>
          <option value="compressor_section">Compressor section</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={onRefresh} style={btnStyle}>
          Refresh Photo Assist
        </button>

        <button type="button" onClick={onAddToTechNotes} style={btnStyle}>
          Add Photo Assist to Tech Notes
        </button>
      </div>

      {message ? (
        <SmallHint>
          <b>Photo Assist:</b> {message}
        </SmallHint>
      ) : null}

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
        <SmallHint>{payload.summary}</SmallHint>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        <List title="What to Inspect" items={payload.inspect} />
        <List title="What to Verify Next" items={payload.verifyNext} />
        <List title="Repair Decision Emphasis" items={payload.repairDecisionEmphasis} />
        <List title="Parts to Verify Emphasis" items={payload.partsToVerifyEmphasis} />
        <List title="What This Photo Can Support" items={payload.photoCanSupport} />
        <List title="What This Photo Cannot Prove" items={payload.photoCannotProve} />
        <List title="Selected Part Tie-In" items={payload.photoPartTieIn} />
        <List title="Watch-Outs" items={payload.watchOuts} />
      </div>
    </div>
  );
}
