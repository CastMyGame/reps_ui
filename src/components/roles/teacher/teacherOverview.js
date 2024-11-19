import { useState, useEffect } from "react";
import "../admin/admin.css";
import Typography from "@mui/material/Typography";
import IncidentsByStudentTable from "src/components/globalComponents/dataDisplay/incidentsByStudentTable.tsx";
import { TotalReferralByWeek } from "src/components/globalComponents/dataDisplay/referralsByWeek";
import Card from "@mui/material/Card";
import ReferralByBehavior from "src/components/globalComponents/dataDisplay/referralsByBehavior.js";
import TeacherInfractionOverPeriodBarChart from "src/components/globalComponents/dataDisplay/teacherInfractionPeriodBarChart.js";
import { PieChartParentCommunication } from "src/components/globalComponents/dataDisplay/pieChartParentCommunication.js";
import RecentIncidents from "src/components/globalComponents/dataDisplay/studentRecentContacts.tsx";
import ShoutOuts from "src/components/globalComponents/shoutOuts";
import TeacherManagedReferralByLevelByWeek from "src/components/globalComponents/dataDisplay/teacherManagedReferralByLevelByWeek";

const TeacherOverviewPanel = ({ setPanelName, data = [], students = [] }) => {
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
  });
  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    setStudentList(students);
  }, [students]);

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
          <PieChartParentCommunication
            data={data.punishmentResponse}
            shoutOutsResponse={data.shoutOutsResponse}
            officeReferrals={data.officeReferrals}
            writeUpResponse={data.writeUpResponse}
          />
        </div>

        <div className="card-overview-half">
          <TeacherInfractionOverPeriodBarChart data={data.punishmentResponse} />
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
          <IncidentsByStudentTable
            writeUpResponse={data.writeUpResponse}
            officeReferrals={data.officeReferrals}
            students={students}
          />
        </div>
        <div className="card-overview-half">
          <RecentIncidents
            punishmentResponse={data.punishmentResponse}
            officeReferrals={data.officeReferrals}
            students={students}
          />
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
            <TotalReferralByWeek
              punishmentResponse={data.punishmentResponse}
              officeReferrals={data.officeReferrals}
            />
          ) : (
            <h1>loading</h1>
          )}

          {/* </Card> */}
        </div>
        <div className="card-overview-third">
          {/* <Card style={{padding:"5px"}}> */}
          <TeacherManagedReferralByLevelByWeek
            punishmentResponse={data.writeUpResponse}
          />
          {/* </Card> */}
        </div>

        <div className="card-overview-third">
          {/* <Card style={{padding:"5px"}}> */}
          <ReferralByBehavior data={data.punishmentResponse} />
          {/* </Card> */}
        </div>
      </div>
    </>
  );
};

export default TeacherOverviewPanel;
