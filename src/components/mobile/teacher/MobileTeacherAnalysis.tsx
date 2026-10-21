import { useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { get } from "../../../utils/api/api";
import { TeacherOverviewDto } from "../../../types/responses";
import MobileTeacherShell from "./MobileTeacherShell";
import "../mobile.css";

type ChartKey = "TREND" | "BEHAVIOR" | "LEVEL";
type Incident = { date: Date; behavior: string; level: string };

const formatWeek = (date: Date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
const weekStart = (date: Date) => { const result = new Date(date); const day = result.getDay(); result.setDate(result.getDate() - (day === 0 ? 6 : day - 1)); result.setHours(0, 0, 0, 0); return result; };

const MobileTeacherAnalysis = () => {
  const [overview, setOverview] = useState<TeacherOverviewDto>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chart, setChart] = useState<ChartKey>("TREND");
  const touchStart = useRef<number | null>(null);

  useEffect(() => { get("DTO/v1/TeacherOverviewData").then((data: TeacherOverviewDto) => setOverview(data)).catch(() => setError("We could not load your analysis." )).finally(() => setLoading(false)); }, []);

  const incidents = useMemo<Incident[]>(() => [
    ...(overview.punishmentResponse ?? []).map((item) => ({ date: new Date(item.timeCreated), behavior: item.infractionName || "Other", level: item.infractionLevel || "Unknown" })),
    ...(overview.officeReferrals ?? []).map((item) => ({ date: new Date(item.timeCreated), behavior: item.referralCode?.codeName || "Office referral", level: "Office" })),
  ].filter((item) => !Number.isNaN(item.date.getTime())), [overview.punishmentResponse, overview.officeReferrals]);

  const weekly = useMemo(() => { const current = weekStart(new Date()); const starts = Array.from({ length: 6 }, (_, index) => { const date = new Date(current); date.setDate(current.getDate() - (5 - index) * 7); return date; }); const values = starts.map((start) => { const end = new Date(start); end.setDate(start.getDate() + 7); return incidents.filter((item) => item.date >= start && item.date < end).length; }); return { labels: starts.map(formatWeek), values }; }, [incidents]);
  const behaviorData = useMemo(() => { const counts = new Map<string, number>(); incidents.forEach((item) => counts.set(item.behavior, (counts.get(item.behavior) ?? 0) + 1)); return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6); }, [incidents]);
  const levelData = useMemo(() => { const counts = new Map<string, number>(); (overview.writeUpResponse ?? []).forEach((item) => { const level = item.infractionLevel ? `Level ${item.infractionLevel}` : "Unassigned"; counts.set(level, (counts.get(level) ?? 0) + 1); }); return ["Level 1", "Level 2", "Level 3", "Level 4"].map((level) => [level, counts.get(level) ?? 0] as [string, number]); }, [overview.writeUpResponse]);
  const chartIndex = ["TREND", "BEHAVIOR", "LEVEL"].indexOf(chart);
  const chartTitles: Record<ChartKey, { title: string; subtitle: string }> = { TREND: { title: "Referrals by week", subtitle: "Your activity over the last six weeks" }, BEHAVIOR: { title: "Referrals by behavior", subtitle: "Most common behavior categories" }, LEVEL: { title: "Referrals by level", subtitle: "Severity distribution for teacher-managed referrals" } };
  const moveChart = (direction: number) => { const keys: ChartKey[] = ["TREND", "BEHAVIOR", "LEVEL"]; setChart(keys[(chartIndex + direction + keys.length) % keys.length]); };
  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => { touchStart.current = event.changedTouches[0]?.clientX ?? null; };
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => { if (touchStart.current === null) return; const distance = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current; if (Math.abs(distance) > 45) moveChart(distance < 0 ? 1 : -1); touchStart.current = null; };

  return <MobileTeacherShell title="Analysis" showBack><section className="mobile-teacher-content"><p className="mobile-eyebrow">Classroom insights</p><h2 className="mobile-greeting">Analysis</h2><p className="mobile-intro">Swipe between clean, focused views of your classroom data.</p>{loading ? <div className="mobile-loading"><CircularProgress size={28} /> Loading analysis</div> : error ? <p className="mobile-error" role="alert">{error}</p> : <><div className="mobile-analysis-tabs" role="tablist" aria-label="Analysis charts"><button type="button" role="tab" aria-selected={chart === "TREND"} className={chart === "TREND" ? "selected" : ""} onClick={() => setChart("TREND")}>Trend</button><button type="button" role="tab" aria-selected={chart === "BEHAVIOR"} className={chart === "BEHAVIOR" ? "selected" : ""} onClick={() => setChart("BEHAVIOR")}>Behavior</button><button type="button" role="tab" aria-selected={chart === "LEVEL"} className={chart === "LEVEL" ? "selected" : ""} onClick={() => setChart("LEVEL")}>Levels</button></div><div className="mobile-analysis-card" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}><div className="mobile-analysis-card-heading"><div><span>Chart {chartIndex + 1} of 3</span><h3>{chartTitles[chart].title}</h3><p>{chartTitles[chart].subtitle}</p></div><TrendingUpRoundedIcon /></div><div className="mobile-analysis-chart">{chart === "TREND" && <LineChart height={235} margin={{ left: 34, right: 10, top: 12, bottom: 30 }} xAxis={[{ scaleType: "point", data: weekly.labels }]} yAxis={[{ min: 0 }]} series={[{ data: weekly.values, color: "#e08a4b", curve: "catmullRom", area: true, showMark: true }]} />}{chart === "BEHAVIOR" && <BarChart height={235} margin={{ left: 110, right: 12, top: 12, bottom: 30 }} layout="horizontal" yAxis={[{ scaleType: "band", data: behaviorData.map(([label]) => label) }]} xAxis={[{ min: 0 }]} series={[{ data: behaviorData.map(([, value]) => value), color: "#25444c" }]} />}{chart === "LEVEL" && <BarChart height={235} margin={{ left: 34, right: 12, top: 12, bottom: 30 }} xAxis={[{ scaleType: "band", data: levelData.map(([label]) => label.replace("Level ", "L")) }]} yAxis={[{ min: 0 }]} series={[{ data: levelData.map(([, value]) => value), color: "#6b8fd6" }]} />}</div><div className="mobile-analysis-nav"><button type="button" onClick={() => moveChart(-1)} aria-label="Previous chart"><ChevronLeftRoundedIcon /></button><div className="mobile-analysis-dots">{["TREND", "BEHAVIOR", "LEVEL"].map((key) => <span key={key} className={chart === key ? "active" : ""} />)}</div><button type="button" onClick={() => moveChart(1)} aria-label="Next chart"><ChevronRightRoundedIcon /></button></div></div></>}</section></MobileTeacherShell>;
};

export default MobileTeacherAnalysis;
