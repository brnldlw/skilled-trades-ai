"use client";

import { SmallHint } from "./SmallHint";
import { useJobIdentity } from "../context/JobIdentity";

type ServiceEvent = {
  final_confirmed_cause?: string | null;
  actual_fix_performed?: string | null;
  parts_replaced?: string | null;
};

export function PartsManualsAssist({
  equipmentType,
  serviceHistory,
}: {
  equipmentType: string;
  serviceHistory: ServiceEvent[];
}) {
  const { manufacturer, model, symptom } = useJobIdentity();

  const baseUnitQuery = [manufacturer, model, equipmentType]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const cleanedSymptom = String(symptom || "").trim();

  const causeCounts = serviceHistory.reduce<Record<string, number>>((acc, event) => {
    const key = String(event.final_confirmed_cause || "").trim();
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const fixCounts = serviceHistory.reduce<Record<string, number>>((acc, event) => {
    const key = String(
      event.parts_replaced || event.actual_fix_performed || ""
    ).trim();
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0];
  const topFix = Object.entries(fixCounts).sort((a, b) => b[1] - a[1])[0];

  const manualSearchQuery = `${baseUnitQuery} service manual pdf`
    .replace(/\s+/g, " ")
    .trim();

  const broadPartsSearchQuery = `${baseUnitQuery} ${cleanedSymptom || "parts"}`
    .replace(/\s+/g, " ")
    .trim();

  const historyAwarePartsSearchQuery = `${baseUnitQuery} ${topCause?.[0] || topFix?.[0] || cleanedSymptom || "parts"}`
    .replace(/\s+/g, " ")
    .trim();

  const likelyCheck = topCause?.[0] || topFix?.[0] || cleanedSymptom || "-";

  const partCounts = serviceHistory.reduce<Record<string, number>>((acc, event) => {
    const raw = String(
      event.parts_replaced || event.actual_fix_performed || ""
    ).trim();

    if (!raw) return acc;

    raw
      .split(/,|\/|;|\band\b/gi)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((part) => {
        acc[part] = (acc[part] || 0) + 1;
      });

    return acc;
  }, {});

  const historyTopParts = Object.entries(partCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);

  const inferLikelyParts = (value: string) => {
    const v = String(value || "").toLowerCase();
    const out: string[] = [];

    if (v.includes("capacitor")) out.push("Capacitor");
    if (v.includes("contactor")) out.push("Contactor");
    if (v.includes("motor") || v.includes("blower") || v.includes("fan")) out.push("Motor");
    if (v.includes("compressor")) out.push("Compressor");
    if (v.includes("refrigerant") || v.includes("low charge") || v.includes("low temp")) out.push("Refrigerant Circuit");
    if (v.includes("drier") || v.includes("filter")) out.push("Filter/Drier");
    if (v.includes("sensor")) out.push("Sensor");
    if (v.includes("control") || v.includes("board")) out.push("Control Board");
    if (v.includes("drain") || v.includes("water leak") || v.includes("float")) out.push("Drain / Float Switch");
    if (v.includes("txv")) out.push("TXV");

    return out;
  };

  const suggestedParts = Array.from(
    new Set([
      ...historyTopParts,
      ...inferLikelyParts(topCause?.[0] || ""),
      ...inferLikelyParts(topFix?.[0] || ""),
      ...inferLikelyParts(cleanedSymptom || ""),
    ])
  ).slice(0, 6);

  return !baseUnitQuery ? (
    <SmallHint>
      Enter manufacturer, model, and equipment type to improve manual and parts suggestions.
    </SmallHint>
  ) : (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <div>
          <b>Manual Search:</b> {manualSearchQuery || "-"}
        </div>
        <div>
          <b>Current Symptom Search:</b> {broadPartsSearchQuery || "-"}
        </div>
      </div>

      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        <SmallHint>
          <b>History hint:</b> Based on this unit’s saved history, start by checking{" "}
          <b>{likelyCheck}</b>.
        </SmallHint>
      </div>

      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 8 }}>History-Based Likely Parts</div>

        {suggestedParts.length ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {suggestedParts.map((part) => (
              <span
                key={part}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: "1px solid #cfcfcf",
                  background: "#f7f7f7",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {part}
              </span>
            ))}
          </div>
        ) : (
          <SmallHint>No likely parts yet. Add more history or a symptom to improve suggestions.</SmallHint>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() =>
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(manualSearchQuery)}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
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
          Open Manual Search
        </button>

        <button
          onClick={() =>
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(broadPartsSearchQuery)}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
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
          Open Broad Parts Search
        </button>

        <button
          onClick={() =>
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(historyAwarePartsSearchQuery)}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
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
          Open History-Aware Parts Search
        </button>
      </div>
    </div>
  );
}
