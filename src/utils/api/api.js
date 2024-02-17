//Centralize Api Here

import axios from "axios";
import { baseUrl } from "../jsonData";

const maxRetries = 5;


//Helper Function to handle common fetch options (headers,auth, etc)
const getHeaders = () => ({
    Authorization: 'Bearer ' + sessionStorage.getItem("Authorization"),
    'Content-Type': 'application/json', // Add any additional headers if needed
  });


  const refreshToken = async () => {
    try {

 
    } catch (refreshError) {
      console.error('Error refreshing token:', refreshError);
      throw refreshError; // Propagate the error for further handling
    }
  };

// Function GET with retry logic
export const get = async (endpoint) => {
    let currentRetry = 0;
  
    while (currentRetry < maxRetries) {
      try {
        const response = await fetch(`${baseUrl}/${endpoint}`, {
          headers: getHeaders(),
        });
  
        if (response.status === 403) {
          // Token might have expired, try refreshing the token
          await refreshToken();
          currentRetry++;
        } else if (!response.ok) {
          throw new Error(`Error making GET Request: ${response.status} ${response.statusText}`);
        } else {
          return await response.json();
        }
      } catch (err) {
        console.error('Error making GET Request: ', err);
        throw err;
      }
    }
  
    // If max retries reached without success, throw an error
    throw new Error('Max retries reached without successful response.');
  };// Function to make a POST request


