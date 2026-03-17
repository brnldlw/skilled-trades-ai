import type { CSSProperties, ReactNode } from "react";

export function SmallHint({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        fontSize: 12,
        color: "#666",
        lineHeight: 1.4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}