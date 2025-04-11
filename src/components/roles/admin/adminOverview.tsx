import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import { TotalReferralByWeek } from "src/components/globalComponents/dataDisplay/referralsByWeek";
import { ReferralByBehavior } from "src/components/globalComponents/dataDisplay/referralsByBehavior";
import TeacherInfractionOverPeriodBarChart from "src/components/globalComponents/dataDisplay/teacherInfractionPeriodBarChart";
import { IncidentByTeacherPieChart } from "src/components/globalComponents/dataDisplay/incident-by-teacher-pie-chart";
import { Top5TeacherRatioTable } from "src/components/globalComponents/dataDisplay/top-5-ratio-table";
import { WorseClassTable } from "src/components/globalComponents/dataDisplay/top-class-with-write-up";
import "./admin.css";
import ShoutOuts from "src/components/globalComponents/shoutOuts";
import OfficeReferrals from "src/components/globalComponents/officeReferrals/officeReferrals";
import { AdminSchoolReferralByTypePieChart } from "src/components/globalComponents/dataDisplay/adminSchoolReferralByTypePieChart";
import { AdminTeacherReferralByTypePieChart } from "src/components/globalComponents/dataDisplay/adminTeacherReferralByTypePieChart";
import { Bottom4PositiveTeacherTable } from "src/components/globalComponents/dataDisplay/bottom-5-ratio-table";
import TeacherManagedReferralByLevelByWeek from "src/components/globalComponents/dataDisplay/teacherManagedReferralByLevelByWeek";
import { AdminOverviewDto } from "src/types/responses";

interface AdminOverviewProps {
  adminDto: AdminOverviewDto;
}

const AdminOverviewPanel: React.FC<AdminOverviewProps> = ({ adminDto }) => {
  //Fetch Data to Prop Drill to Components

  const punishments = adminDto.punishmentResponse;

  const weeklyDataIncSOBxConcern = punishments?.filter((x) => {
    const currentDate = new Date();
    const itemDate = new Date(x.timeCreated);
    const sevenDaysAgo = new Date(
      currentDate.setDate(currentDate.getDate() - 7)
    );
    return itemDate > sevenDaysAgo;
  });

  const notClosed = adminDto.officeReferrals.filter(
    (x) => x.status !== "CLOSED"
  );

  return (
    <>
      <div className="teacher-overview-first">
        <Card variant="outlined">
          <ShoutOuts data={adminDto} />
        </Card>
      </div>
      {notClosed.length > 0 && (
        <div className="teacher-overview-first">
          <Card variant="outlined">
            <OfficeReferrals data={adminDto.officeReferrals} />
          </Card>
        </div>
      )}

      <div className="card-title">
        <Typography
          color="white"
          variant="h3"
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Week At a Glance
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-third">
          <AdminSchoolReferralByTypePieChart
            writeUpResponse={adminDto.writeUpResponse}
            shoutOutsResponse={adminDto.shoutOutsResponse}
            punishmentResponse={adminDto.punishmentResponse}
            officeReferrals={adminDto.officeReferrals}
          />
        </div>

        <div className="card-overview-third">
          <AdminTeacherReferralByTypePieChart
            writeUpResponse={adminDto.punishmentResponse}
          />
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
          variant="h3"
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Coaching Information
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-third">
          <IncidentByTeacherPieChart
            writeUpResponse={adminDto.writeUpResponse}
            officeReferrals={adminDto.officeReferrals}
            teachers={adminDto.teachers}
            teacher={adminDto.teacher}
          />
        </div>

        <div className="card-overview-third">
          {adminDto.teachers && (
            <>
              <Top5TeacherRatioTable
                punishmentResponse={adminDto.punishmentResponse}
                teachers={adminDto.teachers}
              />
              <br></br>
              <Bottom4PositiveTeacherTable
                punishmentResponse={adminDto.punishmentResponse}
                teachers={adminDto.teachers}
              />
            </>
          )}
        </div>

        <div className="card-overview-third">
          <WorseClassTable
            punishmentResponse={adminDto.punishmentResponse}
            teachers={adminDto.teachers}
          />
        </div>
      </div>

      <div className="card-title">
        <Typography
          color="white"
          variant="h3"
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Longitudinal Reports
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-third">
          <TotalReferralByWeek
            punishmentResponse={adminDto.punishmentResponse}
            officeReferrals={adminDto.officeReferrals}
          />
        </div>

        <div className="card-overview-third">
          <TeacherManagedReferralByLevelByWeek
            punishmentResponse={adminDto.punishmentResponse}
          />
        </div>

        <div className="card-overview-third">
          <ReferralByBehavior data={adminDto.punishmentResponse} />
        </div>
      </div>
    </>
  );
};

export default AdminOverviewPanel;
