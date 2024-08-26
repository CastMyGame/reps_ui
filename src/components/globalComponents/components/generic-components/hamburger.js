import React, { useState } from "react";
import "../generic-components/hamburger.css";

export default function Hamburger({ data }) {
  const [activeItem, setActiveItem] = useState(null);

  const clickActive = (index) => {
    setActiveItem(index === activeItem ? null : index);
  };

  return (
    <div className="hamburger">
      {Array.isArray(data) && data.map((menuItem, index) => (
        <div key={index} className="burger" onClick={() => clickActive(index)}>
          {menuItem.item}
          {menuItem.subItems && index === activeItem && (
            <div className="sub-menu">
              {menuItem.subItems.map((subItem, subIndex) => (
                <div key={subIndex} className="sub-item">
                  {subItem}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
