import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** -------- helpers -------- */

function extractJsonBlock(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

function sanitizeJson(jsonLike: string) {
  let s = jsonLike;
  // remove control chars that can break JSON parsing
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  // remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");
  return s;
}

async function openaiJson(apiKey: string, prompt: string, maxTokens: number) {
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

  const data = await r.json().catch(() => ({} as any));

  if (!r.ok) {
    const code = data?.error?.code || "";
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code}: ${msg}`);
  }

  return data?.choices?.[0]?.message?.content ?? "";
}

async function safeParseJson(raw: string) {
  const block = sanitizeJson(extractJsonBlock(raw));
  try {
    return JSON.parse(block);
  } catch (e: any) {
    return { __parse_error: e?.message || String(e), __raw: block };
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

/** -------- route -------- */

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || "";

  // SAFE debug info (does not expose full key)
  const keyDebug = {
    hasKey: !!apiKey,
    prefix: apiKey.slice(0, 10),
    length: apiKey.length,
    startsWithSk: apiKey.startsWith("sk-"),
  };

  try {
    const body = await req.json();

    const propertyType = body?.propertyType || "Unknown";
    const equipmentType = body?.equipmentType || "Unknown";
    const manufacturer = body?.manufacturer || "";
    const model = body?.model || "";
    const symptom = body?.symptom || "";

    const refrigerantType = body?.refrigerantType || body?.refrigerant || "Unknown";
    const observations = body?.observations || [];
    const pathLog = body?.pathLog || [];

    if (!apiKey) {
      return NextResponse.json(
        { result: `Server misconfigured: OPENAI_API_KEY missing. keyDebug=${JSON.stringify(keyDebug)}` },
        { status: 500 }
      );
    }

    if (!manufacturer || !symptom) {
      return NextResponse.json(
        { result: "Please provide at least manufacturer and symptom." },
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

    // Single prompt returns FULL object so UI always has everything
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
- likely_causes MUST be exactly 6 items, probability_percent across 6 MUST add to 100.
- field_measurements_to_collect MUST be exactly 6 items (avoid duplicates).
- decision_tree MUST be exactly 7 steps numbered 1..7. Step 7 next steps must be 0/0.
- parts_to_check MUST be exactly 8 items, each with priority High/Medium/Low.
- safety_notes MUST be exactly 3 items.
- when_to_escalate MUST be exactly 3 items.
- You MUST react to observations:
  - If an observation supports a cause, increase its probability.
  - If it contradicts a cause, decrease it and list it in what_rules_it_out.
  - If refrigerant is Unknown, include a decision step to confirm refrigerant/nameplate.
- Keep each string one sentence max. No markdown. JSON only.
`.trim();

    const raw = await openaiJson(apiKey, prompt, 1400);
    const parsed = await safeParseJson(raw);

    // If parse failed, do one repair pass (still JSON-only)
    if ((parsed as any)?.__parse_error) {
      const repairPrompt = `
You are a strict JSON repair tool.
Return ONLY valid JSON. No markdown. No commentary. No trailing commas.
Fix this JSON and keep the SAME KEYS.

BROKEN_JSON:
${(parsed as any).__raw}
`.trim();

      const raw2 = await openaiJson(apiKey, repairPrompt, 800);
      const parsed2 = await safeParseJson(raw2);

      if ((parsed2 as any)?.__parse_error) {
        return NextResponse.json({
          result:
            `Could not parse model JSON reliably (${(parsed2 as any).__parse_error}). ` +
            `keyDebug=${JSON.stringify(keyDebug)}`,
        });
      }

      return NextResponse.json({ result: JSON.stringify(parsed2, null, 2) });
    }

    return NextResponse.json({ result: JSON.stringify(parsed, null, 2) });
  } catch (err: any) {
    return NextResponse.json(
      { result: `Server error: ${err?.message || String(err)} keyDebug=${JSON.stringify(keyDebug)}` },
      { status: 500 }
    );
  }
}