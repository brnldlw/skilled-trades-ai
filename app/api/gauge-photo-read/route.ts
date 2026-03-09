import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function extractOutputText(data: any): string {
  const out = data?.output;
  if (Array.isArray(out)) {
    for (const item of out) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (c?.type === "output_text" && typeof c?.text === "string") {
            return c.text;
          }
        }
      }
    }
  }

  if (typeof data?.output_text === "string") return data.output_text;
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const image = String(body?.image || "").trim();

    if (!image || !image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Missing or invalid image. Upload a gauge photo and try again." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        suction_psi: { type: ["number", "null"] },
        head_psi: { type: ["number", "null"] },
        low_sat_f: { type: ["number", "null"] },
        high_sat_f: { type: ["number", "null"] },
        quick_diagnosis: { type: "string" },
        notes: { type: "string" },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
      },
      required: [
        "suction_psi",
        "head_psi",
        "low_sat_f",
        "high_sat_f",
        "quick_diagnosis",
        "notes",
        "confidence",
      ],
    };

    const prompt = `
You are an expert HVAC/R field technician reading a photo of manifold gauges.

Return JSON only.

Rules:
- Read the low side / suction pressure if visible.
- Read the high side / head pressure if visible.
- Read low-side saturation temperature if visible.
- Read high-side saturation temperature if visible.
- If a value is not readable, return null.
- quick_diagnosis must be short and practical.
- notes should explain uncertainty or what is hard to see.
- confidence should be high, medium, or low.
- Do not invent values.
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
              {
                type: "input_image",
                image_url: image,
                detail: "high",
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "gauge_reader",
            strict: true,
            schema,
          },
        },
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const code = data?.error?.code || "unknown_error";
      const msg = data?.error?.message || "OpenAI request failed";
      return NextResponse.json(
        { error: `OpenAI error (${response.status}) ${code}: ${msg}` },
        { status: 500 }
      );
    }

    const resultText = extractOutputText(data);
    if (!resultText) {
      return NextResponse.json(
        { error: "No gauge analysis returned from the model." },
        { status: 500 }
      );
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(resultText);
    } catch {
      return NextResponse.json(
        { error: "Model returned unreadable gauge JSON." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: parsed });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}