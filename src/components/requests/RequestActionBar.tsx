import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const actionButtonBaseStyle: CSSProperties = {
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

export const secondaryButtonStyle: CSSProperties = {
  ...actionButtonBaseStyle,
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
};

export function getPrimaryButtonStyle(
  color: string,
  options?: { disabled?: boolean; disabledColor?: string }
): CSSProperties {
  const isDisabled = options?.disabled ?? false;
  const disabledColor = options?.disabledColor ?? "#9ca3af";
  const activeColor = isDisabled ? disabledColor : color;

  return {
    ...actionButtonBaseStyle,
    background: activeColor,
    color: "#ffffff",
    border: `1px solid ${activeColor}`,
    cursor: isDisabled ? "not-allowed" : "pointer",
  };
}

export default function RequestActionBar({ children }: Props) {
  return (
    <div
      style={{
        marginTop: 28,
        paddingTop: 20,
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {children}
    </div>
  );
}