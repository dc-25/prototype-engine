import type { AppConfig } from "../models/types";

export const defaultConfig: AppConfig = {
  appName: "Inspection Manager",
  municipality: "StoneShare Starter Kit",
  category: "Inspection Portal",
  actionItem: "Submit Your Inspection",
  formDescription:
    "Submit, track, and manage inspections in one place. Start a new inspection, review submissions, and follow up on items that need attention.",
  newButtonLabel: "New Inspection",

  headerColor: "#ffffff",
  buttonColor: "#0f172a",
  pillColor: "#f9e4a0",
  pillTextColor: "#78540a",

  // Optional brand logo shown in the UI (e.g., bottom-right). Leave blank for none.
  logoUrl: "",

  statuses: [
    { id: "draft", name: "Draft", approverUserId: null },
    { id: "submitted", name: "Submitted", approverUserId: "grace" },
    { id: "manager-review", name: "Manager Review", approverUserId: "alex" },
    { id: "closed", name: "Closed", approverUserId: null },
  ],
  sections: [
    { id: 1, title: "Basic Information" },
    { id: 2, title: "Travel Requirements" },
  ],
  fields: [
    {
      id: "request-type",
      label: "Request Type",
      type: "choice",
      section: 1,
      required: true,
      options: ["Safety", "Routine", "Urgent"],
    },
    {
      id: "site-name",
      label: "Site Name",
      type: "text",
      section: 1,
      required: true,
    },
    {
      id: "requested-date",
      label: "Requested Date",
      type: "date",
      section: 1,
      required: false,
    },
    {
      id: "details",
      label: "Details",
      type: "multiline",
      section: 2,
      required: false,
    },
  ],
};