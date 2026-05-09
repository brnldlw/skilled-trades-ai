import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PDFDocument } from "pdf-lib";

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

    if (!formId || !values) {
      return NextResponse.json({ error: "formId and values required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the form metadata
    const { data: form } = await supabase
      .from("pm_forms")
      .select("*")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    // Download the original PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pm-forms")
      .download(form.file_path);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Could not load original PDF: " + downloadError?.message }, { status: 500 });
    }

    // Load PDF with pdf-lib
    const pdfBytes = await fileData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pdfForm = pdfDoc.getForm();

    // Get all form fields in the PDF
    const pdfFields = pdfForm.getFields();
    console.log("PDF fields found:", pdfFields.map(f => f.getName()));

    let filledCount = 0;

    // Strategy 1: Match by PDF field names directly
    for (const pdfField of pdfFields) {
      const fieldName = pdfField.getName().toLowerCase();

      // Find matching value from our fields
      const matchingEntry = Object.entries(values).find(([fieldId, _val]) => {
        const id = fieldId.toLowerCase();
        return id === fieldName ||
          fieldName.includes(id.substring(0, 10)) ||
          id.includes(fieldName.substring(0, 10));
      });

      if (matchingEntry && matchingEntry[1]) {
        try {
          const fieldType = pdfField.constructor.name;
          if (fieldType === "PDFTextField") {
            (pdfForm.getTextField(pdfField.getName())).setText(String(matchingEntry[1]));
            filledCount++;
          } else if (fieldType === "PDFCheckBox" && matchingEntry[1] === true) {
            (pdfForm.getCheckBox(pdfField.getName())).check();
            filledCount++;
          }
        } catch (e) {
          console.warn("Could not fill field:", pdfField.getName());
        }
      }
    }

    // Strategy 2: If few matches, try matching by our field labels vs PDF field names
    if (filledCount < Object.keys(values).length / 2 && form.fields) {
      for (const formField of form.fields) {
        const fieldVal = values[formField.id];
        if (!fieldVal) continue;

        // Find PDF field whose name is similar to our field label
        const labelWords = formField.label.toLowerCase().replace(/[^a-z0-9]/g, " ").split(" ").filter((w: string) => w.length > 2);

        for (const pdfField of pdfFields) {
          const pdfName = pdfField.getName().toLowerCase().replace(/[^a-z0-9]/g, " ");
          const matches = labelWords.filter((w: string) => pdfName.includes(w)).length;

          if (matches >= Math.min(2, labelWords.length)) {
            try {
              const fieldType = pdfField.constructor.name;
              if (fieldType === "PDFTextField") {
                (pdfForm.getTextField(pdfField.getName())).setText(String(fieldVal));
                filledCount++;
              }
            } catch (e) {
              // skip
            }
            break;
          }
        }
      }
    }

    // Flatten form to prevent further editing (makes it look clean)
    // pdfForm.flatten(); // Commented out — keep editable so tech can add more

    const filledPdfBytes = await pdfDoc.save();

    // Return the filled PDF as a download
    return new NextResponse(filledPdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${form.name.replace(/[^a-z0-9]/gi, "-")}-filled.pdf"`,
        "Content-Length": filledPdfBytes.length.toString(),
      },
    });

  } catch (err: any) {
    console.error("PDF fill error:", err);
    return NextResponse.json({ error: err?.message || "Failed to fill PDF" }, { status: 500 });
  }
}