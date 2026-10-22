import axios from "axios";
import { handleLogout } from "./api";

jest.mock("axios");
jest.mock("../jsonData", () => ({ baseUrl: "https://backend.example.test" }));
const originalLocation = window.location;
beforeAll(() => Object.defineProperty(window, "location", { configurable: true, value: { href: "" } }));
afterAll(() => Object.defineProperty(window, "location", { configurable: true, value: originalLocation }));
beforeEach(() => { sessionStorage.clear(); jest.resetAllMocks(); });
test.each([true, false])("logout stays on the current frontend even when API success=%s", async success => {
  sessionStorage.setItem("Authorization", "synthetic-session");
  if (success) (axios.post as jest.Mock).mockResolvedValue({});
  else (axios.post as jest.Mock).mockRejectedValue(new Error("synthetic failure"));
  await handleLogout();
  expect(window.location.href).toBe("/login");
  expect(sessionStorage.getItem("Authorization")).toBeNull();
  expect(axios.post).toHaveBeenCalledWith("https://backend.example.test/v1/logout", [], expect.any(Object));
});
