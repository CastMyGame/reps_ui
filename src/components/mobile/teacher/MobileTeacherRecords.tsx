import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { get } from "../../../utils/api/api";
import { baseUrl } from "../../../utils/jsonData";
import { TeacherOverviewDto, TeacherDto } from "../../../types/responses";
import { Student } from "../../../types/school";
import MobileTeacherShell from "./MobileTeacherShell";
import "../mobile.css";

type RecordTab = "OPEN" | "SHOUT_OUTS";

const createdTime = (value: Date | string | null | undefined) => value ? new Date(value).getTime() : 0;

const MobileTeacherRecords = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<TeacherOverviewDto>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [tab, setTab] = useState<RecordTab>("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const data: TeacherOverviewDto = await get("DTO/v1/TeacherOverviewData");
        setOverview(data);
        const emails = Array.from(new Set(data.teacher?.classes?.flatMap((item) => item.classRoster ?? []) ?? []));
        if (emails.length > 0) {
          const response = await axios.post(`${baseUrl}/student/v1/getByEmailList`, emails, { headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` } });
          setStudents(response.data ?? []);
        }
      } catch (requestError) {
        console.error("Unable to load teacher records", requestError);
        setError("We could not load your records. Please try again.");
      } finally { setLoading(false); }
    };
    loadRecords();
  }, []);

  const studentByEmail = useMemo(() => new Map(students.map((student) => [student.studentEmail, student])), [students]);
  const openRecords = useMemo(() => [
    ...(overview.writeUpResponse ?? []).map((item) => ({ kind: "Referral", name: `${item.studentFirstName} ${item.studentLastName}`, email: item.studentEmail, description: Array.isArray(item.infractionDescription) ? item.infractionDescription.join(" ") : item.infractionDescription, status: item.status, period: item.classPeriod, timeCreated: item.timeCreated })),
    ...(overview.officeReferrals ?? []).map((item) => { const student = studentByEmail.get(item.studentEmail); return { kind: "Office referral", name: student ? `${student.firstName} ${student.lastName}` : item.studentEmail, email: item.studentEmail, description: item.referralDescription, status: item.status, period: item.classPeriod, timeCreated: item.timeCreated }; }),
  ].sort((a, b) => createdTime(b.timeCreated) - createdTime(a.timeCreated)), [overview.writeUpResponse, overview.officeReferrals, studentByEmail]);
  const shoutOuts = useMemo(() => [...(overview.shoutOutsResponse ?? [])].sort((a, b) => createdTime(b.timeCreated) - createdTime(a.timeCreated)), [overview.shoutOutsResponse]);
  const records = tab === "OPEN" ? openRecords : shoutOuts;

  return <MobileTeacherShell title="Shout-outs & referrals" showBack><section className="mobile-teacher-content" aria-busy={loading}><p className="mobile-eyebrow">Student records</p><h2 className="mobile-greeting">Shout-outs & referrals</h2><p className="mobile-intro">Review open items and recent recognition from your classes.</p><button type="button" onClick={() => navigate("/dashboard/teacher")}>Review assignment work in full dashboard</button><div className="mobile-record-tabs" role="tablist" aria-label="Student records"><button type="button" role="tab" aria-selected={tab === "OPEN"} className={tab === "OPEN" ? "selected" : ""} onClick={() => setTab("OPEN")}><FolderOpenRoundedIcon />Needs attention<span>{openRecords.length}</span></button><button type="button" role="tab" aria-selected={tab === "SHOUT_OUTS"} className={tab === "SHOUT_OUTS" ? "selected" : ""} onClick={() => setTab("SHOUT_OUTS")}><CampaignRoundedIcon />Shout-outs<span>{shoutOuts.length}</span></button></div>{loading ? <div className="mobile-loading"><CircularProgress size={28} /> Loading records</div> : error ? <p className="mobile-error" role="alert">{error}</p> : records.length === 0 ? <div className="mobile-record-empty">{tab === "OPEN" ? <FolderOpenRoundedIcon /> : <CampaignRoundedIcon />}<strong>{tab === "OPEN" ? "No open referrals" : "No shout-outs yet"}</strong><span>{tab === "OPEN" ? "You are all caught up." : "Recognitions you create will appear here."}</span></div> : <div className="mobile-record-list">{records.map((item: TeacherDto | typeof openRecords[number], index) => { const isShoutOut = tab === "SHOUT_OUTS"; const name = isShoutOut ? `${(item as TeacherDto).studentFirstName} ${(item as TeacherDto).studentLastName}` : (item as typeof openRecords[number]).name; const email = isShoutOut ? (item as TeacherDto).studentEmail : (item as typeof openRecords[number]).email; const description = isShoutOut ? ((item as TeacherDto).infractionDescription ?? []).join(" ") : (item as typeof openRecords[number]).description; const status = isShoutOut ? (item as TeacherDto).status : (item as typeof openRecords[number]).status; const period = isShoutOut ? (item as TeacherDto).classPeriod : (item as typeof openRecords[number]).period; return <article className={`mobile-record-card ${isShoutOut ? "shout-out" : ""}`} key={`${email}-${createdTime(isShoutOut ? (item as TeacherDto).timeCreated : (item as typeof openRecords[number]).timeCreated)}-${index}`}><div className="mobile-record-icon">{isShoutOut ? <CampaignRoundedIcon /> : <FolderOpenRoundedIcon />}</div><div className="mobile-record-details"><strong>{name}</strong><small>{email}</small>{description && <p>{description}</p>}<span>{period ? `Period ${period} · ` : ""}{status || "Recorded"}</span></div></article>; })}</div>}</section></MobileTeacherShell>;
};

export default MobileTeacherRecords;
