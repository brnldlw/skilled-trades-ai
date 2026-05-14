"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../../public/locales/en/common.json";
import es from "../../public/locales/es/common.json";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { common: en },
        es: { common: es },
      },
      defaultNS: "common",
      fallbackLng: "en",
      supportedLngs: ["en", "es"],
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: "mhvacr_lang",
        caches: ["localStorage"],
      },
      interpolation: { escapeValue: false },
    });
}

export default i18n;