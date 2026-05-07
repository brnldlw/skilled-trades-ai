"use client";

import React, { useState, useEffect } from "react";
import {
  adminListUsers,
  adminSetOverride,
  adminRevokeOverride,
  getEffectiveTier,
  type UserProfile,
  type SubscriptionTier,
} from "../../lib/supabase/subscription";

const TIERS: { value: SubscriptionTier; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "solo", label: "Solo Tech ($19/mo)" },
  { value: "shop_5", label: "Shop 5 Techs ($79/mo)" },
  { value: "shop_10", label: "Shop 10 Techs ($139/mo)" },
];

function tierColor(tier: SubscriptionTier): string {
  if (tier === "free") return "#94a3b8";
  if (tier === "solo") return "#2563eb";
  if (tier === "shop_5") return "#16a34a";
  if (tier === "shop_10") return "#d97706";
  return "#94a3b8";
}

function tierBg(tier: SubscriptionTier): string {
  if (tier === "free") return "#f1f5f9";
  if (tier === "solo") return "#dbeafe";
  if (tier === "shop_5") return "#dcfce7";
  if (tier === "shop_10") return "#fef9c3";
  return "#f1f5f9";
}

function formatExpiry(s: string | null | undefined): string {
  if (!s) return "No expiry";
  const d = new Date(s);
  const now = new Date();
  if (d < now) return "EXPIRED";
  const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  return `${days} day${days !== 1 ? "s" : ""} left`;
}

type OverrideFormProps = {
  user: UserProfile;
  onSave: () => void;
  onCancel: () => void;
};

function OverrideForm({ user, onSave, onCancel }: OverrideFormProps) {
  const [tier, setTier] = useState<SubscriptionTier>(user.override_tier || "solo");
  const [hasExpiry, setHasExpiry] = useState(!!user.override_expires_at);
  const [expiry, setExpiry] = useState(
    user.override_expires_at
      ? new Date(user.override_expires_at).toISOString().slice(0, 10)
      : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [note, setNote] = useState(user.override_note || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await adminSetOverride(
        user.id,
        tier,
        hasExpiry ? new Date(expiry).toISOString() : null,
        note || null
      );
      onSave();
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "8px 10px", border: "1px solid #d1d5db",
    borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fafafa",
  };

  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginTop: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 12 }}>
        Set Override Access for {user.email}
      </div>

      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Access Level</label>
      <select style={inp} value={tier} onChange={e => setTier(e.target.value as SubscriptionTier)}>
        {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <input type="checkbox" id="hasExpiry" checked={hasExpiry} onChange={e => setHasExpiry(e.target.checked)} />
        <label htmlFor="hasExpiry" style={{ fontSize: 13, cursor: "pointer", color: "#374151" }}>
          Set expiry date (for trials)
        </label>
      </div>

      {hasExpiry && (
        <>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, marginTop: 10 }}>Expires On</label>
          <input style={inp} type="date" value={expiry} onChange={e => setExpiry(e.target.value)}
            min={new Date().toISOString().slice(0, 10)} />
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
            Access automatically reverts to their paid plan (or free) when this date passes.
          </div>
        </>
      )}

      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4, marginTop: 10 }}>Note (optional)</label>
      <input style={inp} type="text" placeholder="e.g. Trial for ABC HVAC, my tech John, conference promo"
        value={note} onChange={e => setNote(e.target.value)} />

      {error && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "9px 16px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
        >
          {saving ? "Saving..." : "Save Override"}
        </button>
        <button
          onClick={onCancel}
          style={{ padding: "9px 16px", background: "#fff", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Admin Panel
// ═══════════════════════════════════════════════════════════════
export function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [revoking, setRevoking] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRevoke(userId: string) {
    if (!confirm("Revoke override access? User will revert to their paid plan or free tier.")) return;
    setRevoking(userId);
    try {
      await adminRevokeOverride(userId);
      setMessage("Override revoked.");
      await load();
    } catch (e: any) {
      setError(e?.message || "Revoke failed");
    } finally {
      setRevoking(null);
    }
  }

  const filtered = search
    ? users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  const stats = {
    total: users.length,
    paid: users.filter(u => u.subscription_tier !== "free").length,
    overrides: users.filter(u => u.override_tier).length,
    free: users.filter(u => getEffectiveTier(u) === "free").length,
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Total Users", value: stats.total, color: "#2563eb" },
          { label: "Paid", value: stats.paid, color: "#16a34a" },
          { label: "Active Overrides", value: stats.overrides, color: "#d97706" },
          { label: "Free Tier", value: stats.free, color: "#64748b" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by email..."
        style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", marginBottom: 12, background: "#fafafa" }}
      />

      {message && (
        <div style={{ padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12, color: "#166534", marginBottom: 10 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#dc2626", marginBottom: 10 }}>
          {error}
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: 24, color: "#64748b" }}>Loading users...</div>}

      {/* User list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(user => {
          const effectiveTier = getEffectiveTier(user);
          const hasOverride = !!user.override_tier;
          const isEditing = editingId === user.id;

          return (
            <div key={user.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                      {user.email || user.id.slice(0, 12) + "..."}
                    </span>
                    {user.is_admin && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#f0fdf4", color: "#166534" }}>
                        ADMIN
                      </span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: tierBg(effectiveTier), color: tierColor(effectiveTier) }}>
                      {effectiveTier.replace("_", " ").toUpperCase()}
                    </span>
                    {hasOverride && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fef9c3", color: "#854d0e" }}>
                        OVERRIDE {user.override_expires_at ? `— ${formatExpiry(user.override_expires_at)}` : "— No expiry"}
                      </span>
                    )}
                  </div>
                  {user.override_note && (
                    <div style={{ fontSize: 12, color: "#64748b" }}>Note: {user.override_note}</div>
                  )}
                  {user.current_period_end && (
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      Subscription renews: {new Date(user.current_period_end).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => setEditingId(isEditing ? null : user.id)}
                    style={{ padding: "6px 12px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {isEditing ? "Cancel" : "Override"}
                  </button>
                  {hasOverride && (
                    <button
                      onClick={() => handleRevoke(user.id)}
                      disabled={revoking === user.id}
                      style={{ padding: "6px 12px", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {revoking === user.id ? "..." : "Revoke"}
                    </button>
                  )}
                </div>
              </div>

              {isEditing && (
                <OverrideForm
                  user={user}
                  onSave={async () => {
                    setEditingId(null);
                    setMessage(`Override set for ${user.email}`);
                    await load();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 13 }}>
          {search ? "No users found matching your search." : "No users yet."}
        </div>
      )}
    </div>
  );
}