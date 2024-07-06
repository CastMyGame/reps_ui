export interface Role {
  role: string;
  id: string;
}

export interface GuidanceResponse {
  guidanceId: string;
  studentEmail: string;
  schoolName: string;
  timeCreated: null | [];
  teacherEmail: string;
  guidanceEmail: string;
  referralDescription: [string];
  status: string;
  notesArray: null | [];
  linkToPunishment: null | string;
  followUpDate: null | [];
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
