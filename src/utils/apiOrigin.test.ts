import { resolveApiOrigin } from "./apiOrigin";

test("deployed dev without a build variable uses the verified App Engine origin", () => {
  expect(resolveApiOrigin(undefined, "repsdev.vercel.app")).toBe("https://repsdev31.ue.r.appspot.com");
});
test.each(["localhost", "127.0.0.1", "[::1]"])("local login stays local on %s", hostname => {
  expect(resolveApiOrigin(undefined, hostname)).toBe("http://localhost:8080");
});
test("existing explicit HTTPS backend configuration takes precedence", () => {
  expect(resolveApiOrigin("https://backend.example.test/", "repsdev.vercel.app")).toBe("https://backend.example.test");
});
test("unconfigured unknown deployments fail instead of sending users to localhost", () => {
  expect(() => resolveApiOrigin(undefined, "preview.example.test")).toThrow("REACT_APP_API_BASE_URL");
});
test.each(["http://localhost:8080", "https://localhost:8080", "http://backend.example.test",
  "//attacker.example.test", "https://user:password@backend.example.test", "https://backend.example.test/?redirect=https://attacker.example.test",
  "https://backend.example.test/#fragment", "https://backend.example.test/path"])("rejects unsafe deployed API configuration %s", value => {
  expect(() => resolveApiOrigin(value, "repsdev.vercel.app")).toThrow();
});
