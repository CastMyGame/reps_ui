import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { get } from "../../../utils/api/api";
import { baseUrl } from "../../../utils/jsonData";
import { TeacherOverviewDto } from "../../../types/responses";
import MobileTeacherShell from "./MobileTeacherShell";
import "../mobile.css";

const MobileTeacherAddStudent = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<TeacherOverviewDto>({});
  const [classChoice, setClassChoice] = useState("");
  const [className, setClassName] = useState("");
  const [classPeriod, setClassPeriod] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", grade: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    get("DTO/v1/TeacherOverviewData")
      .then((data: TeacherOverviewDto) => {
        setOverview(data);
        const firstClass = data.teacher?.classes?.[0];
        setClassChoice(firstClass ? `${firstClass.className}|${firstClass.classPeriod}` : "NEW");
      })
      .catch(() => setError("We could not load your classes."))
      .finally(() => setLoading(false));
  }, []);

  const classes = overview.teacher?.classes ?? [];
  const isNewClass = classChoice === "NEW";
  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError("");
    const headers = { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` };
    const email = form.email.trim().toLowerCase();
    const teacherEmail = overview.teacher?.email || sessionStorage.getItem("email") || "";
    const school = overview.school?.schoolName || sessionStorage.getItem("schoolName") || "";
    const selectedClass = classes.find((item) => `${item.className}|${item.classPeriod}` === classChoice);
    const finalClassName = isNewClass ? className.trim() : selectedClass?.className || "";
    const finalClassPeriod = isNewClass ? classPeriod.trim() : selectedClass?.classPeriod || "";
    if (!finalClassName || !finalClassPeriod) { setError("Choose a class or enter a new class name and period."); setSubmitting(false); return; }
    try {
      await axios.post(`${baseUrl}/student/v1/newStudent`, { firstName: form.firstName.trim(), lastName: form.lastName.trim(), grade: form.grade, studentEmail: email, parentEmail: "", parentPhoneNumber: "", studentPhoneNumber: "", address: "", guidanceEmail: "", school }, { headers });
      const roster = Array.from(new Set([...(selectedClass?.classRoster ?? []), email]));
      await axios.put(`${baseUrl}/employees/v1/updateClass/${encodeURIComponent(teacherEmail)}`, { classToUpdate: { className: finalClassName, classPeriod: finalClassPeriod, classRoster: roster } }, { headers });
      setSuccess(true);
    } catch (requestError) { console.error("Unable to add student to class", requestError); setError("The student could not be added. Check the information and try again."); }
    finally { setSubmitting(false); }
  };

  if (loading) return <MobileTeacherShell title="Add student" showBack><div className="mobile-loading"><CircularProgress size={28} /> Preparing form</div></MobileTeacherShell>;
  if (success) return <MobileTeacherShell title="Add student" showBack><section className="mobile-success-state"><CheckCircleRoundedIcon /><p className="mobile-eyebrow">Student added</p><h2>All set</h2><p>{form.firstName} {form.lastName} was added to {isNewClass ? className : "the selected class"}.</p><button className="mobile-primary-button" type="button" onClick={() => navigate("/m/teacher/classes")}>View my classes</button></section></MobileTeacherShell>;

  return <MobileTeacherShell title="Add student" showBack><section className="mobile-teacher-content"><p className="mobile-eyebrow">Classroom setup</p><h2 className="mobile-greeting">Add a student</h2><p className="mobile-intro">Create a student record and place them in one of your classes.</p><form className="mobile-form" onSubmit={submit}><label>First name<input required value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} /></label><label>Last name<input required value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} /></label><label>Student email<input required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} /></label><label>Grade<select required value={form.grade} onChange={(event) => updateField("grade", event.target.value)}><option value="">Choose a grade</option>{["8", "9", "10", "11", "12"].map((grade) => <option key={grade} value={grade}>{grade}</option>)}</select></label><label>Class<select required value={classChoice} onChange={(event) => setClassChoice(event.target.value)}><option value="">Choose a class</option>{classes.map((item) => <option key={`${item.className}|${item.classPeriod}`} value={`${item.className}|${item.classPeriod}`}>{item.className} · Period {item.classPeriod}</option>)}<option value="NEW">Create a new class</option></select></label>{isNewClass && <><label>New class name<input required value={className} onChange={(event) => setClassName(event.target.value)} placeholder="e.g. Algebra I" /></label><label>Class period<input required value={classPeriod} onChange={(event) => setClassPeriod(event.target.value)} placeholder="e.g. 1" /></label></>}{error && <p className="mobile-error" role="alert">{error}</p>}<button className="mobile-primary-button" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Add student to class"}</button></form></section></MobileTeacherShell>;
};

export default MobileTeacherAddStudent;
