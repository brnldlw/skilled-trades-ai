import { NextRequest, NextResponse } from "next/server";
import { t, type Language } from "../../lib/translations";
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

type ReportRequest = {
  customerName?: string;
  siteName?: string;
  siteAddress?: string;
  serviceDate?: string;
  equipmentType?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  refrigerantType?: string;
  symptom?: string;
  finalConfirmedCause?: string;
  actualFixPerformed?: string;
  partsReplaced?: string;
  outcomeStatus?: string;
  techCloseoutNotes?: string;
  observations?: { label: string; value: string; unit: string }[];
  companyName?: string;
  lang?: Language;
};

function buildReportHTML(data: ReportRequest, aiSummary: string): string {
  const lang: Language = data.lang === "es" ? "es" : "en";
  const dateLocale = lang === "es" ? "es-US" : "en-US";
  const date = data.serviceDate
    ? new Date(data.serviceDate).toLocaleDateString(dateLocale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString(dateLocale, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const statusColor =
    data.outcomeStatus === "Resolved" ? "#16a34a" :
    data.outcomeStatus === "Monitoring" ? "#d97706" :
    data.outcomeStatus === "Callback" ? "#dc2626" :
    data.outcomeStatus === "Parts on Order" ? "#2563eb" : "#64748b";

  const readingsHTML = Array.isArray(data.observations) && data.observations.length
    ? `<table style="width:100%;border-collapse:collapse;margin-top:8px">
        <tr style="background:#f8fafc">
          <th style="text-align:left;padding:6px 10px;font-size:11px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">${t("report_table_reading", lang)}</th>
          <th style="text-align:right;padding:6px 10px;font-size:11px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">${t("report_table_value", lang)}</th>
        </tr>
        ${data.observations.map(o => `
        <tr>
          <td style="padding:6px 10px;font-size:12px;color:#374151;border-bottom:1px solid #f1f5f9">${o.label}</td>
          <td style="padding:6px 10px;font-size:12px;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9">${o.value} ${o.unit}</td>
        </tr>`).join("")}
      </table>`
    : `<p style='font-size:12px;color:#94a3b8;margin-top:6px'>${t("report_no_readings", lang)}</p>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t("report_title", lang)} — ${data.customerName || "Customer"}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; }
  .page { max-width: 680px; margin: 0 auto; background: #fff; min-height: 100vh; }
  .header { background: #0f1f3d; padding: 28px 32px; color: #fff; }
  .company { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
  .report-title { font-size: 22px; font-weight: 800; }
  .report-date { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 4px; }
  .status-bar { background: ${statusColor}; padding: 8px 32px; }
  .status-text { color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
  .content { padding: 24px 32px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-item { }
  .info-label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
  .info-value { font-size: 13px; font-weight: 600; color: #1e293b; }
  .summary-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 16px; }
  .summary-text { font-size: 14px; line-height: 1.7; color: #1e293b; }
  .highlight { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; }
  .highlight-label { font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 600; }
  .highlight-value { font-size: 13px; color: #1e293b; line-height: 1.5; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; margin-top: 32px; }
  .footer-text { font-size: 11px; color: #94a3b8; line-height: 1.6; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: ${statusColor}20; color: ${statusColor}; }
  @media print { body { background: #fff; } .page { box-shadow: none; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="company">${data.companyName || t("report_default_company", lang)}</div>
    <div class="report-title">${t("report_title", lang)}</div>
    <div class="report-date">${date}</div>
  </div>
  <div class="status-bar">
    <div class="status-text">${t("report_status_prefix", lang)} ${data.outcomeStatus || t("report_status_default", lang)}</div>
  </div>

  <div class="content">

    <div class="section">
      <div class="section-title">${t("report_section_customer_location", lang)}</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">${t("report_label_customer", lang)}</div>
          <div class="info-value">${data.customerName || "—"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t("report_label_site", lang)}</div>
          <div class="info-value">${data.siteName || "—"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t("report_label_address", lang)}</div>
          <div class="info-value">${data.siteAddress || "—"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t("report_label_service_date", lang)}</div>
          <div class="info-value">${data.serviceDate || date}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">${t("report_section_equipment", lang)}</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">${t("report_label_type", lang)}</div>
          <div class="info-value">${data.equipmentType || "—"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t("report_label_manufacturer", lang)}</div>
          <div class="info-value">${data.manufacturer || "—"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t("report_label_model", lang)}</div>
          <div class="info-value">${data.model || "—"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t("report_label_serial", lang)}</div>
          <div class="info-value">${data.serialNumber || "—"}</div>
        </div>
        ${data.refrigerantType && data.refrigerantType !== "Unknown" ? `
        <div class="info-item">
          <div class="info-label">${t("report_label_refrigerant", lang)}</div>
          <div class="info-value">${data.refrigerantType}</div>
        </div>` : ""}
      </div>
    </div>

    <div class="section">
      <div class="section-title">${t("report_section_summary", lang)}</div>
      <div class="summary-box">
        <div class="summary-text">${aiSummary}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">${t("report_section_service_details", lang)}</div>
      ${data.symptom ? `<div class="highlight"><div class="highlight-label">${t("report_label_reported_problem", lang)}</div><div class="highlight-value">${data.symptom}</div></div>` : ""}
      ${data.finalConfirmedCause ? `<div class="highlight"><div class="highlight-label">${t("report_label_confirmed_cause", lang)}</div><div class="highlight-value">${data.finalConfirmedCause}</div></div>` : ""}
      ${data.actualFixPerformed ? `<div class="highlight"><div class="highlight-label">${t("report_label_work_performed", lang)}</div><div class="highlight-value">${data.actualFixPerformed}</div></div>` : ""}
      ${data.partsReplaced ? `<div class="highlight"><div class="highlight-label">${t("report_label_parts_replaced", lang)}</div><div class="highlight-value">${data.partsReplaced}</div></div>` : ""}
      ${data.techCloseoutNotes ? `<div class="highlight"><div class="highlight-label">${t("report_label_tech_notes", lang)}</div><div class="highlight-value">${data.techCloseoutNotes}</div></div>` : ""}
    </div>

    ${Array.isArray(data.observations) && data.observations.length ? `
    <div class="section">
      <div class="section-title">${t("report_section_field_readings", lang)}</div>
      ${readingsHTML}
    </div>` : ""}

  </div>

  <div class="footer">
    <div class="footer-text">
      ${t("report_footer_line1", lang)}<br>
      ${t("report_footer_line2", lang)}<br>
      ${t("report_footer_generated", lang)} ${new Date().toLocaleString(dateLocale)}
    </div>
  </div>
</div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const body: ReportRequest = await req.json();
    const lang: Language = body.lang === "es" ? "es" : "en";

    const apiKey = process.env.ANTHROPIC_API_KEY || "";

    let aiSummary = "";

    if (apiKey) {
      const langInstruction = lang === "es"
        ? "\n\nWrite the summary in Spanish (español), in plain language a Spanish-speaking homeowner or building manager can understand."
        : "";
      const prompt = `You are writing a customer-friendly service report summary for an HVAC/R service visit.
Write 2-4 sentences in plain English that a homeowner or building manager can understand.
NO technical jargon. Explain what was wrong, what was done, and what the current status is.
Keep it professional, reassuring, and clear.

Job details:
- Equipment: ${body.equipmentType || "HVAC system"} — ${body.manufacturer || ""} ${body.model || ""}
- Reported problem: ${body.symptom || "Equipment issue"}
- Confirmed cause: ${body.finalConfirmedCause || "Under investigation"}
- Work performed: ${body.actualFixPerformed || "Diagnostic service performed"}
- Parts replaced: ${body.partsReplaced || "None"}
- Current status: ${body.outcomeStatus || "Service completed"}
- Tech notes: ${body.techCloseoutNotes || ""}

Write only the summary paragraph. No headers, no bullets, no preamble.${langInstruction}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiSummary = data?.content?.[0]?.text || "";
      }
    }

    if (!aiSummary) {
      const parts = lang === "es" ? [
        body.symptom ? `Respondimos a un reporte de ${body.symptom} en su ${body.equipmentType || "sistema HVAC"}.` : `Realizamos una visita de servicio en su ${body.equipmentType || "sistema HVAC"}.`,
        body.finalConfirmedCause ? `Nuestro técnico identificó la causa como ${body.finalConfirmedCause}.` : "",
        body.actualFixPerformed ? `Se realizó el siguiente trabajo: ${body.actualFixPerformed}.` : "",
        body.partsReplaced ? `Partes reemplazadas: ${body.partsReplaced}.` : "",
        body.outcomeStatus && body.outcomeStatus !== "Not Set" ? `Estado actual del sistema: ${body.outcomeStatus}.` : "El sistema ha sido reparado.",
      ] : [
        body.symptom ? `We responded to a report of ${body.symptom} on your ${body.equipmentType || "HVAC system"}.` : `We performed a service visit on your ${body.equipmentType || "HVAC system"}.`,
        body.finalConfirmedCause ? `Our technician identified the cause as ${body.finalConfirmedCause}.` : "",
        body.actualFixPerformed ? `The following work was performed: ${body.actualFixPerformed}.` : "",
        body.partsReplaced ? `Parts replaced: ${body.partsReplaced}.` : "",
        body.outcomeStatus && body.outcomeStatus !== "Not Set" ? `Current system status: ${body.outcomeStatus}.` : "The system has been serviced.",
      ];
      aiSummary = parts.filter(Boolean).join(" ");
    }

    const html = buildReportHTML(body, aiSummary);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Report generation failed: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}