/**
 * systemHealthScore.ts
 * Calculates a 0-100 system health score from service event history.
 * No additional database table needed - uses existing ServiceEventRow data.
 *
 * Scoring model:
 * - Starts at 100
 * - Deductions for callbacks, unresolved issues, age, failure patterns
 * - Bonuses for clean resolved visits, recent PM
 * - Score bands: 90-100 Excellent, 75-89 Good, 55-74 Fair, 35-54 Poor, 0-34 Critical
 */

import type { ServiceEventRow } from "../../lib/supabase/work-orders";
import { t, type Language, type TranslationKey } from "../../lib/translations";

export type HealthScoreBand = "excellent" | "good" | "fair" | "poor" | "critical";

export type HealthScoreResult = {
  score: number;
  band: HealthScoreBand;
  label: string;
  color: string;
  bgColor: string;
  summary: string;
  factors: HealthFactor[];
  recommendation: string;
};

export type HealthFactor = {
  label: string;
  impact: number; // negative = bad, positive = good
  detail: string;
};

// ── Band definitions ──────────────────────────────────────────
const BAND_COLORS: Record<HealthScoreBand, { labelKey: TranslationKey; color: string; bgColor: string }> = {
  excellent: { labelKey: "shs_band_excellent", color: "#15803d", bgColor: "#dcfce7" },
  good:      { labelKey: "shs_band_good",      color: "#1d4ed8", bgColor: "#dbeafe" },
  fair:      { labelKey: "shs_band_fair",      color: "#d97706", bgColor: "#fef9c3" },
  poor:      { labelKey: "shs_band_poor",      color: "#ea580c", bgColor: "#ffedd5" },
  critical:  { labelKey: "shs_band_critical",  color: "#dc2626", bgColor: "#fee2e2" },
};

function getBand(score: number): HealthScoreBand {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 55) return "fair";
  if (score >= 35) return "poor";
  return "critical";
}

// ── Days since a date string ──────────────────────────────────
function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Main scoring function ─────────────────────────────────────
export function calcSystemHealthScore(
  events: ServiceEventRow[],
  installYear?: number | null,
  lang: Language = "en"
): HealthScoreResult {
  const factors: HealthFactor[] = [];
  let score = 100;

  // Classification flags used by generateRecommendation() -- tracked
  // explicitly instead of re-parsing translated factor labels.
  let hasCallbackFactor = false;
  let hasRefrigerantFactor = false;
  let hasAgeFactor = false;
  let hasMonitoringFactor = false;

  if (!events || events.length === 0) {
    const bandInfo = BAND_COLORS.fair;
    return {
      score: 70,
      band: "fair",
      label: t(bandInfo.labelKey, lang),
      color: bandInfo.color,
      bgColor: bandInfo.bgColor,
      summary: t("shs_no_history_summary", lang),
      factors: [],
      recommendation: t("shs_log_visit_recommendation", lang),
    };
  }

  // Sort events newest first
  const sorted = [...events].sort((a, b) => {
    const da = a.service_date || a.created_at || "";
    const db = b.service_date || b.created_at || "";
    return db.localeCompare(da);
  });

  const mostRecent = sorted[0];
  const totalEvents = events.length;

  // ── Factor 1: Callback history ──────────────────────────────
  const callbackEvents = events.filter(
    (e) => e.callback_occurred === "Yes" || e.outcome_status === "Callback"
  );
  const callbackCount = callbackEvents.length;
  const callbackRate = callbackCount / totalEvents;

  if (callbackCount === 0) {
    factors.push({ label: t("shs_factor_no_callbacks", lang), impact: 5, detail: t("shs_detail_no_callbacks", lang) });
    score += 5;
  } else if (callbackCount === 1) {
    factors.push({ label: t("shs_factor_1_callback", lang), impact: -10, detail: t("shs_detail_1_callback", lang) });
    score -= 10;
    hasCallbackFactor = true;
  } else if (callbackRate >= 0.3) {
    factors.push({
      label: t("shs_factor_high_callback_rate", lang).replace("{count}", String(callbackCount)),
      impact: -25,
      detail: t("shs_detail_high_callback_rate", lang).replace("{pct}", String(Math.round(callbackRate * 100))),
    });
    score -= 25;
    hasCallbackFactor = true;
  } else {
    factors.push({
      label: t("shs_factor_n_callbacks", lang).replace("{count}", String(callbackCount)),
      impact: -15,
      detail: t("shs_detail_n_callbacks", lang).replace("{count}", String(callbackCount)).replace("{total}", String(totalEvents)),
    });
    score -= 15;
    hasCallbackFactor = true;
  }

  // ── Factor 2: Most recent outcome ──────────────────────────
  const recentStatus = mostRecent.outcome_status || "";
  if (recentStatus === "Resolved") {
    factors.push({ label: t("shs_factor_last_resolved", lang), impact: 5, detail: t("shs_detail_last_resolved", lang) });
    score += 5;
  } else if (recentStatus === "Monitoring") {
    factors.push({ label: t("shs_factor_last_monitoring", lang), impact: -10, detail: t("shs_detail_last_monitoring", lang) });
    score -= 10;
    hasMonitoringFactor = true;
  } else if (recentStatus === "Parts on Order") {
    factors.push({ label: t("shs_factor_parts_on_order", lang), impact: -15, detail: t("shs_detail_parts_on_order", lang) });
    score -= 15;
  } else if (recentStatus === "Callback") {
    factors.push({ label: t("shs_factor_last_callback", lang), impact: -20, detail: t("shs_detail_last_callback", lang) });
    score -= 20;
    hasCallbackFactor = true;
  }

  // ── Factor 3: Time since last service ──────────────────────
  const daysSinceService = daysSince(mostRecent.service_date || mostRecent.created_at);
  if (daysSinceService !== null) {
    if (daysSinceService <= 90) {
      factors.push({ label: t("shs_factor_recently_serviced", lang), impact: 5, detail: t("shs_detail_days_ago", lang).replace("{value}", String(daysSinceService)) });
      score += 5;
    } else if (daysSinceService > 365) {
      factors.push({ label: t("shs_factor_not_serviced_year", lang), impact: -15, detail: t("shs_detail_months_ago", lang).replace("{value}", String(Math.floor(daysSinceService / 30))) });
      score -= 15;
    } else if (daysSinceService > 180) {
      factors.push({ label: t("shs_factor_no_service_6mo", lang), impact: -8, detail: t("shs_detail_months_ago", lang).replace("{value}", String(Math.floor(daysSinceService / 30))) });
      score -= 8;
    }
  }

  // ── Factor 4: Equipment age ─────────────────────────────────
  if (installYear && installYear > 1990) {
    const age = new Date().getFullYear() - installYear;
    if (age <= 3) {
      factors.push({ label: t("shs_factor_new_unit", lang).replace("{value}", String(age)), impact: 10, detail: t("shs_detail_new_unit", lang) });
      score += 10;
    } else if (age <= 7) {
      factors.push({ label: t("shs_factor_years_old", lang).replace("{value}", String(age)), impact: 3, detail: t("shs_detail_mid_life", lang) });
      score += 3;
    } else if (age >= 15) {
      factors.push({ label: t("shs_factor_aging_unit", lang).replace("{value}", String(age)), impact: -20, detail: t("shs_detail_beyond_15yr", lang) });
      score -= 20;
      hasAgeFactor = true;
    } else if (age >= 10) {
      factors.push({ label: t("shs_factor_years_old", lang).replace("{value}", String(age)), impact: -10, detail: t("shs_detail_approaching_end", lang) });
      score -= 10;
    }
  }

  // ── Factor 5: Major part replacements ──────────────────────
  const majorParts = ["compressor", "condenser coil", "evaporator coil", "heat exchanger", "refrigerant leak"];
  const majorReplacementEvents = events.filter((e) => {
    const text = `${e.parts_replaced || ""} ${e.final_confirmed_cause || ""} ${e.actual_fix_performed || ""}`.toLowerCase();
    return majorParts.some((p) => text.includes(p));
  });

  if (majorReplacementEvents.length >= 2) {
    factors.push({ label: t("shs_factor_multiple_major_repairs", lang), impact: -15, detail: t("shs_detail_multiple_major_repairs", lang).replace("{value}", String(majorReplacementEvents.length)) });
    score -= 15;
  } else if (majorReplacementEvents.length === 1) {
    factors.push({ label: t("shs_factor_1_major_repair", lang), impact: -8, detail: t("shs_detail_1_major_repair", lang) });
    score -= 8;
  }

  // ── Factor 6: Refrigerant loss events ──────────────────────
  const leakEvents = events.filter((e) => {
    const text = `${e.final_confirmed_cause || ""} ${e.diagnosis_summary || ""} ${e.actual_fix_performed || ""}`.toLowerCase();
    return text.includes("leak") || text.includes("low charge") || text.includes("refrigerant loss");
  });

  if (leakEvents.length >= 2) {
    factors.push({ label: t("shs_factor_recurring_leak", lang), impact: -20, detail: t("shs_detail_recurring_leak", lang).replace("{value}", String(leakEvents.length)) });
    score -= 20;
    hasRefrigerantFactor = true;
  } else if (leakEvents.length === 1) {
    factors.push({ label: t("shs_factor_leak_event", lang), impact: -10, detail: t("shs_detail_leak_event", lang) });
    score -= 10;
    hasRefrigerantFactor = true;
  }

  // ── Factor 7: Consistent resolved visits ───────────────────
  const resolvedEvents = events.filter((e) => e.outcome_status === "Resolved");
  const resolvedRate = resolvedEvents.length / totalEvents;
  if (resolvedRate >= 0.8 && totalEvents >= 3) {
    factors.push({ label: t("shs_factor_consistent_resolution", lang), impact: 8, detail: t("shs_detail_consistent_resolution", lang).replace("{value}", String(Math.round(resolvedRate * 100))) });
    score += 8;
  }

  // ── Factor 8: Frequency of visits (too many = bad sign) ────
  if (totalEvents >= 5) {
    const oldestDate = sorted[sorted.length - 1].service_date || sorted[sorted.length - 1].created_at;
    const spanDays = daysSince(oldestDate);
    if (spanDays && spanDays > 0) {
      const visitsPerYear = (totalEvents / spanDays) * 365;
      if (visitsPerYear >= 4) {
        factors.push({ label: t("shs_factor_frequent_calls", lang), impact: -12, detail: t("shs_detail_frequent_calls", lang).replace("{value}", visitsPerYear.toFixed(1)) });
        score -= 12;
      }
    }
  }

  // ── Clamp score ─────────────────────────────────────────────
  score = Math.max(0, Math.min(100, Math.round(score)));

  const band = getBand(score);
  const bandInfo = BAND_COLORS[band];

  // ── Generate summary and recommendation ────────────────────
  const summary = generateSummary(band, factors, totalEvents, lang);
  const recommendation = generateRecommendation(band, { hasCallbackFactor, hasRefrigerantFactor, hasAgeFactor, hasMonitoringFactor }, lang);

  return {
    score,
    band,
    label: t(bandInfo.labelKey, lang),
    color: bandInfo.color,
    bgColor: bandInfo.bgColor,
    summary,
    factors,
    recommendation,
  };
}

function generateSummary(
  band: HealthScoreBand,
  factors: HealthFactor[],
  totalEvents: number,
  lang: Language
): string {
  const negFactors = factors.filter((f) => f.impact < 0).length;

  if (band === "excellent") return t("shs_summary_excellent", lang).replace("{count}", String(totalEvents));
  if (band === "good") return (negFactors > 0 ? t("shs_summary_good_minor", lang) : t("shs_summary_good_none", lang)).replace("{count}", String(totalEvents));
  if (band === "fair") return t("shs_summary_fair", lang).replace("{count}", String(negFactors));
  if (band === "poor") return t("shs_summary_poor", lang).replace("{count}", String(totalEvents));
  return t("shs_summary_critical", lang);
}

function generateRecommendation(
  band: HealthScoreBand,
  flags: { hasCallbackFactor: boolean; hasRefrigerantFactor: boolean; hasAgeFactor: boolean; hasMonitoringFactor: boolean },
  lang: Language
): string {
  const { hasCallbackFactor: hasCallbacks, hasRefrigerantFactor: hasLeaks, hasAgeFactor: hasAge, hasMonitoringFactor: hasMonitoring } = flags;

  if (band === "critical") {
    if (hasAge) return t("shs_rec_critical_age", lang);
    if (hasLeaks) return t("shs_rec_critical_leaks", lang);
    return t("shs_rec_critical_default", lang);
  }
  if (band === "poor") {
    if (hasCallbacks) return t("shs_rec_poor_callbacks", lang);
    return t("shs_rec_poor_default", lang);
  }
  if (band === "fair") {
    if (hasMonitoring) return t("shs_rec_fair_monitoring", lang);
    if (hasLeaks) return t("shs_rec_fair_leaks", lang);
    return t("shs_rec_fair_default", lang);
  }
  if (band === "good") return t("shs_rec_good", lang);
  return t("shs_rec_excellent_default", lang);
}
