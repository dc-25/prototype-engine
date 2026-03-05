import type { FieldConfig } from "../models/types";
import type { CSSProperties } from "react";

type Props = {
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (fieldId: string, value: unknown) => void;
};

export default function FieldRenderer({ field, value, error, onChange }: Props) {
  const baseInputStyle: CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: error ? "1px solid #dc2626" : "1px solid #d1d5db",
    fontSize: 14,
    background: "#ffffff",
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#4b5563",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const helpStyle: CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    color: "#dc2626",
  };

  const id = `field-${field.id}`;

  return (
    <div style={{ width: "100%" }}>
      <label htmlFor={id} style={labelStyle}>
        {field.label}
        {field.required ? " *" : ""}
      </label>

      {field.type === "text" && (
        <input
          id={id}
          type="text"
          style={baseInputStyle}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}

      {field.type === "number" && (
        <input
          id={id}
          type="number"
          style={baseInputStyle}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}

      {field.type === "date" && (
        <input
          id={id}
          type="date"
          style={baseInputStyle}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}

      {field.type === "multiline" && (
        <textarea
          id={id}
          style={{ ...baseInputStyle, minHeight: 110, resize: "vertical" }}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}

      {field.type === "choice" && (
        <select
          id={id}
          style={baseInputStyle}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.id, e.target.value)}
        >
          <option value="">Select</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.type === "boolean" && (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(field.id, e.target.checked)}
          />
          <span style={{ fontSize: 14, color: "#111827" }}>Yes</span>
        </div>
      )}

      {error && <div style={helpStyle}>{error}</div>}
    </div>
  );
}