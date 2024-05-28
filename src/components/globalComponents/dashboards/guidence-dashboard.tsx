import {useEffect, useState} from "react"
import { NavigationLoggedIn } from "../../landing/navigation-loggedIn";
import { ContactUsModal } from "../../../secuirty/contactUsModal";
import "./guidence-dashboard.css"
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SendIcon from '@mui/icons-material/Send';
import SchedulerComponent from "../modals/scheduler/scheduler";
import NotesComponent from "../modals/notes/notes";
import SendResourcesComponent from "../modals/resources/resources";
import axios from "axios";
import { baseUrl } from "src/utils/jsonData";
import { DateTime } from "luxon";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { handleLogout } from "src/utils/helperFunctions";

const GuidenceDashboard = () =>{
    const [modalType, setModalType] = useState<string>("schedule");
    const [displayPicker,setDisplayPicker] = useState(false)
    const [displayNotes,setDisplayNotes] =useState(false)
    const [displayResources, setDisplayResources] = useState(false);

    const [updatePage, setUpdatePage] = useState(false);
    
    
    const [openTask,setOpenTask] = useState<any>([])
    const[activeIndex,setActiveIndex] = useState<number|null>(null);
    const[activeTask,setActiveTask] = useState<any |null>(null);

    //Toggles
    const [taskType,setTaskType] = useState("OPEN")


    const handleUpdatePage =() =>{
        setTimeout(()=>{
            setUpdatePage((prev:any)=>!prev)
        },500)
    }
    

    const handleTaskTypeChange = (event:any, newTaskType:string) => {
        if (newTaskType !== null) {
          setTaskType(newTaskType);
        }
      };


//Status Change Actions for Closing and Scheduling Task
const handleStatusChange = (status:any,id:string) =>{

    const payload = {status:status};

    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };
      
      const url =`${baseUrl}/punish/v1/guidance/status/${id}`
      axios.put(url, payload,{headers})
      .then(response => {
        console.log(response.data);
        handleUpdatePage();
      })
      .catch(error => {
        console.error(error);
      });
    


} 


      
    useEffect(()=>{
        const headers = {
            Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
          };
          
        axios.get(`${baseUrl}/punish/v1/guidance/${taskType}`,{headers})
        .then(function(response){
            setOpenTask(response.data)
        }).catch(function (error){
            console.error(error)
        })
    
    },[taskType, updatePage]);

    const formatDate = (dateString:any) => {
        if (!dateString) {
            return '';
        }
    
        try {
            // Parse the ISO 8601 date string and format it to MM-dd-yyyy
            const date = DateTime.fromISO(dateString);
            if (date.isValid) {
                return date.toFormat('MM-dd-yyyy');
            } else {
                return dateString;
            }
        } catch (error) {
            console.error('Error parsing date:', error);
            return dateString;
        }
    };
    
    
    return(
    <>

    {/* MODALS */}



    <div>
    {/* {modalType === "contact" && (
      <ContactUsModal setContactUsDisplayModal={true} contactUsDisplayModal={false} />
    )} */}

{displayPicker  && (
      <SchedulerComponent   
      setDisplayModal={setDisplayPicker}
      activeTask={activeTask}
      setUpdatePage={setUpdatePage}
        />
    )}

{displayNotes  && (
      <NotesComponent   
      setDisplayModal={setDisplayNotes}
      activeTask={activeTask}
      setUpdatePage={setUpdatePage}  />
    )}


{displayResources  && (
      <SendResourcesComponent   
      setDisplayModal={setDisplayResources}
      activeTask={activeTask}  />
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

    <div style={{ height:"100vh"}}>
        <div style={{
            padding:"10px 10px", 
            display:"flex",
            flexDirection:"row",
            justifyContent:"center"
        }}
        
        className="panel-container">
            <div 
           
            className="task-panel">
                <div className="toggles">
                <ToggleButtonGroup
      color="primary"
      value={taskType}
      exclusive
      onChange={handleTaskTypeChange}
      aria-label="Task Type"
    >
      <ToggleButton value="OPEN">Open</ToggleButton>
      <ToggleButton value="CLOSED">Closed</ToggleButton>
      <ToggleButton value="All">All</ToggleButton>
    </ToggleButtonGroup>
                </div>
                <h1 className="main-panel-title">Active Referals</h1>
                {openTask.map((item:any,index:any)=>{
                    const markStatus = item.status === "CLOSED"? "OPEN":"CLOSED";
                    return(
                        <div className="task-card"
                        onClick={()=>setActiveIndex(index)}
                         key={index}>
                            <div className="tag">
                            <div className="color-stripe" ></div>
                            <div className="tag-content">
                            <div className="index">  {index +1}</div>
                            <div className="date">  {formatDate(item?.followUpDate) ||formatDate(item?.timeCreated)}</div>
                            </div>
                            </div>

                            <div className="card-body">
                            <div className="card-body-title">
                            {item.guidanceTitle}
                            </div>
                            <div className="card-body-description">
                          {item.infractionDescription}
                            </div>
                            </div>
                            <div className="card-actions">
                            <div 
                            className="card-action-title">
                            {item.status === "CLOSED"? "Restore":"Mark Complete"}
                            </div>
                            <div 
                             onClick={()=>handleStatusChange(markStatus,item.punishmentId)}

                            className="check-box">
                          
                            </div>
                            </div>
                            <div className="card-actions">
                            <div className="card-action-title">
                            Follow Up
                            </div>
                            <div className="clock-icon"
                          onClick={() => {
                            setDisplayPicker(prevState => !prevState); // Toggle the state
                            setActiveTask(item.punishmentId);
                        }}
                            >
                                <AccessTimeIcon sx={{fontSize:"20px",fontWeight:"bold"}}/>
                            </div>
                            </div>
                            <div className="card-actions">
                            <div className="card-action-title">
                            Notes
                            </div>
                            <div className="clock-icon"
                            onClick={() => {
                                setDisplayNotes(prevState => !prevState); // Toggle the state
                                setActiveTask(item.punishmentId);
                            }}                            >
                                
                                <NoteAddIcon sx={{fontSize:"20px",fontWeight:"bold"}}/>
                            </div>
                            </div>
                            <div className="card-actions">
                            <div className="card-action-title">
                            Resources
                            </div>
                            <div className="clock-icon"
                                 onClick={() => {
                                    setDisplayResources(prevState => !prevState); // Toggle the state
                                    setActiveTask(item.punishmentId);
                                }}   
                            >
                                <SendIcon sx={{fontSize:"20px",fontWeight:"bold"}}/>
                            </div>
                            </div>

                        
                            </div>
                    )
                })}
        


            </div>

{/* NOTES AND DETAILS SECTION */}
            <div 
            className="secondary-panel">
                <h1 className="main-panel-title">Threads</h1>
                {(activeIndex != null && activeIndex >=0 ) && 
                 
                        <div className="details-container">
                        <p>{openTask[activeIndex]?.guidanceTitle}</p>
                        <p>{formatDate(openTask[activeIndex]?.createdDate)}</p>
                        <p>{openTask[activeIndex]?.studentId}</p>
                        <p>{openTask[activeIndex]?.studentEmail}</p>
                        <p>{openTask[activeIndex]?.teacherEmail}</p>
                  
    
                    </div>
                    

                }
               

                <div className="thread-container">


                {
    (activeIndex != null && activeIndex >= 0 && openTask[activeIndex]?.notesArray?.length > 0) &&
    openTask[activeIndex].notesArray.map((thread: any, index: number) => {
        return (
            <div className="thread-card" key={index}>
                <p>Event: {thread.event}</p>
                <p>Date: {thread.date}</p>
                <p>Content: {thread.content}</p>
            </div>
        );
    })
}


{activeIndex == null && <p>Click on Acitve Task to see details</p>}
                  
                    

          


                </div>

            </div>

        </div>
        <div className="analytics-panel">
        <h1 className="main-panel-title">Analytics</h1>
        </div>

      
    </div>
    </>
)

}

export default GuidenceDashboard;