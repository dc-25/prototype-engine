import type { CSSProperties } from "react";
import FieldsTable from "./FieldsTable";
import StatusEditor from "./StatusEditor";
import type { AppConfig } from "../../models/types";
import type { DraftFieldRow } from "../../utils/configBuilder";

type Props = {
  draftConfig: AppConfig;
  setDraftConfig: (next: AppConfig | ((prev: AppConfig) => AppConfig)) => void;
  draftFieldRows: DraftFieldRow[];
  setDraftFieldRows: (next: DraftFieldRow[]) => void;

  onSubmitTemplate: () => void;
  onCancel: () => void;

  markEdited: () => void;

  labelStyle: CSSProperties;
  inputStyle: CSSProperties;
  secondaryButtonStyle: CSSProperties;
  primaryButtonStyle: (buttonColor: string) => CSSProperties;
};

export default function TemplateBuilder({
  draftConfig,
  setDraftConfig,
  draftFieldRows,
  setDraftFieldRows,
  onSubmitTemplate,
  onCancel,
  markEdited,
  labelStyle,
  inputStyle,
  secondaryButtonStyle,
  primaryButtonStyle,
}: Props) {
  function handleTextChange<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    markEdited();
    setDraftConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <ConfigInput
          label="App Name"
          value={draftConfig.appName}
          onChange={(value) => handleTextChange("appName", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <ConfigInput
          label="Municipality"
          value={draftConfig.municipality}
          onChange={(value) => handleTextChange("municipality", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <ConfigInput
          label="Category"
          value={draftConfig.category}
          onChange={(value) => handleTextChange("category", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <ConfigInput
          label="Action Item"
          value={draftConfig.actionItem}
          onChange={(value) => handleTextChange("actionItem", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <div style={{ gridColumn: "1 / -1" }}>
          <ConfigTextarea
            label="Form Description"
            value={draftConfig.formDescription}
            onChange={(value) => handleTextChange("formDescription", value)}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
          />
        </div>

        <ConfigInput
          label="New Button Label"
          value={draftConfig.newButtonLabel}
          onChange={(value) => handleTextChange("newButtonLabel", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <ConfigInput
          label="Header Color"
          value={draftConfig.headerColor}
          onChange={(value) => handleTextChange("headerColor", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <ConfigInput
          label="Button Color"
          value={draftConfig.buttonColor}
          onChange={(value) => handleTextChange("buttonColor", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <ConfigInput
          label="Logo URL"
          value={draftConfig.logoUrl}
          onChange={(value) => handleTextChange("logoUrl", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <ConfigInput
          label="Pill Color"
          value={draftConfig.pillColor}
          onChange={(value) => handleTextChange("pillColor", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <ConfigInput
          label="Pill Text Color"
          value={draftConfig.pillTextColor}
          onChange={(value) => handleTextChange("pillTextColor", value)}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />
      </div>

      <StatusEditor
        statuses={draftConfig.statuses}
        onChange={(next) => {
          markEdited();
          setDraftConfig((prev) => ({
            ...prev,
            statuses: next,
          }));
        }}
      />

      <FieldsTable
        rows={draftFieldRows}
        onChange={(next) => {
          markEdited();
          setDraftFieldRows(next);
        }}
      />

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onCancel} style={secondaryButtonStyle}>
          Cancel
        </button>

        <button onClick={onSubmitTemplate} style={primaryButtonStyle(draftConfig.buttonColor)}>
          Submit Template
        </button>
      </div>
    </div>
  );
}

type ConfigInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  labelStyle: CSSProperties;
  inputStyle: CSSProperties;
};

function ConfigInput({ label, value, onChange, labelStyle, inputStyle }: ConfigInputProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

function ConfigTextarea({ label, value, onChange, labelStyle, inputStyle }: ConfigInputProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, minHeight: 110, resize: "vertical" as const }}
      />
    </div>
  );
}