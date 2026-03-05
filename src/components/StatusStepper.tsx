import type { StatusConfig } from "../models/types";

type Props = {
  statuses: StatusConfig[];
  currentStatusId?: string;
};

export default function StatusStepper({ statuses, currentStatusId }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${statuses.length}, minmax(0, 1fr))`,
        gap: 12,
        width: "100%",
      }}
    >
      {statuses.map((status, index) => {
        const isActive = status.id === currentStatusId;
        const isComplete =
          currentStatusId !== undefined &&
          statuses.findIndex((item) => item.id === currentStatusId) > index;

        let background = "#ffffff";
        let color = "#374151";
        let border = "1px solid #d1d5db";

        if (isComplete) {
          background = "#e5e7eb";
          color = "#111827";
        }

        if (isActive) {
          background = "#111827";
          color = "#ffffff";
          border = "1px solid #111827";
        }

        return (
          <div
            key={status.id}
            style={{
              border,
              background,
              color,
              borderRadius: 12,
              padding: "12px 14px",
              minHeight: 72,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                opacity: 0.8,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 6,
              }}
            >
              Step {index + 1}
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {status.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}