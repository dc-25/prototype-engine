import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
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
import {
  buildDraftFieldRows,
  buildSectionsAndFields,
  type DraftFieldRow,
} from "../../utils/configBuilder";

type Props = {
  draftConfig: AppConfig;
  setDraftConfig: (next: AppConfig | ((prev: AppConfig) => AppConfig)) => void;
  draftFieldRows: DraftFieldRow[];
  setDraftFieldRows: (next: DraftFieldRow[]) => void;

  markEdited: () => void;

  labelStyle: CSSProperties;
  inputStyle: CSSProperties;
  secondaryButtonStyle: CSSProperties;
};

export default function MunicipalityManager({
  draftConfig,
  setDraftConfig,
  draftFieldRows,
  setDraftFieldRows,
  markEdited,
  labelStyle,
  inputStyle,
  secondaryButtonStyle,
}: Props) {
  const [municipalities, setMunicipalities] = useState<MunicipalityProfile[]>([]);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string>("");

  const [templates, setTemplates] = useState<PrototypeTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState<string>("");

  const selectedMunicipality = useMemo(() => {
    if (!selectedMunicipalityId) return null;
    return municipalities.find((m) => m.id === selectedMunicipalityId) ?? null;
  }, [municipalities, selectedMunicipalityId]);

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return templates.find((t) => t.id === selectedTemplateId) ?? null;
  }, [templates, selectedTemplateId]);

  async function refreshMunicipalities(selectId?: string) {
    setError("");
    setLoadingMunicipalities(true);
    try {
      const items = await listMunicipalityProfiles();
      setMunicipalities(items);

      if (selectId) {
        setSelectedMunicipalityId(selectId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingMunicipalities(false);
    }
  }

  async function refreshTemplates(municipalityId: string) {
    setError("");
    setLoadingTemplates(true);
    try {
      const items = await listTemplatesForMunicipality(municipalityId);
      setTemplates(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingTemplates(false);
    }
  }

  // initial load
  useEffect(() => {
    void refreshMunicipalities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload templates when municipality changes
  useEffect(() => {
    setSelectedTemplateId("");
    if (!selectedMunicipalityId) {
      setTemplates([]);
      return;
    }
    void refreshTemplates(selectedMunicipalityId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMunicipalityId]);

  function getValidatedFullConfig(): AppConfig | null {
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

    return { ...draftConfig, sections, fields };
  }

  async function saveCurrentBrandingAsMunicipality() {
    const proposedName = (draftConfig.municipality || "").trim() || "New Municipality";
    const municipalityName = window.prompt("Municipality name to save:", proposedName);
    if (!municipalityName) return;

    const nowIso = new Date().toISOString();

    // Let Dataverse assign the id (we’ll get it back from saveMunicipalityProfile)
    const profile: MunicipalityProfile = {
      id: "",
      municipality: municipalityName.trim(),
      logoUrl: draftConfig.logoUrl,
      headerColor: draftConfig.headerColor,
      buttonColor: draftConfig.buttonColor,
      pillColor: draftConfig.pillColor,
      pillTextColor: draftConfig.pillTextColor,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };

    setError("");
    try {
      const savedId = await saveMunicipalityProfile(profile);

      // Refresh + select the saved row
      await refreshMunicipalities(savedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function loadSelectedMunicipalityBranding() {
    if (!selectedMunicipality) return;

    markEdited();
    setDraftConfig((prev) => ({
      ...prev,
      municipality: selectedMunicipality.municipality,
      logoUrl: selectedMunicipality.logoUrl,
      headerColor: selectedMunicipality.headerColor,
      buttonColor: selectedMunicipality.buttonColor,
      pillColor: selectedMunicipality.pillColor,
      pillTextColor: selectedMunicipality.pillTextColor,
    }));
  }

  async function deleteSelectedMunicipality() {
    if (!selectedMunicipality) return;
    const ok = window.confirm(
      `Delete municipality profile "${selectedMunicipality.municipality}"?`
    );
    if (!ok) return;

    setError("");
    try {
      await deleteMunicipalityProfile(selectedMunicipality.id);
      await refreshMunicipalities();
      setSelectedMunicipalityId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  // ✅ UPDATED: selects the newly created template after saving
  async function saveCurrentAsTemplate() {
    if (!selectedMunicipalityId) {
      alert("Select a municipality profile first.");
      return;
    }

    const proposedTemplateName = `${draftConfig.municipality || "Template"} - Prototype`;
    const templateName = window.prompt("Template name:", proposedTemplateName);
    if (!templateName) return;

    const fullConfig = getValidatedFullConfig();
    if (!fullConfig) return;

    const nowIso = new Date().toISOString();

    const template: PrototypeTemplate = {
      id: "",
      municipalityId: selectedMunicipalityId,
      templateName: templateName.trim(),
      config: fullConfig,
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };

    setError("");
    try {
      const savedId = await saveTemplate(template);
      await refreshTemplates(selectedMunicipalityId);

      if (savedId) setSelectedTemplateId(savedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  // ✅ UPDATED: keeps selection on the overwritten template
  async function overwriteSelectedTemplate() {
    if (!selectedTemplate || !selectedMunicipalityId) return;

    const ok = window.confirm(
      `Overwrite template "${selectedTemplate.templateName}" with current draft?`
    );
    if (!ok) return;

    const fullConfig = getValidatedFullConfig();
    if (!fullConfig) return;

    const nowIso = new Date().toISOString();

    setError("");
    try {
      const savedId = await saveTemplate({
        ...selectedTemplate,
        config: fullConfig,
        updatedAtIso: nowIso,
      });

      await refreshTemplates(selectedMunicipalityId);
      setSelectedTemplateId(savedId || selectedTemplate.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function loadSelectedTemplate() {
    if (!selectedTemplate) return;

    markEdited();
    setDraftConfig(selectedTemplate.config);
    setDraftFieldRows(buildDraftFieldRows(selectedTemplate.config));
  }

  async function deleteSelectedTemplate() {
    if (!selectedTemplate) return;
    const ok = window.confirm(`Delete template "${selectedTemplate.templateName}"?`);
    if (!ok) return;

    setError("");
    try {
      await deleteTemplate(selectedTemplate.id);
      await refreshTemplates(selectedMunicipalityId);
      setSelectedTemplateId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error ? (
        <div
          style={{
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#991b1b",
            borderRadius: 12,
            padding: 12,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Dataverse error</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
        </div>
      ) : null}

      {/* Municipality Profiles */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
          Municipality Profiles
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 }}>
          Save and reuse branding (logo + colors) across demos. Loading a municipality updates only
          branding fields.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label style={labelStyle}>Saved Municipalities</label>
            <select
              value={selectedMunicipalityId}
              onChange={(e) => setSelectedMunicipalityId(e.target.value)}
              style={inputStyle}
              disabled={loadingMunicipalities}
            >
              <option value="">{loadingMunicipalities ? "Loading..." : "Select"}</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.municipality}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button onClick={saveCurrentBrandingAsMunicipality} style={secondaryButtonStyle}>
              Save Current as Municipality
            </button>

            <button
              onClick={loadSelectedMunicipalityBranding}
              style={secondaryButtonStyle}
              disabled={!selectedMunicipality}
            >
              Load Branding
            </button>

            <button
              onClick={deleteSelectedMunicipality}
              style={secondaryButtonStyle}
              disabled={!selectedMunicipality}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
          Templates
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 }}>
          Save and load full configurations (workflow + fields). Templates are stored under a
          selected municipality.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label style={labelStyle}>Templates for Municipality</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              style={inputStyle}
              disabled={!selectedMunicipalityId || loadingTemplates}
            >
              <option value="">
                {!selectedMunicipalityId
                  ? "Select a municipality first"
                  : loadingTemplates
                  ? "Loading..."
                  : "Select"}
              </option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.templateName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button
              onClick={saveCurrentAsTemplate}
              style={secondaryButtonStyle}
              disabled={!selectedMunicipalityId}
            >
              Save New
            </button>

            <button
              onClick={overwriteSelectedTemplate}
              style={secondaryButtonStyle}
              disabled={!selectedTemplate}
            >
              Overwrite Selected
            </button>

            <button
              onClick={loadSelectedTemplate}
              style={secondaryButtonStyle}
              disabled={!selectedTemplate}
            >
              Load Template
            </button>

            <button
              onClick={deleteSelectedTemplate}
              style={secondaryButtonStyle}
              disabled={!selectedTemplate}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}