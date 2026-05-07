"use client";

import React from "react";

type UpgradePromptProps = {
  feature: string;
  reason: string;
  compact?: boolean;
};

export function UpgradePrompt({ feature, reason, compact = false }: UpgradePromptProps) {
  if (compact) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "#fef9c3",
        border: "1px solid #fde047",
        borderRadius: 8,
        fontSize: 13,
      }}>
        <span style={{ fontSize: 16 }}>🔒</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, color: "#854d0e" }}>{feature} — Solo or Shop plan</span>
          <span style={{ color: "#92400e" }}> · {reason}</span>
        </div>
        <a
          href="/pricing"
          style={{
            padding: "6px 12px",
            background: "#f97316",
            color: "#fff",
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 12,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          Upgrade
        </a>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 100%)",
      borderRadius: 12,
      padding: 24,
      textAlign: "center",
      color: "#fff",
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{feature}</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 20, maxWidth: 320, margin: "0 auto 20px" }}>
        {reason}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" as const }}>
        <a
          href="/pricing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "12px 24px",
            background: "#f97316",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 15,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
          }}
        >
          🔧 Upgrade to Solo — $19/mo
        </a>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
        Cancel anytime · No long-term contract
      </div>
    </div>
  );
}

// ── Inline lock badge for partially visible features ──────────
export function LockBadge({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 11,
      fontWeight: 700,
      padding: "2px 8px",
      borderRadius: 20,
      background: "#fef9c3",
      color: "#854d0e",
      border: "1px solid #fde047",
    }}>
      🔒 {label}
    </span>
  );
}

// ── AI query limit warning ────────────────────────────────────
export function AiLimitWarning({ used, limit }: { used: number; limit: number }) {
  const remaining = limit - used;
  const isLast = remaining <= 1;

  return (
    <div style={{
      padding: "10px 14px",
      background: isLast ? "#fef2f2" : "#fef9c3",
      border: `1px solid ${isLast ? "#fecaca" : "#fde047"}`,
      borderRadius: 8,
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      flexWrap: "wrap" as const,
    }}>
      <span style={{ color: isLast ? "#dc2626" : "#854d0e", fontWeight: 600 }}>
        {isLast
          ? `⚠️ Last free AI query today. Upgrade for unlimited.`
          : `${remaining} free AI ${remaining === 1 ? "query" : "queries"} remaining today.`
        }
      </span>
      <a
        href="/pricing"
        style={{
          padding: "5px 12px",
          background: "#f97316",
          color: "#fff",
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 12,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        Get Unlimited
      </a>
    </div>
  );
}