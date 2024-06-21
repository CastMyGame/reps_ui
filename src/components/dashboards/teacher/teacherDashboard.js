import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import CreatePunishmentPanel from "../../globalComponents/referrals/createPunishmentPanel.js/index.js";
import TeacherStudentPanel from "../../../roles/teacher/teacherStudentPanel.js";
import TeacherFTCPanel from "../../../roles/teacher/FTCpanel.js";
import GlobalPunishmentPanel from "../../globalComponents/referrals/globalPunishmentPanel.js";
import TeacherOverviewPanel from "../../../roles/teacher/teacherOverview.js/index.js";
import DetentionWidget from "../../globalComponents/detentionWidget.js";
import ISSWidget from "../../globalComponents/issWidget.js";
import LevelThreePanel from "../../globalComponents/referrals/levelThreePanel.js";
import { ContactUsModal } from "../../../security/contactUsModal.js";
import { get } from "../../../utils/api/api.js";
import LoadingWheelPanel from "../../../roles/student/blankPanelForTest.js";
import "./teacherPanels/teacher.css";
import { NavigationLoggedIn } from "../../landing/navigation-loggedIn.jsx";
import { handleLogout } from "../../../utils/helperFunctions.js";
import SpendPage from "../../../roles/teacher/teacherPanels/spend-page/spend-page.js";

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
