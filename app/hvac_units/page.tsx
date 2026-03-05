"use client";

import React, { useMemo, useState } from "react";
import { matchFlowcharts, Flowchart } from "../lib/flowcharts";

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

type ApiResponse = {
  ok?: boolean;
  result?: string;
  error?: string;
};

/* =========================
   Button system (high visibility)
========================= */

type BtnVariant = "primary" | "secondary" | "danger" | "ghost";

function Btn(props: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: BtnVariant;
  title?: string;
  style?: React.CSSProperties;
}) {
  const v = props.variant || "secondary";

  const base: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    fontWeight: 950,
    cursor: props.disabled ? "not-allowed" : "pointer",
    boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
    letterSpacing: 0.2,
    minHeight: 44,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    userSelect: "none",
  };

  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: "#111", color: "#fff", borderColor: "#111" },
    secondary: { background: "#fff", color: "#111" },
    danger: { background: "#b00020", color: "#fff", borderColor: "#b00020" },
    ghost: { background: "transparent", color: "#111", borderColor: "transparent" },
  };

  const disabledStyle: React.CSSProperties = props.disabled ? { opacity: 0.55 } : {};

  return (
    <button
      title={props.title}
      onClick={props.onClick}
      disabled={props.disabled}
      style={{ ...base, ...styles[v], ...disabledStyle, ...(props.style || {}) }}
    >
      {props.children}
    </button>
  );
}

/* =========================
   UI helpers
========================= */

function SectionCard(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14, background: "white" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <div style={{ fontWeight: 950 }}>{props.title}</div>
        {props.right}
      </div>
      {props.children}
    </div>
  );
}

function ProbBar({ pct }: { pct: number }) {
  const safe = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 10, background: "#eee", borderRadius: 999 }}>
        <div style={{ width: `${safe}%`, height: 10, background: "#111", borderRadius: 999 }} />
      </div>
      <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>{safe}% confidence</div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        border: "1px solid #ddd",
        fontSize: 12,
        background: "#f7f7f7",
        marginLeft: 8,
        fontWeight: 900,
      }}
    >
      {text}
    </span>
  );
}

function ChipButton(props: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid #ddd",
        background: "#fff",
        fontWeight: 900,
        cursor: "pointer",
        minHeight: 38,
      }}
    >
      {props.text}
    </button>
  );
}

function SmallHint(props: { children: React.ReactNode }) {
  return <div style={{ marginTop: 8, color: "#666", fontSize: 13, lineHeight: 1.4 }}>{props.children}</div>;
}

function BigBanner(props: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 12, borderRadius: 14, background: "#111", color: "#fff", fontWeight: 950, marginTop: 12 }}>
      {props.children}
    </div>
  );
}

/* =========================
   Unit conversion
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

/* =========================
   Page
========================= */

type Mode = "Cooling" | "Heating";

export default function HVACUnitsPage() {
  const [propertyType, setPropertyType] = useState("Commercial");
  const [equipmentType, setEquipmentType] = useState("RTU");
  const [mode, setMode] = useState<Mode>("Cooling");

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
  const [guidedStarted, setGuidedStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [pathLog, setPathLog] = useState<{ step: number; decision: "PASS" | "FAIL"; nextStep: number }[]>([]);
  const [guidedSource, setGuidedSource] = useState<"ai" | "library">("ai");
  const [activeFlowchart, setActiveFlowchart] = useState<Flowchart | null>(null);

  // Parse diagnosis JSON
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

  // Bias symptom matching by selected mode
  const symptomForMatching = useMemo(() => {
    const s = symptom.trim();
    if (mode === "Heating") return `${s} no heat heating furnace ignition flame sensor pressure switch`.trim();
    return `${s} not cooling cooling suction head superheat subcool condenser`.trim();
  }, [symptom, mode]);

  // Flowchart matches
  const flowMatches = useMemo(() => matchFlowcharts(equipmentType, symptomForMatching, 8), [equipmentType, symptomForMatching]);

  // Guided steps source (AI decision_tree OR library flow)
  const decisionSteps = useMemo(() => {
    const aiSteps = parsed?.decision_tree || [];
    const libSteps = activeFlowchart?.steps || [];
    const steps = guidedSource === "library" ? (libSteps as any[]) : (aiSteps as any[]);
    return steps.slice().sort((a: any, b: any) => (a.step ?? 0) - (b.step ?? 0));
  }, [parsed, guidedSource, activeFlowchart]);

  const stepMap = useMemo(() => {
    const m = new Map<number, any>();
    for (const s of decisionSteps) m.set(s.step, s);
    return m;
  }, [decisionSteps]);

  const current = useMemo(() => stepMap.get(currentStep), [stepMap, currentStep]);

  const unitOptions = ["psi", "kPa", "bar", "°F", "°C", "amps", "volts", "inWC", "Pa", "ohms", "µA", "%", "other"];

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

  async function postDiagnose(payload: any) {
    const res = await fetch("/api/hvac-diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    let data: ApiResponse | null = null;
    if (text) {
      try {
        data = JSON.parse(text) as ApiResponse;
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      const msg =
        data?.result ||
        data?.error ||
        (text && text.length < 2000 ? text : "") ||
        `Server error (${res.status})`;
      setRawResult(String(msg));
      return;
    }

    const result = data?.result ?? text ?? "";
    setRawResult(result || "No result returned.");
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
        mode,
        manufacturer: m,
        model: model.trim(),
        symptom: s,
        refrigerantType,
        observations,
      });
      setGuidedSource("ai");
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
        mode,
        manufacturer: m,
        model: model.trim(),
        symptom: s,
        refrigerantType,
        observations,
        pathLog,
      });
      setGuidedSource("ai");
    } finally {
      setLoading(false);
    }
  }

  const coolingPresets = [
    { label: "Suction Pressure", unit: "psi" },
    { label: "Liquid Pressure", unit: "psi" },
    { label: "Discharge / Head Pressure", unit: "psi" },
    { label: "Superheat", unit: "°F" },
    { label: "Subcool", unit: "°F" },
    { label: "Return Air Temp", unit: "°F" },
    { label: "Supply Air Temp", unit: "°F" },
    { label: "Delta T (Return-Supply)", unit: "°F" },
    { label: "Compressor Amps", unit: "amps" },
    { label: "Condenser Fan Amps", unit: "amps" },
    { label: "Line Voltage", unit: "volts" },
    { label: "Control Voltage (Y-C)", unit: "volts" },
    { label: "External Static Pressure", unit: "inWC" },
  ];

  const heatingPresets = [
    { label: "Gas Inlet Pressure", unit: "inWC" },
    { label: "Manifold Pressure", unit: "inWC" },
    { label: "Heat Rise", unit: "°F" },
    { label: "Return Air Temp", unit: "°F" },
    { label: "Supply Air Temp", unit: "°F" },
    { label: "Inducer Amps", unit: "amps" },
    { label: "Flame Sensor", unit: "µA" },
    { label: "Limit Switch Continuity", unit: "ohms" },
    { label: "Line Voltage", unit: "volts" },
    { label: "Control Voltage (R-W)", unit: "volts" },
  ];

  const showPresets = useMemo(() => (mode === "Heating" ? heatingPresets : coolingPresets), [mode]);

  function loadFlowchart(flow: Flowchart) {
    setActiveFlowchart(flow);
    setGuidedSource("library");
    resetGuided();

    if (!symptom.trim()) setSymptom(flow.title);

    const first = flow.steps.find((x) => x.step === 1);
    if (first?.check) {
      setObsLabel(first.check);
      setObsUnit(guessDefaultUnit(first.check));
    }
  }

  const topActionRow = (
    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
      <Btn variant="primary" onClick={handleDiagnose} disabled={loading} title="Run AI diagnosis">
        🔍 Diagnose (AI)
      </Btn>

      <Btn variant="secondary" onClick={updateDiagnosisNow} disabled={loading || !rawResult} title="Re-run with measurements">
        🔁 Update diagnosis
      </Btn>

      <Btn variant="secondary" onClick={startGuided} disabled={guidedStarted || !decisionSteps.length} title="Start guided PASS/FAIL flow">
        🧭 Start Guided
      </Btn>

      <Btn variant="ghost" onClick={resetGuided} disabled={!guidedStarted} title="Reset guided mode">
        ↩ Reset Guided
      </Btn>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {guidedSource === "library" && activeFlowchart ? <Badge text="Guided: Library" /> : null}
        {guidedSource === "ai" && parsed?.decision_tree?.length ? <Badge text="Guided: AI" /> : null}
        <Badge text={`Mode: ${mode}`} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: 20, maxWidth: 1180, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 980, marginBottom: 10 }}>Skilled Trades AI — HVAC Diagnose</h1>

      <BigBanner>✅ Pick mode → 🔍 Diagnose (AI) → Add readings → 🔁 Update → 🧭 Guided Flow</BigBanner>

      {/* Inputs */}
      <div style={{ marginTop: 14, padding: 14, border: "1px solid #e5e5e5", borderRadius: 14, background: "#fafafa" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 950 }}>Property Type</label>
            <br />
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10 }}>
              <option>Residential</option>
              <option>Commercial</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 950 }}>Equipment Type</label>
            <br />
            <select value={equipmentType} onChange={(e) => setEquipmentType(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10 }}>
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
            <label style={{ fontWeight: 950 }}>Mode (What should the unit be doing?)</label>
            <br />
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} style={{ width: "100%", padding: 10, borderRadius: 10 }}>
              <option value="Cooling">Cooling</option>
              <option value="Heating">Heating</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 950 }}>Manufacturer</label>
            <br />
            <input
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10 }}
              placeholder="Carrier, Trane, Lennox..."
            />
          </div>

          <div>
            <label style={{ fontWeight: 950 }}>Model (optional)</label>
            <br />
            <input value={model} onChange={(e) => setModel(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10 }} placeholder="48FCEA..." />
          </div>

          <div>
            <label style={{ fontWeight: 950 }}>Refrigerant Type</label>
            <br />
            <select value={refrigerantType} onChange={(e) => setRefrigerantType(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10 }}>
              {refrigerantOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontWeight: 950 }}>Symptom</label>
            <br />
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, minHeight: 90 }}
              placeholder={mode === "Heating" ? "No heat. Inducer runs but no ignition..." : "Not cooling. Compressor runs. Suction low..."}
            />
          </div>
        </div>

        {topActionRow}
      </div>

      {/* Flowchart Library */}
      <div style={{ marginTop: 14 }}>
        <SectionCard title="Flowchart Library (Symptom-based)" right={<Badge text={`${flowMatches.length} matches`} />}>
          {flowMatches.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {flowMatches.map(({ f, score }) => (
                <div key={f.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 12, background: "#fafafa" }}>
                  <div style={{ fontWeight: 950, fontSize: 16 }}>
                    {f.title} <Badge text={`match ${score}`} />
                  </div>
                  <div style={{ color: "#555", marginTop: 6, lineHeight: 1.4 }}>{f.intro}</div>
                  <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn variant="primary" onClick={() => loadFlowchart(f)}>
                      🧭 Load Guided Flow
                    </Btn>
                    <Btn
                      variant="secondary"
                      onClick={() => {
                        setSymptom((prev) => (prev.trim() ? prev : f.title));
                      }}
                    >
                      ✍️ Use as symptom text
                    </Btn>
                  </div>
                </div>
              ))}
              <SmallHint>
                Mode set to <b>{mode}</b> biases these matches so heating flows appear when you’re diagnosing heat calls.
              </SmallHint>
            </div>
          ) : (
            <div style={{ color: "#666" }}>
              Try keywords like <b>no heat</b>, <b>lockout</b>, <b>flame sensor</b>, <b>pressure switch</b>, or for cooling <b>coil icing</b>, <b>high head</b>, <b>low suction</b>.
            </div>
          )}
        </SectionCard>
      </div>

      {/* Measurements */}
      <div style={{ marginTop: 14 }}>
        <SectionCard title="Add Measurements / Observations" right={<Badge text={`${observations.length} saved`} />}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {showPresets.map((p) => (
              <ChipButton key={p.label} text={p.label} onClick={() => applyPreset(p.label, p.unit)} />
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginTop: 12 }}>
            <div>
              <div style={{ fontWeight: 950 }}>Label</div>
              <input value={obsLabel} onChange={(e) => setObsLabel(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10 }} placeholder="Suction Pressure / Flame Sensor..." />
            </div>

            <div>
              <div style={{ fontWeight: 950 }}>Value</div>
              <input value={obsValue} onChange={(e) => setObsValue(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10 }} placeholder="68" />
            </div>

            <div>
              <div style={{ fontWeight: 950 }}>Unit</div>
              <select value={obsUnit} onChange={(e) => setObsUnit(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10 }}>
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 950 }}>Note (optional)</div>
            <input value={obsNote} onChange={(e) => setObsNote(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10 }} placeholder="frosting / rollout tripped / etc" />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={autoConvert} onChange={(e) => setAutoConvert(e.target.checked)} />
              <span style={{ fontWeight: 950 }}>Auto-convert (kPa→psi, °C→°F, Pa→inWC)</span>
            </label>

            <Btn variant="primary" onClick={addMeasurement}>
              ➕ Add measurement
            </Btn>
          </div>

          {observations.length ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 950, marginBottom: 8 }}>Saved readings</div>
              <div style={{ display: "grid", gap: 8 }}>
                {observations.map((o, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 12,
                      padding: 10,
                      background: "#fafafa",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 950 }}>
                        {o.label} <Badge text={`${o.value} ${o.unit}`} />
                      </div>
                      {o.note ? <div style={{ color: "#444", marginTop: 4 }}>{o.note}</div> : null}
                    </div>
                    <Btn variant="danger" onClick={() => removeObservation(idx)}>
                      ✖ Remove
                    </Btn>
                  </div>
                ))}
              </div>
              <SmallHint>
                After adding readings, hit <b>🔁 Update diagnosis</b>.
              </SmallHint>
            </div>
          ) : (
            <SmallHint>Add 1–2 key readings, then update the diagnosis.</SmallHint>
          )}
        </SectionCard>
      </div>

      {/* Guided Flow */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Guided Flow (PASS / FAIL)">
          {!decisionSteps.length ? (
            <div style={{ color: "#666" }}>
              No guided steps available yet. Load a <b>Flowchart Library</b> flow OR run <b>Diagnose (AI)</b> first.
            </div>
          ) : !guidedStarted ? (
            <div>
              <div style={{ color: "#444", lineHeight: 1.5 }}>Guided flow walks you step-by-step. Hit PASS or FAIL and it advances.</div>
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Btn variant="primary" onClick={startGuided}>
                  🧭 Start guided flow
                </Btn>
                <Btn variant="ghost" onClick={resetGuided}>
                  ↩ Reset
                </Btn>
              </div>
            </div>
          ) : currentStep === 0 ? (
            <div>
              <div style={{ fontWeight: 950 }}>Flow finished.</div>
              <SmallHint>Add readings and update AI if you want it to pivot causes.</SmallHint>
              <Btn variant="primary" onClick={resetGuided} style={{ marginTop: 10 }}>
                ↩ Reset guided flow
              </Btn>
            </div>
          ) : current ? (
            <div>
              <div style={{ fontWeight: 950, fontSize: 16 }}>
                Step {current.step}: {current.check}
              </div>
              {current.how ? <div style={{ marginTop: 6, color: "#444" }}>How: {current.how}</div> : null}
              {current.pass_condition ? <div style={{ marginTop: 6, color: "#444" }}>PASS if: {current.pass_condition}</div> : null}
              {current.fail_condition ? <div style={{ marginTop: 6, color: "#444" }}>FAIL if: {current.fail_condition}</div> : null}
              {current.notes ? <div style={{ marginTop: 6, color: "#666" }}>Notes: {current.notes}</div> : null}

              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <Btn variant="primary" onClick={() => advance("PASS")}>
                  ✅ PASS
                </Btn>
                <Btn variant="danger" onClick={() => advance("FAIL")}>
                  ❌ FAIL
                </Btn>
                <Btn variant="ghost" onClick={resetGuided}>
                  ↩ Reset
                </Btn>
              </div>

              {pathLog.length ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 950 }}>Path log</div>
                  <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                    {pathLog.slice(-10).map((p, i) => (
                      <li key={i}>
                        Step {p.step}: {p.decision} → {p.nextStep || "END"}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{ color: "#666" }}>No step data returned.</div>
          )}
        </SectionCard>
      </div>

      {/* AI Results */}
      <div style={{ marginTop: 16 }}>
        {parsed ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SectionCard title="Summary">
              <div style={{ color: "#222", lineHeight: 1.5 }}>{parsed.summary || "No summary returned."}</div>
            </SectionCard>

            <SectionCard title="Likely causes">
              <div style={{ display: "grid", gap: 10 }}>
                {(parsed.likely_causes || []).map((c, idx) => {
                  const pct = typeof c.probability_percent === "number" ? c.probability_percent : 0;
                  return (
                    <div key={idx} style={{ borderTop: idx ? "1px solid #eee" : "none", paddingTop: idx ? 10 : 0 }}>
                      <div style={{ fontWeight: 950 }}>
                        {c.cause || "Cause"} <Badge text={`${pct}%`} />
                      </div>
                      <ProbBar pct={pct} />
                      {c.why ? <div style={{ marginTop: 6, color: "#444" }}>{c.why}</div> : null}
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Raw output (debug)">
              <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: 12 }}>{rawResult || "No results yet."}</pre>
            </SectionCard>
          </div>
        ) : (
          <SectionCard title="Results">
            <div style={{ color: "#666" }}>
              Tap <b>🔍 Diagnose (AI)</b>. If you see a server message, copy it to me.
            </div>
            {rawResult ? <pre style={{ whiteSpace: "pre-wrap", marginTop: 10, fontSize: 12 }}>{rawResult}</pre> : null}
          </SectionCard>
        )}
      </div>
    </div>
  );
}