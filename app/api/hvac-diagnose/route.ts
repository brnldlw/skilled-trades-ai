import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

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

async function callOpenAIText(client: OpenAI, prompt: string, maxTokens: number) {
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert HVAC/R technician assistant. Return ONLY valid JSON. No markdown." },
      { role: "user", content: prompt },
    ],
    temperature: 0.15,
    max_tokens: maxTokens,
  });

  return resp.choices?.[0]?.message?.content ?? "";
}

async function callOpenAIJson<T>(client: OpenAI, prompt: string, maxTokens: number): Promise<T> {
  const raw1 = await callOpenAIText(client, prompt, maxTokens);
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

    const raw2 = await callOpenAIText(client, repairPrompt, Math.min(650, maxTokens));
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
  return pathLog.map((p: any) => `- Step ${p?.step}: ${p?.decision} -> ${p?.nextStep}`).join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const propertyType = body?.propertyType;
    const equipmentType = body?.equipmentType;
    const manufacturer = body?.manufacturer;
    const model = body?.model;
    const symptom = body?.symptom;

    const refrigerantType = body?.refrigerantType || body?.refrigerant || "Unknown";
    const observations = body?.observations || [];
    const pathLog = body?.pathLog || [];

    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey || !apiKey.startsWith("sk-")) {
      return NextResponse.json(
        {
          result:
            `Server misconfigured: OPENAI_API_KEY missing/invalid. ` +
            `prefix=${apiKey.slice(0, 10)} len=${apiKey.length}. ` +
            `Set in Vercel → Settings → Environment Variables (Production) then redeploy.`,
        },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

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
- likely_causes MUST be exactly 6 items and add to 100%.
- field_measurements_to_collect MUST be exactly 4 items.
- decision_tree MUST be exactly 7 steps (1..7) and step 7 ends (both next = 0).
- parts_to_check MUST be exactly 6 items.
- safety_notes MUST be exactly 2 items.
- when_to_escalate MUST be exactly 2 items.
- You MUST react to Field Observations:
  - If a measurement is already provided, do NOT ask to measure it again.
  - Adjust likely cause probabilities based on observations.
  - Suggest next best measurements not already present.
- Keep each string one sentence max.
`.trim();

    const final = await callOpenAIJson<FinalJson>(client, prompt, 1200);
    return NextResponse.json({ result: JSON.stringify(final, null, 2) });
  } catch (err: any) {
    return NextResponse.json({ result: "Server error: " + (err?.message || String(err)) }, { status: 500 });
  }
}