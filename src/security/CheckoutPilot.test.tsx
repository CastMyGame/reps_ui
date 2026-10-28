import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CheckoutSuccess from "./checkoutSuccess";
import CheckoutCancel from "./checkoutCancel";

test.each([CheckoutSuccess, CheckoutCancel])("checkout return pages explain controlled billing without claiming payment verification", (Page) => {
  render(<MemoryRouter initialEntries={["/checkout/success?session_id=synthetic-reference"]}><Page /></MemoryRouter>);
  expect(screen.getByText(/New checkout is unavailable/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Contact REPS" })).toBeInTheDocument();
  expect(screen.queryByText(/Payment successful|you weren.t charged|Try again/)).not.toBeInTheDocument();
});
