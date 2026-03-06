import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { AppConfig, MunicipalityProfile, PrototypeTemplate } from "../../models/types";
import {
  deleteMunicipalityProfile,
  listMunicipalityProfiles,
  saveMunicipalityProfile,
} from "../../storage/municipalityStore";
import {
  deleteTemplate,
  listTemplatesForMunicipality,
  saveTemplate,
} from "../../storage/templateStore";
import { buildDraftFieldRows, type DraftFieldRow } from "../../utils/configBuilder";
import { inputStyle, labelStyle, secondaryButtonStyle } from "./configStyles";

type Props = {
  setDraftConfig: Dispatch<SetStateAction<AppConfig>>;
  setDraftFieldRows: Dispatch<SetStateAction<DraftFieldRow[]>>;
  getValidatedFullConfig: () => AppConfig | null; // includes rebuilt sections/fields
};

type TabKey = "municipalities" | "templates";

type MunicipalityDraft = {
  id: string; // existing or "new"
  name: string;
  logoUrl: string;
  headerColor: string;
  buttonColor: string;
  pillColor: string;
  pillTextColor: string;
};

function toMunicipalityDraft(m: MunicipalityProfile): MunicipalityDraft {
  return {
    id: m.id,
    name: m.municipality,
    logoUrl: m.logoUrl,
    headerColor: m.headerColor,
    buttonColor: m.buttonColor,
    pillColor: m.pillColor,
    pillTextColor: m.pillTextColor,
  };
}

function blankMunicipalityDraft(): MunicipalityDraft {
  return {
    id: "new",
    name: "",
    logoUrl: "",
    headerColor: "#111827",
    buttonColor: "#111827",
    pillColor: "#f9e4a0",
    pillTextColor: "#78540a",
  };
}

function applyMunicipalityBranding(config: AppConfig, m: MunicipalityProfile): AppConfig {
  return {
    ...config,
    municipality: m.municipality,
    logoUrl: m.logoUrl,
    headerColor: m.headerColor,
    buttonColor: m.buttonColor,
    pillColor: m.pillColor,
    pillTextColor: m.pillTextColor,
  };
}

export default function TemplateLibraryPanel({
  setDraftConfig,
  setDraftFieldRows,
  getValidatedFullConfig,
}: Props) {
  const [tab, setTab] = useState<TabKey>("templates");

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const [municipalities, setMunicipalities] = useState<MunicipalityProfile[]>([]);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string>("");

  const selectedMunicipality = useMemo(() => {
    if (!selectedMunicipalityId) return null;
    return municipalities.find((m) => m.id === selectedMunicipalityId) ?? null;
  }, [municipalities, selectedMunicipalityId]);

  const [munDraft, setMunDraft] = useState<MunicipalityDraft>(() => blankMunicipalityDraft());

  const [templates, setTemplates] = useState<PrototypeTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return templates.find((t) => t.id === selectedTemplateId) ?? null;
  }, [templates, selectedTemplateId]);

  const [copyTargetMunicipalityId, setCopyTargetMunicipalityId] = useState<string>("");

  async function run<T>(fn: () => Promise<T>) {
    setError("");
    setIsBusy(true);
    try {
      return await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return null;
    } finally {
      setIsBusy(false);
    }
  }

  async function refreshMunicipalities() {
    const items = await run(() => listMunicipalityProfiles());
    if (items) setMunicipalities(items);
  }

  async function refreshTemplates(municipalityId: string) {
    const items = await run(() => listTemplatesForMunicipality(municipalityId));
    if (items) setTemplates(items);
  }

  useEffect(() => {
    void refreshMunicipalities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedTemplateId("");
    setCopyTargetMunicipalityId("");

    if (selectedMunicipality) {
      setMunDraft(toMunicipalityDraft(selectedMunicipality));
      void refreshTemplates(selectedMunicipality.id);
      return;
    }

    setMunDraft(blankMunicipalityDraft());
    setTemplates([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMunicipalityId]);

  function setMun<K extends keyof MunicipalityDraft>(key: K, value: MunicipalityDraft[K]) {
    setMunDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function createNewMunicipality() {
    setSelectedMunicipalityId("");
    setMunDraft(blankMunicipalityDraft());
    setTab("municipalities");
  }

  async function saveMunicipality() {
    const name = munDraft.name.trim();
    if (!name) {
      alert("Municipality name is required.");
      return;
    }

    const nowIso = new Date().toISOString();
    const isNew = munDraft.id === "new";

    const profile: MunicipalityProfile = {
      id: isNew ? "" : munDraft.id,
      municipality: name,
      logoUrl: munDraft.logoUrl,
      headerColor: munDraft.headerColor,
      buttonColor: munDraft.buttonColor,
      pillColor: munDraft.pillColor,
      pillTextColor: munDraft.pillTextColor,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };

    const ok = await run(() => saveMunicipalityProfile(profile));
    if (ok === null) return;

    await refreshMunicipalities();

    // After refresh, select the saved row by latest match on name.
    // (listMunicipalityProfiles is ordered by modifiedon desc in your store)
    const latest = (await run(() => listMunicipalityProfiles())) ?? [];
    const match = latest.find((m) => m.municipality === name);
    if (match) setSelectedMunicipalityId(match.id);
  }

  async function deleteMunicipality() {
    if (!selectedMunicipality) return;

    const ok = window.confirm(`Delete municipality "${selectedMunicipality.municipality}"?`);
    if (!ok) return;

    const res = await run(() => deleteMunicipalityProfile(selectedMunicipality.id));
    if (res === null) return;

    await refreshMunicipalities();
    setSelectedMunicipalityId("");
  }

  function applyBrandingToDraft() {
    if (!selectedMunicipality) return;
    setDraftConfig((prev) => applyMunicipalityBranding(prev, selectedMunicipality));
  }

  async function saveNewTemplate() {
    if (!selectedMunicipality) {
      alert("Select a municipality first.");
      return;
    }

    const fullConfig = getValidatedFullConfig();
    if (!fullConfig) return;

    const name = window.prompt("Template name:", `${selectedMunicipality.municipality} - Template`);
    if (!name) return;

    const nowIso = new Date().toISOString();

    const template: PrototypeTemplate = {
      id: `tpl-${crypto.randomUUID()}`,
      municipalityId: selectedMunicipality.id,
      templateName: name.trim(),
      config: fullConfig,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };

    const ok = await run(() => saveTemplate(template));
    if (ok === null) return;

    await refreshTemplates(selectedMunicipality.id);
    setSelectedTemplateId(template.id);
  }

  async function overwriteSelectedTemplate() {
    if (!selectedMunicipality) {
      alert("Select a municipality first.");
      return;
    }
    if (!selectedTemplate) {
      alert("Select a template to overwrite.");
      return;
    }

    const fullConfig = getValidatedFullConfig();
    if (!fullConfig) return;

    const ok = window.confirm(`Overwrite template "${selectedTemplate.templateName}"?`);
    if (!ok) return;

    const nowIso = new Date().toISOString();

    const updated: PrototypeTemplate = {
      ...selectedTemplate,
      config: fullConfig,
      updatedAtIso: nowIso,
    };

    const res = await run(() => saveTemplate(updated));
    if (res === null) return;

    await refreshTemplates(selectedMunicipality.id);
    setSelectedTemplateId(updated.id);
  }

  function loadSelectedTemplate() {
    if (!selectedTemplate) return;
    setDraftConfig(selectedTemplate.config);
    setDraftFieldRows(buildDraftFieldRows(selectedTemplate.config));
  }

  async function deleteSelectedTemplate() {
    if (!selectedMunicipality) return;
    if (!selectedTemplate) return;

    const ok = window.confirm(`Delete template "${selectedTemplate.templateName}"?`);
    if (!ok) return;

    const res = await run(() => deleteTemplate(selectedTemplate.id));
    if (res === null) return;

    await refreshTemplates(selectedMunicipality.id);
    setSelectedTemplateId("");
  }

  async function copyTemplateToMunicipality() {
    if (!selectedTemplate) {
      alert("Select a template to copy.");
      return;
    }
    if (!copyTargetMunicipalityId) {
      alert("Select a target municipality.");
      return;
    }

    const target = municipalities.find((m) => m.id === copyTargetMunicipalityId);
    if (!target) return;

    const newName = window.prompt("New template name:", `${selectedTemplate.templateName} (Copy)`);
    if (!newName) return;

    const nowIso = new Date().toISOString();
    const copiedConfig = applyMunicipalityBranding(selectedTemplate.config, target);

    const template: PrototypeTemplate = {
      id: `tpl-${crypto.randomUUID()}`,
      municipalityId: target.id,
      templateName: newName.trim(),
      config: copiedConfig,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };

    const ok = await run(() => saveTemplate(template));
    if (ok === null) return;

    if (selectedMunicipality?.id === target.id) {
      await refreshTemplates(target.id);
      setSelectedTemplateId(template.id);
    }
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 6 }}>
            Templates & Municipalities
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
            Manage municipalities (with default branding) and save templates under municipalities.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" onClick={() => setTab("templates")} style={secondaryButtonStyle} disabled={isBusy}>
            Templates
          </button>
          <button type="button" onClick={() => setTab("municipalities")} style={secondaryButtonStyle} disabled={isBusy}>
            Municipalities
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Dataverse error</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Municipality</label>
        <select
          value={selectedMunicipalityId}
          onChange={(e) => setSelectedMunicipalityId(e.target.value)}
          style={inputStyle}
          disabled={isBusy}
        >
          <option value="">Select</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.id}>
              {m.municipality}
            </option>
          ))}
        </select>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={createNewMunicipality} style={secondaryButtonStyle} disabled={isBusy}>
            + New Municipality
          </button>

          <button
            type="button"
            onClick={applyBrandingToDraft}
            style={secondaryButtonStyle}
            disabled={isBusy || !selectedMunicipality}
          >
            Apply Branding to Current Draft
          </button>
        </div>
      </div>

      {tab === "municipalities" && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 10 }}>
            Municipality (Default Branding)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Municipality Name</label>
              <input
                value={munDraft.name}
                onChange={(e) => setMun("name", e.target.value)}
                style={inputStyle}
                disabled={isBusy}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Logo (data URL)</label>
              <input
                value={munDraft.logoUrl}
                onChange={(e) => setMun("logoUrl", e.target.value)}
                style={inputStyle}
                disabled={isBusy}
                placeholder="Paste a data URL (recommended) or leave blank"
              />
            </div>

            <div>
              <label style={labelStyle}>Header Color</label>
              <input
                value={munDraft.headerColor}
                onChange={(e) => setMun("headerColor", e.target.value)}
                style={inputStyle}
                disabled={isBusy}
              />
            </div>

            <div>
              <label style={labelStyle}>Button Color</label>
              <input
                value={munDraft.buttonColor}
                onChange={(e) => setMun("buttonColor", e.target.value)}
                style={inputStyle}
                disabled={isBusy}
              />
            </div>

            <div>
              <label style={labelStyle}>Pill Color</label>
              <input
                value={munDraft.pillColor}
                onChange={(e) => setMun("pillColor", e.target.value)}
                style={inputStyle}
                disabled={isBusy}
              />
            </div>

            <div>
              <label style={labelStyle}>Pill Text Color</label>
              <input
                value={munDraft.pillTextColor}
                onChange={(e) => setMun("pillTextColor", e.target.value)}
                style={inputStyle}
                disabled={isBusy}
              />
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={saveMunicipality} style={secondaryButtonStyle} disabled={isBusy}>
              Save Municipality
            </button>

            <button
              type="button"
              onClick={deleteMunicipality}
              style={secondaryButtonStyle}
              disabled={isBusy || !selectedMunicipality}
            >
              Delete Municipality
            </button>
          </div>
        </div>
      )}

      {tab === "templates" && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", marginBottom: 10 }}>
            Templates
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Templates for Selected Municipality</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                style={inputStyle}
                disabled={isBusy || !selectedMunicipality}
              >
                <option value="">{selectedMunicipality ? "Select" : "Select a municipality first"}</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.templateName}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button" onClick={saveNewTemplate} style={secondaryButtonStyle} disabled={isBusy || !selectedMunicipality}>
                Save New
              </button>

              <button type="button" onClick={overwriteSelectedTemplate} style={secondaryButtonStyle} disabled={isBusy || !selectedTemplate}>
                Overwrite Selected
              </button>

              <button type="button" onClick={loadSelectedTemplate} style={secondaryButtonStyle} disabled={isBusy || !selectedTemplate}>
                Load
              </button>

              <button type="button" onClick={deleteSelectedTemplate} style={secondaryButtonStyle} disabled={isBusy || !selectedTemplate}>
                Delete
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
              Copy template to another municipality (auto swaps branding)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "end" }}>
              <div>
                <label style={labelStyle}>Target Municipality</label>
                <select
                  value={copyTargetMunicipalityId}
                  onChange={(e) => setCopyTargetMunicipalityId(e.target.value)}
                  style={inputStyle}
                  disabled={isBusy || municipalities.length === 0}
                >
                  <option value="">Select</option>
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.municipality}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={copyTemplateToMunicipality}
                style={secondaryButtonStyle}
                disabled={isBusy || !selectedTemplate || !copyTargetMunicipalityId}
              >
                Copy Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}