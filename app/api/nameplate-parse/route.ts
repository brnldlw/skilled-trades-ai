import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type NameplateResult = {
  manufacturer: string | null;
  model: string | null;
  serial: string | null;
  equipment_type: string | null;
  refrigerant: string | null;
  voltage: string | null;
  phase: string | null;
  hz: string | null;
  mca: string | null;
  mop: string | null;
  rla: string | null;
  fla: string | null;
  tonnage: string | null;
  heat_type: string | null; // gas / electric / heat pump / unknown
  gas_type: string | null; // natural gas / propane / unknown
  notes: string;
  confidence: "high" | "medium" | "low";
};

function getOutputText(resp: any): string {
  // Responses API returns output items; grab the first output_text
  const out = resp?.output;
  if (!Array.isArray(out)) return "";
  for (const item of out) {
    const content = item?.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (c?.type === "output_text" && typeof c?.text === "string") return c.text;
    }
  }
  // fallback
  return resp?.output_text ?? "";
}

async function callOpenAIJsonSchema<T>(args: {
  apiKey: string;
  model: string;
  prompt: string;
  schemaName: string;
  schema: any;
  maxOutputTokens?: number;
  temperature?: number;
  imageDataUrl?: string;
}): Promise<T> {
  const {
    apiKey,
    model,
    prompt,
    schemaName,
    schema,
    maxOutputTokens = 900,
    temperature = 0.1,
    imageDataUrl,
  } = args;

  const inputContent: any[] = [{ type: "input_text", text: prompt }];

  // Image input is supported as { type:"input_image", image_url:"..." } :contentReference[oaicite:2]{index=2}
  if (imageDataUrl) {
    inputContent.push({ type: "input_image", image_url: imageDataUrl, detail: "high" });
  }

  // Structured output uses text.format with json_schema :contentReference[oaicite:3]{index=3}
  const body = {
    model,
    input: [{ role: "user", content: inputContent }],
    temperature,
    max_output_tokens: maxOutputTokens,
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        schema,
        strict: true,
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

  const rawText = await r.text();
  let data: any = null;
  try {
    data = JSON.parse(rawText);
  } catch {
    // if OpenAI returns non-JSON (rare), raise a readable error
    throw new Error(`OpenAI returned non-JSON (${r.status}): ${rawText.slice(0, 200)}`);
  }

  if (!r.ok) {
    const code = data?.error?.code;
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code || ""}: ${msg}`);
  }

  const txt = getOutputText(data);
  if (!txt) throw new Error("OpenAI response had no output_text.");
  return JSON.parse(txt) as T;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageDataUrl = String(body?.imageDataUrl || "");
    const hintEquipmentType = String(body?.equipmentType || "").trim();

    if (!imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid imageDataUrl (must be a data:image/... URL)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured: OPENAI_API_KEY missing." },
        { status: 500 }
      );
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        manufacturer: { type: ["string", "null"] },
        model: { type: ["string", "null"] },
        serial: { type: ["string", "null"] },
        equipment_type: { type: ["string", "null"] },
        refrigerant: { type: ["string", "null"] },
        voltage: { type: ["string", "null"] },
        phase: { type: ["string", "null"] },
        hz: { type: ["string", "null"] },
        mca: { type: ["string", "null"] },
        mop: { type: ["string", "null"] },
        rla: { type: ["string", "null"] },
        fla: { type: ["string", "null"] },
        tonnage: { type: ["string", "null"] },
        heat_type: { type: ["string", "null"] },
        gas_type: { type: ["string", "null"] },
        notes: { type: "string" },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
      },
      required: [
        "manufacturer",
        "model",
        "serial",
        "equipment_type",
        "refrigerant",
        "voltage",
        "phase",
        "hz",
        "mca",
        "mop",
        "rla",
        "fla",
        "tonnage",
        "heat_type",
        "gas_type",
        "notes",
        "confidence",
      ],
    };

    const prompt = `
You are reading an HVAC equipment nameplate photo.
Return ONLY valid JSON matching the schema.
- If a field is not visible, set it to null.
- Keep notes short.
Equipment type hint (if provided): ${hintEquipmentType || "Unknown"}
`.trim();

    const aiModel = "gpt-4o-mini";

    const result = await callOpenAIJsonSchema<NameplateResult>({
      apiKey,
      model: aiModel,
      prompt,
      schemaName: "nameplate_parse",
      schema,
      imageDataUrl,
      maxOutputTokens: 900,
      temperature: 0.1,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Server error: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}