import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from "pdf-lib";

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
    const { formId, values, fieldMappings } = body;
    // values: { fieldId: "typed value" }
    // fieldMappings: { fieldId: "pdf_field_name" } — optional, for precise matching

    if (!formId || !values) {
      return NextResponse.json({ error: "formId and values required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: form } = await supabase
      .from("pm_forms")
      .select("*")
      .eq("id", formId)
      .eq("user_id", user.id)
      .single();

    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    // Download original PDF
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pm-forms")
      .download(form.file_path);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Could not load PDF from storage: " + downloadError?.message }, { status: 500 });
    }

    const pdfBytes = await fileData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pdfForm = pdfDoc.getForm();
    const pdfFields = pdfForm.getFields();

    // Log all PDF field names for debugging
    const pdfFieldNames = pdfFields.map(f => f.getName());
    console.log("PDF field names:", JSON.stringify(pdfFieldNames));
    console.log("Values to fill:", JSON.stringify(Object.keys(values)));

    // Build a map of our field labels for fuzzy matching
    const formFieldLabels: Record<string, string> = {};
    if (form.fields && Array.isArray(form.fields)) {
      for (const f of form.fields) {
        formFieldLabels[f.id] = (f.label || "").toLowerCase();
      }
    }

    let filledCount = 0;

    // For each PDF field, find the best matching value
    for (const pdfField of pdfFields) {
      const pdfName = pdfField.getName();
      const pdfNameLower = pdfName.toLowerCase().replace(/[_\s-]/g, " ");

      let bestValue: string | null = null;

      // Try 1: exact fieldId match (from fieldMappings if provided)
      if (fieldMappings && fieldMappings[pdfName]) {
        const mappedId = fieldMappings[pdfName];
        if (values[mappedId]) bestValue = String(values[mappedId]);
      }

      // Try 2: fuzzy match between PDF field name and our field labels
      if (!bestValue) {
        let bestScore = 0;
        for (const [fieldId, fieldVal] of Object.entries(values)) {
          if (!fieldVal) continue;
          const ourLabel = (formFieldLabels[fieldId] || fieldId).toLowerCase().replace(/[_\s-]/g, " ");

          // Score based on word overlap
          const pdfWords = pdfNameLower.split(" ").filter(w => w.length > 2);
          const ourWords = ourLabel.split(" ").filter(w => w.length > 2);
          const overlap = pdfWords.filter(w => ourWords.some(ow => ow.includes(w) || w.includes(ow))).length;
          const score = overlap / Math.max(pdfWords.length, ourWords.length, 1);

          if (score > bestScore && score >= 0.3) {
            bestScore = score;
            bestValue = String(fieldVal);
          }
        }
      }

      // Try 3: keyword matching for common HVAC fields
      if (!bestValue) {
        const keywordMap: Record<string, string[]> = {
          manufacturer: ["manufacturer", "make", "brand", "mfr"],
          model: ["model", "model number", "model no"],
          serial: ["serial", "serial number", "serial no", "s/n", "sn"],
          refrigerant: ["refrigerant", "ref", "refrigerant type"],
          voltage: ["voltage", "volts", "volt"],
          tonnage: ["tonnage", "tons", "capacity", "ton"],
          mca: ["mca", "min circuit", "minimum circuit"],
          mop: ["mop", "max fuse", "maximum fuse", "max overcurrent"],
          rla: ["rla", "rated load amp"],
          fla: ["fla", "full load amp"],
        };

        for (const [ourFieldId, keywords] of Object.entries(keywordMap)) {
          if (!values[ourFieldId]) continue;
          if (keywords.some(kw => pdfNameLower.includes(kw))) {
            bestValue = String(values[ourFieldId]);
            break;
          }
        }

        // Also check our field labels against PDF name with keywords
        if (!bestValue) {
          for (const [fieldId, fieldVal] of Object.entries(values)) {
            if (!fieldVal) continue;
            const ourLabel = (formFieldLabels[fieldId] || "").toLowerCase();
            for (const keywords of Object.values(keywordMap)) {
              if (keywords.some(kw => ourLabel.includes(kw) && pdfNameLower.includes(kw))) {
                bestValue = String(fieldVal);
                break;
              }
            }
            if (bestValue) break;
          }
        }
      }

      // Fill the field if we found a value
      if (bestValue) {
        try {
          if (pdfField instanceof PDFTextField) {
            pdfField.setText(bestValue);
            filledCount++;
          } else if (pdfField instanceof PDFCheckBox) {
            if (bestValue === "true" || bestValue === "yes" || bestValue === "1") {
              pdfField.check();
              filledCount++;
            }
          } else if (pdfField instanceof PDFDropdown) {
            try { pdfField.select(bestValue); filledCount++; } catch {}
          }
        } catch (e) {
          console.warn("Could not fill field:", pdfName, e);
        }
      }
    }

    console.log(`Filled ${filledCount} of ${pdfFields.length} PDF fields`);

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
    console.error("PDF fill error:", err.message, err.stack?.substring(0, 300));
    return NextResponse.json({ error: err?.message || "Failed to fill PDF" }, { status: 500 });
  }
}

// GET: Return the PDF field names so the frontend can show them
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

    const { data: form } = await supabase
      .from("pm_forms").select("*").eq("id", formId).eq("user_id", user.id).single();
    if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: fileData } = await supabase.storage.from("pm-forms").download(form.file_path);
    if (!fileData) return NextResponse.json({ pdfFields: [] });

    const pdfBytes = await fileData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pdfForm = pdfDoc.getForm();
    const pdfFields = pdfForm.getFields().map(f => ({
      name: f.getName(),
      type: f instanceof PDFTextField ? "text" : f instanceof PDFCheckBox ? "checkbox" : "other",
    }));

    return NextResponse.json({ pdfFields });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}