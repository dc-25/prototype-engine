import type { FieldConfig } from "../models/types";

export type ValidationErrors = Record<string, string>;

export function validateRequiredFields(
  fields: FieldConfig[],
  values: Record<string, unknown>
): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const field of fields) {
    if (!field.required) continue;

    const v = values[field.id];

    const missing =
      v === null ||
      v === undefined ||
      (typeof v === "string" && v.trim() === "");

    if (missing) {
      errors[field.id] = `${field.label} is required.`;
    }
  }

  return errors;
}