import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import CreatePunishmentPanel from "src/components/globalComponents/referrals/createPunishmentPanel.js";
import TeacherStudentPanel from "src/roles/teacher/teacherStudentPanel.js";
import TeacherFTCPanel from "src/roles/teacher/FTCpanel.js";
import GlobalPunishmentPanel from "src/components/globalComponents/referrals/globalPunishmentPanel.js";
import TeacherOverviewPanel from "src/roles/teacher/teacherOverview.js";
import DetentionWidget from "src/components/globalComponents/detentionWidget.js";
import ISSWidget from "src/components/globalComponents/issWidget.js";
import LevelThreePanel from "src/components/globalComponents/referrals/levelThreePanel.js";
import { ContactUsModal } from "../../../security/contactUsModal.js";
import { get } from "../../../utils/api/api.js";
import LoadingWheelPanel from "src/roles/student/blankPanelForTest.js";
import "../../../roles/teacher/teacher.css";
import { NavigationLoggedIn } from "src/components/landing/navigation-loggedIn.jsx";
import { handleLogout } from "src/utils/helperFunctions.js";
import SpendPage from "src/components/globalComponents/spend-page/spend-page.js";

const TeacherDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [data, setData] = useState([]);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [panelName, setPanelName] = useState("overview");
  const [modalType, setModalType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState("");

  const [punishmentFilter, setPunishmentFilter] = useState("OPEN");

  useEffect(() => {
    if (sessionStorage.getItem("Authorization") === null) {
      window.location.href = "/login";
    } else {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchPunishmentData = async () => {
      try {
        const response = await get(`DTO/v1/TeacherOverviewData`);
        setData(response);
      } catch (err) {
        console.error(err);
      }
    };
    if (panelName === "overview") {
      fetchPunishmentData();
    }
  }, [panelName]);

  const toggleNotificationDrawer = (open) => {
    setOpenNotificationDrawer(open);
  };

  return (
    loggedIn && (
      <div>
        <div>
          {modalType === "contact" && (
            <ContactUsModal setContactUsDisplayModal={setModalType} />
          )}

          <NavigationLoggedIn
            toggleNotificationDrawer={toggleNotificationDrawer}
            setModalType={setModalType}
            setPanelName={setPanelName}
            setDropdown={setIsDropdownOpen}
            isDropdownOpen={isDropdownOpen}
            setLogin={handleLogout}
          />
        </div>

        <div className="header">
          {data.length === 0 ? (
            <LoadingWheelPanel />
          ) : (
            <div className="teacher-overview">
              <div
                style={{ width: false ? "70%" : "100%" }}
                className="left-main"
              >
                <div className="teacher-panel">
                  {panelName === "overview" && (
                    <TeacherOverviewPanel
                      setPanelName={setPanelName}
                      data={data}
                    />
                  )}
                  {panelName === "student" && (
                    <TeacherStudentPanel listOfStudents={data} />
                  )}
                  {panelName === "punishment" && (
                    <GlobalPunishmentPanel
                      filter={punishmentFilter}
                      roleType={"teacher"}
                    />
                  )}
                  {panelName === "createPunishment" && (
                    <CreatePunishmentPanel
                      setPanelName={setPanelName}
                      data={data}
                    />
                  )}
                  {panelName === "ftc" && <TeacherFTCPanel />}
                  {panelName === "levelThree" && <LevelThreePanel />}
                  {panelName === "spendPoints" && <SpendPage data={data} />}
                </div>
              </div>
            </div>
          )}
        </div>

        <Drawer
          anchor="right"
          open={openNotificationDrawer}
          onClose={() => toggleNotificationDrawer(false)}
        >
          <DetentionWidget />

          <ISSWidget />
        </Drawer>
      </div>
    )
  );
};

export default TeacherDashboard;
