/**
 * emailService.ts
 * Sends emails via Resend API using plain fetch — no npm package needed.
 * Sign up free at resend.com — 3,000 emails/month free tier.
 * Add RESEND_API_KEY to your Vercel environment variables.
 */

const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = "My HVAC/R Tool <hello@myhvacrtool.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.myhvacrtool.com";

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — email not sent");
    return false;
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

// ─── Base email template ──────────────────────────────────────
function baseTemplate(content: string, preheader: string = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My HVAC/R Tool</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>` : ""}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0c1a2e 0%,#0f2440 100%);padding:28px 32px;text-align:center">
        <div style="font-size:24px;font-weight:800;letter-spacing:3px;color:#f97316">MY HVAC/R TOOL</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:2px;text-transform:uppercase">Field Diagnostic Platform</div>
      </td></tr>

      <!-- Content -->
      <tr><td style="padding:32px">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center">
        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8">My HVAC/R Tool · The field diagnostic platform built for real techs</p>
        <p style="margin:0;font-size:11px;color:#cbd5e1">
          <a href="${APP_URL}" style="color:#94a3b8">Open App</a> &nbsp;·&nbsp;
          <a href="https://myhvacrtool.com/pricing" style="color:#94a3b8">Pricing</a> &nbsp;·&nbsp;
          <a href="mailto:support@myhvacrtool.com" style="color:#94a3b8">Support</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Email 1: Welcome (sent immediately on signup) ────────────
export async function sendWelcomeEmail(params: {
  to: string;
  firstName: string;
}): Promise<boolean> {
  const { to, firstName } = params;
  const name = firstName || "Tech";

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f1f3d">Welcome, ${name}! 🔧</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#64748b;line-height:1.6">Your My HVAC/R Tool account is ready. Here's what's waiting for you:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${[
        { icon: "🤖", title: "AI Diagnosis Assistant", desc: "Describe symptoms, enter pressures — get ranked probable causes instantly." },
        { icon: "📊", title: "PT Charts + SH/SC Calculator", desc: "Every major refrigerant. Works offline. Superheat and subcooling with plain-English diagnosis." },
        { icon: "🧪", title: "Refrigerant Log", desc: "EPA 608 compliant tracking. Log every pound, export CSV anytime." },
        { icon: "📄", title: "Customer Reports", desc: "One tap generates a professional service report in plain English." },
      ].map(f => `
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="36" style="font-size:22px;vertical-align:top;padding-top:2px">${f.icon}</td>
            <td style="padding-left:10px">
              <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:2px">${f.title}</div>
              <div style="font-size:13px;color:#64748b;line-height:1.4">${f.desc}</div>
            </td>
          </tr>
        </table>
      </td></tr>`).join("")}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td align="center">
        <a href="${APP_URL}/hvac_units" style="display:inline-block;padding:14px 32px;background:#f97316;color:#fff;border-radius:10px;font-weight:800;font-size:16px;text-decoration:none;box-shadow:0 4px 16px rgba(249,115,22,0.4)">
          🔧 Open My HVAC/R Tool
        </a>
      </td></tr>
    </table>

    <div style="background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#374151">Your free plan includes:</p>
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6">PT chart lookup (3 refrigerants) · Delta-T + Ohm's Law calculators · 3 AI queries per day · 1 saved unit</p>
      <p style="margin:8px 0 0;font-size:13px;color:#64748b">Upgrade to Solo ($19/mo) for unlimited everything. <a href="https://myhvacrtool.com/pricing" style="color:#f97316;font-weight:700">See pricing →</a></p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Welcome to My HVAC/R Tool, ${name} 🔧`,
    html: baseTemplate(content, `Your account is ready — AI diagnosis, PT charts, and more await.`),
  });
}

// ─── Email 2: Day 2 — Feature spotlight ──────────────────────
export async function sendDay2Email(params: {
  to: string;
  firstName: string;
}): Promise<boolean> {
  const { to, firstName } = params;
  const name = firstName || "Tech";

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f1f3d">Have you tried the AI assistant yet?</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#64748b;line-height:1.6">Hey ${name} — most techs who try the AI diagnosis tool on their first real job never go back to Googling symptoms.</p>

    <div style="background:#0f1f3d;border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#f97316;text-transform:uppercase;letter-spacing:2px">How it works</p>
      ${[
        "Tell it your equipment type and refrigerant",
        "Enter your pressures, temps, or describe symptoms",
        "Get ranked causes with confidence % and next tests",
        "Ask follow-up questions like texting a master tech",
      ].map((s, i) => `<div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start"><span style="background:#f97316;color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;margin-top:1px">${i + 1}</span><span style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.5">${s}</span></div>`).join("")}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr><td align="center">
        <a href="${APP_URL}/hvac_units#ai-chat" style="display:inline-block;padding:13px 28px;background:#f97316;color:#fff;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none">
          🤖 Try the AI Assistant
        </a>
      </td></tr>
    </table>

    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;font-style:italic">Free plan includes 3 AI queries per day. Upgrade to Solo for unlimited. <a href="https://myhvacrtool.com/pricing" style="color:#f97316">See plans →</a></p>
  `;

  return sendEmail({
    to,
    subject: "Have you tried the AI diagnosis tool yet?",
    html: baseTemplate(content, "Most techs who try it on their first real job never go back."),
  });
}

// ─── Email 3: Day 5 — Upgrade push ───────────────────────────
export async function sendDay5Email(params: {
  to: string;
  firstName: string;
}): Promise<boolean> {
  const { to, firstName } = params;
  const name = firstName || "Tech";

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f1f3d">${name}, unlock the full toolset</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#64748b;line-height:1.6">You've been using My HVAC/R Tool for a few days. Here's what you're missing on the free plan:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      ${[
        { locked: true, text: "Superheat / Subcooling calculator with TXV vs fixed orifice targeting" },
        { locked: true, text: "All refrigerant PT charts — R-32, R-454B, R-448A, R-449A, and more" },
        { locked: true, text: "Unlimited AI diagnosis queries (free = 3/day)" },
        { locked: true, text: "Refrigerant log with EPA 608 compliant CSV export" },
        { locked: true, text: "Customer service reports — AI-written, one tap, text to customer" },
        { locked: true, text: "System health score — 0-100 per unit, tracks failure trends" },
        { locked: false, text: "Everything above is included in Solo at $19/mo" },
      ].map(f => `
      <tr><td style="padding:8px 0;border-bottom:1px solid #f8fafc">
        <span style="margin-right:8px;font-size:14px">${f.locked ? "🔒" : "✅"}</span>
        <span style="font-size:13px;color:${f.locked ? "#374151" : "#16a34a"};font-weight:${f.locked ? "400" : "700"}">${f.text}</span>
      </td></tr>`).join("")}
    </table>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#c2410c">Solo Tech — $19/mo</p>
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5">One callback avoided pays for 6 months. One billing dispute prevented pays for the year. Cancel anytime.</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://myhvacrtool.com/pricing" style="display:inline-block;padding:13px 28px;background:#f97316;color:#fff;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none;box-shadow:0 4px 16px rgba(249,115,22,0.3)">
          🔧 Upgrade to Solo — $19/mo
        </a>
      </td></tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: "You're missing these features, " + name,
    html: baseTemplate(content, "Unlock superheat calculator, unlimited AI, refrigerant log, and more."),
  });
}

// ─── Email 4: Day 12 — Social proof / last push ───────────────
export async function sendDay12Email(params: {
  to: string;
  firstName: string;
}): Promise<boolean> {
  const { to, firstName } = params;
  const name = firstName || "Tech";

  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f1f3d">Still on the free plan, ${name}?</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#64748b;line-height:1.6">No pressure — but here's what techs on the paid plan are using every day:</p>

    <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:20px;border-left:3px solid #f97316">
      <p style="margin:0 0 10px;font-size:15px;color:#1e293b;line-height:1.6;font-style:italic">"Every calculator I use on the job. Every chart I look up. Every time I'd call tech support. That's all in one app now. And it's smarter than any of those things."</p>
      <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px">— HVAC/R Field Technician</p>
    </div>

    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6">The Solo plan at <strong>$19/mo</strong> gives you unlimited AI diagnosis, all refrigerant PT charts, SH/SC calculator, EPA-compliant refrigerant log, customer reports, and system health score.</p>

    <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6">That's less than one hour of labor. <strong>One callback avoided pays for 6 months.</strong></p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
      <tr><td align="center">
        <a href="https://myhvacrtool.com/pricing" style="display:inline-block;padding:13px 28px;background:#f97316;color:#fff;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none;box-shadow:0 4px 16px rgba(249,115,22,0.3)">
          See Plans & Upgrade
        </a>
      </td></tr>
    </table>

    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">Cancel anytime. No long-term contracts.</p>
  `;

  return sendEmail({
    to,
    subject: "Still on free? Here's what you're missing",
    html: baseTemplate(content, "Techs on paid are using this every single day."),
  });
}