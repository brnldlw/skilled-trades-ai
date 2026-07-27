"use client";

import React, { useState } from "react";
import { useLang } from "../../components/LanguageContext";
import { t, type TranslationKey } from "../../lib/translations";

const FILTER_COMMON_KEYS: Record<string, TranslationKey> = {
  "Small residential AHU": "filter_common_small_res_ahu",
  "Small residential unit": "filter_common_small_res_unit",
  "Residential AHU": "filter_common_res_ahu",
  "Very common residential": "filter_common_very_common_res",
  "Common residential": "filter_common_common_res",
  "Residential return": "filter_common_res_return",
  "Most common residential size": "filter_common_most_common_res",
  "Residential / light commercial": "filter_common_res_light_comm",
  "Larger residential AHU": "filter_common_larger_res_ahu",
  "Residential": "filter_common_residential",
  "High efficiency residential": "filter_common_high_eff_res",
  "Media filter — residential / light commercial": "filter_common_media_res_light",
  "Media filter — very common": "filter_common_media_very_common",
  "Media filter": "filter_common_media",
  "5\" media — Lennox, Carrier, Trane systems": "filter_common_5in_lennox",
  "5\" media — high efficiency systems": "filter_common_5in_high_eff",
  "Commercial AHU — standard": "filter_common_comm_ahu_standard",
  "Commercial AHU": "filter_common_comm_ahu",
  "Commercial AHU — very common": "filter_common_comm_ahu_very_common",
  "Commercial AHU — 4\" media": "filter_common_comm_ahu_4in",
  "Commercial RTU — common Carrier/Trane size": "filter_common_comm_rtu_carrier",
  "Commercial RTU / AHU": "filter_common_comm_rtu_ahu",
  "RTU — 2 ton to 5 ton": "filter_common_rtu_2_5ton",
  "RTU — 3 ton to 7.5 ton": "filter_common_rtu_3_75ton",
  "RTU — 5 ton to 10 ton": "filter_common_rtu_5_10ton",
};

function translateFilterCommon(value: string, lang: "en" | "es"): string {
  const key = FILTER_COMMON_KEYS[value];
  return key ? t(key, lang) : value;
}

// ─── MERV Rating Guide ────────────────────────────────────────
const MERV_GUIDE = [
  { merv: "1-4",  capture: "Pollen, dust mites, standing dust",           use: "Basic residential — minimum protection",        color: "#94a3b8" },
  { merv: "5-7",  capture: "Mold spores, pet dander, fabric fibers",      use: "Standard residential — most common",            color: "#22c55e" },
  { merv: "8-10", capture: "Auto emissions, Legionella, lead dust",       use: "Better residential / light commercial",         color: "#3b82f6" },
  { merv: "11-13",capture: "Bacteria, smoke particles, virus carriers",   use: "Hospital corridors, superior residential",      color: "#8b5cf6" },
  { merv: "14-16",capture: "Virus particles, carbon dust, sea salt",      use: "Hospital inpatient, surgery adjacent areas",    color: "#f97316" },
];

// ─── Common filter sizes ──────────────────────────────────────
type FilterSize = {
  nominal: string;
  actual: string;
  type: "residential" | "commercial" | "both";
  common: string;
};

const FILTER_SIZES: FilterSize[] = [
  // Residential 1" filters
  { nominal: "10x20x1",  actual: "9.75x19.75x.75",   type: "residential", common: "Small residential AHU" },
  { nominal: "12x12x1",  actual: "11.75x11.75x.75",  type: "residential", common: "Small residential unit" },
  { nominal: "12x20x1",  actual: "11.75x19.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "12x24x1",  actual: "11.75x23.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "14x20x1",  actual: "13.75x19.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "14x24x1",  actual: "13.75x23.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "14x25x1",  actual: "13.75x24.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "15x20x1",  actual: "14.75x19.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "16x20x1",  actual: "15.75x19.75x.75",  type: "residential", common: "Very common residential" },
  { nominal: "16x24x1",  actual: "15.75x23.75x.75",  type: "residential", common: "Common residential" },
  { nominal: "16x25x1",  actual: "15.75x24.75x.75",  type: "residential", common: "Very common residential" },
  { nominal: "18x18x1",  actual: "17.75x17.75x.75",  type: "residential", common: "Residential return" },
  { nominal: "18x20x1",  actual: "17.75x19.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "18x24x1",  actual: "17.75x23.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "18x25x1",  actual: "17.75x24.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "18x30x1",  actual: "17.75x29.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "20x20x1",  actual: "19.75x19.75x.75",  type: "residential", common: "Common residential" },
  { nominal: "20x24x1",  actual: "19.75x23.75x.75",  type: "residential", common: "Common residential" },
  { nominal: "20x25x1",  actual: "19.75x24.75x.75",  type: "both",        common: "Most common residential size" },
  { nominal: "20x30x1",  actual: "19.75x29.75x.75",  type: "residential", common: "Residential AHU" },
  { nominal: "24x24x1",  actual: "23.75x23.75x.75",  type: "residential", common: "Residential / light commercial" },
  { nominal: "24x30x1",  actual: "23.75x29.75x.75",  type: "residential", common: "Larger residential AHU" },
  { nominal: "25x25x1",  actual: "24.75x24.75x.75",  type: "residential", common: "Residential" },
  // 2" filters
  { nominal: "16x20x2",  actual: "15.75x19.75x1.75", type: "residential", common: "High efficiency residential" },
  { nominal: "16x25x2",  actual: "15.75x24.75x1.75", type: "residential", common: "High efficiency residential" },
  { nominal: "20x25x2",  actual: "19.75x24.75x1.75", type: "residential", common: "High efficiency residential" },
  { nominal: "20x20x2",  actual: "19.75x19.75x1.75", type: "residential", common: "High efficiency residential" },
  // 4" filters
  { nominal: "16x20x4",  actual: "15.75x19.75x3.75", type: "both", common: "Media filter — residential / light commercial" },
  { nominal: "16x25x4",  actual: "15.75x24.75x3.75", type: "both", common: "Media filter — very common" },
  { nominal: "20x20x4",  actual: "19.75x19.75x3.75", type: "both", common: "Media filter" },
  { nominal: "20x25x4",  actual: "19.75x24.75x3.75", type: "both", common: "Media filter — very common" },
  { nominal: "20x25x5",  actual: "19.88x24.88x4.88", type: "both", common: "5\" media — Lennox, Carrier, Trane systems" },
  { nominal: "16x25x5",  actual: "15.88x24.88x4.88", type: "both", common: "5\" media — high efficiency systems" },
  // Commercial sizes
  { nominal: "20x20x2",  actual: "19.75x19.75x1.75", type: "commercial", common: "Commercial AHU — standard" },
  { nominal: "20x24x2",  actual: "19.75x23.75x1.75", type: "commercial", common: "Commercial AHU" },
  { nominal: "24x24x2",  actual: "23.75x23.75x1.75", type: "commercial", common: "Commercial AHU — very common" },
  { nominal: "24x30x2",  actual: "23.75x29.75x1.75", type: "commercial", common: "Commercial AHU" },
  { nominal: "20x20x4",  actual: "19.75x19.75x3.75", type: "commercial", common: "Commercial AHU — 4\" media" },
  { nominal: "24x24x4",  actual: "23.75x23.75x3.75", type: "commercial", common: "Commercial AHU — 4\" media" },
  { nominal: "24x30x4",  actual: "23.75x29.75x3.75", type: "commercial", common: "Commercial AHU — 4\" media" },
  { nominal: "20x25x4",  actual: "19.75x24.75x3.75", type: "commercial", common: "Commercial AHU — 4\" media" },
  { nominal: "25x25x4",  actual: "24.75x24.75x3.75", type: "commercial", common: "Commercial AHU" },
  { nominal: "25x29x4",  actual: "24.75x28.75x3.75", type: "commercial", common: "Commercial RTU — common Carrier/Trane size" },
  { nominal: "16x20x4",  actual: "15.75x19.75x3.75", type: "commercial", common: "Commercial AHU" },
  { nominal: "18x24x4",  actual: "17.75x23.75x3.75", type: "commercial", common: "Commercial AHU" },
  { nominal: "20x24x4",  actual: "19.75x23.75x3.75", type: "commercial", common: "Commercial RTU / AHU" },
  // RTU specific
  { nominal: "16x25x2",  actual: "15.75x24.75x1.75", type: "commercial", common: "RTU — 2 ton to 5 ton" },
  { nominal: "20x25x2",  actual: "19.75x24.75x1.75", type: "commercial", common: "RTU — 3 ton to 7.5 ton" },
  { nominal: "24x24x2",  actual: "23.75x23.75x1.75", type: "commercial", common: "RTU — 5 ton to 10 ton" },
];

// ─── Supplier links ───────────────────────────────────────────
function filterSupplierLinks(nominal: string, merv: string) {
  const q = `${nominal} air filter MERV ${merv}`;
  return [
    { name: "Johnstone Supply", url: `https://www.johnstonesupply.com/search?q=${encodeURIComponent(nominal + " filter")}` },
    { name: "Grainger",         url: `https://www.grainger.com/search?searchQuery=${encodeURIComponent(q)}` },
    { name: "Amazon",           url: `https://www.amazon.com/s?k=${encodeURIComponent(q)}` },
    { name: "FilterBuy",        url: `https://filterbuy.com/filters/air-filters/?size=${encodeURIComponent(nominal)}` },
    { name: "Nordic Pure",      url: `https://nordicpure.com/search?q=${encodeURIComponent(nominal)}` },
  ];
}

export function FilterReference() {
  const { lang } = useLang();
  const [searchMode, setSearchMode] = useState<"size" | "number">("size");
  const [filterType, setFilterType] = useState<"all" | "residential" | "commercial">("all");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("1");
  const [partNumber, setPartNumber] = useState("");
  const [selectedMerv, setSelectedMerv] = useState("8");
  const [results, setResults] = useState<FilterSize[]>([]);
  const [searched, setSearched] = useState(false);
  const [showMervGuide, setShowMervGuide] = useState(false);

  function handleSizeSearch() {
    if (!length || !width) return;
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(depth);
    const tol = 1.5;

    const found = FILTER_SIZES.filter(f => {
      const [fl, fw, fd] = f.nominal.split("x").map(Number);
      const typeMatch = filterType === "all" || f.type === filterType || f.type === "both";
      const sizeMatch = Math.abs(fl - l) <= tol && Math.abs(fw - w) <= tol && Math.abs(fd - d) <= 0.6;
      return typeMatch && sizeMatch;
    });

    setResults(found);
    setSearched(true);
  }

  function handlePartSearch() {
    if (!partNumber.trim()) return;
    const q = partNumber.toUpperCase().replace(/[^0-9X]/g, "x").replace(/x+/g, "x");
    const found = FILTER_SIZES.filter(f => {
      const typeMatch = filterType === "all" || f.type === filterType || f.type === "both";
      return typeMatch && (f.nominal.toUpperCase().includes(q) || f.actual.includes(q.toLowerCase()));
    });
    setResults(found);
    setSearched(true);
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, fontFamily: "inherit", background: "#fafafa",
  };

  return (
    <div>
      {/* Type toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" as const }}>
        {(["all", "residential", "commercial"] as const).map(ty => (
          <button key={ty} onClick={() => setFilterType(ty)}
            style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${filterType === ty ? "#0f1f3d" : "#e2e8f0"}`, background: filterType === ty ? "#0f1f3d" : "#fff", color: filterType === ty ? "#fff" : "#374151", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {ty === "all" ? t("filter_type_all", lang) : ty === "residential" ? t("filter_type_residential", lang) : t("filter_type_commercial", lang)}
          </button>
        ))}
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 14 }}>
        {[{ key: "size", labelKey: "filter_tab_by_dimensions" as const }, { key: "number", labelKey: "filter_tab_by_number" as const }].map(m => (
          <button key={m.key} onClick={() => { setSearchMode(m.key as "size" | "number"); setResults([]); setSearched(false); }}
            style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: searchMode === m.key ? "#fff" : "transparent", color: searchMode === m.key ? "#0f1f3d" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: searchMode === m.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            {t(m.labelKey, lang)}
          </button>
        ))}
      </div>

      {/* Size search */}
      {searchMode === "size" && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#1d4ed8" }}>
            <strong>{t("filter_tip_title", lang)}</strong> {t("filter_tip_body", lang)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{t("filter_label_length", lang)}</label>
              <input style={inp} type="number" placeholder="e.g. 20" value={length} onChange={e => setLength(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSizeSearch()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{t("filter_label_width", lang)}</label>
              <input style={inp} type="number" placeholder="e.g. 25" value={width} onChange={e => setWidth(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSizeSearch()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{t("filter_label_depth", lang)}</label>
              <select style={inp} value={depth} onChange={e => setDepth(e.target.value)}>
                <option value="1">1"</option>
                <option value="2">2"</option>
                <option value="4">4"</option>
                <option value="5">5"</option>
              </select>
            </div>
          </div>
          <button onClick={handleSizeSearch} style={{ padding: "10px 20px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            {t("btn_find_filter_size", lang)}
          </button>
        </div>
      )}

      {/* Part number search */}
      {searchMode === "number" && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
            {t("filter_label_enter_size", lang)}
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={inp} placeholder="e.g. 20x25x1, 16x25x4, 20x25..." value={partNumber} onChange={e => setPartNumber(e.target.value)} onKeyDown={e => e.key === "Enter" && handlePartSearch()} />
            <button onClick={handlePartSearch} style={{ padding: "10px 18px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
              {t("btn_search", lang)}
            </button>
          </div>
        </div>
      )}

      {/* MERV selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{t("filter_label_merv_needed", lang)}</label>
          <button onClick={() => setShowMervGuide(v => !v)} style={{ background: "none", border: "none", color: "#2563eb", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
            {showMervGuide ? t("btn_hide_guide", lang) : t("btn_what_merv", lang)}
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
          {["1","4","6","8","10","11","13","14","16"].map(m => (
            <button key={m} onClick={() => setSelectedMerv(m)}
              style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${selectedMerv === m ? "#0f1f3d" : "#e2e8f0"}`, background: selectedMerv === m ? "#0f1f3d" : "#fff", color: selectedMerv === m ? "#fff" : "#374151", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              MERV {m}
            </button>
          ))}
        </div>

        {showMervGuide && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {MERV_GUIDE.map(g => (
              <div key={g.merv} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${g.color}` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: g.color, width: 52, flexShrink: 0 }}>MERV {g.merv}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{g.use}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t("filter_captures_colon", lang)} {g.capture}</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "#94a3b8", padding: "6px 0" }}>
              {t("filter_merv_warning", lang)}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {searched && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
            {results.length > 0 ? t("filter_matches_found", lang).replace("{count}", String(results.length)) : t("filter_no_exact_matches", lang)}
          </div>

          {results.length === 0 && (
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 10, textAlign: "center" as const }}>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>{t("filter_not_in_database", lang)}</div>
              <button onClick={() => window.open(`https://filterbuy.com/filters/air-filters/?size=${encodeURIComponent(length + "x" + width + "x" + depth)}`, "_blank")}
                style={{ padding: "8px 16px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {t("btn_search_filterbuy", lang)}
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {results.map((f, i) => {
              const links = filterSupplierLinks(f.nominal, selectedMerv);
              return (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#0f1f3d" }}>{f.nominal}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t("filter_actual_size_colon", lang)} {f.actual}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" as const }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: f.type === "residential" ? "#dbeafe" : f.type === "commercial" ? "#dcfce7" : "#f3e8ff", color: f.type === "residential" ? "#1d4ed8" : f.type === "commercial" ? "#166534" : "#7c3aed" }}>
                          {f.type === "both" ? t("filter_type_both", lang) : f.type === "residential" ? t("filter_type_residential", lang) : t("filter_type_commercial", lang)}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#0f1f3d", color: "#fff" }}>
                          {t("filter_merv_selected", lang).replace("{value}", selectedMerv)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#374151", marginBottom: 10 }}>
                    <strong>{t("filter_common_use_colon", lang)}</strong> {translateFilterCommon(f.common, lang)}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 6 }}>{t("filter_find_it_at", lang)}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 6 }}>
                    {links.map(l => (
                      <button key={l.name} onClick={() => window.open(l.url, "_blank")}
                        style={{ padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, fontSize: 12, fontWeight: 600, color: "#0f1f3d", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {l.name} <span style={{ color: "#94a3b8" }}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!searched && (
        <div style={{ padding: "20px 0", textAlign: "center" as const, color: "#94a3b8", fontSize: 13 }}>
          {t("filter_empty_state", lang)}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
        {t("filter_footer_disclaimer", lang)}
      </div>
    </div>
  );
}