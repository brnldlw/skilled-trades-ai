import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type LinkItem = { title: string; url: string; note?: string };

type ManualsPartsResponse = {
  summary: string;
  suggested_search_terms: string[];
  manuals: LinkItem[];
  parts: LinkItem[];
  probable_parts_to_check: { part: string; why: string }[];
};

function getOutputText(resp: any): string {
  const out = resp?.output;
  if (!Array.isArray(out)) return "";
  for (const item of out) {
    const content = item?.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (c?.type === "output_text" && typeof c?.text === "string") return c.text;
    }
  }
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
}): Promise<T> {
  const { apiKey, model, prompt, schemaName, schema, maxOutputTokens = 900, temperature = 0.2 } = args;

  const body = {
    model,
    input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
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
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  const raw = await r.text();
  let data: any = null;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`OpenAI returned non-JSON (${r.status}): ${raw.slice(0, 200)}`);
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

function google(q: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const manufacturer = String(body?.manufacturer || "").trim();
    const modelNum = String(body?.model || "").trim();
    const serial = String(body?.serial || "").trim();
    const equipmentType = String(body?.equipmentType || "").trim();
    const symptom = String(body?.symptom || "").trim();

    if (!manufacturer) {
      return NextResponse.json({ ok: false, error: "manufacturer is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "OPENAI_API_KEY missing." }, { status: 500 });
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        suggested_search_terms: { type: "array", items: { type: "string" } },
        manuals: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              url: { type: "string" },
              note: { type: "string" },
            },
            required: ["title", "url"],
          },
        },
        parts: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              url: { type: "string" },
              note: { type: "string" },
            },
            required: ["title", "url"],
          },
        },
        probable_parts_to_check: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              part: { type: "string" },
              why: { type: "string" },
            },
            required: ["part", "why"],
          },
        },
      },
      required: ["summary", "suggested_search_terms", "manuals", "parts", "probable_parts_to_check"],
    };

    const prompt = `
You are helping an HVAC tech find the RIGHT service manual and common parts sources.

Inputs:
- Manufacturer: ${manufacturer}
- Model: ${modelNum || "Unknown"}
- Serial: ${serial || "Unknown"}
- Equipment type: ${equipmentType || "Unknown"}
- Symptom: ${symptom || "Unknown"}

Return JSON matching the schema.
Rules:
- Include 6 suggested_search_terms (each one a short Google-able query).
- Include 6 manuals links and 6 parts links.
- Links can be Google searches OR direct to reputable vendor/support portals if you know them.
- Keep summary one sentence.
- probable_parts_to_check should be 6 items, practical field parts (contactors, caps, igniter, flame sensor, etc), tailored to symptom if provided.
`.trim();

    const aiModel = "gpt-4o-mini";

    const ai = await callOpenAIJsonSchema<ManualsPartsResponse>({
      apiKey,
      model: aiModel,
      prompt,
      schemaName: "manuals_parts",
      schema,
      maxOutputTokens: 900,
      temperature: 0.2,
    });

    // If model returns any empty/unsafe links, backfill with sensible Google searches.
    const baseQ = `${manufacturer} ${modelNum}`.trim();
    const fallbackManuals: LinkItem[] = [
      { title: "Service manual (Google)", url: google(`${baseQ} service manual`) },
      { title: "Installation manual (Google)", url: google(`${baseQ} installation manual`) },
      { title: "Wiring diagram (Google)", url: google(`${baseQ} wiring diagram`) },
      { title: "IOM (Google)", url: google(`${baseQ} IOM pdf`) },
      { title: "Parts list (Google)", url: google(`${baseQ} parts list`) },
      { title: "Sequence of operation (Google)", url: google(`${baseQ} sequence of operation`) },
    ];
    const fallbackParts: LinkItem[] = [
      { title: "OEM part lookup (Google)", url: google(`${baseQ} OEM parts`) },
      { title: "SupplyHouse search", url: google(`${baseQ} site:supplyhouse.com`) },
      { title: "Johnstone search", url: google(`${baseQ} site:johnstonesupply.com`) },
      { title: "United Refrigeration search", url: google(`${baseQ} site:uri.com`) },
      { title: "Carrier/Bryant/ICP parts (Google)", url: google(`${baseQ} ICP parts`) },
      { title: "HVAC part number search (Google)", url: google(`${baseQ} part number`) },
    ];

    const cleanLinks = (arr: LinkItem[], fallback: LinkItem[]) => {
      const good = (arr || []).filter((x) => x?.url && /^https?:\/\//i.test(x.url));
      return good.length >= 3 ? good.slice(0, 6) : fallback;
    };

    return NextResponse.json({
      ok: true,
      data: {
        ...ai,
        manuals: cleanLinks(ai.manuals, fallbackManuals),
        parts: cleanLinks(ai.parts, fallbackParts),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Server error: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}