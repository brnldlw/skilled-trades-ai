export const metadata = {
  title: "Terms of Service — My HVAC/R Tool",
  description: "Terms of Service for My HVAC/R Tool.",
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
  callout: {
    background: "rgba(220,38,38,0.08)",
    border: "1px solid rgba(220,38,38,0.3)",
    borderRadius: 10,
    padding: "16px 18px",
    marginBottom: 12,
    color: "#fca5a5",
  },
  back: { textAlign: "center" as const, marginTop: 28, fontSize: 13 },
};

export default function TermsOfServicePage() {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <a href="/" style={styles.brand}>MY HVAC/R TOOL</a>
      </div>

      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.h1}>Terms of Service</h1>
          <div style={styles.updated}>Last updated: {LAST_UPDATED}</div>

          <p style={styles.p}>
            These Terms of Service (&ldquo;<strong style={styles.strong}>Terms</strong>&rdquo;) govern your access to and use of
            My HVAC/R Tool (&ldquo;<strong style={styles.strong}>we</strong>,&rdquo; &ldquo;<strong style={styles.strong}>us</strong>,&rdquo;
            or &ldquo;<strong style={styles.strong}>our</strong>&rdquo;), a web-based diagnostic and field-service platform for HVAC/R
            technicians (the &ldquo;<strong style={styles.strong}>Service</strong>&rdquo;). By creating an account or using the Service, you
            agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>

          <h2 style={styles.h2}>1. Eligibility and Accounts</h2>
          <p style={styles.p}>The Service is intended for use by working or licensed HVAC/R technicians and the businesses that employ them,
            and is not directed to consumers or minors. You must be at least 18 years old and able to form a binding contract to create an
            account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under
            your account. Notify us immediately at{" "}
            <a href="mailto:support@myhvacrtool.com" style={styles.a}>support@myhvacrtool.com</a> if you suspect unauthorized use.</p>

          <h2 style={styles.h2}>2. The Service</h2>
          <p style={styles.p}>The Service provides tools including equipment and job record-keeping, an AI diagnosis assistant, PT-chart and
            other field calculators, photo- and nameplate-reading tools, a replacement quote estimator, reference libraries, and related
            features. Some features are available on a free tier; others require a paid subscription as described in Section 5.</p>

          <div style={styles.callout}>
            <strong style={{ color: "#fca5a5" }}>Important — read this section.</strong> HVAC/R work involves refrigerants, electrical
            systems, combustible gas, and pressurized components that can cause injury, property damage, or death if handled incorrectly.
          </div>

          <h2 style={styles.h2}>3. AI-Generated Content — No Warranty, Professional Judgment Required</h2>
          <p style={styles.p}>The AI diagnosis assistant, photo/gauge/nameplate readers, guided flowcharts, replacement quote estimator, and
            any other AI- or rule-generated suggestions, readings, or reports (&ldquo;<strong style={styles.strong}>AI Output</strong>&rdquo;)
            are provided for informational and decision-support purposes only. AI Output may be incomplete, inaccurate, or inapplicable to
            your specific equipment or situation. AI Output is <strong style={styles.strong}>not</strong> a substitute for your own training,
            licensure, professional judgment, the equipment manufacturer&rsquo;s specifications and instructions, or applicable building,
            electrical, mechanical, and refrigerant-handling codes and regulations (including EPA Section 608 requirements).</p>
          <p style={styles.p}>You are solely responsible for evaluating, verifying, and deciding whether and how to act on any AI Output, and
            for all diagnostic and repair decisions and work you perform. Never rely on AI Output as the sole basis for a safety-critical
            decision. To the fullest extent permitted by law, we disclaim all liability for injury, property damage, callback, code
            violation, or other loss arising from reliance on AI Output or any other content generated by the Service.</p>

          <h2 style={styles.h2}>4. Your Content and Data</h2>
          <p style={styles.p}>You retain ownership of the job records, customer information, photos, and other content you submit to the
            Service (&ldquo;<strong style={styles.strong}>Your Content</strong>&rdquo;). You grant us a limited, non-exclusive license to
            host, store, process, and transmit Your Content (including to the third-party AI providers described in our{" "}
            <a href="/privacy" style={styles.a}>Privacy Policy</a>) solely to provide and improve the Service to you. You represent that you
            have the right to submit Your Content, including any customer or third-party information, and that doing so does not violate any
            law or any rights of a third party.</p>

          <h2 style={styles.h2}>5. Subscriptions and Billing</h2>
          <p style={styles.p}>Certain features require a paid subscription (e.g., Solo, Shop 5, Shop 10 tiers) or one-time/metered add-ons
            (e.g., the Replacement Quote Estimator). Paid plans are billed in advance on a recurring basis through our payment processor,
            Stripe, until canceled. You authorize us and Stripe to charge your payment method for all applicable fees. Prices are shown at
            time of purchase and may change with notice for future billing periods. You may cancel a subscription at any time from your
            account; cancellation takes effect at the end of the then-current billing period, and except where required by law, fees already
            paid are non-refundable.</p>

          <h2 style={styles.h2}>6. Acceptable Use</h2>
          <p style={styles.p}>You agree not to:</p>
          <ul style={styles.ul}>
            <li style={styles.li}>Use the Service for any unlawful purpose or in violation of these Terms</li>
            <li style={styles.li}>Attempt to access another user&rsquo;s or company&rsquo;s account or data without authorization</li>
            <li style={styles.li}>Interfere with, disrupt, or attempt to circumvent rate limits, authentication, or security measures of the Service or its API endpoints</li>
            <li style={styles.li}>Reverse engineer, scrape, or use automated means to extract data or AI Output at scale outside normal use of the app</li>
            <li style={styles.li}>Upload content that is unlawful, infringing, or that you lack the right to share</li>
            <li style={styles.li}>Resell or provide the Service to third parties without our written consent, outside of your own company&rsquo;s authorized team members</li>
          </ul>

          <h2 style={styles.h2}>7. Third-Party Links and Services</h2>
          <p style={styles.p}>The Service links to third-party parts suppliers, mapping services, and other external sites for your
            convenience (e.g., parts lookup and supply-house locator features). We do not control and are not responsible for the content,
            pricing, availability, or practices of those third-party sites.</p>

          <h2 style={styles.h2}>8. Intellectual Property</h2>
          <p style={styles.p}>The Service, including its software, design, branding, and all content we provide (excluding Your Content and
            AI Output derived from it), is owned by us or our licensors and protected by intellectual property laws. We grant you a limited,
            non-exclusive, non-transferable license to use the Service for your own business purposes, subject to these Terms.</p>

          <h2 style={styles.h2}>9. Disclaimer of Warranties</h2>
          <p style={styles.p}>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any kind,
            whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, title,
            and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or that AI Output will be accurate or
            complete.</p>

          <h2 style={styles.h2}>10. Limitation of Liability</h2>
          <p style={styles.p}>To the fullest extent permitted by law, we and our officers, employees, and service providers will not be
            liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or
            goodwill, arising from or related to your use of the Service, even if advised of the possibility of such damages. Our total
            aggregate liability for any claim arising out of or relating to the Service will not exceed the greater of (a) the amount you
            paid us in the twelve months preceding the claim, or (b) one hundred dollars ($100).</p>

          <h2 style={styles.h2}>11. Indemnification</h2>
          <p style={styles.p}>You agree to indemnify and hold us harmless from any claims, damages, losses, and expenses (including
            reasonable attorneys&rsquo; fees) arising from your use of the Service, Your Content, your violation of these Terms, or your
            violation of any law or third-party right, including any claim arising from diagnostic or repair work you perform.</p>

          <h2 style={styles.h2}>12. Termination</h2>
          <p style={styles.p}>You may stop using the Service and close your account at any time by contacting{" "}
            <a href="mailto:support@myhvacrtool.com" style={styles.a}>support@myhvacrtool.com</a>. We may suspend or terminate your access to
            the Service if you violate these Terms, misuse the Service, or for other legitimate business reasons, with notice where
            practicable.</p>

          <h2 style={styles.h2}>13. Changes to the Service or These Terms</h2>
          <p style={styles.p}>We may modify the Service or these Terms from time to time. If we make material changes to these Terms, we
            will update the &ldquo;Last updated&rdquo; date above and, where appropriate, notify you by email or in-app notice. Continued use
            of the Service after changes take effect constitutes acceptance of the revised Terms.</p>

          <h2 style={styles.h2}>14. Governing Law</h2>
          <p style={styles.p}>These Terms are governed by the laws of the State of Indiana, without regard to its conflict-of-laws
            principles, unless otherwise required by applicable law.</p>

          <h2 style={styles.h2}>15. Contact Us</h2>
          <p style={styles.p}>Questions about these Terms can be sent to{" "}
            <a href="mailto:support@myhvacrtool.com" style={styles.a}>support@myhvacrtool.com</a>.</p>
        </div>

        <div style={styles.back}>
          <a href="/" style={{ color: "#334155", textDecoration: "none" }}>← Back to myhvacrtool.com</a>
        </div>
      </div>
    </div>
  );
}
