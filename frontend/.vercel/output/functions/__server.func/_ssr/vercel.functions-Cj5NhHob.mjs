import { c as createServerRpc } from "./createServerRpc-CHDPIlgp.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth, s as serverApiClient } from "./api-client-CbTdHRmP.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "./index.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
const triggerVercelDeployment_createServerFn_handler = createServerRpc({
  id: "10b53256417ca5acf8ee381b702d6ffe14a55a67f79627612d72711d3f1b875a",
  name: "triggerVercelDeployment",
  filename: "src/lib/vercel.functions.ts"
}, (opts) => triggerVercelDeployment.__executeServer(opts));
const triggerVercelDeployment = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  portfolioId: stringType()
}).parse(d)).handler(triggerVercelDeployment_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.post("/vercel/deploy", input, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const checkVercelStatus_createServerFn_handler = createServerRpc({
  id: "22b912e9e556868f399e9dc96ec6a559ffa6e5ac7e6ca5c71dc65e879851471e",
  name: "checkVercelStatus",
  filename: "src/lib/vercel.functions.ts"
}, (opts) => checkVercelStatus.__executeServer(opts));
const checkVercelStatus = createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => objectType({
  id: stringType()
}).parse(d)).handler(checkVercelStatus_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.get(`/vercel/status/${input.id}`, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
export {
  checkVercelStatus_createServerFn_handler,
  triggerVercelDeployment_createServerFn_handler
};
