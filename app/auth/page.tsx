
"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

type Mode = "login" | "signup";

export default function AuthPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [techType, setTechType] = useState("solo");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function setMsg(msg: string, error = false) {
    setMessage(msg);
    setIsError(error);
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage("");
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) {
      setMsg("Please enter your email and password.", true);
      setLoading(false);
      return;
    }
    try {
      if (mode === "signup") {
        if (!fullName.trim()) { setMsg("Please enter your name.", true); setLoading(false); return; }
        if (cleanPassword.length < 8) { setMsg("Password must be at least 8 characters.", true); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail, password: cleanPassword,
          options: { data: { full_name: fullName.trim(), company_name: companyName.trim() || null, tech_type: techType } },
        });
        if (error) { setMsg(error.message, true); return; }
        if (data?.user) {
          await fetch("/api/onboarding/create-company", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.user.id, email: cleanEmail, companyName: companyName.trim() || `${fullName.trim()}'s Account` }),
          }).catch(() => null);
        }
        // Fire welcome email (non-blocking)
        fetch("/api/email/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, firstName: fullName.split(" ")[0] }),
        }).catch(() => null);

        setMsg("Account created! You can now sign in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
        if (error) { setMsg(error.message, true); return; }
        window.location.href = "/hvac_units";
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading) handleSubmit();
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 14px",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#f8fafc", fontSize: 15, fontFamily: "inherit", outline: "none",
  };

  const lbl: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 700, color: "#94a3b8",
    marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" as const,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0c1a2e 0%, #0f2440 50%, #0c1a2e 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 3, color: "#f97316", marginBottom: 4, fontFamily: "system-ui" }}>MY HVAC/R TOOL</div>
          </a>
          <div style={{ fontSize: 14, color: "#64748b" }}>
            {mode === "login" ? "Welcome back — sign in to continue" : "Create your free account"}
          </div>
        </div>

        <div style={{ background: "rgba(15,36,64,0.8)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: 16, padding: "32px 28px", backdropFilter: "blur(12px)", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>

          <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {(["login","signup"] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setMessage(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: mode === m ? "#f97316" : "transparent", color: mode === m ? "#fff" : "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {mode === "signup" && (
              <>
                <div>
                  <label style={lbl}>Your Name *</label>
                  <input style={inp} type="text" placeholder="First and last name" value={fullName} onChange={e => setFullName(e.target.value)} onKeyDown={handleKeyDown} autoComplete="name" />
                </div>
                <div>
                  <label style={lbl}>Company / Shop Name</label>
                  <input style={inp} type="text" placeholder="ABC HVAC Services (optional)" value={companyName} onChange={e => setCompanyName(e.target.value)} onKeyDown={handleKeyDown} autoComplete="organization" />
                </div>
                <div>
                  <label style={lbl}>I am a...</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[{ value: "solo", label: "🔧 Solo Tech", sub: "Independent / self-employed" }, { value: "shop", label: "🏢 Shop Tech", sub: "Part of a company" }].map(t => (
                      <button key={t.value} type="button" onClick={() => setTechType(t.value)} style={{ padding: "10px 12px", borderRadius: 10, border: `2px solid ${techType === t.value ? "#f97316" : "rgba(255,255,255,0.08)"}`, background: techType === t.value ? "rgba(249,115,22,0.12)" : "rgba(0,0,0,0.2)", color: techType === t.value ? "#f8fafc" : "#64748b", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, transition: "all 0.2s" }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{t.label}</div>
                        <div style={{ fontSize: 11, marginTop: 2, color: techType === t.value ? "#94a3b8" : "#475569" }}>{t.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={lbl}>Email Address *</label>
              <input style={inp} type="email" placeholder="tech@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} autoComplete="email" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Password *</label>
                {mode === "signup" && <span style={{ fontSize: 11, color: "#475569" }}>Min. 8 characters</span>}
              </div>
              <div style={{ position: "relative" }}>
                <input style={{ ...inp, paddingRight: 44 }} type={showPassword ? "text" : "password"} placeholder={mode === "signup" ? "Create a strong password" : "Your password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {message && (
              <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, background: isError ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.1)", border: `1px solid ${isError ? "rgba(220,38,38,0.3)" : "rgba(22,163,74,0.3)"}`, color: isError ? "#fca5a5" : "#86efac", lineHeight: 1.5 }}>
                {message}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "rgba(249,115,22,0.5)" : "#f97316", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", letterSpacing: "0.5px", boxShadow: loading ? "none" : "0 4px 20px rgba(249,115,22,0.4)" }}>
              {loading ? "Please wait..." : mode === "login" ? "🔧 Sign In" : "🔧 Create Free Account"}
            </button>

            {mode === "signup" && (
              <div style={{ fontSize: 11, color: "#475569", textAlign: "center", lineHeight: 1.6 }}>
                By creating an account you agree to our Terms of Service and Privacy Policy. No credit card required.
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#475569" }}>
          {mode === "login" ? (
            <>Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("signup"); setMessage(""); }} style={{ background: "none", border: "none", color: "#f97316", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign up free</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("login"); setMessage(""); }} style={{ background: "none", border: "none", color: "#f97316", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign in</button>
            </>
          )}
        </div>

        {mode === "signup" && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {["Free tier — no credit card needed", "AI diagnosis + PT charts included free", "Upgrade anytime from $19/mo"].map(f => (
              <div key={f} style={{ fontSize: 12, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#f97316" }}>✓</span><span>{f}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href="https://myhvacrtool.com" style={{ fontSize: 12, color: "#334155", textDecoration: "none" }}>← Back to myhvacrtool.com</a>
        </div>

      </div>
    </div>
  );
}