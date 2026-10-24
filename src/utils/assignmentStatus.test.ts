import { assignmentCreationWarning } from "./assignmentStatus";
test("saved cases with unavailable work produce an actionable warning",()=>{
  expect(assignmentCreationWarning([{punishment:{assignmentWork:{state:"UNAVAILABLE"}}}])).toMatch(/saved case has an unavailable assignment/);
});
test("assigned work and non-assignment case types are not misreported as unavailable",()=>{
  expect(assignmentCreationWarning([{punishment:{assignmentWork:{state:"ASSIGNED"}}},{punishment:{status:"CLOSED"}}])).toBe("");
  expect(assignmentCreationWarning(undefined)).toBe("");
});
