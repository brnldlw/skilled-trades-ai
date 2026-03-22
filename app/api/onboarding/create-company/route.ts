import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const companyName = String(body?.companyName || "").trim();
    const userId = String(body?.userId || "").trim();
    const email = String(body?.email || "").trim();

    if (!companyName) {
      return NextResponse.json({ ok: false, error: "Company name is required." }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ ok: false, error: "User id is required." }, { status: 400 });
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

    const normalizedName = companyName.toLowerCase().replace(/\s+/g, " ").trim();
    const companyId = crypto.randomUUID();

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: email || null,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      return NextResponse.json(
        { ok: false, error: `profile upsert failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    const { error: companyError } = await supabase.from("companies").insert({
      id: companyId,
      legal_name: companyName,
      display_name: companyName,
      normalized_name: normalizedName,
    });

    if (companyError) {
      return NextResponse.json(
        { ok: false, error: `company insert failed: ${companyError.message}` },
        { status: 500 }
      );
    }

    const { error: membershipError } = await supabase.from("company_memberships").insert({
      user_id: userId,
      company_id: companyId,
      role: "admin",
      status: "active",
    });

    if (membershipError) {
      return NextResponse.json(
        { ok: false, error: `membership insert failed: ${membershipError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      company: {
        id: companyId,
        display_name: companyName,
        normalized_name: normalizedName,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}