// src/utils/api/assignmentApi.ts
import { api } from "./http";
import {
  AssignmentTemplate,
  AssignmentTemplateBinding,
  AssignmentTemplateCreatePayload,
  AssignmentTemplateSearchParams,
  AssignmentTemplateSummaryDTO,
  SetTeacherDefaultBindingRequest,
} from "src/types/assignments";

async function apiGet<T>(url: string, params?: any): Promise<T> {
  const { data } = await api.get<T>(url, { params });
  return data;
}

async function apiPost<T>(url: string, body?: any): Promise<T> {
  const { data } = await api.post<T>(url, body);
  return data;
}

async function apiDelete<T = void>(url: string, body?: any): Promise<T> {
  const { data } = await api.delete<T>(url, { data: body });
  return data;
}

// ---- bindings ----

export function getTeacherBindings(
  teacherEmail: string
): Promise<AssignmentTemplateBinding[]> {
  return apiGet<AssignmentTemplateBinding[]>(
    "/assignments/v1/bindings/teacher-default",
    { teacherEmail }
  );
}

export function setTeacherDefaultBinding(
  payload: SetTeacherDefaultBindingRequest
): Promise<AssignmentTemplateBinding> {
  return apiPost<AssignmentTemplateBinding>(
    "/assignments/v1/bindings/teacher-default",
    {
      ...payload,
      schoolId: payload.schoolId ?? null,
    }
  );
}

export function clearTeacherDefaultBinding(payload: {
  teacherEmail: string;
  infractionName: string;
  level: number;
}): Promise<void> {
  return apiDelete<void>("/assignments/v1/bindings/teacher-default", payload);
}

// ---- templates ----

export function searchAssignmentTemplates(
  params: AssignmentTemplateSearchParams
): Promise<AssignmentTemplateSummaryDTO[]> {
  return apiGet<AssignmentTemplateSummaryDTO[]>(
    "/assignments/v1/templates/search",
    {
      infractionName: params.infractionName,
      level: params.level,
      creatorEmail: params.creatorEmail,
      createdBySystem: params.createdBySystem,
      q: params.q,
    }
  );
}

export function createAssignmentTemplate(
  payload: AssignmentTemplateCreatePayload
): Promise<AssignmentTemplate> {
  return apiPost<AssignmentTemplate>("/assignments/v1/templates", payload);
}
