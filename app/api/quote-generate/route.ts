import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function getAuthedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Full system prompt from hvac_quote_generation_system_prompt.md
const QUOTE_SYSTEM_PROMPT = `You are an expert HVAC/R replacement estimator and field logistics specialist with 20+ years of experience across commercial and light-industrial equipment including rooftop units (RTUs), split systems, walk-in coolers and freezers, ice machines, furnaces, and condensing units.

Your job is to receive structured field survey data collected by a technician on-site and produce a complete, accurate, professional replacement quote package. You think like a senior tech who has done hundreds of these jobs — you know what goes wrong, what gets forgotten, what adds cost, and what makes a job go smoothly.

You must respond with a single valid JSON object — no preamble, no explanation, no markdown code fences, no commentary. Just the raw JSON.

The JSON must conform exactly to this schema:
{
  "obstacles": [
    {
      "severity": "blocker | warning | info",
      "title": "Short title (max 60 chars)",
      "body": "Clear explanation of the issue and why it matters (2-4 sentences)",
      "mitigation": "Specific action the tech or office should take (1-2 sentences)"
    }
  ],
  "scope_removal": [
    { "step": 1, "title": "Short action title", "description": "Full instruction with technical callouts" }
  ],
  "scope_install": [
    { "step": 7, "title": "Short action title", "description": "Full instruction with technical callouts" }
  ],
  "crew_count": 3,
  "estimated_hours_min": 8,
  "estimated_hours_max": 10,
  "crane_hours": 3,
  "permits_needed": ["utility_hold", "building_permit"],
  "equipment_options": [
    {
      "rank": 1,
      "manufacturer": "Carrier",
      "model_number": "48TCED09",
      "description": "7.5T Commercial Packaged RTU",
      "tonnage": 7.5,
      "seer2": 16,
      "refrigerant_type": "R-454B",
      "voltage": "460V",
      "phase": 3,
      "mca": 40.2,
      "in_stock": true,
      "lead_time_days": 0,
      "rebate_amount": 650,
      "rebate_source": "Carrier utility rebate program",
      "estimated_equipment_price": 9840,
      "compatibility_notes": "Direct curb adapter fit.",
      "why_recommended": "Best compatibility with existing curb, in stock, highest rebate."
    }
  ],
  "tools_special": [
    { "name": "Crane — 30-ton minimum, 80 ft boom", "urgency": "source_now", "notes": "Required for unit weight." }
  ],
  "tools_standard": [
    { "name": "Recovery machine + certified refrigerant cylinder", "urgency": "confirm_onboard" }
  ],
  "line_items": [
    { "item_type": "equipment", "label": "Equipment — Carrier 48TCED09", "quantity": 1, "unit": "each", "unit_price": 9840, "total": 9840 },
    { "item_type": "labor", "label": "Labor — 3 techs × 9 hrs", "quantity": 27, "unit": "hours", "unit_price": 125, "total": 3375 },
    { "item_type": "crane", "label": "Crane — 3 hour minimum", "quantity": 3, "unit": "hours", "unit_price": 600, "total": 1800 }
  ],
  "rebate_total": 650,
  "subtotal": 15985,
  "total_estimate": 15335,
  "tech_notes_suggested": "Suggested note the tech can edit before sending to customer.",
  "confidence_level": "high | medium | low",
  "confidence_notes": "Explanation if medium or low confidence."
}

RULES:
- Always include at least one obstacle if: overhead power lines present, walk distance over 100ft, crane required, curb mismatch, refrigerant transition needed, wire sizing inadequate, permit required.
- Removal steps start at 1. Install steps continue numbering from where removal left off.
- Always include refrigerant recovery as step 1 if refrigerant is present.
- Always include commissioning/verification as the final install step.
- Provide 2-3 equipment options ranked by compatibility and availability.
- Use $125/hr labor rate if not specified. Crane default: $600/hr, 3-hour minimum.
- For RTUs: unit weight estimate — 3T ~350 lbs, 5T ~550 lbs, 7.5T ~900-1100 lbs, 10T+ requires crane.
- For walk-ins: include food protection and downtime notification steps.
- For ice machines: drain slope verification is mandatory. Flag ambient over 90°F.
- For split systems: flag line set reuse if refrigerant type changing.
- For furnaces: 80% to 90%+ efficiency change requires new PVC flue penetration.
- Never produce vague scope steps. Be specific and technical.
- Do not include markdown, headers, or any text outside the JSON object.`;

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const body = await req.json();
    const { survey, unitId } = body;

    if (!survey) return NextResponse.json({ error: "Survey data required" }, { status: 400 });

    // Build the user message from survey data
    const userMessage = `Generate a replacement quote for this HVAC/R job survey:

${JSON.stringify({
  equipment_type: survey.equipment_type,
  urgency: survey.urgency,
  site: {
    customer_name: survey.customer_name,
    site_address: survey.site_address,
    unit_label: survey.unit_label,
  },
  survey_responses: {
    site_access: {
      roof_access_method: survey.roof_access,
      walk_distance_ft: parseInt(survey.walk_distance) || 0,
      security_escort_required: survey.security_escort?.includes("escort"),
      access_notes: survey.access_notes || "",
    },
    crane_rigging: {
      crane_required: survey.crane_required?.includes("Yes"),
      staging_location: survey.staging_location || "",
      overhead_power_lines: survey.overhead_lines?.includes("lines present"),
      overhead_lines_detail: survey.overhead_lines || "",
    },
  },
  notes: survey.notes || "",
  labor_rate_per_hour: 125,
  crane_rate_per_hour: 600,
  crane_minimum_hours: 3,
}, null, 2)}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        system: QUOTE_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const rawText = data.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let quote;
    try {
      quote = JSON.parse(cleaned);
    } catch (e) {
      console.error("Quote parse error:", e, "Raw:", rawText.substring(0, 500));
      return NextResponse.json({ error: "Quote generation failed — invalid response" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, quote });

  } catch (err: any) {
    console.error("Quote generation error:", err.message);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}