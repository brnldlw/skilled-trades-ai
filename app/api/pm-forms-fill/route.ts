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
    const pdfFields = pdfForm.getFields();

    // Our detected fields in order
    const ourFields: any[] = Array.isArray(form.fields) ? form.fields : [];

    let filledCount = 0;

    // POSITIONAL MATCHING: match our field index to PDF field index
    // PDF fields are numbered but not in numeric order — sort them by number first
    const textFields = pdfFields.filter(f => f instanceof PDFTextField) as PDFTextField[];
    const checkFields = pdfFields.filter(f => f instanceof PDFCheckBox) as PDFCheckBox[];

    // Sort text fields by their number (Text Field 1, Text Field 2, etc.)
    textFields.sort((a, b) => {
      const numA = parseInt(a.getName().replace(/\D/g, "") || "0");
      const numB = parseInt(b.getName().replace(/\D/g, "") || "0");
      return numA - numB;
    });

    // Get our text-type fields in order (non-checkbox fields)
    const ourTextFields = ourFields.filter(f => f.type !== "checkbox");
    const ourCheckFields = ourFields.filter(f => f.type === "checkbox");

    console.log(`PDF text fields: ${textFields.length}, our text fields: ${ourTextFields.length}`);
    console.log(`PDF check fields: ${checkFields.length}, our check fields: ${ourCheckFields.length}`);

    // Fill text fields positionally
    for (let i = 0; i < ourTextFields.length; i++) {
      const ourField = ourTextFields[i];
      const val = values[ourField.id];
      if (!val || !textFields[i]) continue;

      try {
        textFields[i].setText(String(val));
        filledCount++;
        console.log(`Filled "${ourField.label}" → PDF "${textFields[i].getName()}" = "${String(val).substring(0, 30)}"`);
      } catch (e) {
        console.warn(`Could not fill ${textFields[i].getName()}:`, e);
      }
    }

    // Fill checkboxes positionally
    for (let i = 0; i < ourCheckFields.length; i++) {
      const ourField = ourCheckFields[i];
      const val = values[ourField.id];
      if (!checkFields[i]) continue;

      try {
        if (val === true || val === "true" || val === "yes") {
          checkFields[i].check();
          filledCount++;
        }
      } catch (e) {
        console.warn(`Could not fill checkbox ${checkFields[i].getName()}:`, e);
      }
    }

    console.log(`Filled ${filledCount} of ${pdfFields.length} total PDF fields`);

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
    return NextResponse.json({ pdfFields });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}