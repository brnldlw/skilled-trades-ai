import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";
import { execFile } from "child_process";
import { writeFile, readFile, unlink, readdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

export const runtime = "nodejs";
const execFileAsync = promisify(execFile);

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

// Convert first page of PDF to image using pdftoppm
async function pdfPageToBase64(pdfBytes: ArrayBuffer): Promise<string | null> {
  const tmpPdf = join(tmpdir(), `pm_form_${Date.now()}.pdf`);
  const tmpOut = join(tmpdir(), `pm_form_${Date.now()}`);
  try {
    await writeFile(tmpPdf, Buffer.from(pdfBytes));
    // Convert first page to PNG at 150 DPI
    await execFileAsync("pdftoppm", ["-png", "-r", "150", "-f", "1", "-l", "1", tmpPdf, tmpOut]);
    // Find the output file
    const dir = tmpdir();
    const files = await readdir(dir);
    const outFile = files.find(f => f.startsWith(`pm_form_`) && f.endsWith(".png") && f.includes(tmpOut.split("/").pop()!));
    if (!outFile) return null;
    const imgBytes = await readFile(join(dir, outFile));
    await unlink(join(dir, outFile)).catch(() => {});
    return imgBytes.toString("base64");
  } catch (e) {
    console.warn("PDF to image failed:", e);
    return null;
  } finally {
    await unlink(tmpPdf).catch(() => {});
  }
}

// Get PDF fields with their coordinates sorted visually
async function getPdfFieldsWithCoords(pdfBytes: ArrayBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pdfForm = pdfDoc.getForm();
  const fields = pdfForm.getFields();
  const pages = pdfDoc.getPages();
  const pageHeight = pages[0]?.getHeight() || 792;
  const pageWidth = pages[0]?.getWidth() || 612;

  const fieldsWithPos: { name: string; type: string; x: number; y: number; w: number; h: number }[] = [];

  for (const field of fields) {
    try {
      const widgets = field.acroField.getWidgets();
      for (const widget of widgets) {
        const rect = widget.getRectangle();
        fieldsWithPos.push({
          name: field.getName(),
          type: field instanceof PDFTextField ? "text" : field instanceof PDFCheckBox ? "checkbox" : "other",
          x: Math.round(rect.x),
          y: Math.round(pageHeight - rect.y - rect.height), // flip to top-down
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        });
      }
    } catch {}
  }

  // Sort top-to-bottom, left-to-right (group rows within 8px)
  fieldsWithPos.sort((a, b) => {
    if (Math.abs(a.y - b.y) > 8) return a.y - b.y;
    return a.x - b.x;
  });

  return { fieldsWithPos, pageWidth, pageHeight };
}

// Ask Claude Vision to map labels to fields using the rendered page image
async function autoMapWithVision(
  imageBase64: string,
  fieldsWithPos: { name: string; type: string; x: number; y: number; w: number; h: number }[],
  pageWidth: number,
  pageHeight: number
): Promise<Record<string, string>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return {};

  // Build field location description for Claude
  const fieldList = fieldsWithPos
    .filter(f => f.type === "text")
    .map(f => `"${f.name}" at position (x:${f.x}, y:${f.y}) size ${f.w}x${f.h}`)
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: imageBase64 },
          },
          {
            type: "text",
            text: `This is a PDF form rendered as an image. The page is ${pageWidth} x ${pageHeight} points.

Here are the fillable text fields with their positions (x,y from top-left):
${fieldList}

Look at the form image carefully. For each fillable field shown above, identify what label is written next to it on the form (like "Customer Name", "Date", "Serial Number", etc.).

Return ONLY valid JSON mapping label to PDF field name:
{
  "Customer Name": "Text Field 3",
  "Site Address": "Text Field 1",
  "Date": "Text Field 7"
}

Use the exact label text from the form. Only include fields you can clearly identify.`,
          },
        ],
      }],
    }),
  });

  if (!res.ok) return {};
  const data = await res.json();
  const text = data.content?.[0]?.text || "";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    console.warn("Vision mapping parse failed:", text.substring(0, 200));
    return {};
  }
}

// Get field labels from Claude (text only, fast)
async function getFieldLabels(base64Pdf: string): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Pdf } },
          { type: "text", text: "List every blank field label in this form, one per line, in order top to bottom left to right. Just the labels, no numbers or extra text." },
        ],
      }],
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  return text.split("\n").map((l: string) => l.replace(/^\d+\.\s*/, "").trim()).filter((l: string) => l.length > 1);
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

      // Step 1: Get PDF field coordinates
      const { fieldsWithPos, pageWidth, pageHeight } = await getPdfFieldsWithCoords(bytes);
      console.log(`Found ${fieldsWithPos.length} PDF fields`);

      // Step 2: Convert PDF to image for vision analysis
      const imageBase64 = await pdfPageToBase64(bytes);
      console.log("Image conversion:", imageBase64 ? "success" : "failed");

      // Step 3: Get field labels from Claude (text reading)
      const labels = await getFieldLabels(base64);
      console.log(`Claude detected ${labels.length} field labels`);

      // Step 4: Auto-map using Claude Vision (if image available)
      let visionMapping: Record<string, string> = {};
      if (imageBase64) {
        visionMapping = await autoMapWithVision(imageBase64, fieldsWithPos, pageWidth, pageHeight);
        console.log(`Vision mapped ${Object.keys(visionMapping).length} fields:`, JSON.stringify(visionMapping).substring(0, 300));
      }

      // Step 5: Build field objects
      // visionMapping = { "Customer Name": "Text Field 3", ... }
      // Invert to { "Text Field 3": "Customer Name" }
      const pdfNameToLabel: Record<string, string> = {};
      for (const [label, pdfName] of Object.entries(visionMapping)) {
        pdfNameToLabel[pdfName] = label;
      }

      // Sort text fields by visual position
      const sortedTextFields = fieldsWithPos.filter(f => f.type === "text");

      // Build our field list — use vision labels where matched, fall back to Claude text labels
      const usedPdfNames = new Set<string>();
      const fields: any[] = [];

      // First: add vision-matched fields in visual order
      for (const pdfField of sortedTextFields) {
        const label = pdfNameToLabel[pdfField.name];
        if (!label) continue;
        usedPdfNames.add(pdfField.name);
        const labelLower = label.toLowerCase();
        fields.push({
          id: `field_${fields.length}_${labelLower.replace(/[^a-z0-9]/g, "_").substring(0, 20)}`,
          label,
          type: /date/.test(labelLower) ? "date" : "text",
          category: /customer|site|address|city|state|zip|contact|phone/.test(labelLower) ? "customer"
            : /make|manufacturer|model|serial|refrigerant|voltage|tonnage|mca|mop|rla|fla/.test(labelLower) ? "equipment"
            : /tech|technician|name|signature/.test(labelLower) ? "tech"
            : /pressure|temp|amp|superheat|subcool|reading/.test(labelLower) ? "readings"
            : /date/.test(labelLower) ? "date" : "other",
          nameplateField: /manufacturer|make/.test(labelLower) ? "manufacturer"
            : /\bmodel\b/.test(labelLower) ? "model"
            : /serial/.test(labelLower) ? "serial"
            : /refrigerant/.test(labelLower) ? "refrigerant"
            : /voltage/.test(labelLower) ? "voltage"
            : /tonnage/.test(labelLower) ? "tonnage"
            : /\bmca\b/.test(labelLower) ? "mca"
            : /\bmop\b/.test(labelLower) ? "mop"
            : /\brla\b/.test(labelLower) ? "rla"
            : /\bfla\b/.test(labelLower) ? "fla" : null,
          pdfFieldName: pdfField.name,
          required: true,
          placeholder: "",
        });
      }

      // Fill remaining from Claude text labels for unmatched PDF fields
      const unmatchedPdfFields = sortedTextFields.filter(f => !usedPdfNames.has(f.name));
      const usedLabels = new Set(Object.keys(visionMapping));
      const remainingLabels = labels.filter(l => !usedLabels.has(l));

      remainingLabels.forEach((label, i) => {
        if (!unmatchedPdfFields[i]) return;
        const labelLower = label.toLowerCase();
        fields.push({
          id: `field_${fields.length}_${labelLower.replace(/[^a-z0-9]/g, "_").substring(0, 20)}`,
          label,
          type: /date/.test(labelLower) ? "date" : "text",
          category: /customer|site|address|city|state|zip|contact|phone/.test(labelLower) ? "customer"
            : /make|manufacturer|model|serial|refrigerant|voltage|tonnage|mca|mop|rla|fla/.test(labelLower) ? "equipment"
            : /tech|technician|name|signature/.test(labelLower) ? "tech"
            : /pressure|temp|amp|superheat|subcool|reading/.test(labelLower) ? "readings"
            : /date/.test(labelLower) ? "date" : "other",
          nameplateField: /manufacturer|make/.test(labelLower) ? "manufacturer"
            : /\bmodel\b/.test(labelLower) ? "model"
            : /serial/.test(labelLower) ? "serial"
            : /refrigerant/.test(labelLower) ? "refrigerant"
            : /voltage/.test(labelLower) ? "voltage"
            : /tonnage/.test(labelLower) ? "tonnage"
            : /\bmca\b/.test(labelLower) ? "mca"
            : /\bmop\b/.test(labelLower) ? "mop"
            : /\brla\b/.test(labelLower) ? "rla"
            : /\bfla\b/.test(labelLower) ? "fla" : null,
          pdfFieldName: unmatchedPdfFields[i].name,
          required: true,
          placeholder: "",
        });
      });

      // Build the pdf_field_order (visual order of all text fields)
      const pdfFieldOrder = sortedTextFields.map(f => f.name);
      const pdfCheckOrder = fieldsWithPos.filter(f => f.type === "checkbox").map(f => f.name);

      // Save to DB
      const supabase = getSupabaseAdmin();
      const filePath = `pm-forms/${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      await supabase.storage.from("pm-forms")
        .upload(filePath, bytes, { contentType: "application/pdf", upsert: false })
        .catch(e => console.warn("Storage:", e.message));

      const { data: savedForm, error: dbError } = await supabase
        .from("pm_forms")
        .insert({ user_id: user.id, name: formName, file_name: file.name, file_path: filePath, fields, page_count: 1, created_at: new Date().toISOString() })
        .select().single();

      if (dbError) {
        console.error("DB:", dbError.message);
        return NextResponse.json({ ok: true, form: { id: null, name: formName, fields, file_name: file.name, pdf_field_order: pdfFieldOrder }, fields, autoMapped: Object.keys(visionMapping).length });
      }

      return NextResponse.json({ ok: true, form: { ...savedForm, pdf_field_order: pdfFieldOrder, pdf_check_order: pdfCheckOrder }, fields, autoMapped: Object.keys(visionMapping).length });
    }

    if (action === "list_forms") {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("pm_forms").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) return NextResponse.json({ forms: [] });
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