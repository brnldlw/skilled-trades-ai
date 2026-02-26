import { NextRequest, NextResponse } from "next/server";

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

async function callOpenAIText(apiKey: string, prompt: string, maxTokens: number) {
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

  const data = await r.json();
  if (!r.ok) {
    const code = data?.error?.code;
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code || ""}: ${msg}`);
  }

  return data?.choices?.[0]?.message?.content ?? "";
}

async function callOpenAIJson<T>(apiKey: string, prompt: string, maxTokens: number): Promise<T> {
  const raw1 = await callOpenAIText(apiKey, prompt, maxTokens);
  const block1 = sanitizeJson(extractJsonBlock(raw1));

  try {
    return JSON.parse(block1) as T;
  } catch {
    const repairPrompt = `
You are a strict JSON repair tool.
Return ONLY valid JSON. No markdown. No commentary. No trailing commas.
Fix this JSON and keep the SAME KEYS.

BROKEN_JSON:
${block1}
`.trim();

    const raw2 = await callOpenAIText(apiKey, repairPrompt, Math.min(650, maxTokens));
    const block2 = sanitizeJson(extractJsonBlock(raw2));
    return JSON.parse(block2) as T;
  }
}

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
  return pathLog
    .map((p: any) => `- Step ${p?.step}: ${p?.decision} -> ${p?.nextStep}`)
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const propertyType = body?.propertyType;
    const equipmentType = body?.equipmentType;
    const manufacturer = body?.manufacturer;
    const model = body?.model;
    const symptom = body?.symptom;

    // NEW (optional): refrigerant type
    const refrigerantType = body?.refrigerantType || body?.refrigerant || "Unknown";

    // NEW: observations from UI
    const observations = body?.observations || [];
    const pathLog = body?.pathLog || [];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { result: "Missing OPENAI_API_KEY in .env.local (project root). Restart dev server after adding it." },
        { status: 500 }
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

    /**
     * IMPORTANT: We explicitly tell the model to ADJUST probabilities using observations
     * and to rewrite the decision tree accordingly.
     */

    // 1) Summary + likely causes (measurement-reactive)
    type CausesJson = {
      summary: string;
      likely_causes: {
        cause: string;
        probability_percent: number;
        why: string;
        what_points_to_it: string[];
        what_rules_it_out: string[];
      }[];
    };

    const causesPrompt = `
You are an expert HVAC/R service technician.

${context}

Return JSON ONLY with EXACTLY these keys:

{
  "summary": "",
  "likely_causes": [
    {"cause":"","probability_percent":0,"why":"","what_points_to_it":["",""],"what_rules_it_out":["",""]}
  ]
}

Rules:
- likely_causes MUST be exactly 6 items.
- probability_percent across the 6 MUST add up to 100.
- You MUST actively use the Field Observations:
  - If an observation supports a cause, increase its probability.
  - If it contradicts a cause, decrease it and list that in what_rules_it_out.
  - If observations are missing for a critical decision, mention the missing measurement in summary (one sentence).
- Keep text short (one sentence each).
`.trim();

    const causes = await callOpenAIJson<CausesJson>(apiKey, causesPrompt, 750);

    // 2) Decision tree (measurement-reactive)
    type DecisionJson = {
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
    };

    const decisionPrompt = `
You are an expert HVAC/R service technician.

${context}

Return JSON ONLY with EXACTLY these keys:

{
  "decision_tree": [
    {"step":1,"check":"","how":"","pass_condition":"","fail_condition":"","if_pass_next_step":0,"if_fail_next_step":0,"notes":""}
  ]
}

Rules:
- decision_tree MUST be exactly 7 steps numbered 1..7.
- Step 7 MUST have if_pass_next_step=0 and if_fail_next_step=0.
- You MUST react to Field Observations:
  - If a measurement is already provided, do NOT ask to measure it again.
  - Replace that step with the NEXT most useful confirmation step.
- Make it a real "check this then that" flow.
- Keep each string one sentence max.
`.trim();

    const decision = await callOpenAIJson<DecisionJson>(apiKey, decisionPrompt, 950);

    // 3) Measurements + parts + safety + escalate (measurement-reactive)
    type SupportJson = {
      field_measurements_to_collect: {
        measurement: string;
        where: string;
        how: string;
        expected_range: string;
        why_it_matters: string;
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

    const supportPrompt = `
You are an expert HVAC/R service technician.

${context}

Return JSON ONLY with EXACTLY these keys:

{
  "field_measurements_to_collect": [
    {"measurement":"","where":"","how":"","expected_range":"","why_it_matters":""}
  ],
  "parts_to_check": [
    {"part":"","why_suspect":"","quick_test":"","common_failure_modes":["",""],"priority":"High"}
  ],
  "safety_notes": ["",""],
  "when_to_escalate": ["",""]
}

Rules:
- field_measurements_to_collect MUST be exactly 4 items.
- parts_to_check MUST be exactly 6 items.
- safety_notes MUST be exactly 2 items.
- when_to_escalate MUST be exactly 2 items.
- You MUST react to Field Observations:
  - If an observation already exists, do NOT include it in field_measurements_to_collect.
  - Suggest the NEXT most diagnostic measurements.
  - Parts_to_check should prioritize the top likely causes given the observations.
- If Refrigerant is Unknown, include a measurement/step that captures refrigerant type or nameplate info (but keep counts).
- Keep each string one sentence max.
`.trim();

    const support = await callOpenAIJson<SupportJson>(apiKey, supportPrompt, 950);

    // Final object (we assemble = always valid JSON)
    const final = {
      summary: causes.summary || "",
      likely_causes: Array.isArray(causes.likely_causes) ? causes.likely_causes : [],
      field_measurements_to_collect: Array.isArray(support.field_measurements_to_collect) ? support.field_measurements_to_collect : [],
      decision_tree: Array.isArray(decision.decision_tree) ? decision.decision_tree : [],
      parts_to_check: Array.isArray(support.parts_to_check) ? support.parts_to_check : [],
      safety_notes: Array.isArray(support.safety_notes) ? support.safety_notes : [],
      when_to_escalate: Array.isArray(support.when_to_escalate) ? support.when_to_escalate : [],
    };

    return NextResponse.json({ result: JSON.stringify(final, null, 2) });
  } catch (err: any) {
    return NextResponse.json({ result: "Server error: " + (err?.message || String(err)) }, { status: 500 });
  }
}