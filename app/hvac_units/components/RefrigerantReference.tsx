"use client";

import React, { useState } from "react";

type RefrigerantData = {
  name: string;
  type: string;
  safetyClass: string;
  gwp: number | string;
  oilType: string;
  replacedBy: string[];
  replaces: string[];
  boilingPoint: string;
  criticalTemp: string;
  phaseOut: string;
  a2lNotes?: string;
  commonUse: string;
  status: "active" | "phasedown" | "phaseout" | "new";
};

const REFRIGERANTS: Record<string, RefrigerantData> = {
  "R-22": {
    name: "R-22 (HCFC-22)", type: "HCFC", safetyClass: "A1",
    gwp: 1810, oilType: "Mineral or Alkylbenzene (AB)",
    replacedBy: ["R-407C", "R-410A", "R-32", "R-454B"],
    replaces: ["R-12"],
    boilingPoint: "-41.4°F", criticalTemp: "204.8°F",
    phaseOut: "Production ended Jan 1, 2020 in the US. Reclaimed R-22 still legal to use for servicing existing equipment. No new equipment since 2010.",
    commonUse: "Legacy residential and commercial AC, heat pumps. Millions of systems still in service.",
    status: "phaseout",
  },
  "R-410A": {
    name: "R-410A (HFC)", type: "HFC blend", safetyClass: "A1",
    gwp: 2088, oilType: "POE (Polyolester) — required",
    replacedBy: ["R-32", "R-454B", "R-452B"],
    replaces: ["R-22"],
    boilingPoint: "-61.1°F", criticalTemp: "161.8°F",
    phaseOut: "EPA Section 608 phasedown ongoing. New residential equipment must use lower-GWP refrigerant by 2025. Existing equipment can continue to be serviced. Production caps reducing through 2036.",
    commonUse: "Dominant residential and light commercial AC and heat pumps from 2010-2025. Majority of equipment in field today.",
    status: "phasedown",
  },
  "R-32": {
    name: "R-32 (HFC)", type: "HFC", safetyClass: "A2L",
    gwp: 675, oilType: "POE (Polyolester)",
    replacedBy: [],
    replaces: ["R-410A"],
    boilingPoint: "-61.2°F", criticalTemp: "173.4°F",
    phaseOut: "Currently approved. Lower GWP than R-410A. A2L mildly flammable — requires A2L-certified equipment and handling procedures.",
    a2lNotes: "Mildly flammable. Requires A2L-rated recovery equipment, brazing procedures with nitrogen purge, and no open flames near refrigerant. Check local codes for installation requirements.",
    commonUse: "New residential split systems and mini-splits. Used by Daikin, Mitsubishi, Fujitsu, and others. Growing market share.",
    status: "active",
  },
  "R-454B": {
    name: "R-454B (Opteon XL41)", type: "HFO/HFC blend", safetyClass: "A2L",
    gwp: 466, oilType: "POE (Polyolester)",
    replacedBy: [],
    replaces: ["R-410A"],
    boilingPoint: "-60.9°F", criticalTemp: "166.1°F",
    phaseOut: "Currently approved. Primary R-410A replacement for residential equipment in the US. Carrier Puron Advance, Trane Opteon. A2L handling required.",
    a2lNotes: "A2L — mildly flammable. Requires A2L-rated tools and equipment. Cannot use standard R-410A recovery equipment for R-454B-only service after EPA deadline. Nitrogen purge brazing recommended.",
    commonUse: "New residential AC and heat pumps replacing R-410A. Carrier, Trane, Bryant, Payne systems. Required for new equipment sold after Jan 1, 2025.",
    status: "active",
  },
  "R-452B": {
    name: "R-452B (Opteon XL55)", type: "HFO/HFC blend", safetyClass: "A2L",
    gwp: 698, oilType: "POE (Polyolester)",
    replacedBy: [],
    replaces: ["R-410A"],
    boilingPoint: "-57.8°F", criticalTemp: "165.9°F",
    phaseOut: "Currently approved. Used by some manufacturers as R-410A replacement. A2L handling required.",
    a2lNotes: "A2L — mildly flammable. Same handling precautions as R-454B. Verify equipment compatibility before service.",
    commonUse: "Commercial unitary equipment. Some Lennox and York systems.",
    status: "active",
  },
  "R-407C": {
    name: "R-407C (HFC blend)", type: "HFC zeotropic blend", safetyClass: "A1",
    gwp: 1774, oilType: "POE (Polyolester)",
    replacedBy: ["R-32", "R-454B"],
    replaces: ["R-22"],
    boilingPoint: "-46.3°F", criticalTemp: "186.9°F",
    phaseOut: "Subject to HFC phasedown. Still widely used. Temperature glide (10°F+) means charge always by weight — never by pressure alone.",
    commonUse: "Commercial AC, chillers, some residential. R-22 retrofit alternative. Temperature glide — must charge by weight.",
    status: "phasedown",
  },
  "R-404A": {
    name: "R-404A (HFC blend)", type: "HFC blend", safetyClass: "A1",
    gwp: 3922, oilType: "POE (Polyolester)",
    replacedBy: ["R-448A", "R-449A", "R-452A", "R-507A"],
    replaces: ["R-502", "R-22 (refrigeration)"],
    boilingPoint: "-49.8°F", criticalTemp: "161.2°F",
    phaseOut: "High GWP — significant phasedown pressure. Still in service on many walk-ins. Replacements available. Avoid installing new systems with R-404A.",
    commonUse: "Walk-in coolers and freezers, reach-in cases, ice machines, transport refrigeration. Huge installed base.",
    status: "phasedown",
  },
  "R-448A": {
    name: "R-448A (Solstice N40)", type: "HFO/HFC blend", safetyClass: "A1",
    gwp: 1387, oilType: "POE (Polyolester)",
    replacedBy: [],
    replaces: ["R-404A", "R-22 (refrigeration)"],
    boilingPoint: "-46.7°F", criticalTemp: "170.1°F",
    phaseOut: "Currently approved. Widely used R-404A replacement. A1 safety class — no flammability concerns. Lower GWP than R-404A.",
    commonUse: "Commercial refrigeration retrofit and new equipment. Walk-ins, reach-ins, supermarket cases. Popular Honeywell/Solstice product.",
    status: "active",
  },
  "R-449A": {
    name: "R-449A (Opteon XP40)", type: "HFO/HFC blend", safetyClass: "A1",
    gwp: 1397, oilType: "POE (Polyolester)",
    replacedBy: [],
    replaces: ["R-404A", "R-22 (refrigeration)"],
    boilingPoint: "-47.2°F", criticalTemp: "170.2°F",
    phaseOut: "Currently approved. A1 safety class — no flammability. R-404A replacement with similar performance. Chemours/Opteon product.",
    commonUse: "Commercial refrigeration — walk-ins, reach-ins, display cases. Drop-in replacement approach for R-404A retrofits.",
    status: "active",
  },
  "R-134a": {
    name: "R-134a (HFC)", type: "HFC", safetyClass: "A1",
    gwp: 1430, oilType: "POE or PAG (automotive)",
    replacedBy: ["R-1234yf", "R-513A"],
    replaces: ["R-12"],
    boilingPoint: "-15.1°F", criticalTemp: "214.0°F",
    phaseOut: "Subject to HFC phasedown. Still common in automotive AC, chillers, and medium-temp refrigeration.",
    commonUse: "Automotive AC, centrifugal chillers, medium-temp refrigeration, vending machines.",
    status: "phasedown",
  },
  "R-507A": {
    name: "R-507A (HFC blend)", type: "HFC azeotropic blend", safetyClass: "A1",
    gwp: 3985, oilType: "POE (Polyolester)",
    replacedBy: ["R-448A", "R-449A"],
    replaces: ["R-502"],
    boilingPoint: "-52.1°F", criticalTemp: "159.1°F",
    phaseOut: "Highest GWP of common refrigerants — significant phasedown pressure. Similar performance to R-404A. Replacements strongly recommended for new installs.",
    commonUse: "Low-temperature refrigeration, freezers, transport. Similar applications to R-404A.",
    status: "phasedown",
  },
  "R-290": {
    name: "R-290 (Propane)", type: "Hydrocarbon", safetyClass: "A3",
    gwp: 3, oilType: "Mineral or Alkylbenzene",
    replacedBy: [],
    replaces: ["R-22", "R-404A (small systems)"],
    boilingPoint: "-43.7°F", criticalTemp: "206.2°F",
    phaseOut: "Natural refrigerant — minimal environmental impact. A3 — highly flammable. Charge limited to 150g in most applications. EPA SNAP approved for specific applications.",
    a2lNotes: "A3 — HIGHLY FLAMMABLE. Not A2L. Requires specific training, equipment, and handling procedures. Charge size strictly limited. No ignition sources. Commercial use requires proper certification and facilities.",
    commonUse: "Residential mini-splits (specific models), plug-in commercial reach-ins, vending machines. Growing use in small commercial refrigeration.",
    status: "active",
  },
  "R-600a": {
    name: "R-600a (Isobutane)", type: "Hydrocarbon", safetyClass: "A3",
    gwp: 3, oilType: "Mineral",
    replacedBy: [],
    replaces: ["R-134a (domestic refrigerators)"],
    boilingPoint: "10.9°F", criticalTemp: "273.0°F",
    phaseOut: "Natural refrigerant. A3 — highly flammable. Standard in European and increasingly US domestic refrigerators.",
    a2lNotes: "A3 — HIGHLY FLAMMABLE. Domestic refrigerators only. Very small charge amounts. Do not use standard recovery equipment — requires hydrocarbon-rated equipment.",
    commonUse: "Domestic refrigerators and freezers. Very common in European-made appliances now entering US market.",
    status: "active",
  },
};

const STATUS_CONFIG = {
  active:    { label: "Active",     bg: "#dcfce7", color: "#166534" },
  phasedown: { label: "Phasedown",  bg: "#fef9c3", color: "#854d0e" },
  phaseout:  { label: "Phase-out",  bg: "#fee2e2", color: "#991b1b" },
  new:       { label: "New",        bg: "#dbeafe", color: "#1e40af" },
};

const SAFETY_CONFIG: Record<string, { bg: string; color: string; note: string }> = {
  "A1":  { bg: "#dcfce7", color: "#166534", note: "Non-flammable, low toxicity" },
  "A2L": { bg: "#fef9c3", color: "#854d0e", note: "Mildly flammable, low toxicity — A2L handling required" },
  "A2":  { bg: "#ffedd5", color: "#9a3412", note: "Flammable, low toxicity" },
  "A3":  { bg: "#fee2e2", color: "#991b1b", note: "Highly flammable, low toxicity" },
  "B1":  { bg: "#f3e8ff", color: "#6b21a8", note: "Non-flammable, higher toxicity" },
};

export function RefrigerantReference() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "a1" | "a2l" | "active" | "phasedown">("all");

  const filtered = Object.entries(REFRIGERANTS).filter(([key, r]) => {
    const matchSearch = !search ||
      key.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.commonUse.toLowerCase().includes(search.toLowerCase()) ||
      r.replaces.some(x => x.toLowerCase().includes(search.toLowerCase())) ||
      r.replacedBy.some(x => x.toLowerCase().includes(search.toLowerCase()));

    const matchFilter =
      filter === "all" ||
      (filter === "a1" && r.safetyClass === "A1") ||
      (filter === "a2l" && r.safetyClass === "A2L") ||
      (filter === "active" && r.status === "active") ||
      (filter === "phasedown" && (r.status === "phasedown" || r.status === "phaseout"));

    return matchSearch && matchFilter;
  });

  const selectedData = selected ? REFRIGERANTS[selected] : null;

  return (
    <div>
      {/* A2L warning banner */}
      <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#854d0e", lineHeight: 1.6 }}>
        <strong>⚠️ A2L Transition:</strong> R-454B and R-32 are now required for new residential equipment in the US. All techs servicing new equipment must be familiar with A2L handling requirements. A2L refrigerants are mildly flammable — standard R-410A procedures are not sufficient.
      </div>

      {/* Search */}
      <input value={search} onChange={e => { setSearch(e.target.value); setSelected(null); }}
        placeholder="Search by refrigerant name, use, or replaces..."
        style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", marginBottom: 10, background: "#fafafa" }} />

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 14 }}>
        {[
          { key: "all", label: "All" },
          { key: "a1", label: "A1 — Non-flammable" },
          { key: "a2l", label: "A2L — Mildly flammable" },
          { key: "active", label: "Currently approved" },
          { key: "phasedown", label: "Being phased out" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
            style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === f.key ? "#0f1f3d" : "#e2e8f0"}`, background: filter === f.key ? "#0f1f3d" : "#fff", color: filter === f.key ? "#fff" : "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Refrigerant cards */}
      {!selected && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {filtered.map(([key, r]) => {
            const status = STATUS_CONFIG[r.status];
            const safety = SAFETY_CONFIG[r.safetyClass];
            return (
              <div key={key} onClick={() => setSelected(key)}
                style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLDivElement).style.background = "#f0f9ff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#0f1f3d" }}>{key}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: safety.bg, color: safety.color }}>{r.safetyClass}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: status.bg, color: status.color }}>{status.label}</span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>GWP: {r.gwp}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{r.commonUse}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Oil: {r.oilType}</div>
                  </div>
                  <span style={{ color: "#94a3b8", fontSize: 16 }}>→</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center" as const, padding: 24, color: "#94a3b8", fontSize: 13 }}>No refrigerants found matching your search.</div>
          )}
        </div>
      )}

      {/* Detail view */}
      {selected && selectedData && (
        <div>
          <button onClick={() => setSelected(null)}
            style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
            ← Back to list
          </button>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, flexWrap: "wrap" as const }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f1f3d" }}>{selected}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: SAFETY_CONFIG[selectedData.safetyClass].bg, color: SAFETY_CONFIG[selectedData.safetyClass].color }}>{selectedData.safetyClass} — {SAFETY_CONFIG[selectedData.safetyClass].note}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STATUS_CONFIG[selectedData.status].bg, color: STATUS_CONFIG[selectedData.status].color }}>{STATUS_CONFIG[selectedData.status].label}</span>
            </div>

            {selectedData.a2lNotes && (
              <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderLeft: "4px solid #ca8a04", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#854d0e", marginBottom: 4 }}>⚠️ Flammability Notice</div>
                <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>{selectedData.a2lNotes}</div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 14 }}>
              {[
                { label: "GWP", value: selectedData.gwp.toString() },
                { label: "Safety Class", value: selectedData.safetyClass },
                { label: "Type", value: selectedData.type },
                { label: "Oil Type", value: selectedData.oilType },
                { label: "Boiling Point", value: selectedData.boilingPoint },
                { label: "Critical Temp", value: selectedData.criticalTemp },
              ].map(p => (
                <div key={p.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 3 }}>{p.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{p.value}</div>
                </div>
              ))}
            </div>

            {selectedData.replaces.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>Replaces</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {selectedData.replaces.map(r => (
                    <span key={r} style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#f1f5f9", color: "#374151" }}>{r}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedData.replacedBy.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>Being replaced by</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  {selectedData.replacedBy.map(r => (
                    <button key={r} onClick={() => setSelected(r)}
                      style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#dbeafe", color: "#1d4ed8", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                      {r} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>Common use</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{selectedData.commonUse}</div>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>Phase-out / status</div>
              <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{selectedData.phaseOut}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}