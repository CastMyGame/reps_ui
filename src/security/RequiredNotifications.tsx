import React, { useEffect, useState } from "react";
import { baseUrl } from "../utils/jsonData";
import "../utils/api/http";

type Notification = { id: string; event: string; state: string; actor: string; retrySafe: boolean; reason: string; recipientOutcomes: Record<string,string> };
type CaseStatus = { caseId: string; kind: string; conversationId: string; studentName?: string; notifications: Notification[] };
async function request(path: string, body?: object) {
  const result = await fetch(`${baseUrl}/email/v1/notifications${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!result.ok) throw new Error("Notification status could not be updated. Reload to check the current result.");
  return result.json();
}
const staff = () => ["TEACHER", "ADMIN", "GUIDANCE"].includes(sessionStorage.getItem("role") || "") && !!sessionStorage.getItem("Authorization");
export function DisciplinaryActionNotice() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true; let enabled = false;
    if (staff()) void request("").then(result => { enabled = result.available; }).catch(() => undefined);
    const saved = () => { if (active && enabled) setMessage("Action saved. Required email is tracked separately and may still be pending."); };
    window.addEventListener("reps:disciplinary-action-saved", saved);
    return () => { active = false; window.removeEventListener("reps:disciplinary-action-saved", saved); };
  }, []);
  return message ? <aside role="status" style={{ padding: 12, background: "#e8f3fa" }}>{message} <a href="/account/notifications">Check email status</a></aside> : null;
}
const labels: Record<string,string> = { PENDING: "Pending", DISPATCHING: "Processing", ACCEPTED: "Accepted by provider", FAILED: "Failed", RECONNECT_REQUIRED: "Gmail reconnection required", UNCERTAIN: "Uncertain — review required", RESOLVED: "Manually resolved" };
export default function RequiredNotifications() {
  const [cases, setCases] = useState<CaseStatus[]>([]);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<Record<string,string>>({});
  const reload = async () => {
    if (!staff()) { setMessage("Sign in with your REPS staff account to view email status."); return; }
    setBusy(true);
    try { const result = await request(""); setAvailable(result.available); setCases(result.cases || []); }
    catch { setMessage("Email status is unavailable. Your saved disciplinary actions remain separate from email status."); }
    finally { setBusy(false); }
  };
  useEffect(() => { void reload(); }, []);
  const change = async (item: CaseStatus, notification: Notification, action: "retry" | "resolve") => {
    setBusy(true); setMessage("");
    try {
      await request(`/${encodeURIComponent(item.kind)}/${encodeURIComponent(item.caseId)}/${encodeURIComponent(notification.id)}/${action}`,
        action === "resolve" ? { reason: notes[notification.id] || "" } : {});
      setMessage(action === "retry" ? "Retry queued. No email was sent by this request." : "External resolution recorded. No email was resent.");
      await reload();
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  };
  const role = sessionStorage.getItem("role") || "";
  return <main style={{ margin: "90px auto 24px", padding: 20, maxWidth: 1000, textAlign: "left" }}>
    <h1>Required email status</h1>
    <p>A saved disciplinary action remains saved while its email is pending or needs attention. Provider acceptance does not confirm delivery or that the message was read.</p>
    {message && <p role="status">{message}</p>}
    <button disabled={busy} onClick={() => void reload()}>Refresh status</button>
    {!busy && !available && <p>Managed notifications are not enabled.</p>}
    {available && cases.length === 0 && <p>No required emails are visible for your authorized cases.</p>}
    {cases.map(item => <section key={`${item.kind}:${item.caseId}`}>
      <h2 title={item.caseId}>Case {item.conversationId.slice(0, 8)}{item.studentName ? ` — ${item.studentName}` : ""}</h2>
      {item.notifications.map(notification => <article key={notification.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
        <p><strong>{notification.event.replace(/_/g, " ")}</strong> — {labels[notification.state] || "Unavailable"}</p>
        <p>Sending staff: {notification.actor === "SYSTEM" ? "REPS automated notification" : notification.actor}</p>
        {notification.state === "RECONNECT_REQUIRED" && <p>The sending staff member must <a href="/account/gmail">reconnect Gmail</a> before retrying.</p>}
        {notification.state === "UNCERTAIN" && <p>The provider may have accepted some or all recipients. Retrying is blocked; a school administrator must verify the outcome and record any external resolution.</p>}
        {Object.keys(notification.recipientOutcomes || {}).length > 0 && <ul>{Object.entries(notification.recipientOutcomes).map(([recipient, outcome]) => <li key={recipient}>{recipient}: {outcome.replace(/_/g, " ")}</li>)}</ul>}
        {notification.retrySafe && ["FAILED", "RECONNECT_REQUIRED"].includes(notification.state) && <button disabled={busy} onClick={() => void change(item, notification, "retry")}>Queue safe retry</button>}
        {role === "ADMIN" && ["UNCERTAIN", "FAILED", "RECONNECT_REQUIRED"].includes(notification.state) && <div>
          <label>External resolution explanation <input maxLength={500} value={notes[notification.id] || ""} onChange={event => setNotes({ ...notes, [notification.id]: event.target.value })} /></label>{" "}
          <button disabled={busy || !(notes[notification.id] || "").trim()} onClick={() => void change(item, notification, "resolve")}>Record external resolution</button>
        </div>}
      </article>)}
    </section>)}
    <p><a href={staff() ? `/dashboard/${role.toLowerCase()}` : "/login"}>Return</a></p>
  </main>;
}
