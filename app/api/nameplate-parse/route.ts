
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Nameplate parse (image -> structured fields)
 * Uses OpenAI Responses API with strict JSON schema for reliability.
 * Docs: Responses API + structured JSON schema formatting. :contentReference[oaicite:1]{index=1}
 */

type NameplateResult = {
  manufacturer: string;
  model: string;
  serial: string;
  equipment_type: string;
  tonnage: string;
  voltage: string;
  phase: string;
  hz: string;
  refrigerant: string;
  gas_input_btu: string;
  notes: string[];
  confidence: "High" | "Medium" | "Low";
};

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} (set it in Vercel + Codespaces secrets).`);
  return v;
}

function toDataUrl(base64: string, mime: string) {
  return `data:${mime};base64,${base64}`;
}

async function callOpenAIJsonSchema<T>(args: {
  apiKey: string;
  model: string;
  prompt: string;
  imageDataUrl?: string;
  schemaName: string;
  schema: any;
  maxOutputTokens?: number;
}): Promise<T> {
  const { apiKey, model, prompt, imageDataUrl, schemaName, schema, maxOutputTokens } = args;

  // Responses API request (multimodal input + strict json schema)
  // See OpenAI docs for Responses + input_image + text.format json_schema. :contentReference[oaicite:2]{index=2}
  const body: any = {
    model,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          ...(imageDataUrl ? [{ type: "input_image", image_url: imageDataUrl }] : []),
        ],
      },
    ],
    max_output_tokens: maxOutputTokens ?? 700,
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        strict: true,
        schema,
      },
    },
  };

  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await r.json().catch(() => ({} as any));
  if (!r.ok) {
    const code = data?.error?.code;
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code || ""}: ${msg}`);
  }

  // Responses API returns output text in a few shapes; the easiest is to read output_text.
  const jsonText: string =
    data?.output_text ||
    data?.output?.[0]?.content?.find((c: any) => c?.type?.includes("output_text"))?.text ||
    "";

  if (!jsonText) throw new Error("OpenAI returned empty output_text.");

  return JSON.parse(jsonText) as T;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = requireEnv("OPENAI_API_KEY");

    // Accept multipart/form-data with "image"
    const form = await req.formData();
    const file = form.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing image file (form field name must be 'image')." }, { status: 400 });
    }

    const f = file as File;
    const mime = f.type || "image/jpeg";
    const buf = Buffer.from(await f.arrayBuffer());
    const base64 = buf.toString("base64");
    const imageDataUrl = toDataUrl(base64, mime);

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        manufacturer: { type: "string" },
        model: { type: "string" },
        serial: { type: "string" },
        equipment_type: { type: "string" },
        tonnage: { type: "string" },
        voltage: { type: "string" },
        phase: { type: "string" },
        hz: { type: "string" },
        refrigerant: { type: "string" },
        gas_input_btu: { type: "string" },
        notes: { type: "array", items: { type: "string" }, minItems: 0, maxItems: 6 },
        confidence: { type: "string", enum: ["High", "Medium", "Low"] },
      },
      required: [
        "manufacturer",
        "model",
        "serial",
        "equipment_type",
        "tonnage",
        "voltage",
        "phase",
        "hz",
        "refrigerant",
        "gas_input_btu",
        "notes",
        "confidence",
      ],
    };

    const prompt = `
You are reading an HVAC equipment nameplate photo.
Extract the fields EXACTLY and conservatively.

Rules:
- If a field is not visible, return "" (empty string).
- Use short strings (no paragraphs) except notes.
- refrigerant should be like "R-410A" or "R-22" when visible; else "".
- confidence: High if model+serial are clearly readable, Medium if one is uncertain, Low if both are uncertain.
`.trim();

    // Model choice: keep it cost-friendly; you can upgrade later.
    const model = "gpt-4o-mini";

    const result = await callOpenAIJsonSchema<NameplateResult>({
      apiKey,
      model,
      prompt,
      imageDataUrl,
      schemaName: "nameplate_parse_v1",
      schema,
      maxOutputTokens: 650,
    });

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}