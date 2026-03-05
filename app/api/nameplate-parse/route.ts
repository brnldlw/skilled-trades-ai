mkdir -p app/api/nameplate-parse
cat > app/api/nameplate-parse/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Nameplate = {
  manufacturer?: string;
  model?: string;
  serial?: string;
  equipmentType?: string;
  refrigerantType?: string;
  voltage?: string;
  phases?: string;
  hz?: string;
  mca?: string;
  mop?: string;
  gasType?: string;
  heatInputBtuh?: string;
  notes?: string[];
};

function extractJsonBlock(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text;
}

function sanitizeJson(jsonLike: string) {
  let s = jsonLike;
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  s = s.replace(/,\s*([}\]])/g, "$1");
  return s;
}

async function callOpenAIJson<T>(apiKey: string, prompt: string, maxTokens: number): Promise<T> {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  const data = await r.json();
  if (!r.ok) {
    const code = data?.error?.code;
    const msg = data?.error?.message || "OpenAI request failed";
    throw new Error(`OpenAI error (${r.status}) ${code || ""}: ${msg}`);
  }

  const raw = data?.choices?.[0]?.message?.content ?? "";
  const block = sanitizeJson(extractJsonBlock(raw));
  return JSON.parse(block) as T;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });

    const body = await req.json();
    const text = String(body?.text || "").trim();
    if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

    const prompt = `
You are an HVAC nameplate parser.
Return ONLY valid JSON.

INPUT_TEXT:
${text}

Return JSON with EXACT keys:
{
  "manufacturer": "",
  "model": "",
  "serial": "",
  "equipmentType": "",
  "refrigerantType": "",
  "voltage": "",
  "phases": "",
  "hz": "",
  "mca": "",
  "mop": "",
  "gasType": "",
  "heatInputBtuh": "",
  "notes": ["",""]
}

Rules:
- If unknown, use "".
- notes should be a short list (0-3 items).
`.trim();

    const nameplate = await callOpenAIJson<Nameplate>(apiKey, prompt, 500);

    return NextResponse.json({ nameplate });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error: " + (err?.message || String(err)) }, { status: 500 });
  }
}
EOF
