export const metadata = {
  title: "Privacy Policy — My HVAC/R Tool",
  description: "Privacy Policy for My HVAC/R Tool.",
};

const LAST_UPDATED = "July 29, 2026";

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0c1a2e 0%, #0f2440 50%, #0c1a2e 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#cbd5e1",
    padding: "0 0 64px",
  } as React.CSSProperties,
  header: {
    textAlign: "center" as const,
    padding: "40px 16px 24px",
  },
  brand: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 3,
    color: "#f97316",
    textDecoration: "none",
    fontFamily: "system-ui",
  },
  container: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "0 20px",
  },
  card: {
    background: "rgba(15,36,64,0.8)",
    border: "1px solid rgba(249,115,22,0.15)",
    borderRadius: 16,
    padding: "36px 32px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
    lineHeight: 1.7,
    fontSize: 14.5,
  },
  h1: { fontSize: 26, fontWeight: 800, color: "#f8fafc", marginBottom: 6 },
  updated: { fontSize: 12, color: "#64748b", marginBottom: 28 },
  h2: { fontSize: 17, fontWeight: 800, color: "#f8fafc", marginTop: 30, marginBottom: 10 },
  p: { marginBottom: 12, color: "#cbd5e1" },
  ul: { margin: "0 0 12px 0", paddingLeft: 20, color: "#cbd5e1" },
  li: { marginBottom: 6 },
  a: { color: "#f97316", textDecoration: "none" },
  strong: { color: "#f8fafc" },
  back: { textAlign: "center" as const, marginTop: 28, fontSize: 13 },
};

export default function PrivacyPolicyPage() {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <a href="/" style={styles.brand}>MY HVAC/R TOOL</a>
      </div>

      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Privacy Policy</h1>
          <div style={styles.updated}>Last updated: {LAST_UPDATED}</div>

          <p style={styles.p}>
            This Privacy Policy explains how My HVAC/R Tool (&ldquo;<strong style={styles.strong}>we</strong>,&rdquo;
            &ldquo;<strong style={styles.strong}>us</strong>,&rdquo; or &ldquo;<strong style={styles.strong}>our</strong>&rdquo;)
            collects, uses, and shares information when you use our web application and related services
            (the &ldquo;<strong style={styles.strong}>Service</strong>&rdquo;), available at myhvacrtool.com and app.myhvacrtool.com.
            The Service is a professional field-diagnostic tool for HVAC/R (heating, ventilation, air conditioning, and
            refrigeration) technicians. By using the Service, you agree to the collection and use of information as
            described in this policy.
          </p>

          <h2 style={styles.h2}>1. Information We Collect</h2>
          <p style={styles.p}><strong style={styles.strong}>Account information.</strong> When you create an account, we collect your name, email address,
            password (stored securely and encrypted by our authentication provider), and optionally your company/shop name.</p>
          <p style={styles.p}><strong style={styles.strong}>Job and equipment data you enter.</strong> The Service lets you record information about the equipment you
            service and the calls you run, including customer names, site names and addresses, unit identifiers, manufacturer/model/serial
            numbers, refrigerant type, reported symptoms, diagnostic readings, causes, repairs performed, parts replaced, and outcome notes.
            This data is entered by you or your team and is stored so you can look up service history for a unit later.</p>
          <p style={styles.p}><strong style={styles.strong}>Photos and images.</strong> You may upload photos of nameplates, gauge readings, wiring, components, or job
            sites. These are used to auto-fill equipment data, generate AI diagnostic suggestions, and (if you choose to save them) attach to
            a service record.</p>
          <p style={styles.p}><strong style={styles.strong}>Voice input.</strong> Some fields support dictation using your device&rsquo;s or browser&rsquo;s built-in speech
            recognition. Audio is processed by your device/browser platform (e.g., your browser vendor) according to its own privacy practices
            — we do not separately record or store audio.</p>
          <p style={styles.p}><strong style={styles.strong}>Location.</strong> If you use the supply-house locator feature, your device may share your GPS coordinates or
            ZIP code with your browser to open a nearby-store search in Google Maps. This location is used only in your browser at that
            moment and is not sent to or stored on our servers.</p>
          <p style={styles.p}><strong style={styles.strong}>Payment information.</strong> If you subscribe to a paid plan, payment is processed by Stripe. We do not
            collect or store your full card number — Stripe handles that directly and shares with us only what&rsquo;s needed to manage your
            subscription (such as plan tier, billing status, and renewal dates).</p>
          <p style={styles.p}><strong style={styles.strong}>Usage and device data.</strong> Like most web services, our hosting provider automatically logs standard
            technical information such as IP address, browser type, device type, and pages visited, for security and reliability purposes.</p>

          <h2 style={styles.h2}>2. How We Use Information</h2>
          <ul style={styles.ul}>
            <li style={styles.li}>To provide, maintain, and improve the Service, including saved unit history and AI-assisted diagnosis</li>
            <li style={styles.li}>To send transactional emails (account confirmation, welcome messages, billing notices)</li>
            <li style={styles.li}>To process payments and manage subscriptions</li>
            <li style={styles.li}>To provide customer support</li>
            <li style={styles.li}>To detect, prevent, and address technical issues, fraud, or abuse</li>
            <li style={styles.li}>To comply with legal obligations</li>
          </ul>
          <p style={styles.p}>We do not sell your personal information, and we do not use your data to train third-party AI models beyond the
            processing described below.</p>

          <h2 style={styles.h2}>3. AI Processing</h2>
          <p style={styles.p}>Certain features (AI diagnosis chat, photo/nameplate/gauge analysis, replacement quote generation, video walkthrough
            analysis, generated service reports) send the relevant text or images you submit to third-party AI providers — currently
            Anthropic (Claude) and OpenAI — solely to generate the response shown to you. These providers process the data under their own
            privacy and data-use terms and, per their standard API terms, do not use API-submitted content to train their general-purpose
            models. AI-generated output is provided for informational purposes only and should always be verified against your own
            professional judgment, manufacturer specifications, and applicable codes — see our{" "}
            <a href="/terms" style={styles.a}>Terms of Service</a> for important disclaimers.</p>

          <h2 style={styles.h2}>4. Third-Party Service Providers</h2>
          <p style={styles.p}>We share information with the following categories of service providers, each of whom is contractually or
            technically limited to using it only to provide their service to us:</p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong style={styles.strong}>Supabase</strong> — authentication and database hosting for account and job data</li>
            <li style={styles.li}><strong style={styles.strong}>Vercel</strong> — application hosting and infrastructure</li>
            <li style={styles.li}><strong style={styles.strong}>Stripe</strong> — payment processing and subscription billing</li>
            <li style={styles.li}><strong style={styles.strong}>Anthropic and OpenAI</strong> — AI-generated diagnosis, photo analysis, and report content, as described above</li>
            <li style={styles.li}><strong style={styles.strong}>Resend</strong> — transactional email delivery</li>
          </ul>
          <p style={styles.p}>We may also disclose information if required by law, to protect the rights and safety of our users or the public,
            or in connection with a merger, acquisition, or sale of assets (with notice to affected users where required).</p>

          <h2 style={styles.h2}>5. Data About Your Customers</h2>
          <p style={styles.p}>If you use the Service as part of your job, you may enter information about your own customers (names, addresses,
            equipment) into your account. You are responsible for having the appropriate rights and authority to submit that information, and
            for handling it in compliance with applicable law. We act as a data processor for that information — we store and process it only
            to provide the Service to you, and do not use it for our own independent purposes.</p>

          <h2 style={styles.h2}>6. Data Retention</h2>
          <p style={styles.p}>We retain account and job data for as long as your account is active, so that your saved unit history remains
            available to you. If you close your account, we will delete or anonymize your personal data within a reasonable period, except
            where we are required to retain it for legal, tax, or billing-record purposes.</p>

          <h2 style={styles.h2}>7. Your Rights and Choices</h2>
          <p style={styles.p}>You can review and update most of your account and job information directly within the Service. To request
            access to, correction of, or deletion of your personal data, or to close your account, contact us at{" "}
            <a href="mailto:support@myhvacrtool.com" style={styles.a}>support@myhvacrtool.com</a>. Depending on where you live, you may have
            additional rights under laws such as the California Consumer Privacy Act (CCPA) or similar state privacy laws, including the
            right to know what personal information we hold about you and to request its deletion. We do not sell personal information as
            defined under the CCPA.</p>

          <h2 style={styles.h2}>8. Cookies and Local Storage</h2>
          <p style={styles.p}>We use essential cookies and browser local storage to keep you signed in, remember your language preference, and
            support offline caching of the app shell for field use. We do not use third-party advertising or cross-site tracking cookies.</p>

          <h2 style={styles.h2}>9. Children&rsquo;s Privacy</h2>
          <p style={styles.p}>The Service is a professional tool intended for licensed and working HVAC/R technicians and businesses. It is not
            directed to, and we do not knowingly collect personal information from, children under 16.</p>

          <h2 style={styles.h2}>10. Data Security</h2>
          <p style={styles.p}>We use industry-standard technical and organizational measures — including encryption in transit, authenticated
            access, and role-based permissions for company/team data — to protect your information. No method of transmission or storage is
            100% secure, and we cannot guarantee absolute security.</p>

          <h2 style={styles.h2}>11. Changes to This Policy</h2>
          <p style={styles.p}>We may update this Privacy Policy from time to time. If we make material changes, we will update the &ldquo;Last
            updated&rdquo; date above and, where appropriate, notify you by email or in-app notice.</p>

          <h2 style={styles.h2}>12. Contact Us</h2>
          <p style={styles.p}>Questions about this Privacy Policy or your data can be sent to{" "}
            <a href="mailto:support@myhvacrtool.com" style={styles.a}>support@myhvacrtool.com</a>.</p>
        </div>

        <div style={styles.back}>
          <a href="/" style={{ color: "#334155", textDecoration: "none" }}>← Back to myhvacrtool.com</a>
        </div>
      </div>
    </div>
  );
}
