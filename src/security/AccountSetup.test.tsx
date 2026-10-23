import { StrictMode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import SetPassword from "./SetPassword";
import StudentAccess from "./StudentAccess";
import { api } from "../utils/api/http";
jest.mock("axios");
jest.mock("../utils/jsonData", () => ({ baseUrl: "http://127.0.0.1:1" }));
jest.mock("../utils/api/http", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));
beforeEach(() => {
  jest.resetAllMocks();
  sessionStorage.clear();
  window.history.replaceState(null, "", "/set-password");
  jest.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => jest.restoreAllMocks());
function passwords() {
  fireEvent.change(screen.getByLabelText(/^New password/), {
    target: { value: "three-private-words" },
  });
  fireEvent.change(screen.getByLabelText(/^Confirm new password/), {
    target: { value: "three-private-words" },
  });
}
test("fragment survives strict rendering, is removed from URL and is sent only in POST body", async () => {
  window.history.replaceState(null, "", "/set-password#synthetic-token");
  (axios.post as jest.Mock).mockResolvedValue({ status: 204 });
  render(
    <StrictMode>
      <SetPassword />
    </StrictMode>,
  );
  expect(window.location.hash).toBe("");
  expect(sessionStorage.length).toBe(0);
  passwords();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Save password" }));
  });
  expect(axios.post).toHaveBeenCalledWith(
    "http://127.0.0.1:1/account-access/complete",
    {
      username: undefined,
      credential: "synthetic-token",
      newPassword: "three-private-words",
    },
  );
  expect(screen.getByText(/Password saved/)).toBeInTheDocument();
  expect(sessionStorage.getItem("Authorization")).toBeNull();
});
test("school credential needs username and never grants a session", async () => {
  (axios.post as jest.Mock).mockResolvedValue({ status: 204 });
  render(<SetPassword />);
  fireEvent.change(screen.getByLabelText(/^REPS username/), {
    target: { value: "school-login-id" },
  });
  fireEvent.change(screen.getByLabelText(/^School setup credential/), {
    target: { value: "ABCD-2345-EFGH" },
  });
  passwords();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Save password" }));
  });
  expect(axios.post).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      username: "school-login-id",
      credential: "ABCD-2345-EFGH",
    }),
  );
  expect(sessionStorage.length).toBe(0);
});
test("expired or used credential gives recovery instructions without leaking provider payload", async () => {
  (axios.post as jest.Mock).mockRejectedValue({
    response: { status: 400, data: "sensitive-internal-reason" },
  });
  window.history.replaceState(null, "", "/set-password#synthetic-token");
  render(<SetPassword />);
  passwords();
  fireEvent.click(screen.getByRole("button", { name: "Save password" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    /expired, used, disabled or out of attempts/,
  );
  expect(
    screen.queryByText("sensitive-internal-reason"),
  ).not.toBeInTheDocument();
});
test("mismatched password never submits", () => {
  render(<SetPassword />);
  fireEvent.change(screen.getByLabelText(/^REPS username/), {
    target: { value: "school-id" },
  });
  fireEvent.change(screen.getByLabelText(/^School setup credential/), {
    target: { value: "ABCD-2345-EFGH" },
  });
  fireEvent.change(screen.getByLabelText(/^New password/), {
    target: { value: "three-private-words" },
  });
  fireEvent.submit(screen.getByLabelText(/^New password/).closest("form")!);
  expect(axios.post).not.toHaveBeenCalled();
});
test.each(["STUDENT", "GUIDANCE"])("%s cannot issue credentials", (role) => {
  sessionStorage.setItem("role", role);
  sessionStorage.setItem("Authorization", "synthetic");
  render(<StudentAccess />);
  expect(screen.getByText(/Sign in as an authorized/)).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});
async function staff() {
  sessionStorage.setItem("role", "TEACHER");
  sessionStorage.setItem("Authorization", "synthetic");
  render(<StudentAccess />);
  fireEvent.change(screen.getByLabelText("Student REPS username"), {
    target: { value: "student@example.test" },
  });
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "I verified this student's identity",
    }),
  );
}
test("teacher handoff needs verification and can be hidden without storage", async () => {
  (api.post as jest.Mock).mockResolvedValue({
    data: {
      username: "student@example.test",
      credential: "ABCD-2345-EFGH",
      expiresAt: "2030-01-01T12:00:00Z",
      maximumAttempts: 5,
    },
  });
  await staff();
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Issue school setup credential" }),
    );
  });
  expect(api.post).toHaveBeenCalledWith(
    "/accounts/v1/students/student%40example.test/setup",
    { identityVerified: true, privateEmailAllowed: false },
  );
  expect(screen.getByText("ABCD-2345-EFGH")).toBeInTheDocument();
  expect(sessionStorage.getItem("credential")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Hide credential" }));
  expect(screen.queryByText("ABCD-2345-EFGH")).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Issue school setup credential" }),
  ).toBeDisabled();
});
test("email option requires independent mailbox verification and shows actual backend status", async () => {
  (api.post as jest.Mock).mockResolvedValue({ status: 202 });
  (api.get as jest.Mock).mockResolvedValue({
    data: { invitationStatus: "DELIVERY_UNCONFIRMED" },
  });
  await staff();
  expect(
    screen.getByRole("button", { name: "Email setup link" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("checkbox", { name: /independently controls/ }),
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Email setup link" }));
  });
  expect(api.post).toHaveBeenCalledWith(
    "/accounts/v1/students/student%40example.test/invitation",
    { identityVerified: true, privateEmailAllowed: true },
  );
  expect(
    screen.getByText(/Invitation status: Delivery unconfirmed/),
  ).toBeInTheDocument();
  expect(
    screen.queryByLabelText("Private student handoff"),
  ).not.toBeInTheDocument();
});
test("authorization failure does not display a credential", async () => {
  (api.post as jest.Mock).mockRejectedValue({ response: { status: 403 } });
  await staff();
  fireEvent.click(
    screen.getByRole("button", { name: "Issue school setup credential" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(/Access denied/);
  expect(
    screen.queryByLabelText("Private student handoff"),
  ).not.toBeInTheDocument();
});
