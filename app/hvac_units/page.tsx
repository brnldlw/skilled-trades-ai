"use client";

import React, { useEffect, useMemo, useState } from "react";

type Observation = {
  label: string;
  value: string;
  unit: string;
  note?: string;
};

type Diagnosis = {
  summary?: string;

  likely_causes?: {
    cause: string;
    probability_percent?: number;
    why?: string;
    what_points_to_it?: string[];
    what_rules_it_out?: string[];
  }[];

  field_measurements_to_collect?: {
    measurement: string;
    where?: string;
    how?: string;
    expected_range?: string;
    why_it_matters?: string;
  }[];

  decision_tree?: {
    step: number;
    check: string;
    how?: string;
    pass_condition?: string;
    fail_condition?: string;
    if_pass_next_step?: number;
    if_fail_next_step?: number;
    notes?: string;
  }[];

  parts_to_check?: {
    part: string;
    why_suspect?: string;
    quick_test?: string;
    common_failure_modes?: string[];
    priority?: "High" | "Medium" | "Low" | string;
  }[];

  safety_notes?: string[];
  when_to_escalate?: string[];
};

type Nameplate = {
  manufacturer?: string;
  model?: string;
  serial?: string;
  equipment_type?: string;
  refrigerant?: string;
  voltage?: string;
  phase?: string;
  hz?: string;
  mca?: string;
  mocp?: string;
  rla?: string;
  fla?: string;
  charge?: string;
  notes?: string[];
  confidence?: "High" | "Medium" | "Low" | string;
};

type SavedReport = {
  id: string;
  createdAtISO: string;
  title: string;

  propertyType: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  refrigerantType: string;
  symptom: string;

  nameplateParsed: Nameplate | null;
  observations: Observation[];

  rawResult: string;
  diagnosisParsed: Diagnosis | null;
};

const REPORTS_KEY = "stai_hvac_reports_v1";

/** ---------------- UI helpers ---------------- */

function SectionCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, background: "white" }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>{props.title}</div>
      {props.children}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid #ddd",
        fontSize: 12,
        background: "#f7f7f7",
        marginLeft: 8,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function ProbBar({ pct }: { pct: number }) {
  const safe = Math.max(0, Math.min(100, pct || 0));
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 8, background: "#eee", borderRadius: 999 }}>
        <div style={{ width: `${safe}%`, height: 8, background: "#111", borderRadius: 999 }} />
      </div>
      <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{safe}% confidence</div>
    </div>
  );
}

function ChipButton(props: { text: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #ddd",
        background: props.disabled ? "#f2f2f2" : "#fff",
        fontWeight: 900,
        cursor: props.disabled ? "not-allowed" : "pointer",
      }}
    >
      {props.text}
    </button>
  );
}

function SmallHint({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{children}</div>;
}

/** ---------------- conversions + detection ---------------- */

function toNumber(s: string): number | null {
  const n = Number(String(s).replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function convertToStandard(value: number, unit: string): { value: number; unit: string } | null {
  const u = unit.trim();
  if (u === "kPa") return { value: value * 0.1450377377, unit: "psi" };
  if (u === "bar") return { value: value * 14.50377377, unit: "psi" };
  if (u === "°C") return { value: (value * 9) / 5 + 32, unit: "°F" };
  if (u === "Pa") return { value: value * 0.0040146308, unit: "inWC" };
  return null;
}

function normLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function looksLikePressureLabel(label: string) {
  const s = normLabel(label);
  return s.includes("suction") || s.includes("liquid") || s.includes("discharge") || s.includes("head") || s.includes("pressure");
}
function looksLikeStaticLabel(label: string) {
  const s = normLabel(label);
  return s.includes("static") || s.includes("esp") || s.includes("inwc");
}
function looksLikeTempLabel(label: string) {
  const s = normLabel(label);
  return (
    s.includes("temp") ||
    s.includes("temperature") ||
    s.includes("superheat") ||
    s.includes("subcool") ||
    s.includes("delta") ||
    s.includes("heat rise")
  );
}
function guessDefaultUnit(label: string) {
  if (looksLikePressureLabel(label)) return "psi";
  if (looksLikeStaticLabel(label)) return "inWC";
  if (looksLikeTempLabel(label)) return "°F";
  return "other";
}

/** ---------------- image helpers ---------------- */

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** ---------------- storage helpers ---------------- */

function safeJsonParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function loadReports(): SavedReport[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(REPORTS_KEY) || "";
  const arr = safeJsonParse<SavedReport[]>(raw);
  return Array.isArray(arr) ? arr : [];
}

function saveReports(reports: SavedReport[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/** ---------------- print helper ---------------- */

function escapeHtml(s: string) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openPrintableReport(r: SavedReport) {
  const title = r.title || "HVAC Report";
  const created = new Date(r.createdAtISO).toLocaleString();

  const obsRows = (r.observations || [])
    .map(
      (o) =>
        `<tr><td style="padding:6px;border:1px solid #ddd;"><b>${escapeHtml(o.label)}</b></td><td style="padding:6px;border:1px solid #ddd;">${escapeHtml(
          o.value
        )} ${escapeHtml(o.unit)}${
          o.note ? `<br/><span style="color:#666;font-size:12px;">${escapeHtml(o.note)}</span>` : ""
        }</td></tr>`
    )
    .join("");

  const causes = (r.diagnosisParsed?.likely_causes || [])
    .map((c) => {
      const p = typeof c.probability_percent === "number" ? `${c.probability_percent}%` : "";
      return `<li><b>${escapeHtml(c.cause || "Cause")}</b> ${p ? `(${p})` : ""}${c.why ? ` — ${escapeHtml(c.why)}` : ""}</li>`;
    })
    .join("");

  const np = r.nameplateParsed;
  const row = (k: string, v: any) => {
    const val = v ? String(v) : "—";
    return `<tr><td style="padding:6px;border:1px solid #ddd;width:220px;"><b>${escapeHtml(k)}</b></td><td style="padding:6px;border:1px solid #ddd;">${escapeHtml(
      val
    )}</td></tr>`;
  };

  const nameplateBlock = np
    ? `
      <table style="border-collapse:collapse;width:100%;margin-top:8px;">
        ${row("Manufacturer", np.manufacturer)}
        ${row("Model", np.model)}
        ${row("Serial", np.serial)}
        ${row("Refrigerant", np.refrigerant)}
        ${row("Voltage", np.voltage)}
        ${row("Phase", np.phase)}
        ${row("Hz", np.hz)}
        ${row("MCA", np.mca)}
        ${row("MOCP", np.mocp)}
      </table>
      <div style="margin-top:6px;color:#666;font-size:12px;">Confidence: ${escapeHtml(String(np.confidence || ""))}</div>
    `
    : `<div style="color:#666">No nameplate parsed.</div>`;

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 18px; }
    h1 { margin: 0; }
    .meta { color:#555; margin-top:6px; }
    .card { border:1px solid #ddd; border-radius:12px; padding:12px; margin-top:12px; }
    table { width:100%; border-collapse:collapse; }
    td { vertical-align:top; }
    @media print { .no-print { display:none; } }
  </style>
</head>
<body>
  <div class="no-print" style="display:flex;gap:10px;justify-content:flex-end;">
    <button onclick="window.print()" style="padding:8px 12px;font-weight:bold;">Print / Save PDF</button>
  </div>

  <h1>${escapeHtml(title)}</h1>
  <div class="meta">Created: ${escapeHtml(created)}</div>

  <div class="card">
    <h2 style="margin:0 0 8px 0;font-size:18px;">Job Inputs</h2>
    <table>
      ${row("Property Type", r.propertyType)}
      ${row("Equipment Type", r.equipmentType)}
      ${row("Manufacturer", r.manufacturer)}
      ${row("Model", r.model)}
      ${row("Refrigerant", r.refrigerantType)}
      ${row("Symptom", r.symptom)}
    </table>
  </div>

  <div class="card">
    <h2 style="margin:0 0 8px 0;font-size:18px;">Nameplate</h2>
    ${nameplateBlock}
  </div>

  <div class="card">
    <h2 style="margin:0 0 8px 0;font-size:18px;">Readings</h2>
    ${
      obsRows
        ? `<table style="border-collapse:collapse;width:100%;">${obsRows}</table>`
        : `<div style="color:#666">No readings captured.</div>`
    }
  </div>

  <div class="card">
    <h2 style="margin:0 0 8px 0;font-size:18px;">Diagnosis Summary</h2>
    <div>${escapeHtml(r.diagnosisParsed?.summary || "No summary returned.")}</div>
    <h3 style="margin:12px 0 6px 0;font-size:16px;">Likely Causes</h3>
    ${causes ? `<ol>${causes}</ol>` : `<div style="color:#666">No causes returned.</div>`}
  </div>

  <div class="card">
    <h2 style="margin:0 0 8px 0;font-size:18px;">Raw JSON (debug)</h2>
    <pre style="white-space:pre-wrap;margin:0;">${escapeHtml(r.rawResult || "")}</pre>
  </div>
</body>
</html>
  `.trim();

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/** ---------------- Page ---------------- */

export default function HVACUnitsPage() {
  const [propertyType, setPropertyType] = useState("Commercial");
  const [equipmentType, setEquipmentType] = useState("RTU");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [symptom, setSymptom] = useState("");

  const refrigerantOptions = [
    "Unknown",
    "R-410A",
    "R-22",
    "R-32",
    "R-454B",
    "R-134a",
    "R-407C",
    "R-404A",
    "R-448A",
    "R-449A",
    "R-290 (Propane)",
    "R-600a (Isobutane)",
  ];
  const [refrigerantType, setRefrigerantType] = useState<string>("Unknown");

  const [rawResult, setRawResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Measurements
  const [observations, setObservations] = useState<Observation[]>([]);
  const [obsLabel, setObsLabel] = useState("");
  const [obsValue, setObsValue] = useState("");
  const [obsUnit, setObsUnit] = useState("psi");
  const [obsNote, setObsNote] = useState("");
  const [autoConvert, setAutoConvert] = useState(true);

  // Nameplate capture
  const [nameplatePreview, setNameplatePreview] = useState<string>("");
  const [nameplateParsing, setNameplateParsing] = useState(false);
  const [nameplateRaw, setNameplateRaw] = useState("");
  const [nameplateParsed, setNameplateParsed] = useState<Nameplate | null>(null);

  // Reports
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [reportTitle, setReportTitle] = useState("");

  // Parts + manuals finder
  const [partQuery, setPartQuery] = useState("");
  const [site, setSite] = useState<"All" | "SupplyHouse" | "Johnstone" | "Ferguson" | "Grainger" | "Amazon" | "Google">("All");

  useEffect(() => {
    setReports(loadReports());
  }, []);

  const diagnosisParsed = useMemo(() => {
    if (!rawResult) return null;
    try {
      const start = rawResult.indexOf("{");
      const end = rawResult.lastIndexOf("}");
      const slice = start >= 0 && end > start ? rawResult.slice(start, end + 1) : rawResult;
      return JSON.parse(slice) as Diagnosis;
    } catch {
      return null;
    }
  }, [rawResult]);

  // ---------- robust API helper (avoids "Unexpected end of JSON") ----------
  async function postJson(url: string, payload: any): Promise<{ ok: boolean; resultText: string }> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const txt = await res.text();
    let data: any = null;
    try {
      data = txt ? JSON.parse(txt) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg = data?.result || data?.error || txt || `Server error (${res.status})`;
      return { ok: false, resultText: msg };
    }

    return { ok: true, resultText: data?.result || txt || "" };
  }

  async function handleDiagnose() {
    const m = manufacturer.trim();
    const s = symptom.trim();
    if (!m || !s) {
      setRawResult("Please fill in at least Manufacturer and Symptom.");
      return;
    }

    setLoading(true);
    setRawResult("");

    try {
      const r = await postJson("/api/hvac-diagnose", {
        propertyType,
        equipmentType,
        manufacturer: m,
        model: model.trim(),
        symptom: s,
        refrigerantType,
        observations,
      });
      setRawResult(r.resultText);
    } finally {
      setLoading(false);
    }
  }

  async function updateDiagnosisNow() {
    await handleDiagnose();
  }

  /** ---------------- nameplate (UI only right now; your API endpoint may or may not exist) ---------------- */

  async function onPickNameplate(file: File | null) {
    setNameplateParsed(null);
    setNameplateRaw("");
    if (!file) {
      setNameplatePreview("");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setNameplatePreview(dataUrl);
  }

  async function parseNameplateNow() {
    if (!nameplatePreview) {
      setNameplateRaw("Pick a nameplate photo first.");
      return;
    }
    setNameplateParsing(true);
    setNameplateRaw("");
    setNameplateParsed(null);

    try {
      const r = await postJson("/api/nameplate-parse", { imageDataUrl: nameplatePreview });
      setNameplateRaw(r.resultText);

      if (r.ok) {
        const obj = safeJsonParse<Nameplate>(r.resultText);
        if (obj) setNameplateParsed(obj);
      }
    } finally {
      setNameplateParsing(false);
    }
  }

  function normalizeRefrigerantForDropdown(r: string) {
    const s = (r || "").trim();
    if (!s) return "Unknown";
    const up = s.toUpperCase().replace(/\s+/g, "");
    if (up === "R410A" || up === "R-410A") return "R-410A";
    if (up === "R22" || up === "R-22") return "R-22";
    if (up === "R32" || up === "R-32") return "R-32";
    if (up === "R454B" || up === "R-454B") return "R-454B";
    if (up === "R134A" || up === "R-134A") return "R-134a";
    if (up === "R407C" || up === "R-407C") return "R-407C";
    if (up === "R404A" || up === "R-404A") return "R-404A";
    if (up === "R448A" || up === "R-448A") return "R-448A";
    if (up === "R449A" || up === "R-449A") return "R-449A";
    return "Unknown";
  }

  function applyNameplateToForm() {
    if (!nameplateParsed) return;

    const mfg = (nameplateParsed.manufacturer || "").trim();
    const mdl = (nameplateParsed.model || "").trim();
    const ref = (nameplateParsed.refrigerant || "").trim();

    if (mfg && !manufacturer.trim()) setManufacturer(mfg);
    if (mdl && !model.trim()) setModel(mdl);

    const mapped = normalizeRefrigerantForDropdown(ref);
    if (mapped !== "Unknown") setRefrigerantType(mapped);
  }

  /** ---------------- measurement add/remove ---------------- */

  const unitOptions = ["psi", "kPa", "bar", "°F", "°C", "amps", "volts", "inWC", "Pa", "ohms", "µA", "%", "other"];

  function addMeasurement() {
    const label = obsLabel.trim();
    const rawValue = obsValue.trim();
    const unit = obsUnit.trim();
    if (!label || !rawValue) return;

    const n = toNumber(rawValue);

    let chosenUnit = unit === "other" ? guessDefaultUnit(label) : unit;
    let finalValue = rawValue;
    let finalUnit = chosenUnit;
    let finalNote = (obsNote.trim() || "").trim();

    if (autoConvert && n !== null) {
      const converted = convertToStandard(n, chosenUnit);
      if (converted) {
        const rounded = Math.round(converted.value * 10) / 10;
        finalValue = String(rounded);
        finalUnit = converted.unit;

        const original = `${rawValue} ${chosenUnit}`.trim();
        const convNote = `entered ${original} (converted to ${rounded} ${converted.unit})`;
        finalNote = finalNote ? `${finalNote}; ${convNote}` : convNote;
      }
    }

    setObservations((prev) => [...prev, { label, value: finalValue, unit: finalUnit, note: finalNote || undefined }]);
    setObsValue("");
    setObsNote("");
  }

  function removeObservation(idx: number) {
    setObservations((prev) => prev.filter((_, i) => i !== idx));
  }

  /** ---------------- reports ---------------- */

  function buildDefaultReportTitle() {
    const m = manufacturer.trim() || "Unknown Mfr";
    const mdl = model.trim() || "Unknown Model";
    const et = equipmentType || "Unit";
    return `${m} ${mdl} — ${et}`;
  }

  function saveCurrentReport() {
    if (!rawResult.trim()) {
      alert("Run Diagnose first, then save a report.");
      return;
    }

    const title = (reportTitle.trim() || buildDefaultReportTitle()).slice(0, 80);

    const rep: SavedReport = {
      id: makeId(),
      createdAtISO: new Date().toISOString(),
      title,

      propertyType,
      equipmentType,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      refrigerantType,
      symptom: symptom.trim(),

      nameplateParsed,
      observations,

      rawResult,
      diagnosisParsed,
    };

    const next = [rep, ...reports].slice(0, 50);
    setReports(next);
    saveReports(next);
    setReportTitle("");
  }

  function deleteReport(id: string) {
    const next = reports.filter((r) => r.id !== id);
    setReports(next);
    saveReports(next);
  }

  function loadReportIntoForm(r: SavedReport) {
    setPropertyType(r.propertyType);
    setEquipmentType(r.equipmentType);
    setManufacturer(r.manufacturer || "");
    setModel(r.model || "");
    setRefrigerantType(r.refrigerantType || "Unknown");
    setSymptom(r.symptom || "");
    setNameplateParsed(r.nameplateParsed || null);
    setObservations(r.observations || []);
    setRawResult(r.rawResult || "");
  }

  function downloadReportJson(r: SavedReport) {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hvac-report-${r.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** ---------------- Parts + manuals finder ---------------- */

  const modelKey = useMemo(() => {
    const m = manufacturer.trim();
    const mdl = model.trim();
    const serial = (nameplateParsed?.serial || "").trim();
    const pieces = [m, mdl, serial].filter(Boolean);
    return pieces.join(" ");
  }, [manufacturer, model, nameplateParsed]);

  const suggestedParts = useMemo(() => {
    const arr = diagnosisParsed?.parts_to_check || [];
    return Array.isArray(arr) ? arr.slice(0, 8) : [];
  }, [diagnosisParsed]);

  function openLink(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function q(s: string) {
    return encodeURIComponent(s.trim());
  }

  function buildSearchQuery(extra: string) {
    const base = [manufacturer.trim(), model.trim(), (nameplateParsed?.serial || "").trim()].filter(Boolean).join(" ");
    const symptomShort = symptom.trim().slice(0, 90);
    const parts = [base, extra, symptomShort].filter(Boolean).join(" ");
    return parts.trim();
  }

  function openManualSearch(kind: "manual" | "wiring" | "partslist" | "iro") {
    const suffix =
      kind === "manual"
        ? "service manual"
        : kind === "wiring"
        ? "wiring diagram"
        : kind === "partslist"
        ? "parts list"
        : "installation operation manual";
    const query = buildSearchQuery(suffix) || `${manufacturer} ${model} ${suffix}`;
    openLink(`https://www.google.com/search?q=${q(query)}`);
  }

  function openSupplierSearch(siteChoice: typeof site, item: string) {
    const query = buildSearchQuery(item) || item;
    if (siteChoice === "Google") return openLink(`https://www.google.com/search?q=${q(query)}`);

    if (siteChoice === "SupplyHouse") return openLink(`https://www.supplyhouse.com/sh/control/search/~SEARCH_STRING=${q(query)}`);
    if (siteChoice === "Grainger") return openLink(`https://www.grainger.com/search?searchQuery=${q(query)}`);
    if (siteChoice === "Amazon") return openLink(`https://www.amazon.com/s?k=${q(query)}`);
    if (siteChoice === "Ferguson") return openLink(`https://www.ferguson.com/search?query=${q(query)}`);
    if (siteChoice === "Johnstone") return openLink(`https://www.google.com/search?q=${q(`site:johnstonesupply.com ${query}`)}`);

    // All:
    openLink(`https://www.google.com/search?q=${q(query)}`);
  }

  function openOEMSearch() {
    const query = buildSearchQuery("OEM part number") || `${manufacturer} ${model} OEM parts`;
    openLink(`https://www.google.com/search?q=${q(query)}`);
  }

  function openBulletinsSearch() {
    const query = buildSearchQuery("service bulletin") || `${manufacturer} ${model} service bulletin`;
    openLink(`https://www.google.com/search?q=${q(query)}`);
  }

  /** ---------------- presets ---------------- */

  const coolingPresets = [
    { label: "Suction Pressure", unit: "psi" },
    { label: "Liquid Pressure", unit: "psi" },
    { label: "Suction Line Temp", unit: "°F" },
    { label: "Liquid Line Temp", unit: "°F" },
    { label: "Return Air Temp", unit: "°F" },
    { label: "Supply Air Temp", unit: "°F" },
    { label: "Delta T (Return-Supply)", unit: "°F" },
    { label: "Compressor Amps", unit: "amps" },
    { label: "Line Voltage", unit: "volts" },
    { label: "Control Voltage (R-C)", unit: "volts" },
    { label: "External Static Pressure", unit: "inWC" },
  ];

  return (
    <div style={{ padding: 20, maxWidth: 1180, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Skilled Trades AI — HVAC Diagnose</h1>

      {/* Inputs */}
      <div style={{ marginTop: 14, padding: 14, border: "1px solid #e5e5e5", borderRadius: 12, background: "#fafafa" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 900 }}>Property Type</label>
            <br />
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={{ width: "100%", padding: 8 }}>
              <option>Residential</option>
              <option>Commercial</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>Equipment Type</label>
            <br />
            <select value={equipmentType} onChange={(e) => setEquipmentType(e.target.value)} style={{ width: "100%", padding: 8 }}>
              <option>RTU</option>
              <option>Split System</option>
              <option>Heat Pump</option>
              <option>Furnace</option>
              <option>Mini-Split</option>
              <option>Boiler</option>
              <option>Chiller</option>
              <option>Make-Up Air Unit</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>Manufacturer</label>
            <br />
            <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>Model (optional)</label>
            <br />
            <input value={model} onChange={(e) => setModel(e.target.value)} style={{ width: "100%", padding: 8 }} />
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>Refrigerant Type</label>
            <br />
            <select value={refrigerantType} onChange={(e) => setRefrigerantType(e.target.value)} style={{ width: "100%", padding: 8 }}>
              {refrigerantOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontWeight: 900 }}>Symptom</label>
            <br />
            <textarea value={symptom} onChange={(e) => setSymptom(e.target.value)} style={{ width: "100%", padding: 8, minHeight: 90 }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button onClick={handleDiagnose} disabled={loading} style={{ padding: "10px 14px", fontWeight: 900 }}>
            {loading ? "Diagnosing..." : "Diagnose"}
          </button>
          <button onClick={updateDiagnosisNow} disabled={loading} style={{ padding: "10px 14px", fontWeight: 900 }}>
            {loading ? "Updating..." : "Re-diagnose with readings"}
          </button>
        </div>

        <SmallHint>
          Codespaces reload: just Save the file. If dev server gets stuck: <code>rm -f .next/dev/lock</code> then <code>npm run dev</code>.
        </SmallHint>
      </div>

      {/* Parts + Manuals Finder (NEW) */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Parts + Manuals Finder (one-tap searches)">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Unit key</div>
              <div style={{ marginTop: 6, padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
                <div style={{ fontWeight: 900 }}>{modelKey || "Enter Manufacturer + Model (and Serial if you have it)"}</div>
                <SmallHint>These links use your inputs + symptom to search the exact docs/parts faster.</SmallHint>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <button onClick={() => openManualSearch("manual")} style={{ padding: "10px 14px", fontWeight: 900 }}>
                  Service Manual
                </button>
                <button onClick={() => openManualSearch("wiring")} style={{ padding: "10px 14px", fontWeight: 900 }}>
                  Wiring Diagram
                </button>
                <button onClick={() => openManualSearch("partslist")} style={{ padding: "10px 14px", fontWeight: 900 }}>
                  Parts List
                </button>
                <button onClick={() => openManualSearch("iro")} style={{ padding: "10px 14px", fontWeight: 900 }}>
                  I&O Manual
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <ChipButton text="Search OEM part numbers" onClick={openOEMSearch} />
                <ChipButton text="Search service bulletins" onClick={openBulletinsSearch} />
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 900 }}>Quick part search</div>
              <input
                value={partQuery}
                onChange={(e) => setPartQuery(e.target.value)}
                placeholder="ex: contactor, capacitor 45/5, inducer motor, flame sensor, TXV, economizer actuator..."
                style={{ width: "100%", padding: 8, marginTop: 6 }}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <select value={site} onChange={(e) => setSite(e.target.value as any)} style={{ padding: 8 }}>
                  <option value="All">All (Google)</option>
                  <option value="SupplyHouse">SupplyHouse</option>
                  <option value="Johnstone">Johnstone (via Google)</option>
                  <option value="Ferguson">Ferguson</option>
                  <option value="Grainger">Grainger</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Google">Google</option>
                </select>

                <button
                  onClick={() => openSupplierSearch(site, partQuery || "parts")}
                  style={{ padding: "10px 14px", fontWeight: 900 }}
                  disabled={!manufacturer.trim() && !model.trim() && !partQuery.trim()}
                >
                  Search Parts
                </button>

                <ChipButton text="Search as 'part number'" onClick={() => openSupplierSearch(site, `${partQuery} part number`)} disabled={!partQuery.trim()} />
              </div>

              <SmallHint>
                Tip: type the **exact component** (ex: “contactor 40A 2-pole 24V coil” or “capacitor 45/5”) then click Search Parts.
              </SmallHint>

              {suggestedParts.length ? (
                <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 12 }}>
                  <div style={{ fontWeight: 900 }}>Suggested parts from diagnosis</div>
                  <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                    {suggestedParts.map((p, idx) => (
                      <div key={idx} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                        <div style={{ fontWeight: 900 }}>
                          {p.part} {p.priority ? <Badge text={String(p.priority)} /> : null}
                        </div>
                        {p.why_suspect ? <SmallHint>{p.why_suspect}</SmallHint> : null}
                        {p.quick_test ? <SmallHint>Quick test: {p.quick_test}</SmallHint> : null}

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                          <ChipButton text="Manual search" onClick={() => openLink(`https://www.google.com/search?q=${encodeURIComponent(buildSearchQuery(`${p.part} manual`))}`)} />
                          <ChipButton text="Parts search" onClick={() => openSupplierSearch(site, p.part)} />
                          <ChipButton text="OEM part #" onClick={() => openLink(`https://www.google.com/search?q=${encodeURIComponent(buildSearchQuery(`${p.part} OEM part number`))}`)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <SmallHint style={{}}>
                  After you Diagnose, the model can populate “Parts to check.” If you don’t see it yet, we’ll upgrade the API prompt next so it returns better parts + tests.
                </SmallHint>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Nameplate Capture (optional) */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Nameplate Capture (photo → auto-fill)">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Upload nameplate photo</div>
              <input type="file" accept="image/*" onChange={(e) => onPickNameplate(e.target.files?.[0] ?? null)} style={{ marginTop: 8 }} />
              <SmallHint>Tip: close-up, avoid glare, fill the frame.</SmallHint>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <button onClick={parseNameplateNow} disabled={!nameplatePreview || nameplateParsing} style={{ padding: "10px 14px", fontWeight: 900 }}>
                  {nameplateParsing ? "Parsing..." : "Parse Nameplate"}
                </button>
                <button onClick={applyNameplateToForm} disabled={!nameplateParsed} style={{ padding: "10px 14px", fontWeight: 900 }}>
                  Apply to form
                </button>
              </div>
              <SmallHint>If you don’t have /api/nameplate-parse set up, this section just won’t parse (but it won’t break the app).</SmallHint>
            </div>

            <div>
              <div style={{ fontWeight: 900 }}>Preview</div>
              {nameplatePreview ? (
                <img
                  src={nameplatePreview}
                  alt="nameplate preview"
                  style={{ marginTop: 8, width: "100%", maxHeight: 240, objectFit: "contain", border: "1px solid #eee", borderRadius: 10 }}
                />
              ) : (
                <SmallHint>No image selected.</SmallHint>
              )}
            </div>
          </div>

          {nameplateParsed ? (
            <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 12 }}>
              <div style={{ fontWeight: 900 }}>
                Parsed nameplate <Badge text={String(nameplateParsed.confidence || "Medium")} />
              </div>
              <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><b>Manufacturer:</b> {nameplateParsed.manufacturer || "—"}</div>
                <div><b>Model:</b> {nameplateParsed.model || "—"}</div>
                <div><b>Serial:</b> {nameplateParsed.serial || "—"}</div>
                <div><b>Refrigerant:</b> {nameplateParsed.refrigerant || "—"}</div>
                <div><b>Voltage:</b> {nameplateParsed.voltage || "—"}</div>
                <div><b>Phase/Hz:</b> {(nameplateParsed.phase || "—") + " / " + (nameplateParsed.hz || "—")}</div>
                <div><b>MCA:</b> {nameplateParsed.mca || "—"}</div>
                <div><b>MOCP:</b> {nameplateParsed.mocp || "—"}</div>
              </div>
            </div>
          ) : nameplateRaw ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900 }}>Raw output</div>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{nameplateRaw}</pre>
            </div>
          ) : null}
        </SectionCard>
      </div>

      {/* Reports */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Job Reports (Save • History • Print • Export)">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Report Title (optional)</div>
              <input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. Carrier RTU — No Cool — Building A"
                style={{ width: "100%", padding: 8, marginTop: 6 }}
              />
              <SmallHint>We auto-generate a title if you leave it blank.</SmallHint>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <button onClick={saveCurrentReport} style={{ padding: "10px 14px", fontWeight: 900 }}>
                  Save Report
                </button>
                <ChipButton text="Refresh list" onClick={() => setReports(loadReports())} />
                <ChipButton
                  text="Clear all reports"
                  onClick={() => {
                    if (!confirm("Delete ALL saved reports on this device?")) return;
                    saveReports([]);
                    setReports([]);
                  }}
                  disabled={!reports.length}
                />
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 900 }}>Saved Reports</div>
              {reports.length ? (
                <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                  {reports.slice(0, 8).map((r) => (
                    <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                      <div style={{ fontWeight: 900 }}>
                        {r.title} <Badge text={new Date(r.createdAtISO).toLocaleDateString()} />
                      </div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                        {r.manufacturer || "—"} • {r.model || "—"} • {r.equipmentType || "—"} • {r.refrigerantType || "—"}
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                        <ChipButton text="Load" onClick={() => loadReportIntoForm(r)} />
                        <ChipButton text="Print / PDF" onClick={() => openPrintableReport(r)} />
                        <ChipButton text="Download JSON" onClick={() => downloadReportJson(r)} />
                        <ChipButton text="Delete" onClick={() => deleteReport(r.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint>No reports saved yet. Run Diagnose → Save Report.</SmallHint>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Measurements */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SectionCard title="Quick presets (tap to autofill)">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {coolingPresets.map((p) => (
              <ChipButton
                key={p.label}
                text={p.label}
                onClick={() => {
                  setObsLabel(p.label);
                  setObsUnit(p.unit);
                  setObsValue("");
                  setObsNote("");
                }}
              />
            ))}
          </div>
          <SmallHint>Tap preset → enter number → Add Measurement.</SmallHint>
        </SectionCard>

        <SectionCard title="Add measurement / reading">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontWeight: 900 }}>Label</label>
              <input value={obsLabel} onChange={(e) => setObsLabel(e.target.value)} placeholder="Suction Pressure" style={{ width: "100%", padding: 8 }} />
            </div>

            <div>
              <label style={{ fontWeight: 900 }}>Value</label>
              <input value={obsValue} onChange={(e) => setObsValue(e.target.value)} placeholder="e.g. 118" style={{ width: "100%", padding: 8 }} />
            </div>

            <div>
              <label style={{ fontWeight: 900 }}>Unit</label>
              <select value={obsUnit} onChange={(e) => setObsUnit(e.target.value)} style={{ width: "100%", padding: 8 }}>
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontWeight: 900 }}>Note (optional)</label>
              <input value={obsNote} onChange={(e) => setObsNote(e.target.value)} placeholder="frosted suction line, doors open..." style={{ width: "100%", padding: 8 }} />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={autoConvert} onChange={(e) => setAutoConvert(e.target.checked)} />
                <span style={{ fontWeight: 900 }}>Auto-convert to standard units</span>
              </label>

              <button onClick={addMeasurement} style={{ padding: "10px 14px", fontWeight: 900 }}>
                Add Measurement
              </button>

              <ChipButton text="Clear measurements" onClick={() => setObservations([])} disabled={!observations.length} />
            </div>
          </div>

          {observations.length ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Current readings</div>
              <div style={{ display: "grid", gap: 8 }}>
                {observations.map((o, idx) => (
                  <div key={idx} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>
                        {o.label} <Badge text={o.unit} />
                      </div>
                      <div style={{ marginTop: 2 }}>
                        {o.value} {o.unit}
                      </div>
                      {o.note ? <SmallHint>{o.note}</SmallHint> : null}
                    </div>
                    <button onClick={() => removeObservation(idx)} style={{ padding: "8px 10px", fontWeight: 900 }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <SmallHint>No measurements yet — add 2–4 key readings and hit “Re-diagnose with readings”.</SmallHint>
          )}
        </SectionCard>
      </div>

      {/* Results */}
      <div style={{ marginTop: 16 }}>
        {diagnosisParsed ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SectionCard title="Summary">
              <div style={{ fontSize: 14, lineHeight: 1.4 }}>{diagnosisParsed.summary || "No summary returned."}</div>
            </SectionCard>

            <SectionCard title="Likely causes">
              {diagnosisParsed.likely_causes?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {diagnosisParsed.likely_causes.map((c, idx) => (
                    <div key={idx} style={{ borderTop: idx ? "1px solid #eee" : "none", paddingTop: idx ? 10 : 0 }}>
                      <div style={{ fontWeight: 900 }}>
                        {c.cause || "Cause"}
                        {typeof c.probability_percent === "number" ? <Badge text={`${c.probability_percent}%`} /> : null}
                      </div>
                      {typeof c.probability_percent === "number" ? <ProbBar pct={c.probability_percent} /> : null}
                      {c.why ? <div style={{ marginTop: 6, color: "#444" }}>{c.why}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#666" }}>No likely causes returned.</div>
              )}
            </SectionCard>

            <SectionCard title="Raw output (debug)">
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{rawResult || "No results yet."}</pre>
            </SectionCard>
          </div>
        ) : (
          <SectionCard title="Raw output">
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{rawResult || "No results yet."}</pre>
          </SectionCard>
        )}
      </div>
    </div>
  );
}