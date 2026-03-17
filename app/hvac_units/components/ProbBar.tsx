export function ProbBar({ pct }: { pct: number }) {
  const safe = Math.max(0, Math.min(100, pct || 0));

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 8, background: "#eee", borderRadius: 999 }}>
        <div
          style={{
            width: `${safe}%`,
            height: 8,
            background: "#111",
            borderRadius: 999,
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>
        {safe}% confidence
      </div>
    </div>
  );
}