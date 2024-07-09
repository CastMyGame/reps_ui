import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SendIcon from "@mui/icons-material/Send";
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
import { OfficeReferralResponse } from "src/types/responses";
import {
  categoryBadgeGenerator,
  dateCreateFormat,
} from "src/helperFunctions/helperFunctions";
import { baseUrl } from "src/utils/jsonData";
import axios from "axios";

const AdminDashboard = () => {
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [panelName, setPanelName] = useState("overview");
  const [punishmentData, setPunishmentData] = useState([]);
  const [modalType, setModalType] = useState("");
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [updatePage, setUpdatePage] = useState(false);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [displayPicker, setDisplayPicker] = useState(false);
  const [displayNotes, setDisplayNotes] = useState(false);
  const [displayResources, setDisplayResources] = useState(false);
  const [referralList, setReferralList] = useState<any>([]);

  const [isDropdownOpen, setIsDropdownOpen] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("Authorization") === null) {
      window.location.href = "/login";
    }
  }, []);

  const handleUpdatePage = () => {
    setTimeout(() => {
      setUpdatePage((prev: any) => !prev);
    }, 500);
  };

  const handleStatusChange = (status: any, id: string) => {
    const payload = { status: status };
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const url = `${baseUrl}/punish/v1/guidance/status/${id}`;
    axios
      .put(url, payload, { headers })
      .then((response) => {
        console.log(response.data);
        handleUpdatePage();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const toggleNotificationDrawer = (
    open: boolean | ((prevState: boolean) => boolean)
  ) => {
    setOpenNotificationDrawer(open);
  };

  //Fetch Data to Prop Drill to Componetns

  useEffect(() => {
    const fetchPunishmentData = async () => {
      try {
        const result = await get("DTO/v1/AdminOverviewData");
        setPunishmentData(result.punishmentResponse);
        setData(result);
        setReferralList(result.officeReferrals);
      } catch (err) {
        console.error("Error Fetching Data: ", err);
      }
      console.log(referralList + "This is the referral list!!!");
    };

    if (panelName === "overview") {
      fetchPunishmentData();
    }
  }, [panelName]);

  return (
    <div>
      <div>
        {modalType === "contact" && (
          <ContactUsModal
            setContactUsDisplayModal={setModalType}
            contactUsDisplayModal={undefined}
          />
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
        <div className="">
          <div className="left-main">
            <div className="main-content-panel">
              {referralList === null ? (
                <LoadingWheelPanel />
              ) : (
                panelName === "overview" && (
                  <>
                    {referralList.map(
                      (item: OfficeReferralResponse, index: any) => {
                        return (
                          <div
                            className="task-card"
                            onClick={() => setActiveIndex(index)}
                            key={index}
                          >
                            <div className="tag">
                              <div className="color-stripe"></div>
                              <div className="tag-content">
                                <div className="index"> {index + 1}</div>
                                <div className="date">
                                  {" "}
                                  {dateCreateFormat(item?.followUpDate) ||
                                    dateCreateFormat(item?.timeCreated)}
                                </div>
                              </div>
                            </div>

                            <div className="card-body">
                              <div className="card-body-title">
                                {item?.referralDescription[0]}
                              </div>
                              <div className="card-body-description">
                                {/* {item?.notesArray[0]?.content} */}
                              </div>
                              {/* {item.referralDescription &&
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
                              <div
                                onClick={() =>
                                  handleStatusChange(
                                    "CLOSED",
                                    item?.officeReferralId
                                  )
                                }
                                className="check-box"
                              ></div>
                            </div>
                            <div className="card-actions">
                              <div className="card-action-title">Follow Up</div>
                              <div
                                className="clock-icon"
                                onClick={() => {
                                  setDisplayPicker((prevState) => !prevState); // Toggle the state
                                  setActiveTask(item?.officeReferralId);
                                }}
                              >
                                <AccessTimeIcon
                                  sx={{ fontSize: "20px", fontWeight: "bold" }}
                                />
                              </div>
                            </div>
                            <div className="card-actions">
                              <div className="card-action-title">Notes</div>
                              <div
                                className="clock-icon"
                                onClick={() => {
                                  setDisplayNotes((prevState) => !prevState); // Toggle the state
                                  setActiveTask(item?.officeReferralId);
                                }}
                              >
                                <NoteAddIcon
                                  sx={{ fontSize: "20px", fontWeight: "bold" }}
                                />
                              </div>
                            </div>
                            <div className="card-actions">
                              <div className="card-action-title">Resources</div>
                              <div
                                className="clock-icon"
                                onClick={() => {
                                  setDisplayResources(
                                    (prevState) => !prevState
                                  ); // Toggle the state
                                  setActiveTask(item?.officeReferralId);
                                }}
                              >
                                <SendIcon
                                  sx={{ fontSize: "20px", fontWeight: "bold" }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
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
                  data={data}
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
                  filter={undefined}
                  roleType={"admin"}
                />
              )}
              {panelName === "createEditAssignments" && <AssignmentManager />}
              {panelName === "spendPoints" && <SpendPage data={data} />}
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
  );
};

export default AdminDashboard;
