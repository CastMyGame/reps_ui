import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import EditStudentPanel from "./editStudentPanel";
jest.mock("axios");
jest.mock("src/utils/jsonData", () => ({baseUrl:"http://127.0.0.1:1"}));
jest.mock("react-select", () => (props: any) => <button disabled={!props.options.length} onClick={() => props.onChange(props.options[0])}>Select synthetic student</button>);
const child={studentIdNumber:"child",studentEmail:"child@example.test",firstName:"Synthetic",lastName:"Child",profileRevision:2,currency:99,spotters:["teacher@example.test"],guidanceEmail:"guidance@example.test"};
beforeEach(() => { jest.resetAllMocks();sessionStorage.clear();sessionStorage.setItem("role","TEACHER");(axios.get as jest.Mock).mockResolvedValue({data:[child]}); });
test("teacher sees scoped records and cannot edit staff relationships; duplicate clicks send once", async () => {
  let resolve: any;(axios.put as jest.Mock).mockImplementation(() => new Promise(done => {resolve=done;}));
  render(<EditStudentPanel/>);await screen.findByText("Select synthetic student");
  await waitFor(() => expect(screen.getByText("Select synthetic student")).toBeEnabled());fireEvent.click(screen.getByText("Select synthetic student"));
  expect(screen.getByLabelText("Guidance Email")).toBeDisabled();
  fireEvent.change(screen.getByLabelText("First Name"),{target:{value:"Updated"}});
  fireEvent.click(screen.getByRole("button",{name:"Update Student"}));fireEvent.click(screen.getByRole("button",{name:"Update Student"}));
  expect(axios.put).toHaveBeenCalledTimes(1);expect((axios.put as jest.Mock).mock.calls[0][1][0]).not.toHaveProperty("currency");
  resolve({data:[{...child,firstName:"Updated",profileRevision:3}]});await screen.findByText("Student updated successfully.");
});
test("conflict preserves edited input and never reports success",async () => {
  (axios.put as jest.Mock).mockRejectedValue({response:{status:409}});render(<EditStudentPanel/>);
  await waitFor(() => expect(screen.getByText("Select synthetic student")).toBeEnabled());fireEvent.click(screen.getByText("Select synthetic student"));
  await screen.findByLabelText("First Name");fireEvent.change(screen.getByLabelText("First Name"),{target:{value:"Retain me"}});
  fireEvent.click(screen.getByRole("button",{name:"Update Student"}));await screen.findByText(/student changed/i);
  expect(screen.getByLabelText("First Name")).toHaveValue("Retain me");expect(screen.queryByText("Student updated successfully.")).not.toBeInTheDocument();
});
