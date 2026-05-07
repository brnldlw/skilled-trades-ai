"use client";

import React, { useState } from "react";
import type { SavedUnitRecord } from "../../lib/unit-store";
import type { ServiceEventRow } from "../../lib/supabase/work-orders";
import { calcSystemHealthScore } from "../lib/systemHealthScore";
import { SystemHealthScore } from "./SystemHealthScore";

// ─── helpers ──────────────────────────────────────────────────
function formatDate(s: string | null | undefined): string {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }); }
  catch { return s; }
}

function daysSince(s: string | null | undefined): number | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

// ─── sub-components ───────────────────────────────────────────
function InfoGrid({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
      {items.map(({ label, value }) => (
        <div key={label}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{value || "—"}</div>
        </div>
      ))}
    </div>
  );
}

function StatBox({ value, label, color = "#2563eb", sub }: { value: string | number; label: string; color?: string; sub?: string }) {
  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function OutcomeBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Resolved": { bg: "#dcfce7", color: "#16a34a" },
    "Monitoring": { bg: "#fef9c3", color: "#ca8a04" },
    "Callback": { bg: "#fee2e2", color: "#dc2626" },
    "Parts on Order": { bg: "#dbeafe", color: "#2563eb" },
  };
  const s = map[status] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {status || "Open"}
    </span>
  );
}

// ─── Timeline event card ──────────────────────────────────────
function TimelineEvent({ event, idx }: { event: ServiceEventRow; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const isCallback = event.callback_occurred === "Yes" || event.outcome_status === "Callback";

  return (
    <div style={{
      border: `1px solid ${isCallback ? "#fecaca" : "#e2e8f0"}`,
      borderLeft: `3px solid ${isCallback ? "#dc2626" : "#2563eb"}`,
      borderRadius: 10,
      overflow: "hidden",
      background: "#fff",
    }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10 }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 800, color: "#64748b", flexShrink: 0,
        }}>
          {idx + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
              {event.symptom || "No symptom recorded"}
            </span>
            {event.outcome_status && <OutcomeBadge status={event.outcome_status} />}
            {isCallback && <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>⚠ CALLBACK</span>}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {formatDate(event.service_date)}
            {event.final_confirmed_cause ? ` · ${event.final_confirmed_cause}` : ""}
          </div>
        </div>
        <div style={{ fontSize: 16, color: "#94a3b8", flexShrink: 0 }}>{expanded ? "▲" : "▼"}</div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {event.final_confirmed_cause && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Confirmed Cause</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{event.final_confirmed_cause}</div>
              </div>
            )}
            {event.actual_fix_performed && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Work Performed</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{event.actual_fix_performed}</div>
              </div>
            )}
            {event.parts_replaced && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Parts Replaced</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{event.parts_replaced}</div>
              </div>
            )}
            {event.tech_closeout_notes && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Tech Notes</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{event.tech_closeout_notes}</div>
              </div>
            )}
            {event.diagnosis_summary && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Diagnosis Summary</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{event.diagnosis_summary}</div>
              </div>
            )}
            {Array.isArray(event.photo_urls) && event.photo_urls.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Photos ({event.photo_urls.length})</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {event.photo_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Photo ${i + 1}`} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0" }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────
function Tab({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        border: "none",
        borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
        background: "none",
        color: active ? "#2563eb" : "#64748b",
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span style={{ background: active ? "#2563eb" : "#e2e8f0", color: active ? "#fff" : "#64748b", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main UnitProfilePanel
// ═══════════════════════════════════════════════════════════════
type UnitProfilePanelProps = {
  unit: SavedUnitRecord | null;
  timeline: ServiceEventRow[];
  loading: boolean;
  message: string;
  onClose: () => void;
  onLoad: (unit: SavedUnitRecord) => void;
};

export function UnitProfilePanel({
  unit,
  timeline,
  loading,
  message,
  onClose,
  onLoad,
}: UnitProfilePanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "patterns">("overview");

  if (!unit) return null;

  const healthScore = calcSystemHealthScore(timeline);
  const totalCalls = timeline.length;
  const callbacks = timeline.filter(e => e.callback_occurred === "Yes" || e.outcome_status === "Callback").length;
  const resolved = timeline.filter(e => e.outcome_status === "Resolved").length;
  const lastService = timeline.length ? formatDate(timeline[0]?.service_date) : "Never";
  const daysSinceService = timeline.length ? daysSince(timeline[0]?.service_date) : null;

  // Pattern analysis
  const symptomCounts = timeline.reduce<Record<string, number>>((acc, e) => {
    const k = (e.symptom || "").trim();
    if (k) acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const causeCounts = timeline.reduce<Record<string, number>>((acc, e) => {
    const k = (e.final_confirmed_cause || "").trim();
    if (k) acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const partsCounts = timeline.reduce<Record<string, number>>((acc, e) => {
    const k = (e.parts_replaced || "").trim();
    if (k) acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topCauses = Object.entries(causeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topParts = Object.entries(partsCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const unitLabel = [unit.unitNickname, unit.equipmentType, unit.manufacturer, unit.model].filter(Boolean).join(" · ");

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "60px 16px 16px",
      zIndex: 2100,
      overflowY: "auto",
    }}>
      <div style={{
        width: "min(780px, 100%)",
        background: "#f8fafc",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        marginBottom: 20,
      }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ background: "#0f1f3d", padding: "20px 20px 0", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                Unit Profile · My HVACR Tool
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                {unit.customerName || "Unknown Customer"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>
                {unit.siteName ? `${unit.siteName}` : ""}
                {unit.siteAddress ? ` · ${unit.siteAddress}` : ""}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{unitLabel}</div>
            </div>

            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => { onLoad(unit); onClose(); }}
                style={{
                  padding: "8px 14px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Load Job
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 14px",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}>
            <Tab label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
            <Tab label="Service History" active={activeTab === "history"} onClick={() => setActiveTab("history")} badge={totalCalls} />
            <Tab label="Patterns" active={activeTab === "patterns"} onClick={() => setActiveTab("patterns")} />
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div style={{ padding: 20, overflowY: "auto", maxHeight: "calc(90vh - 160px)" }}>

          {/* ── OVERVIEW TAB ──────────────────────────────────── */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Health score */}
              <SystemHealthScore result={healthScore} />

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                <StatBox value={totalCalls} label="Total Calls" color="#2563eb" />
                <StatBox
                  value={resolved}
                  label="Resolved"
                  color="#16a34a"
                  sub={totalCalls ? `${Math.round(resolved / totalCalls * 100)}%` : undefined}
                />
                <StatBox
                  value={callbacks}
                  label="Callbacks"
                  color={callbacks > 0 ? "#dc2626" : "#64748b"}
                />
                <StatBox
                  value={daysSinceService !== null ? `${daysSinceService}d` : "—"}
                  label="Since Last"
                  color={daysSinceService !== null && daysSinceService > 365 ? "#d97706" : "#64748b"}
                  sub={lastService}
                />
              </div>

              {/* Equipment details */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Equipment Details</div>
                <InfoGrid items={[
                  { label: "Equipment Type", value: unit.equipmentType },
                  { label: "Unit Tag", value: unit.unitNickname },
                  { label: "Manufacturer", value: unit.manufacturer },
                  { label: "Model", value: unit.model },
                  { label: "Serial Number", value: unit.serialNumber || "" },
                  { label: "Refrigerant", value: unit.refrigerantType },
                  { label: "Property Type", value: unit.propertyType },
                  { label: "System Type", value: unit.systemType || "" },
                ]} />
              </div>

              {/* Most recent visit */}
              {timeline.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Most Recent Visit</div>
                  <TimelineEvent event={timeline[0]} idx={0} />
                </div>
              )}

              {loading && (
                <div style={{ textAlign: "center", padding: 24, color: "#64748b", fontSize: 13 }}>Loading history...</div>
              )}
              {message && !loading && (
                <div style={{ textAlign: "center", padding: 16, color: "#64748b", fontSize: 13, background: "#f8fafc", borderRadius: 10 }}>{message}</div>
              )}
            </div>
          )}

          {/* ── HISTORY TAB ───────────────────────────────────── */}
          {activeTab === "history" && (
            <div>
              {loading && (
                <div style={{ textAlign: "center", padding: 32, color: "#64748b", fontSize: 13 }}>Loading service history...</div>
              )}
              {!loading && timeline.length === 0 && (
                <div style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 13, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  No service history on record for this unit yet.
                </div>
              )}
              {!loading && timeline.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    {timeline.length} service visit{timeline.length !== 1 ? "s" : ""} · Most recent first
                  </div>
                  {timeline.map((event, idx) => (
                    <TimelineEvent key={event.id} event={event} idx={idx} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PATTERNS TAB ──────────────────────────────────── */}
          {activeTab === "patterns" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {timeline.length < 2 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 13, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  Need at least 2 service visits to show patterns. Log more visits to unlock this view.
                </div>
              ) : (
                <>
                  {/* Recurring symptoms */}
                  {topSymptoms.length > 0 && (
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Recurring Symptoms</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {topSymptoms.map(([symptom, count]) => (
                          <div key={symptom} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, fontSize: 13, color: "#374151" }}>{symptom}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ height: 6, width: `${Math.min(count * 24, 96)}px`, background: count > 1 ? "#fee2e2" : "#e2e8f0", borderRadius: 3 }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: count > 1 ? "#dc2626" : "#64748b", width: 20, textAlign: "right" }}>{count}×</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top causes */}
                  {topCauses.length > 0 && (
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Confirmed Causes</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {topCauses.map(([cause, count]) => (
                          <div key={cause} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, fontSize: 13, color: "#374151" }}>{cause}</div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{count}×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parts history */}
                  {topParts.length > 0 && (
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Parts Replaced</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {topParts.map(([part, count]) => (
                          <div key={part} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ flex: 1, fontSize: 13, color: "#374151" }}>{part}</div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>{count}×</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Callback analysis */}
                  <div style={{ background: callbacks > 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${callbacks > 0 ? "#fecaca" : "#bbf7d0"}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: callbacks > 0 ? "#dc2626" : "#16a34a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                      {callbacks > 0 ? "⚠ Callback History" : "✓ No Callbacks"}
                    </div>
                    <div style={{ fontSize: 13, color: "#374151" }}>
                      {callbacks > 0
                        ? `This unit has ${callbacks} callback${callbacks !== 1 ? "s" : ""} recorded across ${totalCalls} service visits (${Math.round(callbacks / totalCalls * 100)}% callback rate). Review the service history tab to identify unresolved root causes.`
                        : `No callbacks recorded across ${totalCalls} service visit${totalCalls !== 1 ? "s" : ""}. System has been reliably serviced.`
                      }
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}