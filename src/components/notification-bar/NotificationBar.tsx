import React, { useEffect, useState } from "react";
import "./notification-bar.css";

interface Notification {
  index: number;
  title: string;
  description: string;
}

export const NotificationBar = () => {
  const [data, setData] = useState<Notification[]>([]);

  useEffect(() => {
    const notificationData = [
      {
        index: 1,
        title: "Punishment",
        description: "New Punishment has been issued to a student",
      },
      {
        index: 2,
        title: "New Student",
        description: "New Student Registered",
      },
      {
        index: 3,
        title: "Punishment Closed",
        description: "Student Finished His Assignment, Review",
      },
      {
        index: 4,
        title: "Punishment Closed",
        description: "Student Finished His Assignment, Review",
      },
      {
        index: 5,
        title: "Punishment Closed",
        description: "Student Finished His Assignment, Review",
      },
    ];

    setData(notificationData);
  }, []); // The empty dependency array ensures this effect runs only once, on mount.

  const handleDismiss = (index: number) => {
    // Filter out the notification with the specified index
    const updatedData = data.filter(
      (notification) => notification.index !== index
    );

    // Update the state with the filtered data
    setData(updatedData);
  };

  return (
    <div className="notification-body">
      <div className="popup-container">
        {data.length === 0 ? (
          <div className="notification-card">
            <span className="dismiss-btn">×</span>
            <h3 className="notification-title">You are all caught up!!</h3>
          </div>
        ) : (
          data.map((notification) => (
            <div key={notification.index} className="notification-card">
              <span
                onClick={() => handleDismiss(notification.index)}
                className="dismiss-btn"
              >
                ×
              </span>
              <h3 className="notification-title">{notification.title}</h3>
              <p className="notification-description">
                {notification.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBar;
