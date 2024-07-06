export interface Dropdown {
  label: string;
  panel: string;
}

export interface ButtonData {
  label: string;
  panel: string;
  multi: boolean;
  dropdowns: Dropdown[];
}

export const guidanceButtonData: ButtonData[] = [
  {
    label: "OVERVIEW",
    panel: "overview",
    multi: false,
    dropdowns: [],
  },
  {
    label: "REPORTS",
    panel: "reports",
    multi: true,
    dropdowns: [
      { label: "BY STUDENTS", panel: "report-student" },
      { label: "BY TEACHERS", panel: "report-teacher" },
    ],
  },
  {
    label: "PARENT CONTACT",
    panel: "contacts",
    multi: true,
    dropdowns: [
      { label: "NEW REFERRAL CONTACT", panel: "new-referral-contact" },
      { label: "EXISTING PARENT CONTACT", panel: "existing-parent-contact" },
    ],
  },
  {
    label: "TOOLS",
    panel: "tools",
    multi: true,
    dropdowns: [
      { label: "CREATE/ASSIGNMENT", panel: "create-assignment" },
      { label: "CREATE A STUDENT/TEACHER", panel: "create-user" },
      { label: "ARCHIVED", panel: "archvied-records" },
    ],
  },
  // {
  //   label: "CONTACT US",
  //   panel: "contact-us",
  //   multi: false,
  //   dropdowns: []
  // },
  {
    label: "DETENTION/LIST",
    panel: "detention",
    multi: false,
    dropdowns: [],
  },
  // {
  //   label: "STORE REDEEM",
  //   panel: "redeem",
  //   multi: false,
  //   dropdowns: []
  // },
];
