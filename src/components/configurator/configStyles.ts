import type { CSSProperties } from "react";

export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#4b5563",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 6,
};

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#ffffff",
  boxSizing: "border-box",
};

export const secondaryButtonStyle: CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

export const primaryButtonStyle = (buttonColor: string): CSSProperties => ({
  background: buttonColor,
  color: "#ffffff",
  border: `1px solid ${buttonColor}`,
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
});

export const cardStyle: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 24,
};