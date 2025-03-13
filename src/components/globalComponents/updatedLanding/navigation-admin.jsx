import React, {useEffect, useRef} from "react";
import "./landing.css";
import PropTypes from 'prop-types';

export const NavigationAdmin = (props) => {
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
                type="button"
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
                  type="button"
                >
                  By Students
                </div>
                <div
                  onClick={() => dropdownHandler("viewTeacher")}
                  className="item page-scroll"
                  type="button"
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
                type="button"
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
                  type="button"
                >
                  Create/Edit Assignments
                </div>
                <div
                  onClick={() => dropdownHandler("userManagement")}
                  className="item page-scroll"
                  type="button"
                >
                  Create A Student
                </div>
                <div
                  onClick={() => dropdownHandler("studentManagement")}
                  className="item page-scroll"
                  type="button"
                >
                  Edit A Student
                </div>
                <div
                  onClick={() => dropdownHandler("archived")}
                  className="item page-scroll"
                  type="button"
                >
                  Archived
                </div>
              </div>
            </li>
            <li>
              <div
                className="page-scroll"
                onClick={() => {
                  props.toggleNotificationDrawer(true);
                }}
                type="button"
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

NavigationAdmin.propTypes = {
  setDropdown: PropTypes.func.isRequired,
  setPanelName: PropTypes.func.isRequired,
  isDropdownOpen: PropTypes.string,
  setModalType: PropTypes.func,
  toggleNotificationDrawer: PropTypes.func,
  setLogin: PropTypes.func.isRequired,
};
