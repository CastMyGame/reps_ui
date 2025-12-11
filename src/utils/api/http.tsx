import axios from "axios";
import { baseUrl } from "../jsonData";

const API_BASE_URL = baseUrl || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // if you use cookies/session
});

// Attach Authorization header from sessionStorage for every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("Authorization");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
