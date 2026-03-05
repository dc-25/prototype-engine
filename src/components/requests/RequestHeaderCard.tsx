type Props = {
  isViewingRecord: boolean;
  formDescription: string;
  actionItem: string;
  activeRecord: {
    requestNumber: string;
    statusId: string;
    assignedApproverUserId: string | null;
    createdByUserId: string;
    createdAtIso: string;
    updatedAtIso: string;
  } | null;
  statusName: string;
  getUserName: (id: string | null) => string;
  formatTimestamp: (iso: string) => string;
};

export default function RequestHeaderCard({
  isViewingRecord,
  formDescription,
  actionItem,
  activeRecord,
  statusName,
  getUserName,
  formatTimestamp,
}: Props) {
  return (
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
        {isViewingRecord ? "View Request" : actionItem}
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
          : formDescription}
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
              {statusName}
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
              {getUserName(activeRecord.assignedApproverUserId)}
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
              {getUserName(activeRecord.createdByUserId)}
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
              {formatTimestamp(activeRecord.createdAtIso)}
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
              {formatTimestamp(activeRecord.updatedAtIso)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}