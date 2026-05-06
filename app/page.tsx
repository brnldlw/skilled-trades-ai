"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "./lib/supabase/client";
import {
  listUnitsForCurrentUser,
  listServiceEventsForCurrentUser,
  type UnitRow,
  type ServiceEventRow,
} from "./lib/supabase/work-orders";
import { NavMenu } from "./components/NavMenu";

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
}

function StatCard({ value, label, color = "#2563eb" }: { value: string | number; label: string; color?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function QuickAction({ icon, label, sub, href, color = "#2563eb" }: { icon: string; label: string; sub: string; href: string; color?: string }) {
  return (
    <a href={href} style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 12, padding: "14px 16px", textDecoration: "none", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${color}18`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e8edf5"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{label}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{ marginLeft: "auto", fontSize: 18, color: "#cbd5e1" }}>›</div>
    </a>
  );
}

function OutcomeBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    "Resolved": { bg: "#dcfce7", color: "#16a34a", label: "Resolved" },
    "Monitoring": { bg: "#fef9c3", color: "#ca8a04", label: "Monitor" },
    "Callback": { bg: "#fee2e2", color: "#dc2626", label: "Callback" },
    "Parts on Order": { bg: "#dbeafe", color: "#2563eb", label: "Parts Ordered" },
    "Not Set": { bg: "#f1f5f9", color: "#64748b", label: "Open" },
  };
  const s = map[status] || map["Not Set"];
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>;
}

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("");
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [events, setEvents] = useState<ServiceEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setAuthed(false); setLoading(false); return; }
    supabase.auth.getUser().then((res: any) => {
      const data = res?.data;
      if (!data?.user) { setAuthed(false); setLoading(false); return; }
      setAuthed(true);
      setUserEmail(data.user.email || "");
      Promise.all([
        listUnitsForCurrentUser().catch(() => [] as UnitRow[]),
        listServiceEventsForCurrentUser().catch(() => [] as ServiceEventRow[]),
      ]).then(([u, e]) => { setUnits(u); setEvents(e); setLoading(false); });
    });
  }, []);

  if (authed === false) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1f3d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8, textAlign: "center" }}>HVAC/R Pro</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 32, textAlign: "center", maxWidth: 340 }}>The diagnostic platform built for field technicians.</p>
        <a href="/auth" style={{ padding: "13px 32px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>Sign In</a>
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, maxWidth: 560, width: "100%" }}>
          {[{ icon: "🤖", label: "AI Diagnosis", sub: "Claude-powered" }, { icon: "📊", label: "PT Charts", sub: "All refrigerants" }, { icon: "🧮", label: "Calculators", sub: "SH, SC, CFM" }, { icon: "📋", label: "Unit History", sub: "Every job logged" }].map(f => (
            <div key={f.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{f.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{f.sub}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentEvents = events.slice(0, 20);
  const recentUnits = units.slice(0, 5);
  const todayEvents = events.filter(e => e.service_date === new Date().toISOString().slice(0, 10));
  const callbackEvents = events.filter(e => e.callback_occurred === "Yes" || e.outcome_status === "Callback");
  const monitorEvents = events.filter(e => e.outcome_status === "Monitoring");
  const searchLower = search.toLowerCase().trim();
  const searchedUnits = searchLower ? units.filter(u => [u.customer_name, u.site_name, u.manufacturer, u.model, u.equipment_type, u.unit_nickname].some(f => f?.toLowerCase().includes(searchLower))).slice(0, 8) : [];
  const firstName = userEmail ? userEmail.split("@")[0].split(".")[0] : "Tech";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f4f7fb", minHeight: "100vh" }}>
      <NavMenu currentPath="/" />
      <div style={{ paddingTop: 52 }}>
        <div style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 100%)", padding: "24px 20px 28px", color: "#fff" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{greeting}, {firstName} 👋</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 6, marginBottom: 0 }}>{loading ? "Loading..." : `${units.length} units tracked · ${events.length} jobs logged`}</p>
            <div style={{ position: "relative", marginTop: 16 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search units, customers, sites..." style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "none", fontSize: 14, fontFamily: "inherit", background: "rgba(255,255,255,0.12)", color: "#fff", outline: "none", boxSizing: "border-box" }} />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 18 }}>×</button>}
            </div>
            {searchedUnits.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 10, marginTop: 4, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                {searchedUnits.map((u, i) => (
                  <a key={u.id} href="/hvac_units" style={{ display: "flex", alignItems: "center", padding: "10px 14px", textDecoration: "none", borderTop: i > 0 ? "1px solid #f1f5f9" : "none" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f8fafc"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#fff"}>
                    <span style={{ fontSize: 16, marginRight: 10 }}>🔧</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{u.customer_name || "No customer"} · {u.unit_nickname || u.equipment_type || "Unit"}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{u.manufacturer} {u.model} · {u.site_name}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
            {search && searchedUnits.length === 0 && !loading && <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>No units found matching "{search}"</div>}
          </div>
        </div>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px 40px" }}>
          {!loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 16 }}>
              <StatCard value={units.length} label="Units tracked" color="#2563eb" />
              <StatCard value={events.length} label="Jobs logged" color="#16a34a" />
              <StatCard value={todayEvents.length} label="Today's jobs" color="#d97706" />
              <StatCard value={callbackEvents.length} label="Callbacks" color={callbackEvents.length > 0 ? "#dc2626" : "#64748b"} />
            </div>
          )}

          {!loading && (callbackEvents.length > 0 || monitorEvents.length > 0) && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Needs Attention</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {callbackEvents.slice(0, 3).map(e => (
                  <a key={e.id} href="/hvac_units" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fff", borderRadius: 10, border: "1px solid #fee2e2", textDecoration: "none" }}>
                    <span style={{ fontSize: 18 }}>🔴</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Callback — {e.symptom || "No symptom recorded"}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{e.service_date ? formatDate(e.service_date) : ""}{e.final_confirmed_cause ? ` · ${e.final_confirmed_cause}` : ""}</div>
                    </div>
                    <OutcomeBadge status="Callback" />
                  </a>
                ))}
                {monitorEvents.slice(0, 2).map(e => (
                  <a key={e.id} href="/hvac_units" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fff", borderRadius: 10, border: "1px solid #fef9c3", textDecoration: "none" }}>
                    <span style={{ fontSize: 18 }}>🟡</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Monitoring — {e.symptom || "No symptom recorded"}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{e.service_date ? formatDate(e.service_date) : ""}</div>
                    </div>
                    <OutcomeBadge status="Monitoring" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <QuickAction icon="🔧" label="Start a New Job" sub="Open a fresh diagnosis workflow" href="/hvac_units" color="#2563eb" />
              <QuickAction icon="🤖" label="Ask the AI Assistant" sub="Talk to a Claude-powered master tech" href="/hvac_units#ai-chat" color="#7c3aed" />
              <QuickAction icon="🧮" label="Open Calculators" sub="PT chart, SH/SC, CFM, Ohm's law" href="/hvac_units#calculators" color="#16a34a" />
              <QuickAction icon="📋" label="Unit Library" sub={`Browse all ${units.length} tracked units`} href="/hvac_units#unit-library" color="#d97706" />
            </div>
          </div>

          {!loading && recentEvents.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>Recent Jobs</div>
                <a href="/hvac_units" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>View all →</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentEvents.slice(0, 8).map(e => (
                  <a key={e.id} href="/hvac_units" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fff", borderRadius: 10, border: "1px solid #e8edf5", textDecoration: "none" }} onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.borderColor = "#2563eb"} onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.borderColor = "#e8edf5"}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🔧</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.symptom || "No symptom recorded"}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{e.service_date ? formatDate(e.service_date) : ""}{e.final_confirmed_cause ? ` · ${e.final_confirmed_cause}` : ""}</div>
                    </div>
                    <OutcomeBadge status={e.outcome_status || "Not Set"} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {!loading && recentUnits.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Recently Added Units</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentUnits.map(u => (
                  <a key={u.id} href="/hvac_units" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fff", borderRadius: 10, border: "1px solid #e8edf5", textDecoration: "none" }} onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.borderColor = "#2563eb"} onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.borderColor = "#e8edf5"}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🏢</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.customer_name || "No customer"} · {u.unit_nickname || u.equipment_type || "Unit"}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{[u.manufacturer, u.model, u.site_name].filter(Boolean).join(" · ")}</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>{u.created_at ? timeAgo(u.created_at) : ""}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!loading && units.length === 0 && (
            <div style={{ marginTop: 32, textAlign: "center", padding: "32px 20px", background: "#fff", borderRadius: 12, border: "1px solid #e8edf5" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>Ready to log your first job?</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Start a diagnosis to log equipment, take readings, and get AI-powered help.</div>
              <a href="/hvac_units" style={{ display: "inline-block", padding: "11px 24px", background: "#2563eb", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Start First Job</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}