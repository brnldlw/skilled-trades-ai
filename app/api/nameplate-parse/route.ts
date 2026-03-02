import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function extractJsonBlock(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

function sanitizeJson(jsonLike: string) {
  let s = jsonLike;
  // remove control chars that break JSON
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  // remove trailing commas
  s = s.replace(/,\s*([}\]])/g, "$1");
  return s;
}

async function callOpenAI(apiKey: string, payload: any) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const code = data?.error?.code;
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code || ""}: ${msg}`);
  }
  return data?.choices?.[0]?.message?.content ?? "";
}

async function callOpenAIJson<T>(apiKey: string, payload: any): Promise<T> {
  const raw1 = await callOpenAI(apiKey, payload);
  const block1 = sanitizeJson(extractJsonBlock(raw1));

  try {
    return JSON.parse(block1) as T;
  } catch {
    // repair attempt
    const repairPayload = {
      model: payload.model,
      messages: [
        {
          role: "user",
          content: `You are a strict JSON repair tool.
Return ONLY valid JSON. No markdown. No commentary. No trailing commas.
Fix this JSON and keep the SAME keys.

BROKEN_JSON:
${block1}`.trim(),
        },
      ],
      temperature: 0,
      max_tokens: 900,
      response_format: { type: "json_object" },
    };

    const raw2 = await callOpenAI(apiKey, repairPayload);
    const block2 = sanitizeJson(extractJsonBlock(raw2));
    return JSON.parse(block2) as T;
  }
}

type NameplateJson = {
  manufacturer: string;
  model: string;
  serial: string;
  equipment_type: string;
  refrigerant: string;
  voltage: string;
  phase: string;
  hz: string;
  mca: string;
  mocp: string;
  rla: string;
  fla: string;
  charge: string;
  notes: string[];
  confidence: "High" | "Medium" | "Low";
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageDataUrl = body?.imageDataUrl;

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return NextResponse.json({ result: "Missing imageDataUrl" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { result: "Missing OPENAI_API_KEY on server (Vercel env var or .env.local)." },
        { status: 500 }
      );
    }

    const prompt = `You are an expert HVAC/R tech.
Read the equipment nameplate in the image.
Return JSON ONLY with EXACT keys:

{
  "manufacturer":"",
  "model":"",
  "serial":"",
  "equipment_type":"",
  "refrigerant":"",
  "voltage":"",
  "phase":"",
  "hz":"",
  "mca":"",
  "mocp":"",
  "rla":"",
  "fla":"",
  "charge":"",
  "notes":["",""],
  "confidence":"High"
}

Rules:
- If a field is not visible, use "" (empty string).
- notes should be short.
- confidence: High/Medium/Low depending on readability.
`.trim();

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 900,
      response_format: { type: "json_object" },
    };

    const parsed = await callOpenAIJson<NameplateJson>(apiKey, payload);

    return NextResponse.json({
      result: JSON.stringify(parsed, null, 2),
    });
  } catch (err: any) {
    return NextResponse.json(
      { result: "Server error: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}