import React, { useState, useEffect } from "react";
import "../admin/admin.css";
import Typography from "@mui/material/Typography";
import IncidentsByStudentTable from "src/components/globalComponents/dataDisplay/incidentsByStudentTable";
import { TotalReferralByWeek } from "src/components/globalComponents/dataDisplay/referralsByWeek";
import Card from "@mui/material/Card";
import { ReferralByBehavior } from "src/components/globalComponents/dataDisplay/referralsByBehavior";
import TeacherInfractionOverPeriodBarChart from "src/components/globalComponents/dataDisplay/teacherInfractionPeriodBarChart";
import { PieChartParentCommunication } from "src/components/globalComponents/dataDisplay/pieChartParentCommunication";
import RecentIncidents from "src/components/globalComponents/dataDisplay/studentRecentContacts";
import ShoutOuts from "src/components/globalComponents/shoutOuts";
import TeacherManagedReferralByLevelByWeek from "src/components/globalComponents/dataDisplay/teacherManagedReferralByLevelByWeek";
import { TeacherOverviewDto } from "src/types/responses";
import { Student } from "src/types/school";

interface TeacherOverviewProps {
  setPanelName: (panel: string) => void;
  data: TeacherOverviewDto;
  students?: Student[];
}

const TeacherOverviewPanel: React.FC<TeacherOverviewProps> = ({
  setPanelName,
  data,
  students,
}) => {
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
  });

  useEffect(() => {
    if (
      data?.punishmentResponse?.some(
        (punishment) =>
          punishment.status === "PENDING" && punishment.infractionLevel === "3"
      )
    ) {
      setOpenModal({
        display: true,
        message:
          "Attention! You have level 3 punishments with student answers that must be reviewed before closing.",
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
            data={data || {}}
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
            writeUpResponse={data?.writeUpResponse || []}
            officeReferrals={data?.officeReferrals || []}
            students={students || []}
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
          <TotalReferralByWeek
            punishmentResponse={data?.punishmentResponse || []}
            officeReferrals={data?.officeReferrals || []}
          />
        </div>
        <div className="card-overview-third">
          <TeacherManagedReferralByLevelByWeek
            punishmentResponse={data?.writeUpResponse || []}
          />
        </div>
        <div className="card-overview-third">
          <ReferralByBehavior data={data?.punishmentResponse || []} />
        </div>
      </div>
    </>
  );
};

export default TeacherOverviewPanel;
