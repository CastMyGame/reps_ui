import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import HistoricalCases from "./HistoricalCases";
jest.mock("../utils/jsonData", () => ({ baseUrl: "http://127.0.0.1:1" }));
jest.mock("../utils/api/http", () => ({}));
const fetchMock = jest.fn();
beforeEach(() => { sessionStorage.clear(); sessionStorage.setItem("Authorization", "synthetic"); sessionStorage.setItem("role", "TEACHER"); fetchMock.mockReset(); global.fetch = fetchMock; });
test("shows only snapshot facts without live-case actions", async () => {
 fetchMock.mockResolvedValue({ok:true,json:async()=>({available:true,cases:[{caseId:"case-a",kind:"guidance",studentName:"Synthetic Student",infraction:"Guidance",timeCreated:"2026-01-01",capturedAt:"2026-01-01T10:00:00Z",initialDescription:["Original facts"],status:"PRIVATE_LIVE_STATUS",notes:"PRIVATE_LATER_NOTE"}]})});
 render(<HistoricalCases/>); expect(await screen.findByText("Original facts")).toBeInTheDocument();
 expect(screen.queryByText("PRIVATE_LIVE_STATUS")).not.toBeInTheDocument(); expect(screen.queryByText("PRIVATE_LATER_NOTE")).not.toBeInTheDocument();
 expect(screen.queryByRole("button")).not.toBeInTheDocument(); expect(screen.queryByRole("link",{name:/case-a/})).not.toBeInTheDocument();
 expect(fetchMock.mock.calls[0][1].cache).toBe("no-store"); expect(fetchMock).toHaveBeenCalledTimes(1);
});
test.each(["STUDENT", ""]) ("does not fetch for an ineligible role %s", role=>{sessionStorage.setItem("role",role); render(<HistoricalCases/>);expect(fetchMock).not.toHaveBeenCalled();});
test("handles inactive backend without exposing live record controls",async()=>{fetchMock.mockResolvedValue({ok:true,json:async()=>({available:false,cases:[]})});render(<HistoricalCases/>);expect(await screen.findByText("Historical case snapshots are not available for this account.")).toBeInTheDocument();});
test.each([401,403,503])("handles HTTP %s without claiming success",async status=>{fetchMock.mockResolvedValue({ok:false,status});render(<HistoricalCases/>);await waitFor(()=>expect(screen.getByRole("status")).toHaveTextContent(status===401?"Sign in again":status===403?"not authorized":"could not be loaded"));});
