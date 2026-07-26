"use client";

import { SmallHint } from "./SmallHint";
import type { ErrorCodeGuidance } from "../lib/errorCodeGuidance";

export function ErrorCodeGuidancePanel({ guidance }: { guidance: ErrorCodeGuidance | null }) {
  if (!guidance) {
    return (
      <SmallHint>
        Enter an error code to generate code-specific guidance.
      </SmallHint>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 10,
        padding: 10,
        background: "#fafafa",
      }}
    >
      <div style={{ fontWeight: 900 }}>{guidance.title}</div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>Summary</div>
        <SmallHint style={{ marginTop: 4 }}>{guidance.summary}</SmallHint>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>First checks</div>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {guidance.firstChecks.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>Warnings</div>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {guidance.warnings.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>What to check next</div>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {guidance.nextSteps.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
