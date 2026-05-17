"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "es";

type LangContextType = {
  lang: Language;
  setLang: (l: Language) => void;
};

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mhvacr_lang");
      if (stored === "es" || stored === "en") setLangState(stored);
    } catch {}
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    try { localStorage.setItem("mhvacr_lang", l); } catch {}
    setTimeout(() => window.location.reload(), 100);
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

export function FloatingLanguageToggle() {
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div style={{ position: "fixed" as const, top: 8, right: 12, zIndex: 9990, display: "flex", background: "#1e293b", borderRadius: 50, padding: "3px", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <button onClick={() => setLang("en")} style={{ padding: "5px 11px", borderRadius: 50, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: lang === "en" ? "#fff" : "transparent", color: lang === "en" ? "#0f1f3d" : "rgba(255,255,255,0.5)" }}>🇺🇸 EN</button>
      <button onClick={() => setLang("es")} style={{ padding: "5px 11px", borderRadius: 50, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: lang === "es" ? "#f97316" : "transparent", color: lang === "es" ? "#fff" : "rgba(255,255,255,0.5)" }}>🇲🇽 ES</button>
    </div>
  );
}

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button onClick={() => setLang("en")} style={{ padding: "8px 16px", borderRadius: 50, border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", background: lang === "en" ? "#0f1f3d" : "#f1f5f9", color: lang === "en" ? "#fff" : "#64748b" }}>🇺🇸 EN</button>
      <button onClick={() => setLang("es")} style={{ padding: "8px 16px", borderRadius: 50, border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", background: lang === "es" ? "#f97316" : "#f1f5f9", color: lang === "es" ? "#fff" : "#64748b" }}>🇲🇽 ES</button>
    </div>
  );
}