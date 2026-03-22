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
    const email = String(body?.email || "").trim().toLowerCase();
    const role = String(body?.role || "tech").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Tech email is required." },
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
        { ok: false, error: "Only a company admin can add members." },
        { status: 403 }
      );
    }

    const { data: usersPage, error: listUsersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listUsersError) {
      return NextResponse.json(
        { ok: false, error: `User lookup failed: ${listUsersError.message}` },
        { status: 500 }
      );
    }

    const targetUser = (usersPage?.users || []).find(
      (u) => (u.email || "").toLowerCase() === email
    );

    if (!targetUser?.id) {
      return NextResponse.json(
        { ok: false, error: "No user found with that email. Have them create an account first." },
        { status: 404 }
      );
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: targetUser.id,
        email: targetUser.email || email,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      return NextResponse.json(
        { ok: false, error: `Profile upsert failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    const { data: existingMembership, error: existingMembershipError } = await supabase
      .from("company_memberships")
      .select("id, company_id, role, status")
      .eq("user_id", targetUser.id)
      .eq("company_id", adminMembership.company_id)
      .limit(1)
      .maybeSingle();

    if (existingMembershipError) {
      return NextResponse.json(
        { ok: false, error: `Existing membership check failed: ${existingMembershipError.message}` },
        { status: 500 }
      );
    }

    if (existingMembership?.id) {
      return NextResponse.json({
        ok: true,
        alreadyMember: true,
        membership: existingMembership,
      });
    }

    const { data: newMembership, error: insertMembershipError } = await supabase
      .from("company_memberships")
      .insert({
        user_id: targetUser.id,
        company_id: adminMembership.company_id,
        role: role || "tech",
        status: "active",
      })
      .select("id, company_id, role, status")
      .single();

    if (insertMembershipError) {
      return NextResponse.json(
        { ok: false, error: `Membership insert failed: ${insertMembershipError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      addedUser: {
        id: targetUser.id,
        email: targetUser.email || email,
      },
      membership: newMembership,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}