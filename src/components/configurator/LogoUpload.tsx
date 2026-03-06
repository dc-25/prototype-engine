import type { CSSProperties } from "react";
import { labelStyle, secondaryButtonStyle } from "./configStyles";

type Props = {
  label: string;
  value: string; // data URL
  onChange: (dataUrl: string) => void;
};

const boxStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: 12,
  background: "#ffffff",
};

export default function LogoUpload({ label, value, onChange }: Props) {
  const hasLogo = Boolean(value);

  return (
    <div>
      <label style={labelStyle}>{label}</label>

      <div style={boxStyle}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = typeof reader.result === "string" ? reader.result : "";
              if (!dataUrl) return;
              onChange(dataUrl);
            };
            reader.readAsDataURL(file);
          }}
          style={{ width: "100%" }}
        />

        {hasLogo && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 10,
                background: "#f9fafb",
              }}
            >
              <img
                src={value}
                alt="Logo preview"
                style={{ height: 36, width: "auto", display: "block" }}
              />
            </div>

            <button type="button" onClick={() => onChange("")} style={secondaryButtonStyle}>
              Remove logo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}