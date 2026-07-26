"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";

export function HelpQuickStart() {
  const [showQuickStartInline, setShowQuickStartInline] = useState(true);

  return (
    <>
      <button
        onClick={() => setShowQuickStartInline((v) => !v)}
        style={{
          padding: "10px 14px",
          fontWeight: 900,
          border: "1px solid #cfcfcf",
          borderRadius: 10,
          background: "#ffffff",
          color: "#111",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        {showQuickStartInline ? "Hide Quick Start" : "Show Quick Start"}
      </button>

      {showQuickStartInline ? (
        <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>1. Quick Start</div>
            <SmallHint>Save a new unit or load an existing one. Enter the symptom, use the hints, add photos if needed, then save the call to the timeline.</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>2. Historical Entry</div>
            <SmallHint>Load the unit first whenever possible. Turn on Historical Entry Mode to reduce clutter. Enter service date, symptom, cause, fix, outcome, callback, and notes. Use Save & Add Another for multiple old calls on the same unit.</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>3. Photos</div>
            <SmallHint>Open Service Event Photos, take or attach photos, then save the call so the photos stay with that service event and appear later in timeline/profile history.</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>4. Editing</div>
            <SmallHint>Load a unit and use Update Loaded Unit to correct unit details. In Unit Service Timeline, use Edit Event to fix a saved service entry, then use Update Event to save changes.</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>5. Parts / Manuals / Hints</div>
            <SmallHint>Unit History Troubleshooting Hints uses saved history from that unit. Parts & Manuals Assist gives broad search and history-aware suggestions. History is guidance only and does not stop you from chasing a brand-new issue.</SmallHint>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>FAQ</div>
            <SmallHint><b>How do I avoid duplicates?</b> Load the unit first when possible. Serial number is the strongest identifier.</SmallHint>
            <SmallHint><b>How do I correct a unit?</b> Load it, change the fields, then click Update Loaded Unit.</SmallHint>
            <SmallHint><b>How do I fix a saved call?</b> Use Edit Event in the Unit Service Timeline.</SmallHint>
            <SmallHint><b>How do I enter lots of old calls fast?</b> Use Historical Entry Mode and Save & Add Another.</SmallHint>
            <SmallHint><b>Where do photos go?</b> Photos attach to the service event and show in the timeline/profile later.</SmallHint>
          </div>
        </div>
      ) : (
        <SmallHint style={{ marginTop: 12 }}>
          Hidden to keep the main workflow clean.
        </SmallHint>
      )}
    </>
  );
}
