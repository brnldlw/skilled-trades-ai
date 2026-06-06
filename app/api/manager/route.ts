import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check user's role via company_memberships
    const { data: membership } = await supabase
      .from("company_memberships")
      .select("company_id, role, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // Check profile for admin or manager override
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, override_tier")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.is_admin === true;
    const isManager = membership?.role === "manager" || 
                      membership?.role === "owner" ||
                      profile?.override_tier === "manager";

    if (!isAdmin && !isManager) {
      return NextResponse.json({
        error: "Manager access required. Contact support@myhvacrtool.com to request manager access for your account."
      }, { status: 403 });
    }

    const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let jobs: any[] = [];

    if (isAdmin) {
      // Admins see all service events
      const { data } = await supabase
        .from("service_events")
        .select(`
          id, created_at, service_date,
          tech_name, tech_email,
          customer_name, site_name,
          equipment_type, manufacturer, model,
          symptom, final_confirmed_cause,
          actual_fix_performed, parts_replaced,
          outcome_status, callback_occurred,
          user_id, company_id
        `)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000);
      jobs = data || [];
    } else if (membership?.company_id) {
      // Managers see only their company's events
      const { data } = await supabase
        .from("service_events")
        .select(`
          id, created_at, service_date,
          tech_name, tech_email,
          customer_name, site_name,
          equipment_type, manufacturer, model,
          symptom, final_confirmed_cause,
          actual_fix_performed, parts_replaced,
          outcome_status, callback_occurred,
          user_id, company_id
        `)
        .eq("company_id", membership.company_id)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000);
      jobs = data || [];
    }

    return NextResponse.json({ jobs });

  } catch (err: any) {
    console.error("Manager API error:", err.message);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}