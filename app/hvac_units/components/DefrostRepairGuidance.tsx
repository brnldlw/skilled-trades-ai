"use client";

import { SmallHint } from "./SmallHint";
import { Badge } from "./Badge";

type GuidanceItem = {
  part: string;
  priority: string;
  why: string;
  nextTest: string;
  quickCheck: string;
};

export function DefrostRepairGuidance({ guidance }: { guidance: GuidanceItem[] }) {
  return (
    <>
      <SmallHint>
        Shows likely failed parts, why they are suspect, and the next field check to perform.
      </SmallHint>

      {guidance.length ? (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {guidance.map((item, idx) => (
            <div
              key={`${item.part}-${idx}`}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 10,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 900 }}>
                {item.part}
                <Badge text={item.priority} />
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Why it is suspect</div>
                <SmallHint style={{ marginTop: 4 }}>{item.why}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Next test</div>
                <SmallHint style={{ marginTop: 4 }}>{item.nextTest}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Quick field check</div>
                <SmallHint style={{ marginTop: 4 }}>{item.quickCheck}</SmallHint>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 10,
            background: "#fafafa",
          }}
        >
          <SmallHint>
            Add defrost-related measurements or enter a refrigeration icing / defrost complaint
            to generate repair guidance.
          </SmallHint>
        </div>
      )}
    </>
  );
}
