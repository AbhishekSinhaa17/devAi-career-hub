import { q as defineIntegration, a1 as hasSpansEnabled, aT as getRequestUrlFromClientRequest, aU as stripDataUrlContent, aV as SEMANTIC_ATTRIBUTE_URL_FULL, k as SDK_VERSION, aW as timestampInSeconds, b as getClient, aL as SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME, S as SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, aX as getActiveSpan, ag as getRootSpan$1, ad as spanToJSON, c as SEMANTIC_ATTRIBUTE_SENTRY_OP, aY as patchExpressModule, d as debug, i as getIsolationScope, z as captureException, aZ as SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE, a_ as SEMANTIC_ATTRIBUTE_CACHE_HIT, a$ as SEMANTIC_ATTRIBUTE_CACHE_KEY, b0 as truncate, b1 as replaceExports, b2 as startSpanManual, f as SPAN_STATUS_ERROR, b3 as instrumentPostgresJsSql, C as consoleSandbox, b4 as isThenable, aj as getDefaultIsolationScope, b5 as startSpan$1, aR as handleCallbackErrors, a as addNonEnumerableProperty, b6 as _INTERNAL_getSpanContextForToolCallId, b7 as withScope, b8 as _INTERNAL_cleanupToolCallSpanContext, b9 as addVercelAiProcessors, ba as _INTERNAL_shouldSkipAiProviderWrapping, bb as instrumentOpenAiClient, bc as OPENAI_INTEGRATION_NAME, bd as ANTHROPIC_AI_INTEGRATION_NAME, be as instrumentAnthropicAiClient, bf as GOOGLE_GENAI_INTEGRATION_NAME, bg as instrumentGoogleGenAIClient, bh as _INTERNAL_skipAiProviderWrapping, bi as createLangChainCallbackHandler, bj as instrumentLangChainEmbeddings, bk as _INTERNAL_mergeLangChainCallbackHandler, bl as LANGCHAIN_INTEGRATION_NAME, bm as instrumentLangGraph$1, bn as instrumentCreateReactAgent, bo as LANGGRAPH_INTEGRATION_NAME, bp as flush, _ as applySdkMetadata } from "./sentry__core.mjs";
import { h as httpServerIntegration, a as httpServerSpansIntegration, g as generateInstrumentOnce, S as SentryHttpInstrumentation, b as SentryNodeFetchInstrumentation, c as addOriginToSpan, i as instrumentWhenWrapped, s as setupOpenTelemetryLogger, d as SentryContextManager, e as init$1, v as validateOpenTelemetrySetup, f as getDefaultIntegrations$1 } from "./sentry__node-core.mjs";
import * as diagch from "diagnostics_channel";
import { URL as URL$1 } from "url";
import { s as srcExports$1 } from "./@opentelemetry/api.mjs";
import { s as srcExports } from "./@opentelemetry/semantic-conventions+[...].mjs";
import { I as InstrumentationBase, s as safeExecuteInTheMiddle, a as InstrumentationNodeModuleDefinition, i as isWrapped, b as semconvStabilityFromStr, S as SemconvStability } from "./opentelemetry__instrumentation.mjs";
import { normalize } from "path";
import * as dc from "node:diagnostics_channel";
import * as net from "node:net";
import { b as SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, t as tracingChannel, c as SentrySpanProcessor, d as SentrySampler, f as getSentryResource, h as SentryPropagator } from "./sentry__opentelemetry.mjs";
import { a as suppressTracing, q as W3CTraceContextPropagator } from "./opentelemetry__core.mjs";
import { s as subscribeRedisDiagnosticChannels } from "./sentry__server-utils.mjs";
import { EventEmitter } from "events";
import { B as BasicTracerProvider } from "./opentelemetry__sdk-trace-base.mjs";
const INTEGRATION_NAME$n = "Http";
const instrumentSentryHttp = generateInstrumentOnce(
  `${INTEGRATION_NAME$n}.sentry`,
  (options) => {
    return new SentryHttpInstrumentation(options);
  }
);
const httpIntegration = defineIntegration((options = {}) => {
  const spans = options.spans ?? true;
  const disableIncomingRequestSpans = options.disableIncomingRequestSpans;
  const enableServerSpans = spans && !disableIncomingRequestSpans;
  const serverOptions = {
    sessions: options.trackIncomingRequestsAsSessions,
    sessionFlushingDelayMS: options.sessionFlushingDelayMS,
    ignoreRequestBody: options.ignoreIncomingRequestBody,
    maxRequestBodySize: options.maxIncomingRequestBodySize
  };
  const serverSpansOptions = {
    ignoreIncomingRequests: options.ignoreIncomingRequests,
    ignoreStaticAssets: options.ignoreStaticAssets,
    ignoreStatusCodes: options.dropSpansForIncomingRequestStatusCodes,
    instrumentation: options.instrumentation,
    onSpanCreated: options.incomingRequestSpanHook
  };
  const server = httpServerIntegration(serverOptions);
  const serverSpans = httpServerSpansIntegration(serverSpansOptions);
  return {
    name: INTEGRATION_NAME$n,
    setup(client) {
      const clientOptions = client.getOptions();
      if (enableServerSpans && hasSpansEnabled(clientOptions)) {
        serverSpans.setup(client);
      }
    },
    setupOnce() {
      server.setupOnce();
      const sentryHttpInstrumentationOptions = {
        breadcrumbs: options.breadcrumbs,
        spans,
        propagateTraceInOutgoingRequests: options.tracePropagation ?? true,
        createSpansForOutgoingRequests: spans,
        ignoreOutgoingRequests: options.ignoreOutgoingRequests,
        outgoingRequestHook: (span, request) => {
          const url = getRequestUrlFromClientRequest(request);
          if (url.startsWith("data:")) {
            const sanitizedUrl = stripDataUrlContent(url);
            span.setAttribute("http.url", sanitizedUrl);
            span.setAttribute(SEMANTIC_ATTRIBUTE_URL_FULL, sanitizedUrl);
            span.updateName(`${request.method || "GET"} ${sanitizedUrl}`);
          }
          options.instrumentation?.requestHook?.(span, request);
        },
        outgoingResponseHook: options.instrumentation?.responseHook,
        outgoingRequestApplyCustomAttributes: options.instrumentation?.applyCustomAttributesOnSpan
      };
      instrumentSentryHttp(sentryHttpInstrumentationOptions);
    },
    processEvent(event) {
      return serverSpans.processEvent(event);
    }
  };
});
const PACKAGE_NAME$j = "@sentry/instrumentation-undici";
class UndiciInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$j, SDK_VERSION, config2);
    this._recordFromReq = /* @__PURE__ */ new WeakMap();
  }
  // No need to instrument files/modules
  init() {
    return void 0;
  }
  disable() {
    super.disable();
    this._channelSubs.forEach((sub) => sub.unsubscribe());
    this._channelSubs.length = 0;
  }
  enable() {
    super.enable();
    this._channelSubs = this._channelSubs || [];
    if (this._channelSubs.length > 0) {
      return;
    }
    this.subscribeToChannel("undici:request:create", this.onRequestCreated.bind(this));
    this.subscribeToChannel("undici:client:sendHeaders", this.onRequestHeaders.bind(this));
    this.subscribeToChannel("undici:request:headers", this.onResponseHeaders.bind(this));
    this.subscribeToChannel("undici:request:trailers", this.onDone.bind(this));
    this.subscribeToChannel("undici:request:error", this.onError.bind(this));
  }
  _updateMetricInstruments() {
    this._httpClientDurationHistogram = this.meter.createHistogram(srcExports.METRIC_HTTP_CLIENT_REQUEST_DURATION, {
      description: "Measures the duration of outbound HTTP requests.",
      unit: "s",
      valueType: srcExports$1.ValueType.DOUBLE,
      advice: {
        explicitBucketBoundaries: [5e-3, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10]
      }
    });
  }
  subscribeToChannel(diagnosticChannel, onMessage) {
    const [major = 0, minor = 0] = process.version.replace("v", "").split(".").map((n) => Number(n));
    const useNewSubscribe = major > 18 || major === 18 && minor >= 19;
    let unsubscribe;
    if (useNewSubscribe) {
      diagch.subscribe?.(diagnosticChannel, onMessage);
      unsubscribe = () => diagch.unsubscribe?.(diagnosticChannel, onMessage);
    } else {
      const channel = diagch.channel(diagnosticChannel);
      channel.subscribe(onMessage);
      unsubscribe = () => channel.unsubscribe(onMessage);
    }
    this._channelSubs.push({
      name: diagnosticChannel,
      unsubscribe
    });
  }
  parseRequestHeaders(request) {
    const result = /* @__PURE__ */ new Map();
    if (Array.isArray(request.headers)) {
      for (let i = 0; i < request.headers.length; i += 2) {
        const key = request.headers[i];
        const value = request.headers[i + 1];
        if (typeof key === "string" && value !== void 0) {
          result.set(key.toLowerCase(), value);
        }
      }
    } else if (typeof request.headers === "string") {
      const headers = request.headers.split("\r\n");
      for (const line of headers) {
        if (!line) {
          continue;
        }
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) {
          continue;
        }
        const key = line.substring(0, colonIndex).toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        const allValues = result.get(key);
        if (allValues && Array.isArray(allValues)) {
          allValues.push(value);
        } else if (allValues) {
          result.set(key, [allValues, value]);
        } else {
          result.set(key, value);
        }
      }
    }
    return result;
  }
  // This is the 1st message we receive for each request (fired after request creation). Here we will
  // create the span and populate some atttributes, then link the span to the request for further
  // span processing
  onRequestCreated({ request }) {
    const config2 = this.getConfig();
    const enabled = config2.enabled !== false;
    const shouldIgnoreReq = safeExecuteInTheMiddle(
      () => !enabled || request.method === "CONNECT" || config2.ignoreRequestHook?.(request),
      (e) => e && this._diag.error("caught ignoreRequestHook error: ", e),
      true
    );
    if (shouldIgnoreReq) {
      return;
    }
    const startTime = timestampInSeconds();
    let requestUrl;
    try {
      requestUrl = new URL$1(request.path, request.origin);
    } catch (err) {
      this._diag.warn("could not determine url.full:", err);
      return;
    }
    const urlScheme = requestUrl.protocol.replace(":", "");
    const requestMethod = this.getRequestMethod(request.method);
    const attributes = {
      [srcExports.ATTR_HTTP_REQUEST_METHOD]: requestMethod,
      [srcExports.ATTR_HTTP_REQUEST_METHOD_ORIGINAL]: request.method,
      [srcExports.ATTR_URL_FULL]: requestUrl.toString(),
      [srcExports.ATTR_URL_PATH]: requestUrl.pathname,
      [srcExports.ATTR_URL_QUERY]: requestUrl.search,
      [srcExports.ATTR_URL_SCHEME]: urlScheme
    };
    const schemePorts = { https: "443", http: "80" };
    const serverAddress = requestUrl.hostname;
    const serverPort = requestUrl.port || schemePorts[urlScheme];
    attributes[srcExports.ATTR_SERVER_ADDRESS] = serverAddress;
    if (serverPort && !isNaN(Number(serverPort))) {
      attributes[srcExports.ATTR_SERVER_PORT] = Number(serverPort);
    }
    const headersMap = this.parseRequestHeaders(request);
    const userAgentValues = headersMap.get("user-agent");
    if (userAgentValues) {
      const userAgent = Array.isArray(userAgentValues) ? userAgentValues[userAgentValues.length - 1] : userAgentValues;
      attributes[srcExports.ATTR_USER_AGENT_ORIGINAL] = userAgent;
    }
    const hookAttributes = safeExecuteInTheMiddle(
      () => config2.startSpanHook?.(request),
      (e) => e && this._diag.error("caught startSpanHook error: ", e),
      true
    );
    if (hookAttributes) {
      Object.entries(hookAttributes).forEach(([key, val]) => {
        attributes[key] = val;
      });
    }
    const activeCtx = srcExports$1.context.active();
    const currentSpan = srcExports$1.trace.getSpan(activeCtx);
    let span;
    if (config2.requireParentforSpans && (!currentSpan || !srcExports$1.trace.isSpanContextValid(currentSpan.spanContext()))) {
      span = srcExports$1.trace.wrapSpanContext(srcExports$1.INVALID_SPAN_CONTEXT);
    } else {
      span = this.tracer.startSpan(
        requestMethod === "_OTHER" ? "HTTP" : requestMethod,
        {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        },
        activeCtx
      );
    }
    safeExecuteInTheMiddle(
      () => config2.requestHook?.(span, request),
      (e) => e && this._diag.error("caught requestHook error: ", e),
      true
    );
    const requestContext = srcExports$1.trace.setSpan(srcExports$1.context.active(), span);
    const addedHeaders = {};
    srcExports$1.propagation.inject(requestContext, addedHeaders);
    const headerEntries = Object.entries(addedHeaders);
    for (let i = 0; i < headerEntries.length; i++) {
      const pair = headerEntries[i];
      if (!pair) {
        continue;
      }
      const [k, v] = pair;
      if (typeof request.addHeader === "function") {
        request.addHeader(k, v);
      } else if (typeof request.headers === "string") {
        request.headers += `${k}: ${v}\r
`;
      } else if (Array.isArray(request.headers)) {
        request.headers.push(k, v);
      }
    }
    this._recordFromReq.set(request, { span, attributes, startTime });
  }
  // This is the 2nd message we receive for each request. It is fired when connection with
  // the remote is established and about to send the first byte. Here we do have info about the
  // remote address and port so we can populate some `network.*` attributes into the span
  onRequestHeaders({ request, socket }) {
    const record = this._recordFromReq.get(request);
    if (!record) {
      return;
    }
    const config2 = this.getConfig();
    const { span } = record;
    const { remoteAddress, remotePort } = socket;
    const spanAttributes = {
      [srcExports.ATTR_NETWORK_PEER_ADDRESS]: remoteAddress,
      [srcExports.ATTR_NETWORK_PEER_PORT]: remotePort
    };
    if (config2.headersToSpanAttributes?.requestHeaders) {
      const headersToAttribs = new Set(config2.headersToSpanAttributes.requestHeaders.map((n) => n.toLowerCase()));
      const headersMap = this.parseRequestHeaders(request);
      for (const [name, value] of headersMap.entries()) {
        if (headersToAttribs.has(name)) {
          const attrValue = Array.isArray(value) ? value : [value];
          spanAttributes[`http.request.header.${name}`] = attrValue;
        }
      }
    }
    span.setAttributes(spanAttributes);
  }
  // This is the 3rd message we get for each request and it's fired when the server
  // headers are received, body may not be accessible yet.
  // From the response headers we can set the status and content length
  onResponseHeaders({ request, response }) {
    const record = this._recordFromReq.get(request);
    if (!record) {
      return;
    }
    const { span, attributes } = record;
    const spanAttributes = {
      [srcExports.ATTR_HTTP_RESPONSE_STATUS_CODE]: response.statusCode
    };
    const config2 = this.getConfig();
    safeExecuteInTheMiddle(
      () => config2.responseHook?.(span, { request, response }),
      (e) => e && this._diag.error("caught responseHook error: ", e),
      true
    );
    if (config2.headersToSpanAttributes?.responseHeaders) {
      const headersToAttribs = /* @__PURE__ */ new Set();
      config2.headersToSpanAttributes?.responseHeaders.forEach((name) => headersToAttribs.add(name.toLowerCase()));
      for (let idx = 0; idx < response.headers.length; idx = idx + 2) {
        const nameBuf = response.headers[idx];
        const valueBuf = response.headers[idx + 1];
        if (nameBuf === void 0 || valueBuf === void 0) {
          continue;
        }
        const name = nameBuf.toString().toLowerCase();
        const value = valueBuf;
        if (headersToAttribs.has(name)) {
          const attrName = `http.response.header.${name}`;
          if (!Object.prototype.hasOwnProperty.call(spanAttributes, attrName)) {
            spanAttributes[attrName] = [value.toString()];
          } else {
            spanAttributes[attrName].push(value.toString());
          }
        }
      }
    }
    span.setAttributes(spanAttributes);
    span.setStatus({
      code: response.statusCode >= 400 ? srcExports$1.SpanStatusCode.ERROR : srcExports$1.SpanStatusCode.UNSET
    });
    record.attributes = Object.assign(attributes, spanAttributes);
  }
  // This is the last event we receive if the request went without any errors
  onDone({ request }) {
    const record = this._recordFromReq.get(request);
    if (!record) {
      return;
    }
    const { span, attributes, startTime } = record;
    span.end();
    this._recordFromReq.delete(request);
    this.recordRequestDuration(attributes, startTime);
  }
  // This is the event we get when something is wrong in the request like
  // - invalid options when calling `fetch` global API or any undici method for request
  // - connectivity errors such as unreachable host
  // - requests aborted through an `AbortController.signal`
  // NOTE: server errors are considered valid responses and it's the lib consumer
  // who should deal with that.
  onError({ request, error }) {
    const record = this._recordFromReq.get(request);
    if (!record) {
      return;
    }
    const { span, attributes, startTime } = record;
    span.recordException(error);
    span.setStatus({
      code: srcExports$1.SpanStatusCode.ERROR,
      message: error.message
    });
    span.end();
    this._recordFromReq.delete(request);
    attributes[srcExports.ATTR_ERROR_TYPE] = error.message;
    this.recordRequestDuration(attributes, startTime);
  }
  recordRequestDuration(attributes, startTime) {
    const metricsAttributes = {};
    const keysToCopy = [
      srcExports.ATTR_HTTP_RESPONSE_STATUS_CODE,
      srcExports.ATTR_HTTP_REQUEST_METHOD,
      srcExports.ATTR_SERVER_ADDRESS,
      srcExports.ATTR_SERVER_PORT,
      srcExports.ATTR_URL_SCHEME,
      srcExports.ATTR_ERROR_TYPE
    ];
    keysToCopy.forEach((key) => {
      if (key in attributes) {
        metricsAttributes[key] = attributes[key];
      }
    });
    const durationSeconds = timestampInSeconds() - startTime;
    this._httpClientDurationHistogram.record(durationSeconds, metricsAttributes);
  }
  getRequestMethod(original) {
    const knownMethods = {
      CONNECT: true,
      OPTIONS: true,
      HEAD: true,
      GET: true,
      POST: true,
      PUT: true,
      PATCH: true,
      DELETE: true,
      TRACE: true,
      // QUERY from https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/
      QUERY: true
    };
    if (original.toUpperCase() in knownMethods) {
      return original.toUpperCase();
    }
    return "_OTHER";
  }
}
const INTEGRATION_NAME$m = "NodeFetch";
const instrumentOtelNodeFetch = generateInstrumentOnce(
  INTEGRATION_NAME$m,
  UndiciInstrumentation,
  (options) => {
    return _getConfigWithDefaults(options);
  }
);
const instrumentSentryNodeFetch = generateInstrumentOnce(
  `${INTEGRATION_NAME$m}.sentry`,
  SentryNodeFetchInstrumentation,
  (options) => {
    return options;
  }
);
const _nativeNodeFetchIntegration = ((options = {}) => {
  return {
    name: "NodeFetch",
    setupOnce() {
      const instrumentSpans = _shouldInstrumentSpans(options, getClient()?.getOptions());
      if (instrumentSpans) {
        instrumentOtelNodeFetch(options);
      }
      instrumentSentryNodeFetch(options);
    }
  };
});
const nativeNodeFetchIntegration = defineIntegration(_nativeNodeFetchIntegration);
function getAbsoluteUrl(origin, path = "/") {
  const url = `${origin}`;
  if (url.endsWith("/") && path.startsWith("/")) {
    return `${url}${path.slice(1)}`;
  }
  if (!url.endsWith("/") && !path.startsWith("/")) {
    return `${url}/${path}`;
  }
  return `${url}${path}`;
}
function _shouldInstrumentSpans(options, clientOptions = {}) {
  return typeof options.spans === "boolean" ? options.spans : !clientOptions.skipOpenTelemetrySetup && hasSpansEnabled(clientOptions);
}
function _getConfigWithDefaults(options = {}) {
  const instrumentationConfig = {
    requireParentforSpans: false,
    ignoreRequestHook: (request) => {
      const url = getAbsoluteUrl(request.origin, request.path);
      const _ignoreOutgoingRequests = options.ignoreOutgoingRequests;
      const shouldIgnore = _ignoreOutgoingRequests && url && _ignoreOutgoingRequests(url);
      return !!shouldIgnore;
    },
    startSpanHook: (request) => {
      const url = getAbsoluteUrl(request.origin, request.path);
      if (url.startsWith("data:")) {
        const sanitizedUrl = stripDataUrlContent(url);
        return {
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.node_fetch",
          "http.url": sanitizedUrl,
          [SEMANTIC_ATTRIBUTE_URL_FULL]: sanitizedUrl,
          [SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME]: `${request.method || "GET"} ${sanitizedUrl}`
        };
      }
      return {
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.node_fetch"
      };
    },
    requestHook: options.requestHook,
    responseHook: options.responseHook,
    headersToSpanAttributes: options.headersToSpanAttributes
  };
  return instrumentationConfig;
}
const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
function setHttpServerSpanRouteAttribute(route) {
  const activeSpan = getActiveSpan();
  if (!activeSpan) {
    return;
  }
  const rootSpan = getRootSpan$1(activeSpan);
  if (!rootSpan) {
    return;
  }
  if (spanToJSON(rootSpan).data[SEMANTIC_ATTRIBUTE_SENTRY_OP] !== "http.server") {
    return;
  }
  rootSpan.setAttribute("http.route", route);
}
const INTEGRATION_NAME$l = "Express";
const SUPPORTED_VERSIONS$3 = [">=4.0.0 <6"];
const instrumentExpress = generateInstrumentOnce(
  INTEGRATION_NAME$l,
  (options) => new ExpressInstrumentation(options)
);
class ExpressInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("sentry-express", SDK_VERSION, config2);
  }
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "express",
      SUPPORTED_VERSIONS$3,
      (express) => {
        try {
          patchExpressModule(express, () => ({
            ...this.getConfig(),
            onRouteResolved(route) {
              if (route) {
                setHttpServerSpanRouteAttribute(route);
              }
            }
          }));
        } catch (e) {
          DEBUG_BUILD && debug.error("Failed to patch express module:", e);
        }
        return express;
      },
      // we do not ever actually unpatch in our SDKs
      (express) => express
    );
    return module;
  }
}
const _expressIntegration = ((options) => {
  return {
    name: INTEGRATION_NAME$l,
    setupOnce() {
      instrumentExpress(options);
    }
  };
});
const expressIntegration = defineIntegration(_expressIntegration);
var _a, _b;
const PACKAGE_VERSION$4 = SDK_VERSION;
const PACKAGE_NAME$i = "@sentry/instrumentation-fastify";
const SUPPORTED_VERSIONS$2 = ">=4.0.0 <6";
const FASTIFY_HOOKS = [
  "onRequest",
  "preParsing",
  "preValidation",
  "preHandler",
  "preSerialization",
  "onSend",
  "onResponse",
  "onError"
];
const ATTRIBUTE_NAMES = {
  HOOK_NAME: "hook.name",
  FASTIFY_TYPE: "fastify.type",
  HOOK_CALLBACK_NAME: "hook.callback.name",
  ROOT: "fastify.root"
};
const HOOK_TYPES = {
  ROUTE: "route-hook",
  INSTANCE: "hook",
  HANDLER: "request-handler"
};
const ANONYMOUS_FUNCTION_NAME = "anonymous";
const kInstrumentation = /* @__PURE__ */ Symbol("fastify otel instance");
const kRequestSpan = /* @__PURE__ */ Symbol("fastify otel request spans");
const kRequestContext = /* @__PURE__ */ Symbol("fastify otel request context");
const kAddHookOriginal = /* @__PURE__ */ Symbol("fastify otel addhook original");
const kSetNotFoundOriginal = /* @__PURE__ */ Symbol("fastify otel setnotfound original");
const kRecordExceptions = /* @__PURE__ */ Symbol("fastify otel record exceptions");
class FastifyOtelInstrumentation extends (_b = InstrumentationBase, _a = kRecordExceptions, _b) {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$i, PACKAGE_VERSION$4, config2);
    this._otelLogger = null;
    this._requestHook = null;
    this._lifecycleHook = null;
    this._handleInitialization = void 0;
    this[_a] = true;
    this._otelLogger = srcExports$1.diag.createComponentLogger({ namespace: PACKAGE_NAME$i });
    this[kRecordExceptions] = true;
    if (config2?.recordExceptions != null) {
      if (typeof config2.recordExceptions !== "boolean") {
        throw new TypeError("recordExceptions must be a boolean");
      }
      this[kRecordExceptions] = config2.recordExceptions;
    }
    if (typeof config2?.requestHook === "function") {
      this._requestHook = config2.requestHook;
    }
    if (typeof config2?.lifecycleHook === "function") {
      this._lifecycleHook = config2.lifecycleHook;
    }
  }
  enable() {
    if (this._handleInitialization === void 0 && this.getConfig().registerOnInitialization) {
      this._handleInitialization = (message) => {
        this.plugin()(message.fastify, void 0, () => {
        });
        const emptyPlugin = (_, __, done) => {
          done();
        };
        emptyPlugin[/* @__PURE__ */ Symbol.for("skip-override")] = true;
        emptyPlugin[/* @__PURE__ */ Symbol.for("fastify.display-name")] = PACKAGE_NAME$i;
        message.fastify.register(emptyPlugin);
      };
      dc.subscribe("fastify.initialization", this._handleInitialization);
    }
    return super.enable();
  }
  disable() {
    if (this._handleInitialization) {
      dc.unsubscribe("fastify.initialization", this._handleInitialization);
      this._handleInitialization = void 0;
    }
    return super.disable();
  }
  init() {
    return [];
  }
  plugin() {
    const instrumentation = this;
    const pluginAny = FastifyInstrumentationPlugin;
    pluginAny[/* @__PURE__ */ Symbol.for("skip-override")] = true;
    pluginAny[/* @__PURE__ */ Symbol.for("fastify.display-name")] = PACKAGE_NAME$i;
    pluginAny[/* @__PURE__ */ Symbol.for("plugin-meta")] = {
      fastify: SUPPORTED_VERSIONS$2,
      name: PACKAGE_NAME$i
    };
    return FastifyInstrumentationPlugin;
    function FastifyInstrumentationPlugin(instance, _opts, done) {
      instance.decorate(kInstrumentation, instrumentation);
      instance.decorate(kAddHookOriginal, instance.addHook);
      instance.decorate(kSetNotFoundOriginal, instance.setNotFoundHandler);
      instance.decorateRequest("opentelemetry", function opentelemetry() {
        const ctx = this[kRequestContext];
        const span = this[kRequestSpan];
        return {
          enabled: this.routeOptions.config?.otel !== false,
          span,
          tracer: instrumentation.tracer,
          context: ctx,
          inject: (carrier, setter) => {
            return srcExports$1.propagation.inject(ctx, carrier, setter);
          },
          extract: (carrier, getter) => {
            return srcExports$1.propagation.extract(ctx, carrier, getter);
          }
        };
      });
      instance.decorateRequest(kRequestSpan, null);
      instance.decorateRequest(kRequestContext, null);
      instance.addHook("onRoute", function otelWireRoute(routeOptions) {
        if (routeOptions.config?.otel === false) {
          instrumentation._otelLogger.debug(
            `Ignoring route instrumentation ${routeOptions.method} ${routeOptions.url} because it is disabled`
          );
          return;
        }
        for (const hook of FASTIFY_HOOKS) {
          if (routeOptions[hook] != null) {
            const handlerLike = routeOptions[hook];
            if (typeof handlerLike === "function") {
              routeOptions[hook] = handlerWrapper(handlerLike, hook, {
                [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
                [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
                [srcExports.ATTR_HTTP_ROUTE]: routeOptions.url,
                [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handlerLike.name?.length > 0 ? handlerLike.name : ANONYMOUS_FUNCTION_NAME
              });
            } else if (Array.isArray(handlerLike)) {
              const wrappedHandlers = [];
              for (const handler of handlerLike) {
                wrappedHandlers.push(
                  handlerWrapper(handler, hook, {
                    [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route -> ${hook}`,
                    [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.ROUTE,
                    [srcExports.ATTR_HTTP_ROUTE]: routeOptions.url,
                    [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
                  })
                );
              }
              routeOptions[hook] = wrappedHandlers;
            }
          }
        }
        if (routeOptions.onSend != null) {
          routeOptions.onSend = Array.isArray(routeOptions.onSend) ? [...routeOptions.onSend, finalizeResponseSpanHook] : [routeOptions.onSend, finalizeResponseSpanHook];
        } else {
          routeOptions.onSend = finalizeResponseSpanHook;
        }
        if (routeOptions.onError != null) {
          routeOptions.onError = Array.isArray(routeOptions.onError) ? [...routeOptions.onError, recordErrorInSpanHook] : [routeOptions.onError, recordErrorInSpanHook];
        } else {
          routeOptions.onError = recordErrorInSpanHook;
        }
        routeOptions.handler = handlerWrapper(routeOptions.handler, "handler", {
          [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - route-handler`,
          [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.HANDLER,
          [srcExports.ATTR_HTTP_ROUTE]: routeOptions.url,
          [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: routeOptions.handler.name.length > 0 ? routeOptions.handler.name : ANONYMOUS_FUNCTION_NAME
        });
      });
      instance.addHook(
        "onRequest",
        function startRequestSpanHook(request, _reply, hookDone) {
          if (this[kInstrumentation].isEnabled() === false || request.routeOptions.config?.otel === false) {
            return hookDone();
          }
          let ctx = srcExports$1.context.active();
          if (srcExports$1.trace.getSpan(ctx) == null) {
            ctx = srcExports$1.propagation.extract(ctx, request.headers);
          }
          if (request.routeOptions.url != null) {
            setHttpServerSpanRouteAttribute(request.routeOptions.url);
          }
          const attributes = {
            [ATTRIBUTE_NAMES.ROOT]: PACKAGE_NAME$i,
            [srcExports.ATTR_HTTP_REQUEST_METHOD]: request.method,
            [srcExports.ATTR_URL_PATH]: request.url
          };
          if (request.routeOptions.url != null) {
            attributes[srcExports.ATTR_HTTP_ROUTE] = request.routeOptions.url;
          }
          const span = this[kInstrumentation].tracer.startSpan("request", { attributes }, ctx);
          try {
            this[kInstrumentation]._requestHook?.(span, request);
          } catch (err) {
            this[kInstrumentation]._otelLogger.error({ err }, "requestHook threw");
          }
          request[kRequestContext] = srcExports$1.trace.setSpan(ctx, span);
          request[kRequestSpan] = span;
          srcExports$1.context.with(request[kRequestContext], () => {
            hookDone();
          });
        }
      );
      instance.addHook("onResponse", function finalizeNotFoundSpanHook(request, reply, hookDone) {
        const span = request[kRequestSpan];
        if (span != null) {
          span.setAttributes({
            [srcExports.ATTR_HTTP_RESPONSE_STATUS_CODE]: reply.statusCode
          });
          span.end();
        }
        request[kRequestSpan] = null;
        hookDone();
      });
      instance.addHook = addHookPatched;
      instance.setNotFoundHandler = setNotFoundHandlerPatched;
      done();
      function finalizeResponseSpanHook(request, reply, payload, hookDone) {
        const span = request[kRequestSpan];
        if (span != null) {
          if (reply.statusCode >= 500) {
            span.setStatus({ code: srcExports$1.SpanStatusCode.ERROR });
          }
          span.setAttributes({
            [srcExports.ATTR_HTTP_RESPONSE_STATUS_CODE]: reply.statusCode
          });
          span.end();
        }
        request[kRequestSpan] = null;
        hookDone(null, payload);
      }
      function recordErrorInSpanHook(request, _reply, error, hookDone) {
        const span = request[kRequestSpan];
        if (span != null) {
          span.setStatus({
            code: srcExports$1.SpanStatusCode.ERROR,
            message: error.message
          });
          if (instrumentation[kRecordExceptions] !== false) {
            span.recordException(error);
          }
        }
        hookDone();
      }
      function addHookPatched(name, hook) {
        const addHookOriginal = this[kAddHookOriginal];
        if (FASTIFY_HOOKS.includes(name)) {
          return addHookOriginal.call(
            this,
            name,
            handlerWrapper(hook, name, {
              [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - ${name}`,
              [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
              [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hook.name?.length > 0 ? hook.name : ANONYMOUS_FUNCTION_NAME
            })
          );
        } else {
          return addHookOriginal.call(this, name, hook);
        }
      }
      function setNotFoundHandlerPatched(hooks, handler) {
        const setNotFoundHandlerOriginal = this[kSetNotFoundOriginal];
        if (typeof hooks === "function") {
          handler = handlerWrapper(hooks, "notFoundHandler", {
            [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
            [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
            [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.name?.length > 0 ? hooks.name : ANONYMOUS_FUNCTION_NAME
          });
          setNotFoundHandlerOriginal.call(this, handler);
        } else {
          if (hooks.preValidation != null) {
            hooks.preValidation = handlerWrapper(hooks.preValidation, "notFoundHandler - preValidation", {
              [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preValidation`,
              [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
              [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preValidation.name?.length > 0 ? hooks.preValidation.name : ANONYMOUS_FUNCTION_NAME
            });
          }
          if (hooks.preHandler != null) {
            hooks.preHandler = handlerWrapper(hooks.preHandler, "notFoundHandler - preHandler", {
              [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler - preHandler`,
              [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
              [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: hooks.preHandler.name?.length > 0 ? hooks.preHandler.name : ANONYMOUS_FUNCTION_NAME
            });
          }
          handler = handlerWrapper(handler, "notFoundHandler", {
            [ATTRIBUTE_NAMES.HOOK_NAME]: `${this.pluginName} - not-found-handler`,
            [ATTRIBUTE_NAMES.FASTIFY_TYPE]: HOOK_TYPES.INSTANCE,
            [ATTRIBUTE_NAMES.HOOK_CALLBACK_NAME]: handler.name?.length > 0 ? handler.name : ANONYMOUS_FUNCTION_NAME
          });
          setNotFoundHandlerOriginal.call(this, hooks, handler);
        }
      }
      function getRequestFromArgs(args) {
        for (const arg of args) {
          if (arg?.routeOptions && arg.url && arg.method) {
            return arg;
          }
        }
        return null;
      }
      function handlerWrapper(handler, hookName, spanAttributes = {}) {
        return function handlerWrapped(...args) {
          const instrumentation2 = this[kInstrumentation];
          const request = getRequestFromArgs(args);
          if (request === null) {
            instrumentation2._otelLogger.debug(
              `Ignoring route instrumentation because ${hookName} was called without a Fastify request argument`
            );
            return handler.call(this, ...args);
          }
          if (instrumentation2.isEnabled() === false || request.routeOptions.config?.otel === false) {
            instrumentation2._otelLogger.debug(
              `Ignoring route instrumentation ${request.routeOptions.method} ${request.routeOptions.url} because it is disabled`
            );
            return handler.call(this, ...args);
          }
          const ctx = request[kRequestContext] ?? srcExports$1.context.active();
          const handlerName = handler.name?.length > 0 ? handler.name : this.pluginName ?? ANONYMOUS_FUNCTION_NAME;
          const span = instrumentation2.tracer.startSpan(
            `${hookName} - ${handlerName}`,
            {
              attributes: spanAttributes
            },
            ctx
          );
          if (instrumentation2._lifecycleHook != null) {
            try {
              instrumentation2._lifecycleHook(span, {
                hookName,
                request,
                handler: handlerName
              });
            } catch (err) {
              instrumentation2._otelLogger.error({ err }, "Execution of lifecycleHook failed");
            }
          }
          return srcExports$1.context.with(
            srcExports$1.trace.setSpan(ctx, span),
            function() {
              try {
                const res = handler.call(this, ...args);
                if (typeof res?.then === "function") {
                  return res.then(
                    (result) => {
                      span.end();
                      return result;
                    },
                    (error) => {
                      span.setStatus({
                        code: srcExports$1.SpanStatusCode.ERROR,
                        message: error.message
                      });
                      if (instrumentation2[kRecordExceptions] !== false) {
                        span.recordException(error);
                      }
                      span.end();
                      return Promise.reject(error);
                    }
                  );
                }
                span.end();
                return res;
              } catch (error) {
                span.setStatus({
                  code: srcExports$1.SpanStatusCode.ERROR,
                  message: error.message
                });
                if (instrumentation2[kRecordExceptions] !== false) {
                  span.recordException(error);
                }
                span.end();
                throw error;
              }
            },
            this
          );
        };
      }
    }
  }
}
var AttributeNames$7 = /* @__PURE__ */ ((AttributeNames2) => {
  AttributeNames2["FASTIFY_NAME"] = "fastify.name";
  AttributeNames2["FASTIFY_TYPE"] = "fastify.type";
  AttributeNames2["HOOK_NAME"] = "hook.name";
  AttributeNames2["PLUGIN_NAME"] = "plugin.name";
  return AttributeNames2;
})(AttributeNames$7 || {});
var FastifyTypes = /* @__PURE__ */ ((FastifyTypes2) => {
  FastifyTypes2["MIDDLEWARE"] = "middleware";
  FastifyTypes2["REQUEST_HANDLER"] = "request_handler";
  return FastifyTypes2;
})(FastifyTypes || {});
var FastifyNames = /* @__PURE__ */ ((FastifyNames2) => {
  FastifyNames2["MIDDLEWARE"] = "middleware";
  FastifyNames2["REQUEST_HANDLER"] = "request handler";
  return FastifyNames2;
})(FastifyNames || {});
const spanRequestSymbol = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.fastify.request_active_span");
function startSpan(reply, tracer, spanName, spanAttributes = {}) {
  const span = tracer.startSpan(spanName, { attributes: spanAttributes });
  const spans = reply[spanRequestSymbol] || [];
  spans.push(span);
  Object.defineProperty(reply, spanRequestSymbol, {
    enumerable: false,
    configurable: true,
    value: spans
  });
  return span;
}
function endSpan$3(reply, err) {
  const spans = reply[spanRequestSymbol] || [];
  if (!spans.length) {
    return;
  }
  spans.forEach((span) => {
    if (err) {
      span.setStatus({
        code: srcExports$1.SpanStatusCode.ERROR,
        message: err.message
      });
      span.recordException(err);
    }
    span.end();
  });
  delete reply[spanRequestSymbol];
}
function safeExecuteInTheMiddleMaybePromise(execute, onFinish, preventThrowingError) {
  let error;
  let result = void 0;
  try {
    result = execute();
    if (isPromise$1(result)) {
      result.then(
        (res) => onFinish(void 0, res),
        (err) => onFinish(err)
      );
    }
  } catch (e) {
    error = e;
  } finally {
    if (!isPromise$1(result)) {
      onFinish(error, result);
      if (error && true) {
        throw error;
      }
    }
    return result;
  }
}
function isPromise$1(val) {
  return typeof val === "object" && val && typeof Object.getOwnPropertyDescriptor(val, "then")?.value === "function" || false;
}
const PACKAGE_VERSION$3 = "0.1.0";
const PACKAGE_NAME$h = "@sentry/instrumentation-fastify-v3";
const ANONYMOUS_NAME$1 = "anonymous";
const hooksNamesToWrap = /* @__PURE__ */ new Set([
  "onTimeout",
  "onRequest",
  "preParsing",
  "preValidation",
  "preSerialization",
  "preHandler",
  "onSend",
  "onResponse",
  "onError"
]);
class FastifyInstrumentationV3 extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$h, PACKAGE_VERSION$3, config2);
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition("fastify", [">=3.0.0 <4"], (moduleExports) => {
        return this._patchConstructor(moduleExports);
      })
    ];
  }
  _hookOnRequest() {
    const instrumentation = this;
    return function onRequest(request, reply, done) {
      if (!instrumentation.isEnabled()) {
        return done();
      }
      instrumentation._wrap(reply, "send", instrumentation._patchSend());
      const anyRequest = request;
      const routeName = anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath;
      if (routeName) {
        setHttpServerSpanRouteAttribute(routeName);
      }
      const method = request.method || "GET";
      getIsolationScope().setTransactionName(`${method} ${routeName}`);
      done();
    };
  }
  _wrapHandler(pluginName, hookName, original, syncFunctionWithDone) {
    const instrumentation = this;
    this._diag.debug("Patching fastify route.handler function");
    return function(...args) {
      if (!instrumentation.isEnabled()) {
        return original.apply(this, args);
      }
      const name = original.name || pluginName || ANONYMOUS_NAME$1;
      const spanName = `${FastifyNames.MIDDLEWARE} - ${name}`;
      const reply = args[1];
      const span = startSpan(reply, instrumentation.tracer, spanName, {
        [AttributeNames$7.FASTIFY_TYPE]: FastifyTypes.MIDDLEWARE,
        [AttributeNames$7.PLUGIN_NAME]: pluginName,
        [AttributeNames$7.HOOK_NAME]: hookName
      });
      const origDone = syncFunctionWithDone && args[args.length - 1];
      if (origDone) {
        args[args.length - 1] = function(...doneArgs) {
          endSpan$3(reply);
          origDone.apply(this, doneArgs);
        };
      }
      return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
        return safeExecuteInTheMiddleMaybePromise(
          () => {
            return original.apply(this, args);
          },
          (err) => {
            if (err instanceof Error) {
              span.setStatus({
                code: srcExports$1.SpanStatusCode.ERROR,
                message: err.message
              });
              span.recordException(err);
            }
            if (!syncFunctionWithDone) {
              endSpan$3(reply);
            }
          }
        );
      });
    };
  }
  _wrapAddHook() {
    const instrumentation = this;
    this._diag.debug("Patching fastify server.addHook function");
    return function(original) {
      return function wrappedAddHook(...args) {
        const name = args[0];
        const handler = args[1];
        const pluginName = this.pluginName;
        if (!hooksNamesToWrap.has(name)) {
          return original.apply(this, args);
        }
        const syncFunctionWithDone = typeof args[args.length - 1] === "function" && handler.constructor.name !== "AsyncFunction";
        return original.apply(this, [
          name,
          instrumentation._wrapHandler(pluginName, name, handler, syncFunctionWithDone)
        ]);
      };
    };
  }
  _patchConstructor(moduleExports) {
    const instrumentation = this;
    function fastify(...args) {
      const app = moduleExports.fastify.apply(this, args);
      app.addHook("onRequest", instrumentation._hookOnRequest());
      app.addHook("preHandler", instrumentation._hookPreHandler());
      instrumentClient$1();
      instrumentation._wrap(app, "addHook", instrumentation._wrapAddHook());
      return app;
    }
    if (moduleExports.errorCodes !== void 0) {
      fastify.errorCodes = moduleExports.errorCodes;
    }
    fastify.fastify = fastify;
    fastify.default = fastify;
    return fastify;
  }
  _patchSend() {
    const instrumentation = this;
    this._diag.debug("Patching fastify reply.send function");
    return function patchSend(original) {
      return function send(...args) {
        const maybeError = args[0];
        if (!instrumentation.isEnabled()) {
          return original.apply(this, args);
        }
        return safeExecuteInTheMiddle(
          () => {
            return original.apply(this, args);
          },
          (err) => {
            if (!err && maybeError instanceof Error) {
              err = maybeError;
            }
            endSpan$3(this, err);
          }
        );
      };
    };
  }
  _hookPreHandler() {
    const instrumentation = this;
    this._diag.debug("Patching fastify preHandler function");
    return function preHandler(request, reply, done) {
      if (!instrumentation.isEnabled()) {
        return done();
      }
      const anyRequest = request;
      const handler = anyRequest.routeOptions?.handler || anyRequest.context?.handler;
      const handlerName = handler?.name.startsWith("bound ") ? handler.name.substring(6) : handler?.name;
      const spanName = `${FastifyNames.REQUEST_HANDLER} - ${handlerName || this.pluginName || ANONYMOUS_NAME$1}`;
      const spanAttributes = {
        [AttributeNames$7.PLUGIN_NAME]: this.pluginName,
        [AttributeNames$7.FASTIFY_TYPE]: FastifyTypes.REQUEST_HANDLER,
        // eslint-disable-next-line deprecation/deprecation
        [srcExports.SEMATTRS_HTTP_ROUTE]: anyRequest.routeOptions ? anyRequest.routeOptions.url : request.routerPath
      };
      if (handlerName) {
        spanAttributes[AttributeNames$7.FASTIFY_NAME] = handlerName;
      }
      const span = startSpan(reply, instrumentation.tracer, spanName, spanAttributes);
      addFastifyV3SpanAttributes(span);
      const { requestHook } = instrumentation.getConfig();
      if (requestHook) {
        safeExecuteInTheMiddle(
          () => requestHook(span, { request }),
          (e) => {
            if (e) {
              instrumentation._diag.error("request hook failed", e);
            }
          },
          true
        );
      }
      return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
        done();
      });
    };
  }
}
function instrumentClient$1() {
  const client = getClient();
  if (client) {
    client.on("spanStart", (span) => {
      addFastifyV3SpanAttributes(span);
    });
  }
}
function addFastifyV3SpanAttributes(span) {
  const attributes = spanToJSON(span).data;
  const type = attributes["fastify.type"];
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.fastify`
  });
  const name = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
  if (typeof name === "string") {
    const updatedName = name.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "");
    span.updateName(updatedName);
  }
}
const INTEGRATION_NAME$k = "Fastify";
const instrumentFastifyV3 = generateInstrumentOnce(
  `${INTEGRATION_NAME$k}.v3`,
  () => new FastifyInstrumentationV3()
);
function getFastifyIntegration() {
  const client = getClient();
  if (!client) {
    return void 0;
  } else {
    return client.getIntegrationByName(INTEGRATION_NAME$k);
  }
}
function handleFastifyError(error, request, reply, handlerOrigin) {
  const shouldHandleError = getFastifyIntegration()?.getShouldHandleError() || defaultShouldHandleError;
  if (handlerOrigin === "diagnostics-channel") {
    this.diagnosticsChannelExists = true;
  }
  if (this.diagnosticsChannelExists && handlerOrigin === "onError-hook") {
    DEBUG_BUILD && debug.warn(
      "Fastify error handler was already registered via diagnostics channel.",
      "You can safely remove `setupFastifyErrorHandler` call and set `shouldHandleError` on the integration options."
    );
    return;
  }
  if (shouldHandleError(error, request, reply)) {
    captureException(error, { mechanism: { handled: false, type: "auto.function.fastify" } });
  }
}
const instrumentFastify = generateInstrumentOnce(`${INTEGRATION_NAME$k}.v5`, () => {
  const fastifyOtelInstrumentationInstance = new FastifyOtelInstrumentation();
  const plugin = fastifyOtelInstrumentationInstance.plugin();
  dc.subscribe("fastify.initialization", (message) => {
    const fastifyInstance = message.fastify;
    fastifyInstance?.register(plugin).after((err) => {
      if (err) {
        DEBUG_BUILD && debug.error("Failed to setup Fastify instrumentation", err);
      } else {
        instrumentClient();
        if (fastifyInstance) {
          instrumentOnRequest(fastifyInstance);
        }
      }
    });
  });
  dc.subscribe("tracing:fastify.request.handler:error", (message) => {
    const { error, request, reply } = message;
    handleFastifyError.call(handleFastifyError, error, request, reply, "diagnostics-channel");
  });
  return fastifyOtelInstrumentationInstance;
});
const _fastifyIntegration = (({ shouldHandleError }) => {
  let _shouldHandleError;
  return {
    name: INTEGRATION_NAME$k,
    setupOnce() {
      _shouldHandleError = shouldHandleError || defaultShouldHandleError;
      instrumentFastifyV3();
      instrumentFastify();
    },
    getShouldHandleError() {
      return _shouldHandleError;
    },
    setShouldHandleError(fn) {
      _shouldHandleError = fn;
    }
  };
});
const fastifyIntegration = defineIntegration(
  (options = {}) => _fastifyIntegration(options)
);
function defaultShouldHandleError(_error, _request, reply) {
  const statusCode = reply.statusCode;
  return statusCode >= 500 || statusCode <= 299;
}
function addFastifySpanAttributes(span) {
  const spanJSON = spanToJSON(span);
  const spanName = spanJSON.description;
  const attributes = spanJSON.data;
  const type = attributes["fastify.type"];
  const isHook = type === "hook";
  const isHandler = type === spanName?.startsWith("handler -");
  const isRequestHandler = spanName === "request" || type === "request-handler";
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !isHandler && !isRequestHandler && !isHook) {
    return;
  }
  const opPrefix = isHook ? "hook" : isHandler ? "middleware" : isRequestHandler ? "request_handler" : "<unknown>";
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.fastify",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${opPrefix}.fastify`
  });
  const attrName = attributes["fastify.name"] || attributes["plugin.name"] || attributes["hook.name"];
  if (typeof attrName === "string") {
    const updatedName = attrName.replace(/^fastify -> /, "").replace(/^@fastify\/otel -> /, "").replace(/^@sentry\/instrumentation-fastify -> /, "");
    span.updateName(updatedName);
  }
}
function instrumentClient() {
  const client = getClient();
  if (client) {
    client.on("spanStart", (span) => {
      addFastifySpanAttributes(span);
    });
  }
}
function instrumentOnRequest(fastify) {
  fastify.addHook("onRequest", async (request, _reply) => {
    if (request.opentelemetry) {
      const { span } = request.opentelemetry();
      if (span) {
        addFastifySpanAttributes(span);
      }
    }
    const routeName = request.routeOptions?.url;
    const method = request.method || "GET";
    getIsolationScope().setTransactionName(`${method} ${routeName}`);
  });
}
class InstrumentationNodeModuleFile {
  constructor(name, supportedVersions2, patch, unpatch) {
    this.name = normalize(name);
    this.supportedVersions = supportedVersions2;
    this.patch = patch;
    this.unpatch = unpatch;
  }
}
var AllowedOperationTypes = /* @__PURE__ */ ((AllowedOperationTypes2) => {
  AllowedOperationTypes2["QUERY"] = "query";
  AllowedOperationTypes2["MUTATION"] = "mutation";
  AllowedOperationTypes2["SUBSCRIPTION"] = "subscription";
  return AllowedOperationTypes2;
})(AllowedOperationTypes || {});
var TokenKind = /* @__PURE__ */ ((TokenKind2) => {
  TokenKind2["SOF"] = "<SOF>";
  TokenKind2["EOF"] = "<EOF>";
  TokenKind2["BANG"] = "!";
  TokenKind2["DOLLAR"] = "$";
  TokenKind2["AMP"] = "&";
  TokenKind2["PAREN_L"] = "(";
  TokenKind2["PAREN_R"] = ")";
  TokenKind2["SPREAD"] = "...";
  TokenKind2["COLON"] = ":";
  TokenKind2["EQUALS"] = "=";
  TokenKind2["AT"] = "@";
  TokenKind2["BRACKET_L"] = "[";
  TokenKind2["BRACKET_R"] = "]";
  TokenKind2["BRACE_L"] = "{";
  TokenKind2["PIPE"] = "|";
  TokenKind2["BRACE_R"] = "}";
  TokenKind2["NAME"] = "Name";
  TokenKind2["INT"] = "Int";
  TokenKind2["FLOAT"] = "Float";
  TokenKind2["STRING"] = "String";
  TokenKind2["BLOCK_STRING"] = "BlockString";
  TokenKind2["COMMENT"] = "Comment";
  return TokenKind2;
})(TokenKind || {});
var SpanNames$1 = /* @__PURE__ */ ((SpanNames2) => {
  SpanNames2["EXECUTE"] = "graphql.execute";
  SpanNames2["PARSE"] = "graphql.parse";
  SpanNames2["RESOLVE"] = "graphql.resolve";
  SpanNames2["VALIDATE"] = "graphql.validate";
  SpanNames2["SCHEMA_VALIDATE"] = "graphql.validateSchema";
  SpanNames2["SCHEMA_PARSE"] = "graphql.parseSchema";
  return SpanNames2;
})(SpanNames$1 || {});
var AttributeNames$6 = /* @__PURE__ */ ((AttributeNames2) => {
  AttributeNames2["SOURCE"] = "graphql.source";
  AttributeNames2["FIELD_NAME"] = "graphql.field.name";
  AttributeNames2["FIELD_PATH"] = "graphql.field.path";
  AttributeNames2["FIELD_TYPE"] = "graphql.field.type";
  AttributeNames2["PARENT_NAME"] = "graphql.parent.name";
  AttributeNames2["OPERATION_TYPE"] = "graphql.operation.type";
  AttributeNames2["OPERATION_NAME"] = "graphql.operation.name";
  AttributeNames2["VARIABLES"] = "graphql.variables.";
  AttributeNames2["ERROR_VALIDATION_NAME"] = "graphql.validation.error";
  return AttributeNames2;
})(AttributeNames$6 || {});
const OTEL_PATCHED_SYMBOL = /* @__PURE__ */ Symbol.for("opentelemetry.patched");
const OTEL_GRAPHQL_DATA_SYMBOL = /* @__PURE__ */ Symbol.for("opentelemetry.graphql_data");
const OPERATION_NOT_SUPPORTED = "Operation$operationName$not supported";
const OPERATION_VALUES = Object.values(AllowedOperationTypes);
const isPromise = (value) => {
  return typeof value?.then === "function";
};
const isObjectLike = (value) => {
  return typeof value == "object" && value !== null;
};
function addInputVariableAttribute(span, key, variable) {
  if (Array.isArray(variable)) {
    variable.forEach((value, idx) => {
      addInputVariableAttribute(span, `${key}.${idx}`, value);
    });
  } else if (variable instanceof Object) {
    Object.entries(variable).forEach(([nestedKey, value]) => {
      addInputVariableAttribute(span, `${key}.${nestedKey}`, value);
    });
  } else {
    span.setAttribute(`${AttributeNames$6.VARIABLES}${String(key)}`, variable);
  }
}
function addInputVariableAttributes(span, variableValues) {
  Object.entries(variableValues).forEach(([key, value]) => {
    addInputVariableAttribute(span, key, value);
  });
}
function addSpanSource(span, loc, allowValues, start, end) {
  const source = getSourceFromLocation(loc, allowValues, start, end);
  span.setAttribute(AttributeNames$6.SOURCE, source);
}
function createFieldIfNotExists(tracer, getConfig2, contextValue, info, path) {
  let field = getField(contextValue, path);
  if (field) {
    return { field, spanAdded: false };
  }
  const config2 = getConfig2();
  const parentSpan = config2.flatResolveSpans ? getRootSpan(contextValue) : getParentFieldSpan(contextValue, path);
  field = {
    span: createResolverSpan(tracer, getConfig2, contextValue, info, path, parentSpan)
  };
  addField(contextValue, path, field);
  return { field, spanAdded: true };
}
function createResolverSpan(tracer, getConfig2, contextValue, info, path, parentSpan) {
  const attributes = {
    [AttributeNames$6.FIELD_NAME]: info.fieldName,
    [AttributeNames$6.FIELD_PATH]: path.join("."),
    [AttributeNames$6.FIELD_TYPE]: info.returnType.toString(),
    [AttributeNames$6.PARENT_NAME]: info.parentType.name
  };
  const span = tracer.startSpan(
    `${SpanNames$1.RESOLVE} ${attributes[AttributeNames$6.FIELD_PATH]}`,
    {
      attributes
    },
    parentSpan ? srcExports$1.trace.setSpan(srcExports$1.context.active(), parentSpan) : void 0
  );
  const document = contextValue[OTEL_GRAPHQL_DATA_SYMBOL].source;
  const fieldNode = info.fieldNodes.find((fieldNode2) => fieldNode2.kind === "Field");
  if (fieldNode) {
    addSpanSource(span, document.loc, getConfig2().allowValues, fieldNode.loc?.start, fieldNode.loc?.end);
  }
  return span;
}
function endSpan$2(span, error) {
  if (error) {
    span.recordException(error);
  }
  span.end();
}
function getOperation(document, operationName) {
  if (!document || !Array.isArray(document.definitions)) {
    return void 0;
  }
  if (operationName) {
    return document.definitions.filter((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1).find((definition) => operationName === definition?.name?.value);
  } else {
    return document.definitions.find((definition) => OPERATION_VALUES.indexOf(definition?.operation) !== -1);
  }
}
function addField(contextValue, path, field) {
  return contextValue[OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")] = field;
}
function getField(contextValue, path) {
  return contextValue[OTEL_GRAPHQL_DATA_SYMBOL].fields[path.join(".")];
}
function getParentFieldSpan(contextValue, path) {
  for (let i = path.length - 1; i > 0; i--) {
    const field = getField(contextValue, path.slice(0, i));
    if (field) {
      return field.span;
    }
  }
  return getRootSpan(contextValue);
}
function getRootSpan(contextValue) {
  return contextValue[OTEL_GRAPHQL_DATA_SYMBOL].span;
}
function pathToArray(mergeItems, path) {
  const flattened = [];
  let curr = path;
  while (curr) {
    let key = curr.key;
    if (mergeItems && typeof key === "number") {
      key = "*";
    }
    flattened.push(String(key));
    curr = curr.prev;
  }
  return flattened.reverse();
}
function repeatBreak(i) {
  return repeatChar("\n", i);
}
function repeatSpace(i) {
  return repeatChar(" ", i);
}
function repeatChar(char, to) {
  let text = "";
  for (let i = 0; i < to; i++) {
    text += char;
  }
  return text;
}
const KindsToBeRemoved = [TokenKind.FLOAT, TokenKind.STRING, TokenKind.INT, TokenKind.BLOCK_STRING];
function getSourceFromLocation(loc, allowValues = false, inputStart, inputEnd) {
  let source = "";
  if (loc?.startToken) {
    const start = typeof inputStart === "number" ? inputStart : loc.start;
    const end = typeof inputEnd === "number" ? inputEnd : loc.end;
    let next = loc.startToken.next;
    let previousLine = 1;
    while (next) {
      if (next.start < start) {
        next = next.next;
        previousLine = next?.line;
        continue;
      }
      if (next.end > end) {
        next = next.next;
        previousLine = next?.line;
        continue;
      }
      let value = next.value || next.kind;
      let space = "";
      if (!allowValues && KindsToBeRemoved.indexOf(next.kind) >= 0) {
        value = "*";
      }
      if (next.kind === TokenKind.STRING) {
        value = `"${value}"`;
      }
      if (next.kind === TokenKind.EOF) {
        value = "";
      }
      if (next.line > previousLine) {
        source += repeatBreak(next.line - previousLine);
        previousLine = next.line;
        space = repeatSpace(next.column - 1);
      } else {
        if (next.line === next.prev?.line) {
          space = repeatSpace(next.start - (next.prev?.end || 0));
        }
      }
      source += space + value;
      if (next) {
        next = next.next;
      }
    }
  }
  return source;
}
function wrapFields(type, tracer, getConfig2) {
  if (!type || type[OTEL_PATCHED_SYMBOL]) {
    return;
  }
  const fields = type.getFields();
  type[OTEL_PATCHED_SYMBOL] = true;
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field) {
      return;
    }
    if (field.resolve) {
      field.resolve = wrapFieldResolver(tracer, getConfig2, field.resolve);
    }
    if (field.type) {
      const unwrappedTypes = unwrapType(field.type);
      for (const unwrappedType of unwrappedTypes) {
        wrapFields(unwrappedType, tracer, getConfig2);
      }
    }
  });
}
function unwrapType(type) {
  if ("ofType" in type) {
    return unwrapType(type.ofType);
  }
  if (isGraphQLUnionType(type)) {
    return type.getTypes();
  }
  if (isGraphQLObjectType(type)) {
    return [type];
  }
  return [];
}
function isGraphQLUnionType(type) {
  return "getTypes" in type && typeof type.getTypes === "function";
}
function isGraphQLObjectType(type) {
  return "getFields" in type && typeof type.getFields === "function";
}
const handleResolveSpanError = (resolveSpan, err, shouldEndSpan) => {
  if (!shouldEndSpan) {
    return;
  }
  resolveSpan.recordException(err);
  resolveSpan.setStatus({
    code: srcExports$1.SpanStatusCode.ERROR,
    message: err.message
  });
  resolveSpan.end();
};
const handleResolveSpanSuccess = (resolveSpan, shouldEndSpan) => {
  if (!shouldEndSpan) {
    return;
  }
  resolveSpan.end();
};
function wrapFieldResolver(tracer, getConfig2, fieldResolver, isDefaultResolver = false) {
  if (wrappedFieldResolver[OTEL_PATCHED_SYMBOL] || typeof fieldResolver !== "function") {
    return fieldResolver;
  }
  function wrappedFieldResolver(source, args, contextValue, info) {
    if (!fieldResolver) {
      return void 0;
    }
    const config2 = getConfig2();
    if (config2.ignoreTrivialResolveSpans && isDefaultResolver && (isObjectLike(source) || typeof source === "function")) {
      const property = source[info.fieldName];
      if (typeof property !== "function") {
        return fieldResolver.call(this, source, args, contextValue, info);
      }
    }
    if (!contextValue[OTEL_GRAPHQL_DATA_SYMBOL]) {
      return fieldResolver.call(this, source, args, contextValue, info);
    }
    const path = pathToArray(config2.mergeItems, info && info.path);
    const depth = path.filter((item) => typeof item === "string").length;
    let span;
    let shouldEndSpan = false;
    if (config2.depth >= 0 && config2.depth < depth) {
      span = getParentFieldSpan(contextValue, path);
    } else {
      const { field, spanAdded } = createFieldIfNotExists(tracer, getConfig2, contextValue, info, path);
      span = field.span;
      shouldEndSpan = spanAdded;
    }
    return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
      try {
        const res = fieldResolver.call(this, source, args, contextValue, info);
        if (isPromise(res)) {
          return res.then(
            (r) => {
              handleResolveSpanSuccess(span, shouldEndSpan);
              return r;
            },
            (err) => {
              handleResolveSpanError(span, err, shouldEndSpan);
              throw err;
            }
          );
        } else {
          handleResolveSpanSuccess(span, shouldEndSpan);
          return res;
        }
      } catch (err) {
        handleResolveSpanError(span, err, shouldEndSpan);
        throw err;
      }
    });
  }
  wrappedFieldResolver[OTEL_PATCHED_SYMBOL] = true;
  return wrappedFieldResolver;
}
const PACKAGE_NAME$g = "@sentry/instrumentation-graphql";
const DEFAULT_CONFIG$4 = {
  mergeItems: false,
  depth: -1,
  allowValues: false,
  ignoreResolveSpans: false
};
const supportedVersions$7 = [">=14.0.0 <17"];
class GraphQLInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$g, SDK_VERSION, { ...DEFAULT_CONFIG$4, ...config2 });
  }
  setConfig(config2 = {}) {
    super.setConfig({ ...DEFAULT_CONFIG$4, ...config2 });
  }
  init() {
    const module = new InstrumentationNodeModuleDefinition("graphql", supportedVersions$7);
    module.files.push(this._addPatchingExecute());
    module.files.push(this._addPatchingParser());
    module.files.push(this._addPatchingValidate());
    return module;
  }
  _addPatchingExecute() {
    return new InstrumentationNodeModuleFile(
      "graphql/execution/execute.js",
      supportedVersions$7,
      // cannot make it work with appropriate type as execute function has 2
      //types and/cannot import function but only types
      (moduleExports) => {
        if (isWrapped(moduleExports.execute)) {
          this._unwrap(moduleExports, "execute");
        }
        this._wrap(moduleExports, "execute", this._patchExecute(moduleExports.defaultFieldResolver));
        return moduleExports;
      },
      (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "execute");
        }
      }
    );
  }
  _addPatchingParser() {
    return new InstrumentationNodeModuleFile(
      "graphql/language/parser.js",
      supportedVersions$7,
      (moduleExports) => {
        if (isWrapped(moduleExports.parse)) {
          this._unwrap(moduleExports, "parse");
        }
        this._wrap(moduleExports, "parse", this._patchParse());
        return moduleExports;
      },
      (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "parse");
        }
      }
    );
  }
  _addPatchingValidate() {
    return new InstrumentationNodeModuleFile(
      "graphql/validation/validate.js",
      supportedVersions$7,
      (moduleExports) => {
        if (isWrapped(moduleExports.validate)) {
          this._unwrap(moduleExports, "validate");
        }
        this._wrap(moduleExports, "validate", this._patchValidate());
        return moduleExports;
      },
      (moduleExports) => {
        if (moduleExports) {
          this._unwrap(moduleExports, "validate");
        }
      }
    );
  }
  _patchExecute(defaultFieldResolved) {
    const instrumentation = this;
    return function execute(original) {
      return function patchExecute() {
        let processedArgs;
        if (arguments.length >= 2) {
          const args = arguments;
          processedArgs = instrumentation._wrapExecuteArgs(
            args[0],
            args[1],
            args[2],
            args[3],
            args[4],
            args[5],
            args[6],
            args[7],
            defaultFieldResolved
          );
        } else {
          const args = arguments[0];
          processedArgs = instrumentation._wrapExecuteArgs(
            args.schema,
            args.document,
            args.rootValue,
            args.contextValue,
            args.variableValues,
            args.operationName,
            args.fieldResolver,
            args.typeResolver,
            defaultFieldResolved
          );
        }
        const operation = getOperation(processedArgs.document, processedArgs.operationName);
        const span = instrumentation._createExecuteSpan(operation, processedArgs);
        processedArgs.contextValue[OTEL_GRAPHQL_DATA_SYMBOL] = {
          source: processedArgs.document ? processedArgs.document || processedArgs.document[OTEL_GRAPHQL_DATA_SYMBOL] : void 0,
          span,
          fields: {}
        };
        return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
          return safeExecuteInTheMiddle(
            () => {
              return original.apply(this, [processedArgs]);
            },
            (err, result) => {
              instrumentation._handleExecutionResult(span, err, result);
            }
          );
        });
      };
    };
  }
  _handleExecutionResult(span, err, result) {
    const config2 = this.getConfig();
    if (result === void 0 || err) {
      endSpan$2(span, err);
      return;
    }
    if (isPromise(result)) {
      result.then(
        (resultData) => {
          if (typeof config2.responseHook !== "function") {
            endSpan$2(span);
            return;
          }
          this._executeResponseHook(span, resultData);
        },
        (error) => {
          endSpan$2(span, error);
        }
      );
    } else {
      if (typeof config2.responseHook !== "function") {
        endSpan$2(span);
        return;
      }
      this._executeResponseHook(span, result);
    }
  }
  _executeResponseHook(span, result) {
    const { responseHook } = this.getConfig();
    if (!responseHook) {
      return;
    }
    safeExecuteInTheMiddle(
      () => {
        responseHook(span, result);
      },
      (err) => {
        if (err) {
          this._diag.error("Error running response hook", err);
        }
        endSpan$2(span, void 0);
      },
      true
    );
  }
  _patchParse() {
    const instrumentation = this;
    return function parse(original) {
      return function patchParse(source, options) {
        return instrumentation._parse(this, original, source, options);
      };
    };
  }
  _patchValidate() {
    const instrumentation = this;
    return function validate(original) {
      return function patchValidate(schema, documentAST, rules, options, typeInfo) {
        return instrumentation._validate(this, original, schema, documentAST, rules, typeInfo, options);
      };
    };
  }
  _parse(obj, original, source, options) {
    const config2 = this.getConfig();
    const span = this.tracer.startSpan(SpanNames$1.PARSE);
    return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
      return safeExecuteInTheMiddle(
        () => {
          return original.call(obj, source, options);
        },
        (err, result) => {
          if (result) {
            const operation = getOperation(result);
            if (!operation) {
              span.updateName(SpanNames$1.SCHEMA_PARSE);
            } else if (result.loc) {
              addSpanSource(span, result.loc, config2.allowValues);
            }
          }
          endSpan$2(span, err);
        }
      );
    });
  }
  _validate(obj, original, schema, documentAST, rules, typeInfo, options) {
    const span = this.tracer.startSpan(SpanNames$1.VALIDATE, {});
    return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
      return safeExecuteInTheMiddle(
        () => {
          return original.call(obj, schema, documentAST, rules, options, typeInfo);
        },
        (err, errors) => {
          if (!documentAST.loc) {
            span.updateName(SpanNames$1.SCHEMA_VALIDATE);
          }
          if (errors && errors.length) {
            span.recordException({
              name: AttributeNames$6.ERROR_VALIDATION_NAME,
              message: JSON.stringify(errors)
            });
          }
          endSpan$2(span, err);
        }
      );
    });
  }
  _createExecuteSpan(operation, processedArgs) {
    const config2 = this.getConfig();
    const span = this.tracer.startSpan(SpanNames$1.EXECUTE, {});
    if (operation) {
      const { operation: operationType, name: nameNode } = operation;
      span.setAttribute(AttributeNames$6.OPERATION_TYPE, operationType);
      const operationName = nameNode?.value;
      if (operationName) {
        span.setAttribute(AttributeNames$6.OPERATION_NAME, operationName);
        span.updateName(`${operationType} ${operationName}`);
      } else {
        span.updateName(operationType);
      }
    } else {
      let operationName = " ";
      if (processedArgs.operationName) {
        operationName = ` "${processedArgs.operationName}" `;
      }
      operationName = OPERATION_NOT_SUPPORTED.replace("$operationName$", operationName);
      span.setAttribute(AttributeNames$6.OPERATION_NAME, operationName);
    }
    if (processedArgs.document?.loc) {
      addSpanSource(span, processedArgs.document.loc, config2.allowValues);
    }
    if (processedArgs.variableValues && config2.allowValues) {
      addInputVariableAttributes(span, processedArgs.variableValues);
    }
    return span;
  }
  _wrapExecuteArgs(schema, document, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver, defaultFieldResolved) {
    if (!contextValue) {
      contextValue = {};
    }
    if (contextValue[OTEL_GRAPHQL_DATA_SYMBOL] || this.getConfig().ignoreResolveSpans) {
      return {
        schema,
        document,
        rootValue,
        contextValue,
        variableValues,
        operationName,
        fieldResolver,
        typeResolver
      };
    }
    const isUsingDefaultResolver = fieldResolver == null;
    const fieldResolverForExecute = fieldResolver ?? defaultFieldResolved;
    fieldResolver = wrapFieldResolver(
      this.tracer,
      () => this.getConfig(),
      fieldResolverForExecute,
      isUsingDefaultResolver
    );
    if (schema) {
      wrapFields(schema.getQueryType(), this.tracer, () => this.getConfig());
      wrapFields(schema.getMutationType(), this.tracer, () => this.getConfig());
    }
    return {
      schema,
      document,
      rootValue,
      contextValue,
      variableValues,
      operationName,
      fieldResolver,
      typeResolver
    };
  }
}
const INTEGRATION_NAME$j = "Graphql";
const instrumentGraphql = generateInstrumentOnce(
  INTEGRATION_NAME$j,
  GraphQLInstrumentation,
  (_options) => {
    const options = getOptionsWithDefaults(_options);
    return {
      ...options,
      responseHook(span, result) {
        addOriginToSpan(span, "auto.graphql.otel.graphql");
        const resultWithMaybeError = result;
        if (resultWithMaybeError.errors?.length && !spanToJSON(span).status) {
          span.setStatus({ code: srcExports$1.SpanStatusCode.ERROR });
        }
        const attributes = spanToJSON(span).data;
        const operationType = attributes["graphql.operation.type"];
        const operationName = attributes["graphql.operation.name"];
        if (options.useOperationNameForRootSpan && operationType) {
          const rootSpan = getRootSpan$1(span);
          const rootSpanAttributes = spanToJSON(rootSpan).data;
          const existingOperations = rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION] || [];
          const newOperation = operationName ? `${operationType} ${operationName}` : `${operationType}`;
          if (Array.isArray(existingOperations)) {
            existingOperations.push(newOperation);
            rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, existingOperations);
          } else if (typeof existingOperations === "string") {
            rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, [existingOperations, newOperation]);
          } else {
            rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_GRAPHQL_OPERATION, newOperation);
          }
          if (!spanToJSON(rootSpan).data["original-description"]) {
            rootSpan.setAttribute("original-description", spanToJSON(rootSpan).description);
          }
          rootSpan.updateName(
            `${spanToJSON(rootSpan).data["original-description"]} (${getGraphqlOperationNamesFromAttribute(
              existingOperations
            )})`
          );
        }
      }
    };
  }
);
const _graphqlIntegration = ((options = {}) => {
  return {
    name: INTEGRATION_NAME$j,
    setupOnce() {
      instrumentGraphql(getOptionsWithDefaults(options));
    }
  };
});
const graphqlIntegration = defineIntegration(_graphqlIntegration);
function getOptionsWithDefaults(options) {
  return {
    ignoreResolveSpans: true,
    ignoreTrivialResolveSpans: true,
    useOperationNameForRootSpan: true,
    ...options
  };
}
function getGraphqlOperationNamesFromAttribute(attr) {
  if (Array.isArray(attr)) {
    const sorted = attr.slice().sort();
    if (sorted.length <= 5) {
      return sorted.join(", ");
    } else {
      return `${sorted.slice(0, 5).join(", ")}, +${sorted.length - 5}`;
    }
  }
  return `${attr}`;
}
const EVENT_LISTENERS_SET$1 = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.kafkajs.eventListenersSet");
const bufferTextMapGetter = {
  get(carrier, key) {
    if (!carrier) {
      return void 0;
    }
    const keys = Object.keys(carrier);
    for (const carrierKey of keys) {
      if (carrierKey === key || carrierKey.toLowerCase() === key) {
        return carrier[carrierKey]?.toString();
      }
    }
    return void 0;
  },
  keys(carrier) {
    return carrier ? Object.keys(carrier) : [];
  }
};
const ATTR_MESSAGING_BATCH_MESSAGE_COUNT = "messaging.batch.message_count";
const ATTR_MESSAGING_DESTINATION_NAME = "messaging.destination.name";
const ATTR_MESSAGING_DESTINATION_PARTITION_ID = "messaging.destination.partition.id";
const ATTR_MESSAGING_KAFKA_MESSAGE_KEY = "messaging.kafka.message.key";
const ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE = "messaging.kafka.message.tombstone";
const ATTR_MESSAGING_KAFKA_OFFSET = "messaging.kafka.offset";
const ATTR_MESSAGING_OPERATION_NAME = "messaging.operation.name";
const ATTR_MESSAGING_OPERATION_TYPE = "messaging.operation.type";
const ATTR_MESSAGING_SYSTEM$1 = "messaging.system";
const MESSAGING_OPERATION_TYPE_VALUE_PROCESS = "process";
const MESSAGING_OPERATION_TYPE_VALUE_RECEIVE = "receive";
const MESSAGING_OPERATION_TYPE_VALUE_SEND = "send";
const MESSAGING_SYSTEM_VALUE_KAFKA = "kafka";
const METRIC_MESSAGING_CLIENT_CONSUMED_MESSAGES = "messaging.client.consumed.messages";
const METRIC_MESSAGING_CLIENT_OPERATION_DURATION = "messaging.client.operation.duration";
const METRIC_MESSAGING_CLIENT_SENT_MESSAGES = "messaging.client.sent.messages";
const METRIC_MESSAGING_PROCESS_DURATION = "messaging.process.duration";
const PACKAGE_NAME$f = "@sentry/instrumentation-kafkajs";
function prepareCounter(meter, value, attributes) {
  return (errorType) => {
    meter.add(value, {
      ...attributes,
      ...errorType ? { [srcExports.ATTR_ERROR_TYPE]: errorType } : {}
    });
  };
}
function prepareDurationHistogram(meter, value, attributes) {
  return (errorType) => {
    meter.record((Date.now() - value) / 1e3, {
      ...attributes,
      ...errorType ? { [srcExports.ATTR_ERROR_TYPE]: errorType } : {}
    });
  };
}
const HISTOGRAM_BUCKET_BOUNDARIES = [5e-3, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10];
class KafkaJsInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$f, SDK_VERSION, config2);
  }
  _updateMetricInstruments() {
    this._clientDuration = this.meter.createHistogram(METRIC_MESSAGING_CLIENT_OPERATION_DURATION, {
      advice: { explicitBucketBoundaries: HISTOGRAM_BUCKET_BOUNDARIES }
    });
    this._sentMessages = this.meter.createCounter(METRIC_MESSAGING_CLIENT_SENT_MESSAGES);
    this._consumedMessages = this.meter.createCounter(METRIC_MESSAGING_CLIENT_CONSUMED_MESSAGES);
    this._processDuration = this.meter.createHistogram(METRIC_MESSAGING_PROCESS_DURATION, {
      advice: { explicitBucketBoundaries: HISTOGRAM_BUCKET_BOUNDARIES }
    });
  }
  init() {
    const unpatch = (moduleExports) => {
      if (isWrapped(moduleExports?.Kafka?.prototype.producer)) {
        this._unwrap(moduleExports.Kafka.prototype, "producer");
      }
      if (isWrapped(moduleExports?.Kafka?.prototype.consumer)) {
        this._unwrap(moduleExports.Kafka.prototype, "consumer");
      }
    };
    const module = new InstrumentationNodeModuleDefinition(
      "kafkajs",
      [">=0.3.0 <3"],
      (moduleExports) => {
        unpatch(moduleExports);
        this._wrap(moduleExports?.Kafka?.prototype, "producer", this._getProducerPatch());
        this._wrap(moduleExports?.Kafka?.prototype, "consumer", this._getConsumerPatch());
        return moduleExports;
      },
      unpatch
    );
    return module;
  }
  _getConsumerPatch() {
    const instrumentation = this;
    return (original) => {
      return function consumer(...args) {
        const newConsumer = original.apply(this, args);
        if (isWrapped(newConsumer.run)) {
          instrumentation._unwrap(newConsumer, "run");
        }
        instrumentation._wrap(newConsumer, "run", instrumentation._getConsumerRunPatch());
        instrumentation._setKafkaEventListeners(newConsumer);
        return newConsumer;
      };
    };
  }
  _setKafkaEventListeners(kafkaObj) {
    if (kafkaObj[EVENT_LISTENERS_SET$1]) return;
    if (kafkaObj.events?.REQUEST) {
      kafkaObj.on(kafkaObj.events.REQUEST, this._recordClientDurationMetric.bind(this));
    }
    kafkaObj[EVENT_LISTENERS_SET$1] = true;
  }
  _recordClientDurationMetric(event) {
    const [address = "", port = "0"] = event.payload.broker.split(":");
    this._clientDuration.record(event.payload.duration / 1e3, {
      [ATTR_MESSAGING_SYSTEM$1]: MESSAGING_SYSTEM_VALUE_KAFKA,
      [ATTR_MESSAGING_OPERATION_NAME]: `${event.payload.apiName}`,
      [srcExports.ATTR_SERVER_ADDRESS]: address,
      [srcExports.ATTR_SERVER_PORT]: Number.parseInt(port, 10)
    });
  }
  _getProducerPatch() {
    const instrumentation = this;
    return (original) => {
      return function consumer(...args) {
        const newProducer = original.apply(this, args);
        if (isWrapped(newProducer.sendBatch)) {
          instrumentation._unwrap(newProducer, "sendBatch");
        }
        instrumentation._wrap(newProducer, "sendBatch", instrumentation._getSendBatchPatch());
        if (isWrapped(newProducer.send)) {
          instrumentation._unwrap(newProducer, "send");
        }
        instrumentation._wrap(newProducer, "send", instrumentation._getSendPatch());
        if (isWrapped(newProducer.transaction)) {
          instrumentation._unwrap(newProducer, "transaction");
        }
        instrumentation._wrap(newProducer, "transaction", instrumentation._getProducerTransactionPatch());
        instrumentation._setKafkaEventListeners(newProducer);
        return newProducer;
      };
    };
  }
  _getConsumerRunPatch() {
    const instrumentation = this;
    return (original) => {
      return function run(...args) {
        const config2 = args[0];
        if (config2?.eachMessage) {
          if (isWrapped(config2.eachMessage)) {
            instrumentation._unwrap(config2, "eachMessage");
          }
          instrumentation._wrap(config2, "eachMessage", instrumentation._getConsumerEachMessagePatch());
        }
        if (config2?.eachBatch) {
          if (isWrapped(config2.eachBatch)) {
            instrumentation._unwrap(config2, "eachBatch");
          }
          instrumentation._wrap(config2, "eachBatch", instrumentation._getConsumerEachBatchPatch());
        }
        return original.call(this, config2);
      };
    };
  }
  _getConsumerEachMessagePatch() {
    const instrumentation = this;
    return (original) => {
      return function eachMessage(...args) {
        const payload = args[0];
        const propagatedContext = srcExports$1.propagation.extract(
          srcExports$1.ROOT_CONTEXT,
          payload.message.headers,
          bufferTextMapGetter
        );
        const span = instrumentation._startConsumerSpan({
          topic: payload.topic,
          message: payload.message,
          operationType: MESSAGING_OPERATION_TYPE_VALUE_PROCESS,
          ctx: propagatedContext,
          attributes: {
            [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition)
          }
        });
        const pendingMetrics = [
          prepareDurationHistogram(instrumentation._processDuration, Date.now(), {
            [ATTR_MESSAGING_SYSTEM$1]: MESSAGING_SYSTEM_VALUE_KAFKA,
            [ATTR_MESSAGING_OPERATION_NAME]: "process",
            [ATTR_MESSAGING_DESTINATION_NAME]: payload.topic,
            [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition)
          }),
          prepareCounter(instrumentation._consumedMessages, 1, {
            [ATTR_MESSAGING_SYSTEM$1]: MESSAGING_SYSTEM_VALUE_KAFKA,
            [ATTR_MESSAGING_OPERATION_NAME]: "process",
            [ATTR_MESSAGING_DESTINATION_NAME]: payload.topic,
            [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.partition)
          })
        ];
        const eachMessagePromise = srcExports$1.context.with(srcExports$1.trace.setSpan(propagatedContext, span), () => {
          return original.apply(this, args);
        });
        return instrumentation._endSpansOnPromise([span], pendingMetrics, eachMessagePromise);
      };
    };
  }
  _getConsumerEachBatchPatch() {
    return (original) => {
      const instrumentation = this;
      return function eachBatch(...args) {
        const payload = args[0];
        const receivingSpan = instrumentation._startConsumerSpan({
          topic: payload.batch.topic,
          message: void 0,
          operationType: MESSAGING_OPERATION_TYPE_VALUE_RECEIVE,
          ctx: srcExports$1.ROOT_CONTEXT,
          attributes: {
            [ATTR_MESSAGING_BATCH_MESSAGE_COUNT]: payload.batch.messages.length,
            [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
          }
        });
        return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), receivingSpan), () => {
          const startTime = Date.now();
          const spans = [];
          const pendingMetrics = [
            prepareCounter(instrumentation._consumedMessages, payload.batch.messages.length, {
              [ATTR_MESSAGING_SYSTEM$1]: MESSAGING_SYSTEM_VALUE_KAFKA,
              [ATTR_MESSAGING_OPERATION_NAME]: "process",
              [ATTR_MESSAGING_DESTINATION_NAME]: payload.batch.topic,
              [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
            })
          ];
          payload.batch.messages.forEach((message) => {
            const propagatedContext = srcExports$1.propagation.extract(srcExports$1.ROOT_CONTEXT, message.headers, bufferTextMapGetter);
            const spanContext = srcExports$1.trace.getSpan(propagatedContext)?.spanContext();
            let origSpanLink;
            if (spanContext) {
              origSpanLink = {
                context: spanContext
              };
            }
            spans.push(
              instrumentation._startConsumerSpan({
                topic: payload.batch.topic,
                message,
                operationType: MESSAGING_OPERATION_TYPE_VALUE_PROCESS,
                link: origSpanLink,
                attributes: {
                  [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
                }
              })
            );
            pendingMetrics.push(
              prepareDurationHistogram(instrumentation._processDuration, startTime, {
                [ATTR_MESSAGING_SYSTEM$1]: MESSAGING_SYSTEM_VALUE_KAFKA,
                [ATTR_MESSAGING_OPERATION_NAME]: "process",
                [ATTR_MESSAGING_DESTINATION_NAME]: payload.batch.topic,
                [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(payload.batch.partition)
              })
            );
          });
          const batchMessagePromise = original.apply(this, args);
          spans.unshift(receivingSpan);
          return instrumentation._endSpansOnPromise(spans, pendingMetrics, batchMessagePromise);
        });
      };
    };
  }
  _getProducerTransactionPatch() {
    const instrumentation = this;
    return (original) => {
      return function transaction(...args) {
        const transactionSpan = instrumentation.tracer.startSpan("transaction");
        const transactionPromise = original.apply(this, args);
        transactionPromise.then((transaction2) => {
          const originalSend = transaction2.send;
          transaction2.send = function send(...args2) {
            return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), transactionSpan), () => {
              const patched = instrumentation._getSendPatch()(originalSend);
              return patched.apply(this, args2).catch((err) => {
                transactionSpan.setStatus({
                  code: srcExports$1.SpanStatusCode.ERROR,
                  message: err?.message
                });
                transactionSpan.recordException(err);
                throw err;
              });
            });
          };
          const originalSendBatch = transaction2.sendBatch;
          transaction2.sendBatch = function sendBatch(...args2) {
            return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), transactionSpan), () => {
              const patched = instrumentation._getSendBatchPatch()(originalSendBatch);
              return patched.apply(this, args2).catch((err) => {
                transactionSpan.setStatus({
                  code: srcExports$1.SpanStatusCode.ERROR,
                  message: err?.message
                });
                transactionSpan.recordException(err);
                throw err;
              });
            });
          };
          const originalCommit = transaction2.commit;
          transaction2.commit = function commit(...args2) {
            const originCommitPromise = originalCommit.apply(this, args2).then(() => {
              transactionSpan.setStatus({ code: srcExports$1.SpanStatusCode.OK });
            });
            return instrumentation._endSpansOnPromise([transactionSpan], [], originCommitPromise);
          };
          const originalAbort = transaction2.abort;
          transaction2.abort = function abort(...args2) {
            const originAbortPromise = originalAbort.apply(this, args2);
            return instrumentation._endSpansOnPromise([transactionSpan], [], originAbortPromise);
          };
        }).catch((err) => {
          transactionSpan.setStatus({
            code: srcExports$1.SpanStatusCode.ERROR,
            message: err?.message
          });
          transactionSpan.recordException(err);
          transactionSpan.end();
        });
        return transactionPromise;
      };
    };
  }
  _getSendBatchPatch() {
    const instrumentation = this;
    return (original) => {
      return function sendBatch(...args) {
        const batch = args[0];
        const messages = batch.topicMessages || [];
        const spans = [];
        const pendingMetrics = [];
        messages.forEach((topicMessage) => {
          topicMessage.messages.forEach((message) => {
            spans.push(instrumentation._startProducerSpan(topicMessage.topic, message));
            pendingMetrics.push(
              prepareCounter(instrumentation._sentMessages, 1, {
                [ATTR_MESSAGING_SYSTEM$1]: MESSAGING_SYSTEM_VALUE_KAFKA,
                [ATTR_MESSAGING_OPERATION_NAME]: "send",
                [ATTR_MESSAGING_DESTINATION_NAME]: topicMessage.topic,
                ...message.partition !== void 0 ? {
                  [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(message.partition)
                } : {}
              })
            );
          });
        });
        const origSendResult = original.apply(this, args);
        return instrumentation._endSpansOnPromise(spans, pendingMetrics, origSendResult);
      };
    };
  }
  _getSendPatch() {
    const instrumentation = this;
    return (original) => {
      return function send(...args) {
        const record = args[0];
        const spans = record.messages.map((message) => {
          return instrumentation._startProducerSpan(record.topic, message);
        });
        const pendingMetrics = record.messages.map(
          (m) => prepareCounter(instrumentation._sentMessages, 1, {
            [ATTR_MESSAGING_SYSTEM$1]: MESSAGING_SYSTEM_VALUE_KAFKA,
            [ATTR_MESSAGING_OPERATION_NAME]: "send",
            [ATTR_MESSAGING_DESTINATION_NAME]: record.topic,
            ...m.partition !== void 0 ? {
              [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: String(m.partition)
            } : {}
          })
        );
        const origSendResult = original.apply(this, args);
        return instrumentation._endSpansOnPromise(spans, pendingMetrics, origSendResult);
      };
    };
  }
  _endSpansOnPromise(spans, pendingMetrics, sendPromise) {
    return Promise.resolve(sendPromise).then((result) => {
      pendingMetrics.forEach((m) => m());
      return result;
    }).catch((reason) => {
      let errorMessage;
      let errorType = srcExports.ERROR_TYPE_VALUE_OTHER;
      if (typeof reason === "string" || reason === void 0) {
        errorMessage = reason;
      } else if (typeof reason === "object" && Object.prototype.hasOwnProperty.call(reason, "message")) {
        errorMessage = reason.message;
        errorType = reason.constructor.name;
      }
      pendingMetrics.forEach((m) => m(errorType));
      spans.forEach((span) => {
        span.setAttribute(srcExports.ATTR_ERROR_TYPE, errorType);
        span.setStatus({
          code: srcExports$1.SpanStatusCode.ERROR,
          message: errorMessage
        });
      });
      throw reason;
    }).finally(() => {
      spans.forEach((span) => span.end());
    });
  }
  _startConsumerSpan({ topic, message, operationType, ctx, link, attributes }) {
    const operationName = operationType === MESSAGING_OPERATION_TYPE_VALUE_RECEIVE ? "poll" : operationType;
    const span = this.tracer.startSpan(
      `${operationName} ${topic}`,
      {
        kind: operationType === MESSAGING_OPERATION_TYPE_VALUE_RECEIVE ? srcExports$1.SpanKind.CLIENT : srcExports$1.SpanKind.CONSUMER,
        attributes: {
          ...attributes,
          [ATTR_MESSAGING_SYSTEM$1]: MESSAGING_SYSTEM_VALUE_KAFKA,
          [ATTR_MESSAGING_DESTINATION_NAME]: topic,
          [ATTR_MESSAGING_OPERATION_TYPE]: operationType,
          [ATTR_MESSAGING_OPERATION_NAME]: operationName,
          [ATTR_MESSAGING_KAFKA_MESSAGE_KEY]: message?.key ? String(message.key) : void 0,
          [ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE]: message?.key && message.value === null ? true : void 0,
          [ATTR_MESSAGING_KAFKA_OFFSET]: message?.offset
        },
        links: link ? [link] : []
      },
      ctx
    );
    const { consumerHook } = this.getConfig();
    if (consumerHook && message) {
      safeExecuteInTheMiddle(
        () => consumerHook(span, { topic, message }),
        (e) => {
          if (e) this._diag.error("consumerHook error", e);
        },
        true
      );
    }
    return span;
  }
  _startProducerSpan(topic, message) {
    const span = this.tracer.startSpan(`send ${topic}`, {
      kind: srcExports$1.SpanKind.PRODUCER,
      attributes: {
        [ATTR_MESSAGING_SYSTEM$1]: MESSAGING_SYSTEM_VALUE_KAFKA,
        [ATTR_MESSAGING_DESTINATION_NAME]: topic,
        [ATTR_MESSAGING_KAFKA_MESSAGE_KEY]: message.key ? String(message.key) : void 0,
        [ATTR_MESSAGING_KAFKA_MESSAGE_TOMBSTONE]: message.key && message.value === null ? true : void 0,
        [ATTR_MESSAGING_DESTINATION_PARTITION_ID]: message.partition !== void 0 ? String(message.partition) : void 0,
        [ATTR_MESSAGING_OPERATION_NAME]: "send",
        [ATTR_MESSAGING_OPERATION_TYPE]: MESSAGING_OPERATION_TYPE_VALUE_SEND
      }
    });
    message.headers = message.headers ?? {};
    srcExports$1.propagation.inject(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), message.headers);
    const { producerHook } = this.getConfig();
    if (producerHook) {
      safeExecuteInTheMiddle(
        () => producerHook(span, { topic, message }),
        (e) => {
          if (e) this._diag.error("producerHook error", e);
        },
        true
      );
    }
    return span;
  }
}
const INTEGRATION_NAME$i = "Kafka";
const instrumentKafka = generateInstrumentOnce(
  INTEGRATION_NAME$i,
  () => new KafkaJsInstrumentation({
    consumerHook(span) {
      addOriginToSpan(span, "auto.kafkajs.otel.consumer");
    },
    producerHook(span) {
      addOriginToSpan(span, "auto.kafkajs.otel.producer");
    }
  })
);
const _kafkaIntegration = (() => {
  return {
    name: INTEGRATION_NAME$i,
    setupOnce() {
      instrumentKafka();
    }
  };
});
const kafkaIntegration = defineIntegration(_kafkaIntegration);
const PACKAGE_NAME$e = "@sentry/instrumentation-lru-memoizer";
class LruMemoizerInstrumentation extends InstrumentationBase {
  constructor() {
    super(PACKAGE_NAME$e, SDK_VERSION, {});
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition(
        "lru-memoizer",
        [">=1.3 <4"],
        (moduleExports) => {
          const asyncMemoizer = function(...args) {
            const origMemoizer = moduleExports.apply(this, args);
            return function(...memoizerArgs) {
              const origCallback = memoizerArgs.pop();
              const callbackWithContext = typeof origCallback === "function" ? srcExports$1.context.bind(srcExports$1.context.active(), origCallback) : origCallback;
              return origMemoizer.apply(this, [...memoizerArgs, callbackWithContext]);
            };
          };
          return Object.assign(asyncMemoizer, { sync: moduleExports.sync });
        },
        void 0
        // no need to disable as this instrumentation does not create any spans
      )
    ];
  }
}
const INTEGRATION_NAME$h = "LruMemoizer";
const instrumentLruMemoizer = generateInstrumentOnce(INTEGRATION_NAME$h, () => new LruMemoizerInstrumentation());
const _lruMemoizerIntegration = (() => {
  return {
    name: INTEGRATION_NAME$h,
    setupOnce() {
      instrumentLruMemoizer();
    }
  };
});
const lruMemoizerIntegration = defineIntegration(_lruMemoizerIntegration);
const ATTR_DB_CONNECTION_STRING$4 = "db.connection_string";
const ATTR_DB_MONGODB_COLLECTION$1 = "db.mongodb.collection";
const ATTR_DB_NAME$5 = "db.name";
const ATTR_DB_OPERATION$1 = "db.operation";
const ATTR_DB_STATEMENT$6 = "db.statement";
const ATTR_DB_SYSTEM$6 = "db.system";
const ATTR_NET_PEER_NAME$7 = "net.peer.name";
const ATTR_NET_PEER_PORT$7 = "net.peer.port";
const DB_SYSTEM_NAME_VALUE_MONGODB$1 = "mongodb";
const DB_SYSTEM_VALUE_MONGODB = "mongodb";
const METRIC_DB_CLIENT_CONNECTIONS_USAGE$1 = "db.client.connections.usage";
var MongodbCommandType = /* @__PURE__ */ ((MongodbCommandType2) => {
  MongodbCommandType2["CREATE_INDEXES"] = "createIndexes";
  MongodbCommandType2["FIND_AND_MODIFY"] = "findAndModify";
  MongodbCommandType2["IS_MASTER"] = "isMaster";
  MongodbCommandType2["COUNT"] = "count";
  MongodbCommandType2["AGGREGATE"] = "aggregate";
  MongodbCommandType2["UNKNOWN"] = "unknown";
  return MongodbCommandType2;
})(MongodbCommandType || {});
const PACKAGE_NAME$d = "@sentry/instrumentation-mongodb";
const DEFAULT_CONFIG$3 = {
  requireParentSpan: true
};
class MongoDBInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$d, SDK_VERSION, { ...DEFAULT_CONFIG$3, ...config2 });
    this._setSemconvStabilityFromEnv();
  }
  // Used for testing.
  _setSemconvStabilityFromEnv() {
    this._netSemconvStability = semconvStabilityFromStr("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    this._dbSemconvStability = semconvStabilityFromStr("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
  }
  setConfig(config2 = {}) {
    super.setConfig({ ...DEFAULT_CONFIG$3, ...config2 });
  }
  _updateMetricInstruments() {
    this._connectionsUsage = this.meter.createUpDownCounter(METRIC_DB_CLIENT_CONNECTIONS_USAGE$1, {
      description: "The number of connections that are currently in state described by the state attribute.",
      unit: "{connection}"
    });
  }
  /**
   * Convenience function for updating the `db.client.connections.usage` metric.
   * The name "count" comes from the eventual replacement for this metric per
   * https://opentelemetry.io/docs/specs/semconv/non-normative/db-migration/#database-client-connection-count
   */
  _connCountAdd(n, poolName, state) {
    this._connectionsUsage?.add(n, { "pool.name": poolName, state });
  }
  init() {
    const { v3PatchConnection, v3UnpatchConnection } = this._getV3ConnectionPatches();
    const { v4PatchConnect, v4UnpatchConnect } = this._getV4ConnectPatches();
    const { v4PatchConnectionCallback, v4PatchConnectionPromise, v4UnpatchConnection } = this._getV4ConnectionPatches();
    const { v4PatchConnectionPool, v4UnpatchConnectionPool } = this._getV4ConnectionPoolPatches();
    const { v4PatchSessions, v4UnpatchSessions } = this._getV4SessionsPatches();
    return [
      new InstrumentationNodeModuleDefinition("mongodb", [">=3.3.0 <4"], void 0, void 0, [
        new InstrumentationNodeModuleFile(
          "mongodb/lib/core/wireprotocol/index.js",
          [">=3.3.0 <4"],
          v3PatchConnection,
          v3UnpatchConnection
        )
      ]),
      new InstrumentationNodeModuleDefinition("mongodb", [">=4.0.0 <8"], void 0, void 0, [
        new InstrumentationNodeModuleFile(
          "mongodb/lib/cmap/connection.js",
          [">=4.0.0 <6.4"],
          v4PatchConnectionCallback,
          v4UnpatchConnection
        ),
        new InstrumentationNodeModuleFile(
          "mongodb/lib/cmap/connection.js",
          [">=6.4.0 <8"],
          v4PatchConnectionPromise,
          v4UnpatchConnection
        ),
        new InstrumentationNodeModuleFile(
          "mongodb/lib/cmap/connection_pool.js",
          [">=4.0.0 <6.4"],
          v4PatchConnectionPool,
          v4UnpatchConnectionPool
        ),
        new InstrumentationNodeModuleFile(
          "mongodb/lib/cmap/connect.js",
          [">=4.0.0 <8"],
          v4PatchConnect,
          v4UnpatchConnect
        ),
        new InstrumentationNodeModuleFile(
          "mongodb/lib/sessions.js",
          [">=4.0.0 <8"],
          v4PatchSessions,
          v4UnpatchSessions
        )
      ])
    ];
  }
  _getV3ConnectionPatches() {
    return {
      v3PatchConnection: (moduleExports) => {
        if (isWrapped(moduleExports.insert)) {
          this._unwrap(moduleExports, "insert");
        }
        this._wrap(moduleExports, "insert", this._getV3PatchOperation("insert"));
        if (isWrapped(moduleExports.remove)) {
          this._unwrap(moduleExports, "remove");
        }
        this._wrap(moduleExports, "remove", this._getV3PatchOperation("remove"));
        if (isWrapped(moduleExports.update)) {
          this._unwrap(moduleExports, "update");
        }
        this._wrap(moduleExports, "update", this._getV3PatchOperation("update"));
        if (isWrapped(moduleExports.command)) {
          this._unwrap(moduleExports, "command");
        }
        this._wrap(moduleExports, "command", this._getV3PatchCommand());
        if (isWrapped(moduleExports.query)) {
          this._unwrap(moduleExports, "query");
        }
        this._wrap(moduleExports, "query", this._getV3PatchFind());
        if (isWrapped(moduleExports.getMore)) {
          this._unwrap(moduleExports, "getMore");
        }
        this._wrap(moduleExports, "getMore", this._getV3PatchCursor());
        return moduleExports;
      },
      v3UnpatchConnection: (moduleExports) => {
        if (moduleExports === void 0) return;
        this._unwrap(moduleExports, "insert");
        this._unwrap(moduleExports, "remove");
        this._unwrap(moduleExports, "update");
        this._unwrap(moduleExports, "command");
        this._unwrap(moduleExports, "query");
        this._unwrap(moduleExports, "getMore");
      }
    };
  }
  _getV4SessionsPatches() {
    return {
      v4PatchSessions: (moduleExports) => {
        if (isWrapped(moduleExports.acquire)) {
          this._unwrap(moduleExports, "acquire");
        }
        this._wrap(moduleExports.ServerSessionPool.prototype, "acquire", this._getV4AcquireCommand());
        if (isWrapped(moduleExports.release)) {
          this._unwrap(moduleExports, "release");
        }
        this._wrap(moduleExports.ServerSessionPool.prototype, "release", this._getV4ReleaseCommand());
        return moduleExports;
      },
      v4UnpatchSessions: (moduleExports) => {
        if (moduleExports === void 0) return;
        if (isWrapped(moduleExports.acquire)) {
          this._unwrap(moduleExports, "acquire");
        }
        if (isWrapped(moduleExports.release)) {
          this._unwrap(moduleExports, "release");
        }
      }
    };
  }
  _getV4AcquireCommand() {
    const instrumentation = this;
    return (original) => {
      return function patchAcquire() {
        const nSessionsBeforeAcquire = this.sessions.length;
        const session = original.call(this);
        const nSessionsAfterAcquire = this.sessions.length;
        if (nSessionsBeforeAcquire === nSessionsAfterAcquire) {
          instrumentation._connCountAdd(1, instrumentation._poolName, "used");
        } else if (nSessionsBeforeAcquire - 1 === nSessionsAfterAcquire) {
          instrumentation._connCountAdd(-1, instrumentation._poolName, "idle");
          instrumentation._connCountAdd(1, instrumentation._poolName, "used");
        }
        return session;
      };
    };
  }
  _getV4ReleaseCommand() {
    const instrumentation = this;
    return (original) => {
      return function patchRelease(session) {
        const cmdPromise = original.call(this, session);
        instrumentation._connCountAdd(-1, instrumentation._poolName, "used");
        instrumentation._connCountAdd(1, instrumentation._poolName, "idle");
        return cmdPromise;
      };
    };
  }
  _getV4ConnectionPoolPatches() {
    return {
      v4PatchConnectionPool: (moduleExports) => {
        const poolPrototype = moduleExports.ConnectionPool.prototype;
        if (isWrapped(poolPrototype.checkOut)) {
          this._unwrap(poolPrototype, "checkOut");
        }
        this._wrap(poolPrototype, "checkOut", this._getV4ConnectionPoolCheckOut());
        return moduleExports;
      },
      v4UnpatchConnectionPool: (moduleExports) => {
        if (moduleExports === void 0) return;
        this._unwrap(moduleExports.ConnectionPool.prototype, "checkOut");
      }
    };
  }
  _getV4ConnectPatches() {
    return {
      v4PatchConnect: (moduleExports) => {
        if (isWrapped(moduleExports.connect)) {
          this._unwrap(moduleExports, "connect");
        }
        this._wrap(moduleExports, "connect", this._getV4ConnectCommand());
        return moduleExports;
      },
      v4UnpatchConnect: (moduleExports) => {
        if (moduleExports === void 0) return;
        this._unwrap(moduleExports, "connect");
      }
    };
  }
  // This patch will become unnecessary once
  // https://jira.mongodb.org/browse/NODE-5639 is done.
  _getV4ConnectionPoolCheckOut() {
    return (original) => {
      return function patchedCheckout(callback) {
        const patchedCallback = srcExports$1.context.bind(srcExports$1.context.active(), callback);
        return original.call(this, patchedCallback);
      };
    };
  }
  _getV4ConnectCommand() {
    const instrumentation = this;
    return (original) => {
      return function patchedConnect(options, callback) {
        if (original.length === 1) {
          const result = original.call(this, options);
          if (result && typeof result.then === "function") {
            result.then(
              () => instrumentation.setPoolName(options),
              // this handler is set to pass the lint rules
              () => void 0
            );
          }
          return result;
        }
        const patchedCallback = function(err, conn) {
          if (err || !conn) {
            callback(err, conn);
            return;
          }
          instrumentation.setPoolName(options);
          callback(err, conn);
        };
        return original.call(this, options, patchedCallback);
      };
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _getV4ConnectionPatches() {
    return {
      v4PatchConnectionCallback: (moduleExports) => {
        if (isWrapped(moduleExports.Connection.prototype.command)) {
          this._unwrap(moduleExports.Connection.prototype, "command");
        }
        this._wrap(moduleExports.Connection.prototype, "command", this._getV4PatchCommandCallback());
        return moduleExports;
      },
      v4PatchConnectionPromise: (moduleExports) => {
        if (isWrapped(moduleExports.Connection.prototype.command)) {
          this._unwrap(moduleExports.Connection.prototype, "command");
        }
        this._wrap(moduleExports.Connection.prototype, "command", this._getV4PatchCommandPromise());
        return moduleExports;
      },
      v4UnpatchConnection: (moduleExports) => {
        if (moduleExports === void 0) return;
        this._unwrap(moduleExports.Connection.prototype, "command");
      }
    };
  }
  /** Creates spans for common operations */
  _getV3PatchOperation(operationName) {
    const instrumentation = this;
    return (original) => {
      return function patchedServerCommand(server, ns, ops, options, callback) {
        const currentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
        const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
        const resultHandler = typeof options === "function" ? options : callback;
        if (skipInstrumentation || typeof resultHandler !== "function" || typeof ops !== "object") {
          if (typeof options === "function") {
            return original.call(this, server, ns, ops, options);
          } else {
            return original.call(this, server, ns, ops, options, callback);
          }
        }
        const attributes = instrumentation._getV3SpanAttributes(
          ns,
          server,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ops[0],
          operationName
        );
        const spanName = instrumentation._spanNameFromAttrs(attributes);
        const span = instrumentation.tracer.startSpan(spanName, {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        });
        const patchedCallback = instrumentation._patchEnd(span, resultHandler);
        if (typeof options === "function") {
          return original.call(this, server, ns, ops, patchedCallback);
        } else {
          return original.call(this, server, ns, ops, options, patchedCallback);
        }
      };
    };
  }
  /** Creates spans for command operation */
  _getV3PatchCommand() {
    const instrumentation = this;
    return (original) => {
      return function patchedServerCommand(server, ns, cmd, options, callback) {
        const currentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
        const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
        const resultHandler = typeof options === "function" ? options : callback;
        if (skipInstrumentation || typeof resultHandler !== "function" || typeof cmd !== "object") {
          if (typeof options === "function") {
            return original.call(this, server, ns, cmd, options);
          } else {
            return original.call(this, server, ns, cmd, options, callback);
          }
        }
        const commandType = MongoDBInstrumentation._getCommandType(cmd);
        const operationName = commandType === MongodbCommandType.UNKNOWN ? void 0 : commandType;
        const attributes = instrumentation._getV3SpanAttributes(ns, server, cmd, operationName);
        const spanName = instrumentation._spanNameFromAttrs(attributes);
        const span = instrumentation.tracer.startSpan(spanName, {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        });
        const patchedCallback = instrumentation._patchEnd(span, resultHandler);
        if (typeof options === "function") {
          return original.call(this, server, ns, cmd, patchedCallback);
        } else {
          return original.call(this, server, ns, cmd, options, patchedCallback);
        }
      };
    };
  }
  /** Creates spans for command operation */
  _getV4PatchCommandCallback() {
    const instrumentation = this;
    return (original) => {
      return function patchedV4ServerCommand(ns, cmd, options, callback) {
        const currentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
        const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
        const resultHandler = callback;
        const commandType = Object.keys(cmd)[0];
        if (typeof cmd !== "object" || cmd.ismaster || cmd.hello) {
          return original.call(this, ns, cmd, options, callback);
        }
        let span = void 0;
        if (!skipInstrumentation) {
          const attributes = instrumentation._getV4SpanAttributes(this, ns, cmd, commandType);
          const spanName = instrumentation._spanNameFromAttrs(attributes);
          span = instrumentation.tracer.startSpan(spanName, {
            kind: srcExports$1.SpanKind.CLIENT,
            attributes
          });
        }
        const patchedCallback = instrumentation._patchEnd(span, resultHandler, this.id, commandType);
        return original.call(this, ns, cmd, options, patchedCallback);
      };
    };
  }
  _getV4PatchCommandPromise() {
    const instrumentation = this;
    return (original) => {
      return function patchedV4ServerCommand(...args) {
        const [ns, cmd] = args;
        const currentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
        const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
        const commandType = Object.keys(cmd)[0];
        const resultHandler = () => void 0;
        if (typeof cmd !== "object" || cmd.ismaster || cmd.hello) {
          return original.apply(this, args);
        }
        let span = void 0;
        if (!skipInstrumentation) {
          const attributes = instrumentation._getV4SpanAttributes(this, ns, cmd, commandType);
          const spanName = instrumentation._spanNameFromAttrs(attributes);
          span = instrumentation.tracer.startSpan(spanName, {
            kind: srcExports$1.SpanKind.CLIENT,
            attributes
          });
        }
        const patchedCallback = instrumentation._patchEnd(span, resultHandler, this.id, commandType);
        const result = original.apply(this, args);
        result.then(
          (res) => patchedCallback(null, res),
          (err) => patchedCallback(err)
        );
        return result;
      };
    };
  }
  /** Creates spans for find operation */
  _getV3PatchFind() {
    const instrumentation = this;
    return (original) => {
      return function patchedServerCommand(server, ns, cmd, cursorState, options, callback) {
        const currentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
        const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
        const resultHandler = typeof options === "function" ? options : callback;
        if (skipInstrumentation || typeof resultHandler !== "function" || typeof cmd !== "object") {
          if (typeof options === "function") {
            return original.call(this, server, ns, cmd, cursorState, options);
          } else {
            return original.call(this, server, ns, cmd, cursorState, options, callback);
          }
        }
        const attributes = instrumentation._getV3SpanAttributes(ns, server, cmd, "find");
        const spanName = instrumentation._spanNameFromAttrs(attributes);
        const span = instrumentation.tracer.startSpan(spanName, {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        });
        const patchedCallback = instrumentation._patchEnd(span, resultHandler);
        if (typeof options === "function") {
          return original.call(this, server, ns, cmd, cursorState, patchedCallback);
        } else {
          return original.call(this, server, ns, cmd, cursorState, options, patchedCallback);
        }
      };
    };
  }
  /** Creates spans for find operation */
  _getV3PatchCursor() {
    const instrumentation = this;
    return (original) => {
      return function patchedServerCommand(server, ns, cursorState, batchSize, options, callback) {
        const currentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
        const skipInstrumentation = instrumentation._checkSkipInstrumentation(currentSpan);
        const resultHandler = typeof options === "function" ? options : callback;
        if (skipInstrumentation || typeof resultHandler !== "function") {
          if (typeof options === "function") {
            return original.call(this, server, ns, cursorState, batchSize, options);
          } else {
            return original.call(this, server, ns, cursorState, batchSize, options, callback);
          }
        }
        const attributes = instrumentation._getV3SpanAttributes(ns, server, cursorState.cmd, "getMore");
        const spanName = instrumentation._spanNameFromAttrs(attributes);
        const span = instrumentation.tracer.startSpan(spanName, {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        });
        const patchedCallback = instrumentation._patchEnd(span, resultHandler);
        if (typeof options === "function") {
          return original.call(this, server, ns, cursorState, batchSize, patchedCallback);
        } else {
          return original.call(this, server, ns, cursorState, batchSize, options, patchedCallback);
        }
      };
    };
  }
  /**
   * Get the mongodb command type from the object.
   * @param command Internal mongodb command object
   */
  static _getCommandType(command) {
    if (command.createIndexes !== void 0) {
      return MongodbCommandType.CREATE_INDEXES;
    } else if (command.findandmodify !== void 0) {
      return MongodbCommandType.FIND_AND_MODIFY;
    } else if (command.ismaster !== void 0) {
      return MongodbCommandType.IS_MASTER;
    } else if (command.count !== void 0) {
      return MongodbCommandType.COUNT;
    } else if (command.aggregate !== void 0) {
      return MongodbCommandType.AGGREGATE;
    } else {
      return MongodbCommandType.UNKNOWN;
    }
  }
  /**
   * Determine a span's attributes by fetching related metadata from the context
   * @param connectionCtx mongodb internal connection context
   * @param ns mongodb namespace
   * @param command mongodb internal representation of a command
   */
  _getV4SpanAttributes(connectionCtx, ns, command, operation) {
    let host, port;
    if (connectionCtx) {
      const hostParts = typeof connectionCtx.address === "string" ? connectionCtx.address.split(":") : "";
      if (hostParts.length === 2) {
        host = hostParts[0];
        port = hostParts[1];
      }
    }
    let commandObj;
    if (command?.documents && command.documents[0]) {
      commandObj = command.documents[0];
    } else if (command?.cursors) {
      commandObj = command.cursors;
    } else {
      commandObj = command;
    }
    return this._getSpanAttributes(ns.db, ns.collection, host, port, commandObj, operation);
  }
  /**
   * Determine a span's attributes by fetching related metadata from the context
   * @param ns mongodb namespace
   * @param topology mongodb internal representation of the network topology
   * @param command mongodb internal representation of a command
   */
  _getV3SpanAttributes(ns, topology, command, operation) {
    let host;
    let port;
    if (topology && topology.s) {
      host = topology.s.options?.host ?? topology.s.host;
      port = (topology.s.options?.port ?? topology.s.port)?.toString();
      if (host == null || port == null) {
        const address = topology.description?.address;
        if (address) {
          const addressSegments = address.split(":");
          host = addressSegments[0];
          port = addressSegments[1];
        }
      }
    }
    const [dbName, dbCollection] = ns.toString().split(".");
    const commandObj = command?.query ?? command?.q ?? command;
    return this._getSpanAttributes(dbName, dbCollection, host, port, commandObj, operation);
  }
  _getSpanAttributes(dbName, dbCollection, host, port, commandObj, operation) {
    const attributes = {};
    if (this._dbSemconvStability & SemconvStability.OLD) {
      attributes[ATTR_DB_SYSTEM$6] = DB_SYSTEM_VALUE_MONGODB;
      attributes[ATTR_DB_NAME$5] = dbName;
      attributes[ATTR_DB_MONGODB_COLLECTION$1] = dbCollection;
      attributes[ATTR_DB_OPERATION$1] = operation;
      attributes[ATTR_DB_CONNECTION_STRING$4] = `mongodb://${host}:${port}/${dbName}`;
    }
    if (this._dbSemconvStability & SemconvStability.STABLE) {
      attributes[srcExports.ATTR_DB_SYSTEM_NAME] = DB_SYSTEM_NAME_VALUE_MONGODB$1;
      attributes[srcExports.ATTR_DB_NAMESPACE] = dbName;
      attributes[srcExports.ATTR_DB_OPERATION_NAME] = operation;
      attributes[srcExports.ATTR_DB_COLLECTION_NAME] = dbCollection;
    }
    if (host && port) {
      if (this._netSemconvStability & SemconvStability.OLD) {
        attributes[ATTR_NET_PEER_NAME$7] = host;
      }
      if (this._netSemconvStability & SemconvStability.STABLE) {
        attributes[srcExports.ATTR_SERVER_ADDRESS] = host;
      }
      const portNumber = parseInt(port, 10);
      if (!isNaN(portNumber)) {
        if (this._netSemconvStability & SemconvStability.OLD) {
          attributes[ATTR_NET_PEER_PORT$7] = portNumber;
        }
        if (this._netSemconvStability & SemconvStability.STABLE) {
          attributes[srcExports.ATTR_SERVER_PORT] = portNumber;
        }
      }
    }
    if (commandObj) {
      const { dbStatementSerializer: configDbStatementSerializer } = this.getConfig();
      const dbStatementSerializer = typeof configDbStatementSerializer === "function" ? configDbStatementSerializer : this._defaultDbStatementSerializer.bind(this);
      safeExecuteInTheMiddle(
        () => {
          const query = dbStatementSerializer(commandObj);
          if (this._dbSemconvStability & SemconvStability.OLD) {
            attributes[ATTR_DB_STATEMENT$6] = query;
          }
          if (this._dbSemconvStability & SemconvStability.STABLE) {
            attributes[srcExports.ATTR_DB_QUERY_TEXT] = query;
          }
        },
        (err) => {
          if (err) {
            this._diag.error("Error running dbStatementSerializer hook", err);
          }
        },
        true
      );
    }
    return attributes;
  }
  _spanNameFromAttrs(attributes) {
    let spanName;
    if (this._dbSemconvStability & SemconvStability.STABLE) {
      spanName = [attributes[srcExports.ATTR_DB_OPERATION_NAME], attributes[srcExports.ATTR_DB_COLLECTION_NAME]].filter((attr) => attr).join(" ") || DB_SYSTEM_NAME_VALUE_MONGODB$1;
    } else {
      spanName = `mongodb.${attributes[ATTR_DB_OPERATION$1] || "command"}`;
    }
    return spanName;
  }
  _getDefaultDbStatementReplacer() {
    const seen = /* @__PURE__ */ new WeakSet();
    return (_key, value) => {
      if (typeof value !== "object" || !value) return "?";
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
      return value;
    };
  }
  _defaultDbStatementSerializer(commandObj) {
    const { enhancedDatabaseReporting } = this.getConfig();
    if (enhancedDatabaseReporting) {
      return JSON.stringify(commandObj);
    }
    return JSON.stringify(commandObj, this._getDefaultDbStatementReplacer());
  }
  /**
   * Triggers the response hook in case it is defined.
   * @param span The span to add the results to.
   * @param result The command result
   */
  _handleExecutionResult(span, result) {
    const { responseHook } = this.getConfig();
    if (typeof responseHook === "function") {
      safeExecuteInTheMiddle(
        () => {
          responseHook(span, { data: result });
        },
        (err) => {
          if (err) {
            this._diag.error("Error running response hook", err);
          }
        },
        true
      );
    }
  }
  /**
   * Ends a created span.
   * @param span The created span to end.
   * @param resultHandler A callback function.
   * @param connectionId: The connection ID of the Command response.
   */
  _patchEnd(span, resultHandler, connectionId, commandType) {
    const activeContext = srcExports$1.context.active();
    const instrumentation = this;
    let spanEnded = false;
    return function patchedEnd(...args) {
      if (!spanEnded) {
        spanEnded = true;
        const error = args[0];
        if (span) {
          if (error instanceof Error) {
            span.setStatus({
              code: srcExports$1.SpanStatusCode.ERROR,
              message: error.message
            });
          } else {
            const result = args[1];
            instrumentation._handleExecutionResult(span, result);
          }
          span.end();
        }
        if (commandType === "endSessions") {
          instrumentation._connCountAdd(-1, instrumentation._poolName, "idle");
        }
      }
      return srcExports$1.context.with(activeContext, () => {
        return resultHandler.apply(this, args);
      });
    };
  }
  setPoolName(options) {
    const host = options.hostAddress?.host;
    const port = options.hostAddress?.port;
    const database = options.dbName;
    const poolName = `mongodb://${host}:${port}/${database}`;
    this._poolName = poolName;
  }
  _checkSkipInstrumentation(currentSpan) {
    const requireParentSpan = this.getConfig().requireParentSpan;
    const hasNoParentSpan = currentSpan === void 0;
    return requireParentSpan === true && hasNoParentSpan;
  }
}
const INTEGRATION_NAME$g = "Mongo";
const instrumentMongo = generateInstrumentOnce(
  INTEGRATION_NAME$g,
  () => new MongoDBInstrumentation({
    dbStatementSerializer: _defaultDbStatementSerializer,
    responseHook(span) {
      addOriginToSpan(span, "auto.db.otel.mongo");
    }
  })
);
function _defaultDbStatementSerializer(commandObj) {
  const resultObj = _scrubStatement(commandObj);
  return JSON.stringify(resultObj);
}
function _scrubStatement(value) {
  if (Array.isArray(value)) {
    return value.map((element) => _scrubStatement(element));
  }
  if (isCommandObj(value)) {
    const initial = {};
    return Object.entries(value).map(([key, element]) => [key, _scrubStatement(element)]).reduce((prev, current) => {
      if (isCommandEntry(current)) {
        prev[current[0]] = current[1];
      }
      return prev;
    }, initial);
  }
  return "?";
}
function isCommandObj(value) {
  return typeof value === "object" && value !== null && !isBuffer(value);
}
function isBuffer(value) {
  let isBuffer2 = false;
  if (typeof Buffer !== "undefined") {
    isBuffer2 = Buffer.isBuffer(value);
  }
  return isBuffer2;
}
function isCommandEntry(value) {
  return Array.isArray(value);
}
const _mongoIntegration = (() => {
  return {
    name: INTEGRATION_NAME$g,
    setupOnce() {
      instrumentMongo();
    }
  };
});
const mongoIntegration = defineIntegration(_mongoIntegration);
const ATTR_DB_MONGODB_COLLECTION = "db.mongodb.collection";
const ATTR_DB_NAME$4 = "db.name";
const ATTR_DB_OPERATION = "db.operation";
const ATTR_DB_STATEMENT$5 = "db.statement";
const ATTR_DB_SYSTEM$5 = "db.system";
const ATTR_DB_USER$4 = "db.user";
const ATTR_NET_PEER_NAME$6 = "net.peer.name";
const ATTR_NET_PEER_PORT$6 = "net.peer.port";
const DB_SYSTEM_NAME_VALUE_MONGODB = "mongodb";
function getAttributesFromCollection(collection, dbSemconvStability, netSemconvStability) {
  const attrs = {};
  if (dbSemconvStability & SemconvStability.OLD) {
    attrs[ATTR_DB_MONGODB_COLLECTION] = collection.name;
    attrs[ATTR_DB_NAME$4] = collection.conn.name;
    attrs[ATTR_DB_USER$4] = collection.conn.user;
  }
  if (dbSemconvStability & SemconvStability.STABLE) {
    attrs[srcExports.ATTR_DB_COLLECTION_NAME] = collection.name;
    attrs[srcExports.ATTR_DB_NAMESPACE] = collection.conn.name;
  }
  if (netSemconvStability & SemconvStability.OLD) {
    attrs[ATTR_NET_PEER_NAME$6] = collection.conn.host;
    attrs[ATTR_NET_PEER_PORT$6] = collection.conn.port;
  }
  if (netSemconvStability & SemconvStability.STABLE) {
    attrs[srcExports.ATTR_SERVER_ADDRESS] = collection.conn.host;
    attrs[srcExports.ATTR_SERVER_PORT] = collection.conn.port;
  }
  return attrs;
}
function setErrorStatus(span, error = {}) {
  span.recordException(error);
  span.setStatus({
    code: srcExports$1.SpanStatusCode.ERROR,
    message: `${error.message} ${error.code ? `
Mongoose Error Code: ${error.code}` : ""}`
  });
}
function applyResponseHook(span, response, responseHook, moduleVersion = void 0) {
  if (!responseHook) {
    return;
  }
  safeExecuteInTheMiddle(
    () => responseHook(span, { moduleVersion, response }),
    (e) => {
      if (e) {
        srcExports$1.diag.error("mongoose instrumentation: responseHook error", e);
      }
    },
    true
  );
}
function handlePromiseResponse(execResponse, span, responseHook, moduleVersion = void 0) {
  if (!(execResponse instanceof Promise)) {
    applyResponseHook(span, execResponse, responseHook, moduleVersion);
    span.end();
    return execResponse;
  }
  return execResponse.then((response) => {
    applyResponseHook(span, response, responseHook, moduleVersion);
    return response;
  }).catch((err) => {
    setErrorStatus(span, err);
    throw err;
  }).finally(() => span.end());
}
function handleCallbackResponse(callback, exec, originalThis, span, args, responseHook, moduleVersion = void 0) {
  let callbackArgumentIndex = 0;
  if (args.length === 2) {
    callbackArgumentIndex = 1;
  } else if (args.length === 3) {
    callbackArgumentIndex = 2;
  }
  args[callbackArgumentIndex] = (err, response) => {
    if (err) {
      setErrorStatus(span, err);
    } else {
      applyResponseHook(span, response, responseHook, moduleVersion);
    }
    span.end();
    return callback(err, response);
  };
  return exec.apply(originalThis, args);
}
const PACKAGE_NAME$c = "@sentry/instrumentation-mongoose";
const contextCaptureFunctionsCommon = [
  "deleteOne",
  "deleteMany",
  "find",
  "findOne",
  "estimatedDocumentCount",
  "countDocuments",
  "distinct",
  "where",
  "$where",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndReplace"
];
const contextCaptureFunctions6 = ["remove", "count", "findOneAndRemove", ...contextCaptureFunctionsCommon];
const contextCaptureFunctions7 = ["count", "findOneAndRemove", ...contextCaptureFunctionsCommon];
const contextCaptureFunctions8 = [...contextCaptureFunctionsCommon];
function getContextCaptureFunctions(moduleVersion) {
  if (!moduleVersion) {
    return contextCaptureFunctionsCommon;
  } else if (moduleVersion.startsWith("6.") || moduleVersion.startsWith("5.")) {
    return contextCaptureFunctions6;
  } else if (moduleVersion.startsWith("7.")) {
    return contextCaptureFunctions7;
  } else {
    return contextCaptureFunctions8;
  }
}
function instrumentRemove(moduleVersion) {
  return moduleVersion && (moduleVersion.startsWith("5.") || moduleVersion.startsWith("6.")) || false;
}
function needsDocumentMethodPatch(moduleVersion) {
  if (!moduleVersion || !moduleVersion.startsWith("8.")) {
    return false;
  }
  const minor = parseInt(moduleVersion.split(".")[1], 10);
  return minor >= 21;
}
const _STORED_PARENT_SPAN = /* @__PURE__ */ Symbol("stored-parent-span");
const _ALREADY_INSTRUMENTED = /* @__PURE__ */ Symbol("already-instrumented");
class MongooseInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$c, SDK_VERSION, config2);
    this._setSemconvStabilityFromEnv();
  }
  // Used for testing.
  _setSemconvStabilityFromEnv() {
    this._netSemconvStability = semconvStabilityFromStr("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    this._dbSemconvStability = semconvStabilityFromStr("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
  }
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "mongoose",
      [">=5.9.7 <10"],
      this.patch.bind(this),
      this.unpatch.bind(this)
    );
    return module;
  }
  patch(module, moduleVersion) {
    const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
    this._wrap(moduleExports.Model.prototype, "save", this.patchOnModelMethods("save", moduleVersion));
    moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
    if (instrumentRemove(moduleVersion)) {
      this._wrap(moduleExports.Model.prototype, "remove", this.patchOnModelMethods("remove", moduleVersion));
    }
    if (needsDocumentMethodPatch(moduleVersion)) {
      this._wrap(
        moduleExports.Model.prototype,
        "updateOne",
        this._patchDocumentUpdateMethods("updateOne", moduleVersion)
      );
      this._wrap(
        moduleExports.Model.prototype,
        "deleteOne",
        this._patchDocumentUpdateMethods("deleteOne", moduleVersion)
      );
    }
    this._wrap(moduleExports.Query.prototype, "exec", this.patchQueryExec(moduleVersion));
    this._wrap(moduleExports.Aggregate.prototype, "exec", this.patchAggregateExec(moduleVersion));
    const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
    contextCaptureFunctions.forEach((funcName) => {
      this._wrap(moduleExports.Query.prototype, funcName, this.patchAndCaptureSpanContext(funcName));
    });
    this._wrap(moduleExports.Model, "aggregate", this.patchModelAggregate());
    this._wrap(moduleExports.Model, "insertMany", this.patchModelStatic("insertMany", moduleVersion));
    this._wrap(moduleExports.Model, "bulkWrite", this.patchModelStatic("bulkWrite", moduleVersion));
    return moduleExports;
  }
  unpatch(module, moduleVersion) {
    const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
    const contextCaptureFunctions = getContextCaptureFunctions(moduleVersion);
    this._unwrap(moduleExports.Model.prototype, "save");
    moduleExports.Model.prototype.$save = moduleExports.Model.prototype.save;
    if (instrumentRemove(moduleVersion)) {
      this._unwrap(moduleExports.Model.prototype, "remove");
    }
    if (needsDocumentMethodPatch(moduleVersion)) {
      this._unwrap(moduleExports.Model.prototype, "updateOne");
      this._unwrap(moduleExports.Model.prototype, "deleteOne");
    }
    this._unwrap(moduleExports.Query.prototype, "exec");
    this._unwrap(moduleExports.Aggregate.prototype, "exec");
    contextCaptureFunctions.forEach((funcName) => {
      this._unwrap(moduleExports.Query.prototype, funcName);
    });
    this._unwrap(moduleExports.Model, "aggregate");
    this._unwrap(moduleExports.Model, "insertMany");
    this._unwrap(moduleExports.Model, "bulkWrite");
  }
  patchAggregateExec(moduleVersion) {
    const self = this;
    return (originalAggregate) => {
      return function exec(callback) {
        if (self.getConfig().requireParentSpan && srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0) {
          return originalAggregate.apply(this, arguments);
        }
        const parentSpan = this[_STORED_PARENT_SPAN];
        const attributes = {};
        const { dbStatementSerializer } = self.getConfig();
        if (dbStatementSerializer) {
          const statement = dbStatementSerializer("aggregate", {
            options: this.options,
            aggregatePipeline: this._pipeline
          });
          if (self._dbSemconvStability & SemconvStability.OLD) {
            attributes[ATTR_DB_STATEMENT$5] = statement;
          }
          if (self._dbSemconvStability & SemconvStability.STABLE) {
            attributes[srcExports.ATTR_DB_QUERY_TEXT] = statement;
          }
        }
        const span = self._startSpan(
          this._model.collection,
          this._model?.modelName,
          "aggregate",
          attributes,
          parentSpan
        );
        return self._handleResponse(span, originalAggregate, this, arguments, callback, moduleVersion);
      };
    };
  }
  patchQueryExec(moduleVersion) {
    const self = this;
    return (originalExec) => {
      return function exec(callback) {
        if (this[_ALREADY_INSTRUMENTED]) {
          return originalExec.apply(this, arguments);
        }
        if (self.getConfig().requireParentSpan && srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0) {
          return originalExec.apply(this, arguments);
        }
        const parentSpan = this[_STORED_PARENT_SPAN];
        const attributes = {};
        const { dbStatementSerializer } = self.getConfig();
        if (dbStatementSerializer) {
          const statement = dbStatementSerializer(this.op, {
            // Use public API methods (getFilter/getOptions) for better compatibility
            condition: this.getFilter?.() ?? this._conditions,
            updates: this._update,
            options: this.getOptions?.() ?? this.options,
            fields: this._fields
          });
          if (self._dbSemconvStability & SemconvStability.OLD) {
            attributes[ATTR_DB_STATEMENT$5] = statement;
          }
          if (self._dbSemconvStability & SemconvStability.STABLE) {
            attributes[srcExports.ATTR_DB_QUERY_TEXT] = statement;
          }
        }
        const span = self._startSpan(this.mongooseCollection, this.model.modelName, this.op, attributes, parentSpan);
        return self._handleResponse(span, originalExec, this, arguments, callback, moduleVersion);
      };
    };
  }
  patchOnModelMethods(op, moduleVersion) {
    const self = this;
    return (originalOnModelFunction) => {
      return function method(options, callback) {
        if (self.getConfig().requireParentSpan && srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0) {
          return originalOnModelFunction.apply(this, arguments);
        }
        const serializePayload = { document: this };
        if (options && !(options instanceof Function)) {
          serializePayload.options = options;
        }
        const attributes = {};
        const { dbStatementSerializer } = self.getConfig();
        if (dbStatementSerializer) {
          const statement = dbStatementSerializer(op, serializePayload);
          if (self._dbSemconvStability & SemconvStability.OLD) {
            attributes[ATTR_DB_STATEMENT$5] = statement;
          }
          if (self._dbSemconvStability & SemconvStability.STABLE) {
            attributes[srcExports.ATTR_DB_QUERY_TEXT] = statement;
          }
        }
        const span = self._startSpan(this.constructor.collection, this.constructor.modelName, op, attributes);
        if (options instanceof Function) {
          callback = options;
          options = void 0;
        }
        return self._handleResponse(span, originalOnModelFunction, this, arguments, callback, moduleVersion);
      };
    };
  }
  // Patch document instance methods (doc.updateOne/deleteOne) for Mongoose 8.21.0+.
  _patchDocumentUpdateMethods(op, moduleVersion) {
    const self = this;
    return (originalMethod) => {
      return function method(update, options, callback) {
        if (self.getConfig().requireParentSpan && srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0) {
          return originalMethod.apply(this, arguments);
        }
        let actualCallback = callback;
        let actualUpdate = update;
        let actualOptions = options;
        if (typeof update === "function") {
          actualCallback = update;
          actualUpdate = void 0;
          actualOptions = void 0;
        } else if (typeof options === "function") {
          actualCallback = options;
          actualOptions = void 0;
        }
        const attributes = {};
        const dbStatementSerializer = self.getConfig().dbStatementSerializer;
        if (dbStatementSerializer) {
          const statement = dbStatementSerializer(op, {
            // Document instance methods automatically use the document's _id as filter
            condition: { _id: this._id },
            updates: actualUpdate,
            options: actualOptions
          });
          if (self._dbSemconvStability & SemconvStability.OLD) {
            attributes[ATTR_DB_STATEMENT$5] = statement;
          }
          if (self._dbSemconvStability & SemconvStability.STABLE) {
            attributes[srcExports.ATTR_DB_QUERY_TEXT] = statement;
          }
        }
        const span = self._startSpan(this.constructor.collection, this.constructor.modelName, op, attributes);
        const result = self._handleResponse(span, originalMethod, this, arguments, actualCallback, moduleVersion);
        if (result && typeof result === "object") {
          result[_ALREADY_INSTRUMENTED] = true;
        }
        return result;
      };
    };
  }
  patchModelStatic(op, moduleVersion) {
    const self = this;
    return (original) => {
      return function patchedStatic(docsOrOps, options, callback) {
        if (self.getConfig().requireParentSpan && srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0) {
          return original.apply(this, arguments);
        }
        if (typeof options === "function") {
          callback = options;
          options = void 0;
        }
        const serializePayload = {};
        switch (op) {
          case "insertMany":
            serializePayload.documents = docsOrOps;
            break;
          case "bulkWrite":
            serializePayload.operations = docsOrOps;
            break;
          default:
            serializePayload.document = docsOrOps;
            break;
        }
        if (options !== void 0) {
          serializePayload.options = options;
        }
        const attributes = {};
        const { dbStatementSerializer } = self.getConfig();
        if (dbStatementSerializer) {
          const statement = dbStatementSerializer(op, serializePayload);
          if (self._dbSemconvStability & SemconvStability.OLD) {
            attributes[ATTR_DB_STATEMENT$5] = statement;
          }
          if (self._dbSemconvStability & SemconvStability.STABLE) {
            attributes[srcExports.ATTR_DB_QUERY_TEXT] = statement;
          }
        }
        const span = self._startSpan(this.collection, this.modelName, op, attributes);
        return self._handleResponse(span, original, this, arguments, callback, moduleVersion);
      };
    };
  }
  // we want to capture the otel span on the object which is calling exec.
  // in the special case of aggregate, we need have no function to path
  // on the Aggregate object to capture the context on, so we patch
  // the aggregate of Model, and set the context on the Aggregate object
  patchModelAggregate() {
    const self = this;
    return (original) => {
      return function captureSpanContext() {
        const currentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
        const aggregate = self._callOriginalFunction(() => original.apply(this, arguments));
        if (aggregate) aggregate[_STORED_PARENT_SPAN] = currentSpan;
        return aggregate;
      };
    };
  }
  patchAndCaptureSpanContext(funcName) {
    const self = this;
    return (original) => {
      return function captureSpanContext() {
        this[_STORED_PARENT_SPAN] = srcExports$1.trace.getSpan(srcExports$1.context.active());
        return self._callOriginalFunction(() => original.apply(this, arguments));
      };
    };
  }
  _startSpan(collection, modelName, operation, attributes, parentSpan) {
    const finalAttributes = {
      ...attributes,
      ...getAttributesFromCollection(collection, this._dbSemconvStability, this._netSemconvStability)
    };
    if (this._dbSemconvStability & SemconvStability.OLD) {
      finalAttributes[ATTR_DB_OPERATION] = operation;
      finalAttributes[ATTR_DB_SYSTEM$5] = "mongoose";
    }
    if (this._dbSemconvStability & SemconvStability.STABLE) {
      finalAttributes[srcExports.ATTR_DB_OPERATION_NAME] = operation;
      finalAttributes[srcExports.ATTR_DB_SYSTEM_NAME] = DB_SYSTEM_NAME_VALUE_MONGODB;
    }
    const spanName = this._dbSemconvStability & SemconvStability.STABLE ? `${operation} ${collection.name}` : `mongoose.${modelName}.${operation}`;
    return this.tracer.startSpan(
      spanName,
      {
        kind: srcExports$1.SpanKind.CLIENT,
        attributes: finalAttributes
      },
      parentSpan ? srcExports$1.trace.setSpan(srcExports$1.context.active(), parentSpan) : void 0
    );
  }
  _handleResponse(span, exec, originalThis, args, callback, moduleVersion = void 0) {
    const self = this;
    if (callback instanceof Function) {
      return self._callOriginalFunction(
        () => handleCallbackResponse(callback, exec, originalThis, span, args, self.getConfig().responseHook, moduleVersion)
      );
    } else {
      const response = self._callOriginalFunction(() => exec.apply(originalThis, args));
      return handlePromiseResponse(response, span, self.getConfig().responseHook, moduleVersion);
    }
  }
  _callOriginalFunction(originalFunction) {
    if (this.getConfig().suppressInternalInstrumentation) {
      return srcExports$1.context.with(suppressTracing(srcExports$1.context.active()), originalFunction);
    } else {
      return originalFunction();
    }
  }
}
const INTEGRATION_NAME$f = "Mongoose";
const instrumentMongoose = generateInstrumentOnce(
  INTEGRATION_NAME$f,
  () => new MongooseInstrumentation({
    responseHook(span) {
      addOriginToSpan(span, "auto.db.otel.mongoose");
    }
  })
);
const _mongooseIntegration = (() => {
  return {
    name: INTEGRATION_NAME$f,
    setupOnce() {
      instrumentMongoose();
    }
  };
});
const mongooseIntegration = defineIntegration(_mongooseIntegration);
const ATTR_DB_CONNECTION_STRING$3 = "db.connection_string";
const ATTR_DB_NAME$3 = "db.name";
const ATTR_DB_STATEMENT$4 = "db.statement";
const ATTR_DB_SYSTEM$4 = "db.system";
const ATTR_DB_USER$3 = "db.user";
const ATTR_NET_PEER_NAME$5 = "net.peer.name";
const ATTR_NET_PEER_PORT$5 = "net.peer.port";
const DB_SYSTEM_VALUE_MYSQL$1 = "mysql";
const METRIC_DB_CLIENT_CONNECTIONS_USAGE = "db.client.connections.usage";
var AttributeNames$5 = /* @__PURE__ */ ((AttributeNames2) => {
  AttributeNames2["MYSQL_VALUES"] = "db.mysql.values";
  return AttributeNames2;
})(AttributeNames$5 || {});
function getConfig$1(config2) {
  const { host, port, database, user } = config2 && config2.connectionConfig || config2 || {};
  return { host, port, database, user };
}
function getJDBCString$1(host, port, database) {
  let jdbcString = `jdbc:mysql://${host || "localhost"}`;
  if (typeof port === "number") {
    jdbcString += `:${port}`;
  }
  if (typeof database === "string") {
    jdbcString += `/${database}`;
  }
  return jdbcString;
}
function getDbQueryText(query) {
  if (typeof query === "string") {
    return query;
  } else {
    return query.sql;
  }
}
function getDbValues(query, values) {
  if (typeof query === "string") {
    return arrayStringifyHelper(values);
  } else {
    return arrayStringifyHelper(values || query.values);
  }
}
function getSpanName$2(query) {
  const rawQuery = typeof query === "object" ? query.sql : query;
  const firstSpace = rawQuery?.indexOf(" ");
  if (typeof firstSpace === "number" && firstSpace !== -1) {
    return rawQuery?.substring(0, firstSpace);
  }
  return rawQuery;
}
function arrayStringifyHelper(arr) {
  if (arr) return `[${arr.toString()}]`;
  return "";
}
function getPoolNameOld(pool) {
  const c = pool.config.connectionConfig;
  let poolName = "";
  poolName += c?.host ? `host: '${c.host}', ` : "";
  poolName += c?.port ? `port: ${c.port}, ` : "";
  poolName += c?.database ? `database: '${c.database}', ` : "";
  poolName += c?.user ? `user: '${c.user}'` : "";
  if (!c?.user) {
    poolName = poolName.substring(0, poolName.length - 2);
  }
  return poolName.trim();
}
const PACKAGE_NAME$b = "@sentry/instrumentation-mysql";
class MySQLInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$b, SDK_VERSION, config2);
    this._setSemconvStabilityFromEnv();
  }
  // Used for testing.
  _setSemconvStabilityFromEnv() {
    this._netSemconvStability = semconvStabilityFromStr("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    this._dbSemconvStability = semconvStabilityFromStr("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
  }
  _updateMetricInstruments() {
    this._connectionsUsageOld = this.meter.createUpDownCounter(METRIC_DB_CLIENT_CONNECTIONS_USAGE, {
      description: "The number of connections that are currently in state described by the state attribute.",
      unit: "{connection}"
    });
  }
  /**
   * Convenience function for updating the `db.client.connections.usage` metric.
   * The name "count" comes from the eventually replacement for this metric per
   * https://opentelemetry.io/docs/specs/semconv/non-normative/db-migration/#database-client-connection-count
   */
  _connCountAdd(n, poolNameOld, state) {
    this._connectionsUsageOld?.add(n, { state, name: poolNameOld });
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition(
        "mysql",
        [">=2.0.0 <3"],
        (moduleExports) => {
          if (isWrapped(moduleExports.createConnection)) {
            this._unwrap(moduleExports, "createConnection");
          }
          this._wrap(moduleExports, "createConnection", this._patchCreateConnection());
          if (isWrapped(moduleExports.createPool)) {
            this._unwrap(moduleExports, "createPool");
          }
          this._wrap(moduleExports, "createPool", this._patchCreatePool());
          if (isWrapped(moduleExports.createPoolCluster)) {
            this._unwrap(moduleExports, "createPoolCluster");
          }
          this._wrap(moduleExports, "createPoolCluster", this._patchCreatePoolCluster());
          return moduleExports;
        },
        (moduleExports) => {
          if (moduleExports === void 0) return;
          this._unwrap(moduleExports, "createConnection");
          this._unwrap(moduleExports, "createPool");
          this._unwrap(moduleExports, "createPoolCluster");
        }
      )
    ];
  }
  // global export function
  _patchCreateConnection() {
    return (originalCreateConnection) => {
      const thisPlugin = this;
      return function createConnection(_connectionUri) {
        const originalResult = originalCreateConnection(...arguments);
        thisPlugin._wrap(originalResult, "query", thisPlugin._patchQuery(originalResult));
        return originalResult;
      };
    };
  }
  // global export function
  _patchCreatePool() {
    return (originalCreatePool) => {
      const thisPlugin = this;
      return function createPool(_config) {
        const pool = originalCreatePool(...arguments);
        thisPlugin._wrap(pool, "query", thisPlugin._patchQuery(pool));
        thisPlugin._wrap(pool, "getConnection", thisPlugin._patchGetConnection(pool));
        thisPlugin._wrap(pool, "end", thisPlugin._patchPoolEnd(pool));
        thisPlugin._setPoolCallbacks(pool, "");
        return pool;
      };
    };
  }
  _patchPoolEnd(pool) {
    return (originalPoolEnd) => {
      const thisPlugin = this;
      return function end(callback) {
        const nAll = pool._allConnections.length;
        const nFree = pool._freeConnections.length;
        const nUsed = nAll - nFree;
        const poolNameOld = getPoolNameOld(pool);
        thisPlugin._connCountAdd(-nUsed, poolNameOld, "used");
        thisPlugin._connCountAdd(-nFree, poolNameOld, "idle");
        originalPoolEnd.apply(pool, arguments);
      };
    };
  }
  // global export function
  _patchCreatePoolCluster() {
    return (originalCreatePoolCluster) => {
      const thisPlugin = this;
      return function createPool(_config) {
        const cluster = originalCreatePoolCluster(...arguments);
        thisPlugin._wrap(cluster, "getConnection", thisPlugin._patchGetConnection(cluster));
        thisPlugin._wrap(cluster, "add", thisPlugin._patchAdd(cluster));
        return cluster;
      };
    };
  }
  _patchAdd(cluster) {
    return (originalAdd) => {
      const thisPlugin = this;
      return function add(id, config2) {
        if (!thisPlugin["_enabled"]) {
          thisPlugin._unwrap(cluster, "add");
          return originalAdd.apply(cluster, arguments);
        }
        originalAdd.apply(cluster, arguments);
        const nodes = cluster["_nodes"];
        if (nodes) {
          const nodeId = typeof id === "object" ? "CLUSTER::" + cluster._lastId : String(id);
          const pool = nodes[nodeId].pool;
          thisPlugin._setPoolCallbacks(pool, id);
        }
      };
    };
  }
  // method on cluster or pool
  _patchGetConnection(pool) {
    return (originalGetConnection) => {
      const thisPlugin = this;
      return function getConnection(arg1, arg2, arg3) {
        if (!thisPlugin["_enabled"]) {
          thisPlugin._unwrap(pool, "getConnection");
          return originalGetConnection.apply(pool, arguments);
        }
        if (arguments.length === 1 && typeof arg1 === "function") {
          const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg1);
          return originalGetConnection.call(pool, patchFn);
        }
        if (arguments.length === 2 && typeof arg2 === "function") {
          const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg2);
          return originalGetConnection.call(pool, arg1, patchFn);
        }
        if (arguments.length === 3 && typeof arg3 === "function") {
          const patchFn = thisPlugin._getConnectionCallbackPatchFn(arg3);
          return originalGetConnection.call(pool, arg1, arg2, patchFn);
        }
        return originalGetConnection.apply(pool, arguments);
      };
    };
  }
  _getConnectionCallbackPatchFn(cb) {
    const thisPlugin = this;
    const activeContext = srcExports$1.context.active();
    return function(err, connection) {
      if (connection) {
        if (!isWrapped(connection.query)) {
          thisPlugin._wrap(connection, "query", thisPlugin._patchQuery(connection));
        }
      }
      if (typeof cb === "function") {
        srcExports$1.context.with(activeContext, cb, this, err, connection);
      }
    };
  }
  _patchQuery(connection) {
    return (originalQuery) => {
      const thisPlugin = this;
      return function query(query, _valuesOrCallback, _callback) {
        if (!thisPlugin["_enabled"]) {
          thisPlugin._unwrap(connection, "query");
          return originalQuery.apply(connection, arguments);
        }
        const attributes = {};
        const { host, port, database, user } = getConfig$1(connection.config);
        const portNumber = parseInt(port, 10);
        const dbQueryText = getDbQueryText(query);
        if (thisPlugin._dbSemconvStability & SemconvStability.OLD) {
          attributes[ATTR_DB_SYSTEM$4] = DB_SYSTEM_VALUE_MYSQL$1;
          attributes[ATTR_DB_CONNECTION_STRING$3] = getJDBCString$1(host, port, database);
          attributes[ATTR_DB_NAME$3] = database;
          attributes[ATTR_DB_USER$3] = user;
          attributes[ATTR_DB_STATEMENT$4] = dbQueryText;
        }
        if (thisPlugin._dbSemconvStability & SemconvStability.STABLE) {
          attributes[srcExports.ATTR_DB_SYSTEM_NAME] = srcExports.DB_SYSTEM_NAME_VALUE_MYSQL;
          attributes[srcExports.ATTR_DB_NAMESPACE] = database;
          attributes[srcExports.ATTR_DB_QUERY_TEXT] = dbQueryText;
        }
        if (thisPlugin._netSemconvStability & SemconvStability.OLD) {
          attributes[ATTR_NET_PEER_NAME$5] = host;
          if (!isNaN(portNumber)) {
            attributes[ATTR_NET_PEER_PORT$5] = portNumber;
          }
        }
        if (thisPlugin._netSemconvStability & SemconvStability.STABLE) {
          attributes[srcExports.ATTR_SERVER_ADDRESS] = host;
          if (!isNaN(portNumber)) {
            attributes[srcExports.ATTR_SERVER_PORT] = portNumber;
          }
        }
        const span = thisPlugin.tracer.startSpan(getSpanName$2(query), {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        });
        if (thisPlugin.getConfig().enhancedDatabaseReporting) {
          let values;
          if (Array.isArray(_valuesOrCallback)) {
            values = _valuesOrCallback;
          } else if (arguments[2]) {
            values = [_valuesOrCallback];
          }
          span.setAttribute(AttributeNames$5.MYSQL_VALUES, getDbValues(query, values));
        }
        const cbIndex = Array.from(arguments).findIndex((arg) => typeof arg === "function");
        const parentContext = srcExports$1.context.active();
        if (cbIndex === -1) {
          const streamableQuery = srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
            return originalQuery.apply(connection, arguments);
          });
          srcExports$1.context.bind(parentContext, streamableQuery);
          return streamableQuery.on(
            "error",
            (err) => span.setStatus({
              code: srcExports$1.SpanStatusCode.ERROR,
              message: err.message
            })
          ).on("end", () => {
            span.end();
          });
        } else {
          thisPlugin._wrap(arguments, cbIndex, thisPlugin._patchCallbackQuery(span, parentContext));
          return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
            return originalQuery.apply(connection, arguments);
          });
        }
      };
    };
  }
  _patchCallbackQuery(span, parentContext) {
    return (originalCallback) => {
      return function(err, results, fields) {
        if (err) {
          span.setStatus({
            code: srcExports$1.SpanStatusCode.ERROR,
            message: err.message
          });
        }
        span.end();
        return srcExports$1.context.with(parentContext, () => originalCallback(...arguments));
      };
    };
  }
  _setPoolCallbacks(pool, id) {
    const poolNameOld = id || getPoolNameOld(pool);
    pool.on("connection", (_connection) => {
      this._connCountAdd(1, poolNameOld, "idle");
    });
    pool.on("acquire", (_connection) => {
      this._connCountAdd(-1, poolNameOld, "idle");
      this._connCountAdd(1, poolNameOld, "used");
    });
    pool.on("release", (_connection) => {
      this._connCountAdd(1, poolNameOld, "idle");
      this._connCountAdd(-1, poolNameOld, "used");
    });
  }
}
const INTEGRATION_NAME$e = "Mysql";
const instrumentMysql = generateInstrumentOnce(INTEGRATION_NAME$e, () => new MySQLInstrumentation({}));
const _mysqlIntegration = (() => {
  return {
    name: INTEGRATION_NAME$e,
    setupOnce() {
      instrumentMysql();
    }
  };
});
const mysqlIntegration = defineIntegration(_mysqlIntegration);
const ATTR_DB_CONNECTION_STRING$2 = "db.connection_string";
const ATTR_DB_NAME$2 = "db.name";
const ATTR_DB_STATEMENT$3 = "db.statement";
const ATTR_DB_SYSTEM$3 = "db.system";
const ATTR_DB_USER$2 = "db.user";
const ATTR_NET_PEER_NAME$4 = "net.peer.name";
const ATTR_NET_PEER_PORT$4 = "net.peer.port";
const DB_SYSTEM_VALUE_MYSQL = "mysql";
function hasValidSqlComment(query) {
  const indexOpeningDashDashComment = query.indexOf("--");
  if (indexOpeningDashDashComment >= 0) {
    return true;
  }
  const indexOpeningSlashComment = query.indexOf("/*");
  if (indexOpeningSlashComment < 0) {
    return false;
  }
  const indexClosingSlashComment = query.indexOf("*/");
  return indexOpeningDashDashComment < indexClosingSlashComment;
}
function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}
function addSqlCommenterComment(span, query) {
  if (typeof query !== "string" || query.length === 0) {
    return query;
  }
  if (hasValidSqlComment(query)) {
    return query;
  }
  const propagator = new W3CTraceContextPropagator();
  const headers = {};
  propagator.inject(srcExports$1.trace.setSpan(srcExports$1.ROOT_CONTEXT, span), headers, srcExports$1.defaultTextMapSetter);
  const sortedKeys = Object.keys(headers).sort();
  if (sortedKeys.length === 0) {
    return query;
  }
  const commentString = sortedKeys.map((key) => {
    const encodedValue = fixedEncodeURIComponent(headers[key]);
    return `${key}='${encodedValue}'`;
  }).join(",");
  return `${query} /*${commentString}*/`;
}
function getConnectionAttributes(config2, dbSemconvStability, netSemconvStability) {
  const { host, port, database, user } = getConfig(config2);
  const attrs = {};
  if (dbSemconvStability & SemconvStability.OLD) {
    attrs[ATTR_DB_CONNECTION_STRING$2] = getJDBCString(host, port, database);
    attrs[ATTR_DB_NAME$2] = database;
    attrs[ATTR_DB_USER$2] = user;
  }
  if (dbSemconvStability & SemconvStability.STABLE) {
    attrs[srcExports.ATTR_DB_NAMESPACE] = database;
  }
  const portNumber = parseInt(port, 10);
  if (netSemconvStability & SemconvStability.OLD) {
    attrs[ATTR_NET_PEER_NAME$4] = host;
    if (!isNaN(portNumber)) {
      attrs[ATTR_NET_PEER_PORT$4] = portNumber;
    }
  }
  if (netSemconvStability & SemconvStability.STABLE) {
    attrs[srcExports.ATTR_SERVER_ADDRESS] = host;
    if (!isNaN(portNumber)) {
      attrs[srcExports.ATTR_SERVER_PORT] = portNumber;
    }
  }
  return attrs;
}
function getConfig(config2) {
  const { host, port, database, user } = config2 && config2.connectionConfig || config2 || {};
  return { host, port, database, user };
}
function getJDBCString(host, port, database) {
  let jdbcString = `jdbc:mysql://${host || "localhost"}`;
  if (typeof port === "number") {
    jdbcString += `:${port}`;
  }
  if (typeof database === "string") {
    jdbcString += `/${database}`;
  }
  return jdbcString;
}
function getQueryText(query, format, values, maskStatement = false, maskStatementHook = defaultMaskingHook) {
  const [querySql, queryValues] = typeof query === "string" ? [query, values] : [query.sql, hasValues(query) ? values || query.values : values];
  try {
    if (maskStatement) {
      return maskStatementHook(querySql);
    } else if (format && queryValues) {
      return format(querySql, queryValues);
    } else {
      return querySql;
    }
  } catch (e) {
    return "Could not determine the query due to an error in masking or formatting";
  }
}
function defaultMaskingHook(query) {
  return query.replace(/\b\d+\b/g, "?").replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, "?");
}
function hasValues(obj) {
  return "values" in obj;
}
function getSpanName$1(query) {
  const rawQuery = typeof query === "object" ? query.sql : query;
  const firstSpace = rawQuery?.indexOf(" ");
  if (typeof firstSpace === "number" && firstSpace !== -1) {
    return rawQuery?.substring(0, firstSpace);
  }
  return rawQuery;
}
const once$1 = (fn) => {
  let called = false;
  return (...args) => {
    if (called) return;
    called = true;
    return fn(...args);
  };
};
function getConnectionPrototypeToInstrument(connection) {
  const connectionPrototype = connection.prototype;
  const basePrototype = Object.getPrototypeOf(connectionPrototype);
  if (typeof basePrototype?.query === "function" && typeof basePrototype?.execute === "function") {
    return basePrototype;
  }
  return connectionPrototype;
}
const PACKAGE_NAME$a = "@sentry/instrumentation-mysql2";
const supportedVersions$6 = [">=1.4.2 <4"];
class MySQL2Instrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$a, SDK_VERSION, config2);
    this._setSemconvStabilityFromEnv();
  }
  _setSemconvStabilityFromEnv() {
    this._netSemconvStability = semconvStabilityFromStr("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    this._dbSemconvStability = semconvStabilityFromStr("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
  }
  init() {
    let format;
    function setFormatFunction(moduleExports) {
      if (!format && moduleExports.format) {
        format = moduleExports.format;
      }
    }
    const patch = (ConnectionPrototype) => {
      if (isWrapped(ConnectionPrototype.query)) {
        this._unwrap(ConnectionPrototype, "query");
      }
      this._wrap(ConnectionPrototype, "query", this._patchQuery(format, false));
      if (isWrapped(ConnectionPrototype.execute)) {
        this._unwrap(ConnectionPrototype, "execute");
      }
      this._wrap(ConnectionPrototype, "execute", this._patchQuery(format, true));
    };
    const unpatch = (ConnectionPrototype) => {
      this._unwrap(ConnectionPrototype, "query");
      this._unwrap(ConnectionPrototype, "execute");
    };
    return [
      new InstrumentationNodeModuleDefinition(
        "mysql2",
        supportedVersions$6,
        (moduleExports) => {
          setFormatFunction(moduleExports);
          return moduleExports;
        },
        () => {
        },
        [
          new InstrumentationNodeModuleFile(
            "mysql2/promise.js",
            supportedVersions$6,
            (moduleExports) => {
              setFormatFunction(moduleExports);
              return moduleExports;
            },
            () => {
            }
          ),
          new InstrumentationNodeModuleFile(
            "mysql2/lib/connection.js",
            supportedVersions$6,
            (moduleExports) => {
              const ConnectionPrototype = getConnectionPrototypeToInstrument(moduleExports);
              patch(ConnectionPrototype);
              return moduleExports;
            },
            (moduleExports) => {
              if (moduleExports === void 0) return;
              const ConnectionPrototype = getConnectionPrototypeToInstrument(moduleExports);
              unpatch(ConnectionPrototype);
            }
          )
        ]
      )
    ];
  }
  _patchQuery(format, isPrepared) {
    return (originalQuery) => {
      const thisPlugin = this;
      return function query(query, _valuesOrCallback, _callback) {
        let values;
        if (Array.isArray(_valuesOrCallback)) {
          values = _valuesOrCallback;
        } else if (arguments[2]) {
          values = [_valuesOrCallback];
        }
        const { maskStatement, maskStatementHook, responseHook } = thisPlugin.getConfig();
        const attributes = getConnectionAttributes(
          this.config,
          thisPlugin._dbSemconvStability,
          thisPlugin._netSemconvStability
        );
        const dbQueryText = getQueryText(query, format, values, maskStatement, maskStatementHook);
        if (thisPlugin._dbSemconvStability & SemconvStability.OLD) {
          attributes[ATTR_DB_SYSTEM$3] = DB_SYSTEM_VALUE_MYSQL;
          attributes[ATTR_DB_STATEMENT$3] = dbQueryText;
        }
        if (thisPlugin._dbSemconvStability & SemconvStability.STABLE) {
          attributes[srcExports.ATTR_DB_SYSTEM_NAME] = srcExports.DB_SYSTEM_NAME_VALUE_MYSQL;
          attributes[srcExports.ATTR_DB_QUERY_TEXT] = dbQueryText;
        }
        const span = thisPlugin.tracer.startSpan(getSpanName$1(query), {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        });
        if (!isPrepared && thisPlugin.getConfig().addSqlCommenterCommentToQueries) {
          arguments[0] = query = typeof query === "string" ? addSqlCommenterComment(span, query) : Object.assign(query, {
            sql: addSqlCommenterComment(span, query.sql)
          });
        }
        const endSpan2 = once$1((err, results) => {
          if (err) {
            span.setStatus({
              code: srcExports$1.SpanStatusCode.ERROR,
              message: err.message
            });
          } else {
            if (typeof responseHook === "function") {
              safeExecuteInTheMiddle(
                () => {
                  responseHook(span, {
                    queryResults: results
                  });
                },
                (err2) => {
                  if (err2) {
                    thisPlugin._diag.warn("Failed executing responseHook", err2);
                  }
                },
                true
              );
            }
          }
          span.end();
        });
        if (arguments.length === 1) {
          if (typeof query.onResult === "function") {
            thisPlugin._wrap(query, "onResult", thisPlugin._patchCallbackQuery(endSpan2));
          }
          const streamableQuery = originalQuery.apply(this, arguments);
          streamableQuery.once("error", (err) => {
            endSpan2(err);
          }).once("result", (results) => {
            endSpan2(void 0, results);
          });
          return streamableQuery;
        }
        if (typeof arguments[1] === "function") {
          thisPlugin._wrap(arguments, 1, thisPlugin._patchCallbackQuery(endSpan2));
        } else if (typeof arguments[2] === "function") {
          thisPlugin._wrap(arguments, 2, thisPlugin._patchCallbackQuery(endSpan2));
        }
        return originalQuery.apply(this, arguments);
      };
    };
  }
  _patchCallbackQuery(endSpan2) {
    return (originalCallback) => {
      return function(err, results, _fields) {
        endSpan2(err, results);
        return originalCallback(...arguments);
      };
    };
  }
}
const INTEGRATION_NAME$d = "Mysql2";
const instrumentMysql2 = generateInstrumentOnce(
  INTEGRATION_NAME$d,
  () => new MySQL2Instrumentation({
    responseHook(span) {
      addOriginToSpan(span, "auto.db.otel.mysql2");
    }
  })
);
const _mysql2Integration = (() => {
  return {
    name: INTEGRATION_NAME$d,
    setupOnce() {
      instrumentMysql2();
    }
  };
});
const mysql2Integration = defineIntegration(_mysql2Integration);
const SINGLE_ARG_COMMANDS = ["get", "set", "setex"];
const GET_COMMANDS = ["get", "mget"];
const SET_COMMANDS = ["set", "setex"];
function isInCommands(redisCommands, command) {
  return redisCommands.includes(command.toLowerCase());
}
function getCacheOperation(command) {
  if (isInCommands(GET_COMMANDS, command)) {
    return "cache.get";
  } else if (isInCommands(SET_COMMANDS, command)) {
    return "cache.put";
  } else {
    return void 0;
  }
}
function keyHasPrefix(key, prefixes) {
  return prefixes.some((prefix) => key.startsWith(prefix));
}
function getCacheKeySafely(redisCommand, cmdArgs) {
  try {
    if (cmdArgs.length === 0) {
      return void 0;
    }
    const processArg = (arg) => {
      if (typeof arg === "string" || typeof arg === "number" || Buffer.isBuffer(arg)) {
        return [arg.toString()];
      } else if (Array.isArray(arg)) {
        return flatten(arg.map((arg2) => processArg(arg2)));
      } else {
        return ["<unknown>"];
      }
    };
    const firstArg = cmdArgs[0];
    if (isInCommands(SINGLE_ARG_COMMANDS, redisCommand) && firstArg != null) {
      return processArg(firstArg);
    }
    return flatten(cmdArgs.map((arg) => processArg(arg)));
  } catch {
    return void 0;
  }
}
function shouldConsiderForCache(redisCommand, keys, prefixes) {
  if (!getCacheOperation(redisCommand)) {
    return false;
  }
  for (const key of keys) {
    if (keyHasPrefix(key, prefixes)) {
      return true;
    }
  }
  return false;
}
function calculateCacheItemSize(response) {
  const getSize = (value) => {
    try {
      if (Buffer.isBuffer(value)) return value.byteLength;
      else if (typeof value === "string") return value.length;
      else if (typeof value === "number") return value.toString().length;
      else if (value === null || value === void 0) return 0;
      return JSON.stringify(value).length;
    } catch {
      return void 0;
    }
  };
  return Array.isArray(response) ? response.reduce((acc, curr) => {
    const size = getSize(curr);
    return typeof size === "number" ? acc !== void 0 ? acc + size : size : acc;
  }, 0) : getSize(response);
}
function flatten(input) {
  const result = [];
  const flattenHelper = (input2) => {
    input2.forEach((el) => {
      if (Array.isArray(el)) {
        flattenHelper(el);
      } else {
        result.push(el);
      }
    });
  };
  flattenHelper(input);
  return result;
}
const serializationSubsets = [
  {
    regex: /^ECHO/i,
    args: 0
  },
  {
    regex: /^(LPUSH|MSET|PFA|PUBLISH|RPUSH|SADD|SET|SPUBLISH|XADD|ZADD)/i,
    args: 1
  },
  {
    regex: /^(HSET|HMSET|LSET|LINSERT)/i,
    args: 2
  },
  {
    regex: /^(ACL|BIT|B[LRZ]|CLIENT|CLUSTER|CONFIG|COMMAND|DECR|DEL|EVAL|EX|FUNCTION|GEO|GET|HINCR|HMGET|HSCAN|INCR|L[TRLM]|MEMORY|P[EFISTU]|RPOP|S[CDIMORSU]|XACK|X[CDGILPRT]|Z[CDILMPRS])/i,
    args: -1
  }
];
const defaultDbStatementSerializer = (cmdName, cmdArgs) => {
  if (Array.isArray(cmdArgs) && cmdArgs.length) {
    const nArgsToSerialize = serializationSubsets.find(({ regex }) => regex.test(cmdName))?.args ?? 0;
    const argsToSerialize = nArgsToSerialize >= 0 ? cmdArgs.slice(0, nArgsToSerialize) : cmdArgs.slice();
    if (cmdArgs.length > argsToSerialize.length) {
      argsToSerialize.push(`[${cmdArgs.length - nArgsToSerialize} other arguments]`);
    }
    return `${cmdName} ${argsToSerialize.join(" ")}`;
  }
  return cmdName;
};
const ATTR_DB_CONNECTION_STRING$1 = "db.connection_string";
const ATTR_DB_STATEMENT$2 = "db.statement";
const ATTR_DB_SYSTEM$2 = "db.system";
const ATTR_NET_PEER_NAME$3 = "net.peer.name";
const ATTR_NET_PEER_PORT$3 = "net.peer.port";
const DB_SYSTEM_NAME_VALUE_REDIS = "redis";
const DB_SYSTEM_VALUE_REDIS = "redis";
const PACKAGE_NAME$9 = "@opentelemetry/instrumentation-ioredis";
const PACKAGE_VERSION$2 = "0.62.0";
function endSpan$1(span, err) {
  if (err) {
    span.recordException(err);
    span.setStatus({
      code: srcExports$1.SpanStatusCode.ERROR,
      message: err.message
    });
  }
  span.end();
}
const DEFAULT_CONFIG$2 = {
  requireParentSpan: true
};
class IORedisInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$9, PACKAGE_VERSION$2, { ...DEFAULT_CONFIG$2, ...config2 });
    this._setSemconvStabilityFromEnv();
  }
  _setSemconvStabilityFromEnv() {
    this._netSemconvStability = semconvStabilityFromStr("http", process.env["OTEL_SEMCONV_STABILITY_OPT_IN"]);
    this._dbSemconvStability = semconvStabilityFromStr("database", process.env["OTEL_SEMCONV_STABILITY_OPT_IN"]);
  }
  setConfig(config2 = {}) {
    super.setConfig({ ...DEFAULT_CONFIG$2, ...config2 });
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition(
        "ioredis",
        [">=2.0.0 <5.11.0"],
        (module, moduleVersion) => {
          const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
          if (isWrapped(moduleExports.prototype.sendCommand)) {
            this._unwrap(moduleExports.prototype, "sendCommand");
          }
          this._wrap(moduleExports.prototype, "sendCommand", this._patchSendCommand(moduleVersion));
          if (isWrapped(moduleExports.prototype.connect)) {
            this._unwrap(moduleExports.prototype, "connect");
          }
          this._wrap(moduleExports.prototype, "connect", this._patchConnection());
          return module;
        },
        (module) => {
          if (module === void 0) return;
          const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
          this._unwrap(moduleExports.prototype, "sendCommand");
          this._unwrap(moduleExports.prototype, "connect");
        }
      )
    ];
  }
  _patchSendCommand(moduleVersion) {
    return (original) => {
      return this._traceSendCommand(original, moduleVersion);
    };
  }
  _patchConnection() {
    return (original) => {
      return this._traceConnection(original);
    };
  }
  _traceSendCommand(original, moduleVersion) {
    const instrumentation = this;
    return function(cmd) {
      if (arguments.length < 1 || typeof cmd !== "object") {
        return original.apply(this, arguments);
      }
      const config2 = instrumentation.getConfig();
      const dbStatementSerializer = config2.dbStatementSerializer || defaultDbStatementSerializer;
      const hasNoParentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0;
      if (config2.requireParentSpan === true && hasNoParentSpan) {
        return original.apply(this, arguments);
      }
      const attributes = {};
      const { host, port } = this.options;
      const dbQueryText = dbStatementSerializer(cmd.name, cmd.args);
      if (instrumentation._dbSemconvStability & SemconvStability.OLD) {
        attributes[ATTR_DB_SYSTEM$2] = DB_SYSTEM_VALUE_REDIS;
        attributes[ATTR_DB_STATEMENT$2] = dbQueryText;
        attributes[ATTR_DB_CONNECTION_STRING$1] = `redis://${host}:${port}`;
      }
      if (instrumentation._dbSemconvStability & SemconvStability.STABLE) {
        attributes[srcExports.ATTR_DB_SYSTEM_NAME] = DB_SYSTEM_NAME_VALUE_REDIS;
        attributes[srcExports.ATTR_DB_QUERY_TEXT] = dbQueryText;
      }
      if (instrumentation._netSemconvStability & SemconvStability.OLD) {
        attributes[ATTR_NET_PEER_NAME$3] = host;
        attributes[ATTR_NET_PEER_PORT$3] = port;
      }
      if (instrumentation._netSemconvStability & SemconvStability.STABLE) {
        attributes[srcExports.ATTR_SERVER_ADDRESS] = host;
        attributes[srcExports.ATTR_SERVER_PORT] = port;
      }
      attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] = "auto.db.otel.redis";
      const span = instrumentation.tracer.startSpan(cmd.name, {
        kind: srcExports$1.SpanKind.CLIENT,
        attributes
      });
      const { requestHook } = config2;
      if (requestHook) {
        safeExecuteInTheMiddle(
          () => requestHook(span, {
            moduleVersion,
            cmdName: cmd.name,
            cmdArgs: cmd.args
          }),
          (e) => {
            if (e) {
              srcExports$1.diag.error("ioredis instrumentation: request hook failed", e);
            }
          },
          true
        );
      }
      try {
        const result = original.apply(this, arguments);
        const origResolve = cmd.resolve;
        cmd.resolve = function(result2) {
          safeExecuteInTheMiddle(
            () => config2.responseHook?.(span, cmd.name, cmd.args, result2),
            (e) => {
              if (e) {
                srcExports$1.diag.error("ioredis instrumentation: response hook failed", e);
              }
            },
            true
          );
          endSpan$1(span, null);
          origResolve(result2);
        };
        const origReject = cmd.reject;
        cmd.reject = function(err) {
          endSpan$1(span, err);
          origReject(err);
        };
        return result;
      } catch (error) {
        endSpan$1(span, error);
        throw error;
      }
    };
  }
  _traceConnection(original) {
    const instrumentation = this;
    return function() {
      const hasNoParentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0;
      if (instrumentation.getConfig().requireParentSpan === true && hasNoParentSpan) {
        return original.apply(this, arguments);
      }
      const attributes = {};
      const { host, port } = this.options;
      if (instrumentation._dbSemconvStability & SemconvStability.OLD) {
        attributes[ATTR_DB_SYSTEM$2] = DB_SYSTEM_VALUE_REDIS;
        attributes[ATTR_DB_STATEMENT$2] = "connect";
        attributes[ATTR_DB_CONNECTION_STRING$1] = `redis://${host}:${port}`;
      }
      if (instrumentation._dbSemconvStability & SemconvStability.STABLE) {
        attributes[srcExports.ATTR_DB_SYSTEM_NAME] = DB_SYSTEM_NAME_VALUE_REDIS;
        attributes[srcExports.ATTR_DB_QUERY_TEXT] = "connect";
      }
      if (instrumentation._netSemconvStability & SemconvStability.OLD) {
        attributes[ATTR_NET_PEER_NAME$3] = host;
        attributes[ATTR_NET_PEER_PORT$3] = port;
      }
      if (instrumentation._netSemconvStability & SemconvStability.STABLE) {
        attributes[srcExports.ATTR_SERVER_ADDRESS] = host;
        attributes[srcExports.ATTR_SERVER_PORT] = port;
      }
      attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] = "auto.db.otel.redis";
      const span = instrumentation.tracer.startSpan("connect", {
        kind: srcExports$1.SpanKind.CLIENT,
        attributes
      });
      try {
        const result = original.apply(this, arguments);
        if (typeof result?.then === "function") {
          return result.then(
            (value) => {
              endSpan$1(span, null);
              return value;
            },
            (error) => {
              endSpan$1(span, error);
              return Promise.reject(error);
            }
          );
        }
        endSpan$1(span, null);
        return result;
      } catch (error) {
        endSpan$1(span, error);
        throw error;
      }
    };
  }
}
const PACKAGE_NAME$8 = "@opentelemetry/instrumentation-redis";
const PACKAGE_VERSION$1 = "0.62.0";
const OTEL_OPEN_SPANS = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.redis.open_spans");
const MULTI_COMMAND_OPTIONS = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.redis.multi_command_options");
function removeCredentialsFromDBConnectionStringAttribute(diagLogger, url) {
  if (typeof url !== "string" || !url) {
    return void 0;
  }
  try {
    const u = new URL(url);
    u.searchParams.delete("user_pwd");
    u.username = "";
    u.password = "";
    return u.href;
  } catch (err) {
    diagLogger.error("failed to sanitize redis connection url", err);
  }
  return void 0;
}
function getClientAttributes(diagLogger, options, semconvStability) {
  const attributes = {};
  if (semconvStability & SemconvStability.OLD) {
    Object.assign(attributes, {
      [ATTR_DB_SYSTEM$2]: DB_SYSTEM_VALUE_REDIS,
      [ATTR_NET_PEER_NAME$3]: options?.socket?.host,
      [ATTR_NET_PEER_PORT$3]: options?.socket?.port,
      [ATTR_DB_CONNECTION_STRING$1]: removeCredentialsFromDBConnectionStringAttribute(diagLogger, options?.url)
    });
  }
  if (semconvStability & SemconvStability.STABLE) {
    Object.assign(attributes, {
      [srcExports.ATTR_DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_REDIS,
      [srcExports.ATTR_SERVER_ADDRESS]: options?.socket?.host,
      [srcExports.ATTR_SERVER_PORT]: options?.socket?.port
    });
  }
  return attributes;
}
function endSpanV2(span, err) {
  if (err) {
    span.setStatus({
      code: srcExports$1.SpanStatusCode.ERROR,
      message: err.message
    });
  }
  span.end();
}
function getTracedCreateClient(original) {
  return function createClientTrace() {
    const client = original.apply(this, arguments);
    return srcExports$1.context.bind(srcExports$1.context.active(), client);
  };
}
function getTracedCreateStreamTrace(original) {
  return function create_stream_trace() {
    if (!Object.prototype.hasOwnProperty.call(this, "stream")) {
      Object.defineProperty(this, "stream", {
        get() {
          return this._patched_redis_stream;
        },
        set(val) {
          srcExports$1.context.bind(srcExports$1.context.active(), val);
          this._patched_redis_stream = val;
        }
      });
    }
    return original.apply(this, arguments);
  };
}
const _RedisInstrumentationV2_V3 = class _RedisInstrumentationV2_V32 extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$8, PACKAGE_VERSION$1, config2);
    this._semconvStability = config2.semconvStability ? config2.semconvStability : semconvStabilityFromStr("database", process.env["OTEL_SEMCONV_STABILITY_OPT_IN"]);
  }
  setConfig(config2 = {}) {
    super.setConfig(config2);
    this._semconvStability = config2.semconvStability ? config2.semconvStability : semconvStabilityFromStr("database", process.env["OTEL_SEMCONV_STABILITY_OPT_IN"]);
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition(
        "redis",
        [">=2.6.0 <4"],
        (moduleExports) => {
          if (isWrapped(moduleExports.RedisClient.prototype["internal_send_command"])) {
            this._unwrap(moduleExports.RedisClient.prototype, "internal_send_command");
          }
          this._wrap(moduleExports.RedisClient.prototype, "internal_send_command", this._getPatchInternalSendCommand());
          if (isWrapped(moduleExports.RedisClient.prototype["create_stream"])) {
            this._unwrap(moduleExports.RedisClient.prototype, "create_stream");
          }
          this._wrap(moduleExports.RedisClient.prototype, "create_stream", this._getPatchCreateStream());
          if (isWrapped(moduleExports.createClient)) {
            this._unwrap(moduleExports, "createClient");
          }
          this._wrap(moduleExports, "createClient", this._getPatchCreateClient());
          return moduleExports;
        },
        (moduleExports) => {
          if (moduleExports === void 0) return;
          this._unwrap(moduleExports.RedisClient.prototype, "internal_send_command");
          this._unwrap(moduleExports.RedisClient.prototype, "create_stream");
          this._unwrap(moduleExports, "createClient");
        }
      )
    ];
  }
  _getPatchInternalSendCommand() {
    const instrumentation = this;
    return function internal_send_command(original) {
      return function internal_send_command_trace(cmd) {
        if (arguments.length !== 1 || typeof cmd !== "object") {
          return original.apply(this, arguments);
        }
        const config2 = instrumentation.getConfig();
        const hasNoParentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0;
        if (config2.requireParentSpan === true && hasNoParentSpan) {
          return original.apply(this, arguments);
        }
        const dbStatementSerializer = config2?.dbStatementSerializer || defaultDbStatementSerializer;
        const attributes = {};
        if (instrumentation._semconvStability & SemconvStability.OLD) {
          Object.assign(attributes, {
            [ATTR_DB_SYSTEM$2]: DB_SYSTEM_VALUE_REDIS,
            [ATTR_DB_STATEMENT$2]: dbStatementSerializer(cmd.command, cmd.args)
          });
        }
        if (instrumentation._semconvStability & SemconvStability.STABLE) {
          Object.assign(attributes, {
            [srcExports.ATTR_DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_REDIS,
            [srcExports.ATTR_DB_OPERATION_NAME]: cmd.command,
            [srcExports.ATTR_DB_QUERY_TEXT]: dbStatementSerializer(cmd.command, cmd.args)
          });
        }
        attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] = "auto.db.otel.redis";
        const span = instrumentation.tracer.startSpan(`${_RedisInstrumentationV2_V32.COMPONENT}-${cmd.command}`, {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        });
        if (this.connection_options) {
          const connectionAttributes = {};
          if (instrumentation._semconvStability & SemconvStability.OLD) {
            Object.assign(connectionAttributes, {
              [ATTR_NET_PEER_NAME$3]: this.connection_options.host,
              [ATTR_NET_PEER_PORT$3]: this.connection_options.port
            });
          }
          if (instrumentation._semconvStability & SemconvStability.STABLE) {
            Object.assign(connectionAttributes, {
              [srcExports.ATTR_SERVER_ADDRESS]: this.connection_options.host,
              [srcExports.ATTR_SERVER_PORT]: this.connection_options.port
            });
          }
          span.setAttributes(connectionAttributes);
        }
        if (this.address && instrumentation._semconvStability & SemconvStability.OLD) {
          span.setAttribute(ATTR_DB_CONNECTION_STRING$1, `redis://${this.address}`);
        }
        const originalCallback = arguments[0].callback;
        if (originalCallback) {
          const originalContext = srcExports$1.context.active();
          arguments[0].callback = function callback(err, reply) {
            if (config2?.responseHook) {
              const responseHook = config2.responseHook;
              safeExecuteInTheMiddle(
                () => {
                  responseHook(span, cmd.command, cmd.args, reply);
                },
                (e) => {
                  if (e) {
                    instrumentation._diag.error("Error executing responseHook", e);
                  }
                },
                true
              );
            }
            endSpanV2(span, err);
            return srcExports$1.context.with(originalContext, originalCallback, this, ...arguments);
          };
        }
        try {
          return original.apply(this, arguments);
        } catch (rethrow) {
          endSpanV2(span, rethrow);
          throw rethrow;
        }
      };
    };
  }
  _getPatchCreateClient() {
    return function createClient(original) {
      return getTracedCreateClient(original);
    };
  }
  _getPatchCreateStream() {
    return function createReadStream(original) {
      return getTracedCreateStreamTrace(original);
    };
  }
};
_RedisInstrumentationV2_V3.COMPONENT = "redis";
let RedisInstrumentationV2_V3 = _RedisInstrumentationV2_V3;
const _RedisInstrumentationV4_V5 = class _RedisInstrumentationV4_V52 extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$8, PACKAGE_VERSION$1, config2);
    this._semconvStability = config2.semconvStability ? config2.semconvStability : semconvStabilityFromStr("database", process.env["OTEL_SEMCONV_STABILITY_OPT_IN"]);
  }
  setConfig(config2 = {}) {
    super.setConfig(config2);
    this._semconvStability = config2.semconvStability ? config2.semconvStability : semconvStabilityFromStr("database", process.env["OTEL_SEMCONV_STABILITY_OPT_IN"]);
  }
  init() {
    return [
      this._getInstrumentationNodeModuleDefinition("@redis/client"),
      this._getInstrumentationNodeModuleDefinition("@node-redis/client")
    ];
  }
  _getInstrumentationNodeModuleDefinition(basePackageName) {
    const commanderModuleFile = new InstrumentationNodeModuleFile(
      `${basePackageName}/dist/lib/commander.js`,
      ["^1.0.0"],
      (moduleExports, moduleVersion) => {
        const transformCommandArguments = moduleExports.transformCommandArguments;
        if (!transformCommandArguments) {
          this._diag.error("internal instrumentation error, missing transformCommandArguments function");
          return moduleExports;
        }
        const functionToPatch = moduleVersion?.startsWith("1.0.") ? "extendWithCommands" : "attachCommands";
        if (isWrapped(moduleExports?.[functionToPatch])) {
          this._unwrap(moduleExports, functionToPatch);
        }
        this._wrap(moduleExports, functionToPatch, this._getPatchExtendWithCommands(transformCommandArguments));
        return moduleExports;
      },
      (moduleExports) => {
        if (isWrapped(moduleExports?.extendWithCommands)) {
          this._unwrap(moduleExports, "extendWithCommands");
        }
        if (isWrapped(moduleExports?.attachCommands)) {
          this._unwrap(moduleExports, "attachCommands");
        }
      }
    );
    const multiCommanderModule = new InstrumentationNodeModuleFile(
      `${basePackageName}/dist/lib/client/multi-command.js`,
      ["^1.0.0", ">=5.0.0 <5.12.0"],
      (moduleExports) => {
        const redisClientMultiCommandPrototype = moduleExports?.default?.prototype;
        if (isWrapped(redisClientMultiCommandPrototype?.exec)) {
          this._unwrap(redisClientMultiCommandPrototype, "exec");
        }
        this._wrap(redisClientMultiCommandPrototype, "exec", this._getPatchMultiCommandsExec(false));
        if (isWrapped(redisClientMultiCommandPrototype?.execAsPipeline)) {
          this._unwrap(redisClientMultiCommandPrototype, "execAsPipeline");
        }
        this._wrap(redisClientMultiCommandPrototype, "execAsPipeline", this._getPatchMultiCommandsExec(true));
        if (isWrapped(redisClientMultiCommandPrototype?.addCommand)) {
          this._unwrap(redisClientMultiCommandPrototype, "addCommand");
        }
        this._wrap(redisClientMultiCommandPrototype, "addCommand", this._getPatchMultiCommandsAddCommand());
        return moduleExports;
      },
      (moduleExports) => {
        const redisClientMultiCommandPrototype = moduleExports?.default?.prototype;
        if (isWrapped(redisClientMultiCommandPrototype?.exec)) {
          this._unwrap(redisClientMultiCommandPrototype, "exec");
        }
        if (isWrapped(redisClientMultiCommandPrototype?.execAsPipeline)) {
          this._unwrap(redisClientMultiCommandPrototype, "execAsPipeline");
        }
        if (isWrapped(redisClientMultiCommandPrototype?.addCommand)) {
          this._unwrap(redisClientMultiCommandPrototype, "addCommand");
        }
      }
    );
    const clientIndexModule = new InstrumentationNodeModuleFile(
      `${basePackageName}/dist/lib/client/index.js`,
      ["^1.0.0", ">=5.0.0 <5.12.0"],
      (moduleExports) => {
        const redisClientPrototype = moduleExports?.default?.prototype;
        if (redisClientPrototype?.multi) {
          if (isWrapped(redisClientPrototype?.multi)) {
            this._unwrap(redisClientPrototype, "multi");
          }
          this._wrap(redisClientPrototype, "multi", this._getPatchRedisClientMulti());
        }
        if (redisClientPrototype?.MULTI) {
          if (isWrapped(redisClientPrototype?.MULTI)) {
            this._unwrap(redisClientPrototype, "MULTI");
          }
          this._wrap(redisClientPrototype, "MULTI", this._getPatchRedisClientMulti());
        }
        if (isWrapped(redisClientPrototype?.sendCommand)) {
          this._unwrap(redisClientPrototype, "sendCommand");
        }
        this._wrap(redisClientPrototype, "sendCommand", this._getPatchRedisClientSendCommand());
        if (isWrapped(redisClientPrototype?.connect)) {
          this._unwrap(redisClientPrototype, "connect");
        }
        this._wrap(redisClientPrototype, "connect", this._getPatchedClientConnect());
        return moduleExports;
      },
      (moduleExports) => {
        const redisClientPrototype = moduleExports?.default?.prototype;
        if (isWrapped(redisClientPrototype?.multi)) {
          this._unwrap(redisClientPrototype, "multi");
        }
        if (isWrapped(redisClientPrototype?.MULTI)) {
          this._unwrap(redisClientPrototype, "MULTI");
        }
        if (isWrapped(redisClientPrototype?.sendCommand)) {
          this._unwrap(redisClientPrototype, "sendCommand");
        }
        if (isWrapped(redisClientPrototype?.connect)) {
          this._unwrap(redisClientPrototype, "connect");
        }
      }
    );
    return new InstrumentationNodeModuleDefinition(
      basePackageName,
      ["^1.0.0", ">=5.0.0 <5.12.0"],
      (moduleExports) => moduleExports,
      () => {
      },
      [commanderModuleFile, multiCommanderModule, clientIndexModule]
    );
  }
  _getPatchExtendWithCommands(transformCommandArguments) {
    const plugin = this;
    return function extendWithCommandsPatchWrapper(original) {
      return function extendWithCommandsPatch(config2) {
        if (config2?.BaseClass?.name !== "RedisClient") {
          return original.apply(this, arguments);
        }
        const origExecutor = config2.executor;
        config2.executor = function(command, args) {
          const redisCommandArguments = transformCommandArguments(command, args).args;
          return plugin._traceClientCommand(origExecutor, this, arguments, redisCommandArguments);
        };
        return original.apply(this, arguments);
      };
    };
  }
  _getPatchMultiCommandsExec(isPipeline) {
    const plugin = this;
    return function execPatchWrapper(original) {
      return function execPatch() {
        const execRes = original.apply(this, arguments);
        if (typeof execRes?.then !== "function") {
          plugin._diag.error("non-promise result when patching exec/execAsPipeline");
          return execRes;
        }
        return execRes.then((redisRes) => {
          const openSpans = this[OTEL_OPEN_SPANS];
          plugin._endSpansWithRedisReplies(openSpans, redisRes, isPipeline);
          return redisRes;
        }).catch((err) => {
          const openSpans = this[OTEL_OPEN_SPANS];
          if (!openSpans) {
            plugin._diag.error("cannot find open spans to end for multi/pipeline");
          } else {
            const replies = err.constructor.name === "MultiErrorReply" ? err.replies : new Array(openSpans.length).fill(err);
            plugin._endSpansWithRedisReplies(openSpans, replies, isPipeline);
          }
          return Promise.reject(err);
        });
      };
    };
  }
  _getPatchMultiCommandsAddCommand() {
    const plugin = this;
    return function addCommandWrapper(original) {
      return function addCommandPatch(args) {
        return plugin._traceClientCommand(original, this, arguments, args);
      };
    };
  }
  _getPatchRedisClientMulti() {
    return function multiPatchWrapper(original) {
      return function multiPatch() {
        const multiRes = original.apply(this, arguments);
        multiRes[MULTI_COMMAND_OPTIONS] = this.options;
        return multiRes;
      };
    };
  }
  _getPatchRedisClientSendCommand() {
    const plugin = this;
    return function sendCommandWrapper(original) {
      return function sendCommandPatch(args) {
        return plugin._traceClientCommand(original, this, arguments, args);
      };
    };
  }
  _getPatchedClientConnect() {
    const plugin = this;
    return function connectWrapper(original) {
      return function patchedConnect() {
        const options = this.options;
        const attributes = getClientAttributes(plugin._diag, options, plugin._semconvStability);
        attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] = "auto.db.otel.redis";
        const span = plugin.tracer.startSpan(`${_RedisInstrumentationV4_V52.COMPONENT}-connect`, {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        });
        const res = srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
          return original.apply(this);
        });
        return res.then((result) => {
          span.end();
          return result;
        }).catch((error) => {
          span.recordException(error);
          span.setStatus({
            code: srcExports$1.SpanStatusCode.ERROR,
            message: error.message
          });
          span.end();
          return Promise.reject(error);
        });
      };
    };
  }
  _traceClientCommand(origFunction, origThis, origArguments, redisCommandArguments) {
    const hasNoParentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0;
    if (hasNoParentSpan && this.getConfig().requireParentSpan) {
      return origFunction.apply(origThis, origArguments);
    }
    const clientOptions = origThis.options || origThis[MULTI_COMMAND_OPTIONS];
    const commandName = redisCommandArguments[0];
    const commandArgs = redisCommandArguments.slice(1);
    const dbStatementSerializer = this.getConfig().dbStatementSerializer || defaultDbStatementSerializer;
    const attributes = getClientAttributes(this._diag, clientOptions, this._semconvStability);
    if (this._semconvStability & SemconvStability.STABLE) {
      attributes[srcExports.ATTR_DB_OPERATION_NAME] = commandName;
    }
    try {
      const dbStatement = dbStatementSerializer(commandName, commandArgs);
      if (dbStatement != null) {
        if (this._semconvStability & SemconvStability.OLD) {
          attributes[ATTR_DB_STATEMENT$2] = dbStatement;
        }
        if (this._semconvStability & SemconvStability.STABLE) {
          attributes[srcExports.ATTR_DB_QUERY_TEXT] = dbStatement;
        }
      }
    } catch (e) {
      this._diag.error("dbStatementSerializer throw an exception", e, { commandName });
    }
    attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] = "auto.db.otel.redis";
    const span = this.tracer.startSpan(`${_RedisInstrumentationV4_V52.COMPONENT}-${commandName}`, {
      kind: srcExports$1.SpanKind.CLIENT,
      attributes
    });
    const res = srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
      return origFunction.apply(origThis, origArguments);
    });
    if (typeof res?.then === "function") {
      res.then(
        (redisRes) => {
          this._endSpanWithResponse(span, commandName, commandArgs, redisRes, void 0);
        },
        (err) => {
          this._endSpanWithResponse(span, commandName, commandArgs, null, err);
        }
      );
    } else {
      const redisClientMultiCommand = res;
      redisClientMultiCommand[OTEL_OPEN_SPANS] = redisClientMultiCommand[OTEL_OPEN_SPANS] || [];
      redisClientMultiCommand[OTEL_OPEN_SPANS].push({
        span,
        commandName,
        commandArgs
      });
    }
    return res;
  }
  _endSpansWithRedisReplies(openSpans, replies, isPipeline = false) {
    if (!openSpans) {
      return this._diag.error("cannot find open spans to end for redis multi/pipeline");
    }
    if (replies.length !== openSpans.length) {
      return this._diag.error("number of multi command spans does not match response from redis");
    }
    const allCommands = openSpans.map((s) => s.commandName);
    const allSameCommand = allCommands.every((cmd) => cmd === allCommands[0]);
    const operationName = allSameCommand ? (isPipeline ? "PIPELINE " : "MULTI ") + allCommands[0] : isPipeline ? "PIPELINE" : "MULTI";
    for (let i = 0; i < openSpans.length; i++) {
      const { span, commandArgs } = openSpans[i];
      const currCommandRes = replies[i];
      const [res, err] = currCommandRes instanceof Error ? [null, currCommandRes] : [currCommandRes, void 0];
      if (this._semconvStability & SemconvStability.STABLE) {
        span.setAttribute(srcExports.ATTR_DB_OPERATION_NAME, operationName);
      }
      this._endSpanWithResponse(span, allCommands[i], commandArgs, res, err);
    }
  }
  _endSpanWithResponse(span, commandName, commandArgs, response, error) {
    const { responseHook } = this.getConfig();
    if (!error && responseHook) {
      try {
        responseHook(span, commandName, commandArgs, response);
      } catch (err) {
        this._diag.error("responseHook throw an exception", err);
      }
    }
    if (error) {
      span.recordException(error);
      span.setStatus({ code: srcExports$1.SpanStatusCode.ERROR, message: error?.message });
    }
    span.end();
  }
};
_RedisInstrumentationV4_V5.COMPONENT = "redis";
let RedisInstrumentationV4_V5 = _RedisInstrumentationV4_V5;
const DEFAULT_CONFIG$1 = {
  requireParentSpan: false
};
class RedisInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    const resolvedConfig = { ...DEFAULT_CONFIG$1, ...config2 };
    super(PACKAGE_NAME$8, PACKAGE_VERSION$1, resolvedConfig);
    this.initialized = false;
    this.instrumentationV2_V3 = new RedisInstrumentationV2_V3(this.getConfig());
    this.instrumentationV4_V5 = new RedisInstrumentationV4_V5(this.getConfig());
    this.initialized = true;
  }
  setConfig(config2 = {}) {
    const newConfig = { ...DEFAULT_CONFIG$1, ...config2 };
    super.setConfig(newConfig);
    if (!this.initialized) {
      return;
    }
    this.instrumentationV2_V3.setConfig(newConfig);
    this.instrumentationV4_V5.setConfig(newConfig);
  }
  init() {
  }
  getModuleDefinitions() {
    return [...this.instrumentationV2_V3.getModuleDefinitions(), ...this.instrumentationV4_V5.getModuleDefinitions()];
  }
  setTracerProvider(tracerProvider) {
    super.setTracerProvider(tracerProvider);
    if (!this.initialized) {
      return;
    }
    this.instrumentationV2_V3.setTracerProvider(tracerProvider);
    this.instrumentationV4_V5.setTracerProvider(tracerProvider);
  }
  enable() {
    super.enable();
    if (!this.initialized) {
      return;
    }
    this.instrumentationV2_V3.enable();
    this.instrumentationV4_V5.enable();
  }
  disable() {
    super.disable();
    if (!this.initialized) {
      return;
    }
    this.instrumentationV2_V3.disable();
    this.instrumentationV4_V5.disable();
  }
}
const INTEGRATION_NAME$c = "Redis";
let _redisOptions = {};
const cacheResponseHook = (span, redisCommand, cmdArgs, response) => {
  const safeKey = getCacheKeySafely(redisCommand, cmdArgs);
  const cacheOperation = getCacheOperation(redisCommand);
  if (!safeKey || !cacheOperation || !_redisOptions.cachePrefixes || !shouldConsiderForCache(redisCommand, safeKey, _redisOptions.cachePrefixes)) {
    return;
  }
  const spanData = spanToJSON(span).data;
  const networkPeerAddress = spanData["net.peer.name"] ?? spanData["server.address"];
  const networkPeerPort = spanData["net.peer.port"] ?? spanData["server.port"];
  if (networkPeerPort && networkPeerAddress) {
    span.setAttributes({ "network.peer.address": networkPeerAddress, "network.peer.port": networkPeerPort });
  }
  const cacheItemSize = calculateCacheItemSize(response);
  if (cacheItemSize) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE, cacheItemSize);
  }
  if (isInCommands(GET_COMMANDS, redisCommand) && cacheItemSize !== void 0) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_CACHE_HIT, cacheItemSize > 0);
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: cacheOperation,
    [SEMANTIC_ATTRIBUTE_CACHE_KEY]: safeKey
  });
  const spanDescription = safeKey.join(", ");
  span.updateName(
    _redisOptions.maxCacheKeyLength ? truncate(spanDescription, _redisOptions.maxCacheKeyLength) : spanDescription
  );
};
const instrumentIORedis = generateInstrumentOnce(`${INTEGRATION_NAME$c}.IORedis`, () => {
  return new IORedisInstrumentation({
    responseHook: cacheResponseHook
  });
});
const instrumentRedisModule = generateInstrumentOnce(`${INTEGRATION_NAME$c}.Redis`, () => {
  return new RedisInstrumentation({
    responseHook: cacheResponseHook
  });
});
const instrumentRedis = Object.assign(
  () => {
    instrumentIORedis();
    instrumentRedisModule();
    void Promise.resolve().then(() => subscribeRedisDiagnosticChannels(tracingChannel, cacheResponseHook));
  },
  { id: INTEGRATION_NAME$c }
);
const _redisIntegration = ((options = {}) => {
  return {
    name: INTEGRATION_NAME$c,
    setupOnce() {
      _redisOptions = options;
      instrumentRedis();
    }
  };
});
const redisIntegration = defineIntegration(_redisIntegration);
const EVENT_LISTENERS_SET = /* @__PURE__ */ Symbol("opentelemetry.instrumentation.pg.eventListenersSet");
var AttributeNames$4 = /* @__PURE__ */ ((AttributeNames2) => {
  AttributeNames2["PG_VALUES"] = "db.postgresql.values";
  AttributeNames2["PG_PLAN"] = "db.postgresql.plan";
  AttributeNames2["IDLE_TIMEOUT_MILLIS"] = "db.postgresql.idle.timeout.millis";
  AttributeNames2["MAX_CLIENT"] = "db.postgresql.max.client";
  return AttributeNames2;
})(AttributeNames$4 || {});
const ATTR_DB_CLIENT_CONNECTION_POOL_NAME = "db.client.connection.pool.name";
const ATTR_DB_CLIENT_CONNECTION_STATE = "db.client.connection.state";
const ATTR_DB_CONNECTION_STRING = "db.connection_string";
const ATTR_DB_NAME$1 = "db.name";
const ATTR_DB_STATEMENT$1 = "db.statement";
const ATTR_DB_SYSTEM$1 = "db.system";
const ATTR_DB_USER$1 = "db.user";
const ATTR_NET_PEER_NAME$2 = "net.peer.name";
const ATTR_NET_PEER_PORT$2 = "net.peer.port";
const DB_CLIENT_CONNECTION_STATE_VALUE_IDLE = "idle";
const DB_CLIENT_CONNECTION_STATE_VALUE_USED = "used";
const DB_SYSTEM_VALUE_POSTGRESQL = "postgresql";
const METRIC_DB_CLIENT_CONNECTION_COUNT = "db.client.connection.count";
const METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS = "db.client.connection.pending_requests";
var SpanNames = /* @__PURE__ */ ((SpanNames2) => {
  SpanNames2["QUERY_PREFIX"] = "pg.query";
  SpanNames2["CONNECT"] = "pg.connect";
  SpanNames2["POOL_CONNECT"] = "pg-pool.connect";
  return SpanNames2;
})(SpanNames || {});
function getQuerySpanName(dbName, queryConfig) {
  if (!queryConfig) return SpanNames.QUERY_PREFIX;
  const command = typeof queryConfig.name === "string" && queryConfig.name ? queryConfig.name : parseNormalizedOperationName(queryConfig.text);
  return `${SpanNames.QUERY_PREFIX}:${command}${dbName ? ` ${dbName}` : ""}`;
}
function parseNormalizedOperationName(queryText) {
  const trimmedQuery = queryText.trim();
  const indexOfFirstSpace = trimmedQuery.indexOf(" ");
  let sqlCommand = indexOfFirstSpace === -1 ? trimmedQuery : trimmedQuery.slice(0, indexOfFirstSpace);
  sqlCommand = sqlCommand.toUpperCase();
  return sqlCommand.endsWith(";") ? sqlCommand.slice(0, -1) : sqlCommand;
}
function parseAndMaskConnectionString(connectionString) {
  try {
    const url = new URL(connectionString);
    url.username = "";
    url.password = "";
    return url.toString();
  } catch (e) {
    return "postgresql://localhost:5432/";
  }
}
function getConnectionString(params) {
  if ("connectionString" in params && params.connectionString) {
    return parseAndMaskConnectionString(params.connectionString);
  }
  const host = params.host || "localhost";
  const port = params.port || 5432;
  const database = params.database || "";
  return `postgresql://${host}:${port}/${database}`;
}
function getPort$1(port) {
  if (Number.isInteger(port)) {
    return port;
  }
  return void 0;
}
function getSemanticAttributesFromConnection(params, semconvStability) {
  let attributes = {};
  if (semconvStability & SemconvStability.OLD) {
    attributes = {
      ...attributes,
      [ATTR_DB_SYSTEM$1]: DB_SYSTEM_VALUE_POSTGRESQL,
      [ATTR_DB_NAME$1]: params.database,
      [ATTR_DB_CONNECTION_STRING]: getConnectionString(params),
      [ATTR_DB_USER$1]: params.user,
      [ATTR_NET_PEER_NAME$2]: params.host,
      // required
      [ATTR_NET_PEER_PORT$2]: getPort$1(params.port)
    };
  }
  if (semconvStability & SemconvStability.STABLE) {
    attributes = {
      ...attributes,
      [srcExports.ATTR_DB_SYSTEM_NAME]: srcExports.DB_SYSTEM_NAME_VALUE_POSTGRESQL,
      [srcExports.ATTR_DB_NAMESPACE]: params.namespace,
      [srcExports.ATTR_SERVER_ADDRESS]: params.host,
      [srcExports.ATTR_SERVER_PORT]: getPort$1(params.port)
    };
  }
  return attributes;
}
function getSemanticAttributesFromPoolConnection(params, semconvStability) {
  let url;
  try {
    url = params.connectionString ? new URL(params.connectionString) : void 0;
  } catch (e) {
    url = void 0;
  }
  let attributes = {
    [AttributeNames$4.IDLE_TIMEOUT_MILLIS]: params.idleTimeoutMillis,
    [AttributeNames$4.MAX_CLIENT]: params.maxClient
  };
  if (semconvStability & SemconvStability.OLD) {
    attributes = {
      ...attributes,
      [ATTR_DB_SYSTEM$1]: DB_SYSTEM_VALUE_POSTGRESQL,
      [ATTR_DB_NAME$1]: url?.pathname.slice(1) ?? params.database,
      [ATTR_DB_CONNECTION_STRING]: getConnectionString(params),
      [ATTR_NET_PEER_NAME$2]: url?.hostname ?? params.host,
      [ATTR_NET_PEER_PORT$2]: Number(url?.port) || getPort$1(params.port),
      [ATTR_DB_USER$1]: url?.username ?? params.user
    };
  }
  if (semconvStability & SemconvStability.STABLE) {
    attributes = {
      ...attributes,
      [srcExports.ATTR_DB_SYSTEM_NAME]: srcExports.DB_SYSTEM_NAME_VALUE_POSTGRESQL,
      [srcExports.ATTR_DB_NAMESPACE]: params.namespace,
      [srcExports.ATTR_SERVER_ADDRESS]: url?.hostname ?? params.host,
      [srcExports.ATTR_SERVER_PORT]: Number(url?.port) || getPort$1(params.port)
    };
  }
  return attributes;
}
function shouldSkipInstrumentation(instrumentationConfig) {
  return instrumentationConfig.requireParentSpan === true && srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0;
}
function handleConfigQuery(tracer, instrumentationConfig, semconvStability, queryConfig) {
  const { connectionParameters } = this;
  const dbName = connectionParameters.database;
  const spanName = getQuerySpanName(dbName, queryConfig);
  const span = tracer.startSpan(spanName, {
    kind: srcExports$1.SpanKind.CLIENT,
    attributes: getSemanticAttributesFromConnection(connectionParameters, semconvStability)
  });
  if (!queryConfig) {
    return span;
  }
  if (queryConfig.text) {
    if (semconvStability & SemconvStability.OLD) {
      span.setAttribute(ATTR_DB_STATEMENT$1, queryConfig.text);
    }
    if (semconvStability & SemconvStability.STABLE) {
      span.setAttribute(srcExports.ATTR_DB_QUERY_TEXT, queryConfig.text);
    }
  }
  if (instrumentationConfig.enhancedDatabaseReporting && Array.isArray(queryConfig.values)) {
    try {
      const convertedValues = queryConfig.values.map((value) => {
        if (value == null) {
          return "null";
        } else if (value instanceof Buffer) {
          return value.toString();
        } else if (typeof value === "object") {
          if (typeof value.toPostgres === "function") {
            return value.toPostgres();
          }
          return JSON.stringify(value);
        } else {
          return value.toString();
        }
      });
      span.setAttribute(AttributeNames$4.PG_VALUES, convertedValues);
    } catch (e) {
      srcExports$1.diag.error("failed to stringify ", queryConfig.values, e);
    }
  }
  if (typeof queryConfig.name === "string") {
    span.setAttribute(AttributeNames$4.PG_PLAN, queryConfig.name);
  }
  return span;
}
function handleExecutionResult(config2, span, pgResult) {
  if (typeof config2.responseHook === "function") {
    safeExecuteInTheMiddle(
      () => {
        config2.responseHook(span, {
          data: pgResult
        });
      },
      (err) => {
        if (err) {
          srcExports$1.diag.error("Error running response hook", err);
        }
      },
      true
    );
  }
}
function patchCallback(instrumentationConfig, span, cb, attributes, recordDuration) {
  return function patchedCallback(err, res) {
    if (err) {
      if (Object.prototype.hasOwnProperty.call(err, "code")) {
        attributes[srcExports.ATTR_ERROR_TYPE] = err["code"];
      }
      if (err instanceof Error) {
        span.recordException(sanitizedErrorMessage(err));
      }
      span.setStatus({
        code: srcExports$1.SpanStatusCode.ERROR,
        message: err.message
      });
    } else {
      handleExecutionResult(instrumentationConfig, span, res);
    }
    recordDuration();
    span.end();
    cb.call(this, err, res);
  };
}
function getPoolName(pool) {
  let poolName = "";
  poolName += (pool?.host ? `${pool.host}` : "unknown_host") + ":";
  poolName += (pool?.port ? `${pool.port}` : "unknown_port") + "/";
  poolName += pool?.database ? `${pool.database}` : "unknown_database";
  return poolName.trim();
}
function updateCounter(poolName, pool, connectionCount, connectionPendingRequests, latestCounter) {
  const all = pool.totalCount;
  const pending = pool.waitingCount;
  const idle = pool.idleCount;
  const used = all - idle;
  connectionCount.add(used - latestCounter.used, {
    [ATTR_DB_CLIENT_CONNECTION_STATE]: DB_CLIENT_CONNECTION_STATE_VALUE_USED,
    [ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
  });
  connectionCount.add(idle - latestCounter.idle, {
    [ATTR_DB_CLIENT_CONNECTION_STATE]: DB_CLIENT_CONNECTION_STATE_VALUE_IDLE,
    [ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
  });
  connectionPendingRequests.add(pending - latestCounter.pending, {
    [ATTR_DB_CLIENT_CONNECTION_POOL_NAME]: poolName
  });
  return { used, idle, pending };
}
function patchCallbackPGPool(span, cb) {
  return function patchedCallback(err, res, done) {
    if (err) {
      if (err instanceof Error) {
        span.recordException(sanitizedErrorMessage(err));
      }
      span.setStatus({
        code: srcExports$1.SpanStatusCode.ERROR,
        message: err.message
      });
    }
    span.end();
    cb.call(this, err, res, done);
  };
}
function patchClientConnectCallback(span, cb) {
  return function patchedClientConnectCallback(err) {
    if (err) {
      if (err instanceof Error) {
        span.recordException(sanitizedErrorMessage(err));
      }
      span.setStatus({
        code: srcExports$1.SpanStatusCode.ERROR,
        message: err.message
      });
    }
    span.end();
    cb.apply(this, arguments);
  };
}
function getErrorMessage(e) {
  return typeof e === "object" && e !== null && "message" in e ? String(e.message) : void 0;
}
function isObjectWithTextString(it) {
  return typeof it === "object" && typeof it?.text === "string";
}
function sanitizedErrorMessage(error) {
  const name = error?.name ?? "PostgreSQLError";
  const code = error?.code ?? "UNKNOWN";
  return `PostgreSQL error of type '${name}' occurred (code: ${code})`;
}
const PACKAGE_NAME$7 = "@sentry/instrumentation-pg";
function extractModuleExports(module) {
  return module[Symbol.toStringTag] === "Module" ? module.default : module;
}
class PgInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$7, SDK_VERSION, config2);
    this._connectionsCounter = {
      used: 0,
      idle: 0,
      pending: 0
    };
    this._semconvStability = semconvStabilityFromStr("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
  }
  _updateMetricInstruments() {
    this._operationDuration = this.meter.createHistogram(srcExports.METRIC_DB_CLIENT_OPERATION_DURATION, {
      description: "Duration of database client operations.",
      unit: "s",
      valueType: srcExports$1.ValueType.DOUBLE,
      advice: {
        explicitBucketBoundaries: [1e-3, 5e-3, 0.01, 0.05, 0.1, 0.5, 1, 5, 10]
      }
    });
    this._connectionsCounter = {
      idle: 0,
      pending: 0,
      used: 0
    };
    this._connectionsCount = this.meter.createUpDownCounter(METRIC_DB_CLIENT_CONNECTION_COUNT, {
      description: "The number of connections that are currently in state described by the state attribute.",
      unit: "{connection}"
    });
    this._connectionPendingRequests = this.meter.createUpDownCounter(METRIC_DB_CLIENT_CONNECTION_PENDING_REQUESTS, {
      description: "The number of current pending requests for an open connection.",
      unit: "{connection}"
    });
  }
  init() {
    const SUPPORTED_PG_VERSIONS = [">=8.0.3 <9"];
    const SUPPORTED_PG_POOL_VERSIONS = [">=2.0.0 <4"];
    const modulePgNativeClient = new InstrumentationNodeModuleFile(
      "pg/lib/native/client.js",
      SUPPORTED_PG_VERSIONS,
      this._patchPgClient.bind(this),
      this._unpatchPgClient.bind(this)
    );
    const modulePgClient = new InstrumentationNodeModuleFile(
      "pg/lib/client.js",
      SUPPORTED_PG_VERSIONS,
      this._patchPgClient.bind(this),
      this._unpatchPgClient.bind(this)
    );
    const modulePG = new InstrumentationNodeModuleDefinition(
      "pg",
      SUPPORTED_PG_VERSIONS,
      (module) => {
        const moduleExports = extractModuleExports(module);
        this._patchPgClient(moduleExports.Client);
        return module;
      },
      (module) => {
        const moduleExports = extractModuleExports(module);
        this._unpatchPgClient(moduleExports.Client);
        return module;
      },
      [modulePgClient, modulePgNativeClient]
    );
    const modulePGPool = new InstrumentationNodeModuleDefinition(
      "pg-pool",
      SUPPORTED_PG_POOL_VERSIONS,
      (module) => {
        const moduleExports = extractModuleExports(module);
        if (isWrapped(moduleExports.prototype.connect)) {
          this._unwrap(moduleExports.prototype, "connect");
        }
        this._wrap(moduleExports.prototype, "connect", this._getPoolConnectPatch());
        return moduleExports;
      },
      (module) => {
        const moduleExports = extractModuleExports(module);
        if (isWrapped(moduleExports.prototype.connect)) {
          this._unwrap(moduleExports.prototype, "connect");
        }
      }
    );
    return [modulePG, modulePGPool];
  }
  _patchPgClient(module) {
    if (!module) {
      return;
    }
    const moduleExports = extractModuleExports(module);
    if (isWrapped(moduleExports.prototype.query)) {
      this._unwrap(moduleExports.prototype, "query");
    }
    if (isWrapped(moduleExports.prototype.connect)) {
      this._unwrap(moduleExports.prototype, "connect");
    }
    this._wrap(moduleExports.prototype, "query", this._getClientQueryPatch());
    this._wrap(moduleExports.prototype, "connect", this._getClientConnectPatch());
    return module;
  }
  _unpatchPgClient(module) {
    const moduleExports = extractModuleExports(module);
    if (isWrapped(moduleExports.prototype.query)) {
      this._unwrap(moduleExports.prototype, "query");
    }
    if (isWrapped(moduleExports.prototype.connect)) {
      this._unwrap(moduleExports.prototype, "connect");
    }
    return module;
  }
  _getClientConnectPatch() {
    const plugin = this;
    return (original) => {
      return function connect(callback) {
        const config2 = plugin.getConfig();
        if (shouldSkipInstrumentation(config2) || config2.ignoreConnectSpans) {
          return original.call(this, callback);
        }
        const span = plugin.tracer.startSpan(SpanNames.CONNECT, {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes: getSemanticAttributesFromConnection(this, plugin._semconvStability)
        });
        if (callback) {
          const parentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
          callback = patchClientConnectCallback(span, callback);
          if (parentSpan) {
            callback = srcExports$1.context.bind(srcExports$1.context.active(), callback);
          }
        }
        const connectResult = srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
          return original.call(this, callback);
        });
        return handleConnectResult(span, connectResult);
      };
    };
  }
  recordOperationDuration(attributes, startTime) {
    const metricsAttributes = {};
    const keysToCopy = [
      srcExports.ATTR_DB_NAMESPACE,
      srcExports.ATTR_ERROR_TYPE,
      srcExports.ATTR_SERVER_PORT,
      srcExports.ATTR_SERVER_ADDRESS,
      srcExports.ATTR_DB_OPERATION_NAME
    ];
    if (this._semconvStability & SemconvStability.OLD) {
      keysToCopy.push(ATTR_DB_SYSTEM$1);
    }
    if (this._semconvStability & SemconvStability.STABLE) {
      keysToCopy.push(srcExports.ATTR_DB_SYSTEM_NAME);
    }
    keysToCopy.forEach((key) => {
      if (key in attributes) {
        metricsAttributes[key] = attributes[key];
      }
    });
    const durationSeconds = timestampInSeconds() - startTime;
    this._operationDuration.record(durationSeconds, metricsAttributes);
  }
  _getClientQueryPatch() {
    const plugin = this;
    return (original) => {
      this._diag.debug("Patching pg.Client.prototype.query");
      return function query(...args) {
        if (shouldSkipInstrumentation(plugin.getConfig())) {
          return original.apply(this, args);
        }
        const startTime = timestampInSeconds();
        const arg0 = args[0];
        const firstArgIsString = typeof arg0 === "string";
        const firstArgIsQueryObjectWithText = isObjectWithTextString(arg0);
        const queryConfig = firstArgIsString ? {
          text: arg0,
          values: Array.isArray(args[1]) ? args[1] : void 0
        } : firstArgIsQueryObjectWithText ? {
          ...arg0,
          name: arg0.name,
          text: arg0.text,
          values: arg0.values ?? (Array.isArray(args[1]) ? args[1] : void 0)
        } : void 0;
        const attributes = {
          [ATTR_DB_SYSTEM$1]: DB_SYSTEM_VALUE_POSTGRESQL,
          [srcExports.ATTR_DB_NAMESPACE]: this.database,
          [srcExports.ATTR_SERVER_PORT]: this.connectionParameters.port,
          [srcExports.ATTR_SERVER_ADDRESS]: this.connectionParameters.host
        };
        if (queryConfig?.text) {
          attributes[srcExports.ATTR_DB_OPERATION_NAME] = parseNormalizedOperationName(queryConfig?.text);
        }
        const recordDuration = () => {
          plugin.recordOperationDuration(attributes, startTime);
        };
        const instrumentationConfig = plugin.getConfig();
        const span = handleConfigQuery.call(
          this,
          plugin.tracer,
          instrumentationConfig,
          plugin._semconvStability,
          queryConfig
        );
        if (instrumentationConfig.addSqlCommenterCommentToQueries) {
          if (firstArgIsString) {
            args[0] = addSqlCommenterComment(span, arg0);
          } else if (firstArgIsQueryObjectWithText && !("name" in arg0)) {
            args[0] = {
              ...arg0,
              text: addSqlCommenterComment(span, arg0.text)
            };
          }
        }
        if (args.length > 0) {
          const parentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
          if (typeof args[args.length - 1] === "function") {
            args[args.length - 1] = patchCallback(
              instrumentationConfig,
              span,
              args[args.length - 1],
              // nb: not type safe.
              attributes,
              recordDuration
            );
            if (parentSpan) {
              args[args.length - 1] = srcExports$1.context.bind(srcExports$1.context.active(), args[args.length - 1]);
            }
          } else if (typeof queryConfig?.callback === "function") {
            let callback = patchCallback(
              plugin.getConfig(),
              span,
              queryConfig.callback,
              // nb: not type safe.
              attributes,
              recordDuration
            );
            if (parentSpan) {
              callback = srcExports$1.context.bind(srcExports$1.context.active(), callback);
            }
            args[0].callback = callback;
          }
        }
        const { requestHook } = instrumentationConfig;
        if (typeof requestHook === "function" && queryConfig) {
          safeExecuteInTheMiddle(
            () => {
              const { database, host, port, user } = this.connectionParameters;
              const connection = { database, host, port, user };
              requestHook(span, {
                connection,
                query: {
                  text: queryConfig.text,
                  // nb: if `client.query` is called with illegal arguments
                  // (e.g., if `queryConfig.values` is passed explicitly, but a
                  // non-array is given), then the type casts will be wrong. But
                  // we leave it up to the queryHook to handle that, and we
                  // catch and swallow any errors it throws. The other options
                  // are all worse. E.g., we could leave `queryConfig.values`
                  // and `queryConfig.name` as `unknown`, but then the hook body
                  // would be forced to validate (or cast) them before using
                  // them, which seems incredibly cumbersome given that these
                  // casts will be correct 99.9% of the time -- and pg.query
                  // will immediately throw during development in the other .1%
                  // of cases. Alternatively, we could simply skip calling the
                  // hook when `values` or `name` don't have the expected type,
                  // but that would add unnecessary validation overhead to every
                  // hook invocation and possibly be even more confusing/unexpected.
                  values: queryConfig.values,
                  name: queryConfig.name
                }
              });
            },
            (err) => {
              if (err) {
                plugin._diag.error("Error running query hook", err);
              }
            },
            true
          );
        }
        let result;
        try {
          result = original.apply(this, args);
        } catch (e) {
          if (e instanceof Error) {
            span.recordException(sanitizedErrorMessage(e));
          }
          span.setStatus({
            code: srcExports$1.SpanStatusCode.ERROR,
            message: getErrorMessage(e)
          });
          span.end();
          throw e;
        }
        if (result instanceof Promise) {
          return result.then((result2) => {
            return new Promise((resolve) => {
              handleExecutionResult(plugin.getConfig(), span, result2);
              recordDuration();
              span.end();
              resolve(result2);
            });
          }).catch((error) => {
            return new Promise((_, reject) => {
              if (error instanceof Error) {
                span.recordException(sanitizedErrorMessage(error));
              }
              span.setStatus({
                code: srcExports$1.SpanStatusCode.ERROR,
                message: error.message
              });
              recordDuration();
              span.end();
              reject(error);
            });
          });
        }
        return result;
      };
    };
  }
  _setPoolConnectEventListeners(pgPool) {
    if (pgPool[EVENT_LISTENERS_SET]) return;
    const poolName = getPoolName(pgPool.options);
    pgPool.on("connect", () => {
      this._connectionsCounter = updateCounter(
        poolName,
        pgPool,
        this._connectionsCount,
        this._connectionPendingRequests,
        this._connectionsCounter
      );
    });
    pgPool.on("acquire", () => {
      this._connectionsCounter = updateCounter(
        poolName,
        pgPool,
        this._connectionsCount,
        this._connectionPendingRequests,
        this._connectionsCounter
      );
    });
    pgPool.on("remove", () => {
      this._connectionsCounter = updateCounter(
        poolName,
        pgPool,
        this._connectionsCount,
        this._connectionPendingRequests,
        this._connectionsCounter
      );
    });
    pgPool.on("release", () => {
      this._connectionsCounter = updateCounter(
        poolName,
        pgPool,
        this._connectionsCount,
        this._connectionPendingRequests,
        this._connectionsCounter
      );
    });
    pgPool[EVENT_LISTENERS_SET] = true;
  }
  _getPoolConnectPatch() {
    const plugin = this;
    return (originalConnect) => {
      return function connect(callback) {
        const config2 = plugin.getConfig();
        if (shouldSkipInstrumentation(config2)) {
          return originalConnect.call(this, callback);
        }
        plugin._setPoolConnectEventListeners(this);
        if (config2.ignoreConnectSpans) {
          return originalConnect.call(this, callback);
        }
        const span = plugin.tracer.startSpan(SpanNames.POOL_CONNECT, {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes: getSemanticAttributesFromPoolConnection(this.options, plugin._semconvStability)
        });
        if (callback) {
          const parentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active());
          callback = patchCallbackPGPool(span, callback);
          if (parentSpan) {
            callback = srcExports$1.context.bind(srcExports$1.context.active(), callback);
          }
        }
        const connectResult = srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
          return originalConnect.call(this, callback);
        });
        return handleConnectResult(span, connectResult);
      };
    };
  }
}
function handleConnectResult(span, connectResult) {
  if (!(connectResult instanceof Promise)) {
    return connectResult;
  }
  const connectResultPromise = connectResult;
  return srcExports$1.context.bind(
    srcExports$1.context.active(),
    connectResultPromise.then((result) => {
      span.end();
      return result;
    }).catch((error) => {
      if (error instanceof Error) {
        span.recordException(sanitizedErrorMessage(error));
      }
      span.setStatus({
        code: srcExports$1.SpanStatusCode.ERROR,
        message: getErrorMessage(error)
      });
      span.end();
      return Promise.reject(error);
    })
  );
}
const INTEGRATION_NAME$b = "Postgres";
const instrumentPostgres = generateInstrumentOnce(
  INTEGRATION_NAME$b,
  PgInstrumentation,
  (options) => ({
    requireParentSpan: true,
    requestHook(span) {
      addOriginToSpan(span, "auto.db.otel.postgres");
    },
    ignoreConnectSpans: options?.ignoreConnectSpans ?? false
  })
);
const _postgresIntegration = ((options) => {
  return {
    name: INTEGRATION_NAME$b,
    setupOnce() {
      instrumentPostgres(options);
    }
  };
});
const postgresIntegration = defineIntegration(_postgresIntegration);
const INTEGRATION_NAME$a = "PostgresJs";
const SUPPORTED_VERSIONS$1 = [">=3.0.0 <4"];
const SQL_OPERATION_REGEX = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i;
const QUERY_FROM_INSTRUMENTED_SQL = /* @__PURE__ */ Symbol.for("sentry.query.from.instrumented.sql");
const instrumentPostgresJs = generateInstrumentOnce(
  INTEGRATION_NAME$a,
  (options) => new PostgresJsInstrumentation({
    requireParentSpan: options?.requireParentSpan ?? true,
    requestHook: options?.requestHook
  })
);
class PostgresJsInstrumentation extends InstrumentationBase {
  constructor(config2) {
    super("sentry-postgres-js", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by patching the postgres module.
   * Uses two complementary approaches:
   * 1. Main function wrapper: instruments sql instances created AFTER instrumentation is set up (CJS + ESM)
   * 2. Query.prototype patch: fallback for sql instances created BEFORE instrumentation (CJS only)
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "postgres",
      SUPPORTED_VERSIONS$1,
      (exports) => {
        try {
          return this._patchPostgres(exports);
        } catch (e) {
          DEBUG_BUILD && debug.error("Failed to patch postgres module:", e);
          return exports;
        }
      },
      (exports) => exports
    );
    ["src", "cf/src", "cjs/src"].forEach((path) => {
      module.files.push(
        new InstrumentationNodeModuleFile(
          `postgres/${path}/query.js`,
          SUPPORTED_VERSIONS$1,
          this._patchQueryPrototype.bind(this),
          this._unpatchQueryPrototype.bind(this)
        )
      );
    });
    return module;
  }
  /**
   * Patches the postgres module by wrapping the main export function.
   * This intercepts the creation of sql instances and instruments them.
   */
  _patchPostgres(exports) {
    const isFunction = typeof exports === "function";
    const Original = isFunction ? exports : exports.default;
    if (typeof Original !== "function") {
      DEBUG_BUILD && debug.warn("postgres module does not export a function. Skipping instrumentation.");
      return exports;
    }
    const self = this;
    const WrappedPostgres = function(...args) {
      const sql = Reflect.construct(Original, args);
      if (!sql || typeof sql !== "function") {
        DEBUG_BUILD && debug.warn("postgres() did not return a valid instance");
        return sql;
      }
      const config2 = self.getConfig();
      return instrumentPostgresJsSql(sql, {
        requireParentSpan: config2.requireParentSpan,
        requestHook: config2.requestHook
      });
    };
    Object.setPrototypeOf(WrappedPostgres, Original);
    Object.setPrototypeOf(WrappedPostgres.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedPostgres, key, descriptor);
        }
      }
    }
    if (isFunction) {
      return WrappedPostgres;
    } else {
      replaceExports(exports, "default", WrappedPostgres);
      return exports;
    }
  }
  /**
   * Determines whether a span should be created based on the current context.
   * If `requireParentSpan` is set to true in the configuration, a span will
   * only be created if there is a parent span available.
   */
  _shouldCreateSpans() {
    const config2 = this.getConfig();
    const hasParentSpan = srcExports$1.trace.getSpan(srcExports$1.context.active()) !== void 0;
    return hasParentSpan || !config2.requireParentSpan;
  }
  /**
   * Extracts DB operation name from SQL query and sets it on the span.
   */
  _setOperationName(span, sanitizedQuery, command) {
    if (command) {
      span.setAttribute(srcExports.ATTR_DB_OPERATION_NAME, command);
      return;
    }
    const operationMatch = sanitizedQuery?.match(SQL_OPERATION_REGEX);
    if (operationMatch?.[1]) {
      span.setAttribute(srcExports.ATTR_DB_OPERATION_NAME, operationMatch[1].toUpperCase());
    }
  }
  /**
   * Reconstructs the full SQL query from template strings with PostgreSQL placeholders.
   *
   * For sql`SELECT * FROM users WHERE id = ${123} AND name = ${'foo'}`:
   *   strings = ["SELECT * FROM users WHERE id = ", " AND name = ", ""]
   *   returns: "SELECT * FROM users WHERE id = $1 AND name = $2"
   */
  _reconstructQuery(strings) {
    if (!strings?.length) {
      return void 0;
    }
    if (strings.length === 1) {
      return strings[0] || void 0;
    }
    return strings.reduce((acc, str, i) => i === 0 ? str : `${acc}$${i}${str}`, "");
  }
  /**
   * Sanitize SQL query as per the OTEL semantic conventions
   * https://opentelemetry.io/docs/specs/semconv/database/database-spans/#sanitization-of-dbquerytext
   *
   * PostgreSQL $n placeholders are preserved per OTEL spec - they're parameterized queries,
   * not sensitive literals. Only actual values (strings, numbers, booleans) are sanitized.
   */
  _sanitizeSqlQuery(sqlQuery) {
    if (!sqlQuery) {
      return "Unknown SQL Query";
    }
    return sqlQuery.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;\s*$/, "").replace(/\s+/g, " ").trim().replace(/\bX'[0-9A-Fa-f]*'/gi, "?").replace(/\bB'[01]*'/gi, "?").replace(/'(?:[^']|'')*'/g, "?").replace(/\b0x[0-9A-Fa-f]+/gi, "?").replace(/\b(?:TRUE|FALSE)\b/gi, "?").replace(/-?\b\d+\.?\d*[eE][+-]?\d+\b/g, "?").replace(/-?\b\d+\.\d+\b/g, "?").replace(/-?\.\d+\b/g, "?").replace(new RegExp("(?<!\\$)-?\\b\\d+\\b", "g"), "?").replace(/\bIN\b\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, "IN (?)").replace(/\bIN\b\s*\(\s*\$\d+(?:\s*,\s*\$\d+)*\s*\)/gi, "IN ($?)");
  }
  /**
   * Fallback patch for Query.prototype.handle to instrument queries from pre-existing sql instances.
   * This catches queries from sql instances created BEFORE Sentry was initialized (CJS only).
   *
   * Note: Queries from pre-existing instances won't have connection context (database, host, port)
   * because the sql instance wasn't created through our instrumented wrapper.
   */
  _patchQueryPrototype(moduleExports) {
    const self = this;
    const originalHandle = moduleExports.Query.prototype.handle;
    moduleExports.Query.prototype.handle = async function(...args) {
      if (this.executed || this[QUERY_FROM_INSTRUMENTED_SQL]) {
        return originalHandle.apply(this, args);
      }
      if (!self._shouldCreateSpans()) {
        return originalHandle.apply(this, args);
      }
      const fullQuery = self._reconstructQuery(this.strings);
      const sanitizedSqlQuery = self._sanitizeSqlQuery(fullQuery);
      return startSpanManual(
        {
          name: sanitizedSqlQuery || "postgresjs.query",
          op: "db"
        },
        (span) => {
          addOriginToSpan(span, "auto.db.postgresjs");
          span.setAttributes({
            [srcExports.ATTR_DB_SYSTEM_NAME]: "postgres",
            [srcExports.ATTR_DB_QUERY_TEXT]: sanitizedSqlQuery
          });
          const config2 = self.getConfig();
          const { requestHook } = config2;
          if (requestHook) {
            safeExecuteInTheMiddle(
              () => requestHook(span, sanitizedSqlQuery, void 0),
              (e) => {
                if (e) {
                  span.setAttribute("sentry.hook.error", "requestHook failed");
                  DEBUG_BUILD && debug.error(`Error in requestHook for ${INTEGRATION_NAME$a} integration:`, e);
                }
              },
              true
            );
          }
          const originalResolve = this.resolve;
          this.resolve = new Proxy(originalResolve, {
            apply: (resolveTarget, resolveThisArg, resolveArgs) => {
              try {
                self._setOperationName(span, sanitizedSqlQuery, resolveArgs?.[0]?.command);
                span.end();
              } catch (e) {
                DEBUG_BUILD && debug.error("Error ending span in resolve callback:", e);
              }
              return Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
            }
          });
          const originalReject = this.reject;
          this.reject = new Proxy(originalReject, {
            apply: (rejectTarget, rejectThisArg, rejectArgs) => {
              try {
                span.setStatus({
                  code: SPAN_STATUS_ERROR,
                  message: rejectArgs?.[0]?.message || "unknown_error"
                });
                span.setAttribute(srcExports.ATTR_DB_RESPONSE_STATUS_CODE, rejectArgs?.[0]?.code || "unknown");
                span.setAttribute(srcExports.ATTR_ERROR_TYPE, rejectArgs?.[0]?.name || "unknown");
                self._setOperationName(span, sanitizedSqlQuery);
                span.end();
              } catch (e) {
                DEBUG_BUILD && debug.error("Error ending span in reject callback:", e);
              }
              return Reflect.apply(rejectTarget, rejectThisArg, rejectArgs);
            }
          });
          try {
            return originalHandle.apply(this, args);
          } catch (e) {
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message: e instanceof Error ? e.message : "unknown_error"
            });
            span.end();
            throw e;
          }
        }
      );
    };
    moduleExports.Query.prototype.handle.__sentry_original__ = originalHandle;
    return moduleExports;
  }
  /**
   * Restores the original Query.prototype.handle method.
   */
  _unpatchQueryPrototype(moduleExports) {
    if (moduleExports.Query.prototype.handle.__sentry_original__) {
      moduleExports.Query.prototype.handle = moduleExports.Query.prototype.handle.__sentry_original__;
    }
    return moduleExports;
  }
}
const _postgresJsIntegration = ((options) => {
  return {
    name: INTEGRATION_NAME$a,
    setupOnce() {
      instrumentPostgresJs(options);
    }
  };
});
const postgresJsIntegration = defineIntegration(_postgresJsIntegration);
const majorVersion = "7";
const GLOBAL_INSTRUMENTATION_KEY = "PRISMA_INSTRUMENTATION";
const GLOBAL_VERSIONED_INSTRUMENTATION_KEY = `V${majorVersion}_PRISMA_INSTRUMENTATION`;
const globalThisWithPrismaInstrumentation = globalThis;
function getGlobalTracingHelper() {
  const versionedGlobal = globalThisWithPrismaInstrumentation[GLOBAL_VERSIONED_INSTRUMENTATION_KEY];
  if (versionedGlobal?.helper) {
    return versionedGlobal.helper;
  }
  const fallbackGlobal = globalThisWithPrismaInstrumentation[GLOBAL_INSTRUMENTATION_KEY];
  return fallbackGlobal?.helper;
}
function setGlobalTracingHelper(helper) {
  const globalValue = { helper };
  globalThisWithPrismaInstrumentation[GLOBAL_VERSIONED_INSTRUMENTATION_KEY] = globalValue;
  globalThisWithPrismaInstrumentation[GLOBAL_INSTRUMENTATION_KEY] = globalValue;
}
function clearGlobalTracingHelper() {
  delete globalThisWithPrismaInstrumentation[GLOBAL_VERSIONED_INSTRUMENTATION_KEY];
  delete globalThisWithPrismaInstrumentation[GLOBAL_INSTRUMENTATION_KEY];
}
const showAllTraces = process.env.PRISMA_SHOW_ALL_TRACES === "true";
const nonSampledTraceParent = `00-10-10-00`;
function engineSpanKindToOtelSpanKind(engineSpanKind) {
  switch (engineSpanKind) {
    case "client":
      return srcExports$1.SpanKind.CLIENT;
    case "internal":
    default:
      return srcExports$1.SpanKind.INTERNAL;
  }
}
class ActiveTracingHelper {
  constructor({ tracerProvider, ignoreSpanTypes }) {
    this.tracerProvider = tracerProvider;
    this.ignoreSpanTypes = ignoreSpanTypes;
  }
  isEnabled() {
    return true;
  }
  getTraceParent(context$1) {
    const span = srcExports$1.trace.getSpanContext(context$1 ?? srcExports$1.context.active());
    if (span) {
      return `00-${span.traceId}-${span.spanId}-0${span.traceFlags}`;
    }
    return nonSampledTraceParent;
  }
  dispatchEngineSpans(spans) {
    const tracer = this.tracerProvider.getTracer("prisma");
    const linkIds = /* @__PURE__ */ new Map();
    const roots = spans.filter((span) => span.parentId === null);
    for (const root of roots) {
      dispatchEngineSpan(tracer, root, spans, linkIds, this.ignoreSpanTypes);
    }
  }
  getActiveContext() {
    return srcExports$1.context.active();
  }
  runInChildSpan(options, callback) {
    if (typeof options === "string") {
      options = { name: options };
    }
    if (options.internal && !showAllTraces) {
      return callback();
    }
    const tracer = this.tracerProvider.getTracer("prisma");
    const context = options.context ?? this.getActiveContext();
    const name = `prisma:client:${options.name}`;
    if (shouldIgnoreSpan(name, this.ignoreSpanTypes)) {
      return callback();
    }
    if (options.active === false) {
      const span = tracer.startSpan(name, options, context);
      return endSpan(span, callback(span, context));
    }
    return tracer.startActiveSpan(name, options, (span) => endSpan(span, callback(span, context)));
  }
}
function dispatchEngineSpan(tracer, engineSpan, allSpans, linkIds, ignoreSpanTypes) {
  if (shouldIgnoreSpan(engineSpan.name, ignoreSpanTypes)) return;
  const spanOptions = {
    attributes: engineSpan.attributes,
    kind: engineSpanKindToOtelSpanKind(engineSpan.kind),
    startTime: engineSpan.startTime
  };
  tracer.startActiveSpan(engineSpan.name, spanOptions, (span) => {
    linkIds.set(engineSpan.id, span.spanContext().spanId);
    if (engineSpan.links) {
      span.addLinks(
        engineSpan.links.flatMap((link) => {
          const linkedId = linkIds.get(link);
          if (!linkedId) {
            return [];
          }
          return {
            context: {
              spanId: linkedId,
              traceId: span.spanContext().traceId,
              traceFlags: span.spanContext().traceFlags
            }
          };
        })
      );
    }
    const children = allSpans.filter((s) => s.parentId === engineSpan.id);
    for (const child of children) {
      dispatchEngineSpan(tracer, child, allSpans, linkIds, ignoreSpanTypes);
    }
    span.end(engineSpan.endTime);
  });
}
function endSpan(span, result) {
  if (isPromiseLike(result)) {
    return result.then(
      (value) => {
        span.end();
        return value;
      },
      (reason) => {
        span.end();
        throw reason;
      }
    );
  }
  span.end();
  return result;
}
function isPromiseLike(value) {
  return value != null && typeof value["then"] === "function";
}
function shouldIgnoreSpan(spanName, ignoreSpanTypes) {
  return ignoreSpanTypes.some((pattern) => typeof pattern === "string" ? pattern === spanName : pattern.test(spanName));
}
const VERSION = SDK_VERSION;
const NAME = "@sentry/instrumentation-prisma";
const MODULE_NAME$1 = "@prisma/client";
const SUPPORTED_MODULE_VERSIONS = [">=5.0.0"];
class PrismaInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(NAME, VERSION, config2);
  }
  setTracerProvider(tracerProvider) {
    this.tracerProvider = tracerProvider;
  }
  init() {
    const module = new InstrumentationNodeModuleDefinition(MODULE_NAME$1, SUPPORTED_MODULE_VERSIONS);
    return [module];
  }
  enable() {
    const config2 = this._config;
    setGlobalTracingHelper(
      new ActiveTracingHelper({
        tracerProvider: this.tracerProvider ?? srcExports$1.trace.getTracerProvider(),
        ignoreSpanTypes: config2.ignoreSpanTypes ?? []
      })
    );
  }
  disable() {
    clearGlobalTracingHelper();
  }
  isEnabled() {
    return getGlobalTracingHelper() !== void 0;
  }
}
const INTEGRATION_NAME$9 = "Prisma";
function isPrismaV6TracingHelper(helper) {
  return !!helper && typeof helper === "object" && "dispatchEngineSpans" in helper;
}
function getPrismaTracingHelper() {
  const prismaInstrumentationObject = globalThis.PRISMA_INSTRUMENTATION;
  const prismaTracingHelper = prismaInstrumentationObject && typeof prismaInstrumentationObject === "object" && "helper" in prismaInstrumentationObject ? prismaInstrumentationObject.helper : void 0;
  return prismaTracingHelper;
}
class SentryPrismaInteropInstrumentation extends PrismaInstrumentation {
  constructor(options) {
    super(options?.instrumentationConfig);
  }
  enable() {
    super.enable();
    const prismaTracingHelper = getPrismaTracingHelper();
    if (isPrismaV6TracingHelper(prismaTracingHelper)) {
      prismaTracingHelper.createEngineSpan = (engineSpanEvent) => {
        const tracer = srcExports$1.trace.getTracer("prismaV5Compatibility");
        const initialIdGenerator = tracer._idGenerator;
        if (!initialIdGenerator) {
          consoleSandbox(() => {
            console.warn(
              "[Sentry] Could not find _idGenerator on tracer, skipping Prisma v5 compatibility - some Prisma spans may be missing!"
            );
          });
          return;
        }
        try {
          engineSpanEvent.spans.forEach((engineSpan) => {
            const kind = engineSpanKindToOTELSpanKind(engineSpan.kind);
            const parentSpanId = engineSpan.parent_span_id;
            const spanId = engineSpan.span_id;
            const traceId = engineSpan.trace_id;
            const links = engineSpan.links?.map((link) => {
              return {
                context: {
                  traceId: link.trace_id,
                  spanId: link.span_id,
                  traceFlags: srcExports$1.TraceFlags.SAMPLED
                }
              };
            });
            const ctx = srcExports$1.trace.setSpanContext(srcExports$1.context.active(), {
              traceId,
              spanId: parentSpanId,
              traceFlags: srcExports$1.TraceFlags.SAMPLED
            });
            srcExports$1.context.with(ctx, () => {
              const temporaryIdGenerator = {
                generateTraceId: () => {
                  return traceId;
                },
                generateSpanId: () => {
                  return spanId;
                }
              };
              tracer._idGenerator = temporaryIdGenerator;
              const span = tracer.startSpan(engineSpan.name, {
                kind,
                links,
                startTime: engineSpan.start_time,
                attributes: engineSpan.attributes
              });
              span.end(engineSpan.end_time);
              tracer._idGenerator = initialIdGenerator;
            });
          });
        } finally {
          tracer._idGenerator = initialIdGenerator;
        }
      };
    }
  }
}
function engineSpanKindToOTELSpanKind(engineSpanKind) {
  switch (engineSpanKind) {
    case "client":
      return srcExports$1.SpanKind.CLIENT;
    case "internal":
    default:
      return srcExports$1.SpanKind.INTERNAL;
  }
}
const instrumentPrisma = generateInstrumentOnce(INTEGRATION_NAME$9, (options) => {
  return new SentryPrismaInteropInstrumentation(options);
});
const prismaIntegration = defineIntegration((options) => {
  return {
    name: INTEGRATION_NAME$9,
    setupOnce() {
      instrumentPrisma(options);
    },
    setup(client) {
      if (!getPrismaTracingHelper()) {
        return;
      }
      client.on("spanStart", (span) => {
        const spanJSON = spanToJSON(span);
        if (spanJSON.description?.startsWith("prisma:")) {
          span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.prisma");
        }
        if ((spanJSON.description === "prisma:engine:db_query" || spanJSON.description === "prisma:client:db_query") && spanJSON.data["db.query.text"]) {
          span.updateName(spanJSON.data["db.query.text"]);
        }
        if (spanJSON.description === "prisma:engine:db_query" && !spanJSON.data["db.system"]) {
          span.setAttribute("db.system", "prisma");
        }
      });
    }
  };
});
const HapiComponentName = "@hapi/hapi";
const handlerPatched = /* @__PURE__ */ Symbol("hapi-handler-patched");
const HapiLayerType = {
  ROUTER: "router",
  PLUGIN: "plugin",
  EXT: "server.ext"
};
const HapiLifecycleMethodNames = /* @__PURE__ */ new Set([
  "onPreAuth",
  "onCredentials",
  "onPostAuth",
  "onPreHandler",
  "onPostHandler",
  "onPreResponse",
  "onRequest"
]);
const ATTR_HTTP_METHOD = "http.method";
var AttributeNames$3 = /* @__PURE__ */ ((AttributeNames2) => {
  AttributeNames2["HAPI_TYPE"] = "hapi.type";
  AttributeNames2["PLUGIN_NAME"] = "hapi.plugin.name";
  AttributeNames2["EXT_TYPE"] = "server.ext.type";
  return AttributeNames2;
})(AttributeNames$3 || {});
function getPluginName(plugin) {
  if (plugin.name) {
    return plugin.name;
  } else {
    return plugin.pkg.name;
  }
}
const isLifecycleExtType = (variableToCheck) => {
  return typeof variableToCheck === "string" && HapiLifecycleMethodNames.has(variableToCheck);
};
const isLifecycleExtEventObj = (variableToCheck) => {
  const event = variableToCheck?.type;
  return event !== void 0 && isLifecycleExtType(event);
};
const isDirectExtInput = (variableToCheck) => {
  return Array.isArray(variableToCheck) && variableToCheck.length <= 3 && isLifecycleExtType(variableToCheck[0]) && typeof variableToCheck[1] === "function";
};
const isPatchableExtMethod = (variableToCheck) => {
  return !Array.isArray(variableToCheck);
};
const getRouteMetadata = (route, semconvStability, pluginName) => {
  const attributes = {
    [srcExports.ATTR_HTTP_ROUTE]: route.path
  };
  if (semconvStability & SemconvStability.OLD) {
    attributes[ATTR_HTTP_METHOD] = route.method;
  }
  if (semconvStability & SemconvStability.STABLE) {
    attributes[srcExports.ATTR_HTTP_REQUEST_METHOD] = route.method;
  }
  let name;
  if (pluginName) {
    attributes[AttributeNames$3.HAPI_TYPE] = HapiLayerType.PLUGIN;
    attributes[AttributeNames$3.PLUGIN_NAME] = pluginName;
    name = `${pluginName}: route - ${route.path}`;
  } else {
    attributes[AttributeNames$3.HAPI_TYPE] = HapiLayerType.ROUTER;
    name = `route - ${route.path}`;
  }
  return { attributes, name };
};
const getExtMetadata = (extPoint, pluginName, methodName) => {
  let baseName = `ext - ${extPoint}`;
  if (methodName && methodName !== "method") {
    baseName = `ext - ${extPoint} - ${methodName}`;
  }
  if (pluginName) {
    return {
      attributes: {
        [AttributeNames$3.EXT_TYPE]: extPoint,
        [AttributeNames$3.HAPI_TYPE]: HapiLayerType.EXT,
        [AttributeNames$3.PLUGIN_NAME]: pluginName
      },
      name: `${pluginName}: ${baseName}`
    };
  }
  return {
    attributes: {
      [AttributeNames$3.EXT_TYPE]: extPoint,
      [AttributeNames$3.HAPI_TYPE]: HapiLayerType.EXT
    },
    name: baseName
  };
};
const getPluginFromInput = (pluginObj) => {
  if ("plugin" in pluginObj) {
    if ("plugin" in pluginObj.plugin) {
      return pluginObj.plugin.plugin;
    }
    return pluginObj.plugin;
  }
  return pluginObj;
};
const PACKAGE_NAME$6 = "@sentry/instrumentation-hapi";
class HapiInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$6, SDK_VERSION, config2);
    this._semconvStability = semconvStabilityFromStr("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
  }
  init() {
    return new InstrumentationNodeModuleDefinition(
      HapiComponentName,
      [">=17.0.0 <22"],
      (module) => {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        if (!isWrapped(moduleExports.server)) {
          this._wrap(moduleExports, "server", this._getServerPatch.bind(this));
        }
        if (!isWrapped(moduleExports.Server)) {
          this._wrap(moduleExports, "Server", this._getServerPatch.bind(this));
        }
        return moduleExports;
      },
      (module) => {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        this._massUnwrap([moduleExports], ["server", "Server"]);
      }
    );
  }
  /**
   * Patches the Hapi.server and Hapi.Server functions in order to instrument
   * the server.route, server.ext, and server.register functions via calls to the
   * @function _getServerRoutePatch, @function _getServerExtPatch, and
   * @function _getServerRegisterPatch functions
   * @param original - the original Hapi Server creation function
   */
  _getServerPatch(original) {
    const instrumentation = this;
    const self = this;
    return function server(opts) {
      const newServer = original.apply(this, [opts]);
      self._wrap(newServer, "route", (originalRouter) => {
        return instrumentation._getServerRoutePatch.bind(instrumentation)(originalRouter);
      });
      self._wrap(newServer, "ext", (originalExtHandler) => {
        return instrumentation._getServerExtPatch.bind(instrumentation)(originalExtHandler);
      });
      self._wrap(newServer, "register", instrumentation._getServerRegisterPatch.bind(instrumentation));
      return newServer;
    };
  }
  /**
   * Patches the plugin register function used by the Hapi Server. This function
   * goes through each plugin that is being registered and adds instrumentation
   * via a call to the @function _wrapRegisterHandler function.
   * @param {RegisterFunction<T>} original - the original register function which
   * registers each plugin on the server
   */
  _getServerRegisterPatch(original) {
    const instrumentation = this;
    return function register(pluginInput, options) {
      if (Array.isArray(pluginInput)) {
        for (const pluginObj of pluginInput) {
          const plugin = getPluginFromInput(pluginObj);
          instrumentation._wrapRegisterHandler(plugin);
        }
      } else {
        const plugin = getPluginFromInput(pluginInput);
        instrumentation._wrapRegisterHandler(plugin);
      }
      return original.apply(this, [pluginInput, options]);
    };
  }
  /**
   * Patches the Server.ext function which adds extension methods to the specified
   * point along the request lifecycle. This function accepts the full range of
   * accepted input into the standard Hapi `server.ext` function. For each extension,
   * it adds instrumentation to the handler via a call to the @function _wrapExtMethods
   * function.
   * @param original - the original ext function which adds the extension method to the server
   * @param {string} [pluginName] - if present, represents the name of the plugin responsible
   * for adding this server extension. Else, signifies that the extension was added directly
   */
  _getServerExtPatch(original, pluginName) {
    const instrumentation = this;
    return function ext(...args) {
      if (Array.isArray(args[0])) {
        const eventsList = args[0];
        for (let i = 0; i < eventsList.length; i++) {
          const eventObj = eventsList[i];
          if (isLifecycleExtType(eventObj.type)) {
            const lifecycleEventObj = eventObj;
            const handler = instrumentation._wrapExtMethods(lifecycleEventObj.method, eventObj.type, pluginName);
            lifecycleEventObj.method = handler;
            eventsList[i] = lifecycleEventObj;
          }
        }
        return original.apply(this, args);
      } else if (isDirectExtInput(args)) {
        const extInput = args;
        const method = extInput[1];
        const handler = instrumentation._wrapExtMethods(method, extInput[0], pluginName);
        return original.apply(this, [extInput[0], handler, extInput[2]]);
      } else if (isLifecycleExtEventObj(args[0])) {
        const lifecycleEventObj = args[0];
        const handler = instrumentation._wrapExtMethods(lifecycleEventObj.method, lifecycleEventObj.type, pluginName);
        lifecycleEventObj.method = handler;
        return original.call(this, lifecycleEventObj);
      }
      return original.apply(this, args);
    };
  }
  /**
   * Patches the Server.route function. This function accepts either one or an array
   * of Hapi.ServerRoute objects and adds instrumentation on each route via a call to
   * the @function _wrapRouteHandler function.
   * @param {HapiServerRouteInputMethod} original - the original route function which adds
   * the route to the server
   * @param {string} [pluginName] - if present, represents the name of the plugin responsible
   * for adding this server route. Else, signifies that the route was added directly
   */
  _getServerRoutePatch(original, pluginName) {
    const instrumentation = this;
    return function route(route) {
      if (Array.isArray(route)) {
        for (let i = 0; i < route.length; i++) {
          const newRoute = instrumentation._wrapRouteHandler.call(instrumentation, route[i], pluginName);
          route[i] = newRoute;
        }
      } else {
        route = instrumentation._wrapRouteHandler.call(instrumentation, route, pluginName);
      }
      return original.apply(this, [route]);
    };
  }
  /**
   * Wraps newly registered plugins to add instrumentation to the plugin's clone of
   * the original server. Specifically, wraps the server.route and server.ext functions
   * via calls to @function _getServerRoutePatch and @function _getServerExtPatch
   * @param {Hapi.Plugin<T>} plugin - the new plugin which is being instrumented
   */
  _wrapRegisterHandler(plugin) {
    const instrumentation = this;
    const pluginName = getPluginName(plugin);
    const oldRegister = plugin.register;
    const self = this;
    const newRegisterHandler = function(server, options) {
      self._wrap(server, "route", (original) => {
        return instrumentation._getServerRoutePatch.bind(instrumentation)(original, pluginName);
      });
      self._wrap(server, "ext", (originalExtHandler) => {
        return instrumentation._getServerExtPatch.bind(instrumentation)(originalExtHandler, pluginName);
      });
      return oldRegister.call(this, server, options);
    };
    plugin.register = newRegisterHandler;
  }
  /**
   * Wraps request extension methods to add instrumentation to each new extension handler.
   * Patches each individual extension in order to create the
   * span and propagate context. It does not create spans when there is no parent span.
   * @param {PatchableExtMethod | PatchableExtMethod[]} method - the request extension
   * handler which is being instrumented
   * @param {Hapi.ServerRequestExtType} extPoint - the point in the Hapi request lifecycle
   * which this extension targets
   * @param {string} [pluginName] - if present, represents the name of the plugin responsible
   * for adding this server route. Else, signifies that the route was added directly
   */
  _wrapExtMethods(method, extPoint, pluginName) {
    const instrumentation = this;
    if (method instanceof Array) {
      for (let i = 0; i < method.length; i++) {
        method[i] = instrumentation._wrapExtMethods(method[i], extPoint);
      }
      return method;
    } else if (isPatchableExtMethod(method)) {
      if (method[handlerPatched] === true) return method;
      method[handlerPatched] = true;
      const newHandler = async function(...params) {
        if (srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0) {
          return await method.apply(this, params);
        }
        const metadata = getExtMetadata(extPoint, pluginName, method.name);
        const span = instrumentation.tracer.startSpan(metadata.name, {
          attributes: metadata.attributes
        });
        try {
          return await srcExports$1.context.with(
            srcExports$1.trace.setSpan(srcExports$1.context.active(), span),
            method,
            void 0,
            ...params
          );
        } catch (err) {
          span.recordException(err);
          span.setStatus({
            code: srcExports$1.SpanStatusCode.ERROR,
            message: err.message
          });
          throw err;
        } finally {
          span.end();
        }
      };
      return newHandler;
    }
    return method;
  }
  /**
   * Patches each individual route handler method in order to create the
   * span and propagate context. It does not create spans when there is no parent span.
   * @param {PatchableServerRoute} route - the route handler which is being instrumented
   * @param {string} [pluginName] - if present, represents the name of the plugin responsible
   * for adding this server route. Else, signifies that the route was added directly
   */
  _wrapRouteHandler(route, pluginName) {
    const instrumentation = this;
    if (route[handlerPatched] === true) return route;
    route[handlerPatched] = true;
    const wrapHandler = (oldHandler) => {
      return async function(...params) {
        if (srcExports$1.trace.getSpan(srcExports$1.context.active()) === void 0) {
          return await oldHandler.call(this, ...params);
        }
        setHttpServerSpanRouteAttribute(route.path);
        const metadata = getRouteMetadata(route, instrumentation._semconvStability, pluginName);
        const span = instrumentation.tracer.startSpan(metadata.name, {
          attributes: metadata.attributes
        });
        try {
          return await srcExports$1.context.with(
            srcExports$1.trace.setSpan(srcExports$1.context.active(), span),
            () => oldHandler.call(this, ...params)
          );
        } catch (err) {
          span.recordException(err);
          span.setStatus({
            code: srcExports$1.SpanStatusCode.ERROR,
            message: err.message
          });
          throw err;
        } finally {
          span.end();
        }
      };
    };
    if (typeof route.handler === "function") {
      route.handler = wrapHandler(route.handler);
    } else if (typeof route.options === "function") {
      const oldOptions = route.options;
      route.options = function(server) {
        const options = oldOptions(server);
        if (typeof options.handler === "function") {
          options.handler = wrapHandler(options.handler);
        }
        return options;
      };
    } else if (typeof route.options?.handler === "function") {
      route.options.handler = wrapHandler(route.options.handler);
    }
    return route;
  }
}
const INTEGRATION_NAME$8 = "Hapi";
const instrumentHapi = generateInstrumentOnce(INTEGRATION_NAME$8, () => new HapiInstrumentation());
const _hapiIntegration = (() => {
  return {
    name: INTEGRATION_NAME$8,
    setupOnce() {
      instrumentHapi();
    }
  };
});
const hapiIntegration = defineIntegration(_hapiIntegration);
const AttributeNames$2 = {
  HONO_TYPE: "hono.type",
  HONO_NAME: "hono.name"
};
const HonoTypes = {
  MIDDLEWARE: "middleware",
  REQUEST_HANDLER: "request_handler"
};
const PACKAGE_NAME$5 = "@sentry/instrumentation-hono";
const PACKAGE_VERSION = "0.0.1";
class HonoInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$5, PACKAGE_VERSION, config2);
  }
  /**
   * Initialize the instrumentation.
   */
  init() {
    return [
      new InstrumentationNodeModuleDefinition("hono", [">=4.0.0 <5"], (moduleExports) => this._patch(moduleExports))
    ];
  }
  /**
   * Patches the module exports to instrument Hono.
   */
  _patch(moduleExports) {
    const instrumentation = this;
    class WrappedHono extends moduleExports.Hono {
      constructor(...args) {
        super(...args);
        instrumentation._wrap(this, "get", instrumentation._patchHandler());
        instrumentation._wrap(this, "post", instrumentation._patchHandler());
        instrumentation._wrap(this, "put", instrumentation._patchHandler());
        instrumentation._wrap(this, "delete", instrumentation._patchHandler());
        instrumentation._wrap(this, "options", instrumentation._patchHandler());
        instrumentation._wrap(this, "patch", instrumentation._patchHandler());
        instrumentation._wrap(this, "all", instrumentation._patchHandler());
        instrumentation._wrap(this, "on", instrumentation._patchOnHandler());
        instrumentation._wrap(this, "use", instrumentation._patchMiddlewareHandler());
      }
    }
    try {
      moduleExports.Hono = WrappedHono;
    } catch {
      return { ...moduleExports, Hono: WrappedHono };
    }
    return moduleExports;
  }
  /**
   * Patches the route handler to instrument it.
   */
  _patchHandler() {
    const instrumentation = this;
    return function(original) {
      return function wrappedHandler(...args) {
        if (typeof args[0] === "string") {
          const path = args[0];
          if (args.length === 1) {
            return original.apply(this, [path]);
          }
          const handlers = args.slice(1);
          return original.apply(this, [
            path,
            ...handlers.map((handler) => instrumentation._wrapHandler(handler))
          ]);
        }
        return original.apply(
          this,
          args.map((handler) => instrumentation._wrapHandler(handler))
        );
      };
    };
  }
  /**
   * Patches the 'on' handler to instrument it.
   */
  _patchOnHandler() {
    const instrumentation = this;
    return function(original) {
      return function wrappedHandler(...args) {
        const handlers = args.slice(2);
        return original.apply(this, [
          ...args.slice(0, 2),
          ...handlers.map((handler) => instrumentation._wrapHandler(handler))
        ]);
      };
    };
  }
  /**
   * Patches the middleware handler to instrument it.
   */
  _patchMiddlewareHandler() {
    const instrumentation = this;
    return function(original) {
      return function wrappedHandler(...args) {
        if (typeof args[0] === "string") {
          const path = args[0];
          if (args.length === 1) {
            return original.apply(this, [path]);
          }
          const handlers = args.slice(1);
          return original.apply(this, [
            path,
            ...handlers.map((handler) => instrumentation._wrapHandler(handler))
          ]);
        }
        return original.apply(
          this,
          args.map((handler) => instrumentation._wrapHandler(handler))
        );
      };
    };
  }
  /**
   * Wraps a handler or middleware handler to apply instrumentation.
   */
  _wrapHandler(handler) {
    const instrumentation = this;
    return function(c, next) {
      if (!instrumentation.isEnabled()) {
        return handler.apply(this, [c, next]);
      }
      const path = c.req.path;
      const span = instrumentation.tracer.startSpan(path);
      return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
        return instrumentation._safeExecute(
          () => {
            const result = handler.apply(this, [c, next]);
            if (isThenable(result)) {
              return result.then((result2) => {
                const type = instrumentation._determineHandlerType(result2);
                span.setAttributes({
                  [AttributeNames$2.HONO_TYPE]: type,
                  [AttributeNames$2.HONO_NAME]: type === HonoTypes.REQUEST_HANDLER ? path : handler.name || "anonymous"
                });
                instrumentation.getConfig().responseHook?.(span);
                return result2;
              });
            } else {
              const type = instrumentation._determineHandlerType(result);
              span.setAttributes({
                [AttributeNames$2.HONO_TYPE]: type,
                [AttributeNames$2.HONO_NAME]: type === HonoTypes.REQUEST_HANDLER ? path : handler.name || "anonymous"
              });
              instrumentation.getConfig().responseHook?.(span);
              return result;
            }
          },
          () => span.end(),
          (error) => {
            instrumentation._handleError(span, error);
            span.end();
          }
        );
      });
    };
  }
  /**
   * Safely executes a function and handles errors.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _safeExecute(execute, onSuccess, onFailure) {
    try {
      const result = execute();
      if (isThenable(result)) {
        result.then(
          () => onSuccess(),
          (error) => onFailure(error)
        );
      } else {
        onSuccess();
      }
      return result;
    } catch (error) {
      onFailure(error);
      throw error;
    }
  }
  /**
   * Determines the handler type based on the result.
   * @param result
   * @private
   */
  _determineHandlerType(result) {
    return result === void 0 ? HonoTypes.MIDDLEWARE : HonoTypes.REQUEST_HANDLER;
  }
  /**
   * Handles errors by setting the span status and recording the exception.
   */
  _handleError(span, error) {
    if (error instanceof Error) {
      span.setStatus({
        code: srcExports$1.SpanStatusCode.ERROR,
        message: error.message
      });
      span.recordException(error);
    }
  }
}
const INTEGRATION_NAME$7 = "Hono";
function addHonoSpanAttributes(span) {
  const attributes = spanToJSON(span).data;
  const type = attributes[AttributeNames$2.HONO_TYPE];
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] || !type) {
    return;
  }
  span.setAttributes({
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.otel.hono",
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.hono`
  });
  const name = attributes[AttributeNames$2.HONO_NAME];
  if (typeof name === "string") {
    span.updateName(name);
  }
  if (getIsolationScope() === getDefaultIsolationScope()) {
    DEBUG_BUILD && debug.warn("Isolation scope is default isolation scope - skipping setting transactionName");
    return;
  }
  const route = attributes[srcExports.ATTR_HTTP_ROUTE];
  const method = attributes[srcExports.ATTR_HTTP_REQUEST_METHOD];
  if (typeof route === "string" && typeof method === "string") {
    getIsolationScope().setTransactionName(`${method} ${route}`);
  }
}
const instrumentHono = generateInstrumentOnce(
  INTEGRATION_NAME$7,
  () => new HonoInstrumentation({
    responseHook: (span) => {
      addHonoSpanAttributes(span);
    }
  })
);
const _honoIntegration = (() => {
  return {
    name: INTEGRATION_NAME$7,
    setupOnce() {
      instrumentHono();
    }
  };
});
const honoIntegration = defineIntegration(_honoIntegration);
var KoaLayerType = /* @__PURE__ */ ((KoaLayerType2) => {
  KoaLayerType2["ROUTER"] = "router";
  KoaLayerType2["MIDDLEWARE"] = "middleware";
  return KoaLayerType2;
})(KoaLayerType || {});
var AttributeNames$1 = /* @__PURE__ */ ((AttributeNames2) => {
  AttributeNames2["KOA_TYPE"] = "koa.type";
  AttributeNames2["KOA_NAME"] = "koa.name";
  return AttributeNames2;
})(AttributeNames$1 || {});
const getMiddlewareMetadata = (context, layer, isRouter, layerPath) => {
  if (isRouter) {
    return {
      attributes: {
        [AttributeNames$1.KOA_NAME]: layerPath?.toString(),
        [AttributeNames$1.KOA_TYPE]: KoaLayerType.ROUTER,
        [srcExports.ATTR_HTTP_ROUTE]: layerPath?.toString()
      },
      name: context._matchedRouteName || `router - ${layerPath}`
    };
  } else {
    return {
      attributes: {
        [AttributeNames$1.KOA_NAME]: layer.name ?? "middleware",
        [AttributeNames$1.KOA_TYPE]: KoaLayerType.MIDDLEWARE
      },
      name: `middleware - ${layer.name}`
    };
  }
};
const isLayerIgnored = (type, config2) => {
  return !!(Array.isArray(config2?.ignoreLayersType) && config2?.ignoreLayersType?.includes(type));
};
const kLayerPatched = /* @__PURE__ */ Symbol("koa-layer-patched");
const PACKAGE_NAME$4 = "@sentry/instrumentation-koa";
class KoaInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$4, SDK_VERSION, config2);
  }
  init() {
    return new InstrumentationNodeModuleDefinition(
      "koa",
      [">=2.0.0 <4"],
      (module) => {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        if (moduleExports == null) {
          return moduleExports;
        }
        if (isWrapped(moduleExports.prototype.use)) {
          this._unwrap(moduleExports.prototype, "use");
        }
        this._wrap(moduleExports.prototype, "use", this._getKoaUsePatch.bind(this));
        return module;
      },
      (module) => {
        const moduleExports = module[Symbol.toStringTag] === "Module" ? module.default : module;
        if (isWrapped(moduleExports.prototype.use)) {
          this._unwrap(moduleExports.prototype, "use");
        }
      }
    );
  }
  /**
   * Patches the Koa.use function in order to instrument each original
   * middleware layer which is introduced
   * @param {KoaMiddleware} middleware - the original middleware function
   */
  _getKoaUsePatch(original) {
    const plugin = this;
    return function use(middlewareFunction) {
      let patchedFunction;
      if (middlewareFunction.router) {
        patchedFunction = plugin._patchRouterDispatch(middlewareFunction);
      } else {
        patchedFunction = plugin._patchLayer(middlewareFunction, false);
      }
      return original.apply(this, [patchedFunction]);
    };
  }
  /**
   * Patches the dispatch function used by @koa/router. This function
   * goes through each routed middleware and adds instrumentation via a call
   * to the @function _patchLayer function.
   * @param {KoaMiddleware} dispatchLayer - the original dispatch function which dispatches
   * routed middleware
   */
  _patchRouterDispatch(dispatchLayer) {
    srcExports$1.diag.debug("Patching @koa/router dispatch");
    const router = dispatchLayer.router;
    const routesStack = router?.stack ?? [];
    for (const pathLayer of routesStack) {
      const path = pathLayer.path;
      const pathStack = pathLayer.stack;
      for (let j = 0; j < pathStack.length; j++) {
        const routedMiddleware = pathStack[j];
        pathStack[j] = this._patchLayer(routedMiddleware, true, path);
      }
    }
    return dispatchLayer;
  }
  /**
   * Patches each individual @param middlewareLayer function in order to create the
   * span and propagate context. It does not create spans when there is no parent span.
   * @param {KoaMiddleware} middlewareLayer - the original middleware function.
   * @param {boolean} isRouter - tracks whether the original middleware function
   * was dispatched by the router originally
   * @param {string?} layerPath - if present, provides additional data from the
   * router about the routed path which the middleware is attached to
   */
  _patchLayer(middlewareLayer, isRouter, layerPath) {
    const layerType = isRouter ? KoaLayerType.ROUTER : KoaLayerType.MIDDLEWARE;
    if (middlewareLayer[kLayerPatched] === true || isLayerIgnored(layerType, this.getConfig())) return middlewareLayer;
    if (middlewareLayer.constructor.name === "GeneratorFunction" || middlewareLayer.constructor.name === "AsyncGeneratorFunction") {
      srcExports$1.diag.debug("ignoring generator-based Koa middleware layer");
      return middlewareLayer;
    }
    middlewareLayer[kLayerPatched] = true;
    srcExports$1.diag.debug("patching Koa middleware layer");
    return async (context, next) => {
      const parent = srcExports$1.trace.getSpan(srcExports$1.context.active());
      if (parent === void 0) {
        return middlewareLayer(context, next);
      }
      const metadata = getMiddlewareMetadata(context, middlewareLayer, isRouter, layerPath);
      const span = this.tracer.startSpan(metadata.name, {
        attributes: metadata.attributes
      });
      if (context._matchedRoute) {
        setHttpServerSpanRouteAttribute(context._matchedRoute.toString());
      }
      const { requestHook } = this.getConfig();
      if (requestHook) {
        safeExecuteInTheMiddle(
          () => requestHook(span, {
            context,
            middlewareLayer,
            layerType
          }),
          (e) => {
            if (e) {
              srcExports$1.diag.error("koa instrumentation: request hook failed", e);
            }
          },
          true
        );
      }
      const newContext = srcExports$1.trace.setSpan(srcExports$1.context.active(), span);
      return srcExports$1.context.with(newContext, async () => {
        try {
          return await middlewareLayer(context, next);
        } catch (err) {
          span.recordException(err);
          throw err;
        } finally {
          span.end();
        }
      });
    };
  }
}
const INTEGRATION_NAME$6 = "Koa";
const instrumentKoa = generateInstrumentOnce(
  INTEGRATION_NAME$6,
  KoaInstrumentation,
  (options = {}) => {
    return {
      ignoreLayersType: options.ignoreLayersType,
      requestHook(span, info) {
        addOriginToSpan(span, "auto.http.otel.koa");
        const attributes = spanToJSON(span).data;
        const type = attributes["koa.type"];
        if (type) {
          span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `${type}.koa`);
        }
        const name = attributes["koa.name"];
        if (typeof name === "string") {
          span.updateName(name || "< unknown >");
        }
        if (getIsolationScope() === getDefaultIsolationScope()) {
          DEBUG_BUILD && debug.warn("Isolation scope is default isolation scope - skipping setting transactionName");
          return;
        }
        const route = attributes[srcExports.ATTR_HTTP_ROUTE];
        const method = info.context?.request?.method?.toUpperCase() || "GET";
        if (route) {
          getIsolationScope().setTransactionName(`${method} ${route}`);
        }
      }
    };
  }
);
const _koaIntegration = ((options = {}) => {
  return {
    name: INTEGRATION_NAME$6,
    setupOnce() {
      instrumentKoa(options);
    }
  };
});
const koaIntegration = defineIntegration(_koaIntegration);
var AttributeNames = /* @__PURE__ */ ((AttributeNames2) => {
  AttributeNames2["CONNECT_TYPE"] = "connect.type";
  AttributeNames2["CONNECT_NAME"] = "connect.name";
  return AttributeNames2;
})(AttributeNames || {});
var ConnectTypes = /* @__PURE__ */ ((ConnectTypes2) => {
  ConnectTypes2["MIDDLEWARE"] = "middleware";
  ConnectTypes2["REQUEST_HANDLER"] = "request_handler";
  return ConnectTypes2;
})(ConnectTypes || {});
var ConnectNames = /* @__PURE__ */ ((ConnectNames2) => {
  ConnectNames2["MIDDLEWARE"] = "middleware";
  ConnectNames2["REQUEST_HANDLER"] = "request handler";
  return ConnectNames2;
})(ConnectNames || {});
const _LAYERS_STORE_PROPERTY = /* @__PURE__ */ Symbol(
  "opentelemetry.instrumentation-connect.request-route-stack"
);
const addNewStackLayer = (request) => {
  if (Array.isArray(request[_LAYERS_STORE_PROPERTY]) === false) {
    Object.defineProperty(request, _LAYERS_STORE_PROPERTY, {
      enumerable: false,
      value: []
    });
  }
  request[_LAYERS_STORE_PROPERTY].push("/");
  const stackLength = request[_LAYERS_STORE_PROPERTY].length;
  return () => {
    if (stackLength === request[_LAYERS_STORE_PROPERTY].length) {
      request[_LAYERS_STORE_PROPERTY].pop();
    } else {
      srcExports$1.diag.warn("Connect: Trying to pop the stack multiple time");
    }
  };
};
const replaceCurrentStackRoute = (request, newRoute) => {
  if (newRoute) {
    request[_LAYERS_STORE_PROPERTY].splice(-1, 1, newRoute);
  }
};
const generateRoute = (request) => {
  return request[_LAYERS_STORE_PROPERTY].reduce((acc, sub) => acc.replace(/\/+$/, "") + sub);
};
const PACKAGE_NAME$3 = "@sentry/instrumentation-connect";
const ANONYMOUS_NAME = "anonymous";
class ConnectInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$3, SDK_VERSION, config2);
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition("connect", [">=3.0.0 <4"], (moduleExports) => {
        return this._patchConstructor(moduleExports);
      })
    ];
  }
  _patchApp(patchedApp) {
    if (!isWrapped(patchedApp.use)) {
      this._wrap(patchedApp, "use", this._patchUse.bind(this));
    }
    if (!isWrapped(patchedApp.handle)) {
      this._wrap(patchedApp, "handle", this._patchHandle.bind(this));
    }
  }
  _patchConstructor(original) {
    const instrumentation = this;
    return function(...args) {
      const app = original.apply(this, args);
      instrumentation._patchApp(app);
      return app;
    };
  }
  _patchNext(next, finishSpan) {
    return function nextFunction(err) {
      const result = next.apply(this, [err]);
      finishSpan();
      return result;
    };
  }
  _startSpan(routeName, middleWare) {
    let connectType;
    let connectName;
    let connectTypeName;
    if (routeName) {
      connectType = ConnectTypes.REQUEST_HANDLER;
      connectTypeName = ConnectNames.REQUEST_HANDLER;
      connectName = routeName;
    } else {
      connectType = ConnectTypes.MIDDLEWARE;
      connectTypeName = ConnectNames.MIDDLEWARE;
      connectName = middleWare.name || ANONYMOUS_NAME;
    }
    const spanName = `${connectTypeName} - ${connectName}`;
    const options = {
      attributes: {
        [srcExports.ATTR_HTTP_ROUTE]: routeName.length > 0 ? routeName : "/",
        [AttributeNames.CONNECT_TYPE]: connectType,
        [AttributeNames.CONNECT_NAME]: connectName
      }
    };
    return this.tracer.startSpan(spanName, options);
  }
  _patchMiddleware(routeName, middleWare) {
    const instrumentation = this;
    const isErrorMiddleware = middleWare.length === 4;
    function patchedMiddleware() {
      if (!instrumentation.isEnabled()) {
        return middleWare.apply(this, arguments);
      }
      const [reqArgIdx, resArgIdx, nextArgIdx] = isErrorMiddleware ? [1, 2, 3] : [0, 1, 2];
      const req = arguments[reqArgIdx];
      const res = arguments[resArgIdx];
      const next = arguments[nextArgIdx];
      replaceCurrentStackRoute(req, routeName);
      if (routeName) {
        setHttpServerSpanRouteAttribute(generateRoute(req));
      }
      let spanName = "";
      if (routeName) {
        spanName = `request handler - ${routeName}`;
      } else {
        spanName = `middleware - ${middleWare.name || ANONYMOUS_NAME}`;
      }
      const span = instrumentation._startSpan(routeName, middleWare);
      instrumentation._diag.debug("start span", spanName);
      let spanFinished = false;
      function finishSpan() {
        if (!spanFinished) {
          spanFinished = true;
          instrumentation._diag.debug(`finishing span ${span.name}`);
          span.end();
        } else {
          instrumentation._diag.debug(`span ${span.name} - already finished`);
        }
        res.removeListener("close", finishSpan);
      }
      res.addListener("close", finishSpan);
      arguments[nextArgIdx] = instrumentation._patchNext(next, finishSpan);
      return middleWare.apply(this, arguments);
    }
    Object.defineProperty(patchedMiddleware, "length", {
      value: middleWare.length,
      writable: false,
      configurable: true
    });
    return patchedMiddleware;
  }
  _patchUse(original) {
    const instrumentation = this;
    return function(...args) {
      const middleWare = args[args.length - 1];
      const routeName = args[args.length - 2] || "";
      args[args.length - 1] = instrumentation._patchMiddleware(routeName, middleWare);
      return original.apply(this, args);
    };
  }
  _patchHandle(original) {
    const instrumentation = this;
    return function() {
      const [reqIdx, outIdx] = [0, 2];
      const req = arguments[reqIdx];
      const out = arguments[outIdx];
      const completeStack = addNewStackLayer(req);
      if (typeof out === "function") {
        arguments[outIdx] = instrumentation._patchOut(out, completeStack);
      }
      return original.apply(this, arguments);
    };
  }
  _patchOut(out, completeStack) {
    return function nextFunction(...args) {
      completeStack();
      return Reflect.apply(out, this, args);
    };
  }
}
const INTEGRATION_NAME$5 = "Connect";
const instrumentConnect = generateInstrumentOnce(INTEGRATION_NAME$5, () => new ConnectInstrumentation());
const _connectIntegration = (() => {
  return {
    name: INTEGRATION_NAME$5,
    setupOnce() {
      instrumentConnect();
    }
  };
});
const connectIntegration = defineIntegration(_connectIntegration);
const ATTR_DB_NAME = "db.name";
const ATTR_DB_SQL_TABLE = "db.sql.table";
const ATTR_DB_STATEMENT = "db.statement";
const ATTR_DB_SYSTEM = "db.system";
const ATTR_DB_USER = "db.user";
const ATTR_NET_PEER_NAME$1 = "net.peer.name";
const ATTR_NET_PEER_PORT$1 = "net.peer.port";
const DB_SYSTEM_VALUE_MSSQL = "mssql";
function getSpanName(operation, db, sql, bulkLoadTable) {
  if (operation === "execBulkLoad" && bulkLoadTable && db) {
    return `${operation} ${bulkLoadTable} ${db}`;
  }
  if (operation === "callProcedure") {
    if (db) {
      return `${operation} ${sql} ${db}`;
    }
    return `${operation} ${sql}`;
  }
  if (db) {
    return `${operation} ${db}`;
  }
  return `${operation}`;
}
const once = (fn) => {
  let called = false;
  return (...args) => {
    if (called) return;
    called = true;
    return fn(...args);
  };
};
const PACKAGE_NAME$2 = "@sentry/instrumentation-tedious";
const CURRENT_DATABASE = /* @__PURE__ */ Symbol("opentelemetry.instrumentation-tedious.current-database");
const INJECTED_CTX = /* @__PURE__ */ Symbol("opentelemetry.instrumentation-tedious.context-info-injected");
const PATCHED_METHODS = ["callProcedure", "execSql", "execSqlBatch", "execBulkLoad", "prepare", "execute"];
function setDatabase(databaseName) {
  Object.defineProperty(this, CURRENT_DATABASE, {
    value: databaseName,
    writable: true
  });
}
const _TediousInstrumentation = class _TediousInstrumentation2 extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$2, SDK_VERSION, config2);
    this._setSemconvStabilityFromEnv();
  }
  // Used for testing.
  _setSemconvStabilityFromEnv() {
    this._netSemconvStability = semconvStabilityFromStr("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
    this._dbSemconvStability = semconvStabilityFromStr("database", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition(
        _TediousInstrumentation2.COMPONENT,
        [">=1.11.0 <20"],
        (moduleExports) => {
          const ConnectionPrototype = moduleExports.Connection.prototype;
          for (const method of PATCHED_METHODS) {
            if (isWrapped(ConnectionPrototype[method])) {
              this._unwrap(ConnectionPrototype, method);
            }
            this._wrap(ConnectionPrototype, method, this._patchQuery(method, moduleExports));
          }
          if (isWrapped(ConnectionPrototype.connect)) {
            this._unwrap(ConnectionPrototype, "connect");
          }
          this._wrap(ConnectionPrototype, "connect", this._patchConnect);
          return moduleExports;
        },
        (moduleExports) => {
          if (moduleExports === void 0) return;
          const ConnectionPrototype = moduleExports.Connection.prototype;
          for (const method of PATCHED_METHODS) {
            this._unwrap(ConnectionPrototype, method);
          }
          this._unwrap(ConnectionPrototype, "connect");
        }
      )
    ];
  }
  _patchConnect(original) {
    return function patchedConnect() {
      setDatabase.call(this, this.config?.options?.database);
      this.removeListener("databaseChange", setDatabase);
      this.on("databaseChange", setDatabase);
      this.once("end", () => {
        this.removeListener("databaseChange", setDatabase);
      });
      return original.apply(this, arguments);
    };
  }
  _buildTraceparent(span) {
    const sc = span.spanContext();
    return `00-${sc.traceId}-${sc.spanId}-0${Number(sc.traceFlags || srcExports$1.TraceFlags.NONE).toString(16)}`;
  }
  /**
   * Fire a one-off `SET CONTEXT_INFO @opentelemetry_traceparent` on the same
   * connection. Marks the request with INJECTED_CTX so our patch skips it.
   */
  _injectContextInfo(connection, tediousModule, traceparent) {
    return new Promise((resolve) => {
      try {
        const sql = "set context_info @opentelemetry_traceparent";
        const req = new tediousModule.Request(sql, (_err) => {
          resolve();
        });
        Object.defineProperty(req, INJECTED_CTX, { value: true });
        const buf = Buffer.from(traceparent, "utf8");
        req.addParameter("opentelemetry_traceparent", tediousModule.TYPES.VarBinary, buf, {
          length: buf.length
        });
        connection.execSql(req);
      } catch {
        resolve();
      }
    });
  }
  _shouldInjectFor(operation) {
    return operation === "execSql" || operation === "execSqlBatch" || operation === "callProcedure" || operation === "execute";
  }
  _patchQuery(operation, tediousModule) {
    return (originalMethod) => {
      const thisPlugin = this;
      function patchedMethod(request) {
        if (request?.[INJECTED_CTX]) {
          return originalMethod.apply(this, arguments);
        }
        if (!(request instanceof EventEmitter)) {
          thisPlugin._diag.warn(`Unexpected invocation of patched ${operation} method. Span not recorded`);
          return originalMethod.apply(this, arguments);
        }
        let procCount = 0;
        let statementCount = 0;
        const incrementStatementCount = () => statementCount++;
        const incrementProcCount = () => procCount++;
        const databaseName = this[CURRENT_DATABASE];
        const sql = ((request2) => {
          if (request2.sqlTextOrProcedure === "sp_prepare" && request2.parametersByName?.stmt?.value) {
            return request2.parametersByName.stmt.value;
          }
          return request2.sqlTextOrProcedure;
        })(request);
        const attributes = {};
        if (thisPlugin._dbSemconvStability & SemconvStability.OLD) {
          attributes[ATTR_DB_SYSTEM] = DB_SYSTEM_VALUE_MSSQL;
          attributes[ATTR_DB_NAME] = databaseName;
          attributes[ATTR_DB_USER] = this.config?.userName ?? this.config?.authentication?.options?.userName;
          attributes[ATTR_DB_STATEMENT] = sql;
          attributes[ATTR_DB_SQL_TABLE] = request.table;
        }
        if (thisPlugin._dbSemconvStability & SemconvStability.STABLE) {
          attributes[srcExports.ATTR_DB_NAMESPACE] = databaseName;
          attributes[srcExports.ATTR_DB_SYSTEM_NAME] = srcExports.DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER;
          attributes[srcExports.ATTR_DB_QUERY_TEXT] = sql;
          attributes[srcExports.ATTR_DB_COLLECTION_NAME] = request.table;
        }
        if (thisPlugin._netSemconvStability & SemconvStability.OLD) {
          attributes[ATTR_NET_PEER_NAME$1] = this.config?.server;
          attributes[ATTR_NET_PEER_PORT$1] = this.config?.options?.port;
        }
        if (thisPlugin._netSemconvStability & SemconvStability.STABLE) {
          attributes[srcExports.ATTR_SERVER_ADDRESS] = this.config?.server;
          attributes[srcExports.ATTR_SERVER_PORT] = this.config?.options?.port;
        }
        const span = thisPlugin.tracer.startSpan(getSpanName(operation, databaseName, sql, request.table), {
          kind: srcExports$1.SpanKind.CLIENT,
          attributes
        });
        const endSpan2 = once((err) => {
          request.removeListener("done", incrementStatementCount);
          request.removeListener("doneInProc", incrementStatementCount);
          request.removeListener("doneProc", incrementProcCount);
          request.removeListener("error", endSpan2);
          this.removeListener("end", endSpan2);
          span.setAttribute("tedious.procedure_count", procCount);
          span.setAttribute("tedious.statement_count", statementCount);
          if (err) {
            span.setStatus({
              code: srcExports$1.SpanStatusCode.ERROR,
              message: err.message
            });
          }
          span.end();
        });
        request.on("done", incrementStatementCount);
        request.on("doneInProc", incrementStatementCount);
        request.on("doneProc", incrementProcCount);
        request.once("error", endSpan2);
        this.on("end", endSpan2);
        if (typeof request.callback === "function") {
          thisPlugin._wrap(request, "callback", thisPlugin._patchCallbackQuery(endSpan2));
        } else {
          thisPlugin._diag.error("Expected request.callback to be a function");
        }
        const runUserRequest = () => {
          return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), originalMethod, this, ...arguments);
        };
        const cfg = thisPlugin.getConfig();
        const shouldInject = cfg.enableTraceContextPropagation && thisPlugin._shouldInjectFor(operation);
        if (!shouldInject) return runUserRequest();
        const traceparent = thisPlugin._buildTraceparent(span);
        void thisPlugin._injectContextInfo(this, tediousModule, traceparent).finally(runUserRequest);
      }
      Object.defineProperty(patchedMethod, "length", {
        value: originalMethod.length,
        writable: false
      });
      return patchedMethod;
    };
  }
  _patchCallbackQuery(endSpan2) {
    return (originalCallback) => {
      return function(err, rowCount, rows) {
        endSpan2(err);
        return originalCallback.apply(this, arguments);
      };
    };
  }
};
_TediousInstrumentation.COMPONENT = "tedious";
let TediousInstrumentation = _TediousInstrumentation;
const TEDIUS_INSTRUMENTED_METHODS = /* @__PURE__ */ new Set([
  "callProcedure",
  "execSql",
  "execSqlBatch",
  "execBulkLoad",
  "prepare",
  "execute"
]);
const INTEGRATION_NAME$4 = "Tedious";
const instrumentTedious = generateInstrumentOnce(INTEGRATION_NAME$4, () => new TediousInstrumentation({}));
const _tediousIntegration = (() => {
  let instrumentationWrappedCallback;
  return {
    name: INTEGRATION_NAME$4,
    setupOnce() {
      const instrumentation = instrumentTedious();
      instrumentationWrappedCallback = instrumentWhenWrapped(instrumentation);
    },
    setup(client) {
      instrumentationWrappedCallback?.(
        () => client.on("spanStart", (span) => {
          const { description, data } = spanToJSON(span);
          if (!description || data["db.system"] !== "mssql") {
            return;
          }
          const operation = description.split(" ")[0] || "";
          if (TEDIUS_INSTRUMENTED_METHODS.has(operation)) {
            span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.tedious");
          }
        })
      );
    }
  };
});
const tediousIntegration = defineIntegration(_tediousIntegration);
const MODULE_NAME = "generic-pool";
const PACKAGE_NAME$1 = "@sentry/instrumentation-generic-pool";
class GenericPoolInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME$1, SDK_VERSION, config2);
    this._isDisabled = false;
  }
  init() {
    return [
      new InstrumentationNodeModuleDefinition(
        MODULE_NAME,
        [">=3.0.0 <4"],
        (moduleExports) => {
          const Pool = moduleExports.Pool;
          if (isWrapped(Pool.prototype.acquire)) {
            this._unwrap(Pool.prototype, "acquire");
          }
          this._wrap(Pool.prototype, "acquire", this._acquirePatcher.bind(this));
          return moduleExports;
        },
        (moduleExports) => {
          const Pool = moduleExports.Pool;
          this._unwrap(Pool.prototype, "acquire");
          return moduleExports;
        }
      ),
      new InstrumentationNodeModuleDefinition(
        MODULE_NAME,
        [">=2.4.0 <3"],
        (moduleExports) => {
          const Pool = moduleExports.Pool;
          if (isWrapped(Pool.prototype.acquire)) {
            this._unwrap(Pool.prototype, "acquire");
          }
          this._wrap(Pool.prototype, "acquire", this._acquireWithCallbacksPatcher.bind(this));
          return moduleExports;
        },
        (moduleExports) => {
          const Pool = moduleExports.Pool;
          this._unwrap(Pool.prototype, "acquire");
          return moduleExports;
        }
      ),
      new InstrumentationNodeModuleDefinition(
        MODULE_NAME,
        [">=2.0.0 <2.4"],
        (moduleExports) => {
          this._isDisabled = false;
          if (isWrapped(moduleExports.Pool)) {
            this._unwrap(moduleExports, "Pool");
          }
          this._wrap(moduleExports, "Pool", this._poolWrapper.bind(this));
          return moduleExports;
        },
        (moduleExports) => {
          this._isDisabled = true;
          return moduleExports;
        }
      )
    ];
  }
  _acquirePatcher(original) {
    return function wrapped_acquire(...args) {
      return startSpan$1({ name: "generic-pool.acquire" }, () => {
        return original.call(this, ...args);
      });
    };
  }
  _poolWrapper(original) {
    const wrap = this._wrap.bind(this);
    const acquireWithCallbacksPatcher = this._acquireWithCallbacksPatcher.bind(this);
    return function wrapped_pool(...args) {
      const pool = original.apply(this, args);
      wrap(pool, "acquire", acquireWithCallbacksPatcher);
      return pool;
    };
  }
  _acquireWithCallbacksPatcher(original) {
    const isDisabled = () => this._isDisabled;
    return function wrapped_acquire(cb, priority) {
      if (isDisabled()) {
        return original.call(this, cb, priority);
      }
      return startSpanManual({ name: "generic-pool.acquire" }, (span) => {
        original.call(
          this,
          (err, client) => {
            if (err) {
              span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
            }
            span.end();
            if (cb) {
              cb(err, client);
            }
          },
          priority
        );
      });
    };
  }
}
const INTEGRATION_NAME$3 = "GenericPool";
const instrumentGenericPool = generateInstrumentOnce(INTEGRATION_NAME$3, () => new GenericPoolInstrumentation({}));
const _genericPoolIntegration = (() => {
  let instrumentationWrappedCallback;
  return {
    name: INTEGRATION_NAME$3,
    setupOnce() {
      const instrumentation = instrumentGenericPool();
      instrumentationWrappedCallback = instrumentWhenWrapped(instrumentation);
    },
    setup(client) {
      instrumentationWrappedCallback?.(
        () => client.on("spanStart", (span) => {
          const spanJSON = spanToJSON(span);
          const spanDescription = spanJSON.description;
          const isGenericPoolSpan = spanDescription === "generic-pool.acquire";
          if (isGenericPoolSpan) {
            span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.otel.generic_pool");
          }
        })
      );
    }
  };
});
const genericPoolIntegration = defineIntegration(_genericPoolIntegration);
const ATTR_MESSAGING_OPERATION = "messaging.operation";
const ATTR_MESSAGING_SYSTEM = "messaging.system";
const ATTR_NET_PEER_NAME = "net.peer.name";
const ATTR_NET_PEER_PORT = "net.peer.port";
const ATTR_MESSAGING_DESTINATION = "messaging.destination";
const ATTR_MESSAGING_DESTINATION_KIND = "messaging.destination_kind";
const ATTR_MESSAGING_RABBITMQ_ROUTING_KEY = "messaging.rabbitmq.routing_key";
const MESSAGING_OPERATION_VALUE_PROCESS = "process";
const ATTR_MESSAGING_PROTOCOL = "messaging.protocol";
const ATTR_MESSAGING_PROTOCOL_VERSION = "messaging.protocol_version";
const ATTR_MESSAGING_URL = "messaging.url";
const MESSAGING_DESTINATION_KIND_VALUE_TOPIC = "topic";
const OLD_ATTR_MESSAGING_MESSAGE_ID = "messaging.message_id";
const ATTR_MESSAGING_CONVERSATION_ID = "messaging.conversation_id";
var EndOperation = /* @__PURE__ */ ((EndOperation2) => {
  EndOperation2["AutoAck"] = "auto ack";
  EndOperation2["Ack"] = "ack";
  EndOperation2["AckAll"] = "ackAll";
  EndOperation2["Reject"] = "reject";
  EndOperation2["Nack"] = "nack";
  EndOperation2["NackAll"] = "nackAll";
  EndOperation2["ChannelClosed"] = "channel closed";
  EndOperation2["ChannelError"] = "channel error";
  EndOperation2["InstrumentationTimeout"] = "instrumentation timeout";
  return EndOperation2;
})(EndOperation || {});
const DEFAULT_CONFIG = {
  consumeTimeoutMs: 1e3 * 60,
  // 1 minute
  useLinksForConsume: false
};
const MESSAGE_STORED_SPAN = /* @__PURE__ */ Symbol("opentelemetry.amqplib.message.stored-span");
const CHANNEL_SPANS_NOT_ENDED = /* @__PURE__ */ Symbol("opentelemetry.amqplib.channel.spans-not-ended");
const CHANNEL_CONSUME_TIMEOUT_TIMER = /* @__PURE__ */ Symbol(
  "opentelemetry.amqplib.channel.consumer-timeout-timer"
);
const CONNECTION_ATTRIBUTES = /* @__PURE__ */ Symbol("opentelemetry.amqplib.connection.attributes");
const IS_CONFIRM_CHANNEL_CONTEXT_KEY = srcExports$1.createContextKey("opentelemetry.amqplib.channel.is-confirm-channel");
const normalizeExchange = (exchangeName) => exchangeName !== "" ? exchangeName : "<default>";
const censorPassword = (url) => {
  return url.replace(/:[^:@/]*@/, ":***@");
};
const getPort = (portFromUrl, resolvedProtocol) => {
  return portFromUrl || (resolvedProtocol === "AMQP" ? 5672 : 5671);
};
const getProtocol = (protocolFromUrl) => {
  const resolvedProtocol = protocolFromUrl || "amqp";
  const noEndingColon = resolvedProtocol.endsWith(":") ? resolvedProtocol.substring(0, resolvedProtocol.length - 1) : resolvedProtocol;
  return noEndingColon.toUpperCase();
};
const getHostname = (hostnameFromUrl) => {
  return hostnameFromUrl || "localhost";
};
const extractConnectionAttributeOrLog = (url, attributeKey, attributeValue, nameForLog) => {
  if (attributeValue) {
    return { [attributeKey]: attributeValue };
  } else {
    srcExports$1.diag.error(`amqplib instrumentation: could not extract connection attribute ${nameForLog} from user supplied url`, {
      url
    });
    return {};
  }
};
const getConnectionAttributesFromServer = (conn) => {
  const product = conn.serverProperties.product?.toLowerCase?.();
  if (product) {
    return {
      [ATTR_MESSAGING_SYSTEM]: product
    };
  } else {
    return {};
  }
};
const getConnectionAttributesFromUrl = (url, netSemconvStability) => {
  const attributes = {
    [ATTR_MESSAGING_PROTOCOL_VERSION]: "0.9.1"
    // this is the only protocol supported by the instrumented library
  };
  url = url || "amqp://localhost";
  if (typeof url === "object") {
    const connectOptions = url;
    const protocol = getProtocol(connectOptions?.protocol);
    Object.assign(attributes, {
      ...extractConnectionAttributeOrLog(url, ATTR_MESSAGING_PROTOCOL, protocol, "protocol")
    });
    const hostname = getHostname(connectOptions?.hostname);
    if (netSemconvStability & SemconvStability.OLD) {
      Object.assign(attributes, {
        ...extractConnectionAttributeOrLog(url, ATTR_NET_PEER_NAME, hostname, "hostname")
      });
    }
    if (netSemconvStability & SemconvStability.STABLE) {
      Object.assign(attributes, {
        ...extractConnectionAttributeOrLog(url, srcExports.ATTR_SERVER_ADDRESS, hostname, "hostname")
      });
    }
    const port = getPort(connectOptions.port, protocol);
    if (netSemconvStability & SemconvStability.OLD) {
      Object.assign(attributes, extractConnectionAttributeOrLog(url, ATTR_NET_PEER_PORT, port, "port"));
    }
    if (netSemconvStability & SemconvStability.STABLE) {
      Object.assign(attributes, extractConnectionAttributeOrLog(url, srcExports.ATTR_SERVER_PORT, port, "port"));
    }
  } else {
    const censoredUrl = censorPassword(url);
    attributes[ATTR_MESSAGING_URL] = censoredUrl;
    try {
      const urlParts = new URL(censoredUrl);
      const protocol = getProtocol(urlParts.protocol);
      Object.assign(attributes, {
        ...extractConnectionAttributeOrLog(censoredUrl, ATTR_MESSAGING_PROTOCOL, protocol, "protocol")
      });
      const hostname = getHostname(urlParts.hostname);
      if (netSemconvStability & SemconvStability.OLD) {
        Object.assign(attributes, {
          ...extractConnectionAttributeOrLog(censoredUrl, ATTR_NET_PEER_NAME, hostname, "hostname")
        });
      }
      if (netSemconvStability & SemconvStability.STABLE) {
        Object.assign(attributes, {
          ...extractConnectionAttributeOrLog(censoredUrl, srcExports.ATTR_SERVER_ADDRESS, hostname, "hostname")
        });
      }
      const port = getPort(urlParts.port ? parseInt(urlParts.port) : void 0, protocol);
      if (netSemconvStability & SemconvStability.OLD) {
        Object.assign(attributes, extractConnectionAttributeOrLog(censoredUrl, ATTR_NET_PEER_PORT, port, "port"));
      }
      if (netSemconvStability & SemconvStability.STABLE) {
        Object.assign(attributes, extractConnectionAttributeOrLog(censoredUrl, srcExports.ATTR_SERVER_PORT, port, "port"));
      }
    } catch (err) {
      srcExports$1.diag.error("amqplib instrumentation: error while extracting connection details from connection url", {
        censoredUrl,
        err
      });
    }
  }
  return attributes;
};
const markConfirmChannelTracing = (context) => {
  return context.setValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY, true);
};
const unmarkConfirmChannelTracing = (context) => {
  return context.deleteValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY);
};
const isConfirmChannelTracing = (context) => {
  return context.getValue(IS_CONFIRM_CHANNEL_CONTEXT_KEY) === true;
};
const PACKAGE_NAME = "@sentry/instrumentation-amqplib";
const supportedVersions$5 = [">=0.5.5 <2"];
class AmqplibInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super(PACKAGE_NAME, SDK_VERSION, { ...DEFAULT_CONFIG, ...config2 });
    this._setSemconvStabilityFromEnv();
  }
  // Used for testing.
  _setSemconvStabilityFromEnv() {
    this._netSemconvStability = semconvStabilityFromStr("http", process.env.OTEL_SEMCONV_STABILITY_OPT_IN);
  }
  setConfig(config2 = {}) {
    super.setConfig({ ...DEFAULT_CONFIG, ...config2 });
  }
  init() {
    const channelModelModuleFile = new InstrumentationNodeModuleFile(
      "amqplib/lib/channel_model.js",
      supportedVersions$5,
      this.patchChannelModel.bind(this),
      this.unpatchChannelModel.bind(this)
    );
    const callbackModelModuleFile = new InstrumentationNodeModuleFile(
      "amqplib/lib/callback_model.js",
      supportedVersions$5,
      this.patchChannelModel.bind(this),
      this.unpatchChannelModel.bind(this)
    );
    const connectModuleFile = new InstrumentationNodeModuleFile(
      "amqplib/lib/connect.js",
      supportedVersions$5,
      this.patchConnect.bind(this),
      this.unpatchConnect.bind(this)
    );
    const module = new InstrumentationNodeModuleDefinition("amqplib", supportedVersions$5, void 0, void 0, [
      channelModelModuleFile,
      connectModuleFile,
      callbackModelModuleFile
    ]);
    return module;
  }
  patchConnect(moduleExports) {
    moduleExports = this.unpatchConnect(moduleExports);
    if (!isWrapped(moduleExports.connect)) {
      this._wrap(moduleExports, "connect", this.getConnectPatch.bind(this));
    }
    return moduleExports;
  }
  unpatchConnect(moduleExports) {
    if (isWrapped(moduleExports.connect)) {
      this._unwrap(moduleExports, "connect");
    }
    return moduleExports;
  }
  patchChannelModel(moduleExports, moduleVersion) {
    if (!isWrapped(moduleExports.Channel.prototype.publish)) {
      this._wrap(moduleExports.Channel.prototype, "publish", this.getPublishPatch.bind(this, moduleVersion));
    }
    if (!isWrapped(moduleExports.Channel.prototype.consume)) {
      this._wrap(moduleExports.Channel.prototype, "consume", this.getConsumePatch.bind(this, moduleVersion));
    }
    if (!isWrapped(moduleExports.Channel.prototype.ack)) {
      this._wrap(moduleExports.Channel.prototype, "ack", this.getAckPatch.bind(this, false, EndOperation.Ack));
    }
    if (!isWrapped(moduleExports.Channel.prototype.nack)) {
      this._wrap(moduleExports.Channel.prototype, "nack", this.getAckPatch.bind(this, true, EndOperation.Nack));
    }
    if (!isWrapped(moduleExports.Channel.prototype.reject)) {
      this._wrap(moduleExports.Channel.prototype, "reject", this.getAckPatch.bind(this, true, EndOperation.Reject));
    }
    if (!isWrapped(moduleExports.Channel.prototype.ackAll)) {
      this._wrap(moduleExports.Channel.prototype, "ackAll", this.getAckAllPatch.bind(this, false, EndOperation.AckAll));
    }
    if (!isWrapped(moduleExports.Channel.prototype.nackAll)) {
      this._wrap(
        moduleExports.Channel.prototype,
        "nackAll",
        this.getAckAllPatch.bind(this, true, EndOperation.NackAll)
      );
    }
    if (!isWrapped(moduleExports.Channel.prototype.emit)) {
      this._wrap(moduleExports.Channel.prototype, "emit", this.getChannelEmitPatch.bind(this));
    }
    if (!isWrapped(moduleExports.ConfirmChannel.prototype.publish)) {
      this._wrap(
        moduleExports.ConfirmChannel.prototype,
        "publish",
        this.getConfirmedPublishPatch.bind(this, moduleVersion)
      );
    }
    return moduleExports;
  }
  unpatchChannelModel(moduleExports) {
    if (isWrapped(moduleExports.Channel.prototype.publish)) {
      this._unwrap(moduleExports.Channel.prototype, "publish");
    }
    if (isWrapped(moduleExports.Channel.prototype.consume)) {
      this._unwrap(moduleExports.Channel.prototype, "consume");
    }
    if (isWrapped(moduleExports.Channel.prototype.ack)) {
      this._unwrap(moduleExports.Channel.prototype, "ack");
    }
    if (isWrapped(moduleExports.Channel.prototype.nack)) {
      this._unwrap(moduleExports.Channel.prototype, "nack");
    }
    if (isWrapped(moduleExports.Channel.prototype.reject)) {
      this._unwrap(moduleExports.Channel.prototype, "reject");
    }
    if (isWrapped(moduleExports.Channel.prototype.ackAll)) {
      this._unwrap(moduleExports.Channel.prototype, "ackAll");
    }
    if (isWrapped(moduleExports.Channel.prototype.nackAll)) {
      this._unwrap(moduleExports.Channel.prototype, "nackAll");
    }
    if (isWrapped(moduleExports.Channel.prototype.emit)) {
      this._unwrap(moduleExports.Channel.prototype, "emit");
    }
    if (isWrapped(moduleExports.ConfirmChannel.prototype.publish)) {
      this._unwrap(moduleExports.ConfirmChannel.prototype, "publish");
    }
    return moduleExports;
  }
  getConnectPatch(original) {
    const self = this;
    return function patchedConnect(url, socketOptions, openCallback) {
      return original.call(
        this,
        url,
        socketOptions,
        function(err, conn) {
          if (err == null) {
            const urlAttributes = getConnectionAttributesFromUrl(url, self._netSemconvStability);
            const serverAttributes = getConnectionAttributesFromServer(conn);
            conn[CONNECTION_ATTRIBUTES] = {
              ...urlAttributes,
              ...serverAttributes
            };
          }
          openCallback.apply(this, arguments);
        }
      );
    };
  }
  getChannelEmitPatch(original) {
    const self = this;
    return function emit(eventName) {
      if (eventName === "close") {
        self.endAllSpansOnChannel(this, true, EndOperation.ChannelClosed, void 0);
        const activeTimer = this[CHANNEL_CONSUME_TIMEOUT_TIMER];
        if (activeTimer) {
          clearInterval(activeTimer);
        }
        this[CHANNEL_CONSUME_TIMEOUT_TIMER] = void 0;
      } else if (eventName === "error") {
        self.endAllSpansOnChannel(this, true, EndOperation.ChannelError, void 0);
      }
      return original.apply(this, arguments);
    };
  }
  getAckAllPatch(isRejected, endOperation, original) {
    const self = this;
    return function ackAll(requeueOrEmpty) {
      self.endAllSpansOnChannel(this, isRejected, endOperation, requeueOrEmpty);
      return original.apply(this, arguments);
    };
  }
  getAckPatch(isRejected, endOperation, original) {
    const self = this;
    return function ack(message, allUpToOrRequeue, requeue) {
      const channel = this;
      const requeueResolved = endOperation === EndOperation.Reject ? allUpToOrRequeue : requeue;
      const spansNotEnded = channel[CHANNEL_SPANS_NOT_ENDED] ?? [];
      const msgIndex = spansNotEnded.findIndex((msgDetails) => msgDetails.msg === message);
      if (msgIndex < 0) {
        self.endConsumerSpan(message, isRejected, endOperation, requeueResolved);
      } else if (endOperation !== EndOperation.Reject && allUpToOrRequeue) {
        for (let i = 0; i <= msgIndex; i++) {
          self.endConsumerSpan(spansNotEnded[i].msg, isRejected, endOperation, requeueResolved);
        }
        spansNotEnded.splice(0, msgIndex + 1);
      } else {
        self.endConsumerSpan(message, isRejected, endOperation, requeueResolved);
        spansNotEnded.splice(msgIndex, 1);
      }
      return original.apply(this, arguments);
    };
  }
  getConsumePatch(moduleVersion, original) {
    const self = this;
    return function consume(queue, onMessage, options) {
      const channel = this;
      if (!Object.prototype.hasOwnProperty.call(channel, CHANNEL_SPANS_NOT_ENDED)) {
        const { consumeTimeoutMs } = self.getConfig();
        if (consumeTimeoutMs) {
          const timer = setInterval(() => {
            self.checkConsumeTimeoutOnChannel(channel);
          }, consumeTimeoutMs);
          timer.unref();
          channel[CHANNEL_CONSUME_TIMEOUT_TIMER] = timer;
        }
        channel[CHANNEL_SPANS_NOT_ENDED] = [];
      }
      const patchedOnMessage = function(msg) {
        if (!msg) {
          return onMessage.call(this, msg);
        }
        const headers = msg.properties.headers ?? {};
        let parentContext = srcExports$1.propagation.extract(srcExports$1.ROOT_CONTEXT, headers);
        const exchange = msg.fields?.exchange;
        let links;
        if (self._config.useLinksForConsume) {
          const parentSpanContext = parentContext ? srcExports$1.trace.getSpan(parentContext)?.spanContext() : void 0;
          parentContext = void 0;
          if (parentSpanContext) {
            links = [
              {
                context: parentSpanContext
              }
            ];
          }
        }
        const span = self.tracer.startSpan(
          `${queue} process`,
          {
            kind: srcExports$1.SpanKind.CONSUMER,
            attributes: {
              ...channel?.connection?.[CONNECTION_ATTRIBUTES],
              [ATTR_MESSAGING_DESTINATION]: exchange,
              [ATTR_MESSAGING_DESTINATION_KIND]: MESSAGING_DESTINATION_KIND_VALUE_TOPIC,
              [ATTR_MESSAGING_RABBITMQ_ROUTING_KEY]: msg.fields?.routingKey,
              [ATTR_MESSAGING_OPERATION]: MESSAGING_OPERATION_VALUE_PROCESS,
              [OLD_ATTR_MESSAGING_MESSAGE_ID]: msg?.properties.messageId,
              [ATTR_MESSAGING_CONVERSATION_ID]: msg?.properties.correlationId
            },
            links
          },
          parentContext
        );
        const { consumeHook } = self.getConfig();
        if (consumeHook) {
          safeExecuteInTheMiddle(
            () => consumeHook(span, { moduleVersion, msg }),
            (e) => {
              if (e) {
                srcExports$1.diag.error("amqplib instrumentation: consumerHook error", e);
              }
            },
            true
          );
        }
        if (!options?.noAck) {
          channel[CHANNEL_SPANS_NOT_ENDED].push({
            msg,
            timeOfConsume: timestampInSeconds()
          });
          msg[MESSAGE_STORED_SPAN] = span;
        }
        const setContext = parentContext ? parentContext : srcExports$1.ROOT_CONTEXT;
        srcExports$1.context.with(srcExports$1.trace.setSpan(setContext, span), () => {
          onMessage.call(this, msg);
        });
        if (options?.noAck) {
          self.callConsumeEndHook(span, msg, false, EndOperation.AutoAck);
          span.end();
        }
      };
      arguments[1] = patchedOnMessage;
      return original.apply(this, arguments);
    };
  }
  getConfirmedPublishPatch(moduleVersion, original) {
    const self = this;
    return function confirmedPublish(exchange, routingKey, content, options, callback) {
      const channel = this;
      const { span, modifiedOptions } = self.createPublishSpan(self, exchange, routingKey, channel, options);
      const { publishHook } = self.getConfig();
      if (publishHook) {
        safeExecuteInTheMiddle(
          () => publishHook(span, {
            moduleVersion,
            exchange,
            routingKey,
            content,
            options: modifiedOptions,
            isConfirmChannel: true
          }),
          (e) => {
            if (e) {
              srcExports$1.diag.error("amqplib instrumentation: publishHook error", e);
            }
          },
          true
        );
      }
      const patchedOnConfirm = function(err, ok) {
        try {
          callback?.call(this, err, ok);
        } finally {
          const { publishConfirmHook } = self.getConfig();
          if (publishConfirmHook) {
            safeExecuteInTheMiddle(
              () => publishConfirmHook(span, {
                moduleVersion,
                exchange,
                routingKey,
                content,
                options,
                isConfirmChannel: true,
                confirmError: err
              }),
              (e) => {
                if (e) {
                  srcExports$1.diag.error("amqplib instrumentation: publishConfirmHook error", e);
                }
              },
              true
            );
          }
          if (err) {
            span.setStatus({
              code: srcExports$1.SpanStatusCode.ERROR,
              message: "message confirmation has been nack'ed"
            });
          }
          span.end();
        }
      };
      const markedContext = markConfirmChannelTracing(srcExports$1.context.active());
      const argumentsCopy = [...arguments];
      argumentsCopy[3] = modifiedOptions;
      argumentsCopy[4] = srcExports$1.context.bind(
        unmarkConfirmChannelTracing(srcExports$1.trace.setSpan(markedContext, span)),
        patchedOnConfirm
      );
      return srcExports$1.context.with(markedContext, original.bind(this, ...argumentsCopy));
    };
  }
  getPublishPatch(moduleVersion, original) {
    const self = this;
    return function publish(exchange, routingKey, content, options) {
      if (isConfirmChannelTracing(srcExports$1.context.active())) {
        return original.apply(this, arguments);
      } else {
        const channel = this;
        const { span, modifiedOptions } = self.createPublishSpan(self, exchange, routingKey, channel, options);
        const { publishHook } = self.getConfig();
        if (publishHook) {
          safeExecuteInTheMiddle(
            () => publishHook(span, {
              moduleVersion,
              exchange,
              routingKey,
              content,
              options: modifiedOptions,
              isConfirmChannel: false
            }),
            (e) => {
              if (e) {
                srcExports$1.diag.error("amqplib instrumentation: publishHook error", e);
              }
            },
            true
          );
        }
        const argumentsCopy = [...arguments];
        argumentsCopy[3] = modifiedOptions;
        const originalRes = original.apply(this, argumentsCopy);
        span.end();
        return originalRes;
      }
    };
  }
  createPublishSpan(self, exchange, routingKey, channel, options) {
    const normalizedExchange = normalizeExchange(exchange);
    const span = self.tracer.startSpan(`publish ${normalizedExchange}`, {
      kind: srcExports$1.SpanKind.PRODUCER,
      attributes: {
        ...channel.connection[CONNECTION_ATTRIBUTES],
        [ATTR_MESSAGING_DESTINATION]: exchange,
        [ATTR_MESSAGING_DESTINATION_KIND]: MESSAGING_DESTINATION_KIND_VALUE_TOPIC,
        [ATTR_MESSAGING_RABBITMQ_ROUTING_KEY]: routingKey,
        [OLD_ATTR_MESSAGING_MESSAGE_ID]: options?.messageId,
        [ATTR_MESSAGING_CONVERSATION_ID]: options?.correlationId
      }
    });
    const modifiedOptions = options ?? {};
    modifiedOptions.headers = modifiedOptions.headers ?? {};
    srcExports$1.propagation.inject(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), modifiedOptions.headers);
    return { span, modifiedOptions };
  }
  endConsumerSpan(message, isRejected, operation, requeue) {
    const storedSpan = message[MESSAGE_STORED_SPAN];
    if (!storedSpan) return;
    if (isRejected !== false) {
      storedSpan.setStatus({
        code: srcExports$1.SpanStatusCode.ERROR,
        message: operation !== EndOperation.ChannelClosed && operation !== EndOperation.ChannelError ? `${operation} called on message${requeue === true ? " with requeue" : requeue === false ? " without requeue" : ""}` : operation
      });
    }
    this.callConsumeEndHook(storedSpan, message, isRejected, operation);
    storedSpan.end();
    message[MESSAGE_STORED_SPAN] = void 0;
  }
  endAllSpansOnChannel(channel, isRejected, operation, requeue) {
    const spansNotEnded = channel[CHANNEL_SPANS_NOT_ENDED] ?? [];
    spansNotEnded.forEach((msgDetails) => {
      this.endConsumerSpan(msgDetails.msg, isRejected, operation, requeue);
    });
    channel[CHANNEL_SPANS_NOT_ENDED] = [];
  }
  callConsumeEndHook(span, msg, rejected, endOperation) {
    const { consumeEndHook } = this.getConfig();
    if (!consumeEndHook) return;
    safeExecuteInTheMiddle(
      () => consumeEndHook(span, { msg, rejected, endOperation }),
      (e) => {
        if (e) {
          srcExports$1.diag.error("amqplib instrumentation: consumerEndHook error", e);
        }
      },
      true
    );
  }
  checkConsumeTimeoutOnChannel(channel) {
    const currentTime = timestampInSeconds();
    const spansNotEnded = channel[CHANNEL_SPANS_NOT_ENDED] ?? [];
    let i;
    const { consumeTimeoutMs } = this.getConfig();
    for (i = 0; i < spansNotEnded.length; i++) {
      const currMessage = spansNotEnded[i];
      const timeFromConsumeMs = (currentTime - currMessage.timeOfConsume) * 1e3;
      if (timeFromConsumeMs < consumeTimeoutMs) {
        break;
      }
      this.endConsumerSpan(currMessage.msg, null, EndOperation.InstrumentationTimeout, true);
    }
    spansNotEnded.splice(0, i);
  }
}
const INTEGRATION_NAME$2 = "Amqplib";
const config$1 = {
  consumeEndHook: (span) => {
    addOriginToSpan(span, "auto.amqplib.otel.consumer");
  },
  publishHook: (span) => {
    addOriginToSpan(span, "auto.amqplib.otel.publisher");
  }
};
const instrumentAmqplib = generateInstrumentOnce(INTEGRATION_NAME$2, () => new AmqplibInstrumentation(config$1));
const _amqplibIntegration = (() => {
  return {
    name: INTEGRATION_NAME$2,
    setupOnce() {
      instrumentAmqplib();
    }
  };
});
const amqplibIntegration = defineIntegration(_amqplibIntegration);
const INTEGRATION_NAME$1 = "VercelAI";
const SUPPORTED_VERSIONS = [">=3.0.0 <7"];
const INSTRUMENTED_METHODS = [
  "generateText",
  "streamText",
  "generateObject",
  "streamObject",
  "embed",
  "embedMany",
  "rerank"
];
function isToolError(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const candidate = obj;
  return "type" in candidate && "error" in candidate && "toolName" in candidate && "toolCallId" in candidate && candidate.type === "tool-error" && candidate.error instanceof Error;
}
function processToolCallResults(result) {
  if (typeof result !== "object" || result === null || !("content" in result)) {
    return;
  }
  const resultObj = result;
  if (!Array.isArray(resultObj.content)) {
    return;
  }
  captureToolErrors(resultObj.content);
  cleanupToolCallSpanContexts(resultObj.content);
}
function captureToolErrors(content) {
  for (const item of content) {
    if (!isToolError(item)) {
      continue;
    }
    const spanContext = _INTERNAL_getSpanContextForToolCallId(item.toolCallId);
    if (spanContext) {
      withScope((scope) => {
        scope.setContext("trace", {
          trace_id: spanContext.traceId,
          span_id: spanContext.spanId
        });
        scope.setTag("vercel.ai.tool.name", item.toolName);
        scope.setTag("vercel.ai.tool.callId", item.toolCallId);
        scope.setLevel("error");
        captureException(item.error, {
          mechanism: {
            type: "auto.vercelai.otel",
            handled: false
          }
        });
      });
    } else {
      withScope((scope) => {
        scope.setTag("vercel.ai.tool.name", item.toolName);
        scope.setTag("vercel.ai.tool.callId", item.toolCallId);
        scope.setLevel("error");
        captureException(item.error, {
          mechanism: {
            type: "auto.vercelai.otel",
            handled: false
          }
        });
      });
    }
  }
}
function cleanupToolCallSpanContexts(content) {
  for (const item of content) {
    if (typeof item === "object" && item !== null && "toolCallId" in item && typeof item.toolCallId === "string") {
      _INTERNAL_cleanupToolCallSpanContext(item.toolCallId);
    }
  }
}
function determineRecordingSettings(integrationRecordingOptions, methodTelemetryOptions, telemetryExplicitlyEnabled, defaultInputsEnabled, defaultOutputsEnabled) {
  const recordInputs = integrationRecordingOptions?.recordInputs !== void 0 ? integrationRecordingOptions.recordInputs : methodTelemetryOptions.recordInputs !== void 0 ? methodTelemetryOptions.recordInputs : telemetryExplicitlyEnabled === true ? true : defaultInputsEnabled;
  const recordOutputs = integrationRecordingOptions?.recordOutputs !== void 0 ? integrationRecordingOptions.recordOutputs : methodTelemetryOptions.recordOutputs !== void 0 ? methodTelemetryOptions.recordOutputs : telemetryExplicitlyEnabled === true ? true : defaultOutputsEnabled;
  return { recordInputs, recordOutputs };
}
class SentryVercelAiInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-vercel-ai", SDK_VERSION, config2);
    this._isPatched = false;
    this._callbacks = [];
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition("ai", SUPPORTED_VERSIONS, this._patch.bind(this));
    return module;
  }
  /**
   * Call the provided callback when the module is patched.
   * If it has already been patched, the callback will be called immediately.
   */
  callWhenPatched(callback) {
    if (this._isPatched) {
      callback();
    } else {
      this._callbacks.push(callback);
    }
  }
  /**
   * Patches module exports to enable Vercel AI telemetry.
   */
  _patch(moduleExports) {
    this._isPatched = true;
    this._callbacks.forEach((callback) => callback());
    this._callbacks = [];
    const generatePatch = (originalMethod) => {
      return new Proxy(originalMethod, {
        apply: (target, thisArg, args) => {
          const existingExperimentalTelemetry = args[0].experimental_telemetry || {};
          const isEnabled = existingExperimentalTelemetry.isEnabled;
          const client = getClient();
          const integration = client?.getIntegrationByName(INTEGRATION_NAME$1);
          const integrationOptions = integration?.options;
          const genAI = integration ? client?.getDataCollectionOptions().genAI : void 0;
          const { recordInputs, recordOutputs } = determineRecordingSettings(
            integrationOptions,
            existingExperimentalTelemetry,
            isEnabled,
            Boolean(genAI?.inputs),
            Boolean(genAI?.outputs)
          );
          args[0].experimental_telemetry = {
            ...existingExperimentalTelemetry,
            isEnabled: isEnabled !== void 0 ? isEnabled : true,
            recordInputs,
            recordOutputs
          };
          return handleCallbackErrors(
            () => Reflect.apply(target, thisArg, args),
            (error) => {
              if (error && typeof error === "object") {
                addNonEnumerableProperty(error, "_sentry_active_span", getActiveSpan());
              }
            },
            () => {
            },
            (result) => {
              processToolCallResults(result);
            }
          );
        }
      });
    };
    if (Object.prototype.toString.call(moduleExports) === "[object Module]") {
      for (const method of INSTRUMENTED_METHODS) {
        if (moduleExports[method] != null) {
          moduleExports[method] = generatePatch(moduleExports[method]);
        }
      }
      return moduleExports;
    } else {
      const patchedModuleExports = INSTRUMENTED_METHODS.reduce((acc, curr) => {
        if (moduleExports[curr] != null) {
          acc[curr] = generatePatch(moduleExports[curr]);
        }
        return acc;
      }, {});
      return { ...moduleExports, ...patchedModuleExports };
    }
  }
}
const instrumentVercelAi = generateInstrumentOnce(INTEGRATION_NAME$1, () => new SentryVercelAiInstrumentation({}));
function shouldForceIntegration(client) {
  const modules = client.getIntegrationByName("Modules");
  return !!modules?.getModules?.()?.ai;
}
const _vercelAIIntegration = ((options = {}) => {
  let instrumentation;
  return {
    name: INTEGRATION_NAME$1,
    options,
    setupOnce() {
      instrumentation = instrumentVercelAi();
    },
    afterAllSetup(client) {
      const shouldForce = options.force ?? shouldForceIntegration(client);
      if (shouldForce) {
        addVercelAiProcessors(client);
      } else {
        instrumentation?.callWhenPatched(() => addVercelAiProcessors(client));
      }
    }
  };
});
const vercelAIIntegration = defineIntegration(_vercelAIIntegration);
const supportedVersions$4 = [">=4.0.0 <7"];
class SentryOpenAiInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-openai", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition("openai", supportedVersions$4, this._patch.bind(this));
    return module;
  }
  /**
   * Core patch logic applying instrumentation to the OpenAI and AzureOpenAI client constructors.
   */
  _patch(exports) {
    let result = exports;
    result = this._patchClient(result, "OpenAI");
    result = this._patchClient(result, "AzureOpenAI");
    return result;
  }
  /**
   * Patch logic applying instrumentation to the specified client constructor.
   */
  _patchClient(exports, exportKey) {
    const Original = exports[exportKey];
    if (!Original) {
      return exports;
    }
    const config2 = this.getConfig();
    const WrappedOpenAI = function(...args) {
      if (_INTERNAL_shouldSkipAiProviderWrapping(OPENAI_INTEGRATION_NAME)) {
        return Reflect.construct(Original, args);
      }
      const instance = Reflect.construct(Original, args);
      return instrumentOpenAiClient(instance, config2);
    };
    Object.setPrototypeOf(WrappedOpenAI, Original);
    Object.setPrototypeOf(WrappedOpenAI.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedOpenAI, key, descriptor);
        }
      }
    }
    try {
      exports[exportKey] = WrappedOpenAI;
    } catch {
      Object.defineProperty(exports, exportKey, {
        value: WrappedOpenAI,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    if (exports.default === Original) {
      try {
        exports.default = WrappedOpenAI;
      } catch {
        Object.defineProperty(exports, "default", {
          value: WrappedOpenAI,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    }
    return exports;
  }
}
const instrumentOpenAi = generateInstrumentOnce(
  OPENAI_INTEGRATION_NAME,
  (options) => new SentryOpenAiInstrumentation(options)
);
const _openAiIntegration = ((options = {}) => {
  return {
    name: OPENAI_INTEGRATION_NAME,
    setupOnce() {
      instrumentOpenAi(options);
    }
  };
});
const openAIIntegration = defineIntegration(_openAiIntegration);
const supportedVersions$3 = [">=0.19.2 <1.0.0"];
class SentryAnthropicAiInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-anthropic-ai", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "@anthropic-ai/sdk",
      supportedVersions$3,
      this._patch.bind(this)
    );
    return module;
  }
  /**
   * Core patch logic applying instrumentation to the Anthropic AI client constructor.
   */
  _patch(exports) {
    const Original = exports.Anthropic;
    const config2 = this.getConfig();
    const WrappedAnthropic = function(...args) {
      if (_INTERNAL_shouldSkipAiProviderWrapping(ANTHROPIC_AI_INTEGRATION_NAME)) {
        return Reflect.construct(Original, args);
      }
      const instance = Reflect.construct(Original, args);
      return instrumentAnthropicAiClient(instance, config2);
    };
    Object.setPrototypeOf(WrappedAnthropic, Original);
    Object.setPrototypeOf(WrappedAnthropic.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedAnthropic, key, descriptor);
        }
      }
    }
    try {
      exports.Anthropic = WrappedAnthropic;
    } catch {
      Object.defineProperty(exports, "Anthropic", {
        value: WrappedAnthropic,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
    if (exports.default === Original) {
      try {
        exports.default = WrappedAnthropic;
      } catch {
        Object.defineProperty(exports, "default", {
          value: WrappedAnthropic,
          writable: true,
          configurable: true,
          enumerable: true
        });
      }
    }
    return exports;
  }
}
const instrumentAnthropicAi = generateInstrumentOnce(
  ANTHROPIC_AI_INTEGRATION_NAME,
  (options) => new SentryAnthropicAiInstrumentation(options)
);
const _anthropicAIIntegration = ((options = {}) => {
  return {
    name: ANTHROPIC_AI_INTEGRATION_NAME,
    options,
    setupOnce() {
      instrumentAnthropicAi(options);
    }
  };
});
const anthropicAIIntegration = defineIntegration(_anthropicAIIntegration);
const supportedVersions$2 = [">=0.10.0 <2"];
class SentryGoogleGenAiInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-google-genai", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    const module = new InstrumentationNodeModuleDefinition(
      "@google/genai",
      supportedVersions$2,
      (exports) => this._patch(exports),
      (exports) => exports,
      // In CJS, @google/genai re-exports from (dist/node/index.cjs) file.
      // Patching only the root module sometimes misses the real implementation or
      // gets overwritten when that file is loaded. We add a file-level patch so that
      // _patch runs again on the concrete implementation
      [
        new InstrumentationNodeModuleFile(
          "@google/genai/dist/node/index.cjs",
          supportedVersions$2,
          (exports) => this._patch(exports),
          (exports) => exports
        )
      ]
    );
    return module;
  }
  /**
   * Core patch logic applying instrumentation to the Google GenAI client constructor.
   */
  _patch(exports) {
    const Original = exports.GoogleGenAI;
    const config2 = this.getConfig();
    if (typeof Original !== "function") {
      return exports;
    }
    const WrappedGoogleGenAI = function(...args) {
      if (_INTERNAL_shouldSkipAiProviderWrapping(GOOGLE_GENAI_INTEGRATION_NAME)) {
        return Reflect.construct(Original, args);
      }
      const instance = Reflect.construct(Original, args);
      return instrumentGoogleGenAIClient(instance, config2);
    };
    Object.setPrototypeOf(WrappedGoogleGenAI, Original);
    Object.setPrototypeOf(WrappedGoogleGenAI.prototype, Original.prototype);
    for (const key of Object.getOwnPropertyNames(Original)) {
      if (!["length", "name", "prototype"].includes(key)) {
        const descriptor = Object.getOwnPropertyDescriptor(Original, key);
        if (descriptor) {
          Object.defineProperty(WrappedGoogleGenAI, key, descriptor);
        }
      }
    }
    replaceExports(exports, "GoogleGenAI", WrappedGoogleGenAI);
    return exports;
  }
}
const instrumentGoogleGenAI = generateInstrumentOnce(
  GOOGLE_GENAI_INTEGRATION_NAME,
  (options) => new SentryGoogleGenAiInstrumentation(options)
);
const _googleGenAIIntegration = ((options = {}) => {
  return {
    name: GOOGLE_GENAI_INTEGRATION_NAME,
    setupOnce() {
      instrumentGoogleGenAI(options);
    }
  };
});
const googleGenAIIntegration = defineIntegration(_googleGenAIIntegration);
const supportedVersions$1 = [">=0.1.0 <2.0.0"];
function wrapRunnableMethod(originalMethod, sentryHandler, _methodName) {
  return new Proxy(originalMethod, {
    apply(target, thisArg, args) {
      const optionsIndex = 1;
      let options = args[optionsIndex];
      if (!options || typeof options !== "object" || Array.isArray(options)) {
        options = {};
        args[optionsIndex] = options;
      }
      options.callbacks = _INTERNAL_mergeLangChainCallbackHandler(options.callbacks, sentryHandler);
      return Reflect.apply(target, thisArg, args);
    }
  });
}
class SentryLangChainInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-langchain", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   * We patch the BaseChatModel class methods to inject callbacks
   *
   * We hook into provider packages (@langchain/anthropic, @langchain/openai, etc.)
   * because @langchain/core is often bundled and not loaded as a separate module
   */
  init() {
    const modules = [];
    const providerPackages = [
      "@langchain/anthropic",
      "@langchain/openai",
      "@langchain/google-genai",
      "@langchain/mistralai",
      "@langchain/google-vertexai",
      "@langchain/groq"
    ];
    for (const packageName of providerPackages) {
      modules.push(
        new InstrumentationNodeModuleDefinition(
          packageName,
          supportedVersions$1,
          this._patch.bind(this),
          (exports) => exports,
          [
            new InstrumentationNodeModuleFile(
              `${packageName}/dist/index.cjs`,
              supportedVersions$1,
              this._patch.bind(this),
              (exports) => exports
            )
          ]
        )
      );
    }
    modules.push(
      new InstrumentationNodeModuleDefinition(
        "langchain",
        supportedVersions$1,
        this._patch.bind(this),
        (exports) => exports,
        [
          // To catch the CJS build that contains ConfigurableModel / initChatModel for v1
          new InstrumentationNodeModuleFile(
            "langchain/dist/chat_models/universal.cjs",
            supportedVersions$1,
            this._patch.bind(this),
            (exports) => exports
          )
        ]
      )
    );
    return modules;
  }
  /**
   * Core patch logic - patches chat model and embedding methods
   * This is called when a LangChain provider package is loaded
   */
  _patch(exports) {
    _INTERNAL_skipAiProviderWrapping([
      OPENAI_INTEGRATION_NAME,
      ANTHROPIC_AI_INTEGRATION_NAME,
      GOOGLE_GENAI_INTEGRATION_NAME
    ]);
    const config2 = this.getConfig();
    const sentryHandler = createLangChainCallbackHandler(config2);
    this._patchRunnableMethods(exports, sentryHandler);
    this._patchEmbeddingsMethods(exports, config2);
    return exports;
  }
  /**
   * Patches chat model methods (invoke, stream, batch) to inject Sentry callbacks
   * Finds a chat model class from the provider package exports and patches its prototype methods
   */
  _patchRunnableMethods(exports, sentryHandler) {
    const knownChatModelNames = [
      "ChatAnthropic",
      "ChatOpenAI",
      "ChatGoogleGenerativeAI",
      "ChatMistralAI",
      "ChatVertexAI",
      "ChatGroq",
      "ConfigurableModel"
    ];
    const exportsToPatch = exports.universal_exports ?? exports;
    const chatModelClass = Object.values(exportsToPatch).find((exp) => {
      return typeof exp === "function" && knownChatModelNames.includes(exp.name);
    });
    if (!chatModelClass) {
      return;
    }
    const targetProto = chatModelClass.prototype;
    if (targetProto.__sentry_patched__) {
      return;
    }
    targetProto.__sentry_patched__ = true;
    const methodsToPatch = ["invoke", "stream", "batch"];
    for (const methodName of methodsToPatch) {
      const method = targetProto[methodName];
      if (typeof method === "function") {
        targetProto[methodName] = wrapRunnableMethod(
          method,
          sentryHandler
        );
      }
    }
  }
  /**
   * Patches embedding class methods (embedQuery, embedDocuments) to create Sentry spans.
   *
   * Unlike chat models which use LangChain's callback system, the Embeddings base class
   * has no callback support. We wrap the methods directly on the prototype.
   *
   * Instruments any exported class whose prototype has both embedQuery and embedDocuments as functions.
   */
  _patchEmbeddingsMethods(exports, options) {
    const exportsToPatch = exports.universal_exports ?? exports;
    for (const exp of Object.values(exportsToPatch)) {
      if (typeof exp !== "function" || !exp.prototype) {
        continue;
      }
      const proto = exp.prototype;
      if (typeof proto.embedQuery !== "function" || typeof proto.embedDocuments !== "function") {
        continue;
      }
      if (proto.__sentry_patched__) {
        continue;
      }
      proto.__sentry_patched__ = true;
      instrumentLangChainEmbeddings(proto, options);
    }
  }
}
const instrumentLangChain = generateInstrumentOnce(
  LANGCHAIN_INTEGRATION_NAME,
  (options) => new SentryLangChainInstrumentation(options)
);
const _langChainIntegration = ((options = {}) => {
  return {
    name: LANGCHAIN_INTEGRATION_NAME,
    setupOnce() {
      instrumentLangChain(options);
    }
  };
});
const langChainIntegration = defineIntegration(_langChainIntegration);
const supportedVersions = [">=0.0.0 <2.0.0"];
class SentryLangGraphInstrumentation extends InstrumentationBase {
  constructor(config2 = {}) {
    super("@sentry/instrumentation-langgraph", SDK_VERSION, config2);
  }
  /**
   * Initializes the instrumentation by defining the modules to be patched.
   */
  init() {
    return [
      new InstrumentationNodeModuleDefinition(
        "@langchain/langgraph",
        supportedVersions,
        this._patch.bind(this),
        (exports) => exports,
        [
          new InstrumentationNodeModuleFile(
            /**
             * In CJS, LangGraph packages re-export from dist/index.cjs files.
             * Patching only the root module sometimes misses the real implementation or
             * gets overwritten when that file is loaded. We add a file-level patch so that
             * _patch runs again on the concrete implementation
             */
            "@langchain/langgraph/dist/index.cjs",
            supportedVersions,
            this._patch.bind(this),
            (exports) => exports
          ),
          new InstrumentationNodeModuleFile(
            /**
             * In CJS, the prebuilt submodule re-exports from dist/prebuilt/index.cjs.
             * We add a file-level patch under the main module so that CJS require()
             * of @langchain/langgraph/prebuilt gets patched.
             */
            "@langchain/langgraph/dist/prebuilt/index.cjs",
            supportedVersions,
            this._patch.bind(this),
            (exports) => exports
          )
        ]
      ),
      new InstrumentationNodeModuleDefinition(
        "@langchain/langgraph/prebuilt",
        supportedVersions,
        this._patch.bind(this),
        (exports) => exports,
        [
          new InstrumentationNodeModuleFile(
            /**
             * In CJS, the prebuilt submodule re-exports from dist/prebuilt/index.cjs.
             * We add file-level patches so _patch runs on the concrete implementation.
             */
            "@langchain/langgraph/dist/prebuilt/index.cjs",
            supportedVersions,
            this._patch.bind(this),
            (exports) => exports
          )
        ]
      )
    ];
  }
  /**
   * Core patch logic applying instrumentation to the LangGraph module.
   */
  _patch(exports) {
    const client = getClient();
    const genAI = client?.getDataCollectionOptions().genAI;
    const options = {
      ...this.getConfig(),
      recordInputs: this.getConfig().recordInputs ?? genAI?.inputs ?? false,
      recordOutputs: this.getConfig().recordOutputs ?? genAI?.outputs ?? false
    };
    if (exports.StateGraph && typeof exports.StateGraph === "function") {
      instrumentLangGraph$1(exports.StateGraph.prototype, options);
    }
    if (exports.createReactAgent && typeof exports.createReactAgent === "function") {
      const originalCreateReactAgent = exports.createReactAgent;
      Object.defineProperty(exports, "createReactAgent", {
        value: instrumentCreateReactAgent(originalCreateReactAgent, options),
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
    return exports;
  }
}
const instrumentLangGraph = generateInstrumentOnce(
  LANGGRAPH_INTEGRATION_NAME,
  (options) => new SentryLangGraphInstrumentation(options)
);
const _langGraphIntegration = ((options = {}) => {
  return {
    name: LANGGRAPH_INTEGRATION_NAME,
    setupOnce() {
      instrumentLangGraph(options);
    }
  };
});
const langGraphIntegration = defineIntegration(_langGraphIntegration);
function patchFirestore(tracer, firestoreSupportedVersions2, wrap, unwrap, config2) {
  const defaultFirestoreSpanCreationHook = () => {
  };
  let firestoreSpanCreationHook = defaultFirestoreSpanCreationHook;
  const configFirestoreSpanCreationHook = config2.firestoreSpanCreationHook;
  if (typeof configFirestoreSpanCreationHook === "function") {
    firestoreSpanCreationHook = (span) => {
      safeExecuteInTheMiddle(
        () => configFirestoreSpanCreationHook(span),
        (error) => {
          if (!error) {
            return;
          }
          srcExports$1.diag.error(error?.message);
        },
        true
      );
    };
  }
  const moduleFirestoreCJS = new InstrumentationNodeModuleDefinition(
    "@firebase/firestore",
    firestoreSupportedVersions2,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (moduleExports) => wrapMethods(moduleExports, wrap, unwrap, tracer, firestoreSpanCreationHook)
  );
  const files = [
    "@firebase/firestore/dist/lite/index.node.cjs.js",
    "@firebase/firestore/dist/lite/index.node.mjs.js",
    "@firebase/firestore/dist/lite/index.rn.esm2017.js",
    "@firebase/firestore/dist/lite/index.cjs.js"
  ];
  for (const file of files) {
    moduleFirestoreCJS.files.push(
      new InstrumentationNodeModuleFile(
        file,
        firestoreSupportedVersions2,
        (moduleExports) => wrapMethods(moduleExports, wrap, unwrap, tracer, firestoreSpanCreationHook),
        (moduleExports) => unwrapMethods(moduleExports, unwrap)
      )
    );
  }
  return moduleFirestoreCJS;
}
function wrapMethods(moduleExports, wrap, unwrap, tracer, firestoreSpanCreationHook) {
  unwrapMethods(moduleExports, unwrap);
  wrap(moduleExports, "addDoc", patchAddDoc(tracer, firestoreSpanCreationHook));
  wrap(moduleExports, "getDocs", patchGetDocs(tracer, firestoreSpanCreationHook));
  wrap(moduleExports, "setDoc", patchSetDoc(tracer, firestoreSpanCreationHook));
  wrap(moduleExports, "deleteDoc", patchDeleteDoc(tracer, firestoreSpanCreationHook));
  return moduleExports;
}
function unwrapMethods(moduleExports, unwrap) {
  for (const method of ["addDoc", "getDocs", "setDoc", "deleteDoc"]) {
    if (isWrapped(moduleExports[method])) {
      unwrap(moduleExports, method);
    }
  }
  return moduleExports;
}
function patchAddDoc(tracer, firestoreSpanCreationHook) {
  return function addDoc(original) {
    return function(reference, data) {
      const span = startDBSpan(tracer, "addDoc", reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return original(reference, data);
      });
    };
  };
}
function patchDeleteDoc(tracer, firestoreSpanCreationHook) {
  return function deleteDoc(original) {
    return function(reference) {
      const span = startDBSpan(tracer, "deleteDoc", reference.parent || reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return original(reference);
      });
    };
  };
}
function patchGetDocs(tracer, firestoreSpanCreationHook) {
  return function getDocs(original) {
    return function(reference) {
      const span = startDBSpan(tracer, "getDocs", reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return original(reference);
      });
    };
  };
}
function patchSetDoc(tracer, firestoreSpanCreationHook) {
  return function setDoc(original) {
    return function(reference, data, options) {
      const span = startDBSpan(tracer, "setDoc", reference.parent || reference);
      firestoreSpanCreationHook(span);
      return executeContextWithSpan(span, () => {
        return typeof options !== "undefined" ? original(reference, data, options) : original(reference, data);
      });
    };
  };
}
function executeContextWithSpan(span, callback) {
  return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), () => {
    return safeExecuteInTheMiddle(
      () => {
        return callback();
      },
      (err) => {
        if (err) {
          span.recordException(err);
        }
        span.end();
      },
      true
    );
  });
}
function startDBSpan(tracer, spanName, reference) {
  const span = tracer.startSpan(`${spanName} ${reference.path}`, { kind: srcExports$1.SpanKind.CLIENT });
  addAttributes(span, reference);
  span.setAttribute(srcExports.ATTR_DB_OPERATION_NAME, spanName);
  return span;
}
function getPortAndAddress(settings) {
  let address;
  let port;
  if (typeof settings.host === "string") {
    if (settings.host.startsWith("[")) {
      if (settings.host.endsWith("]")) {
        address = settings.host.replace(/^\[|\]$/g, "");
      } else if (settings.host.includes("]:")) {
        const lastColonIndex = settings.host.lastIndexOf(":");
        if (lastColonIndex !== -1) {
          address = settings.host.slice(1, lastColonIndex).replace(/^\[|\]$/g, "");
          port = settings.host.slice(lastColonIndex + 1);
        }
      }
    } else {
      if (net.isIPv6(settings.host)) {
        address = settings.host;
      } else {
        const lastColonIndex = settings.host.lastIndexOf(":");
        if (lastColonIndex !== -1) {
          address = settings.host.slice(0, lastColonIndex);
          port = settings.host.slice(lastColonIndex + 1);
        } else {
          address = settings.host;
        }
      }
    }
  }
  return {
    address,
    port: port ? parseInt(port, 10) : void 0
  };
}
function addAttributes(span, reference) {
  const firestoreApp = reference.firestore.app;
  const firestoreOptions = firestoreApp.options;
  const json = reference.firestore.toJSON() || {};
  const settings = json.settings || {};
  const attributes = {
    [srcExports.ATTR_DB_COLLECTION_NAME]: reference.path,
    [srcExports.ATTR_DB_NAMESPACE]: firestoreApp.name,
    [srcExports.ATTR_DB_SYSTEM_NAME]: "firebase.firestore",
    "firebase.firestore.type": reference.type,
    "firebase.firestore.options.projectId": firestoreOptions.projectId,
    "firebase.firestore.options.appId": firestoreOptions.appId,
    "firebase.firestore.options.messagingSenderId": firestoreOptions.messagingSenderId,
    "firebase.firestore.options.storageBucket": firestoreOptions.storageBucket
  };
  const { address, port } = getPortAndAddress(settings);
  if (address) {
    attributes[srcExports.ATTR_SERVER_ADDRESS] = address;
  }
  if (port) {
    attributes[srcExports.ATTR_SERVER_PORT] = port;
  }
  span.setAttributes(attributes);
}
function patchFunctions(tracer, functionsSupportedVersions2, wrap, unwrap, config2) {
  let requestHook = () => {
  };
  let responseHook = () => {
  };
  const errorHook = config2.functions?.errorHook;
  const configRequestHook = config2.functions?.requestHook;
  const configResponseHook = config2.functions?.responseHook;
  if (typeof configResponseHook === "function") {
    responseHook = (span, err) => {
      safeExecuteInTheMiddle(
        () => configResponseHook(span, err),
        (error) => {
          if (!error) {
            return;
          }
          srcExports$1.diag.error(error?.message);
        },
        true
      );
    };
  }
  if (typeof configRequestHook === "function") {
    requestHook = (span) => {
      safeExecuteInTheMiddle(
        () => configRequestHook(span),
        (error) => {
          if (!error) {
            return;
          }
          srcExports$1.diag.error(error?.message);
        },
        true
      );
    };
  }
  const moduleFunctionsCJS = new InstrumentationNodeModuleDefinition("firebase-functions", functionsSupportedVersions2);
  const modulesToInstrument = [
    { name: "firebase-functions/lib/v2/providers/https.js", triggerType: "function" },
    { name: "firebase-functions/lib/v2/providers/firestore.js", triggerType: "firestore" },
    { name: "firebase-functions/lib/v2/providers/scheduler.js", triggerType: "scheduler" },
    { name: "firebase-functions/lib/v2/storage.js", triggerType: "storage" }
  ];
  modulesToInstrument.forEach(({ name, triggerType }) => {
    moduleFunctionsCJS.files.push(
      new InstrumentationNodeModuleFile(
        name,
        functionsSupportedVersions2,
        (moduleExports) => wrapCommonFunctions(
          moduleExports,
          wrap,
          unwrap,
          tracer,
          { requestHook, responseHook, errorHook },
          triggerType
        ),
        (moduleExports) => unwrapCommonFunctions(moduleExports, unwrap)
      )
    );
  });
  return moduleFunctionsCJS;
}
function patchV2Functions(tracer, functionsConfig, triggerType) {
  return function v2FunctionsWrapper(original) {
    return function(...args) {
      const handler = typeof args[0] === "function" ? args[0] : args[1];
      const documentOrOptions = typeof args[0] === "function" ? void 0 : args[0];
      if (!handler) {
        return original.call(this, ...args);
      }
      const wrappedHandler = async function(...handlerArgs) {
        const functionName = process.env.FUNCTION_TARGET || process.env.K_SERVICE || "unknown";
        const span = tracer.startSpan(`firebase.function.${triggerType}`, {
          kind: srcExports$1.SpanKind.SERVER
        });
        const attributes = {
          "faas.name": functionName,
          "faas.trigger": triggerType,
          "faas.provider": "firebase"
        };
        if (process.env.GCLOUD_PROJECT) {
          attributes["cloud.project_id"] = process.env.GCLOUD_PROJECT;
        }
        if (process.env.EVENTARC_CLOUD_EVENT_SOURCE) {
          attributes["cloud.event_source"] = process.env.EVENTARC_CLOUD_EVENT_SOURCE;
        }
        span.setAttributes(attributes);
        functionsConfig?.requestHook?.(span);
        return srcExports$1.context.with(srcExports$1.trace.setSpan(srcExports$1.context.active(), span), async () => {
          let error;
          let result;
          try {
            result = await handler.apply(this, handlerArgs);
          } catch (e) {
            error = e;
          }
          functionsConfig?.responseHook?.(span, error);
          if (error) {
            span.recordException(error);
          }
          span.end();
          if (error) {
            await functionsConfig?.errorHook?.(span, error);
            throw error;
          }
          return result;
        });
      };
      if (documentOrOptions) {
        return original.call(this, documentOrOptions, wrappedHandler);
      } else {
        return original.call(this, wrappedHandler);
      }
    };
  };
}
function wrapCommonFunctions(moduleExports, wrap, unwrap, tracer, functionsConfig, triggerType) {
  unwrapCommonFunctions(moduleExports, unwrap);
  switch (triggerType) {
    case "function":
      wrap(moduleExports, "onRequest", patchV2Functions(tracer, functionsConfig, "http.request"));
      wrap(moduleExports, "onCall", patchV2Functions(tracer, functionsConfig, "http.call"));
      break;
    case "firestore":
      wrap(moduleExports, "onDocumentCreated", patchV2Functions(tracer, functionsConfig, "firestore.document.created"));
      wrap(moduleExports, "onDocumentUpdated", patchV2Functions(tracer, functionsConfig, "firestore.document.updated"));
      wrap(moduleExports, "onDocumentDeleted", patchV2Functions(tracer, functionsConfig, "firestore.document.deleted"));
      wrap(moduleExports, "onDocumentWritten", patchV2Functions(tracer, functionsConfig, "firestore.document.written"));
      wrap(
        moduleExports,
        "onDocumentCreatedWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.created")
      );
      wrap(
        moduleExports,
        "onDocumentUpdatedWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.updated")
      );
      wrap(
        moduleExports,
        "onDocumentDeletedWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.deleted")
      );
      wrap(
        moduleExports,
        "onDocumentWrittenWithAuthContext",
        patchV2Functions(tracer, functionsConfig, "firestore.document.written")
      );
      break;
    case "scheduler":
      wrap(moduleExports, "onSchedule", patchV2Functions(tracer, functionsConfig, "scheduler.scheduled"));
      break;
    case "storage":
      wrap(moduleExports, "onObjectFinalized", patchV2Functions(tracer, functionsConfig, "storage.object.finalized"));
      wrap(moduleExports, "onObjectArchived", patchV2Functions(tracer, functionsConfig, "storage.object.archived"));
      wrap(moduleExports, "onObjectDeleted", patchV2Functions(tracer, functionsConfig, "storage.object.deleted"));
      wrap(
        moduleExports,
        "onObjectMetadataUpdated",
        patchV2Functions(tracer, functionsConfig, "storage.object.metadataUpdated")
      );
      break;
  }
  return moduleExports;
}
function unwrapCommonFunctions(moduleExports, unwrap) {
  const methods = [
    "onSchedule",
    "onRequest",
    "onCall",
    "onObjectFinalized",
    "onObjectArchived",
    "onObjectDeleted",
    "onObjectMetadataUpdated",
    "onDocumentCreated",
    "onDocumentUpdated",
    "onDocumentDeleted",
    "onDocumentWritten",
    "onDocumentCreatedWithAuthContext",
    "onDocumentUpdatedWithAuthContext",
    "onDocumentDeletedWithAuthContext",
    "onDocumentWrittenWithAuthContext"
  ];
  for (const method of methods) {
    if (isWrapped(moduleExports[method])) {
      unwrap(moduleExports, method);
    }
  }
  return moduleExports;
}
const DefaultFirebaseInstrumentationConfig = {};
const firestoreSupportedVersions = [">=3.0.0 <5"];
const functionsSupportedVersions = [">=6.0.0 <7"];
class FirebaseInstrumentation extends InstrumentationBase {
  constructor(config2 = DefaultFirebaseInstrumentationConfig) {
    super("@sentry/instrumentation-firebase", SDK_VERSION, config2);
  }
  /**
   * sets config
   * @param config
   */
  setConfig(config2 = {}) {
    super.setConfig({ ...DefaultFirebaseInstrumentationConfig, ...config2 });
  }
  /**
   *
   * @protected
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  init() {
    const modules = [];
    modules.push(patchFirestore(this.tracer, firestoreSupportedVersions, this._wrap, this._unwrap, this.getConfig()));
    modules.push(patchFunctions(this.tracer, functionsSupportedVersions, this._wrap, this._unwrap, this.getConfig()));
    return modules;
  }
}
const INTEGRATION_NAME = "Firebase";
const config = {
  firestoreSpanCreationHook: (span) => {
    addOriginToSpan(span, "auto.firebase.otel.firestore");
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "db.query");
  },
  functions: {
    requestHook: (span) => {
      addOriginToSpan(span, "auto.firebase.otel.functions");
      span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "http.request");
    },
    errorHook: async (_, error) => {
      if (error) {
        captureException(error, {
          mechanism: {
            type: "auto.firebase.otel.functions",
            handled: false
          }
        });
        await flush(2e3);
      }
    }
  }
};
const instrumentFirebase = generateInstrumentOnce(INTEGRATION_NAME, () => new FirebaseInstrumentation(config));
const _firebaseIntegration = (() => {
  return {
    name: INTEGRATION_NAME,
    setupOnce() {
      instrumentFirebase();
    }
  };
});
const firebaseIntegration = defineIntegration(_firebaseIntegration);
function getAutoPerformanceIntegrations() {
  return [
    expressIntegration(),
    fastifyIntegration(),
    graphqlIntegration(),
    honoIntegration(),
    mongoIntegration(),
    mongooseIntegration(),
    mysqlIntegration(),
    mysql2Integration(),
    redisIntegration(),
    postgresIntegration(),
    prismaIntegration(),
    hapiIntegration(),
    koaIntegration(),
    connectIntegration(),
    tediousIntegration(),
    genericPoolIntegration(),
    kafkaIntegration(),
    amqplibIntegration(),
    lruMemoizerIntegration(),
    // AI providers
    // LangChain must come first to disable AI provider integrations before they instrument
    langChainIntegration(),
    langGraphIntegration(),
    vercelAIIntegration(),
    openAIIntegration(),
    anthropicAIIntegration(),
    googleGenAIIntegration(),
    postgresJsIntegration(),
    firebaseIntegration()
  ];
}
const MAX_MAX_SPAN_WAIT_DURATION = 1e6;
function initOpenTelemetry(client, options = {}) {
  if (client.getOptions().debug) {
    setupOpenTelemetryLogger();
  }
  const [provider, asyncLocalStorageLookup] = setupOtel(client, options);
  client.traceProvider = provider;
  client.asyncLocalStorageLookup = asyncLocalStorageLookup;
}
function setupOtel(client, options = {}) {
  const provider = new BasicTracerProvider({
    sampler: new SentrySampler(client),
    resource: getSentryResource("node"),
    forceFlushTimeoutMillis: 500,
    spanProcessors: [
      new SentrySpanProcessor({
        timeout: _clampSpanProcessorTimeout(client.getOptions().maxSpanWaitDuration)
      }),
      ...options.spanProcessors || []
    ]
  });
  srcExports$1.trace.setGlobalTracerProvider(provider);
  srcExports$1.propagation.setGlobalPropagator(new SentryPropagator());
  const ctxManager = new SentryContextManager();
  srcExports$1.context.setGlobalContextManager(ctxManager);
  return [provider, ctxManager.getAsyncLocalStorageLookup()];
}
function _clampSpanProcessorTimeout(maxSpanWaitDuration) {
  if (maxSpanWaitDuration == null) {
    return void 0;
  }
  if (maxSpanWaitDuration > MAX_MAX_SPAN_WAIT_DURATION) {
    DEBUG_BUILD && debug.warn(`\`maxSpanWaitDuration\` is too high, using the maximum value of ${MAX_MAX_SPAN_WAIT_DURATION}`);
    return MAX_MAX_SPAN_WAIT_DURATION;
  } else if (maxSpanWaitDuration <= 0 || Number.isNaN(maxSpanWaitDuration)) {
    DEBUG_BUILD && debug.warn("`maxSpanWaitDuration` must be a positive number, using default value instead.");
    return void 0;
  }
  return maxSpanWaitDuration;
}
function getDefaultIntegrationsWithoutPerformance() {
  const nodeCoreIntegrations = getDefaultIntegrations$1();
  return nodeCoreIntegrations.filter((integration) => integration.name !== "Http" && integration.name !== "NodeFetch").concat(httpIntegration(), nativeNodeFetchIntegration());
}
function getDefaultIntegrations(options) {
  return [
    ...getDefaultIntegrationsWithoutPerformance(),
    // We only add performance integrations if tracing is enabled
    // Note that this means that without tracing enabled, e.g. `expressIntegration()` will not be added
    // This means that generally request isolation will work (because that is done by httpIntegration)
    // But `transactionName` will not be set automatically
    ...hasSpansEnabled(options) ? getAutoPerformanceIntegrations() : []
  ];
}
function init(options = {}) {
  return _init(options, getDefaultIntegrations);
}
function _init(options = {}, getDefaultIntegrationsImpl) {
  applySdkMetadata(options, "node");
  const client = init$1({
    ...options,
    // Only use Node SDK defaults if none provided
    defaultIntegrations: options.defaultIntegrations ?? getDefaultIntegrationsImpl(options)
  });
  if (client && !options.skipOpenTelemetrySetup) {
    initOpenTelemetry(client, {
      spanProcessors: options.openTelemetrySpanProcessors
    });
    validateOpenTelemetrySetup();
  }
  return client;
}
export {
  init as i
};
