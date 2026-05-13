// ── App Translation System ────────────────────────────────────
// Add new strings here. Use the key everywhere in the app.
// Never hardcode English strings in components — use t(key) instead.

export type Language = "en" | "es";

export const translations = {
  // ── Navigation ─────────────────────────────────────────────
  nav_menu: { en: "Menu", es: "Menú" },
  nav_home: { en: "Home", es: "Inicio" },
  nav_ai_copilot: { en: "AI Diagnostic Copilot", es: "Copiloto de Diagnóstico IA" },
  nav_pt_charts: { en: "PT Charts", es: "Tablas PT" },
  nav_calculators: { en: "Calculators", es: "Calculadoras" },
  nav_belt_ref: { en: "Belt Cross-Reference", es: "Referencia de Correas" },
  nav_parts_ref: { en: "Parts Cross-Reference", es: "Referencia de Partes" },
  nav_filter_ref: { en: "Filter Reference", es: "Referencia de Filtros" },
  nav_refrigerant_ref: { en: "Refrigerant Quick-Ref", es: "Referencia de Refrigerantes" },
  nav_wiring_ref: { en: "Wiring Reference", es: "Referencia de Cableado" },
  nav_parts_lookup: { en: "Parts Lookup", es: "Búsqueda de Partes" },
  nav_refrigerant_log: { en: "Refrigerant Log", es: "Registro de Refrigerante" },
  nav_unit_library: { en: "Unit Library", es: "Biblioteca de Unidades" },
  nav_health_score: { en: "System Health Score", es: "Puntuación de Salud del Sistema" },
  nav_failure_pred: { en: "Failure Prediction", es: "Predicción de Fallas" },
  nav_callback_check: { en: "Callback Prevention", es: "Prevención de Retorno" },
  nav_customer_report: { en: "Customer Report", es: "Reporte al Cliente" },
  nav_pm_forms: { en: "PM Form Filler", es: "Llenado de Formularios PM" },
  nav_estimator: { en: "Quote Estimator", es: "Estimador de Cotización" },
  nav_expert: { en: "Expert Hotline", es: "Línea de Expertos" },
  nav_learning: { en: "Learning Hub", es: "Centro de Aprendizaje" },

  // ── Language toggle ─────────────────────────────────────────
  lang_toggle_label: { en: "Language", es: "Idioma" },
  lang_english: { en: "English", es: "Inglés" },
  lang_spanish: { en: "Spanish", es: "Español" },

  // ── Job form ────────────────────────────────────────────────
  job_form_title: { en: "New Service Call", es: "Nueva Llamada de Servicio" },
  job_form_equipment_type: { en: "Equipment Type", es: "Tipo de Equipo" },
  job_form_manufacturer: { en: "Manufacturer", es: "Fabricante" },
  job_form_model: { en: "Model", es: "Modelo" },
  job_form_serial: { en: "Serial Number", es: "Número de Serie" },
  job_form_refrigerant: { en: "Refrigerant", es: "Refrigerante" },
  job_form_symptom: { en: "Symptom / Complaint", es: "Síntoma / Queja" },
  job_form_property_type: { en: "Property Type", es: "Tipo de Propiedad" },
  job_form_customer: { en: "Customer Name", es: "Nombre del Cliente" },
  job_form_site: { en: "Site / Address", es: "Sitio / Dirección" },
  job_form_placeholder_symptom: { en: "What is the unit doing or not doing?", es: "¿Qué hace o deja de hacer la unidad?" },
  job_form_placeholder_manufacturer: { en: "e.g. Carrier, Trane, Lennox", es: "ej. Carrier, Trane, Lennox" },
  job_form_placeholder_model: { en: "Model number from nameplate", es: "Número de modelo de la placa" },
  job_form_placeholder_serial: { en: "Serial number from nameplate", es: "Número de serie de la placa" },

  // ── Equipment types ─────────────────────────────────────────
  equip_rtu: { en: "RTU / Packaged Unit", es: "RTU / Unidad Empaquetada" },
  equip_split: { en: "Split System", es: "Sistema Split" },
  equip_mini_split: { en: "Mini-Split / VRF", es: "Mini-Split / VRF" },
  equip_heat_pump: { en: "Heat Pump", es: "Bomba de Calor" },
  equip_furnace: { en: "Gas Furnace", es: "Calefactor a Gas" },
  equip_boiler: { en: "Boiler", es: "Caldera" },
  equip_walkin_cooler: { en: "Walk-in Cooler", es: "Cuarto Frío" },
  equip_walkin_freezer: { en: "Walk-in Freezer", es: "Cuarto Congelador" },
  equip_reach_in: { en: "Reach-in Refrigeration", es: "Refrigeración de Acceso Frontal" },
  equip_ice_machine: { en: "Ice Machine", es: "Máquina de Hielo" },
  equip_chiller: { en: "Chiller", es: "Enfriador" },
  equip_other: { en: "Other", es: "Otro" },

  // ── AI Copilot ──────────────────────────────────────────────
  ai_title: { en: "AI Diagnostic Copilot", es: "Copiloto de Diagnóstico IA" },
  ai_placeholder: { en: "Describe the symptom or ask a question...", es: "Describe el síntoma o haz una pregunta..." },
  ai_send: { en: "Send", es: "Enviar" },
  ai_thinking: { en: "Thinking...", es: "Pensando..." },
  ai_hint: { en: "Fill in equipment info above for smarter answers", es: "Completa la información del equipo arriba para mejores respuestas" },
  ai_gigo_warning: { en: "Better info = better diagnosis. Fill in equipment details above.", es: "Mejor información = mejor diagnóstico. Completa los detalles del equipo arriba." },
  ai_clear: { en: "Clear chat", es: "Limpiar chat" },
  ai_voice_hint: { en: "Tap mic to speak your readings", es: "Toca el micrófono para hablar tus lecturas" },

  // ── Section titles ──────────────────────────────────────────
  section_readings: { en: "Field Readings", es: "Lecturas de Campo" },
  section_diagnosis: { en: "AI Diagnosis", es: "Diagnóstico IA" },
  section_unit_history: { en: "Unit History", es: "Historial de la Unidad" },
  section_health: { en: "System Health Score", es: "Puntuación de Salud" },
  section_callback: { en: "Callback Prevention Checklist", es: "Lista de Verificación Anti-Retorno" },
  section_parts: { en: "Parts Lookup", es: "Búsqueda de Partes" },
  section_refrigerant_log: { en: "Refrigerant Log", es: "Registro de Refrigerante" },
  section_pm_forms: { en: "PM Form Filler", es: "Llenado de Formularios PM" },
  section_estimator: { en: "Replacement Quote Estimator", es: "Estimador de Cotización de Reemplazo" },
  section_expert: { en: "Expert Hotline", es: "Línea de Expertos" },
  section_learning: { en: "Learning Hub", es: "Centro de Aprendizaje" },

  // ── Readings labels ─────────────────────────────────────────
  reading_suction: { en: "Suction Pressure", es: "Presión de Succión" },
  reading_head: { en: "Head Pressure", es: "Presión de Descarga" },
  reading_superheat: { en: "Superheat", es: "Sobrecalentamiento" },
  reading_subcool: { en: "Subcooling", es: "Subenfriamiento" },
  reading_delta_t: { en: "Delta-T", es: "Delta-T" },
  reading_return_air: { en: "Return Air Temp", es: "Temp. de Aire de Retorno" },
  reading_supply_air: { en: "Supply Air Temp", es: "Temp. de Aire de Suministro" },
  reading_outdoor_amb: { en: "Outdoor Ambient", es: "Temperatura Exterior" },
  reading_amps: { en: "Amps", es: "Amperios" },
  reading_volts: { en: "Volts", es: "Voltios" },
  reading_add: { en: "+ Add Reading", es: "+ Agregar Lectura" },

  // ── Buttons / actions ───────────────────────────────────────
  btn_save: { en: "Save", es: "Guardar" },
  btn_cancel: { en: "Cancel", es: "Cancelar" },
  btn_next: { en: "Next", es: "Siguiente" },
  btn_back: { en: "Back", es: "Atrás" },
  btn_close: { en: "Close", es: "Cerrar" },
  btn_download: { en: "Download", es: "Descargar" },
  btn_generate: { en: "Generate", es: "Generar" },
  btn_submit: { en: "Submit", es: "Enviar" },
  btn_search: { en: "Search", es: "Buscar" },
  btn_clear: { en: "Clear", es: "Limpiar" },
  btn_upload: { en: "Upload", es: "Subir" },
  btn_analyze: { en: "Analyze", es: "Analizar" },
  btn_view_history: { en: "View History", es: "Ver Historial" },
  btn_new_call: { en: "New Service Call", es: "Nueva Llamada" },
  btn_start_trial: { en: "Start Free Trial", es: "Iniciar Prueba Gratis" },

  // ── Trial banner ────────────────────────────────────────────
  trial_active: { en: "Free trial", es: "Prueba gratuita" },
  trial_days_left: { en: "days remaining", es: "días restantes" },
  trial_ending: { en: "Your free trial ends in", es: "Tu prueba gratuita termina en" },
  trial_day: { en: "day", es: "día" },
  trial_days: { en: "days", es: "días" },
  trial_full_access: { en: "Full access, no card needed. Subscribe anytime.", es: "Acceso completo, sin tarjeta. Suscríbete cuando quieras." },
  trial_see_plans: { en: "See Plans", es: "Ver Planes" },
  trial_subscribe: { en: "Subscribe Now", es: "Suscribirse Ahora" },

  // ── Expert Hotline ──────────────────────────────────────────
  expert_title: { en: "Expert Hotline", es: "Línea de Expertos" },
  expert_coming_soon: { en: "Coming Soon", es: "Próximamente" },
  expert_tagline: { en: "Stuck on a tough call? Connect live with a verified master tech.", es: "¿Atascado en un trabajo difícil? Conéctate en vivo con un técnico maestro verificado." },
  expert_btn: { en: "Call an Expert — $25", es: "Llamar a un Experto — $25" },
  expert_modal_title: { en: "Expert Hotline — Coming Soon", es: "Línea de Expertos — Próximamente" },
  expert_modal_body: { en: "We're vetting master techs right now. Leave your email and get your first call at half price.", es: "Estamos verificando técnicos maestros. Deja tu correo y obtén tu primera llamada a mitad de precio." },
  expert_email_label: { en: "Your Email", es: "Tu Correo Electrónico" },
  expert_notify_btn: { en: "Notify Me When Live", es: "Notificarme Cuando Esté Disponible" },
  expert_early_note: { en: "Early signups get first call at half price ($12.50)", es: "Los primeros en registrarse obtienen su primera llamada a mitad de precio ($12.50)" },
  expert_success_title: { en: "You're on the list!", es: "¡Estás en la lista!" },
  expert_success_body: { en: "We'll email you when expert calls go live. Your first call is half price.", es: "Te enviaremos un correo cuando estén disponibles. Tu primera llamada es a mitad de precio." },
  expert_gotit: { en: "Got it — back to the app", es: "Entendido — volver a la app" },
  expert_not_now: { en: "Not right now", es: "Ahora no" },

  // ── Supply house locator ────────────────────────────────────
  supply_title: { en: "Find Nearest Supply House", es: "Encontrar Casa de Suministros" },
  supply_use_gps: { en: "Use My Current Location", es: "Usar Mi Ubicación Actual" },
  supply_zip_placeholder: { en: "Or enter zip code...", es: "O ingresa código postal..." },
  supply_locating: { en: "Getting your location...", es: "Obteniendo tu ubicación..." },
  supply_show_nearest: { en: "Show Nearest", es: "Mostrar el Más Cercano" },
  supply_which: { en: "Which supplier?", es: "¿Cuál proveedor?" },
  supply_error: { en: "Could not get GPS. Enter zip code instead.", es: "No se pudo obtener GPS. Ingresa el código postal." },

  // ── Onboarding tour ─────────────────────────────────────────
  tour_skip: { en: "Skip tour", es: "Saltar recorrido" },
  tour_next: { en: "Next →", es: "Siguiente →" },
  tour_back: { en: "← Back", es: "← Atrás" },
  tour_start: { en: "🚀 Start using the app", es: "🚀 Comenzar a usar la app" },
  tour_of: { en: "of", es: "de" },

  // ── General ─────────────────────────────────────────────────
  loading: { en: "Loading...", es: "Cargando..." },
  error_generic: { en: "Something went wrong. Please try again.", es: "Algo salió mal. Por favor intenta de nuevo." },
  not_now: { en: "Not right now", es: "Ahora no" },
  free_trial_badge: { en: "Free 14-day trial", es: "Prueba gratuita de 14 días" },
  no_card: { en: "No credit card required", es: "No se requiere tarjeta de crédito" },
  offline_ready: { en: "Works offline", es: "Funciona sin internet" },
} as const;

export type TranslationKey = keyof typeof translations;

// ── The main translation function ─────────────────────────────
export function t(key: TranslationKey, lang: Language): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en;
}

// ── Language storage helpers ──────────────────────────────────
const LANG_KEY = "mhvacr_lang";

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "es" || stored === "en") return stored;
  } catch {}
  return "en";
}

export function setStoredLanguage(lang: Language): void {
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
}