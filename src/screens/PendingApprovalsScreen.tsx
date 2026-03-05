import Header from "../components/Header";
import RequestsTable from "../components/RequestsTable";
import type { AppConfig, DemoUser, ScreenKey, RequestRecord } from "../models/types";

type Props = {
  onNavigate: (screen: ScreenKey) => void;
  config: AppConfig;
  currentUser: DemoUser;
  requests: RequestRecord[];
  getUserName: (id: string | null) => string;
  onOpenRequest: (requestId: string) => void;
};

export default function PendingApprovalsScreen({
  onNavigate,
  config,
  currentUser,
  requests,
  getUserName,
  onOpenRequest,
}: Props) {
  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Header config={config} currentUser={currentUser} onNavigate={onNavigate} />
      <RequestsTable
        title="Pending Approvals"
        description="This table will show all requests submitted through the application."
        currentUser={currentUser}
        mode="pending"
        onNavigate={onNavigate}
        config={config}
        requests={requests}
        getUserName={getUserName}
        onOpenRequest={onOpenRequest}
      />
    </div>
  );
}