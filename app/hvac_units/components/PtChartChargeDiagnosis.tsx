"use client";

import { SmallHint } from "./SmallHint";
import { Badge } from "./Badge";

type ChargeAnalysis = {
  deltaT: number | null;
  superheat: number | null;
  subcool: number | null;
  evapSat: number | null;
  condSat: number | null;
  evapSatSource: "entered" | "pt-chart" | "gauge-photo" | "none";
  condSatSource: "entered" | "pt-chart" | "gauge-photo" | "none";
  summary: string;
  findings: string[];
};

export function PtChartChargeDiagnosis({ chargeAnalysis }: { chargeAnalysis: ChargeAnalysis }) {
  return (
    <>
      <SmallHint>
        If saturation temps are not entered, the app will estimate them from pressure
        and refrigerant type using a PT chart approximation.
      </SmallHint>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginTop: 12,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>Delta-T</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {chargeAnalysis.deltaT !== null ? `${chargeAnalysis.deltaT}°F` : "—"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>Superheat</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {chargeAnalysis.superheat !== null ? `${chargeAnalysis.superheat}°F` : "—"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>Subcool</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {chargeAnalysis.subcool !== null ? `${chargeAnalysis.subcool}°F` : "—"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginTop: 10,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>
            Evap Saturation
            <Badge text={chargeAnalysis.evapSatSource} />
          </div>
          <div style={{ marginTop: 6 }}>
            {chargeAnalysis.evapSat !== null ? `${chargeAnalysis.evapSat}°F` : "—"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>
            Condensing Saturation
            <Badge text={chargeAnalysis.condSatSource} />
          </div>
          <div style={{ marginTop: 6 }}>
            {chargeAnalysis.condSat !== null ? `${chargeAnalysis.condSat}°F` : "—"}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 900 }}>Charge Condition</div>
        <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
          {chargeAnalysis.summary}
        </div>
        {chargeAnalysis.findings.length ? (
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {chargeAnalysis.findings.map((f, i) => (
              <li key={i}>
                <SmallHint>{f}</SmallHint>
              </li>
            ))}
          </ul>
        ) : (
          <SmallHint style={{ marginTop: 8 }}>
            Add more refrigeration readings to tighten the diagnosis.
          </SmallHint>
        )}
      </div>
    </>
  );
}
