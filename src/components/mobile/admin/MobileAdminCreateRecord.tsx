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
import { ReferralPayload, Student } from "../../../types/school";
import { useNotifications } from "src/notifications/NotificationProvider";
import "../admin-create-mobile.css";

type RecordKind = "SHOUT_OUT" | "REFERRAL";

const periods = ["Class Exchange", "After School", "Lunch", ...Array.from({ length: 9 }, (_, index) => `Period ${index + 1}`)];
const referralTypes = ["Tardy", "Unauthorized Device/Cell Phone", "Disruptive Behavior", "Horseplay", "Dress Code", "Inappropriate Language", "Behavioral Concern", "Academic Concern", "Failure to Complete Work"];

const MobileAdminCreateRecord = () => {
  const navigate = useNavigate();
  const {notify} = useNotifications();
  const [overview, setOverview] = useState<AdminOverviewDto | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [kind, setKind] = useState<RecordKind>("SHOUT_OUT");
  const [studentEmail, setStudentEmail] = useState("");
  const [period, setPeriod] = useState("");
  const [referralType, setReferralType] = useState(referralTypes[0]);
  const [points, setPoints] = useState(1);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      try {
        const [adminData, studentsResponse] = await Promise.all([
          get("DTO/v1/AdminOverviewData"),
          axios.get(`${baseUrl}/student/v1/allStudents`, { headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` } }),
        ]);
        setOverview(adminData);
        setStudents(studentsResponse.data ?? []);
      } catch (err) { console.error("Unable to load create-record form", err); setError("We could not load the student list. Please try again."); }
      finally { setLoading(false); }
    };
    loadForm();
  }, []);

  const resetForAnother = () => { setStudentEmail(""); setPeriod(""); setDescription(""); setPoints(1); setSuccess(false); };
  const recordName = kind === "SHOUT_OUT" ? "Positive Behavior Shout Out!" : referralType;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safePoints = kind === "SHOUT_OUT" ? Math.max(0, Math.floor(points || 0)) : 0;
    if (safePoints > (overview?.teacher?.currency ?? 0)) { setError("That award is larger than the available points balance."); return; }
    const payload: ReferralPayload[] = [{
      studentEmail,
      teacherEmail: overview?.teacher?.email || sessionStorage.getItem("email") || "",
      infractionPeriod: period,
      infractionName: recordName,
      infractionDescription: description.trim(),
      currency: safePoints,
      guidanceDescription: "",
      phoneLogDescription: "",
    }];
    try {
      setSubmitting(true); setError("");
      await axios.post(
    `${baseUrl}/punish/v1/startPunish/formList`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
      },
    }
  );

  window.setTimeout(() => {
    notify(
      kind === "SHOUT_OUT"
        ? {
            title: "Shout-out sent", 
            message: "A student has been recognized for positive behavior.",
            kind: "success",
            target: "/m/admin",
          }
        : {
            title: "New referral",
            message: "A new referral needs review.",
            kind: "warning",
            target: "/m/admin/write-ups",
          },
      { browser: true }
    );
  }, 5000);

  setSuccess(true);
    } catch (err) { console.error("Unable to create record", err); setError("The record was not created. Check your connection and try again."); }
    finally { setSubmitting(false); }
  };

  return <main className="mobile-create-app">
    <header className="mobile-create-header"><button type="button" onClick={() => navigate("/m/admin")} aria-label="Back to admin home"><ArrowBackRoundedIcon /></button><div><span>REPS</span><h1>Create record</h1></div><button type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button></header>
    {loading ? <div className="mobile-create-loading" aria-live="polite"><CircularProgress size={28} /> Preparing form</div> : success ? <section className="mobile-create-content mobile-create-success"><CheckCircleRoundedIcon aria-hidden="true" /><p className="mobile-create-eyebrow">{kind === "SHOUT_OUT" ? "Shout-out sent" : "Referral created"}</p><h2>All set</h2><p>The student record has been saved.</p><button type="button" onClick={resetForAnother}>Create another record</button></section> : <section className="mobile-create-content">
      <p className="mobile-create-eyebrow">Quick action</p><h2>What are you creating?</h2><p className="mobile-create-intro">Choose the action first. The form stays short and focused.</p>
      <form onSubmit={submit} className="mobile-create-form">
        <fieldset><legend>Record type</legend><div className="mobile-create-choice-grid"><label className={kind === "SHOUT_OUT" ? "selected" : ""}><input type="radio" name="recordKind" checked={kind === "SHOUT_OUT"} onChange={() => setKind("SHOUT_OUT")} /><strong >Shout-out</strong><span>Recognize positive behavior and award points.</span></label><label className={kind === "REFERRAL" ? "selected" : ""}><input type="radio" name="recordKind" checked={kind === "REFERRAL"} onChange={() => setKind("REFERRAL")} /><strong>Referral</strong><span>Document a concern that needs follow-up.</span></label></div></fieldset>
        <label htmlFor="record-student">Student</label><select id="record-student" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} required><option value="">Choose a student</option>{students.map((student) => <option key={student.studentEmail} value={student.studentEmail}>{student.firstName} {student.lastName} · Grade {student.grade}</option>)}</select>
        <label htmlFor="record-period">Period</label><select id="record-period" value={period} onChange={(event) => setPeriod(event.target.value)} required><option value="">Choose a period</option>{periods.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        {kind === "REFERRAL" && <><label htmlFor="record-referral-type">Referral type</label><select id="record-referral-type" value={referralType} onChange={(event) => setReferralType(event.target.value)}>{referralTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></>}
        {kind === "SHOUT_OUT" && <><label htmlFor="record-points">Points to award</label><div className="mobile-create-points"><button type="button" onClick={() => setPoints((value) => Math.max(0, value - 1))} aria-label="Decrease points">−</button><input id="record-points" type="number" min="0" max={overview?.teacher?.currency ?? 0} value={points} onChange={(event) => setPoints(Number(event.target.value))} /><button type="button" onClick={() => setPoints((value) => Math.min(overview?.teacher?.currency ?? 0, value + 1))} aria-label="Increase points">+</button></div><p className="mobile-create-hint">Available to award: {overview?.teacher?.currency ?? 0}</p></>}
        <label htmlFor="record-description">{kind === "SHOUT_OUT" ? "What did they do well?" : "Brief description"}</label><textarea id="record-description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={kind === "SHOUT_OUT" ? "Describe the positive behavior specifically." : "Use objective facts. This may be visible to a student and guardian."} maxLength={500} required />
        {error && <p className="mobile-create-error" role="alert">{error}</p>}<button className="mobile-create-submit" type="submit" disabled={!studentEmail || !period || !description.trim() || submitting}>{submitting ? "Saving…" : kind === "SHOUT_OUT" ? "Send shout-out" : "Create referral"}</button>
      </form>
    </section>}
  </main>;
};

export default MobileAdminCreateRecord;
