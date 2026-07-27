"use client";

import React, { useState } from "react";
import { useLang } from "../../components/LanguageContext";
import { t, type Language } from "../../lib/translations";

type Supplier = {
  name: string;
  icon: string;
  color: string;
  buildUrl: (query: string, manufacturer?: string, model?: string) => string;
};

const SUPPLIERS: Supplier[] = [
  {
    name: "Johnstone Supply",
    icon: "🔵",
    color: "#1d4ed8",
    buildUrl: (q, mfr) => `https://www.johnstonesupply.com/search?q=${encodeURIComponent([mfr, q].filter(Boolean).join(" "))}`,
  },
  {
    name: "Grainger",
    icon: "🔴",
    color: "#dc2626",
    buildUrl: (q, mfr) => `https://www.grainger.com/search?searchQuery=${encodeURIComponent([mfr, q].filter(Boolean).join(" "))}`,
  },
  {
    name: "PartsTown",
    icon: "🟢",
    color: "#16a34a",
    buildUrl: (q, mfr, model) => `https://www.partstown.com/search#q=${encodeURIComponent([mfr, model, q].filter(Boolean).join(" "))}`,
  },
  {
    name: "Winsupply",
    icon: "🟠",
    color: "#ea580c",
    buildUrl: (q, mfr) => `https://www.winsupply.com/search?term=${encodeURIComponent([mfr, q].filter(Boolean).join(" "))}`,
  },
  {
    name: "Amazon",
    icon: "📦",
    color: "#d97706",
    buildUrl: (q, mfr) => `https://www.amazon.com/s?k=${encodeURIComponent([mfr, q, "HVAC"].filter(Boolean).join(" "))}`,
  },
  {
    name: "Google",
    icon: "🔍",
    color: "#6366f1",
    buildUrl: (q, mfr, model) => `https://www.google.com/search?q=${encodeURIComponent([mfr, model, q, "HVAC part"].filter(Boolean).join(" "))}`,
  },
];

type QuickPart = {
  label: string;
  query: string;
};

function getQuickParts(
  equipmentType: string | undefined,
  finalConfirmedCause: string | undefined,
  partsReplaced: string | undefined,
  lang: Language
): QuickPart[] {
  const parts: QuickPart[] = [];
  const combined = `${finalConfirmedCause || ""} ${partsReplaced || ""} ${equipmentType || ""}`.toLowerCase();

  if (combined.includes("capacitor") || combined.includes("cap")) parts.push({ label: t("part_capacitor", lang), query: "run capacitor dual" });
  if (combined.includes("contactor")) parts.push({ label: t("part_contactor", lang), query: "contactor 2 pole 24V coil" });
  if (combined.includes("compressor")) parts.push({ label: t("part_compressor", lang), query: "compressor replacement" });
  if (combined.includes("txv") || combined.includes("expansion valve")) parts.push({ label: t("part_txv", lang), query: "thermal expansion valve TXV" });
  if (combined.includes("fan motor") || combined.includes("condenser fan")) parts.push({ label: t("pl_part_condenser_fan_motor", lang), query: "condenser fan motor" });
  if (combined.includes("blower") || combined.includes("evaporator fan")) parts.push({ label: t("pl_part_blower_motor", lang), query: "blower motor ECM" });
  if (combined.includes("control board") || combined.includes("board")) parts.push({ label: t("part_control_board", lang), query: "control board PCB" });
  if (combined.includes("defrost")) parts.push({ label: t("pl_part_defrost_board", lang), query: "defrost control board" });
  if (combined.includes("reversing valve")) parts.push({ label: t("pl_part_reversing_valve", lang), query: "reversing valve 4-way" });
  if (combined.includes("filter") || combined.includes("filter drier")) parts.push({ label: t("part_filter_drier", lang), query: "filter drier liquid line" });
  if (combined.includes("belt")) parts.push({ label: t("pl_part_belt", lang), query: "V-belt AHU blower" });
  if (combined.includes("motor")) parts.push({ label: t("pl_part_motor", lang), query: "replacement motor" });
  if (combined.includes("valve")) parts.push({ label: t("pl_part_solenoid_valve", lang), query: "solenoid valve refrigeration" });
  if (combined.includes("thermostat")) parts.push({ label: t("pl_part_thermostat", lang), query: "commercial thermostat" });
  if (combined.includes("pressure switch")) parts.push({ label: t("pl_part_pressure_switch", lang), query: "high low pressure switch refrigeration" });
  if (combined.includes("drain")) parts.push({ label: t("pl_part_condensate_pump", lang), query: "condensate pump drain" });

  return parts;
}

type Props = {
  manufacturer?: string;
  model?: string;
  equipmentType?: string;
  finalConfirmedCause?: string;
  partsReplaced?: string;
  initialQuery?: string;
};

// ── Supply House Locator ─────────────────────────────────────
const SUPPLY_CHAINS = [
  { name: "Johnstone Supply",    search: "Johnstone Supply HVAC",    color: "#1d4ed8", icon: "🔵" },
  { name: "Winsupply",           search: "Winsupply HVAC",           color: "#ea580c", icon: "🟠" },
  { name: "Ferguson HVAC",       search: "Ferguson HVAC supply",     color: "#dc2626", icon: "🔴" },
  { name: "Carrier Enterprise",  search: "Carrier Enterprise HVAC",  color: "#2563eb", icon: "🔵" },
  { name: "Lennox PRO",          search: "Lennox PRO supply",        color: "#16a34a", icon: "🟢" },
  { name: "Trane Supply",        search: "Trane Supply HVAC",        color: "#7c3aed", icon: "🟣" },
  { name: "Any HVAC Supply",     search: "HVAC supply store",        color: "#374151", icon: "🔧" },
];

function SupplyHouseFinder() {
  const { lang } = useLang();
  const [mode, setMode] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [zip, setZip] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [selectedChain, setSelectedChain] = useState("Any HVAC Supply");

  function getGpsLocation() {
    if (!navigator.geolocation) {
      setMode("error");
      return;
    }
    setMode("locating");
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocationStr(`${pos.coords.latitude},${pos.coords.longitude}`);
        setMode("done");
      },
      () => {
        setMode("error");
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  function useZip() {
    if (!zip.trim()) return;
    setLocationStr(zip.trim());
    setMode("done");
  }

  function openMaps(chain: typeof SUPPLY_CHAINS[0]) {
    const loc = locationStr;
    const query = encodeURIComponent(chain.search);
    // Google Maps nearby search
    const url = loc.includes(",")
      ? `https://www.google.com/maps/search/${query}/@${loc},14z`
      : `https://www.google.com/maps/search/${query}+near+${encodeURIComponent(loc)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openAllNearby() {
    const chain = SUPPLY_CHAINS.find(c => c.name === selectedChain) || SUPPLY_CHAINS[SUPPLY_CHAINS.length - 1];
    openMaps(chain);
  }

  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>
        {t("pl_find_supply_house", lang)}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14, lineHeight: 1.5 }}>
        {t("pl_find_supply_hint", lang)}
      </div>

      {/* Chain selector */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
          {t("pl_which_supplier", lang)}
        </label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
          {SUPPLY_CHAINS.map(chain => (
            <button key={chain.name} onClick={() => setSelectedChain(chain.name)}
              style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${selectedChain === chain.name ? chain.color : "#e2e8f0"}`, background: selectedChain === chain.name ? chain.color : "#fff", color: selectedChain === chain.name ? "#fff" : "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {chain.icon} {chain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Location buttons */}
      {mode === "idle" || mode === "error" ? (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          <button onClick={getGpsLocation}
            style={{ padding: "12px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {t("pl_use_current_location", lang)}
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <input value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={e => e.key === "Enter" && useZip()}
              placeholder={t("pl_zip_placeholder", lang)}
              style={{ flex: 1, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fff" }} />
            <button onClick={useZip} disabled={zip.length < 5}
              style={{ padding: "10px 16px", background: zip.length >= 5 ? "#2563eb" : "#e2e8f0", color: zip.length >= 5 ? "#fff" : "#94a3b8", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: zip.length >= 5 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
              {t("btn_search", lang)}
            </button>
          </div>

          {mode === "error" && (
            <div style={{ fontSize: 12, color: "#dc2626", padding: "8px 12px", background: "#fef2f2", borderRadius: 8 }}>
              {t("pl_gps_error", lang)}
            </div>
          )}
        </div>
      ) : mode === "locating" ? (
        <div style={{ padding: "16px", textAlign: "center" as const, color: "#64748b", fontSize: 14 }}>
          {t("pl_getting_location", lang)}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            ✓ {locationStr.includes(",") ? t("pl_location_set_gps", lang) : t("pl_location_set_zip", lang).replace("{value}", locationStr)}
            <button onClick={() => { setMode("idle"); setLocationStr(""); setZip(""); }}
              style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginLeft: 4 }}>
              {t("btn_change", lang)}
            </button>
          </div>

          {/* Find button */}
          <button onClick={openAllNearby}
            style={{ width: "100%", padding: "13px", background: "#f97316", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}>
            {t("pl_show_nearest", lang).replace("{value}", selectedChain)}
          </button>

          {/* All suppliers quick links */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>
            {t("pl_find_any_nearby", lang)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {SUPPLY_CHAINS.filter(c => c.name !== "Any HVAC Supply").map(chain => (
              <button key={chain.name} onClick={() => openMaps(chain)}
                style={{ padding: "9px 12px", background: "#fff", border: `1px solid ${chain.color}30`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{chain.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: chain.color }}>{chain.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{t("pl_open_in_maps", lang)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PartsLookup({ manufacturer, model, equipmentType, finalConfirmedCause, partsReplaced, initialQuery }: Props) {
  const { lang } = useLang();
  const [query, setQuery] = useState(initialQuery || "");
  const [searched, setSearched] = useState(false);

  const quickParts = getQuickParts(equipmentType, finalConfirmedCause, partsReplaced, lang);

  function openSupplier(supplier: Supplier, q: string) {
    const url = supplier.buildUrl(q, manufacturer, model);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleSearch(q: string) {
    if (!q.trim()) return;
    setQuery(q);
    setSearched(true);
  }

  const hasContext = !!(manufacturer || model || finalConfirmedCause);

  return (
    <div>
      {/* Supply house finder */}
      <SupplyHouseFinder />
      <div style={{ margin: "16px 0", height: 1, background: "#f1f5f9" }} />

      {/* Context strip */}
      {hasContext && (
        <div style={{
          background: "#eff6ff",
          border: "1px solid #bae6fd",
          borderRadius: 8,
          padding: "8px 12px",
          marginBottom: 12,
          fontSize: 12,
          color: "#1d4ed8",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap" as const,
        }}>
          <span>{t("pl_searching_context", lang)}</span>
          {manufacturer && <span style={{ fontWeight: 700 }}>{manufacturer}</span>}
          {model && <span style={{ fontWeight: 700 }}>{model}</span>}
          {finalConfirmedCause && <span style={{ color: "#3b82f6" }}>· {finalConfirmedCause}</span>}
        </div>
      )}

      {/* Search input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch(query)}
          placeholder={t("pl_search_placeholder", lang)}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 14,
            fontFamily: "inherit",
            background: "#fafafa",
          }}
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={!query.trim()}
          style={{
            padding: "10px 18px",
            background: query.trim() ? "#0f1f3d" : "#e2e8f0",
            color: query.trim() ? "#fff" : "#94a3b8",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: query.trim() ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          {t("btn_search", lang)}
        </button>
      </div>

      {/* Quick parts from job context */}
      {quickParts.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 6 }}>
            {t("pl_quick_lookup", lang)}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            {quickParts.map(p => (
              <button
                key={p.label}
                onClick={() => handleSearch(p.query)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  background: query === p.query ? "#0f1f3d" : "#fff",
                  color: query === p.query ? "#fff" : "#374151",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Supplier buttons */}
      {(searched || query.trim()) && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 8 }}>
            {t("pl_search_supplier_sites", lang)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            {SUPPLIERS.map(supplier => (
              <button
                key={supplier.name}
                onClick={() => openSupplier(supplier, query)}
                disabled={!query.trim()}
                style={{
                  padding: "10px 12px",
                  background: "#fff",
                  border: `1px solid ${supplier.color}40`,
                  borderRadius: 8,
                  cursor: query.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s",
                  textAlign: "left" as const,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${supplier.color}08`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = supplier.color;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${supplier.color}40`;
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{supplier.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: supplier.color }}>{supplier.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{t("pl_opens_new_tab", lang)}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
            {t("pl_each_button_note", lang)}
            {manufacturer && model && t("pl_mfr_model_included", lang).replace("{mfr}", manufacturer).replace("{model}", model)}
          </div>
        </div>
      )}

      {!searched && !query.trim() && quickParts.length === 0 && (
        <div style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          {t("pl_empty_state", lang)}
        </div>
      )}
    </div>
  );
}