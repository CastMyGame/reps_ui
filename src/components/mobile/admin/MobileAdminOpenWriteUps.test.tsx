import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import MobileAdminOpenWriteUps from "./MobileAdminOpenWriteUps";
jest.mock("axios");jest.mock("../../../utils/jsonData",()=>({baseUrl:"http://localhost:8080"}));
jest.mock("../../../utils/api/api",()=>({handleLogout:jest.fn()}));
jest.mock("../../globalComponents/referrals/AssignmentStaffReview",()=>({id}:any)=><p>Reviewing assignment {id}</p>);
test("mobile review queue keeps submitted PENDING work and opens the case-specific review",async()=>{
  (axios.get as jest.Mock).mockResolvedValue({data:[{studentFirstName:"Synthetic",studentLastName:"Student",studentEmail:"student@example.test",punishment:{punishmentId:"submitted-case",status:"PENDING",infractionName:"Horseplay",timeCreated:new Date(),infractionDescription:["Synthetic behavior"]}}]});
  render(<MemoryRouter><MobileAdminOpenWriteUps /></MemoryRouter>);
  fireEvent.click(await screen.findByRole("button",{name:/Synthetic Student/}));
  expect(screen.getByText("PENDING")).toBeInTheDocument();fireEvent.click(screen.getByRole("button",{name:"Assignment work"}));
  expect(screen.getByText("Reviewing assignment submitted-case")).toBeInTheDocument();
});
