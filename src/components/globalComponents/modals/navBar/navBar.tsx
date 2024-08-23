import React, { useState } from "react";

interface Dropdown {
  label: string;
  panel: string;
}

interface NavBarProps {
  buttonData: any;
  setPanelName: any;
  setLogin: any;
}

const NavbarCustom: React.FC<NavBarProps> = ({
  buttonData,
  setPanelName,
  setLogin,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState("");

  const dropdownHandler = (panel: string) => {
    setIsDropdownOpen(panel);
    setPanelName(panel);
  };

  const buttonFactory = (
    label: string,
    panel: string,
    multi: boolean,
    dropdowns: Dropdown[]
  ) => {
    if (!multi) {
      return (
        <li key={label}>
          <div className="page-scroll" onClick={() => dropdownHandler(panel)}>
            {label}
          </div>
        </li>
      );
    }

    return (
      <li key={label}>
        <div
          className="page-scroll"
          onClick={() =>
            setIsDropdownOpen(isDropdownOpen === panel ? "" : panel)
          }
        >
          {label}
        </div>
        <div
          style={{ display: isDropdownOpen === panel ? "block" : "none" }}
          className="feature-menu-dropdown page-scroll"
        >
          {dropdowns.map((dropdown) => (
            <div
              style={{ opacity: 1 }}
              key={dropdown.panel}
              onClick={() => dropdownHandler(dropdown.panel)}
              className="item page-scroll"
            >
              {dropdown.label}
            </div>
          ))}
        </div>
      </li>
    );
  };

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div
        className="container"
        style={{
          width: "100%",
          display: "inline-block",
          borderColor: "red",
          borderRadius: "10px",
        }}
      >
        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            <li>
              <div className="page-scroll" style={{ fontWeight: "bold" }}>
                Welcome {sessionStorage.getItem("userName")}!
              </div>
            </li>

            {buttonData.map((record: any, index: number) => {
              return (
                <>
                  {buttonFactory(
                    record.label,
                    record.panel,
                    record.multi,
                    record.dropdowns
                  )}
                </>
              );
            })}

            <li>
              <button
                className="login-btn page-scroll"
                onClick={() => setLogin()}
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

export default NavbarCustom;
