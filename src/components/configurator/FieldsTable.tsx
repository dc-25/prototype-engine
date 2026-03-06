import type { CSSProperties } from "react";
import type { FieldLayout, FieldType } from "../../models/types";
import type { DraftFieldRow } from "../../utils/configBuilder";

type Props = {
  rows: DraftFieldRow[];
  onChange: (next: DraftFieldRow[]) => void;
};

const secondaryButtonStyle: CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const dangerButtonStyle: CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "8px 10px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const tableInputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#ffffff",
  boxSizing: "border-box",
};

const headerCellStyle: CSSProperties = {
  padding: "12px 14px",
  fontSize: 12,
  fontWeight: 700,
  color: "#4b5563",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const bodyCellStyle: CSSProperties = {
  padding: 12,
};

export default function FieldsTable({ rows, onChange }: Props) {
  function handleFieldRowChange(
    rowId: string,
    key: keyof DraftFieldRow,
    value: string | boolean
  ) {
    onChange(rows.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)));
  }

  function addFieldRow() {
    onChange([
      ...rows,
      {
        id: `row-${crypto.randomUUID()}`,
        label: "",
        type: "text",
        sectionName: rows[0]?.sectionName || "Basic Information",
        required: false,
        layout: "half",
      } as DraftFieldRow,
    ]);
  }

  function removeFieldRow(rowId: string) {
    onChange(rows.filter((row) => row.id !== rowId));
  }

  const sectionCount = Array.from(
    new Set(rows.map((row) => row.sectionName.trim()).filter(Boolean))
  ).length;

  return (
    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20, marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>Fields</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Sections are created automatically from unique section names. Max 3 sections for the
            current framework. Current unique sections: {sectionCount}
          </div>
        </div>

        <button onClick={addFieldRow} style={secondaryButtonStyle}>
          Add Field
        </button>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.35fr 0.9fr 1fr 0.7fr 0.7fr 0.5fr",
              background: "#f8fafc",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={headerCellStyle}>Field Name</div>
            <div style={headerCellStyle}>Field Type</div>
            <div style={headerCellStyle}>Section</div>
            <div style={headerCellStyle}>Required</div>
            <div style={headerCellStyle}>Layout</div>
            <div style={headerCellStyle}></div>
          </div>

          {rows.map((row) => (
            <div
              key={row.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.35fr 0.9fr 1fr 0.7fr 0.7fr 0.5fr",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div style={bodyCellStyle}>
                <input
                  value={row.label}
                  onChange={(e) => handleFieldRowChange(row.id, "label", e.target.value)}
                  style={tableInputStyle}
                />
              </div>

              <div style={bodyCellStyle}>
                <select
                  value={row.type}
                  onChange={(e) =>
                    handleFieldRowChange(row.id, "type", e.target.value as FieldType)
                  }
                  style={tableInputStyle}
                >
                  <option value="text">Text</option>
                  <option value="multiline">Multiline</option>
                  <option value="richtext">Rich Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="choice">Choice</option>
                  <option value="boolean">Boolean</option>
                  <option value="image">Image</option>
                </select>
              </div>

              <div style={bodyCellStyle}>
                <input
                  value={row.sectionName}
                  onChange={(e) => handleFieldRowChange(row.id, "sectionName", e.target.value)}
                  style={tableInputStyle}
                />
              </div>

              <div style={{ ...bodyCellStyle, display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={row.required}
                  onChange={(e) => handleFieldRowChange(row.id, "required", e.target.checked)}
                />
              </div>

              <div style={bodyCellStyle}>
                <select
                  value={(row as any).layout ?? "half"}
                  onChange={(e) =>
                    handleFieldRowChange(
                      row.id,
                      "layout" as keyof DraftFieldRow,
                      e.target.value as FieldLayout
                    )
                  }
                  style={tableInputStyle}
                >
                  <option value="quarter">Quarter</option>
                  <option value="half">Half</option>
                  <option value="full">Full</option>
                </select>
              </div>

              <div style={{ ...bodyCellStyle, display: "flex", justifyContent: "center" }}>
                <button onClick={() => removeFieldRow(row.id)} style={dangerButtonStyle}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}