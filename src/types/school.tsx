import { OfficeReferralCode, Role } from "./responses";

export type UserModel = {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  roles: RoleModel[];
};

export type RoleModel = {
  id: string;
  role: string;
};

export type Student = {
  firstName: string;
  lastName: string;
  address:string;
  parentEmail: string;
  studentEmail: string;
  guidanceEmail: string;
  adminEmail: string;
  parentPhoneNumber: string;
  studentPhoneNumber: string;
  grade: string;
  points: number;
  school: string;
  currency: number;
  spotters: string[];
};

export type Employee = {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  isArchived: boolean;
  archivedBy: string;
  archivedExplanation: string;
  archivedOn: Date;
  currency: number;
  stateEmployeeId: number;
  classes: ClassRoster[];
};

export type School = {
  schoolIdNumber: string;
  schoolName: string;
  maxPunishLevel: number;
  currency: string;
};

// Define the props type
export interface DetentionTimerProps {
  studentEmail: string; // Student email is used instead of ID
}

export interface TimeBank {
  hours: number;
  minutes: number;
}

export type ClassRoster = {
  className: string;
  classPeriod: string;
  classRoster: string[];
  punishmentsThisWeek: number;
};

export type Assignment = {
  assignmentId: string;
  infractionName: string;
  level: number;
  questions: AssignmentQuestion[];
};

export type AssignmentQuestion = {
  question: string;
  type: string;
  title: string;
  body: string;
  radioAnswers: { [key: string]: RadioAnswer };
  textToCompare: string;
  references: string[];
};

export type RadioAnswer = {
  value: boolean;
  label: string;
};

export type PhoneLog = {
  isPhoneLogBoolean: boolean;
  phoneLogDescription: string;
};

export type StudentOption = {
  value: string;
  label: string;
};

export type ReferralPayload = {
  studentEmail: string;
  teacherEmail: string;
  infractionPeriod: string;
  infractionName: string;
  infractionDescription: string;
  currency: number;
  guidanceDescription: string;
  phoneLogDescription: string;
};

export type OfficeReferralPayload = {
  studentEmail: string;
  teacherEmail: string;
  classPeriod: string;
  referralCode: OfficeReferralCode;
  referralDescription: string;
  currency: number;
  guidanceDescription?: string;
  phoneLogDescription?: string;
};
