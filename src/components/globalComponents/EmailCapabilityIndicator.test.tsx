import { render, screen, waitFor } from "@testing-library/react";
import EmailCapabilityIndicator from "./EmailCapabilityIndicator";
import { getAuthCapabilities } from "../../utils/api/api";

jest.mock("../../utils/api/api", () => ({ getAuthCapabilities: jest.fn() }));
const capabilities = getAuthCapabilities as jest.Mock;
beforeEach(() => capabilities.mockReset());

test("a verified SMTP route is shown as the REPS service", async () => {
  capabilities.mockResolvedValue({ emailProvider: "REPS_SMTP", canSendAsUser: false });
  render(<EmailCapabilityIndicator />);
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Outbound notifications will be sent through the REPS service account."));
});

test("authorized Gmail is shown independently of password login", async () => {
  capabilities.mockResolvedValue({ loginMethod: "PASSWORD", emailProvider: "GOOGLE_GMAIL", canSendAsUser: true });
  render(<EmailCapabilityIndicator compact />);
  expect(await screen.findByText("Google email enabled")).toBeInTheDocument();
});

test("reconnect-required never promises SMTP fallback", async () => {
  capabilities.mockResolvedValue({ emailProvider: "RECONNECT_REQUIRED", emailPermission: "RECONNECT_REQUIRED", canSendAsUser: false });
  render(<EmailCapabilityIndicator />);
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Gmail reconnect required"));
  expect(screen.queryByText(/notifications will be sent through/)).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Gmail settings" })).toHaveAttribute("href", "/account/gmail");
  expect(screen.getByRole("link", { name: "Email status" })).toHaveAttribute("href", "/account/notifications");
});

test("compact navigation preserves the reconnect warning", async () => {
  capabilities.mockResolvedValue({ emailProvider: "RECONNECT_REQUIRED", canSendAsUser: false });
  render(<EmailCapabilityIndicator compact />);
  expect(await screen.findByText("Gmail reconnect required")).toBeInTheDocument();
});

test("permission warning takes precedence over a contradictory provider", async () => {
  capabilities.mockResolvedValue({ emailProvider: "REPS_SMTP", emailPermission: "RECONNECT_REQUIRED", canSendAsUser: false });
  render(<EmailCapabilityIndicator compact />);
  expect(await screen.findByText("Gmail reconnect required")).toBeInTheDocument();
});

test("failed status lookup does not advertise a delivery route", async () => {
  capabilities.mockRejectedValue(new Error("Synthetic provider unavailable"));
  render(<EmailCapabilityIndicator />);
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Email availability could not be verified. Check Gmail settings or try again."));
  expect(screen.queryByText(/notifications will be sent through/)).not.toBeInTheDocument();
});
