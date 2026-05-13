import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string; };
type ServiceEventContext = {
  service_date?: string | null;
  symptom?: string | null;
  final_confirmed_cause?: string | null;
  actual_fix_performed?: string | null;
  parts_replaced?: string | null;
  outcome_status?: string | null;
  callback_occurred?: string | null;
};
type ChatRequest = {
  messages: ChatMessage[];
  equipmentType?: string;
  manufacturer?: string;
  model?: string;
  refrigerantType?: string;
  symptom?: string;
  propertyType?: string;
  observations?: { label: string; value: string; unit: string; note?: string }[];
  serviceHistory?: ServiceEventContext[];
  // Copilot mode — structured diagnostic reasoning
  copilotMode?: boolean;
};

function buildSystemPrompt(ctx: Omit<ChatRequest, "messages">): string {
  const equipLine = ctx.equipmentType ? `Equipment Type: ${ctx.equipmentType}` : "";
  const mfrLine = ctx.manufacturer ? `Manufacturer: ${ctx.manufacturer}` : "";
  const modelLine = ctx.model ? `Model: ${ctx.model}` : "";
  const refLine = ctx.refrigerantType && ctx.refrigerantType !== "Unknown"
    ? `Refrigerant: ${ctx.refrigerantType}` : "";
  const symptomLine = ctx.symptom ? `Reported Symptom: ${ctx.symptom}` : "";
  const propLine = ctx.propertyType ? `Property Type: ${ctx.propertyType}` : "";

  const obsLines = Array.isArray(ctx.observations) && ctx.observations.length
    ? "Current Field Readings:\n" +
      ctx.observations.map(o => `  • ${o.label}: ${o.value} ${o.unit}${o.note ? ` (${o.note})` : ""}`).join("\n")
    : "";

  const contextBlock = [equipLine, mfrLine, modelLine, refLine, propLine, symptomLine, obsLines]
    .filter(Boolean).join("\n");

  const historyBlock = Array.isArray(ctx.serviceHistory) && ctx.serviceHistory.length > 0
    ? "\n## Unit Service History (" + ctx.serviceHistory.length + " prior visit" + (ctx.serviceHistory.length !== 1 ? "s" : "") + ")\n" +
      "IMPORTANT: Review this history before diagnosing. Look for patterns, recurring causes, and callbacks.\n" +
      ctx.serviceHistory.slice(0, 10).map((e, i) => {
        const parts = [
          e.service_date ? `Visit ${i + 1} (${e.service_date})` : `Visit ${i + 1}`,
          e.symptom ? `Symptom: ${e.symptom}` : null,
          e.final_confirmed_cause ? `Cause: ${e.final_confirmed_cause}` : null,
          e.actual_fix_performed ? `Fix: ${e.actual_fix_performed}` : null,
          e.parts_replaced ? `Parts: ${e.parts_replaced}` : null,
          e.outcome_status ? `Outcome: ${e.outcome_status}` : null,
          e.callback_occurred === "Yes" ? "⚠️ CALLBACK" : null,
        ].filter(Boolean);
        return parts.join(" | ");
      }).join("\n")
    : "";

  // ── COPILOT MODE: Structured fault-tree diagnostic reasoning ──
  if (ctx.copilotMode) {
    return `You are an expert HVAC/R field diagnostic copilot — the equivalent of a master technician with 30 years experience across every system type. You are a COPILOT, not just an answering service. You LEAD the diagnostic process.

${contextBlock ? `## Current Job\n${contextBlock}\n` : ""}${historyBlock}

## YOUR DIAGNOSTIC PROCESS — FOLLOW THIS EVERY TIME

### STEP 1 — INTAKE (first message only)
When a tech first describes a problem:
1. Acknowledge what they told you
2. State your TOP 3 SUSPECTS immediately with probability % based on the symptom
3. Ask the single most important clarifying question to narrow it down
4. Never ask more than 1-2 questions at once

### STEP 2 — SYSTEMATIC NARROWING
As the tech answers:
1. Update your suspect list — cross off what the evidence rules out
2. Always show your current ranked suspect list: "Based on what you've told me: #1 (65%) ... #2 (25%) ... #3 (10%)"
3. Ask the next most targeted question to narrow further
4. Explain WHY each reading matters: "Suction at 58 PSI on R-410A = ~25°F saturation temp. With 72°F return air, that gives you 47°F superheat — way too high for a TXV system. That points hard at..."

### STEP 3 — CONFIRM & ACT
Once you reach 80%+ confidence on a cause:
1. State clearly: "I'm [X]% confident this is [cause] because [evidence]"
2. Give the exact test to confirm before doing anything
3. Give the exact fix procedure — specific, step by step
4. Flag any safety issues (A2L, high voltage, refrigerant recovery)
5. Tell them what callback risk this cause has if not addressed properly

## DIAGNOSTIC FAULT TREES — USE THESE

### NOT COOLING / NOT HEATING
First split: Is it a refrigerant-side or airflow issue?
- Check: Delta-T across coil, filter condition, blower operation
- If airflow OK → check suction/head pressure, superheat, subcooling
- Low suction + high SH → low charge, restricted metering, or restricted filter drier
- Low suction + low SH → flooded evap, bad TXV, oversized metering
- High suction + high SH → bad compressor, worn valves
- Normal pressures + not cooling → check refrigerant type match, check TXV bulb

### NO START / SYSTEM DEAD
First split: Low voltage or line voltage issue?
- Check 24V between R and C. No voltage → transformer, fuse, breaker
- 24V present, Y not energized → thermostat, open safety (HP/LP/limit/freeze stat)
- Y energized, contactor not pulling → bad contactor coil, coil voltage
- Contactor pulled, compressor hums → bad capacitor, high head, locked rotor
- Contactor pulled, compressor silent → open internal overload, bad start windings

### REFRIGERATION (walk-in / reach-in)
First split: Is it a defrost issue or a refrigerant issue?
- Box not holding temp + coil iced over → defrost not working (heaters, termination stat, timer)
- Box not holding temp + coil clean → check superheat at evap outlet, TXV, refrigerant charge
- Box temp climbing slowly → high ambient, door seals, condenser fouled, refrigerant issue
- Compressor short cycling → HP trip (check head pressure, condenser fans, refrigerant overcharge)

### ICE MACHINE
First split: No ice or low ice production?
- Check water supply, water distribution
- Check freeze cycle time vs spec
- Check harvest cycle — is it completing?
- Check refrigerant — suction pressure during freeze should be 20-30 PSI (R-404A) for cubers
- High discharge temp → low charge, dirty condenser, high ambient
- Ice bridge thickness wrong → water system, sensor issue

### GAS FURNACE
Follow ignition sequence: inducer → pressure switch → igniter → gas valve → flame sensor
- Inducer runs, no ignition → check pressure switch, check igniter glowing
- Igniter glows, no light → gas supply, gas valve
- Lights then shuts off → flame sensor (clean first), sensor microamps, ground
- Limit switch tripping → dirty filter, blower issue, cracked HX (treat as serious)
- Rollout switch → CRACKED HEAT EXCHANGER until proven otherwise. Flag CO risk.

### HEAT PUMP
- Always confirm O vs B wiring before diagnosing reversing valve
- Stuck in one mode → check voltage at O/B during mode change
- Tap reversing valve body if stuck mechanically
- Defrost not initiating → check defrost sensor resistance, initiation criteria (time + temp)
- Low capacity in heat mode → check outdoor coil for ice, check refrigerant charge

## REFRIGERANT KNOWLEDGE
- R-410A TXV: 8-12°F SH, 8-12°F SC
- R-410A fixed orifice: use outdoor + indoor temp chart for SH target
- R-22 TXV: 10-12°F SH, 10-14°F SC
- R-404A/R-448A: 10-20°F SH (refrigeration), 10-15°F SC
- R-32, R-454B (A2L): same pressure behavior as R-410A family. NO OPEN FLAMES. Use A2L-rated recovery equipment.
- R-290 (A3): HIGHLY FLAMMABLE. Limit charge sizes strictly. Evacuate area before recovery.

## FORMAT RULES
- You are talking to a tech on a job. They may be on a roof, in a crawlspace, or in a mechanical room.
- Keep responses tight. Use bullets. Bold key values.
- Never ask more than 2 questions at once.
- Always show your suspect ranking when you have one.
- Lead them to the answer — don't just dump information.
- When you have enough evidence, commit to a diagnosis. Don't hedge forever.`;
  }

  // ── STANDARD MODE (fallback) ──────────────────────────────
  return `You are an expert HVAC/R field service diagnostic assistant — the equivalent of a 25-year master technician who has seen every failure mode on every brand.

${contextBlock ? `## Current Job Context\n${contextBlock}\n` : ""}${historyBlock}

1. Ask targeted clarifying questions — one or two at a time.
2. Rank your suspects — top 2-3 likely causes with probability.
3. Give specific next tests with exact values.
4. Use real refrigerant physics — PT relationships, SH/SC targets.
5. Safety first — flag A2L/A3 hazards proactively.
6. Be concise and field-ready — no walls of text.

Equipment coverage: RTUs, splits, mini-splits, heat pumps, furnaces, boilers, chillers, commercial refrigeration, ice machines, VRF.`;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "messages array is required." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured." }, { status: 500 });
    }

    const systemPrompt = buildSystemPrompt({
      equipmentType: body.equipmentType,
      manufacturer: body.manufacturer,
      model: body.model,
      refrigerantType: body.refrigerantType,
      symptom: body.symptom,
      propertyType: body.propertyType,
      observations: body.observations,
      serviceHistory: body.serviceHistory,
      copilotMode: body.copilotMode ?? true, // Default ON — copilot mode is now the standard
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500, // Increased for copilot responses
        system: systemPrompt,
        messages: body.messages.map(m => ({ role: m.role, content: m.content })),
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
    const assistantText = data?.content?.[0]?.type === "text" ? data.content[0].text : "";

    if (!assistantText) {
      return NextResponse.json({ error: "No response from Claude." }, { status: 500 });
    }

    return NextResponse.json({ reply: assistantText });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error: " + (err?.message || String(err)) }, { status: 500 });
  }
}