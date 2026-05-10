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

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const body = await req.json();
    const { videoBase64, mimeType, context } = body;

    if (!videoBase64) return NextResponse.json({ error: "No video provided" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API not configured" }, { status: 500 });

    // Claude can analyze video directly
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: (mimeType || "video/mp4") as any,
                data: videoBase64,
              },
            },
            {
              type: "text",
              text: `You are an expert HVAC/R field technician analyzing a job site walkthrough video for a ${context?.equipment_type || "HVAC"} replacement at ${context?.location || "this site"}.

Watch this walkthrough carefully and identify EVERYTHING that could affect how the old unit comes out and the new unit goes in. Look for:

OBSTACLES & HAZARDS:
- Doorways, hallways, tight turns — estimate clearances
- Stairwells — how many steps, width, any turns
- Elevators — can equipment fit? Dimensions?
- Gas lines, conduit, pipes crossing the path
- Low ceilings or overhead obstructions
- Structural columns or walls in the way
- Anything blocking crane access or staging area
- Power lines or utility hazards
- Curb or step-up height issues

ACCESS ISSUES:
- How tight is the access to the unit?
- Is there enough room to work around it?
- What direction does the unit need to come out?
- Any obstacles on the removal path that weren't mentioned?

THINGS A TECH MIGHT MISS:
- Background hazards not directly mentioned
- Items that will need to be moved or protected
- Anything that looks like it could cause a problem on job day

Return ONLY valid JSON array. Each finding:
{
  "severity": "blocker|warning|info",
  "title": "Short title (under 50 chars)",
  "description": "What you saw and why it matters for this job",
  "question": "Follow-up question for the tech if needed (or null)",
  "answer": null
}

severity guide:
- blocker = will stop the job or cause major cost/delay if not addressed now
- warning = adds cost, time, or complexity — plan for it
- info = good to know, low risk

Return [] if the video shows no notable obstacles. Return only the JSON array, no other text.`,
            },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Video analysis API error:", err);
      // Fall back to a simulated analysis if video format not supported
      return NextResponse.json({
        ok: true,
        findings: [{
          severity: "info",
          title: "Video received — manual review recommended",
          description: "Video format may not support direct AI analysis. Review the walkthrough manually and add notes in the Additional Notes field.",
          question: null,
          answer: null,
        }],
      });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "[]";

    let findings = [];
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      findings = JSON.parse(clean);
      if (!Array.isArray(findings)) findings = [];
    } catch (e) {
      console.error("Video findings parse error:", text.substring(0, 300));
      findings = [];
    }

    console.log(`Video analysis complete: ${findings.length} findings`);
    return NextResponse.json({ ok: true, findings });

  } catch (err: any) {
    console.error("Video analyze error:", err.message);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}