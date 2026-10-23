import {
  accountError,
  accountRoles,
  accountSchool,
  accountStatus,
  isSelf,
  loginRole,
  requireCreatedTeacher,
  supportedStaff,
} from "./accountAdministration";
const user = (extra: any = {}) =>
  ({
    id: "id",
    username: "staff@school.test",
    roles: [{ role: "TEACHER" }],
    ...extra,
  }) as any;
test("school canonical and legacy contracts", () => {
  expect(accountSchool(user({ school: "Current", schoolName: "Old" }))).toBe(
    "Current",
  );
  expect(accountSchool(user({ schoolName: "Legacy" }))).toBe("Legacy");
});
test("all supported staff combinations survive role selection", () => {
  const u = user({
    roles: [{ role: "TEACHER" }, { role: "ADMIN" }, { role: "GUIDANCE" }],
  });
  expect(accountRoles(u)).toHaveLength(3);
  expect(loginRole(u)).toBe("ADMIN");
  expect(supportedStaff(u)).toBe(true);
});
test.each([["STUDENT"], ["STUDENT", "ADMIN"], ["UNKNOWN"], []])(
  "unsafe role combinations are not editable: %j",
  (...roles) => {
    expect(
      supportedStaff(user({ roles: roles.map((role) => ({ role })) })),
    ).toBe(false);
  },
);
test("states do not invent lifecycle history or legacy enablement", () => {
  expect(accountStatus(user({ enabled: true }))).toBe("Active");
  expect(accountStatus(user({ enabled: false, paid: true }))).toBe(
    "Pending activation / inactive",
  );
  expect(accountStatus(user())).toBe("Status unavailable");
});
test("self identity normalizes email", () => {
  sessionStorage.setItem("email", "STAFF@school.test");
  expect(isSelf(user())).toBe(true);
});
test.each([
  [401, "Sign in"],
  [403, "Access denied"],
  [400, "required fields"],
  [422, "required fields"],
  [404, "no longer available"],
  [409, "already be registered"],
  [500, "part of the operation"],
  [undefined, "part of the operation"],
])("safe error for %s", (status, text) => {
  expect(
    accountError({
      response: { status, data: { secret: "must not display" } },
    }),
  ).toContain(text);
});
test("200 does not prove teacher creation", () => {
  expect(() =>
    requireCreatedTeacher({ error: "duplicate", employee: null }),
  ).toThrow(/not confirmed/);
  expect(() => requireCreatedTeacher({})).toThrow();
  expect(() =>
    requireCreatedTeacher({
      error: "",
      employee: { email: "synthetic@school.test" },
    }),
  ).not.toThrow();
});
