
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Extract the first output_text string from a Responses API payload.
 * Handles typical Responses shapes: output -> message -> content[] -> output_text.
 */
function extractOutputText(data: any): string {
  // Newer Responses API shape usually has data.output as an array.
  const out = data?.output;
  if (Array.isArray(out)) {
    for (const item of out) {
      // A "message" item often contains "content" array with output_text.
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (c?.type === "output_text" && typeof c?.text === "string") {
            return c.text;
          }
        }
      }
      // Some variants may store text directly
      if (typeof item?.text === "string") return item.text;
    }
  }

  // Fallbacks (just in case)
  if (typeof data?.output_text === "string") return data.output_text;
  if (typeof data?.text === "string") return data.text;

  return "";
}

type Observation = {
  label: string;
  value: string;
  unit: string;
  note?: string;
};

function formatObservations(observations: any): string {
  if (!Array.isArray(observations) || observations.length === 0) return "None";
  return observations
    .map((o: any, i: number) => {
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

    const propertyType = body?.propertyType ?? "Unknown";
    const equipmentType = body?.equipmentType ?? "Unknown";
    const manufacturer = body?.manufacturer ?? "";
    const modelNumber = body?.model ?? "";
    const symptom = body?.symptom ?? "";

    const refrigerantType = body?.refrigerantType || body?.refrigerant || "Unknown";
    const observations: Observation[] = Array.isArray(body?.observations) ? body.observations : [];
    const pathLog = Array.isArray(body?.pathLog) ? body.pathLog : [];

    if (!manufacturer || !symptom) {
      return NextResponse.json(
        { result: "Please fill in at least Manufacturer and Symptom." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          result:
            "Missing OPENAI_API_KEY. Add it to your environment variables and redeploy/restart.",
        },
        { status: 500 }
      );
    }

    const context = `
Property Type: ${propertyType}
Equipment Type: ${equipmentType}
Manufacturer: ${manufacturer}
Model: ${modelNumber || "Unknown"}
Refrigerant: ${refrigerantType}
Symptom: ${symptom}

Field Observations / Measurements:
${formatObservations(observations)}

Guided Path Taken (optional):
${formatPath(pathLog)}
`.trim();

    /**
     * IMPORTANT:
     * In the Responses API, Structured Outputs moved from `response_format`
     * to `text.format`. :contentReference[oaicite:2]{index=2}
     *
     * We force strict JSON Schema output so UI parsing is reliable.
     */
    const schema = {
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
              probability_percent: { type: "number", minimum: 0, maximum: 100 },
              why: { type: "string" },
              what_points_to_it: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
              what_rules_it_out: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
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
            required: [
              "step",
              "check",
              "how",
              "pass_condition",
              "fail_condition",
              "if_pass_next_step",
              "if_fail_next_step",
              "notes",
            ],
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
              common_failure_modes: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4,
              },
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
    };

    const prompt = `
You are an expert HVAC/R service technician.

${context}

Return JSON that matches the provided schema.

Rules:
- likely_causes MUST be exactly 6 items.
- probability_percent across the 6 MUST add up to 100.
- decision_tree MUST be exactly 7 steps numbered 1..7.
- Step 7 MUST end: if_pass_next_step=0 and if_fail_next_step=0.
- Use Field Observations:
  - If a reading supports a cause, increase its probability.
  - If a reading contradicts a cause, decrease it and list it in what_rules_it_out.
  - If a critical reading is missing, your summary should mention 1–2 missing key readings to collect next.
- field_measurements_to_collect MUST be exactly 4 items and should NOT repeat already-provided observations.
- parts_to_check MUST be exactly 6 items prioritized by the most likely causes.
- Keep each string to one sentence max.
`.trim();

    const aiModel = "gpt-4o-mini";

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        input: prompt,
        // Structured outputs in Responses API use text.format :contentReference[oaicite:3]{index=3}
        text: {
          format: {
            type: "json_schema",
            name: "hvac_diagnosis",
            strict: true,
            schema,
          },
        },
      }),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      const code = data?.error?.code;
      const msg = data?.error?.message || "OpenAI request failed";
      return NextResponse.json(
        { result: `Server error: OpenAI error (${r.status}) ${code || ""}: ${msg}` },
        { status: 500 }
      );
    }

    const txt = extractOutputText(data);
    if (!txt) {
      return NextResponse.json(
        { result: "Server error: OpenAI returned no text output." },
        { status: 500 }
      );
    }

    // With strict JSON schema, txt should already be valid JSON.
    // Still guard parse for safety.
    let obj: any;
    try {
      obj = JSON.parse(txt);
    } catch (e: any) {
      return NextResponse.json(
        {
          result:
            "Server error: Could not parse AI JSON output (unexpected). Raw:\n" + txt,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: JSON.stringify(obj, null, 2) });
  } catch (err: any) {
    return NextResponse.json(
      { result: "Server error: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}