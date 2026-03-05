
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/* =========================================================
   Helpers: extract + sanitize + parse JSON safely
========================================================= */

function extractJsonBlock(text: string) {
  // Try to find the largest {...} block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

function sanitizeJson(jsonLike: string) {
  let s = jsonLike;

  // Remove control chars that break JSON parsing
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");

  return s.trim();
}

function safeParseJson<T>(raw: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    const block = sanitizeJson(extractJsonBlock(raw));
    return { ok: true, data: JSON.parse(block) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/* =========================================================
   Diagnosis shape + validation/normalization
========================================================= */

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

function asString(x: any, fallback = "") {
  return typeof x === "string" ? x : fallback;
}
function asStringArray(x: any, fallback: string[] = []) {
  return Array.isArray(x) ? x.map((v) => String(v)) : fallback;
}
function asNumber(x: any, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeProbabilities(items: { probability_percent: number }[]) {
  const total = items.reduce((sum, i) => sum + (Number.isFinite(i.probability_percent) ? i.probability_percent : 0), 0);
  if (total <= 0) {
    const even = Math.floor(100 / Math.max(1, items.length));
    items.forEach((i) => (i.probability_percent = even));
    // fix remainder
    const rem = 100 - even * items.length;
    if (items[0]) items[0].probability_percent += rem;
    return;
  }

  // scale to 100
  items.forEach((i) => (i.probability_percent = Math.round((i.probability_percent / total) * 100)));

  // fix rounding drift
  let drift = 100 - items.reduce((sum, i) => sum + i.probability_percent, 0);
  let idx = 0;
  while (drift !== 0 && items.length > 0) {
    items[idx].probability_percent += drift > 0 ? 1 : -1;
    drift += drift > 0 ? -1 : 1;
    idx = (idx + 1) % items.length;
  }
}

function validateAndFixDiagnosis(obj: any): Diagnosis {
  const out: Diagnosis = {
    summary: asString(obj?.summary, ""),

    likely_causes: Array.isArray(obj?.likely_causes) ? obj.likely_causes.slice(0, 6).map((c: any) => ({
      cause: asString(c?.cause, "Unknown cause"),
      probability_percent: asNumber(c?.probability_percent, asNumber(c?.probability, 0)),
      why: asString(c?.why, ""),
      what_points_to_it: asStringArray(c?.what_points_to_it, []),
      what_rules_it_out: asStringArray(c?.what_rules_it_out, []),
    })) : [],

    field_measurements_to_collect: Array.isArray(obj?.field_measurements_to_collect)
      ? obj.field_measurements_to_collect.slice(0, 4).map((m: any) => ({
          measurement: asString(m?.measurement, ""),
          where: asString(m?.where, ""),
          how: asString(m?.how, ""),
          expected_range: asString(m?.expected_range, ""),
          why_it_matters: asString(m?.why_it_matters, ""),
        }))
      : [],

    decision_tree: Array.isArray(obj?.decision_tree)
      ? obj.decision_tree.slice(0, 7).map((d: any) => ({
          step: asNumber(d?.step, 0),
          check: asString(d?.check, ""),
          how: asString(d?.how, ""),
          pass_condition: asString(d?.pass_condition, ""),
          fail_condition: asString(d?.fail_condition, ""),
          if_pass_next_step: asNumber(d?.if_pass_next_step, 0),
          if_fail_next_step: asNumber(d?.if_fail_next_step, 0),
          notes: asString(d?.notes, ""),
        }))
      : [],

    parts_to_check: Array.isArray(obj?.parts_to_check)
      ? obj.parts_to_check.slice(0, 6).map((p: any) => ({
          part: asString(p?.part, ""),
          why_suspect: asString(p?.why_suspect, asString(p?.why, "")),
          quick_test: asString(p?.quick_test, ""),
          common_failure_modes: asStringArray(p?.common_failure_modes, []),
          priority: (["High", "Medium", "Low"].includes(String(p?.priority)) ? String(p?.priority) : "Medium") as
            | "High"
            | "Medium"
            | "Low",
        }))
      : [],

    safety_notes: asStringArray(obj?.safety_notes, []),
    when_to_escalate: asStringArray(obj?.when_to_escalate, []),
  };

  // Enforce counts (so UI is stable)
  while (out.likely_causes.length < 6) {
    out.likely_causes.push({
      cause: "Unknown cause",
      probability_percent: 0,
      why: "",
      what_points_to_it: [],
      what_rules_it_out: [],
    });
  }
  while (out.field_measurements_to_collect.length < 4) {
    out.field_measurements_to_collect.push({
      measurement: "",
      where: "",
      how: "",
      expected_range: "",
      why_it_matters: "",
    });
  }
  while (out.decision_tree.length < 7) {
    out.decision_tree.push({
      step: out.decision_tree.length + 1,
      check: "",
      how: "",
      pass_condition: "",
      fail_condition: "",
      if_pass_next_step: out.decision_tree.length + 2 <= 7 ? out.decision_tree.length + 2 : 0,
      if_fail_next_step: 0,
      notes: "",
    });
  }
  while (out.parts_to_check.length < 6) {
    out.parts_to_check.push({
      part: "",
      why_suspect: "",
      quick_test: "",
      common_failure_modes: [],
      priority: "Medium",
    });
  }
  while (out.safety_notes.length < 2) out.safety_notes.push("");
  out.safety_notes = out.safety_notes.slice(0, 2);
  while (out.when_to_escalate.length < 2) out.when_to_escalate.push("");
  out.when_to_escalate = out.when_to_escalate.slice(0, 2);

  // Normalize probabilities to add to 100
  normalizeProbabilities(out.likely_causes);

  // Ensure decision steps are 1..7 and last step ends
  out.decision_tree = out.decision_tree
    .map((s, idx) => ({ ...s, step: idx + 1 }))
    .slice(0, 7);
  out.decision_tree[6].if_pass_next_step = 0;
  out.decision_tree[6].if_fail_next_step = 0;

  if (!out.summary) out.summary = "Diagnosis generated from symptoms and available readings.";

  return out;
}

/* =========================================================
   OpenAI call (no SDK, avoids TS overload problems)
========================================================= */

async function callOpenAIJson(apiKey: string, prompt: string, maxTokens: number) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.15,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  const data = await r.json().catch(() => null);

  if (!r.ok) {
    const code = data?.error?.code;
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code || ""}: ${msg}`);
  }

  const text = data?.choices?.[0]?.message?.content ?? "";
  return text;
}

/* =========================================================
   Rules-only fallback (never crashes UI)
========================================================= */

function rulesOnlyFallback(input: {
  propertyType?: string;
  equipmentType?: string;
  manufacturer?: string;
  model?: string;
  symptom?: string;
  refrigerantType?: string;
}) : Diagnosis {
  const sym = (input.symptom || "").toLowerCase();

  const likely: Diagnosis["likely_causes"] = [
    {
      cause: sym.includes("not cooling") ? "Low refrigerant / leak" : "Airflow or control issue",
      probability_percent: 25,
      why: "Most common cause given the symptom with limited readings.",
      what_points_to_it: ["Symptom matches typical field pattern."],
      what_rules_it_out: ["Normal pressures, superheat/subcool, and temperature split."],
    },
    {
      cause: "Dirty filter / airflow restriction",
      probability_percent: 20,
      why: "Restricted airflow can cause low capacity and abnormal pressures/temps.",
      what_points_to_it: ["Weak airflow, high static, dirty filter."],
      what_rules_it_out: ["Clean filter and normal static/CFM."],
    },
    {
      cause: "Outdoor coil/condenser fan issue",
      probability_percent: 15,
      why: "Head pressure problems can reduce cooling capacity quickly.",
      what_points_to_it: ["High head pressure, fan not running, dirty coil."],
      what_rules_it_out: ["Normal head pressure and good condenser airflow."],
    },
    {
      cause: "Metering device restriction",
      probability_percent: 15,
      why: "Restriction can drive low suction and poor cooling.",
      what_points_to_it: ["High superheat, low suction, normal/low subcool."],
      what_rules_it_out: ["Normal superheat/subcool and pressures."],
    },
    {
      cause: "Compressor/starting component issue",
      probability_percent: 15,
      why: "Electrical issues can mimic refrigerant problems.",
      what_points_to_it: ["High amps, hard start, short cycling."],
      what_rules_it_out: ["Normal amps and stable operation."],
    },
    {
      cause: "Controls/sensors/economizer issue",
      probability_percent: 10,
      why: "Bad control logic can prevent correct staging or cooling call.",
      what_points_to_it: ["No Y call, economizer stuck, sensor faults."],
      what_rules_it_out: ["Correct control signals and damper operation."],
    },
  ];

  normalizeProbabilities(likely);

  return validateAndFixDiagnosis({
    summary:
      "Rules-only diagnosis (AI JSON failed). Add 1–2 key readings (suction, liquid, superheat/subcool, return/supply temps) and re-run for a deeper result.",
    likely_causes: likely,
    field_measurements_to_collect: [
      { measurement: "Suction Pressure", where: "Suction service port", how: "Gauge set", expected_range: "By refrigerant/PT chart", why_it_matters: "Shows evaporator load and charge." },
      { measurement: "Liquid Pressure", where: "Liquid service port", how: "Gauge set", expected_range: "By refrigerant/PT chart", why_it_matters: "Shows condenser performance and charge." },
      { measurement: "Superheat", where: "Suction line near evap outlet", how: "Clamp + PT", expected_range: "Typical 8–20°F (depends)", why_it_matters: "Indicates feed and load." },
      { measurement: "Delta T (Return-Supply)", where: "Return and supply air", how: "Thermometer", expected_range: "Typical 15–20°F cooling", why_it_matters: "Shows actual delivered capacity." },
    ],
    decision_tree: [
      { step: 1, check: "Confirm thermostat/call for cooling", how: "Verify Y call and setpoint", pass_condition: "Call present", fail_condition: "No call", if_pass_next_step: 2, if_fail_next_step: 0, notes: "Check control voltage and settings." },
      { step: 2, check: "Verify indoor airflow", how: "Filter/blower/static", pass_condition: "Airflow OK", fail_condition: "Restricted", if_pass_next_step: 3, if_fail_next_step: 0, notes: "Fix airflow first." },
      { step: 3, check: "Measure suction and liquid pressure", how: "Gauge set", pass_condition: "Pressures plausible", fail_condition: "Pressures abnormal", if_pass_next_step: 4, if_fail_next_step: 4, notes: "Use PT chart for refrigerant." },
      { step: 4, check: "Measure superheat/subcool", how: "Clamp + PT", pass_condition: "Normal SH/SC", fail_condition: "Abnormal SH/SC", if_pass_next_step: 5, if_fail_next_step: 5, notes: "Points to charge vs restriction." },
      { step: 5, check: "Check condenser airflow/coil", how: "Fan operation + coil condition", pass_condition: "OK", fail_condition: "Not OK", if_pass_next_step: 6, if_fail_next_step: 0, notes: "Dirty coil can fake charge issues." },
      { step: 6, check: "Check electrical (amps/voltage/capacitor)", how: "Meter readings", pass_condition: "Normal", fail_condition: "Abnormal", if_pass_next_step: 7, if_fail_next_step: 0, notes: "Resolve electrical before refrigerant work." },
      { step: 7, check: "If still unresolved, leak check or escalate", how: "Leak search / OEM support", pass_condition: "Resolved", fail_condition: "Not resolved", if_pass_next_step: 0, if_fail_next_step: 0, notes: "Document readings for support." },
    ],
    parts_to_check: [
      { part: "Air filter", why_suspect: "Airflow restriction is common.", quick_test: "Inspect filter and static.", common_failure_modes: ["Clogged media"], priority: "High" },
      { part: "Condenser coil/fan", why_suspect: "High head / low capacity.", quick_test: "Verify fan + clean coil.", common_failure_modes: ["Dirty coil", "Failed motor"], priority: "High" },
      { part: "Capacitor", why_suspect: "Hard start/low torque.", quick_test: "Test µF vs rating.", common_failure_modes: ["Weak capacitance"], priority: "Medium" },
      { part: "Contactor", why_suspect: "Intermittent operation.", quick_test: "Inspect contacts/voltage drop.", common_failure_modes: ["Pitted contacts"], priority: "Medium" },
      { part: "TXV/EEV", why_suspect: "Restriction signs.", quick_test: "Compare SH/SC and temp drop.", common_failure_modes: ["Sticking", "Plugged screen"], priority: "Medium" },
      { part: "Thermostat/control board", why_suspect: "No/incorrect call.", quick_test: "Verify signals and safeties.", common_failure_modes: ["Relay failure", "Sensor fault"], priority: "Low" },
    ],
    safety_notes: ["De-energize equipment before opening panels.", "Follow refrigerant handling and PPE requirements."],
    when_to_escalate: ["If electrical readings indicate compressor damage.", "If refrigerant circuit diagnosis requires recovery/charging without confident cause."],
  });
}

/* =========================================================
   Main handler
========================================================= */

function formatObservations(observations: any): string {
  if (!Array.isArray(observations) || observations.length === 0) return "None";
  return observations
    .map((o, i) => {
      const label = String(o?.label ?? "").trim() || `Observation ${i + 1}`;
      const value = String(o?.value ?? "").trim();
      const unit = String(o?.unit ?? "").trim();
      const note = String(o?.note ?? "").trim();
      return `- ${label}: ${value}${unit ? " " + unit : ""}${note ? ` (note: ${note})` : ""}`;
    })
    .join("\n");
}

function formatPath(pathLog: any): string {
  if (!Array.isArray(pathLog) || pathLog.length === 0) return "None";
  return pathLog.map((p: any) => `- Step ${p?.step}: ${p?.decision} -> ${p?.nextStep}`).join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const propertyType = body?.propertyType || "";
    const equipmentType = body?.equipmentType || "";
    const manufacturer = body?.manufacturer || "";
    const model = body?.model || "";
    const symptom = body?.symptom || "";

    const refrigerantType = body?.refrigerantType || body?.refrigerant || "Unknown";
    const observations = body?.observations || [];
    const pathLog = body?.pathLog || [];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { result: "Missing OPENAI_API_KEY (set it in Vercel or .env.local).", ok: false },
        { status: 500 }
      );
    }

    // If required fields missing, keep UI stable
    if (!manufacturer || !symptom) {
      return NextResponse.json(
        { result: "Please fill in at least Manufacturer and Symptom.", ok: false },
        { status: 400 }
      );
    }

    const context = `
Property Type: ${propertyType}
Equipment Type: ${equipmentType}
Manufacturer: ${manufacturer}
Model: ${model || "Unknown"}
Refrigerant: ${refrigerantType}
Symptom: ${symptom}

Field Observations / Measurements:
${formatObservations(observations)}

Guided Path Taken (optional):
${formatPath(pathLog)}
`.trim();

    // One prompt returns the full object, so JSON is simpler + less likely to break
    const prompt = `
You are an expert HVAC/R service technician.

${context}

Return JSON ONLY with EXACTLY these keys:

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

Rules:
- likely_causes MUST be exactly 6 items and probabilities MUST add up to 100.
- field_measurements_to_collect MUST be exactly 4 items.
- decision_tree MUST be exactly 7 steps numbered 1..7, with step 7 next steps = 0.
- parts_to_check MUST be exactly 6 items (use High/Medium/Low).
- safety_notes MUST be exactly 2 items.
- when_to_escalate MUST be exactly 2 items.
- Use the Field Observations to adjust probabilities and the decision_tree (do not ask to re-measure already provided items).
- Keep each string ONE sentence max.
- Output MUST be valid JSON (double quotes, no trailing commas, no markdown).
`.trim();

    // 1) First attempt
    const raw1 = await callOpenAIJson(apiKey, prompt, 1100);
    const parsed1 = safeParseJson<any>(raw1);

    let finalObj: Diagnosis;

    if (parsed1.ok) {
      finalObj = validateAndFixDiagnosis(parsed1.data);
    } else {
      // 2) Repair attempt
      const repairPrompt = `
You are a strict JSON repair tool.
Return ONLY valid JSON. No markdown. No commentary.
Fix this JSON so it is valid. Keep the SAME keys and structure.

BROKEN_JSON:
${sanitizeJson(extractJsonBlock(raw1))}
`.trim();

      const raw2 = await callOpenAIJson(apiKey, repairPrompt, 900);
      const parsed2 = safeParseJson<any>(raw2);

      if (parsed2.ok) {
        finalObj = validateAndFixDiagnosis(parsed2.data);
        // Make summary honest (but not scary)
        finalObj.summary = `${finalObj.summary} (JSON repaired automatically)`;
      } else {
        // 3) Safe fallback
        finalObj = rulesOnlyFallback({
          propertyType,
          equipmentType,
          manufacturer,
          model,
          symptom,
          refrigerantType,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      result: JSON.stringify(finalObj, null, 2),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, result: "Server error: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}