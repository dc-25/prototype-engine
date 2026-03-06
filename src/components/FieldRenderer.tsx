import { useEffect, useRef } from "react";
import type { FieldConfig } from "../models/types";
import type { CSSProperties } from "react";

type Props = {
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (fieldId: string, value: unknown) => void;
};

type ImageValue = {
  fileName: string;
  dataUrl: string;
};

function isImageValue(value: unknown): value is ImageValue {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.fileName === "string" && typeof v.dataUrl === "string";
}

// Minimal sanitization for demo safety (blocks obvious script injection)
function sanitizeHtmlForDisplay(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

export default function FieldRenderer({ field, value, error, onChange }: Props) {
  const isFullWidth = (field.layout ?? "half") === "full";
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

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
  const imageValue = isImageValue(value) ? value : null;

  const multilineMinHeight = isFullWidth ? 220 : 110;
  const richTextMinHeight = isFullWidth ? 280 : 180;

  // Keep editor DOM in sync when value changes externally (load draft, open record, etc.)
  useEffect(() => {
    if (field.type !== "richtext") return;
    const el = editorRef.current;
    if (!el) return;
    const html = sanitizeHtmlForDisplay(String(value ?? ""));
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [field.type, value]);

  function exec(cmd: string, arg?: string) {
    // eslint-disable-next-line deprecation/deprecation
    document.execCommand(cmd, false, arg);
    const el = editorRef.current;
    if (!el) return;
    onChange(field.id, el.innerHTML);
  }

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
          style={{
            ...baseInputStyle,
            minHeight: multilineMinHeight,
            resize: "vertical",
            lineHeight: 1.5,
          }}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}

      {field.type === "richtext" && (
        <div
          style={{
            border: error ? "1px solid #dc2626" : "1px solid #d1d5db",
            borderRadius: 10,
            overflow: "hidden",
            background: "#ffffff",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              borderBottom: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            {/* Row 1: Text style + font + size */}
            <div style={{ display: "flex", gap: 4, padding: "6px 8px", flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
              {/* Font family */}
              <select
                onMouseDown={(e) => e.preventDefault()}
                onChange={(e) => { exec("fontName", e.target.value); (e.target as HTMLSelectElement).value = ""; }}
                defaultValue=""
                style={toolbarSelectStyle}
              >
                <option value="" disabled>Font</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
              </select>

              {/* Font size */}
              <select
                onMouseDown={(e) => e.preventDefault()}
                onChange={(e) => { exec("fontSize", e.target.value); (e.target as HTMLSelectElement).value = ""; }}
                defaultValue=""
                style={toolbarSelectStyle}
              >
                <option value="" disabled>Size</option>
                <option value="1">10px</option>
                <option value="2">13px</option>
                <option value="3">16px</option>
                <option value="4">18px</option>
                <option value="5">24px</option>
                <option value="6">32px</option>
                <option value="7">48px</option>
              </select>

              <div style={toolbarDividerStyle} />

              {/* Bold / Italic / Underline / Strikethrough */}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} style={toolbarButtonStyle} title="Bold">
                <strong>B</strong>
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} style={toolbarButtonStyle} title="Italic">
                <em>I</em>
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} style={toolbarButtonStyle} title="Underline">
                <span style={{ textDecoration: "underline" }}>U</span>
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("strikeThrough"); }} style={toolbarButtonStyle} title="Strikethrough">
                <span style={{ textDecoration: "line-through" }}>S</span>
              </button>

              <div style={toolbarDividerStyle} />

              {/* Text colour */}
              <label title="Text color" style={{ ...toolbarButtonStyle, padding: "0 4px", display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>A</span>
                <input
                  type="color"
                  defaultValue="#000000"
                  style={{ width: 18, height: 18, border: "none", padding: 0, cursor: "pointer", background: "none" }}
                  onInput={(e) => exec("foreColor", (e.target as HTMLInputElement).value)}
                />
              </label>

              {/* Highlight colour */}
              <label title="Highlight color" style={{ ...toolbarButtonStyle, padding: "0 4px", display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
                <span style={{ fontSize: 13, fontWeight: 700, background: "#fef08a", padding: "0 2px" }}>H</span>
                <input
                  type="color"
                  defaultValue="#fef08a"
                  style={{ width: 18, height: 18, border: "none", padding: 0, cursor: "pointer", background: "none" }}
                  onInput={(e) => exec("hiliteColor", (e.target as HTMLInputElement).value)}
                />
              </label>
            </div>

            {/* Row 2: Alignment + lists + link + image */}
            <div style={{ display: "flex", gap: 4, padding: "6px 8px", flexWrap: "wrap", alignItems: "center" }}>
              {/* Alignment */}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("justifyLeft"); }} style={toolbarButtonStyle} title="Align left">
                &#8676;
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("justifyCenter"); }} style={toolbarButtonStyle} title="Align center">
                &#8652;
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("justifyRight"); }} style={toolbarButtonStyle} title="Align right">
                &#8677;
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("justifyFull"); }} style={toolbarButtonStyle} title="Justify">
                &#8801;
              </button>

              <div style={toolbarDividerStyle} />

              {/* Lists */}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }} style={toolbarButtonStyle} title="Bullet list">
                • List
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }} style={toolbarButtonStyle} title="Numbered list">
                1. List
              </button>

              <div style={toolbarDividerStyle} />

              {/* Indent */}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("indent"); }} style={toolbarButtonStyle} title="Indent">
                →
              </button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("outdent"); }} style={toolbarButtonStyle} title="Outdent">
                ←
              </button>

              <div style={toolbarDividerStyle} />

              {/* Link */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); }}
                onClick={() => {
                  const url = window.prompt("Link URL (https://...)");
                  if (!url) return;
                  exec("createLink", url);
                }}
                style={toolbarButtonStyle}
                title="Insert link"
              >
                🔗 Link
              </button>

              {/* Insert image */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => imageInputRef.current?.click()}
                style={toolbarButtonStyle}
                title="Insert image"
              >
                🖼 Image
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = typeof reader.result === "string" ? reader.result : "";
                    if (!dataUrl) return;
                    editorRef.current?.focus();
                    exec("insertImage", dataUrl);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />

              <div style={toolbarDividerStyle} />

              {/* Clear formatting */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}
                style={{ ...toolbarButtonStyle, color: "#6b7280" }}
                title="Clear formatting"
              >
                ✕ Clear
              </button>
            </div>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            role="textbox"
            aria-multiline="true"
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
              const el = editorRef.current;
              if (!el) return;
              onChange(field.id, el.innerHTML);
            }}
            style={{
              padding: "10px 12px",
              minHeight: richTextMinHeight,
              outline: "none",
              fontSize: 14,
              lineHeight: 1.6,
              overflow: "auto",
            }}
          />
        </div>
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

      {field.type === "image" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            id={id}
            type="file"
            accept="image/*"
            style={baseInputStyle}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                onChange(field.id, "");
                return;
              }

              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = typeof reader.result === "string" ? reader.result : "";
                if (!dataUrl) return;
                onChange(field.id, { fileName: file.name, dataUrl });
              };
              reader.readAsDataURL(file);
            }}
          />

          {imageValue && (
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Selected:{" "}
              <span style={{ color: "#111827", fontWeight: 600 }}>{imageValue.fileName}</span>
            </div>
          )}
        </div>
      )}

      {error && <div style={helpStyle}>{error}</div>}
    </div>
  );
}

const toolbarButtonStyle: CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  padding: "5px 9px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  lineHeight: 1.2,
  whiteSpace: "nowrap" as const,
};

const toolbarSelectStyle: CSSProperties = {
  padding: "5px 6px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 13,
  background: "#ffffff",
  cursor: "pointer",
  color: "#111827",
};

const toolbarDividerStyle: CSSProperties = {
  width: 1,
  height: 20,
  background: "#d1d5db",
  margin: "0 2px",
  flexShrink: 0,
};