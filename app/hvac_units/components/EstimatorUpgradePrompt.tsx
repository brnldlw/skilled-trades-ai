"use client";

import React, { useState } from "react";

type EstimatorPlan = {
  id: string;
  label: string;
  price: string;
  period: string;
  description: string;
  highlight?: boolean;
  tag?: string;
};

const PLANS: EstimatorPlan[] = [
  {
    id: "estimator_single",
    label: "Single Quote",
    price: "$6",
    period: "one time",
    description: "One complete AI-generated replacement quote. No subscription.",
    tag: "Try it out",
  },
  {
    id: "estimator_monthly_20",
    label: "Estimator 20",
    price: "$29",
    period: "/ month",
    description: "Up to 20 quotes per month. Best for shops doing occasional replacements.",
  },
  {
    id: "estimator_monthly_unlimited",
    label: "Estimator Unlimited",
    price: "$49",
    period: "/ month",
    description: "Unlimited quotes. Best for busy shops doing regular replacement work.",
    highlight: true,
    tag: "Most popular",
  },
];

type Props = {
  onClose?: () => void;
  context?: "banner" | "modal" | "inline";
};

export function EstimatorUpgradePrompt({ onClose, context = "modal" }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handlePurchase(planId: string) {
    setLoading(planId);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billing: "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Could not start checkout. Please try again.");
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: context === "inline" ? "20px 0 0" : "28px 24px",
      maxWidth: 520,
      width: "100%",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center" as const, marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0f1f3d", marginBottom: 6 }}>
          Replacement Quote Estimator
        </div>
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
          Photo the job site, answer a few questions, and AI generates a complete replacement quote —
          scope of work, crane requirements, equipment options, obstacles, and itemized pricing.
        </div>
      </div>

      {/* What you get */}
      <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 10 }}>What's included</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          {[
            "AI site survey — guided questions",
            "Photo analysis — detects obstacles",
            "Crane & rigging requirements",
            "2-3 equipment options with rebates",
            "Full scope of work — removal + install",
            "Special tools list",
            "Itemized pricing estimate",
            "Professional PDF to send customer",
          ].map(item => (
            <div key={item} style={{ fontSize: 12, color: "#374151", display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color: "#16a34a", flexShrink: 0, marginTop: 1 }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 16 }}>
        {PLANS.map(plan => (
          <div key={plan.id}
            style={{
              border: `2px solid ${plan.highlight ? "#f97316" : "#e2e8f0"}`,
              borderRadius: 12,
              padding: "14px 16px",
              position: "relative" as const,
              background: plan.highlight ? "#fff7ed" : "#fff",
            }}>
            {plan.tag && (
              <div style={{
                position: "absolute" as const, top: -10, left: 16,
                background: plan.highlight ? "#f97316" : "#0f1f3d",
                color: "#fff", fontSize: 10, fontWeight: 700,
                padding: "2px 10px", borderRadius: 20, letterSpacing: "0.06em",
              }}>
                {plan.tag.toUpperCase()}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0f1f3d", marginBottom: 2 }}>{plan.label}</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{plan.description}</div>
              </div>
              <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: plan.highlight ? "#f97316" : "#0f1f3d", lineHeight: 1 }}>
                  {plan.price}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{plan.period}</div>
              </div>
            </div>
            <button
              onClick={() => handlePurchase(plan.id)}
              disabled={loading !== null}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "10px",
                background: loading === plan.id ? "#e2e8f0"
                  : plan.highlight ? "#f97316" : "#0f1f3d",
                color: loading === plan.id ? "#94a3b8" : "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: loading !== null ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {loading === plan.id
                ? "Opening checkout..."
                : plan.id === "estimator_single"
                ? "Buy Single Quote — $6"
                : `Subscribe — ${plan.price}/mo`}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626", marginBottom: 12 }}>
          {error}
        </div>
      )}

      {onClose && (
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "10px", background: "none", border: "1px solid #e2e8f0", borderRadius: 8, color: "#64748b", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
        >
          Not right now
        </button>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: "#94a3b8", textAlign: "center" as const, lineHeight: 1.5 }}>
        Subscriptions cancel anytime. Single quotes never expire.
        Powered by Stripe — secure checkout.
      </div>
    </div>
  );
}

// ── Locked overlay wrapper ─────────────────────────────────────
export function EstimatorLockedOverlay({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ position: "relative" as const }}>
      {/* Blurred content underneath */}
      <div style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none" as const, opacity: 0.6 }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div
        onClick={() => setShowModal(true)}
        style={{
          position: "absolute" as const,
          inset: 0,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(15,31,61,0.7)",
          borderRadius: 12,
          cursor: "pointer",
          backdropFilter: "blur(2px)",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
          Replacement Quote Estimator
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 16, textAlign: "center" as const, maxWidth: 260 }}>
          AI-generated replacement quotes from $6. Tap to unlock.
        </div>
        <div style={{ padding: "10px 24px", background: "#f97316", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
          Unlock Estimator
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{
            position: "fixed" as const,
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div style={{ maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto" as const }}>
            <EstimatorUpgradePrompt onClose={() => setShowModal(false)} context="modal" />
          </div>
        </div>
      )}
    </div>
  );
}