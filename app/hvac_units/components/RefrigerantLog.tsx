"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  addRefrigerantLogEntry,
  listRefrigerantLogEntries,
  deleteRefrigerantLogEntry,
  type RefrigerantLogEntry,
} from "../../lib/supabase/refrigerant-log";

// ─── A2L flammable refrigerants ──────────────────────────────
const A2L_REFS = ["R-32", "R-454B", "R-452B", "R-466A"];
const A3_REFS = ["R-290", "R-600a", "R-1270"];

function getFlammabilityWarning(ref: string): string | null {
  if (A3_REFS.includes(ref)) return "⚠️ A3 — Highly Flammable. No ignition sources. Certified equipment only.";
  if (A2L_REFS.includes(ref)) return "⚠️ A2L — Mildly Flammable. No open flames. Use A2L-rated recovery equipment.";
  return null;
}

// ─── Styles ───────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "inherit",
  background: "#fafafa",
};

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#374151",
  marginBottom: 3,
  marginTop: 10,
};

const btn = (color: string, outline = false): React.CSSProperties => ({
  padding: "9px 16px",
  borderRadius: 8,
  border: outline ? `1px solid ${color}` : "none",
  background: outline ? "#fff" : color,
  color: outline ? color : "#fff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "inherit",
});

// ─── Action badge ─────────────────────────────────────────────
function ActionBadge({ action }: { action: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    added:     { bg: "#fee2e2", color: "#dc2626", label: "Added" },
    recovered: { bg: "#dcfce7", color: "#16a34a", label: "Recovered" },
    transferred: { bg: "#dbeafe", color: "#2563eb", label: "Transferred" },
  };
  const s = map[action] || map.added;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────
type RefrigerantLogProps = {
  // Pre-fill from current job
  refrigerantType?: string;
  equipmentType?: string;
  manufacturer?: string;
  model?: string;
  customerName?: string;
  siteName?: string;
  serviceDate?: string;
  unitId?: string;
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export function RefrigerantLog({
  refrigerantType = "",
  equipmentType = "",
  manufacturer = "",
  model = "",
  customerName = "",
  siteName = "",
  serviceDate = "",
  unitId = "",
}: RefrigerantLogProps) {
  const [entries, setEntries] = useState<RefrigerantLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  // Form state
  const [form, setForm] = useState({
    refrigerant_type: refrigerantType || "R-410A",
    action: "added" as "added" | "recovered" | "transferred",
    amount_lbs: "",
    cylinder_id: "",
    reason: "",
    leak_detected: false,
    leak_location: "",
    notes: "",
    tech_name: "",
    service_date: serviceDate || new Date().toISOString().slice(0, 10),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listRefrigerantLogEntries(200);
      setEntries(data);
    } catch (e: any) {
      setMessage("Could not load log: " + (e?.message || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Keep form in sync if job context changes
  useEffect(() => {
    if (refrigerantType) setForm(f => ({ ...f, refrigerant_type: refrigerantType }));
  }, [refrigerantType]);

  async function handleSave() {
    if (!form.amount_lbs || isNaN(parseFloat(form.amount_lbs))) {
      setMessage("Enter a valid amount in lbs.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await addRefrigerantLogEntry({
        unit_id: unitId || null,
        customer_name: customerName || null,
        site_name: siteName || null,
        service_date: form.service_date,
        tech_name: form.tech_name || null,
        equipment_type: equipmentType || null,
        manufacturer: manufacturer || null,
        model: model || null,
        refrigerant_type: form.refrigerant_type,
        action: form.action,
        amount_lbs: parseFloat(form.amount_lbs),
        cylinder_id: form.cylinder_id || null,
        reason: form.reason || null,
        leak_detected: form.leak_detected,
        leak_location: form.leak_location || null,
        notes: form.notes || null,
      });
      setMessage("✅ Entry saved to refrigerant log.");
      setShowForm(false);
      setForm(f => ({ ...f, amount_lbs: "", cylinder_id: "", reason: "", leak_location: "", notes: "", leak_detected: false }));
      await load();
    } catch (e: any) {
      setMessage("Save failed: " + (e?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    try {
      await deleteRefrigerantLogEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setMessage("Entry deleted.");
    } catch (e: any) {
      setMessage("Delete failed: " + (e?.message || ""));
    }
  }

  function exportCSV() {
    if (!entries.length) { setExportMsg("No entries to export."); return; }
    const headers = ["Date", "Action", "Refrigerant", "Amount (lbs)", "Cylinder ID", "Customer", "Site", "Equipment", "Manufacturer", "Model", "Tech", "Leak Detected", "Leak Location", "Reason", "Notes"];
    const rows = entries.map(e => [
      e.service_date,
      e.action,
      e.refrigerant_type,
      e.amount_lbs,
      e.cylinder_id || "",
      e.customer_name || "",
      e.site_name || "",
      e.equipment_type || "",
      e.manufacturer || "",
      e.model || "",
      e.tech_name || "",
      e.leak_detected ? "Yes" : "No",
      e.leak_location || "",
      e.reason || "",
      e.notes || "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `refrigerant-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportMsg("CSV exported — EPA 608 compliant format.");
  }

  // Summary stats
  const totalAdded = entries.filter(e => e.action === "added").reduce((s, e) => s + e.amount_lbs, 0);
  const totalRecovered = entries.filter(e => e.action === "recovered").reduce((s, e) => s + e.amount_lbs, 0);
  const leakEntries = entries.filter(e => e.leak_detected);

  const warning = getFlammabilityWarning(form.refrigerant_type);

  return (
    <div>
      {/* Stats bar */}
      {entries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Total Added", value: `${totalAdded.toFixed(1)} lbs`, color: "#dc2626" },
            { label: "Total Recovered", value: `${totalRecovered.toFixed(1)} lbs`, color: "#16a34a" },
            { label: "Leak Events", value: leakEntries.length, color: leakEntries.length > 0 ? "#d97706" : "#64748b" },
          ].map(s => (
            <div key={s.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color as string }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 }}>
        <button style={btn("#0f1f3d")} onClick={() => setShowForm(v => !v)}>
          {showForm ? "▲ Cancel" : "＋ Log Refrigerant"}
        </button>
        <button style={btn("#16a34a", true)} onClick={() => setShowHistory(v => !v)}>
          {showHistory ? "▲ Hide History" : `📋 View History (${entries.length})`}
        </button>
        <button style={btn("#2563eb", true)} onClick={exportCSV}>
          ⬇️ Export EPA CSV
        </button>
      </div>

      {exportMsg && (
        <div style={{ fontSize: 12, color: "#2563eb", marginBottom: 8 }}>{exportMsg}</div>
      )}

      {/* Log entry form */}
      {showForm && (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b", marginBottom: 4 }}>New Refrigerant Entry</div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Required for EPA 608 compliance — keep all records on file.</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={lbl}>Date *</label>
              <input style={inp} type="date" value={form.service_date}
                onChange={e => setForm(f => ({ ...f, service_date: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Tech Name</label>
              <input style={inp} type="text" placeholder="Your name" value={form.tech_name}
                onChange={e => setForm(f => ({ ...f, tech_name: e.target.value }))} />
            </div>
          </div>

          <label style={lbl}>Refrigerant Type *</label>
          <select style={inp} value={form.refrigerant_type}
            onChange={e => setForm(f => ({ ...f, refrigerant_type: e.target.value }))}>
            {["R-410A", "R-22", "R-32", "R-454B", "R-134a", "R-407C", "R-404A", "R-448A", "R-449A", "R-290", "R-600a", "R-507", "R-422D", "R-744"].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {warning && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: "#fef9c3", border: "1px solid #fde047", borderRadius: 8, fontSize: 12, color: "#854d0e", fontWeight: 700 }}>
              {warning}
            </div>
          )}

          <label style={lbl}>Action *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["added", "recovered", "transferred"] as const).map(a => (
              <button key={a} type="button"
                onClick={() => setForm(f => ({ ...f, action: a }))}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 8,
                  border: `2px solid ${form.action === a ? "#0f1f3d" : "#e2e8f0"}`,
                  background: form.action === a ? "#0f1f3d" : "#fff",
                  color: form.action === a ? "#fff" : "#374151",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "capitalize" as const,
                }}>
                {a === "added" ? "➕ Added" : a === "recovered" ? "♻️ Recovered" : "🔄 Transferred"}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={lbl}>Amount (lbs) *</label>
              <input style={inp} type="number" step="0.1" min="0" placeholder="e.g. 2.5"
                value={form.amount_lbs}
                onChange={e => setForm(f => ({ ...f, amount_lbs: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Cylinder ID / Tank #</label>
              <input style={inp} type="text" placeholder="e.g. CYL-001"
                value={form.cylinder_id}
                onChange={e => setForm(f => ({ ...f, cylinder_id: e.target.value }))} />
            </div>
          </div>

          <label style={lbl}>Reason / Work Performed</label>
          <input style={inp} type="text" placeholder="e.g. Low charge top-off, leak repair, system replacement"
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />

          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" id="leakDetected" checked={form.leak_detected}
              onChange={e => setForm(f => ({ ...f, leak_detected: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: "pointer" }} />
            <label htmlFor="leakDetected" style={{ fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer" }}>
              Leak detected on this call
            </label>
          </div>

          {form.leak_detected && (
            <>
              <label style={lbl}>Leak Location</label>
              <input style={inp} type="text" placeholder="e.g. Evaporator coil fitting, service valve"
                value={form.leak_location}
                onChange={e => setForm(f => ({ ...f, leak_location: e.target.value }))} />
            </>
          )}

          <label style={lbl}>Notes</label>
          <textarea style={{ ...inp, resize: "vertical" as const }} rows={2} placeholder="Any additional notes for the record..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />

          {/* Pre-filled job context display */}
          {(customerName || equipmentType) && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#eff6ff", borderRadius: 8, fontSize: 12, color: "#1d4ed8" }}>
              📋 Auto-linked to current job: {[customerName, siteName, `${manufacturer} ${model}`.trim(), equipmentType].filter(Boolean).join(" · ")}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button style={btn("#0f1f3d")} onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Entry"}
            </button>
            <button style={btn("#64748b", true)} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div style={{
          padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 8,
          background: message.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
          color: message.startsWith("✅") ? "#166534" : "#dc2626",
          border: `1px solid ${message.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`,
        }}>
          {message}
        </div>
      )}

      {/* History */}
      {showHistory && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 8 }}>
            Refrigerant Log — {entries.length} entries
          </div>
          {loading && <div style={{ fontSize: 13, color: "#64748b" }}>Loading...</div>}
          {!loading && entries.length === 0 && (
            <div style={{ fontSize: 13, color: "#94a3b8", padding: "12px 0" }}>No entries yet. Log your first refrigerant entry above.</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map(e => (
              <div key={e.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                        {e.refrigerant_type}
                      </span>
                      <ActionBadge action={e.action} />
                      <span style={{ fontWeight: 800, fontSize: 14, color: e.action === "added" ? "#dc2626" : "#16a34a" }}>
                        {e.amount_lbs} lbs
                      </span>
                      {e.leak_detected && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fef9c3", color: "#854d0e" }}>
                          LEAK
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                      {e.service_date}
                      {e.customer_name ? ` · ${e.customer_name}` : ""}
                      {e.site_name ? ` · ${e.site_name}` : ""}
                      {e.cylinder_id ? ` · Tank: ${e.cylinder_id}` : ""}
                      {e.tech_name ? ` · ${e.tech_name}` : ""}
                    </div>
                    {e.reason && (
                      <div style={{ fontSize: 12, color: "#374151", marginTop: 3 }}>{e.reason}</div>
                    )}
                    {e.leak_location && (
                      <div style={{ fontSize: 12, color: "#854d0e", marginTop: 2 }}>⚠️ Leak: {e.leak_location}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(e.id)}
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, padding: 4, flexShrink: 0 }}
                    title="Delete entry"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EPA compliance note */}
      <div style={{ marginTop: 12, padding: "8px 12px", background: "#f1f5f9", borderRadius: 8, fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
        <strong>EPA 608 Compliance:</strong> Federal law requires records of refrigerant purchases and use for systems with 50+ lbs of refrigerant. 
        Violations up to $44,539 per day per violation. Export CSV to maintain compliant records.
        A2L refrigerants (R-32, R-454B) require certified recovery equipment.
      </div>
    </div>
  );
}