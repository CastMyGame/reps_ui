import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import ClassUpdate from "./classUpdate";
jest.mock("axios");
jest.mock("src/utils/jsonData", () => ({ baseUrl: "http://127.0.0.1:1" }));
const teacher = () =>
  ({
    email: "teacher@school.test",
    classes: [
      {
        className: "Science",
        classPeriod: "period1",
        classRoster: ["student@school.test"],
        punishmentsThisWeek: 0,
      },
    ],
  }) as any;
beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.setItem("role", "TEACHER");
  sessionStorage.setItem("email", "teacher@school.test");
  sessionStorage.setItem("Authorization", "synthetic-jwt");
  (axios.get as jest.Mock).mockResolvedValue({
    data: [
      {
        studentEmail: "student@school.test",
        firstName: "Synthetic",
        lastName: "Student",
      },
    ],
  });
  jest.spyOn(window, "alert").mockImplementation(() => {});
  jest.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => jest.restoreAllMocks());
test("teacher updates own class using unchanged backend contract", async () => {
  (axios.put as jest.Mock).mockResolvedValue({ data: {} });
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  await screen.findByText("student@school.test");
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await waitFor(() =>
    expect(axios.put).toHaveBeenCalledWith(
      "http://127.0.0.1:1/employees/v1/updateClass/teacher@school.test",
      {
        classToUpdate: {
          className: "Science",
          classPeriod: "period1",
          classRoster: ["student@school.test"],
        },
      },
      { headers: { Authorization: "Bearer synthetic-jwt" } },
    ),
  );
});
test("teacher deletes own class using unchanged backend contract", async () => {
  (axios.post as jest.Mock).mockResolvedValue({ data: {} });
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  await screen.findByText("student@school.test");
  fireEvent.click(screen.getByRole("button", { name: "Delete Class" }));
  await waitFor(() =>
    expect(axios.post).toHaveBeenCalledWith(
      "http://127.0.0.1:1/employees/v1/deleteClass/teacher@school.test",
      expect.objectContaining({
        classToUpdate: expect.objectContaining({ className: "Science" }),
      }),
      expect.anything(),
    ),
  );
});
test("class authorization rejection preserves editing state and explains failure", async () => {
  (axios.put as jest.Mock).mockRejectedValue({ response: { status: 403 } });
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  await screen.findByText("student@school.test");
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Access denied");
  expect(screen.getByText("student@school.test")).toBeInTheDocument();
});
test("roster read failure exits loading and explains permission denial", async () => {
  (axios.get as jest.Mock).mockRejectedValue({ response: { status: 403 } });
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Access denied");
  expect(screen.getByRole("button", { name: "Submit" })).not.toBeDisabled();
});

test("teacher creates a new class with an existing school student", async () => {
  (axios.put as jest.Mock).mockResolvedValue({ data: {} });
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  await screen.findByText("student@school.test");
  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "new" },
  });
  fireEvent.change(screen.getByLabelText("Class Name"), {
    target: { value: "New Science" },
  });
  fireEvent.change(screen.getAllByRole("combobox")[1], {
    target: { value: "period2" },
  });
  const input = screen.getByLabelText("Select or Search for a Student");
  fireEvent.change(input, { target: { value: "Synthetic" } });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.click(
    await screen.findByRole("option", { name: /Synthetic Student/ }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Add Student" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await waitFor(() =>
    expect(axios.put).toHaveBeenCalledWith(
      "http://127.0.0.1:1/employees/v1/updateClass/teacher@school.test",
      {
        classToUpdate: {
          className: "New Science",
          classPeriod: "period2",
          classRoster: ["student@school.test"],
        },
      },
      expect.anything(),
    ),
  );
});
