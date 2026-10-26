import { baseUrl } from "./jsonData";
export const guidancePath = (action: string, id: string) => `${baseUrl}/guidance/v1/guidance/${action}/${encodeURIComponent(id)}`;
export function requireGuidanceRecord(data: any, id: string, status?: string) {
  if (!data || data.guidanceId !== id || (status && data.status !== status)) throw new Error("Guidance change was not confirmed");
}
export function requireGuidanceCreation(data: any, studentEmail: string) {
  const saved = data?.guidance?.find((g: any) => g.guidanceId && g.studentEmail?.toLowerCase() === studentEmail.toLowerCase());
  if (!saved || data.error) throw new Error("Guidance request was not confirmed");
}
export function requireTrackedSave(data: any, students: string[], actor: string) {
  if (!Array.isArray(data) || data.length !== students.length || students.some(email => !data.some(e => e.studentEmail?.toLowerCase() === email.toLowerCase() && e.teacherEmail?.toLowerCase() === actor.toLowerCase())))
    throw new Error("Behavior recording was not confirmed");
}
