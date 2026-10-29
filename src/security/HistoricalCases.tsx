import React, { useEffect, useState } from "react";
import { baseUrl } from "../utils/jsonData";
import "../utils/api/http";

type Snapshot = { caseId: string; kind: string; capturedAt: string; timeCreated: string; studentName: string; infraction: string; initialDescription: string[] };
const staff = () => !!sessionStorage.getItem("Authorization") && ["ADMIN", "TEACHER", "GUIDANCE"].includes(sessionStorage.getItem("role") || "");

/** A separate read-only projection. Never links a former participant to a live case. */
export default function HistoricalCases() {
  const [items, setItems] = useState<Snapshot[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    if (!staff()) { setMessage("Sign in with your REPS staff account to view historical cases."); setBusy(false); return; }
    const abort = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`${baseUrl}/history/v1/cases`, { cache: "no-store", signal: abort.signal,
          headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` } });
        if (!response.ok) {
          setItems([]);
          setMessage(response.status === 401 ? "Your session needs renewal. Sign in again." : response.status === 403 ? "You are not authorized to view these historical cases." : "Historical cases could not be loaded. Please try again later.");
          return;
        }
        const body = await response.json();
        if (abort.signal.aborted) return;
        if (!body.available) { setMessage("Historical case snapshots are not available for this account."); return; }
        setItems(body.cases || []);
        if (!body.cases?.length) setMessage("No verified historical case snapshots are available.");
      } catch { if (!abort.signal.aborted) { setItems([]); setMessage("Historical cases could not be loaded. Please try again later."); } }
      finally { if (!abort.signal.aborted) setBusy(false); }
    })();
    return () => abort.abort();
  }, []);
  return <main style={{ margin: "90px auto 24px", padding: 20, maxWidth: 900, textAlign: "left", overflowWrap: "anywhere" }}>
    <h1>Historical case snapshots</h1>
    <p>These read-only facts were recorded when you authored or were assigned the case. Current case status, later notes, student history, and assignment work are not included.</p>
    {busy && <p role="status">Loading historical cases...</p>}
    {message && <p role="status">{message}</p>}
    {items.map(item => <article key={`${item.kind}:${item.caseId}`} style={{ border: "1px solid #ccc", padding: 16, marginBottom: 16 }}>
      <h2>{item.studentName} — {item.infraction}</h2>
      <p>Created: {item.timeCreated || "Date unavailable"}</p>
      <p>Snapshot captured: <time dateTime={item.capturedAt}>{item.capturedAt}</time></p>
      {item.initialDescription.map((text, index) => <p key={index} style={{ whiteSpace: "pre-wrap" }}>{text}</p>)}
    </article>)}
    <p><a href="/">Return to REPS</a></p>
  </main>;
}
