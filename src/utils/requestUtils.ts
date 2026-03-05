import type { FieldConfig } from "../models/types";

export function getInitialValues(fields: FieldConfig[]) {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (field.type === "boolean") {
      acc[field.id] = false;
      return acc;
    }
    acc[field.id] = "";
    return acc;
  }, {});
}

export function formatAuditTimestamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function buildRequestNumber() {
  const n = String(Date.now()).slice(-6);
  return `REQ-${n}`;
}