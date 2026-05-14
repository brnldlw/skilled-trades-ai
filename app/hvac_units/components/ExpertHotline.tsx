"use client";
import React, { useState } from "react";
import { useLang } from "../../components/LanguageContext";

const copy = {
  en: {
    coming_soon: "Coming Soon", title: "Expert Hotline",
    tagline: "Stuck on a tough call? Connect live with a verified master tech who can see what you see.",
    btn: "Call an Expert — $25", note: "Be the first to know when this goes live",
    modal_title: "Expert Hotline — Coming Soon",
    modal_body: "We're vetting master techs right now. Leave your email and get your first call at half price.",
    email_label: "Your Email", email_placeholder: "tech@yourcompany.com",
    notify_btn: "Notify Me When Live",
    early_note: "Early signups get first call at half price ($12.50)",
    success_title: "You're on the list!",
    success_body: "We'll email you when live. Your first call is half price.",
    gotit: "Got it — back to the app", not_now: "Not right now",
    features: ["Verified experts — 15+ years, skill-tested","Matched to your equipment type","Live video — they see what you see","$25 for first 15 min","Available 7 days a week"],
    what: ["Live video with verified 15+ year tech","Matched to your equipment type","They guide in real time","$25 for first 15 min","Available 7 days including evenings"],
  },
  es: {
    coming_soon: "Próximamente", title: "Línea de Expertos",
    tagline: "¿Atascado en un trabajo difícil? Conéctate en vivo con un técnico maestro verificado.",
    btn: "Llamar a un Experto — $25", note: "Sé el primero en saber cuándo esté disponible",
    modal_title: "Línea de Expertos — Próximamente",
    modal_body: "Estamos verificando técnicos. Deja tu correo y obtén tu primera llamada a mitad de precio.",
    email_label: "Tu Correo Electrónico", email_placeholder: "tecnico@tuempresa.com",
    notify_btn: "Notificarme Cuando Esté Disponible",
    early_note: "Los primeros obtienen su primera llamada a mitad de precio ($12.50)",
    success_title: "¡Estás en la lista!",
    success_body: "Te avisaremos cuando estén disponibles. Primera llamada a mitad de precio.",
    gotit: "Entendido — volver a la app", not_now: "Ahora no",
    features: ["Expertos verificados — mínimo 15 años","Emparejado con tu tipo de equipo","Video en vivo — ven lo que ves","$25 por los primeros 15 min","Disponible 7 días a la semana"],
    what: ["Video en vivo con técnico de 15+ años","Emparejado con tu equipo","Guían en tiempo real","$25 por los primeros 15 min","Disponible 7 días, tardes incluidas"],
  },
};

export function ExpertHotline() {
  const { lang } = useLang();
  const c = lang === "es" ? copy.es : copy.en;
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email || !email.includes("@")) return;
    setSubmitting(true);
    try { await fetch("/api/expert-waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); } catch {}
    setSubmitted(true);
    setSubmitting(false);
  }

  const icons = ["✅","🔧","📹","💰","⏰"];

  return (
    <>
      <div style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #1a3260 100%)", borderRadius: 14, padding: "20px 20px 24px", border: "1px solid rgba(249,115,22,0.3)", position: "relative" as const, overflow: "hidden" }}>
        <div style={{ position: "absolute" as const, top: -40, right: -40, width: 180, height: 180, background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.4)", borderRadius: 20, padding: "4px 12px", marginBottom: 14 }}>
          <span style={{ fontSize: 11 }}>🔜</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{c.coming_soon}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 8 }}>📞 {c.title}</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 18, lineHeight: 1.6 }}>{c.tagline}</div>
        {c.features.map((text, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{icons[i]}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
        <div style={{ height: 16 }} />
        <button onClick={() => setModalOpen(true)} style={{ width: "100%", padding: "14px", background: "#f97316", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}>
          📞 {c.btn}
        </button>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" as const, marginTop: 10 }}>{c.note}</div>
      </div>

      {modalOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }} style={{ position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "28px 24px 36px", width: "100%", maxWidth: 480 }}>
            {!submitted ? (
              <>
                <div style={{ textAlign: "center" as const, marginBottom: 20 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📞</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#0f1f3d", marginBottom: 8 }}>{c.modal_title}</div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{c.modal_body}</div>
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                  {c.what.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "#374151" }}>
                      <span style={{ color: "#16a34a", fontWeight: 700 }}>✓</span>{item}
                    </div>
                  ))}
                </div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{c.email_label}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={c.email_placeholder} style={{ width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 15, fontFamily: "inherit", marginBottom: 12 }} />
                <button onClick={handleSubmit} disabled={submitting || !email.includes("@")} style={{ width: "100%", padding: "14px", background: !email.includes("@") ? "#e2e8f0" : "#f97316", color: !email.includes("@") ? "#94a3b8" : "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
                  {c.notify_btn}
                </button>
                <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" as const, marginBottom: 10 }}>{c.early_note}</div>
                <button onClick={() => setModalOpen(false)} style={{ width: "100%", padding: "10px", background: "none", border: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{c.not_now}</button>
              </>
            ) : (
              <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#0f1f3d", marginBottom: 10 }}>{c.success_title}</div>
                <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>{c.success_body}</div>
                <button onClick={() => { setModalOpen(false); setSubmitted(false); setEmail(""); }} style={{ padding: "13px 32px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>{c.gotit}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
