import type { ReactNode } from "react";

export function SectionCard({
  title,
  right,
  children,
  id,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 14,
        background: "#fff",
        scrollMarginTop: 64,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}