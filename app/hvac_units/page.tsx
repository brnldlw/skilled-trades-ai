"use client";

import React, { useMemo, useRef, useState } from "react";

type Observation = { label: string; value: string; unit: string; note?: string };

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

type NameplateResult = {
  manufacturer: string | null;
  model: string | null;
  serial: string | null;
  equipment_type: string | null;
  refrigerant: string | null;
  voltage: string | null;
  phase: string | null;
  hz: string | null;
  mca: string | null;
  mop: string | null;
  rla: string | null;
  fla: string | null;
  tonnage: string | null;
  heat_type: string | null;
  gas_type: string | null;
  notes: string;
  confidence: "high" | "medium" | "low";
};

type LinkItem = { title: string; url: string; note?: string };

type ManualsParts = {
  summary: string;
  suggested_search_terms: string[];
  manuals: LinkItem[];
  parts: LinkItem[];
  probable_parts_to_check: { part: string; why: string }[];
};

/** ---------- UI ---------- */

function SectionCard(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>{props.title}</div>
        {props.right ? <div>{props.right}</div> : null}
      </div>
      <div style={{ marginTop: 10 }}>{props.children}</div>
    </div>
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

function SmallHint(props: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.35, ...props.style }}>
      {props.children}
    </div>
  );
}

function PillButton(props: { text: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid #ddd",
        background: props.disabled ? "#f5f5f5" : "#fff",
        fontWeight: 900,
        cursor: props.disabled ? "not-allowed" : "pointer",
      }}
    >
      {props.text}
    </button>
  );
}

/** ---------- Helpers ---------- */

async function safeJson(res: Response) {
  // Fixes: "Unexpected end of JSON input"
  const txt = await res.text();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return { result: txt };
  }
}

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

function looksLikePressureLabel(label: string) {
  const s = label.toLowerCase();
  return s.includes("suction") || s.includes("liquid") || s.includes("discharge") || s.includes("head") || s.includes("pressure");
}
function looksLikeStaticLabel(label: string) {
  const s = label.toLowerCase();
  return s.includes("static") || s.includes("esp") || s.includes("inwc");
}
function looksLikeTempLabel(label: string) {
  const s = label.toLowerCase();
  return s.includes("temp") || s.includes("temperature") || s.includes("superheat") || s.includes("subcool") || s.includes("delta") || s.includes("heat rise");
}
function guessDefaultUnit(label: string) {
  if (looksLikePressureLabel(label)) return "psi";
  if (looksLikeStaticLabel(label)) return "inWC";
  if (looksLikeTempLabel(label)) return "°F";
  return "other";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
}

/** ---------- Page ---------- */

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

  // Nameplate
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [nameplateImage, setNameplateImage] = useState<string>("");
  const [nameplate, setNameplate] = useState<NameplateResult | null>(null);
  const [nameplateBusy, setNameplateBusy] = useState(false);
  const [nameplateErr, setNameplateErr] = useState("");

  // Manuals/Parts
  const [mpBusy, setMpBusy] = useState(false);
  const [mpErr, setMpErr] = useState("");
  const [manualsParts, setManualsParts] = useState<ManualsParts | null>(null);

  const parsed = useMemo(() => {
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

  const measurementOptions = parsed?.field_measurements_to_collect?.map((m) => m.measurement) || [];
  const unitOptions = ["psi", "kPa", "bar", "°F", "°C", "amps", "volts", "inWC", "Pa", "ohms", "µA", "%", "other"];

  const coolingPresets = [
    { label: "Suction Pressure", unit: "psi" },
    { label: "Liquid Pressure", unit: "psi" },
    { label: "Superheat", unit: "°F" },
    { label: "Subcool", unit: "°F" },
    { label: "Return Air Temp", unit: "°F" },
    { label: "Supply Air Temp", unit: "°F" },
    { label: "Delta T (Return-Supply)", unit: "°F" },
    { label: "Compressor Amps", unit: "amps" },
    { label: "Line Voltage", unit: "volts" },
    { label: "Control Voltage (R-C)", unit: "volts" },
    { label: "External Static Pressure", unit: "inWC" },
  ];

  const heatingPresets = [
    { label: "Gas Inlet Pressure", unit: "inWC" },
    { label: "Manifold Pressure", unit: "inWC" },
    { label: "Heat Rise", unit: "°F" },
    { label: "Inducer Amps", unit: "amps" },
    { label: "Flame Sensor", unit: "µA" },
    { label: "Limit Switch Continuity", unit: "ohms" },
    { label: "Line Voltage", unit: "volts" },
    { label: "Control Voltage (R-W)", unit: "volts" },
  ];

  function applyPreset(label: string, unit: string) {
    setObsLabel(label);
    setObsUnit(unit);
    setObsValue("");
    setObsNote("");
  }

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

  async function postDiagnose(payload: any) {
    const res = await fetch("/api/hvac-diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await safeJson(res);

    if (!res.ok) {
      setRawResult(data?.result || data?.error || `Server error (${res.status})`);
      return;
    }
    setRawResult(data?.result || "No result returned.");
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
      await postDiagnose({
        propertyType,
        equipmentType,
        manufacturer: m,
        model: model.trim(),
        symptom: s,
        refrigerantType,
        observations,
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateDiagnosisNow() {
    const m = manufacturer.trim();
    const s = symptom.trim();
    if (!m || !s) {
      setRawResult("Please fill in at least Manufacturer and Symptom.");
      return;
    }

    setLoading(true);
    try {
      await postDiagnose({
        propertyType,
        equipmentType,
        manufacturer: m,
        model: model.trim(),
        symptom: s,
        refrigerantType,
        observations,
      });
    } finally {
      setLoading(false);
    }
  }

  async function onPickNameplateFile(file: File) {
    setNameplateErr("");
    setNameplate(null);
    const dataUrl = await readFileAsDataUrl(file);
    setNameplateImage(dataUrl);
  }

  async function parseNameplate() {
    if (!nameplateImage) return;
    setNameplateBusy(true);
    setNameplateErr("");
    try {
      const res = await fetch("/api/nameplate-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: nameplateImage, equipmentType }),
      });
      const data = await safeJson(res);
      if (!res.ok || !data?.ok) {
        setNameplateErr(data?.error || `Server error (${res.status})`);
        return;
      }
      const np = data.data as NameplateResult;
      setNameplate(np);

      // Auto-fill fields if present
      if (np.manufacturer && !manufacturer.trim()) setManufacturer(np.manufacturer);
      if (np.model && !model.trim()) setModel(np.model);
      if (np.equipment_type && equipmentType === "RTU") setEquipmentType(np.equipment_type);
      if (np.refrigerant && refrigerantType === "Unknown") setRefrigerantType(np.refrigerant);
    } finally {
      setNameplateBusy(false);
    }
  }

  async function findManualsParts() {
    setMpBusy(true);
    setMpErr("");
    setManualsParts(null);
    try {
      const res = await fetch("/api/manuals-parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manufacturer: manufacturer.trim(),
          model: model.trim(),
          equipmentType,
          symptom: symptom.trim(),
          serial: nameplate?.serial || "",
        }),
      });
      const data = await safeJson(res);
      if (!res.ok || !data?.ok) {
        setMpErr(data?.error || `Server error (${res.status})`);
        return;
      }
      setManualsParts(data.data as ManualsParts);
    } finally {
      setMpBusy(false);
    }
  }

  function openPrintableReport() {
    const diag = parsed;
    const now = new Date().toLocaleString();

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HVAC Service Report</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; }
    h1 { margin: 0 0 6px 0; }
    .muted { color: #444; font-size: 12px; }
    .box { border: 1px solid #ddd; border-radius: 10px; padding: 12px; margin-top: 12px; }
    .row { display:flex; gap: 16px; flex-wrap: wrap; }
    .kv { min-width: 220px; }
    ul { margin: 6px 0 0 18px; }
    ol { margin: 6px 0 0 18px; }
    .tag { display:inline-block; border:1px solid #ddd; border-radius:999px; padding:2px 8px; font-size: 12px; margin-left: 8px; }
  </style>
</head>
<body>
  <h1>Skilled Trades AI — HVAC Service Report</h1>
  <div class="muted">Generated: ${now}</div>

  <div class="box">
    <div class="row">
      <div class="kv"><b>Property Type:</b> ${propertyType}</div>
      <div class="kv"><b>Equipment Type:</b> ${equipmentType}</div>
      <div class="kv"><b>Manufacturer:</b> ${manufacturer || "-"}</div>
      <div class="kv"><b>Model:</b> ${model || "-"}</div>
      <div class="kv"><b>Refrigerant:</b> ${refrigerantType || "-"}</div>
    </div>
    <div style="margin-top:10px;"><b>Symptom:</b> ${symptom || "-"}</div>
  </div>

  <div class="box">
    <b>Measurements / Observations</b>
    ${observations.length ? `<ul>${observations
      .map((o) => `<li><b>${o.label}:</b> ${o.value} ${o.unit}${o.note ? ` <span class="muted">(${o.note})</span>` : ""}</li>`)
      .join("")}</ul>` : `<div class="muted">None recorded.</div>`}
  </div>

  <div class="box">
    <b>Diagnosis Summary</b>
    <div style="margin-top:6px;">${diag?.summary ? diag.summary : "No summary yet (run Diagnose)."} </div>
  </div>

  <div class="box">
    <b>Likely Causes</b>
    ${
      diag?.likely_causes?.length
        ? `<ol>${diag.likely_causes
            .map((c) => `<li><b>${c.cause}</b> ${typeof c.probability_percent === "number" ? `<span class="tag">${c.probability_percent}%</span>` : ""}<div class="muted">${c.why || ""}</div></li>`)
            .join("")}</ol>`
        : `<div class="muted">No causes yet.</div>`
    }
  </div>

  <div class="box">
    <b>Decision Tree</b>
    ${
      diag?.decision_tree?.length
        ? `<ol>${diag.decision_tree
            .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
            .map((s) => `<li><b>${s.check}</b><div class="muted">${s.how || ""}</div></li>`)
            .join("")}</ol>`
        : `<div class="muted">No steps yet.</div>`
    }
  </div>

  <div class="box">
    <b>Parts to Check</b>
    ${
      diag?.parts_to_check?.length
        ? `<ul>${diag.parts_to_check
            .map((p) => `<li><b>${p.part}</b> ${p.priority ? `<span class="tag">${p.priority}</span>` : ""}<div class="muted">${p.why_suspect || ""}</div></li>`)
            .join("")}</ul>`
        : `<div class="muted">No parts yet.</div>`
    }
  </div>

  <div class="muted" style="margin-top:18px;">Print this page and choose “Save as PDF” to store it.</div>

  <script>window.print();</script>
</body>
</html>
`.trim();

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

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
            Update diagnosis (with measurements)
          </button>

          <button onClick={openPrintableReport} disabled={!parsed} style={{ padding: "10px 14px", fontWeight: 900 }}>
            Print / Save Report (PDF)
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Nameplate */}
        <SectionCard
          title="Nameplate Photo Reader"
          right={
            <PillButton
              text="Choose photo"
              onClick={() => fileInputRef.current?.click()}
            />
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await onPickNameplateFile(f);
            }}
          />

          {nameplateImage ? (
            <div style={{ display: "grid", gap: 10 }}>
              <img src={nameplateImage} alt="Nameplate" style={{ width: "100%", maxHeight: 260, objectFit: "contain", border: "1px solid #eee", borderRadius: 10 }} />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <PillButton text={nameplateBusy ? "Reading..." : "Read nameplate"} onClick={parseNameplate} disabled={nameplateBusy} />
                <PillButton text="Clear" onClick={() => { setNameplateImage(""); setNameplate(null); setNameplateErr(""); }} />
              </div>

              {nameplateErr ? <div style={{ color: "crimson", fontWeight: 800 }}>{nameplateErr}</div> : null}

              {nameplate ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <SmallHint>
                    Confidence: <b>{nameplate.confidence}</b> — {nameplate.notes}
                  </SmallHint>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div><b>Manufacturer:</b> {nameplate.manufacturer ?? "-"}</div>
                    <div><b>Model:</b> {nameplate.model ?? "-"}</div>
                    <div><b>Serial:</b> {nameplate.serial ?? "-"}</div>
                    <div><b>Refrigerant:</b> {nameplate.refrigerant ?? "-"}</div>
                    <div><b>Voltage:</b> {nameplate.voltage ?? "-"}</div>
                    <div><b>Phase/Hz:</b> {(nameplate.phase ?? "-") + " / " + (nameplate.hz ?? "-")}</div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <SmallHint>
              Upload a clear photo of the equipment nameplate. We’ll extract manufacturer/model/serial/refrigerant and auto-fill the form.
            </SmallHint>
          )}
        </SectionCard>

        {/* Manuals & Parts */}
        <SectionCard
          title="Manuals + Parts Finder"
          right={<PillButton text={mpBusy ? "Searching..." : "Find manuals & parts"} onClick={findManualsParts} disabled={mpBusy || !manufacturer.trim()} />}
        >
          {mpErr ? <div style={{ color: "crimson", fontWeight: 800 }}>{mpErr}</div> : null}

          {!manualsParts ? (
            <SmallHint>
              Uses your manufacturer/model/symptom to generate targeted search links + a “probable parts” shortlist.
            </SmallHint>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>{manualsParts.summary}</div>

              <div>
                <div style={{ fontWeight: 900 }}>Suggested search terms</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {manualsParts.suggested_search_terms.map((t, i) => (
                    <a key={i} href={`https://www.google.com/search?q=${encodeURIComponent(t)}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <span style={{ border: "1px solid #ddd", borderRadius: 999, padding: "4px 10px", display: "inline-block", fontSize: 12, fontWeight: 900, color: "#111", background: "#f7f7f7" }}>
                        {t}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>Manuals</div>
                  <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                    {manualsParts.manuals.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, textDecoration: "none", color: "#111" }}>
                        <div style={{ fontWeight: 900 }}>{l.title}</div>
                        {l.note ? <SmallHint>{l.note}</SmallHint> : null}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 900 }}>Parts</div>
                  <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                    {manualsParts.parts.map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noreferrer" style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, textDecoration: "none", color: "#111" }}>
                        <div style={{ fontWeight: 900 }}>{l.title}</div>
                        {l.note ? <SmallHint>{l.note}</SmallHint> : null}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 900 }}>Probable parts to check</div>
                <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                  {manualsParts.probable_parts_to_check.map((p, i) => (
                    <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                      <div style={{ fontWeight: 900 }}>{p.part}</div>
                      <SmallHint>{p.why}</SmallHint>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Measurements */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Measurements / Observations">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(symptom.toLowerCase().includes("heat") ? heatingPresets : coolingPresets).map((p) => (
              <PillButton key={p.label} text={p.label} onClick={() => applyPreset(p.label, p.unit)} />
            ))}
            {measurementOptions.map((m) => (
              <PillButton key={m} text={m} onClick={() => applyPreset(m, guessDefaultUnit(m))} />
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginTop: 12 }}>
            <div>
              <label style={{ fontWeight: 900 }}>Label</label>
              <input value={obsLabel} onChange={(e) => setObsLabel(e.target.value)} style={{ width: "100%", padding: 8 }} />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>Value</label>
              <input value={obsValue} onChange={(e) => setObsValue(e.target.value)} style={{ width: "100%", padding: 8 }} />
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
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div>
              <label style={{ fontWeight: 900 }}>Note (optional)</label>
              <input value={obsNote} onChange={(e) => setObsNote(e.target.value)} style={{ width: "100%", padding: 8 }} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, userSelect: "none" }}>
              <input type="checkbox" checked={autoConvert} onChange={(e) => setAutoConvert(e.target.checked)} />
              Auto-convert (kPa→psi, °C→°F, Pa→inWC)
            </label>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={addMeasurement} style={{ padding: "10px 14px", fontWeight: 900 }}>
                Add measurement
              </button>
              <button onClick={() => setObservations([])} style={{ padding: "10px 14px", fontWeight: 900 }}>
                Clear all
              </button>
            </div>

            {observations.length ? (
              <div style={{ display: "grid", gap: 8 }}>
                {observations.map((o, idx) => (
                  <div key={idx} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>
                        {o.label} <Badge text={`${o.value} ${o.unit}`} />
                      </div>
                      {o.note ? <SmallHint>{o.note}</SmallHint> : null}
                    </div>
                    <button onClick={() => removeObservation(idx)} style={{ fontWeight: 900 }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <SmallHint>No measurements added yet.</SmallHint>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Results */}
      <div style={{ marginTop: 16 }}>
        {parsed ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SectionCard title="Summary">
              <div style={{ fontWeight: 900 }}>{parsed.summary || "—"}</div>
            </SectionCard>

            <SectionCard title="Safety + Escalate">
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>Safety notes</div>
                  {parsed.safety_notes?.length ? (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {parsed.safety_notes.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <SmallHint>None returned.</SmallHint>
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 900 }}>When to escalate</div>
                  {parsed.when_to_escalate?.length ? (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {parsed.when_to_escalate.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <SmallHint>None returned.</SmallHint>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Likely causes">
              {parsed.likely_causes?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {parsed.likely_causes.map((c, idx) => (
                    <div key={idx} style={{ borderTop: idx ? "1px solid #eee" : "none", paddingTop: idx ? 10 : 0 }}>
                      <div style={{ fontWeight: 900 }}>
                        {c.cause || "Cause"}
                        {typeof c.probability_percent === "number" ? <Badge text={`${c.probability_percent}%`} /> : null}
                      </div>
                      {typeof c.probability_percent === "number" ? <ProbBar pct={c.probability_percent} /> : null}
                      {c.why ? <SmallHint style={{ marginTop: 6 }}>{c.why}</SmallHint> : null}
                      {c.what_points_to_it?.length ? (
                        <SmallHint style={{ marginTop: 6 }}>
                          <b>Points to it:</b> {c.what_points_to_it.join(" • ")}
                        </SmallHint>
                      ) : null}
                      {c.what_rules_it_out?.length ? (
                        <SmallHint style={{ marginTop: 4 }}>
                          <b>Rules out:</b> {c.what_rules_it_out.join(" • ")}
                        </SmallHint>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint>No likely causes returned.</SmallHint>
              )}
            </SectionCard>

            <SectionCard title="Decision tree (check this → then that)">
              {parsed.decision_tree?.length ? (
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  {parsed.decision_tree
                    .slice()
                    .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
                    .map((t, idx) => (
                      <li key={idx} style={{ marginBottom: 10 }}>
                        <div style={{ fontWeight: 900 }}>{t.check || "Step"}</div>
                        {t.how ? <SmallHint>How: {t.how}</SmallHint> : null}
                        {t.notes ? <SmallHint>Notes: {t.notes}</SmallHint> : null}
                      </li>
                    ))}
                </ol>
              ) : (
                <SmallHint>No decision tree returned.</SmallHint>
              )}
            </SectionCard>

            <SectionCard title="Field measurements to collect next">
              {parsed.field_measurements_to_collect?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {parsed.field_measurements_to_collect.map((m, idx) => (
                    <div key={idx} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                      <div style={{ fontWeight: 900 }}>{m.measurement}</div>
                      {m.where ? <SmallHint>Where: {m.where}</SmallHint> : null}
                      {m.how ? <SmallHint>How: {m.how}</SmallHint> : null}
                      {m.expected_range ? <SmallHint>Expected: {m.expected_range}</SmallHint> : null}
                      {m.why_it_matters ? <SmallHint>Why: {m.why_it_matters}</SmallHint> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint>No measurements returned.</SmallHint>
              )}
            </SectionCard>

            <SectionCard title="Parts to check">
              {parsed.parts_to_check?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {parsed.parts_to_check.map((p, idx) => (
                    <div key={idx} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                      <div style={{ fontWeight: 900 }}>
                        {p.part} {p.priority ? <Badge text={String(p.priority)} /> : null}
                      </div>
                      {p.why_suspect ? <SmallHint>{p.why_suspect}</SmallHint> : null}
                      {p.quick_test ? <SmallHint>Quick test: {p.quick_test}</SmallHint> : null}
                      {p.common_failure_modes?.length ? <SmallHint>Common failures: {p.common_failure_modes.join(" • ")}</SmallHint> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint style={{}}>
                  After you Diagnose, the model can populate “Parts to check.” If you don’t see it yet, we’ll upgrade the API prompt next so it returns better parts + tests.
                </SmallHint>
              )}
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