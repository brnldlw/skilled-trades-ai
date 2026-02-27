import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiKey = process.env.OPENAI_API_KEY || "";

    // Baby-step check: if key is not present, fail with a clear message
    if (!apiKey || !apiKey.startsWith("sk-")) {
      return NextResponse.json(
        {
          result:
            `Server misconfigured: OPENAI_API_KEY missing/invalid. ` +
            `prefix=${apiKey.slice(0, 10)} len=${apiKey.length}. ` +
            `Fix in Vercel → Settings → Environment Variables → OPENAI_API_KEY (Production) then redeploy.`,
        },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    // IMPORTANT: We return STRICT JSON using response_format json_schema to avoid broken JSON
    const prompt = `
You are an expert HVAC/R technician assistant.
Return ONLY valid JSON matching the schema.

Inputs:
propertyType: ${body.propertyType || ""}
equipmentType: ${body.equipmentType || ""}
manufacturer: ${body.manufacturer || ""}
model: ${body.model || ""}
symptom: ${body.symptom || ""}
refrigerantType: ${body.refrigerantType || "Unknown"}
observations: ${JSON.stringify(body.observations || [])}
pathLog: ${JSON.stringify(body.pathLog || [])}
`;

    const schema = {
      name: "hvac_diagnosis",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          summary: { type: "string" },
          likely_causes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                cause: { type: "string" },
                probability_percent: { type: "number" },
                why: { type: "string" },
                what_points_to_it: { type: "array", items: { type: "string" } },
                what_rules_it_out: { type: "array", items: { type: "string" } },
              },
              required: ["cause", "probability_percent", "why"],
            },
          },
          field_measurements_to_collect: {
            type: "array",
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
              required: ["measurement"],
            },
          },
          decision_tree: {
            type: "array",
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
              required: ["step", "check"],
            },
          },
          parts_to_check: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                part: { type: "string" },
                priority: { type: "string" },
                why_suspect: { type: "string" },
                quick_test: { type: "string" },
                common_failure_modes: { type: "array", items: { type: "string" } },
              },
              required: ["part"],
            },
          },
          safety_notes: { type: "array", items: { type: "string" } },
          when_to_escalate: { type: "array", items: { type: "string" } },
        },
        required: ["summary", "likely_causes", "field_measurements_to_collect", "decision_tree"],
      },
      strict: true,
    } as const;

    const resp = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are HVAC/R diagnostics assistant. Be practical and step-by-step. Return ONLY JSON per schema.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_schema", json_schema: schema },
    });

    // json_schema returns JSON in output_text
    const text = resp.output_text;

    return NextResponse.json({ result: text });
  } catch (err: any) {
    return NextResponse.json(
      { result: `Server error: ${err?.message || String(err)}` },
      { status: 500 }
    );
  }
}