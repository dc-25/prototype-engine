export default function AttachmentsCard() {
  return (
    <aside
      style={{
        background: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
        Attachments
      </div>

      <div style={{ marginTop: 10, fontSize: 14, color: "#6b7280" }}>
        This area stays the same for every demo.
      </div>

      <div
        style={{
          marginTop: 14,
          border: "1px dashed #d1d5db",
          borderRadius: 12,
          padding: 16,
          fontSize: 14,
          color: "#6b7280",
        }}
      >
        No files attached
      </div>
    </aside>
  );
}