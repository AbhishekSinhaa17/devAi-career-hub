import { c as createSsrRpc } from "./router-BcNxq6Cj.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth } from "./api-client-CbTdHRmP.mjs";
import { o as objectType, c as booleanType, s as stringType } from "../_libs/zod.mjs";
const isAdmin = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(createSsrRpc("f56374ba3aaffab4ed8ab7e2a3691b799933caea50cc55628ceb0dfe711b588b"));
const getAdminOverview = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(createSsrRpc("98193c088815d6bbdd4155ffbad4b125116e51df7ef81d3d6aef43156e028e01"));
const listAdminUsers = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(createSsrRpc("8b0453aaedcd8ffb3f94b29f9a5c0af1ac36e00b3de1fd5ea828663e9feaa15d"));
const listAdminAiRequests = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(createSsrRpc("1b5b7a8a1d227d842ca1c85547797308b3c1282cab29431f12bf1eca32d46b05"));
const setUserAdmin = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  userId: stringType(),
  makeAdmin: booleanType()
}).parse(d)).handler(createSsrRpc("53c29e722f6d4cbeadc32c9a48249d2d0a11e823b28a388fc8437b3ab28ce6fb"));
const getApiUsageAnalytics = createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => {
  const obj = d ?? {};
  const days = Math.min(Math.max(Number(obj.days ?? 30), 1), 365);
  const startDate = obj.startDate && /^\d{4}-\d{2}-\d{2}$/.test(obj.startDate) ? obj.startDate : void 0;
  const endDate = obj.endDate && /^\d{4}-\d{2}-\d{2}$/.test(obj.endDate) ? obj.endDate : void 0;
  return {
    days,
    startDate,
    endDate
  };
}).handler(createSsrRpc("193898dc4fa00770766fccc1212e4a286b438402c299ca35b7f29337a4b0553d"));
export {
  listAdminAiRequests as a,
  getApiUsageAnalytics as b,
  getAdminOverview as g,
  isAdmin as i,
  listAdminUsers as l,
  setUserAdmin as s
};
