import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import CreatePunishmentPanel from "src/components/globalComponents/referrals/createPunishmentPanel";
import CreateNewStudentPanel from "src/components/globalComponents/users/createNewStudentPanel";
import ISSWidget from "src/components/globalComponents/issWidget";
import DetentionWidget from "src/components/globalComponents/detentionWidget";
import AdminTeacherPanel from "src/roles/admin/adminTeacherPanel";
import GlobalPunishmentPanel from "src/components/globalComponents/referrals/globalPunishmentPanel";
import GlobalArchivedPunishmentPanel from "src/components/globalComponents/referrals/globalArchivedPunishmentPanel";
import AdminOverviewPanel from "src/roles/admin/adminOverview";
import AssignmentManager from "src/utils/EssayForm";
import TeacherStudentPanel from "src/roles/teacher/teacherStudentPanel";
import AddTeacherForm from "src/components/globalComponents/users/addTeacherForm";
import { get } from "../../../utils/api/api";
import LoadingWheelPanel from "src/roles/student/blankPanelForTest";
import { ContactUsModal } from "src/security/contactUsModal";
import { NavigationAdmin } from "src/components/landing/navigation-admin";
import { handleLogout } from "src/utils/helperFunctions";
import SpendPage from "src/components/globalComponents/spend-page/spend-page";
import CircularProgress from "@mui/material/CircularProgress";
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
  const [activeIndex, setActiveIndex] = useState(null);
  const [updatePage, setUpdatePage] = useState(false);
  const [referralList, setReferralList] = useState([null]);
  const [deletePayload, setDeletePayload] = useState(null);
  const [openModal, setOpenModal] = useState({
    display: false,
    message: "",
    buttonType: "",
    data: null,
  });
  const [textareaValue, setTextareaValue] = useState("");
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

  const handleUpdatePage = () => {
    setTimeout(() => {
      setUpdatePage((prev) => !prev);
    }, 500);
  };

  const handleClosePunishment = (description, id) => {
    const payload = { id: id, comment: description };

    const url = `${baseUrl}/officeReferral/v1/closeId`;
    axios
      .post(url, payload, { headers })
      .then((response) => {
        console.log(response.data);
        handleUpdatePage();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const toggleNotificationDrawer = (open) => {
    setOpenNotificationDrawer(open);
  };

  const handleTextareaChange = (event) => {
    setTextareaValue(event.target.value);
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

  const handleRejectPunishment = (obj) => {
    setLoadingPunishmentId({
      id: obj.officeReferral.officeReferralId,
      buttonType: "close",
    });
    const url = `${baseUrl}/officeReferral/v1/rejected/${obj.officeReferral.officeReferralId}`;
    axios
      .put(url, [textareaValue], { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setToast({
          visible: true,
          message:
            "You have rejected the student's answers and an email has been sent letting them know.",
        });
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        setOpenModal({ display: false, message: "" });
        setTimeout(() => {
          setToast({ visible: false, message: "" });
          setLoadingPunishmentId({ id: null, buttonType: "" });
        }, 1000);
      });
  };

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
          {openModal.display && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{openModal.message}</h3>
                  <div className="answer-container">
                    {openModal.data.officeReferral.infractionDescription.map(
                      (item, index) => {
                        if (index > 1) {
                          const match = item.match(
                            /question=([\s\S]+?),\s*answer=([\s\S]+?)(?=\))/
                          );
                          if (match) {
                            const question = match[1].trim();
                            const answer = match[2].trim();

                            return (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  border: "1px solid black",
                                }}
                              >
                                <div
                                  style={{
                                    backgroundColor: "grey",
                                    minHeight: "15px",
                                    width: "40%",
                                  }}
                                >
                                  <strong>Question:</strong> {question}
                                </div>
                                <div
                                  style={{
                                    color: "black",
                                    backgroundColor: "lightBlue",
                                    minHeight: "50px",
                                    width: "60%",
                                    textAlign: "left",
                                    paddingLeft: "10px",
                                  }}
                                >
                                  <strong>Answer:</strong> {answer}
                                </div>
                              </div>
                            );
                          }
                        }
                      }
                    )}
                  </div>
                </div>
                <div className="modal-body">
                  <textarea
                    value={textareaValue} // Set the value of the textarea to the state variable
                    onChange={handleTextareaChange} // Handle changes to the textarea
                    className="multi-line-input"
                    placeholder="Enter additional comments"
                    rows={4} // This sets the initial height to show 4 rows
                  ></textarea>
                </div>
                <div className="modal-buttons">
                  <button
                    onClick={() => {
                      setOpenModal({ display: false, message: "" });
                      setTextareaValue("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={textareaValue.length === 0}
                    style={{
                      backgroundColor: textareaValue === "" ? "grey" : "red",
                    }}
                    onClick={() => handleRejectPunishment(deletePayload)}
                  >
                    Reject Answers
                  </button>
                  <button
                    disabled={textareaValue.length === 0}
                    style={{
                      backgroundColor: textareaValue === "" ? "grey" : "green",
                    }}
                    onClick={() => {
                      handleClosePunishment(deletePayload);
                      console.log(deletePayload);
                    }}
                  >
                    Accept Answers
                  </button>
                </div>
              </div>
            </div>
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
                    <>
                      {referralList.map((item, index) => {
                        return (
                          <div
                            className="task-card"
                            onClick={() => setActiveIndex(index)}
                            key={index}
                            role="button"
                          >
                            <div className="tag">
                              <div className="color-stripe"></div>
                              <div className="tag-content">
                                <div className="index"> {index + 1}</div>
                                <div className="date">
                                  {" "}
                                  {dateCreateFormat(item?.timeCreated)}
                                </div>
                              </div>
                            </div>

                            <div className="card-body">
                              <div className="card-body-title">
                                {item?.referralCode.codeName}
                              </div>
                              <div className="card-body-description">
                                {item?.referralDescription[0]}
                              </div>
                              {/* USE THIS TO MAKE BADGES FOR OFFICE REFERRALS
                               {item.referralDescription &&
                          item.referralDescription[0] !== undefined &&
                          categoryBadgeGenerator(item.referralDescription[0])} */}
                            </div>
                            <div className="card-body">
                              <div className="card-body-title">Created By</div>
                              <div className="card-body-description">
                                {item?.teacherEmail}
                              </div>
                            </div>
                            <div className="card-actions">
                              <div className="card-action-title">
                                {item?.status === "CLOSED"
                                  ? "Restore"
                                  : "Mark Complete"}
                              </div>
                              <button
                                className="level-three-buttons"
                                onClick={() => {
                                  setOpenModal({
                                    display: true,
                                    message:
                                      "Please Review Student Answers, Accept and Reject buttons are enabled when text is entered in comment section either approving or explaining the rejection",
                                    buttonType: "close",
                                    data: item,
                                  });
                                  setDeletePayload(item.officeReferralId);
                                }}
                              >
                                {loadingPunishmentId.buttonType === "close" ? (
                                  <CircularProgress
                                    style={{ height: "20px", width: "20px" }}
                                    color="secondary"
                                  />
                                ) : (
                                  <div>Review</div>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <AdminOverviewPanel data={adminDto} />
                    </>
                  )
                )}
                {panelName === "viewTeacher" && <AdminTeacherPanel />}
                {panelName === "student" && (
                  <TeacherStudentPanel setPanelName={setPanelName} />
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
                {/* {panelName === "createOfficeRef" && (
                    <CreateOfficeReferral
                      setPanelName={setPanelName}
                      data={data}
                    />
                  )} */}
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
