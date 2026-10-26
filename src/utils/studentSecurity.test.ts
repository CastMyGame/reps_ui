import { eligibleSpotterStudent, requireSpotterResults, studentProfilePatch, studentSecurityError } from "./studentSecurity";
import { Student } from "src/types/school";
const child = { studentIdNumber: "child", studentEmail: "child@example.test", firstName: "Synthetic", currency: 99, points: 50,
  spotters: ["staff@example.test"], notesArray: [{content:"private"}], school:"Testing", guidanceEmail:"guidance@example.test" } as unknown as Student;
test("profile writes omit protected state and use legacy revision zero", () => {
  const patch = studentProfilePatch(child, false);
  expect(patch).toMatchObject({ studentIdNumber:"child", profileRevision:0, firstName:"Synthetic" });
  for (const key of ["currency","points","spotters","notesArray","school","guidanceEmail","studentEmail","archived"]) expect(patch).not.toHaveProperty(key);
  expect(studentProfilePatch({...child, profileRevision:4}, true)).toMatchObject({profileRevision:4,guidanceEmail:"guidance@example.test"});
});
test("unconfirmed or partial spotter outcomes never pass", () => {
  expect(() => requireSpotterResults([child], [child.studentEmail], "STAFF@example.test", true)).not.toThrow();
  expect(() => requireSpotterResults([], [child.studentEmail], "staff@example.test", true)).toThrow();
  expect(() => requireSpotterResults([child], [child.studentEmail,"missing@example.test"], "staff@example.test",true)).toThrow();
  expect(() => requireSpotterResults([child], [child.studentEmail], "staff@example.test", false)).toThrow();
  expect(() => requireSpotterResults([{...child,spotters:[]}], [child.studentEmail],"staff@example.test",false)).not.toThrow();
});
test.each([401,403,409,400,500])("recoverable errors explain status %s without inventing success", status => {
  expect(studentSecurityError({response:{status}})).toMatch(status===401?/Sign in/:status===403?/permission/:status===400?/Check/:/retrying/);
});

test("administrator subscription options require an independent staff/student relationship", () => {
  const staff = {email:"teacher@example.test", roles:[{role:"TEACHER"}], classes:[{classRoster:[child.studentEmail]}]} as any;
  expect(eligibleSpotterStudent(staff, child)).toBe(true);
  expect(eligibleSpotterStudent({...staff,classes:[]}, child)).toBe(false);
  expect(eligibleSpotterStudent({...staff,classes:[],roles:[{role:"GUIDANCE"}],email:child.guidanceEmail}, child)).toBe(true);
});
