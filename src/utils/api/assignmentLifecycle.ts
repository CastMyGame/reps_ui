import { api } from "./http";
import { AssignmentTemplate } from "../../types/assignments";
export interface WorkAnswer { text?: string; optionIds?: string[]; retryText?: string; }
export interface AssignmentWork {
  version: number; state: string; unavailableReason?: string; template?: AssignmentTemplate;
  answers: Record<string, WorkAnswer>; currentQuestionId?: string; feedback?: string; savedAt?: string;
  submissions: { id: string; submittedAt?: string; outcome: string; answers: Record<string, WorkAnswer>; template?: AssignmentTemplate; reviewer?: string; feedback?: string; reviewedAt?: string }[];
}
export interface AssignmentView { caseId: string; caseStatus: string; available: boolean; recoveryRequired: boolean; work: AssignmentWork;
  originalRecord?: string[]; legacyAnswerHistory?: Record<string, string[]>; }
export interface WorkCommand {
  version: number; actionId: string; answers?: Record<string, WorkAnswer>; currentQuestionId?: string;
  decision?: "ACCEPT" | "REJECT"; feedback?: string; templateId?: string; confirmRestart?: boolean;
}
export async function loadAssignment(id: string): Promise<AssignmentView> {
  return (await api.get(`/assignments/v1/cases/${encodeURIComponent(id)}`)).data;
}
export async function changeAssignment(id: string, operation: string, command: WorkCommand): Promise<AssignmentView> {
  return (await api.put(`/assignments/v1/cases/${encodeURIComponent(id)}/${operation}`, command,
    { headers: { "X-REPS-Action-Id": command.actionId } })).data;
}
export function assignmentError(error: any): string {
  const status = error?.response?.status;
  if (status === 401) return "Sign in again before saving. Your unsaved work is still shown here.";
  if (status === 403) return "You do not have permission to change this assignment.";
  if (status === 409) return "This assignment changed or needs staff recovery. Your draft is preserved here. Reload the saved version before continuing.";
  return typeof error?.response?.data === "string" ? error.response.data : "We could not save your work. Keep this page open and retry.";
}
