import type { AppConfig, DemoUser, ScreenKey } from "../models/types";

type Props = {
  config: AppConfig;
  currentUser: DemoUser;
  onNavigate: (screen: ScreenKey) => void;
};

export default function Header({ config, currentUser }: Props) {
  const avatarLetter = currentUser.name.charAt(0).toUpperCase();
  const today = new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });

  return (
    <header
      style={{
        background: config.headerColor,
        padding: "0 28px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      {/* Left: logo + app name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
          }}
        >
          📋
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>
            {config.appName}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.2 }}>
            {config.municipality}
          </div>
        </div>
      </div>

      {/* Right: user name + date + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#ffffff" }}>{currentUser.name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{today}</div>
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#3b82f6",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {avatarLetter}
        </div>
      </div>
    </header>
  );
}
