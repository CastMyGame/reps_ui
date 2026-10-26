import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    .mockResolvedValueOnce({ data: [{ currencyOperationId: "receipt", currencyState: "COMMITTED", teacherCurrency: 9, punishment: { punishmentId: "case", studentEmail: "second@example.test", currencyOperationId: "receipt", currencyAwarded: 1 } }] });
  render(<MobileTeacherShoutOut />);
  fireEvent.change(await screen.findByLabelText("Class"), {
    target: { value: classKey(classes[1]) },
  });
  expect(screen.queryByText("first@example.test")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: /Second/ }));
  fireEvent.change(screen.getByLabelText("What did they do well?"), { target: { value: "Helpful behavior" } });
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

function roster(balance = 10) {
  (get as jest.Mock).mockResolvedValue({ teacher: { email: "teacher@example.test", currency: balance, classes: [{className:"Math", classPeriod:"1", classRoster:["a@example.test", "b@example.test"]}] } });
  (axios.post as jest.Mock).mockResolvedValueOnce({data:[{firstName:"Alpha",studentEmail:"a@example.test"},{firstName:"Beta",studentEmail:"b@example.test"}]});
}
async function selectBoth() {
  fireEvent.click(await screen.findByRole("checkbox",{name:/Alpha/}));fireEvent.click(screen.getByRole("checkbox",{name:/Beta/}));
  fireEvent.change(screen.getByLabelText("What did they do well?"),{target:{value:"Helpful behavior"}});
}
test("mobile validates full cost and preserves input",async()=>{
  roster(3);render(<MobileTeacherShoutOut/>);await selectBoth();
  fireEvent.change(screen.getByLabelText("Points to award"),{target:{value:"2"}});
  expect(screen.getByText(/Total award cost: 4/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Send shout-out to 2 students"}));
  expect(await screen.findByRole("alert")).toHaveTextContent(/total award cost/);expect(axios.post).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText("What did they do well?")).toHaveValue("Helpful behavior");
});
test("rapid submits send only one request and incomplete responses never show success",async()=>{
  roster();let resolve:any;(axios.post as jest.Mock).mockImplementationOnce(()=>new Promise(r=>{resolve=r;}));
  render(<MobileTeacherShoutOut/>);await selectBoth();const button=screen.getByRole("button",{name:"Send shout-out to 2 students"});
  fireEvent.submit(button.closest("form")!);fireEvent.submit(button.closest("form")!);expect(axios.post).toHaveBeenCalledTimes(2);
  await act(async()=>{resolve({data:[]});});expect(await screen.findByRole("alert")).toHaveTextContent(/could not be confirmed/);expect(screen.queryByText("Nice work!")).not.toBeInTheDocument();
});
