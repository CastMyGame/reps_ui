import { resolveApiOrigin } from "./apiOrigin";

export const baseUrl = resolveApiOrigin(process.env.REACT_APP_API_BASE_URL, window.location.hostname);
