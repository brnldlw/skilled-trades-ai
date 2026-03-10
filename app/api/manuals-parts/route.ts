import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

type NameplateLike = {
  manufacturer?: string | null;
  model?: string | null;
  serial?: string | null;
  refrigerant?: string | null;
  voltage?: string | null;
  phase?: string | null;
  tonnage?: string | null;
  btu?: string | null;
  mca?: string | null;
  mop?: string | null;
  notes?: string | null;
};

type ManualsPartsRequest = {
  manufacturer?: string;
  model?: string;
  equipmentType?: string;
  symptom?: string;
  serial?: string;
  query?: string;
  nameplate?: NameplateLike | null;
};

type LinkItem = {
  title: string;
  url: string;
  note: string | null;
};

type ProbablePart = {
  part: string;
  why: string;
};

type ManualsPartsResult = {
  summary: string;
  suggested_search_terms: string[];
  manuals: LinkItem[];
  parts: LinkItem[];
  probable_parts_to_check: ProbablePart[];
};

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const v = item.trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function dedupeLinks(items: LinkItem[]): LinkItem[] {
  const seen = new Set<string>();
  const out: LinkItem[] = [];
  for (const item of items) {
    const title = cleanString(item.title);
    const url = cleanString(item.url);
    const note =
      typeof item.note === "string" && item.note.trim() ? item.note.trim() : null;

    if (!title || !url) continue;

    const key = `${title.toLowerCase()}|${url.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ title, url, note });
  }
  return out;
}

function dedupeProbableParts(items: ProbablePart[]): ProbablePart[] {
  const seen = new Set<string>();
  const out: ProbablePart[] = [];
  for (const item of items) {
    const part = cleanString(item.part);
    const why = cleanString(item.why);
    if (!part || !why) continue;

    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ part, why });
  }
  return out;
}

function buildFallbackResult(input: ManualsPartsRequest): ManualsPartsResult {
  const manufacturer = cleanString(input.manufacturer);
  const model = cleanString(input.model);
  const equipmentType = cleanString(input.equipmentType) || "HVAC equipment";
  const symptom = cleanString(input.symptom || input.query);
  const serial = cleanString(input.serial || input.nameplate?.serial);

  const baseUnit = [manufacturer, model].filter(Boolean).join(" ").trim() || equipmentType;

  const searchTerms = dedupeStrings([
    `${baseUnit} installation manual`,
    `${baseUnit} service manual`,
    `${baseUnit} parts list`,
    `${baseUnit} parts breakdown`,
    symptom ? `${baseUnit} ${symptom}` : "",
    serial ? `${manufacturer} ${serial} parts` : "",
  ]).slice(0, 6);

  const manuals: LinkItem[] = [
    {
      title: `${baseUnit} service manual search`,
      url: googleSearchUrl(`${baseUnit} service manual filetype:pdf`),
      note: "Search for service manual PDF",
    },
    {
      title: `${baseUnit} installation manual search`,
      url: googleSearchUrl(`${baseUnit} installation manual filetype:pdf`),
      note: "Search for install / IOM PDF",
    },
    {
      title: `${baseUnit} OEM documents`,
      url: googleSearchUrl(`${manufacturer} ${model} official manual`),
      note: "Search OEM document pages",
    },
  ];

  const parts: LinkItem[] = [
    {
      title: `${baseUnit} parts breakdown`,
      url: googleSearchUrl(`${baseUnit} parts breakdown`),
      note: "Search exploded view / parts list",
    },
    {
      title: `${baseUnit} replacement parts`,
      url: googleSearchUrl(`${baseUnit} replacement parts`),
      note: "Search supply house and OEM parts pages",
    },
    {
      title: `${baseUnit} model parts`,
      url: googleSearchUrl(`${manufacturer} ${model} parts`),
      note: "Search by manufacturer and model",
    },
  ];

  const probableParts: ProbablePart[] = dedupeProbableParts([
    symptom.toLowerCase().includes("cool")
      ? { part: "Contactor", why: "Common failure point on no-cooling calls." }
      : { part: "Thermostat / control signal", why: "Basic call-for-operation should be verified first." },
    symptom.toLowerCase().includes("heat")
      ? { part: "Igniter / flame sensor / pressure switch", why: "Common gas heat fault items." }
      : { part: "Run capacitor", why: "Frequent electrical failure item for motors and compressors." },
    { part: "Fan motor", why: "Frequent issue on airflow and condenser complaints." },
  ]).slice(0, 5);

  return {
    summary:
      `Built search links for ${baseUnit}. ` +
      `These are search targets to help locate manuals and parts quickly.`,
    suggested_search_terms: searchTerms,
    manuals: dedupeLinks(manuals).slice(0, 5),
    parts: dedupeLinks(parts).slice(0, 5),
    probable_parts_to_check: probableParts,
  };
}

function normalizeResult(raw: unknown, fallback: ManualsPartsResult): ManualsPartsResult {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const summary =
    cleanString(obj.summary) || fallback.summary;

  const suggested_search_terms = Array.isArray(obj.suggested_search_terms)
    ? dedupeStrings(obj.suggested_search_terms.map((x) => cleanString(x))).slice(0, 8)
    : fallback.suggested_search_terms;

  const manuals = Array.isArray(obj.manuals)
    ? dedupeLinks(
        obj.manuals.map((item) => {
          const o = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return {
            title: cleanString(o.title),
            url: cleanString(o.url),
            note: typeof o.note === "string" ? o.note : null,
          };
        })
      ).slice(0, 8)
    : fallback.manuals;

  const parts = Array.isArray(obj.parts)
    ? dedupeLinks(
        obj.parts.map((item) => {
          const o = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return {
            title: cleanString(o.title),
            url: cleanString(o.url),
            note: typeof o.note === "string" ? o.note : null,
          };
        })
      ).slice(0, 8)
    : fallback.parts;

  const probable_parts_to_check = Array.isArray(obj.probable_parts_to_check)
    ? dedupeProbableParts(
        obj.probable_parts_to_check.map((item) => {
          const o = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
          return {
            part: cleanString(o.part),
            why: cleanString(o.why),
          };
        })
      ).slice(0, 8)
    : fallback.probable_parts_to_check;

  return {
    summary,
    suggested_search_terms:
      suggested_search_terms.length ? suggested_search_terms : fallback.suggested_search_terms,
    manuals: manuals.length ? manuals : fallback.manuals,
    parts: parts.length ? parts : fallback.parts,
    probable_parts_to_check:
      probable_parts_to_check.length
        ? probable_parts_to_check
        : fallback.probable_parts_to_check,
  };
}

function tryParseJson(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = trimmed.slice(start, end + 1);
      try {
        return JSON.parse(slice);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ManualsPartsRequest;

    const manufacturer = cleanString(body.manufacturer || body.nameplate?.manufacturer);
    const model = cleanString(body.model || body.nameplate?.model);
    const equipmentType = cleanString(body.equipmentType);
    const symptom = cleanString(body.symptom || body.query);
    const serial = cleanString(body.serial || body.nameplate?.serial);
    const refrigerant = cleanString(body.nameplate?.refrigerant);
    const voltage = cleanString(body.nameplate?.voltage);
    const phase = cleanString(body.nameplate?.phase);

    if (!manufacturer && !model && !symptom) {
      return NextResponse.json(
        { error: "Please provide at least manufacturer, model, or symptom." },
        { status: 400 }
      );
    }

    const fallback = buildFallbackResult({
      manufacturer,
      model,
      equipmentType,
      symptom,
      serial,
      query: body.query,
      nameplate: body.nameplate,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ data: fallback });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `
You are helping an HVAC field service app.

Return ONLY valid JSON with this exact shape:
{
  "summary": string,
  "suggested_search_terms": string[],
  "manuals": [{ "title": string, "url": string, "note": string | null }],
  "parts": [{ "title": string, "url": string, "note": string | null }],
  "probable_parts_to_check": [{ "part": string, "why": string }]
}

Rules:
- Return JSON only. No markdown.
- Every manual and part item MUST include title, url, and note.
- Use real-looking search links. Prefer Google search URLs if exact OEM URLs are uncertain.
- Keep URLs valid absolute URLs.
- Make results useful for a field tech trying to find manuals, parts breakdowns, and likely parts to inspect.
- Do not invent fake OEM direct PDF URLs unless you are highly confident. Search links are acceptable.
- Keep lists concise and useful.

Equipment info:
Manufacturer: ${manufacturer || "Unknown"}
Model: ${model || "Unknown"}
Equipment type: ${equipmentType || "Unknown"}
Symptom: ${symptom || "Unknown"}
Serial: ${serial || "Unknown"}
Refrigerant: ${refrigerant || "Unknown"}
Voltage: ${voltage || "Unknown"}
Phase: ${phase || "Unknown"}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You produce clean JSON for an HVAC field service app. No markdown. No prose outside JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || "";
    const parsed = tryParseJson(text);
    const data = normalizeResult(parsed, fallback);

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Server error: ${error?.message || "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}