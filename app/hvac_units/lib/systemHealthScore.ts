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
const BANDS: Record<HealthScoreBand, { label: string; color: string; bgColor: string }> = {
  excellent: { label: "Excellent",  color: "#15803d", bgColor: "#dcfce7" },
  good:      { label: "Good",       color: "#1d4ed8", bgColor: "#dbeafe" },
  fair:      { label: "Fair",       color: "#d97706", bgColor: "#fef9c3" },
  poor:      { label: "Poor",       color: "#ea580c", bgColor: "#ffedd5" },
  critical:  { label: "Critical",   color: "#dc2626", bgColor: "#fee2e2" },
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
  installYear?: number | null
): HealthScoreResult {
  const factors: HealthFactor[] = [];
  let score = 100;

  if (!events || events.length === 0) {
    return {
      score: 70,
      band: "fair",
      ...BANDS.fair,
      summary: "No service history on record. Score is estimated.",
      factors: [],
      recommendation: "Log a service visit to establish a baseline health score.",
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
    factors.push({ label: "No callbacks", impact: 5, detail: "Zero callback history — excellent reliability." });
    score += 5;
  } else if (callbackCount === 1) {
    factors.push({ label: "1 callback on record", impact: -10, detail: "One callback recorded in service history." });
    score -= 10;
  } else if (callbackRate >= 0.3) {
    factors.push({ label: `High callback rate (${callbackCount} callbacks)`, impact: -25, detail: `${Math.round(callbackRate * 100)}% of service visits resulted in callbacks.` });
    score -= 25;
  } else {
    factors.push({ label: `${callbackCount} callbacks`, impact: -15, detail: `${callbackCount} callbacks in ${totalEvents} service visits.` });
    score -= 15;
  }

  // ── Factor 2: Most recent outcome ──────────────────────────
  const recentStatus = mostRecent.outcome_status || "";
  if (recentStatus === "Resolved") {
    factors.push({ label: "Last visit resolved", impact: 5, detail: "Most recent service call was fully resolved." });
    score += 5;
  } else if (recentStatus === "Monitoring") {
    factors.push({ label: "Last visit: monitoring", impact: -10, detail: "System is under monitoring — issue may not be fully resolved." });
    score -= 10;
  } else if (recentStatus === "Parts on Order") {
    factors.push({ label: "Parts on order", impact: -15, detail: "Awaiting parts — system not fully repaired yet." });
    score -= 15;
  } else if (recentStatus === "Callback") {
    factors.push({ label: "Last visit: callback", impact: -20, detail: "Most recent visit resulted in a callback." });
    score -= 20;
  }

  // ── Factor 3: Time since last service ──────────────────────
  const daysSinceService = daysSince(mostRecent.service_date || mostRecent.created_at);
  if (daysSinceService !== null) {
    if (daysSinceService <= 90) {
      factors.push({ label: "Recently serviced", impact: 5, detail: `Last serviced ${daysSinceService} days ago.` });
      score += 5;
    } else if (daysSinceService > 365) {
      factors.push({ label: "Not serviced in over a year", impact: -15, detail: `Last service was ${Math.floor(daysSinceService / 30)} months ago.` });
      score -= 15;
    } else if (daysSinceService > 180) {
      factors.push({ label: "No service in 6+ months", impact: -8, detail: `Last service was ${Math.floor(daysSinceService / 30)} months ago.` });
      score -= 8;
    }
  }

  // ── Factor 4: Equipment age ─────────────────────────────────
  if (installYear && installYear > 1990) {
    const age = new Date().getFullYear() - installYear;
    if (age <= 3) {
      factors.push({ label: `New unit (${age} years old)`, impact: 10, detail: "Equipment is within the first 3 years of service." });
      score += 10;
    } else if (age <= 7) {
      factors.push({ label: `${age} years old`, impact: 3, detail: "Equipment is mid-life — within normal operating range." });
      score += 3;
    } else if (age >= 15) {
      factors.push({ label: `Aging unit (${age} years)`, impact: -20, detail: "Equipment is beyond typical 15-year service life." });
      score -= 20;
    } else if (age >= 10) {
      factors.push({ label: `${age} years old`, impact: -10, detail: "Equipment approaching end of typical service life." });
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
    factors.push({ label: "Multiple major repairs", impact: -15, detail: `${majorReplacementEvents.length} major component replacements on record.` });
    score -= 15;
  } else if (majorReplacementEvents.length === 1) {
    factors.push({ label: "1 major repair on record", impact: -8, detail: "One major component replacement in service history." });
    score -= 8;
  }

  // ── Factor 6: Refrigerant loss events ──────────────────────
  const leakEvents = events.filter((e) => {
    const text = `${e.final_confirmed_cause || ""} ${e.diagnosis_summary || ""} ${e.actual_fix_performed || ""}`.toLowerCase();
    return text.includes("leak") || text.includes("low charge") || text.includes("refrigerant loss");
  });

  if (leakEvents.length >= 2) {
    factors.push({ label: "Recurring refrigerant loss", impact: -20, detail: `${leakEvents.length} refrigerant loss events detected. Indicates chronic leak issue.` });
    score -= 20;
  } else if (leakEvents.length === 1) {
    factors.push({ label: "Refrigerant loss event", impact: -10, detail: "One refrigerant loss event on record." });
    score -= 10;
  }

  // ── Factor 7: Consistent resolved visits ───────────────────
  const resolvedEvents = events.filter((e) => e.outcome_status === "Resolved");
  const resolvedRate = resolvedEvents.length / totalEvents;
  if (resolvedRate >= 0.8 && totalEvents >= 3) {
    factors.push({ label: "Consistent resolution history", impact: 8, detail: `${Math.round(resolvedRate * 100)}% of visits fully resolved.` });
    score += 8;
  }

  // ── Factor 8: Frequency of visits (too many = bad sign) ────
  if (totalEvents >= 5) {
    const oldestDate = sorted[sorted.length - 1].service_date || sorted[sorted.length - 1].created_at;
    const spanDays = daysSince(oldestDate);
    if (spanDays && spanDays > 0) {
      const visitsPerYear = (totalEvents / spanDays) * 365;
      if (visitsPerYear >= 4) {
        factors.push({ label: "Frequent service calls", impact: -12, detail: `Averaging ${visitsPerYear.toFixed(1)} service visits per year — high for a healthy system.` });
        score -= 12;
      }
    }
  }

  // ── Clamp score ─────────────────────────────────────────────
  score = Math.max(0, Math.min(100, Math.round(score)));

  const band = getBand(score);
  const bandInfo = BANDS[band];

  // ── Generate summary and recommendation ────────────────────
  const summary = generateSummary(score, band, factors, totalEvents);
  const recommendation = generateRecommendation(score, band, factors);

  return {
    score,
    band,
    label: bandInfo.label,
    color: bandInfo.color,
    bgColor: bandInfo.bgColor,
    summary,
    factors,
    recommendation,
  };
}

function generateSummary(
  score: number,
  band: HealthScoreBand,
  factors: HealthFactor[],
  totalEvents: number
): string {
  const negFactors = factors.filter((f) => f.impact < 0).length;

  if (band === "excellent") return `System is in excellent health based on ${totalEvents} service visit${totalEvents !== 1 ? "s" : ""}. No significant issues detected.`;
  if (band === "good") return `System is performing well with ${negFactors > 0 ? "minor" : "no"} concerns noted across ${totalEvents} service visit${totalEvents !== 1 ? "s" : ""}.`;
  if (band === "fair") return `System health is fair. ${negFactors} concern${negFactors !== 1 ? "s" : ""} identified that may indicate developing issues.`;
  if (band === "poor") return `System health is poor. Multiple issues identified across ${totalEvents} service visit${totalEvents !== 1 ? "s" : ""}. Proactive action recommended.`;
  return `System is in critical condition. Significant recurring issues detected. Replacement evaluation recommended.`;
}

function generateRecommendation(
  score: number,
  band: HealthScoreBand,
  factors: HealthFactor[]
): string {
  const hasLeaks = factors.some((f) => f.label.toLowerCase().includes("refrigerant"));
  const hasCallbacks = factors.some((f) => f.label.toLowerCase().includes("callback"));
  const hasAge = factors.some((f) => f.label.toLowerCase().includes("aging") || f.label.toLowerCase().includes("15 year") || f.label.toLowerCase().includes("16 year") || f.label.toLowerCase().includes("17 year"));
  const hasMonitoring = factors.some((f) => f.label.toLowerCase().includes("monitoring"));

  if (band === "critical") {
    if (hasAge) return "Equipment age combined with recurring issues suggests a replacement evaluation is warranted. Present options to the customer.";
    if (hasLeaks) return "Recurring refrigerant loss is a significant liability. Perform a thorough leak search and present repair vs. replace options.";
    return "System requires immediate attention. Schedule a comprehensive diagnostic and present the customer with repair and replacement options.";
  }
  if (band === "poor") {
    if (hasCallbacks) return "High callback rate indicates unresolved root cause. Recommend a comprehensive diagnostic to identify underlying issues before the next failure.";
    return "System health is declining. Recommend a preventive maintenance visit and customer notification of developing issues.";
  }
  if (band === "fair") {
    if (hasMonitoring) return "System is under monitoring. Ensure follow-up visit is scheduled and customer is aware of the open issue.";
    if (hasLeaks) return "Refrigerant loss detected. Confirm repair is complete and schedule a follow-up check within 30 days.";
    return "System is serviceable but showing early warning signs. Recommend preventive maintenance and continued monitoring.";
  }
  if (band === "good") return "System is in good health. Continue regular preventive maintenance to maintain performance.";
  return "System is in excellent health. Maintain current PM schedule.";
}