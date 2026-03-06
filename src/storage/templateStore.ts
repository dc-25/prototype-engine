import type { AppConfig, PrototypeTemplate } from "../models/types";
import { MicrosoftDataverseService } from "../generated/services/MicrosoftDataverseService";

const DATASET = "https://orga7faa1e3.crm3.dynamics.com";

// Entity set names
const TABLE = "cr27b_prototypetemplates";
const MUNICIPALITY_TABLE = "cr27b_municipalityprofiles";

// Columns (logical names)
const ID_COL = "cr27b_prototypetemplateid";
const COL_NAME = "cr27b_name";
const COL_CONFIG_JSON = "cr27b_new_configjson";
const LOOKUP_COL = "cr27b_new_municipality";

// Used in filters for lookups
function lookupValueKey() {
  return `_${LOOKUP_COL}_value`;
}

function isGuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function unwrapResult<T>(op: unknown): T {
  const anyOp = op as any;
  return (anyOp?.result ?? anyOp?.data ?? anyOp) as T;
}

function unwrapRows(op: unknown): any[] {
  const res = unwrapResult<any>(op);
  const value = res?.value;
  return Array.isArray(value) ? value : [];
}

function unwrapCreatedId(op: unknown): string {
  const res = unwrapResult<any>(op);

  const id1 = String(res?.id ?? "").trim();
  if (isGuid(id1)) return id1;

  const id2 = String(res?.[ID_COL] ?? "").trim();
  if (isGuid(id2)) return id2;

  return "";
}

/**
 * List templates for a municipality.
 * IMPORTANT: municipalityId must be a Dataverse GUID.
 */
export async function listTemplatesForMunicipality(
  municipalityId: string
): Promise<PrototypeTemplate[]> {
  const munId = String(municipalityId ?? "").trim();
  if (!isGuid(munId)) {
    throw new Error("Invalid municipality id (expected a Dataverse GUID).");
  }

  // Safest OData GUID literal format
  const filter = `${lookupValueKey()} eq guid'${munId}'`;

  const op = await MicrosoftDataverseService.ODataStyleGetItems_V2(
    DATASET,
    TABLE,
    undefined, // $apply
    filter, // $filter
    "modifiedon desc", // $orderby
    250, // $top
    0, // $skip
    undefined // $expand
  );

  const rows = unwrapRows(op);

  return rows
    .map((r) => {
      const id = String(r?.[ID_COL] ?? "").trim();
      if (!id) return null;

      const rawJson = String(r?.[COL_CONFIG_JSON] ?? "{}");
      let config: AppConfig;
      try {
        config = JSON.parse(rawJson) as AppConfig;
      } catch {
        config = {} as AppConfig;
      }

      return {
        id,
        municipalityId: munId,
        templateName: String(r?.[COL_NAME] ?? ""),
        config,
        createdAtIso: String(r?.createdon ?? new Date().toISOString()),
        updatedAtIso: String(r?.modifiedon ?? new Date().toISOString()),
      } as PrototypeTemplate;
    })
    .filter(Boolean) as PrototypeTemplate[];
}

/**
 * Upserts a template.
 * - If template.id is a Dataverse GUID => PATCH
 * - Otherwise => POST (create)
 *
 * Returns the saved template id (GUID).
 */
export async function saveTemplate(template: PrototypeTemplate): Promise<string> {
  const munId = String(template.municipalityId ?? "").trim();
  if (!isGuid(munId)) {
    throw new Error("Invalid municipality id (expected a Dataverse GUID).");
  }

  // Lookup binding via @odata.bind (recommended)
  const item: Record<string, unknown> = {
    [COL_NAME]: template.templateName,
    [COL_CONFIG_JSON]: JSON.stringify(template.config ?? {}),
    [`${LOOKUP_COL}@odata.bind`]: `/${MUNICIPALITY_TABLE}(${munId})`,
  };

  const id = String(template.id ?? "").trim();

  // UPDATE (PATCH) only when id is a real Dataverse GUID
  if (id && isGuid(id)) {
    await (MicrosoftDataverseService as any).ODataStylePatchItem_V2(DATASET, TABLE, id, item);
    return id;
  }

  // CREATE (POST)
  const op = await MicrosoftDataverseService.ODataStylePostItem_V2(DATASET, TABLE, item as any);
  const createdId = unwrapCreatedId(op);

  // If we can’t reliably read it, the UI can still refresh list() — but we return something useful.
  return createdId || "";
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const id = String(templateId ?? "").trim();
  if (!isGuid(id)) throw new Error("Invalid template id (expected a Dataverse GUID).");

  await (MicrosoftDataverseService as any).ODataStyleDeleteItem_V2(DATASET, TABLE, id);
}