import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Missing auth token." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { ok: false, error: "Missing Supabase server environment variables." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user: actingUser },
      error: actingUserError,
    } = await supabase.auth.getUser(token);

    if (actingUserError) {
      return NextResponse.json(
        { ok: false, error: `Auth check failed: ${actingUserError.message}` },
        { status: 401 }
      );
    }

    if (!actingUser) {
      return NextResponse.json(
        { ok: false, error: "Authenticated user not found." },
        { status: 401 }
      );
    }

    const { data: adminMembership, error: adminMembershipError } = await supabase
      .from("company_memberships")
      .select("company_id, role, status")
      .eq("user_id", actingUser.id)
      .eq("status", "active")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (adminMembershipError) {
      return NextResponse.json(
        { ok: false, error: `Admin membership lookup failed: ${adminMembershipError.message}` },
        { status: 500 }
      );
    }

    if (!adminMembership?.company_id) {
      return NextResponse.json(
        { ok: false, error: "Only a company admin can view company members." },
        { status: 403 }
      );
    }

    const { data: memberships, error: membershipsError } = await supabase
      .from("company_memberships")
      .select("id, user_id, role, status, created_at")
      .eq("company_id", adminMembership.company_id)
      .order("created_at", { ascending: true });

    if (membershipsError) {
      return NextResponse.json(
        { ok: false, error: `Membership list failed: ${membershipsError.message}` },
        { status: 500 }
      );
    }

    const userIds = (memberships || []).map((m) => m.user_id).filter(Boolean);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    if (profilesError) {
      return NextResponse.json(
        { ok: false, error: `Profile lookup failed: ${profilesError.message}` },
        { status: 500 }
      );
    }

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    const members = (memberships || []).map((m) => {
      const profile = profileMap.get(m.user_id);
      return {
        id: m.id,
        user_id: m.user_id,
        email: profile?.email || "",
        full_name: profile?.full_name || "",
        role: m.role,
        status: m.status,
        created_at: m.created_at,
      };
    });

    return NextResponse.json({
      ok: true,
      members,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}