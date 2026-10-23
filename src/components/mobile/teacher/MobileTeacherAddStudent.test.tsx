import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { get } from "../../../utils/api/api";
import MobileTeacherAddStudent from "./MobileTeacherAddStudent";
import { classKey } from "../../../utils/roster";
jest.mock("axios");
jest.mock("../../../utils/api/api", () => ({ get: jest.fn() }));
jest.mock("../../../utils/jsonData", () => ({ baseUrl: "http://127.0.0.1:1" }));
jest.mock("./MobileTeacherShell", () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));
const student = {
  firstName: "Synthetic",
  lastName: "Child",
  studentEmail: "student@school.test",
  grade: "8",
};
const overview = {
  teacher: {
    email: "teacher@school.test",
    rosterRevision: 2,
    classes: [{ className: "Math", classPeriod: "period1", classRoster: [] }],
  },
  school: { schoolName: "Testing" },
};
beforeEach(() => {
  jest.clearAllMocks();
  (get as jest.Mock).mockResolvedValue(overview);
  (axios.get as jest.Mock).mockResolvedValue({ data: [student] });
  (axios.post as jest.Mock).mockResolvedValue({ data: { student } });
  (axios.put as jest.Mock).mockResolvedValue({
    data: {
      ...overview.teacher,
      rosterRevision: 3,
      classes: [
        { ...overview.teacher.classes[0], classRoster: [student.studentEmail] },
      ],
    },
  });
});
async function renderNew() {
  render(
    <MemoryRouter>
      <MobileTeacherAddStudent />
    </MemoryRouter>,
  );
  fireEvent.change(await screen.findByLabelText("First name"), {
    target: { value: student.firstName },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: student.lastName },
  });
  fireEvent.change(screen.getByLabelText("Student email"), {
    target: { value: student.studentEmail },
  });
  fireEvent.change(screen.getByLabelText("Grade"), { target: { value: "8" } });
}
test("new student enrollment failure is explicit and retry keeps input", async () => {
  (axios.put as jest.Mock)
    .mockRejectedValueOnce({ response: { status: 409 } })
    .mockResolvedValueOnce({
      data: {
        ...overview.teacher,
        rosterRevision: 3,
        classes: [
          {
            ...overview.teacher.classes[0],
            classRoster: [student.studentEmail],
          },
        ],
      },
    });
  await renderNew();
  fireEvent.click(screen.getByRole("button", { name: "Add student to class" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "enrollment was not confirmed",
  );
  expect(screen.getByLabelText("Student email")).toHaveValue(
    student.studentEmail,
  );
  expect(screen.queryByText("All set")).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Reload classes for retry" }),
  );
  await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole("button", { name: "Add student to class" }));
  expect(await screen.findByText("All set")).toBeInTheDocument();
});
test("existing student enrollment skips account creation and sends expected revision", async () => {
  await renderNew();
  fireEvent.change(screen.getByLabelText("Student option"), {
    target: { value: "existing" },
  });
  fireEvent.change(screen.getByLabelText("Existing student"), {
    target: { value: student.studentEmail },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add student to class" }));
  await screen.findByText("All set");
  expect(axios.post).not.toHaveBeenCalled();
  expect(axios.put).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      expectedRosterRevision: 2,
      createOnly: false,
      classToUpdate: expect.objectContaining({
        classRoster: [student.studentEmail],
      }),
    }),
    expect.anything(),
  );
});
test("failed or invalid creation never attempts enrollment or reports success", async () => {
  (axios.post as jest.Mock).mockResolvedValue({
    data: { error: "synthetic failure", student: null },
  });
  await renderNew();
  fireEvent.click(screen.getByRole("button", { name: "Add student to class" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "creation was not confirmed",
  );
  expect(axios.put).not.toHaveBeenCalled();
});
test("duplicate clicks do not create overlapping requests", async () => {
  (axios.post as jest.Mock).mockReturnValue(new Promise(() => {}));
  await renderNew();
  const submit = screen.getByRole("button", { name: "Add student to class" });
  fireEvent.click(submit);
  fireEvent.click(submit);
  expect(axios.post).toHaveBeenCalledTimes(1);
});
test("class identity includes period and safely handles delimiters", () => {
  expect(classKey({ className: "Math", classPeriod: "1" })).not.toBe(
    classKey({ className: "Math", classPeriod: "2" }),
  );
  expect(classKey({ className: "a|b", classPeriod: "c" })).not.toBe(
    classKey({ className: "a", classPeriod: "b|c" }),
  );
});

test("malformed enrollment success response is not presented as saved enrollment", async () => {
  (axios.put as jest.Mock).mockResolvedValue({ data: {} });
  await renderNew();
  fireEvent.click(screen.getByRole("button", { name: "Add student to class" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "enrollment was not confirmed",
  );
  expect(screen.queryByText("All set")).not.toBeInTheDocument();
});
