import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Header from "../components/Header";
import StatusStepper from "../components/StatusStepper";
import FieldRenderer from "../components/FieldRenderer";
import ReviewDialogModal from "../components/requests/ReviewDialogModal";
import RequestHeaderCard from "../components/requests/RequestHeaderCard";
import RequestActionBar, {
  getPrimaryButtonStyle,
  secondaryButtonStyle,
} from "../components/requests/RequestActionBar";
import RequestSidePanel from "../components/requests/RequestSidePanel";
import { demoUsers } from "../config/demoUsers";
import type {
  AppConfig,
  DemoUser,
  ScreenKey,
  RequestAttachment,
  RequestNote,
  RequestRecord,
} from "../models/types";
import { validateRequiredFields } from "../utils/validation";
import {
  canAdvanceStatus,
  getApproverForStatus,
  getNextStatusId,
  getStatusIndex,
} from "../utils/statusFlow";
import { buildRequestNumber, formatAuditTimestamp, getInitialValues } from "../utils/requestUtils";

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

type ImageValue = {
  fileName: string;
  dataUrl: string;
};

function isImageValue(value: unknown): value is ImageValue {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.fileName === "string" && typeof v.dataUrl === "string";
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

  // Attachments for a brand-new (unsaved) request
  const [draftAttachments, setDraftAttachments] = useState<RequestAttachment[]>([]);

  // Notes for a brand-new (unsaved) request
  const [draftNotes, setDraftNotes] = useState<RequestNote[]>([]);

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
    return demoUsers.filter((user) => user.id !== activeRecord.assignedApproverUserId);
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

  const activeStatusName = useMemo(() => {
    if (!activeRecord) return "";
    return (
      config.statuses.find((status) => status.id === activeRecord.statusId)?.name ??
      activeRecord.statusId
    );
  }, [activeRecord, config.statuses]);

  useEffect(() => {
    if (!activeRecord) {
      setValues(getInitialValues(config.fields));
      setErrors({});
      setDraftAttachments([]);
      setDraftNotes([]);
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

  function addImageAttachment(fileName: string, dataUrl: string) {
    const nowIso = new Date().toISOString();
    const attachment: RequestAttachment = {
      id: `att-${crypto.randomUUID()}`,
      fileName,
      addedAtIso: nowIso,
      addedByUserId: currentUser.id,
      kind: "image",
      previewUrl: dataUrl,
    };

    if (activeRecord) {
      setRequests((prev) =>
        prev.map((request) => {
          if (request.id !== activeRecord.id) return request;
          return {
            ...request,
            updatedAtIso: nowIso,
            attachments: [...(request.attachments ?? []), attachment],
          };
        })
      );
      return;
    }

    setDraftAttachments((prev) => [...prev, attachment]);
  }

  function addNote(text: string, mentionedUserIds: string[]) {
    const nowIso = new Date().toISOString();
    const note: RequestNote = {
      id: `note-${crypto.randomUUID()}`,
      text,
      createdAtIso: nowIso,
      createdByUserId: currentUser.id,
      mentionedUserIds,
    };

    if (activeRecord) {
      setRequests((prev) =>
        prev.map((request) => {
          if (request.id !== activeRecord.id) return request;
          return {
            ...request,
            updatedAtIso: nowIso,
            notes: [...(request.notes ?? []), note],
          };
        })
      );
      return;
    }

    setDraftNotes((prev) => [...prev, note]);
  }

  function handleFieldChange(fieldId: string, value: unknown) {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    const field = config.fields.find((f) => f.id === fieldId);
    if (field?.type === "image" && isImageValue(value)) {
      addImageAttachment(value.fileName, value.dataUrl);
    }

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
    setDraftAttachments([]);
    setDraftNotes([]);
  }

  function handleBack() {
    closeDialog();
    clearSelectedRequest?.();
    onNavigate("home");
  }

  function buildRecord(statusId: string): RequestRecord {
    const nowIso = new Date().toISOString();
    const requestNumber = buildRequestNumber();

    const assignedApproverUserId =
      statusId === "draft" ? null : getApproverForStatus(config.statuses, statusId);

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
      attachments: [...draftAttachments],
      notes: [...draftNotes],
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
    setDraftAttachments([]);
    setDraftNotes([]);
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
    setDraftAttachments([]);
    setDraftNotes([]);
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

  function addPlaceholderAttachment() {
    if (!activeRecord) return;

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
              kind: "file",
            },
          ],
        };
      })
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <Header config={config} currentUser={currentUser} onNavigate={onNavigate} />

      <main
        style={{
          width: "100%",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #e5e7eb" }}>
          <StatusStepper
            statuses={config.statuses}
            currentStatusId={activeRecord?.statusId ?? "draft"}
            activeColor={config.buttonColor}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 380px",
            gap: 32,
            alignItems: "start",
          }}
        >
          <section style={{ background: "#ffffff", padding: "0 0 24px 0" }}>
            <RequestHeaderCard
              isViewingRecord={isViewingRecord}
              formDescription={config.formDescription}
              actionItem={config.actionItem}
              activeRecord={
                activeRecord
                  ? {
                      requestNumber: activeRecord.requestNumber,
                      statusId: activeRecord.statusId,
                      assignedApproverUserId: activeRecord.assignedApproverUserId,
                      createdByUserId: activeRecord.createdByUserId,
                      createdAtIso: activeRecord.createdAtIso,
                      updatedAtIso: activeRecord.updatedAtIso,
                    }
                  : null
              }
              statusName={activeStatusName}
              getUserName={userNameById}
              formatTimestamp={formatAuditTimestamp}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {sections.map((section, index) => (
                <section key={section.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div
                      style={{
                        width: 4,
                        height: 32,
                        borderRadius: 999,
                        background: config.buttonColor,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: config.buttonColor,
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                      {section.title}
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#e5e7eb", marginBottom: 20 }} />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 16,
                    }}
                  >
                    {section.fields.map((field) => {
                      const layout = field.layout ?? "half";
                      const colSpan =
                        layout === "full" ? 4 : layout === "quarter" ? 1 : 2;
                      return (
                        <div key={field.id} style={{ gridColumn: `span ${colSpan}` }}>
                          <FieldRenderer
                            field={field}
                            value={values[field.id]}
                            error={errors[field.id]}
                            onChange={
                              isViewingRecord && !isEditingDraft
                                ? (_fieldId, _value) => {}
                                : handleFieldChange
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <RequestActionBar>
              <button onClick={handleBack} style={secondaryButtonStyle}>
                Back
              </button>

              {isViewingRecord ? (
                <>
                  <button onClick={handleExitView} style={secondaryButtonStyle}>
                    Return to New Request
                  </button>

                  {isEditingDraft && (
                    <button onClick={handleSave} style={getPrimaryButtonStyle(config.buttonColor)}>
                      Save
                    </button>
                  )}

                  {canReviewActions && (
                    <>
                      <button onClick={openRejectDialog} style={secondaryButtonStyle}>
                        Reject
                      </button>

                      <button onClick={openReassignDialog} style={secondaryButtonStyle}>
                        Reassign
                      </button>

                      {canApproveRecord && (
                        <button
                          onClick={handleApprove}
                          style={getPrimaryButtonStyle(config.buttonColor)}
                        >
                          Approve
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <button onClick={handleSave} style={secondaryButtonStyle}>
                    Save
                  </button>

                  <button
                    onClick={handleSubmit}
                    style={getPrimaryButtonStyle(config.buttonColor)}
                  >
                    Submit for approval
                  </button>
                </>
              )}
            </RequestActionBar>
          </section>

          <RequestSidePanel
            buttonColor={config.buttonColor}
            rightTab={rightTab}
            setRightTab={setRightTab}
            activeRecord={activeRecord}
            draftAttachments={draftAttachments}
            draftNotes={draftNotes}
            auditItems={auditItems}
            getUserName={userNameById}
            formatTimestamp={formatAuditTimestamp}
            onAddPlaceholderAttachment={addPlaceholderAttachment}
            mentionCandidates={demoUsers}
            onAddNote={addNote}
          />
        </div>
      </main>

      <ReviewDialogModal
        reviewDialog={reviewDialog}
        rejectReason={rejectReason}
        reassignUserId={reassignUserId}
        reassignOptions={reassignOptions}
        buttonColor={config.buttonColor}
        onClose={() => closeDialog()}
        onRejectReasonChange={setRejectReason}
        onReassignUserIdChange={setReassignUserId}
        onConfirmReject={confirmReject}
        onConfirmReassign={confirmReassign}
      />
    </div>
  );
}