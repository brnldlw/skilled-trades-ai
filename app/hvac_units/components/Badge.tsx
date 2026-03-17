export function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        marginLeft: 8,
        padding: "2px 8px",
        borderRadius: 999,
        background: "#f2f2f2",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {text}
    </span>
  );
}