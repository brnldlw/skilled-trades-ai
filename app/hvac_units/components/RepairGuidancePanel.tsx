"use client";

import { SmallHint } from "./SmallHint";
import { Badge } from "./Badge";
import type { RepairGuidanceItem, RepairGuidanceMode } from "../lib/repairGuidance";

export function RepairGuidancePanel({
  items,
  mode,
}: {
  items: RepairGuidanceItem[];
  mode: RepairGuidanceMode;
}) {
  return (
    <>
      {items.length ? (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 10,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 900 }}>
                {item.title}
                {typeof item.confidence === "number" ? (
                  <Badge text={`${item.confidence}%`} />
                ) : null}
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Suspected part / system</div>
                <SmallHint style={{ marginTop: 4 }}>{item.suspectedPart}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Why it is suspect</div>
                <SmallHint style={{ marginTop: 4 }}>{item.why}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Confirm with this test</div>
                <SmallHint style={{ marginTop: 4 }}>{item.confirmTest}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Quick field check</div>
                <SmallHint style={{ marginTop: 4 }}>{item.fieldCheck}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Likely fix</div>
                <SmallHint style={{ marginTop: 4 }}>{item.likelyFix}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Common mistake</div>
                <SmallHint style={{ marginTop: 4 }}>{item.commonMistake}</SmallHint>
              </div>

              {mode === "apprentice" ? (
                <>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>Tool to use</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.toolToUse}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>Expected reading / condition</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.expectedReading}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>If test passes</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.passInterpretation}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>If test fails</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.failInterpretation}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>What to do next if it fails</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.nextIfFail}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>Quick field check</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.fieldCheck}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>Common mistake</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.commonMistake}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>Safety note</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.safetyNote}</SmallHint>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>Tool to use</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.toolToUse}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>What to do next if it fails</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.nextIfFail}</SmallHint>
                  </div>
                </>
              )}

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>Safety note</div>
                <SmallHint style={{ marginTop: 4 }}>{item.safetyNote}</SmallHint>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <SmallHint>
          Run a diagnosis to generate repair guidance and step-by-step field checks.
        </SmallHint>
      )}
    </>
  );
}
