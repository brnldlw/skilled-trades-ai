import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST { text?: string }
 * Simple nameplate parser stub:
 * - Returns structured fields from pasted nameplate text
 * - (Later we'll upgrade to image upload + OCR/vision)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = String(body?.text || "").trim();

    if (!text) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing 'text'. Paste the unit/nameplate text to parse.",
        },
        { status: 400 }
      );
    }

    const t = text.replace(/\r/g, "\n");

    // Very lightweight heuristics (safe + no external calls)
    const pick = (re: RegExp) => {
      const m = t.match(re);
      return m?.[1]?.trim() || "";
    };

    const manufacturer =
      pick(/manufacturer[:\s]+([^\n]+)/i) ||
      pick(/mfg[:\s]+([^\n]+)/i);

    const model =
      pick(/model(?:\s*no\.?)?[:\s]+([^\n]+)/i) ||
      pick(/mdl[:\s]+([^\n]+)/i);

    const serial =
      pick(/serial(?:\s*no\.?)?[:\s]+([^\n]+)/i) ||
      pick(/s\/n[:\s]+([^\n]+)/i);

    const refrigerant =
      pick(/refrigerant[:\s]+([^\n]+)/i) ||
      pick(/\b(r-\d{2,4}[a-z]?)\b/i);

    const voltage =
      pick(/voltage[:\s]+([^\n]+)/i) ||
      pick(/\b(\d{3})\s*\/\s*(1|3)\s*ph\b/i) ||
      pick(/\b(208\/230|460|575)\b/i);

    const phase =
      pick(/\b(1|3)\s*ph\b/i);

    const tonnage =
      pick(/ton(?:nage)?[:\s]+([^\n]+)/i);

    const hz =
      pick(/\b(50|60)\s*hz\b/i);

    const result = {
      manufacturer: manufacturer || "Unknown",
      model: model || "",
      serial: serial || "",
      refrigerant: refrigerant || "Unknown",
      electrical: {
        voltage: voltage || "",
        phase: phase || "",
        hz: hz || "",
      },
      capacity: {
        tonnage: tonnage || "",
      },
      raw_text: text,
      notes: [
        "This is a text-based parser stub.",
        "Next upgrade: image upload + vision extraction + confidence scores.",
      ],
    };

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "Server error: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}