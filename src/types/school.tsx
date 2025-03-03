import { Role } from "./responses";

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
}

export type Student = {
  firstName: string;
  lastName: string;
  parentEmail: string;
  studentEmail: string;
  guidanceEmail: string;
  adminEmail: string;
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
}

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
}
