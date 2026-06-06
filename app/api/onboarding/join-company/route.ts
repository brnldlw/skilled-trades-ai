import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const joinCode = String(body?.joinCode || "").trim().toUpperCase();
    const userId = String(body?.userId || "").trim();
    const email = String(body?.email || "").trim();

    if (!joinCode || joinCode.length !== 6) {
      return NextResponse.json({ ok: false, error: "Invalid join code." }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ ok: false, error: "User ID required." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find company by join code
    const { data: company, error: findError } = await supabase
      .from("companies")
      .select("id, display_name, join_code")
      .eq("join_code", joinCode)
      .single();

    if (findError || !company) {
      return NextResponse.json({
        ok: false,
        error: "Join code not found. Double-check the code with your manager."
      }, { status: 404 });
    }

    // Set up profile with 14-day trial
    const trialExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("profiles").upsert({
      id: userId,
      email: email || null,
      override_tier: "solo",
      override_expires_at: trialExpiry,
      override_note: "14-day free trial — auto-granted on signup",
      subscription_tier: "free",
      subscription_status: "trial",
    }, { onConflict: "id" });

    // Check if already a member
    const { data: existing } = await supabase
      .from("company_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("company_id", company.id)
      .single();

    if (existing) {
      // Already a member - just update status to active
      await supabase
        .from("company_memberships")
        .update({ status: "active" })
        .eq("user_id", userId)
        .eq("company_id", company.id);
    } else {
      // Add as tech member
      const { error: memberError } = await supabase
        .from("company_memberships")
        .insert({
          user_id: userId,
          company_id: company.id,
          role: "tech",
          status: "active",
        });

      if (memberError) {
        return NextResponse.json({
          ok: false,
          error: `Failed to join company: ${memberError.message}`
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      company: {
        id: company.id,
        display_name: company.display_name,
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}