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

async function analyzeFormWithClaude(base64Pdf: string): Promise<{ fields: any[]; formTitle: string; rawText: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  // Step 1: Ask Claude to just READ the form and list the fields as plain text
  const readRes = await fetch("https://api.anthropic.com/v1/messages", {
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
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            type: "text",
            text: `List every single field label you can see in this form that requires information to be filled in. Just list the labels, one per line. Include things like: customer name, address, unit model, serial number, date, technician name, any readings or measurements, checkboxes, etc. List ALL of them.`,
          },
        ],
      }],
    }),
  });

  if (!readRes.ok) {
    const errText = await readRes.text();
    throw new Error(`Claude API error ${readRes.status}: ${errText}`);
  }

  const readData = await readRes.json();
  const rawText = readData.content?.[0]?.text || "";

  console.log("Claude raw field list:", rawText.substring(0, 500));

  if (!rawText || rawText.length < 10) {
    return { fields: [], formTitle: "PM Form", rawText };
  }

  // Step 2: Convert the plain text list to structured fields
  const structureRes = await fetch("https://api.anthropic.com/v1/messages", {
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
        content: `Convert this list of HVAC/R form field labels into JSON. Return ONLY the JSON array, no other text.

Field labels:
${rawText}

Rules for each field:
- id: snake_case version of the label (e.g. "customer_name")
- label: the original label text
- type: "text" for most fields, "date" for dates, "number" for numbers/measurements, "checkbox" for yes/no fields
- category: "customer" (customer/site info), "equipment" (unit make/model/serial/specs), "tech" (technician info), "readings" (pressures/temps/measurements), "date" (dates), "other"
- nameplateField: if readable from unit nameplate use one of: manufacturer, model, serial, refrigerant, voltage, tonnage, mca, mop, rla, fla — otherwise null
- placeholder: short example value
- required: true

Return format:
[{"id":"field_id","label":"Field Label","type":"text","category":"customer","nameplateField":null,"placeholder":"example","required":true}]`,
      }],
    }),
  });

  let fields: any[] = [];
  let formTitle = "PM Form";

  if (structureRes.ok) {
    const structureData = await structureRes.json();
    const structureText = structureData.content?.[0]?.text || "";
    console.log("Structure response:", structureText.substring(0, 300));

    try {
      const clean = structureText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      fields = Array.isArray(parsed) ? parsed : (parsed.fields || []);
    } catch (e) {
      console.error("JSON parse error:", e);
      // Fallback: create basic fields from raw text lines
      const lines = rawText.split("\n").filter((l: string) => l.trim().length > 2);
      fields = lines.slice(0, 30).map((line: string, i: number) => {
        const clean = line.replace(/^[-•*\d.]+\s*/, "").trim();
        const isDate = /date|time/i.test(clean);
        const isNum = /pressure|temp|amp|volt|reading|superheat|subcool/i.test(clean);
        return {
          id: `field_${i}_${clean.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 20)}`,
          label: clean,
          type: isDate ? "date" : isNum ? "number" : "text",
          category: /customer|site|address|contact/i.test(clean) ? "customer"
            : /model|serial|mfr|manufacturer|refrigerant|tonnage|voltage|mca|mop|rla|fla/i.test(clean) ? "equipment"
            : /tech|name|sign|company/i.test(clean) ? "tech"
            : isDate ? "date"
            : isNum ? "readings"
            : "other",
          nameplateField: /manufacturer|make/i.test(clean) ? "manufacturer"
            : /\bmodel\b/i.test(clean) ? "model"
            : /serial/i.test(clean) ? "serial"
            : /refrigerant/i.test(clean) ? "refrigerant"
            : /voltage/i.test(clean) ? "voltage"
            : /tonnage/i.test(clean) ? "tonnage"
            : null,
          placeholder: "",
          required: true,
        };
      });
    }
  }

  // Try to get form title from raw text
  const firstLine = rawText.split("\n")[0]?.trim();
  if (firstLine && firstLine.length < 80) formTitle = firstLine;

  return { fields, formTitle, rawText };
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

      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
      if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");

      const { fields, formTitle, rawText } = await analyzeFormWithClaude(base64);

      // Save to DB
      const supabase = getSupabaseAdmin();
      const filePath = `pm-forms/${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

      await supabase.storage.from("pm-forms")
        .upload(filePath, bytes, { contentType: "application/pdf", upsert: false })
        .catch(e => console.warn("Storage upload failed:", e.message));

      const { data: savedForm, error: dbError } = await supabase
        .from("pm_forms")
        .insert({
          user_id: user.id,
          name: formName,
          file_name: file.name,
          file_path: filePath,
          fields: fields,
          page_count: 1,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        console.error("DB error:", dbError.message);
        return NextResponse.json({
          ok: true,
          form: { id: null, name: formName, fields, file_name: file.name },
          fields,
          formTitle,
          rawText: rawText.substring(0, 200),
        });
      }

      return NextResponse.json({ ok: true, form: savedForm, fields, formTitle });
    }

    if (action === "list_forms") {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("pm_forms").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false });
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
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}