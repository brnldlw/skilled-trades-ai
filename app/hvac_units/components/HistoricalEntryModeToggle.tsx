"use client";

import { SmallHint } from "./SmallHint";

export function HistoricalEntryModeToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <button
        onClick={onToggle}
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
        {enabled ? "Turn Historical Entry Mode Off" : "Turn Historical Entry Mode On"}
      </button>

      <SmallHint style={{ marginTop: 12 }}>
        {enabled
          ? "Historical Entry Mode is ON. Company/admin sections are hidden so you can enter past calls faster."
          : "Turn this on when entering old service calls. It hides company/admin clutter and keeps the screen cleaner."}
      </SmallHint>
    </>
  );
}
