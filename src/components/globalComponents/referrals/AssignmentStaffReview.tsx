import React, { useEffect, useRef, useState } from "react";
import { AssignmentTemplate } from "../../../types/assignments";
import { api } from "../../../utils/api/http";
import { AssignmentView, WorkCommand, assignmentError, changeAssignment, loadAssignment } from "../../../utils/api/assignmentLifecycle";

export default function AssignmentStaffReview({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: () => void }) {
  const [view, setView] = useState<AssignmentView>();
  const [templates, setTemplates] = useState<AssignmentTemplate[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const lock = useRef(false);
  const pending = useRef<{ key: string; command: WorkCommand }>();
  useEffect(() => {
    let active = true;
    loadAssignment(id).then(v => { if (active) { setView(v); setFeedback(v.work.feedback || ""); } }).catch(e => { if(active) setError(assignmentError(e)); }).finally(() => { if(active) setLoading(false); });
    api.get("/assignments/v1/templates").then(r => { if(active) setTemplates(r.data); }).catch(() => { if(active) setCatalogError("Template catalog could not be loaded. Close and reopen this panel to retry."); });
    return () => { active = false; };
  }, [id]);
  const change = async (operation: string, details: Partial<WorkCommand>) => {
    if (!view || lock.current) return;
    lock.current = true; setBusy(true); setError(""); setMessage("");
    try {
    const key = JSON.stringify({ operation, version: view.work.version, ...details });
    if (pending.current?.key !== key) pending.current = { key, command: { version: view.work.version, actionId: crypto.randomUUID(), ...details } };
      const saved = await changeAssignment(id, operation, pending.current.command);
      setView(saved); pending.current = undefined; setMessage(operation === "bind" ? "Assignment attached. Existing case history was preserved." : "Review saved. Notification delivery is tracked separately."); onSaved();
    } catch (e) { setError(assignmentError(e)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <div className="modal-overlay"><section role="dialog" aria-modal="true" aria-label="Assignment work and review" className="modal-content" style={{ maxHeight: "90vh", overflow: "auto" }}>
    <h2>Assignment work and review</h2>
    <button type="button" onClick={onClose} disabled={busy}>Close</button>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {!view ? <p>{loading ? "Loading saved work…" : "Saved work could not be loaded. Close and reopen this panel to retry."}</p> : <>
      <p>Assignment: {view.work.state.replace(/_/g, " ")} · Case: {view.caseStatus}</p>
      <details><summary>Original case record and legacy history</summary>
        {view.originalRecord?.map((entry,index) => <p key={index}>{entry}</p>)}
        {Object.entries(view.legacyAnswerHistory || {}).map(([date,entries]) => <article key={date}><h4>{date}</h4>{entries.map((entry,index)=><p key={index}>{entry}</p>)}</article>)}
      </details>
      {!view.available && <p role="alert">Assignment unavailable. {view.work.unavailableReason}</p>}
      {view.work.template?.questions.map(q => <article key={q.id}><h4>{q.prompt}</h4><p>{view.work.answers[q.id]?.text ||
        view.work.answers[q.id]?.optionIds?.map(id => q.options?.find(o => o.id === id)?.label || id).join(", ") || "No answer saved"}</p>
        {view.work.answers[q.id]?.retryText && <p>Retry: {view.work.answers[q.id].retryText}</p>}</article>)}
      {view.work.submissions?.map(s => <details key={s.id}><summary>{s.outcome} · {s.submittedAt || s.reviewedAt}</summary>
        {Object.entries(s.answers || {}).map(([key, answer]) => <p key={key}>{(s.template || view.work.template)?.questions.find(q => q.id === key)?.prompt || key}: {answer.text || answer.optionIds?.map(id => (s.template || view.work.template)?.questions.find(q => q.id === key)?.options?.find(o => o.id === id)?.label || id).join(", ")}</p>)}
        {s.feedback && <p>Feedback: {s.feedback}</p>}
      </details>)}
      {view.available && view.work.state === "SUBMITTED" && <>
        <label>Review feedback<textarea aria-label="Review feedback" value={feedback} onChange={e => setFeedback(e.target.value)} disabled={busy} maxLength={2000} /></label>
        <button type="button" disabled={busy} onClick={() => void change("review", { decision: "ACCEPT", feedback })}>Accept and close assignment</button>{" "}
        <button type="button" disabled={busy || !feedback.trim()} onClick={() => void change("review", { decision: "REJECT", feedback })}>Reject for revision</button>
      </>}
      {!view.available && ["OPEN", "PENDING"].includes(view.caseStatus) && <>
        {catalogError && <p role="alert">{catalogError}</p>}
        <p>Attach the intended active template for this infraction and level. This is an explicit staff action; no automatic replacement is made.</p>
        <label>Template<select aria-label="Template" value={templateId} onChange={e => setTemplateId(e.target.value)} disabled={busy}>
          <option value="">Choose the intended assignment</option>{templates.filter(t => t.active !== false).map(t => <option key={t.id} value={t.id}>{t.infractionName} · level {t.level} · {t.name || t.id}</option>)}
        </select></label>
        <label>Recovery explanation<textarea aria-label="Recovery explanation" value={feedback} onChange={e => setFeedback(e.target.value)} disabled={busy} maxLength={2000} /></label>
        <label><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} disabled={busy} />I verified this assignment and authorize recovery. Existing descriptions and submission history will be preserved.</label>
        <button type="button" disabled={busy || !templateId || !confirmed || (view.recoveryRequired || view.caseStatus === "PENDING") && !feedback.trim()} onClick={() => void change("bind", { templateId, confirmRestart: true, feedback })}>Attach assignment</button>
      </>}
    </>}
  </section></div>;
}
