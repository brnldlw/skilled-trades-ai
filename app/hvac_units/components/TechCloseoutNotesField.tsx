"use client";

import { SmallHint } from "./SmallHint";

const QUICK_NOTES = [
  { label: "Verified Operation", value: "Verified operation after repair." },
  { label: "Advised Customer", value: "Advised customer of findings and repair performed." },
  { label: "Recommend Follow-Up", value: "Recommend follow-up." },
  { label: "Monitor Unit", value: "Monitor unit operation." },
  { label: "Temporary Repair", value: "Temporary repair completed. Return visit may be needed." },
  { label: "Parts Ordered", value: "Parts ordered. Return visit required after parts arrive." },
  { label: "Operating At Departure", value: "Unit operating at departure." },
  { label: "Customer Declined", value: "Customer declined additional repair at this time." },
];

function browserSupportsTechCloseoutDictation() {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function TechCloseoutNotesField({
  value,
  onChange,
  onAutoGrow,
  listening,
  dictationMessage,
  onStartDictation,
  onStopDictation,
}: {
  value: string;
  onChange: (value: string) => void;
  onAutoGrow: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  listening: boolean;
  dictationMessage: string;
  onStartDictation: () => void;
  onStopDictation: () => void;
}) {
  const dictationSupported = browserSupportsTechCloseoutDictation();

  return (
    <>
      <label style={{ fontWeight: 900 }}>Tech Closeout Notes</label>
      <br />
      <textarea
        data-auto-grow="true"
        onInput={onAutoGrow}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onStartDictation}
          disabled={!dictationSupported || listening}
          style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: listening ? "#f7f7f7" : "#ffffff",
            color: "#111",
            cursor: !dictationSupported || listening ? "not-allowed" : "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            opacity: !dictationSupported || listening ? 0.7 : 1,
          }}
        >
          {listening ? "Listening..." : "Start Note Dictation"}
        </button>

        <button
          type="button"
          onClick={onStopDictation}
          disabled={!listening}
          style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111",
            cursor: listening ? "pointer" : "not-allowed",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            opacity: listening ? 1 : 0.7,
          }}
        >
          Stop Dictation
        </button>
      </div>

      {!dictationSupported ? (
        <SmallHint style={{ marginTop: 6 }}>
          Dictation is not supported in this browser. Try Chrome or Edge.
        </SmallHint>
      ) : null}

      {dictationMessage ? (
        <SmallHint style={{ marginTop: 6 }}>
          <b>Dictation:</b> {dictationMessage}
        </SmallHint>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {QUICK_NOTES.map((note) => (
          <button
            key={note.label}
            onClick={() => onChange(note.value)}
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
            {note.label}
          </button>
        ))}
      </div>

      <textarea
        placeholder="What proved the fault, what was replaced/repaired, any notes for the next tech, anything unusual"
        style={{ width: "100%", padding: 8, minHeight: 100 }}
      />
    </>
  );
}
