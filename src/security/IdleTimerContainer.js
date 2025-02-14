import React, { useRef, useState, useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from 'src/utils/jsonData';

export default function IdleComponent() {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const notificationIntervalRef = useRef(null);

  const onIdle = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  useIdleTimer({
    crossTab: true,
    timeout: 10 * 60 * 1000, // 10 minutes
    onIdle: onIdle,
  });

  const refreshToken = async () => {
    try {
      const token = sessionStorage.getItem("Authorization");
      if (!token) {
        throw new Error("No token found.");
      }
  
      const response = await fetch(`${baseUrl}/v1/renew-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to refresh token.");
      }
  
      const data = await response.json();
      if (data.newToken) {
        sessionStorage.setItem("Authorization", data.newToken); // Store new token
        return data.newToken;
      } else {
        throw new Error("New token not received.");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      sessionStorage.clear(); // Clear session if refresh fails
      window.location.href = "/login"; // Redirect to login
      throw error;
    }
  };

  const checkTokenExpiration = () => {
    const token = sessionStorage.getItem("Authorization");
    if (!token) return onIdle(); // No token? Force logout.
  
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      if (Date.now() >= payload.exp * 1000) {
        console.warn("Token expired, attempting refresh...");
        refreshToken().catch(() => onIdle()); // Try to refresh, otherwise log out
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      onIdle(); // If decoding fails, assume it's invalid and log out
    }
  };

  useEffect(() => {
    const interval = setInterval(checkTokenExpiration, 60000); // Check every 60 sec
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const startNotificationInterval = () => {
    notificationIntervalRef.current = setInterval(() => {
      setShowNotification(true);
    }, (5 * 60 - 1) * 1000); // Show notification 1 minute before expiration
  };

  useEffect(() => {
    startNotificationInterval();

    return () => {
      clearInterval(notificationIntervalRef.current);
    };
  }, []);

  return (
    <div>
      {/* {showNotification && (
        <div>
          Your session will expire in 1 minute. Do you want to keep it?
          <button onClick={handleKeepSession}>Keep Session</button>
        </div>
      )} */}
      {/* You can add more content or styling as needed */}
    </div>
  );
}
