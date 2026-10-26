import { guidancePath, requireGuidanceCreation, requireGuidanceRecord, requireTrackedSave } from "./guidanceSecurity";
jest.mock("./jsonData",()=>({baseUrl:"http://127.0.0.1:1"}));
test("guidance actions use the actual backend namespace and encode IDs",()=>{expect(guidancePath("notes","case/a")).toBe("http://127.0.0.1:1/guidance/v1/guidance/notes/case%2Fa");});
test("unconfirmed guidance responses never pass",()=>{
  expect(()=>requireGuidanceRecord({guidanceId:"case",status:"CLOSED"},"case","CLOSED")).not.toThrow();
  expect(()=>requireGuidanceRecord(null,"case")).toThrow();expect(()=>requireGuidanceRecord({guidanceId:"other"},"case")).toThrow();expect(()=>requireGuidanceRecord({guidanceId:"case",status:"OPEN"},"case","CLOSED")).toThrow();
  expect(()=>requireGuidanceCreation({guidance:[{guidanceId:"saved",studentEmail:"child@example.test"}]},"CHILD@example.test")).not.toThrow();
  expect(()=>requireGuidanceCreation({guidance:[]},"child@example.test")).toThrow();
});
test("tracked behavior confirmation requires the full batch and actual actor",()=>{
  const saved=[{studentEmail:"a@example.test",teacherEmail:"teacher@example.test"},{studentEmail:"b@example.test",teacherEmail:"teacher@example.test"}];
  expect(()=>requireTrackedSave(saved,["a@example.test","b@example.test"],"teacher@example.test")).not.toThrow();
  expect(()=>requireTrackedSave(saved.slice(0,1),["a@example.test","b@example.test"],"teacher@example.test")).toThrow();
  expect(()=>requireTrackedSave(saved,["a@example.test","b@example.test"],"forged@example.test")).toThrow();
});
