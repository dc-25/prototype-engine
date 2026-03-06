import { useEffect, useMemo, useState } from "react";
import type { ScreenKey, RequestRecord } from "./models/types";
import { defaultConfig } from "./config/defaultConfig";
import { demoUsers } from "./config/demoUsers";
import { loadJson, saveJson } from "./storage/localStore";

import HomeScreen from "./screens/HomeScreen";
import NewRequestScreen from "./screens/NewRequestScreen";
import AllRequestsScreen from "./screens/AllRequestsScreen";
import MyRequestsScreen from "./screens/MyRequestsScreen";
import PendingApprovalsScreen from "./screens/PendingApprovalsScreen";
import ConfiguratorScreen from "./screens/ConfiguratorScreen";

const STORAGE_KEY = "prototype-engine-requests";

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>("home");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [appConfig, setAppConfig] = useState(defaultConfig);

  const [currentUserId, setCurrentUserId] = useState<string>(demoUsers[0].id);

  const currentUser = useMemo(
    () => demoUsers.find((u) => u.id === currentUserId) ?? demoUsers[0],
    [currentUserId]
  );

  const userById = useMemo(() => new Map(demoUsers.map((u) => [u.id, u])), []);
  const getUserName = (id: string | null) =>
    id ? userById.get(id)?.name ?? "Unknown" : "Unassigned";

  const [requests, setRequests] = useState<RequestRecord[]>(() =>
    loadJson<RequestRecord[]>(STORAGE_KEY, [])
  );

  useEffect(() => {
    saveJson(STORAGE_KEY, requests);
  }, [requests]);

  function handleNavigate(screenKey: ScreenKey) {
    setSelectedRequestId(null);
    setScreen(screenKey);
  }

  function handleOpenRequest(requestId: string) {
    setSelectedRequestId(requestId);
    setScreen("new");
  }

  function clearSelectedRequest() {
    setSelectedRequestId(null);
  }

  function resetRequests() {
    setRequests([]);
    setSelectedRequestId(null);
  }

  return (
    <>
      {/* User switcher (bottom-left) */}
      <div
        style={{
          position: "fixed",
          bottom: 12,
          left: 12,
          zIndex: 2000,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "10px 12px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>User</div>
        <select
          value={currentUserId}
          onChange={(e) => setCurrentUserId(e.target.value)}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: 10,
            padding: "8px 10px",
            fontSize: 14,
            background: "#ffffff",
          }}
        >
          {demoUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Logo slot (bottom-right) */}
     {appConfig.logoUrl ? (
  <img
    src={appConfig.logoUrl}
    alt="Logo"
    style={{
      position: "fixed",
      bottom: 10,
      right: 10,
      zIndex: 2000,
      height: 40,
      width: "auto",
      display: "block",
    }}
  />
) : null}

      {screen === "home" && (
        <HomeScreen 
          onNavigate={handleNavigate} 
          config={appConfig} 
          currentUser={currentUser}
          requests={requests} 
          />
      )}

      {screen === "new" && (
        <NewRequestScreen
          onNavigate={handleNavigate}
          config={appConfig}
          currentUser={currentUser}
          requests={requests}
          setRequests={setRequests}
          selectedRequestId={selectedRequestId}
          clearSelectedRequest={clearSelectedRequest}
        />
      )}

      {screen === "all" && (
        <AllRequestsScreen
          onNavigate={handleNavigate}
          config={appConfig}
          currentUser={currentUser}
          requests={requests}
          getUserName={getUserName}
          onOpenRequest={handleOpenRequest}
        />
      )}

      {screen === "my" && (
        <MyRequestsScreen
          onNavigate={handleNavigate}
          config={appConfig}
          currentUser={currentUser}
          requests={requests}
          getUserName={getUserName}
          onOpenRequest={handleOpenRequest}
        />
      )}

      {screen === "pending" && (
        <PendingApprovalsScreen
          onNavigate={handleNavigate}
          config={appConfig}
          currentUser={currentUser}
          requests={requests}
          getUserName={getUserName}
          onOpenRequest={handleOpenRequest}
        />
      )}

      {screen === "configurator" && (
        <ConfiguratorScreen
          onNavigate={handleNavigate}
          config={appConfig}
          setAppConfig={setAppConfig}
          resetRequests={resetRequests}
          currentUser={currentUser}
        />
      )}
    </>
  );
}