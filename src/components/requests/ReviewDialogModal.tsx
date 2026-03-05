import type { CSSProperties } from "react";
import type { DemoUser } from "../../models/types";

type ReviewDialogMode = "none" | "reject" | "reassign";

type Props = {
  reviewDialog: ReviewDialogMode;
  rejectReason: string;
  reassignUserId: string;
  reassignOptions: DemoUser[];
  buttonColor: string;
  onClose: () => void;
  onRejectReasonChange: (value: string) => void;
  onReassignUserIdChange: (value: string) => void;
  onConfirmReject: () => void;
  onConfirmReassign: () => void;
};

const actionButtonBaseStyle: CSSProperties = {
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  ...actionButtonBaseStyle,
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
};

function getPrimaryButtonStyle(
  color: string,
  options?: { disabled?: boolean; disabledColor?: string }
): CSSProperties {
  const isDisabled = options?.disabled ?? false;
  const disabledColor = options?.disabledColor ?? "#9ca3af";
  const activeColor = isDisabled ? disabledColor : color;

  return {
    ...actionButtonBaseStyle,
    background: activeColor,
    color: "#ffffff",
    border: `1px solid ${activeColor}`,
    cursor: isDisabled ? "not-allowed" : "pointer",
  };
}

export default function ReviewDialogModal({
  reviewDialog,
  rejectReason,
  reassignUserId,
  reassignOptions,
  buttonColor,
  onClose,
  onRejectReasonChange,
  onReassignUserIdChange,
  onConfirmReject,
  onConfirmReassign,
}: Props) {
  if (reviewDialog === "none") return null;

  const isRejectDisabled = !rejectReason.trim();

  return (
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
              onChange={(e) => onReassignUserIdChange(e.target.value)}
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
              <button onClick={onClose} style={secondaryButtonStyle}>
                Cancel
              </button>

              <button
                onClick={onConfirmReassign}
                style={getPrimaryButtonStyle(buttonColor)}
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
              onChange={(e) => onRejectReasonChange(e.target.value)}
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
              <button onClick={onClose} style={secondaryButtonStyle}>
                Cancel
              </button>

              <button
                onClick={onConfirmReject}
                disabled={isRejectDisabled}
                style={getPrimaryButtonStyle(buttonColor, {
                  disabled: isRejectDisabled,
                })}
              >
                Confirm Reject
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}