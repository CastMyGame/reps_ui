import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import TotalReferralByWeek from "../teacher/teacherPanels/charts/lineCharts/referralsByWeek";
import TotalStudentReferredByWeek from "../teacher/teacherPanels/charts/lineCharts/numberOfStudentReferralsByWeek";
import ReferralByBehavior from "../teacher/teacherPanels/charts/lineCharts/referralsByBehavior";
import IncidentsByStudentTable from "../teacher/teacherPanels/charts/tables/incidentsByStudentTable";
import TeacherInfractionOverPeriodBarChart from "../teacher/teacherPanels/charts/barChart/teacherInfractionPeriodBarChart";
import { IncidentByTeacherPieChart } from "./widget/incident-by-teacher-pie-chart";
import { Top5TeacherRatioTable } from "./widget/top-5-ratio-table";
import { WorseClassTable } from "./widget/top-class-with-write-up";
import { IncidentByStudentPieChart } from "./widget/incident-by-student-pie-chart";
import "./admin.css";
import AdminShoutOut from "../teacher/teacherPanels/charts/tables/adminShoutOutWidget copy";

const AdminOverviewPanel = ({
  data = [],
  teacherData = [],
  writeUpData = [],
}) => {
  //Fetch Data to Prop Drill to Componetns

  const weeklyDataIncSOBxConcern = data.filter((x) => {
    const currentDate = new Date();
    const itemDate = new Date(x.timeCreated);
    const sevenDaysAgo = new Date(
      currentDate.setDate(currentDate.getDate() - 7)
    );
    return itemDate > sevenDaysAgo;
  });

  let punishmentData = [];

  data.forEach((x) => punishmentData.push(x.punishment));

  return (
    <>
      <div className="teacher-overview-first">
        <Card variant="outlined">
          <AdminShoutOut data={data} />
        </Card>
      </div>

      <div className="card-title">
        <Typography
          color="white"
          variant="h6"
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Week At a Glance
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-third">
          <IncidentByStudentPieChart writeUps={writeUpData} />
        </div>

        <div className="card-overview-third">
          <IncidentsByStudentTable writeUps={writeUpData} />
        </div>

        <div className="card-overview-third">
          <TeacherInfractionOverPeriodBarChart
            data={weeklyDataIncSOBxConcern}
          />
        </div>
      </div>

      <div className="card-title">
        <Typography
          color="white"
          variant="h6"
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Coaching Information
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-third">
          <IncidentByTeacherPieChart
            data={punishmentData}
            teacherData={teacherData}
          />
        </div>

        <div className="card-overview-third">
          {teacherData && (
            <Top5TeacherRatioTable
              data={punishmentData}
              teacherData={teacherData}
            />
          )}
        </div>

        <div className="card-overview-third">
          <WorseClassTable data={punishmentData} teacherData={teacherData} />
        </div>
      </div>

      <div className="card-title">
        <Typography
          color="white"
          variant="h6"
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Longitudinal Reports
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-third">
          <TotalReferralByWeek data={punishmentData} />
        </div>

        <div className="card-overview-third">
          <TotalStudentReferredByWeek data={punishmentData} />
        </div>

        <div className="card-overview-third">
          <ReferralByBehavior data={punishmentData} />
        </div>
      </div>
    </>
  );
};

export default AdminOverviewPanel;
    export default AdminOverviewPanel;

