import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Helpers used in the prompt context
 */
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

/**
 * Robust JSON parsing / repair utilities
 */
function tryParseJson<T>(text: string): { ok: true; data: T } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

function extractFirstObject(text: string) {
  const start = text.indexOf("{");
  if (start < 0) return text;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }
  return text.slice(start);
}

function sanitizeJson(s: string) {
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  s = s.replace(/,\s*([}\]])/g, "$1"); // trailing commas
  return s.trim();
}

/**
 * OpenAI call (HTTP) with JSON mode enabled
 */
async function openaiChatJson(apiKey: string, prompt: string, maxTokens: number) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.15,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON. No markdown. No commentary. Use double quotes. No trailing commas. Ensure arrays/objects are properly closed.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await r.json();
  if (!r.ok) {
    const code = data?.error?.code;
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code || ""}: ${msg}`);
  }

  return data?.choices?.[0]?.message?.content ?? "";
}

/**
 * Types returned to the UI
 */
type FinalJson = {
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

function fallbackJson(reason: string): FinalJson {
  return {
    summary: `Could not parse model JSON reliably (${reason}). Please re-run or add more measurements.`,
    likely_causes: [
      {
        cause: "Insufficient data",
        probability_percent: 40,
        why: "Need more measurements to narrow it down.",
        what_points_to_it: ["Limited observations provided"],
        what_rules_it_out: ["Full pressure/temp/electrical data provided"],
      },
      {
        cause: "Airflow restriction",
        probability_percent: 20,
        why: "Restricted airflow can mimic charge issues.",
        what_points_to_it: ["High static, dirty filter, weak airflow"],
        what_rules_it_out: ["Strong airflow and clean filter"],
      },
      {
        cause: "Refrigerant issue",
        probability_percent: 15,
        why: "Low charge or restriction can reduce capacity.",
        what_points_to_it: ["Low suction, poor delta-T"],
        what_rules_it_out: ["Normal SH/SC and pressures"],
      },
      {
        cause: "Electrical/control problem",
        probability_percent: 10,
        why: "Bad signal or failed component can prevent proper operation.",
        what_points_to_it: ["Intermittent call, contactor chatter"],
        what_rules_it_out: ["Stable signals and components test good"],
      },
      {
        cause: "Mechanical failure",
        probability_percent: 10,
        why: "Compressor/motor issues reduce system performance.",
        what_points_to_it: ["High amps, abnormal noise, overheating"],
        what_rules_it_out: ["Normal amps and stable operation"],
      },
      {
        cause: "Sensor/thermostat issue",
        probability_percent: 5,
        why: "Bad inputs can cause wrong operation.",
        what_points_to_it: ["Wrong readings, short cycling"],
        what_rules_it_out: ["Verified sensor values"],
      },
    ],
    field_measurements_to_collect: [
      {
        measurement: "Suction pressure",
        where: "Suction service port",
        how: "Gauge",
        expected_range: "Per PT chart",
        why_it_matters: "Indicates charge/flow condition.",
      },
      {
        measurement: "Liquid pressure",
        where: "Liquid service port",
        how: "Gauge",
        expected_range: "Per PT chart",
        why_it_matters: "Confirms condensing conditions.",
      },
      {
        measurement: "Supply/return delta-T",
        where: "Supply and return air",
        how: "Thermometer",
        expected_range: "15–20°F cooling",
        why_it_matters: "Validates capacity and airflow.",
      },
      {
        measurement: "Compressor amps",
        where: "Compressor circuit",
        how: "Clamp meter",
        expected_range: "Nameplate ±10%",
        why_it_matters: "Shows load and possible faults.",
      },
    ],
    decision_tree: [
      {
        step: 1,
        check: "Confirm call for mode",
        how: "Thermostat setpoint/mode and 24V call",
        pass_condition: "Call present",
        fail_condition: "No call",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Fix controls first.",
      },
      {
        step: 2,
        check: "Verify airflow",
        how: "Filter, blower, coil cleanliness",
        pass_condition: "Airflow normal",
        fail_condition: "Airflow restricted",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "Airflow issues skew pressures.",
      },
      {
        step: 3,
        check: "Verify outdoor/RTU sequence",
        how: "Fans/compressor starting correctly",
        pass_condition: "Sequence normal",
        fail_condition: "Sequence abnormal",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "Check contactor/capacitor if abnormal.",
      },
      {
        step: 4,
        check: "Measure pressures",
        how: "Suction and liquid gauges",
        pass_condition: "Pressures plausible",
        fail_condition: "Pressures abnormal",
        if_pass_next_step: 5,
        if_fail_next_step: 5,
        notes: "Use PT chart with temps.",
      },
      {
        step: 5,
        check: "Calculate SH/SC",
        how: "Line temps + pressures",
        pass_condition: "SH/SC in target",
        fail_condition: "SH/SC out of target",
        if_pass_next_step: 6,
        if_fail_next_step: 6,
        notes: "Distinguish charge vs restriction.",
      },
      {
        step: 6,
        check: "Check restriction/meterring",
        how: "Drier temp drop, TXV behavior, frosting",
        pass_condition: "No restriction signs",
        fail_condition: "Restriction likely",
        if_pass_next_step: 7,
        if_fail_next_step: 7,
        notes: "Confirm before opening system.",
      },
      {
        step: 7,
        check: "Escalate if unresolved",
        how: "Call senior/manufacturer with data",
        pass_condition: "Resolved",
        fail_condition: "Not resolved",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "Provide model/serial and measurements.",
      },
    ],
    parts_to_check: [
      {
        part: "Air filter",
        why_suspect: "Common restriction point.",
        quick_test: "Inspect and replace if dirty.",
        common_failure_modes: ["Clogged"],
        priority: "High",
      },
      {
        part: "Capacitor",
        why_suspect: "Hard start/no start issues.",
        quick_test: "Measure µF vs rating.",
        common_failure_modes: ["Weak", "Open"],
        priority: "High",
      },
      {
        part: "Contactor",
        why_suspect: "Can drop power under load.",
        quick_test: "Check coil voltage and contact drop.",
        common_failure_modes: ["Pitted", "Stuck"],
        priority: "Medium",
      },
      {
        part: "TXV/EEV",
        why_suspect: "Starved coil symptoms.",
        quick_test: "Compare SH/SC and sensing bulb.",
        common_failure_modes: ["Stuck", "Restricted"],
        priority: "Medium",
      },
      {
        part: "Filter drier",
        why_suspect: "Restriction source.",
        quick_test: "Check temperature drop across drier.",
        common_failure_modes: ["Plugged"],
        priority: "Low",
      },
      {
        part: "Thermostat/sensor",
        why_suspect: "Bad control input.",
        quick_test: "Verify signals and sensor readings.",
        common_failure_modes: ["Open", "Misreading"],
        priority: "Low",
      },
    ],
    safety_notes: ["Lockout/tagout before opening panels.", "Discharge capacitors and verify no high voltage present."],
    when_to_escalate: ["Repeated trips/lockouts after basic checks.", "Suspected compressor failure or major leak."],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const manufacturer = String(body?.manufacturer ?? "").trim();
    const symptom = String(body?.symptom ?? "").trim();
    if (!manufacturer || !symptom) {
      return NextResponse.json({ result: "Please fill in at least Manufacturer and Symptom." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey || !apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { result: "Missing/invalid OPENAI_API_KEY on server. Set it in env (.env.local or Vercel) and restart/redeploy." },
        { status: 500 }
      );
    }

    const propertyType = String(body?.propertyType ?? "Unknown").trim();
    const equipmentType = String(body?.equipmentType ?? "Unknown").trim();
    const model = String(body?.model ?? "Unknown").trim();
    const refrigerantType = String(body?.refrigerantType ?? body?.refrigerant ?? "Unknown").trim();
    const observations = body?.observations ?? [];
    const pathLog = body?.pathLog ?? [];

    const context = `
Property Type: ${propertyType}
Equipment Type: ${equipmentType}
Manufacturer: ${manufacturer}
Model: ${model}
Refrigerant: ${refrigerantType}
Symptom: ${symptom}

Field Observations / Measurements:
${formatObservations(observations)}

Guided Path Taken (optional):
${formatPath(pathLog)}
`.trim();

    // Fully-expanded skeleton reduces JSON breakage massively
    const prompt = `
Return ONLY valid JSON (no markdown, no extra text).
Fill in this EXACT JSON skeleton with realistic HVAC/R troubleshooting content.
Do NOT change keys. Do NOT add keys. Do NOT remove keys.
All strings must be double-quoted. No trailing commas.

JSON_SKELETON:
{
  "summary": "",
  "likely_causes": [
    {"cause":"","probability_percent":0,"why":"","what_points_to_it":["",""],"what_rules_it_out":["",""]},
    {"cause":"","probability_percent":0,"why":"","what_points_to_it":["",""],"what_rules_it_out":["",""]},
    {"cause":"","probability_percent":0,"why":"","what_points_to_it":["",""],"what_rules_it_out":["",""]},
    {"cause":"","probability_percent":0,"why":"","what_points_to_it":["",""],"what_rules_it_out":["",""]},
    {"cause":"","probability_percent":0,"why":"","what_points_to_it":["",""],"what_rules_it_out":["",""]},
    {"cause":"","probability_percent":0,"why":"","what_points_to_it":["",""],"what_rules_it_out":["",""]}
  ],
  "field_measurements_to_collect": [
    {"measurement":"","where":"","how":"","expected_range":"","why_it_matters":""},
    {"measurement":"","where":"","how":"","expected_range":"","why_it_matters":""},
    {"measurement":"","where":"","how":"","expected_range":"","why_it_matters":""},
    {"measurement":"","where":"","how":"","expected_range":"","why_it_matters":""}
  ],
  "decision_tree": [
    {"step":1,"check":"","how":"","pass_condition":"","fail_condition":"","if_pass_next_step":2,"if_fail_next_step":0,"notes":""},
    {"step":2,"check":"","how":"","pass_condition":"","fail_condition":"","if_pass_next_step":3,"if_fail_next_step":0,"notes":""},
    {"step":3,"check":"","how":"","pass_condition":"","fail_condition":"","if_pass_next_step":4,"if_fail_next_step":0,"notes":""},
    {"step":4,"check":"","how":"","pass_condition":"","fail_condition":"","if_pass_next_step":5,"if_fail_next_step":0,"notes":""},
    {"step":5,"check":"","how":"","pass_condition":"","fail_condition":"","if_pass_next_step":6,"if_fail_next_step":0,"notes":""},
    {"step":6,"check":"","how":"","pass_condition":"","fail_condition":"","if_pass_next_step":7,"if_fail_next_step":0,"notes":""},
    {"step":7,"check":"","how":"","pass_condition":"","fail_condition":"","if_pass_next_step":0,"if_fail_next_step":0,"notes":""}
  ],
  "parts_to_check": [
    {"part":"","why_suspect":"","quick_test":"","common_failure_modes":["",""],"priority":"High"},
    {"part":"","why_suspect":"","quick_test":"","common_failure_modes":["",""],"priority":"High"},
    {"part":"","why_suspect":"","quick_test":"","common_failure_modes":["",""],"priority":"Medium"},
    {"part":"","why_suspect":"","quick_test":"","common_failure_modes":["",""],"priority":"Medium"},
    {"part":"","why_suspect":"","quick_test":"","common_failure_modes":["",""],"priority":"Low"},
    {"part":"","why_suspect":"","quick_test":"","common_failure_modes":["",""],"priority":"Low"}
  ],
  "safety_notes": ["",""],
  "when_to_escalate": ["",""]
}

CONTEXT:
${context}

RULES:
- likely_causes probabilities must add up to 100.
- Use the observations to adjust probabilities and pick the next best measurements.
- Keep every string to one short sentence.
`.trim();

    const raw = await openaiChatJson(apiKey, prompt, 1200);

    // Parse attempts (direct -> extracted -> repair)
    const p1 = tryParseJson<FinalJson>(raw);
    if (p1.ok) return NextResponse.json({ result: JSON.stringify(p1.data, null, 2) });

    const extracted = sanitizeJson(extractFirstObject(raw));
    const p2 = tryParseJson<FinalJson>(extracted);
    if (p2.ok) return NextResponse.json({ result: JSON.stringify(p2.data, null, 2) });

    const repairPrompt = `
Return ONLY valid JSON. No markdown.
Fix JSON to be valid and keep SAME KEYS.

BROKEN_JSON:
${extracted}
`.trim();

    const repairedRaw = await openaiChatJson(apiKey, repairPrompt, 700);
    const repaired = sanitizeJson(extractFirstObject(repairedRaw));
    const p3 = tryParseJson<FinalJson>(repaired);
    if (p3.ok) return NextResponse.json({ result: JSON.stringify(p3.data, null, 2) });

    // Never crash the UI
    const fb = fallbackJson(p3.ok ? "" : p3.error || p2.error || p1.error);
    return NextResponse.json({ result: JSON.stringify(fb, null, 2) });
  } catch (err: any) {
    return NextResponse.json({ result: "Server error: " + (err?.message || String(err)) }, { status: 500 });
  }
}