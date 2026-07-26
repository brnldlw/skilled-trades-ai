"use client";

import { SmallHint } from "./SmallHint";

const QUICK_FIXES = [
  "Replaced Capacitor",
  "Replaced Contactor",
  "Replaced Motor",
  "Added Refrigerant",
  "Cleaned Condenser",
  "Replaced Filter/Drier",
  "Cleared Drain",
  "Replaced Sensor / Control",
];

function browserSupportsFieldDictation() {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function ActualFixPerformedField({
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
  const dictationSupported = browserSupportsFieldDictation();

  return (
    <>
      <label style={{ fontWeight: 900 }}>{"Actual Fix Performed"}</label>
      <br />
      <textarea
        data-auto-grow="true"
        onInput={onAutoGrow}
        rows={6}
        style={{ width: "100%", padding: 8, minHeight: 160, resize: "vertical" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></textarea>

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
          {listening ? "Listening..." : "Start Actual Fix Dictation"}
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
          <b>Actual Fix Dictation:</b> {dictationMessage}
        </SmallHint>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {QUICK_FIXES.map((fix) => (
          <button
            key={fix}
            onClick={() => onChange(fix)}
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
            {fix}
          </button>
        ))}
      </div>

      <input
        placeholder="Example: replaced 45/5 capacitor, cleaned condenser, replaced water inlet valve"
        style={{ width: "100%", padding: 8 }}
      />
    </>
  );
}
