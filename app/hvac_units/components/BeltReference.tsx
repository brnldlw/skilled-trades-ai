"use client";

import React, { useState } from "react";

// ── Belt section dimensions ───────────────────────────────────
const BELT_SECTIONS: Record<string, { topWidth: string; thickness: string; angle: string; note: string }> = {
  "3L": { topWidth: "3/8\"", thickness: "7/32\"", angle: "40°", note: "Light duty fractional" },
  "4L": { topWidth: "1/2\"", thickness: "5/16\"", angle: "40°", note: "Fractional horsepower — most common residential AHU" },
  "5L": { topWidth: "21/32\"", thickness: "3/8\"", angle: "40°", note: "Fractional horsepower — light commercial" },
  "A":  { topWidth: "1/2\"", thickness: "5/16\"", angle: "40°", note: "Classical V-belt — heavy duty equivalent to 4L" },
  "B":  { topWidth: "21/32\"", thickness: "13/32\"", angle: "40°", note: "Classical V-belt — light commercial AHUs" },
  "C":  { topWidth: "7/8\"", thickness: "17/32\"", angle: "40°", note: "Classical V-belt — commercial and industrial" },
  "D":  { topWidth: "1-1/4\"", thickness: "3/4\"", angle: "40°", note: "Heavy commercial / industrial" },
  "3V": { topWidth: "3/8\"", thickness: "5/16\"", angle: "60°", note: "Wedge belt — high horsepower, narrow" },
  "5V": { topWidth: "5/8\"", thickness: "17/32\"", angle: "60°", note: "Wedge belt — commercial AHU and blowers" },
  "8V": { topWidth: "1\"", thickness: "29/32\"", angle: "60°", note: "Wedge belt — heavy industrial" },
};

// ── Common belt cross-reference data ─────────────────────────
// Format: OEM number → { section, ocLength (outside circumference in inches), crossRefs }
type BeltData = {
  section: string;
  oc: number; // outside circumference in inches
  gates: string;
  dayco: string;
  browning: string;
  description: string;
};

// Cross-reference table: common HVAC/R belt numbers
const BELT_DATABASE: Record<string, BeltData> = {
  // 4L series (most common residential)
  "4L250": { section: "4L", oc: 25.0, gates: "6843", dayco: "15250", browning: "4L250", description: "4L × 25\" OC" },
  "4L260": { section: "4L", oc: 26.0, gates: "6844", dayco: "15260", browning: "4L260", description: "4L × 26\" OC" },
  "4L270": { section: "4L", oc: 27.0, gates: "6845", dayco: "15270", browning: "4L270", description: "4L × 27\" OC" },
  "4L280": { section: "4L", oc: 28.0, gates: "6846", dayco: "15280", browning: "4L280", description: "4L × 28\" OC" },
  "4L290": { section: "4L", oc: 29.0, gates: "6847", dayco: "15290", browning: "4L290", description: "4L × 29\" OC" },
  "4L300": { section: "4L", oc: 30.0, gates: "6848", dayco: "15300", browning: "4L300", description: "4L × 30\" OC" },
  "4L310": { section: "4L", oc: 31.0, gates: "6849", dayco: "15310", browning: "4L310", description: "4L × 31\" OC" },
  "4L320": { section: "4L", oc: 32.0, gates: "6850", dayco: "15320", browning: "4L320", description: "4L × 32\" OC" },
  "4L330": { section: "4L", oc: 33.0, gates: "6851", dayco: "15330", browning: "4L330", description: "4L × 33\" OC" },
  "4L340": { section: "4L", oc: 34.0, gates: "6852", dayco: "15340", browning: "4L340", description: "4L × 34\" OC" },
  "4L350": { section: "4L", oc: 35.0, gates: "6853", dayco: "15350", browning: "4L350", description: "4L × 35\" OC" },
  "4L360": { section: "4L", oc: 36.0, gates: "6854", dayco: "15360", browning: "4L360", description: "4L × 36\" OC" },
  "4L370": { section: "4L", oc: 37.0, gates: "6855", dayco: "15370", browning: "4L370", description: "4L × 37\" OC" },
  "4L380": { section: "4L", oc: 38.0, gates: "6856", dayco: "15380", browning: "4L380", description: "4L × 38\" OC" },
  "4L390": { section: "4L", oc: 39.0, gates: "6857", dayco: "15390", browning: "4L390", description: "4L × 39\" OC" },
  "4L400": { section: "4L", oc: 40.0, gates: "6858", dayco: "15400", browning: "4L400", description: "4L × 40\" OC" },
  "4L410": { section: "4L", oc: 41.0, gates: "6859", dayco: "15410", browning: "4L410", description: "4L × 41\" OC" },
  "4L420": { section: "4L", oc: 42.0, gates: "6860", dayco: "15420", browning: "4L420", description: "4L × 42\" OC" },
  "4L430": { section: "4L", oc: 43.0, gates: "6861", dayco: "15430", browning: "4L430", description: "4L × 43\" OC" },
  "4L440": { section: "4L", oc: 44.0, gates: "6862", dayco: "15440", browning: "4L440", description: "4L × 44\" OC" },
  "4L450": { section: "4L", oc: 45.0, gates: "6863", dayco: "15450", browning: "4L450", description: "4L × 45\" OC" },
  "4L460": { section: "4L", oc: 46.0, gates: "6864", dayco: "15460", browning: "4L460", description: "4L × 46\" OC" },
  "4L470": { section: "4L", oc: 47.0, gates: "6865", dayco: "15470", browning: "4L470", description: "4L × 47\" OC" },
  "4L480": { section: "4L", oc: 48.0, gates: "6866", dayco: "15480", browning: "4L480", description: "4L × 48\" OC" },
  "4L490": { section: "4L", oc: 49.0, gates: "6867", dayco: "15490", browning: "4L490", description: "4L × 49\" OC" },
  "4L500": { section: "4L", oc: 50.0, gates: "6868", dayco: "15500", browning: "4L500", description: "4L × 50\" OC" },
  // A series
  "A26": { section: "A", oc: 28.0, gates: "6726", dayco: "11A260", browning: "A26", description: "A × 26\" effective (28\" OC)" },
  "A27": { section: "A", oc: 29.0, gates: "6727", dayco: "11A270", browning: "A27", description: "A × 27\" effective (29\" OC)" },
  "A28": { section: "A", oc: 30.0, gates: "6728", dayco: "11A280", browning: "A28", description: "A × 28\" effective (30\" OC)" },
  "A29": { section: "A", oc: 31.0, gates: "6729", dayco: "11A290", browning: "A29", description: "A × 29\" effective (31\" OC)" },
  "A30": { section: "A", oc: 32.0, gates: "6730", dayco: "11A300", browning: "A30", description: "A × 30\" effective (32\" OC)" },
  "A31": { section: "A", oc: 33.0, gates: "6731", dayco: "11A310", browning: "A31", description: "A × 31\" effective (33\" OC)" },
  "A32": { section: "A", oc: 34.0, gates: "6732", dayco: "11A320", browning: "A32", description: "A × 32\" effective (34\" OC)" },
  "A33": { section: "A", oc: 35.0, gates: "6733", dayco: "11A330", browning: "A33", description: "A × 33\" effective (35\" OC)" },
  "A34": { section: "A", oc: 36.0, gates: "6734", dayco: "11A340", browning: "A34", description: "A × 34\" effective (36\" OC)" },
  "A35": { section: "A", oc: 37.0, gates: "6735", dayco: "11A350", browning: "A35", description: "A × 35\" effective (37\" OC)" },
  "A36": { section: "A", oc: 38.0, gates: "6736", dayco: "11A360", browning: "A36", description: "A × 36\" effective (38\" OC)" },
  "A37": { section: "A", oc: 39.0, gates: "6737", dayco: "11A370", browning: "A37", description: "A × 37\" effective (39\" OC)" },
  "A38": { section: "A", oc: 40.0, gates: "6738", dayco: "11A380", browning: "A38", description: "A × 38\" effective (40\" OC)" },
  "A40": { section: "A", oc: 42.0, gates: "6740", dayco: "11A400", browning: "A40", description: "A × 40\" effective (42\" OC)" },
  "A42": { section: "A", oc: 44.0, gates: "6742", dayco: "11A420", browning: "A42", description: "A × 42\" effective (44\" OC)" },
  "A44": { section: "A", oc: 46.0, gates: "6744", dayco: "11A440", browning: "A44", description: "A × 44\" effective (46\" OC)" },
  "A46": { section: "A", oc: 48.0, gates: "6746", dayco: "11A460", browning: "A46", description: "A × 46\" effective (48\" OC)" },
  "A48": { section: "A", oc: 50.0, gates: "6748", dayco: "11A480", browning: "A48", description: "A × 48\" effective (50\" OC)" },
  // B series
  "B34": { section: "B", oc: 37.0, gates: "6634", dayco: "12B340", browning: "B34", description: "B × 34\" effective (37\" OC)" },
  "B35": { section: "B", oc: 38.0, gates: "6635", dayco: "12B350", browning: "B35", description: "B × 35\" effective (38\" OC)" },
  "B36": { section: "B", oc: 39.0, gates: "6636", dayco: "12B360", browning: "B36", description: "B × 36\" effective (39\" OC)" },
  "B38": { section: "B", oc: 41.0, gates: "6638", dayco: "12B380", browning: "B38", description: "B × 38\" effective (41\" OC)" },
  "B40": { section: "B", oc: 43.0, gates: "6640", dayco: "12B400", browning: "B40", description: "B × 40\" effective (43\" OC)" },
  "B42": { section: "B", oc: 45.0, gates: "6642", dayco: "12B420", browning: "B42", description: "B × 42\" effective (45\" OC)" },
  "B44": { section: "B", oc: 47.0, gates: "6644", dayco: "12B440", browning: "B44", description: "B × 44\" effective (47\" OC)" },
  "B46": { section: "B", oc: 49.0, gates: "6646", dayco: "12B460", browning: "B46", description: "B × 46\" effective (49\" OC)" },
  "B48": { section: "B", oc: 51.0, gates: "6648", dayco: "12B480", browning: "B48", description: "B × 48\" effective (51\" OC)" },
  "B50": { section: "B", oc: 53.0, gates: "6650", dayco: "12B500", browning: "B50", description: "B × 50\" effective (53\" OC)" },
  "B52": { section: "B", oc: 55.0, gates: "6652", dayco: "12B520", browning: "B52", description: "B × 52\" effective (55\" OC)" },
  "B55": { section: "B", oc: 58.0, gates: "6655", dayco: "12B550", browning: "B55", description: "B × 55\" effective (58\" OC)" },
  "B60": { section: "B", oc: 63.0, gates: "6660", dayco: "12B600", browning: "B60", description: "B × 60\" effective (63\" OC)" },
  "B65": { section: "B", oc: 68.0, gates: "6665", dayco: "12B650", browning: "B65", description: "B × 65\" effective (68\" OC)" },
  "B68": { section: "B", oc: 71.0, gates: "6668", dayco: "12B680", browning: "B68", description: "B × 68\" effective (71\" OC)" },
  "B70": { section: "B", oc: 73.0, gates: "6670", dayco: "12B700", browning: "B70", description: "B × 70\" effective (73\" OC)" },
  // 5V series
  "5V500": { section: "5V", oc: 50.0, gates: "9500", dayco: "5V500", browning: "5V500", description: "5V × 50\" OC" },
  "5V530": { section: "5V", oc: 53.0, gates: "9530", dayco: "5V530", browning: "5V530", description: "5V × 53\" OC" },
  "5V560": { section: "5V", oc: 56.0, gates: "9560", dayco: "5V560", browning: "5V560", description: "5V × 56\" OC" },
  "5V600": { section: "5V", oc: 60.0, gates: "9600", dayco: "5V600", browning: "5V600", description: "5V × 60\" OC" },
  "5V630": { section: "5V", oc: 63.0, gates: "9630", dayco: "5V630", browning: "5V630", description: "5V × 63\" OC" },
  "5V670": { section: "5V", oc: 67.0, gates: "9670", dayco: "5V670", browning: "5V670", description: "5V × 67\" OC" },
  "5V710": { section: "5V", oc: 71.0, gates: "9710", dayco: "5V710", browning: "5V710", description: "5V × 71\" OC" },
  "5V750": { section: "5V", oc: 75.0, gates: "9750", dayco: "5V750", browning: "5V750", description: "5V × 75\" OC" },
  "5V800": { section: "5V", oc: 80.0, gates: "9800", dayco: "5V800", browning: "5V800", description: "5V × 80\" OC" },
  "5V850": { section: "5V", oc: 85.0, gates: "9850", dayco: "5V850", browning: "5V850", description: "5V × 85\" OC" },
  "5V900": { section: "5V", oc: 90.0, gates: "9900", dayco: "5V900", browning: "5V900", description: "5V × 90\" OC" },
};

function searchBelts(query: string): { number: string; data: BeltData }[] {
  const q = query.toUpperCase().trim();
  if (!q) return [];

  const results: { number: string; data: BeltData }[] = [];

  for (const [num, data] of Object.entries(BELT_DATABASE)) {
    if (
      num.includes(q) ||
      data.gates.includes(q) ||
      data.dayco.toUpperCase().includes(q) ||
      data.browning.toUpperCase().includes(q) ||
      data.section === q
    ) {
      results.push({ number: num, data });
    }
  }

  return results.slice(0, 20);
}

function searchByDimensions(section: string, length: number): { number: string; data: BeltData }[] {
  if (!section || !length) return [];
  const tolerance = 1.0; // ±1 inch
  return Object.entries(BELT_DATABASE)
    .filter(([, d]) => d.section === section && Math.abs(d.oc - length) <= tolerance)
    .sort((a, b) => Math.abs(a[1].oc - length) - Math.abs(b[1].oc - length))
    .slice(0, 10)
    .map(([number, data]) => ({ number, data }));
}

function openSupplierSearch(query: string) {
  const url = `https://www.johnstonesupply.com/search?q=${encodeURIComponent(query + " V-belt")}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

type ResultCardProps = { number: string; data: BeltData };

function ResultCard({ number, data }: ResultCardProps) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d" }}>{number}</span>
          <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>{data.description}</span>
        </div>
        <button
          onClick={() => openSupplierSearch(number)}
          style={{ padding: "5px 12px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
        >
          Find it →
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {[
          { label: "Gates", value: data.gates },
          { label: "Dayco", value: data.dayco },
          { label: "Browning", value: data.browning },
        ].map(s => (
          <div key={s.label} style={{ background: "#f8fafc", borderRadius: 6, padding: "6px 10px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginTop: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#64748b" }}>
        Section: <strong>{data.section}</strong> · OC: <strong>{data.oc}"</strong> · {BELT_SECTIONS[data.section]?.note || ""}
      </div>
    </div>
  );
}

export function BeltReference() {
  const [mode, setMode] = useState<"number" | "dimensions">("number");
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("4L");
  const [length, setLength] = useState("");
  const [results, setResults] = useState<{ number: string; data: BeltData }[]>([]);
  const [searched, setSearched] = useState(false);

  function handleNumberSearch() {
    if (!query.trim()) return;
    const r = searchBelts(query);
    setResults(r);
    setSearched(true);
  }

  function handleDimSearch() {
    if (!section || !length) return;
    const r = searchByDimensions(section, parseFloat(length));
    setResults(r);
    setSearched(true);
  }

  return (
    <div>
      {/* How to measure tip */}
      <div style={{ background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#1d4ed8", lineHeight: 1.6 }}>
        <strong>📏 How to measure a belt:</strong> Wrap a string around the outside of the belt and measure — that's the Outside Circumference (OC). Or read the part number stamped on the old belt — the last 3 digits of a 4L or 5V belt are the OC in tenths (4L350 = 35.0" OC).
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 14 }}>
        {[
          { key: "number", label: "🔢 Search by Part Number" },
          { key: "dimensions", label: "📐 Search by Dimensions" },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key as "number" | "dimensions"); setResults([]); setSearched(false); }}
            style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: mode === m.key ? "#fff" : "transparent", color: mode === m.key ? "#0f1f3d" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: mode === m.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Search by number */}
      {mode === "number" && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
            Enter belt number, Gates number, Dayco number, or Browning number
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleNumberSearch()}
              placeholder="e.g. 4L350, A35, B42, 5V600..."
              style={{ flex: 1, padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fafafa" }}
            />
            <button
              onClick={handleNumberSearch}
              style={{ padding: "10px 18px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
            >
              Search
            </button>
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Common sections:</span>
            {Object.keys(BELT_SECTIONS).map(s => (
              <button key={s} onClick={() => { setQuery(s); }}
                style={{ padding: "3px 10px", borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search by dimensions */}
      {mode === "dimensions" && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Belt Section</label>
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fafafa" }}
              >
                {Object.entries(BELT_SECTIONS).map(([s, info]) => (
                  <option key={s} value={s}>{s} — {info.topWidth} wide · {info.note}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                Outside Circumference (inches)
              </label>
              <input
                value={length}
                onChange={e => setLength(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleDimSearch()}
                placeholder="e.g. 35.0"
                type="number"
                step="0.5"
                min="10"
                max="200"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fafafa" }}
              />
            </div>
          </div>
          <button
            onClick={handleDimSearch}
            style={{ marginTop: 12, padding: "10px 24px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
          >
            Find Belts
          </button>

          {/* Section reference */}
          <div style={{ marginTop: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 8 }}>Belt section reference</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 6 }}>
              {Object.entries(BELT_SECTIONS).map(([s, info]) => (
                <div key={s} style={{ background: section === s ? "#dbeafe" : "#fff", border: `1px solid ${section === s ? "#93c5fd" : "#e2e8f0"}`, borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}
                  onClick={() => setSection(s)}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{s}</div>
                  <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>{info.topWidth} wide · {info.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
            {results.length > 0 ? `${results.length} result${results.length !== 1 ? "s" : ""} found` : "No matches found"}
          </div>
          {results.length === 0 && (
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 10, fontSize: 13, color: "#94a3b8", textAlign: "center" as const }}>
              <div style={{ marginBottom: 8 }}>No exact match in database.</div>
              <button
                onClick={() => openSupplierSearch(query || `${section} ${length}`)}
                style={{ padding: "8px 16px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
              >
                Search Johnstone Supply →
              </button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {results.map(r => <ResultCard key={r.number} number={r.number} data={r.data} />)}
          </div>
        </div>
      )}

      {!searched && (
        <div style={{ padding: "20px 0", textAlign: "center" as const, color: "#94a3b8", fontSize: 13 }}>
          Search by part number to find cross-references, or enter belt dimensions to find all matching belt numbers.
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
        Cross-reference data covers common HVAC/R AHU belts. Always verify against manufacturer specs before ordering.
        Gates, Dayco, and Browning numbers are for reference — confirm availability with your supplier.
      </div>
    </div>
  );
}