import { Employee, School, Student } from "./school";

export interface Role {
  role: string;
  id: string;
}

export interface OfficeReferralCode {
  codeKey: number;
  codeName: string;
}

export interface GuidanceResponse {
  guidanceId: string;
  studentEmail: string;
  schoolName: string;
  timeCreated: Date | null;
  teacherEmail: string;
  guidanceEmail: string;
  referralDescription: [string];
  status: string;
  notesArray: [string];
  linkToPunishment: string;
  followUpDate: Date | null;
}

export interface StudentResponse {
  studentIdNumber: string;
  address: string;
  schoolName: string;
  adminEmail: string | null;
  firstName: string;
  lastName: string;
  grade: string;
  notesArray: null | [];
  parentPhoneNumber: string;
  studentPhoneNumber: string;
  studentEmail: string;
  points: number;
}

export interface TeacherResponse {
  employeeId: string;
  schoolName: string;
  firstName: string;
  lastName: string;
  roles: null | [Role];
  currency: number;
  email: string;
}

export interface OfficeReferralResponse {
  officeReferralId: string;
  referralCode: OfficeReferralCode;
  studentEmail: string;
  adminEmail: string;
  teacherEmail: string;
  schoolName: string;
  status: string;
  closedExplanation: string;
  timeCreated: null | [];
  referralDescription: string[];
  followUpDate: null | [];
}

export interface TeacherReferral {
  punishmentId: string;
  studentEmail: string;
  schoolName: string;
  infractionName: string;
  infractionLevel: string;
  status: string;
  closedTimes: number;
  closedExplanation: string;
  timeCreated: Date;
  timeClosed: Date;
  classPeriod: string;
  teacherEmail: string;
  isArchived: boolean;
  isStateFiled: boolean;
  stateIncidentNumber: string;
  archivedBy: string;
  archivedExplanation: string;
  archivedOn: Date;
  mapIndex: number;
  infractionDescription: string[];
}

export interface TeacherDto {
  studentEmail: string;
  studentFirstName: string;
  studentLastName: string;
  infractionName: string;
  timeCreated: Date;
  infractionDescription: string[];
  classPeriod: string;
  teacherEmail: string;
  status: string;
  infractionLevel: string;
}

export interface TeacherOverviewDto {
  punishmentResponse?: TeacherDto[];
  writeUpResponse?: TeacherDto[];
  shoutOutsResponse?: TeacherDto[];
  officeReferrals?: TeacherDto[];
  teacher?: Employee;
  school?: School;
  students?: Student[];
}

export interface AdminOverviewDto {
  punishmentResponse: TeacherDto[];
  writeUpResponse: TeacherDto[];
  shoutOutsResponse: TeacherDto[];
  teacher: Employee;
  school: School;
  teachers: Employee[];
  officeReferrals: TeacherDto[];
  students: Student[];
}

export interface PunishmentDto {
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  punishment: TeacherReferral;
}

export interface OfficeReferral {
  officeReferralId: string;
  referralCode: OfficeReferralCode;
  infractionLevel: string;
  studentEmail: string;
  adminEmail: string;
  schoolName: string;
  status: string;
  closedExplanation: string;
  timeCreated: Date;
  timeClosed: Date;
  classPeriod: string;
  isArchived: boolean;
  isStateFiled: boolean;
  stateIncidentNumber: string;
  archivedBy: string;
  archivedExplanation: string;
  archivedOn: Date;
  mapIndex: number;
  referralDescription: string;
}

export interface IncidentList {
  teacherName: string;
  posRatio: number;
}

export interface StudentIncidentList {
  studentName: string;
  totalIncidents: number;
}

export interface StudentContactList {
  studentEmail: string;
  studentName: string;
  timeCreated: string;
  infractionName: string;
  infractionDescription: string;
}
