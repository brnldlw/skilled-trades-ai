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
        { error: "Missing or invalid image. Upload a photo and try again." },
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

    const prompt = `
You are an expert HVAC/R field technician.

Analyze this HVAC-related photo and respond in plain text with these sections:

1. Component / What is shown
2. Visible issue
3. Most likely problem
4. Why you think that
5. What the technician should test next
6. Expected readings or normal condition
7. Recommended repair or next action
8. Safety note

Rules:
- Be practical and field-ready.
- If the photo is unclear, say what is uncertain.
- If multiple failures are possible, rank the top 3.
- Keep it concise but useful.
- Do not use markdown tables.
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

    const result = extractOutputText(data);

    if (!result) {
      return NextResponse.json(
        { error: "No analysis text returned from the model." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}