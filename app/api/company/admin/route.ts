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

// GET — load company info and members
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's membership and check they're admin or manager
    const { data: membership } = await supabase
      .from("company_memberships")
      .select("company_id, role, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!membership || !["admin", "manager", "owner"].includes(membership.role)) {
      return NextResponse.json({
        error: "Company admin access required. Contact support@myhvacrtool.com."
      }, { status: 403 });
    }

    // Get company info
    const { data: company } = await supabase
      .from("companies")
      .select("id, display_name, join_code")
      .eq("id", membership.company_id)
      .single();

    // Get all members
    const { data: memberships } = await supabase
      .from("company_memberships")
      .select("user_id, role, status, created_at")
      .eq("company_id", membership.company_id)
      .order("created_at", { ascending: true });

    // Get profile info for each member
    const memberIds = (memberships || []).map(m => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, subscription_tier")
      .in("id", memberIds);

    const profileMap: Record<string, any> = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });

    const members = (memberships || []).map(m => ({
      user_id: m.user_id,
      email: profileMap[m.user_id]?.email || "—",
      name: profileMap[m.user_id]?.full_name || "",
      role: m.role,
      status: m.status,
      joined_at: m.created_at,
      subscription_tier: profileMap[m.user_id]?.subscription_tier || "free",
    }));

    return NextResponse.json({
      company: {
        ...company,
        member_count: members.length,
      },
      members,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

// POST — update member role or remove them
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const body = await req.json();
    const { userId, action } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify requester is admin/manager of the company
    const { data: myMembership } = await supabase
      .from("company_memberships")
      .select("company_id, role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!myMembership || !["admin", "manager", "owner"].includes(myMembership.role)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Verify target user is in same company
    const { data: targetMembership } = await supabase
      .from("company_memberships")
      .select("id, role")
      .eq("user_id", userId)
      .eq("company_id", myMembership.company_id)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: "User not in your company" }, { status: 404 });
    }

    // Prevent demoting company owner/admin
    if (targetMembership.role === "admin" || targetMembership.role === "owner") {
      return NextResponse.json({ error: "Cannot modify company owner" }, { status: 403 });
    }

    if (action === "remove") {
      await supabase
        .from("company_memberships")
        .update({ status: "removed" })
        .eq("user_id", userId)
        .eq("company_id", myMembership.company_id);
      return NextResponse.json({ ok: true });
    }

    if (action === "make_manager") {
      await supabase
        .from("company_memberships")
        .update({ role: "manager" })
        .eq("user_id", userId)
        .eq("company_id", myMembership.company_id);
      return NextResponse.json({ ok: true });
    }

    if (action === "make_tech") {
      await supabase
        .from("company_memberships")
        .update({ role: "tech" })
        .eq("user_id", userId)
        .eq("company_id", myMembership.company_id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}