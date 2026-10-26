import { Employee, Student } from "src/types/school";

/** Profile-only payload: never round-trip balances, notes, spotters or archive state. */
export function studentProfilePatch(student: Student, administrator: boolean) {
  const { studentIdNumber, firstName, lastName, parentEmail, address,
    parentPhoneNumber, studentPhoneNumber } = student;
  return { studentIdNumber, firstName, lastName, parentEmail, address,
    parentPhoneNumber, studentPhoneNumber, profileRevision: student.profileRevision ?? 0,
    ...(administrator ? { guidanceEmail: student.guidanceEmail, adminEmail: student.adminEmail } : {}) };
}
export function studentSecurityError(error: any): string {
  const status = error?.response?.status;
  if (status === 401) return "Your session ended. Sign in again before retrying.";
  if (status === 403) return "You no longer have permission for this student. Ask your school administrator.";
  if (status === 409) return "The student changed. Reload the latest records before retrying; earlier changes may already be saved. Your input is retained.";
  if (status === 400) return "Check the student details and staff assignments before retrying.";
  return "The change was not confirmed. Refresh the records before retrying; earlier changes may already be saved. Your input is retained.";
}
export function requireSpotterResults(data: Student[], emails: string[], actor: string, adding: boolean) {
  if (!Array.isArray(data) || emails.some(email => {
    const record = data.find(s => s.studentEmail?.toLowerCase() === email.toLowerCase());
    const present = record?.spotters?.some(s => s.toLowerCase() === actor.toLowerCase()) ?? false;
    return !record || present !== adding;
  })) throw new Error("Spotter changes were not confirmed");
}

export function eligibleSpotterStudent(staff: Employee | undefined, student: Student): boolean {
  if (!staff) return false;
  const roles = staff.roles?.map(r => r.role) ?? [];
  return roles.includes("ADMIN") ||
    (roles.includes("GUIDANCE") && staff.email.toLowerCase() === student.guidanceEmail?.toLowerCase()) ||
    (roles.includes("TEACHER") && (staff.classes ?? []).some(c => (c.classRoster ?? []).some(email => email.toLowerCase() === student.studentEmail.toLowerCase())));
}
