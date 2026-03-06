import { useMemo, useState } from "react";
import type { DemoUser, RequestAttachment, RequestNote, RequestRecord } from "../../models/types";
import AttachmentCard from "../AttachmentCard";
import { getPrimaryButtonStyle, secondaryButtonStyle } from "./RequestActionBar";

type RightTab = "attachments" | "notes" | "audit";

type AuditItem = {
  action: string;
  atIso: string;
  byUserId: string;
  toStatusId?: string;
  note?: string;
};

type Props = {
  buttonColor: string;
  rightTab: RightTab;
  setRightTab: (tab: RightTab) => void;

  activeRecord: RequestRecord | null;

  // draft (unsaved) support
  draftAttachments: RequestAttachment[];
  draftNotes: RequestNote[];

  auditItems: AuditItem[];
  getUserName: (id: string | null) => string;
  formatTimestamp: (iso: string) => string;

  onAddPlaceholderAttachment: () => void;

  // notes
  mentionCandidates: DemoUser[];
  onAddNote: (text: string, mentionedUserIds: string[]) => void;
};

function extractMentionedUserIds(text: string, candidates: DemoUser[]) {
  // Finds @something tokens and matches them to user names (case-insensitive).
  // Example: "@Alex" matches "Alex Johnson" if it starts with alex, or exact match.
  const tokens = text.match(/@([^\s@]{1,30}(?:\s[^\s@]{1,30})?)/g) ?? [];
  const mentioned = new Set<string>();

  for (const raw of tokens) {
    const needle = raw.slice(1).trim().toLowerCase();
    if (!needle) continue;

    const match = candidates.find((u) => u.name.toLowerCase() === needle) ??
      candidates.find((u) => u.name.toLowerCase().startsWith(needle));

    if (match) mentioned.add(match.id);
  }

  return Array.from(mentioned);
}

export default function RequestSidePanel({
  buttonColor,
  rightTab,
  setRightTab,
  activeRecord,
  draftAttachments,
  draftNotes,
  auditItems,
  getUserName,
  formatTimestamp,
  onAddPlaceholderAttachment,
  mentionCandidates,
  onAddNote,
}: Props) {
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const [noteText, setNoteText] = useState("");

  const attachments = useMemo(() => {
    if (activeRecord) return activeRecord.attachments ?? [];
    return draftAttachments ?? [];
  }, [activeRecord, draftAttachments]);

  const notes = useMemo(() => {
    if (activeRecord) return activeRecord.notes ?? [];
    return draftNotes ?? [];
  }, [activeRecord, draftNotes]);

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
              borderBottom: rightTab === tab ? "3px solid #111827" : "3px solid transparent",
              fontSize: 14,
              fontWeight: rightTab === tab ? 700 : 600,
              color: "#111827",
              cursor: "pointer",
            }}
          >
            {tab === "attachments" ? "Attachments" : tab === "notes" ? "Notes" : "Audit"}
          </button>
        ))}
      </div>

      {/* Attachments */}
      {rightTab === "attachments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!activeRecord && attachments.length === 0 && (
            <div>
              <AttachmentCard />
            </div>
          )}

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
            {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
          </div>

          {attachments.length === 0 && (
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

          {attachments.map((attachment) => {
            const isImage = attachment.kind === "image" && !!attachment.previewUrl;

            return (
              <div
                key={attachment.id}
                style={{
                  padding: 12,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
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

                {isImage && (
                  <button
                    onClick={() =>
                      setPreview({
                        url: attachment.previewUrl as string,
                        title: attachment.fileName,
                      })
                    }
                    style={{
                      ...secondaryButtonStyle,
                      alignSelf: "flex-start",
                      padding: "8px 12px",
                      fontSize: 13,
                    }}
                  >
                    View
                  </button>
                )}
              </div>
            );
          })}

          {activeRecord && (
            <button onClick={onAddPlaceholderAttachment} style={secondaryButtonStyle}>
              Add Placeholder Attachment
            </button>
          )}
        </div>
      )}

      {/* Notes */}
      {rightTab === "notes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            {notes.length} note{notes.length === 1 ? "" : "s"}
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Add a note
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type a note... Use @Name to mention someone."
              style={{
                width: "100%",
                minHeight: 90,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                fontSize: 14,
                background: "#ffffff",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setNoteText("")}
                style={{ ...secondaryButtonStyle, padding: "8px 12px", fontSize: 13 }}
              >
                Clear
              </button>

              <button
                onClick={() => {
                  const trimmed = noteText.trim();
                  if (!trimmed) return;

                  const mentionedUserIds = extractMentionedUserIds(trimmed, mentionCandidates);
                  onAddNote(trimmed, mentionedUserIds);
                  setNoteText("");
                }}
                disabled={!noteText.trim()}
                style={{
                  ...getPrimaryButtonStyle(buttonColor, { disabled: !noteText.trim() }),
                  padding: "8px 12px",
                  fontSize: 13,
                }}
              >
                Add Note
              </button>
            </div>

            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Tip: type <span style={{ fontWeight: 700, color: "#111827" }}>@Alex</span> or{" "}
              <span style={{ fontWeight: 700, color: "#111827" }}>@Grace</span> to tag someone.
            </div>
          </div>

          {notes.length === 0 && (
            <div
              style={{
                padding: 12,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              No notes yet.
            </div>
          )}

          {notes
            .slice()
            .sort((a, b) => (a.createdAtIso < b.createdAtIso ? 1 : -1))
            .map((note) => (
              <div
                key={note.id}
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    {getUserName(note.createdByUserId)}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {formatTimestamp(note.createdAtIso)}
                  </div>
                </div>

                <div style={{ fontSize: 14, color: "#111827", lineHeight: 1.5 }}>
                  {note.text}
                </div>

                {note.mentionedUserIds.length > 0 && (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Mentions:{" "}
                    <span style={{ color: "#111827", fontWeight: 600 }}>
                      {note.mentionedUserIds.map((id) => getUserName(id)).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Audit */}
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
                    {formatTimestamp(item.atIso)}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#6b7280" }}>{getUserName(item.byUserId)}</div>

                {item.note ? (
                  <div style={{ fontSize: 13, color: "#111827" }}>{item.note}</div>
                ) : null}
              </div>
            ))}
        </div>
      )}

      {/* Image preview modal */}
      {preview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17, 24, 39, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 2000,
          }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: 16,
              padding: 16,
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{preview.title}</div>
              <button onClick={() => setPreview(null)} style={secondaryButtonStyle}>
                Close
              </button>
            </div>

            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
              }}
            >
              <img
                src={preview.url}
                alt={preview.title}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}