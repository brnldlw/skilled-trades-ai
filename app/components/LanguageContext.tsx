"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, getStoredLanguage, setStoredLanguage } from "../lib/translations";

// ── Context ───────────────────────────────────────────────────
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
    setLangState(getStoredLanguage());
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    setStoredLanguage(l);
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

// ── Large visible language toggle ─────────────────────────────
export function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#f1f5f9",
      borderRadius: 50,
      padding: "4px 6px",
      border: "2px solid #e2e8f0",
    }}>
      <button
        onClick={() => setLang("en")}
        style={{
          padding: "8px 18px",
          borderRadius: 50,
          border: "none",
          fontWeight: 800,
          fontSize: 15,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s",
          background: lang === "en" ? "#0f1f3d" : "transparent",
          color: lang === "en" ? "#fff" : "#64748b",
          boxShadow: lang === "en" ? "0 2px 8px rgba(15,31,61,0.3)" : "none",
        }}
      >
        🇺🇸 EN
      </button>
      <button
        onClick={() => setLang("es")}
        style={{
          padding: "8px 18px",
          borderRadius: 50,
          border: "none",
          fontWeight: 800,
          fontSize: 15,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s",
          background: lang === "es" ? "#f97316" : "transparent",
          color: lang === "es" ? "#fff" : "#64748b",
          boxShadow: lang === "es" ? "0 2px 8px rgba(249,115,22,0.4)" : "none",
        }}
      >
        🇲🇽 ES
      </button>
    </div>
  );
}

// ── Floating language toggle ─────────────────────────────────
export function FloatingLanguageToggle() {
  const { lang, setLang } = useLang();
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  function handleSwitch(newLang: Language) {
    setLang(newLang);
    setFlash(true);
    setTimeout(() => setFlash(false), 1000);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed" as const,
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 998,
      display: "flex",
      alignItems: "center",
      gap: 0,
      background: "#1e293b",
      borderRadius: 50,
      padding: "5px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.1)",
    }}>
      <button
        onClick={() => handleSwitch("en")}
        style={{
          padding: "10px 20px",
          borderRadius: 50,
          border: "none",
          fontWeight: 800,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s",
          background: lang === "en" ? "#fff" : "transparent",
          color: lang === "en" ? "#0f1f3d" : "rgba(255,255,255,0.5)",
          boxShadow: lang === "en" ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
        }}
      >
        🇺🇸 English
      </button>
      <button
        onClick={() => handleSwitch("es")}
        style={{
          padding: "10px 20px",
          borderRadius: 50,
          border: "none",
          fontWeight: 800,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s",
          background: lang === "es" ? "#f97316" : "transparent",
          color: lang === "es" ? "#fff" : "rgba(255,255,255,0.5)",
          boxShadow: lang === "es" ? "0 2px 8px rgba(249,115,22,0.4)" : "none",
        }}
      >
        🇲🇽 Español
      </button>
      {flash && (
        <div style={{
          position: "absolute" as const,
          top: -36,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#16a34a",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          padding: "4px 12px",
          borderRadius: 20,
          whiteSpace: "nowrap" as const,
        }}>
          {lang === "es" ? "✓ Cambiado a Español" : "✓ Switched to English"}
        </div>
      )}
    </div>
  );
}