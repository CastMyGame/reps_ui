//Centralize Api Here

import axios from "axios";
import { Navigate } from "react-router-dom";
import { baseUrl } from "../jsonData";

import { expireSessionIfCurrent, SessionRequestError, waitForPendingRenewal } from "./session";

//Helper Function to handle common fetch options (headers,auth, etc)
const getHeaders = () => ({
  Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  "Content-Type": "application/json", // Add any additional headers if needed
});

// Retry a GET only when a concurrent renewal has already replaced its rejected token.
export const get = async (endpoint: string) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    const sentToken = sessionStorage.getItem("Authorization");
    const response = await fetch(`${baseUrl}/${endpoint}`, { headers: getHeaders() });
    if (response.status === 401) {
      await waitForPendingRenewal();
      const current = sessionStorage.getItem("Authorization");
      if (attempt === 0 && current && current !== sentToken) continue;
      expireSessionIfCurrent(sentToken);
      throw new SessionRequestError(401);
    }
    if (!response.ok) throw new SessionRequestError(response.status);
    return response.json();
  }
  throw new SessionRequestError(401);
};

export interface AuthCapabilities {
  loginMethod: "GOOGLE" | "PASSWORD" | string;
  userEmail: string;
  emailProvider: "GOOGLE_GMAIL" | "REPS_SMTP" | string;
  emailPermission: "GRANTED" | "NOT_GRANTED" | "NOT_AVAILABLE" | string;
  canSendAsUser: boolean;
}

export const getAuthCapabilities = async (): Promise<AuthCapabilities> => {
  const response = await fetch(`${baseUrl}/auth/capabilities`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Unable to determine email capabilities (${response.status})`);
  }

  return (await response.json()) as AuthCapabilities;
};

export const handleLogout = async () => {
  const headers = {
    Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  };
  try {
    await axios.post(`${baseUrl}/v1/logout`, [], { headers });
    clearSessionStorage();
    window.location.href = "/login";
  } catch {
    //for edge case where app is restared while in session, so log out still happens
    clearSessionStorage();
    window.location.href = "/login";
  }
};

const clearSessionStorage = () => {
  ["Authorization", "userName", "schoolName", "email", "role", "loginMethod"].forEach(
    (key) => {
      sessionStorage.removeItem(key);
    }
  );
};

interface AuthRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
  userRole: string;
}

const AuthRoute = ({ children, allowedRoles, userRole }: AuthRouteProps) => {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthRoute;
