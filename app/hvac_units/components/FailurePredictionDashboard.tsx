"use client";

import React, { useState, useEffect } from "react";
import { listUnitsForCurrentUser, listServiceEventsForUnitForCurrentUser, type UnitRow, type ServiceEventRow } from "../../lib/supabase/work-orders";
import { calcSystemHealthScore, type HealthScoreResult } from "../../hvac_units/lib/systemHealthScore";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

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
  const { lang } = useLang();
  const level = score < 35 ? { labelKey: "fpd_risk_critical" as const, bg: "#fee2e2", color: "#dc2626" }
    : score < 55 ? { labelKey: "fpd_risk_high" as const, bg: "#ffedd5", color: "#ea580c" }
    : score < 75 ? { labelKey: "fpd_risk_watch" as const, bg: "#fef9c3", color: "#ca8a04" }
    : { labelKey: "fpd_risk_good" as const, bg: "#dcfce7", color: "#16a34a" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: level.bg, color: level.color, letterSpacing: "0.05em" }}>
      {t(level.labelKey, lang)}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score < 35 ? "#dc2626" : score < 55 ? "#ea580c" : score < 75 ? "#ca8a04" : "#16a34a";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color, width: 28, textAlign: "right" }}>{score}</span>
    </div>
  );
}

type Props = {
  compact?: boolean;
  maxItems?: number;
};

export function FailurePredictionDashboard({ compact = false, maxItems = 20 }: Props) {
  const { lang } = useLang();
  const [units, setUnits] = useState<UnitRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "watch">("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const allUnits = await listUnitsForCurrentUser();
      if (!allUnits.length) { setUnits([]); return; }

      const results: UnitRisk[] = [];

      // Load service events for each unit in parallel (batch of 5)
      const batchSize = 5;
      for (let i = 0; i < allUnits.length; i += batchSize) {
        const batch = allUnits.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (unit) => {
            try {
              const events = await listServiceEventsForUnitForCurrentUser(unit.id);
              const score = calcSystemHealthScore(events, undefined, lang);
              const lastEvent = events[0];
              const daysAgo = daysSince(lastEvent?.service_date || lastEvent?.created_at);

              // Get the top negative factor
              const topNeg = score.factors.filter(f => f.impact < 0).sort((a, b) => a.impact - b.impact)[0];
              const topReason = topNeg ? topNeg.label : score.factors[0]?.label || t("fpd_no_service_history", lang);

              return {
                unit,
                score,
                events,
                topReason,
                recommendation: score.recommendation,
                daysSinceService: daysAgo,
              } as UnitRisk;
            } catch {
              return null;
            }
          })
        );
        results.push(...batchResults.filter((r): r is UnitRisk => r !== null));
      }

      // Sort by score ascending (worst first)
      results.sort((a, b) => a.score.score - b.score.score);
      setUnits(results);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e?.message || t("fpd_load_failed", lang));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const atRisk = units.filter(u => u.score.score < 75);
  const critical = units.filter(u => u.score.score < 35);
  const highRisk = units.filter(u => u.score.score >= 35 && u.score.score < 55);
  const watch = units.filter(u => u.score.score >= 55 && u.score.score < 75);
  const good = units.filter(u => u.score.score >= 75);

  const filtered = filter === "critical" ? critical
    : filter === "high" ? highRisk
    : filter === "watch" ? watch
    : units;

  const displayed = filtered.slice(0, maxItems);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "#64748b", fontSize: 14 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
        {t("fpd_analyzing", lang)}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 16, background: "#fef2f2", borderRadius: 10, color: "#dc2626", fontSize: 13 }}>
        {error}
        <button onClick={load} style={{ marginLeft: 12, background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>{t("btn_retry", lang)}</button>
      </div>
    );
  }

  if (!units.length) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 14 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
        {t("fpd_no_units_yet", lang)}
      </div>
    );
  }

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: t("fpd_stat_total_units", lang), value: units.length, color: "#2563eb" },
          { label: t("fpd_stat_critical", lang), value: critical.length, color: critical.length > 0 ? "#dc2626" : "#94a3b8" },
          { label: t("fpd_stat_high_risk", lang), value: highRisk.length, color: highRisk.length > 0 ? "#ea580c" : "#94a3b8" },
          { label: t("fpd_stat_watch", lang), value: watch.length, color: watch.length > 0 ? "#ca8a04" : "#94a3b8" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert banner if there are critical units */}
      {critical.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626" }}>
              {t("fpd_critical_alert_title", lang).replace("{count}", String(critical.length))}
            </div>
            <div style={{ fontSize: 12, color: "#ef4444" }}>
              {t("fpd_critical_alert_body", lang)}
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" as const }}>
        {([
          { key: "all", labelKey: "fpd_filter_all_units" as const, count: units.length },
          { key: "critical", labelKey: "fpd_filter_critical" as const, count: critical.length },
          { key: "high", labelKey: "fpd_filter_high_risk" as const, count: highRisk.length },
          { key: "watch", labelKey: "fpd_filter_watch" as const, count: watch.length },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filter === f.key ? "#0f1f3d" : "#e2e8f0"}`, background: filter === f.key ? "#0f1f3d" : "#fff", color: filter === f.key ? "#fff" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {t(f.labelKey, lang).replace("{count}", String(f.count))}
          </button>
        ))}
        <button onClick={load} style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
          {t("btn_refresh_arrow", lang)}
        </button>
      </div>

      {/* Unit list */}
      {displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 13, background: "#f8fafc", borderRadius: 10 }}>
          {t("fpd_no_units_category", lang)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {displayed.map((item) => {
            const unitLabel = [item.unit.unit_nickname, item.unit.equipment_type, item.unit.manufacturer, item.unit.model].filter(Boolean).join(" · ");
            const locationLabel = [item.unit.customer_name, item.unit.site_name].filter(Boolean).join(" — ");
            const callbacks = item.events.filter(e => e.callback_occurred === "Yes" || e.outcome_status === "Callback").length;

            return (
              <div key={item.unit.id} style={{
                background: "#fff",
                border: `1px solid ${item.score.score < 35 ? "#fecaca" : item.score.score < 55 ? "#fed7aa" : item.score.score < 75 ? "#fef08a" : "#e2e8f0"}`,
                borderLeft: `4px solid ${item.score.score < 35 ? "#dc2626" : item.score.score < 55 ? "#ea580c" : item.score.score < 75 ? "#ca8a04" : "#16a34a"}`,
                borderRadius: 10,
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                        {locationLabel || t("fpd_unknown_location", lang)}
                      </span>
                      <RiskBadge score={item.score.score} />
                      {callbacks > 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fee2e2", color: "#dc2626" }}>
                          {t("fpd_callback_badge", lang).replace("{count}", String(callbacks))}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{unitLabel || t("fpd_equipment_pending", lang)}</div>
                    {item.daysSinceService !== null && (
                      <div style={{ fontSize: 11, color: item.daysSinceService > 365 ? "#dc2626" : "#94a3b8" }}>
                        {t("fpd_last_service_days", lang).replace("{count}", String(item.daysSinceService))}
                        {item.daysSinceService > 365 ? t("fpd_over_a_year", lang) : ""}
                      </div>
                    )}
                  </div>
                  <a
                    href="/hvac_units#unit-library"
                    style={{ padding: "6px 12px", background: "#0f1f3d", color: "#fff", borderRadius: 6, fontWeight: 700, fontSize: 11, textDecoration: "none", flexShrink: 0 }}
                  >
                    {t("btn_view_unit", lang)}
                  </a>
                </div>

                <ScoreBar score={item.score.score} />

                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 12, color: "#374151", display: "flex", gap: 6 }}>
                    <span style={{ color: "#dc2626", flexShrink: 0 }}>⚠</span>
                    <span><strong>{t("fpd_top_risk_factor", lang)}</strong> {item.topReason}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#374151", display: "flex", gap: 6 }}>
                    <span style={{ color: "#2563eb", flexShrink: 0 }}>→</span>
                    <span><strong>{t("fpd_recommended_action", lang)}</strong> {item.recommendation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lastUpdated && (
        <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8", textAlign: "right" }}>
          {t("fpd_last_updated", lang).replace("{value}", lastUpdated.toLocaleTimeString())}
        </div>
      )}
    </div>
  );
}