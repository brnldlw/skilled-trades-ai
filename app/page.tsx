export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Skilled Trades AI</h1>

      <p style={{ marginTop: 8 }}>
        Open the HVAC tool below.
      </p>

      <a
        href="/hvac_units"
        style={{
          display: "inline-block",
          marginTop: 12,
          padding: "10px 14px",
          fontWeight: 900,
          border: "1px solid #ddd",
          borderRadius: 10,
          textDecoration: "none",
          color: "#111",
          background: "#fafafa",
        }}
      >
        Let&apos;s Diagnose
      </a>
    </main>
  );
}