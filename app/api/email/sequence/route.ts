import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDay2Email, sendDay5Email, sendDay12Email } from "../../../lib/emailService";

export const runtime = "nodejs";

// This route is called by a cron job or Supabase scheduled function
// It finds users who signed up 2, 5, or 12 days ago and sends them emails
// Secure it with a secret key so only your cron can call it

export async function POST(req: NextRequest) {
  try {
    // Verify secret to prevent unauthorized calls
    const authHeader = req.headers.get("authorization");
    const secret = process.env.EMAIL_SEQUENCE_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date();
    const results = { day2: 0, day5: 0, day12: 0, errors: 0 };

    // Get all profiles with email and created_at
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, created_at, subscription_tier")
      .not("email", "is", null);

    if (error) throw error;

    for (const profile of profiles || []) {
      if (!profile.email || !profile.created_at) continue;

      const signedUpAt = new Date(profile.created_at);
      const daysSince = Math.floor(
        (now.getTime() - signedUpAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const firstName = profile.email.split("@")[0].split(".")[0];
      const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);

      try {
        if (daysSince === 2) {
          await sendDay2Email({ to: profile.email, firstName: name });
          results.day2++;
        } else if (daysSince === 5 && profile.subscription_tier === "free") {
          // Only send upgrade push to free users
          await sendDay5Email({ to: profile.email, firstName: name });
          results.day5++;
        } else if (daysSince === 12 && profile.subscription_tier === "free") {
          // Only send last push to free users
          await sendDay12Email({ to: profile.email, firstName: name });
          results.day12++;
        }
      } catch (e) {
        results.errors++;
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Sequence failed" },
      { status: 500 }
    );
  }
}