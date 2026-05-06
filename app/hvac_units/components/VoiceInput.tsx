"use client";

import React, { useState, useRef, useCallback } from "react";

type VoiceInputProps = {
  onResult: (text: string) => void;
  placeholder?: string;
  hint?: string;
  compact?: boolean;
};

type SpeechRecognitionEvent = {
  results: { [key: number]: { [key: number]: { transcript: string } } };
  resultIndex: number;
};

export function VoiceInputButton({
  onResult,
  hint = "Tap and speak",
  compact = false,
}: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  });
  const recogRef = useRef<any>(null);

  const start = useCallback(() => {
    if (!supported || listening) return;
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;

    const r = new Ctor();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.maxAlternatives = 1;

    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[e.resultIndex][0].transcript.trim();
      if (transcript) onResult(transcript);
    };

    recogRef.current = r;
    r.start();
  }, [supported, listening, onResult]);

  const stop = useCallback(() => {
    if (recogRef.current) {
      recogRef.current.stop();
      setListening(false);
    }
  }, []);

  if (!supported) return null;

  if (compact) {
    return (
      <button
        type="button"
        onClick={listening ? stop : start}
        title={hint}
        aria-label={listening ? "Stop recording" : hint}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: listening ? "2px solid #dc2626" : "1px solid #cbd5e1",
          background: listening ? "#fef2f2" : "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          animation: listening ? "pulse-mic 1s ease-in-out infinite" : "none",
        }}
      >
        <span style={{ fontSize: 14 }}>{listening ? "⏹" : "🎤"}</span>
        <style>{`
          @keyframes pulse-mic {
            0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
            50% { box-shadow: 0 0 0 6px rgba(220,38,38,0); }
          }
        `}</style>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 8,
        border: listening ? "2px solid #dc2626" : "1px solid #cbd5e1",
        background: listening ? "#fef2f2" : "#f8fafc",
        color: listening ? "#dc2626" : "#374151",
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "inherit",
        animation: listening ? "pulse-mic 1s ease-in-out infinite" : "none",
      }}
    >
      <span style={{ fontSize: 16 }}>{listening ? "⏹" : "🎤"}</span>
      {listening ? "Tap to stop" : hint}
      <style>{`
        @keyframes pulse-mic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(220,38,38,0); }
        }
      `}</style>
    </button>
  );
}

// ── Voice-enabled text area ─────────────────────────────────
type VoiceTextAreaProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
};

export function VoiceTextArea({
  value,
  onChange,
  placeholder = "Type or tap mic to speak...",
  rows = 3,
  label,
}: VoiceTextAreaProps) {
  return (
    <div style={{ position: "relative" }}>
      {label && (
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4 }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: "100%",
            padding: "8px 40px 8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: 14,
            fontFamily: "inherit",
            resize: "vertical" as const,
            lineHeight: 1.5,
          }}
        />
        <div style={{ position: "absolute", right: 6, top: 6 }}>
          <VoiceInputButton
            onResult={(text) => onChange(value ? value + " " + text : text)}
            hint="Speak to add text"
            compact
          />
        </div>
      </div>
    </div>
  );
}

// ── Readings voice parser ───────────────────────────────────
// Parses spoken readings like "suction 118 head 385 superheat 14"
// and returns structured key-value pairs
export type ParsedReading = {
  label: string;
  value: string;
  unit: string;
};

export function parseSpokenReadings(text: string): ParsedReading[] {
  const results: ParsedReading[] = [];
  const lower = text.toLowerCase();

  const patterns: { keywords: string[]; label: string; unit: string }[] = [
    { keywords: ["suction pressure", "suction psi", "suction press", "low side", "suction"], label: "Suction Pressure", unit: "psi" },
    { keywords: ["head pressure", "discharge pressure", "high side", "liquid pressure", "liquid line pressure", "head"], label: "Liquid Pressure", unit: "psi" },
    { keywords: ["superheat", "super heat"], label: "Superheat", unit: "°F" },
    { keywords: ["subcooling", "sub cooling", "subcool"], label: "Subcool", unit: "°F" },
    { keywords: ["return air", "return temp", "return"], label: "Return Air Temp", unit: "°F" },
    { keywords: ["supply air", "supply temp", "supply"], label: "Supply Air Temp", unit: "°F" },
    { keywords: ["delta t", "delta-t", "temperature difference", "temp diff"], label: "Delta T (Return-Supply)", unit: "°F" },
    { keywords: ["suction line temp", "suction temp", "suction line"], label: "Suction Line Temp", unit: "°F" },
    { keywords: ["liquid line temp", "liquid temp", "liquid line"], label: "Liquid Line Temp", unit: "°F" },
    { keywords: ["amps", "amperage", "compressor amps", "amp draw"], label: "Compressor Amps", unit: "amps" },
    { keywords: ["volts", "voltage", "line voltage"], label: "Line Voltage", unit: "volts" },
    { keywords: ["static pressure", "static"], label: "External Static Pressure", unit: "inWC" },
    { keywords: ["outdoor temp", "ambient temp", "ambient", "outdoor"], label: "Outdoor Ambient Temp", unit: "°F" },
    { keywords: ["discharge temp", "discharge line"], label: "Discharge Line Temp", unit: "°F" },
    { keywords: ["flame sensor", "flame"], label: "Flame Sensor", unit: "µA" },
  ];

  // Extract numbers from text
  const numberPattern = /\b(\d+(?:\.\d+)?)\b/g;

  for (const p of patterns) {
    for (const keyword of p.keywords) {
      if (lower.includes(keyword)) {
        // Find position of keyword and look for nearest number
        const idx = lower.indexOf(keyword);
        const after = lower.slice(idx + keyword.length, idx + keyword.length + 30);
        const match = after.match(/^\s*(?:is|was|reading|at|of)?\s*(\d+(?:\.\d+)?)/);
        if (match) {
          results.push({ label: p.label, value: match[1], unit: p.unit });
          break;
        }
        // Look for number before keyword
        const before = lower.slice(Math.max(0, idx - 15), idx);
        const beforeMatch = before.match(/(\d+(?:\.\d+)?)\s*$/);
        if (beforeMatch) {
          results.push({ label: p.label, value: beforeMatch[1], unit: p.unit });
          break;
        }
      }
    }
  }

  return results;
}

// ── Smart readings voice input ──────────────────────────────
type SmartReadingsVoiceProps = {
  onReadings: (readings: ParsedReading[]) => void;
  onRawText?: (text: string) => void;
};

export function SmartReadingsVoice({ onReadings, onRawText }: SmartReadingsVoiceProps) {
  const [listening, setListening] = useState(false);
  const [lastText, setLastText] = useState("");
  const [parsed, setParsed] = useState<ParsedReading[]>([]);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  });
  const recogRef = useRef<any>(null);

  function start() {
    if (!supported || listening) return;
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[e.resultIndex][0].transcript.trim();
      setLastText(text);
      if (onRawText) onRawText(text);
      const readings = parseSpokenReadings(text);
      setParsed(readings);
      if (readings.length) onReadings(readings);
    };
    recogRef.current = r;
    r.start();
  }

  if (!supported) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        onClick={listening ? () => { recogRef.current?.stop(); setListening(false); } : start}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 10,
          border: listening ? "2px solid #dc2626" : "2px solid #2563eb",
          background: listening ? "#fef2f2" : "#eff6ff",
          color: listening ? "#dc2626" : "#1d4ed8",
          fontWeight: 800,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "inherit",
          width: "100%",
          justifyContent: "center",
          animation: listening ? "pulse-mic 1s ease-in-out infinite" : "none",
        }}
      >
        <span style={{ fontSize: 18 }}>{listening ? "⏹" : "🎤"}</span>
        {listening
          ? "Listening... tap to stop"
          : "Speak Readings — e.g. \"suction 118, head 385, superheat 14\""}
      </button>

      {lastText && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>HEARD:</div>
          <div style={{ fontSize: 13, color: "#374151" }}>{lastText}</div>
        </div>
      )}

      {parsed.length > 0 && (
        <div style={{ marginTop: 6, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 11, color: "#166534", marginBottom: 6, fontWeight: 600 }}>PARSED {parsed.length} READING{parsed.length !== 1 ? "S" : ""}:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {parsed.map((r, i) => (
              <div key={i} style={{ fontSize: 12, color: "#166534", display: "flex", justifyContent: "space-between" }}>
                <span>{r.label}</span>
                <span style={{ fontWeight: 700 }}>{r.value} {r.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-mic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(220,38,38,0); }
        }
      `}</style>
    </div>
  );
}