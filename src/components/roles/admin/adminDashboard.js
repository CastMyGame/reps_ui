import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import CreatePunishmentPanel from "src/components/globalComponents/referrals/createPunishmentPanel";
import CreateNewStudentPanel from "src/components/globalComponents/users/createNewStudentPanel";
import ISSWidget from "src/components/globalComponents/issWidget";
import DetentionWidget from "src/components/globalComponents/detentionWidget";
import AdminTeacherPanel from "src/components/roles/admin/adminTeacherPanel";
import GlobalPunishmentPanel from "src/components/globalComponents/referrals/globalPunishmentPanel";
import GlobalArchivedPunishmentPanel from "src/components/globalComponents/referrals/globalArchivedPunishmentPanel";
import AdminOverviewPanel from "src/components/roles/admin/adminOverview";
import AssignmentManager from "src/utils/EssayForm";
import TeacherStudentPanel from "src/components/roles/teacher/teacherStudentPanel";
import AddTeacherForm from "src/components/globalComponents/users/addTeacherForm";
import { get } from "../../../utils/api/api";
import LoadingWheelPanel from "src/components/roles/student/blankPanelForTest";
import { ContactUsModal } from "src/security/contactUsModal";
import { NavigationAdmin } from "src/components/landing/navigation-admin";
import { handleLogout } from "src/utils/helperFunctions";
import SpendPage from "src/components/globalComponents/spend-page/spend-page";
import CreateOfficeReferralPanel from "src/components/globalComponents/referrals/createOfficeReferral";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {
  categoryBadgeGenerator,
  dateCreateFormat,
} from "src/helperFunctions/helperFunctions";
import { baseUrl } from "src/utils/jsonData";
import axios from "axios";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AdminDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [panelName, setPanelName] = useState("overview");
  const [punishmentData, setPunishmentData] = useState([]);
  const [modalType, setModalType] = useState("");
  const [adminDto, setAdminDto] = useState([]);
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
    buttonType: "",
    data: null,
  });
  const [textareaValue, setTextareaValue] = useState("");
  const [referralList, setReferralList] = useState([null]);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [loadingPunishmentId, setLoadingPunishmentId] = useState({
    id: null,
    buttonType: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState("");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setToast({ visible: false, message: "" });
  };

  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };

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
        setAdminDto(result);
        setReferralList(result.officeReferrals);
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
            <ContactUsModal
              setContactUsDisplayModal={setModalType}
              contactUsDisplayModal={undefined}
            />
          )}

          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={toast.visible}
            autoHideDuration={6000}
            onClose={handleClose}
          >
            <Alert
              Close={handleClose}
              severity="success"
              sx={{ width: "100%" }}
            >
              {toast.message}
            </Alert>
          </Snackbar>

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
          <div className="">
            <div className="left-main">
              <div className="main-content-panel">
                {adminDto.length === 0 ? (
                  <LoadingWheelPanel />
                ) : (
                  panelName === "overview" && (
                    <AdminOverviewPanel data={adminDto} />
                  )
                )}
                {panelName === "viewTeacher" && (
                  <AdminTeacherPanel
                    writeUpResponse={adminDto.writeUpResponse}
                    officeReferrals={adminDto.officeReferrals}
                    teachers={adminDto.teachers}
                  />
                )}
                {panelName === "student" && (
                  <TeacherStudentPanel
                    setPanelName={setPanelName}
                    data={adminDto}
                  />
                )}
                {panelName === "punishment" && (
                  <GlobalPunishmentPanel roleType={"admin"} />
                )}
                {panelName === "createPunishment" && (
                  <CreatePunishmentPanel
                    setPanelName={setPanelName}
                    data={adminDto}
                  />
                )}
                {panelName === "createOfficeReferral" && (
                  <CreateOfficeReferralPanel
                    setPanelName={setPanelName}
                    data={adminDto}
                  />
                )}
                {panelName === "createNewStudent" && <CreateNewStudentPanel />}
                {panelName === "userManagement" && <AddTeacherForm />}
                {panelName === "archived" && (
                  <GlobalArchivedPunishmentPanel
                    filter={"PENDING"}
                    roleType={"admin"}
                  />
                )}
                {panelName === "createEditAssignments" && <AssignmentManager />}
                {panelName === "spendPoints" && <SpendPage data={adminDto} />}
              </div>
            </div>
          </div>
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
