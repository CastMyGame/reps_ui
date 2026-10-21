import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import CircularProgress from "@mui/material/CircularProgress";
import { get } from "../../../utils/api/api";
import { baseUrl } from "../../../utils/jsonData";
import { Student } from "../../../types/school";
import { TeacherOverviewDto } from "../../../types/responses";
import MobileTeacherShell from "./MobileTeacherShell";
import "../mobile.css";

const MobileTeacherClasses = () => {
  const [overview, setOverview] = useState<TeacherOverviewDto>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const teacherOverview: TeacherOverviewDto = await get("DTO/v1/TeacherOverviewData");
        setOverview(teacherOverview);
        const emails = Array.from(new Set(
          teacherOverview.teacher?.classes?.flatMap((item) => item.classRoster ?? []) ?? []
        ));
        if (emails.length > 0) {
          const response = await axios.post(`${baseUrl}/student/v1/getByEmailList`, emails, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("Authorization")}` },
          });
          setStudents(response.data as Student[]);
        }
      } catch (requestError) {
        console.error("Unable to load teacher classes", requestError);
        setError("We could not load your classes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, []);

  const classes = overview.teacher?.classes ?? [];
  const studentByEmail = useMemo(() => new Map(students.map((student) => [student.studentEmail, student])), [students]);

  return <MobileTeacherShell title="My classes" showBack>
    <section className="mobile-teacher-content" aria-busy={loading}>
      <p className="mobile-eyebrow">Classroom roster</p>
      <h2 className="mobile-greeting">My classes</h2>
      <p className="mobile-intro">View the students connected to each of your classes.</p>
      {loading ? <div className="mobile-loading"><CircularProgress size={28} /> Loading your classes</div> : error ? <p className="mobile-error" role="alert">{error}</p> : classes.length === 0 ? <div className="mobile-class-empty"><GroupsRoundedIcon /><strong>No classes yet</strong><span>Your class rosters will appear here when they are assigned.</span></div> : <div className="mobile-class-list">{classes.map((classItem) => <article className="mobile-class-card" key={`${classItem.className}-${classItem.classPeriod}`}><div className="mobile-class-card-heading"><div><strong>{classItem.className}</strong><span>Period {classItem.classPeriod}</span></div><small>{classItem.classRoster?.length ?? 0} students</small></div><div className="mobile-class-roster">{(classItem.classRoster ?? []).map((email) => { const student = studentByEmail.get(email); return <span key={email}>{student ? `${student.firstName} ${student.lastName}` : email}</span>; })}</div></article>)}</div>}
    </section>
  </MobileTeacherShell>;
};

export default MobileTeacherClasses;
