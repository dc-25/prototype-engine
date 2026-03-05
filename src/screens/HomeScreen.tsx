import Header from "../components/Header";
import type { AppConfig, DemoUser, ScreenKey } from "../models/types";
import { getPrimaryButtonStyle } from "../components/requests/RequestActionBar";

type Props = {
  onNavigate: (screen: ScreenKey) => void;
  config: AppConfig;
  currentUser: DemoUser;
};

const NAV_ITEMS: { screen: ScreenKey; label: string; description: string; icon: string }[] = [
  { screen: "my", label: "My Requests", description: "View and manage your requests", icon: "📋" },
  { screen: "pending", label: "Pending Approvals", description: "Review items awaiting action", icon: "⏱" },
  { screen: "all", label: "All Requests", description: "Browse all submitted requests", icon: "🗂" },
  { screen: "configurator", label: "Settings", description: "Update application settings", icon: "⚙️" },
];

export default function HomeScreen({ onNavigate, config, currentUser }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Header config={config} currentUser={currentUser} onNavigate={onNavigate} />

      {/* Full-height split below header */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── LEFT PANEL: 60%, light gray ── */}
        <div
          style={{
            flex: "0 0 50%",
            background: "#eef0f4",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px 72px",
            overflowY: "auto",
          }}
        >
          {/* Pill badge */}
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              background: config.pillColor,
              color: config.pillTextColor,
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              borderRadius: 999,
              padding: "5px 14px",
              marginBottom: 22,
            }}
          >
            {config.actionItem}
          </div>

          {/* Heading */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.1,
              marginBottom: 20,
              maxWidth: 520,
            }}
          >
            {config.newButtonLabel ? `Submit Your ${config.category || "Request"}` : "Welcome"}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 15,
              color: "#475569",
              lineHeight: 1.65,
              maxWidth: 480,
              marginBottom: 32,
            }}
          >
            {config.formDescription}
          </div>

          {/* CTA button */}
          <button
            onClick={() => onNavigate("new")}
            style={{
              ...getPrimaryButtonStyle(config.buttonColor),
              alignSelf: "flex-start",
              padding: "13px 24px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.01em",
              border: `1px solid ${config.buttonColor}`,
            }}
          >
            {config.newButtonLabel}
          </button>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 52,
              paddingTop: 32,
              borderTop: "1px solid #d1d5db",
            }}
          >
            {[
              { value: "3", label: "Draft" },
              { value: "3", label: "Pending" },
              { value: "5", label: "Completed" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>Updated every 15 minutes</div>
        </div>

        {/* ── RIGHT PANEL: 40%, white ── */}
        <div
          style={{
            flex: "0 0 50%",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px 48px",
            borderLeft: "1px solid #e2e8f0",
            overflowY: "auto",
          }}
        >
          {/* Section label */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 20,
            }}
          >
            Quick Access
          </div>

          {/* Nav cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 500 }}>
            {NAV_ITEMS.map(({ screen, label, description, icon }) => (
              <button
                key={screen}
                onClick={() => onNavigate(screen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "16px 20px",
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#e8eef7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>{description}</div>
                </div>

                {/* Arrow */}
                <div style={{ color: "#94a3b8", fontSize: 18, flexShrink: 0 }}>→</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}