"use client";

import { SmallHint } from "./SmallHint";

type DefrostAnalysis = {
  summary: string;
  findings: string[];
};

export function DefrostIntelligence({ defrostAnalysis }: { defrostAnalysis: DefrostAnalysis }) {
  return (
    <>
      <SmallHint>
        Uses defrost timer state, heater amps, termination state, box temp, and coil temp
        to spot refrigeration defrost problems.
      </SmallHint>

      <div
        style={{
          marginTop: 12,
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 900 }}>Defrost Summary</div>
        <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
          {defrostAnalysis.summary}
        </div>

        {defrostAnalysis.findings.length ? (
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {defrostAnalysis.findings.map((f, i) => (
              <li key={i}>
                <SmallHint>{f}</SmallHint>
              </li>
            ))}
          </ul>
        ) : (
          <SmallHint style={{ marginTop: 8 }}>
            Add defrost timer state, heater amps, termination stat state, box temp,
            and evap coil temp for tighter refrigeration diagnosis.
          </SmallHint>
        )}
      </div>
    </>
  );
}
