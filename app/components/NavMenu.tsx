"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "../lib/supabase/client";
import { useLang } from "./LanguageContext";
import { t } from "../lib/translations";

type NavMenuProps = {
  currentPath?: string;
};

function getNavSections(lang: import("../lib/translations").Language) {
  const tt = (key: import("../lib/translations").TranslationKey) => t(key, lang);
  return [
  {
    heading: tt("nav_section_main"),
    items: [
      { label: tt("nav_dashboard"), href: "/", icon: "🏠" },
      { label: tt("nav_new_job"), href: "/hvac_units", icon: "🔧" },
      { label: tt("nav_unit_library"), href: "/hvac_units#unit-library", icon: "📋" },
      { label: tt("nav_fleet_health"), href: "/hvac_units#failure-prediction", icon: "🔮" },
      { label: tt("nav_admin_panel"), href: "/admin", icon: "⚙️", adminOnly: true },
      { label: tt("nav_company_admin"), href: "/company-admin", icon: "🏢" },
      { label: tt("nav_manager_dashboard"), href: "/manager", icon: "📊" },
    ],
  },
  {
    heading: tt("nav_section_diagnosis"),
    items: [
      { label: tt("nav_ai_diagnosis_assistant"), href: "/hvac_units#ai-chat", icon: "🤖" },
      { label: tt("nav_guided_flowcharts"), href: "/hvac_units#guided-diagnosis", icon: "🗺️" },
      { label: tt("nav_error_code_lookup"), href: "/hvac_units#error-codes", icon: "🔍" },
      { label: tt("nav_measurements_coaching"), href: "/hvac_units#measurements", icon: "📊" },
      { label: tt("nav_repair_decision_panel"), href: "/hvac_units#repair", icon: "🛠️" },
      { label: tt("nav_callback_check"), href: "/hvac_units#callback-checklist", icon: "✅" },
    ],
  },
  {
    heading: tt("nav_section_calculators"),
    items: [
      { label: tt("nav_pt_chart_lookup"), href: "/hvac_units#calculators", icon: "📊" },
      { label: tt("nav_superheat_subcooling"), href: "/hvac_units#calculators", icon: "❄️" },
      { label: tt("nav_delta_t_calc"), href: "/hvac_units#calculators", icon: "🌡️" },
      { label: tt("nav_cfm_calc"), href: "/hvac_units#calculators", icon: "💨" },
      { label: tt("nav_capacitor_mfd"), href: "/hvac_units#calculators", icon: "⚡" },
      { label: tt("nav_ohms_law"), href: "/hvac_units#calculators", icon: "🔌" },
      { label: tt("nav_gas_heat_rise"), href: "/hvac_units#calculators", icon: "🔥" },
    ],
  },
  {
    heading: tt("nav_section_reference"),
    items: [
      { label: tt("nav_belt_ref"), href: "/hvac_units#belt-reference", icon: "🔄" },
      { label: tt("nav_parts_ref"), href: "/hvac_units#parts-reference", icon: "🧰" },
      { label: tt("nav_filter_ref"), href: "/hvac_units#filter-reference", icon: "🌬️" },
      { label: tt("nav_refrigerant_ref"), href: "/hvac_units#refrigerant-reference", icon: "❄️" },
      { label: tt("nav_wiring_ref"), href: "/hvac_units#wiring-reference", icon: "⚡" },
      { label: tt("nav_parts_lookup"), href: "/hvac_units#parts-lookup", icon: "🔍" },
      { label: tt("nav_parts_manuals_assist"), href: "/hvac_units#parts-manuals", icon: "📖" },
      { label: tt("nav_learning"), href: "/hvac_units#learning-hub", icon: "📚" },
      { label: tt("nav_contact_support"), href: "mailto:support@myhvacrtool.com", icon: "✉️" },
    ],
  },
  {
    heading: tt("nav_section_closeout"),
    items: [
      { label: tt("nav_pm_forms"), href: "/hvac_units#pm-forms", icon: "📋" },
      { label: tt("nav_estimator"), href: "/hvac_units#estimator", icon: "💰" },
      { label: `${tt("nav_expert")} 🔜`, href: "/hvac_units#expert-hotline", icon: "📞" },
      { label: tt("nav_refrigerant_log"), href: "/hvac_units#refrigerant-log", icon: "🧪" },
      { label: tt("nav_customer_report"), href: "/hvac_units#customer-report", icon: "📄" },
      { label: tt("nav_callback_checklist"), href: "/hvac_units#callback-checklist", icon: "✅" },
    ],
  },
]; }

// Keep for backward compat
// NAV_ITEMS removed - use getNavSections(lang)
// TOOL_SHORTCUTS removed - use getNavSections(lang)

export function NavMenu({ currentPath = "" }: NavMenuProps) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(async (res: any) => {
      if (res?.data?.user?.email) setUserEmail(res.data.user.email);
      if (res?.data?.user?.id) {
        const { data } = await supabase.from("profiles").select("is_admin").eq("id", res.data.user.id).single();
        if (data?.is_admin) setIsAdmin(true);
      }
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

        {/* Language toggle */}
        <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginRight: 4 }}>
            {t("lang_toggle_label", lang)}:
          </span>
          <button onClick={() => { setLang("en"); setTimeout(() => window.location.reload(), 150); }}
            style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", background: lang === "en" ? "#fff" : "rgba(255,255,255,0.1)", color: lang === "en" ? "#0f1f3d" : "rgba(255,255,255,0.6)" }}>
            🇺🇸 EN
          </button>
          <button onClick={() => { setLang("es"); setTimeout(() => window.location.reload(), 150); }}
            style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", background: lang === "es" ? "#f97316" : "rgba(255,255,255,0.1)", color: lang === "es" ? "#fff" : "rgba(255,255,255,0.6)" }}>
            🇲🇽 ES
          </button>
        </div>

        <div style={{ padding: "8px 8px 4px", flex: 1, overflowY: "auto" }}>
          {getNavSections(lang).map((section) => (
            <div key={section.heading} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" as const, padding: "8px 10px 4px" }}>
                {section.heading}
              </div>
              {section.items.filter((item: any) => !item.adminOnly || isAdmin).map((item: any) => (
                <a
                  key={item.href + item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, textDecoration: "none", color: "rgba(255,255,255,0.72)", fontSize: 13, marginBottom: 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)"; }}
                >
                  <span style={{ fontSize: 15, flexShrink: 0, width: 22, textAlign: "center" as const }}>{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>
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
            {t("btn_sign_out", lang)}
          </button>
        </div>
      </div>
    </>
  );
}