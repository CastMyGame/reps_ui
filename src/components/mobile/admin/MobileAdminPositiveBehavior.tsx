import { useEffect, useState } from "react";
import axios from "axios";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../../utils/jsonData";
import { handleLogout } from "../../../utils/api/api";
import { PunishmentDto } from "../../../types/responses";
import "../admin-mobile-v2.css";

const MobileAdminPositiveBehavior = () => {
  const navigate = useNavigate(); const [items, setItems] = useState<PunishmentDto[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => {
      const loadPositiveBehavior = async () => {
        try {
          const response = await axios.get(
            `${baseUrl}/DTO/v1/punishmentsDTO`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("Authorization")}`,
              },
            }
          );

          const shoutOuts = (response.data as PunishmentDto[])
            .filter(
              (item) =>
                item.punishment.infractionName ===
                "Positive Behavior Shout Out!"
            )
            .sort(
              (a, b) =>
                new Date(b.punishment.timeCreated).getTime() -
                new Date(a.punishment.timeCreated).getTime()
            );

          setItems(shoutOuts);
        } catch {
          setError("We could not load positive behavior records.");
        } finally {
          setLoading(false);
        }
      };

      loadPositiveBehavior();
    }, []);  return <main className="mobile-admin-v2-app"><header className="mobile-admin-v2-header"><button type="button" onClick={() => navigate("/m/admin")} aria-label="Back to admin home"><ArrowBackRoundedIcon /></button><div><span>REPS</span><h1>Positive behavior</h1></div><button type="button" onClick={handleLogout} aria-label="Sign out"><LogoutRoundedIcon /></button></header><section className="mobile-admin-v2-content"><p className="mobile-admin-v2-eyebrow">Recognition board</p><h2>Good things happening</h2><p className="mobile-admin-v2-intro">Recent shout-outs from your school, newest first.</p>{loading ? <div className="mobile-admin-v2-loading"><CircularProgress size={28} /> Loading shout-outs</div> : error ? <p className="mobile-admin-v2-error">{error}</p> : items.length === 0 ? <div className="mobile-positive-empty"><CelebrationRoundedIcon /><h3>No shout-outs yet</h3><p>Recognize a student to start the positive behavior board.</p></div> : <div className="mobile-positive-list">{items.map((item) => <article key={item.punishment.punishmentId}><div className="mobile-positive-icon"><CampaignRoundedIcon /></div><div><strong>{item.studentFirstName} {item.studentLastName}</strong><span>{item.punishment.teacherEmail}</span><p>{Array.isArray(item.punishment.infractionDescription) ? item.punishment.infractionDescription.join(" ") : item.punishment.infractionDescription}</p><small>{new Date(item.punishment.timeCreated).toLocaleDateString()} · {item.punishment.classPeriod || "School day"}</small></div></article>)}</div>}</section></main>;
};
export default MobileAdminPositiveBehavior;
