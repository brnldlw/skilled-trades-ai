"use client";

import React, { createContext, useContext, useState } from "react";
import { Language, setStoredLanguage } from "../lib/translations";

// Read language synchronously — before any render
function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const v = window.localStorage.getItem("mhvacr_lang");
    if (v === "es" || v === "en") return v;
  } catch {}
  return "en";
}

type LangContextType = { lang: Language; setLang: (l: Language) => void; };
const LangContext = createContext<LangContextType>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize directly from localStorage — no useEffect delay
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  function setLang(l: Language) {
    setLangState(l);
    setStoredLanguage(l);
    window.location.href = window.location.href;
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: "flex", gap: 6, background: "#f1f5f9", borderRadius: 50, padding: "4px 6px", border: "2px solid #e2e8f0" }}>
      <button onClick={() => setLang("en")} style={{ padding: "8px 18px", borderRadius: 50, border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", background: lang === "en" ? "#0f1f3d" : "transparent", color: lang === "en" ? "#fff" : "#64748b" }}>🇺🇸 EN</button>
      <button onClick={() => setLang("es")} style={{ padding: "8px 18px", borderRadius: 50, border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", background: lang === "es" ? "#f97316" : "transparent", color: lang === "es" ? "#fff" : "#64748b" }}>🇲🇽 ES</button>
    </div>
  );
}

export function FloatingLanguageToggle() {
  const { lang, setLang } = useLang();

  // Don't render on server
  if (typeof window === "undefined") return null;

  return (
    <div style={{ position: "fixed" as const, bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9990, display: "flex", background: "#1e293b", borderRadius: 50, padding: "5px", boxShadow: "0 4px 24px rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <button
        onClick={() => setLang("en")}
        style={{ padding: "11px 22px", borderRadius: 50, border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", background: lang === "en" ? "#fff" : "transparent", color: lang === "en" ? "#0f1f3d" : "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
      >🇺🇸 English</button>
      <button
        onClick={() => setLang("es")}
        style={{ padding: "11px 22px", borderRadius: 50, border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", background: lang === "es" ? "#f97316" : "transparent", color: lang === "es" ? "#fff" : "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
      >🇲🇽 Español</button>
    </div>
  );
}