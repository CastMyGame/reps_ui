import { attachDisciplinaryActionId, completeDisciplinaryAction } from "./http";
jest.mock("../jsonData",()=>({baseUrl:"http://127.0.0.1:1"}));
jest.mock("axios",()=>{ const interceptors={request:{use:jest.fn()},response:{use:jest.fn()}}; return {__esModule:true,default:{create:()=>({interceptors}),interceptors}}; });
beforeEach(()=>{sessionStorage.clear(); sessionStorage.setItem("email","teacher@example.test"); Object.defineProperty(window,"crypto",{configurable:true,value:require("crypto").webcrypto}); (global as any).TextEncoder=require("util").TextEncoder;});
const request=(student="student@example.test")=>({method:"post",url:"http://127.0.0.1:1/punish/v1/startPunish/form",data:{studentEmail:student},headers:{}});
test("retry after a lost response keeps the same action id",async()=>{
  const first=await attachDisciplinaryActionId(request()); const second=await attachDisciplinaryActionId(request()); expect(first.headers["X-REPS-Action-Id"]).toBe(second.headers["X-REPS-Action-Id"]);
});
test("success releases the action id for a new deliberate action",async()=>{
  const first=await attachDisciplinaryActionId(request()); completeDisciplinaryAction({config:first}); const second=await attachDisciplinaryActionId(request()); expect(first.headers["X-REPS-Action-Id"]).not.toBe(second.headers["X-REPS-Action-Id"]);
});
test("different student payloads do not share an action key",async()=>{
  const first=await attachDisciplinaryActionId(request()); const second=await attachDisciplinaryActionId(request("other@example.test")); expect(first.headers["X-REPS-Action-Id"]).not.toBe(second.headers["X-REPS-Action-Id"]);
});
test("report reads and staff status retries are not disciplinary actions",async()=>{
  const config={method:"post",url:"http://127.0.0.1:1/punish/v1/studentsReport/student@example.test",headers:{}}; expect(await attachDisciplinaryActionId(config)).toEqual(config); expect(sessionStorage.length).toBe(1);
});

test("currency redemption retries keep the action ID",async()=>{
  const redeem=()=>({method:"put",url:"http://127.0.0.1:1/employees/v1/currency/spend",data:[{studentEmail:"child@example.test",currencyTransferred:2}],headers:{}});
  const first=await attachDisciplinaryActionId(redeem());const second=await attachDisciplinaryActionId(redeem());expect(first.headers["X-REPS-Action-Id"]).toBe(second.headers["X-REPS-Action-Id"]);
});
test("unconfirmed recognition response retains its action ID",async()=>{
  const award=()=>({...request(),data:[{studentEmail:"child@example.test",infractionName:"Positive Behavior Shout Out!",currency:2}]});
  const first=await attachDisciplinaryActionId(award());expect(()=>completeDisciplinaryAction({config:first,data:[]})).toThrow();
  const retry=await attachDisciplinaryActionId(award());expect(retry.headers["X-REPS-Action-Id"]).toBe(first.headers["X-REPS-Action-Id"]);
});

test("an incomplete redemption response keeps its action ID",async()=>{
  const redeem=()=>({method:"put",url:"http://127.0.0.1:1/employees/v1/currency/spend",data:[{studentEmail:"child@example.test",currencyTransferred:2}],headers:{}});
  const first=await attachDisciplinaryActionId(redeem());expect(()=>completeDisciplinaryAction({config:first,data:[]})).toThrow();
  const retry=await attachDisciplinaryActionId(redeem());expect(retry.headers["X-REPS-Action-Id"]).toBe(first.headers["X-REPS-Action-Id"]);
});
