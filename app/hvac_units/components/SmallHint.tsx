import type { CSSProperties, ReactNode } from "react";

export function SmallHint({
  children,
  style,
  type = "info",
}: {
  children: ReactNode;
  style?: CSSProperties;
  type?: "info" | "warning" | "success" | "error";
}) {
  const typeStyles: Record<string, CSSProperties> = {
    info:    { background: "transparent", color: "#666", border: "none" },
    warning: { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde047", borderRadius: 8, padding: "8px 12px" },
    success: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 12px" },
    error:   { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px" },
  };

  return (
    <div
      style={{
        fontSize: 13,
        lineHeight: 1.5,
        ...typeStyles[type],
        ...style,
      }}
    >
      {children}
    </div>
  );
}