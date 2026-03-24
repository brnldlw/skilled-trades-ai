import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Missing auth token." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const membershipId = String(body?.membershipId || "").trim();
    const role = String(body?.role || "").trim().toLowerCase();

    if (!membershipId) {
      return NextResponse.json(
        { ok: false, error: "Membership id is required." },
        { status: 400 }
      );
    }

    if (!["admin", "tech"].includes(role)) {
      return NextResponse.json(
        { ok: false, error: "Role must be admin or tech." },
        { status: 400 }
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
        { ok: false, error: "Only a company admin can change member roles." },
        { status: 403 }
      );
    }

    const { data: targetMembership, error: targetLookupError } = await supabase
      .from("company_memberships")
      .select("id, user_id, company_id, role, status")
      .eq("id", membershipId)
      .eq("company_id", adminMembership.company_id)
      .limit(1)
      .maybeSingle();

    if (targetLookupError) {
      return NextResponse.json(
        { ok: false, error: `Target membership lookup failed: ${targetLookupError.message}` },
        { status: 500 }
      );
    }

    if (!targetMembership?.id) {
      return NextResponse.json(
        { ok: false, error: "Member not found in your company." },
        { status: 404 }
      );
    }

    if (targetMembership.user_id === actingUser.id && role !== "admin") {
      return NextResponse.json(
        { ok: false, error: "You cannot remove your own admin role." },
        { status: 400 }
      );
    }

    const { data: updatedMembership, error: updateError } = await supabase
      .from("company_memberships")
      .update({ role })
      .eq("id", membershipId)
      .eq("company_id", adminMembership.company_id)
      .select("id, user_id, company_id, role, status")
      .single();

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: `Role update failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      membership: updatedMembership,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}