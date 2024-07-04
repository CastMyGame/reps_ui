import { StringSupportOption } from 'prettier';
import React, { useState,useEffect } from 'react';


interface Dropdown {
    label: string;
    panel: string;
  }
  
  // interface ButtonData {
  //   label: string;
  //   panel: string;
  //   multi: boolean;
  //   dropdowns: Dropdown[];
  // }

  interface NavBarProps{
    buttonData: any;
    setPanelName:any;
    setLogin:any;

  }




  const NavbarCustom: React.FC<NavBarProps> = ({ buttonData, setPanelName, setLogin }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState("");

    
    
    

      const dropdownHandler = (panel: string) => {
        setIsDropdownOpen(panel)
        setPanelName(panel);
      };



      const buttonFactory = (label: string, panel: string, multi: boolean, dropdowns: Dropdown[]) => {
        if (!multi) {
          return (
            <li key={label}>

              <div className="page-scroll" 
              onClick={() => dropdownHandler(panel)}>
                {label}
              </div>
            </li>
          );
        }
    
        return (
          <li key={label}>
            <div
              className="page-scroll"
              onClick={() => setIsDropdownOpen(isDropdownOpen === panel ? '' : panel)}
            >
              {label}
            </div>
            <div
              style={{ display: isDropdownOpen === panel ? 'block' : 'none' }}

              className="feature-menu-dropdown page-scroll"
            >
              {dropdowns.map((dropdown) => (
                <div
                style={{opacity:1}}
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
          <div className="container">
            <div style={{ display: "flex" }} className="navbar-header">
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
                {buttonData.map((record:any,index:number) =>{
                    return(
                        <>
                            {buttonFactory(record.label, record.panel,record.multi,record.dropdowns)}
                            </>
                    )
                })}
          


                <li>
                  <button className="login-btn page-scroll" onClick={() => setLogin()}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      );
}

export default NavbarCustom;
