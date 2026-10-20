import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { get, handleLogout } from "../../../utils/api/api";
import EmailCapabilityIndicator from "../../globalComponents/EmailCapabilityIndicator";
import { OfficeReferral, TeacherReferral } from "../../../types/responses";
import "./student-mobile.css";

type StudentOverview = {
  student?: { firstName?: string; lastName?: string };
  punishments?: TeacherReferral[];
  officeReferrals?: OfficeReferral[];
};

type MobileAssignment = { id: string; title: string; description: string; status: string };

const MobileStudentHome = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<StudentOverview>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    get("DTO/v1/StudentOverviewData")
      .then(setOverview)
      .catch(() => setError("We could not load your assignments. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const assignments: MobileAssignment[] = useMemo(() => [
    ...(overview.punishments ?? []).map((item) => ({ id: item.punishmentId, title: item.infractionName, description: item.infractionDescription?.[0] || "", status: item.status })),
    ...(overview.officeReferrals ?? []).map((item) => ({ id: item.officeReferralId, title: "Office referral", description: item.referralDescription || "", status: item.status })),
  ].filter((item) => item.status === "OPEN" || item.status === "PENDING"), [overview]);
  const firstName = overview.student?.firstName || sessionStorage.getItem("userName") || "Student";

  return <main className="mobile-student-app">
    <header className="mobile-student-header">
      <div className="mobile-student-mark" aria-hidden="true"><AssignmentRoundedIcon /></div>
      <div><span>REPS</span><h1>Student home</h1></div>
      <button type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button>
    </header>
    <section className="mobile-student-content" aria-busy={loading}>
      <p className="mobile-student-eyebrow">Your school day</p>
      <h2>Hi, {firstName}</h2>
      <p className="mobile-student-intro">Keep track of the work that needs your attention.</p>
      <EmailCapabilityIndicator />
      {loading ? <div className="mobile-student-loading"><CircularProgress size={26} /> Loading assignments</div> : error ? <p className="mobile-student-error" role="alert">{error}</p> : <>
        <section className="mobile-student-stats"><div><AssignmentRoundedIcon /><strong>{assignments.length}</strong><span>to complete</span></div><div><CheckCircleRoundedIcon /><strong>—</strong><span>completed</span></div></section>
        <section className="mobile-student-section" aria-labelledby="student-assignments"><h3 id="student-assignments">Assignments to complete</h3>
          {assignments.length === 0 ? <div className="mobile-student-empty"><CheckCircleRoundedIcon /><strong>You’re all caught up</strong><span>No open assignments right now.</span></div> : <div className="mobile-student-list">{assignments.map((item) => <article key={item.id}><div><strong>{item.title}</strong><p>{item.description || "Review this assignment with your teacher."}</p><small>{item.status === "PENDING" ? "Waiting for teacher approval" : "Ready to start"}</small></div><button type="button" disabled={item.status === "PENDING"} onClick={() => navigate("/dashboard/student")}>{item.status === "PENDING" ? "Pending" : "Open"}</button></article>)}</div>}
        </section>
      </>}
    </section>
  </main>;
};

export default MobileStudentHome;
