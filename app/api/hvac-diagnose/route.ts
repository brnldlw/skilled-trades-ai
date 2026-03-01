
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** ---------- helpers ---------- */

function extractJsonBlock(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

function sanitizeJson(jsonLike: string) {
  let s = jsonLike;
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  s = s.replace(/,\s*([}\]])/g, "$1");
  return s;
}

async function openaiJsonText(apiKey: string, prompt: string, maxTokens: number) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.15,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  const data = await r.json().catch(() => ({} as any));
  if (!r.ok) {
    const code = data?.error?.code || "";
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code}: ${msg}`);
  }
  return data?.choices?.[0]?.message?.content ?? "";
}

async function parseOrRepairJson(apiKey: string, raw: string) {
  const block = sanitizeJson(extractJsonBlock(raw));
  try {
    return { ok: true as const, data: JSON.parse(block) };
  } catch (e1: any) {
    const repairPrompt = `
You are a strict JSON repair tool.
Return ONLY valid JSON. No markdown. No commentary. No trailing commas.
Fix this JSON and keep the SAME KEYS.

BROKEN_JSON:
${block}
`.trim();

    const raw2 = await openaiJsonText(apiKey, repairPrompt, 900);
    const block2 = sanitizeJson(extractJsonBlock(raw2));
    try {
      return { ok: true as const, data: JSON.parse(block2) };
    } catch (e2: any) {
      return {
        ok: false as const,
        error: `Could not parse model JSON reliably (${e2?.message || String(e2)}). Please re-run or add more measurements.`,
      };
    }
  }
}

function fmtObservations(observations: any): string {
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

function fmtPath(pathLog: any): string {
  if (!Array.isArray(pathLog) || pathLog.length === 0) return "None";
  return pathLog.map((p: any) => `- Step ${p?.step}: ${p?.decision} -> ${p?.nextStep}`).join("\n");
}

/** ---------- route ---------- */

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || "";

  try {
    const body = await req.json();

    const propertyType = String(body?.propertyType || "Unknown");
    const equipmentType = String(body?.equipmentType || "Unknown");
    const manufacturer = String(body?.manufacturer || "").trim();
    const model = String(body?.model || "").trim();
    const symptom = String(body?.symptom || "").trim();

    const refrigerantType = String(body?.refrigerantType || body?.refrigerant || "Unknown");
    const observations = body?.observations || [];
    const pathLog = body?.pathLog || [];

    if (!apiKey) {
      return NextResponse.json({ result: "Server misconfigured: OPENAI_API_KEY missing in Vercel/Env." }, { status: 500 });
    }
    if (!manufacturer || !symptom) {
      return NextResponse.json({ result: "Please provide at least manufacturer and symptom." }, { status: 400 });
    }

    const context = `
Property Type: ${propertyType}
Equipment Type: ${equipmentType}
Manufacturer: ${manufacturer}
Model: ${model || "Unknown"}
Refrigerant: ${refrigerantType}
Symptom: ${symptom}

Field Observations / Measurements:
${fmtObservations(observations)}

Guided Path Taken (optional):
${fmtPath(pathLog)}
`.trim();

    /**
     * “Awesome app” upgrade: one output that FEELS like a technician.
     * - triage_questions: what to ask NEXT if info missing
     * - hypotheses: 6 causes with evidence + what rules out
     * - test_plan: 10-step “check this then that” flow with pass/fail meaning
     * - measurements_to_collect: next 8 measurements that matter (avoid duplicates)
     * - parts: 10 parts with quick tests + failure modes
     * - actions_now: immediate next 3 actions
     */
    const prompt = `
You are a highly experienced HVAC/R service technician who troubleshoots fast and safely.
Your job is to produce a result that a field tech can ACT on.

${context}

Return JSON ONLY with EXACTLY these keys and shapes:

{
  "summary": "",
  "confidence_0_to_100": 0,
  "triage_questions": [
    {"question":"","why_it_matters":"","default_assumption_if_unknown":""}
  ],
  "hypotheses": [
    {
      "cause":"",
      "probability_percent":0,
      "why":"",
      "evidence_from_inputs":["",""],
      "what_points_to_it":["",""],
      "what_rules_it_out":["",""]
    }
  ],
  "test_plan": [
    {
      "step": 1,
      "check": "",
      "how": "",
      "expected_if_good": "",
      "expected_if_bad": "",
      "if_good_next_step": 0,
      "if_bad_next_step": 0,
      "what_it_means": ""
    }
  ],
  "measurements_to_collect_next": [
    {"measurement":"","where":"","how":"","expected_range":"","why_it_matters":""}
  ],
  "parts_to_check": [
    {"part":"","priority":"High","why_suspect":"","quick_test":"","common_failure_modes":["",""],"notes":""}
  ],
  "actions_now": [
    {"action":"","why":"","time_est_minutes":0}
  ],
  "safety_notes": ["",""],
  "when_to_escalate": ["",""]
}

Hard Rules:
- hypotheses MUST be exactly 6 items, probabilities MUST add to 100.
- test_plan MUST be exactly 10 steps numbered 1..10.
  - Step 10 MUST end the flow: if_good_next_step=0 and if_bad_next_step=0.
  - Make it a real branching diagnostic (not generic advice).
- measurements_to_collect_next MUST be exactly 8 items.
  - DO NOT repeat any observation already provided.
  - Only propose high-value diagnostics.
- parts_to_check MUST be exactly 10 items.
- triage_questions MUST be exactly 6 items.
- actions_now MUST be exactly 3 items.
- safety_notes MUST be exactly 3 items.
- when_to_escalate MUST be exactly 3 items.

Quality Rules (this is what makes it “awesome”):
- Use observations to shift probabilities and choose the next tests.
- If refrigerant is Unknown, include a step and measurement to confirm nameplate/refrigerant.
- If the symptom is cooling-related and compressor runs + suction low, prioritize airflow restriction vs low charge vs metering device vs liquid line restriction.
- If heating-related, prioritize thermostat call, safeties, ignition sequence, gas pressure, flame proving, airflow/limits.
- Keep each string ONE sentence max (tight, usable in the field).
- No markdown, JSON only.
`.trim();

    const raw = await openaiJsonText(apiKey, prompt, 1800);
    const parsed = await parseOrRepairJson(apiKey, raw);

    if (!parsed.ok) {
      return NextResponse.json({ result: parsed.error });
    }

    return NextResponse.json({ result: JSON.stringify(parsed.data, null, 2) });
  } catch (err: any) {
    return NextResponse.json({ result: "Server error: " + (err?.message || String(err)) }, { status: 500 });
  }
}