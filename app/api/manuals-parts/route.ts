
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// ---- OpenAI Responses API (JSON Schema via text.format) ----
async function callOpenAIJsonSchema<T>(args: {
  apiKey: string;
  prompt: string;
  schemaName: string;
  schema: any;
  model?: string;
}): Promise<T> {
  const { apiKey, prompt, schemaName, schema } = args;
  const model = args.model || "gpt-4o-mini";

  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      // NEW format for Responses API:
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  });

  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    const code = data?.error?.code || "unknown_error";
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code}: ${msg}`);
  }

  // Responses API usually returns the JSON in output_text
  const outText: string =
    data?.output_text ??
    data?.output?.[0]?.content?.[0]?.text ??
    data?.output?.[0]?.content?.[0]?.text?.value ??
    "";

  if (!outText || typeof outText !== "string") {
    throw new Error("OpenAI returned empty output_text");
  }

  try {
    return JSON.parse(outText) as T;
  } catch (e: any) {
    throw new Error(
      `Could not parse JSON from model output (length=${outText.length}): ${e?.message || e}`
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const manufacturer = String(body?.manufacturer || "").trim();
    const model = String(body?.model || "").trim();
    const equipmentType = String(body?.equipmentType || "").trim();
    const query = String(body?.query || "").trim();
    const nameplate = body?.nameplate || null; // optional object

    if (!manufacturer && !model && !query) {
      return NextResponse.json(
        { result: "Please provide at least Manufacturer, Model, or a search query." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { result: "Missing OPENAI_API_KEY (set in Vercel/Codespaces env vars)." },
        { status: 500 }
      );
    }

    // ---------------------------
    // STRICT JSON schema
    // IMPORTANT: In strict mode, EVERY object must have required including ALL keys in properties.
    // That’s why we make "note" required (it can be "" if not needed).
    // ---------------------------
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        manuals: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              url: { type: "string" },
              type: { type: "string" }, // e.g., "Service Manual", "IOM", "Wiring Diagram"
              confidence_percent: { type: "number" },
              why_relevant: { type: "string" },
              note: { type: "string" }, // REQUIRED in strict mode (can be "")
            },
            required: ["title", "url", "type", "confidence_percent", "why_relevant", "note"],
          },
        },
        parts: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              part: { type: "string" },
              description: { type: "string" },
              why_relevant: { type: "string" },
              confidence_percent: { type: "number" },
              possible_part_numbers: { type: "array", items: { type: "string" } },
              where_to_buy_url: { type: "string" },
              note: { type: "string" }, // REQUIRED in strict mode (can be "")
            },
            required: [
              "part",
              "description",
              "why_relevant",
              "confidence_percent",
              "possible_part_numbers",
              "where_to_buy_url",
              "note",
            ],
          },
        },
        cautions: { type: "array", items: { type: "string" } },
      },
      required: ["summary", "manuals", "parts", "cautions"],
    };

    const prompt = `
You are helping an HVAC/R service tech find the BEST manuals and likely replacement parts.

INPUT:
- Manufacturer: ${manufacturer || "Unknown"}
- Model: ${model || "Unknown"}
- Equipment Type: ${equipmentType || "Unknown"}
- Search Query / Symptom: ${query || "None"}

OPTIONAL NAMEPLATE (if provided):
${nameplate ? JSON.stringify(nameplate, null, 2) : "None"}

TASK:
Return JSON that matches the schema EXACTLY.

Rules:
- manuals: return 5 items max. Use real-looking titles and URLs if possible; if unsure, still return a helpful best-guess URL (manufacturer support page, docs page, etc).
- parts: return 8 items max. Focus on common failure items and anything tied to the query/symptom.
- confidence_percent: 0-100 (be honest).
- note: MUST be present but can be "" if you have nothing to add.
- cautions: include 2-5 safety / verification cautions (confirm model/serial, voltage, refrigerant, revision, etc).

No markdown. JSON only.
`.trim();

    type Out = {
      summary: string;
      manuals: {
        title: string;
        url: string;
        type: string;
        confidence_percent: number;
        why_relevant: string;
        note: string;
      }[];
      parts: {
        part: string;
        description: string;
        why_relevant: string;
        confidence_percent: number;
        possible_part_numbers: string[];
        where_to_buy_url: string;
        note: string;
      }[];
      cautions: string[];
    };

    const out = await callOpenAIJsonSchema<Out>({
      apiKey,
      prompt,
      schemaName: "manuals_parts",
      schema,
      model: "gpt-4o-mini",
    });

    return NextResponse.json({ result: JSON.stringify(out, null, 2) });
  } catch (err: any) {
    return NextResponse.json(
      { result: "Server error: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}