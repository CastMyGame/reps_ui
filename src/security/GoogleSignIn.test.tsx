import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../components/globalComponents/updatedLanding/landing";
import MobileLandingLogin from "../components/mobile/MobileLandingLogin";
import { useGoogleSignIn } from "./useGoogleSignIn";

jest.mock("axios");
jest.mock("../utils/jsonData", () => ({
  get baseUrl() {
    return jest.requireActual("../utils/apiOrigin").resolveApiOrigin(undefined, globalThis.window.location.hostname);
  },
}));
const assign = jest.fn();
const originalLocation = window.location;
beforeAll(() => Object.defineProperty(window, "location", {
  configurable: true, value: { ...originalLocation, hostname: "localhost", assign },
}));
afterAll(() => Object.defineProperty(window, "location", { configurable: true, value: originalLocation }));
beforeEach(() => {
  assign.mockReset(); sessionStorage.clear();
  Object.defineProperty(window, "location", { configurable: true, value: { ...originalLocation, hostname: "localhost", assign } });
});
function show(mobile: boolean) {
  Object.defineProperty(window, "matchMedia", { configurable: true, value: jest.fn(() => ({ matches: mobile })) });
  render(<MemoryRouter>{mobile ? <MobileLandingLogin /> : <LandingPage />}</MemoryRouter>);
  if (!mobile) fireEvent.click(screen.getByText("Login"));
  return screen.getByRole("button", { name: "Sign in with Google" });
}
describe.each([false, true])("Google sign-in mobile=%s", mobile => {
  test.each(["button", "icon", "label"])("%s initiates the same OAuth navigation once", target => {
    const button = show(mobile);
    const element = target === "icon" ? button.querySelector("svg")! : target === "label" ? button.querySelector("span")! : button;
    expect(element.closest("button")).toBe(button);
    expect(button).toHaveAttribute("type", "button");
    fireEvent.click(element);
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith("http://localhost:8080/oauth2/authorization/google");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveTextContent("Opening Google…");
    fireEvent.click(button); fireEvent.click(element);
    expect(assign).toHaveBeenCalledTimes(1);
    if (!mobile) expect(document.querySelector(".login-modal")).toBeInTheDocument();
  });
  test.each(["{Enter}", " "])("native keyboard activation %s", key => {
    const button = show(mobile); button.focus();
    expect(button).toHaveFocus(); act(() => { userEvent.keyboard(key); });
    expect(assign).toHaveBeenCalledTimes(1);
  });
  test("deployed dev keeps the existing Google Cloud OAuth origin", () => {
    Object.defineProperty(window, "location", { configurable: true, value: { ...originalLocation, hostname: "repsdev.vercel.app", assign } });
    fireEvent.click(show(mobile));
    expect(assign).toHaveBeenCalledWith("https://repsdev31.ue.r.appspot.com/oauth2/authorization/google");
  });
  test("failed navigation allows a deliberate retry without exposing provider details", () => {
    assign.mockImplementationOnce(() => { throw new Error("private browser details"); });
    const button = show(mobile); fireEvent.click(button);
    expect(screen.getByRole("alert")).toHaveTextContent("Google sign-in could not start. Please try again.");
    expect(screen.getByRole("alert")).not.toHaveTextContent("private browser details");
    expect(button).toBeEnabled(); fireEvent.click(button);
    expect(assign).toHaveBeenCalledTimes(2);
  });
  test("browser Back/pageshow restores the interactive button", () => {
    const button = show(mobile); fireEvent.click(button);
    fireEvent(window, new Event("pageshow"));
    expect(button).toBeEnabled(); fireEvent.click(button);
    expect(assign).toHaveBeenCalledTimes(2);
  });
});
test("synchronous guard rejects repeated starts within one React batch", () => {
  function BatchedClick() {
    const google = useGoogleSignIn();
    return <button onClick={() => { google.signIn(); google.signIn(); }}>Start twice</button>;
  }
  render(<BatchedClick />);
  act(() => fireEvent.click(screen.getByText("Start twice")));
  expect(assign).toHaveBeenCalledTimes(1);
});
