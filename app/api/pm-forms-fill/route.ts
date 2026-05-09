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

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const body = await req.json();
    const { formId, values } = body;
    if (!formId || !values) return NextResponse.json({ error: "formId and values required" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: form } = await supabase
      .from("pm_forms").select("*").eq("id", formId).eq("user_id", user.id).single();
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pm-forms").download(form.file_path);
    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Could not load PDF: " + downloadError?.message }, { status: 500 });
    }

    const pdfBytes = await fileData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pdfForm = pdfDoc.getForm();

    const ourFields: any[] = Array.isArray(form.fields) ? form.fields : [];
    // Use stored PDF field order if available, otherwise fall back to sort by number
    const pdfFieldOrder: string[] = Array.isArray(form.pdf_field_order) ? form.pdf_field_order : [];
    const pdfCheckOrder: string[] = Array.isArray(form.pdf_check_order) ? form.pdf_check_order : [];

    let filledCount = 0;
    const ourTextFields = ourFields.filter(f => f.type !== "checkbox");
    const ourCheckFields = ourFields.filter(f => f.type === "checkbox");

    // PRIORITY 1: Use explicit fieldMappings from the UI (most accurate)
    if (fieldMappings && Object.keys(fieldMappings).length > 0) {
      console.log("Using explicit field mappings from UI");
      for (const ourField of ourTextFields) {
        const val = values[ourField.id];
        const pdfName = fieldMappings[ourField.id];
        if (!val || !pdfName) continue;
        try {
          pdfForm.getTextField(pdfName).setText(String(val));
          filledCount++;
          console.log(`✓ "${ourField.label}" → "${pdfName}" = "${String(val).substring(0, 40)}"`);
        } catch (e) {
          console.warn(`✗ Could not fill "${pdfName}"`);
        }
      }
    }
    // PRIORITY 2: Use stored positional order from coordinate analysis
    else if (pdfFieldOrder.length > 0) {
      console.log("Using stored positional order");
      for (let i = 0; i < ourTextFields.length; i++) {
        const val = values[ourTextFields[i].id];
        const pdfName = ourTextFields[i].pdfFieldName || pdfFieldOrder[i];
        if (!val || !pdfName) continue;
        try {
          pdfForm.getTextField(pdfName).setText(String(val));
          filledCount++;
        } catch {}
      }
    }
    // PRIORITY 3: Numeric sort fallback
    else {
      console.log("Using numeric sort fallback");
      const textFields = (pdfForm.getFields().filter(f => f instanceof PDFTextField) as PDFTextField[])
        .sort((a, b) => parseInt(a.getName().replace(/\D/g,"")) - parseInt(b.getName().replace(/\D/g,"")));
      for (let i = 0; i < ourTextFields.length && i < textFields.length; i++) {
        const val = values[ourTextFields[i].id];
        if (!val) continue;
        try { textFields[i].setText(String(val)); filledCount++; } catch {}
      }
    }

    // Checkboxes — use mappings if available
    for (let i = 0; i < ourCheckFields.length; i++) {
      const ourField = ourCheckFields[i];
      const val = values[ourField.id];
      const pdfName = (fieldMappings && fieldMappings[ourField.id]) || ourField.pdfFieldName || pdfCheckOrder[i];
      if (!pdfName || !val) continue;
      try {
        const cb = pdfForm.getCheckBox(pdfName);
        if (val === true || val === "true" || val === "yes") { cb.check(); filledCount++; }
      } catch {}
    }

    console.log(`Filled ${filledCount} of ${ourTextFields.length} fields`);

    const filledPdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(filledPdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(form.name || "form").replace(/[^a-z0-9]/gi, "-")}-filled.pdf"`,
        "X-Fields-Filled": String(filledCount),
      },
    });

  } catch (err: any) {
    console.error("PDF fill error:", err.message);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    const formId = new URL(req.url).searchParams.get("formId");
    if (!formId) return NextResponse.json({ error: "formId required" }, { status: 400 });
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: form } = await supabase.from("pm_forms").select("*").eq("id", formId).eq("user_id", user.id).single();
    if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { data: fileData } = await supabase.storage.from("pm-forms").download(form.file_path);
    if (!fileData) return NextResponse.json({ pdfFields: [] });
    const pdfBytes = await fileData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pdfFields = pdfDoc.getForm().getFields().map(f => ({
      name: f.getName(),
      type: f instanceof PDFTextField ? "text" : f instanceof PDFCheckBox ? "checkbox" : "other",
    }));
    return NextResponse.json({ pdfFields, storedOrder: form.pdf_field_order });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}