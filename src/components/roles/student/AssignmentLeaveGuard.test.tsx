import { act, fireEvent, render, screen } from "@testing-library/react";
import StudentDashboard from "./DashboardStudent ";
import { get, handleLogout } from "../../../utils/api/api";
jest.mock("../../../utils/api/api",()=>({get:jest.fn(),handleLogout:jest.fn()}));
const mockSave=jest.fn();
jest.mock("src/components/globalComponents/updatedLanding/navigation-student",()=>({setLogin,setPanelName}:any)=><nav><button onClick={setLogin}>Sign out</button><button onClick={()=>setPanelName("closedAssignments")}>Other panel</button></nav>);
jest.mock("src/components/roles/student/studentOpenPunishmentPanel",()=>({handleStartAssignment}:any)=><button onClick={()=>handleStartAssignment({punishmentId:"case"})}>Open work</button>);
jest.mock("src/forms/ViolationPage",()=>{
  const React=require("react");
  return function MockAssignment({onDirtyChange,onSaveReady}:any){
    React.useEffect(()=>{onDirtyChange(true);onSaveReady(()=>mockSave());return()=>{onSaveReady(undefined);onDirtyChange(false);};},[onDirtyChange,onSaveReady]);
    return <p>Assignment open</p>;
  };
});
jest.mock("src/components/notification-bar/NotificationBar",()=>()=>null);
jest.mock("src/components/globalComponents/shoutOutWidget",()=>()=>null);
jest.mock("src/components/globalComponents/users/positivePointsComponents",()=>()=>null);
jest.mock("../../globalComponents/dataDisplay/studentReferralsByBehavior",()=>()=>null);
jest.mock("src/components/globalComponents/dataDisplay/studentReferralsPieChart",()=>()=>null);
beforeEach(()=>{
  jest.clearAllMocks();sessionStorage.clear();sessionStorage.setItem("Authorization","synthetic-jwt");
  (get as jest.Mock).mockResolvedValue({punishments:[],officeReferrals:[],student:{firstName:"Synthetic"},school:{}});
});
test("sign-out preserves authentication until the unsaved assignment successfully saves",async()=>{
  render(<StudentDashboard />);fireEvent.click(await screen.findByRole("button",{name:"Open work"}));await screen.findByText("Assignment open");
  mockSave.mockResolvedValue(false);await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"Sign out"}));});
  expect(mockSave).toHaveBeenCalledTimes(1);expect(handleLogout).not.toHaveBeenCalled();
  mockSave.mockResolvedValue(true);await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"Sign out"}));});
  expect(handleLogout).toHaveBeenCalledTimes(1);
});
test("in-app navigation stays on the assignment after a failed save",async()=>{
  render(<StudentDashboard />);fireEvent.click(await screen.findByRole("button",{name:"Open work"}));await screen.findByText("Assignment open");
  mockSave.mockResolvedValue(false);await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"Other panel"}));});
  expect(screen.getByText("Assignment open")).toBeInTheDocument();
  mockSave.mockResolvedValue(true);await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"Other panel"}));});
  expect(screen.queryByText("Assignment open")).not.toBeInTheDocument();
});
