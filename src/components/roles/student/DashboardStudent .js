import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import NotificationBar from "src/components/notification-bar/NotificationBar";
import StudentClosedPunishmentPanel from "src/components/roles/student/studentClosePunishmentPanel";
import StudentOpenPunishmentPanel from "src/components/roles/student/studentOpenPunishmentPanel";
import ShoutOutWidget from "src/components/globalComponents/shoutOutWidget";
import TotalPositivePoints from "src/components/globalComponents/users/positivePointsComponents";
import Card from "@mui/material/Card";
// import BlankPanelForTest from './blankPanelForTest';
import ViolationPage from "src/forms/ViolationPage";
import { get } from "../../../utils/api/api";
import LoadingWheelPanel from "src/components/roles/student/blankPanelForTest";
import { ContactUsModal } from "src/security/contactUsModal";
import { NavigationStudent } from "src/components/landing/navigation-student";
import { handleLogout } from "src/utils/helperFunctions";
import StudentReferralsByWeek from "./referralsByWeek";

const StudentDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [punishments, setPunishments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [modalType, setModalType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState("");
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [panelName, setPanelName] = useState("openAssignments");
  const [selectAssignmentToStart, setSelectAssignmentToStart] = useState();
  const [studentDetails, setStudentDetails] = useState();
  const [school, setSchool] = useState();

  useEffect(() => {
    if (sessionStorage.getItem("Authorization") === null) {
      window.location.href = "/login";
    } else {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(`DTO/v1/StudentOverviewData`);
        setPunishments(response.punishments);
        setStudentDetails(response.student);
        setSchool(response.school);
        setReferrals(response.officeReferrals);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [panelName]);

  const toggleNotificationDrawer = (open) => {
    setOpenNotificationDrawer(open);
  };

  const handleStartAssignment = (data) => {
    setSelectAssignmentToStart(data);
    setPanelName("startAssignment");
  };

  return (
    loggedIn && (
      <>
        <div>
          {modalType === "contact" && (
            <ContactUsModal setContactUsDisplayModal={setModalType} />
          )}

          <NavigationStudent
            toggleNotificationDrawer={toggleNotificationDrawer}
            setModalType={setModalType}
            setPanelName={setPanelName}
            setDropdown={setIsDropdownOpen}
            isDropdownOpen={isDropdownOpen}
            setLogin={handleLogout}
          />
        </div>
        <div className="header">
          <div className="student-main-content">
            <div style={{ width: "100%" }} className="dashboard-title">
              <div>Student Dashboard</div>
            </div>

            {punishments.length === 0 ? (
              <div
                style={{
                  backgroundColor: "white",
                  height: "80vh",
                  marginTop: "10px",
                }}
                className="student-panel"
              >
                <LoadingWheelPanel />
              </div>
            ) : (
              <>
                <div
                  className="student-overview"
                  style={{
                    display: panelName === "startAssignment" ? "none" : "",
                  }}
                >
                  <div className="student-overview-first">
                    <Card variant="outlined">
                      <ShoutOutWidget listOfPunishments={punishments} />
                    </Card>
                  </div>
                  <div className="student-overview-second">
                    <Card style={{ height: "200px" }} variant="outlined">
                      <TotalPositivePoints
                        data={studentDetails}
                        school={school}
                      />
                    </Card>
                  </div>
                </div>
                <div className="student-overview-first">
                  <Card style={{ height: "800px" }} variant="outlined">
                    <StudentReferralsByWeek />
                  </Card>
                </div>

                <div style={{ height: "80vh" }} className="student-panel">
                  {panelName === "closedAssignments" && (
                    <StudentClosedPunishmentPanel
                      listOfPunishments={punishments}
                    />
                  )}
                  {panelName === "openAssignments" && (
                    <StudentOpenPunishmentPanel
                      listOfReferrals={referrals}
                      listOfPunishments={punishments}
                      handleStartAssignment={handleStartAssignment}
                    />
                  )}
                  {panelName === "startAssignment" && (
                    <ViolationPage data={selectAssignmentToStart} />
                  )}
                </div>
              </>
            )}

            <Drawer
              anchor="right"
              open={openNotificationDrawer}
              onClose={() => toggleNotificationDrawer(false)}
            >
              <NotificationBar />
            </Drawer>
          </div>
        </div>
      </>
    )
  );
};

export default StudentDashboard;
