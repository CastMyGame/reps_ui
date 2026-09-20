import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../../utils/jsonData";
import { get, handleLogout } from "../../../utils/api/api";
import { AdminOverviewDto } from "../../../types/responses";
import "../admin-create-mobile-v2.css";

type FormMode = "STUDENT" | "TEACHER";
type FormValues = { firstName: string; lastName: string; email: string; parentEmail: string; guidanceEmail: string; address: string; grade: string; parentPhoneNumber: string; studentPhoneNumber: string };
const emptyForm: FormValues = { firstName: "", lastName: "", email: "", parentEmail: "", guidanceEmail: "", address: "", grade: "", parentPhoneNumber: "", studentPhoneNumber: "" };

const MobileAdminCreateStudentTeacherV2 = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<FormMode>("STUDENT");
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false); const [success, setSuccess] = useState(false); const [error, setError] = useState("");

  useEffect(() => { get("DTO/v1/AdminOverviewData").then((overview: AdminOverviewDto) => setSchoolName(overview.school?.schoolName || "")).catch(() => setError("We could not load your school information.")).finally(() => setLoading(false)); }, []);
  const updateField = (field: keyof FormValues, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const changeMode = (nextMode: FormMode) => { setMode(nextMode); setForm(emptyForm); setError(""); setSuccess(false); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setError("");
    const headers = { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` };
    const payload = mode === "STUDENT" ? { firstName: form.firstName.trim(), lastName: form.lastName.trim(), grade: form.grade, studentEmail: form.email.trim(), parentEmail: form.parentEmail.trim(), parentPhoneNumber: form.parentPhoneNumber.trim(), studentPhoneNumber: form.studentPhoneNumber.trim(), address: form.address.trim(), guidanceEmail: form.guidanceEmail.trim(), school: schoolName } : { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), school: schoolName };
    try { await axios.post(`${baseUrl}${mode === "STUDENT" ? "/student/v1/newStudent" : "/employees/v1/employees"}`, payload, { headers }); setSuccess(true); } catch (requestError) { console.error(`Unable to create ${mode.toLowerCase()}`, requestError); setError(`The ${mode === "STUDENT" ? "student" : "teacher"} could not be created. Please check the fields and try again.`); } finally { setSubmitting(false); }
  };
  const reset = () => { setForm(emptyForm); setSuccess(false); setError(""); };
  const input = (label: string, field: keyof FormValues, type = "text", required = true) => <label>{label}<input required={required} type={type} value={form[field]} onChange={(event) => updateField(field, event.target.value)} /></label>;

  return <main className="mobile-create-v2-app"><header className="mobile-create-v2-header"><button type="button" onClick={() => navigate("/m/admin")} aria-label="Back to admin home"><ArrowBackRoundedIcon /></button><div><span>REPS</span><h1>Add people</h1></div><button type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button></header>{loading ? <div className="mobile-create-v2-loading"><CircularProgress size={28} /> Preparing form</div> : success ? <section className="mobile-create-v2-content mobile-create-v2-success"><CheckCircleRoundedIcon /><p>{mode === "STUDENT" ? "Student added" : "Teacher added"}</p><h2>All set</h2><span>{form.firstName} {form.lastName} was added to {schoolName || "your school"}.</span><button type="button" onClick={reset}>Add another person</button></section> : <section className="mobile-create-v2-content"><p className="mobile-create-v2-eyebrow">School management</p><h2>Add a student or teacher</h2><p className="mobile-admin-v2-intro">Choose the person type, then complete the short form.</p><form onSubmit={submit}><fieldset><legend>Person type</legend><div className="mobile-create-v2-type-grid"><label className={mode === "STUDENT" ? "selected" : ""}><input type="radio" checked={mode === "STUDENT"} onChange={() => changeMode("STUDENT")} /><strong>Student</strong><span>Add a student record and family contact details.</span></label><label className={mode === "TEACHER" ? "selected" : ""}><input type="radio" checked={mode === "TEACHER"} onChange={() => changeMode("TEACHER")} /><strong>Teacher</strong><span>Add a teacher to the school staff.</span></label></div></fieldset>{input("First name", "firstName")}{input("Last name", "lastName")}{input(mode === "STUDENT" ? "Student email" : "Teacher email", "email", "email")}{mode === "STUDENT" && <>{input("Parent email", "parentEmail", "email")}{input("Guidance email", "guidanceEmail", "email")}{input("Address", "address")}<label>Grade<select required value={form.grade} onChange={(event) => updateField("grade", event.target.value)}><option value="">Choose a grade</option>{["8", "9", "10", "11", "12"].map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}</select></label>{input("Parent phone", "parentPhoneNumber", "tel")}{input("Student phone", "studentPhoneNumber", "tel")}</>}{error && <p className="mobile-create-v2-error" role="alert">{error}</p>}<button className="mobile-create-v2-submit" type="submit" disabled={submitting}>{submitting ? "Saving…" : `Add ${mode === "STUDENT" ? "student" : "teacher"}`}</button></form></section>}</main>;
};

export default MobileAdminCreateStudentTeacherV2;
