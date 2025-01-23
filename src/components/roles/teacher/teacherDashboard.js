import React, { useEffect, useMemo, useState } from "react";
import Drawer from "@mui/material/Drawer";
import CreatePunishmentPanel from "src/components/globalComponents/referrals/createPunishmentPanel.js";
import TeacherStudentPanel from "src/components/roles/teacher/teacherStudentPanel.js";
import TeacherFTCPanel from "src/components/roles/teacher/FTCpanel.js";
import GlobalPunishmentPanel from "src/components/globalComponents/referrals/globalPunishmentPanel.js";
import TeacherOverviewPanel from "src/components/roles/teacher/teacherOverview.js";
import DetentionWidget from "src/components/globalComponents/detentionWidget.js";
import ISSWidget from "src/components/globalComponents/issWidget.js";
import LevelThreePanel from "src/components/globalComponents/referrals/levelThreePanel.js";
import ClassAnnouncement from "src/components/globalComponents/components/generic-components/classAnnouncement.js";
import { ContactUsModal } from "../../../security/contactUsModal.js";
import { get } from "../../../utils/api/api.js";
import LoadingWheelPanel from "src/components/roles/student/blankPanelForTest.js";
import "../admin/admin.css";
import { NavigationLoggedIn } from "src/components/landing/navigation-loggedIn.jsx";
import { handleLogout } from "src/utils/helperFunctions.js";
import SpendPage from "src/components/globalComponents/spendPage/spend-page.js";
import CreateOfficeReferralPanel from "src/components/globalComponents/referrals/createOfficeReferral.js";
import { ManageSpottersPopup } from "src/components/globalComponents/components/generic-components/manageSpottersPopup.js";
import ClassUpdate from "src/components/globalComponents/components/generic-components/classUpdate.js";
import { baseUrl } from "src/utils/jsonData.js";
import axios from "axios";

const TeacherDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [data, setData] = useState([]);
  const [teacher, setTeacher] = useState([]);
  const [emailList, setEmailList] = useState([]);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [panelName, setPanelName] = useState("overview");
  const [modalType, setModalType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [punishmentFilter, setPunishmentFilter] = useState("OPEN");
  const [filteredStudentList, setFilteredStudentList] = useState([]); // Filtered list of students

  useEffect(() => {
    if (sessionStorage.getItem("Authorization") === null) {
      window.location.href = "/login";
    } else {
      setLoggedIn(true);
    }
  }, []);

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

  const url = `${baseUrl}/student/v1/allStudents`;

  useEffect(() => {
    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setStudentList(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const fetchPunishmentData = async () => {
      try {
        const response = await get(`DTO/v1/TeacherOverviewData`);
        if (
          !response.teacher.classes ||
          response.teacher.classes.length === 0
        ) {
          // No classes, set empty data and emailList
          setData(null);
          setEmailList([]);
          setTeacher(response.teacher);
        } else {
          // Normal case, set data
          setData(response);
          setEmailList(response.teacher.classes);
          setTeacher(response.teacher);
        }
      } catch (err) {
        console.error("Error happens here: ", err);
        setData(null); // Ensure data is cleared on error
      }
    };
    if (panelName === "overview") {
      fetchPunishmentData();
    }
    // Close modal on panel change
    setModalType("");
  }, [panelName]);

  // Filter the studentList based on the emailList
  useEffect(() => {
    if (studentList.length > 0 && emailList.length > 0) {
      // Flatten the classRoster arrays into a single array of emails
      const allEmails = emailList.flatMap((classItem) =>
        classItem.classRoster.map((student) => student)
      );
      const filteredStudents = studentList.filter((student) =>
        allEmails.includes(student.studentEmail)
      );
      setFilteredStudentList(filteredStudents);
    }
  }, [studentList, emailList]);

  const toggleNotificationDrawer = (open) => {
    setOpenNotificationDrawer(open);
  };

  return (
    loggedIn && (
      <div>
        <div>
          {modalType === "contact" && (
            <ContactUsModal
              setContactUsDisplayModal={setModalType}
              contactUsDisplayModal={modalType}
            />
          )}
          {modalType === "classAnnouncement" && (
            <ClassAnnouncement
              setContactUsDisplayModal={setModalType}
              contactUsDisplayModal={modalType}
              teacher={teacher}
            />
          )}
          {modalType === "spotter" && (
            <ManageSpottersPopup
              setContactUsDisplayModal={setModalType}
              contactUsDisplayModal={modalType}
            />
          )}
          {/* {modalType === "classUpdate" && (
            <ClassUpdate
              setContactUsDisplayModal={setModalType}
              contactUsDisplayModal={modalType}
              teacher={data.teacher}
            />
          )} */}

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
          {data == null ? (
            <div className="teacher-panel">
              {panelName === "overview" && (
                <TeacherOverviewPanel
                  setPanelName={setPanelName}
                  data={null}
                  students={null}
                />
              )}
              {panelName === "student" && (
                <TeacherStudentPanel setPanelName={setPanelName} data={null} />
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
                  data={null}
                />
              )}
              {panelName === "createOfficeReferral" && (
                <CreateOfficeReferralPanel
                  setPanelName={setPanelName}
                  data={null}
                />
              )}
              {panelName === "ftc" && <TeacherFTCPanel />}
              {panelName === "levelThree" && <LevelThreePanel />}
              {panelName === "spendPoints" && <SpendPage data={null} />}
              {panelName === "classUpdate" && (
                <ClassUpdate setPanelName={setPanelName} teacher={null} />
              )}
            </div>
          ) : data.length === 0 ? (
            <LoadingWheelPanel />
          ) : (
            <div className="teacher-panel">
              {panelName === "overview" && (
                <TeacherOverviewPanel
                  setPanelName={setPanelName}
                  data={data}
                  students={filteredStudentList}
                />
              )}
              {panelName === "student" && (
                <TeacherStudentPanel setPanelName={setPanelName} data={data} />
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
              {panelName === "createOfficeReferral" && (
                <CreateOfficeReferralPanel
                  setPanelName={setPanelName}
                  data={data}
                />
              )}
              {panelName === "ftc" && <TeacherFTCPanel />}
              {panelName === "levelThree" && <LevelThreePanel />}
              {panelName === "spendPoints" && <SpendPage data={data} />}
              {panelName === "classUpdate" && (
                <ClassUpdate setPanelName={setPanelName} teacher={teacher} />
              )}
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
