import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { ManageSpottersPopup } from "./manageSpottersPopup";
jest.mock("axios");jest.mock("src/utils/jsonData",()=>({baseUrl:"http://127.0.0.1:1"}));
jest.mock("@mui/material",()=>({...jest.requireActual("@mui/material"),Autocomplete:(props:any)=><button disabled={!props.options.length} onClick={()=>props.onChange({},[props.options[0]])}>Select student</button>}));
const child={studentEmail:"child@example.test",firstName:"Synthetic",lastName:"Student",spotters:["teacher@example.test"]};
beforeEach(()=>{jest.resetAllMocks();sessionStorage.clear();sessionStorage.setItem("email","teacher@example.test");(axios.get as jest.Mock).mockImplementation(url=>Promise.resolve({data:url.includes("findBySpotter")?[]:[child]}));jest.spyOn(window,"alert").mockImplementation(()=>{});});
afterEach(()=>jest.restoreAllMocks());
test("duplicate clicks send once and partial result never shows success",async()=>{
  let resolve:any;(axios.put as jest.Mock).mockImplementation(()=>new Promise(done=>{resolve=done;}));
  render(<ManageSpottersPopup contactUsDisplayModal="spotter" setContactUsDisplayModal={jest.fn()}/>);
  await waitFor(()=>expect(screen.getByText("Select student")).toBeEnabled());fireEvent.click(screen.getByText("Select student"));
  fireEvent.click(screen.getByRole("button",{name:"Spot Students"}));fireEvent.click(screen.getByRole("button",{name:"Spot Students"}));expect(axios.put).toHaveBeenCalledTimes(1);
  resolve({data:[]});await screen.findByText(/change was not confirmed/i);expect(window.alert).not.toHaveBeenCalled();expect(screen.getByRole("button",{name:"Spot Students"})).toBeEnabled();
});
test("revoked relationship reports permission denial and retains selection",async()=>{
  (axios.put as jest.Mock).mockRejectedValue({response:{status:403}});render(<ManageSpottersPopup contactUsDisplayModal="spotter" setContactUsDisplayModal={jest.fn()}/>);
  await waitFor(()=>expect(screen.getByText("Select student")).toBeEnabled());fireEvent.click(screen.getByText("Select student"));fireEvent.click(screen.getByRole("button",{name:"Spot Students"}));
  await screen.findByText(/no longer have permission/i);expect(window.alert).not.toHaveBeenCalled();expect(screen.getByRole("button",{name:"Spot Students"})).toBeEnabled();
});
