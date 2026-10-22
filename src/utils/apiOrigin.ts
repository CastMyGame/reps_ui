/** Fixed deployment fallback; URL parameters never select an API or OAuth target. */
export function resolveApiOrigin(configured: string | undefined, hostname: string): string {
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  const value = configured?.trim() || (local ? "http://localhost:8080" :
    hostname === "repsdev.vercel.app" ? "https://repsdev31.ue.r.appspot.com" : "");
  if (!value) throw new Error("REACT_APP_API_BASE_URL must specify the deployed HTTPS backend origin");
  const url = new URL(value);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (url.protocol !== "https:" && !(local && loopback && url.protocol === "http:")) ||
      (!local && loopback)) {
    throw new Error("REACT_APP_API_BASE_URL must be a safe backend origin");
  }
  return url.origin;
}
