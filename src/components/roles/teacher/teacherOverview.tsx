import React, { useState, useEffect } from "react";
import "../admin/admin.css";
import IncidentsByStudentTable from "src/components/globalComponents/dataDisplay/incidentsByStudentTable";
import { TotalReferralByWeek } from "src/components/globalComponents/dataDisplay/referralsByWeek";
import { ReferralByBehavior } from "src/components/globalComponents/dataDisplay/referralsByBehavior";
import TeacherInfractionOverPeriodBarChart from "src/components/globalComponents/dataDisplay/teacherInfractionPeriodBarChart";
import { PieChartParentCommunication } from "src/components/globalComponents/dataDisplay/pieChartParentCommunication";
import RecentIncidents from "src/components/globalComponents/dataDisplay/studentRecentContacts";
import ShoutOuts from "src/components/globalComponents/shoutOuts";
import TeacherManagedReferralByLevelByWeek from "src/components/globalComponents/dataDisplay/teacherManagedReferralByLevelByWeek";
import { TeacherOverviewDto } from "src/types/responses";
import { Student } from "src/types/school";
import { ZoomableCard } from "src/helperComponents/displayHelpers";

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
          punishment.status === "PENDING" && punishment.infractionLevel === "3",
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
    <div className="dashboard-container">
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
        <div className="custom-card">
          <ShoutOuts data={data} />
        </div>
      </div>

      <div className="section-container">
        <div className="section-header">Week At a Glance</div>

        <div className="section-content">
          <ZoomableCard className="section-half" title="Parent Communication">
            <PieChartParentCommunication
              data={data || {}}
              shoutOutsResponse={data?.shoutOutsResponse || []}
              officeReferrals={data?.officeReferrals || []}
              writeUpResponse={data?.writeUpResponse || []}
            />
          </ZoomableCard>

          <ZoomableCard
            className="section-half"
            title="Infractions Over Time"
            renderZoomContent={() => (
              <TeacherInfractionOverPeriodBarChart
                data={data?.punishmentResponse || []}
              />
            )}
          >
            <TeacherInfractionOverPeriodBarChart
              data={data?.punishmentResponse || []}
            />
          </ZoomableCard>
        </div>
      </div>

      <div className="section-header">Students of Concern</div>

      <div className="section-content">
        <ZoomableCard
          className="section-half scrollable-section"
          title="Incidents by Student"
        >
          <IncidentsByStudentTable
            writeUpResponse={data?.writeUpResponse || []}
            officeReferrals={data?.officeReferrals || []}
            students={students || []}
          />
        </ZoomableCard>
        <ZoomableCard
          className="section-half scrollable-section"
          title="Recent Incidents"
        >
          <RecentIncidents
            punishmentResponse={data?.punishmentResponse || []}
            officeReferrals={data?.officeReferrals || []}
            students={students || []}
          />
        </ZoomableCard>
      </div>

      <div className="section-header">Longitudinal Reports</div>

      <div className="section-content">
        <ZoomableCard className="section-third" title="Total Referrals by Week">
          <TotalReferralByWeek
            punishmentResponse={data?.punishmentResponse || []}
            officeReferrals={data?.officeReferrals || []}
          />
        </ZoomableCard>

        <ZoomableCard
          className="section-third"
          title="Teacher Managed Referrals by Level"
        >
          <TeacherManagedReferralByLevelByWeek
            punishmentResponse={data?.writeUpResponse || []}
          />
        </ZoomableCard>

        <ZoomableCard className="section-third" title="Referrals by Behavior">
          <ReferralByBehavior data={data?.punishmentResponse || []} />
        </ZoomableCard>
      </div>
    </div>
  );
};

export default TeacherOverviewPanel;
