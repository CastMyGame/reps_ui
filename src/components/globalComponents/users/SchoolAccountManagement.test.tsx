import axios from "axios";
jest.mock("axios");
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import SchoolAccountManagement from "./SchoolAccountManagement";
import { api } from "../../../utils/api/http";
jest.mock("../../../utils/api/http", () => ({
  api: { get: jest.fn(), put: jest.fn(), post: jest.fn() },
}));
const get = api.get as jest.Mock,
  put = api.put as jest.Mock;
const account = (extra: any = {}) => ({
  id: "teacher-id",
  username: "teacher@school.test",
  firstName: "Test",
  lastName: "Teacher",
  school: "Testing",
  enabled: true,
  roles: [{ role: "TEACHER" }],
  ...extra,
});
beforeEach(() => {
  jest.clearAllMocks();
  (axios.get as jest.Mock).mockResolvedValue({ data: [] });
  sessionStorage.clear();
  sessionStorage.setItem("role", "ADMIN");
  sessionStorage.setItem("email", "admin@school.test");
  jest.spyOn(window, "confirm").mockReturnValue(true);
  get.mockResolvedValue({ data: [account()] });
  put.mockResolvedValue({ status: 204 });
});
afterEach(async () => {
  await act(async () => {});
  jest.restoreAllMocks();
});
test.each(["TEACHER", "GUIDANCE", "STUDENT"])(
  "%s cannot use administration",
  (role) => {
    sessionStorage.setItem("role", role);
    render(<SchoolAccountManagement />);
    expect(screen.getByText(/Only school administrators/)).toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  },
);
test("self has no mutation controls, deletion is absent", async () => {
  get.mockResolvedValue({
    data: [
      account({ username: "ADMIN@school.test", roles: [{ role: "ADMIN" }] }),
    ],
  });
  render(<SchoolAccountManagement />);
  expect(await screen.findByText(/cannot change your own/)).toBeInTheDocument();
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Deactivate|Delete/ }),
  ).not.toBeInTheDocument();
});
test("student roles cannot be converted to staff", async () => {
  get.mockResolvedValue({ data: [account({ roles: [{ role: "STUDENT" }] })] });
  render(<SchoolAccountManagement />);
  expect(await screen.findByText(/cannot be converted/)).toBeInTheDocument();
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});
test("multiple staff roles preserved, explicit save excludes forged role IDs", async () => {
  get.mockResolvedValue({
    data: [account({ roles: [{ role: "TEACHER" }, { role: "GUIDANCE" }] })],
  });
  render(<SchoolAccountManagement />);
  await screen.findByText("teacher@school.test");
  expect(screen.getByRole("checkbox", { name: "GUIDANCE" })).toBeChecked();
  fireEvent.click(screen.getByRole("checkbox", { name: "ADMIN" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Save roles" }));
  });
  await waitFor(() =>
    expect(put).toHaveBeenCalledWith("/users/v1/users/teacher-id/roles", [
      { role: "TEACHER" },
      { role: "GUIDANCE" },
      { role: "ADMIN" },
    ]),
  );
});
test("empty role set cannot be submitted", async () => {
  render(<SchoolAccountManagement />);
  await screen.findByText("teacher@school.test");
  fireEvent.click(screen.getByRole("checkbox", { name: "TEACHER" }));
  expect(screen.getByRole("button", { name: "Save roles" })).toBeDisabled();
});
test.each([
  [true, "Deactivate account", false],
  [false, "Activate account", true],
])(
  "enabled %s accepts 204 and refreshes persisted state",
  async (enabled, label, next) => {
    get
      .mockResolvedValueOnce({ data: [account({ enabled })] })
      .mockResolvedValue({ data: [account({ enabled: next })] });
    render(<SchoolAccountManagement />);
    fireEvent.click(await screen.findByRole("button", { name: label }));
    await waitFor(() =>
      expect(put).toHaveBeenCalledWith("/users/v1/users/teacher-id/enabled", {
        enabled: next,
      }),
    );
    expect(
      await screen.findByText("Account update saved."),
    ).toBeInTheDocument();
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  },
);
test("cancelled confirmation sends nothing", async () => {
  (window.confirm as jest.Mock).mockReturnValue(false);
  render(<SchoolAccountManagement />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Deactivate account" }),
  );
  expect(put).not.toHaveBeenCalled();
});
test("double activation cannot send concurrent mutations", async () => {
  put.mockReturnValue(new Promise(() => {}));
  render(<SchoolAccountManagement />);
  const button = await screen.findByRole("button", {
    name: "Deactivate account",
  });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(put).toHaveBeenCalledTimes(1);
});
test.each([401, 403, 400, 409, 500])(
  "failed mutation %s requires reload before retry",
  async (status) => {
    put.mockRejectedValue({ response: { status } });
    render(<SchoolAccountManagement />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Deactivate account" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Deactivate account" }),
      ).toBeDisabled(),
    );
    await waitFor(() =>
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(1),
    );
    fireEvent.click(screen.getByRole("button", { name: "Reload accounts" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Deactivate account" }),
      ).not.toBeDisabled(),
    );
    expect(put).toHaveBeenCalledTimes(1);
  },
);
test("server load rejection removes account controls", async () => {
  get.mockRejectedValue({ response: { status: 403 } });
  render(<SchoolAccountManagement />);
  expect(await screen.findByText(/Access denied/)).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Activate account" }),
  ).not.toBeInTheDocument();
});

test("staff invitation accepts 202 then shows persisted status", async () => {
  (api.post as jest.Mock).mockResolvedValue({ status: 202 });
  get
    .mockResolvedValueOnce({
      data: [
        account({ passwordSetupRequired: true, invitationStatus: "FAILED" }),
      ],
    })
    .mockResolvedValue({
      data: [
        account({ passwordSetupRequired: true, invitationStatus: "SENT" }),
      ],
    });
  render(<SchoolAccountManagement />);
  const button = await screen.findByRole("button", {
    name: "Send setup invitation",
  });
  await act(async () => {
    fireEvent.click(button);
  });
  expect(api.post).toHaveBeenCalledWith("/accounts/v1/teacher-id/invitation");
  expect(
    await screen.findByText(
      "Setup invitation: Invitation sent (delivery not confirmed)",
    ),
  ).toBeInTheDocument();
  expect(screen.getByText("Pending password setup")).toBeInTheDocument();
});

test("administrator opens the existing class editor for a persisted staff record", async () => {
  get.mockResolvedValueOnce({ data: [account()] }).mockResolvedValueOnce({ data: { email: "teacher@school.test", classes: [], rosterRevision: 4 } });
  render(<SchoolAccountManagement />);
  fireEvent.click(await screen.findByRole("button", { name: "Manage classes" }));
  expect(await screen.findByRole("region", { name: "Teacher class management" })).toBeInTheDocument();
  expect(get).toHaveBeenCalledWith("/employees/v1/employees/email/teacher%40school.test");
});
test("staff class lookup permission failure is shown without opening the editor", async () => {
  get.mockResolvedValueOnce({ data: [account()] }).mockRejectedValueOnce({ response: { status: 403 } });
  render(<SchoolAccountManagement />); fireEvent.click(await screen.findByRole("button", { name: "Manage classes" }));
  expect(await screen.findByText(/Access denied/)).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Teacher class management" })).not.toBeInTheDocument();
});
