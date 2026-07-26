"use client";

import { SmallHint } from "./SmallHint";
import type { MeasurementCoachingItem } from "../lib/measurementCoaching";

export function RecommendedMeasurementsPanel({ items }: { items: MeasurementCoachingItem[] }) {
  return items.length ? (
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
          <div style={{ fontWeight: 900 }}>{item.measurement}</div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Tool to use</div>
            <SmallHint style={{ marginTop: 4 }}>{item.tool}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Where to measure</div>
            <SmallHint style={{ marginTop: 4 }}>{item.whereToMeasure}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Expected reading / condition</div>
            <SmallHint style={{ marginTop: 4 }}>{item.expectedResult}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>If high</div>
            <SmallHint style={{ marginTop: 4 }}>{item.ifHigh}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>If low</div>
            <SmallHint style={{ marginTop: 4 }}>{item.ifLow}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>What to do next</div>
            <SmallHint style={{ marginTop: 4 }}>{item.nextStep}</SmallHint>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <SmallHint>
      Run a diagnosis to get recommended field measurements and coaching.
    </SmallHint>
  );
}
