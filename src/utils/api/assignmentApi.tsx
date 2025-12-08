import { AssignmentTemplateBinding, AssignmentTemplateSummaryDTO } from "src/types/assignments";


const BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8080";

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

async function apiDelete(url: string, body?: any): Promise<void> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`DELETE ${url} failed: ${res.status}`);
  }
}

export function getTeacherBindings(teacherEmail: string): Promise<AssignmentTemplateBinding[]> {
  return apiGet<AssignmentTemplateBinding[]>(
    `/assignments/v1/bindings/teacher-default?teacherEmail=${encodeURIComponent(
      teacherEmail
    )}`
  );
}

export function searchAssignmentTemplates(params: {
  infractionName?: string;
  level?: number;
  creatorEmail?: string;
  createdBySystem?: boolean;
  q?: string;
}): Promise<AssignmentTemplateSummaryDTO[]> {
  const query = new URLSearchParams();
  if (params.infractionName) query.append("infractionName", params.infractionName);
  if (params.level != null) query.append("level", String(params.level));
  if (params.creatorEmail) query.append("creatorEmail", params.creatorEmail);
  if (params.createdBySystem != null)
    query.append("createdBySystem", String(params.createdBySystem));
  if (params.q) query.append("q", params.q);

  const qs = query.toString();
  return apiGet<AssignmentTemplateSummaryDTO[]>(
    `/assignments/v1/templates/search${qs ? `?${qs}` : ""}`
  );
}

export function setTeacherDefaultBinding(payload: {
  teacherEmail: string;
  schoolId?: string;
  infractionName: string;
  level: number;
  assignmentTemplateId: string;
}): Promise<AssignmentTemplateBinding> {
  return apiPost<AssignmentTemplateBinding>(
    "/assignments/v1/bindings/teacher-default",
    payload
  );
}

export function clearTeacherDefaultBinding(payload: {
  teacherEmail: string;
  infractionName: string;
  level: number;
}): Promise<void> {
  return apiDelete("/assignments/v1/bindings/teacher-default", payload);
}