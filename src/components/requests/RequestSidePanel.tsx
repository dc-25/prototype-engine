import type { RequestRecord } from "../../models/types";
import AttachmentCard from "../AttachmentCard";
import { secondaryButtonStyle } from "./RequestActionBar";

type RightTab = "attachments" | "notes" | "audit";

type AuditItem = {
  action: string;
  atIso: string;
  byUserId: string;
  toStatusId?: string;
  note?: string;
};

type Props = {
  rightTab: RightTab;
  setRightTab: (tab: RightTab) => void;
  activeRecord: RequestRecord | null;
  auditItems: AuditItem[];
  getUserName: (id: string | null) => string;
  formatTimestamp: (iso: string) => string;
  onAddPlaceholderAttachment: () => void;
};

export default function RequestSidePanel({
  rightTab,
  setRightTab,
  activeRecord,
  auditItems,
  getUserName,
  formatTimestamp,
  onAddPlaceholderAttachment,
}: Props) {
  return (
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
                    Added by {getUserName(attachment.addedByUserId)}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {formatTimestamp(attachment.addedAtIso)}
                  </div>
                </div>
              ))}

              <button onClick={onAddPlaceholderAttachment} style={secondaryButtonStyle}>
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                    {item.action}
                    {item.toStatusId ? ` | ${item.toStatusId}` : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {formatTimestamp(item.atIso)}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {getUserName(item.byUserId)}
                </div>

                {item.note ? (
                  <div style={{ fontSize: 13, color: "#111827" }}>{item.note}</div>
                ) : null}
              </div>
            ))}
        </div>
      )}
    </aside>
  );
}