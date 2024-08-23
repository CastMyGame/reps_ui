import React from "react";
import "./landing.css";
import { GiHamburgerMenu } from "react-icons/gi";

export const NavigationAdmin = (props) => {

  const Hamburger = <GiHamburgerMenu className="HamburgerMenu" size="30px" color="black" />

  const dropdownHandler = (panel) => {
    props.setPanelName(panel);
    props.setDropdown("");
  };

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container" style={{
          width: "100%",
          display: "inline-block"
        }}>
        <div style={{ display: "flex" }} className="navbar-header">

          <div className="hamburger">
            {Hamburger}
          </div>
          <a
            className="navbar-brand page-scroll"
            href="#page-top"
            style={{ fontSize: 16 }}
          >
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
                onClick={() => dropdownHandler("overview")}
                className="page-scroll"
              >
                Overview
              </div>
            </li>
            <li>
              <div
              className="page-scroll"
                onClick={() =>
                  props.setDropdown((prev) =>
                    prev === "referral" ? "" : "referral"
                  )
                }
              >
                Referrals
              </div>
              <div
                style={{
                  display:
                    props.isDropdownOpen === "referral" ? "block" : "none",
                }}
                className="feature-menu-dropdown"
              >
                <div
                  onClick={() => dropdownHandler("createPunishment")}
                  className="item page-scroll"
                >
                  New Teacher Referral/Shout Out
                </div>
                <div
                  onClick={() => dropdownHandler("punishment")}
                  className="item page-scroll"
                >
                  Existing Referrals/Shout Outs
                </div>
                <div
                  onClick={() => dropdownHandler("createOfficeReferral")}
                  className="item page-scroll"
                >
                  New Office Referral
                </div>
              </div>
            </li>
            <li>
              <div
              className="page-scroll"
                onClick={() =>
                  props.setDropdown((prev) =>
                    prev === "reports" ? "" : "reports"
                  )
                }
              >
                Reports
              </div>
              <div
                style={{
                  display:
                    props.isDropdownOpen === "reports" ? " block" : "none",
                }}
                className="feature-menu-dropdown page-scroll"
              >
                <div
                  onClick={() => dropdownHandler("student")}
                  className="item page-scroll"
                >
                  By Students
                </div>
                <div
                  onClick={() => dropdownHandler("viewTeacher")}
                  className="item page-scroll"
                >
                  By Teachers
                </div>
              </div>
            </li>
            <li>
              <div
              className="page-scroll"
                onClick={() =>
                  props.setDropdown((prev) => (prev === "tools" ? "" : "tools"))
                }
              >
                Tools
              </div>
              <div
                style={{
                  display: props.isDropdownOpen === "tools" ? " block" : "none",
                }}
                className="feature-menu-dropdown page-scroll"
              >
                <div
                  onClick={() => dropdownHandler("createEditAssignments")}
                  className="item page-scroll"
                >
                  Create/Edit Assignments
                </div>
                <div
                  onClick={() => dropdownHandler("userManagement")}
                  className="item page-scroll"
                >
                  Create A Student/Teachers
                </div>
                <div
                  onClick={() => dropdownHandler("archived")}
                  className="item page-scroll"
                >
                  Archived
                </div>
              </div>
            </li>
            <li>
              <div
                className="page-scroll"
                onClick={() => {
                  props.setModalType("contact");
                }}
              >
                Contact Us
              </div>
            </li>
            <li>
              <div
                className="page-scroll"
                onClick={() => {
                  props.toggleNotificationDrawer(true);
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
              <button className="login-btn page-scroll" onClick={() => props.setLogin()}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
