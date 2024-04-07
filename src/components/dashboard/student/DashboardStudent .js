import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Drawer from '@mui/material/Drawer';
import NotificationBar from '../../notification-bar/NotificationBar';
import StudentClosedPunishmentPanel from './studentClosePunihsmentPanel';
import StudentOpenPunishmentPanel from './studentOpenPunihsmentPanel';
import ShoutOutWidget from './shoutOutWidget';
import TotalPositivePoints from './positivePointsComponents';
import Card from '@mui/material/Card';
// import BlankPanelForTest from './blankPanelForTest';
import ViolationPage from '../../../forms/ViolationPage';
import { get } from '../../../utils/api/api';
import LoadingWheelPanel from './blankPanelForTest';
import { ContactUsModal } from '../../../secuirty/contactUsModal';
import { NavigationStudent } from '../../landing/navigation-student';



const StudentDashboard = () => {
  const [loggedIn, setLoggedIn] = useState(true);
  const [data, setData] = useState([]);
  const [modalType,setModalType] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState("")
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false)
  const [panelName,setPanelName] = useState("openAssignments")
  const [selectAssignmentToStart,setSelectAssignmentToStart] = useState();
  const [studentDetails,setStudentDetails] = useState();


  const handleLogout = () => {
    sessionStorage.removeItem('Authorization');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('schoolName');
    sessionStorage.removeItem('email');
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
 
    const fetchData = async () =>{
      try{
        const response = await get(`DTO/v1/StudentOverviewData`)
        setData(response.punishments)
        setStudentDetails(response.student)
      }catch(err){
        console.error(err)
      }

    }
    
      fetchData()

    

  }, [panelName]);


  const toggleNotificationDrawer = (open) => {
    setOpenNotificationDrawer(open);
  };

  const handleStartAssignment = (data) =>{
    setSelectAssignmentToStart(data)
    setPanelName("startAssignment")
  }


 return (
  
    loggedIn && (
      <>
         <div>
      
      {modalType === "contact" && <ContactUsModal setContactUsDisplayModal={setModalType} />}

      <NavigationStudent toggleNotificationDrawer ={toggleNotificationDrawer } setModalType={setModalType} setPanelName={setPanelName}  setDropdown={setIsDropdownOpen} isDropdownOpen={isDropdownOpen} setLogin={handleLogout} />
  </div>
       <div className='header'>
      <div className='student-main-content'> 
    
    

      <div style={{width:"100%"}}className='dashboard-title'>
      <div>Student Dashboard</div>

      </div>

      { data.length ===0 ? 

      <div style={{backgroundColor:"white",height:"80vh",marginTop:"10px"}} className='student-panel'>
      <LoadingWheelPanel/>
      </div>:<>

      


      <div className='student-overview' style={{display: panelName ==="startAssignment"?"none":""}}>
        <div className='student-overview-first'>
        <Card variant="outlined">
        <ShoutOutWidget listOfPunishments={data}/>
        </Card>
        </div>
        <div className='student-overview-second'>
        <Card style={{height:"200px"}}variant="outlined">
          <TotalPositivePoints data={studentDetails}/>
          </Card>
        </div>

      </div>

      <div style={{height:"80vh"}}className = "student-panel">
        {panelName === "closedAssignments" &&<StudentClosedPunishmentPanel listOfPunishments={data}/>}
        {panelName === "openAssignments" &&<StudentOpenPunishmentPanel listOfPunishments={data} handleStartAssignment={handleStartAssignment}/>}
        {panelName === "startAssignment" &&<ViolationPage data={selectAssignmentToStart} />}
      </div>
      </>
}

        <Drawer anchor='right' open={openNotificationDrawer} onClose={()=> toggleNotificationDrawer(false)}>
        <NotificationBar />
        </Drawer>
      </div>
      </div>
      </>
    )
  );
};

export default StudentDashboard;
