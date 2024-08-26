import React, { useState } from "react";
import "../generic-components/hamburger.css";

export default function Hamburger({ data, setPanelName,setModalType }) {
  const [activeItem, setActiveItem] = useState(null);

  const clickActive = (index, panel, hasSubItems) => {


    if (hasSubItems) {
      setActiveItem(index === activeItem ? null : index); // Toggle sub-items
    } else {
      setPanelName(panel); // Directly set the panel for items without sub-items
    }
  };

  return (
    <div className="hamburger">
      {Array.isArray(data) && data.map((menuItem, index) => (
        <div 
          key={index} 
          className="burger" 
          onClick={() => clickActive(index, menuItem.panel, menuItem.subItems)}
        >
          {menuItem.item}
          {/* Display subItems if they exist and the current item is active */}
          {menuItem.subItems && index === activeItem && (
            <div className="sub-menu">
              {menuItem.subItems.map((subItem, subIndex) => (
                <div 
                  key={subIndex} 
                  className="sub-item"
                  onClick={() => {
                    if(subItem.title === 'Spot Students' || subItem.title=== 'CONTACT US'){
                      setModalType(subItem.panel)
                    } else{
                      setPanelName(subItem.panel)

                    }
                  }} // Set panel when subItem is clicked
                >
                  {subItem.title}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
