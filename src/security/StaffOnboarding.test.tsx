import LandingPage from "../components/globalComponents/updatedLanding/landing";
import MobileLogin from "../components/mobile/MobileLandingLogin";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import MobileCreate from "../components/mobile/admin/MobileAdminCreateStudentTeacherV2";
import AddTeacherForm from "../components/globalComponents/users/addTeacherForm";
import CheckoutSuccess from "./checkoutSuccess";
import ForgotPassword from "./forgotPassword";
import SinglePageSignIn from "./single-page-login";
import { get } from "../utils/api/api";
jest.mock("axios");
jest.mock("../utils/jsonData", () => ({ baseUrl: "http://127.0.0.1:1" }));
jest.mock("../utils/api/api", () => ({
  get: jest.fn(),
  handleLogout: jest.fn(),
}));
const post = axios.post as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  sessionStorage.setItem("role", "ADMIN");
  sessionStorage.setItem("email", "admin@school.test");
  sessionStorage.setItem("Authorization", "synthetic-jwt");
  (get as jest.Mock).mockResolvedValue({ school: { schoolName: "Testing" } });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockReturnValue({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }),
  });
});
function fillTeacher(mobile: boolean) {
  fireEvent.change(
    screen.getByLabelText(mobile ? "First name" : /First Name/),
    { target: { value: "Synthetic" } },
  );
  fireEvent.change(screen.getByLabelText(mobile ? "Last name" : /Last Name/), {
    target: { value: "Teacher" },
  });
  fireEvent.change(
    screen.getByLabelText(mobile ? "Teacher email" : /Email Address/),
    { target: { value: "teacher@school.test" } },
  );
}
async function showMobile() {
  render(
    <MemoryRouter>
      <MobileCreate />
    </MemoryRouter>,
  );
  await screen.findByText("Add a student or teacher");
  fireEvent.click(screen.getByRole("radio", { name: /Teacher/ }));
  fillTeacher(true);
}
test("mobile creation confirms employee body and explains access without sending invitation", async () => {
  post.mockResolvedValue({
    data: { error: "", employee: { email: "teacher@school.test" } },
  });
  await showMobile();
  fireEvent.click(screen.getByRole("button", { name: "Add teacher" }));
  expect(await screen.findByText("Teacher added")).toBeInTheDocument();
  expect(
    screen.getByText(/No password is emailed/),
  ).toBeInTheDocument();
  expect(post).toHaveBeenCalledWith(
    "http://127.0.0.1:1/employees/v1/employees",
    {
      firstName: "Synthetic",
      lastName: "Teacher",
      email: "teacher@school.test",
      school: "Testing",
    },
    { headers: { Authorization: "Bearer synthetic-jwt" } },
  );
});
test("mobile 200 error body is never reported as success", async () => {
  post.mockResolvedValue({ data: { error: "duplicate", employee: null } });
  await showMobile();
  fireEvent.click(screen.getByRole("button", { name: "Add teacher" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/not confirmed/);
  expect(screen.queryByText("Teacher added")).not.toBeInTheDocument();
});
test.each([401, 403, 400, 409])(
  "mobile creation displays %s failure",
  async (status) => {
    post.mockRejectedValue({ response: { status } });
    await showMobile();
    fireEvent.click(screen.getByRole("button", { name: "Add teacher" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("Teacher added")).not.toBeInTheDocument();
  },
);
test("mobile blocks duplicate pending creation", async () => {
  post.mockReturnValue(new Promise(() => {}));
  await showMobile();
  const button = screen.getByRole("button", { name: "Add teacher" });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(post).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: /Saving/ })).toBeDisabled();
});
async function showDesktop() {
  render(
    <AddTeacherForm adminDto={{ school: { schoolName: "Testing" } } as any} />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Click Here/ }));
  fillTeacher(false);
}
test("desktop creation sends actual school and accepts employee response", async () => {
  post.mockResolvedValue({
    data: { error: "", employee: { email: "teacher@school.test" } },
  });
  await showDesktop();
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(await screen.findByText("Teacher Added!")).toBeInTheDocument();
  expect(post.mock.calls[0][1].school).toBe("Testing");
});
test("desktop rejects 200 with missing employee", async () => {
  post.mockResolvedValue({ data: { error: "duplicate", employee: null } });
  await showDesktop();
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(
    await screen.findByText(/Teacher creation was not confirmed/),
  ).toBeInTheDocument();
  expect(screen.queryByText("Teacher Added!")).not.toBeInTheDocument();
});
test("checkout explains activation and first-administrator bootstrap", () => {
  render(
    <MemoryRouter>
      <CheckoutSuccess />
    </MemoryRouter>,
  );
  expect(
    screen.getByText(/Payment does not grant administrator/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /first-administrator setup require approval from the REPS team/,
    ),
  ).toBeInTheDocument();
  expect(post).not.toHaveBeenCalled();
});
test("inactive password setup has useful recovery guidance", async () => {
  post.mockRejectedValue({ response: { status: 400 } });
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText(/Enter email/), {
    target: { value: "teacher@school.test" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(
    await screen.findByText(
      /pending or inactive accounts require school administrator activation/,
    ),
  ).toBeInTheDocument();
});
test("password login accepts canonical school and all staff roles", async () => {
  post.mockResolvedValue({
    data: {
      response: "synthetic-jwt",
      userModel: {
        firstName: "Teacher",
        username: "admin@school.test",
        school: "Testing",
        roles: [{ role: "TEACHER" }, { role: "ADMIN" }],
      },
    },
  });
  render(
    <MemoryRouter>
      <SinglePageSignIn />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText(/Email Address/), {
    target: { value: "admin@school.test" },
  });
  fireEvent.change(screen.getByLabelText(/^Password/), {
    target: { value: "synthetic-password" },
  });
  fireEvent.submit(screen.getByLabelText(/^Password/).closest("form")!);
  await waitFor(() =>
    expect(sessionStorage.getItem("schoolName")).toBe("Testing"),
  );
  expect(sessionStorage.getItem("role")).toBe("ADMIN");
});

test("Google callback preserves canonical school and multiple staff roles without authorizing Gmail", async () => {
  const user = {
    username: "staff@school.test",
    school: "Testing",
    roles: [{ role: "TEACHER" }, { role: "ADMIN" }],
  };
  render(
    <MemoryRouter
      initialEntries={[
        "/login?token=synthetic-oauth-jwt&user=" +
          encodeURIComponent(JSON.stringify(user)),
      ]}
    >
      <LandingPage />
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(sessionStorage.getItem("email")).toBe("staff@school.test"),
  );
  expect(sessionStorage.getItem("role")).toBe("ADMIN");
  expect(sessionStorage.getItem("schoolName")).toBe("Testing");
  expect(sessionStorage.getItem("loginMethod")).toBe("GOOGLE");
  expect(post).not.toHaveBeenCalled();
});
test("mobile password login selects administrator from combined staff roles", async () => {
  (window.matchMedia as jest.Mock).mockReturnValue({ matches: true });
  post.mockResolvedValue({
    data: {
      response: "synthetic-jwt",
      userModel: {
        username: "staff@school.test",
        school: "Testing",
        schoolName: "Stale",
        roles: [{ role: "TEACHER" }, { role: "ADMIN" }],
      },
    },
  });
  render(
    <MemoryRouter>
      <MobileLogin />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Username or email"), {
    target: { value: "staff@school.test" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "synthetic-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
  await waitFor(() => expect(sessionStorage.getItem("schoolName")).toBe("Testing"));
  expect(sessionStorage.getItem("role")).toBe("ADMIN");
});
