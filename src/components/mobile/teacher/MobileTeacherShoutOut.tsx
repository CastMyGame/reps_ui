import { classKey } from "../../../utils/roster";
import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { baseUrl } from "../../../utils/jsonData";
import { get } from "../../../utils/api/api";
import { TeacherOverviewDto } from "../../../types/responses";
import { ReferralPayload, Student } from "../../../types/school";
import MobileTeacherShell from "./MobileTeacherShell";
import "../mobile.css";

const SHOUT_OUT_NAME = "Positive Behavior Shout Out!";

const MobileTeacherShoutOut = () => {
  const [overview, setOverview] = useState<TeacherOverviewDto>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedStudentEmails, setSelectedStudentEmails] = useState<string[]>([]);
  const [points, setPoints] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      try {
        const data: TeacherOverviewDto = await get("DTO/v1/TeacherOverviewData");
        setOverview(data);
        const classes = data.teacher?.classes ?? [];
        setSelectedClassName(classes[0] ? classKey(classes[0]) : "");
        const emails = Array.from(new Set(classes.flatMap((item) => item.classRoster ?? [])));
        if (emails.length) {
          const response = await axios.post(`${baseUrl}/student/v1/getByEmailList`, emails, { headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` } });
          setStudents(response.data ?? []);
        }
      } catch (err) { console.error("Unable to load shout-out form", err); setError("We could not load your roster. Please try again."); }
      finally { setLoading(false); }
    };
    loadForm();
  }, []);

  const selectedClass = useMemo(() => overview.teacher?.classes?.find((item) => classKey(item) === selectedClassName), [overview.teacher?.classes, selectedClassName]);
  const classStudents = useMemo(() => students.filter((student) => selectedClass?.classRoster?.includes(student.studentEmail)), [students, selectedClass]);
  const toggleStudent = (email: string) => setSelectedStudentEmails((current) => current.includes(email) ? current.filter((item) => item !== email) : [...current, email]);
  const resetForAnother = () => { setSelectedStudentEmails([]); setPoints(1); setMessage(""); setSuccess(false); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedStudentEmails.length === 0 || !selectedClass) return;
    const safePoints = Math.max(0, Math.floor(points || 0));
    if (safePoints > (overview.teacher?.currency ?? 0)) { setError("That award is larger than your available points balance."); return; }
    const payload: ReferralPayload[] = selectedStudentEmails.map((studentEmail) => ({ studentEmail, teacherEmail: overview.teacher?.email || sessionStorage.getItem("email") || "", infractionPeriod: selectedClass.classPeriod, infractionName: SHOUT_OUT_NAME, infractionDescription: message.trim(), currency: safePoints, guidanceDescription: "", phoneLogDescription: "" }));
    try { setSubmitting(true); setError(""); await axios.post(`${baseUrl}/punish/v1/startPunish/formList`, payload, { headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` } }); setSuccess(true); }
    catch (err) { console.error("Unable to submit shout-out", err); setError("The request did not complete. Some recognition records may have been saved; check records before retrying."); }
    finally { setSubmitting(false); }
  };

  if (loading) return <MobileTeacherShell title="Give a shout-out" showBack><div className="mobile-loading" aria-live="polite"><CircularProgress size={28} /> Preparing your roster</div></MobileTeacherShell>;
  if (success) {
    const selectedStudents = students.filter((item) => selectedStudentEmails.includes(item.studentEmail));
    return <MobileTeacherShell title="Give a shout-out" showBack><section className="mobile-teacher-content mobile-success-state"><CheckCircleRoundedIcon aria-hidden="true" /><p className="mobile-eyebrow">Recognition saved</p><h2>Nice work!</h2><p>{selectedStudents.length === 1 ? `${selectedStudents[0]?.firstName || "Your student"} has` : `${selectedStudents.length} students have`} been recognized for positive behavior.</p><button className="mobile-primary-button" type="button" onClick={resetForAnother}>Recognize another student</button></section></MobileTeacherShell>;
  }

  return <MobileTeacherShell title="Give a shout-out" showBack><section className="mobile-teacher-content">
    <p className="mobile-eyebrow">Positive behavior</p><h2 className="mobile-greeting">Make it specific</h2><p className="mobile-intro">Choose one or more students from the same class and say what they did well.</p>
    <form className="mobile-form" onSubmit={submit}>
      <label htmlFor="mobile-class">Class</label><select id="mobile-class" value={selectedClassName} onChange={(event) => { setSelectedClassName(event.target.value); setSelectedStudentEmails([]); }} required>{overview.teacher?.classes?.map((item) => <option key={`${item.className}-${item.classPeriod}`} value={classKey(item)}>{item.className} · Period {item.classPeriod}</option>)}</select>
      <div className="mobile-student-picker"><div className="mobile-student-picker-heading"><label>Students</label><span>{selectedStudentEmails.length} selected</span></div>{classStudents.length === 0 ? <p className="mobile-field-hint">No students are assigned to this class yet.</p> : <div className="mobile-student-options">{classStudents.map((student) => <label key={student.studentEmail} className={selectedStudentEmails.includes(student.studentEmail) ? "selected" : ""}><input type="checkbox" checked={selectedStudentEmails.includes(student.studentEmail)} onChange={() => toggleStudent(student.studentEmail)} /><span><strong>{student.firstName} {student.lastName}</strong><small>{student.studentEmail}</small></span></label>)}</div>}</div>
      <label htmlFor="mobile-points">Points to award</label><div className="mobile-points-row"><button type="button" onClick={() => setPoints((value) => Math.max(0, value - 1))} aria-label="Decrease points">−</button><input id="mobile-points" type="number" min="0" max={overview.teacher?.currency ?? 0} value={points} onChange={(event) => setPoints(Number(event.target.value))} /><button type="button" onClick={() => setPoints((value) => Math.min(overview.teacher?.currency ?? 0, value + 1))} aria-label="Increase points">+</button></div><p className="mobile-field-hint">Available to award: {overview.teacher?.currency ?? 0}</p>
      <label htmlFor="mobile-message">What did they do well? <span>(optional)</span></label><textarea id="mobile-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="For example: You helped a classmate get caught up without being asked." rows={4} maxLength={500} /><p className="mobile-field-hint">This message may be visible to the student and guardian.</p>
      {error && <p className="mobile-error" role="alert">{error}</p>}<button className="mobile-primary-button" type="submit" disabled={submitting || selectedStudentEmails.length === 0 || !selectedClass}>{submitting ? "Sending…" : `Send shout-out${selectedStudentEmails.length > 1 ? ` to ${selectedStudentEmails.length} students` : ""}`}</button>
    </form>
  </section></MobileTeacherShell>;
};

export default MobileTeacherShoutOut;
