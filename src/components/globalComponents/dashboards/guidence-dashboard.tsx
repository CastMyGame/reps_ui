import {useState} from "react"
import { NavigationLoggedIn } from "../../landing/navigation-loggedIn";
import { ContactUsModal } from "../../../secuirty/contactUsModal";
import "./guidence-dashboard.css"
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const GuidenceDashboard = () =>{
    const [modalType, setModalType] = useState<string>("");
    const[activeIndex,setActiveIndex] = useState<number|null>(null);


    const items = [
        {
            studentId: "S12345",
            studentName: "John Doe",
            createdBy: "exampleTeacher@fakeemail.com",
            createdDate: "05/26/2024",
            title: "Excessive Tardy",
            description: "Student always shows up late to first class, and is unkept and unprepared. Home life check is warranted",
            completeStatus: false,
            rescheduledDate: "05/30/2024",
            notes: [
                {date: "05/26/2024", event: "Notes", content: "Called Parents - No Answer"},
                {date: "05/26/2024", event: "Notes", content: "Called Parents - Mom Explained Car Troubles"},
                {date: "05/26/2024", event: "Rescheduled", content: "Rescheduled to 5/30/2024"},
                {date: "05/26/2024", event: "Resources", content: "Sent School Bus Schedule to Parents"}
            ]
        },
        {
            studentId: "S67890",
            studentName: "Jane Smith",
            createdBy: "exampleTeacher@fakeemail.com",
            createdDate: "05/25/2024",
            title: "Incomplete Homework",
            description: "Student consistently fails to turn in homework assignments on time.",
            completeStatus: false,
            rescheduledDate: "05/28/2024",
            notes: [
                {date: "05/25/2024", event: "Notes", content: "Sent reminder email to student"},
                {date: "05/25/2024", event: "Notes", content: "Discussed with student after class"},
                {date: "05/26/2024", event: "Rescheduled", content: "Rescheduled meeting to 5/28/2024"},
                {date: "05/26/2024", event: "Resources", content: "Provided additional resources for homework help"}
            ]
        },
        {
            studentId: "S11223",
            studentName: "Alice Johnson",
            createdBy: "exampleTeacher@fakeemail.com",
            createdDate: "05/24/2024",
            title: "Disruptive Behavior",
            description: "Student frequently disrupts class with loud and inappropriate behavior.",
            completeStatus: false,
            rescheduledDate: "05/29/2024",
            notes: [
                {date: "05/24/2024", event: "Notes", content: "Spoke with student about behavior"},
                {date: "05/24/2024", event: "Notes", content: "Sent email to parents"},
                {date: "05/25/2024", event: "Rescheduled", content: "Rescheduled parent-teacher conference to 5/29/2024"},
                {date: "05/25/2024", event: "Resources", content: "Recommended counseling services to parents"}
            ]
        },
        {
            studentId: "S33445",
            studentName: "Bob Brown",
            createdBy: "exampleTeacher@fakeemail.com",
            createdDate: "05/23/2024",
            title: "Missing Assignments",
            description: "Student has several missing assignments and is falling behind in class.",
            completeStatus: false,
            rescheduledDate: "06/01/2024",
            notes: [
                {date: "05/23/2024", event: "Notes", content: "Discussed missing assignments with student"},
                {date: "05/23/2024", event: "Notes", content: "Called parents - left voicemail"},
                {date: "05/24/2024", event: "Rescheduled", content: "Rescheduled meeting to 6/01/2024"},
                {date: "05/24/2024", event: "Resources", content: "Provided list of missing assignments to student"}
            ]
        }
    ];
    


    return(
    <>

    <div>
    {modalType === "contact" && (
      <ContactUsModal setContactUsDisplayModal={true} contactUsDisplayModal={false} />
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

    <div style={{backgroundColor:"red", height:"100vh"}}>
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
                {items.filter((x)=> !x.completeStatus).map((item,index)=>{
                    return(
                        <div className="task-card"
                        onClick={()=>setActiveIndex(index)}
                         key={index}>
                            <div className="tag">
                            <div className="color-stripe" ></div>
                            <div className="tag-content">
                            <div className="index">  {index +1}</div>
                            <div className="date">  {item.rescheduledDate || item.createdDate}</div>
                            </div>
                            </div>

                            <div className="card-body">
                            <div className="card-body-title">
                            {item.title}
                            </div>
                            <div className="card-body-description">
                          {item.description}
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
                            Reschedule
                            </div>
                            <div className="clock-icon">
                                <AccessTimeIcon sx={{fontSize:"20px",fontWeight:"bold"}}/>
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
                        <p>{items[activeIndex].title}</p>
                        <p>{items[activeIndex].createdDate}</p>
                        <p>{items[activeIndex].studentId}</p>
                        <p>{items[activeIndex].studentName}</p>
                        <p>{items[activeIndex].createdBy}</p>
                  
    
                    </div>
                    

                }
               

                <div className="thread-container">


                {(activeIndex != null && activeIndex >=0 ) && items.filter((x)=>!x.completeStatus)[activeIndex].notes.map((thread,index)=>{
                    return(
                        <div className="thread-card">
                        <p>Event: {thread.event}</p>
                        <p>Date: {thread.date}</p>
                        <p>Content: {thread.content} </p>
                    </div>
                    )

                })}

{activeIndex == null && <p>Click on Acitve Task to see details</p>}
                  
                    

          


                </div>

            </div>

        </div>
        <div className="footer-panel">
        <h1>Footer</h1>
        </div>

      
    </div>
    </>
)

}

export default GuidenceDashboard;