"use client";

import React, { useMemo, useState } from "react";

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

/** ---------- UI Helpers ---------- */

function SectionCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, background: "white" }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>{props.title}</div>
      {props.children}
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

/** ---------- Unit conversion ---------- */

function toNumber(s: string): number | null {
  const n = Number(String(s).replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function convertToStandard(value: number, unit: string): { value: number; unit: string } | null {
  const u = unit.trim();

  // Pressure
  if (u === "kPa") return { value: value * 0.1450377377, unit: "psi" };
  if (u === "bar") return { value: value * 14.50377377, unit: "psi" };

  // Temperature
  if (u === "°C") return { value: (value * 9) / 5 + 32, unit: "°F" };

  // Static pressure
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

/** ---------- Page ---------- */

export default function HVACUnitsPage() {
  const [propertyType, setPropertyType] = useState("Commercial");
  const [equipmentType, setEquipmentType] = useState("RTU");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [symptom, setSymptom] = useState("");

  // Refrigerant
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

  const measurementOptions = parsed?.field_measurements_to_collect?.map((m) => m.measurement) || [];
  const unitOptions = ["psi", "kPa", "bar", "°F", "°C", "amps", "volts", "inWC", "Pa", "ohms", "µA", "%", "other"];

  // NEW: suggested measurement that matches the current guided step
  const suggestedForCurrentStep = useMemo(() => {
    if (!parsed?.field_measurements_to_collect?.length) return null;
    const stepText = (current?.check || "").toLowerCase();
    if (!stepText) return null;

    let best: { score: number; m: any } | null = null;

    for (const m of parsed.field_measurements_to_collect) {
      const hay = `${m.measurement || ""} ${m.where || ""} ${m.how || ""} ${m.expected_range || ""}`.toLowerCase();
      let score = 0;

      const keywords = [
        "suction",
        "liquid",
        "discharge",
        "head",
        "pressure",
        "superheat",
        "subcool",
        "delta",
        "supply",
        "return",
        "airflow",
        "static",
        "voltage",
        "amps",
        "flame",
        "gas",
        "manifold",
        "thermostat",
        "control",
        "sensor",
        "temperature",
      ];

      for (const k of keywords) {
        if (stepText.includes(k) && hay.includes(k)) score += 3;
      }

      const words = String(m.measurement || "")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
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

  async function postDiagnose(payload: any) {
    const res = await fetch("/api/hvac-diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
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

        <button onClick={handleDiagnose} disabled={loading} style={{ marginTop: 12, padding: "10px 14px" }}>
          {loading ? "Diagnosing..." : "Diagnose"}
        </button>
      </div>

      {/* Results */}
      <div style={{ marginTop: 16 }}>
        {parsed ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SectionCard title="Summary">
              <div style={{ color: "#333" }}>{parsed.summary || "No summary returned."}</div>
            </SectionCard>

            <SectionCard title="Likely causes">
              {parsed.likely_causes?.length ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {parsed.likely_causes.map((c, i) => (
                    <li key={i} style={{ marginBottom: 14 }}>
                      <div style={{ fontWeight: 900 }}>
                        {c.cause} {typeof c.probability_percent === "number" ? <Badge text={`${c.probability_percent}%`} /> : null}
                      </div>
                      {typeof c.probability_percent === "number" ? <ProbBar pct={c.probability_percent} /> : null}
                      {c.why ? <div style={{ color: "#444", marginTop: 6 }}><b>Why:</b> {c.why}</div> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: "#666" }}>No likely causes returned.</div>
              )}
            </SectionCard>

            {/* Measurements */}
            <SectionCard title="Add field measurements (always available)">
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {coolingPresets.slice(0, 6).map((p) => (
                    <ChipButton key={p.label} text={`❄ ${p.label}`} onClick={() => applyPreset(p.label, p.unit)} />
                  ))}
                  {heatingPresets.slice(0, 4).map((p) => (
                    <ChipButton key={p.label} text={`🔥 ${p.label}`} onClick={() => applyPreset(p.label, p.unit)} />
                  ))}
                </div>

                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="checkbox" checked={autoConvert} onChange={(e) => setAutoConvert(e.target.checked)} />
                  <span style={{ fontWeight: 900 }}>Auto-convert units</span>
                  <span style={{ color: "#666", fontSize: 12 }}>(kPa/bar→psi, °C→°F, Pa→inWC)</span>
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>Label</div>
                    {measurementOptions.length ? (
                      <select value={obsLabel} onChange={(e) => setObsLabel(e.target.value)} style={{ width: "100%", padding: 8 }}>
                        <option value="">Select suggested (or type below)</option>
                        {measurementOptions.map((x, i) => (
                          <option key={i} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <input value={obsLabel} onChange={(e) => setObsLabel(e.target.value)} placeholder="e.g., Suction Pressure" style={{ width: "100%", padding: 8, marginTop: measurementOptions.length ? 8 : 0 }} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>Value</div>
                    <input value={obsValue} onChange={(e) => setObsValue(e.target.value)} placeholder="58" style={{ width: "100%", padding: 8 }} />
                  </div>

                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>Unit</div>
                    <select value={obsUnit} onChange={(e) => setObsUnit(e.target.value)} style={{ width: "100%", padding: 8 }}>
                      {unitOptions.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Note (optional)</div>
                  <input value={obsNote} onChange={(e) => setObsNote(e.target.value)} placeholder="anything you saw/heard/smelled" style={{ width: "100%", padding: 8 }} />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={addMeasurement} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff", fontWeight: 900 }}>
                    Add measurement
                  </button>

                  <button onClick={updateDiagnosisNow} disabled={loading} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #111", background: "#fff", color: "#111", fontWeight: 900 }}>
                    {loading ? "Updating..." : "Update diagnosis with measurements"}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Decision Tree */}
            <SectionCard title="Decision Tree (Flow + Guided)">
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => setViewMode("flow")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: viewMode === "flow" ? "#111" : "#fff",
                    color: viewMode === "flow" ? "#fff" : "#111",
                    fontWeight: 800,
                  }}
                >
                  View Flow
                </button>

                <button
                  onClick={() => setViewMode("guided")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: viewMode === "guided" ? "#111" : "#fff",
                    color: viewMode === "guided" ? "#fff" : "#111",
                    fontWeight: 800,
                  }}
                >
                  Guided Mode
                </button>

                {viewMode === "guided" ? (
                  <>
                    <button onClick={startGuided} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", fontWeight: 800 }}>
                      Start / Restart Guided
                    </button>
                    <button onClick={resetGuided} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", fontWeight: 800 }}>
                      Clear Path
                    </button>
                  </>
                ) : null}
              </div>

              {viewMode === "flow" ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {decisionSteps.map((s, i) => (
                    <div key={i} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>
                        Step {s.step}: {s.check}
                      </div>
                      {s.how ? <div style={{ marginTop: 6, color: "#333" }}><b>How:</b> {s.how}</div> : null}
                      <div style={{ marginTop: 8, color: "#444" }}>
                        <b>PASS →</b> {s.if_pass_next_step ?? 0} &nbsp; | &nbsp; <b>FAIL →</b> {s.if_fail_next_step ?? 0}
                      </div>
                      {s.notes ? <div style={{ marginTop: 8, color: "#444" }}><b>Notes:</b> {s.notes}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {!guidedStarted ? <div style={{ color: "#444" }}>Click <b>Start / Restart Guided</b> to begin.</div> : null}

                  {guidedStarted ? (
                    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900, marginBottom: 8 }}>Current step</div>

                      {currentStep === 0 ? (
                        <div style={{ color: "#111" }}>
                          <b>Stopped.</b> Add measurements above and hit “Update diagnosis…”
                        </div>
                      ) : current ? (
                        <>
                          <div style={{ fontWeight: 900 }}>Step {current.step}: {current.check}</div>
                          {current.how ? <div style={{ marginTop: 6, color: "#333" }}><b>How:</b> {current.how}</div> : null}

                          {/* Suggested measurement */}
                          {suggestedForCurrentStep ? (
                            <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 12, background: "#fafafa" }}>
                              <div style={{ fontWeight: 900, marginBottom: 6 }}>Suggested measurement</div>
                              <div style={{ fontWeight: 900 }}>{suggestedForCurrentStep.measurement}</div>
                              {suggestedForCurrentStep.where ? <div style={{ color: "#444", marginTop: 4 }}><b>Where:</b> {suggestedForCurrentStep.where}</div> : null}
                              {suggestedForCurrentStep.how ? <div style={{ color: "#444", marginTop: 4 }}><b>How:</b> {suggestedForCurrentStep.how}</div> : null}
                              {suggestedForCurrentStep.expected_range ? <div style={{ color: "#444", marginTop: 4 }}><b>Expected:</b> {suggestedForCurrentStep.expected_range}</div> : null}

                              <div style={{ marginTop: 10 }}>
                                <button
                                  onClick={() => {
                                    setObsLabel(String(suggestedForCurrentStep.measurement || "").trim());
                                    setObsUnit(guessDefaultUnit(String(suggestedForCurrentStep.measurement || "")));
                                  }}
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    border: "1px solid #111",
                                    background: "#111",
                                    color: "#fff",
                                    fontWeight: 900,
                                  }}
                                >
                                  Use suggested label
                                </button>
                              </div>
                            </div>
                          ) : null}

                          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button onClick={() => advance("PASS")} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff", fontWeight: 900 }}>
                              PASS → Step {current.if_pass_next_step ?? 0}
                            </button>
                            <button onClick={() => advance("FAIL")} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #111", background: "#fff", color: "#111", fontWeight: 900 }}>
                              FAIL → Step {current.if_fail_next_step ?? 0}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ color: "#b00" }}>Could not find Step {currentStep}.</div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Current measurements list">
              {observations.length ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {observations.map((o, idx) => (
                    <li key={idx} style={{ marginBottom: 8 }}>
                      <b>{o.label}:</b> {o.value} {o.unit}
                      {o.note ? <span style={{ color: "#444" }}> — {o.note}</span> : null}
                      <button onClick={() => removeObservation(idx)} style={{ marginLeft: 10, padding: "2px 8px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: "#666" }}>No measurements added yet.</div>
              )}
            </SectionCard>
          </div>
        ) : (
          <SectionCard title="Raw output">
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{rawResult || "No results yet."}</pre>
          </SectionCard>
        )}
      </div>
    </div>
  );
}