
"use client";

import React, { useMemo, useState } from "react";

type Observation = { label: string; value: string; unit: string; note?: string };

type DiagnosisV2 = {
  summary?: string;
  confidence_0_to_100?: number;

  triage_questions?: { question: string; why_it_matters?: string; default_assumption_if_unknown?: string }[];

  hypotheses?: {
    cause: string;
    probability_percent?: number;
    why?: string;
    evidence_from_inputs?: string[];
    what_points_to_it?: string[];
    what_rules_it_out?: string[];
  }[];

  test_plan?: {
    step: number;
    check: string;
    how?: string;
    expected_if_good?: string;
    expected_if_bad?: string;
    if_good_next_step?: number;
    if_bad_next_step?: number;
    what_it_means?: string;
  }[];

  measurements_to_collect_next?: {
    measurement: string;
    where?: string;
    how?: string;
    expected_range?: string;
    why_it_matters?: string;
  }[];

  parts_to_check?: {
    part: string;
    priority?: "High" | "Medium" | "Low" | string;
    why_suspect?: string;
    quick_test?: string;
    common_failure_modes?: string[];
    notes?: string;
  }[];

  actions_now?: { action: string; why?: string; time_est_minutes?: number }[];

  safety_notes?: string[];
  when_to_escalate?: string[];
};

/** ---------- UI ---------- */

function Card(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, background: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ fontWeight: 900 }}>{props.title}</div>
        {props.right}
      </div>
      {props.children}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd", background: "#f7f7f7", fontSize: 12 }}>
      {text}
    </span>
  );
}

function SmallButton(props: { text: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: props.disabled ? "#f3f3f3" : "#fff",
        fontWeight: 900,
        cursor: props.disabled ? "not-allowed" : "pointer",
      }}
    >
      {props.text}
    </button>
  );
}

function ProbBar({ pct }: { pct: number }) {
  const safe = Math.max(0, Math.min(100, pct || 0));
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 8, background: "#eee", borderRadius: 999 }}>
        <div style={{ width: `${safe}%`, height: 8, background: "#111", borderRadius: 999 }} />
      </div>
      <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{safe}%</div>
    </div>
  );
}

/** ---------- conversions ---------- */

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

function looksLikePressure(label: string) {
  const s = label.toLowerCase();
  return s.includes("suction") || s.includes("liquid") || s.includes("discharge") || s.includes("head") || s.includes("pressure");
}
function looksLikeTemp(label: string) {
  const s = label.toLowerCase();
  return s.includes("temp") || s.includes("temperature") || s.includes("superheat") || s.includes("subcool") || s.includes("delta") || s.includes("heat rise");
}
function looksLikeStatic(label: string) {
  const s = label.toLowerCase();
  return s.includes("static") || s.includes("esp") || s.includes("inwc");
}
function guessUnit(label: string) {
  if (looksLikePressure(label)) return "psi";
  if (looksLikeStatic(label)) return "inWC";
  if (looksLikeTemp(label)) return "°F";
  return "other";
}

/** ---------- Page ---------- */

export default function HVACUnitsPage() {
  const [propertyType, setPropertyType] = useState("Commercial");
  const [equipmentType, setEquipmentType] = useState("RTU");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [symptom, setSymptom] = useState("");

  const refrigerantOptions = ["Unknown", "R-410A", "R-22", "R-32", "R-454B", "R-134a", "R-407C", "R-404A", "R-448A", "R-449A", "R-290 (Propane)", "R-600a (Isobutane)"];
  const [refrigerantType, setRefrigerantType] = useState<string>("Unknown");

  const [rawResult, setRawResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Observations
  const [observations, setObservations] = useState<Observation[]>([]);
  const [obsLabel, setObsLabel] = useState("");
  const [obsValue, setObsValue] = useState("");
  const [obsUnit, setObsUnit] = useState("psi");
  const [obsNote, setObsNote] = useState("");
  const [autoConvert, setAutoConvert] = useState(true);

  // Guided path log (optional, helps model not repeat steps)
  const [pathLog, setPathLog] = useState<{ step: number; decision: "GOOD" | "BAD"; nextStep: number }[]>([]);

  // Tabs
  const [tab, setTab] = useState<"overview" | "tests" | "measurements" | "parts">("overview");

  const parsed = useMemo(() => {
    if (!rawResult) return null;
    try {
      const start = rawResult.indexOf("{");
      const end = rawResult.lastIndexOf("}");
      const slice = start >= 0 && end > start ? rawResult.slice(start, end + 1) : rawResult;
      return JSON.parse(slice) as DiagnosisV2;
    } catch {
      return null;
    }
  }, [rawResult]);

  const unitOptions = ["psi", "kPa", "bar", "°F", "°C", "amps", "volts", "inWC", "Pa", "ohms", "µA", "%", "other"];

  const coolingPresets = [
    { label: "Suction Pressure", unit: "psi" },
    { label: "Liquid Pressure", unit: "psi" },
    { label: "Discharge / Head Pressure", unit: "psi" },
    { label: "Superheat", unit: "°F" },
    { label: "Subcool", unit: "°F" },
    { label: "Return Air Temp", unit: "°F" },
    { label: "Supply Air Temp", unit: "°F" },
    { label: "Delta T (Return-Supply)", unit: "°F" },
    { label: "Outdoor Ambient Temp", unit: "°F" },
    { label: "Condenser Split (Cond Out - Ambient)", unit: "°F" },
    { label: "Compressor Amps (RLA)", unit: "amps" },
    { label: "Condenser Fan Amps", unit: "amps" },
    { label: "Line Voltage", unit: "volts" },
    { label: "Control Voltage (R-C)", unit: "volts" },
    { label: "External Static Pressure (ESP)", unit: "inWC" },
  ];

  const heatingPresets = [
    { label: "Thermostat Call (R-W)", unit: "volts" },
    { label: "Gas Inlet Pressure", unit: "inWC" },
    { label: "Manifold Pressure", unit: "inWC" },
    { label: "Heat Rise (Supply-Return)", unit: "°F" },
    { label: "Inducer Amps", unit: "amps" },
    { label: "Ignitor Amps", unit: "amps" },
    { label: "Flame Sensor µA", unit: "µA" },
    { label: "Limit Switch Continuity", unit: "ohms" },
    { label: "Line Voltage", unit: "volts" },
    { label: "Control Voltage (R-C)", unit: "volts" },
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

    let chosenUnit = unit === "other" ? guessUnit(label) : unit;
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

  async function postDiagnose(extra?: { pathLog?: any }) {
    const m = manufacturer.trim();
    const s = symptom.trim();
    if (!m || !s) {
      setRawResult("Please fill in at least Manufacturer and Symptom.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        propertyType,
        equipmentType,
        manufacturer: m,
        model: model.trim(),
        symptom: s,
        refrigerantType,
        observations,
        pathLog: extra?.pathLog || pathLog,
      };

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
    } finally {
      setLoading(false);
    }
  }

  function resetPath() {
    setPathLog([]);
  }

  function markTestStep(step: number, decision: "GOOD" | "BAD", nextStep: number) {
    setPathLog((prev) => [...prev, { step, decision, nextStep }]);
  }

  return (
    <div style={{ padding: 20, maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Skilled Trades AI — HVAC Diagnose</h1>
          <div style={{ marginTop: 6, color: "#444" }}>
            Field-first troubleshooting: measurements → branching tests → likely failure → next action.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <SmallButton text="Diagnose / Refresh" onClick={() => postDiagnose()} disabled={loading} />
          <SmallButton text="Reset Path Log" onClick={resetPath} />
        </div>
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

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <SmallButton text={loading ? "Diagnosing..." : "Diagnose"} onClick={() => postDiagnose()} disabled={loading} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
            <input type="checkbox" checked={autoConvert} onChange={(e) => setAutoConvert(e.target.checked)} />
            Auto-convert units (kPa→psi, °C→°F, Pa→inWC)
          </label>
          {parsed?.confidence_0_to_100 != null ? <Badge text={`Confidence: ${parsed.confidence_0_to_100}/100`} /> : null}
        </div>
      </div>

      {/* Measurement capture */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
        <Card title="Add Measurements / Observations" right={<Badge text={`${observations.length} saved`} />}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {(symptom.toLowerCase().includes("heat") ? heatingPresets : coolingPresets).map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.label, p.unit)}
                style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid #ddd", background: "#fff", fontWeight: 900, cursor: "pointer" }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.6fr 0.6fr", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Label</div>
              <input value={obsLabel} onChange={(e) => setObsLabel(e.target.value)} placeholder="Suction Pressure" style={{ width: "100%", padding: 8 }} />
            </div>
            <div>
              <div style={{ fontWeight: 900 }}>Value</div>
              <input value={obsValue} onChange={(e) => setObsValue(e.target.value)} placeholder="72" style={{ width: "100%", padding: 8 }} />
            </div>
            <div>
              <div style={{ fontWeight: 900 }}>Unit</div>
              <select value={obsUnit} onChange={(e) => setObsUnit(e.target.value)} style={{ width: "100%", padding: 8 }}>
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontWeight: 900 }}>Note (optional)</div>
              <input value={obsNote} onChange={(e) => setObsNote(e.target.value)} placeholder="Compressor running, frost on suction line..." style={{ width: "100%", padding: 8 }} />
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SmallButton text="Add" onClick={addMeasurement} />
            <SmallButton text="Re-run with measurements" onClick={() => postDiagnose()} disabled={loading} />
          </div>
        </Card>

        <Card title="Saved Measurements">
          {observations.length === 0 ? (
            <div style={{ color: "#555" }}>Add measurements above — the diagnosis gets dramatically better as data increases.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {observations.map((o, idx) => (
                <div key={idx} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 900 }}>{o.label}</div>
                  <div style={{ color: "#333" }}>
                    {o.value} {o.unit} {o.note ? <span style={{ color: "#666" }}>— {o.note}</span> : null}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <SmallButton text="Remove" onClick={() => removeObservation(idx)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <SmallButton text="Overview" onClick={() => setTab("overview")} disabled={tab === "overview"} />
        <SmallButton text="Tests (Branching)" onClick={() => setTab("tests")} disabled={tab === "tests"} />
        <SmallButton text="Next Measurements" onClick={() => setTab("measurements")} disabled={tab === "measurements"} />
        <SmallButton text="Parts" onClick={() => setTab("parts")} disabled={tab === "parts"} />
      </div>

      {/* Results */}
      <div style={{ marginTop: 12 }}>
        {!rawResult ? (
          <Card title="Results">
            <div style={{ color: "#555" }}>Run Diagnose to generate a deep, step-by-step plan.</div>
          </Card>
        ) : !parsed ? (
          <Card title="Raw output">
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{rawResult}</pre>
          </Card>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {tab === "overview" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Card title="Summary" right={parsed.confidence_0_to_100 != null ? <Badge text={`${parsed.confidence_0_to_100}/100`} /> : undefined}>
                  <div style={{ color: "#222", fontWeight: 800 }}>{parsed.summary || "No summary returned."}</div>

                  <div style={{ marginTop: 12, fontWeight: 900 }}>Actions now</div>
                  {parsed.actions_now?.length ? (
                    <ol style={{ margin: 0, paddingLeft: 18 }}>
                      {parsed.actions_now.map((a, i) => (
                        <li key={i} style={{ marginBottom: 8 }}>
                          <div style={{ fontWeight: 900 }}>{a.action}</div>
                          <div style={{ color: "#444" }}>{a.why}</div>
                          {a.time_est_minutes != null ? <div style={{ color: "#666" }}>~{a.time_est_minutes} min</div> : null}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div style={{ color: "#555" }}>No actions returned.</div>
                  )}
                </Card>

                <Card title="Triage questions (what to ask next)">
                  {parsed.triage_questions?.length ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      {parsed.triage_questions.map((q, i) => (
                        <div key={i} style={{ borderTop: i ? "1px solid #eee" : "none", paddingTop: i ? 10 : 0 }}>
                          <div style={{ fontWeight: 900 }}>{q.question}</div>
                          {q.why_it_matters ? <div style={{ color: "#444" }}>Why: {q.why_it_matters}</div> : null}
                          {q.default_assumption_if_unknown ? <div style={{ color: "#666" }}>If unknown: {q.default_assumption_if_unknown}</div> : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#555" }}>No triage questions returned.</div>
                  )}
                </Card>

                <Card title="Hypotheses (ranked)">
                  {parsed.hypotheses?.length ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      {parsed.hypotheses.map((h, i) => (
                        <div key={i} style={{ borderTop: i ? "1px solid #eee" : "none", paddingTop: i ? 10 : 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ fontWeight: 900 }}>{h.cause}</div>
                            {h.probability_percent != null ? <Badge text={`${h.probability_percent}%`} /> : null}
                          </div>
                          {h.probability_percent != null ? <ProbBar pct={h.probability_percent} /> : null}
                          {h.why ? <div style={{ color: "#444", marginTop: 6 }}>{h.why}</div> : null}

                          {!!h.evidence_from_inputs?.length ? (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ fontWeight: 900, color: "#333" }}>Evidence from inputs</div>
                              <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {h.evidence_from_inputs.map((x, idx) => (
                                  <li key={idx} style={{ color: "#444" }}>
                                    {x}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {!!h.what_rules_it_out?.length ? (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ fontWeight: 900, color: "#333" }}>Rules it out</div>
                              <ul style={{ margin: 0, paddingLeft: 18 }}>
                                {h.what_rules_it_out.map((x, idx) => (
                                  <li key={idx} style={{ color: "#444" }}>
                                    {x}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#555" }}>No hypotheses returned.</div>
                  )}
                </Card>

                <Card title="Safety + Escalation">
                  <div style={{ fontWeight: 900 }}>Safety notes</div>
                  {parsed.safety_notes?.length ? (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {parsed.safety_notes.map((s, i) => (
                        <li key={i} style={{ color: "#444" }}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ color: "#555" }}>None returned.</div>
                  )}

                  <div style={{ marginTop: 10, fontWeight: 900 }}>When to escalate</div>
                  {parsed.when_to_escalate?.length ? (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {parsed.when_to_escalate.map((s, i) => (
                        <li key={i} style={{ color: "#444" }}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ color: "#555" }}>None returned.</div>
                  )}
                </Card>
              </div>
            ) : null}

            {tab === "tests" ? (
              <Card title="Branching Test Plan (10 steps)">
                {parsed.test_plan?.length ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    {parsed.test_plan
                      .slice()
                      .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
                      .map((t, i) => (
                        <div key={i} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <div style={{ fontWeight: 900 }}>
                              Step {t.step}: {t.check}
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <SmallButton
                                text={`Mark GOOD → ${t.if_good_next_step ?? 0}`}
                                onClick={() => markTestStep(t.step, "GOOD", t.if_good_next_step ?? 0)}
                              />
                              <SmallButton
                                text={`Mark BAD → ${t.if_bad_next_step ?? 0}`}
                                onClick={() => markTestStep(t.step, "BAD", t.if_bad_next_step ?? 0)}
                              />
                            </div>
                          </div>

                          {t.how ? <div style={{ color: "#444", marginTop: 6 }}>How: {t.how}</div> : null}
                          {t.expected_if_good ? <div style={{ color: "#444" }}>Good: {t.expected_if_good}</div> : null}
                          {t.expected_if_bad ? <div style={{ color: "#444" }}>Bad: {t.expected_if_bad}</div> : null}
                          {t.what_it_means ? <div style={{ color: "#666", marginTop: 6 }}>Meaning: {t.what_it_means}</div> : null}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div style={{ color: "#555" }}>No test plan returned.</div>
                )}

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <SmallButton text="Re-run using my path log" onClick={() => postDiagnose({ pathLog })} disabled={loading} />
                  <Badge text={`Path log entries: ${pathLog.length}`} />
                </div>
              </Card>
            ) : null}

            {tab === "measurements" ? (
              <Card title="Next Measurements to Collect (8)">
                {parsed.measurements_to_collect_next?.length ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    {parsed.measurements_to_collect_next.map((m, i) => (
                      <div key={i} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontWeight: 900 }}>{m.measurement}</div>
                        {m.where ? <div style={{ color: "#444" }}>Where: {m.where}</div> : null}
                        {m.how ? <div style={{ color: "#444" }}>How: {m.how}</div> : null}
                        {m.expected_range ? <div style={{ color: "#444" }}>Expected: {m.expected_range}</div> : null}
                        {m.why_it_matters ? <div style={{ color: "#666" }}>Why: {m.why_it_matters}</div> : null}
                        <div style={{ marginTop: 10 }}>
                          <SmallButton text="Use as label" onClick={() => applyPreset(m.measurement, guessUnit(m.measurement))} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#555" }}>No measurement suggestions returned.</div>
                )}
              </Card>
            ) : null}

            {tab === "parts" ? (
              <Card title="Parts to Check (10)">
                {parsed.parts_to_check?.length ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    {parsed.parts_to_check.map((p, i) => (
                      <div key={i} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ fontWeight: 900 }}>{p.part}</div>
                          {p.priority ? <Badge text={`Priority: ${p.priority}`} /> : null}
                        </div>
                        {p.why_suspect ? <div style={{ color: "#444", marginTop: 6 }}>Why: {p.why_suspect}</div> : null}
                        {p.quick_test ? <div style={{ color: "#444" }}>Quick test: {p.quick_test}</div> : null}
                        {!!p.common_failure_modes?.length ? (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ fontWeight: 900, color: "#333" }}>Common failures</div>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {p.common_failure_modes.map((x, idx) => (
                                <li key={idx} style={{ color: "#444" }}>
                                  {x}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {p.notes ? <div style={{ color: "#666", marginTop: 6 }}>Notes: {p.notes}</div> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#555" }}>No parts returned.</div>
                )}
              </Card>
            ) : null}

            {/* Debug */}
            <Card title="Raw JSON (debug)">
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{rawResult}</pre>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}