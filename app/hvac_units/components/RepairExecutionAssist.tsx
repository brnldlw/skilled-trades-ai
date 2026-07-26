"use client";

import { SmallHint } from "./SmallHint";

type RepairExecutionPayload = {
  selectedPart: string;
  searchQuery: string;
  verifyFirst: string[];
  replaceSteps: string[];
  safety: string[];
  mistakes: string[];
  watchAfterRepair: string[];
  youtubeSearchUrl: string;
  webSearchUrl: string;
};

export function RepairExecutionAssist({ payload }: { payload: RepairExecutionPayload }) {
  if (!payload.selectedPart) {
    return (
      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
              Current Part Focus
            </div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>
              None selected yet
            </div>
          </div>

          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
              What Unlocks This
            </div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>
              Select a part in Part Verification Checklist
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: 12,
            background: "#fffaf0",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>
            Repair help is ready once a part is selected.
          </div>

          <SmallHint>This section will show:</SmallHint>

          <ul style={{ marginTop: 0, paddingLeft: 18 }}>
            <li><SmallHint>Verify First</SmallHint></li>
            <li><SmallHint>Replace Steps</SmallHint></li>
            <li><SmallHint>Safety / Shutdown</SmallHint></li>
            <li><SmallHint>Common Mistakes</SmallHint></li>
            <li><SmallHint>Watch After Repair</SmallHint></li>
            <li><SmallHint>YouTube / Web repair search links</SmallHint></li>
          </ul>

          <SmallHint>
            Pick a likely part in <b>Part Verification Checklist</b> and this section will automatically fill in.
          </SmallHint>
        </div>
      </div>
    );
  }

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
            Selected Part
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.selectedPart}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            Search Context
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.searchQuery}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {payload.youtubeSearchUrl ? (
          <a
            href={payload.youtubeSearchUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 12px",
              fontWeight: 900,
              border: "1px solid #cfcfcf",
              borderRadius: 10,
              background: "#ffffff",
              color: "#111",
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            Open YouTube Repair Search
          </a>
        ) : null}

        {payload.webSearchUrl ? (
          <a
            href={payload.webSearchUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 12px",
              fontWeight: 900,
              border: "1px solid #cfcfcf",
              borderRadius: 10,
              background: "#ffffff",
              color: "#111",
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            Open Web Search
          </a>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>Verify First</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.verifyFirst.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>Replace Steps</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.replaceSteps.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>Safety / Shutdown</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.safety.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>Common Mistakes</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.mistakes.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>Watch After Repair</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.watchAfterRepair.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
