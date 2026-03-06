import type {
  AppConfig,
  FieldConfig,
  FieldLayout,
  FieldType,
  SectionConfig,
  StatusConfig,
} from "../models/types";

export type DraftFieldRow = {
  id: string;
  label: string;
  type: FieldType;
  sectionName: string;
  required: boolean;
  layout: FieldLayout;
};

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function makeUniqueId(base: string, used: Set<string>) {
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export function buildDraftFieldRows(config: AppConfig): DraftFieldRow[] {
  return config.fields.map((field) => {
    const section = config.sections.find((s) => s.id === field.section);

    return {
      id: field.id,
      label: field.label,
      type: field.type,
      sectionName: section?.title ?? `Section ${field.section}`,
      required: field.required,
      layout: field.layout ?? "half",
    };
  });
}

export function buildSectionsAndFields(rows: DraftFieldRow[]) {
  const cleanedRows = rows
    .map((row) => ({
      ...row,
      label: row.label.trim(),
      sectionName: row.sectionName.trim() || "General",
      layout: row.layout ?? "half",
    }))
    .filter((row) => row.label);

  const sectionNames: string[] = [];
  for (const row of cleanedRows) {
    if (!sectionNames.includes(row.sectionName)) {
      sectionNames.push(row.sectionName);
    }
  }

  const limitedSectionNames = sectionNames.slice(0, 3);

  const sections: SectionConfig[] = limitedSectionNames.map((name, index) => ({
    id: (index + 1) as 1 | 2 | 3,
    title: name,
  }));

  const sectionIdByName = new Map<string, 1 | 2 | 3>();
  sections.forEach((section) => {
    sectionIdByName.set(section.title, section.id as 1 | 2 | 3);
  });

  // Keep IDs stable across template submits.
  // Still guarantees uniqueness just in case (e.g., duplicated row ids).
  const usedFieldIds = new Set<string>();

  const fields: FieldConfig[] = cleanedRows
    .filter((row) => sectionIdByName.has(row.sectionName))
    .map((row) => {
      const baseId = row.id?.trim() || slugify(row.label) || "field";
      const uniqueId = makeUniqueId(baseId, usedFieldIds);
      usedFieldIds.add(uniqueId);

      const field: FieldConfig = {
        id: uniqueId,
        label: row.label,
        type: row.type,
        section: sectionIdByName.get(row.sectionName)!,
        required: row.required,
        layout: row.layout ?? "half",
      };

      if (row.type === "choice") {
        field.options = ["Option 1", "Option 2", "Option 3"];
      }

      return field;
    });

  return { sections, fields };
}

export function normalizeStatuses(next: StatusConfig[]) {
  const cleaned = next.map((s) => ({ ...s }));

  if (cleaned.length > 0) {
    cleaned[0] = {
      ...cleaned[0],
      id: "draft",
      name: cleaned[0].name || "Draft",
      approverUserId: null,
    };
  }

  if (cleaned.length > 1) {
    cleaned[cleaned.length - 1] = {
      ...cleaned[cleaned.length - 1],
      approverUserId: null,
    };
  }

  return cleaned;
}