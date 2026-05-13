"use client";

import React, { useState } from "react";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function ExpertHotline() {
  const { lang } = useLang();
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email || !email.includes("@")) return;
    setSubmitting(true);
    try {
      await fetch("/api/expert-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // show success regardless
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* ── Expert Hotline Card ─────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0f1f3d 0%, #1a3260 100%)",
        borderRadius: 14,
        padding: "20px 20px 24px",
        border: "1px solid rgba(249,115,22,0.3)",
        position: "relative" as const,
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute" as const,
          top: -40, right: -40,
          width: 180, height: 180,
          background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(249,115,22,0.2)",
          border: "1px solid rgba(249,115,22,0.4)",
          borderRadius: 20,
          padding: "4px 12px",
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 11 }}>🔜</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{t("expert_coming_soon", lang)}</span>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", marginBottom: 8, lineHeight: 1.2 }}>
          📞 Expert Hotline
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 18, lineHeight: 1.6 }}>
          Stuck on a tough call? Connect live with a verified master tech who can see what you see and walk you through it — step by step.
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 22 }}>
          {[
            { icon: "✅", text: "Verified experts — 15+ years minimum, skill-tested" },
            { icon: "🔧", text: "Matched to your equipment type before connecting" },
            { icon: "📹", text: "Live video — they see exactly what you see" },
            { icon: "💰", text: "$25 for the first 15 min — no subscription needed" },
            { icon: "⏰", text: "Available 7 days a week, evenings included" },
          ].map(item => (
            <div key={item.text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setModalOpen(true)}
          style={{
            width: "100%",
            padding: "14px",
            background: "#f97316",
            color: "#ffffff",
            border: "none",
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
            position: "relative" as const,
          }}
        >
          📞 Call an Expert — $25
        </button>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" as const, marginTop: 10 }}>
          Be the first to know when this goes live
        </div>
      </div>

      {/* ── Coming Soon Modal ───────────────────────────── */}
      {modalOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
          style={{
            position: "fixed" as const,
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "0 0 env(safe-area-inset-bottom, 0)",
          }}
        >
          <div style={{
            background: "#ffffff",
            borderRadius: "20px 20px 0 0",
            padding: "28px 24px 36px",
            width: "100%",
            maxWidth: 480,
            boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
          }}>
            {!submitted ? (
              <>
                {/* Icon */}
                <div style={{ textAlign: "center" as const, marginBottom: 16 }}>
                  <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 12 }}>📞</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#0f1f3d", marginBottom: 8 }}>
                    Expert Hotline — Coming Soon
                  </div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
                    We're vetting and onboarding master techs right now. Leave your email and you'll be the first to know when live expert calls go live — and you'll get your first call at half price.
                  </div>
                </div>

                {/* Preview of what's coming */}
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 10 }}>
                    What you'll get
                  </div>
                  {[
                    "Live video call with a verified 15+ year master tech",
                    "Expert matched to your equipment type before connecting",
                    "They see your screen — annotate and guide in real time",
                    "$25 for first 15 min, $2/min after — no subscription",
                    "Available 7 days a week including evenings",
                  ].map(item => (
                    <div key={item} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "#374151" }}>
                      <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Email input */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="tech@yourcompany.com"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 15,
                      fontFamily: "inherit",
                      background: "#fafafa",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !email.includes("@")}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: submitting || !email.includes("@") ? "#e2e8f0" : "#f97316",
                    color: submitting || !email.includes("@") ? "#94a3b8" : "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 16,
                    cursor: submitting || !email.includes("@") ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    marginBottom: 10,
                  }}
                >
                  {submitting ? "Saving..." : "🔔 Notify Me When It's Live"}
                </button>

                {/* Half price note */}
                <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" as const }}>
                  Early signups get their first expert call at half price ($12.50)
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ width: "100%", marginTop: 10, padding: "10px", background: "none", border: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Not right now
                </button>
              </>
            ) : (
              /* Success state */
              <>
                <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#0f1f3d", marginBottom: 10 }}>
                    You're on the list!
                  </div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 300, margin: "0 auto", marginBottom: 24 }}>
                    We'll email you the moment expert calls go live. As an early signup, your first call is half price — $12.50 instead of $25.
                  </div>
                  <button
                    onClick={() => { setModalOpen(false); setSubmitted(false); setEmail(""); }}
                    style={{ padding: "13px 32px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Got it — back to the app
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}