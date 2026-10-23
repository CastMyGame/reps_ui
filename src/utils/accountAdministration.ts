import { UserModel } from "../types/school";

export const STAFF_ROLES = ["TEACHER", "GUIDANCE", "ADMIN"];
export const teacherAccessInstructions =
  "After account creation, check Manage staff for the setup invitation status. The teacher uses the single-use email link to choose a password, or signs in with their registered Google account. No password is emailed. Failed or unconfirmed delivery does not delete the account; an administrator can reissue the invitation. Gmail sending permission is separate.";
export const invitationStateLabel = (state: string) =>
  (
    ({
      PENDING_SEND: "Invitation send pending",
      SENT: "Invitation sent (delivery not confirmed)",
      FAILED: "Invitation sending failed",
      DELIVERY_UNCONFIRMED:
        "Delivery unconfirmed; check the mailbox before reissuing",
      CONFIGURATION_REQUIRED:
        "Setup email configuration required; contact REPS support",
      READY_TO_HANDOFF: "School setup credential issued",
      SETUP_COMPLETE: "Password setup complete",
      GOOGLE_ESTABLISHED: "Access established through Google",
      REVOKED: "Previous setup access revoked",
    }) as Record<string, string>
  )[state] || "Existing account";
export const invitationLabel = (user: UserModel) =>
  user.invitationExpiresAt && Date.parse(user.invitationExpiresAt) < Date.now()
    ? "Setup credential expired; request another"
    : user.invitationStatus
      ? invitationStateLabel(user.invitationStatus)
      : user.passwordSetupRequired
        ? "Pending setup"
        : "Existing account";
export const accountRoles = (user: UserModel) => [
  ...new Set(
    (user.roles || []).map((r) => r.role?.trim().toUpperCase()).filter(Boolean),
  ),
];
export const accountSchool = (user: UserModel) =>
  user.school ?? user.schoolName ?? "";
export const loginRole = (user: UserModel) =>
  ["ADMIN", "GUIDANCE", "TEACHER", "STUDENT"].find((role) =>
    accountRoles(user).includes(role),
  ) || "";
export const isSelf = (user: UserModel) =>
  user.username?.trim().toLowerCase() ===
  sessionStorage.getItem("email")?.trim().toLowerCase();
export const supportedStaff = (user: UserModel) =>
  accountRoles(user).length > 0 &&
  accountRoles(user).every((r) => STAFF_ROLES.includes(r));
// PR #165 supplies enabled, but no lifecycle history. Never infer pending from paid.
export const accountStatus = (user: UserModel) =>
  user.enabled === false
    ? "Pending activation / inactive"
    : user.enabled === true
      ? user.passwordSetupRequired
        ? "Pending password setup"
        : "Active"
      : "Status unavailable";
export function accountError(error: any): string {
  switch (error?.response?.status) {
    case 401:
      return "Your session has expired. Sign in again.";
    case 403:
      return "Access denied. Check your school membership and permissions with your school administrator. Your account may have been deactivated.";
    case 400:
    case 422:
      return "Check the required fields and supported roles. The request was not accepted.";
    case 404:
      return "The account or staff record is no longer available. Reload accounts.";
    case 409:
      return "This email may already be registered, or account profiles need administrator review. Reload accounts before trying again.";
    default:
      return "The result could not be confirmed. Reload and check the saved account before retrying; part of the operation may have completed.";
  }
}
export function requireCreatedTeacher(data: any) {
  if (!data?.employee || data.error)
    throw new Error(
      "Teacher creation was not confirmed. Check the account list before retrying or ask your school administrator to review the account.",
    );
}
