import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { get } from "../../../utils/api/api";
import MobileTeacherShoutOut from "./MobileTeacherShoutOut";
import { classKey } from "../../../utils/roster";
jest.mock("axios");
jest.mock("../../../utils/api/api", () => ({ get: jest.fn() }));
jest.mock("../../../utils/jsonData", () => ({ baseUrl: "http://127.0.0.1:1" }));
jest.mock("./MobileTeacherShell", () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));
test("same-name classes use the selected period and its students for shout-outs", async () => {
  const classes = [
    {
      className: "Math",
      classPeriod: "period1",
      classRoster: ["first@example.test"],
    },
    {
      className: "Math",
      classPeriod: "period2",
      classRoster: ["second@example.test"],
    },
  ];
  (get as jest.Mock).mockResolvedValue({
    teacher: { email: "teacher@example.test", currency: 10, classes },
  });
  (axios.post as jest.Mock)
    .mockResolvedValueOnce({
      data: [
        { firstName: "First", studentEmail: "first@example.test" },
        { firstName: "Second", studentEmail: "second@example.test" },
      ],
    })
    .mockResolvedValueOnce({ data: [] });
  render(<MobileTeacherShoutOut />);
  fireEvent.change(await screen.findByLabelText("Class"), {
    target: { value: classKey(classes[1]) },
  });
  expect(screen.queryByText("first@example.test")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: /Second/ }));
  fireEvent.click(screen.getByRole("button", { name: "Send shout-out" }));
  await waitFor(() =>
    expect(axios.post).toHaveBeenLastCalledWith(
      expect.stringContaining("/startPunish/formList"),
      [
        expect.objectContaining({
          studentEmail: "second@example.test",
          infractionPeriod: "period2",
        }),
      ],
      expect.anything(),
    ),
  );
  expect(await screen.findByText("Nice work!")).toBeInTheDocument();
});
