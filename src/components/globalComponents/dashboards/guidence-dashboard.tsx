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

const GuidenceDashboard = () =>{
    const [modalType, setModalType] = useState<string>("schedule");
    const [displayPicker,setDisplayPicker] = useState(false)
    const [displayNotes,setDisplayNotes] =useState(false)
    const [displayResources, setDisplayResources] = useState(false)
    

    const [openTask,setOpenTask] = useState<any>([])
    const[activeIndex,setActiveIndex] = useState<number|null>(null);
    const[activeTask,setActiveTask] = useState<any |null>(null);
    

    const headers = {
        Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
      };
      
      
    useEffect(()=>{
        axios.get(`${baseUrl}/punish/v1/guidance/Open`,{headers})
        .then(function(response){
            setOpenTask(response.data)
        }).catch(function (error){
            console.error(error)
        })
    
    },[]);
    
    
    
    useEffect(()=>{
        console.log("active",activeTask)
    },[activeTask])


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
      activeTask={activeTask}  />
    )}

{displayNotes  && (
      <NotesComponent   
      setDisplayModal={setDisplayNotes}
      activeTask={activeTask}  />
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
      setLogin={"handleLogout"}
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
                <h1 className="main-panel-title">Active Referals</h1>
                {openTask.filter((x:any)=> x?.status === "Open").map((item:any,index:any)=>{
                    return(
                        <div className="task-card"
                        onClick={()=>setActiveIndex(index)}
                         key={index}>
                            <div className="tag">
                            <div className="color-stripe" ></div>
                            <div className="tag-content">
                            <div className="index">  {index +1}</div>
                            <div className="date">  {item?.followUpDate || item?.timeCreated}</div>
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
                            <div className="card-action-title">
                            Mark Complete
                            </div>
                            <div className="check-box">
                          
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
                        <p>{openTask[activeIndex]?.createdDate}</p>
                        <p>{openTask[activeIndex]?.studentId}</p>
                        <p>{openTask[activeIndex]?.studentEmail}</p>
                        <p>{openTask[activeIndex]?.teacherEmail}</p>
                  
    
                    </div>
                    

                }
               

                <div className="thread-container">


                {
    (activeIndex != null && activeIndex >= 0 && openTask.filter((x: any) => x.status === "Open")[activeIndex]?.notesArray?.length > 0) &&
    openTask.filter((x: any) => x.status === "Open")[activeIndex].notesArray.map((thread: any, index: number) => {
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