export type ResourceOption = {
  value: string;
  label: string;
  url: string;
  category: string;
}

export type DropdownOption = {
    value: string;
    label: string;
}

export type StudentDataDTO = {
    studentName: string;
    studentEmail: string;
}

export type TeacherData = {
  fullName: string;
  teacherManagedReferrals: number;
  officeManagedReferrals: number;
  shoutOuts: number;
  behaviorConcerns: number;
}

export type StudentIncident = {
  studentEmail: string;
  firstName: string;
  lastName: string;
  incidents: number;
  percent: string;
}
