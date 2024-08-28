import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import IncidentsByStudentTable from "src/components/globalComponents/dataDisplay/incidentsByStudentTable.js";
import TotalReferralByWeek from "src/components/globalComponents/dataDisplay/referralsByWeek.js";
import TotalStudentReferredByWeek from "src/components/globalComponents/dataDisplay/numberOfStudentReferralsByWeek.js";
import Card from "@mui/material/Card";
import ReferralByBehavior from "src/components/globalComponents/dataDisplay/referralsByBehavior.js";
import TeacherInfractionOverPeriodBarChart from "src/components/globalComponents/dataDisplay/teacherInfractionPeriodBarChart.js";
import { PieChartParentCommunication } from "src/components/globalComponents/dataDisplay/pieChartParentCommunication.js";
import RecentIncidents from "src/components/globalComponents/dataDisplay/studentRecentContacts.js";
import ShoutOuts from "src/components/globalComponents/shoutOuts";
import { ManageSpotters } from "src/components/globalComponents/components/generic-components/manageSpotters";

const TeacherOverviewPanel = ({ setPanelName, data = [], students = [] }) => {
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
  });
  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    setStudentList(students);
  }, [students]);

  const dataExcludeNonReferrals = data.punishmentResponse.filter((x) => {
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

  const weeklyDataIncSOBxConcern = data.punishmentResponse.filter((x) => {
    const currentDate = new Date();
    const itemDate = new Date(x.timeCreated);
    const sevenDaysAgo = new Date(
      currentDate.setDate(currentDate.getDate() - 7)
    );
    return itemDate > sevenDaysAgo;
  });

  useEffect(() => {
    const statusQuo = data.punishmentResponse.filter(
      (x) => x.status === "PENDING" && x.level === "3"
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
          <ShoutOuts data={data} />
        </Card>
      </div>

      {/* Title Cards */}
      <div className="card-title">
        <Typography
          color="white"
          variant="h6"
          style={{
            flexGrow: 1,
            outline: "1px solid  white",
            padding: "5px",
            fontSize: 36,
          }}
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
          style={{
            flexGrow: 1,
            outline: "1px solid  white",
            padding: "5px",
            fontSize: 36,
          }}
        >
          Students of Concern
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-half">
          <div className="studentIncidentTable">
            <IncidentsByStudentTable writeUps={data.punishmentResponse} />
          </div>
        </div>
        <div className="card-overview-half">
          <RecentIncidents data={data.punishmentResponse} />
        </div>
      </div>

      <div className="card-title">
        <Typography
          color="white"
          variant="h6"
          style={{
            flexGrow: 1,
            outline: "1px solid  white",
            padding: "5px",
            fontSize: 36,
          }}
        >
          Longitudinal Reports
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-third">
          {/* <Card style={{padding:"5px"}}> */}

          {data ? (
            <TotalReferralByWeek data={data.writeUpResponse} />
          ) : (
            <h1>loading</h1>
          )}

          {/* </Card> */}
        </div>
        <div className="card-overview-third">
          {/* <Card style={{padding:"5px"}}> */}
          <TotalStudentReferredByWeek data={data.writeUpResponse} />
          {/* </Card> */}
        </div>

        <div className="card-overview-third">
          {/* <Card style={{padding:"5px"}}> */}
          <ReferralByBehavior data={data.writeUpResponse} />
          {/* </Card> */}
        </div>
      </div>
    </>
  );
};

export default TeacherOverviewPanel;
