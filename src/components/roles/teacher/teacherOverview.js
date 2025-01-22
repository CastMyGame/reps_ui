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

const TeacherOverviewPanel = ({ setPanelName, data = {}, students = [] }) => {
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
  });
  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    setStudentList(students);
  }, [students]);

  useEffect(() => {
    if (data?.punishmentResponse) {
      const statusQuo = data.punishmentResponse.filter(
        (x) => x.status === "PENDING" && x.level === "3"
      );
      if (statusQuo.length > 0) {
        setOpenModal({
          display: true,
          message:
            "Attention! You have level 3 punishments with student answers that must be reviewed before closing.",
        });
      }
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
                onClick={() => setOpenModal({ display: false, message: "" })}
              >
                Later
              </button>
              <button
                onClick={() => {
                  setOpenModal({ display: false, message: "" });
                  setPanelName("levelThree");
                }}
              >
                Level Three
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="teacher-overview-first">
        <Card variant="outlined">
          <ShoutOuts data={data || {}} />
        </Card>
      </div>

      {/* Title Cards */}
      <div className="card-title">
        <Typography color="white" variant="h6" style={titleStyle}>
          Week At a Glance
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-half">
          <PieChartParentCommunication
            data={data?.punishmentResponse || []}
            shoutOutsResponse={data?.shoutOutsResponse || []}
            officeReferrals={data?.officeReferrals || []}
            writeUpResponse={data?.writeUpResponse || []}
          />
        </div>

        <div className="card-overview-half">
            <TeacherInfractionOverPeriodBarChart
              data={data?.punishmentResponse || []}
            />
        </div>
      </div>

      {/* Students of Concern */}
      <div className="card-title">
        <Typography color="white" variant="h6" style={titleStyle}>
          Students of Concern
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-half">
            <IncidentsByStudentTable
              writeUpResponse={data?.writeUpResponse || []}
              officeReferrals={data?.officeReferrals || []}
              students={students}
            />
        </div>
        <div className="card-overview-half">
            <RecentIncidents
              punishmentResponse={data?.punishmentResponse || []}
              officeReferrals={data?.officeReferrals || []}
              students={students}
            />
        </div>
      </div>

      {/* Longitudinal Reports */}
      <div className="card-title">
        <Typography color="white" variant="h6" style={titleStyle}>
          Longitudinal Reports
        </Typography>
      </div>

      <div className="overview-row">
        <div className="card-overview-third">
          {data ? (
            <TotalReferralByWeek
              punishmentResponse={data.punishmentResponse || []}
              officeReferrals={data.officeReferrals || []}
            />
          ) : (
            <PlaceholderChart title="Referrals By Week" />
          )}
        </div>
        <div className="card-overview-third">
          {data ? (
            <TeacherManagedReferralByLevelByWeek
              punishmentResponse={data.writeUpResponse || []}
            />
          ) : (
            <PlaceholderChart title="Referrals By Level" />
          )}
        </div>
        <div className="card-overview-third">
          {data ? (
            <ReferralByBehavior data={data.punishmentResponse || []} />
          ) : (
            <PlaceholderChart title="Referrals By Behavior" />
          )}
        </div>
      </div>
    </>
  );
};

// Placeholder components for missing data
const PlaceholderChart = ({ title }) => (
  <Card variant="outlined" style={placeholderStyle}>
    <Typography color="textSecondary">{title}</Typography>
    <div style={{ height: 200, backgroundColor: "#f0f0f0" }} />
  </Card>
);

const PlaceholderTable = ({ title }) => (
  <Card variant="outlined" style={placeholderStyle}>
    <Typography color="textSecondary">{title}</Typography>
    <Typography variant="body2" style={{ padding: 20 }}>
      No data available.
    </Typography>
  </Card>
);

// Styles
const titleStyle = {
  flexGrow: 1,
  outline: "1px solid white",
  padding: "5px",
  fontSize: 36,
};

const placeholderStyle = {
  padding: "10px",
  textAlign: "center",
};

export default TeacherOverviewPanel;
