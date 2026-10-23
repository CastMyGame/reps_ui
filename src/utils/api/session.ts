import { baseUrl } from "../jsonData";

export class SessionRequestError extends Error {
  response: { status: number };
  constructor(status: number) {
    super(
      status === 401
        ? "Sign in again to continue."
        : status === 403
          ? "Access denied."
          : "Session service temporarily unavailable.",
    );
    this.response = { status };
  }
}
const authKeys = [
  "Authorization",
  "userName",
  "schoolName",
  "email",
  "role",
  "loginMethod",
];
export function expireSessionIfCurrent(token: string | null) {
  // A late 401 for a replaced token must not log out the new session.
  if (sessionStorage.getItem("Authorization") !== token) return;
  authKeys.forEach((key) => sessionStorage.removeItem(key));
  window.location.href = "/login";
}
let renewal: Promise<string> | null = null;
export async function waitForPendingRenewal() {
  if (renewal) await renewal.catch(() => {});
}
export function renewSession(): Promise<string> {
  if (renewal) return renewal;
  const token = sessionStorage.getItem("Authorization");
  renewal = (async () => {
    if (!token) throw new SessionRequestError(401);
    const response = await fetch(`${baseUrl}/v1/renew-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 401) expireSessionIfCurrent(token);
      // 403, transport failures and 5xx do not mean the session expired.
      throw new SessionRequestError(response.status);
    }
    const data = await response.json();
    if (typeof data.newToken !== "string" || !data.newToken)
      throw new SessionRequestError(502);
    if (sessionStorage.getItem("Authorization") !== token)
      throw new SessionRequestError(409);
    sessionStorage.setItem("Authorization", data.newToken);
    return data.newToken;
  })().finally(() => {
    renewal = null;
  });
  return renewal;
}
export function tokenExpiresAt(token: string): number {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      atob(part.padEnd(Math.ceil(part.length / 4) * 4, "=")),
    );
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp))
      throw new Error();
    return payload.exp * 1000;
  } catch {
    throw new SessionRequestError(401);
  }
}
export async function checkSessionExpiration() {
  const token = sessionStorage.getItem("Authorization");
  if (!token) return;
  let expiration: number;
  try {
    expiration = tokenExpiresAt(token);
  } catch (invalid) {
    expireSessionIfCurrent(token);
    throw invalid;
  }
  if (expiration <= Date.now()) {
    expireSessionIfCurrent(token);
    throw new SessionRequestError(401);
  }
  // Renewal is access-token renewal, not an expired-token recovery mechanism.
  if (expiration - Date.now() <= 2 * 60 * 1000) await renewSession();
}
export async function rejectAuthenticationFailure(error: any): Promise<never> {
  const authorization =
    error?.config?.headers?.Authorization ??
    error?.config?.headers?.authorization;
  if (
    error?.response?.status === 401 &&
    typeof authorization === "string" &&
    authorization.startsWith("Bearer ")
  ) {
    await waitForPendingRenewal();
    expireSessionIfCurrent(authorization.slice(7));
  }
  // Never replay mutation requests automatically, and never log request headers/provider bodies.
  return Promise.reject(error);
}
