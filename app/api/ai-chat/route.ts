import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  messages: ChatMessage[];
  // optional context from the current job
  equipmentType?: string;
  manufacturer?: string;
  model?: string;
  refrigerantType?: string;
  symptom?: string;
  propertyType?: string;
  observations?: { label: string; value: string; unit: string; note?: string }[];
};

// ─────────────────────────────────────────────
// System prompt — the brain of the agent
// ─────────────────────────────────────────────
function buildSystemPrompt(ctx: Omit<ChatRequest, "messages">): string {
  const equipLine = ctx.equipmentType ? `Equipment Type: ${ctx.equipmentType}` : "";
  const mfrLine = ctx.manufacturer ? `Manufacturer: ${ctx.manufacturer}` : "";
  const modelLine = ctx.model ? `Model: ${ctx.model}` : "";
  const refLine = ctx.refrigerantType && ctx.refrigerantType !== "Unknown"
    ? `Refrigerant: ${ctx.refrigerantType}` : "";
  const symptomLine = ctx.symptom ? `Reported Symptom: ${ctx.symptom}` : "";
  const propLine = ctx.propertyType ? `Property Type: ${ctx.propertyType}` : "";

  const obsLines =
    Array.isArray(ctx.observations) && ctx.observations.length
      ? "Current Field Readings:\n" +
        ctx.observations
          .map((o) => `  • ${o.label}: ${o.value} ${o.unit}${o.note ? ` (${o.note})` : ""}`)
          .join("\n")
      : "";

  const contextBlock = [equipLine, mfrLine, modelLine, refLine, propLine, symptomLine, obsLines]
    .filter(Boolean)
    .join("\n");

  return `You are an expert HVAC/R field service diagnostic assistant — the equivalent of a 25-year master technician who has seen every failure mode on every brand of equipment.

Your job is to help field technicians diagnose and fix HVAC/R systems quickly and correctly. You are talking directly to the tech standing in front of the equipment.

${contextBlock ? `## Current Job Context\n${contextBlock}\n` : ""}

## How You Work

1. **Ask targeted clarifying questions first** — one or two at a time, never a wall of questions. Gather readings systematically.
2. **Think out loud like a seasoned tech** — explain WHY a reading points to a specific cause. Teach while you diagnose.
3. **Rank your suspects** — always tell the tech your top 2-3 likely causes and what probability you'd assign each based on current evidence.
4. **Give specific next tests** — don't just say "check the capacitor." Say "Put your clamp meter on the common terminal of the capacitor. You should read within 10% of the MFD stamped on the label. If it reads low or zero, that's your culprit."
5. **Know refrigerant physics cold** — use actual PT relationships, superheat and subcooling targets, saturation temps, and system behavior to confirm or rule out causes.
6. **Safety first** — flag A2L/A3 refrigerant hazards, high voltage warnings, and refrigerant recovery requirements proactively.
7. **Be concise and field-ready** — techs are on a ladder or in a tight mechanical room. No walls of text. Use short paragraphs, bullet points, and bold key terms.
8. **Reference specific values** — "your superheat of 28°F on an R-410A TXV system is 10-15°F high, pointing toward low charge or a restricted metering device" not "your superheat seems high."

## Refrigerant Knowledge
You have expert knowledge of:
- R-410A, R-22, R-32, R-454B, R-134a, R-407C, R-404A, R-448A, R-449A, R-290, R-600a, R-744 (CO2)
- Target superheat ranges: TXV systems 8-12°F SH / 8-12°F SC; fixed orifice use outdoor temp + return air temp charts
- A2L flammability protocols (R-32, R-454B): no open flames, no sparks, use recovery equipment rated for A2L
- EPA 608 refrigerant handling requirements

## Equipment Coverage
You handle: RTUs, split systems, mini-splits, package units, heat pumps, gas furnaces, boilers, chillers, commercial refrigeration (reach-ins, walk-ins, rack systems), ice machines, VRF/VRV systems.

## When to Escalate
Proactively tell the tech when a situation requires: licensed electrician, structural assessment, refrigerant handling certification, or manufacturer tech support.

Keep your responses practical, specific, and field-ready. You are the best tech the industry has ever seen — act like it.`;
}

// ─────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "messages array is required." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY is not configured. Add it to your Vercel environment variables.",
        },
        { status: 500 }
      );
    }

    const systemPrompt = buildSystemPrompt({
      equipmentType: body.equipmentType,
      manufacturer: body.manufacturer,
      model: body.model,
      refrigerantType: body.refrigerantType,
      symptom: body.symptom,
      propertyType: body.propertyType,
      observations: body.observations,
    });

    // Call Anthropic Messages API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: systemPrompt,
        messages: body.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error (${response.status}): ${errBody.slice(0, 300)}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantText =
      data?.content?.[0]?.type === "text" ? data.content[0].text : "";

    if (!assistantText) {
      return NextResponse.json(
        { error: "No response text returned from Claude." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: assistantText });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}