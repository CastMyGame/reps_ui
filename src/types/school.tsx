import { Role } from "./responses";

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
};

export type School = {
    schoolIdNumber: string;
    schoolName: string;
    maxPunishLevel: number;
    currency: string;
}
