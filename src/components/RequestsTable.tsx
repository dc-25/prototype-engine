import type { CSSProperties } from "react";
import type { AppConfig, DemoUser, ScreenKey, RequestRecord } from "../models/types";
import { getPrimaryButtonStyle } from "./requests/RequestActionBar";

type RequestRow = {
  id: string;
  requestNumber: string;
  requestType: string;
  title: string;
  status: string;
  requestor: string;
  approver: string;
};

type Props = {
  title: string;
  description: string;
  currentUser: DemoUser;
  mode: "all" | "my" | "pending";
  onNavigate: (screen: ScreenKey) => void;
  config: AppConfig;
  requests: RequestRecord[];
  getUserName: (id: string | null) => string;
  onOpenRequest?: (requestId: string) => void;
};

function buildRows(
  requests: RequestRecord[] | undefined,
  mode: "all" | "my" | "pending",
  currentUserId: string,
  getUserName: (id: string | null) => string
): RequestRow[] {
  const safeRequests = Array.isArray(requests) ? requests : [];

  const filtered = safeRequests.filter((r) => {
    if (mode === "my") return r.createdByUserId === currentUserId;
    if (mode === "pending") return r.assignedApproverUserId === currentUserId;
    return true;
  });

  return filtered.map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    requestType: String(r.fieldValues["request-type"] ?? ""),
    title: String(r.fieldValues["site-name"] ?? "Untitled"),
    status: r.statusId,
    requestor: getUserName(r.createdByUserId),
    approver: getUserName(r.assignedApproverUserId),
  }));
}

export default function RequestsTable({
  title,
  description,
  currentUser,
  mode,
  onNavigate,
  config,
  requests,
  getUserName,
  onOpenRequest,
}: Props) {
  const rows = buildRows(requests, mode, currentUser.id, getUserName);

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 1600,
        margin: "0 auto",
        padding: "20px 24px 32px",
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          minHeight: "calc(100vh - 140px)",
        }}
      >
        <div style={{ padding: "24px 20px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: 18,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 28, color: "#111827" }}>{title}</h2>
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  fontSize: 14,
                  color: "#4b5563",
                }}
              >
                {description}
              </p>
            </div>

            <button
              onClick={() => onNavigate("new")}
              style={{
                ...getPrimaryButtonStyle(config.buttonColor),
                borderRadius: 12,
              }}
            >
              New Request
            </button>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: 16,
            margin: "0 20px 20px",
            padding: 14,
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#4b5563",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 10,
              }}
            >
              Filters
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>Request Type</label>
                <select style={inputStyle} defaultValue="All">
                  <option>All</option>
                  <option>Safety</option>
                  <option>Routine</option>
                  <option>Urgent</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Requestor</label>
                <input
                  value={mode === "my" ? currentUser.name : ""}
                  readOnly
                  placeholder="Filter by requestor"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Approver</label>
                <input
                  value={mode === "pending" ? currentUser.name : ""}
                  readOnly
                  placeholder="Filter by approver"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: 16,
            margin: "0 20px 20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Results</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>{rows.length} record(s)</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f9fafb" }}>
                <tr>
                  <th style={thStyle}>Request #</th>
                  <th style={thStyle}>Request Type</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Requestor</th>
                  <th style={thStyle}>Approver</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onOpenRequest?.(row.id)}
                    style={{
                      cursor: onOpenRequest ? "pointer" : "default",
                    }}
                  >
                    <td style={tdStyle}>{row.requestNumber}</td>
                    <td style={tdStyle}>{row.requestType}</td>
                    <td style={tdStyle}>{row.title}</td>
                    <td style={tdStyle}>{row.status}</td>
                    <td style={tdStyle}>{row.requestor}</td>
                    <td style={tdStyle}>{row.approver}</td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td style={emptyCellStyle} colSpan={6}>
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#4b5563",
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

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  fontSize: 12,
  fontWeight: 700,
  color: "#4b5563",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle: CSSProperties = {
  padding: "14px 16px",
  fontSize: 14,
  color: "#111827",
  borderBottom: "1px solid #e5e7eb",
};

const emptyCellStyle: CSSProperties = {
  padding: "24px 16px",
  fontSize: 14,
  color: "#6b7280",
  textAlign: "center",
};