import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AssignmentStaffReview from "./AssignmentStaffReview";
import { loadAssignment, changeAssignment, assignmentError } from "../../../utils/api/assignmentLifecycle";
import { api } from "../../../utils/api/http";
jest.mock("../../../utils/api/assignmentLifecycle");jest.mock("../../../utils/api/http",()=>({api:{get:jest.fn()}}));
const load=loadAssignment as jest.Mock, change=changeAssignment as jest.Mock;
function fixture(){return {caseId:"case",caseStatus:"PENDING",available:true,recoveryRequired:false,work:{version:2,state:"SUBMITTED",answers:{q1:{text:"Student response"}},submissions:[],template:{questions:[{id:"q1",prompt:"Reflect"}]}}};}
beforeEach(()=>{
  jest.clearAllMocks();Object.defineProperty(window,"crypto",{configurable:true,value:{randomUUID:()=>"11111111-1111-4111-8111-111111111111"}});
  load.mockResolvedValue(fixture());(api.get as jest.Mock).mockResolvedValue({data:[{id:"original",active:true,infractionName:"Horseplay",level:1}]});
  (assignmentError as jest.Mock).mockImplementation(jest.requireActual("../../../utils/api/assignmentLifecycle").assignmentError);
});
test("staff sees answers and must give rejection feedback",async()=>{
  change.mockResolvedValue(fixture());const saved=jest.fn();render(<AssignmentStaffReview id="case" onClose={jest.fn()} onSaved={saved} />);
  expect(await screen.findByText("Student response")).toBeInTheDocument();const reject=screen.getByRole("button",{name:"Reject for revision"});expect(reject).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Review feedback"),{target:{value:"Explain the impact"}});fireEvent.click(reject);
  await waitFor(()=>expect(change).toHaveBeenCalledWith("case","review",expect.objectContaining({version:2,decision:"REJECT",feedback:"Explain the impact"})));
  await waitFor(()=>expect(saved).toHaveBeenCalledTimes(1));expect(screen.getByRole("status")).toHaveTextContent("Notification delivery is tracked separately");
});
test("authorization denial never claims review success",async()=>{
  change.mockRejectedValue({response:{status:403}});const saved=jest.fn();render(<AssignmentStaffReview id="case" onClose={jest.fn()} onSaved={saved} />);
  fireEvent.click(await screen.findByRole("button",{name:"Accept and close assignment"}));
  expect(await screen.findByRole("alert")).toHaveTextContent("permission");expect(saved).not.toHaveBeenCalled();expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
test("legacy recovery requires intended template, reason, and explicit staff confirmation",async()=>{
  const view:any=fixture();view.available=false;view.recoveryRequired=true;view.caseStatus="OPEN";view.work={version:0,state:"UNAVAILABLE",answers:{},submissions:[],unavailableReason:"Legacy progress needs staff recovery"};load.mockResolvedValue(view);change.mockResolvedValue(view);
  render(<AssignmentStaffReview id="case" onClose={jest.fn()} onSaved={jest.fn()} />);const attach=await screen.findByRole("button",{name:"Attach assignment"});expect(attach).toBeDisabled();
  await screen.findByRole("option",{name:/Horseplay/});fireEvent.change(screen.getByLabelText("Template"),{target:{value:"original"}});
  fireEvent.click(screen.getByRole("checkbox"));expect(attach).toBeDisabled();fireEvent.change(screen.getByLabelText("Recovery explanation"),{target:{value:"Confirmed with student and teacher"}});fireEvent.click(attach);
  await waitFor(()=>expect(change).toHaveBeenCalledWith("case","bind",expect.objectContaining({templateId:"original",confirmRestart:true,feedback:"Confirmed with student and teacher"})));
  await screen.findByRole("status");
});
