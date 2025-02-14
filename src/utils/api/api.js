//Centralize Api Here

import axios from "axios";
import { baseUrl } from "../jsonData";

const maxRetries = 5;

//Helper Function to handle common fetch options (headers,auth, etc)
const getHeaders = () => ({
  Authorization: "Bearer " + sessionStorage.getItem("Authorization"),
  "Content-Type": "application/json", // Add any additional headers if needed
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

// Function GET with retry logic
export const get = async (endpoint) => {
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      let headers = getHeaders(); // Get current headers
      const response = await fetch(`${baseUrl}/${endpoint}`, { headers });

      if (response.status === 401 || response.status === 403) {
        console.warn("Token expired, attempting to refresh...");
        const newToken = await refreshToken();
        headers = { ...headers, Authorization: `Bearer ${newToken}` }; // Update headers
        currentRetry++;
        continue; // Retry with updated token
      }

      if (!response.ok) {
        throw new Error(
          `Error making GET Request: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (err) {
      console.error("Error making GET Request: ", err);
      throw err;
    }
  }

  throw new Error("Max retries reached without successful response.");
};
