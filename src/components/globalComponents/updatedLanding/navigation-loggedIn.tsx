import React, { useEffect, useRef } from "react";
import { AccessibleDiv } from "src/utils/accessibleDiv";
import "./landing.css";

interface NavigationLoggedInProps {
  toggleNotificationDrawer: (open: boolean) => void;
  setModalType: (type: string) => void;
  setPanelName: (name: string) => void;
  setDropdown: React.Dispatch<React.SetStateAction<string>>;
  whichDropdownOpen: string;
  setLogin: () => void;
}

export const NavigationLoggedIn: React.FC<NavigationLoggedInProps> = (
  props
) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { setDropdown } = props; // Destructure only what's needed

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdown(""); // Close the dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setDropdown]);

  const dropdownHandler = (panel: string) => {
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
          <ul className="nav navbar-nav navbar-right">
            <li>
              <AccessibleDiv
                onClick={() => dropdownHandler("overview")} className="page-scroll"
              >
                Overview
              </AccessibleDiv>
            </li>
            <li>
              <AccessibleDiv
                onClick={() => props.setDropdown(prev => (prev === "referral" ? "" : "referral"))}
                className="page-scroll"
              >
                Referrals
              </AccessibleDiv>
              <div
                style={{
                  display:
                    props.whichDropdownOpen === "referral" ? "block" : "none",
                }}
                className="feature-menu-dropdown"
              >
                <AccessibleDiv
                  onClick={() => dropdownHandler("createPunishment")}
                  className="item page-scroll"
                >
                  New Teacher Referral/Shout Out
                </AccessibleDiv>
                <AccessibleDiv
                  onClick={() => dropdownHandler("punishment")}
                  className="item page-scroll"
                >
                  Existing Referrals/Shout Outs
                </AccessibleDiv>
                <AccessibleDiv
                  onClick={() => dropdownHandler("createOfficeReferral")}
                  className="item page-scroll"
                >
                  New Office Managed Referral
                </AccessibleDiv>
              </div>
            </li>
            <li>
              <AccessibleDiv
                className="page-scroll"
                onClick={() =>
                  props.setDropdown((prev) =>
                    prev === "student" ? "" : "student"
                  )
                }
              >
                Classes
              </AccessibleDiv>
              <div
                style={{
                  display:
                    props.whichDropdownOpen === "student" ? "block" : "none",
                  width: "auto",
                }}
                className="feature-menu-dropdown"
              >
                <AccessibleDiv
                  onClick={() => {
                    props.setModalType("classAnnouncement");
                    props.setDropdown("");
                  }}
                  className="item page-scroll"
                >
                  Class Announcement
                </AccessibleDiv>
                <AccessibleDiv
                  onClick={() => dropdownHandler("student")}
                  className="item page-scroll"
                >
                  Class Rosters
                </AccessibleDiv>
                <AccessibleDiv
                  onClick={() => dropdownHandler("classUpdate")}
                  className="item page-scroll"
                >
                  Edit Class Rosters
                </AccessibleDiv>
                <AccessibleDiv
                  onClick={() => {
                    props.setModalType("spotter");
                    props.setDropdown("");
                  }}
                  className="item page-scroll"
                >
                  Spot Students
                </AccessibleDiv>
              </div>
            </li>
            <li>
              <AccessibleDiv
                className="page-scroll"
                onClick={() => props.setPanelName("levelThree")}
              >
                My Tasks
              </AccessibleDiv>
            </li>
            <li>
              <AccessibleDiv
                className="page-scroll"
                onClick={() => props.toggleNotificationDrawer(true)}
              >
                Detention/ISS List
              </AccessibleDiv>
            </li>
            <li>
              <AccessibleDiv
                className="page-scroll"
                onClick={() => {
                  props.setModalType("contact");
                  props.setDropdown("");
                }}
              >
                Contact Us
              </AccessibleDiv>
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
