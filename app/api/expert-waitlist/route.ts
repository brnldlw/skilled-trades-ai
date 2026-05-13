import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Upsert so duplicate emails don't error
    const { error } = await supabase
      .from("expert_waitlist")
      .upsert({ email: email.toLowerCase().trim() }, { onConflict: "email" });

    if (error) {
      console.error("Waitlist insert error:", error.message);
      // Don't fail the user — just log it
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Waitlist error:", err.message);
    return NextResponse.json({ ok: true }); // Always succeed to user
  }
}