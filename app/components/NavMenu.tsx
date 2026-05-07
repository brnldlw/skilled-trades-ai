"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "../lib/supabase/client";

type NavMenuProps = {
  currentPath?: string;
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "🏠" },
  { label: "New Job", href: "/hvac_units#new-job", icon: "🔧" },
  { label: "Unit Library", href: "/hvac_units#unit-library", icon: "📋" },
  { label: "AI Assistant", href: "/hvac_units#ai-chat", icon: "🤖" },
  { label: "Calculators", href: "/hvac_units#calculators", icon: "🧮" },
  { label: "Parts & Manuals", href: "/hvac_units#parts-manuals", icon: "🔩" },
  { label: "Repair Panel", href: "/hvac_units#repair", icon: "🛠️" },
  { label: "Measurements", href: "/hvac_units#measurements", icon: "📊" },
];

const TOOL_SHORTCUTS = [
  { label: "PT Chart Lookup", href: "/hvac_units#calculators", icon: "📊" },
  { label: "Superheat / Subcooling", href: "/hvac_units#calculators", icon: "❄️" },
  { label: "Delta-T Check", href: "/hvac_units#calculators", icon: "🌡️" },
  { label: "CFM Calculator", href: "/hvac_units#calculators", icon: "💨" },
  { label: "Capacitor MFD", href: "/hvac_units#calculators", icon: "⚡" },
  { label: "Gas Heat Rise", href: "/hvac_units#calculators", icon: "🔥" },
];

export function NavMenu({ currentPath = "" }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then((res: any) => {
      if (res?.data?.user?.email) setUserEmail(res.data.user.email);
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false);
    const parts = href.split("#");
    const hash = parts[1];
    const path = parts[0];
    if (hash && window.location.pathname === path) {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "T";

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 52,
        background: "#0f1f3d", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 16px", zIndex: 900,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setOpen(true)} aria-label="Open navigation menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
            ))}
          </button>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🔧</span>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.3px" }}>My HVACR Tool</span>
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href="/hvac_units#new-job" style={{ padding: "6px 12px", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>
            + New Job
          </a>
          <div
            style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#fff", cursor: "pointer", flexShrink: 0 }}
            onClick={() => setOpen(true)}
          >
            {initials}
          </div>
        </div>
      </header>

      <div onClick={() => setOpen(false)} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 910,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.22s ease",
      }} />

      <div ref={menuRef} style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 280,
        background: "#0f1f3d", zIndex: 920, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)", overflowY: "auto",
      }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{userEmail ? userEmail.split("@")[0] : "Tech"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>{userEmail || "Not signed in"}</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 4 }} aria-label="Close menu">
            ×
          </button>
        </div>

        <div style={{ padding: "12px 8px 4px", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", padding: "0 8px 6px" }}>
            Navigation
          </div>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 8, textDecoration: "none", color: "rgba(255,255,255,0.72)", fontSize: 14, marginBottom: 2 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ padding: "8px 8px 4px", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", padding: "0 8px 6px", marginTop: 6 }}>
            Quick Tools
          </div>
          {TOOL_SHORTCUTS.map((item, i) => (
            <a
              key={i}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, textDecoration: "none", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 2 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ padding: "12px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, textAlign: "center" }}>
            My HVACR Tool · v1.0
          </div>
          <button
            onClick={handleSignOut}
            style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.55)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}