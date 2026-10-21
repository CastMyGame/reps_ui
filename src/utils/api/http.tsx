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

// Stable ids survive a failed HTTP response; successful actions release the key for a new deliberate action.
export async function attachDisciplinaryActionId(config: any) {
  const method = String(config.method || "get").toLowerCase();
  const path = String(config.url || "");
  const disciplinary = /\/punish\/v1\/(startPunish\/|punishId\/close|close\/|rejected\/|archived\/)|\/officeReferral\/v1\/(startPunish\/|closeId|submit\/|rejected\/)|\/guidance\/v1\/guidance\/resources\//.test(path);
  if (!disciplinary || !["post", "put", "patch"].includes(method)) return config;
  config.headers = config.headers || {};
  if (config.headers["X-REPS-Action-Id"]) return config;
  const body = typeof config.data === "string" ? config.data : JSON.stringify(config.data ?? null);
  const fingerprint = new TextEncoder().encode(`${sessionStorage.getItem("email")}|${method}|${path}|${body}`);
  const digest = await crypto.subtle.digest("SHA-256", fingerprint);
  const key = "reps.action." + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  let pending: { id: string } | null = null;
  try { pending = JSON.parse(sessionStorage.getItem(key) || "null"); } catch { /* Replace malformed local state. */ }
  if (!pending) {
    pending = { id: crypto.randomUUID() };
    sessionStorage.setItem(key, JSON.stringify(pending));
  }
  config.headers["X-REPS-Action-Id"] = pending.id;
  config.__repsActionKey = key;
  return config;
}
export function completeDisciplinaryAction(response: any) {
  if (response.config?.__repsActionKey) {
    sessionStorage.removeItem(response.config.__repsActionKey);
    window.dispatchEvent(new Event("reps:disciplinary-action-saved"));
  }
  return response;
}
for (const client of [axios, api]) {
  client.interceptors?.request?.use(attachDisciplinaryActionId);
  client.interceptors?.response?.use(completeDisciplinaryAction);
}
