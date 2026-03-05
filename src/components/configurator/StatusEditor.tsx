import type { CSSProperties } from "react";
import { demoUsers } from "../../config/demoUsers";
import type { StatusConfig } from "../../models/types";
import { makeUniqueId, normalizeStatuses, slugify } from "../../utils/configBuilder";

type Props = {
  statuses: StatusConfig[];
  onChange: (next: StatusConfig[]) => void;
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#4b5563",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 6,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#ffffff",
  boxSizing: "border-box",
};

const secondaryButtonStyle: CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const dangerButtonStyle: CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "8px 10px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export default function StatusEditor({ statuses, onChange }: Props) {
  const approverOptions = [{ id: "", name: "Unassigned" }, ...demoUsers];

  function updateStatuses(next: StatusConfig[]) {
    onChange(normalizeStatuses(next));
  }

  function handleStatusNameChange(index: number, name: string) {
    const next = [...statuses];
    next[index] = { ...next[index], name };

    if (index !== 0) {
      const used = new Set(next.map((s, i) => (i === index ? "" : s.id)).filter(Boolean));
      const base = slugify(name) || "status";
      const unique = makeUniqueId(base, used);
      next[index] = { ...next[index], id: unique };
    }

    updateStatuses(next);
  }

  function handleStatusApproverChange(index: number, approverUserId: string) {
    const next = [...statuses];

    if (index === 0 || index === next.length - 1) {
      next[index] = { ...next[index], approverUserId: null };
      updateStatuses(next);
      return;
    }

    next[index] = { ...next[index], approverUserId: approverUserId || null };
    updateStatuses(next);
  }

  function addStatus() {
    const next = [...statuses];
    const insertIndex = next.length >= 2 ? next.length - 1 : next.length;
    const used = new Set(next.map((s) => s.id));
    const baseId = makeUniqueId("review", used);

    next.splice(insertIndex, 0, {
      id: baseId,
      name: "New Stage",
      approverUserId: demoUsers[0]?.id ?? null,
    });

    updateStatuses(next);
  }

  function removeStatus(index: number) {
    if (index === 0 || index === statuses.length - 1) return;
    updateStatuses(statuses.filter((_, i) => i !== index));
  }

  return (
    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>Statuses</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Draft is always first (unassigned). Final stage is always unassigned.
          </div>
        </div>

        <button onClick={addStatus} style={secondaryButtonStyle}>
          Add Status
        </button>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {statuses.map((status, idx) => {
          const isDraft = idx === 0;
          const isFinal = idx === statuses.length - 1;

          return (
            <div
              key={`${status.id}-${idx}`}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 14,
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr auto",
                gap: 12,
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>
                  Name {isDraft ? "(Draft)" : isFinal ? "(Final)" : ""}
                </label>
                <input
                  value={status.name}
                  onChange={(e) => handleStatusNameChange(idx, e.target.value)}
                  style={inputStyle}
                  disabled={isDraft}
                />
              </div>

              <div>
                <label style={labelStyle}>ID</label>
                <input value={status.id} style={inputStyle} disabled />
              </div>

              <div>
                <label style={labelStyle}>Approver</label>
                <select
                  value={status.approverUserId ?? ""}
                  onChange={(e) => handleStatusApproverChange(idx, e.target.value)}
                  style={inputStyle}
                  disabled={isDraft || isFinal}
                >
                  {approverOptions.map((opt) => (
                    <option key={opt.id || "none"} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {!isDraft && !isFinal ? (
                  <button onClick={() => removeStatus(idx)} style={dangerButtonStyle}>
                    Remove
                  </button>
                ) : (
                  <div style={{ width: 80 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}