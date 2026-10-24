import React, { useEffect, useRef, useState } from "react";
import { OfficeReferral, TeacherReferral } from "../types/responses";
import { isTeacherReferral } from "../helperComponents/helperComponents";
import { AssignmentView, WorkAnswer, WorkCommand, assignmentError, loadAssignment, changeAssignment } from "../utils/api/assignmentLifecycle";
import RetryQuestionFormat from "./ViolationContents/RetryQuestionFormat";

interface ViolationProps {
  assignment?: TeacherReferral | OfficeReferral;
  onDirtyChange?: (dirty: boolean) => void;
  onSaveReady?: (save?: () => Promise<boolean>) => void;
}
const ViolationPage: React.FC<ViolationProps> = ({ assignment, onDirtyChange, onSaveReady }) => {
  const id = assignment && isTeacherReferral(assignment) ? assignment.punishmentId : undefined;
  const [view, setView] = useState<AssignmentView>();
  const [answers, setAnswers] = useState<Record<string, WorkAnswer>>({});
  const [questionId, setQuestionId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [submissionPending, setSubmissionPending] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [conflicted, setConflicted] = useState(false);
  const locked = useRef(false);
  const edit = useRef(0);
  const mounted = useRef(true);
  const activeCase = useRef(id); activeCase.current = id;
  const pending = useRef<{ fingerprint: string; command: WorkCommand }>();
  const draftKey = id ? `reps.assignment.draft.${sessionStorage.getItem("email")}.${id}` : "";

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!id) return;
    let active = true; locked.current = false; pending.current = undefined; edit.current = 0;
    setBusy(false); setSubmissionPending(false); setDirty(false); setConflicted(false); setLoading(true); setError(""); setView(undefined); setSubmitted(false);
    loadAssignment(id).then(saved => {
      if (!active) return;
      setView(saved); setQuestionId(saved.work.currentQuestionId || saved.work.template?.questions[0]?.id);
      let draft: { answers: Record<string, WorkAnswer>; questionId?: string; version: number } | undefined;
      try { draft = JSON.parse(sessionStorage.getItem(draftKey) || "null"); } catch { /* Invalid local cache is ignored. */ }
      if (draft && draft.version === saved.work.version && saved.caseStatus === "OPEN") {
        setAnswers(draft.answers); setQuestionId(draft.questionId); setDirty(true);
        setError("An unsaved draft was recovered from this tab. Save it before leaving.");
      } else if (draft && saved.caseStatus === "OPEN") {
        setAnswers(draft.answers); setDirty(true); setConflicted(true);
        setError("Newer saved work exists. This tab's unsaved answers are preserved. Reload the saved version only after reviewing your draft.");
      } else { setAnswers(saved.work.answers || {}); setDirty(false); }
    }).catch(e => { if (active) setError(`Could not load this assignment. ${assignmentError(e)}`); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, draftKey, reload]);

  useEffect(() => {
    if (!dirty || !view) return;
    try { sessionStorage.setItem(draftKey, JSON.stringify({ answers, questionId, version: view.work.version })); }
    catch { /* Server saving still works if tab storage is unavailable. */ }
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, answers, questionId, draftKey, view]);

  const save = async (operation = "save", nextQuestionId = questionId) => {
    if (!id || !view || locked.current || conflicted) return false;
    locked.current = true; setBusy(true); setSubmissionPending(operation === "submit"); setError("");
    const generation = edit.current;
    try {
    const fingerprint = JSON.stringify({ operation, version: view.work.version, answers, currentQuestionId: nextQuestionId });
    if (pending.current?.fingerprint !== fingerprint) pending.current = { fingerprint, command: {
      version: view.work.version, actionId: crypto.randomUUID(), answers, currentQuestionId: nextQuestionId,
    } };
      const saved = await changeAssignment(id, operation, pending.current.command);
      if (!mounted.current || activeCase.current !== id) return false;
      setView(saved); pending.current = undefined;
      if (generation === edit.current) { setDirty(false); setQuestionId(nextQuestionId); try { sessionStorage.removeItem(draftKey); } catch { /* Saved server state remains authoritative. */ } }
      if (operation === "submit") setSubmitted(true);
      return generation === edit.current;
    } catch (e: any) { if (mounted.current && activeCase.current === id) { setError(assignmentError(e)); if (e?.response?.status === 409) setConflicted(true); } return false; }
    finally { if (activeCase.current === id) { locked.current = false; if (mounted.current) { setBusy(false); setSubmissionPending(false); } } }
  };
  const update = (value: WorkAnswer) => {
    if (!questionId) return;
    edit.current++; setAnswers(previous => ({ ...previous, [questionId]: value })); setDirty(true); setError("");
  };
  const saveRef = useRef(save); saveRef.current = save;
  useEffect(() => { onDirtyChange?.(dirty || busy); }, [dirty, busy, onDirtyChange]);
  useEffect(() => {
    onSaveReady?.(() => saveRef.current());
    return () => { onSaveReady?.(undefined); onDirtyChange?.(false); };
  }, [onSaveReady, onDirtyChange]);
  useEffect(() => {
    if (!dirty || busy || error || conflicted) return;
    const timer = setTimeout(() => { void saveRef.current(); }, 800);
    return () => clearTimeout(timer);
  }, [dirty, answers, questionId, busy, error, conflicted]);

  if (assignment && !id) return <p role="status">Office referrals are handled individually by the principal. No student assignment is required here.</p>;
  if (!id) return <p>Select an assignment to begin.</p>;
  if (loading) return <p role="status">Loading your saved assignment…</p>;
  if (!view) return <div><p role="alert">{error || "Assignment unavailable. Contact your teacher."}</p><button type="button" onClick={() => setReload(value => value + 1)}>Retry loading</button></div>;
  if (!view.available) return <div role="alert">Assignment unavailable. {view.work.unavailableReason || "Ask your teacher to review the template binding."}</div>;
  const questions = view.work.template?.questions || [];
  const index = Math.max(0, questions.findIndex(q => q.id === questionId));
  const question = questions[index];
  const answer = answers[question?.id] || {};
  const readOnly = submissionPending || conflicted || view.caseStatus !== "OPEN" || submitted;
  return <div className="form-container-violation" style={{ width: "100%" }}>
    <h1>{view.work.template?.infractionName} — Level {view.work.template?.level}</h1>
    <p role="status">{busy ? "Saving…" : dirty ? "Unsaved changes — save before leaving" : `Saved · ${view.work.state.replace(/_/g, " ").toLowerCase()}`}</p>
    {error && <p role="alert">{error}</p>}
    {conflicted && <button type="button" onClick={async () => {
      if (!window.confirm("Replace this tab's unsaved draft with the current saved assignment? Review your draft before continuing.")) return;
      try { const saved = await loadAssignment(id); setView(saved); setAnswers(saved.work.answers || {});
        setQuestionId(saved.work.currentQuestionId || saved.work.template?.questions[0]?.id); sessionStorage.removeItem(draftKey);
        setDirty(false); setConflicted(false); setError(""); pending.current = undefined;
      } catch (e) { setError(assignmentError(e)); }
    }}>Reload saved assignment</button>}
    {view.work.feedback && <p><strong>Staff feedback:</strong> {view.work.feedback}</p>}
    {(submitted || view.work.state === "SUBMITTED") && <p role="status">Assignment submitted. Your work is saved and awaiting staff review.</p>}
    {question && <form onSubmit={event => { event.preventDefault(); void save("submit"); }}>
      <label>Question <select aria-label="Question" value={question.id} disabled={readOnly || busy} onChange={event => {
        edit.current++; setQuestionId(event.target.value); setDirty(true);
      }}>{questions.map((q, i) => <option key={q.id} value={q.id}>{i + 1}</option>)}</select> of {questions.length}</label>
      <h3>{question.title}</h3>
      {question.passageBody && <p style={{ whiteSpace: "pre-wrap" }}>{question.passageBody}</p>}
      {question.passageReferences?.map((reference, index) => <p key={index}>{reference}</p>)}
      <label htmlFor={`answer-${question.id}`}>{question.prompt}{question.required ? " *" : ""}</label>
      {question.type === "EXPLORATORY_OPEN" ? <textarea id={`answer-${question.id}`} value={answer.text || ""}
        disabled={readOnly} rows={5} style={{ width: "100%" }} onChange={event => update({ ...answer, text: event.target.value })} />
        : <fieldset disabled={readOnly}><legend>{question.prompt}</legend>{question.options?.map(option => <label key={option.id} style={{ display: "block" }}>
          <input type={question.selectionMode === "MULTIPLE" ? "checkbox" : "radio"} name={`answer-${question.id}`}
            checked={(answer.optionIds || []).includes(option.id)} onChange={event => update({ ...answer, optionIds:
              question.selectionMode === "MULTIPLE" ? event.target.checked ? [...(answer.optionIds || []), option.id] : (answer.optionIds || []).filter(id => id !== option.id) : [option.id] })} /> {option.label}
        </label>)}</fieldset>}
      {question.type === "READING_MC" && question.retry?.enabled && <details><summary>Reading retry</summary>
        <RetryQuestionFormat essay={question} sectionName="Reading retry" value={answer.retryText || ""}
          onDraftChange={value => update({ ...answer, retryText: value })} disabled={readOnly} required={false}
          saveAnswerAndProgress={() => { void save(); }} handleRadioChange={() => {}} />
      </details>}
      <p>Answers are saved together with your place. You can review earlier questions before submitting.</p>
      <button type="button" disabled={readOnly || busy} onClick={() => void save()}>Save progress</button>{" "}
      {index < questions.length - 1 && <button type="button" disabled={readOnly || busy} onClick={() => void save("save", questions[index + 1].id)}>Save and next question</button>}{" "}
      <button type="submit" disabled={readOnly || busy}>Submit assignment</button>
    </form>}
  </div>;
};
export default ViolationPage;
