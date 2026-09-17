import { useEffect, useMemo, useState } from "react";
  import AddRoundedIcon from "@mui/icons-material/AddRounded";import { useNavigate } from "react-router-dom";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { get, handleLogout } from "../../../utils/api/api";
import { AdminOverviewDto } from "../../../types/responses";
import "../admin-mobile.css";

const MobileAdminHome = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try { setOverview(await get("DTO/v1/AdminOverviewData")); }
      catch (err) { console.error("Unable to load mobile admin overview", err); setError("We could not load the school overview. Please try again."); }
      finally { setLoading(false); }
    };
    loadOverview();
  }, []);

  const openOfficeReferrals = useMemo(() => overview?.officeReferrals.filter((item) => item.status !== "CLOSED").length ?? 0, [overview]);
  const openTeacherReferrals = useMemo(() => overview?.punishmentResponse.filter((item) => item.status !== "CLOSED").length ?? 0, [overview]);
  const schoolName = overview?.school?.schoolName || sessionStorage.getItem("schoolName") || "Your school";
  const adminName = overview?.teacher?.firstName || sessionStorage.getItem("userName") || "Administrator";

  return <main className="mobile-admin-app">
    <header className="mobile-admin-header">
      <div className="mobile-admin-mark" aria-hidden="true"><AdminPanelSettingsRoundedIcon /></div>
      <div><span>REPS</span><h1>Admin home</h1></div>
 <div className="mobile-admin-header-actions">
    <button
      type="button"
      onClick={() => navigate("/m/admin/admin-create")}
      aria-label="Create a shout-out or referral"
    >
      <AddRoundedIcon />
    </button>

    <button type="button" onClick={handleLogout} aria-label="Sign out">
      <LogoutRoundedIcon />
    </button>
  </div>
    </header>
    <section className="mobile-admin-content" aria-busy={loading}>
      <p className="mobile-admin-eyebrow">{schoolName}</p>
      <h2>Hi, {adminName}</h2>
      <p className="mobile-admin-intro">See what needs attention before you open the full dashboard.</p>
      {loading ? <div className="mobile-admin-loading" aria-live="polite"><CircularProgress size={28} /> Loading school summary</div> : error ? <p className="mobile-admin-error" role="alert">{error}</p> : <>
       <button
    className="mobile-admin-primary-action"
    type="button"
    onClick={() => navigate("/m/admin/write-ups")}
  >
    <WarningAmberRoundedIcon aria-hidden="true" />
    <span>
      <strong>
        {openTeacherReferrals} open teacher{" "}
        {openTeacherReferrals === 1 ? "referral" : "referrals"}
      </strong>
      <small>Review write-ups that need attention</small>
    </span>
    <ArrowForwardRoundedIcon aria-hidden="true" />
  </button>
        <section className="mobile-admin-section" aria-labelledby="school-summary"><h3 id="school-summary">School summary</h3>
          <div className="mobile-admin-summary-grid">
            <div><GroupsRoundedIcon aria-hidden="true" /><strong>{overview?.students?.length ?? 0}</strong><span>students</span></div>
            <div><PersonRoundedIcon aria-hidden="true" /><strong>{overview?.teachers?.length ?? 0}</strong><span>teachers</span></div>
            <div><WarningAmberRoundedIcon aria-hidden="true" /><strong>{openTeacherReferrals}</strong><span>open write-ups</span></div>
          </div>
        </section>
        <section className="mobile-admin-section" aria-labelledby="mobile-scope"><h3 id="mobile-scope">Mobile management</h3><p className="mobile-admin-supporting-copy">Class and student management will be the next mobile admin flow. Reports, charts, and school configuration remain deliberately desktop-first.</p></section>
      </>}
    </section>
  </main>;
};

export default MobileAdminHome;
