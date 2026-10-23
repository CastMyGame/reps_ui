import { accountError } from "./accountAdministration";
// The legacy class identity is a pair, never just the class name or a delimiter-concatenated string.
export const classKey = (item: { className: string; classPeriod: string }) =>
  JSON.stringify([
    item.className.trim().toLowerCase(),
    (item.classPeriod ?? "").trim().toLowerCase(),
  ]);
export const rosterError = (error: any) =>
  error?.response?.status === 409
    ? "The roster changed or this class/student already exists. Your input is preserved. Reload saved classes and reapply your edits, or select the existing student."
    : accountError(error);

export const requireSavedStudent = (data: any) => {
  if (!data?.student?.studentEmail || data.error)
    throw new Error(
      "Student creation was not confirmed. Check the saved student list before retrying.",
    );
};

export const requireSavedRoster = (
  data: any,
  identity: { className: string; classPeriod: string },
  emails: string[] | null,
) => {
  if (
    !data?.email ||
    !Array.isArray(data.classes) ||
    typeof data.rosterRevision !== "number"
  )
    throw new Error("Roster result was not confirmed");
  const matches = data.classes.filter(
    (c: any) => classKey(c) === classKey(identity),
  );
  const normalized = (values: string[]) =>
    [...new Set(values.map((e) => e.trim().toLowerCase()))].sort().join("\n");
  if (
    emails === null
      ? matches.length !== 0
      : matches.length !== 1 ||
        !Array.isArray(matches[0].classRoster) ||
        normalized(matches[0].classRoster) !== normalized(emails)
  )
    throw new Error("Roster result was not confirmed");
};

export const CLASS_PERIODS = [
  "exchange",
  "afterSchool",
  "lunch",
  ...Array.from({ length: 9 }, (_, i) => `period${i + 1}`),
];
