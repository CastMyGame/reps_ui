// AuthRoute.js
import React from 'react';
import { BrowserRouter as Outlet, Navigate } from 'react-router-dom';

const AuthRoute = ({ allowedRoles }) => {
  const userRoles = JSON.parse(sessionStorage.getItem("role") || "[]");

  return userRoles.some(role => allowedRoles.includes(role)) ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

export default AuthRoute;
