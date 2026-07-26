"use client";

import { SmallHint } from "./SmallHint";

type Draft = {
  summary: string;
  checks: string;
  closeout: string;
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

export function PhotoAssistPanel({
  photoCount,
  targetComponent,
  latestPhotoUrl,
  photoType,
  onPhotoTypeChange,
  onGenerate,
  onPushToTechNotes,
  message,
  draft,
  onDraftFieldChange,
  onCopy,
}: {
  photoCount: number;
  targetComponent: string;
  latestPhotoUrl: string;
  photoType: string;
  onPhotoTypeChange: (value: string) => void;
  onGenerate: () => void;
  onPushToTechNotes: () => void;
  message: string;
  draft: Draft;
  onDraftFieldChange: (field: keyof Draft, value: string) => void;
  onCopy: (field: keyof Draft) => void;
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
        Photo Assist
      </div>

      <SmallHint>
        Use the attached photo plus the current component, symptom, readings, and history to generate
        what the photo should help verify, what to check next, and a closeout note.
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
            Attached Photos
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

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            Latest Photo
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {latestPhotoUrl ? "Ready" : "No photo yet"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontWeight: 900 }}>Photo Type</label>
        <select
          value={photoType}
          onChange={(e) => onPhotoTypeChange(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="general">General component photo</option>
          <option value="board_wiring">Board / wiring photo</option>
          <option value="ice_pattern">Ice / frost pattern photo</option>
          <option value="coil_condition">Coil condition photo</option>
          <option value="data_plate">Data plate / tag photo</option>
          <option value="failed_part">Failed part photo</option>
        </select>
      </div>

      {latestPhotoUrl ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 900 }}>Latest Attached Photo Preview</div>
          <img
            src={latestPhotoUrl}
            alt="Latest service event photo"
            style={{
              maxWidth: "100%",
              maxHeight: 260,
              objectFit: "contain",
              border: "1px solid #ddd",
              borderRadius: 10,
              background: "#fff",
              padding: 8,
            }}
          />
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={onGenerate} style={btnStyle}>
          Generate Photo Assist
        </button>

        <button type="button" onClick={onPushToTechNotes} style={btnStyle}>
          Add Photo Note to Tech Notes
        </button>
      </div>

      {message ? (
        <SmallHint>
          <b>Photo Assist:</b> {message}
        </SmallHint>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>What This Photo Should Help Verify</div>
          <textarea
            value={draft.summary}
            onChange={(e) => onDraftFieldChange("summary", e.target.value)}
            rows={7}
            style={{ width: "100%", padding: 8, minHeight: 140, resize: "vertical" }}
          />
          <button type="button" onClick={() => onCopy("summary")} style={btnStyle}>
            Copy Summary
          </button>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>What To Check Next From The Photo</div>
          <textarea
            value={draft.checks}
            onChange={(e) => onDraftFieldChange("checks", e.target.value)}
            rows={8}
            style={{ width: "100%", padding: 8, minHeight: 160, resize: "vertical" }}
          />
          <button type="button" onClick={() => onCopy("checks")} style={btnStyle}>
            Copy Checks
          </button>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>Suggested Photo Closeout Note</div>
          <textarea
            value={draft.closeout}
            onChange={(e) => onDraftFieldChange("closeout", e.target.value)}
            rows={7}
            style={{ width: "100%", padding: 8, minHeight: 140, resize: "vertical" }}
          />
          <button type="button" onClick={() => onCopy("closeout")} style={btnStyle}>
            Copy Closeout Note
          </button>
        </div>
      </div>
    </div>
  );
}
