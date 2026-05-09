import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

// ─── Auth helper ──────────────────────────────────────────────
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

// ─── POST: Analyze a PDF form and extract field definitions ───
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const formData = await req.formData();
    const action = formData.get("action") as string;

    // ── Action: upload and analyze a PDF form ────────────────
    if (action === "analyze_form") {
      const file = formData.get("file") as File;
      const formName = formData.get("formName") as string || "My PM Form";

      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
      }

      // Convert to base64 for Claude
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");

      // Store the PDF in Supabase Storage
      const supabase = getSupabaseAdmin();
      const filePath = `pm-forms/${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

      const { error: uploadError } = await supabase.storage
        .from("pm-forms")
        .upload(filePath, bytes, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        // Continue even if storage fails — we'll analyze and store metadata
      }

      // Use Claude to analyze the PDF and identify fields
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

      const analysis = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: `You are analyzing an HVAC/R PM (preventive maintenance) or asset tracking form.

Identify every field that needs to be filled out in this form. For each field, determine:
1. The field label/name as it appears on the form
2. The type of information needed
3. Whether it can be auto-filled from a unit nameplate photo

Return ONLY valid JSON with this exact structure:
{
  "formTitle": "string - title of the form",
  "fields": [
    {
      "id": "unique_snake_case_id",
      "label": "Exact label from form",
      "type": "text|date|number|checkbox|signature",
      "category": "equipment|customer|tech|readings|date|other",
      "nameplateField": "manufacturer|model|serial|refrigerant|voltage|tonnage|mca|mop|rla|fla|null",
      "placeholder": "Example value or hint",
      "required": true|false
    }
  ],
  "estimatedPageCount": number
}

Categories:
- equipment: unit make, model, serial, refrigerant, voltage, etc.
- customer: customer name, address, contact, site
- tech: technician name, company, date, signature
- readings: pressures, temps, amps, voltages measured on job
- date: dates (service date, next PM date, etc.)
- other: anything else`,
            },
          ],
        }],
      });

      let fields: any[] = [];
      let formTitle = formName;
      let estimatedPageCount = 1;

      try {
        const text = analysis.content[0].type === "text" ? analysis.content[0].text : "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        fields = parsed.fields || [];
        formTitle = parsed.formTitle || formName;
        estimatedPageCount = parsed.estimatedPageCount || 1;
      } catch (e) {
        console.error("Failed to parse Claude analysis:", e);
      }

      // Save form metadata to database
      const { data: savedForm, error: dbError } = await supabase
        .from("pm_forms")
        .insert({
          user_id: user.id,
          name: formName || formTitle,
          file_path: filePath,
          file_name: file.name,
          fields: fields,
          page_count: estimatedPageCount,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        console.error("DB error saving form:", dbError);
      }

      return NextResponse.json({
        ok: true,
        form: savedForm || { name: formName, fields, file_path: filePath },
        fields,
        formTitle,
      });
    }

    // ── Action: get all forms for this user ──────────────────
    if (action === "list_forms") {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("pm_forms")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ forms: data || [] });
    }

    // ── Action: delete a form ────────────────────────────────
    if (action === "delete_form") {
      const formId = formData.get("formId") as string;
      const supabase = getSupabaseAdmin();

      const { data: form } = await supabase
        .from("pm_forms")
        .select("file_path, user_id")
        .eq("id", formId)
        .single();

      if (form?.user_id !== user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }

      if (form?.file_path) {
        await supabase.storage.from("pm-forms").remove([form.file_path]);
      }

      await supabase.from("pm_forms").delete().eq("id", formId);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (err: any) {
    console.error("PM forms error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed" },
      { status: 500 }
    );
  }
}

// ─── GET: Generate a filled form as downloadable data ────────
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId");

    if (!formId) return NextResponse.json({ error: "formId required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: form } = await supabase
      .from("pm_forms")
      .select("*")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    // Get a signed URL for the PDF
    const { data: signedUrl } = await supabase.storage
      .from("pm-forms")
      .createSignedUrl(form.file_path, 3600);

    return NextResponse.json({ form, signedUrl: signedUrl?.signedUrl });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}