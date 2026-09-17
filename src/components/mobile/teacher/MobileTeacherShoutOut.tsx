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
  const [studentEmail, setStudentEmail] = useState("");
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
        setSelectedClassName(classes[0]?.className ?? "");
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

  const selectedClass = useMemo(() => overview.teacher?.classes?.find((item) => item.className === selectedClassName), [overview.teacher?.classes, selectedClassName]);
  const classStudents = useMemo(() => students.filter((student) => selectedClass?.classRoster?.includes(student.studentEmail)), [students, selectedClass]);
  const resetForAnother = () => { setStudentEmail(""); setPoints(1); setMessage(""); setSuccess(false); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!studentEmail || !selectedClass) return;
    const safePoints = Math.max(0, Math.floor(points || 0));
    if (safePoints > (overview.teacher?.currency ?? 0)) { setError("That award is larger than your available points balance."); return; }
    const payload: ReferralPayload[] = [{ studentEmail, teacherEmail: overview.teacher?.email || sessionStorage.getItem("email") || "", infractionPeriod: selectedClass.classPeriod, infractionName: SHOUT_OUT_NAME, infractionDescription: message.trim(), currency: safePoints, guidanceDescription: "", phoneLogDescription: "" }];
    try { setSubmitting(true); setError(""); await axios.post(`${baseUrl}/punish/v1/startPunish/formList`, payload, { headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` } }); setSuccess(true); }
    catch (err) { console.error("Unable to submit shout-out", err); setError("Your shout-out was not sent. Check your connection and try again."); }
    finally { setSubmitting(false); }
  };

  if (loading) return <MobileTeacherShell title="Give a shout-out" showBack><div className="mobile-loading" aria-live="polite"><CircularProgress size={28} /> Preparing your roster</div></MobileTeacherShell>;
  if (success) {
    const student = students.find((item) => item.studentEmail === studentEmail);
    return <MobileTeacherShell title="Give a shout-out" showBack><section className="mobile-teacher-content mobile-success-state"><CheckCircleRoundedIcon aria-hidden="true" /><p className="mobile-eyebrow">Shout-out sent</p><h2>Nice work!</h2><p>{student?.firstName || "Your student"} has been recognized for positive behavior.</p><button className="mobile-primary-button" type="button" onClick={resetForAnother}>Recognize another student</button></section></MobileTeacherShell>;
  }

  return <MobileTeacherShell title="Give a shout-out" showBack><section className="mobile-teacher-content">
    <p className="mobile-eyebrow">Positive behavior</p><h2 className="mobile-greeting">Make it specific</h2><p className="mobile-intro">Choose one student and say what they did well.</p>
    <form className="mobile-form" onSubmit={submit}>
      <label htmlFor="mobile-class">Class</label><select id="mobile-class" value={selectedClassName} onChange={(event) => { setSelectedClassName(event.target.value); setStudentEmail(""); }} required>{overview.teacher?.classes?.map((item) => <option key={item.className} value={item.className}>{item.className}</option>)}</select>
      <label htmlFor="mobile-student">Student</label><select id="mobile-student" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} required><option value="">Choose a student</option>{classStudents.map((student) => <option key={student.studentEmail} value={student.studentEmail}>{student.firstName} {student.lastName}</option>)}</select>
      <label htmlFor="mobile-points">Points to award</label><div className="mobile-points-row"><button type="button" onClick={() => setPoints((value) => Math.max(0, value - 1))} aria-label="Decrease points">−</button><input id="mobile-points" type="number" min="0" max={overview.teacher?.currency ?? 0} value={points} onChange={(event) => setPoints(Number(event.target.value))} /><button type="button" onClick={() => setPoints((value) => Math.min(overview.teacher?.currency ?? 0, value + 1))} aria-label="Increase points">+</button></div><p className="mobile-field-hint">Available to award: {overview.teacher?.currency ?? 0}</p>
      <label htmlFor="mobile-message">What did they do well? <span>(optional)</span></label><textarea id="mobile-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="For example: You helped a classmate get caught up without being asked." rows={4} maxLength={500} /><p className="mobile-field-hint">This message may be visible to the student and guardian.</p>
      {error && <p className="mobile-error" role="alert">{error}</p>}<button className="mobile-primary-button" type="submit" disabled={submitting || !studentEmail || !selectedClass}>{submitting ? "Sending…" : "Send shout-out"}</button>
    </form>
  </section></MobileTeacherShell>;
};

export default MobileTeacherShoutOut;
