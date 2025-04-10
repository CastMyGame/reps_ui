import React, { useEffect, useRef } from "react";
import "./landing.css";
import PropTypes from 'prop-types';

export const NavigationLoggedIn = (props) => {
  const dropdownRef = useRef(null);

  const { setDropdown } = props; // Destructure only what's needed

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(""); // Close the dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setDropdown]);

  const dropdownHandler = (panel) => {
    props.setPanelName(panel);
    props.setDropdown(""); // Close the dropdown
  };

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div
        className="container"
        style={{
          width: "100%",
          display: "inline-block",
        }}
        ref={dropdownRef}
      >
        <button
          type="button"
          className="navbar-toggle collapsed"
          data-toggle="collapse"
          data-target="#bs-example-navbar-collapse-1"
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
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
          <ul className="nav navbar-nav navbar-right" ref={dropdownRef}>
            <li>
              <div
                onClick={() => dropdownHandler("overview")}
                className="page-scroll"
                type="button"
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
                type="button"
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
                  type="button"
                >
                  New Teacher Referral/Shout Out
                </div>
                <div
                  onClick={() => dropdownHandler("punishment")}
                  className="item page-scroll"
                  type="button"
                >
                  Existing Referrals/Shout Outs
                </div>
                <div
                  onClick={() => dropdownHandler("createOfficeReferral")}
                  className="item page-scroll"
                  type="button"
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
                type="button"
              >
                Classes
              </div>
              <div
                style={{
                  display:
                    props.isDropdownOpen === "student" ? "block" : "none",
                  width: "auto",
                }}
                className="feature-menu-dropdown"
              >
                <div
                  onClick={() => {
                    props.setModalType("classAnnouncement");
                    props.setDropdown("");
                  }}
                  className="item page-scroll"
                  type="button"
                >
                  Class Announcement
                </div>
                <div
                  onClick={() => dropdownHandler("student")}
                  className="item page-scroll"
                  type="button"
                >
                  Class Rosters
                </div>
                <div
                  onClick={() => dropdownHandler("classUpdate")}
                  className="item page-scroll"
                  type="button"
                >
                  Edit Class Rosters
                </div>
                <div
                  onClick={() => {
                    props.setModalType("spotter");
                    props.setDropdown("");
                  }}
                  className="item page-scroll"
                  type="button"
                >
                  Spot Students
                </div>
              </div>
            </li>
            <li>
              <div
                className="page-scroll"
                onClick={() => props.setPanelName("levelThree")}
                type="button"
              >
                My Tasks
              </div>
            </li>
            <li>
              <div
                className="page-scroll"
                onClick={() => props.toggleNotificationDrawer(true)}
                type="button"
              >
                Detention/ISS List
              </div>
            </li>
            <li>
              <div
                className="page-scroll"
                onClick={() => {
                  props.setModalType("contact");
                  props.setDropdown("");
                }}
                type="button"
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

NavigationLoggedIn.propTypes = {
  setDropdown: PropTypes.func.isRequired,
  setPanelName: PropTypes.func.isRequired,
  isDropdownOpen: PropTypes.string,
  setModalType: PropTypes.func,
  toggleNotificationDrawer: PropTypes.func,
  setLogin: PropTypes.func.isRequired,
};
