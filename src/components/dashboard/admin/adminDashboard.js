import React, { useEffect, useState } from 'react';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CreatePunishmentPanel from '../panel/createPunishmentPanel';
import CreateNewStudentPanel from '../panel/createNewStudentPanel';
import ISSWidget from './issWidget';
import DetentionWidget from './detentionWidget';
import AdminTeacherPanel from './adminTeacherPanel';
import GlobalPunishmentPanel from '../global/globalPunishmentPanel';
import GlobalArchivedPunishmentPanel from '../global/globalArchivedPunishmentPanel';
import AdminOverviewPanel from './adminOverview';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentManager from '../../../utils/EssayForm';
import TeacherStudentPanel from '../teacher/teacherPanels/teacherStudentPanel';
import AddTeacherForm from './addTeacherForm';
import { get } from '../../../utils/api/api';



const AdminDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false)
  const [panelName,setPanelName] = useState("overview")
  const [punishmentData,setPunishmentData] = useState([])
  const [teacherData,setTeacherData] = useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    referralDropdown:false,
    teacherDropdown:false,
    studentDropdown:false,
    toolsDropdown:false
  });
const [punishmentFilter, setPunishmentFilter] =useState("OPEN")
  
const handleGeneratePDF = () => {
  window.open('/forms/report', '_blank'); // '_blank' will open the URL in a new tab/window
};

const handleLogout = () => {
  clearSessionStorage();
  window.location.href = '/login';
};

const clearSessionStorage = () => {
  ['Authorization', 'userName', 'schoolName', 'email', 'role'].forEach(key => {
    sessionStorage.removeItem(key);
  });
};

  useEffect(() => {
    if (sessionStorage.getItem('Authorization') === null) {
      window.location.href = '/login';
    } else {
      setLoggedIn(true);
    }
  }, []);



  const toggleNotificationDrawer = (open) => {
    setOpenNotificationDrawer(open);
  };

const openDropdown =(field)=>{
  setIsDropdownOpen({})
  setIsDropdownOpen((prev)=>({
    ...prev, [field]: !isDropdownOpen[field]
  }))
}



//Fetch Data to Prop Drill to Componetns

useEffect(() => {
  const fetchPunishmentData = async ()=>{
    try{
      const result = await get('punish/v1/punishments')
      setPunishmentData(result)
    }catch(err){
      console.error('Error Fetching Data: ',err)
    } 
 
  }
  const fetchTeacherData = async ()=>{
    try{
      const result = await get('employees/v1/employees/TEACHER')
      setTeacherData(result)
    }catch(err){
      console.error('Error Fetching Data: ',err)
    } 
 
  }
  fetchPunishmentData();
  fetchTeacherData();

},[])



  return (
    loggedIn && (
      <>
        <div className ="app-bar">
        <Toolbar style={{background:"darkblue", color: "white"}}>
          <DashboardIcon onClick={()=>setPanelName("overview")} style={{color:"white",backgroundColor:"black", marginRight:"10px"}}/>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Welcome, {sessionStorage.getItem('userName')}
            </Typography>
            <NotificationsIcon style={{marginRight:"15px"}} onClick={()=> toggleNotificationDrawer(true) }/>
    

            <AccountBoxIcon/>           
              <IconButton type="button" color="inherit" onClick={handleLogout}>
              Logout
            </IconButton>

          </Toolbar>
        </div>
       <div className='page'>
         
      <div className='teacher-main-content'> 
      <div className="">
      <div className = "teacher-main-content-menu">

        {/* Overview button */}
    <button 
    className='teacher-dash-dropbtn' 
    onClick={() => {
      setPanelName("overview")
  }}
  >
    Overview
  </button>

  {/* New Shout Reffere **/}
  <button 
    className='teacher-dash-dropbtn' 
    onClick={() => {
      openDropdown("newReferral")
      // setPanelName("createPunishment")
  }}
  >
  Referral/Shout Out
  </button>
  <div style={{marginLeft:"25%"}} className={isDropdownOpen.newReferral ? 'dropdown-content show' : 'dropdown-content'}>
    <div onClick={()=>{
      setPanelName("createPunishment")  
      setIsDropdownOpen(!isDropdownOpen.newReferral)

     }}className='teacher-dropdown-item'>New Referral/Shout Out</div>
       <div onClick={()=>{
      setPanelName("punishment")  
      setIsDropdownOpen(!isDropdownOpen.newReferral)

     }}className='teacher-dropdown-item'>Existing Referrals/Shout Outs</div>

</div>
  
  {/* Punishment Drop Down */}
  {/* Student Drop Down */}
  <button 
    className='teacher-dash-dropbtn' 
    onClick={() => {
      openDropdown("studentDropdown")
      // setPanelName("student")
  }}
    // style={{ flex: 1, outline:"1px solid  white", padding: "5px", textAlign: "center"}}
  >
    Reports
  </button>
      {/* Margin Left is used to move dropdown under the buttons */}
  <div style={{marginLeft:"50%"}} className={isDropdownOpen.studentDropdown ? 'dropdown-content show' : 'dropdown-content'}>
    <div onClick={()=>{
      setPanelName("student") 
      setIsDropdownOpen(!isDropdownOpen.studentDropdown)
 
     }}className='teacher-dropdown-item'>By Student</div>

      <div onClick={()=>{
      setIsDropdownOpen(!isDropdownOpen.studentDropdown)
      // setPunishmentFilter("OPEN")
       setPanelName("viewTeacher")
       }}className='dropdown-item'> By Teacher</div>
  </div>
     
    {/* Teacher Drop Down */}
    {/* <button 
    className='dropbtn' 
    onClick={() => {
      openDropdown("teacherDropDown")
  }}
    style={{ flex: 1, outline:"1px solid  white", padding: "5px", textAlign: "center"}}
  >
    Teachers
  </button>
      {/* Margin Left is used to move dropdown under the buttons */}
 

 

    {/* Tooks Drop Down */}
    <button 
    className='teacher-dash-dropbtn' 
    onClick={() => {
      openDropdown("toolsDropdown")
      // setPanelName("punishment")
  }}
    style={{ flex: 1, outline:"1px solid  white", padding: "5px", textAlign: "center"}}
  >
    Tools
  </button>
      {/* Margin Left is used to move dropdown under the buttons */}
  <div style={{marginLeft:"75%"}} className={isDropdownOpen.toolsDropdown ? 'dropdown-content show' : 'dropdown-content'}>
    <div onClick={()=>{
      setPanelName("createEditAssignments")  
      setIsDropdownOpen(!isDropdownOpen.toolsDropdown)

     }}className='dropdown-item'>Create/Edit Assignments</div>
      <div onClick={()=>{
      setPanelName("userManagement")  
      setIsDropdownOpen(!isDropdownOpen.toolsDropdown)

     }}className='dropdown-item'>Create a Student/Teacher</div>
           <div onClick={()=>{
      setPanelName("archived")  
      setIsDropdownOpen(!isDropdownOpen.toolsDropdown)

     }}className='dropdown-item'>Archived</div>
     
  </div>
        </div>
      </div>
      <div className = "main-content-panel">
{panelName === "overview" &&<AdminOverviewPanel punishmentData={punishmentData} teacherData={teacherData}/>}
{panelName === "viewTeacher" &&<AdminTeacherPanel/>}
{panelName === "student" &&<TeacherStudentPanel/>}
{panelName === "punishment" &&<GlobalPunishmentPanel filter={punishmentFilter} />}
{panelName === "createPunishment" && <CreatePunishmentPanel/>}
{panelName === "createNewStudent" && <CreateNewStudentPanel/>}
{panelName === "userManagement" && <AddTeacherForm/>}
{panelName === "archived" && <GlobalArchivedPunishmentPanel/>}
{panelName === "createEditAssignments" && <AssignmentManager/>}


      </div>
      </div>

         
      <Drawer anchor='right' open={openNotificationDrawer} onClose={()=> toggleNotificationDrawer(false)}>
        {/* <NotificationBar notificationData={data}/> */}
        <DetentionWidget />
      
        <ISSWidget />
        </Drawer>
      </div>
      </>
    )
  );
};

export default AdminDashboard;
