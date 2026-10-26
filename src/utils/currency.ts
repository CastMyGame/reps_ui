/** Validation mirrors the integer wallet contract; the server remains authoritative. */
export function awardValidation(amount: number, count: number, balance: number | null | undefined): string {
  if (!Number.isInteger(amount) || amount < 0 || amount > 2147483647) return "Enter a nonnegative whole award amount.";
  if (!Number.isInteger(count) || count < 1 || count > 200) return "Select between 1 and 200 students.";
  if (!Number.isInteger(balance) || balance! < 0) return "Your balance is unavailable. Refresh before awarding currency.";
  if (!Number.isSafeInteger(amount * count) || amount * count > balance!) return "The total award cost exceeds your available balance.";
  return "";
}
export function committedAwardBalance(data: any, requests: { studentEmail: string; currency: number }[]): number {
  if (!Array.isArray(data) || data.length !== requests.length || !data.length) throw new Error("Unconfirmed currency outcome");
  const operation = data[0]?.currencyOperationId;
  const balance = data[0]?.teacherCurrency;
  if (!operation || !Number.isInteger(balance) || balance < 0 || data.some(row => row.currencyState !== "COMMITTED" || row.currencyOperationId !== operation || row.teacherCurrency !== balance))
    throw new Error("Unconfirmed currency outcome");
  const matched = new Set<string>();
  for (const row of data) {
    const email = row.punishment?.studentEmail?.toLowerCase();
    const request = requests.find(item => item.studentEmail.toLowerCase() === email);
    if (!request || matched.has(email) || !row.punishment?.punishmentId || row.punishment.currencyOperationId !== operation || row.punishment.currencyAwarded !== request.currency)
      throw new Error("Unconfirmed currency outcome");
    matched.add(email);
  }
  return balance;
}
export function currencyFailure(error: any): string {
  switch (error?.response?.status) {
    case 400: return "Check the student selection and whole-number amounts. Your input has been kept.";
    case 401: return "Sign in again before continuing.";
    case 403: return "You are not authorized to change currency for these students.";
    case 409: return "The balance or action changed. Refresh your balance, then retry the same unchanged request.";
    default: return "The currency outcome could not be confirmed. Keep this form unchanged and retry the same request, or check records before starting another award.";
  }
}

export function confirmedRedemption(data: any, requests: {studentEmail: string}[]): void {
  if (!Array.isArray(data) || data.length !== requests.length || data.some(row => !Number.isInteger(row?.currency) || row.currency < 0)
      || requests.some(request => data.filter(row => row.studentEmail?.toLowerCase() === request.studentEmail.toLowerCase()).length !== 1))
    throw new Error("Unconfirmed redemption outcome");
}
