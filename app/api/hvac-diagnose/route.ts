
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** ---------------------------
 * Helpers
 * --------------------------*/

function toStr(x: any) {
  return typeof x === "string" ? x : x == null ? "" : String(x);
}

function safeJsonParse<T>(s: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(s) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || "JSON parse failed" };
  }
}

function formatObservations(observations: any): string {
  if (!Array.isArray(observations) || observations.length === 0) return "None";
  return observations
    .map((o, i) => {
      const label = toStr(o?.label).trim() || `Observation ${i + 1}`;
      const value = toStr(o?.value).trim();
      const unit = toStr(o?.unit).trim();
      const note = toStr(o?.note).trim();
      return `- ${label}: ${value}${unit ? " " + unit : ""}${note ? ` (note: ${note})` : ""}`;
    })
    .join("\n");
}

function formatPath(pathLog: any): string {
  if (!Array.isArray(pathLog) || pathLog.length === 0) return "None";
  return pathLog.map((p: any) => `- Step ${p?.step}: ${p?.decision} -> ${p?.nextStep}`).join("\n");
}

/**
 * Extract the assistant's output_text from the Responses API response
 */
function extractOutputText(resp: any): string {
  const out = resp?.output;
  if (!Array.isArray(out)) return "";
  for (const item of out) {
    if (item?.type === "message" && Array.isArray(item?.content)) {
      for (const c of item.content) {
        if (c?.type === "output_text" && typeof c?.text === "string") {
          return c.text;
        }
      }
    }
  }
  return "";
}

/** ---------------------------
 * JSON Schema (Structured Outputs)
 * --------------------------*/

const diagnosisSchema = {
  name: "hvac_diagnosis_v1",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },

      likely_causes: {
        type: "array",
        minItems: 6,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            cause: { type: "string" },
            probability_percent: { type: "number" },
            why: { type: "string" },
            what_points_to_it: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
            what_rules_it_out: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
          },
          required: ["cause", "probability_percent", "why", "what_points_to_it", "what_rules_it_out"],
        },
      },

      field_measurements_to_collect: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            measurement: { type: "string" },
            where: { type: "string" },
            how: { type: "string" },
            expected_range: { type: "string" },
            why_it_matters: { type: "string" },
          },
          required: ["measurement", "where", "how", "expected_range", "why_it_matters"],
        },
      },

      decision_tree: {
        type: "array",
        minItems: 7,
        maxItems: 7,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            step: { type: "number" },
            check: { type: "string" },
            how: { type: "string" },
            pass_condition: { type: "string" },
            fail_condition: { type: "string" },
            if_pass_next_step: { type: "number" },
            if_fail_next_step: { type: "number" },
            notes: { type: "string" },
          },
          required: ["step", "check", "how", "pass_condition", "fail_condition", "if_pass_next_step", "if_fail_next_step", "notes"],
        },
      },

      parts_to_check: {
        type: "array",
        minItems: 6,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            part: { type: "string" },
            why_suspect: { type: "string" },
            quick_test: { type: "string" },
            common_failure_modes: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
            priority: { type: "string", enum: ["High", "Medium", "Low"] },
          },
          required: ["part", "why_suspect", "quick_test", "common_failure_modes", "priority"],
        },
      },

      safety_notes: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
      when_to_escalate: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
    },
    required: [
      "summary",
      "likely_causes",
      "field_measurements_to_collect",
      "decision_tree",
      "parts_to_check",
      "safety_notes",
      "when_to_escalate",
    ],
  },
};

/** ---------------------------
 * Responses API call
 * --------------------------*/

async function callResponsesJsonSchema(args: {
  apiKey: string;
  modelId: string;
  instructions: string;
  input: string;
  schema: any;
}) {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.modelId,
      instructions: args.instructions,
      input: args.input,
      // IMPORTANT: Responses API uses text.format (not response_format)
      text: {
        format: {
          type: "json_schema",
          name: args.schema?.name || "schema",
          schema: args.schema?.schema,
          strict: args.schema?.strict ?? true,
        },
      },
    }),
  });

  const data = await r.json().catch(() => ({} as any));
  if (!r.ok) {
    const code = data?.error?.code;
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code || ""}: ${msg}`);
  }

  const text = extractOutputText(data);
  if (!text) throw new Error("OpenAI returned no output text.");
  return text;
}

/** ---------------------------
 * Route
 * --------------------------*/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const propertyType = toStr(body?.propertyType).trim();
    const equipmentType = toStr(body?.equipmentType).trim();
    const manufacturer = toStr(body?.manufacturer).trim();
    const modelNumber = toStr(body?.model).trim(); // avoid name collision with "model"
    const symptom = toStr(body?.symptom).trim();

    const refrigerantType = toStr(body?.refrigerantType || body?.refrigerant || "Unknown").trim() || "Unknown";

    const observations = body?.observations || [];
    const pathLog = body?.pathLog || [];

    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { result: "Missing OPENAI_API_KEY (set it in Vercel Environment Variables and redeploy)." },
        { status: 500 }
      );
    }

    const context = `
Property Type: ${propertyType || "Unknown"}
Equipment Type: ${equipmentType || "Unknown"}
Manufacturer: ${manufacturer || "Unknown"}
Model: ${modelNumber || "Unknown"}
Refrigerant: ${refrigerantType}
Symptom: ${symptom || "Unknown"}

Field Observations / Measurements:
${formatObservations(observations)}

Guided Path Taken (optional):
${formatPath(pathLog)}
`.trim();

    const instructions = `
You are an expert HVAC/R service technician.
You produce field-usable troubleshooting output with tight, practical wording.
You must follow the JSON Schema exactly.
`.trim();

    const input = `
${context}

Return the diagnosis JSON in the required schema.

Rules you MUST follow:
- likely_causes: exactly 6 items; probability_percent across all 6 MUST add to 100.
- decision_tree: exactly 7 steps numbered 1..7; step 7 ends with both next steps = 0.
- React to measurements:
  - If a measurement supports a cause, increase its probability and list that evidence in what_points_to_it.
  - If a measurement contradicts a cause, decrease its probability and list that evidence in what_rules_it_out.
  - If a key measurement is missing, request it in field_measurements_to_collect.
- field_measurements_to_collect: exactly 4 items; do NOT repeat measurements already provided.
- parts_to_check: exactly 6 items; include quick “prove it” tests.
- safety_notes: exactly 2 items.
- when_to_escalate: exactly 2 items.
- Keep each string one sentence max.
`.trim();

    const modelId = "gpt-4o-mini";

    const rawJsonText = await callResponsesJsonSchema({
      apiKey,
      modelId,
      instructions,
      input,
      schema: diagnosisSchema,
    });

    // Extra safety: ensure it parses (should, because schema is strict)
    const parsed = safeJsonParse<any>(rawJsonText);
    if (!parsed.ok) {
      return NextResponse.json(
        {
          result:
            `Rules-only diagnosis (AI JSON parse failed: ${parsed.error}). ` +
            `Re-run after adding 1–2 more key readings.`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ result: JSON.stringify(parsed.value, null, 2) });
  } catch (err: any) {
    return NextResponse.json({ result: "Server error: " + (err?.message || String(err)) }, { status: 500 });
  }
}