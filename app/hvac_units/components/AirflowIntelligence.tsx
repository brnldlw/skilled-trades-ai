"use client";

import { SmallHint } from "./SmallHint";

type AirflowAnalysis = {
  totalExternalStatic: number | null;
  returnStatic: number | null;
  supplyStatic: number | null;
  filterDrop: number | null;
  coilDrop: number | null;
  summary: string;
  findings: string[];
};

export function AirflowIntelligence({ airflowAnalysis }: { airflowAnalysis: AirflowAnalysis }) {
  return (
    <>
      <SmallHint>
        Add return static, supply static, filter pressure drop, and coil pressure drop
        to diagnose airflow restrictions.
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
          <div style={{ fontWeight: 900 }}>Total External Static</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {airflowAnalysis.totalExternalStatic !== null
              ? `${airflowAnalysis.totalExternalStatic} inWC`
              : "—"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>Return Static</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {airflowAnalysis.returnStatic !== null
              ? `${airflowAnalysis.returnStatic} inWC`
              : "—"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>Supply Static</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {airflowAnalysis.supplyStatic !== null
              ? `${airflowAnalysis.supplyStatic} inWC`
              : "—"}
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
          <div style={{ fontWeight: 900 }}>Filter Drop</div>
          <div style={{ marginTop: 6 }}>
            {airflowAnalysis.filterDrop !== null
              ? `${airflowAnalysis.filterDrop} inWC`
              : "—"}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
          <div style={{ fontWeight: 900 }}>Coil Drop</div>
          <div style={{ marginTop: 6 }}>
            {airflowAnalysis.coilDrop !== null
              ? `${airflowAnalysis.coilDrop} inWC`
              : "—"}
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
        <div style={{ fontWeight: 900 }}>Airflow Summary</div>
        <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
          {airflowAnalysis.summary}
        </div>
        {airflowAnalysis.findings.length ? (
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {airflowAnalysis.findings.map((f, i) => (
              <li key={i}>
                <SmallHint>{f}</SmallHint>
              </li>
            ))}
          </ul>
        ) : (
          <SmallHint style={{ marginTop: 8 }}>
            Add static readings to identify filter, coil, blower, or duct restrictions.
          </SmallHint>
        )}
      </div>
    </>
  );
}
