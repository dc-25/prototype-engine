export type ScreenKey = "home" | "new" | "all" | "my" | "pending" | "configurator";

export type DemoUser = {
  id: string;
  name: string;
};

export type StatusConfig = {
  id: string;
  name: string;
  approverUserId: string | null;
};

export type SectionConfig = {
  id: number;
  title: string;
};

export type FieldType =
  | "text"
  | "multiline"
  | "richtext"
  | "number"
  | "date"
  | "choice"
  | "boolean"
  | "image";

export type FieldLayout = "half" | "full" | "quarter";

export type FieldConfig = {
  id: string;
  label: string;
  type: FieldType;
  section: 1 | 2 | 3;
  required: boolean;
  options?: string[];

  // Layout hint for responsive grid rendering
  layout?: FieldLayout; // default: "half"
};

export type AppConfig = {
  appName: string;
  municipality: string;
  category: string;
  actionItem: string;
  formDescription: string;
  newButtonLabel: string;

  headerColor: string;
  buttonColor: string;
  pillColor: string;
  pillTextColor: string;

  // Optional brand logo shown in the UI (e.g., bottom-right)
  logoUrl: string;

  statuses: StatusConfig[];
  sections: SectionConfig[];
  fields: FieldConfig[];
};

export type MunicipalityProfile = {
  id: string;
  municipality: string;
  logoUrl: string;
  headerColor: string;
  buttonColor: string;
  pillColor: string;
  pillTextColor: string;
  createdAtIso: string;
  updatedAtIso: string;
};

export type PrototypeTemplate = {
  id: string;
  municipalityId: string;
  templateName: string;
  config: AppConfig;
  createdAtIso: string;
  updatedAtIso: string;
};

export type RequestStatusHistoryItem = {
  action: "SavedDraft" | "Submitted" | "Approved" | "Rejected" | "Reassigned";
  atIso: string;
  byUserId: string;
  toStatusId: string;
  note?: string;
};

export type RequestAttachment = {
  id: string;
  fileName: string;
  addedAtIso: string;
  addedByUserId: string;

  // Optional metadata for richer attachment demos
  kind?: "file" | "image";
  previewUrl?: string; // e.g., base64 data URL for image preview
};

export type RequestNote = {
  id: string;
  text: string;
  createdAtIso: string;
  createdByUserId: string;
  mentionedUserIds: string[];
};

export type RequestRecord = {
  id: string;
  requestNumber: string;

  createdAtIso: string;
  updatedAtIso: string;

  createdByUserId: string;
  assignedApproverUserId: string | null;

  statusId: string;

  // field values keyed by FieldConfig.id
  fieldValues: Record<string, unknown>;

  history: RequestStatusHistoryItem[];

  attachments: RequestAttachment[];

  // Notes for collaboration / mention demo
  notes: RequestNote[];
};