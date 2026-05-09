"use client";

import React, { useState, useEffect } from "react";
import { listUnitsForCurrentUser, listServiceEventsForUnitForCurrentUser, type UnitRow, type ServiceEventRow } from "../lib/supabase/work-orders";
import { calcSystemHealthScore, type HealthScoreResult } from "../hvac_units/lib/systemHealthScore";

type UnitRisk = {
  unit: UnitRow;
  score: HealthScoreResult;
  events: ServiceEventRow[];
  topReason: string;
  recommendation: string;
  daysSinceService: number | null;
};

function daysSince(s?: string | null): number | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function RiskBadge({ score }: { score: number }) {
  const level = score < 35 ? { label: "CRITICAL", bg: "#fee2e2", color: "#dc2626" }
    : score < 55 ? { label: "HIGH RISK", bg: "#ffedd5", color: "#ea580c" }
    : score < 75 ? { label: "WATCH", bg: "#fef9c3", color: "#ca8a04" }
    : { label: "GOOD", bg: "#dcfce7", color: "#16a34a" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: level.bg, color: level.color }}>
      {level.label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score < 35 ? "#dc2626" : score < 55 ? "#ea580c" : score < 75 ? "#ca8a04" : "#16a34a";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color, width: 28, textAlign: "right" as const }}>{score}</span>
    </div>
  );
}

export function FailurePredictionDashboard({ compact = false, maxItems = 20 }: { compact?: boolean; maxItems?: number }) {
  const [units, setUnits] = useState<UnitRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "watch">("all");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const allUnits = await listUnitsForCurrentUser();
      if (!allUnits.length) { setUnits([]); return; }
      const results: UnitRisk[] = [];
      for (let i = 0; i < allUnits.length; i += 5) {
        const batch = allUnits.slice(i, i + 5);
        const batchResults = await Promise.all(batch.map(async (unit) => {
          try {
            const events = await listServiceEventsForUnitForCurrentUser(unit.id);
            const score = calcSystemHealthScore(events);
            const lastEvent = events[0];
            const topNeg = score.factors.filter(f => f.impact < 0).sort((a, b) => a.impact - b.impact)[0];
            return { unit, score, events, topReason: topNeg ? topNeg.label : "No service history", recommendation: score.recommendation, daysSinceService: daysSince(lastEvent?.service_date || lastEvent?.created_at) } as UnitRisk;
          } catch { return null; }
        }));
        results.push(...batchResults.filter((r): r is UnitRisk => r !== null));
      }
      results.sort((a, b) => a.score.score - b.score.score);
      setUnits(results);
    } catch (e: any) {
      setError(e?.message || "Failed to load units");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const critical = units.filter(u => u.score.score < 35);
  const highRisk = units.filter(u => u.score.score >= 35 && u.score.score < 55);
  const watch = units.filter(u => u.score.score >= 55 && u.score.score < 75);
  const filtered = filter === "critical" ? critical : filter === "high" ? highRisk : filter === "watch" ? watch : units;
  const displayed = filtered.slice(0, maxItems);

  if (loading) return <div style={{ textAlign: "center", padding: 24, color: "#64748b", fontSize: 13 }}>🔍 Analyzing unit health...</div>;
  if (error) return <div style={{ padding: 12, background: "#fef2f2", borderRadius: 8, color: "#dc2626", fontSize: 13 }}>{error}</div>;
  if (!units.length) return <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 13 }}>No units tracked yet. Save a unit after your next job to start health tracking.</div>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
        {[{ label: "Total", value: units.length, color: "#2563eb" }, { label: "Critical", value: critical.length, color: critical.length > 0 ? "#dc2626" : "#94a3b8" }, { label: "High Risk", value: highRisk.length, color: highRisk.length > 0 ? "#ea580c" : "#94a3b8" }, { label: "Watch", value: watch.length, color: watch.length > 0 ? "#ca8a04" : "#94a3b8" }].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {critical.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{critical.length} unit{critical.length !== 1 ? "s" : ""} in critical condition — immediate attention needed</div></div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" as const }}>
        {([["all", `All (${units.length})`], ["critical", `Critical (${critical.length})`], ["high", `High Risk (${highRisk.length})`], ["watch", `Watch (${watch.length})`]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === key ? "#0f1f3d" : "#e2e8f0"}`, background: filter === key ? "#0f1f3d" : "#fff", color: filter === key ? "#fff" : "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
        ))}
        <button onClick={load} style={{ marginLeft: "auto", padding: "5px 10px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>↻</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13, background: "#f8fafc", borderRadius: 8 }}>No units in this category.</div>
        ) : displayed.map((item) => {
          const unitLabel = [item.unit.unit_nickname, item.unit.equipment_type, item.unit.manufacturer, item.unit.model].filter(Boolean).join(" · ");
          const locationLabel = [item.unit.customer_name, item.unit.site_name].filter(Boolean).join(" — ");
          const callbacks = item.events.filter(e => e.callback_occurred === "Yes" || e.outcome_status === "Callback").length;
          return (
            <div key={item.unit.id} style={{ background: "#fff", border: `1px solid ${item.score.score < 35 ? "#fecaca" : item.score.score < 55 ? "#fed7aa" : item.score.score < 75 ? "#fef08a" : "#e2e8f0"}`, borderLeft: `4px solid ${item.score.score < 35 ? "#dc2626" : item.score.score < 55 ? "#ea580c" : item.score.score < 75 ? "#ca8a04" : "#16a34a"}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{locationLabel || "Unknown Location"}</span>
                    <RiskBadge score={item.score.score} />
                    {callbacks > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>{callbacks} CB</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{unitLabel || "Equipment details pending"}</div>
                  {item.daysSinceService !== null && <div style={{ fontSize: 10, color: item.daysSinceService > 365 ? "#dc2626" : "#94a3b8", marginTop: 2 }}>Last service: {item.daysSinceService}d ago{item.daysSinceService > 365 ? " ⚠️" : ""}</div>}
                </div>
                <a href="/hvac_units#unit-library" style={{ padding: "5px 10px", background: "#0f1f3d", color: "#fff", borderRadius: 6, fontWeight: 700, fontSize: 11, textDecoration: "none", flexShrink: 0 }}>View</a>
              </div>
              <ScoreBar score={item.score.score} />
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 11, color: "#374151" }}><span style={{ color: "#dc2626" }}>⚠ </span><strong>Risk:</strong> {item.topReason}</div>
                <div style={{ fontSize: 11, color: "#374151" }}><span style={{ color: "#2563eb" }}>→ </span><strong>Action:</strong> {item.recommendation}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
