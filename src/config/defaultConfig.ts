import type { AppConfig } from "../models/types";

export const defaultConfig: AppConfig = {
  appName: "Prospect Engine",
  municipality: "City of Ottawa",
  category: "Request",
  actionItem: "Information Technology",
  formDescription:
    "Submit, track, and manage requests in one place. Start a new request, review submissions, and follow up on items that need attention.",
  newButtonLabel: "New Request",

  headerColor: "#76a3dd",
  buttonColor: "#5c5d70",
  pillColor: "#76a3dd",
  pillTextColor: "#ffffff",

  // Optional brand logo shown in the UI (e.g., bottom-right). Leave blank for none.
  // Use a data URL via the Configurator upload (recommended), not an external URL.
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