// AuthRoute.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const AuthRoute = ({ element, allowedRoles }) => {
  // Your authentication logic here
  const userRoles = sessionStorage.getItem("role")

  if (userRoles.some(role => allowedRoles.includes(role))) {
    // Redirect to login or unauthorized page if not authenticated or doesn't have the required role
    return <Navigate to="/login" />;
  }

  // Render the protected component if authenticated
  return <Route element={element} />;
};

export default AuthRoute;
