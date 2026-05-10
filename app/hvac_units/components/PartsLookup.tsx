"use client";

import React, { useState } from "react";

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
  equipmentType?: string,
  finalConfirmedCause?: string,
  partsReplaced?: string
): QuickPart[] {
  const parts: QuickPart[] = [];
  const combined = `${finalConfirmedCause || ""} ${partsReplaced || ""} ${equipmentType || ""}`.toLowerCase();

  if (combined.includes("capacitor") || combined.includes("cap")) parts.push({ label: "Capacitor", query: "run capacitor dual" });
  if (combined.includes("contactor")) parts.push({ label: "Contactor", query: "contactor 2 pole 24V coil" });
  if (combined.includes("compressor")) parts.push({ label: "Compressor", query: "compressor replacement" });
  if (combined.includes("txv") || combined.includes("expansion valve")) parts.push({ label: "TXV", query: "thermal expansion valve TXV" });
  if (combined.includes("fan motor") || combined.includes("condenser fan")) parts.push({ label: "Condenser Fan Motor", query: "condenser fan motor" });
  if (combined.includes("blower") || combined.includes("evaporator fan")) parts.push({ label: "Blower Motor", query: "blower motor ECM" });
  if (combined.includes("control board") || combined.includes("board")) parts.push({ label: "Control Board", query: "control board PCB" });
  if (combined.includes("defrost")) parts.push({ label: "Defrost Board", query: "defrost control board" });
  if (combined.includes("reversing valve")) parts.push({ label: "Reversing Valve", query: "reversing valve 4-way" });
  if (combined.includes("filter") || combined.includes("filter drier")) parts.push({ label: "Filter Drier", query: "filter drier liquid line" });
  if (combined.includes("belt")) parts.push({ label: "Belt", query: "V-belt AHU blower" });
  if (combined.includes("motor")) parts.push({ label: "Motor", query: "replacement motor" });
  if (combined.includes("valve")) parts.push({ label: "Solenoid Valve", query: "solenoid valve refrigeration" });
  if (combined.includes("thermostat")) parts.push({ label: "Thermostat", query: "commercial thermostat" });
  if (combined.includes("pressure switch")) parts.push({ label: "Pressure Switch", query: "high low pressure switch refrigeration" });
  if (combined.includes("drain")) parts.push({ label: "Condensate Pump", query: "condensate pump drain" });

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
        📍 Find Nearest Supply House
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14, lineHeight: 1.5 }}>
        Use your GPS location or enter a zip code to find the closest HVAC/R supply houses.
      </div>

      {/* Chain selector */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
          Which supplier?
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
            📍 Use My Current Location
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <input value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={e => e.key === "Enter" && useZip()}
              placeholder="Or enter zip code..."
              style={{ flex: 1, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fff" }} />
            <button onClick={useZip} disabled={zip.length < 5}
              style={{ padding: "10px 16px", background: zip.length >= 5 ? "#2563eb" : "#e2e8f0", color: zip.length >= 5 ? "#fff" : "#94a3b8", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: zip.length >= 5 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
              Search
            </button>
          </div>

          {mode === "error" && (
            <div style={{ fontSize: 12, color: "#dc2626", padding: "8px 12px", background: "#fef2f2", borderRadius: 8 }}>
              Could not get GPS location. Enter your zip code instead.
            </div>
          )}
        </div>
      ) : mode === "locating" ? (
        <div style={{ padding: "16px", textAlign: "center" as const, color: "#64748b", fontSize: 14 }}>
          📍 Getting your location...
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            ✓ Location set — {locationStr.includes(",") ? "using GPS" : `zip: ${locationStr}`}
            <button onClick={() => { setMode("idle"); setLocationStr(""); setZip(""); }}
              style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginLeft: 4 }}>
              Change
            </button>
          </div>

          {/* Find button */}
          <button onClick={openAllNearby}
            style={{ width: "100%", padding: "13px", background: "#f97316", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}>
            🗺️ Show Nearest {selectedChain}
          </button>

          {/* All suppliers quick links */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>
            Or find any of these nearby:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {SUPPLY_CHAINS.filter(c => c.name !== "Any HVAC Supply").map(chain => (
              <button key={chain.name} onClick={() => openMaps(chain)}
                style={{ padding: "9px 12px", background: "#fff", border: `1px solid ${chain.color}30`, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{chain.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: chain.color }}>{chain.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>Open in Maps →</div>
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
  const [query, setQuery] = useState(initialQuery || "");
  const [searched, setSearched] = useState(false);

  const quickParts = getQuickParts(equipmentType, finalConfirmedCause, partsReplaced);

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
          <span>🎯 Searching with context:</span>
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
          placeholder="Enter part name or part number..."
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
          Search
        </button>
      </div>

      {/* Quick parts from job context */}
      {quickParts.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 6 }}>
            Quick lookup — based on your job
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
            Search on supplier sites
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
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>Opens in new tab</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
            Each button opens a new tab pre-filled with your search.
            {manufacturer && model && ` Manufacturer (${manufacturer}) and model (${model}) are included in the search automatically.`}
          </div>
        </div>
      )}

      {!searched && !query.trim() && quickParts.length === 0 && (
        <div style={{ padding: "20px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Enter a part name or number above to search across all major suppliers at once.
        </div>
      )}
    </div>
  );
}