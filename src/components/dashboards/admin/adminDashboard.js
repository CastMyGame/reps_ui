import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import CreatePunishmentPanel from "../../globalComponents/referrals/createPunishmentPanel";
import CreateNewStudentPanel from "../../globalComponents/users/createNewStudentPanel";
import ISSWidget from "../../globalComponents/issWidget";
import DetentionWidget from "../../globalComponents/detentionWidget";
import AdminTeacherPanel from "../../../roles/admin/adminTeacherPanel";
import GlobalPunishmentPanel from "../../globalComponents/referrals/globalPunishmentPanel";
import GlobalArchivedPunishmentPanel from "../../globalComponents/referrals/globalArchivedPunishmentPanel";
import AdminOverviewPanel from "../../../roles/admin/adminOverview";
import AssignmentManager from "../../../utils/EssayForm";
import TeacherStudentPanel from "../../../roles/teacher/teacherStudentPanel";
import AddTeacherForm from "../../../roles/admin/addTeacherForm";
import { get } from "../../../utils/api/api";
import LoadingWheelPanel from "../../components/dashboards/student/blankPanelForTest";
import { ContactUsModal } from "../../../security/contactUsModal";
import { NavigationAdmin } from "../../landing/navigation-admin";
import { handleLogout } from "../../../utils/helperFunctions";
import SpendPage from "../../../roles/teacher/teacherPanels/spend-page/spend-page";

const AdminDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [panelName, setPanelName] = useState("overview");
  const [punishmentData, setPunishmentData] = useState([]);
  const [modalType, setModalType] = useState("");
  const [data, setData] = useState([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("Authorization") === null) {
      window.location.href = "/login";
    } else {
      setLoggedIn(true);
    }
  }, []);

  const toggleNotificationDrawer = (open) => {
    setOpenNotificationDrawer(open);
  };

  //Fetch Data to Prop Drill to Componetns

  useEffect(() => {
    const fetchPunishmentData = async () => {
      try {
        const result = await get("DTO/v1/AdminOverviewData");
        setPunishmentData(result.punishmentResponse);
        setData(result);
      } catch (err) {
        console.error("Error Fetching Data: ", err);
      }
    };

    if (panelName === "overview") {
      fetchPunishmentData();
    }
  }, [panelName]);

  return (
    loggedIn && (
      <div>
        <div>
          {modalType === "contact" && (
            <ContactUsModal setContactUsDisplayModal={setModalType} />
          )}

          <NavigationAdmin
            toggleNotificationDrawer={toggleNotificationDrawer}
            setModalType={setModalType}
            setPanelName={setPanelName}
            setDropdown={setIsDropdownOpen}
            isDropdownOpen={isDropdownOpen}
            setLogin={handleLogout}
          />
        </div>

        <div className="header">
          {punishmentData.length === 0 ? (
            <LoadingWheelPanel />
          ) : (
            <div className="">
              <div
                style={{ width: false ? "70%" : "100%" }}
                className="left-main"
              >
                <div className="main-content-panel">
                  {punishmentData.length === 0 ? (
                    <LoadingWheelPanel />
                  ) : (
                    panelName === "overview" && (
                      <AdminOverviewPanel data={data} />
                    )
                  )}
                  {panelName === "viewTeacher" && <AdminTeacherPanel />}
                  {panelName === "student" && <TeacherStudentPanel />}
                  {panelName === "punishment" && (
                    <GlobalPunishmentPanel roleType={"admin"} />
                  )}
                  {panelName === "createPunishment" && (
                    <CreatePunishmentPanel
                      setPanelName={setPanelName}
                      data={data}
                    />
                  )}
                  {panelName === "createOfficeRef" && (
                    <CreateOfficeReferral
                      setPanelName={setPanelName}
                      data={data}
                    />
                  )}
                  {panelName === "createNewStudent" && (
                    <CreateNewStudentPanel />
                  )}
                  {panelName === "userManagement" && <AddTeacherForm />}
                  {panelName === "archived" && (
                    <GlobalArchivedPunishmentPanel />
                  )}
                  {panelName === "createEditAssignments" && (
                    <AssignmentManager />
                  )}
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
          {/* <NotificationBar notificationData={data}/> */}
          <DetentionWidget />

          <ISSWidget />
        </Drawer>
      </div>
    )
  );
};

export default AdminDashboard;
