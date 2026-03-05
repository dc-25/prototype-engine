import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Header from "../components/Header";
import FieldsTable from "../components/configurator/FieldsTable";
import StatusEditor from "../components/configurator/StatusEditor";
import type { AppConfig, DemoUser, ScreenKey } from "../models/types";
import {
  buildDraftFieldRows,
  buildSectionsAndFields,
  type DraftFieldRow,
} from "../utils/configBuilder";

type Props = {
  onNavigate: (screen: ScreenKey) => void;
  config: AppConfig;
  setAppConfig: Dispatch<SetStateAction<AppConfig>>;
  resetRequests: () => void;
  currentUser: DemoUser;
};

type ConfirmDialog = "none" | "confirmReset";

export default function ConfiguratorScreen({
  onNavigate,
  config,
  setAppConfig,
  resetRequests,
  currentUser,
}: Props) {
  const [draftConfig, setDraftConfig] = useState<AppConfig>(config);
  const [draftFieldRows, setDraftFieldRows] = useState<DraftFieldRow[]>(() =>
    buildDraftFieldRows(config)
  );
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>("none");

  useEffect(() => {
    setDraftConfig(config);
    setDraftFieldRows(buildDraftFieldRows(config));
  }, [config]);

  function handleTextChange<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    setDraftConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function validateDraft(): { sections: AppConfig["sections"]; fields: AppConfig["fields"] } | null {
    const ids = draftConfig.statuses.map((s) => s.id);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      alert("Statuses must have unique IDs. Please adjust stage names.");
      return null;
    }

    const { sections, fields } = buildSectionsAndFields(draftFieldRows);

    if (sections.length === 0 || fields.length === 0) {
      alert("Add at least one field with a name and section.");
      return null;
    }

    return { sections, fields };
  }

  function openConfirm() {
    const validated = validateDraft();
    if (!validated) return;
    setConfirmDialog("confirmReset");
  }

  function closeConfirm() {
    setConfirmDialog("none");
  }

  function applyTemplate() {
    const validated = validateDraft();
    if (!validated) return;

    setAppConfig({
      ...draftConfig,
      sections: validated.sections,
      fields: validated.fields,
    });

    resetRequests();
    closeConfirm();
    onNavigate("home");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header config={config} currentUser={currentUser} onNavigate={onNavigate} />

      <main style={{ width: "100%", padding: 32, boxSizing: "border-box" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 24,
            maxWidth: 1200,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 10 }}>
            Configuration
          </div>

          <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, marginBottom: 24 }}>
            Update labels, workflow stages, and fields. Sections are derived automatically from the
            Section column in the Fields table.
          </div>

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
            />

            <ConfigInput
              label="Municipality"
              value={draftConfig.municipality}
              onChange={(value) => handleTextChange("municipality", value)}
            />

            <ConfigInput
              label="Category"
              value={draftConfig.category}
              onChange={(value) => handleTextChange("category", value)}
            />

            <ConfigInput
              label="Action Item"
              value={draftConfig.actionItem}
              onChange={(value) => handleTextChange("actionItem", value)}
            />

            <div style={{ gridColumn: "1 / -1" }}>
              <ConfigTextarea
                label="Form Description"
                value={draftConfig.formDescription}
                onChange={(value) => handleTextChange("formDescription", value)}
              />
            </div>

            <ConfigInput
              label="New Button Label"
              value={draftConfig.newButtonLabel}
              onChange={(value) => handleTextChange("newButtonLabel", value)}
            />

            <ConfigInput
              label="Header Color"
              value={draftConfig.headerColor}
              onChange={(value) => handleTextChange("headerColor", value)}
            />

            <ConfigInput
              label="Button Color"
              value={draftConfig.buttonColor}
              onChange={(value) => handleTextChange("buttonColor", value)}
            />

            <ConfigInput
              label="Pill Color"
              value={draftConfig.pillColor}
              onChange={(value) => handleTextChange("pillColor", value)}
            />

            <ConfigInput
              label="Pill Text Color"
              value={draftConfig.pillTextColor}
              onChange={(value) => handleTextChange("pillTextColor", value)}
            />
          </div>

          <StatusEditor
            statuses={draftConfig.statuses}
            onChange={(next) =>
              setDraftConfig((prev) => ({
                ...prev,
                statuses: next,
              }))
            }
          />

          <FieldsTable rows={draftFieldRows} onChange={setDraftFieldRows} />

          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => onNavigate("home")} style={secondaryButtonStyle}>
              Cancel
            </button>

            <button
              onClick={openConfirm}
              style={primaryButtonStyle(draftConfig.buttonColor)}
            >
              Submit Template
            </button>
          </div>
        </div>
      </main>

      {confirmDialog === "confirmReset" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17, 24, 39, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: 16,
              padding: 20,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
              Apply template and reset requests?
            </div>

            <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
              Submitting a template clears all existing demo requests so the new configuration starts
              clean.
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 12,
                borderRadius: 12,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                fontSize: 14,
                color: "#111827",
              }}
            >
              This action cannot be undone.
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button onClick={closeConfirm} style={secondaryButtonStyle}>
                Cancel
              </button>

              <button
                onClick={applyTemplate}
                style={primaryButtonStyle(draftConfig.buttonColor)}
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type ConfigInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function ConfigInput({ label, value, onChange }: ConfigInputProps) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

function ConfigTextarea({ label, value, onChange }: ConfigInputProps) {
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

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#4b5563",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#ffffff",
  boxSizing: "border-box" as const,
};

const primaryButtonStyle = (buttonColor: string) => ({
  background: buttonColor,
  color: "#ffffff",
  border: `1px solid ${buttonColor}`,
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
});

const secondaryButtonStyle = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};