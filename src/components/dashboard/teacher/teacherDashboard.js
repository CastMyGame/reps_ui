import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import CreatePunishmentPanel from "../panel/createPunishmentPanel";
import TeacherStudentPanel from "./teacherPanels/teacherStudentPanel";
import TeacherFTCPanel from "./teacherPanels/FTCpanel";
import GlobalPunishmentPanel from "../global/globalPunishmentPanel.js";
import TeacherOverviewPanel from "./teacherPanels/teacherOverview.js";
import DetentionWidget from "../admin/detentionWidget.js";
import ISSWidget from "../admin/issWidget.js";
import LevelThreePanel from "../global/levelThreePanel.js";
import { ContactUsModal } from "../../../secuirty/contactUsModal";
import { get } from "../../../utils/api/api.js";
import LoadingWheelPanel from "../student/blankPanelForTest.js";
import "../teacher/teacherPanels/teacher.css";
import { NavigationLoggedIn } from "../../landing/navigation-loggedIn.jsx";
import { MessageBox } from "../../../secuirty/messageBox.js";
import axios from "axios";
import { baseUrl } from "../../../utils/jsonData.js";
import { handleLogout } from "../../../utils/helperFunctions.js";

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

  const openDropdown = (field) => {
    setIsDropdownOpen({});
    setIsDropdownOpen((prev) => ({
      ...prev,
      [field]: !isDropdownOpen[field],
    }));
  };

  return (
    loggedIn && (
      <div>
        <div>
          {modalType === "contact" && (
            <ContactUsModal setContactUsDisplayModal={setModalType} />
          )}

{true && <MessageBox/>}

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
                    <CreatePunishmentPanel />
                  )}
                  {panelName === "ftc" && <TeacherFTCPanel />}
                  {panelName === "levelThree" && <LevelThreePanel />}
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
