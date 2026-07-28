import { c as createServerRpc } from "./createServerRpc-CHDPIlgp.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth, s as serverApiClient } from "./api-client-CbTdHRmP.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "./index.mjs";
import { o as objectType, s as stringType, c as booleanType } from "../_libs/zod.mjs";
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
const startDeployment_createServerFn_handler = createServerRpc({
  id: "5a96b36300d80c9b94470d9cec870d84a7c79d6fe9d3083a25fe163e0c9fa3c3",
  name: "startDeployment",
  filename: "src/lib/deployment.functions.ts"
}, (opts) => startDeployment.__executeServer(opts));
const startDeployment = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  portfolioId: stringType(),
  provider: stringType(),
  username: stringType()
}).parse(d)).handler(startDeployment_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.post("/deployment/start", input, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const getDeploymentStatus_createServerFn_handler = createServerRpc({
  id: "3302f4db9dc9d0e2a5b79b291bae5e1df7d7fb810d4dde080b4b2282316acda6",
  name: "getDeploymentStatus",
  filename: "src/lib/deployment.functions.ts"
}, (opts) => getDeploymentStatus.__executeServer(opts));
const getDeploymentStatus = createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => objectType({
  id: stringType()
}).parse(d)).handler(getDeploymentStatus_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.get(`/deployment/status/${input.id}`, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const getDeploymentsByPortfolio_createServerFn_handler = createServerRpc({
  id: "45d05d2fad21aee54caf78ab859fd4296b739648b175a6526c75082aca969e0a",
  name: "getDeploymentsByPortfolio",
  filename: "src/lib/deployment.functions.ts"
}, (opts) => getDeploymentsByPortfolio.__executeServer(opts));
const getDeploymentsByPortfolio = createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => objectType({
  portfolioId: stringType()
}).parse(d)).handler(getDeploymentsByPortfolio_createServerFn_handler, async ({
  data: input,
  context
}) => {
  try {
    const {
      data
    } = await serverApiClient.get(`/deployment/portfolio/${input.portfolioId}`, {
      headers: {
        Authorization: `Bearer ${context.token}`
      }
    });
    return data.data;
  } catch (e) {
    return [];
  }
});
const getPublicPortfolio_createServerFn_handler = createServerRpc({
  id: "267f3018e5bc392497aa8365f2a04cdf57da4bf7d5457919eae78f2ec3428a65",
  name: "getPublicPortfolio",
  filename: "src/lib/deployment.functions.ts"
}, (opts) => getPublicPortfolio.__executeServer(opts));
const getPublicPortfolio = createServerFn({
  method: "GET"
}).validator((d) => objectType({
  id: stringType()
}).parse(d)).handler(getPublicPortfolio_createServerFn_handler, async ({
  data: input
}) => {
  const {
    data
  } = await serverApiClient.get(`/deployment/public/${input.id}`);
  return data.data;
});
const setPortfolioVisibility_createServerFn_handler = createServerRpc({
  id: "31b37dbb95fa1ab3e5add64cfb32a2a884770843a5ea893fb0c36e8d4c6d4205",
  name: "setPortfolioVisibility",
  filename: "src/lib/deployment.functions.ts"
}, (opts) => setPortfolioVisibility.__executeServer(opts));
const setPortfolioVisibility = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  portfolioId: stringType(),
  isPublic: booleanType()
}).parse(d)).handler(setPortfolioVisibility_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.post("/deployment/visibility", input, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
export {
  getDeploymentStatus_createServerFn_handler,
  getDeploymentsByPortfolio_createServerFn_handler,
  getPublicPortfolio_createServerFn_handler,
  setPortfolioVisibility_createServerFn_handler,
  startDeployment_createServerFn_handler
};
