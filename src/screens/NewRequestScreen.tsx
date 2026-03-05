import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Header from "../components/Header";
import StatusStepper from "../components/StatusStepper";
import FieldRenderer from "../components/FieldRenderer";
import AttachmentCard from "../components/AttachmentCard";
import { demoUsers } from "../config/demoUsers";
import type {
  AppConfig,
  DemoUser,
  FieldConfig,
  ScreenKey,
  RequestRecord,
} from "../models/types";
import { validateRequiredFields } from "../utils/validation";
import {
  canAdvanceStatus,
  getApproverForStatus,
  getNextStatusId,
  getStatusIndex,
} from "../utils/statusFlow";

type Props = {
  onNavigate: (screen: ScreenKey) => void;
  config: AppConfig;
  currentUser: DemoUser;
  requests: RequestRecord[];
  setRequests: Dispatch<SetStateAction<RequestRecord[]>>;
  selectedRequestId?: string | null;
  clearSelectedRequest?: () => void;
};

type ReviewDialog = "none" | "reject" | "reassign";
type RightTab = "attachments" | "notes" | "audit";

function getInitialValues(fields: FieldConfig[]) {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (field.type === "boolean") {
      acc[field.id] = false;
      return acc;
    }
    acc[field.id] = "";
    return acc;
  }, {});
}

function formatAuditTimestamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function NewRequestScreen({
  onNavigate,
  config,
  currentUser,
  requests,
  setRequests,
  selectedRequestId,
  clearSelectedRequest,
}: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    getInitialValues(config.fields)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reviewDialog, setReviewDialog] = useState<ReviewDialog>("none");
  const [rejectReason, setRejectReason] = useState("");
  const [reassignUserId, setReassignUserId] = useState("");
  const [rightTab, setRightTab] = useState<RightTab>("attachments");

  const userNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of demoUsers) map.set(u.id, u.name);
    return (id: string | null) => {
      if (!id) return "Unassigned";
      return map.get(id) ?? "Unknown";
    };
  }, []);

  const selectedRecord = useMemo(() => {
    if (!selectedRequestId) return null;
    return requests.find((request) => request.id === selectedRequestId) ?? null;
  }, [requests, selectedRequestId]);

  const activeRecord = selectedRecord;
  const isViewingRecord = activeRecord !== null;

  const canReviewActions =
  activeRecord !== null &&
  activeRecord.assignedApproverUserId === currentUser.id &&
  activeRecord.statusId !== "draft";

  const canApproveRecord =
  activeRecord !== null && canReviewActions
    ? canAdvanceStatus(config.statuses, activeRecord.statusId)
    : false;

  const isEditingDraft =
    activeRecord !== null &&
    activeRecord.statusId === "draft" &&
    activeRecord.createdByUserId === currentUser.id;

  const reassignOptions = useMemo(() => {
    if (!activeRecord) return [];
    return demoUsers.filter(
      (user) => user.id !== activeRecord.assignedApproverUserId
    );
  }, [activeRecord]);

  const sections = useMemo(() => {
    return config.sections
      .map((section) => ({
        ...section,
        fields: config.fields.filter((field) => field.section === section.id),
      }))
      .filter((section) => section.fields.length > 0);
  }, [config.sections, config.fields]);

  const auditItems = useMemo(() => {
    if (!activeRecord) return [];
    const history = Array.isArray(activeRecord.history) ? activeRecord.history : [];
    return [...history].sort((a, b) => (a.atIso < b.atIso ? 1 : -1));
  }, [activeRecord]);

  useEffect(() => {
    if (!activeRecord) {
      setValues(getInitialValues(config.fields));
      setErrors({});
      return;
    }

    setValues({
      ...getInitialValues(config.fields),
      ...activeRecord.fieldValues,
    });
    setErrors({});
  }, [activeRecord, config.fields]);

  useEffect(() => {
    if (reviewDialog !== "reassign") return;
    setReassignUserId(reassignOptions[0]?.id ?? "");
  }, [reviewDialog, reassignOptions]);

  useEffect(() => {
    if (isViewingRecord) setRightTab("audit");
    else setRightTab("attachments");
  }, [isViewingRecord]);

  function closeDialog() {
    setReviewDialog("none");
    setRejectReason("");
    setReassignUserId("");
  }

  function handleFieldChange(fieldId: string, value: unknown) {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }

  function handleExitView() {
    closeDialog();
    clearSelectedRequest?.();
    setValues(getInitialValues(config.fields));
    setErrors({});
  }

  function handleBack() {
    closeDialog();
    clearSelectedRequest?.();
    onNavigate("home");
  }

function buildRequestNumber() {
  const n = String(Date.now()).slice(-6);
  return `REQ-${n}`;
}

  function buildRecord(statusId: string): RequestRecord {
  const nowIso = new Date().toISOString();
  const requestNumber = buildRequestNumber();

  const assignedApproverUserId =
    statusId === "draft"
      ? null
      : getApproverForStatus(config.statuses, statusId);

  return {
    id: `id-${crypto.randomUUID()}`,
    requestNumber,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    createdByUserId: currentUser.id,
    assignedApproverUserId,
    statusId,
    fieldValues: { ...values },
    history: [
      {
        action: statusId === "draft" ? "SavedDraft" : "Submitted",
        atIso: nowIso,
        byUserId: currentUser.id,
        toStatusId: statusId,
      },
    ],
    attachments: [],
  };
}

  function handleSave() {
    setErrors({});

    if (isEditingDraft && activeRecord) {
      const nowIso = new Date().toISOString();

      setRequests((prev) =>
        prev.map((request) => {
          if (request.id !== activeRecord.id) return request;

          return {
            ...request,
            updatedAtIso: nowIso,
            fieldValues: { ...values },
            history: [
              ...request.history,
              {
                action: "SavedDraft",
                atIso: nowIso,
                byUserId: currentUser.id,
                toStatusId: "draft",
              },
            ],
          };
        })
      );

      onNavigate("my");
      return;
    }

    const record = buildRecord("draft");
    setRequests((prev) => [record, ...prev]);
    clearSelectedRequest?.();
    onNavigate("my");
  }

  function handleSubmit() {
  const validationErrors = validateRequiredFields(config.fields, values);
  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) return;

  const submittedStatusId = config.statuses[1]?.id ?? "draft";
  const assignedApproverUserId =
    submittedStatusId === "draft"
      ? null
      : getApproverForStatus(config.statuses, submittedStatusId);

  if (isEditingDraft && activeRecord) {
    const nowIso = new Date().toISOString();

    setRequests((prev) =>
      prev.map((request) => {
        if (request.id !== activeRecord.id) return request;

        return {
          ...request,
          statusId: submittedStatusId,
          assignedApproverUserId,
          updatedAtIso: nowIso,
          fieldValues: { ...values },
          history: [
            ...request.history,
            {
              action: "Submitted",
              atIso: nowIso,
              byUserId: currentUser.id,
              toStatusId: submittedStatusId,
            },
          ],
        };
      })
    );

    clearSelectedRequest?.();
    setValues(getInitialValues(config.fields));
    onNavigate("all");
    return;
  }

  const record = buildRecord(submittedStatusId);

  setRequests((prev) => [record, ...prev]);
  clearSelectedRequest?.();
  setValues(getInitialValues(config.fields));
  onNavigate("all");
}

  function handleApprove() {
  if (!activeRecord) return;

  const nextStatusId = getNextStatusId(config.statuses, activeRecord.statusId);
  const nextApproverUserId =
    nextStatusId === activeRecord.statusId
      ? activeRecord.assignedApproverUserId
      : getApproverForStatus(config.statuses, nextStatusId);

  const nowIso = new Date().toISOString();

  setRequests((prev) =>
    prev.map((request) => {
      if (request.id !== activeRecord.id) return request;

      return {
        ...request,
        statusId: nextStatusId,
        assignedApproverUserId: nextApproverUserId,
        updatedAtIso: nowIso,
        history: [
          ...request.history,
          {
            action: "Approved",
            atIso: nowIso,
            byUserId: currentUser.id,
            toStatusId: nextStatusId,
          },
        ],
      };
    })
  );

  clearSelectedRequest?.();

  // If it still belongs to me, keep me in Pending. Otherwise go to All.
  onNavigate(nextApproverUserId === currentUser.id ? "pending" : "all");
}

  function openRejectDialog() {
    setRejectReason("");
    setReviewDialog("reject");
  }

  function confirmReject() {
  if (!activeRecord) return;
  if (!rejectReason.trim()) return;

  const currentIndex = getStatusIndex(config.statuses, activeRecord.statusId);
  const previousStatusId =
    currentIndex > 0 ? config.statuses[currentIndex - 1].id : activeRecord.statusId;

  const previousApproverUserId =
    previousStatusId === "draft"
      ? null
      : getApproverForStatus(config.statuses, previousStatusId);

  const nowIso = new Date().toISOString();

  setRequests((prev) =>
    prev.map((request) => {
      if (request.id !== activeRecord.id) return request;

      return {
        ...request,
        statusId: previousStatusId,
        assignedApproverUserId: previousApproverUserId,
        updatedAtIso: nowIso,
        history: [
          ...request.history,
          {
            action: "Rejected",
            atIso: nowIso,
            byUserId: currentUser.id,
            toStatusId: previousStatusId,
            note: rejectReason.trim(),
          },
        ],
      };
    })
  );

  closeDialog();
  clearSelectedRequest?.();

  onNavigate(previousApproverUserId === currentUser.id ? "pending" : "all");
}

  function openReassignDialog() {
    setReviewDialog("reassign");
  }

  function confirmReassign() {
  if (!activeRecord) return;
  if (!reassignUserId) return;

  const validUser = demoUsers.find((user) => user.id === reassignUserId);
  if (!validUser) return;

  const nowIso = new Date().toISOString();

  setRequests((prev) =>
    prev.map((request) => {
      if (request.id !== activeRecord.id) return request;

      return {
        ...request,
        assignedApproverUserId: validUser.id,
        updatedAtIso: nowIso,
        history: [
          ...request.history,
          {
            action: "Reassigned",
            atIso: nowIso,
            byUserId: currentUser.id,
            toStatusId: request.statusId,
            note: `Reassigned to ${validUser.name}`,
          },
        ],
      };
    })
  );

  closeDialog();
  clearSelectedRequest?.();

  onNavigate(validUser.id === currentUser.id ? "pending" : "all");
}

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header config={config} currentUser={currentUser} onNavigate={onNavigate} />

      <main
        style={{
          width: "100%",
          maxWidth: 1600,
          margin: "0 auto",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 380px",
            gap: 20,
            alignItems: "start",
          }}
        >
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ marginBottom: 20 }}>
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginBottom: 8,
    }}
  >
    {isViewingRecord ? "View Request" : config.actionItem}
  </div>

  <h2 style={{ margin: 0, fontSize: 28, color: "#111827" }}>
    {isViewingRecord ? "Request Details" : "New Request"}
  </h2>

  <p
    style={{
      marginTop: 10,
      marginBottom: 0,
      fontSize: 14,
      color: "#4b5563",
      lineHeight: 1.6,
    }}
  >
    {isViewingRecord
      ? "You are viewing a specific request. Review actions are available only when this request is assigned to you."
      : config.formDescription}
  </p>

  {isViewingRecord && activeRecord && (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 4,
          }}
        >
          Request Number
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {activeRecord.requestNumber}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 4,
          }}
        >
          Status
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {config.statuses.find((status) => status.id === activeRecord.statusId)?.name ??
            activeRecord.statusId}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 4,
          }}
        >
          Assigned To
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {userNameById(activeRecord.assignedApproverUserId)}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 4,
          }}
        >
          Created By
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {userNameById(activeRecord.createdByUserId)}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 4,
          }}
        >
          Created
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {formatAuditTimestamp(activeRecord.createdAtIso)}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 4,
          }}
        >
          Last Updated
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          {formatAuditTimestamp(activeRecord.updatedAtIso)}
        </div>
      </div>
    </div>
  )}
</div>

            <div style={{ marginBottom: 24 }}>
              <StatusStepper
                statuses={config.statuses}
                currentStatusId={activeRecord?.statusId ?? "draft"}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {sections.map((section, index) => (
                <section key={section.id}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: 14,
                    }}
                  >
                    {index + 1} {section.title}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 16,
                    }}
                  >
                    {section.fields.map((field) => (
                      <FieldRenderer
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        error={errors[field.id]}
                        onChange={
                          isViewingRecord && !isEditingDraft
                            ? (_fieldId, _value) => {}
                            : handleFieldChange
                        }
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleBack}
                style={{
                  background: "#ffffff",
                  color: "#111827",
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back
              </button>

              {isViewingRecord ? (
                <>
                  <button
                    onClick={handleExitView}
                    style={{
                      background: "#ffffff",
                      color: "#111827",
                      border: "1px solid #d1d5db",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Return to New Request
                  </button>

                  {isEditingDraft && (
                    <button
                      onClick={handleSave}
                      style={{
                        background: "#111827",
                        color: "#ffffff",
                        border: "1px solid #111827",
                        borderRadius: 10,
                        padding: "10px 16px",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  )}

                  {canReviewActions && (
  <>
                  <button
                    onClick={openRejectDialog}
                    style={{
                      background: "#ffffff",
                      color: "#111827",
                      border: "1px solid #d1d5db",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>

                  <button
                    onClick={openReassignDialog}
                    style={{
                      background: "#ffffff",
                      color: "#111827",
                      border: "1px solid #d1d5db",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Reassign
                  </button>

                  {canApproveRecord && (
                    <button
                      onClick={handleApprove}
                      style={{
                        background: "#111827",
                        color: "#ffffff",
                        border: "1px solid #111827",
                        borderRadius: 10,
                        padding: "10px 16px",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>
                  )}
                </>
              )}

                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    style={{
                      background: "#ffffff",
                      color: "#111827",
                      border: "1px solid #d1d5db",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>

                  <button
                    onClick={handleSubmit}
                    style={{
                      background: "#111827",
                      color: "#ffffff",
                      border: "1px solid #111827",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Submit for approval
                  </button>
                </>
              )}
            </div>
          </section>

          <aside
            style={{
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: 16,
              padding: 14,
              boxSizing: "border-box",
              minHeight: 520,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: 10,
                marginBottom: 12,
              }}
            >
              {(["attachments", "notes", "audit"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "8px 10px",
                    borderBottom:
                      rightTab === tab ? "3px solid #111827" : "3px solid transparent",
                    fontSize: 14,
                    fontWeight: rightTab === tab ? 700 : 600,
                    color: "#111827",
                    cursor: "pointer",
                  }}
                >
                  {tab === "attachments"
                    ? "Attachments"
                    : tab === "notes"
                    ? "Notes"
                    : "Audit"}
                </button>
              ))}
            </div>

            {rightTab === "attachments" && (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {!activeRecord && (
      <div>
        <AttachmentCard />
      </div>
    )}

    {activeRecord && (
      <>
        <div
          style={{
            padding: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#f9fafb",
            fontSize: 14,
            color: "#4b5563",
          }}
        >
          {activeRecord.attachments?.length ?? 0} attachment
          {(activeRecord.attachments?.length ?? 0) === 1 ? "" : "s"}
        </div>

        {(!activeRecord.attachments || activeRecord.attachments.length === 0) && (
          <div
            style={{
              padding: 12,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            No attachments yet.
          </div>
        )}

        {(activeRecord.attachments ?? []).map((attachment) => (
          <div
            key={attachment.id}
            style={{
              padding: 12,
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {attachment.fileName}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Added by {userNameById(attachment.addedByUserId)}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {formatAuditTimestamp(attachment.addedAtIso)}
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            const nowIso = new Date().toISOString();

            setRequests((prev) =>
              prev.map((request) => {
                if (request.id !== activeRecord.id) return request;

                return {
                  ...request,
                  updatedAtIso: nowIso,
                  attachments: [
                    ...(request.attachments ?? []),
                    {
                      id: `att-${crypto.randomUUID()}`,
                      fileName: `Attachment ${(request.attachments ?? []).length + 1}.pdf`,
                      addedAtIso: nowIso,
                      addedByUserId: currentUser.id,
                    },
                  ],
                };
              })
            );
          }}
          style={{
            background: "#ffffff",
            color: "#111827",
            border: "1px solid #d1d5db",
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Add Placeholder Attachment
        </button>
      </>
    )}
  </div>
)}
            {rightTab === "notes" && (
              <div
                style={{
                  padding: 12,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  color: "#6b7280",
                  fontSize: 14,
                }}
              >
                Notes panel placeholder (optional milestone later).
              </div>
            )}

            {rightTab === "audit" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!activeRecord && (
                  <div
                    style={{
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      color: "#6b7280",
                      fontSize: 14,
                    }}
                  >
                    No request selected. Open a request to view audit history.
                  </div>
                )}

                {activeRecord && auditItems.length === 0 && (
                  <div
                    style={{
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      color: "#6b7280",
                      fontSize: 14,
                    }}
                  >
                    No audit activity yet.
                  </div>
                )}

                {activeRecord &&
                  auditItems.map((item, idx) => (
                    <div
                      key={`${item.atIso}-${idx}`}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                          {item.action}
                          {item.toStatusId ? ` | ${item.toStatusId}` : ""}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {formatAuditTimestamp(item.atIso)}
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {userNameById(item.byUserId)}
                      </div>

                      {"note" in item && item.note ? (
                        <div style={{ fontSize: 13, color: "#111827" }}>
                          {String(item.note)}
                        </div>
                      ) : null}
                    </div>
                  ))}
              </div>
            )}
          </aside>
        </div>
      </main>

      {reviewDialog !== "none" && (
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
              maxWidth: 520,
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: 16,
              padding: 20,
              boxSizing: "border-box",
            }}
          >
            {reviewDialog === "reassign" && (
              <>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 10,
                  }}
                >
                  Reassign Reviewer
                </div>

                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 16,
                    fontSize: 14,
                    color: "#4b5563",
                    lineHeight: 1.6,
                  }}
                >
                  Select a new reviewer for this request.
                </p>

                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4b5563",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                  }}
                >
                  Reviewer
                </label>

                <select
                  value={reassignUserId}
                  onChange={(e) => setReassignUserId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    background: "#ffffff",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Select reviewer</option>
                  {reassignOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <button
                    onClick={closeDialog}
                    style={{
                      background: "#ffffff",
                      color: "#111827",
                      border: "1px solid #d1d5db",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmReassign}
                    style={{
                      background: "#111827",
                      color: "#ffffff",
                      border: "1px solid #111827",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Confirm Reassign
                  </button>
                </div>
              </>
            )}

            {reviewDialog === "reject" && (
              <>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 10,
                  }}
                >
                  Reject Request
                </div>

                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 16,
                    fontSize: 14,
                    color: "#4b5563",
                    lineHeight: 1.6,
                  }}
                >
                  Enter a rejection reason before sending this request back.
                </p>

                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#4b5563",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                  }}
                >
                  Rejection Reason
                </label>

                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 120,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    background: "#ffffff",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />

                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <button
                    onClick={closeDialog}
                    style={{
                      background: "#ffffff",
                      color: "#111827",
                      border: "1px solid #d1d5db",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmReject}
                    disabled={!rejectReason.trim()}
                    style={{
                      background: rejectReason.trim() ? "#111827" : "#9ca3af",
                      color: "#ffffff",
                      border: "1px solid #111827",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: rejectReason.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    Confirm Reject
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}