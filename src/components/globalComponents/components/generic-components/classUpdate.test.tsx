import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
afterEach(async () => { await act(async () => {}); jest.restoreAllMocks(); });
test("teacher updates own class with a guarded revision", async () => {
  (axios.put as jest.Mock).mockImplementation((_url, payload) => Promise.resolve({ data: { ...teacher(), rosterRevision: 1, classes: [payload.classToUpdate] } }));
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  await screen.findByText(/Synthetic/);
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await waitFor(() =>
    expect(axios.put).toHaveBeenCalledWith(
      "http://127.0.0.1:1/employees/v1/updateClass/teacher@school.test",
      {
        expectedRosterRevision: 0,
        createOnly: false,
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
test("teacher deletes own class with its identity and revision", async () => {
  (axios.post as jest.Mock).mockResolvedValue({ data: { ...teacher(), rosterRevision: 1, classes: [] } });
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  await screen.findByText(/Synthetic/);
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
  await screen.findByText(/Synthetic/);
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Access denied");
  expect(screen.getByText(/student@school.test/)).toBeInTheDocument();
});
test("roster read failure exits loading and explains permission denial", async () => {
  (axios.get as jest.Mock).mockRejectedValue({ response: { status: 403 } });
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Access denied");
  expect(screen.getByRole("button", { name: "Submit" })).not.toBeDisabled();
});

test("teacher creates a new class with an existing school student", async () => {
  (axios.put as jest.Mock).mockImplementation((_url, payload) => Promise.resolve({ data: { ...teacher(), rosterRevision: 1, classes: [payload.classToUpdate] } }));
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  await screen.findByText(/Synthetic/);
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
        expectedRosterRevision: 0,
        createOnly: true,
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


test("same-name classes select and delete only the requested period", async () => {
  const value = teacher();
  value.classes.push({ ...value.classes[0], classPeriod: "period2", classRoster: ["second@school.test"] });
  (axios.post as jest.Mock).mockResolvedValue({ data: { ...value, classes: [value.classes[0]], rosterRevision: 1 } });
  render(<ClassUpdate teacher={value} setPanelName={jest.fn()} />);
  fireEvent.change(screen.getByLabelText("Class"), { target: { value: JSON.stringify(["science", "period2"]) } });
  expect(screen.getByText(/second@school.test/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Delete Class" }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ expectedRosterRevision: 0, classToUpdate: expect.objectContaining({ classPeriod: "period2" }) }), expect.anything()));
});
test("conflicting removal preserves input and never claims success", async () => {
  (axios.put as jest.Mock).mockRejectedValue({ response: { status: 409 } });
  render(<ClassUpdate teacher={teacher()} setPanelName={jest.fn()} />);
  await screen.findByText(/Synthetic/);
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("input is preserved");
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(axios.put).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ classToUpdate: expect.objectContaining({ classRoster: [] }) }), expect.anything());
});

test("a saved roster updates its revision and preserves the chosen class after parent refresh", async () => {
  const original = teacher(); original.classes.push({ ...original.classes[0], classPeriod: "period2" });
  const saved = { ...original, rosterRevision: 1 };
  (axios.put as jest.Mock).mockResolvedValue({ data: saved });
  const callback = jest.fn(); const view = render(<ClassUpdate teacher={original} onUpdated={callback} setPanelName={jest.fn()} />);
  await screen.findByText(/Synthetic/);
  fireEvent.change(screen.getByLabelText("Class"), { target: { value: JSON.stringify(["science", "period2"]) } });
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Roster saved");
  view.rerender(<ClassUpdate teacher={saved} onUpdated={callback} setPanelName={jest.fn()} />);
  expect(screen.getByLabelText("Class")).toHaveValue(JSON.stringify(["science", "period2"]));
  expect(callback).toHaveBeenCalledWith(saved);
});
