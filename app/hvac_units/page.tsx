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

function SmallHint(props: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: "#555",
        background: "#fafafa",
        border: "1px solid #eee",
        padding: "10px 12px",
        borderRadius: 10,
        ...props.style,
      }}
    >
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

/** ---------- Networking helper ---------- */

async function safeReadJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    // If server returned HTML, plain text, etc.
    return { result: text };
  }
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

    const chosenUnit = unit === "other" ? guessDefaultUnit(label) : unit;
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

      {/* Measurements */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Field measurements / observations">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 140px", gap: 10, alignItems: "end" }}>
            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Label</div>
              <input value={obsLabel} onChange={(e) => setObsLabel(e.target.value)} placeholder="Suction Pressure" style={{ width: "100%", padding: 8 }} />
            </div>

            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Value</div>
              <input value={obsValue} onChange={(e) => setObsValue(e.target.value)} placeholder="72" style={{ width: "100%", padding: 8 }} />
            </div>

            <div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Unit</div>
              <select value={obsUnit} onChange={(e) => setObsUnit(e.target.value)} style={{ width: "100%", padding: 8 }}>
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Note (optional)</div>
            <input value={obsNote} onChange={(e) => setObsNote(e.target.value)} placeholder="frost on suction line, etc." style={{ width: "100%", padding: 8 }} />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={addMeasurement} style={{ padding: "10px 14px", fontWeight: 900 }}>
              Add measurement
            </button>

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
              <input type="checkbox" checked={autoConvert} onChange={(e) => setAutoConvert(e.target.checked)} />
              Auto-convert kPa/bar/°C/Pa → psi/°F/inWC
            </label>

            <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#555" }}>Mode:</span>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value as any)} style={{ padding: 8 }}>
                <option value="guided">Guided</option>
                <option value="flow">Flow</option>
              </select>
              {viewMode === "guided" && !guidedStarted ? (
                <button onClick={startGuided} style={{ padding: "10px 14px", fontWeight: 900 }}>
                  Start guided checks
                </button>
              ) : viewMode === "guided" ? (
                <button onClick={resetGuided} style={{ padding: "10px 14px", fontWeight: 900 }}>
                  Reset guided
                </button>
              ) : null}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Cooling presets</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {coolingPresets.map((p) => (
                  <ChipButton key={p.label} text={p.label} onClick={() => applyPreset(p.label, p.unit)} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Heating presets</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {heatingPresets.map((p) => (
                  <ChipButton key={p.label} text={p.label} onClick={() => applyPreset(p.label, p.unit)} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {observations.length ? (
              <div style={{ display: "grid", gap: 8 }}>
                {observations.map((o, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, borderTop: idx ? "1px solid #eee" : "none", paddingTop: idx ? 8 : 0 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900 }}>
                        {o.label} <Badge text={`${o.value} ${o.unit}`.trim()} />
                      </div>
                      {o.note ? <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{o.note}</div> : null}
                    </div>
                    <button onClick={() => removeObservation(idx)} style={{ padding: "6px 10px" }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <SmallHint style={{ marginTop: 8 }}>
                Add 1–2 key readings (pressures, temps, superheat/subcool, amp draw, static) then hit Diagnose again for sharper results.
              </SmallHint>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={updateDiagnosisNow} disabled={loading} style={{ padding: "10px 14px", fontWeight: 900 }}>
              Re-run Diagnose using measurements
            </button>
          </div>
        </SectionCard>
      </div>

      {/* Results */}
      <div style={{ marginTop: 16 }}>
        {parsed ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SectionCard title="Summary">
              <div style={{ fontSize: 14, lineHeight: 1.35 }}>{parsed.summary || "No summary returned."}</div>
            </SectionCard>

            <SectionCard title="Likely causes">
              {parsed.likely_causes?.length ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {parsed.likely_causes.map((c, idx) => (
                    <div key={idx} style={{ borderTop: idx ? "1px solid #eee" : "none", paddingTop: idx ? 10 : 0 }}>
                      <div style={{ fontWeight: 900 }}>
                        {c.cause || "Cause"}{" "}
                        {typeof c.probability_percent === "number" ? <Badge text={`${c.probability_percent}%`} /> : null}
                      </div>
                      {c.why ? <div style={{ marginTop: 4, color: "#444" }}>{c.why}</div> : null}
                      {typeof c.probability_percent === "number" ? <ProbBar pct={c.probability_percent} /> : null}
                      {c.what_points_to_it?.length ? (
                        <div style={{ marginTop: 6, fontSize: 12, color: "#333" }}>
                          <b>Points to it:</b> {c.what_points_to_it.join("; ")}
                        </div>
                      ) : null}
                      {c.what_rules_it_out?.length ? (
                        <div style={{ marginTop: 4, fontSize: 12, color: "#333" }}>
                          <b>Rules out:</b> {c.what_rules_it_out.join("; ")}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#666" }}>No likely causes returned.</div>
              )}
            </SectionCard>

            <SectionCard title="Decision tree (check this then that)">
              {parsed.decision_tree?.length ? (
                <ol style={{ margin: 0, paddingLeft: 18 }}>
                  {parsed.decision_tree
                    .slice()
                    .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
                    .map((t, idx) => (
                      <li key={idx} style={{ marginBottom: 10 }}>
                        <div style={{ fontWeight: 900 }}>
                          Step {t.step}: {t.check}
                        </div>
                        {t.how ? <div style={{ color: "#444" }}>How: {t.how}</div> : null}
                        {t.notes ? <div style={{ color: "#555", fontSize: 12 }}>Note: {t.notes}</div> : null}
                      </li>
                    ))}
                </ol>
              ) : (
                <div style={{ color: "#666" }}>No decision steps returned.</div>
              )}

              {viewMode === "guided" && guidedStarted && currentStep !== 0 && current ? (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                  <div style={{ fontWeight: 900 }}>Guided step: {current.step}</div>
                  <div style={{ marginTop: 4 }}>{current.check}</div>
                  <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                    <button onClick={() => advance("PASS")} style={{ padding: "10px 14px", fontWeight: 900 }}>
                      PASS
                    </button>
                    <button onClick={() => advance("FAIL")} style={{ padding: "10px 14px", fontWeight: 900 }}>
                      FAIL
                    </button>
                  </div>
                </div>
              ) : viewMode === "guided" && guidedStarted && currentStep === 0 ? (
                <SmallHint style={{ marginTop: 12 }}>Guided flow completed. Add readings + re-run Diagnose for next-level detail.</SmallHint>
              ) : null}
            </SectionCard>

            <SectionCard title="Parts to check">
              {parsed.parts_to_check?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {parsed.parts_to_check.map((p, idx) => (
                    <div key={idx} style={{ borderTop: idx ? "1px solid #eee" : "none", paddingTop: idx ? 10 : 0 }}>
                      <div style={{ fontWeight: 900 }}>
                        {p.part} {p.priority ? <Badge text={String(p.priority)} /> : null}
                      </div>
                      {p.why_suspect ? <div style={{ color: "#444" }}>{p.why_suspect}</div> : null}
                      {p.quick_test ? <div style={{ color: "#444", fontSize: 12, marginTop: 3 }}>Quick test: {p.quick_test}</div> : null}
                      {p.common_failure_modes?.length ? (
                        <div style={{ color: "#444", fontSize: 12, marginTop: 3 }}>Failures: {p.common_failure_modes.join("; ")}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint style={{}}>
                  After you Diagnose, the model can populate “Parts to check.” If you don’t see it yet, we’ll upgrade the API prompt next so it returns better parts + tests.
                </SmallHint>
              )}
            </SectionCard>

            <SectionCard title="Safety notes">
              {parsed.safety_notes?.length ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {parsed.safety_notes.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: "#666" }}>No safety notes returned.</div>
              )}
            </SectionCard>

            <SectionCard title="When to escalate">
              {parsed.when_to_escalate?.length ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {parsed.when_to_escalate.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: 6 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: "#666" }}>No escalation guidance returned.</div>
              )}
            </SectionCard>
          </div>
        ) : rawResult ? (
          <SectionCard title="Raw output">
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{rawResult}</pre>
          </SectionCard>
        ) : (
          <SmallHint style={{ marginTop: 16 }}>Run a Diagnose to see results.</SmallHint>
        )}
      </div>
    </div>
  );
}