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

// ── Floating language toggle (shows in bottom corner) ─────────
export function FloatingLanguageToggle() {
  const { lang, setLang } = useLang();
  const [visible, setVisible] = useState(false);

  // Show after mount to avoid SSR mismatch
  useEffect(() => { setVisible(true); }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed" as const,
      bottom: 80,
      right: 16,
      zIndex: 998,
    }}>
      {lang === "en" ? (
        <button
          onClick={() => setLang("es")}
          title="Cambiar a Español"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#0f1f3d",
            color: "#fff",
            border: "none",
            borderRadius: 50,
            padding: "12px 18px",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap" as const,
          }}
        >
          🇲🇽 Español
        </button>
      ) : (
        <button
          onClick={() => setLang("en")}
          title="Switch to English"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f97316",
            color: "#fff",
            border: "none",
            borderRadius: 50,
            padding: "12px 18px",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 20px rgba(249,115,22,0.35)",
            whiteSpace: "nowrap" as const,
          }}
        >
          🇺🇸 English
        </button>
      )}
    </div>
  );
}