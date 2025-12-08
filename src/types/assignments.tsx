export type RadioAnswers = {
  [key: string]: {
    label: string;
    value: boolean;
  };
};

export interface Question {
  question: string;
  type: "reading" | "retryQuestion" | "exploratory-open-ended" | "exploratory-radio";
  title: string;
  body: string;
  references: string[];
  radioAnswers: RadioAnswers;
  textToCompare: string;
}

export interface AssignmentPayload {
  infractionName: string;
  level: number;
  questions: Question[];
}

// ------------------ v2 Template Types ------------------

export type QuestionType = "READING_MC" | "EXPLORATORY_OPEN" | "EXPLORATORY_RADIO";
export type SelectionMode = "SINGLE" | "MULTIPLE";
export type GradingMode = "ALL_CORRECT" | "ANY_CORRECT";
export type RetryMode = "TEXT";

export interface RetryConfig {
  enabled: boolean;
  mode: RetryMode;
  textToCopy: string | null;
  requiredAccuracyPercent: number | null;
}

export interface AnswerOption {
  id: string;
  label: string;
  correct: boolean;
}

export interface TemplateQuestion {
  id: string;
  order: number;
  type: QuestionType;
  required: boolean;

  prompt: string | null;
  title: string | null;

  passageBody: string | null;
  passageReferences: string[] | null;

  options: AnswerOption[] | null;
  selectionMode: SelectionMode | null;
  gradingMode: GradingMode | null;

  retry: RetryConfig | null;

  minLength: number | null;
  maxLength: number | null;
  graded: boolean | null;
}

export type Scope = "SYSTEM_DEFAULT" | "SCHOOL_DEFAULT" | "TEACHER_DEFAULT";
export type Visibility = "PRIVATE" | "SCHOOL";

export interface AssignmentTemplate {
  // ✅ optional on frontend – created by Mongo/Java
  id?: string;

  infractionName: string;
  level: number;

  createdBySystem: boolean;
  createdByUserId: string | null;
  schoolId: string | null;

  scope: Scope;
  active: boolean;
  visibility: Visibility;

  // ✅ optional – set by backend
  createdAt?: string;
  updatedAt?: string;

  questions: TemplateQuestion[];
}

export interface AssignmentTemplateSummaryDTO {
  id: string;
  infractionName: string;
  level: number;
  createdBySystem: boolean;
  createdByUserId: string | null;
  questionCount: number;
  firstQuestionPreview: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentTemplateBinding {
  id: string;
  teacherEmail: string | null;
  schoolId: string | null;
  infractionName: string;
  level: number;
  assignmentTemplateId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ✅ Create payload: everything except id/createdAt/updatedAt
export type AssignmentTemplateCreatePayload = Omit<
  AssignmentTemplate,
  "id" | "createdAt" | "updatedAt"
>;

export const DEFAULT_INFRACTION_OPTIONS = [
  "Class Disruption",
  "Disrespect",
  "Unprepared for Class",
  "Missing Assignment",
  "Tardy",
] as const;

export const DEFAULT_LEVEL_OPTIONS = [1, 2, 3, 4];

export interface AssignmentTemplateSearchParams {
  infractionName?: string;
  level?: number;
  creatorEmail?: string;
  createdBySystem?: boolean;
  q?: string;
}