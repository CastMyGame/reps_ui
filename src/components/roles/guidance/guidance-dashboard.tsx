import { useCallback, useEffect, useState } from "react";
import "./guidance-dashboard.css";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SendIcon from "@mui/icons-material/Send";
import SchedulerComponent from "../../globalComponents/modals/scheduler/scheduler";
import NotesComponent from "../../globalComponents/modals/notes/notes";
import SendResourcesComponent from "../../globalComponents/modals/resources/resources";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";
import { DateTime } from "luxon";
import {
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { handleLogout } from "src/utils/helperFunctions";
import {
  categoryBadgeGenerator,
  dateCreateFormat,
} from "src/helperFunctions/helperFunctions";
import { get } from "src/utils/api/api";
import { StudentDetailsModal } from "src/components/globalComponents/components/modals/studentDetailsModal";
import NavbarCustom from "src/components/globalComponents/modals/navBar/navBar";
import CreatePunishmentPanel from "src/components/globalComponents/referrals/createPunishmentPanel";
import { TeacherDetailsModal } from "src/components/globalComponents/components/modals/teacherDetailsModal ";
import { guidanceButtonData } from "src/types/navbars";
import { BEHAVIORAL, CLERICAL } from "src/types/constants";
import { GuidanceReferral, TeacherReferral } from "src/types/responses";
import { Student } from "src/types/school";

const GuidanceDashboard = () => {
  const email = sessionStorage.getItem("email");

  const [displayPicker, setDisplayPicker] = useState(false);
  const [displayNotes, setDisplayNotes] = useState(false);
  const [displayResources, setDisplayResources] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const [updatePage, setUpdatePage] = useState(false);
  const [data, setData] = useState<GuidanceReferral[]>([]);
  const [panelName, setPanelName] = useState("overview");

  //Indicators - UI display of processing e.g. loading wheel
  const [closeIndicator, setCloseIndicator] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [guidanceFilter, setGuidanceFilter] = useState(false);
  const [displayStudentModal, setDisplayStudentModal] = useState(false);
  const [displayTeacherModal, setDisplayTeacherModal] = useState(false);
  const [listOfStudents, setListOfStudents] = useState<Student[]>([]);

  //Toggles
  const [taskType, setTaskType] = useState<string>("OPEN");

  const studentUrl = `${baseUrl}/student/v1/allStudents`;

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    axios
      .get(studentUrl, { headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        //Figure out how we are going to return only students associated with teacher.
        // Maybe only pulling up students with active and closed punishments
        setListOfStudents(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [studentUrl]);

  const handleUpdatePage = () => {
    setTimeout(() => {
      setUpdatePage((prev) => !prev);
    }, 500);
  };

  const handleTaskTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTaskType: string | null
  ) => {
    if (newTaskType !== null) {
      setTaskType(newTaskType);
    }
  };

  const handleCategoryChange = (
    event: React.MouseEvent<HTMLElement>,
    category: string | null
  ) => {
    if (category !== null) {
      setCategoryFilter(category);
    }
  };

  const handleStatusChange = (status: string, id: string) => {
    const payload = { status: status };
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const url = `${baseUrl}/guidance/v1/guidance/status/${id}`;
    axios
      .put(url, payload, { headers })
      .then((response) => {
        handleUpdatePage();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleReferralFilterChange = (filterBoolean: boolean) => {
    if (filterBoolean !== null) {
      setGuidanceFilter(filterBoolean);
      setUpdatePage((prev) => !prev);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    handleReferralFilterChange(checked);
  };

  //Status Change Actions for Closing and Scheduling Task

  const handlePunishmentClose = (id: string) => {
    setCloseIndicator(true);

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const url = `${baseUrl}/punish/v1/close/${id}`;
    axios
      .post(url, [], { headers })
      .then((response) => {
        setCloseIndicator(false);
        handleUpdatePage();
        window.alert(`You have Closed Record: ${id} `);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const [punishmentRecord, setPunishmentRecord] =
    useState<TeacherReferral | null>();
  //
  const getPunishmentRecord = useCallback(async () => {
    if (activeIndex !== null) {
      try {
        let result;

        result = await get(`punish/v1/${data[activeIndex].linkToPunishment}`);
        setPunishmentRecord(result);
      } catch (err) {
        setPunishmentRecord(null);

        console.error("Error Fetching Data: ", err);
      }
    } else {
      setPunishmentRecord(null);
    }
  }, [activeIndex, data]);

  const fetchGuidanceReferralData = useCallback(async () => {
    try {
      let result;
      if (taskType === "ALL") {
        result = await get("guidance/v1/referrals/");
      } else {
        result = await get(`guidance/v1/guidanceStatus/${taskType}`);
      }
      setData(
        result.filter((item: GuidanceReferral) => item.guidanceEmail === email)
      );
    } catch (err) {
      console.error("Error Fetching Data: ", err);
    }
  }, [taskType, email]);

  const fetchStudentData = useCallback(async () => {
    try {
      let result = await get("student/v1/allStudents/");
      setData(result);
    } catch (err) {
      console.error("Error Fetching Data: ", err);
    }
  }, []);

  const fetchTeacherData = useCallback(async () => {
    try {
      let result = await get("employees/v1/employees/TEACHER");
      setData(result);
    } catch (err) {
      console.error("Error Fetching Data: ", err);
    }
  }, []);

  const fetchActiveReferrals = useCallback(async () => {
    try {
      const result = await get(
        `punish/v1/guidance/${taskType}/${guidanceFilter}`
      );
      if (Array.isArray(result)) {
        if (categoryFilter === "CLERICAL") {
          setData(
            result.filter((infractionName) => CLERICAL.includes(infractionName))
          );
        } else if (categoryFilter === "BEHAVIORAL") {
          setData(
            result.filter((infractionName) =>
              BEHAVIORAL.includes(infractionName)
            )
          );
        } else {
          setData(result);
        }
      } else {
        console.error("Fetched data is not an array.");
      }
    } catch (error) {
      console.error(error);
    }
  }, [taskType, guidanceFilter, categoryFilter]);

  //Handle Functions
  const deleteRecord = (punishment: GuidanceReferral) => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    const url = `${baseUrl}/guidance/v1/delete`;

    axios
      .delete(url, { data: punishment, headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        setUpdatePage((prev) => !prev);
        window.alert(
          `You have Deleted Record: ${punishment.infractionName} ${punishment.studentEmail}`
        );
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  useEffect(() => {
    if (panelName === "existing-parent-contact") {
      fetchGuidanceReferralData();
    } else if (panelName === "overview") {
      getPunishmentRecord();
      fetchActiveReferrals();
    } else if (panelName === "report-student") {
      fetchStudentData();
    } else if (panelName === "report-teacher") {
      fetchTeacherData();
    }
  }, [
    panelName,
    taskType,
    categoryFilter,
    guidanceFilter,
    updatePage,
    activeIndex,
    fetchGuidanceReferralData,
    fetchActiveReferrals,
    fetchStudentData,
    fetchTeacherData,
    getPunishmentRecord,
  ]);

  useEffect(() => {
    setTaskType("OPEN");
  }, [panelName]);

  //LOG OUT IF AUTHORIZATION IS NULL
  useEffect(() => {
    if (sessionStorage.getItem("Authorization") === null) {
      window.location.href = "/login";
    }
  }, []);

  //Badge Generatores

  const statusBadgeGenerator = (status: string) => {
    if (status === "OPEN") {
      return (
        <div style={{ backgroundColor: "green" }} className="cat-badge">
          OPEN
        </div>
      );
    }

    if (status === "CLOSED") {
      return (
        <div style={{ backgroundColor: "red" }} className="cat-badge">
          CLOSED
        </div>
      );
    }

    if (status === "CFR") {
      return (
        <div style={{ backgroundColor: "orange" }} className="cat-badge">
          CFR
        </div>
      );
    }

    if (status === "BC") {
      return (
        <div style={{ backgroundColor: "purple" }} className="cat-badge">
          Behavioral
        </div>
      );
    }

    if (status === "SO") {
      return (
        <div style={{ backgroundColor: "blue" }} className="cat-badge">
          Shout Out
        </div>
      );
    }
  };

  return (
    <>
      {/* MODALS */}

      <div>
        {displayPicker && (
          <SchedulerComponent
            setDisplayModal={setDisplayPicker}
            activeTask={activeTask}
            setUpdatePage={setUpdatePage}
          />
        )}

        {displayNotes && (
          <NotesComponent
            setDisplayModal={setDisplayNotes}
            activeTask={activeTask}
            setUpdatePage={setUpdatePage}
            panelName={panelName}
          />
        )}

        {displayStudentModal && activeTask && (
          <StudentDetailsModal
            studentEmail={activeTask}
            setDisplayModal={setDisplayStudentModal}
          />
        )}

        {displayTeacherModal && activeTask && (
          <TeacherDetailsModal
            teacherEmail={activeTask}
            setDisplayModal={setDisplayTeacherModal}
          />
        )}

        {displayResources && (
          <SendResourcesComponent
            setDisplayModal={setDisplayResources}
            activeTask={activeTask}
            setUpdatePage={setUpdatePage}
          />
        )}

        <NavbarCustom
          setPanelName={setPanelName}
          buttonData={guidanceButtonData}
          setLogin={handleLogout}
        />
      </div>

      <div style={{ height: "100vh" }}>
        <div
          style={{
            padding: "10px 10px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
          className="panel-container"
        >
          <div className={`task-panel ${panelName !== "overview" && "full"}`}>
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
              className="toggles"
            >
              {panelName === "overview" && (
                <div className="toggle-groups">
                  <ToggleButtonGroup
                    color="primary"
                    value={taskType}
                    exclusive
                    onChange={handleTaskTypeChange}
                    aria-label="Task Type"
                    sx={{
                      "& .MuiToggleButton-root": { height: 30, width: 70 },
                    }} // Custom height
                  >
                    <ToggleButton value="OPEN">Open</ToggleButton>
                    <ToggleButton value="CLOSED">Closed</ToggleButton>
                    <ToggleButton value="DORMANT">Dormant</ToggleButton>
                  </ToggleButtonGroup>

                  <ToggleButtonGroup
                    color="primary"
                    value={categoryFilter}
                    exclusive
                    onChange={handleCategoryChange}
                    aria-label="Category"
                    sx={{
                      "& .MuiToggleButton-root": {
                        height: 30,
                        width: 70,
                        marginTop: 2,
                      },
                    }} // Custom height
                  >
                    <ToggleButton value="CLERICAL">Clerical</ToggleButton>
                    <ToggleButton value="BEHAVIORAL">Behavioral</ToggleButton>
                    <ToggleButton value="">All</ToggleButton>
                  </ToggleButtonGroup>
                </div>
              )}

              {panelName === "existing-parent-contact" && (
                <div className="toggle-groups">
                  <ToggleButtonGroup
                    color="primary"
                    value={taskType}
                    exclusive
                    onChange={handleTaskTypeChange}
                    aria-label="Task Type"
                    sx={{
                      "& .MuiToggleButton-root": { height: 30, width: 70 },
                    }} // Custom height
                  >
                    <ToggleButton value="OPEN">Open</ToggleButton>
                    <ToggleButton value="CLOSED">Closed</ToggleButton>
                    <ToggleButton value="CFR">CFR</ToggleButton>
                    <ToggleButton value="ALL">All</ToggleButton>
                  </ToggleButtonGroup>
                </div>
              )}

              <div className={`${panelName === "overview" ? "" : "none"}`}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={guidanceFilter}
                      onChange={handleChange}
                      aria-label="Referral Filter"
                    />
                  }
                  label={guidanceFilter ? "My Referrals" : "All Referrals"}
                />
              </div>
            </div>
            {panelName === "existing-parent-contact" && (
              <div className="parent-contact-panel">
                <div>
                  {" "}
                  <h1 className="main-panel-title">Parent Contacts</h1>
                </div>
                {data.map((item, index) => {
                  return (
                    <div
                      className="task-card"
                      onClick={() => setActiveIndex(index)}
                      key={index.valueOf()}
                      tabIndex={0}
                      role="button"
                      aria-label="Select Task"
                      aria-pressed="false"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setActiveIndex(index); // Trigger the click action on Enter or Space key press
                        }
                      }}
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
                          {item.infractionName}
                        </div>
                        <div className="card-body-description">
                          {item.referralDescription}
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="card-body-title">Created By</div>
                        <div className="card-body-description">
                          {item.teacherEmail}
                        </div>
                        <div>{statusBadgeGenerator(item.status)}</div>
                      </div>
                      <div className="action-container">
                        <div className="card-actions">
                          <div className="card-action-title">
                            {item.status === "CLOSED" ? "Restore" : " Complete"}
                          </div>
                          <div
                            onClick={() =>
                              handlePunishmentClose(item.guidanceId)
                            }
                            className={
                              closeIndicator && activeIndex === index
                                ? "check-box checked-fill "
                                : `check-box`
                            }
                          ></div>
                        </div>
                        <div className="card-actions">
                          <div className="card-action-title">Notes</div>
                          <div
                            className="clock-icon"
                            onClick={() => {
                              setDisplayNotes((prevState) => !prevState); // Toggle the state
                              setActiveTask(item.guidanceId);
                            }}
                          >
                            <NoteAddIcon
                              sx={{ fontSize: "20px", fontWeight: "bold" }}
                            />
                          </div>
                        </div>
                        <div className="card-actions">
                          <div className="card-action-title">Delete</div>
                          <div
                            className="clock-icon"
                            onClick={() => {
                              // setDisplayNotes((prevState) => !prevState); // Toggle the state
                              deleteRecord(item);
                            }}
                          >
                            <DeleteForeverIcon
                              sx={{ fontSize: "20px", fontWeight: "bold" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* TEACHER PANEL */}
            {panelName === "report-teacher" && (
              <div className="guidance-panel">
                <div>
                  {" "}
                  <h1 className="main-panel-title">Teacher Records</h1>
                </div>
                {data?.map((item, index) => {
                  // Find the student in the listOfStudents based on studentEmail
                  const student = listOfStudents.find(
                    (s) => s.studentEmail === item.studentEmail
                  );
                  return (
                    <div
                      className="task-card"
                      onClick={() => {
                        setActiveTask(item.guidanceEmail);
                        setDisplayTeacherModal((prevState) => !prevState);
                        setActiveIndex(index);
                      }}
                      key={index.valueOf()}
                    >
                      <div className="tag">
                        <div className="color-stripe"></div>
                        <div className="tag-content">
                          <div className="index"> {index}</div>
                          <div className="grade"> </div>
                        </div>
                      </div>

                      <div style={{ display: "flex" }} className="card-body">
                        <div className="card-body-name">
                          {student?.firstName} {student?.lastName}
                        </div>
                        <div className="card-body-email">
                          {/* {student?.roles && student?.roles.length > 0
                            ? item.roles[0].role
                            : "Role Not Assigned"} */}
                        </div>
                        <div className="card-body-email">
                          {student?.studentEmail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* {panelName === "new-referral-contact" && <CreatePunishmentPanel setPanelName={setPanelName}
                    data={data} />} */}
            {panelName === "create-assignment" && <h1>CREATE ASSIGNMENT</h1>}
            {panelName === "create-user" && <h1>CREATE USER</h1>}
            {panelName === "archvied-records" && <h1>ARCHIVED RECORD</h1>}
            {panelName === "contact-us" && <h1>CONTACT US</h1>}
            {panelName === "detention" && <h1>DETENTION LIST</h1>}
            {panelName === "redeem" && <h1>REDEEM</h1>}

            {panelName === "overview" && (
              <div className="guidance-panel">
                <div>
                  {" "}
                  <h1 className="main-panel-title">Active Referrals</h1>
                </div>
                {data.map((item, index) => {
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
                          {item.referralDescription !== undefined &&
                            item.referralDescription[0]}
                        </div>
                        <div className="card-body-description">
                          {/* {item?.notesArray[0]?.content} */}
                        </div>
                        {item.referralDescription &&
                          item.referralDescription[0] !== undefined &&
                          categoryBadgeGenerator(item.referralDescription[0])}
                      </div>
                      <div className="card-body">
                        <div className="card-body-title">Created By</div>
                        <div className="card-body-description">
                          {item.teacherEmail}
                        </div>
                      </div>
                      <div className="card-actions">
                        <div className="card-action-title">
                          {item.status === "CLOSED"
                            ? "Restore"
                            : "Mark Complete"}
                        </div>
                        <div
                          onClick={() =>
                            handleStatusChange("CLOSED", item.guidanceId)
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
                            setActiveTask(item.guidanceId);
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
                            setActiveTask(item.guidanceId);
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
                            setDisplayResources((prevState) => !prevState); // Toggle the state
                            setActiveTask(item.guidanceId);
                          }}
                        >
                          <SendIcon
                            sx={{ fontSize: "20px", fontWeight: "bold" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* STUDENT PANEL */}
            {panelName === "report-student" && (
              <div className="guidance-panel">
                <div>
                  {" "}
                  <h1 className="main-panel-title">Student Records</h1>
                </div>
                {data?.map((item, index) => {
                  // Find the student in the listOfStudents based on studentEmail
                  const student = listOfStudents.find(
                    (s) => s.studentEmail === item.studentEmail
                  );
                  return (
                    <div
                      className="task-card"
                      onClick={() => {
                        setActiveTask(item.studentEmail);
                        setDisplayStudentModal((prevState) => !prevState);
                        setActiveIndex(index);
                      }}
                      key={index}
                    >
                      <div className="tag">
                        <div className="color-stripe"></div>
                        <div className="tag-content">
                          <div className="index"> Grade {student?.grade}</div>
                          <div className="grade"> </div>
                        </div>
                      </div>

                      <div className="card-body">
                        <div className="card-body-name">
                          {student?.firstName} {student?.lastName}
                        </div>
                        <div className="card-body-email">
                          {student?.studentEmail}
                        </div>
                      </div>

                      <div className="card-actions">
                        <div className="card-action-title">Notes</div>
                        <div
                          className="clock-icon"
                          onClick={() => {
                            setDisplayNotes((prevState) => !prevState); // Toggle the state
                            setActiveTask(item.guidanceId);
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
                          //  onClick={() => {
                          //    setDisplayResources((prevState) => !prevState); // Toggle the state
                          //    setActiveTask(item.studentIdNumber);
                          //  }}
                        >
                          <SendIcon
                            sx={{ fontSize: "20px", fontWeight: "bold" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* NOTES AND DETAILS SECTION */}
          <div
            className={`secondary-panel ${panelName !== "overview" && "hide"}`}
          >
            <h1 className="main-panel-title">Threads</h1>
            {activeIndex != null && activeIndex >= 0 && (
              <div className="details-container">
                <p>{data[activeIndex]?.infractionName}</p>
                {punishmentRecord && (
                  <div className="referal-summary">
                    <p>ID:{data[activeIndex].linkToPunishment}</p>
                    <p>Infraction Name:{punishmentRecord?.infractionName}</p>
                    <p>
                      Description: {punishmentRecord?.infractionDescription[0]}{" "}
                    </p>
                    <p>Created By: {punishmentRecord?.teacherEmail} </p>
                    <p>
                      Created On:{" "}
                      {dateCreateFormat(punishmentRecord?.timeCreated)}{" "}
                    </p>
                  </div>
                )}

                <p>{data[activeIndex]?.guidanceId}</p>
                <p>{data[activeIndex]?.studentEmail}</p>
                <p>{data[activeIndex]?.teacherEmail}</p>
              </div>
            )}
            <div className="thread-container">
              {activeIndex != null &&
                activeIndex >= 0 &&
                data[activeIndex]?.notesArray?.length > 0 &&
                data[activeIndex].notesArray.map((thread, index) => {
                  return (
                    <div className="thread-card" key={index}>
                      <p>Event: {thread.event}</p>
                      <p>Date: {dateCreateFormat(thread.date)}</p>
                      <p>Content: {thread.content}</p>
                    </div>
                  );
                })}

              {activeIndex == null && (
                <p>Click on Acitve Task to see details</p>
              )}
            </div>
          </div>
        </div>
        <div className="analytics-panel">
          <h1 className="main-panel-title">Analytics</h1>
        </div>
      </div>
    </>
  );
};

export default GuidanceDashboard;
