import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { get } from "../../../utils/api/api";
import { TeacherOverviewDto } from "../../../types/responses";
import MobileTeacherShell from "./MobileTeacherShell";
import "../mobile.css";

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

  return <MobileTeacherShell title="Teacher home">
    <section className="mobile-teacher-content" aria-busy={loading}>
      <p className="mobile-eyebrow">Welcome back</p>
      <h2 className="mobile-greeting">Hi, {teacherName}</h2>
      <p className="mobile-intro">Recognize a student in under a minute.</p>
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
        <section className="mobile-section" aria-labelledby="today-title"><h3 id="today-title">Designed for the moment</h3><p className="mobile-supporting-copy">The mobile teacher experience stays focused on quick recognition. Class management and the full dashboard remain on desktop while their mobile flows are built.</p></section>
      </>}
    </section>
  </MobileTeacherShell>;
};

export default MobileTeacherHome;
