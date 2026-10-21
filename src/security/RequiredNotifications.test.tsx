import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RequiredNotifications from "./RequiredNotifications";
jest.mock("../utils/jsonData", () => ({ baseUrl: "http://127.0.0.1:1" }));
jest.mock("../utils/api/http", () => ({}));
const fetchMock=jest.fn();
const notification={ id:"intent-id",event:"CLOSED",state:"UNCERTAIN",actor:"admin@example.test",retrySafe:false,reason:"PROVIDER_UNCERTAIN",recipientOutcomes:{} };
const item={ caseId:"case-id",kind:"punishment",conversationId:"conversation-id",notifications:[notification] };
const reply=(body:object)=>({ok:true,json:async()=>body});
beforeEach(()=>{sessionStorage.clear(); sessionStorage.setItem("Authorization","synthetic-jwt"); sessionStorage.setItem("role","TEACHER"); fetchMock.mockReset(); global.fetch=fetchMock;});
test("uncertain outcomes cannot be retried automatically",async()=>{
  fetchMock.mockResolvedValueOnce(reply({available:true,cases:[item]})); render(<RequiredNotifications/>);
  expect(await screen.findByText("CLOSED")).toBeInTheDocument(); expect(screen.getByText(/Retrying is blocked/)).toBeInTheDocument();
  expect(screen.queryByRole("button",{name:"Queue safe retry"})).not.toBeInTheDocument(); expect(fetchMock).toHaveBeenCalledTimes(1);
});
test("confirmed failure retry queues once and keeps action separate from email",async()=>{
  const failed={...item,notifications:[{...notification,state:"FAILED",retrySafe:true}]};
  fetchMock.mockResolvedValueOnce(reply({available:true,cases:[failed]})).mockResolvedValueOnce(reply({})).mockResolvedValueOnce(reply({available:true,cases:[item]}));
  render(<RequiredNotifications/>); const button=await screen.findByRole("button",{name:"Queue safe retry"}); await waitFor(()=>expect(button).toBeEnabled()); fireEvent.click(button);
  expect(await screen.findByText("Retry queued. No email was sent by this request.")).toBeInTheDocument();
  await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(3)); expect(fetchMock.mock.calls[1][0]).toMatch(/case-id\/intent-id\/retry$/);
});
test("admin resolution needs an explanation and never claims delivery",async()=>{
  sessionStorage.setItem("role","ADMIN"); fetchMock.mockResolvedValueOnce(reply({available:true,cases:[item]})).mockResolvedValueOnce(reply({})).mockResolvedValueOnce(reply({available:true,cases:[]}));
  render(<RequiredNotifications/>); const button=await screen.findByRole("button",{name:"Record external resolution"}); expect(button).toBeDisabled();
  fireEvent.change(screen.getByLabelText("External resolution explanation"),{target:{value:"School verified external communication"}}); fireEvent.click(button);
  expect(await screen.findByText("External resolution recorded. No email was resent.")).toBeInTheDocument();
  await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(3)); expect(JSON.parse(fetchMock.mock.calls[1][1].body).reason).toBe("School verified external communication");
});
test("disabled pipeline has no retry or resolution controls",async()=>{
  fetchMock.mockResolvedValueOnce(reply({available:false,cases:[]})); render(<RequiredNotifications/>);
  expect(await screen.findByText("Managed notifications are not enabled.")).toBeInTheDocument(); expect(screen.queryByRole("button",{name:"Queue safe retry"})).not.toBeInTheDocument();
});
test("students cannot retrieve staff notification status",()=>{
  sessionStorage.setItem("role","STUDENT"); render(<RequiredNotifications/>); expect(fetchMock).not.toHaveBeenCalled(); expect(screen.getByText(/Sign in with your REPS staff account/)).toBeInTheDocument();
});
