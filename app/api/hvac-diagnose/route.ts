import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Upgrade: Derived calculations + smarter diagnosis text.
 * - Extracts readings from observations.
 * - Computes delta-T, superheat/subcool when possible (using PT tables for common refrigerants).
 * - Adds "pattern flags" and "derived summary" into the AI context.
 * - Guarantees valid JSON output; repairs once; falls back to rules-based if needed.
 */

type Observation = { label: string; value: string; unit: string; note?: string };
type PathLog = { step: number; decision: "PASS" | "FAIL"; nextStep: number };

type Diagnosis = {
  summary: string;
  likely_causes: {
    cause: string;
    probability_percent: number;
    why: string;
    what_points_to_it: string[];
    what_rules_it_out: string[];
  }[];
  field_measurements_to_collect: {
    measurement: string;
    where: string;
    how: string;
    expected_range: string;
    why_it_matters: string;
  }[];
  decision_tree: {
    step: number;
    check: string;
    how: string;
    pass_condition: string;
    fail_condition: string;
    if_pass_next_step: number;
    if_fail_next_step: number;
    notes: string;
  }[];
  parts_to_check: {
    part: string;
    why_suspect: string;
    quick_test: string;
    common_failure_modes: string[];
    priority: "High" | "Medium" | "Low";
  }[];
  safety_notes: string[];
  when_to_escalate: string[];
};

/** ---------------- small utils ---------------- */

function s(v: any) {
  return String(v ?? "").trim();
}

function toNumber(raw: any): number | null {
  const n = Number(String(raw ?? "").replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function clampPct(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function formatObservations(observations: Observation[]): string {
  if (!Array.isArray(observations) || observations.length === 0) return "None";
  return observations
    .map((o, i) => {
      const label = s(o?.label) || `Observation ${i + 1}`;
      const value = s(o?.value);
      const unit = s(o?.unit);
      const note = s(o?.note);
      return `- ${label}: ${value}${unit ? " " + unit : ""}${note ? ` (note: ${note})` : ""}`;
    })
    .join("\n");
}

function formatPath(pathLog: PathLog[]): string {
  if (!Array.isArray(pathLog) || pathLog.length === 0) return "None";
  return pathLog.map((p) => `- Step ${p.step}: ${p.decision} -> ${p.nextStep}`).join("\n");
}

function normLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function containsAny(hay: string, needles: string[]) {
  return needles.some((n) => hay.includes(n));
}

/** ---------------- unit conversions (to standard) ---------------- */

function toPsi(value: number, unit: string): number | null {
  const u = unit.trim();
  if (u === "psi") return value;
  if (u === "kPa") return value * 0.1450377377;
  if (u === "bar") return value * 14.50377377;
  return null;
}

function toF(value: number, unit: string): number | null {
  const u = unit.trim();
  if (u === "°F" || u === "F") return value;
  if (u === "°C" || u === "C") return (value * 9) / 5 + 32;
  return null;
}

/** ---------------- PT tables + interpolation ----------------
 *  These are intentionally "field-use" approximations, not lab grade.
 *  Enough to drive better logic and better AI outputs.
 */

type PTPoint = { psi: number; satF: number };
type PTTable = PTPoint[];

const PT: Record<string, PTTable> = {
  "R-410A": [
    { psi: 60, satF: 12 },
    { psi: 70, satF: 20 },
    { psi: 80, satF: 27 },
    { psi: 90, satF: 33 },
    { psi: 100, satF: 39 },
    { psi: 110, satF: 44 },
    { psi: 120, satF: 49 },
    { psi: 130, satF: 54 },
    { psi: 140, satF: 58 },
    { psi: 150, satF: 62 },
    { psi: 160, satF: 66 },
    { psi: 170, satF: 69 },
    { psi: 180, satF: 72 },
    { psi: 190, satF: 75 },
    { psi: 200, satF: 78 },
    { psi: 225, satF: 84 },
    { psi: 250, satF: 90 },
    { psi: 275, satF: 95 },
    { psi: 300, satF: 100 },
    { psi: 325, satF: 105 },
    { psi: 350, satF: 109 },
    { psi: 375, satF: 113 },
    { psi: 400, satF: 117 },
  ],
  "R-22": [
    { psi: 40, satF: 15 },
    { psi: 50, satF: 25 },
    { psi: 60, satF: 33 },
    { psi: 70, satF: 40 },
    { psi: 80, satF: 46 },
    { psi: 90, satF: 52 },
    { psi: 100, satF: 57 },
    { psi: 110, satF: 61 },
    { psi: 120, satF: 66 },
    { psi: 130, satF: 70 },
    { psi: 140, satF: 74 },
    { psi: 150, satF: 77 },
    { psi: 160, satF: 81 },
    { psi: 180, satF: 86 },
    { psi: 200, satF: 91 },
    { psi: 225, satF: 97 },
    { psi: 250, satF: 103 },
    { psi: 275, satF: 108 },
    { psi: 300, satF: 113 },
  ],
  "R-134a": [
    { psi: 20, satF: 18 },
    { psi: 25, satF: 24 },
    { psi: 30, satF: 29 },
    { psi: 35, satF: 34 },
    { psi: 40, satF: 38 },
    { psi: 45, satF: 42 },
    { psi: 50, satF: 46 },
    { psi: 60, satF: 53 },
    { psi: 70, satF: 59 },
    { psi: 80, satF: 64 },
    { psi: 90, satF: 69 },
    { psi: 100, satF: 73 },
    { psi: 120, satF: 81 },
    { psi: 140, satF: 88 },
    { psi: 160, satF: 94 },
    { psi: 180, satF: 99 },
    { psi: 200, satF: 104 },
  ],
  // For refrigerants not in table, we won’t compute sat temps.
};

function interpSatF(table: PTTable, psi: number): number | null {
  if (!table?.length || !Number.isFinite(psi)) return null;

  // clamp to ends
  if (psi <= table[0].psi) return table[0].satF;
  if (psi >= table[table.length - 1].psi) return table[table.length - 1].satF;

  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (psi >= a.psi && psi <= b.psi) {
      const t = (psi - a.psi) / (b.psi - a.psi);
      return a.satF + t * (b.satF - a.satF);
    }
  }
  return null;
}

/** ---------------- reading extraction ---------------- */

type Derived = {
  suctionPsi?: number;
  liquidPsi?: number;
  dischargePsi?: number;

  suctionLineTempF?: number;
  liquidLineTempF?: number;
  returnAirTempF?: number;
  supplyAirTempF?: number;

  deltaTF?: number;

  satSuctionF?: number;
  satLiquidF?: number;

  superheatF?: number;
  subcoolF?: number;

  flags: string[];
  derivedSummaryLines: string[];
};

function extractReadings(refrigerantType: string, observations: Observation[]): Derived {
  const d: Derived = { flags: [], derivedSummaryLines: [] };
  const table = PT[refrigerantType];

  const findNum = (labelNeedles: string[], kind: "psi" | "tempF") => {
    for (const o of observations || []) {
      const L = normLabel(s(o?.label));
      if (!L) continue;
      if (!containsAny(L, labelNeedles)) continue;

      const n = toNumber(o?.value);
      if (n === null) continue;

      if (kind === "psi") {
        const psi = toPsi(n, s(o?.unit));
        if (psi !== null) return psi;
      } else {
        const f = toF(n, s(o?.unit));
        if (f !== null) return f;
      }
    }
    return null;
  };

  // Pressures
  const suction = findNum(["suction pressure", "suction", "low side", "low pressure"], "psi");
  const liquid = findNum(["liquid pressure", "liquid", "high side", "head pressure", "head", "condensing"], "psi");
  const discharge = findNum(["discharge pressure", "discharge"], "psi");

  if (suction !== null) d.suctionPsi = Math.round(suction * 10) / 10;
  if (liquid !== null) d.liquidPsi = Math.round(liquid * 10) / 10;
  if (discharge !== null) d.dischargePsi = Math.round(discharge * 10) / 10;

  // Temps
  const suctionLine = findNum(["suction line temp", "suction temp", "suction line temperature"], "tempF");
  const liquidLine = findNum(["liquid line temp", "liquid temp", "liquid line temperature"], "tempF");
  const ret = findNum(["return air temp", "return temp", "return air"], "tempF");
  const sup = findNum(["supply air temp", "supply temp", "supply air"], "tempF");

  if (suctionLine !== null) d.suctionLineTempF = Math.round(suctionLine * 10) / 10;
  if (liquidLine !== null) d.liquidLineTempF = Math.round(liquidLine * 10) / 10;
  if (ret !== null) d.returnAirTempF = Math.round(ret * 10) / 10;
  if (sup !== null) d.supplyAirTempF = Math.round(sup * 10) / 10;

  if (d.returnAirTempF != null && d.supplyAirTempF != null) {
    d.deltaTF = Math.round((d.returnAirTempF - d.supplyAirTempF) * 10) / 10;
  }

  // If PT table + pressures exist → compute saturation temps
  if (table && d.suctionPsi != null) {
    const sat = interpSatF(table, d.suctionPsi);
    if (sat != null) d.satSuctionF = Math.round(sat * 10) / 10;
  }
  if (table && d.liquidPsi != null) {
    const sat = interpSatF(table, d.liquidPsi);
    if (sat != null) d.satLiquidF = Math.round(sat * 10) / 10;
  }

  // Superheat/subcool derived if we have line temps and sat temps
  if (d.suctionLineTempF != null && d.satSuctionF != null) {
    d.superheatF = Math.round((d.suctionLineTempF - d.satSuctionF) * 10) / 10;
  }
  if (d.liquidLineTempF != null && d.satLiquidF != null) {
    d.subcoolF = Math.round((d.satLiquidF - d.liquidLineTempF) * 10) / 10;
  }

  // Flags / heuristics (keeps it realistic without pretending precision)
  if (d.deltaTF != null) {
    if (d.deltaTF < 12) d.flags.push("Low delta-T (possible low capacity / airflow / charge issue)");
    if (d.deltaTF > 25) d.flags.push("High delta-T (possible airflow restriction or sensor placement)");
  }

  // If SH/SC computed, add classic patterns
  if (d.superheatF != null && d.subcoolF != null) {
    if (d.superheatF >= 20 && d.subcoolF <= 5) d.flags.push("Pattern: high superheat + low subcool → likely undercharge / leak");
    if (d.superheatF >= 20 && d.subcoolF >= 12) d.flags.push("Pattern: high superheat + high subcool → likely restriction / feeding issue");
    if (d.superheatF <= 5 && d.subcoolF >= 12) d.flags.push("Pattern: low superheat + high subcool → possible overcharge / airflow issue");
    if (d.superheatF <= 5 && d.subcoolF <= 5) d.flags.push("Pattern: low superheat + low subcool → possible low load / metering issue");
  }

  // Derived summary lines (for model + UI)
  if (d.suctionPsi != null) d.derivedSummaryLines.push(`Suction: ${d.suctionPsi} psi`);
  if (d.liquidPsi != null) d.derivedSummaryLines.push(`Liquid/Head: ${d.liquidPsi} psi`);
  if (d.returnAirTempF != null) d.derivedSummaryLines.push(`Return air: ${d.returnAirTempF} °F`);
  if (d.supplyAirTempF != null) d.derivedSummaryLines.push(`Supply air: ${d.supplyAirTempF} °F`);
  if (d.deltaTF != null) d.derivedSummaryLines.push(`Delta-T: ${d.deltaTF} °F`);

  if (d.satSuctionF != null) d.derivedSummaryLines.push(`Evap sat: ~${d.satSuctionF} °F (from PT)`);
  if (d.satLiquidF != null) d.derivedSummaryLines.push(`Cond sat: ~${d.satLiquidF} °F (from PT)`);
  if (d.superheatF != null) d.derivedSummaryLines.push(`Superheat: ~${d.superheatF} °F (derived)`);
  if (d.subcoolF != null) d.derivedSummaryLines.push(`Subcool: ~${d.subcoolF} °F (derived)`);

  return d;
}

/** ---------------- normalize output to protect UI ---------------- */

function normalizeLikelyCauses(list: Diagnosis["likely_causes"]): Diagnosis["likely_causes"] {
  const arr = Array.isArray(list) ? list.slice(0, 6) : [];
  while (arr.length < 6) {
    arr.push({
      cause: "Unknown / needs more data",
      probability_percent: 0,
      why: "Not enough measurements to confirm.",
      what_points_to_it: ["Missing key readings"],
      what_rules_it_out: ["More field data needed"],
    });
  }

  const p = arr.map((c) => clampPct(Number(c.probability_percent)));
  let sum = p.reduce((a, b) => a + b, 0);

  if (sum === 0) {
    p[0] = 30;
    p[1] = 20;
    p[2] = 15;
    p[3] = 15;
    p[4] = 10;
    p[5] = 10;
    sum = 100;
  }

  const normalized = p.map((x) => Math.round((x / sum) * 100));
  let drift = 100 - normalized.reduce((a, b) => a + b, 0);
  normalized[0] += drift;

  return arr.map((c, i) => ({
    cause: s(c.cause) || "Cause",
    probability_percent: normalized[i],
    why: s(c.why) || "Reason not provided.",
    what_points_to_it: Array.isArray(c.what_points_to_it) ? c.what_points_to_it.slice(0, 4).map(s).filter(Boolean) : [],
    what_rules_it_out: Array.isArray(c.what_rules_it_out) ? c.what_rules_it_out.slice(0, 4).map(s).filter(Boolean) : [],
  }));
}

function normalizeDecisionTree(list: Diagnosis["decision_tree"]): Diagnosis["decision_tree"] {
  const steps = Array.isArray(list) ? list.slice(0, 7) : [];
  const out: Diagnosis["decision_tree"] = [];

  for (let i = 1; i <= 7; i++) {
    const s0 = steps.find((x) => Number(x?.step) === i) || steps[i - 1];
    out.push({
      step: i,
      check: s(s0?.check) || `Step ${i} check`,
      how: s(s0?.how) || "Perform the check safely using standard instruments.",
      pass_condition: s(s0?.pass_condition) || "Reading/condition is normal.",
      fail_condition: s(s0?.fail_condition) || "Reading/condition is abnormal.",
      if_pass_next_step: i === 7 ? 0 : Number.isFinite(Number(s0?.if_pass_next_step)) ? Number(s0?.if_pass_next_step) : i + 1,
      if_fail_next_step: i === 7 ? 0 : Number.isFinite(Number(s0?.if_fail_next_step)) ? Number(s0?.if_fail_next_step) : i + 1,
      notes: s(s0?.notes) || "If unsure, collect a confirming measurement.",
    });
  }

  out[6].if_pass_next_step = 0;
  out[6].if_fail_next_step = 0;
  return out;
}

function normalizeMeasurements(list: Diagnosis["field_measurements_to_collect"]): Diagnosis["field_measurements_to_collect"] {
  const arr = Array.isArray(list) ? list.slice(0, 4) : [];
  while (arr.length < 4) {
    arr.push({
      measurement: "Key diagnostic reading",
      where: "At the appropriate service port / test point",
      how: "Use proper gauges/meters",
      expected_range: "Varies by equipment",
      why_it_matters: "Helps confirm the likely cause.",
    });
  }
  return arr.map((m) => ({
    measurement: s(m.measurement) || "Measurement",
    where: s(m.where) || "Where not provided",
    how: s(m.how) || "How not provided",
    expected_range: s(m.expected_range) || "Varies",
    why_it_matters: s(m.why_it_matters) || "Helps isolate the fault.",
  }));
}

function normalizeParts(list: Diagnosis["parts_to_check"]): Diagnosis["parts_to_check"] {
  const arr = Array.isArray(list) ? list.slice(0, 6) : [];
  while (arr.length < 6) {
    arr.push({
      part: "Component",
      why_suspect: "Common failure point.",
      quick_test: "Perform a safe basic check.",
      common_failure_modes: ["Open/short", "Out of spec"],
      priority: "Medium",
    });
  }
  return arr.map((p) => ({
    part: s(p.part) || "Part",
    why_suspect: s(p.why_suspect) || "Reason not provided.",
    quick_test: s(p.quick_test) || "Test not provided.",
    common_failure_modes: Array.isArray(p.common_failure_modes)
      ? p.common_failure_modes.slice(0, 4).map(s).filter(Boolean)
      : ["Unknown"],
    priority: (s(p.priority) as any) === "High" || (s(p.priority) as any) === "Low" ? (s(p.priority) as any) : "Medium",
  }));
}

function normalizeFinal(d: any): Diagnosis {
  const base: Diagnosis = {
    summary: s(d?.summary) || "Diagnosis generated.",
    likely_causes: normalizeLikelyCauses(d?.likely_causes),
    field_measurements_to_collect: normalizeMeasurements(d?.field_measurements_to_collect),
    decision_tree: normalizeDecisionTree(d?.decision_tree),
    parts_to_check: normalizeParts(d?.parts_to_check),
    safety_notes: Array.isArray(d?.safety_notes) ? d.safety_notes.slice(0, 2).map(s).filter(Boolean) : [],
    when_to_escalate: Array.isArray(d?.when_to_escalate) ? d.when_to_escalate.slice(0, 2).map(s).filter(Boolean) : [],
  };

  while (base.safety_notes.length < 2) base.safety_notes.push("Follow lockout/tagout and verify power is isolated before opening panels.");
  while (base.when_to_escalate.length < 2) base.when_to_escalate.push("Escalate if repeated trips, abnormal compressor amps, or unsafe conditions are present.");

  return base;
}

/** ---------------- OpenAI call (JSON mode) ---------------- */

async function openaiJson(apiKey: string, prompt: string, maxTokens: number) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.15,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an expert HVAC/R service technician. Output MUST be valid JSON only. No markdown. No commentary.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = data?.error?.message || "OpenAI request failed";
    const code = data?.error?.code || "";
    throw new Error(`OpenAI error (${r.status}) ${code}: ${msg}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") throw new Error("OpenAI returned empty content");
  return content;
}

/** ---------------- rules fallback (keeps app usable) ---------------- */

function rulesOnlyFallback(summaryExtra: string): Diagnosis {
  return normalizeFinal({
    summary:
      "Rules-only diagnosis (AI output was malformed). " +
      summaryExtra +
      " Add 1–2 key readings (pressures/temps/amps) then re-run to sharpen probabilities.",
    likely_causes: [
      {
        cause: "Undercharge / leak",
        probability_percent: 30,
        why: "Common when suction is low and cooling is weak.",
        what_points_to_it: ["Low suction", "High superheat or low subcool pattern"],
        what_rules_it_out: ["Normal SH/SC", "Normal pressures and delta-T"],
      },
      {
        cause: "Airflow restriction",
        probability_percent: 20,
        why: "Dirty filter/coil reduces capacity and can mimic low charge.",
        what_points_to_it: ["High delta-T or weak airflow", "Frosting at coil"],
        what_rules_it_out: ["Normal airflow/ESP", "Clean filter/coil"],
      },
      {
        cause: "Restriction (TXV/drier)",
        probability_percent: 15,
        why: "Can drive low suction and abnormal SH/SC.",
        what_points_to_it: ["High superheat + high subcool pattern", "Temp drop across drier"],
        what_rules_it_out: ["Normal SH/SC", "No temp drop across restrictions"],
      },
      {
        cause: "Condenser heat rejection issue",
        probability_percent: 15,
        why: "Dirty condenser or fan problem reduces cooling.",
        what_points_to_it: ["High head pressure", "Hot condenser outlet air"],
        what_rules_it_out: ["Normal head pressure", "Good condenser airflow"],
      },
      {
        cause: "Controls / economizer / sensor issue",
        probability_percent: 10,
        why: "Bad control logic can look like a refrigeration fault.",
        what_points_to_it: ["Wrong mode/damper position", "Sensor out of range"],
        what_rules_it_out: ["Correct calls and sensors verified"],
      },
      {
        cause: "Compressor inefficiency",
        probability_percent: 10,
        why: "Worn valves can reduce capacity.",
        what_points_to_it: ["Abnormal amps vs RLA", "Poor pressure ratio / low capacity"],
        what_rules_it_out: ["Normal amps and pressures with normal cooling"],
      },
    ],
    field_measurements_to_collect: [
      { measurement: "Suction pressure", where: "Suction service port", how: "Gauge manifold", expected_range: "By refrigerant/load", why_it_matters: "Evap saturation & charge clue." },
      { measurement: "Liquid/head pressure", where: "Liquid/high side port", how: "Gauge manifold", expected_range: "By ambient", why_it_matters: "Condensing performance clue." },
      { measurement: "Return & supply temp (delta-T)", where: "Return and supply", how: "Probe thermometer", expected_range: "~15–20°F (varies)", why_it_matters: "Quick capacity/airflow indicator." },
      { measurement: "Compressor amps", where: "Compressor lead", how: "Clamp meter", expected_range: "Compare to RLA", why_it_matters: "Load/mechanical health indicator." },
    ],
    decision_tree: [
      { step: 1, check: "Verify call for cooling/heating and correct mode", how: "Confirm thermostat/controller outputs", pass_condition: "Call present", fail_condition: "No call", if_pass_next_step: 2, if_fail_next_step: 0, notes: "Fix call/control first." },
      { step: 2, check: "Verify airflow (filter/coil/blower)", how: "Inspect and verify airflow", pass_condition: "Airflow normal", fail_condition: "Airflow restricted", if_pass_next_step: 3, if_fail_next_step: 0, notes: "Airflow affects pressures and delta-T." },
      { step: 3, check: "Measure suction and liquid pressures", how: "Record stabilized readings", pass_condition: "Pressures plausible", fail_condition: "Pressures abnormal", if_pass_next_step: 4, if_fail_next_step: 4, notes: "Pressures drive next checks." },
      { step: 4, check: "Measure SH/SC (if DX) or line temps", how: "Use clamps + PT", pass_condition: "SH/SC normal", fail_condition: "SH/SC abnormal", if_pass_next_step: 5, if_fail_next_step: 6, notes: "High SH points toward underfeed/low charge." },
      { step: 5, check: "Check condenser coil and fan operation", how: "Inspect coil and verify fan", pass_condition: "Condenser OK", fail_condition: "Condenser problem", if_pass_next_step: 7, if_fail_next_step: 0, notes: "Heat rejection issues reduce capacity." },
      { step: 6, check: "Check restriction indicators (drier, TXV/EEV)", how: "Check temp drop and feeding stability", pass_condition: "No restriction signs", fail_condition: "Restriction suspected", if_pass_next_step: 7, if_fail_next_step: 0, notes: "Confirm with SH/SC trend." },
      { step: 7, check: "Compare amps/pressures to nameplate expectations", how: "Clamp amps and compare to RLA", pass_condition: "Normal", fail_condition: "Abnormal", if_pass_next_step: 0, if_fail_next_step: 0, notes: "Escalate if repeated trips or unsafe readings." },
    ],
    parts_to_check: [
      { part: "Air filter / indoor coil", why_suspect: "Airflow restriction is common.", quick_test: "Inspect and check airflow.", common_failure_modes: ["Clogged filter", "Matted coil"], priority: "High" },
      { part: "Condenser coil / condenser fan", why_suspect: "Heat rejection affects head and capacity.", quick_test: "Inspect coil; verify fan amps.", common_failure_modes: ["Dirty coil", "Bad capacitor", "Failed motor"], priority: "High" },
      { part: "TXV/EEV / liquid line drier", why_suspect: "Restrictions cause abnormal SH/SC.", quick_test: "Check temp drop; evaluate SH/SC.", common_failure_modes: ["Plugged drier", "Stuck valve"], priority: "Medium" },
      { part: "Contactor / capacitor", why_suspect: "Weak start/run affects operation.", quick_test: "Inspect contacts; test capacitance.", common_failure_modes: ["Pitted contacts", "Out of spec capacitor"], priority: "Medium" },
      { part: "Controls / economizer / sensors", why_suspect: "Bad logic mimics refrigeration faults.", quick_test: "Verify calls and damper position.", common_failure_modes: ["Bad sensor", "Stuck damper", "Open safety"], priority: "Medium" },
      { part: "Compressor", why_suspect: "Inefficiency reduces capacity.", quick_test: "Compare amps and pressure ratio.", common_failure_modes: ["Worn valves", "Overheating"], priority: "Low" },
    ],
    safety_notes: [
      "Use lockout/tagout and verify power is isolated before opening panels.",
      "Use proper PPE and follow refrigerant handling and ventilation procedures.",
    ],
    when_to_escalate: [
      "Escalate if compressor trips repeatedly or abnormal amp draw persists.",
      "Escalate if you suspect a refrigerant leak or unsafe electrical condition.",
    ],
  });
}

/** ---------------- main handler ---------------- */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const propertyType = s(body?.propertyType) || "Unknown";
    const equipmentType = s(body?.equipmentType) || "Unknown";
    const manufacturer = s(body?.manufacturer) || "";
    const model = s(body?.model) || "Unknown";
    const symptom = s(body?.symptom) || "";
    const refrigerantType = s(body?.refrigerantType || body?.refrigerant) || "Unknown";
    const observations: Observation[] = Array.isArray(body?.observations) ? body.observations : [];
    const pathLog: PathLog[] = Array.isArray(body?.pathLog) ? body.pathLog : [];

    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      // Always return JSON so the client never crashes
      return NextResponse.json(
        { result: "Server misconfigured: OPENAI_API_KEY missing. Add it to .env.local or Vercel env vars and redeploy." },
        { status: 200 }
      );
    }

    // Derived calculations from readings
    const derived = extractReadings(refrigerantType, observations);

    const derivedBlock = `
Derived calculations (auto):
- Refrigerant PT table: ${PT[refrigerantType] ? "Available" : "Not available"}
- ${derived.derivedSummaryLines.length ? derived.derivedSummaryLines.join("\n- ") : "No derived values (missing readings)"}
- Pattern flags: ${derived.flags.length ? derived.flags.join(" | ") : "None"}
`.trim();

    const context = `
Property Type: ${propertyType}
Equipment Type: ${equipmentType}
Manufacturer: ${manufacturer}
Model: ${model}
Refrigerant: ${refrigerantType}
Symptom: ${symptom}

Field Observations / Measurements:
${formatObservations(observations)}

${derivedBlock}

Guided Path Taken (optional):
${formatPath(pathLog)}
`.trim();

    // This is the big upgrade: force the model to use derived data and to *explain why* based on it.
    const prompt = `
${context}

Return JSON ONLY with EXACTLY these keys (no extras):

{
  "summary": "",
  "likely_causes": [
    {"cause":"","probability_percent":0,"why":"","what_points_to_it":["",""],"what_rules_it_out":["",""]}
  ],
  "field_measurements_to_collect": [
    {"measurement":"","where":"","how":"","expected_range":"","why_it_matters":""}
  ],
  "decision_tree": [
    {"step":1,"check":"","how":"","pass_condition":"","fail_condition":"","if_pass_next_step":0,"if_fail_next_step":0,"notes":""}
  ],
  "parts_to_check": [
    {"part":"","why_suspect":"","quick_test":"","common_failure_modes":["",""],"priority":"High"}
  ],
  "safety_notes": ["",""],
  "when_to_escalate": ["",""]
}

Hard rules:
- likely_causes MUST be exactly 6 items and probabilities MUST total 100.
- field_measurements_to_collect MUST be exactly 4 items and MUST NOT repeat measurements already provided.
- decision_tree MUST be exactly 7 steps numbered 1..7; step 7 must end with both next steps = 0.
- parts_to_check MUST be exactly 6 items (prioritize parts aligned to the TOP causes and the derived flags).
- safety_notes MUST be exactly 2 items; when_to_escalate MUST be exactly 2 items.
- Your summary MUST start with one short sentence stating the most likely direction (example: "Pattern suggests undercharge vs restriction.") then a second sentence naming 1-2 specific readings/derived values that support it.
- You MUST use the Derived calculations and Pattern flags:
  - If superheat/subcool/delta-T exist, you MUST reference them in why/what_points_to_it.
  - If PT table isn't available, you MUST NOT invent saturation temps—ask for the missing piece (nameplate refrigerant or pressures/temps).
- Keep each string one sentence max, but be specific.
`.trim();

    // 1) Ask OpenAI for JSON (bigger token budget because we want richer output)
    let raw = await openaiJson(apiKey, prompt, 1800);

    // 2) Parse + normalize
    let obj: any = null;
    try {
      obj = JSON.parse(raw);
    } catch {
      // 3) One repair attempt
      const repair = `
Fix the following BROKEN_JSON into valid JSON.
Return JSON ONLY (no markdown, no commentary).
Keep the same keys and the same overall shape.
BROKEN_JSON:
${raw}
`.trim();

      raw = await openaiJson(apiKey, repair, 1400);

      try {
        obj = JSON.parse(raw);
      } catch (e: any) {
        // 4) fallback (still useful)
        const fallback = rulesOnlyFallback(`(Derived flags: ${derived.flags.length ? derived.flags.join(" | ") : "none"}).`);
        return NextResponse.json({ result: JSON.stringify(fallback, null, 2) }, { status: 200 });
      }
    }

    const final = normalizeFinal(obj);

    // Bonus: If we computed SH/SC/ΔT, inject a short derived note in summary (without changing structure)
    const addendumBits: string[] = [];
    if (derived.deltaTF != null) addendumBits.push(`ΔT ${derived.deltaTF}°F`);
    if (derived.superheatF != null) addendumBits.push(`SH ~${derived.superheatF}°F`);
    if (derived.subcoolF != null) addendumBits.push(`SC ~${derived.subcoolF}°F`);
    if (addendumBits.length) {
      final.summary = `${final.summary} (Auto: ${addendumBits.join(", ")})`;
    }

    return NextResponse.json({ result: JSON.stringify(final, null, 2) }, { status: 200 });
  } catch (err: any) {
    // ALWAYS return JSON so UI never crashes
    const msg = "Server error: " + (err?.message || String(err));
    return NextResponse.json({ result: msg }, { status: 200 });
  }
}