export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827" }}></h1>
      <p style={{ marginTop: 8 }}>
        Open the HVAC tool here: <a href="/hvac_units">/hvac_units</a>
      </p>
    </main>
  );
}