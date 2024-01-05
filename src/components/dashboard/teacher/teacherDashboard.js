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
import TeacherShoutOutWidget from './teacherPanels/teacherShoutOutWidget.js';
import DetentionWidget from '../admin/detentionWidget.js';
import ISSWidget from '../admin/issWidget.js';
import DashboardIcon from '@mui/icons-material/Dashboard';

const TeacherDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [listOfInfractionsAssociatedByTeacher, setListOfInfractionsAssociatedByTeacher] = useState([]);
  const [data, setData] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false)
  const [panelName,setPanelName] = useState("overview")
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    referalDropdown:false,
    teacherDropdown:false,
    studentDropdown:false,
    toolsDropdown:false,
    ftcDropdown:false,
    newReferral:false,
  });
  const [punishmentFilter, setPunishmentFilter] =useState("OPEN")
  const [sideBarOpen,setSideBarOpen]= useState(false)



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


  const headers = {
    Authorization: 'Bearer ' + sessionStorage.getItem('Authorization'),
  };

  useEffect(() => {
    axios
      .get(`${baseUrl}/punish/v1/punishments`, { headers })
      .then(function (response) {
        setData(response.data);
      })
      .catch(function (error) {
        setListOfInfractionsAssociatedByTeacher([]);
        console.log(error);
      });
  }, []);

  const toggleDrawer = (open) => {
    setOpenDrawer(open);
  };

  const toggleNotificationDrawer = (open) => {
    setOpenNotificationDrawer(open);
  };

  const openDropdown =(field)=>{
    setIsDropdownOpen({})
    setIsDropdownOpen((prev)=>({
      ...prev, [field]: !isDropdownOpen[field]
    }))
  }

  const renderDropdownContent = (dropdownState,filterValue,label,panelName) =>{
    return(
      <div onClick={()=>{
        setIsDropdownOpen(dropdownState)
        setPunishmentFilter(filterValue)
        setPanelName(panelName)}}
        className='dropdown-item'>{label}
        </div>
    )
  }

  return (
    loggedIn && (
      <>
        <div className ="app-bar">
          <Toolbar>
          <DashboardIcon onClick={()=>setPanelName("overview")} style={{color:"blue",backgroundColor:"black", marginRight:"10px"}}/>
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
      <div className = "student-main-content-menu">
      <div style={{display:"flex",backgroundColor:"rgb(25, 118, 210)"}}>
  

  {/* Punishment Drop Down */}
  <button 
    className='dropbtn' 
    onClick={() => {
      openDropdown("referalDropdown")
       setPanelName("punishment")}}
    style={{ flex: 1, outline:"1px solid  white", padding: "5px", textAlign: "center"}}
  >
    Referals/Shoutouts
  </button>
  <div className={isDropdownOpen.referalDropdown ? 'dropdown-content show' : 'dropdown-content'}>
  <div onClick={()=>{
        setIsDropdownOpen(false)
        setPanelName("createPunishment")}}
        className='dropdown-item'>Create New
        </div>
{renderDropdownContent(!isDropdownOpen.referalDropdown,"OPEN","View Open","punishment")}
{renderDropdownContent(!isDropdownOpen.referalDropdown,"CFR","View CFR","punishment")}
{renderDropdownContent(!isDropdownOpen.referalDropdown,"CLOSED","View Closed","punishment")}
{renderDropdownContent(!isDropdownOpen.referalDropdown,"ALL","View All","punishment")}

  </div>

    {/* Student Drop Down */}
    <button 
    className='dropbtn' 
    onClick={() => {
      openDropdown("studentDropdown")
      // setPanelName("punishment")
  }}
    style={{ flex: 1, outline:"1px solid  white", padding: "5px", textAlign: "center"}}
  >
    Student
  </button>
      {/* Margin Left is used to move dropdown under the buttons */}
  <div style={{marginLeft:"25%"}} className={isDropdownOpen.studentDropdown ? 'dropdown-content show' : 'dropdown-content'}>
    <div onClick={()=>{
      setPanelName("student") 
      setIsDropdownOpen(!isDropdownOpen.studentDropdown)
 
     }}className='dropdown-item'>View Students</div>
     
  </div>

    {/* Student Drop Down */}
    <button 
    className='dropbtn' 
    onClick={() => {
      openDropdown("toolsDropdown")
      // setPanelName("punishment")
  }}
    style={{ flex: 1, outline:"1px solid  white", padding: "5px", textAlign: "center"}}
  >
    Tools
  </button>
      {/* Margin Left is used to move dropdown under the buttons */}
  <div style={{marginLeft:"50%"}} className={isDropdownOpen.toolsDropdown ? 'dropdown-content show' : 'dropdown-content'}>
 
      <div onClick={()=>{
      setPanelName("createPunishment")  
      setIsDropdownOpen(!isDropdownOpen.toolsDropdown)

     }}className='dropdown-item'>New Referral</div>
     
  </div>

    {/* FTC Drop Down */}
    <button 
    className='dropbtn' 
    onClick={() => {
      openDropdown("ftcDropdown")
      // setPanelName("punishment")
  }}
    style={{ flex: 1, outline:"1px solid  white", padding: "5px", textAlign: "center"}}
  >
    FTC
  </button>
      {/* Margin Left is used to move dropdown under the buttons */}
  <div style={{marginLeft:"75%"}} className={isDropdownOpen.ftcDropdown ? 'dropdown-content show' : 'dropdown-content'}>
    <div onClick={()=>{
      setPanelName("ftc")  
      setIsDropdownOpen(!isDropdownOpen.ftcDropdown)

     }}className='dropdown-item'>Pending Assignments</div>
   
     
  </div>
  </div>
  <div className='sub-main'>
  <div style={{width: sideBarOpen ?"70%":"95%"}} className='left-main'>
  <div className='teacher-overview'>
        <div className='teacher-overview-first'>
        <Card variant="outlined">
         <h2>Positive Behavioral</h2>
        <TeacherShoutOutWidget/>
        </Card>
        </div>
      </div>
      <div className = "teacher-panel">
      {panelName === "overview" &&<TeacherOverviewPanel/>}
{panelName === "student" &&<TeacherStudentPanel/>}
{panelName === "punishment" &&<GlobalPunishmentPanel filter={punishmentFilter} roleType={"teacher"}/>}
{panelName === "createPunishment" && <CreatePunishmentPanel/>}
{panelName === "ftc" && <TeacherFTCPanel/>}
      </div>


  </div>
  <div style={{width: sideBarOpen ?"30%":"5%"}}className="sidebar-content">
  {!sideBarOpen ? (
    <div onClick={()=>setSideBarOpen(true)} className="vertical-text">
      Click to open
    </div>
  ) : (
    <>
    <button onClick={()=>setSideBarOpen(false)}>Close (x)</button>
    <div style={{marginBottom:"20px"}}>
   < Card>
        <DetentionWidget />
      </Card>
    </div>
      <div>
      <Card>
      <ISSWidget />
      </Card>
      </div>
  
    </>
  )}
</div>
</div>
      </div>


        <Drawer anchor='right' open={openNotificationDrawer} onClose={()=> toggleNotificationDrawer(false)}>
        <NotificationBar />
        </Drawer>
      </div>
      </div>
      </>
    )
  );
};

export default TeacherDashboard;
