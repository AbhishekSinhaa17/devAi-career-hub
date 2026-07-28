import { c as createServerRpc } from "./createServerRpc-CHDPIlgp.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth, s as serverApiClient } from "./api-client-CbTdHRmP.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "./index.mjs";
import { o as objectType, c as booleanType, s as stringType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "crypto";
import "async_hooks";
import "util";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/axios.mjs";
import "../_libs/form-data.mjs";
import "../_libs/combined-stream.mjs";
import "../_libs/delayed-stream.mjs";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "../_libs/mime-types.mjs";
import "../_libs/mime-db.mjs";
import "../_libs/asynckit.mjs";
import "../_libs/es-set-tostringtag.mjs";
import "../_libs/get-intrinsic.mjs";
import "../_libs/es-object-atoms.mjs";
import "../_libs/es-errors.mjs";
import "../_libs/math-intrinsics.mjs";
import "../_libs/gopd.mjs";
import "../_libs/es-define-property.mjs";
import "../_libs/has-symbols.mjs";
import "../_libs/get-proto.mjs";
import "../_libs/dunder-proto.mjs";
import "../_libs/call-bind-apply-helpers.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/hasown.mjs";
import "../_libs/has-tostringtag.mjs";
import "../_libs/proxy-from-env.mjs";
import "../_libs/https-proxy-agent.mjs";
import "net";
import "tls";
import "assert";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "os";
import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";
import "events";
import "http2";
import "../_libs/follow-redirects.mjs";
import "zlib";
import "../_libs/sentry__node.mjs";
import "../_libs/sentry__core.mjs";
import "../_libs/sentry__node-core.mjs";
import "../_libs/sentry__opentelemetry.mjs";
import "../_libs/@opentelemetry/semantic-conventions+[...].mjs";
import "../_libs/opentelemetry__sdk-trace-base.mjs";
import "../_libs/opentelemetry__core.mjs";
import "../_libs/opentelemetry__resources.mjs";
import "node:events";
import "node:diagnostics_channel";
import "node:child_process";
import "node:fs";
import "node:os";
import "node:path";
import "node:util";
import "node:readline";
import "../_libs/opentelemetry__instrumentation.mjs";
import "../_libs/opentelemetry__api-logs.mjs";
import "require-in-the-middle";
import "import-in-the-middle";
import "node:http";
import "node:https";
import "node:worker_threads";
import "diagnostics_channel";
import "worker_threads";
import "node:zlib";
import "node:net";
import "node:tls";
import "module";
import "../_libs/sentry__server-utils.mjs";
const isAdmin_createServerFn_handler = createServerRpc({
  id: "f56374ba3aaffab4ed8ab7e2a3691b799933caea50cc55628ceb0dfe711b588b",
  name: "isAdmin",
  filename: "src/lib/admin.functions.ts"
}, (opts) => isAdmin.__executeServer(opts));
const isAdmin = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(isAdmin_createServerFn_handler, async ({
  context
}) => {
  try {
    const {
      data
    } = await serverApiClient.get("/admin/is-admin", {
      headers: {
        Authorization: `Bearer ${context.token}`
      }
    });
    return data.data;
  } catch (e) {
    return {
      isAdmin: false
    };
  }
});
const getAdminOverview_createServerFn_handler = createServerRpc({
  id: "98193c088815d6bbdd4155ffbad4b125116e51df7ef81d3d6aef43156e028e01",
  name: "getAdminOverview",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminOverview.__executeServer(opts));
const getAdminOverview = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(getAdminOverview_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await serverApiClient.get("/admin/overview", {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const listAdminUsers_createServerFn_handler = createServerRpc({
  id: "8b0453aaedcd8ffb3f94b29f9a5c0af1ac36e00b3de1fd5ea828663e9feaa15d",
  name: "listAdminUsers",
  filename: "src/lib/admin.functions.ts"
}, (opts) => listAdminUsers.__executeServer(opts));
const listAdminUsers = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(listAdminUsers_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await serverApiClient.get("/admin/users", {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const listAdminAiRequests_createServerFn_handler = createServerRpc({
  id: "1b5b7a8a1d227d842ca1c85547797308b3c1282cab29431f12bf1eca32d46b05",
  name: "listAdminAiRequests",
  filename: "src/lib/admin.functions.ts"
}, (opts) => listAdminAiRequests.__executeServer(opts));
const listAdminAiRequests = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(listAdminAiRequests_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await serverApiClient.get("/admin/ai-requests", {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const setUserAdmin_createServerFn_handler = createServerRpc({
  id: "53c29e722f6d4cbeadc32c9a48249d2d0a11e823b28a388fc8437b3ab28ce6fb",
  name: "setUserAdmin",
  filename: "src/lib/admin.functions.ts"
}, (opts) => setUserAdmin.__executeServer(opts));
const setUserAdmin = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  userId: stringType(),
  makeAdmin: booleanType()
}).parse(d)).handler(setUserAdmin_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.post("/admin/set-admin", input, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const getApiUsageAnalytics_createServerFn_handler = createServerRpc({
  id: "193898dc4fa00770766fccc1212e4a286b438402c299ca35b7f29337a4b0553d",
  name: "getApiUsageAnalytics",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getApiUsageAnalytics.__executeServer(opts));
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
}).handler(getApiUsageAnalytics_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.get("/admin/api-usage", {
    params: input,
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
export {
  getAdminOverview_createServerFn_handler,
  getApiUsageAnalytics_createServerFn_handler,
  isAdmin_createServerFn_handler,
  listAdminAiRequests_createServerFn_handler,
  listAdminUsers_createServerFn_handler,
  setUserAdmin_createServerFn_handler
};
