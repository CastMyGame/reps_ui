import React, {useEffect, useRef} from "react";
import "./landing.css";
import { AccessibleDiv } from "src/utils/accessibleDiv";

interface NavigationAdminProps {
  toggleNotificationDrawer: (open: boolean) => void;
  setModalType: (type: string) => void;
  setPanelName: (name: string) => void;
  setDropdown: React.Dispatch<React.SetStateAction<string>>;
  whichDropdownOpen: string;
  setLogin: () => void;
}

export const NavigationAdmin: React.FC<NavigationAdminProps> = (props) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { setDropdown } = props; // Destructure only what's needed

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
              <AccessibleDiv
                onClick={() => dropdownHandler("overview")}
                className="page-scroll"
              >
                Overview
              </AccessibleDiv>
            </li>
            <li>
              <AccessibleDiv
                className="page-scroll"
                onClick={() =>
                  props.setDropdown((prev) =>
                    prev === "referral" ? "" : "referral"
                  )
                }
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
                  New Office Referral
                </AccessibleDiv>
              </div>
            </li>
            <li>
              <AccessibleDiv
                className="page-scroll"
                onClick={() =>
                  props.setDropdown((prev) =>
                    prev === "reports" ? "" : "reports"
                  )
                }
              >
                Reports
              </AccessibleDiv>
              <div
                style={{
                  display:
                    props.whichDropdownOpen === "reports" ? " block" : "none",
                }}
                className="feature-menu-dropdown page-scroll"
              >
                <AccessibleDiv
                  onClick={() => dropdownHandler("student")}
                  className="item page-scroll"
                >
                  By Students
                </AccessibleDiv>
                <AccessibleDiv
                  onClick={() => dropdownHandler("viewTeacher")}
                  className="item page-scroll"
                >
                  By Teachers
                </AccessibleDiv>
              </div>
            </li>
            <li>
              <AccessibleDiv
                className="page-scroll"
                onClick={() =>
                  props.setDropdown((prev) => (prev === "tools" ? "" : "tools"))
                }
              >
                Tools
              </AccessibleDiv>
              <div
                style={{
                  display: props.whichDropdownOpen === "tools" ? " block" : "none",
                }}
                className="feature-menu-dropdown page-scroll"
              >
                {/* <div
                  onClick={() => dropdownHandler("createEditAssignments")}
                  className="item page-scroll"
                  type="button"
                >
                  Create/Edit Assignments
                </div> */}
                <AccessibleDiv
                  onClick={() => dropdownHandler("userManagement")}
                  className="item page-scroll"
                >
                  Create A Student
                </AccessibleDiv>
                <AccessibleDiv
                  onClick={() => dropdownHandler("studentManagement")}
                  className="item page-scroll"
                >
                  Edit A Student
                </AccessibleDiv>
                <AccessibleDiv
                  onClick={() => dropdownHandler("archived")}
                  className="item page-scroll"
                >
                  Archived
                </AccessibleDiv>
              </div>
            </li>
            <li>
              <AccessibleDiv
                className="page-scroll"
                onClick={() => {
                  props.toggleNotificationDrawer(true);
                }}
              >
                Detention/ISS List
              </AccessibleDiv>
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
              <AccessibleDiv
                className="page-scroll"
                onClick={() => {
                  props.setModalType("contact");
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
