import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../../utils/jsonData";
import { get, handleLogout } from "../../../utils/api/api";
import { AdminOverviewDto } from "../../../types/responses";
import { ReferralPayload, Student } from "../../../types/school";
import "../admin-create-mobile-v2.css";

type RecordKind = "SHOUT_OUT" | "REFERRAL";
const periods = [
  "Class Exchange",
  "After School",
  "Lunch",
  ...Array.from({ length: 9 }, (_, index) => `Period ${index + 1}`),
];
const referralTypes = [
  "Tardy",
  "Unauthorized Device/Cell Phone",
  "Disruptive Behavior",
  "Horseplay",
  "Dress Code",
  "Inappropriate Language",
  "Behavioral Concern",
  "Academic Concern",
  "Failure to Complete Work",
];

const MobileAdminCreateRecordV2 = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverviewDto | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [kind, setKind] = useState<RecordKind>("SHOUT_OUT");
  const [period, setPeriod] = useState("");
  const [referralType, setReferralType] = useState(referralTypes[0]);
  const [points, setPoints] = useState(1);
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    Promise.all([
      get("DTO/v1/AdminOverviewData"),
      axios.get(`${baseUrl}/student/v1/allStudents`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
        },
      }),
    ])
      .then(([admin, response]) => {
        setOverview(admin);
        setStudents(response.data ?? []);
      })
      .catch(() =>
        setError("We could not load the student list. Please try again."),
      )
      .finally(() => setLoading(false));
  }, []);
  const visibleStudents = useMemo(
    () =>
      students.filter((student) =>
        `${student.firstName} ${student.lastName} ${student.grade}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [students, search],
  );
  const toggleStudent = (email: string) =>
    setSelected((current) =>
      current.includes(email)
        ? current.filter((item) => item !== email)
        : [...current, email],
    );
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safePoints =
      kind === "SHOUT_OUT" ? Math.max(0, Math.floor(points || 0)) : 0;
    if (safePoints > (overview?.teacher?.currency ?? 0))
      return setError(
        "That award is larger than the available points balance.",
      );
    const payload: ReferralPayload[] = selected.map((studentEmail) => ({
      studentEmail,
      teacherEmail:
        overview?.teacher?.email || sessionStorage.getItem("email") || "",
      infractionPeriod: period,
      infractionName:
        kind === "SHOUT_OUT" ? "Positive Behavior Shout Out!" : referralType,
      infractionDescription: description.trim(),
      currency: safePoints,
      guidanceDescription: "",
      phoneLogDescription: "",
    }));
    try {
      setSubmitting(true);
      setError("");
      await axios.post(`${baseUrl}/punish/v1/startPunish/formList`, payload, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
        },
      });
      setSuccess(true);
    } catch {
      setError(
        "The record was not created. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const reset = () => {
    setSelected([]);
    setPeriod("");
    setDescription("");
    setPoints(1);
    setSuccess(false);
  };
  return (
    <main className="mobile-create-v2-app">
      <header className="mobile-create-v2-header">
        <button
          type="button"
          onClick={() => navigate("/m/admin")}
          aria-label="Back to admin home"
        >
          <ArrowBackRoundedIcon />
        </button>
        <div>
          <span>REPS</span>
          <h1>Create record</h1>
        </div>
        <button type="button" onClick={handleLogout} aria-label="Sign out">
          <LogoutRoundedIcon />
        </button>
      </header>
      {loading ? (
        <div className="mobile-create-v2-loading">
          <CircularProgress size={28} /> Preparing form
        </div>
      ) : success ? (
        <section className="mobile-create-v2-content mobile-create-v2-success">
          <CheckCircleRoundedIcon />
          <p>{kind === "SHOUT_OUT" ? "Shout-out sent" : "Referral created"}</p>
          <h2>All set</h2>
          <span>
            {selected.length}{" "}
            {selected.length === 1 ? "student was" : "students were"} included.
          </span>
          <button type="button" onClick={reset}>
            Create another record
          </button>
        </section>
      ) : (
        <section className="mobile-create-v2-content">
          <p className="mobile-create-v2-eyebrow">Quick action</p>
          <h2>Create one record for multiple students</h2>
          <form onSubmit={submit}>
            <fieldset>
              <legend>Record type</legend>
              <div className="mobile-create-v2-type-grid">
                <label className={kind === "SHOUT_OUT" ? "selected" : ""}>
                  <input
                    type="radio"
                    checked={kind === "SHOUT_OUT"}
                    onChange={() => setKind("SHOUT_OUT")}
                  />{" "}
                  <strong>Shout-out</strong>
                  <span>Recognize positive behavior.</span>
                </label>
                <label className={kind === "REFERRAL" ? "selected" : ""}>
                  <input
                    type="radio"
                    checked={kind === "REFERRAL"}
                    onChange={() => setKind("REFERRAL")}
                  />{" "}
                  <strong>Referral</strong>
                  <span>Document a concern.</span>
                </label>
              </div>
            </fieldset>
            <div className="mobile-create-v2-student-heading">
              <label>Students</label>
              <span>{selected.length} selected</span>
            </div>
            <div className="mobile-create-v2-search">
              <SearchRoundedIcon />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students"
              />
            </div>
            <div className="mobile-create-v2-students">
              {visibleStudents.map((student) => (
                <label key={student.studentEmail}>
                  <input
                    type="checkbox"
                    checked={selected.includes(student.studentEmail)}
                    onChange={() => toggleStudent(student.studentEmail)}
                  />
                  <span>
                    <strong style={{color:"black"}}>
                      {student.firstName} {student.lastName}
                    </strong>
                    <small>Grade {student.grade}</small>
                  </span>
                </label>
              ))}
            </div>
            <label>
              Period
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option value="">Choose a period</option>
                {periods.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            {kind === "REFERRAL" && (
              <label>
                Referral type
                <select
                  value={referralType}
                  onChange={(event) => setReferralType(event.target.value)}
                >
                  {referralTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            )}
            {kind === "SHOUT_OUT" && (
              <label>
                Points per student
                <input
                  type="number"
                  min="0"
                  max={overview?.teacher?.currency ?? 0}
                  value={points}
                  onChange={(event) => setPoints(Number(event.target.value))}
                />
              </label>
            )}
            <label>
              {kind === "SHOUT_OUT"
                ? "What did they do well?"
                : "Brief description"}
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>
            {error && <p className="mobile-create-v2-error">{error}</p>}
            <button
              className="mobile-create-v2-submit"
              disabled={
                !selected.length || !period || !description.trim() || submitting
              }
            >
              {submitting
                ? "Saving…"
                : `Create ${kind === "SHOUT_OUT" ? "shout-out" : "referral"} for ${selected.length || "…"}`}
            </button>
          </form>
        </section>
      )}
    </main>
  );
};
export default MobileAdminCreateRecordV2;
