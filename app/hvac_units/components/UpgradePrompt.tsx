"use client";

import React from "react";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";
import { useNativeShell } from "../../lib/nativeShell";

type UpgradePromptProps = {
  feature: string;
  reason: string;
  compact?: boolean;
};

export function UpgradePrompt({ feature, reason, compact = false }: UpgradePromptProps) {
  const { lang } = useLang();
  const native = useNativeShell();
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
          <span style={{ fontWeight: 700, color: "#854d0e" }}>{t("up_solo_or_shop_plan", lang).replace("{value}", feature)}</span>
          <span style={{ color: "#92400e" }}> · {reason}</span>
        </div>
        {native ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e", flexShrink: 0, textAlign: "right" as const }}>
            {t("up_manage_on_web", lang)}
          </span>
        ) : (
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
            {t("btn_upgrade", lang)}
          </a>
        )}
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
        {native ? (
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", padding: "10px 0" }}>
            {t("up_manage_on_web", lang)}
          </div>
        ) : (
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
            {t("btn_upgrade_to_solo", lang)}
          </a>
        )}
      </div>
      {!native && (
        <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          {t("up_cancel_anytime", lang)}
        </div>
      )}
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
  const { lang } = useLang();
  const native = useNativeShell();
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
          ? t("up_last_free_query", lang)
          : t(remaining === 1 ? "up_queries_remaining_singular" : "up_queries_remaining_plural", lang).replace("{count}", String(remaining))
        }
      </span>
      {native ? (
        <span style={{ fontSize: 11, fontWeight: 700, color: isLast ? "#dc2626" : "#854d0e", flexShrink: 0 }}>
          {t("up_manage_on_web", lang)}
        </span>
      ) : (
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
          {t("btn_get_unlimited", lang)}
        </a>
      )}
    </div>
  );
}