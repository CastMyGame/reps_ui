import React, { useRef, useState, useEffect } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkSessionExpiration } from "../utils/api/session";

export default function IdleComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotification, setShowNotification] = useState(false);

  // Correct type for notificationIntervalRef
  const notificationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/sign-up" ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/set-password" ||
    location.pathname === "/privacy-policy" ||
    location.pathname.startsWith("/checkout/") ||
    location.pathname === "/student-login";

  const onIdle = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  useIdleTimer({
    crossTab: true,
    timeout: 10 * 60 * 1000, // 10 minutes
    onIdle: () => {
      const token = sessionStorage.getItem("Authorization");
      if (!token) return; // not logged in -> ignore
      onIdle();
    },
  });

  const checkTokenExpiration = () => {
    if (isPublicRoute) return;
    // Authentication failures are handled centrally. Keep the session on 403/network/5xx.
    void checkSessionExpiration().catch(() => {});
  };

  useEffect(() => {
    const interval = setInterval(checkTokenExpiration, 60000); // Check every 60 sec
    return () => clearInterval(interval); // Cleanup on unmount
  }, [isPublicRoute]);

  const startNotificationInterval = () => {
    notificationIntervalRef.current = setInterval(() => {
      setShowNotification(true);
    }, (5 * 60 - 1) * 1000); // Show notification 1 minute before expiration
  };

  useEffect(() => {
    // ✅ notifications only matter when logged in, and not on public routes
    if (isPublicRoute) return;

    notificationIntervalRef.current = setInterval(() => {
      setShowNotification(true);
    }, (5 * 60 - 1) * 1000);

    return () => {
      if (notificationIntervalRef.current) clearInterval(notificationIntervalRef.current);
    };
  }, [isPublicRoute]);

  return (
    <div  />
  );
}
