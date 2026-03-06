import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Header from "../components/Header";
import FieldsTable from "../components/configurator/FieldsTable";
import StatusEditor from "../components/configurator/StatusEditor";
import LogoUpload from "../components/configurator/LogoUpload";
import TemplateLibraryPanel from "../components/configurator/TemplateLibraryPanel";
import type { AppConfig, DemoUser, ScreenKey } from "../models/types";
import { buildDraftFieldRows, buildSectionsAndFields, type DraftFieldRow } from "../utils/configBuilder";
import { cardStyle, inputStyle, labelStyle, primaryButtonStyle, secondaryButtonStyle } from "../components/configurator/configStyles";

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
  const [draftFieldRows, setDraftFieldRows] = useState<DraftFieldRow[]>(() => buildDraftFieldRows(config));
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>("none");

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (hasInitialized) return;
    setDraftConfig(config);
    setDraftFieldRows(buildDraftFieldRows(config));
    setHasInitialized(true);
  }, [config, hasInitialized]);

  function handleTextChange<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    setDraftConfig((prev) => ({ ...prev, [key]: value }));
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

  function getValidatedFullConfig(): AppConfig | null {
    const validated = validateDraft();
    if (!validated) return null;
    return { ...draftConfig, sections: validated.sections, fields: validated.fields };
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
    const fullConfig = getValidatedFullConfig();
    if (!fullConfig) return;

    setAppConfig(fullConfig);
    resetRequests();
    closeConfirm();
    onNavigate("home");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header config={config} currentUser={currentUser} onNavigate={onNavigate} />

      <main style={{ width: "100%", padding: 32, boxSizing: "border-box" }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 10 }}>
            Configuration
          </div>

          <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, marginBottom: 24 }}>
            Update labels, workflow stages, and fields. Sections are derived automatically from the
            Section column in the Fields table.
          </div>

          <TemplateLibraryPanel
            setDraftConfig={setDraftConfig}
            setDraftFieldRows={setDraftFieldRows}
            getValidatedFullConfig={getValidatedFullConfig}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <ConfigInput label="App Name" value={draftConfig.appName} onChange={(v) => handleTextChange("appName", v)} />
            <ConfigInput label="Municipality" value={draftConfig.municipality} onChange={(v) => handleTextChange("municipality", v)} />
            <ConfigInput label="Category" value={draftConfig.category} onChange={(v) => handleTextChange("category", v)} />
            <ConfigInput label="Action Item" value={draftConfig.actionItem} onChange={(v) => handleTextChange("actionItem", v)} />

            <div style={{ gridColumn: "1 / -1" }}>
              <ConfigTextarea
                label="Form Description"
                value={draftConfig.formDescription}
                onChange={(v) => handleTextChange("formDescription", v)}
              />
            </div>

            <ConfigInput label="New Button Label" value={draftConfig.newButtonLabel} onChange={(v) => handleTextChange("newButtonLabel", v)} />
            <ConfigInput label="Header Color" value={draftConfig.headerColor} onChange={(v) => handleTextChange("headerColor", v)} />
            <ConfigInput label="Button Color" value={draftConfig.buttonColor} onChange={(v) => handleTextChange("buttonColor", v)} />

            <div style={{ gridColumn: "1 / -1" }}>
              <LogoUpload
                label="Logo Upload"
                value={draftConfig.logoUrl}
                onChange={(dataUrl) => handleTextChange("logoUrl", dataUrl)}
              />
            </div>

            <ConfigInput label="Pill Color" value={draftConfig.pillColor} onChange={(v) => handleTextChange("pillColor", v)} />
            <ConfigInput label="Pill Text Color" value={draftConfig.pillTextColor} onChange={(v) => handleTextChange("pillTextColor", v)} />
          </div>

          <StatusEditor
            statuses={draftConfig.statuses}
            onChange={(next) => setDraftConfig((prev) => ({ ...prev, statuses: next }))}
          />

          <FieldsTable rows={draftFieldRows} onChange={setDraftFieldRows} />

          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => onNavigate("home")} style={secondaryButtonStyle}>
              Cancel
            </button>

            <button onClick={openConfirm} style={primaryButtonStyle(draftConfig.buttonColor)}>
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

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={closeConfirm} style={secondaryButtonStyle}>
                Cancel
              </button>

              <button onClick={applyTemplate} style={primaryButtonStyle(draftConfig.buttonColor)}>
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