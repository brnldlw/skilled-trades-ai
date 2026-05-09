import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";

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

// Extract PDF fields with their page positions sorted top-to-bottom, left-to-right
async function getPdfFieldsInOrder(pdfBytes: ArrayBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pdfForm = pdfDoc.getForm();
  const fields = pdfForm.getFields();
  const pages = pdfDoc.getPages();

  const fieldsWithPos: { name: string; type: string; page: number; y: number; x: number }[] = [];

  const pageHeight = pages[0]?.getHeight() || 792;

  for (const field of fields) {
    try {
      const widgets = field.acroField.getWidgets();
      for (const widget of widgets) {
        const rect = widget.getRectangle();
        fieldsWithPos.push({
          name: field.getName(),
          type: field instanceof PDFTextField ? "text" : field instanceof PDFCheckBox ? "checkbox" : "other",
          page: 0,
          // Invert y so top of page = low number (reading order)
          y: pageHeight - rect.y,
          x: rect.x,
        });
      }
    } catch {
      fieldsWithPos.push({ name: field.getName(), type: "text", page: 0, y: 0, x: 0 });
    }
  }

  // Sort by page, then y (top to bottom), then x (left to right)
  // Group by rows (fields within 10 units of same y are on same row)
  fieldsWithPos.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    const rowDiff = Math.abs(a.y - b.y);
    if (rowDiff > 10) return a.y - b.y; // different rows
    return a.x - b.x; // same row, sort left to right
  });

  return fieldsWithPos;
}

async function callClaude(base64Pdf: string, formName: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Pdf } },
          {
            type: "text",
            text: `List every blank field in this form that a technician needs to fill in.
List them IN EXACT ORDER from top to bottom, left to right, as they physically appear on the form.
One field per line. Number each one starting from 1.
Format: [number]. [field label]
Example:
1. Customer Name
2. Site Address
3. City
4. State
5. Date
Include ALL fields. Do not skip any.`,
          },
        ],
      }],
    }),
  });

  if (!res.ok) throw new Error(`Claude API error ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
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
      if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB" }, { status: 400 });

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");

      // Step 1: Get PDF fields in their visual order (by x/y position)
      const pdfFieldsOrdered = await getPdfFieldsInOrder(bytes);
      const pdfTextFieldsOrdered = pdfFieldsOrdered.filter(f => f.type === "text");
      const pdfCheckFieldsOrdered = pdfFieldsOrdered.filter(f => f.type === "checkbox");

      console.log("PDF fields in visual order:", pdfTextFieldsOrdered.slice(0, 10).map(f => `${f.name}(${Math.round(f.x)},${Math.round(f.y)})`));

      // Step 2: Ask Claude to list field labels in order
      const rawText = await callClaude(base64, formName);
      console.log("Claude field list (first 300):", rawText.substring(0, 300));

      if (!rawText || rawText.length < 10) {
        return NextResponse.json({ error: "Could not read form fields. Ensure PDF has selectable text." }, { status: 400 });
      }

      // Parse the numbered list
      const lines = rawText.split("\n")
        .map((l: string) => l.replace(/^\d+\.\s*/, "").trim())
        .filter((l: string) => l.length > 1 && l.length < 200);

      console.log(`Claude detected ${lines.length} fields, PDF has ${pdfTextFieldsOrdered.length} text fields`);

      // Step 3: Build field objects matched by position
      // Each Claude label maps to the PDF field at the same index
      const fields = lines.map((label: string, i: number) => {
        const pdfField = pdfTextFieldsOrdered[i];
        const labelLower = label.toLowerCase();

        // Determine category
        const category =
          /customer|site|address|city|state|zip|contact|phone|email|company|owner/.test(labelLower) ? "customer" :
          /make|manufacturer|mfr|brand|model|serial|s\/n|refrigerant|voltage|tonnage|mca|mop|rla|fla|btu|seer|phase|hz|capacity/.test(labelLower) ? "equipment" :
          /tech|technician|name|signature|license|cert|company/.test(labelLower) ? "tech" :
          /pressure|temp|amp|volt|superheat|subcool|delta|cfm|reading|suction|discharge|head|return|supply/.test(labelLower) ? "readings" :
          /date|time/.test(labelLower) ? "date" : "other";

        // Determine nameplateField
        const nameplateField =
          /manufacturer|make\b|mfr/.test(labelLower) ? "manufacturer" :
          /\bmodel\b/.test(labelLower) ? "model" :
          /serial|s\/n/.test(labelLower) ? "serial" :
          /refrigerant/.test(labelLower) ? "refrigerant" :
          /voltage/.test(labelLower) ? "voltage" :
          /tonnage|tons/.test(labelLower) ? "tonnage" :
          /\bmca\b/.test(labelLower) ? "mca" :
          /\bmop\b/.test(labelLower) ? "mop" :
          /\brla\b/.test(labelLower) ? "rla" :
          /\bfla\b/.test(labelLower) ? "fla" : null;

        return {
          id: `field_${i}_${label.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 25)}`,
          label,
          type: /date/.test(labelLower) ? "date" : /checkbox|check|yes.*no|n\/a/.test(labelLower) ? "checkbox" : "text",
          category,
          nameplateField,
          placeholder: "",
          required: true,
          // Store the exact PDF field name for reliable filling
          pdfFieldName: pdfField?.name || null,
          pdfFieldIndex: i,
        };
      });

      // Store PDF field order mapping for filling
      const pdfFieldOrder = pdfTextFieldsOrdered.map(f => f.name);
      const pdfCheckOrder = pdfCheckFieldsOrdered.map(f => f.name);

      // Save to Supabase
      const supabase = getSupabaseAdmin();
      const filePath = `pm-forms/${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

      await supabase.storage.from("pm-forms")
        .upload(filePath, bytes, { contentType: "application/pdf", upsert: false })
        .catch(e => console.warn("Storage:", e.message));

      const { data: savedForm, error: dbError } = await supabase
        .from("pm_forms")
        .insert({
          user_id: user.id,
          name: formName,
          file_name: file.name,
          file_path: filePath,
          fields,
          page_count: 1,
          // Store the PDF field order for accurate filling
          pdf_field_order: pdfFieldOrder,
          pdf_check_order: pdfCheckOrder,
          created_at: new Date().toISOString(),
        })
        .select().single();

      if (dbError) {
        console.error("DB error:", dbError.message);
        // Try without new columns (in case migration hasn't run)
        const { data: savedForm2 } = await supabase
          .from("pm_forms")
          .insert({ user_id: user.id, name: formName, file_name: file.name, file_path: filePath, fields, page_count: 1, created_at: new Date().toISOString() })
          .select().single();
        return NextResponse.json({ ok: true, form: { ...savedForm2, pdf_field_order: pdfFieldOrder, pdf_check_order: pdfCheckOrder }, fields });
      }

      return NextResponse.json({ ok: true, form: { ...savedForm, pdf_field_order: pdfFieldOrder, pdf_check_order: pdfCheckOrder }, fields });
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
    console.error("PM forms error:", err.message);
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
    return NextResponse.json({ form });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}