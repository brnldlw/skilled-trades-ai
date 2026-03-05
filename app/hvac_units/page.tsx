
"use client";

import React, { useMemo, useState } from "react";

/* =========================
   Types
========================= */

type Observation = {
  label: string;
  value: string;
  unit: string;
  note?: string;
};

type Diagnosis = {
  summary?: string;

  derived_calculations?: {
    deltaT_f?: number | null;
    superheat_f?: number | null;
    subcool_f?: number | null;
    notes?: string[];
  };

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
  manufacturer: string;
  model: string;
  serial: string;
  equipment_type: string;
  tonnage: string;
  voltage: string;
  phase: string;
  hz: string;
  refrigerant: string;
  gas_input_btu: string;
  notes: string[];
  confidence: "High" | "Medium" | "Low";
};

/* =========================
   UI helpers
========================= */

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, background: "white" }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{props.title}</div>
      {props.children}
    </div>
  );
}

function SmallHint(props: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.35, ...(props.style || {}) }}>
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

function ChipButton(props: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #ddd",
        background: "#fff",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {props.text}
    </button>
  );
}

/* =========================
   Unit conversion helpers
========================= */

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

/* =========================
   Page
========================= */

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

  // Guided Mode
  const [viewMode, setViewMode] = useState<"flow" | "guided">("guided");
  const [guidedStarted, setGuidedStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [pathLog, setPathLog] = useState<{ step: number; decision: "PASS" | "FAIL"; nextStep: number }[]>([]);

  // Nameplate (photo)
  const [nameplateFile, setNameplateFile] = useState<File | null>(null);
  const [nameplatePreview, setNameplatePreview] = useState<string>("");
  const [nameplateLoading, setNameplateLoading] = useState(false);
  const [nameplateResult, setNameplateResult] = useState<NameplateResult | null>(null);
  const [nameplateError, setNameplateError] = useState<string>("");

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

  const decisionSteps = useMemo(() => {
    const steps = parsed?.decision_tree || [];
    return steps.slice().sort((a, b) => (a.step ?? 0) - (b.step ?? 0));
  }, [parsed]);

  const stepMap = useMemo(() => {
    const m = new Map<number, NonNullable<Diagnosis["decision_tree"]>[number]>();
    for (const s of decisionSteps) m.set(s.step, s);
    return m;
  }, [decisionSteps]);

  const current = useMemo(() => stepMap.get(currentStep), [stepMap, currentStep]);

  const unitOptions = ["psi", "kPa", "bar", "°F", "°C", "amps", "volts", "inWC", "Pa", "ohms", "µA", "%", "other"];

  const suggestedForCurrentStep = useMemo(() => {
    if (!parsed?.field_measurements_to_collect?.length) return null;
    const stepText = (current?.check || "").toLowerCase();
    if (!stepText) return null;

    let best: { score: number; m: any } | null = null;

    for (const m of parsed.field_measurements_to_collect) {
      const hay = `${m.measurement || ""} ${m.where || ""} ${m.how || ""} ${m.expected_range || ""}`.toLowerCase();
      let score = 0;

      const keywords = ["suction","liquid","discharge","head","pressure","superheat","subcool","delta","supply","return","airflow","static","voltage","amps","flame","gas","manifold","thermostat","control","sensor","temperature"];

      for (const k of keywords) {
        if (stepText.includes(k) && hay.includes(k)) score += 3;
      }

      const words = String(m.measurement || "").toLowerCase().split(/\s+/).filter(Boolean);
      for (const w of words) {
        if (w.length >= 4 && stepText.includes(w)) score += 1;
      }

      if (!best || score > best.score) best = { score, m };
    }

    if (!best || best.score <= 0) return null;
    return best.m;
  }, [parsed, current]);

  function resetGuided() {
    setGuidedStarted(false);
    setCurrentStep(1);
    setPathLog([]);
  }

  function startGuided() {
    setGuidedStarted(true);
    setCurrentStep(1);
    setPathLog([]);
    const first = stepMap.get(1);
    if (first?.check) {
      setObsLabel(first.check);
      setObsUnit(guessDefaultUnit(first.check));
    }
  }

  function advance(decision: "PASS" | "FAIL") {
    if (!current) return;
    const nextStep = decision === "PASS" ? (current.if_pass_next_step ?? 0) : (current.if_fail_next_step ?? 0);

    setPathLog((prev) => [...prev, { step: current.step, decision, nextStep }]);

    if (!nextStep || nextStep === 0) {
      setCurrentStep(0);
      return;
    }

    setCurrentStep(nextStep);
    const nextObj = stepMap.get(nextStep);
    if (nextObj?.check) {
      setObsLabel(nextObj.check);
      setObsUnit(guessDefaultUnit(nextObj.check));
    }
  }

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

  async function safeReadJson(res: Response): Promise<any> {
    // Avoid: "Unexpected end of JSON input"
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { result: text };
    }
  }

  async function postDiagnose(payload: any) {
    const res = await fetch("/api/hvac-diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await safeReadJson(res);

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
    resetGuided();

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
      resetGuided();
      await postDiagnose({
        propertyType,
        equipmentType,
        manufacturer: m,
        model: model.trim(),
        symptom: s,
        refrigerantType,
        observations,
        pathLog,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleNameplateSelected(f: File | null) {
    setNameplateFile(f);
    setNameplateResult(null);
    setNameplateError("");
    if (!f) {
      setNameplatePreview("");
      return;
    }
    const url = URL.createObjectURL(f);
    setNameplatePreview(url);
  }

  async function parseNameplate() {
    if (!nameplateFile) {
      setNameplateError("Pick a nameplate photo first.");
      return;
    }
    setNameplateLoading(true);
    setNameplateError("");
    setNameplateResult(null);

    try {
      const fd = new FormData();
      fd.append("image", nameplateFile);

      const res = await fetch("/api/nameplate-parse", {
        method: "POST",
        body: fd,
      });

      const data = await safeReadJson(res);
      if (!res.ok || !data?.ok) {
        setNameplateError(data?.error || `Nameplate parse failed (${res.status}).`);
        return;
      }

      setNameplateResult(data.result as NameplateResult);
    } finally {
      setNameplateLoading(false);
    }
  }

  function applyNameplateToForm() {
    if (!nameplateResult) return;
    if (nameplateResult.manufacturer) setManufacturer(nameplateResult.manufacturer);
    if (nameplateResult.model) setModel(nameplateResult.model);
    if (nameplateResult.equipment_type) setEquipmentType(nameplateResult.equipment_type);
    if (nameplateResult.refrigerant) setRefrigerantType(nameplateResult.refrigerant);
  }

  function downloadReport() {
    const payload = {
      meta: {
        createdAt: new Date().toISOString(),
        propertyType,
        equipmentType,
        manufacturer,
        model,
        refrigerantType,
      },
      symptom,
      observations,
      nameplate: nameplateResult,
      diagnosis: parsed ? parsed : rawResult,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hvac-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    const payload = {
      propertyType,
      equipmentType,
      manufacturer,
      model,
      refrigerantType,
      symptom,
      observations,
      nameplate: nameplateResult,
      diagnosis: parsed ? parsed : rawResult,
    };
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<pre style="white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`);
    w.document.close();
    w.focus();
    w.print();
  }

  function escapeHtml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Presets
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

  function openSearch(kind: "manual" | "parts") {
    const qBase = `${manufacturer} ${model} ${equipmentType}`.trim();
    const q = kind === "manual" ? `${qBase} service manual pdf` : `${qBase} parts list`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
  }

  return (
    <div style={{ padding: 20, maxWidth: 1180, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Skilled Trades AI — HVAC Diagnose</h1>

      {/* Quick symptom chips */}
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ChipButton text="Not Cooling" onClick={() => setSymptom("Not cooling. Compressor runs. Suction pressure low...")} />
        <ChipButton text="Not Heating" onClick={() => setSymptom("Not heating. Inducer runs. No flame...")} />
        <ChipButton text="Freezing Up" onClick={() => setSymptom("Evaporator freezing up / icing. Low airflow or low charge suspected.")} />
        <ChipButton text="Short Cycling" onClick={() => setSymptom("Short cycling. Runs 1–3 minutes then shuts off. Repeats.")} />
      </div>

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

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={handleDiagnose} disabled={loading} style={{ padding: "10px 14px" }}>
            {loading ? "Diagnosing..." : "Diagnose"}
          </button>

          <button onClick={downloadReport} style={{ padding: "10px 14px" }}>
            Download Report (JSON)
          </button>

          <button onClick={printReport} style={{ padding: "10px 14px" }}>
            Print Report
          </button>

          <button onClick={() => openSearch("manual")} style={{ padding: "10px 14px" }}>
            Search Manual
          </button>

          <button onClick={() => openSearch("parts")} style={{ padding: "10px 14px" }}>
            Search Parts
          </button>
        </div>

        <SmallHint style={{ marginTop: 10 }}>
          Tip: If Vercel ever “looks older,” it usually means it deployed an older commit. We’ll add an in-app version badge next.
        </SmallHint>
      </div>

      {/* Nameplate Photo */}
      <div style={{ marginTop: 14 }}>
        <Card title="Nameplate Photo (optional — auto-fill fields)">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleNameplateSelected(e.target.files?.[0] || null)}
              />
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={parseNameplate} disabled={nameplateLoading || !nameplateFile} style={{ padding: "10px 14px" }}>
                  {nameplateLoading ? "Reading..." : "Read Nameplate"}
                </button>
                <button onClick={applyNameplateToForm} disabled={!nameplateResult} style={{ padding: "10px 14px" }}>
                  Use Parsed Data
                </button>
              </div>
              {nameplateError ? <div style={{ color: "crimson", marginTop: 10 }}>{nameplateError}</div> : null}
              {nameplateResult ? (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 900 }}>
                    Parsed Nameplate <Badge text={`Confidence: ${nameplateResult.confidence}`} />
                  </div>
                  <pre style={{ whiteSpace: "pre-wrap", marginTop: 8, background: "#fafafa", padding: 10, borderRadius: 10 }}>
                    {JSON.stringify(nameplateResult, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>

            <div>
              {nameplatePreview ? (
                <div>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Preview</div>
                  <img
                    src={nameplatePreview}
                    alt="Nameplate preview"
                    style={{ maxWidth: "100%", borderRadius: 10, border: "1px solid #ddd" }}
                  />
                  <SmallHint style={{ marginTop: 8 }}>
                    If the photo is hard to read, take it closer + straight-on + good lighting. If it still fails, we’ll add a “manual text override” box next.
                  </SmallHint>
                </div>
              ) : (
                <SmallHint>No image selected yet.</SmallHint>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Measurements + Diagnosis */}
      <div style={{ marginTop: 16 }}>
        {parsed ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card title="Summary + Derived Calculations">
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Summary</div>
              <div style={{ color: "#222" }}>{parsed.summary || "No summary returned."}</div>

              <div style={{ height: 10 }} />

              <div style={{ fontWeight: 900, marginBottom: 6 }}>Derived</div>
              <div style={{ fontSize: 14, color: "#222" }}>
                <div>ΔT: {parsed.derived_calculations?.deltaT_f ?? "—"} °F</div>
                <div>Superheat: {parsed.derived_calculations?.superheat_f ?? "—"} °F</div>
                <div>Subcool: {parsed.derived_calculations?.subcool_f ?? "—"} °F</div>
              </div>

              {parsed.derived_calculations?.notes?.length ? (
                <ul style={{ marginTop: 8 }}>
                  {parsed.derived_calculations.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              ) : null}
            </Card>

            <Card title="Likely causes">
              {parsed.likely_causes?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {parsed.likely_causes.map((c, idx) => (
                    <div key={idx} style={{ borderTop: idx ? "1px solid #eee" : "none", paddingTop: idx ? 10 : 0 }}>
                      <div style={{ fontWeight: 900 }}>
                        {c.cause || "Cause"}
                        {typeof c.probability_percent === "number" ? <Badge text={`${c.probability_percent}%`} /> : null}
                      </div>
                      {typeof c.probability_percent === "number" ? <ProbBar pct={c.probability_percent} /> : null}
                      {c.why ? <div style={{ marginTop: 6, color: "#444" }}>{c.why}</div> : null}
                      {c.what_points_to_it?.length ? (
                        <SmallHint style={{ marginTop: 6 }}>
                          Points to it: {c.what_points_to_it.join("; ")}
                        </SmallHint>
                      ) : null}
                      {c.what_rules_it_out?.length ? (
                        <SmallHint style={{ marginTop: 4 }}>
                          Rules it out: {c.what_rules_it_out.join("; ")}
                        </SmallHint>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint>No likely causes returned yet.</SmallHint>
              )}
            </Card>

            <Card title="Measurements">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <ChipButton text="Cooling presets" onClick={() => applyPreset("Suction Pressure", "psi")} />
                <ChipButton text="Heating presets" onClick={() => applyPreset("Manifold Pressure", "inWC")} />
              </div>

              <div style={{ height: 10 }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px", gap: 8 }}>
                <input placeholder="Label" value={obsLabel} onChange={(e) => setObsLabel(e.target.value)} style={{ padding: 8 }} />
                <input placeholder="Value" value={obsValue} onChange={(e) => setObsValue(e.target.value)} style={{ padding: 8 }} />
                <select value={obsUnit} onChange={(e) => setObsUnit(e.target.value)} style={{ padding: 8 }}>
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: 8 }}>
                <input
                  placeholder="Note (optional)"
                  value={obsNote}
                  onChange={(e) => setObsNote(e.target.value)}
                  style={{ padding: 8, width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                <button onClick={addMeasurement} style={{ padding: "10px 14px" }}>
                  Add Measurement
                </button>

                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" checked={autoConvert} onChange={(e) => setAutoConvert(e.target.checked)} />
                  Auto-convert to standard units
                </label>

                <button onClick={updateDiagnosisNow} disabled={loading} style={{ padding: "10px 14px" }}>
                  Re-diagnose with measurements
                </button>
              </div>

              {suggestedForCurrentStep ? (
                <SmallHint style={{ marginTop: 10 }}>
                  Suggested for current step: <b>{suggestedForCurrentStep.measurement}</b> — {suggestedForCurrentStep.where}
                </SmallHint>
              ) : null}

              <div style={{ marginTop: 12 }}>
                {observations.length ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {observations.map((o, i) => (
                      <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <div>
                            <b>{o.label}</b>: {o.value} {o.unit}
                            {o.note ? <SmallHint style={{ marginTop: 4 }}>{o.note}</SmallHint> : null}
                          </div>
                          <button onClick={() => removeObservation(i)} style={{ padding: "6px 10px" }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <SmallHint style={{ marginTop: 10 }}>
                    Add 2–4 key readings (pressures, temps, amps, ΔT). The diagnosis gets dramatically better.
                  </SmallHint>
                )}
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(symptom.toLowerCase().includes("heat") ? heatingPresets : coolingPresets).map((p) => (
                    <ChipButton key={p.label} text={p.label} onClick={() => applyPreset(p.label, p.unit)} />
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Decision flow (guided)">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setViewMode("guided")} style={{ padding: "10px 14px" }}>
                  Guided
                </button>
                <button onClick={() => setViewMode("flow")} style={{ padding: "10px 14px" }}>
                  Flow List
                </button>
                {!guidedStarted ? (
                  <button onClick={startGuided} style={{ padding: "10px 14px" }}>
                    Start Guided
                  </button>
                ) : (
                  <button onClick={resetGuided} style={{ padding: "10px 14px" }}>
                    Reset Guided
                  </button>
                )}
              </div>

              {viewMode === "flow" ? (
                <div style={{ marginTop: 10 }}>
                  {decisionSteps.length ? (
                    <ol style={{ margin: 0, paddingLeft: 18 }}>
                      {decisionSteps.map((t) => (
                        <li key={t.step} style={{ marginBottom: 10 }}>
                          <div style={{ fontWeight: 900 }}>
                            Step {t.step}: {t.check}
                          </div>
                          {t.how ? <SmallHint>How: {t.how}</SmallHint> : null}
                          {t.notes ? <SmallHint>Note: {t.notes}</SmallHint> : null}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <SmallHint style={{ marginTop: 10 }}>No decision tree returned yet.</SmallHint>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 10 }}>
                  {!guidedStarted ? (
                    <SmallHint>Click “Start Guided” to walk step-by-step with PASS/FAIL.</SmallHint>
                  ) : currentStep === 0 ? (
                    <div>
                      <div style={{ fontWeight: 900 }}>Guided flow complete.</div>
                      <SmallHint style={{ marginTop: 6 }}>Hit “Re-diagnose with measurements” for a tighter result.</SmallHint>
                    </div>
                  ) : current ? (
                    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontWeight: 900 }}>Step {current.step}</div>
                      <div style={{ marginTop: 6, fontSize: 16 }}>{current.check}</div>
                      {current.how ? <SmallHint style={{ marginTop: 6 }}>How: {current.how}</SmallHint> : null}
                      {current.notes ? <SmallHint style={{ marginTop: 6 }}>Note: {current.notes}</SmallHint> : null}

                      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                        <button onClick={() => advance("PASS")} style={{ padding: "10px 14px" }}>
                          PASS
                        </button>
                        <button onClick={() => advance("FAIL")} style={{ padding: "10px 14px" }}>
                          FAIL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <SmallHint>Waiting for a decision tree…</SmallHint>
                  )}
                </div>
              )}
            </Card>

            <Card title="Parts to check">
              {parsed.parts_to_check?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {parsed.parts_to_check.map((p, i) => (
                    <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                      <div style={{ fontWeight: 900 }}>
                        {p.part} {p.priority ? <Badge text={String(p.priority)} /> : null}
                      </div>
                      {p.why_suspect ? <SmallHint style={{ marginTop: 6 }}>Why: {p.why_suspect}</SmallHint> : null}
                      {p.quick_test ? <SmallHint style={{ marginTop: 6 }}>Quick test: {p.quick_test}</SmallHint> : null}
                      {p.common_failure_modes?.length ? (
                        <SmallHint style={{ marginTop: 6 }}>Common failures: {p.common_failure_modes.join("; ")}</SmallHint>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint>
                  After you Diagnose, the model can populate “Parts to check.” If you don’t see it yet, next upgrade is improving API prompt depth.
                </SmallHint>
              )}
            </Card>

            <Card title="Safety + Escalate">
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>Safety</div>
                  {parsed.safety_notes?.length ? (
                    <ul style={{ marginTop: 6 }}>
                      {parsed.safety_notes.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <SmallHint>No safety notes returned.</SmallHint>
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 900 }}>When to escalate</div>
                  {parsed.when_to_escalate?.length ? (
                    <ul style={{ marginTop: 6 }}>
                      {parsed.when_to_escalate.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <SmallHint>No escalation notes returned.</SmallHint>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card title="Raw output">
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{rawResult || "No results yet."}</pre>
          </Card>
        )}
      </div>
    </div>
  );
}