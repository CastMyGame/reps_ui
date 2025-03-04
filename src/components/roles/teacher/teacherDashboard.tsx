import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import CreatePunishmentPanel from "src/components/globalComponents/referrals/createPunishmentPanel.js";
import TeacherStudentPanel from "src/components/roles/teacher/teacherStudentPanel.js";
import TeacherFTCPanel from "src/components/roles/teacher/FTCpanel.js";
import GlobalPunishmentPanel from "src/components/globalComponents/referrals/globalPunishmentPanel.js";
import TeacherOverviewPanel from "src/components/roles/teacher/teacherOverview";
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
import { baseUrl } from "src/utils/jsonData";
import axios from "axios";
import { ClassRoster, Student } from "src/types/school.js";
import { TeacherOverviewDto } from "src/types/responses.js";

const TeacherDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [data, setData] = useState<TeacherOverviewDto>({});
  const [teacher, setTeacher] = useState([]);
  const [emailList, setEmailList] = useState([]);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [panelName, setPanelName] = useState("overview");
  const [modalType, setModalType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [filteredStudentList, setFilteredStudentList] = useState([]); // Filtered list of students

  useEffect(() => {
    if (sessionStorage.getItem("Authorization") === null) {
      window.location.href = "/login";
    } else {
      setLoggedIn(true);
    }
  }, []);

  const url = `${baseUrl}/student/v1/allStudents`;

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    axios
      .get(url, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setStudentList(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [url]);

  useEffect(() => {
    const fetchPunishmentData = async () => {
      try {
        const response = await get(`DTO/v1/TeacherOverviewData`);
        if (
          !response.teacher.classes ||
          response.teacher.classes.length === 0
        ) {
          // No classes, set empty data and emailList
          setData({});
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
        setData({}); // Ensure data is cleared on error
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
      const allEmails = emailList.flatMap((classItem: ClassRoster) =>
        classItem.classRoster.map((student: string) => student)
      );
      const filteredStudents = studentList.filter((student: Student) =>
        allEmails.includes(student.studentEmail)
      );
      setFilteredStudentList(filteredStudents);
    }
  }, [studentList, emailList]);

  const toggleNotificationDrawer = (open: boolean) => {
    setOpenNotificationDrawer(open);
  };

  if (!loggedIn) {
    return <LoadingWheelPanel />;
  }

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

          <NavigationLoggedIn
            toggleNotificationDrawer={toggleNotificationDrawer}
            setModalType={setModalType}
            setPanelName={setPanelName}
            setDropdown={setIsDropdownOpen}
            isDropdownOpen={isDropdownOpen}
            setLogin={handleLogout}
          />
        </div>

        <div className="header">{renderTeacherPanel()}</div>

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

  // Extracted function for readability
  function renderTeacherPanel() {
    if (!data || Object.keys(data).length === 0) {
      return <LoadingWheelPanel />;
    }
  
    return <div className="teacher-panel">{renderPanels()}</div>;
  }

  function renderPanels() {
    return (
      <>
        {panelName === "overview" && (
          <TeacherOverviewPanel
            setPanelName={setPanelName}
            data={data || {}}
            students={filteredStudentList}
          />
        )}
        {panelName === "student" && (
          <TeacherStudentPanel setPanelName={setPanelName} data={data} />
        )}
        {panelName === "punishment" && (
          <GlobalPunishmentPanel roleType={"teacher"} />
        )}
        {panelName === "createPunishment" && (
          <CreatePunishmentPanel setPanelName={setPanelName} data={data} />
        )}
        {panelName === "createOfficeReferral" && (
          <CreateOfficeReferralPanel data={data} />
        )}
        {panelName === "ftc" && <TeacherFTCPanel />}
        {panelName === "levelThree" && <LevelThreePanel roleType={"TEACHER"} />}
        {panelName === "spendPoints" && <SpendPage data={data} />}
        {panelName === "classUpdate" && (
          <ClassUpdate setPanelName={setPanelName} teacher={teacher} />
        )}
      </>
    );
  }
};

export default TeacherDashboard;
