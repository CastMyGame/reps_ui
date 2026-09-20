import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { get, handleLogout } from "../../../utils/api/api";
import { AdminOverviewDto } from "../../../types/responses";
import "../admin-mobile-v2.css";

const MobileAdminHomeV2 = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { get("DTO/v1/AdminOverviewData").then(setOverview).catch(() => setError("We could not load the school overview. Please try again.")).finally(() => setLoading(false)); }, []);
  const openReferrals = useMemo(() => overview?.punishmentResponse.filter((item) => item.status !== "CLOSED" && item.infractionName !== "Positive Behavior Shout Out!").length ?? 0, [overview]);
  const shoutOuts = overview?.shoutOutsResponse?.length ?? 0;
  const schoolName = overview?.school?.schoolName || sessionStorage.getItem("schoolName") || "Your school";
  const adminName = overview?.teacher?.firstName || sessionStorage.getItem("userName") || "Administrator";
  const desktopOnly = () => navigate("/dashboard/admin");
  return <main className="mobile-admin-v2-app">
    <header className="mobile-admin-v2-header"><div className="mobile-admin-v2-mark"><AdminPanelSettingsRoundedIcon /></div><div><span>REPS</span><h1>Admin home</h1></div><div className="mobile-admin-v2-header-actions"><button type="button" onClick={() => navigate("/m/admin/admin-create-v2")} aria-label="Create a record"><AddRoundedIcon /></button><button type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button></div></header>
    
    <section className="mobile-admin-v2-content" aria-busy={loading}><p className="mobile-admin-v2-eyebrow">{schoolName}</p><h2>Hi, {adminName}</h2><p className="mobile-admin-v2-intro">Your focused school-day tools, designed for a phone.</p>
      {loading ? <div className="mobile-admin-v2-loading"><CircularProgress size={28} /> Loading school summary</div> : error ? <p className="mobile-admin-v2-error">{error}</p> : <>
        <section className="mobile-admin-v2-stats"><div><WarningAmberRoundedIcon /><strong>{openReferrals}</strong><span>open write-ups</span></div><div><CelebrationRoundedIcon /><strong>{shoutOuts}</strong><span>positive shout-outs</span></div><div><GroupsRoundedIcon /><strong>{overview?.students?.length ?? 0}</strong><span>students</span></div></section>
        <section className="mobile-admin-v2-section" aria-labelledby="quick-actions"><h3 id="quick-actions">Quick actions</h3><div className="mobile-admin-v2-action-grid">
          <button type="button" className="positive" onClick={() => navigate("/m/admin/positive-behavior")}><CelebrationRoundedIcon /><strong>Positive behavior</strong><span>Celebrate student shout-outs</span></button>
          <button type="button" className="referrals" onClick={() => navigate("/m/admin/write-ups")}><WarningAmberRoundedIcon /><strong>Open write-ups</strong><span>{openReferrals} need review</span></button>
          <button type="button" onClick={() =>   navigate("/m/admin/create-person")}><PersonAddAltRoundedIcon /><strong>Add student</strong><span>Open student tools</span></button>
          <button type="button" onClick={desktopOnly}><TimerRoundedIcon /><strong>Detention</strong><span>Manage time and status</span></button>
          <button type="button" onClick={desktopOnly}><AssessmentRoundedIcon /><strong>Reports</strong><span>View school insights</span></button>
          <button type="button" onClick={() => navigate("/m/admin/admin-create-v2")}><AddRoundedIcon /><strong>Create record</strong><span>Referral or shout-out</span></button>
        </div></section>

        <p className="mobile-admin-v2-note">Add student, detention, and reports open the full admin dashboard while their mobile flows are built.</p>
      </>}
    </section>
  </main>;
};
export default MobileAdminHomeV2;
