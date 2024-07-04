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
import { dateCreateFormat } from "src/helperFunctions/helperFunctions";
import { get } from "src/utils/api/api";
import { StudentDetailsModal } from "src/components/globalComponents/components/modals/studentDetailsModal";
import NavbarCustom from "src/components/globalComponents/modals/navBar/navBar";
import CreatePunishmentPanel from "src/components/globalComponents/modals/functions/createPunishmentPanel.js";

interface GuidanceResponse{
  
    guidanceId: string;
    studentEmail: string;
    schoolName: string;
    timeCreated: null |[];
    teacherEmail: string;
    guidanceEmail: string;
    referralDescription: [string];
    status: string;
    notesArray: null | [];
    linkToPunishment: null | string,
    followUpDate: null | []

}

interface StudentResponse{
  
  studentIdNumber: string;
  address: string;
  schoolName: string;
  adminEmail: string | null;
  firstName: string;
  lastName: string;
  grade: string;
  notesArray: null | [];
  parentPhoneNumber: string;
  studentPhoneNumber: string;
  studentEmail:string;
  points:number;

 

}

interface Dropdown {
  label: string;
  panel: string;
}


interface ButtonData {
  label: string;
  panel: string;
  multi: boolean;
  dropdowns: Dropdown[];
}



const buttonData: ButtonData[] = [
  { 
    label: "OVERVIEW", 
    panel: "overview", 
    multi: false, 
    dropdowns: []
  },
    { 
      label: "REPORTS", 
      panel: "reports", 
      multi: true, 
      dropdowns: [
        { label: "BY STUDENTS", panel: "report-student" },
        { label: "BY TEACHERS", panel: "report-teacher" }
      ]
    },
    { 
      label: "PARENT CONTACT", 
      panel: "contacts", 
      multi: true, 
      dropdowns: [
        { label: "NEW REFERRAL CONTACT", panel: "new-referral-contact" },
        { label: "EXISTING PARENT CONTACT", panel: "existing-parent-contact" }
      ]
    },
    { 
      label: "TOOLS", 
      panel: "tools", 
      multi: true, 
      dropdowns: [
        { label: "CREATE/ASSIGNMENT", panel: "create-assignment" },
        { label: "CREATE A STUDENT/TEACHER", panel: "create-user" },
        { label: "ARCHIVED", panel: "archvied-records" }

      ]
    },
    // { 
    //   label: "CONTACT US", 
    //   panel: "contact-us", 
    //   multi: false, 
    //   dropdowns: []
    // },
    { 
      label: "DETENTION/LIST", 
      panel: "detention", 
      multi: false, 
      dropdowns: []
    },
    // { 
    //   label: "STORE REDEEM", 
    //   panel: "redeem", 
    //   multi: false, 
    //   dropdowns: []
    // },
    { 
      label: "STUDENTS", 
      panel: "student", 
      multi: false, 
      dropdowns: [
  
      ]
    }
  ];

const GuidanceDashboard = () => {
  const [displayPicker, setDisplayPicker] = useState(false);
  const [displayNotes, setDisplayNotes] = useState(false);
  const [displayResources, setDisplayResources] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");

  const [updatePage, setUpdatePage] = useState(false);
  const [data, setData] = useState<any>([]);
  const [panelName, setPanelName] = useState("overview");

  //Indicators - UI display of processing e.g. loading wheel
  const [closeIndicator, setCloseIndicator] = useState(false);


  const [openTask, setOpenTask] = useState<any>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [guidanceFilter, setGuidanceFilter] = useState<boolean>(false);
  const [displayStudentModal, setDisplayStudentModal] = useState(false)
  //Toggles
  const [taskType, setTaskType] = useState("OPEN");

  const handleUpdatePage = () => {
    setTimeout(() => {
      setUpdatePage((prev: any) => !prev);
    }, 500);
  };

  const handleTaskTypeChange = (event: any, newTaskType: string) => {
    if (newTaskType !== null) {
      setTaskType(newTaskType);
    }
  };

  const handleCategoryChange = (event: any, category: string) => {
    if (category !== null) {
      setCategoryFilter(category);
    }
  };

  const handleReferralFilterChange = (filterBoolean: boolean) => {
    if (filterBoolean !== null) {
      setGuidanceFilter(filterBoolean);
      setUpdatePage((prev) => !prev);
    }
  };

  const handleChange = (event: any) => {
    handleReferralFilterChange(event.target.checked);
  };

  //CONSTANTS
  const CLERICAL = ["Grade Change Request", "Schedule Change Request"];
  const BEHAVIORAL = [
    "Tardy",
    "Unauthorized Device/Cell Phone",
    "Disruptive Behavior",
    "Horseplay",
    "Dress Code",
    "Behavioral Concern",
    "Failure to Complete Work",
    "Guidance Referral",
  ];

  //Status Change Actions for Closing and Scheduling Task
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

  const handlePunishmentClose = (id: string) => {
    setCloseIndicator(true);

    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    const url = `${baseUrl}/punish/v1/close/${id}`;
    axios
      .post(url, [], { headers })
      .then((response) => {
        console.log(response.data);
        setCloseIndicator(false);
        handleUpdatePage();
        window.alert(`You have Closed Record: ${id} `);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  //CALLBACKS
  const fetchPunishmentData = useCallback(async () => {
    try {
      let result;
      if (taskType === "ALL") {
        result = await get("punish/v1/punishments/");
      } else {
        result = await get(`punish/v1/punishStatus/${taskType}`);
      }
      setData(
        result.filter((item: any) => {
          return !item.guidance;
        }
      )
      );
    } catch (err) {
      console.error("Error Fetching Data: ", err);
    }
  }, [taskType, updatePage]);

  const fetchStudentData = useCallback(async () => {
    try {
       let result = await get("student/v1/allStudents/");
      setData(result);
    } catch (err) {
      console.error("Error Fetching Data: ", err);
    }
  }, [taskType, updatePage]);

  const fetchActiveReferrals = useCallback(async () => {
    try {
      const result = await get(
        `punish/v1/guidance/${taskType}/${guidanceFilter}`
      );
      if (Array.isArray(result)) {
        if (categoryFilter === "CLERICAL") {
          setData(
            result.filter((item: { infractionName: string }) =>
              CLERICAL.includes(item.infractionName)
            )
          );
        } else if (categoryFilter === "BEHAVIORAL") {
          setData(
            result.filter((item: { infractionName: string }) =>
              BEHAVIORAL.includes(item.infractionName)
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
  }, [taskType, guidanceFilter, categoryFilter, updatePage]);

  //Handle Functions
  const deleteRecord = (punishment: any) => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };
    const url = `${baseUrl}/punish/v1/delete`;

    axios
      .delete(url, { data: punishment, headers }) // Pass the headers option with the JWT token
      .then(function (response) {
        console.log(response.data);
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
      fetchPunishmentData();
    } else if (panelName === "overview") {
      fetchActiveReferrals();
    } else if( panelName === "student"){
      fetchStudentData();
    }
  }, [
    panelName,
    taskType,
    categoryFilter,
    guidanceFilter,
    updatePage,
    fetchPunishmentData,
    fetchActiveReferrals,
    fetchStudentData
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

  const formatDate = (dateString: any) => {
    if (!dateString) {
      return "";
    }

    try {
      // Parse the ISO 8601 date string and format it to MM-dd-yyyy
      const date = DateTime.fromISO(dateString);
      if (date.isValid) {
        return date.toFormat("MM-dd-yyyy");
      } else {
        return dateString;
      }
    } catch (error) {
      console.error("Error parsing date:", error);
      return dateString;
    }
  };

  //Badge Generatores
  const categoryBadgeGenerator = (infractionName: string) => {
    if (CLERICAL.includes(infractionName)) {
      return (
        <div style={{ backgroundColor: "gold" }} className="cat-badge">
          Clerical
        </div>
      );
    }

    if (BEHAVIORAL.includes(infractionName)) {
      return <div className="cat-badge">Behavioral</div>;
    }
  };

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
        {/* {modalType === "contact" && (
      <ContactUsModal setContactUsDisplayModal={true} contactUsDisplayModal={false} />
    )} */}

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
            panelName = {panelName}
          />
        )}



{  displayStudentModal &&  <StudentDetailsModal studentEmail={activeTask}
setDisplayModal={setDisplayStudentModal}
/>}

        {displayResources && (
          <SendResourcesComponent
            setDisplayModal={setDisplayResources}
            activeTask={activeTask}
            setUpdatePage={setUpdatePage}
          />
        )}

        <NavbarCustom
          setPanelName={setPanelName}
          buttonData={buttonData}
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
                    <ToggleButton value="CFR">CRF</ToggleButton>
                    <ToggleButton value="ALL">All</ToggleButton>
                  </ToggleButtonGroup>
                </div>
              )}

              <div className={`${panelName === "overview"?"":"none"}`}>
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
                {data.map((item: any, index: any) => {
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
                          {item.infractionName}
                        </div>
                        <div className="card-body-description">
                          {item.infractionDescription}
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
                            {item.guidanceStatus === "CLOSED"
                              ? "Restore"
                              : " Complete"}
                          </div>
                          <div
                            onClick={() =>
                              handlePunishmentClose(item.punishmentId)
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
                              setActiveTask(item.punishmentId);
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
            {panelName === "report-student" && <h1>REPORT STUDENT</h1>}
            {panelName === "report-teacher" && <h1>REPORT TEACHERS</h1>}
            {panelName === "new-referral-contact" &&   <CreatePunishmentPanel
                      
                    />}
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
                {data.map((item: GuidanceResponse, index: any) => {
       
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
                          {   item.referralDescription !== undefined  && item.referralDescription[0]}
                        </div>
                        <div className="card-body-description">
                          {/* {item?.notesArray[0]?.content} */}
                        </div>
                        {item.referralDescription && item.referralDescription[0] !== undefined && (
              categoryBadgeGenerator(item.referralDescription[0])
            )}
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
  { panelName === "student" &&  <div className="guidance-panel">
  <div> <h1 className="main-panel-title">Student Records</h1></div>
   {data?.map((item: StudentResponse, index: any) => {
    
  
     return (
       <div
         className="task-card"
         onClick={() =>
         {setActiveTask(item.studentEmail)
           setDisplayStudentModal((prevState) => !prevState)
           setActiveIndex(index)}}
         key={index}
       >
         <div className="tag">
           <div className="color-stripe"></div>
           <div className="tag-content">
             <div className="index"> Grade {item.grade}</div>
             <div className="grade">
               {" "}
       
             </div>
           </div>
         </div>

         <div className="card-body">
           <div className="card-body-name">
            {item.firstName} {item.lastName}
            </div>
           <div className="card-body-email">
             {item.studentEmail}
           </div>
         </div>
      
      
      
         <div className="card-actions">
           <div className="card-action-title">Notes</div>
           <div
             className="clock-icon"
             onClick={() => {
               setDisplayNotes((prevState) => !prevState); // Toggle the state
               setActiveTask(item.studentIdNumber);             }}
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
             <SendIcon sx={{ fontSize: "20px", fontWeight: "bold" }} />
           </div>
         </div>
       </div>
     );
   })}
 </div>}

 </div>



  



          {/* NOTES AND DETAILS SECTION */}
          <div className={`secondary-panel ${panelName !== "overview" && "hide"}`}>
            <h1 className="main-panel-title">Threads</h1>
            {activeIndex != null && activeIndex >= 0 && (
              <div className="details-container">
                <p>{data[activeIndex]?.guidanceTitle}</p>
                <p>{dateCreateFormat(openTask[activeIndex]?.createdDate)}</p>
                <p>{data[activeIndex]?.studentId}</p>
                <p>{data[activeIndex]?.studentEmail}</p>
                <p>{data[activeIndex]?.teacherEmail}</p>
              </div>
            )}
            <div className="thread-container">
              {activeIndex != null &&
                activeIndex >= 0 &&
                data[activeIndex]?.notesArray?.length > 0 &&
                data[activeIndex].notesArray.map(
                  (thread: any, index: number) => {
                    return (
                      <div className="thread-card" key={index}>
                        <p>Event: {thread.event}</p>
                        <p>Date: {dateCreateFormat(thread.date)}</p>
                        <p>Content: {thread.content}</p>
                      </div>
                    );
                  }
                )}

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
