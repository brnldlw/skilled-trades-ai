import { NextRequest, NextResponse } from "next/server";
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

function buildPdfHtml(quote: any, survey: any): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const validUntil = new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const severityColor: Record<string, string> = {
    blocker: "#dc2626", warning: "#d97706", info: "#2563eb",
  };
  const severityBg: Record<string, string> = {
    blocker: "#fef2f2", warning: "#fffbeb", info: "#eff6ff",
  };
  const severityIcon: Record<string, string> = {
    blocker: "🚫", warning: "⚠️", info: "ℹ️",
  };

  const selectedEquipment = (quote.equipment_options || []).find((e: any) => e.rank === 1) || quote.equipment_options?.[0];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: #fff; font-size: 13px; line-height: 1.5; }
  .page { max-width: 780px; margin: 0 auto; padding: 0; }

  /* Header */
  .header { background: #0f1f3d; color: #fff; padding: 28px 36px; display: flex; justify-content: space-between; align-items: flex-start; }
  .header-brand { font-size: 18px; font-weight: 800; color: #f97316; letter-spacing: -0.5px; }
  .header-sub { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 3px; }
  .header-right { text-align: right; }
  .header-title { font-size: 22px; font-weight: 900; color: #fff; }
  .header-date { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 4px; }

  /* Site info bar */
  .site-bar { background: #f1f5f9; padding: 16px 36px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; border-bottom: 2px solid #e2e8f0; }
  .site-field label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 3px; }
  .site-field span { font-size: 14px; font-weight: 700; color: #0f1f3d; }

  /* Body */
  .body { padding: 28px 36px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 14px; font-weight: 800; color: #0f1f3d; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }

  /* Obstacles */
  .obstacle { padding: 12px 14px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid; }
  .obstacle-title { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
  .obstacle-body { font-size: 12px; color: #374151; margin-bottom: 4px; }
  .obstacle-action { font-size: 12px; font-style: italic; }

  /* Scope */
  .scope-step { display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-start; }
  .step-num { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .step-num.removal { background: #dc2626; }
  .step-num.install { background: #16a34a; }
  .step-title { font-weight: 700; font-size: 13px; color: #1e293b; }
  .step-desc { font-size: 12px; color: #64748b; margin-top: 2px; }

  /* Equipment options */
  .equip-option { border: 2px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
  .equip-option.selected { border-color: #f97316; background: #fff7ed; }
  .equip-rank { font-size: 10px; font-weight: 700; color: #f97316; margin-bottom: 4px; }
  .equip-name { font-size: 16px; font-weight: 800; color: #0f1f3d; }
  .equip-desc { font-size: 12px; color: #64748b; margin-bottom: 8px; }
  .equip-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
  .equip-tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: #f1f5f9; color: #374151; }
  .equip-tag.green { background: #dcfce7; color: #166534; }
  .equip-price { font-size: 18px; font-weight: 900; color: #0f1f3d; }
  .equip-notes { font-size: 11px; color: #64748b; margin-top: 4px; }

  /* Tools */
  .tool-item { padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; }
  .tool-critical { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-weight: 700; }
  .tool-confirm { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
  .tool-standard { background: #f8fafc; border: 1px solid #e2e8f0; color: #374151; }

  /* Pricing table */
  .price-table { width: 100%; border-collapse: collapse; }
  .price-table th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
  .price-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .price-table tr:last-child td { border-bottom: none; }
  .price-table .total-row td { background: #0f1f3d; color: #fff; font-weight: 800; font-size: 16px; }
  .price-table .rebate-row td { color: #16a34a; font-weight: 700; }
  .text-right { text-align: right; }

  /* Summary grid */
  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; text-align: center; }
  .summary-val { font-size: 20px; font-weight: 900; color: #0f1f3d; }
  .summary-label { font-size: 10px; color: #64748b; margin-top: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }

  /* Tech note */
  .tech-note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
  .tech-note-label { font-size: 10px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .tech-note-body { font-size: 13px; color: #92400e; line-height: 1.6; }

  /* Footer */
  .footer { background: #f8fafc; border-top: 2px solid #e2e8f0; padding: 20px 36px; display: flex; justify-content: space-between; align-items: flex-start; font-size: 11px; color: #64748b; }
  .footer-disclaimer { max-width: 480px; line-height: 1.5; }
  .footer-validity { text-align: right; }
  .footer-validity strong { color: #0f1f3d; font-size: 13px; display: block; margin-top: 4px; }
  .confidence-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; margin-left: 8px; }
  .confidence-high { background: #dcfce7; color: #166534; }
  .confidence-medium { background: #fef9c3; color: #854d0e; }
  .confidence-low { background: #fee2e2; color: #991b1b; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="header-brand">My HVAC/R Tool</div>
      <div class="header-sub">Replacement Quote Estimator</div>
    </div>
    <div class="header-right">
      <div class="header-title">Replacement Quote</div>
      <div class="header-date">Date: ${today}</div>
    </div>
  </div>

  <!-- Site info bar -->
  <div class="site-bar">
    <div class="site-field">
      <label>Customer / Site</label>
      <span>${survey?.customer_name || "—"}</span>
    </div>
    <div class="site-field">
      <label>Address</label>
      <span>${survey?.site_address || "—"}</span>
    </div>
    <div class="site-field">
      <label>Unit / Equipment</label>
      <span>${survey?.unit_label || survey?.equipment_type || "—"}</span>
    </div>
  </div>

  <div class="body">

    <!-- Confidence + summary -->
    <div class="section">
      <div class="section-title">
        📊 Job Summary
        ${quote.confidence_level ? `<span class="confidence-badge confidence-${quote.confidence_level}">${quote.confidence_level.toUpperCase()} CONFIDENCE</span>` : ""}
      </div>
      <div class="summary-grid">
        <div class="summary-box">
          <div class="summary-val">${quote.crew_count || "—"}</div>
          <div class="summary-label">Crew Needed</div>
        </div>
        <div class="summary-box">
          <div class="summary-val">${quote.estimated_hours_min && quote.estimated_hours_max ? `${quote.estimated_hours_min}–${quote.estimated_hours_max}` : "—"}</div>
          <div class="summary-label">Est. Hours</div>
        </div>
        <div class="summary-box">
          <div class="summary-val">${quote.crane_hours ? `${quote.crane_hours} hrs` : "None"}</div>
          <div class="summary-label">Crane Time</div>
        </div>
      </div>
      ${quote.permits_needed?.length ? `<div style="font-size:12px;color:#dc2626;font-weight:700;">⚠️ Permits required: ${quote.permits_needed.join(", ")}</div>` : ""}
    </div>

    <!-- Obstacles -->
    ${(quote.obstacles || []).length > 0 ? `
    <div class="section">
      <div class="section-title">⚠️ Obstacles & Flags</div>
      ${(quote.obstacles || []).map((o: any) => `
        <div class="obstacle" style="background:${severityBg[o.severity] || "#f8fafc"};border-color:${severityColor[o.severity] || "#64748b"};">
          <div class="obstacle-title" style="color:${severityColor[o.severity] || "#374151"};">${severityIcon[o.severity] || "•"} ${o.title}</div>
          <div class="obstacle-body">${o.body}</div>
          <div class="obstacle-action" style="color:${severityColor[o.severity] || "#374151"};">→ ${o.mitigation}</div>
        </div>
      `).join("")}
    </div>
    ` : ""}

    <!-- Scope of work -->
    <div class="section">
      <div class="section-title">📋 Scope of Work</div>
      ${(quote.scope_removal || []).length > 0 ? `
        <div style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Removal</div>
        ${(quote.scope_removal || []).map((s: any) => `
          <div class="scope-step">
            <div class="step-num removal">${s.step}</div>
            <div>
              <div class="step-title">${s.title}</div>
              <div class="step-desc">${s.description}</div>
            </div>
          </div>
        `).join("")}
      ` : ""}
      ${(quote.scope_install || []).length > 0 ? `
        <div style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.06em;margin:14px 0 8px;">Installation</div>
        ${(quote.scope_install || []).map((s: any) => `
          <div class="scope-step">
            <div class="step-num install">${s.step}</div>
            <div>
              <div class="step-title">${s.title}</div>
              <div class="step-desc">${s.description}</div>
            </div>
          </div>
        `).join("")}
      ` : ""}
    </div>

    <!-- Equipment options -->
    <div class="section">
      <div class="section-title">🔧 Equipment Options</div>
      ${(quote.equipment_options || []).map((eq: any) => `
        <div class="equip-option ${eq.rank === 1 ? "selected" : ""}">
          ${eq.rank === 1 ? '<div class="equip-rank">⭐ RECOMMENDED — Best fit for this job</div>' : `<div class="equip-rank">Option ${eq.rank}</div>`}
          <div class="equip-name">${eq.manufacturer} ${eq.model_number}</div>
          <div class="equip-desc">${eq.description || ""}</div>
          <div class="equip-tags">
            ${eq.tonnage ? `<span class="equip-tag">${eq.tonnage}T</span>` : ""}
            ${eq.seer2 ? `<span class="equip-tag">SEER2: ${eq.seer2}</span>` : ""}
            ${eq.refrigerant_type ? `<span class="equip-tag">${eq.refrigerant_type}</span>` : ""}
            ${eq.voltage ? `<span class="equip-tag">${eq.voltage}${eq.phase ? `/3ph` : ""}</span>` : ""}
            ${eq.in_stock ? `<span class="equip-tag green">✓ In Stock</span>` : eq.lead_time_days ? `<span class="equip-tag">${eq.lead_time_days}d lead time</span>` : ""}
            ${eq.rebate_amount > 0 ? `<span class="equip-tag green">💰 $${eq.rebate_amount} rebate</span>` : ""}
          </div>
          ${eq.compatibility_notes ? `<div class="equip-notes">${eq.compatibility_notes}</div>` : ""}
          <div class="equip-price">$${(eq.estimated_equipment_price || 0).toLocaleString()}</div>
        </div>
      `).join("")}
    </div>

    <!-- Tools -->
    ${(quote.tools_special || []).length > 0 ? `
    <div class="section">
      <div class="section-title">🛠️ Tools & Equipment Needed</div>
      ${(quote.tools_special || []).map((t: any) => `
        <div class="tool-item ${t.urgency === "source_now" ? "tool-critical" : "tool-confirm"}">
          ${t.urgency === "source_now" ? "🚨 SOURCE NOW: " : "✓ Confirm onboard: "}${t.name}
          ${t.notes ? `<div style="font-size:11px;font-weight:400;margin-top:2px;opacity:0.8;">${t.notes}</div>` : ""}
        </div>
      `).join("")}
      ${(quote.tools_standard || []).map((t: any) => `
        <div class="tool-item tool-standard">${t.name}</div>
      `).join("")}
    </div>
    ` : ""}

    <!-- Pricing -->
    <div class="section">
      <div class="section-title">💰 Pricing Estimate</div>
      <table class="price-table">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:right;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(quote.line_items || []).map((item: any) => `
            <tr ${item.item_type === "rebate" ? 'class="rebate-row"' : ""}>
              <td>${item.label}</td>
              <td class="text-right">${item.quantity || 1} ${item.unit || ""}</td>
              <td class="text-right">$${(item.unit_price || 0).toLocaleString()}</td>
              <td class="text-right" style="font-weight:700;">${item.item_type === "rebate" ? "-" : ""}$${(item.total || 0).toLocaleString()}</td>
            </tr>
          `).join("")}
          ${quote.rebate_total > 0 ? `
            <tr class="rebate-row">
              <td colspan="3" style="font-weight:700;">Total Rebates</td>
              <td class="text-right" style="font-weight:700;">-$${quote.rebate_total.toLocaleString()}</td>
            </tr>
          ` : ""}
          <tr class="total-row">
            <td colspan="3" style="font-weight:900;font-size:15px;">TOTAL ESTIMATE</td>
            <td class="text-right" style="font-size:20px;color:#f97316;font-weight:900;">$${(quote.total_estimate || 0).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tech note -->
    ${quote.tech_notes_suggested ? `
    <div class="tech-note">
      <div class="tech-note-label">Technician Notes</div>
      <div class="tech-note-body">${quote.tech_notes_suggested}</div>
    </div>
    ` : ""}

  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-disclaimer">
      This is an AI-assisted field estimate based on technician survey data and site photos. Final pricing may vary based on actual conditions, material costs, and permit requirements. This quote is not a contract. All work subject to final inspection and customer approval.
      <br><br>
      Generated by My HVAC/R Tool — Replacement Quote Estimator. app.myhvacrtool.com
    </div>
    <div class="footer-validity">
      Valid until<br>
      <strong>${validUntil}</strong>
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

    const body = await req.json();
    const { quote, survey } = body;

    if (!quote) return NextResponse.json({ error: "No quote data" }, { status: 400 });

    const html = buildPdfHtml(quote, survey);

    // Return the HTML — client will use browser print to PDF
    // This avoids needing headless Chrome on Vercel serverless
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "X-Quote-Customer": survey?.customer_name || "Quote",
      },
    });

  } catch (err: any) {
    console.error("Quote PDF error:", err.message);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}