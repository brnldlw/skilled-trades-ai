import type { MouseEventHandler, ReactNode } from "react";

export function PillButton({
  text,
  onClick,
  active,
  disabled,
  icon,
  fullWidth,
  size = "md",
}: {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeStyles = {
    sm: { padding: "6px 12px", fontSize: 12, minHeight: 36 },
    md: { padding: "10px 16px", fontSize: 14, minHeight: 44 },
    lg: { padding: "12px 20px", fontSize: 15, minHeight: 48 },
  };

  const sz = sizeStyles[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="pill-btn"
      style={{
        padding: sz.padding,
        minHeight: sz.minHeight,
        fontSize: sz.fontSize,
        borderRadius: 999,
        border: "1px solid #ddd",
        background: active ? "#111" : "#fff",
        color: active ? "#fff" : "#111",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "inherit",
        width: fullWidth ? "100%" : undefined,
        justifyContent: fullWidth ? "center" : undefined,
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      {icon && <span style={{ fontSize: sz.fontSize + 2 }}>{icon}</span>}
      {text}
    </button>
  );
}