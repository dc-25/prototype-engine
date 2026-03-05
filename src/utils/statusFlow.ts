import type { StatusConfig } from "../models/types";

export function getStatusIndex(statuses: StatusConfig[], statusId: string): number {
  return statuses.findIndex((s) => s.id === statusId);
}

export function getNextStatusId(statuses: StatusConfig[], currentStatusId: string): string {
  const i = getStatusIndex(statuses, currentStatusId);
  if (i < 0) return currentStatusId;
  if (i >= statuses.length - 1) return currentStatusId;
  return statuses[i + 1].id;
}

export function getApproverForStatus(statuses: StatusConfig[], statusId: string): string | null {
  return statuses.find((s) => s.id === statusId)?.approverUserId ?? null;
}

export function isFinalStatus(statuses: StatusConfig[], statusId: string): boolean {
  const i = getStatusIndex(statuses, statusId);
  if (i < 0) return false;
  return i === statuses.length - 1;
}

export function canAdvanceStatus(statuses: StatusConfig[], statusId: string): boolean {
  const i = getStatusIndex(statuses, statusId);
  if (i < 0) return false;
  return i < statuses.length - 1;
}