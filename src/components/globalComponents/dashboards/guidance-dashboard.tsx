import { useEffect, useState } from "react";
import { NavigationLoggedIn } from "../../landing/navigation-loggedIn";
import "./guidance-dashboard.css";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SendIcon from "@mui/icons-material/Send";
import SchedulerComponent from "../modals/scheduler/scheduler";
import NotesComponent from "../modals/notes/notes";
import SendResourcesComponent from "../modals/resources/resources";
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
import { dateCreateFormat } from "src/components/dashboard/global/helperFunctions";

const GuidanceDashboard = () => {
  const [displayPicker, setDisplayPicker] = useState(false);
  const [displayNotes, setDisplayNotes] = useState(false);
  const [displayResources, setDisplayResources] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");

  const [updatePage, setUpdatePage] = useState(false);

  const [openTask, setOpenTask] = useState<any>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [guidanceFilter, setGuidanceFilter] = useState<boolean>(true);
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

  useEffect(() => {
    const headers = {
      Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
    };

    axios
      .get(`${baseUrl}/punish/v1/guidance/${taskType}/${guidanceFilter}`, {
        headers,
      })
      .then(function (response) {
        if (categoryFilter === "CLERICAL") {
          setOpenTask(
            response.data.filter((item: { infractionName: string }) =>
              CLERICAL.includes(item.infractionName)
            )
          );
        } else if (categoryFilter === "BEHAVIORAL") {
          setOpenTask(
            response.data.filter((item: { infractionName: string }) =>
              BEHAVIORAL.includes(item.infractionName)
            )
          );
        } else {
          setOpenTask(response.data);
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [taskType, updatePage, categoryFilter]);

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
          />
        )}

        {displayResources && (
          <SendResourcesComponent
            setDisplayModal={setDisplayResources}
            activeTask={activeTask}
            setUpdatePage={setUpdatePage}
          />
        )}

        <NavigationLoggedIn
          toggleNotificationDrawer={"toggleNotificationDrawer"}
          setModalType={"setModalType"}
          setPanelName={"setPanelName"}
          setDropdown={"setIsDropdownOpen"}
          isDropdownOpen={"isDropdownOpen"}
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
          <div className="task-panel">
            <div
              style={{ display: "flex", justifyContent: "space-between" }}
              className="toggles"
            >
              <div className="toggle-groups">
                <ToggleButtonGroup
                  color="primary"
                  value={taskType}
                  exclusive
                  onChange={handleTaskTypeChange}
                  aria-label="Task Type"
                  sx={{ "& .MuiToggleButton-root": { height: 30, width: 70 } }} // Custom height
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

              <div>
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
            <h1 className="main-panel-title">Active Referrals</h1>
            {openTask.map((item: any, index: any) => {
              const markStatus =
                item.guidanceStatus === "CLOSED" ? "OPEN" : "CLOSED";
              const notes = item.notesArray;
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
                    <div className="card-body-title">{item.infractionName}</div>
                    <div className="card-body-description">
                      {item.notesArray[0].content}
                    </div>
                    {categoryBadgeGenerator(item.infractionName)}
                  </div>
                  <div className="card-body">
                    <div className="card-body-title">Created By</div>
                    <div className="card-body-description">
                      {item.teacherEmail}
                    </div>
                  </div>
                  <div className="card-actions">
                    <div className="card-action-title">
                      {item.guidanceStatus === "CLOSED"
                        ? "Restore"
                        : "Mark Complete"}
                    </div>
                    <div
                      onClick={() =>
                        handleStatusChange(markStatus, item.punishmentId)
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
                        setActiveTask(item.punishmentId);
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
                        setActiveTask(item.punishmentId);
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
                        setActiveTask(item.punishmentId);
                      }}
                    >
                      <SendIcon sx={{ fontSize: "20px", fontWeight: "bold" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NOTES AND DETAILS SECTION */}
          <div className="secondary-panel">
            <h1 className="main-panel-title">Threads</h1>
            {activeIndex != null && activeIndex >= 0 && (
              <div className="details-container">
                <p>{openTask[activeIndex]?.guidanceTitle}</p>
                <p>{dateCreateFormat(openTask[activeIndex]?.createdDate)}</p>
                <p>{openTask[activeIndex]?.studentId}</p>
                <p>{openTask[activeIndex]?.studentEmail}</p>
                <p>{openTask[activeIndex]?.teacherEmail}</p>
              </div>
            )}

            <div className="thread-container">
              {activeIndex != null &&
                activeIndex >= 0 &&
                openTask[activeIndex]?.notesArray?.length > 0 &&
                openTask[activeIndex].notesArray.map(
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
