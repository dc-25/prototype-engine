import type { StatusConfig } from "../models/types";

type Props = {
  statuses: StatusConfig[];
  currentStatusId?: string;
  activeColor?: string; // NEW: primary button color
};

export default function StatusStepper({ statuses, currentStatusId, activeColor }: Props) {
  const primary = activeColor ?? "#111827";

  const currentIndex =
    currentStatusId !== undefined
      ? statuses.findIndex((item) => item.id === currentStatusId)
      : -1;

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
        const isComplete = currentIndex > index;

        let background = "#ffffff";
        let color = "#374151";
        let border = "1px solid #d1d5db";

        if (isComplete) {
          background = "#e5e7eb";
          color = "#12331b"; // completed text color
        }

        if (isActive) {
          background = primary; // active uses primary color
          color = "#ffffff";
          border = `1px solid ${primary}`;
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