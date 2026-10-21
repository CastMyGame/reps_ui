import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GmailSettings from "./GmailSettings";
jest.mock("../utils/jsonData", () => ({ baseUrl: "http://127.0.0.1:1" }));
const fetchMock = jest.fn();
const assign = jest.fn();
const connected = { available: true, state: "CONNECTED", connectedEmail: "staff@example.test", authorized: true };
const originalLocation = window.location;
function reply(body: object) { return { ok: true, json: async () => body }; }
function show(path = "/account/gmail") { return render(<MemoryRouter initialEntries={[path]}><GmailSettings /></MemoryRouter>); }
beforeAll(() => { Object.defineProperty(window, "location", { configurable: true, value: { ...originalLocation, assign } }); });
afterAll(() => { Object.defineProperty(window, "location", { configurable: true, value: originalLocation }); });
beforeEach(() => {
  sessionStorage.clear(); sessionStorage.setItem("Authorization", "synthetic-reps-jwt"); sessionStorage.setItem("role", "TEACHER");
  fetchMock.mockReset(); assign.mockReset(); global.fetch = fetchMock;
  Object.defineProperty(window, "crypto", { configurable: true, value: { getRandomValues: (bytes: Uint8Array) => { bytes.fill(7); return bytes; } } });
  jest.spyOn(window.history, "replaceState").mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

test("shows connected email and uses bearer authentication", async () => {
  fetchMock.mockResolvedValueOnce(reply(connected)); show();
  expect(await screen.findByText("Connected email: staff@example.test")).toBeInTheDocument();
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer synthetic-reps-jwt");
});
test("requires explicit confirmation and reports disconnect", async () => {
  fetchMock.mockResolvedValueOnce(reply(connected)).mockResolvedValueOnce(reply({ message: "Gmail disconnected. REPS SMTP selected." })); show();
  fireEvent.click(await screen.findByRole("button", { name: "Disconnect Gmail" }));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Confirm disconnect" }));
  expect(await screen.findByText("Gmail disconnected. REPS SMTP selected.")).toBeInTheDocument();
  expect(fetchMock.mock.calls[1][0]).toMatch(/disconnect$/); expect(sessionStorage.getItem("Authorization")).toBe("synthetic-reps-jwt");
});
test("shows reconnect required without promising silent SMTP fallback", async () => {
  fetchMock.mockResolvedValueOnce(reply({ ...connected, state: "RECONNECT_REQUIRED", authorized: false })); show();
  expect(await screen.findByText("Reconnect required")).toBeInTheDocument(); expect(screen.getByRole("button", { name: "Reconnect Gmail" })).toBeEnabled();
});
test("never connects automatically when connection management is disabled", async () => {
  fetchMock.mockResolvedValueOnce(reply({ available: false, state: "UNAVAILABLE", connectedEmail: "", authorized: false })); show();
  expect(await screen.findByText("Unavailable")).toBeInTheDocument(); expect(screen.queryByRole("button", { name: "Connect Gmail" })).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
test("callback consumes tab proof, cleans the URL, and preserves REPS identity", async () => {
  sessionStorage.setItem("reps.gmail.pending", JSON.stringify({ proof: "p".repeat(43), state: "state", expires: Date.now() + 300000 }));
  fetchMock.mockResolvedValueOnce(reply(connected)); show("/account/gmail/callback?state=state&code=synthetic-code");
  expect(await screen.findByText("Gmail connected. Your REPS login is unchanged.")).toBeInTheDocument();
  const body = JSON.parse(fetchMock.mock.calls[0][1].body); expect(body).toEqual({ state: "state", code: "synthetic-code", browserProof: "p".repeat(43) });
  expect(window.history.replaceState).toHaveBeenCalledWith({}, "", "/account/gmail"); expect(sessionStorage.getItem("reps.gmail.pending")).toBeNull();
  expect(sessionStorage.getItem("Authorization")).toBe("synthetic-reps-jwt"); expect(sessionStorage.getItem("role")).toBe("TEACHER");
});
test("tampered callback is rejected without code exchange", async () => {
  sessionStorage.setItem("reps.gmail.pending", JSON.stringify({ proof: "p".repeat(43), state: "expected", expires: Date.now() + 300000 }));
  fetchMock.mockResolvedValueOnce(reply(connected)); show("/account/gmail/callback?state=tampered&code=synthetic-code");
  expect(await screen.findByText(/belongs to another browser tab/)).toBeInTheDocument(); expect(fetchMock.mock.calls[0][0]).toMatch(/status$/);
  expect(await screen.findByText("Connected email: staff@example.test")).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
test("student or missing login cannot invoke Gmail APIs", async () => {
  sessionStorage.setItem("role", "STUDENT"); show(); expect(screen.getByText(/Sign in with your REPS staff account/)).toBeInTheDocument(); expect(fetchMock).not.toHaveBeenCalled();
});
test("connect stores browser proof and goes only to the Google authorization origin", async () => {
  fetchMock.mockResolvedValueOnce(reply({ ...connected, state: "NEVER_CONNECTED", connectedEmail: "", authorized: false }))
    .mockResolvedValueOnce(reply({ authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth?state=synthetic-state" })); show();
  fireEvent.click(await screen.findByRole("button", { name: "Connect Gmail" }));
  await waitFor(() => expect(assign).toHaveBeenCalled());
  const pending = JSON.parse(sessionStorage.getItem("reps.gmail.pending") || "{}"); expect(pending.proof).toHaveLength(43); expect(pending.state).toBe("synthetic-state");
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ browserProof: pending.proof });
});
