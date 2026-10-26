import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Register from "./Register";
jest.mock("axios");
const post=axios.post as jest.Mock;
beforeEach(()=>jest.clearAllMocks());
function show(){return render(<MemoryRouter><Register /></MemoryRouter>);}
test("registration explains approval without provisioning, checkout, or background lookups",()=>{
  show();expect(screen.getByText(/School activation requires approval/)).toBeInTheDocument();
  expect(screen.getByText(/An inquiry does not create a school or administrator account/)).toBeInTheDocument();
  expect(screen.getByRole("link",{name:"Sign in"})).toHaveAttribute("href","/login");
  expect(screen.queryByRole("button",{name:/checkout|create school|pay/i})).not.toBeInTheDocument();
  expect(axios.get).not.toHaveBeenCalled();expect(post).not.toHaveBeenCalled();
});
test("request access uses only the existing contact endpoint and never creates school, account or subscription",async()=>{
  post.mockResolvedValue({data:{}});show();
  fireEvent.click(screen.getByRole("button",{name:"Contact REPS to request access"}));
  expect(post).not.toHaveBeenCalled();
  fireEvent.mouseDown(screen.getByLabelText("Choose Topic"));
  fireEvent.click(await screen.findByRole("option",{name:"General Inquiry"}));
  fireEvent.change(screen.getByLabelText("Email Address"),{target:{value:"school@example.test"}});
  fireEvent.change(screen.getByPlaceholderText("Enter your message..."),{target:{value:"Synthetic school onboarding inquiry"}});
  fireEvent.click(screen.getByRole("button",{name:"Send Message"}));
  await waitFor(()=>expect(post).toHaveBeenCalledTimes(1));
  expect(post.mock.calls[0][0]).toMatch(/\/contact-us$/);
  expect(post.mock.calls[0][1]).toEqual(expect.objectContaining({email:"school@example.test"}));
});
test("closing contact does not create anything and leaves request-access guidance available",()=>{
  show();fireEvent.click(screen.getByRole("button",{name:"Contact REPS to request access"}));
  fireEvent.click(screen.getByRole("button",{name:"Close"}));
  expect(screen.getByRole("button",{name:"Contact REPS to request access"})).toBeInTheDocument();expect(post).not.toHaveBeenCalled();
});
