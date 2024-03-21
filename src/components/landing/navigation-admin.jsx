import React, {useState} from "react";
import "./landing.css"
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';



export const NavigationAdmin = (props) => {


  const dropdownHandler = (panel) =>{
    props.setPanelName(panel)
    props.setDropdown("")
  }
  
  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div style={{display:"flex"}}className="navbar-header">
      
          <a className="navbar-brand page-scroll" href="#page-top">
            Welcome! {sessionStorage.getItem("userName")}
          </a>{" "}
          <div onClick={()=>props.setModalType("contact")}><ChatIcon style={{marginRight:"15px"}}/></div>
          <NotificationsIcon style={{marginRight:"15px"}} onClick={()=> props.toggleNotificationDrawer(true) }/>
    

   
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            <li>
              <div 
              onClick={()=>dropdownHandler("overview")}
              className="page-scroll">
                Overview
              </div>
            </li>
            <li>
            <div onClick={() => props.setDropdown(prev => prev === "referral" ? "" : "referral")} >
  Referral/Shout Out
</div>
              <div style={{display: props.isDropdownOpen === "referral"?"block":"none"}} class="feature-menu-dropdown">
  <div 
  onClick={()=>dropdownHandler("createPunishment")}
  className="item">New Referral/Shout Outs</div>
  <div 
  onClick={()=>dropdownHandler("punishment")}
  className="item">Existing Referral/Shout Outs</div>
</div>
              
            </li>
            <li>
            <div onClick={() => props.setDropdown(prev => prev === "reports" ? "" : "reports")} >
Reports</div>
              <div style={{display: props.isDropdownOpen === "reports"?" block":"none"}} class="feature-menu-dropdown">
  <div 
  onClick={()=>dropdownHandler("student")}
  className="item">By Students</div>
  <div 
  onClick={()=>dropdownHandler("viewTeacher")}
  className="item">By Teachers</div>
</div>
        
            </li>
            <li>
            <div onClick={() => props.setDropdown(prev => prev === "tools" ? "" : "tools")} >
Tools</div>
<div style={{display: props.isDropdownOpen === "tools"?" block":"none"}} class="feature-menu-dropdown">
  <div 
  onClick={()=>dropdownHandler("createEditAssignments")}
  className="item">Create/Edit Assignments</div>
  <div 
  onClick={()=>dropdownHandler("userManagement")}
  className="item">Create A Student/Teachers</div>
    <div 
  onClick={()=>dropdownHandler("archived")}
  className="item">Archived</div>
</div>


            </li>
           
            <li>
              <button className="login-btn"
              onClick={()=>props.setLogin()}>
                Logout
              </button>
            </li>
          
          </ul>
        </div>
      </div>
    </nav>
  );
};