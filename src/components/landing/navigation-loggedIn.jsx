import React from "react";
import "./landing.css";

export const NavigationLoggedIn = (props) => {
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

        <a
          className="navbar-brand page-scroll"
          href="#page-top"
          style={{ fontSize: 16 }}
        >
          Welcome {sessionStorage.getItem("userName")}!
        </a>

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
                class="feature-menu-dropdown"
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
                  New Office Managed Referral
                </div>
              </div>
            </li>
            <li>
              <div
                className="page-scroll"
                onClick={() =>
                  props.setDropdown((prev) =>
                    prev === "student" ? "" : "student"
                  )
                }
              >
                Classes
              </div>
              <div
                style={{
                  display:
                    props.isDropdownOpen === "student" ? "block" : "none",
                  width: "auto",
                }}
                class="feature-menu-dropdown"
              >
                <div
                  onClick={() => props.setModalType("classAnnouncement")}
                  className="item page-scroll"
                >
                  Class Announcement
                </div>
                <div
                  onClick={() => dropdownHandler("student")}
                  className="item page-scroll"
                >
                  Class Rosters
                </div>
                <div
                  onClick={() => dropdownHandler("classUpdate")}
                  className="item page-scroll"
                >
                  Edit Class Rosters
                </div>
                <div
                  onClick={() => props.setModalType("spotter")}
                  className="item page-scroll"
                >
                  Spot Students
                </div>
              </div>
            </li>
            <li>
              <div
                className="page-scroll"
                onClick={() => {
                  props.setPanelName("levelThree");
                }}
              >
                My Tasks
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
            {/* This will be brought back in when we have a school that wants a store 
            <li>
              <div
                className="page-scroll"
                onClick={() => {
                  props.setPanelName("spendPoints");
                }}
              >
                Store Redeem
              </div>
            </li> */}
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
