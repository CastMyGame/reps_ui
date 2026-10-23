import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { get } from "../../../utils/api/api";
import { baseUrl } from "../../../utils/jsonData";
import {
  classKey,
  rosterError,
  CLASS_PERIODS,
  requireSavedRoster,
  requireSavedStudent,
} from "../../../utils/roster";
import { Student } from "../../../types/school";
import { TeacherOverviewDto } from "../../../types/responses";
import MobileTeacherShell from "./MobileTeacherShell";
import "../mobile.css";

const MobileTeacherAddStudent = () => {
  const navigate = useNavigate();
  const inFlight = useRef(false);
  const [mode, setMode] = useState("new");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentReady, setStudentReady] = useState(false);
  const [overview, setOverview] = useState<TeacherOverviewDto>({});
  const [classChoice, setClassChoice] = useState("");
  const [className, setClassName] = useState("");
  const [classPeriod, setClassPeriod] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    grade: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`${baseUrl}/student/v1/allStudents`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
        },
      })
      .then((r) => setStudents(r.data))
      .catch((e) => setError(rosterError(e)));
    get("DTO/v1/TeacherOverviewData")
      .then((data: TeacherOverviewDto) => {
        setOverview(data);
        const firstClass = data.teacher?.classes?.[0];
        setClassChoice(firstClass ? classKey(firstClass) : "NEW");
      })
      .catch(() => setError("We could not load your classes."))
      .finally(() => setLoading(false));
  }, []);

  const classes = overview.teacher?.classes ?? [];
  const isNewClass = classChoice === "NEW";
  const updateField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setError("");
    let ready = mode === "existing";
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
    };
    const email = form.email.trim().toLowerCase();
    const teacherEmail =
      overview.teacher?.email || sessionStorage.getItem("email") || "";
    const school =
      overview.school?.schoolName || sessionStorage.getItem("schoolName") || "";
    const selectedClass = classes.find(
      (item) => classKey(item) === classChoice,
    );
    const finalClassName = isNewClass
      ? className.trim()
      : selectedClass?.className || "";
    const finalClassPeriod = isNewClass
      ? classPeriod.trim()
      : selectedClass?.classPeriod || "";
    if (!finalClassName || !finalClassPeriod) {
      setError("Choose a class or enter a new class name and period.");
      setSubmitting(false);
      inFlight.current = false;
      return;
    }
    try {
      if (mode === "new") {
        const created = await axios.post(
          `${baseUrl}/student/v1/newStudent`,
          {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            grade: form.grade,
            studentEmail: email,
            parentEmail: "",
            parentPhoneNumber: "",
            studentPhoneNumber: "",
            address: "",
            guidanceEmail: "",
            school,
          },
          { headers },
        );
        requireSavedStudent(created.data);
        ready = true;
        setStudentReady(true);
      }
      const roster = Array.from(
        new Set([...(selectedClass?.classRoster ?? []), email]),
      );
      const enrolled = await axios.put(
        `${baseUrl}/employees/v1/updateClass/${encodeURIComponent(teacherEmail)}`,
        {
          expectedRosterRevision: overview.teacher?.rosterRevision ?? 0,
          createOnly: isNewClass,
          classToUpdate: {
            className: finalClassName,
            classPeriod: finalClassPeriod,
            classRoster: roster,
          },
        },
        { headers },
      );
      requireSavedRoster(
        enrolled.data,
        { className: finalClassName, classPeriod: finalClassPeriod },
        roster,
      );
      setSuccess(true);
    } catch (requestError) {
      setError(
        `${ready ? "Student record is available, but enrollment was not confirmed. No student record was deleted. Reload classes and retry enrollment. " : "Student creation was not confirmed; retrying the same details is safe. "}${rosterError(requestError)}`,
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <MobileTeacherShell title="Add student" showBack>
        <div className="mobile-loading">
          <CircularProgress size={28} /> Preparing form
        </div>
      </MobileTeacherShell>
    );
  if (success)
    return (
      <MobileTeacherShell title="Add student" showBack>
        <section className="mobile-success-state">
          <CheckCircleRoundedIcon />
          <p className="mobile-eyebrow">Student added</p>
          <h2>All set</h2>
          <p>
            {form.firstName} {form.lastName} was added to{" "}
            {isNewClass ? className : "the selected class"}.
          </p>
          <button
            className="mobile-primary-button"
            type="button"
            onClick={() => navigate("/m/teacher/classes")}
          >
            View my classes
          </button>
        </section>
      </MobileTeacherShell>
    );

  return (
    <MobileTeacherShell title="Add student" showBack>
      <section className="mobile-teacher-content">
        <p className="mobile-eyebrow">Classroom setup</p>
        <h2 className="mobile-greeting">Add a student</h2>
        <p className="mobile-intro">
          Create a student or enroll an existing school student. Success is
          shown only after enrollment is saved.
        </p>
        <form className="mobile-form" onSubmit={submit}>
          <fieldset
            disabled={submitting}
            style={{ border: 0, padding: 0, minWidth: 0 }}
          >
            <label>
              Student option
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setStudentReady(false);
                }}
              >
                <option value="new">Create new student</option>
                <option value="existing">Enroll existing student</option>
              </select>
            </label>
            {mode === "existing" ? (
              <label>
                Existing student
                <select
                  required
                  value={form.email}
                  onChange={(e) => {
                    const student = students.find(
                      (s) => s.studentEmail === e.target.value,
                    );
                    setForm({
                      email: student?.studentEmail ?? "",
                      firstName: student?.firstName ?? "",
                      lastName: student?.lastName ?? "",
                      grade: student?.grade ?? "",
                    });
                  }}
                >
                  <option value="">Choose a student</option>
                  {students.map((s) => (
                    <option key={s.studentEmail} value={s.studentEmail}>
                      {s.firstName} {s.lastName} · {s.studentEmail}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                <label>
                  First name
                  <input
                    required
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                  />
                </label>
                <label>
                  Last name
                  <input
                    required
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                  />
                </label>
                <label>
                  Student email
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                  />
                </label>
                <label>
                  Grade
                  <select
                    required
                    value={form.grade}
                    onChange={(event) =>
                      updateField("grade", event.target.value)
                    }
                  >
                    <option value="">Choose a grade</option>
                    {["8", "9", "10", "11", "12"].map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label>
              Class
              <select
                required
                value={classChoice}
                onChange={(event) => setClassChoice(event.target.value)}
              >
                <option value="">Choose a class</option>
                {classes.map((item) => (
                  <option key={classKey(item)} value={classKey(item)}>
                    {item.className} · Period {item.classPeriod}
                  </option>
                ))}
                <option value="NEW">Create a new class</option>
              </select>
            </label>
            {isNewClass && (
              <>
                <label>
                  New class name
                  <input
                    required
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    placeholder="e.g. Algebra I"
                  />
                </label>
                <label>
                  Class period
                  <select
                    required
                    value={classPeriod}
                    onChange={(event) => setClassPeriod(event.target.value)}
                  >
                    <option value="">Choose a period</option>
                    {CLASS_PERIODS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {studentReady && (
              <p role="status">
                Student record saved. Class enrollment must also succeed.
              </p>
            )}
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                get("DTO/v1/TeacherOverviewData")
                  .then((data: TeacherOverviewDto) => {
                    setOverview(data);
                    setError(
                      "Classes refreshed. Your student details are preserved; review the class and retry.",
                    );
                  })
                  .catch((e) => setError(rosterError(e)));
              }}
            >
              Reload classes for retry
            </button>
            {error && (
              <p className="mobile-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="mobile-primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Add student to class"}
            </button>
          </fieldset>
        </form>
      </section>
    </MobileTeacherShell>
  );
};

export default MobileTeacherAddStudent;
