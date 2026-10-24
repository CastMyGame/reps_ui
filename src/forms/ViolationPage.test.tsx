import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ViolationPage from "./ViolationPage";
import StudentOpenPunishmentPanel from "../components/roles/student/studentOpenPunishmentPanel";
import MobileStudentHome from "../components/mobile/student/MobileStudentHome";
import { MemoryRouter } from "react-router-dom";
import { get } from "../utils/api/api";
import { loadAssignment, changeAssignment, assignmentError } from "../utils/api/assignmentLifecycle";
jest.mock("../utils/api/assignmentLifecycle");
jest.mock("../utils/api/http",()=>({api:{get:jest.fn(),put:jest.fn()}}));
jest.mock("../utils/api/api",()=>({get:jest.fn(),handleLogout:jest.fn()}));
jest.mock("../components/globalComponents/EmailCapabilityIndicator",()=>()=>null);
const load = loadAssignment as jest.Mock, change = changeAssignment as jest.Mock;
const assignment: any = { punishmentId: "case", infractionName: "Horseplay", infractionLevel: "1", mapIndex: 0 };
function fixture() { return { caseId: "case", caseStatus: "OPEN", available: true, recoveryRequired: false, work: {
  version: 0, state: "ASSIGNED", answers: {}, currentQuestionId: "q1", submissions: [], template: {
    id: "original", infractionName: "Horseplay", level: 1, questions: [
      { id: "q1", type: "EXPLORATORY_OPEN", prompt: "Describe what happened", required: true },
      { id: "q2", type: "EXPLORATORY_OPEN", prompt: "How will you respond next time", required: true },
    ],
  },
} }; }
beforeEach(() => {
  jest.clearAllMocks(); sessionStorage.clear();sessionStorage.setItem("email","student@example.test");
  Object.defineProperty(window,"crypto",{ configurable:true, value:{ randomUUID:jest.fn(() => "11111111-1111-4111-8111-111111111111") } });
  (assignmentError as jest.Mock).mockImplementation(jest.requireActual("../utils/api/assignmentLifecycle").assignmentError);
  load.mockResolvedValue(fixture());
  change.mockImplementation(async (_id, op, command) => {
    const saved:any=fixture();saved.work.version=command.version+1;saved.work.answers=command.answers;saved.work.currentQuestionId=command.currentQuestionId;
    if(op==="submit"){saved.work.state="SUBMITTED";saved.caseStatus="PENDING";}
    return saved;
  });
});
afterEach(() => jest.useRealTimers());
test("save and next persists answers and resume position together, and refresh reloads both", async () => {
  const mounted=render(<ViolationPage assignment={assignment} />);
  fireEvent.change(await screen.findByLabelText(/Describe what happened/),{target:{value:"A considered response"}});
  fireEvent.click(screen.getByRole("button",{name:"Save and next question"}));
  await waitFor(() => expect(change).toHaveBeenCalledWith("case","save",expect.objectContaining({version:0,currentQuestionId:"q2",answers:{q1:{text:"A considered response"}}})));
  await screen.findByLabelText(/How will you respond next time/);
  const saved:any=fixture();saved.work.version=1;saved.work.answers={q1:{text:"A considered response"}};saved.work.currentQuestionId="q2";
  load.mockResolvedValue(saved);mounted.unmount();render(<ViolationPage assignment={assignment} />);
  await screen.findByLabelText(/How will you respond next time/);
  fireEvent.change(screen.getByLabelText("Question"),{target:{value:"q1"}});
  expect(screen.getByLabelText(/Describe what happened/)).toHaveValue("A considered response");
});
test("typing autosaves a complete draft after the debounce", async () => {
  render(<ViolationPage assignment={assignment} />);const input=await screen.findByLabelText(/Describe what happened/);
  jest.useFakeTimers();fireEvent.change(input,{target:{value:"Draft response"}});
  await act(async()=>{jest.advanceTimersByTime(800);});
  expect(change).toHaveBeenCalledWith("case","save",expect.objectContaining({answers:{q1:{text:"Draft response"}}}));
});
test("interrupted save preserves typed input and retries the same action", async () => {
  change.mockRejectedValueOnce(new Error("offline"));render(<ViolationPage assignment={assignment} />);
  const input=await screen.findByLabelText(/Describe what happened/);fireEvent.change(input,{target:{value:"Keep my draft"}});
  fireEvent.click(screen.getByRole("button",{name:"Save progress"}));await screen.findByRole("alert");
  expect(input).toHaveValue("Keep my draft");expect(screen.getByText(/Unsaved changes/)).toBeInTheDocument();
  const first=change.mock.calls[0][2];fireEvent.click(screen.getByRole("button",{name:"Save progress"}));
  await waitFor(()=>expect(change).toHaveBeenCalledTimes(2));expect(change.mock.calls[1][2]).toEqual(first);
  await screen.findByText(/Saved ·/);
});
test("server validation failure never displays submission success", async () => {
  change.mockRejectedValue({response:{status:400,data:"Complete every required question"}});
  render(<ViolationPage assignment={assignment} />);await screen.findByLabelText(/Describe what happened/);
  fireEvent.click(screen.getByRole("button",{name:"Submit assignment"}));
  expect(await screen.findByRole("alert")).toHaveTextContent("Complete every required question");
  expect(screen.queryByText(/Assignment submitted/)).not.toBeInTheDocument();
});
test("a late autosave response cannot overwrite text entered while saving", async () => {
  let finish:any;change.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  render(<ViolationPage assignment={assignment} />);const input=await screen.findByLabelText(/Describe what happened/);
  fireEvent.change(input,{target:{value:"First draft"}});fireEvent.click(screen.getByRole("button",{name:"Save progress"}));
  expect(input).toBeEnabled();fireEvent.change(input,{target:{value:"Newer draft while saving"}});
  const saved:any=fixture();saved.work.version=1;saved.work.answers={q1:{text:"First draft"}};
  await act(async()=>finish(saved));expect(input).toHaveValue("Newer draft while saving");expect(screen.getByText(/Unsaved changes/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Save progress"}));await waitFor(()=>expect(change).toHaveBeenCalledTimes(2));
  expect(change.mock.calls[1][2]).toEqual(expect.objectContaining({version:1,answers:{q1:{text:"Newer draft while saving"}}}));
  await screen.findByText(/Saved ·/);
});
test("successful submission waits for the server, is single-flight, and shows pending review", async () => {
  let finish:any;change.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  render(<ViolationPage assignment={assignment} />);await screen.findByLabelText(/Describe what happened/);
  const button=screen.getByRole("button",{name:"Submit assignment"});fireEvent.click(button);fireEvent.click(button);
  expect(change).toHaveBeenCalledTimes(1);expect(screen.queryByText(/Assignment submitted/)).not.toBeInTheDocument();
  const saved:any=fixture();saved.work.state="SUBMITTED";saved.caseStatus="PENDING";
  await act(async()=>finish(saved));expect(screen.getByText(/Assignment submitted/)).toBeInTheDocument();expect(button).toBeDisabled();
});
test("navigation save does not permit leaving when the student types newer answers during the request", async () => {
  let finish:any, save:(()=>Promise<boolean>)|undefined, result:Promise<boolean>|undefined;
  change.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  const ready=(callback?:()=>Promise<boolean>)=>{save=callback;};
  render(<ViolationPage assignment={assignment} onSaveReady={ready} />);
  const input=await screen.findByLabelText(/Describe what happened/);
  fireEvent.change(input,{target:{value:"First draft"}});
  act(()=>{result=save!();});
  fireEvent.change(input,{target:{value:"New answer before leaving"}});
  const saved:any=fixture();saved.work.version=1;saved.work.answers={q1:{text:"First draft"}};
  await act(async()=>finish(saved));
  expect(await result).toBe(false);expect(input).toHaveValue("New answer before leaving");
});
test("rejected work reloads previous responses and feedback for revision", async () => {
  const saved:any=fixture();saved.work.state="REJECTED";saved.work.feedback="Explain the effect on others";saved.work.answers={q1:{text:"Previous answer"}};
  load.mockResolvedValue(saved);render(<ViolationPage assignment={assignment} />);
  expect(await screen.findByLabelText(/Describe what happened/)).toHaveValue("Previous answer");expect(screen.getByText("Explain the effect on others")).toBeInTheDocument();
});
test("a conflict preserves the draft and requires confirmed reload", async () => {
  change.mockRejectedValue({response:{status:409}});jest.spyOn(window,"confirm").mockReturnValue(false);
  render(<ViolationPage assignment={assignment} />);const input=await screen.findByLabelText(/Describe what happened/);
  fireEvent.change(input,{target:{value:"My conflicting draft"}});fireEvent.click(screen.getByRole("button",{name:"Save progress"}));await screen.findByRole("alert");
  expect(input).toHaveValue("My conflicting draft");fireEvent.click(screen.getByRole("button",{name:"Reload saved assignment"}));expect(input).toHaveValue("My conflicting draft");
  (window.confirm as jest.Mock).mockReturnValue(true);const latest:any=fixture();latest.work.version=2;latest.work.answers={q1:{text:"Server winner"}};load.mockResolvedValue(latest);
  fireEvent.click(screen.getByRole("button",{name:"Reload saved assignment"}));await waitFor(()=>expect(input).toHaveValue("Server winner"));jest.restoreAllMocks();
});
test("unsaved tab draft survives refresh without becoming a false saved state", async () => {
  sessionStorage.setItem("reps.assignment.draft.student@example.test.case",JSON.stringify({version:0,answers:{q1:{text:"Recovered local draft"}},questionId:"q1"}));
  render(<ViolationPage assignment={assignment} />);expect(await screen.findByLabelText(/Describe what happened/)).toHaveValue("Recovered local draft");
  expect(screen.getByRole("alert")).toHaveTextContent(/unsaved draft was recovered/);expect(change).not.toHaveBeenCalled();
});
test("unavailable assignments give an actionable message with no submission control", async () => {
  const saved:any=fixture();saved.available=false;saved.work.unavailableReason="Staff must attach the intended template";load.mockResolvedValue(saved);
  render(<ViolationPage assignment={assignment} />);expect(await screen.findByRole("alert")).toHaveTextContent("Staff must attach the intended template");
  expect(screen.queryByRole("button",{name:"Submit assignment"})).not.toBeInTheDocument();
});
test("a loading failure can be retried without reloading the application",async()=>{
  load.mockRejectedValueOnce(new Error("offline"));render(<ViolationPage assignment={assignment} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not load this assignment");
  fireEvent.click(screen.getByRole("button",{name:"Retry loading"}));await screen.findByLabelText(/Describe what happened/);
});
test("office referral never loads or offers student assignment submission", () => {
  render(<ViolationPage assignment={{officeReferralId:"office",referralCode:{codeName:"Synthetic"}} as any} />);
  expect(screen.getByRole("status")).toHaveTextContent(/principal/);expect(load).not.toHaveBeenCalled();
});
test("student referral list labels office cases as principal-handled", () => {
  render(<StudentOpenPunishmentPanel listOfReferrals={[{officeReferralId:"office",studentEmail:"student@example.test",status:"OPEN",timeCreated:new Date(),referralDescription:["Synthetic"]} as any]} listOfPunishments={[]} handleStartAssignment={jest.fn()} />);
  expect(screen.getByText(/Principal review/)).toBeInTheDocument();expect(screen.queryByRole("button",{name:"Start Assignment"})).not.toBeInTheDocument();
});
test("mobile home does not count an office referral as student assignment work",async()=>{
  (get as jest.Mock).mockResolvedValue({student:{firstName:"Synthetic"},punishments:[],officeReferrals:[{officeReferralId:"office",status:"OPEN"}]});
  render(<MemoryRouter><MobileStudentHome /></MemoryRouter>);
  expect(await screen.findByText(/Office referrals are handled by the principal/)).toBeInTheDocument();
  expect(screen.queryByRole("button",{name:"Open"})).not.toBeInTheDocument();expect(screen.getByText("You’re all caught up")).toBeInTheDocument();
});
