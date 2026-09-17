import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../../utils/jsonData";
import { handleLogout } from "../../../utils/api/api";
import { PunishmentDto } from "../../../types/responses";
import "../admin-write-ups-mobile.css";

const daysOpen = (date: Date) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000));
const detailsText = (description: string[] | string) => Array.isArray(description) ? description.join(" ") : description;

const MobileAdminOpenWriteUps = () => {
  const navigate = useNavigate();
  const [writeUps, setWriteUps] = useState<PunishmentDto[]>([]);
  const [selected, setSelected] = useState<PunishmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWriteUps = async () => {
      try {
        const response = await axios.get(`${baseUrl}/DTO/v1/punishmentsDTO`, { headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` } });
        const openItems = (response.data as PunishmentDto[])
          .filter((item) => item.punishment.status === "OPEN")
          .filter((item) => item.punishment.infractionName !== "Positive Behavior Shout Out!")
          .sort((a, b) => new Date(a.punishment.timeCreated).getTime() - new Date(b.punishment.timeCreated).getTime());
        setWriteUps(openItems);
      } catch (err) { console.error("Unable to load open write-ups", err); setError("We could not load open write-ups. Please try again."); }
      finally { setLoading(false); }
    };
    loadWriteUps();
  }, []);

  const needsAttention = useMemo(() => writeUps.filter((item) => daysOpen(item.punishment.timeCreated) >= 3).length, [writeUps]);

  if (selected) {
    const { punishment } = selected;
    return <main className="mobile-writeups-app">
      <header className="mobile-writeups-header"><button type="button" onClick={() => setSelected(null)} aria-label="Back to open write-ups"><ArrowBackRoundedIcon /></button><div><span>REPS</span><h1>Write-up details</h1></div><button type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button></header>
      <section className="mobile-writeups-content mobile-writeups-detail"><p className="mobile-writeups-eyebrow">{punishment.infractionName}</p><h2>{selected.studentFirstName} {selected.studentLastName}</h2><p className="mobile-writeups-email">{selected.studentEmail}</p><dl><div><dt>Status</dt><dd>{punishment.status}</dd></div><div><dt>Period</dt><dd>{punishment.classPeriod || "Not provided"}</dd></div><div><dt>Created</dt><dd>{new Date(punishment.timeCreated).toLocaleDateString()}</dd></div><div><dt>Created by</dt><dd>{punishment.teacherEmail}</dd></div></dl><section aria-labelledby="writeup-description"><h3 id="writeup-description">Description</h3><p>{detailsText(punishment.infractionDescription) || "No description was provided."}</p></section><p className="mobile-writeups-note">Closure and archive actions remain in the full admin dashboard for this MVP.</p><button className="mobile-writeups-dashboard-button" type="button" onClick={() => navigate("/dashboard/admin")}>Open full dashboard</button></section>
    </main>;
  }

  return <main className="mobile-writeups-app">
    <header className="mobile-writeups-header"><button type="button" onClick={() => navigate("/m/admin")} aria-label="Back to admin home"><ArrowBackRoundedIcon /></button><div><span>REPS</span><h1>Open write-ups</h1></div><button type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button></header>
    <section className="mobile-writeups-content" aria-busy={loading}>
      <p className="mobile-writeups-eyebrow">Review queue</p><h2>What needs attention</h2><p className="mobile-writeups-intro">Oldest open items appear first so follow-up is easy to prioritize.</p>
      {loading ? <div className="mobile-writeups-loading" aria-live="polite"><CircularProgress size={28} /> Loading write-ups</div> : error ? <p className="mobile-writeups-error" role="alert">{error}</p> : <>
        <div className="mobile-writeups-summary"><div><strong>{writeUps.length}</strong><span>open write-ups</span></div><div><strong>{needsAttention}</strong><span>open 3+ days</span></div></div>
        {writeUps.length === 0 ? <div className="mobile-writeups-empty"><DescriptionRoundedIcon aria-hidden="true" /><h3>All caught up</h3><p>There are no open write-ups to review.</p></div> : <div className="mobile-writeups-list" aria-label="Open write-ups">{writeUps.map((item) => { const age = daysOpen(item.punishment.timeCreated); return <button key={item.punishment.punishmentId} type="button" onClick={() => setSelected(item)}><span className={age >= 3 ? "mobile-writeups-age urgent" : "mobile-writeups-age"}>{age === 0 ? "Today" : `${age}d open`}</span><span className="mobile-writeups-card-main"><strong>{item.studentFirstName} {item.studentLastName}</strong><span>{item.punishment.infractionName}</span><small>{item.punishment.classPeriod || "No period"} · {new Date(item.punishment.timeCreated).toLocaleDateString()}</small></span><ChevronRightRoundedIcon aria-hidden="true" /></button>; })}</div>}
      </>}
    </section>
  </main>;
};

export default MobileAdminOpenWriteUps;
