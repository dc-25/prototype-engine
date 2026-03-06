import type { MunicipalityProfile } from "../models/types";
import { MicrosoftDataverseService } from "../generated/services/MicrosoftDataverseService";

const DATASET = "https://orga7faa1e3.crm3.dynamics.com";

// Entity set name (plural)
const TABLE = "cr27b_municipalityprofiles";

// Columns (logical names)
const ID_COL = "cr27b_municipalityprofileid";
const COL_NAME = "cr27b_name";
const COL_LOGO_URL = "cr27b_logourl";
const COL_HEADER_COLOR = "cr27b_headercolor";
const COL_BUTTON_COLOR = "cr27b_buttoncolor";
const COL_PILL_COLOR = "cr27b_pillcolor";
const COL_PILL_TEXT_COLOR = "cr27b_pilltextcolor";

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

  // Common shapes:
  // - { id: "GUID", ... }
  // - { [primaryKey]: "GUID", ... }
  const id1 = String(res?.id ?? "").trim();
  if (isGuid(id1)) return id1;

  const id2 = String(res?.[ID_COL] ?? "").trim();
  if (isGuid(id2)) return id2;

  return "";
}

export async function listMunicipalityProfiles(): Promise<MunicipalityProfile[]> {
  const op = await MicrosoftDataverseService.ODataStyleGetItems_V2(
    DATASET,
    TABLE,
    undefined, // $apply
    undefined, // $filter
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

      return {
        id,
        municipality: String(r?.[COL_NAME] ?? ""),
        logoUrl: String(r?.[COL_LOGO_URL] ?? ""),
        headerColor: String(r?.[COL_HEADER_COLOR] ?? ""),
        buttonColor: String(r?.[COL_BUTTON_COLOR] ?? ""),
        pillColor: String(r?.[COL_PILL_COLOR] ?? ""),
        pillTextColor: String(r?.[COL_PILL_TEXT_COLOR] ?? ""),
        createdAtIso: String(r?.createdon ?? new Date().toISOString()),
        updatedAtIso: String(r?.modifiedon ?? new Date().toISOString()),
      } as MunicipalityProfile;
    })
    .filter(Boolean) as MunicipalityProfile[];
}

/**
 * Upserts a municipality profile.
 * - If profile.id is a Dataverse GUID => PATCH and returns same id
 * - Otherwise => POST (create) and returns created Dataverse GUID (best-effort)
 */
export async function saveMunicipalityProfile(profile: MunicipalityProfile): Promise<string> {
  const item: Record<string, unknown> = {
    [COL_NAME]: profile.municipality,
    [COL_LOGO_URL]: profile.logoUrl,
    [COL_HEADER_COLOR]: profile.headerColor,
    [COL_BUTTON_COLOR]: profile.buttonColor,
    [COL_PILL_COLOR]: profile.pillColor,
    [COL_PILL_TEXT_COLOR]: profile.pillTextColor,
  };

  const id = String(profile.id ?? "").trim();

  // UPDATE (PATCH) only when id is a real Dataverse GUID
  if (id && isGuid(id)) {
    await (MicrosoftDataverseService as any).ODataStylePatchItem_V2(DATASET, TABLE, id, item);
    return id;
  }

  // CREATE (POST)
  const op = await MicrosoftDataverseService.ODataStylePostItem_V2(DATASET, TABLE, item as any);

  const createdId = unwrapCreatedId(op);
  if (createdId) return createdId;

  // Fallback: re-list and match by name (works well if municipality names are unique)
  const latest = await listMunicipalityProfiles();
  const match = latest.find((m) => m.municipality === profile.municipality);
  return match?.id ?? "";
}

export async function deleteMunicipalityProfile(profileId: string): Promise<void> {
  const id = String(profileId ?? "").trim();
  if (!isGuid(id)) throw new Error("Invalid municipality id (expected a Dataverse GUID).");

  await (MicrosoftDataverseService as any).ODataStyleDeleteItem_V2(DATASET, TABLE, id);
}