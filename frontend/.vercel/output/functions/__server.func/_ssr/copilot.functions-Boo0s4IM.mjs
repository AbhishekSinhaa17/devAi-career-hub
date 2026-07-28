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
const getContextSnapshot_createServerFn_handler = createServerRpc({
  id: "fa0ed9d2f9e6acf26c6a52f72b027cd24e8d17ced0b42900fcaf3e96dd9f8a8b",
  name: "getContextSnapshot",
  filename: "src/lib/copilot.functions.ts"
}, (opts) => getContextSnapshot.__executeServer(opts));
const getContextSnapshot = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(getContextSnapshot_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await serverApiClient.get("/copilot/snapshot", {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const startCopilotConversation_createServerFn_handler = createServerRpc({
  id: "9a1cefa7bf7312575ed050e2a86c6426d57f476619f533ed40f38f6c323b60ac",
  name: "startCopilotConversation",
  filename: "src/lib/copilot.functions.ts"
}, (opts) => startCopilotConversation.__executeServer(opts));
const startCopilotConversation = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  title: stringType().optional()
}).parse(d)).handler(startCopilotConversation_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.post("/copilot/conversation", input, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const getCopilotHistory_createServerFn_handler = createServerRpc({
  id: "04ca0539831389de87f0632e8976f07ea137cbd5b362a43b17d1a994ce2b88c8",
  name: "getCopilotHistory",
  filename: "src/lib/copilot.functions.ts"
}, (opts) => getCopilotHistory.__executeServer(opts));
const getCopilotHistory = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(getCopilotHistory_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await serverApiClient.get("/copilot/conversations", {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const getCopilotMessages_createServerFn_handler = createServerRpc({
  id: "c745d5c613c146042d8fb37eadb8f432342b9e36de53338e330719a4994b358e",
  name: "getCopilotMessages",
  filename: "src/lib/copilot.functions.ts"
}, (opts) => getCopilotMessages.__executeServer(opts));
const getCopilotMessages = createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => objectType({
  conversationId: stringType()
}).parse(d)).handler(getCopilotMessages_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.get(`/copilot/conversations/${input.conversationId}/messages`, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const sendCopilotMessage_createServerFn_handler = createServerRpc({
  id: "3484de5d7a4426c34642171fd720b53463b9650bb8d3664268ed1504bf8edb8c",
  name: "sendCopilotMessage",
  filename: "src/lib/copilot.functions.ts"
}, (opts) => sendCopilotMessage.__executeServer(opts));
const sendCopilotMessage = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  conversationId: stringType(),
  // Relaxed uuid() for MongoDB ObjectIds
  message: stringType().min(1)
}).parse(d)).handler(sendCopilotMessage_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.post(`/copilot/conversations/${input.conversationId}/messages`, {
    message: input.message
  }, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
const deleteCopilotConversation_createServerFn_handler = createServerRpc({
  id: "febc516690dbe111ada1bca52b74717dbffe4a55314613bee3a3f1d7b338c305",
  name: "deleteCopilotConversation",
  filename: "src/lib/copilot.functions.ts"
}, (opts) => deleteCopilotConversation.__executeServer(opts));
const deleteCopilotConversation = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  conversationId: stringType()
}).parse(d)).handler(deleteCopilotConversation_createServerFn_handler, async ({
  data: input,
  context
}) => {
  const {
    data
  } = await serverApiClient.delete(`/copilot/conversations/${input.conversationId}`, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data.data;
});
export {
  deleteCopilotConversation_createServerFn_handler,
  getContextSnapshot_createServerFn_handler,
  getCopilotHistory_createServerFn_handler,
  getCopilotMessages_createServerFn_handler,
  sendCopilotMessage_createServerFn_handler,
  startCopilotConversation_createServerFn_handler
};
