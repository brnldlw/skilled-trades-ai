"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { NavMenu } from "../components/NavMenu";

type Job = {
  id: string;
  tech_name: string;
  tech_email: string;
  customer_name: string;
  site_name: string;
  equipment_type: string;
  manufacturer: string;
  model: string;
  symptom: string;
  final_confirmed_cause: string;
  actual_fix_performed: string;
  parts_replaced: string;
  outcome_status: string;
  callback_occurred: string;
  service_date: string;
  created_at: string;
};

type TechStats = {
  name: string;
  email: string;
  total_jobs: number;
  callbacks: number;
  callback_rate: number;
  most_common_equipment: string;
};

export default function ManagerDashboard() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterTech, setFilterTech] = useState("all");
  const [filterDays, setFilterDays] = useState("30");
  const [filterEquipment, setFilterEquipment] = useState("all");
  const [activeTab, setActiveTab] = useState<"jobs" | "techs" | "failures">("jobs");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }: { data: { user: any } }) => {
      if (!user) { window.location.href = "/auth"; return; }
      const { data: profile } = await supabase.from("profiles").select("is_admin, override_tier").eq("id", user.id).single();
      const { data: membership } = await supabase.from("company_memberships").select("role").eq("user_id", user.id).eq("status", "active").single();
      const isAdmin = profile?.is_admin;
      const isManager = membership?.role === "manager" || membership?.role === "owner" || membership?.role === "admin" || profile?.override_tier === "manager";
      if (isAdmin || isManager) {
        setAllowed(true);
        setChecking(false);
        loadData();
      } else {
        window.location.href = "/hvac_units";
      }
    });
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/manager/jobs?days=${filterDays}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setJobs(data.jobs || []);
    } catch { setError("Failed to load data."); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (allowed) loadData(); }, [filterDays, allowed]);

  const techs = Array.from(new Set(jobs.map(j => j.tech_email))).filter(Boolean);
  const equipmentTypes = Array.from(new Set(jobs.map(j => j.equipment_type))).filter(Boolean);
  const filteredJobs = jobs.filter(j => {
    if (filterTech !== "all" && j.tech_email !== filterTech) return false;
    if (filterEquipment !== "all" && j.equipment_type !== filterEquipment) return false;
    return true;
  });
  const techStats: TechStats[] = techs.map(email => {
    const techJobs = jobs.filter(j => j.tech_email === email);
    const callbacks = techJobs.filter(j => j.callback_occurred === "Yes").length;
    const equipCounts: Record<string, number> = {};
    techJobs.forEach(j => { if (j.equipment_type) equipCounts[j.equipment_type] = (equipCounts[j.equipment_type] || 0) + 1; });
    const mostCommon = Object.entries(equipCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return { name: techJobs[0]?.tech_name || email, email, total_jobs: techJobs.length, callbacks, callback_rate: techJobs.length > 0 ? Math.round((callbacks / techJobs.length) * 100) : 0, most_common_equipment: mostCommon };
  }).sort((a, b) => b.total_jobs - a.total_jobs);
  const failureCounts: Record<string, number> = {};
  jobs.forEach(j => { if (j.final_confirmed_cause) failureCounts[j.final_confirmed_cause] = (failureCounts[j.final_confirmed_cause] || 0) + 1; });
  const topFailures = Object.entries(failureCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const totalJobs = filteredJobs.length;
  const totalCallbacks = filteredJobs.filter(j => j.callback_occurred === "Yes").length;
  const callbackRate = totalJobs > 0 ? Math.round((totalCallbacks / totalJobs) * 100) : 0;

  function exportCSV() {
    const headers = ["Date","Tech","Customer","Site","Equipment","Manufacturer","Model","Symptom","Cause","Fix","Parts","Outcome","Callback"];
    const rows = filteredJobs.map(j => [j.service_date||j.created_at?.split("T")[0],j.tech_name,j.customer_name,j.site_name,j.equipment_type,j.manufacturer,j.model,j.symptom,j.final_confirmed_cause,j.actual_fix_performed,j.parts_replaced,j.outcome_status,j.callback_occurred].map(v=>`"${(v||"").replace(/"/g,'""')}"`));
    const csv = [headers,...rows].map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download=`service-history-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (checking) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Checking access...</div>;
  if (!allowed) return null;

  const card: React.CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", textAlign: "center" };

  return (
    <div style={{ paddingTop: 70, fontFamily: "inherit" }}>
      <NavMenu currentPath="/manager" />
      <div style={{ padding: "16px 14px 80px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0f1f3d", margin: 0 }}>📊 Manager Dashboard</h1>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Fleet performance and team intelligence</div>
          </div>
          <button onClick={exportCSV} style={{ padding: "9px 18px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>📥 Export CSV</button>
        </div>
        {error && <div style={{ padding: "14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 16, fontSize: 14, color: "#dc2626" }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" as const }}>
          <select value={filterDays} onChange={e => setFilterDays(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "#fff" }}>
            <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 12 months</option><option value="9999">All time</option>
          </select>
          <select value={filterTech} onChange={e => setFilterTech(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "#fff" }}>
            <option value="all">All Technicians</option>
            {techs.map(t => <option key={t} value={t}>{jobs.find(j => j.tech_email === t)?.tech_name || t}</option>)}
          </select>
          <select value={filterEquipment} onChange={e => setFilterEquipment(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "#fff" }}>
            <option value="all">All Equipment</option>
            {equipmentTypes.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
          <div style={card}><div style={{ fontSize: 28, fontWeight: 900, color: "#0f1f3d" }}>{totalJobs}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontWeight: 600 }}>TOTAL JOBS</div></div>
          <div style={card}><div style={{ fontSize: 28, fontWeight: 900, color: "#0f1f3d" }}>{techs.length}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontWeight: 600 }}>ACTIVE TECHS</div></div>
          <div style={card}><div style={{ fontSize: 28, fontWeight: 900, color: callbackRate > 15 ? "#dc2626" : callbackRate > 8 ? "#d97706" : "#16a34a" }}>{callbackRate}%</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontWeight: 600 }}>CALLBACK RATE</div></div>
          <div style={card}><div style={{ fontSize: 28, fontWeight: 900, color: "#0f1f3d" }}>{totalCallbacks}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontWeight: 600 }}>CALLBACKS</div></div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[{key:"jobs",label:"📋 All Jobs"},{key:"techs",label:"👥 By Technician"},{key:"failures",label:"🔧 Failure Patterns"}].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${activeTab===tab.key?"#0f1f3d":"#e2e8f0"}`, background: activeTab===tab.key?"#0f1f3d":"#fff", color: activeTab===tab.key?"#fff":"#374151", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{tab.label}</button>
          ))}
        </div>
        {loading ? <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading fleet data...</div> : (
          <>
            {activeTab === "jobs" && (
              <div style={{ overflowX: "auto" }}>
                {filteredJobs.length === 0 ? <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", borderRadius: 10, color: "#64748b", fontSize: 14 }}>No jobs found for this period.</div> : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: "#f1f5f9" }}>{["Date","Tech","Customer","Equipment","Cause","Outcome","Callback"].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                    <tbody>{filteredJobs.map((job, i) => (
                      <tr key={job.id} style={{ background: i%2===0?"#fff":"#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: "#64748b" }}>{job.service_date||job.created_at?.split("T")[0]||"—"}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#0f1f3d" }}>{job.tech_name||"—"}</td>
                        <td style={{ padding: "10px 12px", color: "#374151" }}>{job.customer_name||job.site_name||"—"}</td>
                        <td style={{ padding: "10px 12px", color: "#374151" }}>{[job.equipment_type,job.manufacturer].filter(Boolean).join(" · ")||"—"}</td>
                        <td style={{ padding: "10px 12px", color: "#374151", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.final_confirmed_cause||"—"}</td>
                        <td style={{ padding: "10px 12px" }}><span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: job.outcome_status==="Resolved"?"#dcfce7":job.outcome_status==="Parts on order"?"#fef9c3":"#f1f5f9", color: job.outcome_status==="Resolved"?"#166534":job.outcome_status==="Parts on order"?"#854d0e":"#374151" }}>{job.outcome_status||"—"}</span></td>
                        <td style={{ padding: "10px 12px" }}>{job.callback_occurred==="Yes"&&<span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fef2f2", color: "#dc2626" }}>⚠️ Yes</span>}{job.callback_occurred==="No"&&<span style={{ fontSize: 11, color: "#16a34a" }}>✓</span>}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            )}
            {activeTab === "techs" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {techStats.length === 0 ? <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", borderRadius: 10, color: "#64748b" }}>No technician data yet.</div> : techStats.map(tech => (
                  <div key={tech.email} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f1f3d" }}>{tech.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{tech.email}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Most common: <strong>{tech.most_common_equipment}</strong></div>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: "#0f1f3d" }}>{tech.total_jobs}</div><div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>JOBS</div></div>
                        <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: tech.callback_rate>15?"#dc2626":tech.callback_rate>8?"#d97706":"#16a34a" }}>{tech.callback_rate}%</div><div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>CALLBACKS</div></div>
                      </div>
                    </div>
                    {tech.callback_rate > 15 && <div style={{ marginTop: 12, padding: "8px 12px", background: "#fef2f2", borderRadius: 8, fontSize: 12, color: "#dc2626", fontWeight: 600 }}>⚠️ Callback rate above 15% — consider targeted training review</div>}
                  </div>
                ))}
              </div>
            )}
            {activeTab === "failures" && (
              <div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Most common confirmed causes across all jobs.</div>
                {topFailures.length === 0 ? <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", borderRadius: 10, color: "#64748b" }}>No failure data yet.</div> : topFailures.map(([cause, count], i) => {
                  const pct = Math.round((count/jobs.length)*100);
                  return (
                    <div key={cause} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f1f3d" }}><span style={{ fontSize: 11, color: "#94a3b8", marginRight: 8 }}>#{i+1}</span>{cause}</div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{count}x</div>
                      </div>
                      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: "#f97316", borderRadius: 3 }} /></div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{pct}% of all jobs</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
