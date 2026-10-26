import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import NotesComponent from "./notes";
jest.mock("axios");jest.mock("src/utils/jsonData",()=>({baseUrl:"http://127.0.0.1:1"}));
beforeEach(()=>{jest.resetAllMocks();sessionStorage.clear();sessionStorage.setItem("email","teacher@example.test");sessionStorage.setItem("Authorization","synthetic");});
test("guidance notes use the secured endpoint without supplied authorship and duplicate submits",async()=>{
  let resolve:any;(axios.put as jest.Mock).mockImplementation(()=>new Promise(done=>{resolve=done;}));render(<NotesComponent panelName="overview" activeTask="case" setDisplayModal={jest.fn()} setUpdatePage={jest.fn()}/>);
  fireEvent.change(screen.getByLabelText("Add a note"),{target:{value:"Synthetic note"}});fireEvent.click(screen.getByRole("button",{name:"Submit"}));fireEvent.click(screen.getByRole("button",{name:"Submit"}));
  expect(axios.put).toHaveBeenCalledTimes(1);expect(axios.put).toHaveBeenCalledWith("http://127.0.0.1:1/guidance/v1/guidance/notes/case",{event:"Notes",content:"Synthetic note"},expect.anything());
  resolve({data:null});await screen.findByText(/change was not confirmed/i);expect(screen.queryByText("Notes Has Been Submitted")).not.toBeInTheDocument();expect(screen.getByLabelText("Add a note")).toHaveValue("Synthetic note");
});
test("revoked permission preserves notes and reports a clear error",async()=>{
  (axios.put as jest.Mock).mockRejectedValue({response:{status:403}});render(<NotesComponent panelName="overview" activeTask="case" setDisplayModal={jest.fn()} setUpdatePage={jest.fn()}/>);
  fireEvent.change(screen.getByLabelText("Add a note"),{target:{value:"Retain this note"}});fireEvent.click(screen.getByRole("button",{name:"Submit"}));await screen.findByText(/no longer have permission/i);expect(screen.getByLabelText("Add a note")).toHaveValue("Retain this note");
});
