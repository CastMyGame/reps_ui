import React from "react";
import "./landing.css";
import { GiHamburgerMenu } from "react-icons/gi";

export const NavigationStudent = (props) => {
  const Hamburger = (
    <GiHamburgerMenu className="HamburgerMenu" size="30px" color="black" />
  );

  const dropdownHandler = (panel) => {
    props.setPanelName(panel);
    props.setDropdown("");
  };

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div
        className="container"
        style={{
          width: "100%",
          display: "inline-block",
        }}
      >
        <button
          type="button"
          className="navbar-toggle collapsed"
          data-toggle="collapse"
          data-target="#bs-example-navbar-collapse-1"
        >
          {" "}
          <span className="sr-only">Toggle navigation</span>{" "}
          <span className="icon-bar"></span> <span className="icon-bar"></span>{" "}
          <span className="icon-bar"></span>{" "}
        </button>
          <a className="navbar-brand page-scroll" href="#page-top" style={{ fontSize: 16 }}>
            Welcome {sessionStorage.getItem("userName")}!
          </a>
          {/* 
          <div onClick={()=>props.setModalType("contact")}><ChatIcon style={{marginRight:"15px"}}/></div> */}
          {/* Keeping this until we add notifications system but can move and use this in the future
           <NotificationsIcon style={{marginRight:"15px"}} onClick={()=> props.toggleNotificationDrawer(true) }/> */}

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            <li>
              <div
                onClick={() => dropdownHandler("openAssignments")}
                className="page-scroll"
              >
                Open Assignments
              </div>
            </li>
            <li>
              <div
                onClick={() => dropdownHandler("closedAssignments")}
                className="page-scroll"
              >
                Contact History
              </div>
            </li>
            <li>
              <button
                className="login-btn page-scroll"
                onClick={() => props.setLogin()}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
