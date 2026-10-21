import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import AnnouncementRoundedIcon from "@mui/icons-material/AnnouncementRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { get } from "../../../utils/api/api";
import { TeacherOverviewDto } from "../../../types/responses";
import MobileTeacherShell from "./MobileTeacherShell";
import "../mobile.css";
import EmailCapabilityIndicator from "../../globalComponents/EmailCapabilityIndicator";

const MobileTeacherHome = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<TeacherOverviewDto>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try { setOverview(await get("DTO/v1/TeacherOverviewData")); }
      catch (err) { console.error("Unable to load mobile teacher overview", err); setError("We could not load your classes. Pull down to try again."); }
      finally { setLoading(false); }
    };
    loadOverview();
  }, []);

  const studentCount = useMemo(() => new Set(overview.teacher?.classes?.flatMap((item) => item.classRoster ?? []) ?? []).size, [overview.teacher?.classes]);
  const teacherName = overview.teacher?.firstName || sessionStorage.getItem("userName") || "Teacher";
  const classCount = overview.teacher?.classes?.length ?? 0;
  const recentShoutOutCount = overview.shoutOutsResponse?.length ?? 0;
  const openReferralCount = [...(overview.writeUpResponse ?? []), ...(overview.officeReferrals ?? [])].filter((item) => item.status !== "CLOSED").length;
  const taskCount = (overview.punishmentResponse ?? []).filter((item) => item.status === "PENDING" && item.infractionLevel === "3").length;

  return <MobileTeacherShell title="Teacher home">
    <section className="mobile-teacher-content" aria-busy={loading}>
      <p className="mobile-eyebrow">Welcome back</p>
      <h2 className="mobile-greeting">Hi, {teacherName}</h2>
      <p className="mobile-intro">Recognize a student in under a minute.</p>
      <EmailCapabilityIndicator />
      <button className="mobile-primary-action" type="button" onClick={() => navigate("/m/teacher/shout-out")}>
        <CampaignRoundedIcon aria-hidden="true" /><span><strong>Give a shout-out</strong><small>Celebrate positive behavior now</small></span><ArrowForwardRoundedIcon aria-hidden="true" />
      </button>
      {loading ? <div className="mobile-loading" aria-live="polite"><CircularProgress size={28} /> Loading your classroom</div> : error ? <p className="mobile-error" role="alert">{error}</p> : <>
        <section className="mobile-section" aria-labelledby="classroom-summary"><h3 id="classroom-summary">Your classroom</h3>
          <div className="mobile-summary-grid">
            <div className="mobile-summary-item"><GroupsRoundedIcon aria-hidden="true" /><strong>{classCount}</strong><span>{classCount === 1 ? "class" : "classes"}</span></div>
            <div className="mobile-summary-item"><EmojiEventsRoundedIcon aria-hidden="true" /><strong>{studentCount}</strong><span>{studentCount === 1 ? "student" : "students"}</span></div>
            <div className="mobile-summary-item"><CampaignRoundedIcon aria-hidden="true" /><strong>{recentShoutOutCount}</strong><span>shout-outs</span></div>
          </div>
        </section>
        <section className="mobile-section" aria-labelledby="quick-actions"><h3 id="quick-actions">Quick actions</h3>
          <div className="mobile-teacher-action-grid">
            <button type="button" className="mobile-teacher-action action-referrals" onClick={() => navigate("/m/teacher/records")}><WarningAmberRoundedIcon /><strong>Shout-outs & referrals</strong><small>{openReferralCount} open · {recentShoutOutCount} recent</small></button>
            <button type="button" className="mobile-teacher-action action-tasks" onClick={() => navigate("/dashboard/teacher")}><TaskAltRoundedIcon /><strong>My tasks</strong><small>{taskCount} level 3 reviews</small></button>
            <button type="button" className="mobile-teacher-action" onClick={() => navigate("/m/teacher/classes")}><GroupsRoundedIcon /><strong>My classes</strong><small>View rosters and students</small></button>
            <button type="button" className="mobile-teacher-action" onClick={() => navigate("/m/teacher/add-student")}><GroupsRoundedIcon /><strong>Add student</strong><small>Create a student and place them in a class</small></button>
            <button type="button" className="mobile-teacher-action" onClick={() => navigate("/dashboard/teacher")}><WarningAmberRoundedIcon /><strong>Detention & ISS</strong><small>Review today’s list</small></button>
            <button type="button" className="mobile-teacher-action" onClick={() => navigate("/dashboard/teacher")}><AnnouncementRoundedIcon /><strong>Announcement</strong><small>Message a class</small></button>
            <button type="button" className="mobile-teacher-action" onClick={() => navigate("/dashboard/teacher")}><TrackChangesRoundedIcon /><strong>Tracked behavior</strong><small>Record a behavior note</small></button>
            <button type="button" className="mobile-teacher-action action-analysis" onClick={() => navigate("/m/teacher/analysis")}><TrackChangesRoundedIcon /><strong>Analysis</strong><small>Explore classroom trends</small></button>
          </div>
        </section>
      </>}
    </section>
  </MobileTeacherShell>;
};

export default MobileTeacherHome;
