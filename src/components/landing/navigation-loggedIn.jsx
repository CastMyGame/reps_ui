import React from "react";
import "./landing.css";
import "../globalComponents/components/generic-components/hamburger.css";
import Hamburger from "../globalComponents/components/generic-components/hamburger";


const menuData = [
  {
    item: 'OVERVIEW',
    panel: 'overview',
    subItems: null
  },
  {
    item: 'REFERRAL',
    panel: null,
    subItems: [
      { title: 'New Teacher Referral/Shout Out', panel: "createPunishment" },
      { title: 'Existing Referrals/Shout Outs', panel: 'punishment' },
      { title: 'New Office Managed Referral', panel: 'createOfficeReferral' }
    ]
  },
  {
    item: 'STUDENTS',
    panel: null,
    subItems: [
      { title: "School Roster", panel: 'student' },
      { title: "Spot Students", panel: 'spotter' }
    ]
  },
  {
    item: 'MY TASK',
    panel: 'levelThree',
    subItems: null
  },
  {
    item: 'CONTACT US',
    panel: 'contact',
    subItems: null
  }
];



export const NavigationLoggedIn = (props) => {



  const dropdownHandler = (panel) =>{
    props.setPanelName(panel)
    props.setDropdown("")
  }
  
  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container" style={{
          width: "100%",
          display: "inline-block"
        }}>
          
        <div style={{display:"flex"}}className="navbar-header">
           <div className="hamburger-container"><Hamburger setPanelName={ props.setPanelName} data={menuData} setModalType={props.setModalType} /></div>
      
          <a className="navbar-brand page-scroll" href="#page-top" style={{ fontSize: 16}}>
            Welcome {sessionStorage.getItem("userName")}!
          </a>
    

   
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
            <div
            className="page-scroll"
             onClick={() => props.setDropdown(prev => prev === "referral" ? "" : "referral")} >
                Referrals
            </div>
            <div style={{display: props.isDropdownOpen === "referral"?"block":"none"}} class="feature-menu-dropdown">
  <div 
  onClick={()=>dropdownHandler("createPunishment")}
  className="item page-scroll">New Teacher Referral/Shout Out</div>
  <div 
  onClick={()=>dropdownHandler("punishment")}
  className="item page-scroll">Existing Referrals/Shout Outs</div>
<div 
  onClick={()=>dropdownHandler("createOfficeReferral")}
  className="item page-scroll">New Office Managed Referral</div>
  </div>
              
            </li>
            <li>
              <div 
              className="page-scroll"
               onClick={() => props.setDropdown(prev => prev === "student" ? "" : "student")} >
              
              Students
              </div><div style={{display: props.isDropdownOpen === "student"?"block":"none"}} class="feature-menu-dropdown">
              <div 
  onClick={()=>dropdownHandler("student")}
  className="item page-scroll">School Roster</div>
  <div 
  onClick={()=>props.setModalType("spotter")}
  className="item page-scroll">Spot Students</div>
  </div>
            </li>
            <li>
              <div 
              className="page-scroll"
              onClick={()=>{
                props.setPanelName("levelThree")
              }}
              >
              My Tasks
              </div>
            </li>
            <li>
              <div 
              className="page-scroll"
              onClick={()=>{
                props.setModalType("contact")
              }}
              >
              Contact Us
              </div>
            </li>
            <li>
              <div 
              className="page-scroll"
              onClick={()=>{
                props.toggleNotificationDrawer(true)
              }}
              >
              Detention/ISS List
              </div>
            </li>
            <li>
              <div 
              className="page-scroll"
              onClick={()=>{
                props.setPanelName("spendPoints")
              }}
              >
              Store Redeem
              </div>
            </li>
           
            <li>
              <button className="login-btn page-scroll"
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