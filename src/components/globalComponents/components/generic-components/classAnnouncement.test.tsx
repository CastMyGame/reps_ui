import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import ClassAnnouncement from "./classAnnouncement";
jest.mock("axios");
jest.mock("src/utils/jsonData",()=>({baseUrl:"http://localhost:8080"}));
test("announcement selects the intended period and never claims inbox delivery",async()=>{
  sessionStorage.setItem("email","teacher@example.test");
  const alert=jest.spyOn(window,"alert").mockImplementation(()=>{});
  (axios.post as jest.Mock).mockResolvedValue({data:null});
  render(<ClassAnnouncement setContactUsDisplayModal={jest.fn()} teacher={{classes:[{className:"Math",classPeriod:"1",classRoster:[]},{className:"Math",classPeriod:"2",classRoster:[]}]} as any}/>);
  fireEvent.click(screen.getByRole("checkbox",{name:"Math · 2"}));
  fireEvent.change(screen.getByLabelText("Announcement Subject"),{target:{value:"Reminder"}});
  fireEvent.change(screen.getByLabelText("Announcement Message"),{target:{value:"Bring your book"}});
  fireEvent.click(screen.getByRole("button",{name:"Send"}));
  await waitFor(()=>expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/classAnnouncement"),[expect.objectContaining({className:"Math",classPeriod:"2"})],expect.anything()));
  await waitFor(()=>expect(alert).toHaveBeenCalledWith("Announcement request completed. Inbox delivery is not confirmed."));alert.mockRestore();
});
