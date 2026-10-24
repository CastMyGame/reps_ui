/** A saved disciplinary case is not proof that assignment attachment succeeded. */
export function assignmentCreationWarning(data: unknown): string {
  const responses = Array.isArray(data) ? data : [data];
  const count = responses.filter(response => response?.punishment?.assignmentWork?.state === "UNAVAILABLE").length;
  return count ? `${count} saved case${count === 1 ? " has" : "s have"} an unavailable assignment. Open Assignment work to review and attach the intended template.` : "";
}
