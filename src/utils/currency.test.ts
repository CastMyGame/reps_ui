import { awardValidation, committedAwardBalance, currencyFailure } from "./currency";
const request = [{ studentEmail: "child@example.test", currency: 3 }];
const row = { currencyOperationId: "receipt", currencyState: "COMMITTED", teacherCurrency: 7, punishment: { punishmentId: "case", studentEmail: "child@example.test", currencyAwarded: 3, currencyOperationId: "receipt" } };
test("the complete batch cost is validated", () => {
  expect(awardValidation(4, 3, 10)).toMatch(/total award cost/);
  expect(awardValidation(4, 2, 10)).toBe("");
  expect(awardValidation(0, 2, 10)).toBe("");
});
test.each([-1, 0.2, NaN, Infinity, 2147483648])("invalid award %s is rejected", amount => expect(awardValidation(amount, 1, 20)).not.toBe(""));
test("missing balance and invalid batch size are rejected", () => {
  expect(awardValidation(1, 1, undefined)).toMatch(/unavailable/);
  expect(awardValidation(1, 0, 10)).not.toBe("");expect(awardValidation(1, 201, 1000)).not.toBe("");
});
test("only a complete matching receipt confirms success", () => {
  expect(committedAwardBalance([row], request)).toBe(7);
  for (const data of [[], [{ ...row, currencyState: "PENDING" }], [{ ...row, currencyOperationId: null }], [{ ...row, punishment: { ...row.punishment, currencyAwarded: 9 } }], [row, row]])
    expect(() => committedAwardBalance(data, request)).toThrow(/Unconfirmed/);
});
test("uncertain failures do not claim that no award occurred", () => {
  expect(currencyFailure({})).toMatch(/could not be confirmed/);
  expect(currencyFailure({ response: { status: 409 } })).toMatch(/same unchanged request/);
  expect(currencyFailure({ response: { status: 403 } })).toMatch(/not authorized/);
});
