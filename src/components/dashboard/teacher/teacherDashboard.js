import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { baseUrl } from '../../../utils/jsonData';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import AccountBoxIcon from '@mui/icons-material/AccountBox';import NotificationBar from '../../notification-bar/NotificationBar';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CreatePunishmentPanel from '../panel/createPunishmentPanel';
import CreateNewStudentPanel from '../panel/createNewStudentPanel';
import TeacherStudentPanel from './teacherPanels/teacherStudentPanel';
import TeacherFTCPanel from './teacherPanels/FTCpanel';
import TeacherPunishmentPanel from '../global/globalPunishmentPanel.js';
import GlobalPunishmentPanel from '../global/globalPunishmentPanel.js';
import Card from '@mui/material/Card';
import ShoutOutWidget from '../student/shoutOutWidget.js';
import TeaherOverviewPanel from './teacherPanels/teacherOverview.js';
import TeacherOverviewPanel from './teacherPanels/teacherOverview.js';
import TeacherShoutOutWidget from './teacherPanels/charts/tables/teacherShoutOutWidget.js';
import DetentionWidget from '../admin/detentionWidget.js';
import ISSWidget from '../admin/issWidget.js';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LevelThreePanel from '../global/levelThreePanel.js';
import ChatIcon from '@mui/icons-material/Chat';
import { ContactUsModal } from '../../../secuirty/contactUsModal';
import { get } from '../../../utils/api/api.js';
import LoadingWheelPanel from '../student/blankPanelForTest.js';

const TeacherDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [data, setData] = useState([]);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false)
  const [panelName,setPanelName] = useState("overview")
  const [studentData,setStudentData]= useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    referralDropdown:false,
    teacherDropdown:false,
    studentDropdown:false,
    toolsDropdown:false,
    ftcDropdown:false,
    newReferral:false,
  });
  const [punishmentFilter, setPunishmentFilter] =useState("OPEN")
  const [sideBarOpen,setSideBarOpen]= useState(false)

  const [contactUsDisplayModal,setContactUsDisplayModal] = useState(false)

  const handleLogout = () => {
    sessionStorage.removeItem('Authorization');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('schoolName');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    window.location.href = '/login';
  };

  useEffect(() => {
    if (sessionStorage.getItem('Authorization') === null) {
      window.location.href = '/login';
    } else {
      setLoggedIn(true);
    }
  }, []);




  useEffect(() => {
 
    const fetchPunishmentData = async () =>{
      try{
        const response = await get('DTO/v1/TeacherOverviewData')
        setData(response.punishments)
      }catch(err){
        console.error(err)
      }

    }
    if(panelName === "overview"){
      fetchPunishmentData()

    }

  }, [panelName]);

  // useEffect(()=>{
  //   const fetchStudentData = async ()=>{
  //     try{
  //       const response = await get('student/v1/allStudents');
  //       setStudentData(response)

  //     }catch(err){
  //       console.error(err)
  //     }
  //   }
  //   fetchStudentData();

  // },[])



  const toggleNotificationDrawer = (open) => {
    setOpenNotificationDrawer(open);
  };

  const openDropdown =(field)=>{
    setIsDropdownOpen({})
    setIsDropdownOpen((prev)=>({
      ...prev, [field]: !isDropdownOpen[field]
    }))
  }


  return (
    loggedIn && (
      <>
        <div className ="app-bar">
        <ContactUsModal setContactUsDisplayModal={setContactUsDisplayModal} contactUsDisplayModal={contactUsDisplayModal}/>
          <Toolbar style={{background:"blue", color: "white"}}>
          <DashboardIcon onClick={()=>setPanelName("overview")} style={{color:"white",backgroundColor:"black", marginRight:"10px"}}/>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Welcome, {sessionStorage.getItem('userName')}
            </Typography>
            <NotificationsIcon style={{marginRight:"15px"}} onClick={()=> toggleNotificationDrawer(true) }/>
            <div onClick={()=>setContactUsDisplayModal(true)}><ChatIcon style={{marginRight:"15px"}}/></div>
    

            <AccountBoxIcon/>           
              <IconButton type="button" color="inherit" onClick={handleLogout}>
              Logout
            </IconButton>

          </Toolbar>
        </div>
       <div className='page'>
      <div className='teacher-main-content'> 
      <div className = "">
      <div className='teacher-main-content-menu'
      >
  
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
 
    {/* Student Drop Down */}
    <button 
    className='teacher-dash-dropbtn' 
    onClick={() => {
      // openDropdown("studentDropdown")
      setPanelName("student")
  }}
  >
    My Students
  </button>
      {/* Margin Left is used to move dropdown under the buttons */}
  {/* <div style={{marginLeft:"50%"}} className={isDropdownOpen.studentDropdown ? 'dropdown-content show' : 'dropdown-content'}>
    <div onClick={()=>{
      setPanelName("student") 
      setIsDropdownOpen(!isDropdownOpen.studentDropdown)
 
     }}className='teacher-dropdown-item'>My Students</div>

    <div onClick={()=>{
      setPanelName("punishment") 
      setIsDropdownOpen(!isDropdownOpen.studentDropdown)
 
     }}className='teacher-dropdown-item'>My Write-Ups</div>
     
  </div> */}

  

    {/* FTC Drop Down */}
    <button 
    className='teacher-dash-dropbtn' 
    onClick={() => {
      // openDropdown("ftcDropdown")
      setPanelName("levelThree")
  }}
  >
    My Tasks
  </button>
  {/* <div style={{marginLeft:"75%"}} className={isDropdownOpen.ftcDropdown ? 'dropdown-content show' : 'dropdown-content'}>
    <div onClick={()=>{
      setPanelName("ftc")  
      setIsDropdownOpen(!isDropdownOpen.ftcDropdown)

     }}className='teacher-dropdown-item'>Failure to Complete Work</div>
       <div onClick={()=>{
      setPanelName("levelThree")  
      setIsDropdownOpen(!isDropdownOpen.ftcDropdown)

     }}className='teacher-dropdown-item'>Level Three Approval</div>
   
     
  </div> */}
  
  </div>
 { data.length===0 ? <LoadingWheelPanel/>:<div className='teacher-overview'>
  <div 
  style={{width: false ?"70%":"100%"}}
   className='left-main'>

      <div className = "teacher-panel">
      {panelName === "overview" && <TeacherOverviewPanel setPanelName={setPanelName} data={data} />}

{panelName === "student" &&<TeacherStudentPanel listOfStudents={studentData}/>}
{panelName === "punishment" &&<GlobalPunishmentPanel filter={punishmentFilter} roleType={"teacher"}/>}
{panelName === "createPunishment" && <CreatePunishmentPanel/>}
{panelName === "ftc" && <TeacherFTCPanel/>}
{panelName === "levelThree" && <LevelThreePanel/>}
      </div>


  </div>
   </div> }
     </div>
  
        <Drawer anchor='right' open={openNotificationDrawer} onClose={()=> toggleNotificationDrawer(false)}>
        {/* <NotificationBar notificationData={data}/> */}
        <DetentionWidget />
      
        <ISSWidget />
        </Drawer>
      </div>
      </div>
      </>
    )
  );
};

export default TeacherDashboard;
