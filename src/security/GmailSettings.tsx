import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { baseUrl } from "../utils/jsonData";

type GmailStatus = { available: boolean; state: string; connectedEmail: string; authorized: boolean };
const pendingKey = "reps.gmail.pending";
const staffRoles = ["TEACHER", "ADMIN", "GUIDANCE"];

async function gmailRequest(path: string, body?: object): Promise<any> {
  const response = await fetch(`${baseUrl}/auth/gmail/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`, "Content-Type": "application/json" },
    cache: "no-store",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error("Gmail settings could not be updated. Please retry or reconnect.");
  return response.json();
}

/** A separate linking flow; it never replaces REPS login credentials or identity. */
export default function GmailSettings() {
  const location = useLocation();
  const initialized = useRef(false);
  const [status, setStatus] = useState<GmailStatus>();
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const role = sessionStorage.getItem("role") || "";
  const signedIn = !!sessionStorage.getItem("Authorization") && staffRoles.includes(role);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (location.pathname === "/account/gmail/callback") window.history.replaceState({}, "", "/account/gmail");
    if (!signedIn) { setMessage("Sign in with your REPS staff account to manage Gmail."); setBusy(false); return; }
    async function initialize() {
      try {
        if (location.pathname === "/account/gmail/callback") {
          const params = new URLSearchParams(location.search);
          // Remove the short-lived authorization code before making any API requests.
          const stored = sessionStorage.getItem(pendingKey);
          sessionStorage.removeItem(pendingKey);
          const pending = stored ? JSON.parse(stored) : null;
          if (params.get("error")) {
            setMessage("Gmail connection was cancelled or denied. Your REPS login is unchanged.");
          } else if (!pending || pending.expires < Date.now() || params.get("state") !== pending.state || !params.get("code")) {
            setMessage("This connection expired or belongs to another browser tab. Start Connect Gmail again.");
          } else {
            setStatus(await gmailRequest("complete", { state: params.get("state"), code: params.get("code"), browserProof: pending.proof }));
            setMessage("Gmail connected. Your REPS login is unchanged.");
            return;
          }
        }
        setStatus(await gmailRequest("status"));
      } catch {
        setMessage("Gmail connection could not be verified. Start Connect Gmail again or contact support.");
      } finally { setBusy(false); }
    }
    void initialize();
  }, [location.pathname, location.search, signedIn]);

  const connect = async () => {
    setBusy(true); setMessage("");
    try {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const proof = btoa(Array.from(bytes, b => String.fromCharCode(b)).join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const result = await gmailRequest("connect", { browserProof: proof });
      const url = new URL(result.authorizationUrl);
      if (url.origin !== "https://accounts.google.com" || !url.searchParams.get("state")) throw new Error();
      sessionStorage.setItem(pendingKey, JSON.stringify({ proof, state: url.searchParams.get("state"), expires: Date.now() + 300000 }));
      window.location.assign(url.toString());
    } catch { setMessage("Gmail connection is unavailable. Please retry or contact support."); setBusy(false); }
  };
  const disconnect = async () => {
    setBusy(true); setMessage("");
    try {
      const result = await gmailRequest("disconnect", {});
      sessionStorage.removeItem(pendingKey);
      setStatus({ available: true, state: "DISCONNECTED", connectedEmail: "", authorized: false });
      setMessage(result.message); setConfirmDisconnect(false);
    } catch { setMessage("Disconnection was not confirmed. Please retry before assuming Gmail is disconnected."); }
    finally { setBusy(false); }
  };
  const stateLabel: Record<string, string> = { CONNECTED: "Connected", NEVER_CONNECTED: "Not connected", DISCONNECTED: "Disconnected — REPS SMTP selected", RECONNECT_REQUIRED: "Reconnect required", UNAVAILABLE: "Unavailable" };
  return <main style={{ maxWidth: 640, margin: "90px auto 30px", padding: 20, textAlign: "left" }}>
    <h1>Gmail settings</h1>
    <p>Connect the Google account matching your REPS email to authorize sending. This does not change how you sign in to REPS.</p>
    {message && <p role="status">{message}</p>}
    {busy && <p role="status">Updating Gmail settings…</p>}
    {!busy && !status && signedIn && <button type="button" onClick={() => window.location.assign("/account/gmail")}>Reload settings</button>}
    {status && <>
      <p><strong>Status:</strong> {stateLabel[status.state] || "Unavailable"}</p>
      {status.state !== "DISCONNECTED" && status.connectedEmail && <p>Connected email: {status.connectedEmail}</p>}
      {status.state === "RECONNECT_REQUIRED" && <p>Gmail sending is blocked until you reconnect. Failed Gmail sends do not switch silently to SMTP.</p>}
      {status.available && <>
        <button type="button" disabled={busy} onClick={() => void connect()}>{status.state === "NEVER_CONNECTED" ? "Connect Gmail" : "Reconnect Gmail"}</button>{" "}
        {["CONNECTED", "RECONNECT_REQUIRED"].includes(status.state) && <button type="button" disabled={busy} onClick={() => setConfirmDisconnect(true)}>Disconnect Gmail</button>}
        {confirmDisconnect && <div><p>Disconnect Gmail and select REPS SMTP? Messages already submitted to Google cannot be recalled.</p>
          <button type="button" disabled={busy} onClick={() => void disconnect()}>Confirm disconnect</button>{" "}
          <button type="button" disabled={busy} onClick={() => setConfirmDisconnect(false)}>Cancel</button></div>}
      </>}
    </>}
    <p><a href={signedIn ? `/dashboard/${role.toLowerCase()}` : "/login"}>{signedIn ? "Return to dashboard" : "Sign in"}</a></p>
  </main>;
}
