import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import IncidentsByStudentTable from "./charts/tables/incidentsByStudentTable.js";
import TotalReferralByWeek from "./charts/lineCharts/referralsByWeek.js";
import TotalStudentReferredByWeek from "./charts/lineCharts/numberOfStudentReferralsByWeek.js";
import Card from "@mui/material/Card";
import ReferralByBehavior from "./charts/lineCharts/referralsByBehavior.js";
import TeacherInfractionOverPeriodBarChart from "./charts/barChart/teacherInfractionPeriodBarChart.js";
import { PieChartParentCommunication } from "./charts/pieCharts/pieChartParentCommunication.js";
import RecentIncidents from "./charts/tables/studentRecentIncidents.js";
import TeacherShoutOutWidget from "./charts/tables/teacherShoutOutWidget.js";
import Button from "@mui/material/Button";

const TeacherOverviewPanel = ({ setPanelName, data = [] }) => {
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
  });

  const dataExcludeNonReferrals = data.punishments.filter((x) => {
    return x.infractionName !== "Positive Behavior Shout Out!";
  });
  const weeklyData = dataExcludeNonReferrals.filter((x) => {
    const currentDate = new Date();
    const itemDate = new Date(x.timeCreated);
    const sevenDaysAgo = new Date(
      currentDate.setDate(currentDate.getDate() - 7)
    );
    return itemDate > sevenDaysAgo;
  });

  console.log("FIND ME 3", dataExcludeNonReferrals);

  const weeklyDataIncSOBxConcern = data.punishments.filter((x) => {
    const currentDate = new Date();
    const itemDate = new Date(x.timeCreated);
    const sevenDaysAgo = new Date(
      currentDate.setDate(currentDate.getDate() - 7)
    );
    return itemDate > sevenDaysAgo;
  });

  useEffect(() => {
    const statusQuo = data.punishments.filter(
      (x) => x.status === "PENDING" && x.infractionLevel === "3"
    );
    if (statusQuo.length > 0) {
      setOpenModal({
        display: true,
        message:
          'Attention! You have level 3 punishments with student answers that must be reviewed before closing.You can go to the page to review these by clicking the "Level Three" Button or you may hit the "Later" button to take care of this at another time. You will receive notifications until the answers are reviewed as they are not Closed until you review. Thank you!',
      });
    }
  }, [data]);

  return (
    <>
      {openModal.display && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                {openModal.message}
              </h3>
            </div>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setOpenModal({ display: false, message: "" });
                }}
                sx={{ height: "100%" }}
              >
                Later
              </button>

              <button
                onClick={() => {
                  setOpenModal({ display: false, message: "" });
                  setPanelName("levelThree");
                }}
                sx={{ height: "100%" }} // Set explicit height
              >
                Level Three
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="teacher-overview-first">
        <Card variant="outlined">
          <TeacherShoutOutWidget data={data.punishments} />
        </Card>
      </div>

      {/* Title Cards */}
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
        <div className="card-overview-half">
          <PieChartParentCommunication data={weeklyDataIncSOBxConcern} />
        </div>

        <div className="card-overview-half">
          <TeacherInfractionOverPeriodBarChart data={weeklyData} />
        </div>
      </div>

      <div className="card-title">
        <Typography
          color="white"
          variant="h6"
          style={{ flexGrow: 1, outline: "1px solid  white", padding: "5px" }}
        >
          Students of Concern
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-half">
          <div className="studentIncidentTable">
            {/* <Card style={{padding:"5px"}}> */}
            <IncidentsByStudentTable writeUps={data.writeUps} />
            {/* </Card> */}
          </div>
        </div>
        <div className="card-overview-half">
          {/* <Card style={{padding:"5px"}}> */}
          <RecentIncidents data={data.punishments} />
          {/* </Card> */}
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
          {/* <Card style={{padding:"5px"}}> */}

          {data ? (
            <TotalReferralByWeek data={data.writeUps} />
          ) : (
            <h1>loading</h1>
          )}

          {/* </Card> */}
        </div>
        <div className="card-overview-third">
          {/* <Card style={{padding:"5px"}}> */}
          <TotalStudentReferredByWeek data={data.writeUps} />
          {/* </Card> */}
        </div>

        <div className="card-overview-third">
          {/* <Card style={{padding:"5px"}}> */}
          <ReferralByBehavior data={data.writeUps} />
          {/* </Card> */}
        </div>
      </div>
    </>
  );
};

export default TeacherOverviewPanel;
