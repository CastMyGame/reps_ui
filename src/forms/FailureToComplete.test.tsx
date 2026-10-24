import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import FailureToComplete from "./FailureToComplete";
jest.mock("axios");
jest.mock("../utils/jsonData",()=>({baseUrl:"http://localhost:8080"}));
jest.mock("react-select",()=>({options,onChange}:any)=><select aria-label="Student" onChange={e=>onChange(options.find((o:any)=>o.value===e.target.value))}><option value="">Select</option>{options.map((o:any)=><option key={o.value} value={o.value}>{o.label}</option>)}</select>);
beforeEach(()=>{
  jest.clearAllMocks();jest.spyOn(window,"alert").mockImplementation(()=>{});
  (axios.get as jest.Mock).mockImplementation(async(url:string)=>({data:url.endsWith("allStudents")?[{studentEmail:"student@school.example",firstName:"Synthetic",lastName:"Student"}]:[{punishmentId:"specific-case",studentEmail:"student@school.example",status:"PENDING",timeCreated:new Date(),infractionDescription:["Synthetic work"]}]}));
});
afterEach(()=>jest.restoreAllMocks());
test("staff completion targets the selected case and accepts school identifiers without a legacy TLD restriction",async()=>{
  (axios.post as jest.Mock).mockResolvedValue({data:{}});render(<FailureToComplete />);
  await screen.findByRole("option",{name:/Synthetic Student/});fireEvent.change(screen.getByLabelText("Student"),{target:{value:"student@school.example"}});
  fireEvent.click(await screen.findByRole("button",{name:"Mark Completed"}));
  await waitFor(()=>expect(axios.post).toHaveBeenCalledWith("http://localhost:8080/punish/v1/close/specific-case",null,expect.any(Object)));
  await waitFor(()=>expect(window.alert).toHaveBeenCalled());
});
test("failed completion displays an error and never claims success",async()=>{
  (axios.post as jest.Mock).mockRejectedValue(new Error("synthetic offline"));render(<FailureToComplete />);
  await screen.findByRole("option",{name:/Synthetic Student/});fireEvent.change(screen.getByLabelText("Student"),{target:{value:"student@school.example"}});
  fireEvent.click(await screen.findByRole("button",{name:"Mark Completed"}));
  expect(await screen.findByRole("alert")).toHaveTextContent("Completion was not confirmed");expect(window.alert).not.toHaveBeenCalled();
});
