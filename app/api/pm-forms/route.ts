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

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function callClaude(base64Pdf: string, formName: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Pdf } },
          { type: "text", text: `Analyze this HVAC/R PM or asset tracking form. Find every blank field a tech needs to fill in. Return ONLY valid JSON, no other text:\n{"formTitle":"string","fields":[{"id":"snake_case","label":"Exact label","type":"text|date|number|checkbox","category":"equipment|customer|tech|readings|date|other","nameplateField":"manufacturer|model|serial|refrigerant|voltage|tonnage|mca|mop|rla|fla|null","placeholder":"example","required":true}]}\nCategories: equipment=unit specs(model/serial/refrigerant/voltage/tonnage), customer=customer name/address, tech=tech name/signature, readings=pressures/temps/amps measured on job, date=service dates, other=anything else. nameplateField is the nameplate data key if readable from unit tag, otherwise null.` },
        ],
      }],
    }),
  });

  if (!res.ok) throw new Error("Claude API error: " + res.status);

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { fields: parsed.fields || [], formTitle: parsed.formTitle || formName };
  } catch {
    console.error("Parse error, raw text:", text.substring(0, 500));
    return { fields: [], formTitle: formName };
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const formData = await req.formData();
    const action = formData.get("action") as string;

    if (action === "analyze_form") {
      const file = formData.get("file") as File;
      const formName = (formData.get("formName") as string) || "PM Form";
      if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
      if (!file.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "PDF only" }, { status: 400 });
      if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB" }, { status: 400 });

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const { fields, formTitle } = await callClaude(base64, formName);

      const supabase = getSupabaseAdmin();
      const filePath = `pm-forms/${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

      await supabase.storage.from("pm-forms").upload(filePath, bytes, { contentType: "application/pdf", upsert: false }).catch(() => {});

      const { data: savedForm, error: dbError } = await supabase
        .from("pm_forms")
        .insert({ user_id: user.id, name: formName, file_name: file.name, file_path: filePath, fields, page_count: 1, created_at: new Date().toISOString() })
        .select().single();

      if (dbError) {
        console.error("DB error:", dbError.message);
        return NextResponse.json({ ok: true, form: { id: null, name: formName, fields, file_name: file.name }, fields, formTitle, warning: "Run Supabase SQL setup first." });
      }

      return NextResponse.json({ ok: true, form: savedForm, fields, formTitle });
    }

    if (action === "list_forms") {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("pm_forms").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) { console.warn("list error:", error.message); return NextResponse.json({ forms: [] }); }
      return NextResponse.json({ forms: data || [] });
    }

    if (action === "delete_form") {
      const formId = formData.get("formId") as string;
      const supabase = getSupabaseAdmin();
      const { data: form } = await supabase.from("pm_forms").select("file_path,user_id").eq("id", formId).single();
      if (form?.user_id !== user.id) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      if (form?.file_path) await supabase.storage.from("pm-forms").remove([form.file_path]);
      await supabase.from("pm_forms").delete().eq("id", formId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("PM forms error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    const formId = new URL(req.url).searchParams.get("formId");
    if (!formId) return NextResponse.json({ error: "formId required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data: form } = await supabase.from("pm_forms").select("*").eq("id", formId).eq("user_id", user.id).single();
    if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
    let signedUrl = null;
    if (form.file_path) {
      const { data } = await supabase.storage.from("pm-forms").createSignedUrl(form.file_path, 3600);
      signedUrl = data?.signedUrl;
    }
    return NextResponse.json({ form, signedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}