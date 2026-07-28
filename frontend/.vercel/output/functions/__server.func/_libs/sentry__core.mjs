const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;
const GLOBAL_OBJ = globalThis;
const SDK_VERSION = "10.58.0";
function getMainCarrier() {
  getSentryCarrier(GLOBAL_OBJ);
  return GLOBAL_OBJ;
}
function getSentryCarrier(carrier) {
  const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
  __SENTRY__.version = __SENTRY__.version || SDK_VERSION;
  return __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
}
function getGlobalSingleton(name, creator, obj = GLOBAL_OBJ) {
  const __SENTRY__ = obj.__SENTRY__ = obj.__SENTRY__ || {};
  const carrier = __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
  return carrier[name] || (carrier[name] = creator());
}
const CONSOLE_LEVELS = [
  "debug",
  "info",
  "warn",
  "error",
  "log",
  "assert",
  "trace"
];
const PREFIX = "Sentry Logger ";
const originalConsoleMethods = {};
function consoleSandbox(callback) {
  if (!("console" in GLOBAL_OBJ)) {
    return callback();
  }
  const console2 = GLOBAL_OBJ.console;
  const wrappedFuncs = {};
  const wrappedLevels = Object.keys(originalConsoleMethods);
  wrappedLevels.forEach((level) => {
    const originalConsoleMethod = originalConsoleMethods[level];
    wrappedFuncs[level] = console2[level];
    console2[level] = originalConsoleMethod;
  });
  try {
    return callback();
  } finally {
    wrappedLevels.forEach((level) => {
      console2[level] = wrappedFuncs[level];
    });
  }
}
function enable() {
  _getLoggerSettings().enabled = true;
}
function disable() {
  _getLoggerSettings().enabled = false;
}
function isEnabled$1() {
  return _getLoggerSettings().enabled;
}
function log(...args) {
  _maybeLog("log", ...args);
}
function warn$1(...args) {
  _maybeLog("warn", ...args);
}
function error(...args) {
  _maybeLog("error", ...args);
}
function _maybeLog(level, ...args) {
  if (!DEBUG_BUILD) {
    return;
  }
  if (isEnabled$1()) {
    consoleSandbox(() => {
      GLOBAL_OBJ.console[level](`${PREFIX}[${level}]:`, ...args);
    });
  }
}
function _getLoggerSettings() {
  if (!DEBUG_BUILD) {
    return { enabled: false };
  }
  return getGlobalSingleton("loggerSettings", () => ({ enabled: false }));
}
const debug = {
  /** Enable logging. */
  enable,
  /** Disable logging. */
  disable,
  /** Check if logging is enabled. */
  isEnabled: isEnabled$1,
  /** Log a message. */
  log,
  /** Log a warning. */
  warn: warn$1,
  /** Log an error. */
  error
};
const STACKTRACE_FRAME_LIMIT = 50;
const UNKNOWN_FUNCTION = "?";
const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
const STRIP_FRAME_REGEXP = /captureMessage|captureException/;
function createStackParser(...parsers) {
  const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  return (stack, skipFirstLines = 0, framesToPop = 0) => {
    const frames = [];
    const lines = stack.split("\n");
    for (let i = skipFirstLines; i < lines.length; i++) {
      let line = lines[i];
      if (line.length > 1024) {
        line = line.slice(0, 1024);
      }
      const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, "$1") : line;
      if (cleanedLine.includes("Error: ")) {
        continue;
      }
      for (const parser of sortedParsers) {
        const frame = parser(cleanedLine);
        if (frame) {
          frames.push(frame);
          break;
        }
      }
      if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) {
        break;
      }
    }
    return stripSentryFramesAndReverse(frames.slice(framesToPop));
  };
}
function stackParserFromStackParserOptions(stackParser) {
  if (Array.isArray(stackParser)) {
    return createStackParser(...stackParser);
  }
  return stackParser;
}
function stripSentryFramesAndReverse(stack) {
  if (!stack.length) {
    return [];
  }
  const localStack = Array.from(stack);
  if (/sentryWrapped/.test(getLastStackFrame(localStack).function || "")) {
    localStack.pop();
  }
  localStack.reverse();
  if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) {
    localStack.pop();
    if (STRIP_FRAME_REGEXP.test(getLastStackFrame(localStack).function || "")) {
      localStack.pop();
    }
  }
  return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame) => ({
    ...frame,
    filename: frame.filename || getLastStackFrame(localStack).filename,
    function: frame.function || UNKNOWN_FUNCTION
  }));
}
function getLastStackFrame(arr) {
  return arr[arr.length - 1] || {};
}
const defaultFunctionName = "<anonymous>";
function getFunctionName(fn) {
  try {
    if (!fn || typeof fn !== "function") {
      return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
  } catch {
    return defaultFunctionName;
  }
}
function normalizeStackTracePath(path) {
  let filename = path?.startsWith("file://") ? path.slice(7) : path;
  if (filename?.match(/\/[A-Z]:/)) {
    filename = filename.slice(1);
  }
  return filename;
}
const handlers = {};
const instrumented = {};
function addHandler(type, handler) {
  handlers[type] = handlers[type] || [];
  handlers[type].push(handler);
  return () => {
    const typeHandlers = handlers[type];
    if (typeHandlers) {
      const index = typeHandlers.indexOf(handler);
      if (index !== -1) {
        typeHandlers.splice(index, 1);
      }
    }
  };
}
function maybeInstrument(type, instrumentFn) {
  if (!instrumented[type]) {
    instrumented[type] = true;
    try {
      instrumentFn();
    } catch (e) {
      DEBUG_BUILD && debug.error(`Error while instrumenting ${type}`, e);
    }
  }
}
function triggerHandlers(type, data) {
  const typeHandlers = handlers[type];
  if (!typeHandlers) {
    return;
  }
  for (const handler of typeHandlers) {
    try {
      handler(data);
    } catch (e) {
      DEBUG_BUILD && debug.error(
        `Error while triggering instrumentation handler.
Type: ${type}
Name: ${getFunctionName(handler)}
Error:`,
        e
      );
    }
  }
}
const objectToString = Object.prototype.toString;
function isError(wat) {
  switch (objectToString.call(wat)) {
    case "[object Error]":
    case "[object Exception]":
    case "[object DOMException]":
    case "[object WebAssembly.Exception]":
      return true;
    default:
      return isInstanceOf(wat, Error);
  }
}
function isBuiltin(wat, className) {
  return objectToString.call(wat) === `[object ${className}]`;
}
function isErrorEvent$2(wat) {
  return isBuiltin(wat, "ErrorEvent");
}
function isString(wat) {
  return isBuiltin(wat, "String");
}
function isParameterizedString(wat) {
  return typeof wat === "object" && wat !== null && "__sentry_template_string__" in wat && "__sentry_template_values__" in wat;
}
function isPrimitive(wat) {
  return wat === null || isParameterizedString(wat) || typeof wat !== "object" && typeof wat !== "function";
}
function isPlainObject(wat) {
  return isBuiltin(wat, "Object");
}
function isEvent(wat) {
  return typeof Event !== "undefined" && isInstanceOf(wat, Event);
}
function isRegExp(wat) {
  return isBuiltin(wat, "RegExp");
}
function isThenable(wat) {
  return Boolean(wat?.then && typeof wat.then === "function");
}
function isInstanceOf(wat, base) {
  try {
    return wat instanceof base;
  } catch {
    return false;
  }
}
function fill(source, name, replacementFactory) {
  if (!(name in source)) {
    return;
  }
  const original = source[name];
  if (typeof original !== "function") {
    return;
  }
  const wrapped = replacementFactory(original);
  if (typeof wrapped === "function") {
    markFunctionWrapped(wrapped, original);
  }
  try {
    source[name] = wrapped;
  } catch {
    DEBUG_BUILD && debug.log(`Failed to replace method "${name}" in object`, source);
  }
}
function addNonEnumerableProperty(obj, name, value) {
  try {
    Object.defineProperty(obj, name, {
      // enumerable: false, // the default, so we can save on bundle size by not explicitly setting it
      value,
      writable: true,
      configurable: true
    });
  } catch {
    DEBUG_BUILD && debug.log(`Failed to add non-enumerable property "${String(name)}" to object`, obj);
  }
}
function markFunctionWrapped(wrapped, original) {
  try {
    const proto = original.prototype || {};
    wrapped.prototype = original.prototype = proto;
    addNonEnumerableProperty(wrapped, "__sentry_original__", original);
  } catch {
  }
}
function wrapMethod(obj, field, wrapped, enumerable = true) {
  const original = obj[field];
  if (typeof original !== "function") {
    throw new Error(`Cannot wrap method: ${field} is not a function`);
  }
  if (getOriginalFunction(original)) {
    throw new Error(`Attempting to wrap method ${field} multiple times`);
  }
  markFunctionWrapped(wrapped, original);
  Object.defineProperty(obj, field, {
    writable: true,
    configurable: true,
    enumerable,
    value: wrapped
  });
}
function getOriginalFunction(func) {
  return func.__sentry_original__;
}
function convertToPlainObject(value) {
  if (isError(value)) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
      ...getOwnProperties(value)
    };
  }
  if (isEvent(value)) {
    const { type, target, currentTarget, detail } = value;
    return {
      type,
      target,
      currentTarget,
      ...detail ? { detail } : {},
      ...getOwnProperties(value)
    };
  }
  return value;
}
function getOwnProperties(obj) {
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(Object.entries(obj));
  }
  return {};
}
function extractExceptionKeysForMessage(exception) {
  const keys = Object.keys(convertToPlainObject(exception));
  keys.sort();
  return !keys[0] ? "[object has no keys]" : keys.join(", ");
}
let RESOLVED_RUNNER;
function withRandomSafeContext(cb) {
  if (RESOLVED_RUNNER !== void 0) {
    return RESOLVED_RUNNER ? RESOLVED_RUNNER(cb) : cb();
  }
  const sym = /* @__PURE__ */ Symbol.for("__SENTRY_SAFE_RANDOM_ID_WRAPPER__");
  const globalWithSymbol = GLOBAL_OBJ;
  if (sym in globalWithSymbol && typeof globalWithSymbol[sym] === "function") {
    RESOLVED_RUNNER = globalWithSymbol[sym];
    return RESOLVED_RUNNER(cb);
  }
  RESOLVED_RUNNER = null;
  return cb();
}
function safeMathRandom() {
  return withRandomSafeContext(() => Math.random());
}
function safeDateNow() {
  return withRandomSafeContext(() => Date.now());
}
const SENTRY_SKIP_NORMALIZATION = /* @__PURE__ */ Symbol.for("sentry.skipNormalization");
const SENTRY_OVERRIDE_NORMALIZATION_DEPTH = /* @__PURE__ */ Symbol.for("sentry.overrideNormalizationDepth");
function hasSkipNormalizationHint(value) {
  return Boolean(value[SENTRY_SKIP_NORMALIZATION]);
}
function getNormalizationDepthOverrideHint(value) {
  const v = value[SENTRY_OVERRIDE_NORMALIZATION_DEPTH];
  return typeof v === "number" ? v : void 0;
}
let stringifier;
function normalize(input, depth = 100, maxProperties = Infinity) {
  try {
    return visit("", input, depth, maxProperties);
  } catch (err) {
    return { ERROR: `**non-serializable** (${err})` };
  }
}
function normalizeToSize(object, depth = 3, maxSize = 100 * 1024) {
  const normalized = normalize(object, depth);
  if (jsonSize(normalized) > maxSize) {
    return normalizeToSize(object, depth - 1, maxSize);
  }
  return normalized;
}
function visit(key, value, depth = Infinity, maxProperties = Infinity, memo = memoBuilder()) {
  const [memoize, unmemoize] = memo;
  if (value == null || // this matches null and undefined -> eqeq not eqeqeq
  ["boolean", "string"].includes(typeof value) || typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const stringified = stringifyValue(key, value);
  if (!stringified.startsWith("[object ")) {
    return stringified;
  }
  if (hasSkipNormalizationHint(value)) {
    return value;
  }
  const overrideDepth = getNormalizationDepthOverrideHint(value);
  const remainingDepth = overrideDepth !== void 0 ? overrideDepth : depth;
  if (remainingDepth === 0) {
    return stringified.replace("object ", "");
  }
  if (memoize(value)) {
    return "[Circular ~]";
  }
  const valueWithToJSON = value;
  if (valueWithToJSON && typeof valueWithToJSON.toJSON === "function") {
    try {
      const jsonValue = valueWithToJSON.toJSON();
      return visit("", jsonValue, remainingDepth - 1, maxProperties, memo);
    } catch {
    }
  }
  const normalized = Array.isArray(value) ? [] : {};
  let numAdded = 0;
  const visitable = convertToPlainObject(value);
  for (const visitKey in visitable) {
    if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) {
      continue;
    }
    if (numAdded >= maxProperties) {
      normalized[visitKey] = "[MaxProperties ~]";
      break;
    }
    const visitValue = visitable[visitKey];
    normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
    numAdded++;
  }
  unmemoize(value);
  return normalized;
}
function stringifyValue(key, value) {
  try {
    if (stringifier) ;
    if (typeof global !== "undefined" && value === global) {
      return "[Global]";
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      return `[${value}]`;
    }
    if (typeof value === "function") {
      return `[Function: ${getFunctionName(value)}]`;
    }
    if (typeof value === "symbol") {
      return `[${String(value)}]`;
    }
    if (typeof value === "bigint") {
      return `[BigInt: ${String(value)}]`;
    }
    const objName = getConstructorName(value);
    return `[object ${objName}]`;
  } catch (err) {
    return `**non-serializable** (${err})`;
  }
}
function getConstructorName(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype?.constructor ? prototype.constructor.name : "null prototype";
}
function utf8Length(value) {
  return ~-encodeURI(value).split(/%..|./).length;
}
function jsonSize(value) {
  return utf8Length(JSON.stringify(value));
}
function memoBuilder() {
  const inner = /* @__PURE__ */ new WeakSet();
  function memoize(obj) {
    if (inner.has(obj)) {
      return true;
    }
    inner.add(obj);
    return false;
  }
  function unmemoize(obj) {
    inner.delete(obj);
  }
  return [memoize, unmemoize];
}
function truncate(str, max = 0) {
  if (typeof str !== "string" || max === 0) {
    return str;
  }
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}
function snipLine(line, colno) {
  let newLine = line;
  const lineLength = newLine.length;
  if (lineLength <= 150) {
    return newLine;
  }
  if (colno > lineLength) {
    colno = lineLength;
  }
  let start = Math.max(colno - 60, 0);
  if (start < 5) {
    start = 0;
  }
  let end = Math.min(start + 140, lineLength);
  if (end > lineLength - 5) {
    end = lineLength;
  }
  if (end === lineLength) {
    start = Math.max(end - 140, 0);
  }
  newLine = newLine.slice(start, end);
  if (start > 0) {
    newLine = `'{snip} ${newLine}`;
  }
  if (end < lineLength) {
    newLine += " {snip}";
  }
  return newLine;
}
function safeJoin(input, delimiter) {
  if (!Array.isArray(input)) {
    return "";
  }
  const output = [];
  for (let i = 0; i < input.length; i++) {
    const value = input[i];
    if (isPrimitive(value)) {
      output.push(String(value));
    } else if (value instanceof Error) {
      output.push(value.message ? `${value.name}: ${value.message}` : value.name);
    } else {
      output.push(stringifyValue(void 0, value));
    }
  }
  return output.join(delimiter);
}
function isMatchingPattern(value, pattern, requireExactStringMatch = false) {
  if (!isString(value)) {
    return false;
  }
  if (isRegExp(pattern)) {
    return pattern.test(value);
  }
  if (isString(pattern)) {
    return requireExactStringMatch ? value === pattern : value.includes(pattern);
  }
  if (typeof pattern === "function") {
    return pattern(value);
  }
  return false;
}
function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = false) {
  for (const pattern of patterns) {
    if (isMatchingPattern(testString, pattern, requireExactStringMatch)) {
      return true;
    }
  }
  return false;
}
function getCrypto() {
  const gbl = GLOBAL_OBJ;
  return gbl.crypto || gbl.msCrypto;
}
let emptyUuid;
function getRandomByte() {
  return safeMathRandom() * 16;
}
function uuid4(crypto = getCrypto()) {
  try {
    if (crypto?.randomUUID) {
      return withRandomSafeContext(() => crypto.randomUUID()).replace(/-/g, "");
    }
  } catch {
  }
  if (!emptyUuid) {
    emptyUuid = "10000000100040008000" + 1e11;
  }
  return emptyUuid.replace(
    /[018]/g,
    (c) => (
      // eslint-disable-next-line no-bitwise
      (c ^ (getRandomByte() & 15) >> c / 4).toString(16)
    )
  );
}
function getFirstException(event) {
  return event.exception?.values?.[0];
}
function getEventDescription(event) {
  const { message, event_id: eventId } = event;
  if (message) {
    return message;
  }
  const firstException = getFirstException(event);
  if (firstException) {
    if (firstException.type && firstException.value) {
      return `${firstException.type}: ${firstException.value}`;
    }
    return firstException.type || firstException.value || eventId || "<unknown>";
  }
  return eventId || "<unknown>";
}
function addExceptionTypeValue(event, value, type) {
  const exception = event.exception = event.exception || {};
  const values = exception.values = exception.values || [];
  const firstException = values[0] = values[0] || {};
  if (!firstException.value) {
    firstException.value = "";
  }
  if (!firstException.type) {
    firstException.type = "Error";
  }
}
function addExceptionMechanism(event, newMechanism) {
  const firstException = getFirstException(event);
  if (!firstException) {
    return;
  }
  const defaultMechanism = { type: "generic", handled: true };
  const currentMechanism = firstException.mechanism;
  firstException.mechanism = { ...defaultMechanism, ...currentMechanism, ...newMechanism };
  if (newMechanism && "data" in newMechanism) {
    const mergedData = { ...currentMechanism?.data, ...newMechanism.data };
    firstException.mechanism.data = mergedData;
  }
}
const SEMVER_REGEXP = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
function _parseInt(input) {
  return parseInt(input || "", 10);
}
function parseSemver(input) {
  const match = input.match(SEMVER_REGEXP) || [];
  const major = _parseInt(match[1]);
  const minor = _parseInt(match[2]);
  const patch = _parseInt(match[3]);
  return {
    buildmetadata: match[5],
    major: isNaN(major) ? void 0 : major,
    minor: isNaN(minor) ? void 0 : minor,
    patch: isNaN(patch) ? void 0 : patch,
    prerelease: match[4]
  };
}
function checkOrSetAlreadyCaught(exception) {
  if (isAlreadyCaptured(exception)) {
    return true;
  }
  try {
    addNonEnumerableProperty(exception, "__sentry_captured__", true);
  } catch {
  }
  return false;
}
function isAlreadyCaptured(exception) {
  try {
    return exception.__sentry_captured__;
  } catch {
  }
}
const ONE_SECOND_IN_MS = 1e3;
function dateTimestampInSeconds() {
  return safeDateNow() / ONE_SECOND_IN_MS;
}
function createUnixTimestampInSecondsFunc() {
  const { performance } = GLOBAL_OBJ;
  if (!performance?.now || !performance.timeOrigin) {
    return dateTimestampInSeconds;
  }
  const timeOrigin = performance.timeOrigin;
  return () => {
    return (timeOrigin + withRandomSafeContext(() => performance.now())) / ONE_SECOND_IN_MS;
  };
}
let _cachedTimestampInSeconds;
function timestampInSeconds() {
  const func = _cachedTimestampInSeconds ?? (_cachedTimestampInSeconds = createUnixTimestampInSecondsFunc());
  return func();
}
function makeSession(context) {
  const startingTime = timestampInSeconds();
  const session = {
    sid: uuid4(),
    init: true,
    timestamp: startingTime,
    started: startingTime,
    duration: 0,
    status: "ok",
    errors: 0,
    ignoreDuration: false,
    toJSON: () => sessionToJSON(session)
  };
  if (context) {
    updateSession(session, context);
  }
  return session;
}
function updateSession(session, context = {}) {
  if (context.user) {
    if (!session.ipAddress && context.user.ip_address) {
      session.ipAddress = context.user.ip_address;
    }
    if (!session.did && !context.did) {
      session.did = context.user.id || context.user.email || context.user.username;
    }
  }
  session.timestamp = context.timestamp || timestampInSeconds();
  if (context.abnormal_mechanism) {
    session.abnormal_mechanism = context.abnormal_mechanism;
  }
  if (context.ignoreDuration) {
    session.ignoreDuration = context.ignoreDuration;
  }
  if (context.sid) {
    session.sid = context.sid.length === 32 ? context.sid : uuid4();
  }
  if (context.init !== void 0) {
    session.init = context.init;
  }
  if (!session.did && context.did) {
    session.did = `${context.did}`;
  }
  if (typeof context.started === "number") {
    session.started = context.started;
  }
  if (session.ignoreDuration) {
    session.duration = void 0;
  } else if (typeof context.duration === "number") {
    session.duration = context.duration;
  } else {
    const duration = session.timestamp - session.started;
    session.duration = duration >= 0 ? duration : 0;
  }
  if (context.release) {
    session.release = context.release;
  }
  if (context.environment) {
    session.environment = context.environment;
  }
  if (!session.ipAddress && context.ipAddress) {
    session.ipAddress = context.ipAddress;
  }
  if (!session.userAgent && context.userAgent) {
    session.userAgent = context.userAgent;
  }
  if (typeof context.errors === "number") {
    session.errors = context.errors;
  }
  if (context.status) {
    session.status = context.status;
  }
}
function closeSession(session, status) {
  let context = {};
  if (session.status === "ok") {
    context = { status: "exited" };
  }
  updateSession(session, context);
}
function sessionToJSON(session) {
  return {
    sid: `${session.sid}`,
    init: session.init,
    // Make sure that sec is converted to ms for date constructor
    started: new Date(session.started * 1e3).toISOString(),
    timestamp: new Date(session.timestamp * 1e3).toISOString(),
    status: session.status,
    errors: session.errors,
    did: typeof session.did === "number" || typeof session.did === "string" ? `${session.did}` : void 0,
    duration: session.duration,
    abnormal_mechanism: session.abnormal_mechanism,
    attrs: {
      release: session.release,
      environment: session.environment,
      ip_address: session.ipAddress,
      user_agent: session.userAgent
    }
  };
}
function merge(initialObj, mergeObj, levels = 2) {
  if (!mergeObj || typeof mergeObj !== "object" || levels <= 0) {
    return mergeObj;
  }
  if (initialObj && Object.keys(mergeObj).length === 0) {
    return initialObj;
  }
  const output = { ...initialObj };
  for (const key in mergeObj) {
    if (Object.prototype.hasOwnProperty.call(mergeObj, key)) {
      output[key] = merge(output[key], mergeObj[key], levels - 1);
    }
  }
  return output;
}
function generateTraceId() {
  return uuid4();
}
function generateSpanId() {
  return uuid4().substring(16);
}
function makeWeakRef(value) {
  try {
    const WeakRefImpl = GLOBAL_OBJ.WeakRef;
    if (typeof WeakRefImpl === "function") {
      return new WeakRefImpl(value);
    }
  } catch {
  }
  return value;
}
function derefWeakRef(ref) {
  if (!ref) {
    return void 0;
  }
  if (typeof ref === "object" && "deref" in ref && typeof ref.deref === "function") {
    try {
      return ref.deref();
    } catch {
      return void 0;
    }
  }
  return ref;
}
const SCOPE_SPAN_FIELD = "_sentrySpan";
function _setSpanForScope(scope, span) {
  if (span) {
    addNonEnumerableProperty(scope, SCOPE_SPAN_FIELD, makeWeakRef(span));
  } else {
    delete scope[SCOPE_SPAN_FIELD];
  }
}
function _getSpanForScope(scope) {
  return derefWeakRef(scope[SCOPE_SPAN_FIELD]);
}
const DEFAULT_MAX_BREADCRUMBS = 100;
class Scope {
  // NOTE: Any field which gets added here should get added not only to the constructor but also to the `clone` method.
  constructor() {
    this._notifyingListeners = false;
    this._scopeListeners = [];
    this._eventProcessors = [];
    this._breadcrumbs = [];
    this._attachments = [];
    this._user = {};
    this._tags = {};
    this._attributes = {};
    this._extra = {};
    this._contexts = {};
    this._sdkProcessingMetadata = {};
    this._propagationContext = {
      traceId: generateTraceId(),
      sampleRand: safeMathRandom()
    };
  }
  /**
   * Clone all data from this scope into a new scope.
   */
  clone() {
    const newScope = new Scope();
    newScope._breadcrumbs = [...this._breadcrumbs];
    newScope._tags = { ...this._tags };
    newScope._attributes = { ...this._attributes };
    newScope._extra = { ...this._extra };
    newScope._contexts = { ...this._contexts };
    if (this._contexts.flags) {
      newScope._contexts.flags = {
        values: [...this._contexts.flags.values]
      };
    }
    newScope._user = this._user;
    newScope._level = this._level;
    newScope._session = this._session;
    newScope._transactionName = this._transactionName;
    newScope._fingerprint = this._fingerprint;
    newScope._eventProcessors = [...this._eventProcessors];
    newScope._attachments = [...this._attachments];
    newScope._sdkProcessingMetadata = { ...this._sdkProcessingMetadata };
    newScope._propagationContext = { ...this._propagationContext };
    newScope._client = this._client;
    newScope._lastEventId = this._lastEventId;
    newScope._conversationId = this._conversationId;
    _setSpanForScope(newScope, _getSpanForScope(this));
    return newScope;
  }
  /**
   * Update the client assigned to this scope.
   * Note that not every scope will have a client assigned - isolation scopes & the global scope will generally not have a client,
   * as well as manually created scopes.
   */
  setClient(client) {
    this._client = client;
  }
  /**
   * Set the ID of the last captured error event.
   * This is generally only captured on the isolation scope.
   */
  setLastEventId(lastEventId) {
    this._lastEventId = lastEventId;
  }
  /**
   * Get the client assigned to this scope.
   */
  getClient() {
    return this._client;
  }
  /**
   * Get the ID of the last captured error event.
   * This is generally only available on the isolation scope.
   */
  lastEventId() {
    return this._lastEventId;
  }
  /**
   * @inheritDoc
   */
  addScopeListener(callback) {
    this._scopeListeners.push(callback);
  }
  /**
   * Add an event processor that will be called before an event is sent.
   */
  addEventProcessor(callback) {
    this._eventProcessors.push(callback);
    return this;
  }
  /**
   * Set the user for this scope.
   * Set to `null` to unset the user.
   */
  setUser(user) {
    this._user = user || {
      email: void 0,
      id: void 0,
      ip_address: void 0,
      username: void 0
    };
    if (this._session) {
      updateSession(this._session, { user });
    }
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Get the user from this scope.
   */
  getUser() {
    return this._user;
  }
  /**
   * Set the conversation ID for this scope.
   * Set to `null` to unset the conversation ID.
   */
  setConversationId(conversationId) {
    this._conversationId = conversationId || void 0;
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Set an object that will be merged into existing tags on the scope,
   * and will be sent as tags data with the event.
   */
  setTags(tags) {
    this._tags = {
      ...this._tags,
      ...tags
    };
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Set a single tag that will be sent as tags data with the event.
   */
  setTag(key, value) {
    return this.setTags({ [key]: value });
  }
  /**
   * Sets attributes onto the scope.
   *
   * These attributes are currently applied to logs and metrics.
   * In the future, they will also be applied to spans.
   *
   * Important: For now, only strings, numbers and boolean attributes are supported, despite types allowing for
   * more complex attribute types. We'll add this support in the future but already specify the wider type to
   * avoid a breaking change in the future.
   *
   * @param newAttributes - The attributes to set on the scope. You can either pass in key-value pairs, or
   * an object with a `value` and an optional `unit` (if applicable to your attribute).
   *
   * @example
   * ```typescript
   * scope.setAttributes({
   *   is_admin: true,
   *   payment_selection: 'credit_card',
   *   render_duration: { value: 'render_duration', unit: 'ms' },
   * });
   * ```
   */
  setAttributes(newAttributes) {
    this._attributes = {
      ...this._attributes,
      ...newAttributes
    };
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Sets an attribute onto the scope.
   *
   * These attributes are currently applied to logs and metrics.
   * In the future, they will also be applied to spans.
   *
   * Important: For now, only strings, numbers and boolean attributes are supported, despite types allowing for
   * more complex attribute types. We'll add this support in the future but already specify the wider type to
   * avoid a breaking change in the future.
   *
   * @param key - The attribute key.
   * @param value - the attribute value. You can either pass in a raw value, or an attribute
   * object with a `value` and an optional `unit` (if applicable to your attribute).
   *
   * @example
   * ```typescript
   * scope.setAttribute('is_admin', true);
   * scope.setAttribute('render_duration', { value: 'render_duration', unit: 'ms' });
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAttribute(key, value) {
    return this.setAttributes({ [key]: value });
  }
  /**
   * Removes the attribute with the given key from the scope.
   *
   * @param key - The attribute key.
   *
   * @example
   * ```typescript
   * scope.removeAttribute('is_admin');
   * ```
   */
  removeAttribute(key) {
    if (key in this._attributes) {
      delete this._attributes[key];
      this._notifyScopeListeners();
    }
    return this;
  }
  /**
   * Set an object that will be merged into existing extra on the scope,
   * and will be sent as extra data with the event.
   */
  setExtras(extras) {
    this._extra = {
      ...this._extra,
      ...extras
    };
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Set a single key:value extra entry that will be sent as extra data with the event.
   */
  setExtra(key, extra) {
    this._extra = { ...this._extra, [key]: extra };
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Sets the fingerprint on the scope to send with the events.
   * @param {string[]} fingerprint Fingerprint to group events in Sentry.
   */
  setFingerprint(fingerprint) {
    this._fingerprint = fingerprint;
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Sets the level on the scope for future events.
   */
  setLevel(level) {
    this._level = level;
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Sets the transaction name on the scope so that the name of e.g. taken server route or
   * the page location is attached to future events.
   *
   * IMPORTANT: Calling this function does NOT change the name of the currently active
   * root span. If you want to change the name of the active root span, use
   * `Sentry.updateSpanName(rootSpan, 'new name')` instead.
   *
   * By default, the SDK updates the scope's transaction name automatically on sensible
   * occasions, such as a page navigation or when handling a new request on the server.
   */
  setTransactionName(name) {
    this._transactionName = name;
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Sets context data with the given name.
   * Data passed as context will be normalized. You can also pass `null` to unset the context.
   * Note that context data will not be merged - calling `setContext` will overwrite an existing context with the same key.
   */
  setContext(key, context) {
    if (context === null) {
      delete this._contexts[key];
    } else {
      this._contexts[key] = context;
    }
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Set the session for the scope.
   */
  setSession(session) {
    if (!session) {
      delete this._session;
    } else {
      this._session = session;
    }
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Get the session from the scope.
   */
  getSession() {
    return this._session;
  }
  /**
   * Updates the scope with provided data. Can work in three variations:
   * - plain object containing updatable attributes
   * - Scope instance that'll extract the attributes from
   * - callback function that'll receive the current scope as an argument and allow for modifications
   */
  update(captureContext) {
    if (!captureContext) {
      return this;
    }
    const scopeToMerge = typeof captureContext === "function" ? captureContext(this) : captureContext;
    const scopeInstance = scopeToMerge instanceof Scope ? scopeToMerge.getScopeData() : isPlainObject(scopeToMerge) ? captureContext : void 0;
    const {
      tags,
      attributes,
      extra,
      user,
      contexts,
      level,
      fingerprint = [],
      propagationContext,
      conversationId
    } = scopeInstance || {};
    this._tags = { ...this._tags, ...tags };
    this._attributes = { ...this._attributes, ...attributes };
    this._extra = { ...this._extra, ...extra };
    this._contexts = { ...this._contexts, ...contexts };
    if (user && Object.keys(user).length) {
      this._user = user;
    }
    if (level) {
      this._level = level;
    }
    if (fingerprint.length) {
      this._fingerprint = fingerprint;
    }
    if (propagationContext) {
      this._propagationContext = propagationContext;
    }
    if (conversationId) {
      this._conversationId = conversationId;
    }
    return this;
  }
  /**
   * Clears the current scope and resets its properties.
   * Note: The client will not be cleared.
   */
  clear() {
    this._breadcrumbs = [];
    this._tags = {};
    this._attributes = {};
    this._extra = {};
    this._user = {};
    this._contexts = {};
    this._level = void 0;
    this._transactionName = void 0;
    this._fingerprint = void 0;
    this._session = void 0;
    this._conversationId = void 0;
    _setSpanForScope(this, void 0);
    this._attachments = [];
    this.setPropagationContext({
      traceId: generateTraceId(),
      sampleRand: safeMathRandom()
    });
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Adds a breadcrumb to the scope.
   * By default, the last 100 breadcrumbs are kept.
   */
  addBreadcrumb(breadcrumb, maxBreadcrumbs) {
    const maxCrumbs = typeof maxBreadcrumbs === "number" ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
    if (maxCrumbs <= 0) {
      return this;
    }
    const mergedBreadcrumb = {
      timestamp: dateTimestampInSeconds(),
      ...breadcrumb,
      // Breadcrumb messages can theoretically be infinitely large and they're held in memory so we truncate them not to leak (too much) memory
      message: breadcrumb.message ? truncate(breadcrumb.message, 2048) : breadcrumb.message
    };
    this._breadcrumbs.push(mergedBreadcrumb);
    if (this._breadcrumbs.length > maxCrumbs) {
      this._breadcrumbs = this._breadcrumbs.slice(-maxCrumbs);
      this._client?.recordDroppedEvent("buffer_overflow", "log_item");
    }
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Get the last breadcrumb of the scope.
   */
  getLastBreadcrumb() {
    return this._breadcrumbs[this._breadcrumbs.length - 1];
  }
  /**
   * Clear all breadcrumbs from the scope.
   */
  clearBreadcrumbs() {
    this._breadcrumbs = [];
    this._notifyScopeListeners();
    return this;
  }
  /**
   * Add an attachment to the scope.
   */
  addAttachment(attachment) {
    this._attachments.push(attachment);
    return this;
  }
  /**
   * Clear all attachments from the scope.
   */
  clearAttachments() {
    this._attachments = [];
    return this;
  }
  /**
   * Get the data of this scope, which should be applied to an event during processing.
   */
  getScopeData() {
    return {
      breadcrumbs: this._breadcrumbs,
      attachments: this._attachments,
      contexts: this._contexts,
      tags: this._tags,
      attributes: this._attributes,
      extra: this._extra,
      user: this._user,
      level: this._level,
      fingerprint: this._fingerprint || [],
      eventProcessors: this._eventProcessors,
      propagationContext: this._propagationContext,
      sdkProcessingMetadata: this._sdkProcessingMetadata,
      transactionName: this._transactionName,
      span: _getSpanForScope(this),
      conversationId: this._conversationId
    };
  }
  /**
   * Add data which will be accessible during event processing but won't get sent to Sentry.
   */
  setSDKProcessingMetadata(newData) {
    this._sdkProcessingMetadata = merge(this._sdkProcessingMetadata, newData, 2);
    return this;
  }
  /**
   * Add propagation context to the scope, used for distributed tracing
   */
  setPropagationContext(context) {
    this._propagationContext = context;
    return this;
  }
  /**
   * Get propagation context from the scope, used for distributed tracing
   */
  getPropagationContext() {
    return this._propagationContext;
  }
  /**
   * Capture an exception for this scope.
   *
   * @returns {string} The id of the captured Sentry event.
   */
  captureException(exception, hint) {
    const eventId = hint?.event_id || uuid4();
    if (!this._client) {
      DEBUG_BUILD && debug.warn("No client configured on scope - will not capture exception!");
      return eventId;
    }
    const syntheticException = new Error("Sentry syntheticException");
    this._client.captureException(
      exception,
      {
        originalException: exception,
        syntheticException,
        ...hint,
        event_id: eventId
      },
      this
    );
    return eventId;
  }
  /**
   * Capture a message for this scope.
   *
   * @returns {string} The id of the captured message.
   */
  captureMessage(message, level, hint) {
    const eventId = hint?.event_id || uuid4();
    if (!this._client) {
      DEBUG_BUILD && debug.warn("No client configured on scope - will not capture message!");
      return eventId;
    }
    const syntheticException = hint?.syntheticException ?? new Error(message);
    this._client.captureMessage(
      message,
      level,
      {
        originalException: message,
        syntheticException,
        ...hint,
        event_id: eventId
      },
      this
    );
    return eventId;
  }
  /**
   * Capture a Sentry event for this scope.
   *
   * @returns {string} The id of the captured event.
   */
  captureEvent(event, hint) {
    const eventId = event.event_id || hint?.event_id || uuid4();
    if (!this._client) {
      DEBUG_BUILD && debug.warn("No client configured on scope - will not capture event!");
      return eventId;
    }
    this._client.captureEvent(event, { ...hint, event_id: eventId }, this);
    return eventId;
  }
  /**
   * This will be called on every set call.
   */
  _notifyScopeListeners() {
    if (!this._notifyingListeners) {
      this._notifyingListeners = true;
      this._scopeListeners.forEach((callback) => {
        callback(this);
      });
      this._notifyingListeners = false;
    }
  }
}
function getDefaultCurrentScope() {
  return getGlobalSingleton("defaultCurrentScope", () => new Scope());
}
function getDefaultIsolationScope() {
  return getGlobalSingleton("defaultIsolationScope", () => new Scope());
}
const isActualPromise = (p) => p instanceof Promise && !p[kChainedCopy];
const kChainedCopy = /* @__PURE__ */ Symbol("chained PromiseLike");
const chainAndCopyPromiseLike = (original, onSuccess, onError) => {
  const chained = original.then(
    (value) => {
      onSuccess(value);
      return value;
    },
    (err) => {
      onError(err);
      throw err;
    }
  );
  return isActualPromise(chained) && isActualPromise(original) ? chained : copyProps(original, chained);
};
const copyProps = (original, chained) => {
  if (!chained) return original;
  let mutated = false;
  for (const key in original) {
    if (key in chained) continue;
    mutated = true;
    const value = original[key];
    if (typeof value === "function") {
      Object.defineProperty(chained, key, {
        value: (...args) => value.apply(original, args),
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      chained[key] = value;
    }
  }
  if (mutated) Object.assign(chained, { [kChainedCopy]: true });
  return chained;
};
class AsyncContextStack {
  constructor(scope, isolationScope) {
    let assignedScope;
    if (!scope) {
      assignedScope = new Scope();
    } else {
      assignedScope = scope;
    }
    let assignedIsolationScope;
    if (!isolationScope) {
      assignedIsolationScope = new Scope();
    } else {
      assignedIsolationScope = isolationScope;
    }
    this._stack = [{ scope: assignedScope }];
    this._isolationScope = assignedIsolationScope;
  }
  /**
   * Fork a scope for the stack.
   */
  withScope(callback) {
    const scope = this._pushScope();
    let maybePromiseResult;
    try {
      maybePromiseResult = callback(scope);
    } catch (e) {
      this._popScope();
      throw e;
    }
    if (isThenable(maybePromiseResult)) {
      return chainAndCopyPromiseLike(
        maybePromiseResult,
        () => this._popScope(),
        () => this._popScope()
      );
    }
    this._popScope();
    return maybePromiseResult;
  }
  /**
   * Get the client of the stack.
   */
  getClient() {
    return this.getStackTop().client;
  }
  /**
   * Returns the scope of the top stack.
   */
  getScope() {
    return this.getStackTop().scope;
  }
  /**
   * Get the isolation scope for the stack.
   */
  getIsolationScope() {
    return this._isolationScope;
  }
  /**
   * Returns the topmost scope layer in the order domain > local > process.
   */
  getStackTop() {
    return this._stack[this._stack.length - 1];
  }
  /**
   * Push a scope to the stack.
   */
  _pushScope() {
    const scope = this.getScope().clone();
    this._stack.push({
      client: this.getClient(),
      scope
    });
    return scope;
  }
  /**
   * Pop a scope from the stack.
   */
  _popScope() {
    if (this._stack.length <= 1) return false;
    return !!this._stack.pop();
  }
}
function getAsyncContextStack() {
  const registry = getMainCarrier();
  const sentry = getSentryCarrier(registry);
  return sentry.stack = sentry.stack || new AsyncContextStack(getDefaultCurrentScope(), getDefaultIsolationScope());
}
function withScope$1(callback) {
  return getAsyncContextStack().withScope(callback);
}
function withSetScope(scope, callback) {
  const stack = getAsyncContextStack();
  return stack.withScope(() => {
    stack.getStackTop().scope = scope;
    return callback(scope);
  });
}
function withIsolationScope$1(callback) {
  return getAsyncContextStack().withScope(() => {
    return callback(getAsyncContextStack().getIsolationScope());
  });
}
function getStackAsyncContextStrategy() {
  return {
    withIsolationScope: withIsolationScope$1,
    withScope: withScope$1,
    withSetScope,
    withSetIsolationScope: (_isolationScope, callback) => {
      return withIsolationScope$1(callback);
    },
    getCurrentScope: () => getAsyncContextStack().getScope(),
    getIsolationScope: () => getAsyncContextStack().getIsolationScope()
  };
}
function setAsyncContextStrategy(strategy) {
  const registry = getMainCarrier();
  const sentry = getSentryCarrier(registry);
  sentry.acs = strategy;
}
function getAsyncContextStrategy(carrier) {
  const sentry = getSentryCarrier(carrier);
  if (sentry.acs) {
    return sentry.acs;
  }
  return getStackAsyncContextStrategy();
}
function isAttributeObject(maybeObj) {
  return typeof maybeObj === "object" && maybeObj != null && !Array.isArray(maybeObj) && Object.keys(maybeObj).includes("value");
}
function attributeValueToTypedAttributeValue(rawValue, useFallback) {
  const { value, unit } = isAttributeObject(rawValue) ? rawValue : { value: rawValue, unit: void 0 };
  const attributeValue = getTypedAttributeValue(value);
  const checkedUnit = unit && typeof unit === "string" ? { unit } : {};
  if (attributeValue) {
    return { ...attributeValue, ...checkedUnit };
  }
  if (!useFallback || useFallback === "skip-undefined" && value === void 0) {
    return;
  }
  let stringValue = "";
  try {
    stringValue = JSON.stringify(value) ?? "";
  } catch {
  }
  return {
    value: stringValue,
    type: "string",
    ...checkedUnit
  };
}
function serializeAttributes(attributes, fallback = false) {
  const serializedAttributes = {};
  for (const [key, value] of Object.entries(attributes ?? {})) {
    const typedValue = attributeValueToTypedAttributeValue(value, fallback);
    if (typedValue) {
      serializedAttributes[key] = typedValue;
    }
  }
  return serializedAttributes;
}
function estimateTypedAttributesSizeInBytes(attributes) {
  if (!attributes) {
    return 0;
  }
  let weight = 0;
  for (const [key, attr] of Object.entries(attributes)) {
    weight += key.length * 2;
    weight += attr.type.length * 2;
    weight += (attr.unit?.length ?? 0) * 2;
    const val = attr.value;
    if (Array.isArray(val)) {
      weight += estimatePrimitiveSizeInBytes$1(val[0]) * val.length;
    } else if (isPrimitive(val)) {
      weight += estimatePrimitiveSizeInBytes$1(val);
    } else {
      weight += 100;
    }
  }
  return weight;
}
function estimatePrimitiveSizeInBytes$1(value) {
  if (typeof value === "string") {
    return value.length * 2;
  } else if (typeof value === "boolean") {
    return 4;
  } else if (typeof value === "number") {
    return 8;
  }
  return 0;
}
function getTypedAttributeValue(value) {
  if (Array.isArray(value)) {
    return { value, type: "array" };
  }
  const primitiveType = typeof value === "string" ? "string" : typeof value === "boolean" ? "boolean" : typeof value === "number" && !Number.isNaN(value) ? Number.isInteger(value) ? "integer" : "double" : null;
  if (primitiveType) {
    return { value, type: primitiveType };
  }
}
function getCurrentScope() {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  return acs.getCurrentScope();
}
function getIsolationScope() {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  return acs.getIsolationScope();
}
function getGlobalScope() {
  return getGlobalSingleton("globalScope", () => new Scope());
}
function withScope(...rest) {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  if (rest.length === 2) {
    const [scope, callback] = rest;
    if (!scope) {
      return acs.withScope(callback);
    }
    return acs.withSetScope(scope, callback);
  }
  return acs.withScope(rest[0]);
}
function withIsolationScope(...rest) {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  if (rest.length === 2) {
    const [isolationScope, callback] = rest;
    if (!isolationScope) {
      return acs.withIsolationScope(callback);
    }
    return acs.withSetIsolationScope(isolationScope, callback);
  }
  return acs.withIsolationScope(rest[0]);
}
function getClient() {
  return getCurrentScope().getClient();
}
function getTraceContextFromScope(scope) {
  const propagationContext = scope.getPropagationContext();
  const { traceId, parentSpanId, propagationSpanId } = propagationContext;
  const traceContext = {
    trace_id: traceId,
    span_id: propagationSpanId || generateSpanId()
  };
  if (parentSpanId) {
    traceContext.parent_span_id = parentSpanId;
  }
  return traceContext;
}
const SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = "sentry.source";
const SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = "sentry.sample_rate";
const SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE = "sentry.previous_trace_sample_rate";
const SEMANTIC_ATTRIBUTE_SENTRY_OP = "sentry.op";
const SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = "sentry.origin";
const SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT = "sentry.measurement_unit";
const SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE = "sentry.measurement_value";
const SEMANTIC_ATTRIBUTE_SENTRY_RELEASE = "sentry.release";
const SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT = "sentry.environment";
const SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_NAME = "sentry.segment.name";
const SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_ID = "sentry.segment.id";
const SEMANTIC_ATTRIBUTE_SENTRY_SDK_NAME = "sentry.sdk.name";
const SEMANTIC_ATTRIBUTE_SENTRY_SDK_VERSION = "sentry.sdk.version";
const SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS = "sentry.sdk.integrations";
const SEMANTIC_ATTRIBUTE_USER_ID = "user.id";
const SEMANTIC_ATTRIBUTE_USER_EMAIL = "user.email";
const SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS = "user.ip_address";
const SEMANTIC_ATTRIBUTE_USER_USERNAME = "user.name";
const SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME = "sentry.custom_span_name";
const SEMANTIC_ATTRIBUTE_PROFILE_ID = "sentry.profile_id";
const SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME = "sentry.exclusive_time";
const SEMANTIC_ATTRIBUTE_CACHE_HIT = "cache.hit";
const SEMANTIC_ATTRIBUTE_CACHE_KEY = "cache.key";
const SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE = "cache.item_size";
const SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD = "http.request.method";
const SEMANTIC_ATTRIBUTE_URL_FULL = "url.full";
const GEN_AI_CONVERSATION_ID_ATTRIBUTE$1 = "gen_ai.conversation.id";
const SPAN_STATUS_UNSET = 0;
const SPAN_STATUS_OK = 1;
const SPAN_STATUS_ERROR = 2;
function getSpanStatusFromHttpCode(httpStatus) {
  if (httpStatus < 400 && httpStatus >= 100) {
    return { code: SPAN_STATUS_OK };
  }
  if (httpStatus >= 400 && httpStatus < 500) {
    switch (httpStatus) {
      case 401:
        return { code: SPAN_STATUS_ERROR, message: "unauthenticated" };
      case 403:
        return { code: SPAN_STATUS_ERROR, message: "permission_denied" };
      case 404:
        return { code: SPAN_STATUS_ERROR, message: "not_found" };
      case 409:
        return { code: SPAN_STATUS_ERROR, message: "already_exists" };
      case 413:
        return { code: SPAN_STATUS_ERROR, message: "failed_precondition" };
      case 429:
        return { code: SPAN_STATUS_ERROR, message: "resource_exhausted" };
      case 499:
        return { code: SPAN_STATUS_ERROR, message: "cancelled" };
      default:
        return { code: SPAN_STATUS_ERROR, message: "invalid_argument" };
    }
  }
  if (httpStatus >= 500 && httpStatus < 600) {
    switch (httpStatus) {
      case 501:
        return { code: SPAN_STATUS_ERROR, message: "unimplemented" };
      case 503:
        return { code: SPAN_STATUS_ERROR, message: "unavailable" };
      case 504:
        return { code: SPAN_STATUS_ERROR, message: "deadline_exceeded" };
      default:
        return { code: SPAN_STATUS_ERROR, message: "internal_error" };
    }
  }
  return { code: SPAN_STATUS_ERROR, message: "internal_error" };
}
const SCOPE_ON_START_SPAN_FIELD = "_sentryScope";
const ISOLATION_SCOPE_ON_START_SPAN_FIELD = "_sentryIsolationScope";
function setCapturedScopesOnSpan(span, scope, isolationScope) {
  if (span) {
    addNonEnumerableProperty(span, ISOLATION_SCOPE_ON_START_SPAN_FIELD, makeWeakRef(isolationScope));
    addNonEnumerableProperty(span, SCOPE_ON_START_SPAN_FIELD, scope);
  }
}
function getCapturedScopesOnSpan(span) {
  const spanWithScopes = span;
  return {
    scope: spanWithScopes[SCOPE_ON_START_SPAN_FIELD],
    isolationScope: derefWeakRef(spanWithScopes[ISOLATION_SCOPE_ON_START_SPAN_FIELD])
  };
}
const SENTRY_BAGGAGE_KEY_PREFIX = "sentry-";
const MAX_BAGGAGE_STRING_LENGTH = 8192;
function baggageHeaderToDynamicSamplingContext(baggageHeader) {
  const baggageObject = parseBaggageHeader(baggageHeader);
  if (!baggageObject) {
    return void 0;
  }
  const dynamicSamplingContext = Object.entries(baggageObject).reduce((acc, [key, value]) => {
    if (key.startsWith(SENTRY_BAGGAGE_KEY_PREFIX)) {
      const nonPrefixedKey = key.slice(SENTRY_BAGGAGE_KEY_PREFIX.length);
      acc[nonPrefixedKey] = value;
    }
    return acc;
  }, {});
  if (Object.keys(dynamicSamplingContext).length > 0) {
    return dynamicSamplingContext;
  } else {
    return void 0;
  }
}
function dynamicSamplingContextToSentryBaggageHeader(dynamicSamplingContext) {
  if (!dynamicSamplingContext) {
    return void 0;
  }
  const sentryPrefixedDSC = Object.entries(dynamicSamplingContext).reduce(
    (acc, [dscKey, dscValue]) => {
      if (dscValue) {
        acc[`${SENTRY_BAGGAGE_KEY_PREFIX}${dscKey}`] = dscValue;
      }
      return acc;
    },
    {}
  );
  return objectToBaggageHeader(sentryPrefixedDSC);
}
function parseBaggageHeader(baggageHeader) {
  if (!baggageHeader || !isString(baggageHeader) && !Array.isArray(baggageHeader)) {
    return void 0;
  }
  if (Array.isArray(baggageHeader)) {
    return baggageHeader.reduce((acc, curr) => {
      const currBaggageObject = baggageHeaderToObject(curr);
      Object.entries(currBaggageObject).forEach(([key, value]) => {
        acc[key] = value;
      });
      return acc;
    }, {});
  }
  return baggageHeaderToObject(baggageHeader);
}
function baggageHeaderToObject(baggageHeader) {
  return baggageHeader.split(",").map((baggageEntry) => {
    const eqIdx = baggageEntry.indexOf("=");
    if (eqIdx === -1) {
      return [];
    }
    const key = baggageEntry.slice(0, eqIdx);
    const value = baggageEntry.slice(eqIdx + 1);
    return [key, value].map((keyOrValue) => {
      try {
        return decodeURIComponent(keyOrValue.trim());
      } catch {
        return;
      }
    });
  }).reduce((acc, [key, value]) => {
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
function objectToBaggageHeader(object) {
  if (Object.keys(object).length === 0) {
    return void 0;
  }
  return Object.entries(object).reduce((baggageHeader, [objectKey, objectValue], currentIndex) => {
    const baggageEntry = `${encodeURIComponent(objectKey)}=${encodeURIComponent(objectValue)}`;
    const newBaggageHeader = currentIndex === 0 ? baggageEntry : `${baggageHeader},${baggageEntry}`;
    if (newBaggageHeader.length > MAX_BAGGAGE_STRING_LENGTH) {
      DEBUG_BUILD && debug.warn(
        `Not adding key: ${objectKey} with val: ${objectValue} to baggage header due to exceeding baggage size limits.`
      );
      return baggageHeader;
    } else {
      return newBaggageHeader;
    }
  }, "");
}
function mergeBaggageHeaders(existing, incoming) {
  if (!existing) {
    return incoming;
  }
  const existingEntries = parseBaggageHeader(existing);
  const incomingEntries = parseBaggageHeader(incoming);
  if (!incomingEntries) {
    return existing;
  }
  const merged = {};
  let hasNewSentryEntries = false;
  const newSentryEntries = {};
  const newNonSentryEntries = {};
  for (const [key, value] of Object.entries(incomingEntries)) {
    if (key.startsWith(SENTRY_BAGGAGE_KEY_PREFIX)) {
      newSentryEntries[key] = value;
      hasNewSentryEntries = true;
    } else {
      newNonSentryEntries[key] = value;
    }
  }
  if (existingEntries) {
    for (const [key, value] of Object.entries(existingEntries)) {
      if (!hasNewSentryEntries || !key.startsWith(SENTRY_BAGGAGE_KEY_PREFIX)) {
        merged[key] = value;
      }
    }
  }
  if (hasNewSentryEntries) {
    Object.assign(merged, newSentryEntries);
  }
  for (const [key, value] of Object.entries(newNonSentryEntries)) {
    merged[key] ?? (merged[key] = value);
  }
  return objectToBaggageHeader(merged);
}
const ORG_ID_REGEX = /^o(\d+)\./;
const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)((?:\[[:.%\w]+\]|[\w.-]+))(?::(\d+))?\/(.+)/;
function isValidProtocol(protocol) {
  return protocol === "http" || protocol === "https";
}
function dsnToString(dsn, withPassword = false) {
  const { host, path, pass, port, projectId, protocol, publicKey } = dsn;
  return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ""}@${host}${port ? `:${port}` : ""}/${path ? `${path}/` : path}${projectId}`;
}
function dsnFromString(str) {
  const match = DSN_REGEX.exec(str);
  if (!match) {
    consoleSandbox(() => {
      console.error(`Invalid Sentry Dsn: ${str}`);
    });
    return void 0;
  }
  const [protocol, publicKey, pass = "", host = "", port = "", lastPath = ""] = match.slice(1);
  let path = "";
  let projectId = lastPath;
  const split = projectId.split("/");
  if (split.length > 1) {
    path = split.slice(0, -1).join("/");
    projectId = split.pop();
  }
  if (projectId) {
    const projectMatch = projectId.match(/^\d+/);
    if (projectMatch) {
      projectId = projectMatch[0];
    }
  }
  return dsnFromComponents({ host, pass, path, projectId, port, protocol, publicKey });
}
function dsnFromComponents(components) {
  return {
    protocol: components.protocol,
    publicKey: components.publicKey || "",
    pass: components.pass || "",
    host: components.host,
    port: components.port || "",
    path: components.path || "",
    projectId: components.projectId
  };
}
function validateDsn(dsn) {
  if (!DEBUG_BUILD) {
    return true;
  }
  const { port, projectId, protocol } = dsn;
  const requiredComponents = ["protocol", "publicKey", "host", "projectId"];
  const hasMissingRequiredComponent = requiredComponents.find((component) => {
    if (!dsn[component]) {
      debug.error(`Invalid Sentry Dsn: ${component} missing`);
      return true;
    }
    return false;
  });
  if (hasMissingRequiredComponent) {
    return false;
  }
  if (!projectId.match(/^\d+$/)) {
    debug.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
    return false;
  }
  if (!isValidProtocol(protocol)) {
    debug.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
    return false;
  }
  if (port && isNaN(parseInt(port, 10))) {
    debug.error(`Invalid Sentry Dsn: Invalid port ${port}`);
    return false;
  }
  return true;
}
function extractOrgIdFromDsnHost(host) {
  const match = host.match(ORG_ID_REGEX);
  return match?.[1];
}
function extractOrgIdFromClient(client) {
  const options = client.getOptions();
  const { host } = client.getDsn() || {};
  let org_id;
  if (options.orgId) {
    org_id = String(options.orgId);
  } else if (host) {
    org_id = extractOrgIdFromDsnHost(host);
  }
  return org_id;
}
function makeDsn(from) {
  const components = typeof from === "string" ? dsnFromString(from) : dsnFromComponents(from);
  if (!components || !validateDsn(components)) {
    return void 0;
  }
  return components;
}
function parseSampleRate(sampleRate) {
  if (typeof sampleRate === "boolean") {
    return Number(sampleRate);
  }
  const rate = typeof sampleRate === "string" ? parseFloat(sampleRate) : sampleRate;
  if (typeof rate !== "number" || isNaN(rate) || rate < 0 || rate > 1) {
    return void 0;
  }
  return rate;
}
const TRACEPARENT_REGEXP = new RegExp(
  "^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$"
  // whitespace
);
function extractTraceparentData(traceparent) {
  if (!traceparent) {
    return void 0;
  }
  const matches = traceparent.match(TRACEPARENT_REGEXP);
  if (!matches) {
    return void 0;
  }
  let parentSampled;
  if (matches[3] === "1") {
    parentSampled = true;
  } else if (matches[3] === "0") {
    parentSampled = false;
  }
  return {
    traceId: matches[1],
    parentSampled,
    parentSpanId: matches[2]
  };
}
function propagationContextFromHeaders(sentryTrace, baggage) {
  const traceparentData = extractTraceparentData(sentryTrace);
  const dynamicSamplingContext = baggageHeaderToDynamicSamplingContext(baggage);
  if (!traceparentData?.traceId) {
    return {
      traceId: generateTraceId(),
      sampleRand: safeMathRandom()
    };
  }
  const sampleRand = getSampleRandFromTraceparentAndDsc(traceparentData, dynamicSamplingContext);
  if (dynamicSamplingContext) {
    dynamicSamplingContext.sample_rand = sampleRand.toString();
  }
  const { traceId, parentSpanId, parentSampled } = traceparentData;
  return {
    traceId,
    parentSpanId,
    sampled: parentSampled,
    dsc: dynamicSamplingContext || {},
    // If we have traceparent data but no DSC it means we are not head of trace and we must freeze it
    sampleRand
  };
}
function generateSentryTraceHeader(traceId = generateTraceId(), spanId = generateSpanId(), sampled) {
  let sampledString = "";
  if (sampled !== void 0) {
    sampledString = sampled ? "-1" : "-0";
  }
  return `${traceId}-${spanId}${sampledString}`;
}
function generateTraceparentHeader(traceId = generateTraceId(), spanId = generateSpanId(), sampled) {
  return `00-${traceId}-${spanId}-${sampled ? "01" : "00"}`;
}
function getSampleRandFromTraceparentAndDsc(traceparentData, dsc) {
  const parsedSampleRand = parseSampleRate(dsc?.sample_rand);
  if (parsedSampleRand !== void 0) {
    return parsedSampleRand;
  }
  const parsedSampleRate = parseSampleRate(dsc?.sample_rate);
  if (parsedSampleRate && traceparentData?.parentSampled !== void 0) {
    return traceparentData.parentSampled ? (
      // Returns a sample rand with positive sampling decision [0, sampleRate)
      safeMathRandom() * parsedSampleRate
    ) : (
      // Returns a sample rand with negative sampling decision [sampleRate, 1)
      parsedSampleRate + safeMathRandom() * (1 - parsedSampleRate)
    );
  } else {
    return safeMathRandom();
  }
}
function shouldContinueTrace(client, baggageOrgId) {
  const clientOrgId = extractOrgIdFromClient(client);
  if (baggageOrgId && clientOrgId && baggageOrgId !== clientOrgId) {
    debug.log(
      `Won't continue trace because org IDs don't match (incoming baggage: ${baggageOrgId}, SDK options: ${clientOrgId})`
    );
    return false;
  }
  const strictTraceContinuation = client.getOptions().strictTraceContinuation || false;
  if (strictTraceContinuation) {
    if (baggageOrgId && !clientOrgId || !baggageOrgId && clientOrgId) {
      debug.log(
        `Starting a new trace because strict trace continuation is enabled but one org ID is missing (incoming baggage: ${baggageOrgId}, Sentry client: ${clientOrgId})`
      );
      return false;
    }
  }
  return true;
}
const TRACE_FLAG_NONE = 0;
const TRACE_FLAG_SAMPLED = 1;
let hasShownSpanDropWarning = false;
function spanToTransactionTraceContext(span) {
  const { spanId: span_id, traceId: trace_id } = span.spanContext();
  const { data, op, parent_span_id, status, origin, links } = spanToJSON(span);
  return {
    parent_span_id,
    span_id,
    trace_id,
    data,
    op,
    status,
    origin,
    links
  };
}
function spanToTraceContext(span) {
  const { spanId, traceId: trace_id, isRemote } = span.spanContext();
  const parent_span_id = isRemote ? spanId : spanToJSON(span).parent_span_id;
  const scope = getCapturedScopesOnSpan(span).scope;
  const span_id = isRemote ? scope?.getPropagationContext().propagationSpanId || generateSpanId() : spanId;
  return {
    parent_span_id,
    span_id,
    trace_id
  };
}
function spanToTraceHeader(span) {
  const { traceId, spanId } = span.spanContext();
  const sampled = spanIsSampled(span);
  return generateSentryTraceHeader(traceId, spanId, sampled);
}
function spanToTraceparentHeader(span) {
  const { traceId, spanId } = span.spanContext();
  const sampled = spanIsSampled(span);
  return generateTraceparentHeader(traceId, spanId, sampled);
}
function convertSpanLinksForEnvelope(links) {
  if (links && links.length > 0) {
    return links.map(({ context: { spanId, traceId, traceFlags, ...restContext }, attributes }) => ({
      span_id: spanId,
      trace_id: traceId,
      sampled: traceFlags === TRACE_FLAG_SAMPLED,
      attributes,
      ...restContext
    }));
  } else {
    return void 0;
  }
}
function getStreamedSpanLinks(links) {
  if (links?.length) {
    return links.map(({ context: { spanId, traceId, traceFlags }, attributes }) => ({
      span_id: spanId,
      trace_id: traceId,
      sampled: traceFlags === TRACE_FLAG_SAMPLED,
      attributes
    }));
  } else {
    return void 0;
  }
}
function spanTimeInputToSeconds(input) {
  if (typeof input === "number") {
    return ensureTimestampInSeconds(input);
  }
  if (Array.isArray(input)) {
    return input[0] + input[1] / 1e9;
  }
  if (input instanceof Date) {
    return ensureTimestampInSeconds(input.getTime());
  }
  return timestampInSeconds();
}
function ensureTimestampInSeconds(timestamp) {
  const isMs = timestamp > 9999999999;
  return isMs ? timestamp / 1e3 : timestamp;
}
function spanToJSON(span) {
  if (spanIsSentrySpan(span)) {
    return span.getSpanJSON();
  }
  const { spanId: span_id, traceId: trace_id } = span.spanContext();
  if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
    const { attributes, startTime, name, endTime, status, links } = span;
    return {
      span_id,
      trace_id,
      data: attributes,
      description: name,
      parent_span_id: getOtelParentSpanId(span),
      start_timestamp: spanTimeInputToSeconds(startTime),
      // This is [0,0] by default in OTEL, in which case we want to interpret this as no end time
      timestamp: spanTimeInputToSeconds(endTime) || void 0,
      status: getStatusMessage(status),
      op: attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
      origin: attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
      links: convertSpanLinksForEnvelope(links)
    };
  }
  return {
    span_id,
    trace_id,
    start_timestamp: 0,
    data: {}
  };
}
function spanToStreamedSpanJSON(span) {
  if (spanIsSentrySpan(span)) {
    return span.getStreamedSpanJSON();
  }
  const { spanId: span_id, traceId: trace_id } = span.spanContext();
  if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
    const { attributes, startTime, name, endTime, status, links } = span;
    return {
      name,
      span_id,
      trace_id,
      parent_span_id: getOtelParentSpanId(span),
      start_timestamp: spanTimeInputToSeconds(startTime),
      end_timestamp: spanTimeInputToSeconds(endTime),
      is_segment: span === INTERNAL_getSegmentSpan(span),
      status: getSimpleStatusMessage(status),
      attributes,
      links: getStreamedSpanLinks(links)
    };
  }
  return {
    span_id,
    trace_id,
    start_timestamp: 0,
    name: "",
    end_timestamp: 0,
    status: "ok",
    is_segment: span === INTERNAL_getSegmentSpan(span)
  };
}
function getOtelParentSpanId(span) {
  return "parentSpanId" in span ? span.parentSpanId : "parentSpanContext" in span ? span.parentSpanContext?.spanId : void 0;
}
function streamedSpanJsonToSerializedSpan(spanJson) {
  return {
    ...spanJson,
    attributes: serializeAttributes(spanJson.attributes),
    links: spanJson.links?.map((link) => ({
      ...link,
      attributes: serializeAttributes(link.attributes)
    }))
  };
}
function spanIsOpenTelemetrySdkTraceBaseSpan(span) {
  const castSpan = span;
  return !!castSpan.attributes && !!castSpan.startTime && !!castSpan.name && !!castSpan.endTime && !!castSpan.status;
}
function spanIsSentrySpan(span) {
  return typeof span.getSpanJSON === "function";
}
function spanIsSampled(span) {
  const { traceFlags } = span.spanContext();
  return traceFlags === TRACE_FLAG_SAMPLED;
}
function getStatusMessage(status) {
  if (!status || status.code === SPAN_STATUS_UNSET) {
    return void 0;
  }
  if (status.code === SPAN_STATUS_OK) {
    return "ok";
  }
  return status.message || "internal_error";
}
function getSimpleStatusMessage(status) {
  return !status || status.code === SPAN_STATUS_OK || status.code === SPAN_STATUS_UNSET || status.message === "cancelled" ? "ok" : "error";
}
const CHILD_SPANS_FIELD = "_sentryChildSpans";
const ROOT_SPAN_FIELD = "_sentryRootSpan";
function addChildSpanToSpan(span, childSpan) {
  const rootSpan = span[ROOT_SPAN_FIELD] || span;
  addNonEnumerableProperty(childSpan, ROOT_SPAN_FIELD, rootSpan);
  if (span[CHILD_SPANS_FIELD]) {
    span[CHILD_SPANS_FIELD].add(childSpan);
  } else {
    addNonEnumerableProperty(span, CHILD_SPANS_FIELD, /* @__PURE__ */ new Set([childSpan]));
  }
}
function getSpanDescendants(span) {
  const resultSet = /* @__PURE__ */ new Set();
  function addSpanChildren(span2) {
    if (resultSet.has(span2)) {
      return;
    } else if (spanIsSampled(span2)) {
      resultSet.add(span2);
      const childSpans = span2[CHILD_SPANS_FIELD] ? Array.from(span2[CHILD_SPANS_FIELD]) : [];
      for (const childSpan of childSpans) {
        addSpanChildren(childSpan);
      }
    }
  }
  addSpanChildren(span);
  return Array.from(resultSet);
}
const getRootSpan = INTERNAL_getSegmentSpan;
function INTERNAL_getSegmentSpan(span) {
  return span[ROOT_SPAN_FIELD] || span;
}
function getActiveSpan() {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  if (acs.getActiveSpan) {
    return acs.getActiveSpan();
  }
  return _getSpanForScope(getCurrentScope());
}
function showSpanDropWarning() {
  if (!hasShownSpanDropWarning) {
    consoleSandbox(() => {
      console.warn(
        "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`."
      );
    });
    hasShownSpanDropWarning = true;
  }
}
function hasSpansEnabled(maybeOptions) {
  if (typeof __SENTRY_TRACING__ === "boolean" && !__SENTRY_TRACING__) {
    return false;
  }
  const options = maybeOptions || getClient()?.getOptions();
  return !!options && // Note: This check is `!= null`, meaning "nullish". `0` is not "nullish", `undefined` and `null` are. (This comment was brought to you by 15 minutes of questioning life)
  (options.tracesSampleRate != null || !!options.tracesSampler);
}
function logIgnoredSpan(droppedSpan) {
  debug.log(`Ignoring span ${droppedSpan.op} - ${droppedSpan.description} because it matches \`ignoreSpans\`.`);
}
function shouldIgnoreSpan(span, ignoreSpans) {
  if (!ignoreSpans?.length) {
    return false;
  }
  for (const pattern of ignoreSpans) {
    if (isStringOrRegExp(pattern)) {
      if (span.description && isMatchingPattern(span.description, pattern)) {
        DEBUG_BUILD && logIgnoredSpan(span);
        return true;
      }
      continue;
    }
    const hasAttributes = !!pattern.attributes && Object.keys(pattern.attributes).length > 0;
    if (!pattern.name && !pattern.op && !hasAttributes) {
      continue;
    }
    const nameMatches = pattern.name ? span.description && isMatchingPattern(span.description, pattern.name) : true;
    const opMatches = pattern.op ? span.op && isMatchingPattern(span.op, pattern.op) : true;
    const attrsMatch = pattern.attributes ? Object.entries(pattern.attributes).every(
      ([key, valuePattern]) => _matchesAttributeValue(span.attributes?.[key], valuePattern)
    ) : true;
    if (nameMatches && opMatches && attrsMatch) {
      DEBUG_BUILD && logIgnoredSpan(span);
      return true;
    }
  }
  return false;
}
function _matchesAttributeValue(actual, pat) {
  if (typeof actual === "string" && (typeof pat === "string" || pat instanceof RegExp)) {
    return isMatchingPattern(actual, pat);
  }
  if (Array.isArray(actual) && Array.isArray(pat)) {
    return actual.length === pat.length && actual.every((v, i) => v === pat[i]);
  }
  return actual === pat;
}
function reparentChildSpans(spans, dropSpan) {
  const droppedSpanParentId = dropSpan.parent_span_id;
  const droppedSpanId = dropSpan.span_id;
  if (!droppedSpanParentId) {
    return;
  }
  for (const span of spans) {
    if (span.parent_span_id === droppedSpanId) {
      span.parent_span_id = droppedSpanParentId;
    }
  }
}
function isStringOrRegExp(value) {
  return typeof value === "string" || value instanceof RegExp;
}
const DEFAULT_ENVIRONMENT = "production";
const FROZEN_DSC_FIELD = "_frozenDsc";
function freezeDscOnSpan(span, dsc) {
  const spanWithMaybeDsc = span;
  addNonEnumerableProperty(spanWithMaybeDsc, FROZEN_DSC_FIELD, dsc);
}
function getDynamicSamplingContextFromClient(trace_id, client) {
  const options = client.getOptions();
  const { publicKey: public_key } = client.getDsn() || {};
  const dsc = {
    environment: options.environment || DEFAULT_ENVIRONMENT,
    release: options.release,
    public_key,
    trace_id,
    org_id: extractOrgIdFromClient(client)
  };
  client.emit("createDsc", dsc);
  return dsc;
}
function getDynamicSamplingContextFromScope(client, scope) {
  const propagationContext = scope.getPropagationContext();
  return propagationContext.dsc || getDynamicSamplingContextFromClient(propagationContext.traceId, client);
}
function getDynamicSamplingContextFromSpan(span) {
  const client = getClient();
  if (!client) {
    return {};
  }
  const rootSpan = getRootSpan(span);
  const rootSpanJson = spanToJSON(rootSpan);
  const rootSpanAttributes = rootSpanJson.data;
  const traceState = rootSpan.spanContext().traceState;
  const rootSpanSampleRate = traceState?.get("sentry.sample_rate") ?? rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE] ?? rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_PREVIOUS_TRACE_SAMPLE_RATE];
  function applyLocalSampleRateToDsc(dsc2) {
    if (typeof rootSpanSampleRate === "number" || typeof rootSpanSampleRate === "string") {
      dsc2.sample_rate = `${rootSpanSampleRate}`;
    }
    return dsc2;
  }
  const frozenDsc = rootSpan[FROZEN_DSC_FIELD];
  if (frozenDsc) {
    return applyLocalSampleRateToDsc(frozenDsc);
  }
  const traceStateDsc = traceState?.get("sentry.dsc");
  const dscOnTraceState = traceStateDsc && baggageHeaderToDynamicSamplingContext(traceStateDsc);
  if (dscOnTraceState) {
    return applyLocalSampleRateToDsc(dscOnTraceState);
  }
  const dsc = getDynamicSamplingContextFromClient(span.spanContext().traceId, client);
  const source = rootSpanAttributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] ?? rootSpanAttributes["sentry.span.source"];
  const name = rootSpanJson.description;
  if (source !== "url" && name) {
    dsc.transaction = name;
  }
  if (hasSpansEnabled()) {
    dsc.sampled = String(spanIsSampled(rootSpan));
    dsc.sample_rand = // In OTEL we store the sample rand on the trace state because we cannot access scopes for NonRecordingSpans
    // The Sentry OTEL SpanSampler takes care of writing the sample rand on the root span
    traceState?.get("sentry.sample_rand") ?? // On all other platforms we can actually get the scopes from a root span (we use this as a fallback)
    getCapturedScopesOnSpan(rootSpan).scope?.getPropagationContext().sampleRand.toString();
  }
  applyLocalSampleRateToDsc(dsc);
  client.emit("createDsc", dsc, rootSpan);
  return dsc;
}
class SentryNonRecordingSpan {
  constructor(spanContext = {}) {
    this._traceId = spanContext.traceId || generateTraceId();
    this._spanId = spanContext.spanId || generateSpanId();
    this.dropReason = spanContext.dropReason;
  }
  /** @inheritdoc */
  spanContext() {
    return {
      spanId: this._spanId,
      traceId: this._traceId,
      traceFlags: TRACE_FLAG_NONE
    };
  }
  /** @inheritdoc */
  end(_timestamp) {
  }
  /** @inheritdoc */
  setAttribute(_key, _value) {
    return this;
  }
  /** @inheritdoc */
  setAttributes(_values) {
    return this;
  }
  /** @inheritdoc */
  setStatus(_status) {
    return this;
  }
  /** @inheritdoc */
  updateName(_name) {
    return this;
  }
  /** @inheritdoc */
  isRecording() {
    return false;
  }
  /** @inheritdoc */
  addEvent(_name, _attributesOrStartTime, _startTime) {
    return this;
  }
  /** @inheritDoc */
  addLink(_link) {
    return this;
  }
  /** @inheritDoc */
  addLinks(_links) {
    return this;
  }
  /**
   * This should generally not be used,
   * but we need it for being compliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  recordException(_exception, _time) {
  }
}
function isStreamedBeforeSendSpanCallback(callback) {
  return !!callback && typeof callback === "function" && "_streamed" in callback && !!callback._streamed;
}
function createEnvelope(headers, items = []) {
  return [headers, items];
}
function addItemToEnvelope(envelope, newItem) {
  const [headers, items] = envelope;
  return [headers, [...items, newItem]];
}
function forEachEnvelopeItem(envelope, callback) {
  const envelopeItems = envelope[1];
  for (const envelopeItem of envelopeItems) {
    const envelopeItemType = envelopeItem[0].type;
    const result = callback(envelopeItem, envelopeItemType);
    if (result) {
      return true;
    }
  }
  return false;
}
function envelopeContainsItemType(envelope, types) {
  return forEachEnvelopeItem(envelope, (_, type) => types.includes(type));
}
function encodeUTF8(input) {
  const carrier = getSentryCarrier(GLOBAL_OBJ);
  return carrier.encodePolyfill ? carrier.encodePolyfill(input) : new TextEncoder().encode(input);
}
function serializeEnvelope(envelope) {
  const [envHeaders, items] = envelope;
  let parts = JSON.stringify(envHeaders);
  function append(next) {
    if (typeof parts === "string") {
      parts = typeof next === "string" ? parts + next : [encodeUTF8(parts), next];
    } else {
      parts.push(typeof next === "string" ? encodeUTF8(next) : next);
    }
  }
  for (const item of items) {
    const [itemHeaders, payload] = item;
    append(`
${JSON.stringify(itemHeaders)}
`);
    if (typeof payload === "string" || payload instanceof Uint8Array) {
      append(payload);
    } else {
      let stringifiedPayload;
      try {
        stringifiedPayload = JSON.stringify(payload);
      } catch {
        stringifiedPayload = JSON.stringify(normalize(payload));
      }
      append(stringifiedPayload);
    }
  }
  return typeof parts === "string" ? parts : concatBuffers(parts);
}
function concatBuffers(buffers) {
  const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    merged.set(buffer, offset);
    offset += buffer.length;
  }
  return merged;
}
function createSpanEnvelopeItem(spanJson) {
  const spanHeaders = {
    type: "span"
  };
  return [spanHeaders, spanJson];
}
function createAttachmentEnvelopeItem(attachment) {
  const buffer = typeof attachment.data === "string" ? encodeUTF8(attachment.data) : attachment.data;
  return [
    {
      type: "attachment",
      length: buffer.length,
      filename: attachment.filename,
      content_type: attachment.contentType,
      attachment_type: attachment.attachmentType
    },
    buffer
  ];
}
const DATA_CATEGORY_OVERRIDES = {
  sessions: "session",
  event: "error",
  client_report: "internal",
  user_report: "default",
  profile_chunk: "profile",
  replay_event: "replay",
  replay_recording: "replay",
  check_in: "monitor",
  raw_security: "security",
  log: "log_item",
  trace_metric: "metric"
};
function _isOverriddenType(type) {
  return type in DATA_CATEGORY_OVERRIDES;
}
function envelopeItemTypeToDataCategory(type) {
  return _isOverriddenType(type) ? DATA_CATEGORY_OVERRIDES[type] : type;
}
function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
  if (!metadataOrEvent?.sdk) {
    return;
  }
  const { name, version } = metadataOrEvent.sdk;
  return { name, version };
}
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
  const dynamicSamplingContext = event.sdkProcessingMetadata?.dynamicSamplingContext;
  return {
    event_id: event.event_id,
    sent_at: new Date(safeDateNow()).toISOString(),
    ...sdkInfo && { sdk: sdkInfo },
    ...!!tunnel && dsn && { dsn: dsnToString(dsn) },
    ...dynamicSamplingContext && {
      trace: dynamicSamplingContext
    }
  };
}
function _enhanceEventWithSdkInfo(event, newSdkInfo) {
  if (!newSdkInfo) {
    return event;
  }
  const eventSdkInfo = event.sdk || {};
  event.sdk = {
    ...eventSdkInfo,
    name: eventSdkInfo.name || newSdkInfo.name,
    version: eventSdkInfo.version || newSdkInfo.version,
    integrations: [...event.sdk?.integrations || [], ...newSdkInfo.integrations || []],
    packages: [...event.sdk?.packages || [], ...newSdkInfo.packages || []],
    settings: event.sdk?.settings || newSdkInfo.settings ? {
      ...event.sdk?.settings,
      ...newSdkInfo.settings
    } : void 0
  };
  return event;
}
function createSessionEnvelope(session, dsn, metadata, tunnel) {
  const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  const envelopeHeaders = {
    sent_at: new Date(safeDateNow()).toISOString(),
    ...sdkInfo && { sdk: sdkInfo },
    ...!!tunnel && dsn && { dsn: dsnToString(dsn) }
  };
  const envelopeItem = "aggregates" in session ? [{ type: "sessions" }, session] : [{ type: "session" }, session.toJSON()];
  return createEnvelope(envelopeHeaders, [envelopeItem]);
}
function createEventEnvelope(event, dsn, metadata, tunnel) {
  const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
  const eventType = event.type && event.type !== "replay_event" ? event.type : "event";
  _enhanceEventWithSdkInfo(event, metadata?.sdk);
  const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
  delete event.sdkProcessingMetadata;
  const eventItem = [{ type: eventType }, event];
  return createEnvelope(envelopeHeaders, [eventItem]);
}
function createSpanEnvelope(spans, client) {
  function dscHasRequiredProps2(dsc2) {
    return !!dsc2.trace_id && !!dsc2.public_key;
  }
  const dsc = getDynamicSamplingContextFromSpan(spans[0]);
  const dsn = client?.getDsn();
  const tunnel = client?.getOptions().tunnel;
  const headers = {
    sent_at: new Date(safeDateNow()).toISOString(),
    ...dscHasRequiredProps2(dsc) && { trace: dsc },
    ...!!tunnel && dsn && { dsn: dsnToString(dsn) }
  };
  const { beforeSendSpan, ignoreSpans } = client?.getOptions() || {};
  const filteredSpans = ignoreSpans?.length ? spans.filter((span) => {
    const json = spanToJSON(span);
    return !shouldIgnoreSpan({ description: json.description, op: json.op, attributes: json.data }, ignoreSpans);
  }) : spans;
  const droppedSpans = spans.length - filteredSpans.length;
  if (droppedSpans) {
    client?.recordDroppedEvent("before_send", "span", droppedSpans);
  }
  const convertToSpanJSON = beforeSendSpan ? (span) => {
    const spanJson = spanToJSON(span);
    const processedSpan = !isStreamedBeforeSendSpanCallback(beforeSendSpan) ? beforeSendSpan(spanJson) : spanJson;
    if (!processedSpan) {
      showSpanDropWarning();
      return spanJson;
    }
    return processedSpan;
  } : spanToJSON;
  const items = [];
  for (const span of filteredSpans) {
    const spanJson = convertToSpanJSON(span);
    if (spanJson) {
      items.push(createSpanEnvelopeItem(spanJson));
    }
  }
  return createEnvelope(headers, items);
}
function logSpanStart(span) {
  if (!DEBUG_BUILD) return;
  const { description = "< unknown name >", op = "< unknown op >", parent_span_id: parentSpanId } = spanToJSON(span);
  const { spanId } = span.spanContext();
  const sampled = spanIsSampled(span);
  const rootSpan = getRootSpan(span);
  const isRootSpan = rootSpan === span;
  const header = `[Tracing] Starting ${sampled ? "sampled" : "unsampled"} ${isRootSpan ? "root " : ""}span`;
  const infoParts = [`op: ${op}`, `name: ${description}`, `ID: ${spanId}`];
  if (parentSpanId) {
    infoParts.push(`parent ID: ${parentSpanId}`);
  }
  if (!isRootSpan) {
    const { op: op2, description: description2 } = spanToJSON(rootSpan);
    infoParts.push(`root ID: ${rootSpan.spanContext().spanId}`);
    if (op2) {
      infoParts.push(`root op: ${op2}`);
    }
    if (description2) {
      infoParts.push(`root description: ${description2}`);
    }
  }
  debug.log(`${header}
  ${infoParts.join("\n  ")}`);
}
function logSpanEnd(span) {
  if (!DEBUG_BUILD) return;
  const { description = "< unknown name >", op = "< unknown op >" } = spanToJSON(span);
  const { spanId } = span.spanContext();
  const rootSpan = getRootSpan(span);
  const isRootSpan = rootSpan === span;
  const msg = `[Tracing] Finishing "${op}" ${isRootSpan ? "root " : ""}span "${description}" with ID ${spanId}`;
  debug.log(msg);
}
function timedEventsToMeasurements(events) {
  if (!events || events.length === 0) {
    return void 0;
  }
  const measurements = {};
  events.forEach((event) => {
    const attributes = event.attributes || {};
    const unit = attributes[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_UNIT];
    const value = attributes[SEMANTIC_ATTRIBUTE_SENTRY_MEASUREMENT_VALUE];
    if (typeof unit === "string" && typeof value === "number") {
      measurements[event.name] = { value, unit };
    }
  });
  return measurements;
}
function hasSpanStreamingEnabled(client) {
  return client.getOptions().traceLifecycle === "stream";
}
const MAX_SPAN_COUNT = 1e3;
class SentrySpan {
  /**
   * You should never call the constructor manually, always use `Sentry.startSpan()`
   * or other span methods.
   * @internal
   * @hideconstructor
   * @hidden
   */
  constructor(spanContext = {}) {
    this._traceId = spanContext.traceId || generateTraceId();
    this._spanId = spanContext.spanId || generateSpanId();
    this._startTime = spanContext.startTimestamp || timestampInSeconds();
    this._links = spanContext.links;
    this._attributes = {};
    this.setAttributes({
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "manual",
      [SEMANTIC_ATTRIBUTE_SENTRY_OP]: spanContext.op,
      ...spanContext.attributes
    });
    this._name = spanContext.name;
    if (spanContext.parentSpanId) {
      this._parentSpanId = spanContext.parentSpanId;
    }
    if ("sampled" in spanContext) {
      this._sampled = spanContext.sampled;
    }
    if (spanContext.endTimestamp) {
      this._endTime = spanContext.endTimestamp;
    }
    this._events = [];
    this._isStandaloneSpan = spanContext.isStandalone;
    if (this._endTime) {
      this._onSpanEnded();
    }
  }
  /** @inheritDoc */
  addLink(link) {
    if (this._links) {
      this._links.push(link);
    } else {
      this._links = [link];
    }
    return this;
  }
  /** @inheritDoc */
  addLinks(links) {
    if (this._links) {
      this._links.push(...links);
    } else {
      this._links = links;
    }
    return this;
  }
  /**
   * This should generally not be used,
   * but it is needed for being compliant with the OTEL Span interface.
   *
   * @hidden
   * @internal
   */
  recordException(_exception, _time) {
  }
  /** @inheritdoc */
  spanContext() {
    const { _spanId: spanId, _traceId: traceId, _sampled: sampled } = this;
    return {
      spanId,
      traceId,
      traceFlags: sampled ? TRACE_FLAG_SAMPLED : TRACE_FLAG_NONE
    };
  }
  /** @inheritdoc */
  setAttribute(key, value) {
    if (value === void 0) {
      delete this._attributes[key];
    } else {
      this._attributes[key] = value;
    }
    return this;
  }
  /** @inheritdoc */
  setAttributes(attributes) {
    Object.keys(attributes).forEach((key) => this.setAttribute(key, attributes[key]));
    return this;
  }
  /**
   * This should generally not be used,
   * but we need it for browser tracing where we want to adjust the start time afterwards.
   * USE THIS WITH CAUTION!
   *
   * @hidden
   * @internal
   */
  updateStartTime(timeInput) {
    this._startTime = spanTimeInputToSeconds(timeInput);
  }
  /**
   * @inheritDoc
   */
  setStatus(value) {
    this._status = value;
    return this;
  }
  /**
   * @inheritDoc
   */
  updateName(name) {
    this._name = name;
    this.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, "custom");
    return this;
  }
  /** @inheritdoc */
  end(endTimestamp) {
    if (this._endTime) {
      return;
    }
    this._endTime = spanTimeInputToSeconds(endTimestamp);
    logSpanEnd(this);
    this._onSpanEnded();
  }
  /**
   * Get JSON representation of this span.
   *
   * @hidden
   * @internal This method is purely for internal purposes and should not be used outside
   * of SDK code. If you need to get a JSON representation of a span,
   * use `spanToJSON(span)` instead.
   */
  getSpanJSON() {
    return {
      data: this._attributes,
      description: this._name,
      op: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
      parent_span_id: this._parentSpanId,
      span_id: this._spanId,
      start_timestamp: this._startTime,
      status: getStatusMessage(this._status),
      timestamp: this._endTime,
      trace_id: this._traceId,
      origin: this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
      profile_id: this._attributes[SEMANTIC_ATTRIBUTE_PROFILE_ID],
      exclusive_time: this._attributes[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
      measurements: timedEventsToMeasurements(this._events),
      is_segment: this._isStandaloneSpan && getRootSpan(this) === this || void 0,
      segment_id: this._isStandaloneSpan ? getRootSpan(this).spanContext().spanId : void 0,
      links: convertSpanLinksForEnvelope(this._links)
    };
  }
  /**
   * Get {@link StreamedSpanJSON} representation of this span.
   *
   * @hidden
   * @internal This method is purely for internal purposes and should not be used outside
   * of SDK code. If you need to get a JSON representation of a span,
   * use `spanToStreamedSpanJSON(span)` instead.
   */
  getStreamedSpanJSON() {
    return {
      name: this._name ?? "",
      span_id: this._spanId,
      trace_id: this._traceId,
      parent_span_id: this._parentSpanId,
      start_timestamp: this._startTime,
      // just in case _endTime is not set, we use the start time (i.e. duration 0)
      end_timestamp: this._endTime ?? this._startTime,
      is_segment: this._isStandaloneSpan || this === getRootSpan(this),
      status: getSimpleStatusMessage(this._status),
      attributes: this._attributes,
      links: getStreamedSpanLinks(this._links)
    };
  }
  /** @inheritdoc */
  isRecording() {
    return !this._endTime && !!this._sampled;
  }
  /**
   * @inheritdoc
   */
  addEvent(name, attributesOrStartTime, startTime) {
    DEBUG_BUILD && debug.log("[Tracing] Adding an event to span:", name);
    const time = isSpanTimeInput(attributesOrStartTime) ? attributesOrStartTime : startTime || timestampInSeconds();
    const attributes = isSpanTimeInput(attributesOrStartTime) ? {} : attributesOrStartTime || {};
    const event = {
      name,
      time: spanTimeInputToSeconds(time),
      attributes
    };
    this._events.push(event);
    return this;
  }
  /**
   * This method should generally not be used,
   * but for now we need a way to publicly check if the `_isStandaloneSpan` flag is set.
   * USE THIS WITH CAUTION!
   * @internal
   * @hidden
   * @experimental
   */
  isStandaloneSpan() {
    return !!this._isStandaloneSpan;
  }
  /** Emit `spanEnd` when the span is ended. */
  _onSpanEnded() {
    const client = getClient();
    if (client) {
      client.emit("spanEnd", this);
      if (!this._isStandaloneSpan) {
        client.emit("afterSpanEnd", this);
      }
    }
    const isSegmentSpan = this._isStandaloneSpan || this === getRootSpan(this);
    if (!isSegmentSpan) {
      return;
    }
    if (this._isStandaloneSpan) {
      if (this._sampled) {
        sendSpanEnvelope(createSpanEnvelope([this], client));
      } else {
        DEBUG_BUILD && debug.log("[Tracing] Discarding standalone span because its trace was not chosen to be sampled.");
        if (client) {
          client.recordDroppedEvent("sample_rate", "span");
        }
      }
      return;
    } else if (client && hasSpanStreamingEnabled(client)) {
      client.emit("afterSegmentSpanEnd", this);
      return;
    }
    const transactionEvent = this._convertSpanToTransaction();
    if (transactionEvent) {
      const scope = getCapturedScopesOnSpan(this).scope || getCurrentScope();
      scope.captureEvent(transactionEvent);
    }
  }
  /**
   * Finish the transaction & prepare the event to send to Sentry.
   */
  _convertSpanToTransaction() {
    if (!isFullFinishedSpan(spanToJSON(this))) {
      return void 0;
    }
    if (!this._name) {
      DEBUG_BUILD && debug.warn("Transaction has no name, falling back to `<unlabeled transaction>`.");
      this._name = "<unlabeled transaction>";
    }
    const { scope: capturedSpanScope, isolationScope: capturedSpanIsolationScope } = getCapturedScopesOnSpan(this);
    const normalizedRequest = capturedSpanScope?.getScopeData().sdkProcessingMetadata?.normalizedRequest;
    if (this._sampled !== true) {
      return void 0;
    }
    const finishedSpans = getSpanDescendants(this).filter((span) => span !== this && !isStandaloneSpan(span));
    const spans = finishedSpans.map((span) => spanToJSON(span)).filter(isFullFinishedSpan);
    const source = this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
    delete this._attributes[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
    let hasGenAiSpans = false;
    spans.forEach((span) => {
      delete span.data[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
      if (span.op?.startsWith("gen_ai.")) {
        hasGenAiSpans = true;
      }
    });
    const transaction = {
      contexts: {
        trace: spanToTransactionTraceContext(this)
      },
      spans: (
        // spans.sort() mutates the array, but `spans` is already a copy so we can safely do this here
        // we do not use spans anymore after this point
        spans.length > MAX_SPAN_COUNT ? spans.sort((a, b) => a.start_timestamp - b.start_timestamp).slice(0, MAX_SPAN_COUNT) : spans
      ),
      start_timestamp: this._startTime,
      timestamp: this._endTime,
      transaction: this._name,
      type: "transaction",
      sdkProcessingMetadata: {
        capturedSpanScope,
        capturedSpanIsolationScope,
        dynamicSamplingContext: getDynamicSamplingContextFromSpan(this),
        hasGenAiSpans
      },
      request: normalizedRequest,
      ...source && {
        transaction_info: {
          source
        }
      }
    };
    const measurements = timedEventsToMeasurements(this._events);
    const hasMeasurements = measurements && Object.keys(measurements).length;
    if (hasMeasurements) {
      DEBUG_BUILD && debug.log(
        "[Measurements] Adding measurements to transaction event",
        JSON.stringify(measurements, void 0, 2)
      );
      transaction.measurements = measurements;
    }
    return transaction;
  }
}
function isSpanTimeInput(value) {
  return value && typeof value === "number" || value instanceof Date || Array.isArray(value);
}
function isFullFinishedSpan(input) {
  return !!input.start_timestamp && !!input.timestamp && !!input.span_id && !!input.trace_id;
}
function isStandaloneSpan(span) {
  return span instanceof SentrySpan && span.isStandaloneSpan();
}
function sendSpanEnvelope(envelope) {
  const client = getClient();
  if (!client) {
    return;
  }
  const spanItems = envelope[1];
  if (!spanItems || spanItems.length === 0) {
    client.recordDroppedEvent("before_send", "span");
    return;
  }
  client.sendEnvelope(envelope);
}
function handleCallbackErrors(fn, onError, onFinally = () => {
}, onSuccess = () => {
}) {
  let maybePromiseResult;
  try {
    maybePromiseResult = fn();
  } catch (e) {
    onError(e);
    onFinally();
    throw e;
  }
  return maybeHandlePromiseRejection(maybePromiseResult, onError, onFinally, onSuccess);
}
function maybeHandlePromiseRejection(value, onError, onFinally, onSuccess) {
  if (isThenable(value)) {
    return chainAndCopyPromiseLike(
      value,
      (result) => {
        onFinally();
        onSuccess(result);
      },
      (err) => {
        onError(err);
        onFinally();
      }
    );
  }
  onFinally();
  onSuccess(value);
  return value;
}
function sampleSpan(options, samplingContext, sampleRand) {
  if (!hasSpansEnabled(options)) {
    return [false];
  }
  let localSampleRateWasApplied = void 0;
  let sampleRate;
  if (typeof options.tracesSampler === "function") {
    sampleRate = options.tracesSampler({
      ...samplingContext,
      inheritOrSampleWith: (fallbackSampleRate) => {
        if (typeof samplingContext.parentSampleRate === "number") {
          return samplingContext.parentSampleRate;
        }
        if (typeof samplingContext.parentSampled === "boolean") {
          return Number(samplingContext.parentSampled);
        }
        return fallbackSampleRate;
      }
    });
    localSampleRateWasApplied = true;
  } else if (samplingContext.parentSampled !== void 0) {
    sampleRate = samplingContext.parentSampled;
  } else if (typeof options.tracesSampleRate !== "undefined") {
    sampleRate = options.tracesSampleRate;
    localSampleRateWasApplied = true;
  }
  const parsedSampleRate = parseSampleRate(sampleRate);
  if (parsedSampleRate === void 0) {
    DEBUG_BUILD && debug.warn(
      `[Tracing] Discarding root span because of invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(
        sampleRate
      )} of type ${JSON.stringify(typeof sampleRate)}.`
    );
    return [false];
  }
  if (!parsedSampleRate) {
    DEBUG_BUILD && debug.log(
      `[Tracing] Discarding transaction because ${typeof options.tracesSampler === "function" ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0"}`
    );
    return [false, parsedSampleRate, localSampleRateWasApplied];
  }
  const shouldSample = sampleRand < parsedSampleRate;
  if (!shouldSample) {
    DEBUG_BUILD && debug.log(
      `[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(
        sampleRate
      )})`
    );
  }
  return [shouldSample, parsedSampleRate, localSampleRateWasApplied];
}
const SUPPRESS_TRACING_KEY = "__SENTRY_SUPPRESS_TRACING__";
function startSpan(options, callback) {
  const acs = getAcs();
  if (acs.startSpan) {
    return acs.startSpan(options, callback);
  }
  const spanArguments = parseSentrySpanArguments(options);
  const { forceTransaction, parentSpan: customParentSpan, scope: customScope } = options;
  const customForkedScope = customScope?.clone();
  return withScope(customForkedScope, () => {
    const wrapper = getActiveSpanWrapper(customParentSpan);
    return wrapper(() => {
      const scope = getCurrentScope();
      const parentSpan = getParentSpan(scope, customParentSpan);
      const client = getClient();
      const missingRequiredParent = options.onlyIfParent && !parentSpan;
      const activeSpan = missingRequiredParent ? new SentryNonRecordingSpan() : createChildOrRootSpan({
        parentSpan,
        spanArguments,
        forceTransaction,
        scope
      });
      if (missingRequiredParent) {
        client?.recordDroppedEvent("no_parent_span", "span");
      }
      if (!_isIgnoredSpan(activeSpan) || !parentSpan) {
        _setSpanForScope(scope, activeSpan);
      }
      return handleCallbackErrors(
        () => callback(activeSpan),
        () => {
          const { status } = spanToJSON(activeSpan);
          if (activeSpan.isRecording() && (!status || status === "ok")) {
            activeSpan.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
          }
        },
        () => {
          activeSpan.end();
        }
      );
    });
  });
}
function startSpanManual(options, callback) {
  const acs = getAcs();
  if (acs.startSpanManual) {
    return acs.startSpanManual(options, callback);
  }
  const spanArguments = parseSentrySpanArguments(options);
  const { forceTransaction, parentSpan: customParentSpan, scope: customScope } = options;
  const customForkedScope = customScope?.clone();
  return withScope(customForkedScope, () => {
    const wrapper = getActiveSpanWrapper(customParentSpan);
    return wrapper(() => {
      const scope = getCurrentScope();
      const parentSpan = getParentSpan(scope, customParentSpan);
      const missingRequiredParent = options.onlyIfParent && !parentSpan;
      const activeSpan = missingRequiredParent ? new SentryNonRecordingSpan() : createChildOrRootSpan({
        parentSpan,
        spanArguments,
        forceTransaction,
        scope
      });
      if (missingRequiredParent) {
        getClient()?.recordDroppedEvent("no_parent_span", "span");
      }
      if (!_isIgnoredSpan(activeSpan) || !parentSpan) {
        _setSpanForScope(scope, activeSpan);
      }
      return handleCallbackErrors(
        // We pass the `finish` function to the callback, so the user can finish the span manually
        // this is mainly here for historic purposes because previously, we instructed users to call
        // `finish` instead of `span.end()` to also clean up the scope. Nowadays, calling `span.end()`
        // or `finish` has the same effect and we simply leave it here to avoid breaking user code.
        () => callback(activeSpan, () => activeSpan.end()),
        () => {
          const { status } = spanToJSON(activeSpan);
          if (activeSpan.isRecording() && (!status || status === "ok")) {
            activeSpan.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
          }
        }
      );
    });
  });
}
function startInactiveSpan(options) {
  const acs = getAcs();
  if (acs.startInactiveSpan) {
    return acs.startInactiveSpan(options);
  }
  const spanArguments = parseSentrySpanArguments(options);
  const { forceTransaction, parentSpan: customParentSpan } = options;
  const wrapper = options.scope ? (callback) => withScope(options.scope, callback) : customParentSpan !== void 0 ? (callback) => withActiveSpan(customParentSpan, callback) : (callback) => callback();
  return wrapper(() => {
    const scope = getCurrentScope();
    const parentSpan = getParentSpan(scope, customParentSpan);
    const client = getClient();
    const missingRequiredParent = options.onlyIfParent && !parentSpan;
    if (missingRequiredParent) {
      client?.recordDroppedEvent("no_parent_span", "span");
      return new SentryNonRecordingSpan();
    }
    return createChildOrRootSpan({
      parentSpan,
      spanArguments,
      forceTransaction,
      scope
    });
  });
}
const continueTrace = (options, callback) => {
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  if (acs.continueTrace) {
    return acs.continueTrace(options, callback);
  }
  const { sentryTrace, baggage } = options;
  const client = getClient();
  const incomingDsc = baggageHeaderToDynamicSamplingContext(baggage);
  if (client && !shouldContinueTrace(client, incomingDsc?.org_id)) {
    return startNewTrace(callback);
  }
  return withScope((scope) => {
    const propagationContext = propagationContextFromHeaders(sentryTrace, baggage);
    scope.setPropagationContext(propagationContext);
    _setSpanForScope(scope, void 0);
    return callback();
  });
};
function withActiveSpan(span, callback) {
  const acs = getAcs();
  if (acs.withActiveSpan) {
    return acs.withActiveSpan(span, callback);
  }
  return withScope((scope) => {
    _setSpanForScope(scope, span || void 0);
    return callback(scope);
  });
}
function suppressTracing(callback) {
  const acs = getAcs();
  if (acs.suppressTracing) {
    return acs.suppressTracing(callback);
  }
  return withScope((scope) => {
    scope.setSDKProcessingMetadata({ [SUPPRESS_TRACING_KEY]: true });
    const res = callback();
    scope.setSDKProcessingMetadata({ [SUPPRESS_TRACING_KEY]: void 0 });
    return res;
  });
}
function startNewTrace(callback) {
  const acs = getAcs();
  if (acs.startNewTrace) {
    return acs.startNewTrace(callback);
  }
  return withScope((scope) => {
    scope.setPropagationContext({
      traceId: generateTraceId(),
      sampleRand: safeMathRandom()
    });
    DEBUG_BUILD && debug.log(`Starting a new trace with id ${scope.getPropagationContext().traceId}`);
    return withActiveSpan(null, callback);
  });
}
function createChildOrRootSpan({
  parentSpan,
  spanArguments,
  forceTransaction,
  scope
}) {
  if (!hasSpansEnabled()) {
    const span2 = new SentryNonRecordingSpan();
    if (forceTransaction || !parentSpan) {
      const dsc = {
        sampled: "false",
        sample_rate: "0",
        transaction: spanArguments.name,
        ...getDynamicSamplingContextFromSpan(span2)
      };
      freezeDscOnSpan(span2, dsc);
    }
    return span2;
  }
  const client = getClient();
  if (_shouldIgnoreStreamedSpan(client, spanArguments)) {
    if (!_isTracingSuppressed(scope)) {
      client?.recordDroppedEvent("ignored", "span");
    }
    return new SentryNonRecordingSpan({
      dropReason: "ignored",
      traceId: parentSpan?.spanContext().traceId ?? scope.getPropagationContext().traceId
    });
  }
  const isolationScope = getIsolationScope();
  let span;
  if (parentSpan && !forceTransaction) {
    span = _startChildSpan(parentSpan, scope, spanArguments);
    addChildSpanToSpan(parentSpan, span);
  } else if (parentSpan) {
    const dsc = getDynamicSamplingContextFromSpan(parentSpan);
    const { traceId, spanId: parentSpanId } = parentSpan.spanContext();
    const parentSampled = spanIsSampled(parentSpan);
    span = _startRootSpan(
      {
        traceId,
        parentSpanId,
        ...spanArguments
      },
      scope,
      parentSampled
    );
    freezeDscOnSpan(span, dsc);
  } else {
    const {
      traceId,
      dsc,
      parentSpanId,
      sampled: parentSampled
    } = {
      ...isolationScope.getPropagationContext(),
      ...scope.getPropagationContext()
    };
    span = _startRootSpan(
      {
        traceId,
        parentSpanId,
        ...spanArguments
      },
      scope,
      parentSampled
    );
    if (dsc) {
      freezeDscOnSpan(span, dsc);
    }
  }
  logSpanStart(span);
  setCapturedScopesOnSpan(span, scope, isolationScope);
  return span;
}
function parseSentrySpanArguments(options) {
  const exp = options.experimental || {};
  const initialCtx = {
    isStandalone: exp.standalone,
    ...options
  };
  if (options.startTime) {
    const ctx = { ...initialCtx };
    ctx.startTimestamp = spanTimeInputToSeconds(options.startTime);
    delete ctx.startTime;
    return ctx;
  }
  return initialCtx;
}
function getAcs() {
  const carrier = getMainCarrier();
  return getAsyncContextStrategy(carrier);
}
function _startRootSpan(spanArguments, scope, parentSampled) {
  const client = getClient();
  const options = client?.getOptions() || {};
  const { name = "" } = spanArguments;
  const mutableSpanSamplingData = { spanAttributes: { ...spanArguments.attributes }, spanName: name, parentSampled };
  client?.emit("beforeSampling", mutableSpanSamplingData, { decision: false });
  const finalParentSampled = mutableSpanSamplingData.parentSampled ?? parentSampled;
  const finalAttributes = mutableSpanSamplingData.spanAttributes;
  const currentPropagationContext = scope.getPropagationContext();
  const isTracingSuppressed = _isTracingSuppressed(scope);
  const [sampled, sampleRate, localSampleRateWasApplied] = isTracingSuppressed ? [false] : sampleSpan(
    options,
    {
      name,
      parentSampled: finalParentSampled,
      attributes: finalAttributes,
      parentSampleRate: parseSampleRate(currentPropagationContext.dsc?.sample_rate)
    },
    currentPropagationContext.sampleRand
  );
  const rootSpan = new SentrySpan({
    ...spanArguments,
    attributes: {
      [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "custom",
      [SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE]: sampleRate !== void 0 && localSampleRateWasApplied ? sampleRate : void 0,
      ...finalAttributes
    },
    sampled
  });
  if (!sampled && client && !isTracingSuppressed) {
    DEBUG_BUILD && debug.log("[Tracing] Discarding root span because its trace was not chosen to be sampled.");
    client.recordDroppedEvent("sample_rate", hasSpanStreamingEnabled(client) ? "span" : "transaction");
  }
  if (client) {
    client.emit("spanStart", rootSpan);
  }
  return rootSpan;
}
function _startChildSpan(parentSpan, scope, spanArguments) {
  const { spanId, traceId } = parentSpan.spanContext();
  const isTracingSuppressed = _isTracingSuppressed(scope);
  const sampled = isTracingSuppressed ? false : spanIsSampled(parentSpan);
  const childSpan = sampled ? new SentrySpan({
    ...spanArguments,
    parentSpanId: spanId,
    traceId,
    sampled
  }) : new SentryNonRecordingSpan({ traceId });
  addChildSpanToSpan(parentSpan, childSpan);
  const client = getClient();
  if (!client) {
    return childSpan;
  }
  if (hasSpanStreamingEnabled(client) && childSpan instanceof SentryNonRecordingSpan) {
    if (parentSpan instanceof SentryNonRecordingSpan && parentSpan.dropReason) {
      childSpan.dropReason = parentSpan.dropReason;
      client.recordDroppedEvent(parentSpan.dropReason, "span");
    } else if (!isTracingSuppressed) {
      childSpan.dropReason = "sample_rate";
      client.recordDroppedEvent("sample_rate", "span");
    }
  }
  client.emit("spanStart", childSpan);
  if (spanArguments.endTimestamp) {
    client.emit("spanEnd", childSpan);
    client.emit("afterSpanEnd", childSpan);
  }
  return childSpan;
}
function getParentSpan(scope, customParentSpan) {
  if (customParentSpan) {
    return customParentSpan;
  }
  if (customParentSpan === null) {
    return void 0;
  }
  const span = _getSpanForScope(scope);
  if (!span) {
    return void 0;
  }
  const client = getClient();
  const options = client ? client.getOptions() : {};
  if (options.parentSpanIsAlwaysRootSpan) {
    return getRootSpan(span);
  }
  return span;
}
function getActiveSpanWrapper(parentSpan) {
  return parentSpan !== void 0 ? (callback) => {
    return withActiveSpan(parentSpan, callback);
  } : (callback) => callback();
}
function _shouldIgnoreStreamedSpan(client, spanArguments) {
  const ignoreSpans = client?.getOptions().ignoreSpans;
  if (!client || !hasSpanStreamingEnabled(client) || !ignoreSpans?.length) {
    return false;
  }
  return shouldIgnoreSpan(
    {
      description: spanArguments.name || "",
      op: spanArguments.attributes?.[SEMANTIC_ATTRIBUTE_SENTRY_OP] || spanArguments.op,
      attributes: spanArguments.attributes
    },
    ignoreSpans
  );
}
function _isIgnoredSpan(span) {
  return span instanceof SentryNonRecordingSpan && span.dropReason === "ignored";
}
function _isTracingSuppressed(scope) {
  return scope.getScopeData().sdkProcessingMetadata[SUPPRESS_TRACING_KEY] === true;
}
function applyScopeDataToEvent(event, data) {
  const { fingerprint, span, breadcrumbs, sdkProcessingMetadata } = data;
  applyDataToEvent(event, data);
  if (span) {
    applySpanToEvent(event, span);
  }
  applyFingerprintToEvent(event, fingerprint);
  applyBreadcrumbsToEvent(event, breadcrumbs);
  applySdkMetadataToEvent(event, sdkProcessingMetadata);
}
function mergeScopeData(data, mergeData) {
  const {
    extra,
    tags,
    attributes,
    user,
    contexts,
    level,
    sdkProcessingMetadata,
    breadcrumbs,
    fingerprint,
    eventProcessors,
    attachments,
    propagationContext,
    transactionName,
    span
  } = mergeData;
  mergeAndOverwriteScopeData(data, "extra", extra);
  mergeAndOverwriteScopeData(data, "tags", tags);
  mergeAndOverwriteScopeData(data, "attributes", attributes);
  mergeAndOverwriteScopeData(data, "user", user);
  mergeAndOverwriteScopeData(data, "contexts", contexts);
  data.sdkProcessingMetadata = merge(data.sdkProcessingMetadata, sdkProcessingMetadata, 2);
  if (level) {
    data.level = level;
  }
  if (transactionName) {
    data.transactionName = transactionName;
  }
  if (span) {
    data.span = span;
  }
  if (breadcrumbs.length) {
    data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
  }
  if (fingerprint.length) {
    data.fingerprint = [...data.fingerprint, ...fingerprint];
  }
  if (eventProcessors.length) {
    data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
  }
  if (attachments.length) {
    data.attachments = [...data.attachments, ...attachments];
  }
  data.propagationContext = { ...data.propagationContext, ...propagationContext };
}
function mergeAndOverwriteScopeData(data, prop, mergeVal) {
  data[prop] = merge(data[prop], mergeVal, 1);
}
function getCombinedScopeData(isolationScope, currentScope) {
  const scopeData = getGlobalScope().getScopeData();
  isolationScope && mergeScopeData(scopeData, isolationScope.getScopeData());
  currentScope && mergeScopeData(scopeData, currentScope.getScopeData());
  return scopeData;
}
function applyDataToEvent(event, data) {
  const { extra, tags, user, contexts, level, transactionName } = data;
  if (Object.keys(extra).length) {
    event.extra = { ...extra, ...event.extra };
  }
  if (Object.keys(tags).length) {
    event.tags = { ...tags, ...event.tags };
  }
  if (Object.keys(user).length) {
    event.user = { ...user, ...event.user };
  }
  if (Object.keys(contexts).length) {
    event.contexts = { ...contexts, ...event.contexts };
  }
  if (level) {
    event.level = level;
  }
  if (transactionName && event.type !== "transaction") {
    event.transaction = transactionName;
  }
}
function applyBreadcrumbsToEvent(event, breadcrumbs) {
  const mergedBreadcrumbs = [...event.breadcrumbs || [], ...breadcrumbs];
  event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : void 0;
}
function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
  event.sdkProcessingMetadata = {
    ...event.sdkProcessingMetadata,
    ...sdkProcessingMetadata
  };
}
function applySpanToEvent(event, span) {
  event.contexts = {
    trace: spanToTraceContext(span),
    ...event.contexts
  };
  event.sdkProcessingMetadata = {
    dynamicSamplingContext: getDynamicSamplingContextFromSpan(span),
    ...event.sdkProcessingMetadata
  };
  const rootSpan = getRootSpan(span);
  const transactionName = spanToJSON(rootSpan).description;
  if (transactionName && !event.transaction && event.type === "transaction") {
    event.transaction = transactionName;
  }
}
function applyFingerprintToEvent(event, fingerprint) {
  event.fingerprint = event.fingerprint ? Array.isArray(event.fingerprint) ? event.fingerprint : [event.fingerprint] : [];
  if (fingerprint) {
    event.fingerprint = event.fingerprint.concat(fingerprint);
  }
  if (!event.fingerprint.length) {
    delete event.fingerprint;
  }
}
const DEFAULT_BASE_URL = "thismessage:/";
function isURLObjectRelative(url) {
  return "isRelative" in url;
}
function parseStringToURLObject(url, urlBase) {
  const isRelative = url.indexOf("://") <= 0 && url.indexOf("//") !== 0;
  const base = isRelative ? DEFAULT_BASE_URL : void 0;
  try {
    if ("canParse" in URL && !URL.canParse(url, base)) {
      return void 0;
    }
    const fullUrlObject = new URL(url, base);
    if (isRelative) {
      return {
        isRelative,
        pathname: fullUrlObject.pathname,
        search: fullUrlObject.search,
        hash: fullUrlObject.hash
      };
    }
    return fullUrlObject;
  } catch {
  }
  return void 0;
}
function getSanitizedUrlStringFromUrlObject(url) {
  if (isURLObjectRelative(url)) {
    return url.pathname;
  }
  const newUrl = new URL(url);
  newUrl.search = "";
  newUrl.hash = "";
  if (["80", "443"].includes(newUrl.port)) {
    newUrl.port = "";
  }
  if (newUrl.password) {
    newUrl.password = "%filtered%";
  }
  if (newUrl.username) {
    newUrl.username = "%filtered%";
  }
  return newUrl.toString();
}
function getHttpSpanNameFromUrlObject(urlObject, kind, request, routeName) {
  const method = request?.method?.toUpperCase() ?? "GET";
  const route = urlObject ? getSanitizedUrlStringFromUrlObject(urlObject) : "/";
  return `${method} ${route}`;
}
function getHttpSpanDetailsFromUrlObject(urlObject, kind, spanOrigin, request, routeName) {
  const attributes = {
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: spanOrigin,
    [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url"
  };
  if (request?.method) {
    attributes[SEMANTIC_ATTRIBUTE_HTTP_REQUEST_METHOD] = request.method.toUpperCase();
  }
  if (urlObject) {
    if (urlObject.search) {
      attributes["url.query"] = urlObject.search;
    }
    if (urlObject.hash) {
      attributes["url.fragment"] = urlObject.hash;
    }
    if (urlObject.pathname) {
      attributes["url.path"] = urlObject.pathname;
      if (urlObject.pathname === "/") {
        attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = "route";
      }
    }
    if (!isURLObjectRelative(urlObject)) {
      attributes[SEMANTIC_ATTRIBUTE_URL_FULL] = urlObject.href;
      if (urlObject.port) {
        attributes["url.port"] = urlObject.port;
      }
      if (urlObject.protocol) {
        attributes["url.scheme"] = urlObject.protocol;
      }
      if (urlObject.hostname) {
        attributes["url.domain"] = urlObject.hostname;
      }
    }
  }
  return [getHttpSpanNameFromUrlObject(urlObject, kind, request), attributes];
}
function parseUrl(url) {
  if (!url) {
    return {};
  }
  const match = url.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
  if (!match) {
    return {};
  }
  const query = match[6] || "";
  const fragment = match[8] || "";
  return {
    host: match[4],
    path: match[5],
    protocol: match[2],
    search: query,
    hash: fragment,
    relative: match[5] + query + fragment
    // everything minus origin
  };
}
function stripUrlQueryAndFragment(urlPath) {
  return urlPath.split(/[?#]/, 1)[0];
}
function getSanitizedUrlString(url) {
  const { protocol, host, path } = url;
  const filteredHost = host?.replace(/^.*@/, "[filtered]:[filtered]@").replace(/(:80)$/, "").replace(/(:443)$/, "") || "";
  return `${protocol ? `${protocol}://` : ""}${filteredHost}${path}`;
}
function stripDataUrlContent(url, includeDataPrefix = true) {
  if (url.startsWith("data:")) {
    const match = url.match(/^data:([^;,]+)/);
    const mimeType = match ? match[1] : "text/plain";
    const isBase64 = url.includes(";base64,");
    const dataStart = url.indexOf(",");
    let dataPrefix = "";
    if (includeDataPrefix && dataStart !== -1) {
      const data = url.slice(dataStart + 1);
      dataPrefix = data.length > 10 ? `${data.slice(0, 10)}... [truncated]` : data;
    }
    return `data:${mimeType}${isBase64 ? ",base64" : ""}${dataPrefix ? `,${dataPrefix}` : ""}`;
  }
  return url;
}
function scopeContextsToSpanAttributes(contexts) {
  const attrs = {};
  const { response, profile, cloud_resource, culture, state } = contexts;
  if (response) {
    if (response.status_code != null) {
      attrs["http.response.status_code"] = response.status_code;
    }
    if (response.body_size != null) {
      attrs["http.response.body.size"] = response.body_size;
    }
  }
  if (profile) {
    if (profile.profile_id) {
      attrs["sentry.profile_id"] = profile.profile_id;
    }
    if (profile.profiler_id) {
      attrs["sentry.profiler_id"] = profile.profiler_id;
    }
  }
  if (cloud_resource) {
    for (const [key, value] of Object.entries(cloud_resource)) {
      if (value != null) {
        attrs[key] = value;
      }
    }
  }
  if (culture) {
    if (culture.locale) {
      attrs["culture.locale"] = culture.locale;
    }
    if (culture.timezone) {
      attrs["culture.timezone"] = culture.timezone;
    }
  }
  if (state?.state && typeof state.state.type === "string") {
    attrs["state.type"] = state.state.type;
  }
  const angular = contexts["angular"];
  if (angular) {
    const version = angular["version"];
    if (typeof version === "string" || typeof version === "number") {
      attrs["angular.version"] = version;
    }
  }
  const react = contexts["react"];
  if (react) {
    const version = react["version"];
    if (typeof version === "string" || typeof version === "number") {
      attrs["react.version"] = version;
    }
  }
  return attrs;
}
function captureSpan(span, client) {
  const spanJSON = spanToStreamedSpanJSON(span);
  const segmentSpan = INTERNAL_getSegmentSpan(span);
  const serializedSegmentSpan = spanToStreamedSpanJSON(segmentSpan);
  const { isolationScope: spanIsolationScope, scope: spanScope } = getCapturedScopesOnSpan(span);
  const finalScopeData = getCombinedScopeData(spanIsolationScope, spanScope);
  applyCommonSpanAttributes(spanJSON, serializedSegmentSpan, client, finalScopeData);
  const spanKind = span.kind;
  inferSpanDataFromOtelAttributes(spanJSON, spanKind);
  if (spanJSON.is_segment) {
    applyScopeToSegmentSpan(spanJSON, finalScopeData);
    applySdkMetadataToSegmentSpan(spanJSON, client);
    client.emit("processSegmentSpan", spanJSON);
  }
  client.emit("processSpan", spanJSON);
  const { beforeSendSpan } = client.getOptions();
  const processedSpan = beforeSendSpan && isStreamedBeforeSendSpanCallback(beforeSendSpan) ? applyBeforeSendSpanCallback(spanJSON, beforeSendSpan) : spanJSON;
  const spanNameSource = processedSpan.attributes?.[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
  if (spanNameSource) {
    safeSetSpanJSONAttributes(processedSpan, {
      // Purposefully not using a constant defined here like in other attributes:
      // This will be the name for SEMANTIC_ATTRIBUTE_SENTRY_SOURCE in v11
      "sentry.span.source": spanNameSource
    });
  }
  return {
    ...streamedSpanJsonToSerializedSpan(processedSpan),
    _segmentSpan: segmentSpan
  };
}
function applyScopeToSegmentSpan(segmentSpanJSON, scopeData) {
  const contextAttributes = scopeContextsToSpanAttributes(scopeData.contexts);
  safeSetSpanJSONAttributes(segmentSpanJSON, contextAttributes);
}
function safeSetSpanJSONAttributes(spanJSON, newAttributes) {
  const originalAttributes = spanJSON.attributes ?? (spanJSON.attributes = {});
  Object.entries(newAttributes).forEach(([key, value]) => {
    if (value != null && !(key in originalAttributes)) {
      originalAttributes[key] = value;
    }
  });
}
function applySdkMetadataToSegmentSpan(segmentSpanJSON, client) {
  const integrationNames = client.getIntegrationNames();
  if (!integrationNames.length) return;
  safeSetSpanJSONAttributes(segmentSpanJSON, {
    [SEMANTIC_ATTRIBUTE_SENTRY_SDK_INTEGRATIONS]: integrationNames
  });
}
function applyCommonSpanAttributes(spanJSON, serializedSegmentSpan, client, scopeData) {
  const sdk = client.getSdkMetadata();
  const { release, environment } = client.getOptions();
  safeSetSpanJSONAttributes(spanJSON, {
    [SEMANTIC_ATTRIBUTE_SENTRY_RELEASE]: release,
    [SEMANTIC_ATTRIBUTE_SENTRY_ENVIRONMENT]: environment,
    [SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_NAME]: serializedSegmentSpan.name,
    [SEMANTIC_ATTRIBUTE_SENTRY_SEGMENT_ID]: serializedSegmentSpan.span_id,
    [SEMANTIC_ATTRIBUTE_SENTRY_SDK_NAME]: sdk?.sdk?.name,
    [SEMANTIC_ATTRIBUTE_SENTRY_SDK_VERSION]: sdk?.sdk?.version,
    [SEMANTIC_ATTRIBUTE_USER_ID]: scopeData.user?.id,
    [SEMANTIC_ATTRIBUTE_USER_EMAIL]: scopeData.user?.email,
    [SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS]: scopeData.user?.ip_address,
    [SEMANTIC_ATTRIBUTE_USER_USERNAME]: scopeData.user?.username,
    ...scopeData.attributes
  });
}
function applyBeforeSendSpanCallback(span, beforeSendSpan) {
  const modifedSpan = beforeSendSpan(span);
  if (!modifedSpan) {
    showSpanDropWarning();
    return span;
  }
  return modifedSpan;
}
const SPAN_KIND_SERVER = 1;
const SPAN_KIND_CLIENT = 2;
function inferSpanDataFromOtelAttributes(spanJSON, spanKind) {
  const attributes = spanJSON.attributes;
  if (!attributes) {
    return;
  }
  const httpMethod = attributes["http.request.method"] || attributes["http.method"];
  if (httpMethod) {
    inferHttpSpanData(spanJSON, attributes, spanKind, httpMethod);
    return;
  }
  const dbSystem = attributes["db.system.name"] || attributes["db.system"];
  const opIsCache = typeof attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] === "string" && `${attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP]}`.startsWith("cache.");
  if (dbSystem && !opIsCache) {
    inferDbSpanData(spanJSON, attributes);
    return;
  }
  if (attributes["rpc.service"]) {
    safeSetSpanJSONAttributes(spanJSON, { [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "rpc" });
    return;
  }
  if (attributes["messaging.system"]) {
    safeSetSpanJSONAttributes(spanJSON, { [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "message" });
    return;
  }
  const faasTrigger = attributes["faas.trigger"];
  if (faasTrigger) {
    safeSetSpanJSONAttributes(spanJSON, { [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${faasTrigger}` });
  }
}
function inferHttpSpanData(spanJSON, attributes, spanKind, httpMethod) {
  const opParts = ["http"];
  if (spanKind === SPAN_KIND_CLIENT) {
    opParts.push("client");
  } else if (spanKind === SPAN_KIND_SERVER) {
    opParts.push("server");
  }
  if (attributes["sentry.http.prefetch"]) {
    opParts.push("prefetch");
  }
  safeSetSpanJSONAttributes(spanJSON, { [SEMANTIC_ATTRIBUTE_SENTRY_OP]: opParts.join(".") });
  const customName = attributes[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
  if (typeof customName === "string") {
    spanJSON.name = customName;
    return;
  }
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] === "custom") {
    return;
  }
  const httpRoute = attributes["http.route"];
  if (typeof httpRoute === "string") {
    spanJSON.name = `${httpMethod} ${httpRoute}`;
    safeSetSpanJSONAttributes(spanJSON, { [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "route" });
  } else {
    if (spanKind === SPAN_KIND_CLIENT || spanKind === SPAN_KIND_SERVER) {
      const urlPath = getUrlPath(attributes, spanKind);
      if (urlPath) {
        spanJSON.name = `${httpMethod} ${urlPath}`;
      }
    }
    safeSetSpanJSONAttributes(spanJSON, { [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url" });
  }
}
function getUrlPath(attributes, spanKind) {
  const httpUrl = attributes["http.url"] || attributes["url.full"];
  const httpTarget = attributes["http.target"];
  const parsedUrl = typeof httpUrl === "string" ? parseUrl(httpUrl) : void 0;
  const sanitizedUrl = parsedUrl ? getSanitizedUrlString(parsedUrl) : void 0;
  if (spanKind === SPAN_KIND_SERVER && typeof httpTarget === "string") {
    return stripUrlQueryAndFragment(httpTarget);
  }
  if (sanitizedUrl) {
    return sanitizedUrl;
  }
  if (typeof httpTarget === "string") {
    return stripUrlQueryAndFragment(httpTarget);
  }
  return void 0;
}
function inferDbSpanData(spanJSON, attributes) {
  safeSetSpanJSONAttributes(spanJSON, { [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db" });
  const customName = attributes[SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME];
  if (typeof customName === "string") {
    spanJSON.name = customName;
    return;
  }
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] === "custom") {
    return;
  }
  const statement = attributes["db.statement"];
  if (statement) {
    spanJSON.name = `${statement}`;
    safeSetSpanJSONAttributes(spanJSON, { [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "task" });
  }
}
const STATE_PENDING = 0;
const STATE_RESOLVED = 1;
const STATE_REJECTED = 2;
function resolvedSyncPromise(value) {
  return new SyncPromise((resolve) => {
    resolve(value);
  });
}
function rejectedSyncPromise(reason) {
  return new SyncPromise((_, reject) => {
    reject(reason);
  });
}
class SyncPromise {
  constructor(executor) {
    this._state = STATE_PENDING;
    this._handlers = [];
    this._runExecutor(executor);
  }
  /** @inheritdoc */
  then(onfulfilled, onrejected) {
    return new SyncPromise((resolve, reject) => {
      this._handlers.push([
        false,
        (result) => {
          if (!onfulfilled) {
            resolve(result);
          } else {
            try {
              resolve(onfulfilled(result));
            } catch (e) {
              reject(e);
            }
          }
        },
        (reason) => {
          if (!onrejected) {
            reject(reason);
          } else {
            try {
              resolve(onrejected(reason));
            } catch (e) {
              reject(e);
            }
          }
        }
      ]);
      this._executeHandlers();
    });
  }
  /** @inheritdoc */
  catch(onrejected) {
    return this.then((val) => val, onrejected);
  }
  /** @inheritdoc */
  finally(onfinally) {
    return new SyncPromise((resolve, reject) => {
      let val;
      let isRejected;
      return this.then(
        (value) => {
          isRejected = false;
          val = value;
          if (onfinally) {
            onfinally();
          }
        },
        (reason) => {
          isRejected = true;
          val = reason;
          if (onfinally) {
            onfinally();
          }
        }
      ).then(() => {
        if (isRejected) {
          reject(val);
          return;
        }
        resolve(val);
      });
    });
  }
  /** Excute the resolve/reject handlers. */
  _executeHandlers() {
    if (this._state === STATE_PENDING) {
      return;
    }
    const cachedHandlers = this._handlers.slice();
    this._handlers = [];
    cachedHandlers.forEach((handler) => {
      if (handler[0]) {
        return;
      }
      if (this._state === STATE_RESOLVED) {
        handler[1](this._value);
      }
      if (this._state === STATE_REJECTED) {
        handler[2](this._value);
      }
      handler[0] = true;
    });
  }
  /** Run the executor for the SyncPromise. */
  _runExecutor(executor) {
    const setResult = (state, value) => {
      if (this._state !== STATE_PENDING) {
        return;
      }
      if (isThenable(value)) {
        void value.then(resolve, reject);
        return;
      }
      this._state = state;
      this._value = value;
      this._executeHandlers();
    };
    const resolve = (value) => {
      setResult(STATE_RESOLVED, value);
    };
    const reject = (reason) => {
      setResult(STATE_REJECTED, reason);
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
}
function notifyEventProcessors(processors, event, hint, index = 0) {
  try {
    const result = _notifyEventProcessors(event, hint, processors, index);
    return isThenable(result) ? result : resolvedSyncPromise(result);
  } catch (error2) {
    return rejectedSyncPromise(error2);
  }
}
function _notifyEventProcessors(event, hint, processors, index) {
  const processor = processors[index];
  if (!event || !processor) {
    return event;
  }
  const result = processor({ ...event }, hint);
  DEBUG_BUILD && result === null && debug.log(`Event processor "${processor.id || "?"}" dropped event`);
  if (isThenable(result)) {
    return result.then((final) => _notifyEventProcessors(final, hint, processors, index + 1));
  }
  return _notifyEventProcessors(result, hint, processors, index + 1);
}
let parsedStackResults;
let lastSentryKeysCount;
let lastNativeKeysCount;
let cachedFilenameDebugIds;
function getFilenameToDebugIdMap(stackParser) {
  const sentryDebugIdMap = GLOBAL_OBJ._sentryDebugIds;
  const nativeDebugIdMap = GLOBAL_OBJ._debugIds;
  if (!sentryDebugIdMap && !nativeDebugIdMap) {
    return {};
  }
  const sentryDebugIdKeys = sentryDebugIdMap ? Object.keys(sentryDebugIdMap) : [];
  const nativeDebugIdKeys = nativeDebugIdMap ? Object.keys(nativeDebugIdMap) : [];
  if (cachedFilenameDebugIds && sentryDebugIdKeys.length === lastSentryKeysCount && nativeDebugIdKeys.length === lastNativeKeysCount) {
    return cachedFilenameDebugIds;
  }
  lastSentryKeysCount = sentryDebugIdKeys.length;
  lastNativeKeysCount = nativeDebugIdKeys.length;
  cachedFilenameDebugIds = {};
  if (!parsedStackResults) {
    parsedStackResults = {};
  }
  const processDebugIds = (debugIdKeys, debugIdMap) => {
    for (const key of debugIdKeys) {
      const debugId = debugIdMap[key];
      const result = parsedStackResults?.[key];
      if (result && cachedFilenameDebugIds && debugId) {
        cachedFilenameDebugIds[result[0]] = debugId;
        if (parsedStackResults) {
          parsedStackResults[key] = [result[0], debugId];
        }
      } else if (debugId) {
        const parsedStack = stackParser(key);
        for (let i = parsedStack.length - 1; i >= 0; i--) {
          const stackFrame = parsedStack[i];
          const filename = stackFrame?.filename;
          if (filename && cachedFilenameDebugIds && parsedStackResults) {
            cachedFilenameDebugIds[filename] = debugId;
            parsedStackResults[key] = [filename, debugId];
            break;
          }
        }
      }
    }
  };
  if (sentryDebugIdMap) {
    processDebugIds(sentryDebugIdKeys, sentryDebugIdMap);
  }
  if (nativeDebugIdMap) {
    processDebugIds(nativeDebugIdKeys, nativeDebugIdMap);
  }
  return cachedFilenameDebugIds;
}
function prepareEvent(options, event, hint, scope, client, isolationScope) {
  const { normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = options;
  const prepared = {
    ...event,
    event_id: event.event_id || hint.event_id || uuid4(),
    timestamp: event.timestamp || dateTimestampInSeconds()
  };
  const integrations = hint.integrations || options.integrations.map((i) => i.name);
  applyClientOptions(prepared, options);
  applyIntegrationsMetadata(prepared, integrations);
  if (client) {
    client.emit("applyFrameMetadata", event);
  }
  if (event.type === void 0) {
    applyDebugIds(prepared, options.stackParser);
  }
  const finalScope = getFinalScope(scope, hint.captureContext);
  if (hint.mechanism) {
    addExceptionMechanism(prepared, hint.mechanism);
  }
  const clientEventProcessors = client ? client.getEventProcessors() : [];
  const data = getCombinedScopeData(isolationScope, finalScope);
  const attachments = [...hint.attachments || [], ...data.attachments];
  if (attachments.length) {
    hint.attachments = attachments;
  }
  applyScopeDataToEvent(prepared, data);
  const eventProcessors = [
    ...clientEventProcessors,
    // Run scope event processors _after_ all other processors
    ...data.eventProcessors
  ];
  const isInternalException = hint.data && hint.data.__sentry__ === true;
  const result = isInternalException ? resolvedSyncPromise(prepared) : notifyEventProcessors(eventProcessors, prepared, hint);
  return result.then((evt) => {
    if (evt) {
      applyDebugMeta(evt);
    }
    if (typeof normalizeDepth === "number" && normalizeDepth > 0) {
      return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
    }
    return evt;
  });
}
function applyClientOptions(event, options) {
  const { environment, release, dist, maxValueLength } = options;
  event.environment = event.environment || environment || DEFAULT_ENVIRONMENT;
  if (!event.release && release) {
    event.release = release;
  }
  if (!event.dist && dist) {
    event.dist = dist;
  }
  const request = event.request;
  if (request?.url && maxValueLength) {
    request.url = truncate(request.url, maxValueLength);
  }
  if (maxValueLength) {
    event.exception?.values?.forEach((exception) => {
      if (exception.value) {
        exception.value = truncate(exception.value, maxValueLength);
      }
    });
  }
}
function applyDebugIds(event, stackParser) {
  const filenameDebugIdMap = getFilenameToDebugIdMap(stackParser);
  event.exception?.values?.forEach((exception) => {
    exception.stacktrace?.frames?.forEach((frame) => {
      if (frame.filename) {
        frame.debug_id = filenameDebugIdMap[frame.filename];
      }
    });
  });
}
function applyDebugMeta(event) {
  const filenameDebugIdMap = {};
  event.exception?.values?.forEach((exception) => {
    exception.stacktrace?.frames?.forEach((frame) => {
      if (frame.debug_id) {
        if (frame.abs_path) {
          filenameDebugIdMap[frame.abs_path] = frame.debug_id;
        } else if (frame.filename) {
          filenameDebugIdMap[frame.filename] = frame.debug_id;
        }
        delete frame.debug_id;
      }
    });
  });
  if (Object.keys(filenameDebugIdMap).length === 0) {
    return;
  }
  event.debug_meta = event.debug_meta || {};
  event.debug_meta.images = event.debug_meta.images || [];
  const images = event.debug_meta.images;
  Object.entries(filenameDebugIdMap).forEach(([filename, debug_id]) => {
    images.push({
      type: "sourcemap",
      code_file: filename,
      debug_id
    });
  });
}
function applyIntegrationsMetadata(event, integrationNames) {
  if (integrationNames.length > 0) {
    event.sdk = event.sdk || {};
    event.sdk.integrations = [...event.sdk.integrations || [], ...integrationNames];
  }
}
function normalizeEvent(event, depth, maxBreadth) {
  if (!event) {
    return null;
  }
  const normalized = {
    ...event,
    ...event.breadcrumbs && {
      breadcrumbs: event.breadcrumbs.map((b) => ({
        ...b,
        ...b.data && {
          data: normalize(b.data, depth, maxBreadth)
        }
      }))
    },
    ...event.user && {
      user: normalize(event.user, depth, maxBreadth)
    },
    ...event.contexts && {
      contexts: normalize(event.contexts, depth, maxBreadth)
    },
    ...event.extra && {
      extra: normalize(event.extra, depth, maxBreadth)
    }
  };
  if (event.contexts?.trace && normalized.contexts) {
    normalized.contexts.trace = event.contexts.trace;
    if (event.contexts.trace.data) {
      normalized.contexts.trace.data = normalize(event.contexts.trace.data, depth, maxBreadth);
    }
  }
  if (event.spans) {
    normalized.spans = event.spans.map((span) => {
      return {
        ...span,
        ...span.data && {
          data: normalize(span.data, depth, maxBreadth)
        }
      };
    });
  }
  if (event.contexts?.flags && normalized.contexts) {
    normalized.contexts.flags = normalize(event.contexts.flags, 3, maxBreadth);
  }
  return normalized;
}
function getFinalScope(scope, captureContext) {
  if (!captureContext) {
    return scope;
  }
  const finalScope = scope ? scope.clone() : new Scope();
  finalScope.update(captureContext);
  return finalScope;
}
function parseEventHintOrCaptureContext(hint) {
  if (!hint) {
    return void 0;
  }
  if (hintIsScopeOrFunction(hint)) {
    return { captureContext: hint };
  }
  if (hintIsScopeContext(hint)) {
    return {
      captureContext: hint
    };
  }
  return hint;
}
function hintIsScopeOrFunction(hint) {
  return hint instanceof Scope || typeof hint === "function";
}
const captureContextKeys = [
  "user",
  "level",
  "extra",
  "contexts",
  "tags",
  "fingerprint",
  "propagationContext"
];
function hintIsScopeContext(hint) {
  return Object.keys(hint).some((key) => captureContextKeys.includes(key));
}
function captureException(exception, hint) {
  return getCurrentScope().captureException(exception, parseEventHintOrCaptureContext(hint));
}
function captureEvent(event, hint) {
  return getCurrentScope().captureEvent(event, hint);
}
async function flush(timeout) {
  const client = getClient();
  if (client) {
    return client.flush(timeout);
  }
  DEBUG_BUILD && debug.warn("Cannot flush events. No client defined.");
  return Promise.resolve(false);
}
function isEnabled() {
  const client = getClient();
  return client?.getOptions().enabled !== false && !!client?.getTransport();
}
function startSession(context) {
  const isolationScope = getIsolationScope();
  const { user } = getCombinedScopeData(isolationScope, getCurrentScope());
  const { userAgent } = GLOBAL_OBJ.navigator || {};
  const session = makeSession({
    user,
    ...userAgent && { userAgent },
    ...context
  });
  const currentSession = isolationScope.getSession();
  if (currentSession?.status === "ok") {
    updateSession(currentSession, { status: "exited" });
  }
  endSession();
  isolationScope.setSession(session);
  return session;
}
function endSession() {
  const isolationScope = getIsolationScope();
  const currentScope = getCurrentScope();
  const session = currentScope.getSession() || isolationScope.getSession();
  if (session) {
    closeSession(session);
  }
  _sendSessionUpdate();
  isolationScope.setSession();
}
function _sendSessionUpdate() {
  const isolationScope = getIsolationScope();
  const client = getClient();
  const session = isolationScope.getSession();
  if (session && client) {
    client.captureSession(session);
  }
}
const SENTRY_API_VERSION = "7";
function getBaseApiEndpoint(dsn) {
  const protocol = dsn.protocol ? `${dsn.protocol}:` : "";
  const port = dsn.port ? `:${dsn.port}` : "";
  return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ""}/api/`;
}
function _getIngestEndpoint(dsn) {
  return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
}
function _encodedAuth(dsn, sdkInfo) {
  const params = {
    sentry_version: SENTRY_API_VERSION
  };
  if (dsn.publicKey) {
    params.sentry_key = dsn.publicKey;
  }
  if (sdkInfo) {
    params.sentry_client = `${sdkInfo.name}/${sdkInfo.version}`;
  }
  return new URLSearchParams(params).toString();
}
function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel, sdkInfo) {
  return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
}
const installedIntegrations = [];
function filterDuplicates(integrations) {
  const integrationsByName = {};
  integrations.forEach((currentInstance) => {
    const { name } = currentInstance;
    const existingInstance = integrationsByName[name];
    if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) {
      return;
    }
    integrationsByName[name] = currentInstance;
  });
  return Object.values(integrationsByName);
}
function getIntegrationsToSetup(options) {
  const defaultIntegrations = options.defaultIntegrations || [];
  const userIntegrations = options.integrations;
  defaultIntegrations.forEach((integration) => {
    integration.isDefaultInstance = true;
  });
  let integrations;
  if (Array.isArray(userIntegrations)) {
    integrations = [...defaultIntegrations, ...userIntegrations];
  } else if (typeof userIntegrations === "function") {
    const resolvedUserIntegrations = userIntegrations(defaultIntegrations);
    integrations = Array.isArray(resolvedUserIntegrations) ? resolvedUserIntegrations : [resolvedUserIntegrations];
  } else {
    integrations = defaultIntegrations;
  }
  return filterDuplicates(integrations);
}
function setupIntegrations(client, integrations) {
  const integrationIndex = {};
  integrations.forEach((integration) => {
    if (integration?.beforeSetup) {
      integration.beforeSetup(client);
    }
  });
  integrations.forEach((integration) => {
    if (integration) {
      setupIntegration(client, integration, integrationIndex);
    }
  });
  return integrationIndex;
}
function afterSetupIntegrations(client, integrations) {
  for (const integration of integrations) {
    if (integration?.afterAllSetup) {
      integration.afterAllSetup(client);
    }
  }
}
function setupIntegration(client, integration, integrationIndex) {
  if (integrationIndex[integration.name]) {
    DEBUG_BUILD && debug.log(`Integration skipped because it was already installed: ${integration.name}`);
    return;
  }
  integrationIndex[integration.name] = integration;
  if (!installedIntegrations.includes(integration.name) && typeof integration.setupOnce === "function") {
    integration.setupOnce();
    installedIntegrations.push(integration.name);
  }
  if (integration.setup && typeof integration.setup === "function") {
    integration.setup(client);
  }
  if (typeof integration.preprocessEvent === "function") {
    const callback = integration.preprocessEvent.bind(integration);
    client.on("preprocessEvent", (event, hint) => callback(event, hint, client));
  }
  if (typeof integration.processEvent === "function") {
    const callback = integration.processEvent.bind(integration);
    const processor = Object.assign((event, hint) => callback(event, hint, client), {
      id: integration.name
    });
    client.addEventProcessor(processor);
  }
  ["processSpan", "processSegmentSpan"].forEach((hook) => {
    const callback = integration[hook];
    if (typeof callback === "function") {
      client.on(hook, (span) => callback.call(integration, span, client));
    }
  });
  DEBUG_BUILD && debug.log(`Integration installed: ${integration.name}`);
}
function defineIntegration(fn) {
  return fn;
}
const SEQUENCE_ATTR_KEY = "sentry.timestamp.sequence";
let _sequenceNumber = 0;
let _previousTimestampMs;
function getSequenceAttribute(timestampInSeconds2) {
  const nowMs = Math.floor(timestampInSeconds2 * 1e3);
  if (_previousTimestampMs !== void 0 && nowMs !== _previousTimestampMs) {
    _sequenceNumber = 0;
  }
  const value = _sequenceNumber;
  _sequenceNumber++;
  _previousTimestampMs = nowMs;
  return {
    key: SEQUENCE_ATTR_KEY,
    value: { value, type: "integer" }
  };
}
function _getTraceInfoFromScope(client, scope) {
  if (!scope) {
    return [void 0, void 0];
  }
  return withScope(scope, () => {
    const span = getActiveSpan();
    const traceContext = span ? spanToTraceContext(span) : getTraceContextFromScope(scope);
    const dynamicSamplingContext = span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromScope(client, scope);
    return [dynamicSamplingContext, traceContext];
  });
}
const SEVERITY_TEXT_TO_SEVERITY_NUMBER = {
  trace: 1,
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
  fatal: 21
};
function isBrowserBundle() {
  return typeof __SENTRY_BROWSER_BUNDLE__ !== "undefined" && !!__SENTRY_BROWSER_BUNDLE__;
}
function isNodeEnv() {
  return !isBrowserBundle() && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
}
function isBrowser() {
  return typeof window !== "undefined" && (!isNodeEnv() || isElectronNodeRenderer());
}
function isElectronNodeRenderer() {
  const process2 = GLOBAL_OBJ.process;
  return process2?.type === "renderer";
}
function createLogContainerEnvelopeItem(items, inferUserData) {
  const inferSetting = inferUserData ? "auto" : "never";
  return [
    {
      type: "log",
      item_count: items.length,
      content_type: "application/vnd.sentry.items.log+json"
    },
    {
      version: 2,
      ...isBrowser() && {
        ingest_settings: { infer_ip: inferSetting, infer_user_agent: inferSetting }
      },
      items
    }
  ];
}
function createLogEnvelope(logs, metadata, tunnel, dsn, inferUserData) {
  const headers = {};
  if (metadata?.sdk) {
    headers.sdk = {
      name: metadata.sdk.name,
      version: metadata.sdk.version
    };
  }
  if (!!tunnel && !!dsn) {
    headers.dsn = dsnToString(dsn);
  }
  return createEnvelope(headers, [createLogContainerEnvelopeItem(logs, inferUserData)]);
}
const MAX_LOG_BUFFER_SIZE = 100;
function setLogAttribute(logAttributes, key, value, setEvenIfPresent = true) {
  if (value && (!logAttributes[key] || setEvenIfPresent)) {
    logAttributes[key] = value;
  }
}
function _INTERNAL_captureSerializedLog(client, serializedLog) {
  const bufferMap = _getBufferMap$1();
  const logBuffer = _INTERNAL_getLogBuffer(client);
  if (logBuffer === void 0) {
    bufferMap.set(client, [serializedLog]);
  } else {
    if (logBuffer.length >= MAX_LOG_BUFFER_SIZE) {
      _INTERNAL_flushLogsBuffer(client, logBuffer);
      bufferMap.set(client, [serializedLog]);
    } else {
      bufferMap.set(client, [...logBuffer, serializedLog]);
    }
  }
}
function _INTERNAL_captureLog(beforeLog, currentScope = getCurrentScope(), captureSerializedLog = _INTERNAL_captureSerializedLog) {
  const client = currentScope?.getClient() ?? getClient();
  if (!client) {
    DEBUG_BUILD && debug.warn("No client available to capture log.");
    return;
  }
  const { release, environment, enableLogs = false, beforeSendLog } = client.getOptions();
  if (!enableLogs) {
    DEBUG_BUILD && debug.warn("logging option not enabled, log will not be captured.");
    return;
  }
  const [, traceContext] = _getTraceInfoFromScope(client, currentScope);
  const processedLogAttributes = {
    ...beforeLog.attributes
  };
  const {
    user: { id, email, username },
    attributes: scopeAttributes = {}
  } = getCombinedScopeData(getIsolationScope(), currentScope);
  setLogAttribute(processedLogAttributes, "user.id", id, false);
  setLogAttribute(processedLogAttributes, "user.email", email, false);
  setLogAttribute(processedLogAttributes, "user.name", username, false);
  setLogAttribute(processedLogAttributes, "sentry.release", release);
  setLogAttribute(processedLogAttributes, "sentry.environment", environment);
  const { name, version } = client.getSdkMetadata()?.sdk ?? {};
  setLogAttribute(processedLogAttributes, "sentry.sdk.name", name);
  setLogAttribute(processedLogAttributes, "sentry.sdk.version", version);
  const replay = client.getIntegrationByName("Replay");
  const replayId = replay?.getReplayId(true);
  setLogAttribute(processedLogAttributes, "sentry.replay_id", replayId);
  if (replayId && replay?.getRecordingMode() === "buffer") {
    setLogAttribute(processedLogAttributes, "sentry._internal.replay_is_buffering", true);
  }
  const beforeLogMessage = beforeLog.message;
  if (isParameterizedString(beforeLogMessage)) {
    const { __sentry_template_string__, __sentry_template_values__ = [] } = beforeLogMessage;
    if (__sentry_template_values__?.length) {
      processedLogAttributes["sentry.message.template"] = __sentry_template_string__;
    }
    __sentry_template_values__.forEach((param, index) => {
      processedLogAttributes[`sentry.message.parameter.${index}`] = param;
    });
  }
  const span = _getSpanForScope(currentScope);
  setLogAttribute(processedLogAttributes, "sentry.trace.parent_span_id", span?.spanContext().spanId);
  const processedLog = { ...beforeLog, attributes: processedLogAttributes };
  client.emit("beforeCaptureLog", processedLog);
  const log2 = beforeSendLog ? consoleSandbox(() => beforeSendLog(processedLog)) : processedLog;
  if (!log2) {
    client.recordDroppedEvent("before_send", "log_item", 1);
    DEBUG_BUILD && debug.warn("beforeSendLog returned null, log will not be captured.");
    return;
  }
  const { level, message, attributes: logAttributes = {}, severityNumber } = log2;
  const timestamp = timestampInSeconds();
  const sequenceAttr = getSequenceAttribute(timestamp);
  const serializedLog = {
    timestamp,
    level,
    body: _removeLoneSurrogates(String(message)),
    trace_id: traceContext?.trace_id,
    severity_number: severityNumber ?? SEVERITY_TEXT_TO_SEVERITY_NUMBER[level],
    attributes: sanitizeLogAttributes({
      ...serializeAttributes(scopeAttributes),
      ...serializeAttributes(logAttributes, true),
      [sequenceAttr.key]: sequenceAttr.value
    })
  };
  captureSerializedLog(client, serializedLog);
  client.emit("afterCaptureLog", log2);
}
function _INTERNAL_flushLogsBuffer(client, maybeLogBuffer) {
  const logBuffer = maybeLogBuffer ?? _INTERNAL_getLogBuffer(client) ?? [];
  if (logBuffer.length === 0) {
    return;
  }
  const clientOptions = client.getOptions();
  const envelope = createLogEnvelope(
    logBuffer,
    clientOptions._metadata,
    clientOptions.tunnel,
    client.getDsn(),
    client.getDataCollectionOptions().userInfo
  );
  _getBufferMap$1().set(client, []);
  client.emit("flushLogs");
  client.sendEnvelope(envelope);
}
function _INTERNAL_getLogBuffer(client) {
  return _getBufferMap$1().get(client);
}
function _getBufferMap$1() {
  return getGlobalSingleton("clientToLogBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function sanitizeLogAttributes(attributes) {
  const sanitized = {};
  for (const [key, attr] of Object.entries(attributes)) {
    const sanitizedKey = _removeLoneSurrogates(key);
    if (attr.type === "string") {
      sanitized[sanitizedKey] = { ...attr, value: _removeLoneSurrogates(attr.value) };
    } else {
      sanitized[sanitizedKey] = attr;
    }
  }
  return sanitized;
}
function _removeLoneSurrogates(str) {
  const strObj = Object(str);
  const isWellFormed = strObj["isWellFormed"];
  const toWellFormed = strObj["toWellFormed"];
  if (typeof isWellFormed === "function" && typeof toWellFormed === "function") {
    return isWellFormed.call(str) ? str : toWellFormed.call(str);
  }
  return str;
}
function createMetricContainerEnvelopeItem(items, inferUserData) {
  const inferSetting = inferUserData ? "auto" : "never";
  return [
    {
      type: "trace_metric",
      item_count: items.length,
      content_type: "application/vnd.sentry.items.trace-metric+json"
    },
    {
      version: 2,
      ...isBrowser() && {
        ingest_settings: { infer_ip: inferSetting, infer_user_agent: inferSetting }
      },
      items
    }
  ];
}
function createMetricEnvelope(metrics, metadata, tunnel, dsn, inferUserData) {
  const headers = {};
  if (metadata?.sdk) {
    headers.sdk = {
      name: metadata.sdk.name,
      version: metadata.sdk.version
    };
  }
  if (!!tunnel && !!dsn) {
    headers.dsn = dsnToString(dsn);
  }
  return createEnvelope(headers, [createMetricContainerEnvelopeItem(metrics, inferUserData)]);
}
function _INTERNAL_flushMetricsBuffer(client, maybeMetricBuffer) {
  const metricBuffer = maybeMetricBuffer ?? _INTERNAL_getMetricBuffer(client) ?? [];
  if (metricBuffer.length === 0) {
    return;
  }
  const clientOptions = client.getOptions();
  const envelope = createMetricEnvelope(
    metricBuffer,
    clientOptions._metadata,
    clientOptions.tunnel,
    client.getDsn(),
    client.getDataCollectionOptions().userInfo
  );
  _getBufferMap().set(client, []);
  client.emit("flushMetrics");
  client.sendEnvelope(envelope);
}
function _INTERNAL_getMetricBuffer(client) {
  return _getBufferMap().get(client);
}
function _getBufferMap() {
  return getGlobalSingleton("clientToMetricBufferMap", () => /* @__PURE__ */ new WeakMap());
}
function spanJsonToSerializedStreamedSpan(span) {
  const streamedSpan = {
    trace_id: span.trace_id,
    span_id: span.span_id,
    parent_span_id: span.parent_span_id,
    name: span.description || "",
    start_timestamp: span.start_timestamp,
    end_timestamp: span.timestamp || span.start_timestamp,
    status: !span.status || span.status === "ok" || span.status === "cancelled" ? "ok" : "error",
    is_segment: false,
    attributes: { ...span.data },
    links: span.links
  };
  return streamedSpanJsonToSerializedSpan(streamedSpan);
}
function extractGenAiSpansFromEvent(event, client) {
  if (event.type !== "transaction" || !event.spans?.length || !event.sdkProcessingMetadata?.hasGenAiSpans || !client.getOptions().streamGenAiSpans || hasSpanStreamingEnabled(client)) {
    return void 0;
  }
  const genAiSpans = [];
  const remainingSpans = [];
  for (const span of event.spans) {
    if (span.op?.startsWith("gen_ai.")) {
      genAiSpans.push(spanJsonToSerializedStreamedSpan(span));
    } else {
      remainingSpans.push(span);
    }
  }
  if (genAiSpans.length === 0) {
    return void 0;
  }
  event.spans = remainingSpans;
  const inferSetting = client.getDataCollectionOptions().userInfo ? "auto" : "never";
  return [
    { type: "span", item_count: genAiSpans.length, content_type: "application/vnd.sentry.items.span.v2+json" },
    {
      version: 2,
      ...isBrowser() && {
        ingest_settings: { infer_ip: inferSetting, infer_user_agent: inferSetting }
      },
      items: genAiSpans
    }
  ];
}
function safeUnref(timer) {
  if (typeof timer === "object" && typeof timer.unref === "function") {
    timer.unref();
  }
  return timer;
}
const SENTRY_BUFFER_FULL_ERROR = /* @__PURE__ */ Symbol.for("SentryBufferFullError");
function makePromiseBuffer(limit = 100) {
  const buffer = /* @__PURE__ */ new Set();
  function isReady() {
    return buffer.size < limit;
  }
  function remove(task) {
    buffer.delete(task);
  }
  function add(taskProducer) {
    if (!isReady()) {
      return rejectedSyncPromise(SENTRY_BUFFER_FULL_ERROR);
    }
    const task = taskProducer();
    buffer.add(task);
    void task.then(
      () => remove(task),
      () => remove(task)
    );
    return task;
  }
  function drain(timeout) {
    if (!buffer.size) {
      return resolvedSyncPromise(true);
    }
    const drainPromise = Promise.allSettled(Array.from(buffer)).then(() => true);
    if (!timeout) {
      return drainPromise;
    }
    const promises = [
      drainPromise,
      new Promise((resolve) => safeUnref(setTimeout(() => resolve(false), timeout)))
    ];
    return Promise.race(promises);
  }
  return {
    get $() {
      return Array.from(buffer);
    },
    add,
    drain
  };
}
const DEFAULT_RETRY_AFTER = 60 * 1e3;
function parseRetryAfterHeader(header, now = safeDateNow()) {
  const headerDelay = parseInt(`${header}`, 10);
  if (!isNaN(headerDelay)) {
    return headerDelay * 1e3;
  }
  const headerDate = Date.parse(`${header}`);
  if (!isNaN(headerDate)) {
    return headerDate - now;
  }
  return DEFAULT_RETRY_AFTER;
}
function disabledUntil(limits, dataCategory) {
  return limits[dataCategory] || limits.all || 0;
}
function isRateLimited(limits, dataCategory, now = safeDateNow()) {
  return disabledUntil(limits, dataCategory) > now;
}
function updateRateLimits(limits, { statusCode, headers }, now = safeDateNow()) {
  const updatedRateLimits = {
    ...limits
  };
  const rateLimitHeader = headers?.["x-sentry-rate-limits"];
  const retryAfterHeader = headers?.["retry-after"];
  if (rateLimitHeader) {
    for (const limit of rateLimitHeader.trim().split(",")) {
      const [retryAfter, categories, , , namespaces] = limit.split(":", 5);
      const headerDelay = parseInt(retryAfter, 10);
      const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1e3;
      if (!categories) {
        updatedRateLimits.all = now + delay;
      } else {
        for (const category of categories.split(";")) {
          if (category === "metric_bucket") {
            if (!namespaces || namespaces.split(";").includes("custom")) {
              updatedRateLimits[category] = now + delay;
            }
          } else {
            updatedRateLimits[category] = now + delay;
          }
        }
      }
    }
  } else if (retryAfterHeader) {
    updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
  } else if (statusCode === 429) {
    updatedRateLimits.all = now + 60 * 1e3;
  }
  return updatedRateLimits;
}
const DEFAULT_TRANSPORT_BUFFER_SIZE = 64;
function createTransport(options, makeRequest, buffer = makePromiseBuffer(
  options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE
)) {
  let rateLimits = {};
  const flush2 = (timeout) => buffer.drain(timeout);
  function send(envelope) {
    const filteredEnvelopeItems = [];
    forEachEnvelopeItem(envelope, (item, type) => {
      const dataCategory = envelopeItemTypeToDataCategory(type);
      if (isRateLimited(rateLimits, dataCategory)) {
        options.recordDroppedEvent("ratelimit_backoff", dataCategory);
      } else {
        filteredEnvelopeItems.push(item);
      }
    });
    if (filteredEnvelopeItems.length === 0) {
      return Promise.resolve({});
    }
    const filteredEnvelope = createEnvelope(envelope[0], filteredEnvelopeItems);
    const recordEnvelopeLoss = (reason) => {
      if (envelopeContainsItemType(filteredEnvelope, ["client_report"])) {
        DEBUG_BUILD && debug.warn(`Dropping client report. Will not send outcomes (reason: ${reason}).`);
        return;
      }
      forEachEnvelopeItem(filteredEnvelope, (item, type) => {
        options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type));
      });
    };
    const requestTask = () => makeRequest({ body: serializeEnvelope(filteredEnvelope) }).then(
      (response) => {
        if (response.statusCode === 413) {
          DEBUG_BUILD && debug.error(
            "Sentry responded with status code 413. Envelope was discarded due to exceeding size limits."
          );
          recordEnvelopeLoss("send_error");
          return response;
        }
        if (DEBUG_BUILD && response.statusCode !== void 0 && (response.statusCode < 200 || response.statusCode >= 300)) {
          debug.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
        }
        rateLimits = updateRateLimits(rateLimits, response);
        return response;
      },
      (error2) => {
        recordEnvelopeLoss("network_error");
        DEBUG_BUILD && debug.error("Encountered error running transport request:", error2);
        throw error2;
      }
    );
    return buffer.add(requestTask).then(
      (result) => result,
      (error2) => {
        if (error2 === SENTRY_BUFFER_FULL_ERROR) {
          DEBUG_BUILD && debug.error("Skipped sending event because buffer is full.");
          recordEnvelopeLoss("queue_overflow");
          return Promise.resolve({});
        } else {
          throw error2;
        }
      }
    );
  }
  return {
    send,
    flush: flush2
  };
}
function createClientReportEnvelope(discarded_events, dsn, timestamp) {
  const clientReportItem = [
    { type: "client_report" },
    {
      timestamp: dateTimestampInSeconds(),
      discarded_events
    }
  ];
  return createEnvelope(dsn ? { dsn } : {}, [clientReportItem]);
}
function getPossibleEventMessages(event) {
  const possibleMessages = [];
  if (event.message) {
    possibleMessages.push(event.message);
  }
  try {
    const lastException = event.exception.values[event.exception.values.length - 1];
    if (lastException?.value) {
      possibleMessages.push(lastException.value);
      if (lastException.type) {
        possibleMessages.push(`${lastException.type}: ${lastException.value}`);
      }
    }
  } catch {
  }
  return possibleMessages;
}
function convertTransactionEventToSpanJson(event) {
  const { trace_id, parent_span_id, span_id, status, origin, data, op } = event.contexts?.trace ?? {};
  return {
    data: data ?? {},
    description: event.transaction,
    op,
    parent_span_id,
    span_id: span_id ?? "",
    start_timestamp: event.start_timestamp ?? 0,
    status,
    timestamp: event.timestamp,
    trace_id: trace_id ?? "",
    origin,
    profile_id: data?.[SEMANTIC_ATTRIBUTE_PROFILE_ID],
    exclusive_time: data?.[SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME],
    measurements: event.measurements,
    is_segment: true
  };
}
function convertSpanJsonToTransactionEvent(span) {
  return {
    type: "transaction",
    timestamp: span.timestamp,
    start_timestamp: span.start_timestamp,
    transaction: span.description,
    contexts: {
      trace: {
        trace_id: span.trace_id,
        span_id: span.span_id,
        parent_span_id: span.parent_span_id,
        op: span.op,
        status: span.status,
        origin: span.origin,
        data: {
          ...span.data,
          ...span.profile_id && { [SEMANTIC_ATTRIBUTE_PROFILE_ID]: span.profile_id },
          ...span.exclusive_time && { [SEMANTIC_ATTRIBUTE_EXCLUSIVE_TIME]: span.exclusive_time }
        }
      }
    },
    measurements: span.measurements
  };
}
const FILTERED_VALUE = "[Filtered]";
const PII_HEADER_SNIPPETS = ["forwarded", "-ip", "remote-", "via", "-user"];
const SENSITIVE_KEY_SNIPPETS = [
  "auth",
  "token",
  "secret",
  "session",
  // for the user_session cookie
  "password",
  "passwd",
  "pwd",
  "key",
  "jwt",
  "bearer",
  "sso",
  "saml",
  "csrf",
  "xsrf",
  "credentials",
  "sid",
  "identity",
  // Always treat cookie headers as sensitive in case individual key-value cookie pairs cannot properly be extracted
  "set-cookie",
  "cookie"
];
const SENSITIVE_COOKIE_NAME_SNIPPETS = [
  // Express / Connect default session cookie
  ".sid",
  // Opaque session ids (PHPSESSID, ASPSESSIONID*, BIGipServer*, *sessid*, …)
  "sessid",
  // Laravel etc. "remember me" tokens
  "remember",
  // OIDC / OAuth auxiliary (`oauth*` covered by header snippet `auth`)
  "oidc",
  "pkce",
  "nonce",
  // RFC 6265bis high-security cookie name prefixes
  "__secure-",
  "__host-",
  // Load balancer / CDN sticky-session cookies (opaque routing tokens)
  "awsalb",
  "awselb",
  "akamai",
  // BaaS / IdP session cookies (names often omit "session")
  "__stripe",
  "cognito",
  "firebase",
  "supabase",
  "sb-",
  // Step-up / MFA cookies
  "mfa",
  "2fa"
];
function defaultPiiToCollectionOptions(sendDefaultPii) {
  return sendDefaultPii === true ? {
    userInfo: true,
    cookies: true,
    httpHeaders: { request: true, response: true },
    httpBodies: ["incomingRequest", "outgoingRequest", "incomingResponse", "outgoingResponse"],
    queryParams: true,
    genAI: { inputs: true, outputs: true },
    stackFrameVariables: true,
    frameContextLines: 7
    // default should be 5, but ContextLines integration uses 7
  } : {
    userInfo: false,
    cookies: { deny: PII_HEADER_SNIPPETS },
    httpHeaders: { request: { deny: PII_HEADER_SNIPPETS }, response: { deny: PII_HEADER_SNIPPETS } },
    httpBodies: [],
    queryParams: { deny: PII_HEADER_SNIPPETS },
    genAI: { inputs: false, outputs: false },
    stackFrameVariables: true,
    frameContextLines: 7
    // default should be 5, but ContextLines integration uses 7
  };
}
const DEFAULTS = {
  userInfo: true,
  cookies: true,
  httpHeaders: { request: true, response: true },
  httpBodies: ["incomingRequest", "outgoingRequest", "incomingResponse", "outgoingResponse"],
  queryParams: true,
  genAI: { inputs: true, outputs: true },
  stackFrameVariables: true,
  frameContextLines: 5
};
function resolveDataCollectionOptions(options) {
  const base = options.dataCollection != null ? DEFAULTS : defaultPiiToCollectionOptions(options.sendDefaultPii);
  const dc = options.dataCollection ?? {};
  return {
    userInfo: dc.userInfo ?? base.userInfo,
    cookies: dc.cookies ?? base.cookies,
    httpHeaders: {
      request: dc.httpHeaders?.request ?? base.httpHeaders.request,
      response: dc.httpHeaders?.response ?? base.httpHeaders.response
    },
    httpBodies: dc.httpBodies ?? base.httpBodies,
    queryParams: dc.queryParams ?? base.queryParams,
    genAI: {
      inputs: dc.genAI?.inputs ?? base.genAI.inputs,
      outputs: dc.genAI?.outputs ?? base.genAI.outputs
    },
    stackFrameVariables: dc.stackFrameVariables ?? base.stackFrameVariables,
    frameContextLines: dc.frameContextLines ?? base.frameContextLines
  };
}
const ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
const MISSING_RELEASE_FOR_SESSION_ERROR = "Discarded session because of missing or non-string release";
const INTERNAL_ERROR_SYMBOL = /* @__PURE__ */ Symbol.for("SentryInternalError");
const DO_NOT_SEND_EVENT_SYMBOL = /* @__PURE__ */ Symbol.for("SentryDoNotSendEventError");
const DEFAULT_FLUSH_INTERVAL = 5e3;
function _makeInternalError(message) {
  return {
    message,
    [INTERNAL_ERROR_SYMBOL]: true
  };
}
function _makeDoNotSendEventError(message) {
  return {
    message,
    [DO_NOT_SEND_EVENT_SYMBOL]: true
  };
}
function _isInternalError(error2) {
  return !!error2 && typeof error2 === "object" && INTERNAL_ERROR_SYMBOL in error2;
}
function _isDoNotSendEventError(error2) {
  return !!error2 && typeof error2 === "object" && DO_NOT_SEND_EVENT_SYMBOL in error2;
}
function setupWeightBasedFlushing(client, afterCaptureHook, flushHook, estimateSizeFn, flushFn) {
  let weight = 0;
  let flushTimeout;
  let isTimerActive = false;
  client.on(flushHook, () => {
    weight = 0;
    clearTimeout(flushTimeout);
    isTimerActive = false;
  });
  client.on(afterCaptureHook, (item) => {
    weight += estimateSizeFn(item);
    if (weight >= 8e5) {
      flushFn(client);
    } else if (!isTimerActive) {
      const flushInterval = client.getOptions()._flushInterval ?? DEFAULT_FLUSH_INTERVAL;
      if (flushInterval > 0) {
        isTimerActive = true;
        flushTimeout = safeUnref(
          setTimeout(() => {
            flushFn(client);
          }, flushInterval)
        );
      }
    }
  });
  client.on("flush", () => {
    flushFn(client);
  });
}
class Client {
  /**
   * Initializes this client instance.
   *
   * @param options Options for the client.
   */
  constructor(options) {
    this._options = options;
    this._integrations = {};
    this._numProcessing = 0;
    this._outcomes = {};
    this._hooks = {};
    this._eventProcessors = [];
    this._promiseBuffer = makePromiseBuffer(options.transportOptions?.bufferSize ?? DEFAULT_TRANSPORT_BUFFER_SIZE);
    this._dataCollection = resolveDataCollectionOptions(options);
    if (options.dsn) {
      this._dsn = makeDsn(options.dsn);
    } else {
      DEBUG_BUILD && debug.warn("No DSN provided, client will not send events.");
    }
    if (this._dsn) {
      const url = getEnvelopeEndpointWithUrlEncodedAuth(
        this._dsn,
        options.tunnel,
        options._metadata ? options._metadata.sdk : void 0
      );
      this._transport = options.transport({
        tunnel: this._options.tunnel,
        recordDroppedEvent: this.recordDroppedEvent.bind(this),
        ...options.transportOptions,
        url
      });
    }
    this._options.enableLogs = this._options.enableLogs ?? this._options._experiments?.enableLogs;
    if (this._options.enableLogs) {
      setupWeightBasedFlushing(this, "afterCaptureLog", "flushLogs", estimateLogSizeInBytes, _INTERNAL_flushLogsBuffer);
    }
    const enableMetrics = this._options.enableMetrics ?? this._options._experiments?.enableMetrics ?? true;
    if (enableMetrics) {
      setupWeightBasedFlushing(
        this,
        "afterCaptureMetric",
        "flushMetrics",
        estimateMetricSizeInBytes,
        _INTERNAL_flushMetricsBuffer
      );
    }
  }
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * Unlike `captureException` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureException(exception, hint, scope) {
    const eventId = uuid4();
    if (checkOrSetAlreadyCaught(exception)) {
      DEBUG_BUILD && debug.log(ALREADY_SEEN_ERROR);
      return eventId;
    }
    const hintWithEventId = {
      event_id: eventId,
      ...hint
    };
    this._process(
      () => this.eventFromException(exception, hintWithEventId).then((event) => this._captureEvent(event, hintWithEventId, scope)).then((res) => res),
      "error"
    );
    return hintWithEventId.event_id;
  }
  /**
   * Captures a message event and sends it to Sentry.
   *
   * Unlike `captureMessage` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureMessage(message, level, hint, currentScope) {
    const hintWithEventId = {
      event_id: uuid4(),
      ...hint
    };
    const eventMessage = isParameterizedString(message) ? message : String(message);
    const isMessage = isPrimitive(message);
    const promisedEvent = isMessage ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
    this._process(
      () => promisedEvent.then((event) => this._captureEvent(event, hintWithEventId, currentScope)),
      isMessage ? "unknown" : "error"
    );
    return hintWithEventId.event_id;
  }
  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * Unlike `captureEvent` exported from every SDK, this method requires that you pass it the current scope.
   */
  captureEvent(event, hint, currentScope) {
    const eventId = uuid4();
    if (hint?.originalException && checkOrSetAlreadyCaught(hint.originalException)) {
      DEBUG_BUILD && debug.log(ALREADY_SEEN_ERROR);
      return eventId;
    }
    const hintWithEventId = {
      event_id: eventId,
      ...hint
    };
    const sdkProcessingMetadata = event.sdkProcessingMetadata || {};
    const capturedSpanScope = sdkProcessingMetadata.capturedSpanScope;
    const capturedSpanIsolationScope = sdkProcessingMetadata.capturedSpanIsolationScope;
    const dataCategory = getDataCategoryByType(event.type);
    this._process(
      () => this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope, capturedSpanIsolationScope),
      dataCategory
    );
    return hintWithEventId.event_id;
  }
  /**
   * Captures a session.
   */
  captureSession(session) {
    this.sendSession(session);
    updateSession(session, { init: false });
  }
  /**
   * Get the current Dsn.
   */
  getDsn() {
    return this._dsn;
  }
  /**
   * Get the current options.
   */
  getOptions() {
    return this._options;
  }
  /**
   * Get the resolved data collection configuration.
   */
  getDataCollectionOptions() {
    return this._dataCollection;
  }
  /**
   * Get the SDK metadata.
   * @see SdkMetadata
   */
  getSdkMetadata() {
    return this._options._metadata;
  }
  /**
   * Returns the transport that is used by the client.
   * Please note that the transport gets lazy initialized so it will only be there once the first event has been sent.
   */
  getTransport() {
    return this._transport;
  }
  /**
   * Wait for all events to be sent or the timeout to expire, whichever comes first.
   *
   * @param timeout Maximum time in ms the client should wait for events to be flushed. Omitting this parameter will
   *   cause the client to wait until all events are sent before resolving the promise.
   * @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
   * still events in the queue when the timeout is reached.
   */
  // @ts-expect-error - PromiseLike is a subset of Promise
  async flush(timeout) {
    const transport = this._transport;
    this.emit("flush");
    if (!transport) {
      return true;
    }
    const clientFinished = await this._isClientDoneProcessing(timeout);
    const transportFlushed = await transport.flush(timeout);
    return clientFinished && transportFlushed;
  }
  /**
   * Flush the event queue and set the client to `enabled = false`. See {@link Client.flush}.
   *
   * @param {number} timeout Maximum time in ms the client should wait before shutting down. Omitting this parameter will cause
   *   the client to wait until all events are sent before disabling itself.
   * @returns {Promise<boolean>} A promise which resolves to `true` if the flush completes successfully before the timeout, or `false` if
   * it doesn't.
   */
  // @ts-expect-error - PromiseLike is a subset of Promise
  async close(timeout) {
    _INTERNAL_flushLogsBuffer(this);
    const result = await this.flush(timeout);
    this.getOptions().enabled = false;
    this.emit("close");
    return result;
  }
  /**
   * Get all installed event processors.
   */
  getEventProcessors() {
    return this._eventProcessors;
  }
  /**
   * Adds an event processor that applies to any event processed by this client.
   */
  addEventProcessor(eventProcessor) {
    this._eventProcessors.push(eventProcessor);
  }
  /**
   * Initialize this client.
   * Call this after the client was set on a scope.
   */
  init() {
    if (this._isEnabled() || // Force integrations to be setup even if no DSN was set when we have
    // Spotlight enabled. This is particularly important for browser as we
    // don't support the `spotlight` option there and rely on the users
    // adding the `spotlightBrowserIntegration()` to their integrations which
    // wouldn't get initialized with the check below when there's no DSN set.
    this._options.integrations.some(({ name }) => name.startsWith("Spotlight"))) {
      this._setupIntegrations();
    }
  }
  /**
   * Gets an installed integration by its name.
   *
   * @returns {Integration|undefined} The installed integration or `undefined` if no integration with that `name` was installed.
   */
  getIntegrationByName(integrationName) {
    return this._integrations[integrationName];
  }
  /**
   * Returns the names of all installed integrations.
   */
  getIntegrationNames() {
    return Object.keys(this._integrations);
  }
  /**
   * Add an integration to the client.
   * This can be used to e.g. lazy load integrations.
   * In most cases, this should not be necessary,
   * and you're better off just passing the integrations via `integrations: []` at initialization time.
   * However, if you find the need to conditionally load & add an integration, you can use `addIntegration` to do so.
   */
  addIntegration(integration) {
    const isAlreadyInstalled = this._integrations[integration.name];
    if (!isAlreadyInstalled && integration.beforeSetup) {
      integration.beforeSetup(this);
    }
    setupIntegration(this, integration, this._integrations);
    if (!isAlreadyInstalled) {
      afterSetupIntegrations(this, [integration]);
    }
  }
  /**
   * Send a fully prepared event to Sentry.
   */
  sendEvent(event, hint = {}) {
    this.emit("beforeSendEvent", event, hint);
    const genAiSpanItem = extractGenAiSpansFromEvent(event, this);
    let env = createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
    for (const attachment of hint.attachments || []) {
      env = addItemToEnvelope(env, createAttachmentEnvelopeItem(attachment));
    }
    if (genAiSpanItem) {
      env = addItemToEnvelope(env, genAiSpanItem);
    }
    this.sendEnvelope(env).then((sendResponse) => this.emit("afterSendEvent", event, sendResponse));
  }
  /**
   * Send a session or session aggregrates to Sentry.
   */
  sendSession(session) {
    const { release: clientReleaseOption, environment: clientEnvironmentOption = DEFAULT_ENVIRONMENT } = this._options;
    if ("aggregates" in session) {
      const sessionAttrs = session.attrs || {};
      if (!sessionAttrs.release && !clientReleaseOption) {
        DEBUG_BUILD && debug.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
        return;
      }
      sessionAttrs.release = sessionAttrs.release || clientReleaseOption;
      sessionAttrs.environment = sessionAttrs.environment || clientEnvironmentOption;
      session.attrs = sessionAttrs;
    } else {
      if (!session.release && !clientReleaseOption) {
        DEBUG_BUILD && debug.warn(MISSING_RELEASE_FOR_SESSION_ERROR);
        return;
      }
      session.release = session.release || clientReleaseOption;
      session.environment = session.environment || clientEnvironmentOption;
    }
    this.emit("beforeSendSession", session);
    const env = createSessionEnvelope(session, this._dsn, this._options._metadata, this._options.tunnel);
    this.sendEnvelope(env);
  }
  /**
   * Record on the client that an event got dropped (ie, an event that will not be sent to Sentry).
   */
  recordDroppedEvent(reason, category, count = 1) {
    if (this._options.sendClientReports) {
      const key = `${reason}:${category}`;
      DEBUG_BUILD && debug.log(`Recording outcome: "${key}"${count > 1 ? ` (${count} times)` : ""}`);
      this._outcomes[key] = (this._outcomes[key] || 0) + count;
    }
  }
  /**
   * Register a hook on this client.
   */
  on(hook, callback) {
    const hookCallbacks = this._hooks[hook] = this._hooks[hook] || /* @__PURE__ */ new Set();
    const uniqueCallback = (...args) => callback(...args);
    hookCallbacks.add(uniqueCallback);
    return () => {
      hookCallbacks.delete(uniqueCallback);
    };
  }
  /**
   * Emit a hook that was previously registered via `on()`.
   */
  emit(hook, ...rest) {
    const callbacks = this._hooks[hook];
    if (callbacks) {
      callbacks.forEach((callback) => callback(...rest));
    }
  }
  /**
   * Send an envelope to Sentry.
   */
  // @ts-expect-error - PromiseLike is a subset of Promise
  async sendEnvelope(envelope) {
    this.emit("beforeEnvelope", envelope);
    if (this._isEnabled() && this._transport) {
      try {
        return await this._transport.send(envelope);
      } catch (reason) {
        DEBUG_BUILD && debug.error("Error while sending envelope:", reason);
        return {};
      }
    }
    DEBUG_BUILD && debug.error("Transport disabled");
    return {};
  }
  /**
   * Register a cleanup function to be called when the client is disposed.
   * This is useful for integrations that need to clean up global state.
   *
   * NOTE: This is a no-op in the base `Client` class. Subclasses like `ServerRuntimeClient`
   * override this method to actually register and execute cleanup callbacks.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerCleanup(callback) {
  }
  /**
   * Disposes of the client and releases all resources.
   *
   * Subclasses should override this method to clean up their own resources, including invoking
   * any callbacks registered via {@link Client.registerCleanup}. The base implementation is a
   * no-op and does NOT execute registered cleanup callbacks.
   *
   * After calling dispose(), the client should not be used anymore.
   */
  dispose() {
  }
  /* eslint-enable @typescript-eslint/unified-signatures */
  /** Setup integrations for this client. */
  _setupIntegrations() {
    const { integrations } = this._options;
    this._integrations = setupIntegrations(this, integrations);
    afterSetupIntegrations(this, integrations);
  }
  /** Updates existing session based on the provided event */
  _updateSessionFromEvent(session, event) {
    let crashed = event.level === "fatal";
    let errored = false;
    const exceptions = event.exception?.values;
    if (exceptions) {
      errored = true;
      crashed = false;
      for (const ex of exceptions) {
        if (ex.mechanism?.handled === false) {
          crashed = true;
          break;
        }
      }
    }
    const sessionNonTerminal = session.status === "ok";
    const shouldUpdateAndSend = sessionNonTerminal && session.errors === 0 || sessionNonTerminal && crashed;
    if (shouldUpdateAndSend) {
      updateSession(session, {
        ...crashed && { status: "crashed" },
        errors: session.errors || Number(errored || crashed)
      });
      this.captureSession(session);
    }
  }
  /**
   * Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
   * "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
   *
   * @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
   * passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
   * `true`.
   * @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
   * `false` otherwise
   */
  async _isClientDoneProcessing(timeout) {
    let ticked = 0;
    while (!timeout || ticked < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 1));
      if (!this._numProcessing) {
        return true;
      }
      ticked++;
    }
    return false;
  }
  /** Determines whether this SDK is enabled and a transport is present. */
  _isEnabled() {
    return this.getOptions().enabled !== false && this._transport !== void 0;
  }
  /**
   * Adds common information to events.
   *
   * The information includes release and environment from `options`,
   * breadcrumbs and context (extra, tags and user) from the scope.
   *
   * Information that is already present in the event is never overwritten. For
   * nested objects, such as the context, keys are merged.
   *
   * @param event The original event.
   * @param hint May contain additional information about the original exception.
   * @param currentScope A scope containing event metadata.
   * @returns A new event with more information.
   */
  _prepareEvent(event, hint, currentScope, isolationScope) {
    const options = this.getOptions();
    const integrations = this.getIntegrationNames();
    if (!hint.integrations && integrations.length) {
      hint.integrations = integrations;
    }
    this.emit("preprocessEvent", event, hint);
    if (!event.type) {
      isolationScope.setLastEventId(event.event_id || hint.event_id);
    }
    return prepareEvent(options, event, hint, currentScope, this, isolationScope).then((evt) => {
      if (evt === null) {
        return evt;
      }
      this.emit("postprocessEvent", evt, hint);
      evt.contexts = {
        trace: { ...evt.contexts?.trace, ...getTraceContextFromScope(currentScope) },
        ...evt.contexts
      };
      const dynamicSamplingContext = getDynamicSamplingContextFromScope(this, currentScope);
      evt.sdkProcessingMetadata = {
        dynamicSamplingContext,
        ...evt.sdkProcessingMetadata
      };
      return evt;
    });
  }
  /**
   * Processes the event and logs an error in case of rejection
   * @param event
   * @param hint
   * @param scope
   */
  _captureEvent(event, hint = {}, currentScope = getCurrentScope(), isolationScope = getIsolationScope()) {
    if (DEBUG_BUILD && isErrorEvent$1(event)) {
      debug.log(`Captured error event \`${getPossibleEventMessages(event)[0] || "<unknown>"}\``);
    }
    return this._processEvent(event, hint, currentScope, isolationScope).then(
      (finalEvent) => {
        return finalEvent.event_id;
      },
      (reason) => {
        if (DEBUG_BUILD) {
          if (_isDoNotSendEventError(reason)) {
            debug.log(reason.message);
          } else if (_isInternalError(reason)) {
            debug.warn(reason.message);
          } else {
            debug.warn(reason);
          }
        }
        return void 0;
      }
    );
  }
  /**
   * Processes an event (either error or message) and sends it to Sentry.
   *
   * This also adds breadcrumbs and context information to the event. However,
   * platform specific meta data (such as the User's IP address) must be added
   * by the SDK implementor.
   *
   *
   * @param event The event to send to Sentry.
   * @param hint May contain additional information about the original exception.
   * @param currentScope A scope containing event metadata.
   * @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
   */
  _processEvent(event, hint, currentScope, isolationScope) {
    const options = this.getOptions();
    const { sampleRate } = options;
    const isTransaction = isTransactionEvent(event);
    const isError2 = isErrorEvent$1(event);
    const eventType = event.type || "error";
    const beforeSendLabel = `before send for type \`${eventType}\``;
    const parsedSampleRate = typeof sampleRate === "undefined" ? void 0 : parseSampleRate(sampleRate);
    if (isError2 && typeof parsedSampleRate === "number" && safeMathRandom() > parsedSampleRate) {
      this.recordDroppedEvent("sample_rate", "error");
      return rejectedSyncPromise(
        _makeDoNotSendEventError(
          `Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`
        )
      );
    }
    const dataCategory = getDataCategoryByType(event.type);
    return this._prepareEvent(event, hint, currentScope, isolationScope).then((prepared) => {
      if (prepared === null) {
        this.recordDroppedEvent("event_processor", dataCategory);
        throw _makeDoNotSendEventError("An event processor returned `null`, will not send event.");
      }
      const isInternalException = hint.data?.__sentry__ === true;
      if (isInternalException) {
        return prepared;
      }
      const result = processBeforeSend(this, options, prepared, hint);
      return _validateBeforeSendResult(result, beforeSendLabel);
    }).then((processedEvent) => {
      if (processedEvent === null) {
        this.recordDroppedEvent("before_send", dataCategory);
        if (isTransaction) {
          const spans = event.spans || [];
          const spanCount = 1 + spans.length;
          this.recordDroppedEvent("before_send", "span", spanCount);
        }
        throw _makeDoNotSendEventError(`${beforeSendLabel} returned \`null\`, will not send event.`);
      }
      const session = currentScope.getSession() || isolationScope.getSession();
      if (isError2 && session) {
        this._updateSessionFromEvent(session, processedEvent);
      }
      if (isTransaction) {
        const spanCountBefore = processedEvent.sdkProcessingMetadata?.spanCountBeforeProcessing || 0;
        const spanCountAfter = processedEvent.spans ? processedEvent.spans.length : 0;
        const droppedSpanCount = spanCountBefore - spanCountAfter;
        if (droppedSpanCount > 0) {
          this.recordDroppedEvent("before_send", "span", droppedSpanCount);
        }
      }
      const transactionInfo = processedEvent.transaction_info;
      if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
        const source = "custom";
        processedEvent.transaction_info = {
          ...transactionInfo,
          source
        };
      }
      this.sendEvent(processedEvent, hint);
      return processedEvent;
    }).then(null, (reason) => {
      if (_isDoNotSendEventError(reason) || _isInternalError(reason)) {
        throw reason;
      }
      this.captureException(reason, {
        mechanism: {
          handled: false,
          type: "internal"
        },
        data: {
          __sentry__: true
        },
        originalException: reason
      });
      throw _makeInternalError(
        `Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${reason}`
      );
    });
  }
  /**
   * Occupies the client with processing and event
   */
  _process(taskProducer, dataCategory) {
    this._numProcessing++;
    void this._promiseBuffer.add(taskProducer).then(
      (value) => {
        this._numProcessing--;
        return value;
      },
      (reason) => {
        this._numProcessing--;
        if (reason === SENTRY_BUFFER_FULL_ERROR) {
          this.recordDroppedEvent("queue_overflow", dataCategory);
        }
        return reason;
      }
    );
  }
  /**
   * Clears outcomes on this client and returns them.
   */
  _clearOutcomes() {
    const outcomes = this._outcomes;
    this._outcomes = {};
    return Object.entries(outcomes).map(([key, quantity]) => {
      const [reason, category] = key.split(":");
      return {
        reason,
        category,
        quantity
      };
    });
  }
  /**
   * Sends client reports as an envelope.
   */
  _flushOutcomes() {
    DEBUG_BUILD && debug.log("Flushing outcomes...");
    const outcomes = this._clearOutcomes();
    if (outcomes.length === 0) {
      DEBUG_BUILD && debug.log("No outcomes to send");
      return;
    }
    if (!this._dsn) {
      DEBUG_BUILD && debug.log("No dsn provided, will not send outcomes");
      return;
    }
    DEBUG_BUILD && debug.log("Sending outcomes:", outcomes);
    const envelope = createClientReportEnvelope(outcomes, this._options.tunnel && dsnToString(this._dsn));
    this.sendEnvelope(envelope);
  }
}
function getDataCategoryByType(type) {
  return type === "replay_event" ? "replay" : type || "error";
}
function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
  const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
  if (isThenable(beforeSendResult)) {
    return beforeSendResult.then(
      (event) => {
        if (!isPlainObject(event) && event !== null) {
          throw _makeInternalError(invalidValueError);
        }
        return event;
      },
      (e) => {
        throw _makeInternalError(`${beforeSendLabel} rejected with ${e}`);
      }
    );
  } else if (!isPlainObject(beforeSendResult) && beforeSendResult !== null) {
    throw _makeInternalError(invalidValueError);
  }
  return beforeSendResult;
}
function processBeforeSend(client, options, event, hint) {
  const { beforeSend, beforeSendTransaction, ignoreSpans } = options;
  const beforeSendSpan = !isStreamedBeforeSendSpanCallback(options.beforeSendSpan) && options.beforeSendSpan;
  let processedEvent = event;
  if (isErrorEvent$1(processedEvent) && beforeSend) {
    return beforeSend(processedEvent, hint);
  }
  if (isTransactionEvent(processedEvent)) {
    if (beforeSendSpan || ignoreSpans) {
      const rootSpanJson = convertTransactionEventToSpanJson(processedEvent);
      if (ignoreSpans?.length && shouldIgnoreSpan(
        { description: rootSpanJson.description, op: rootSpanJson.op, attributes: rootSpanJson.data },
        ignoreSpans
      )) {
        return null;
      }
      if (beforeSendSpan) {
        const processedRootSpanJson = beforeSendSpan(rootSpanJson);
        if (!processedRootSpanJson) {
          showSpanDropWarning();
        } else {
          processedEvent = merge(event, convertSpanJsonToTransactionEvent(processedRootSpanJson));
        }
      }
      if (processedEvent.spans) {
        const processedSpans = [];
        const initialSpans = processedEvent.spans;
        for (const span of initialSpans) {
          if (ignoreSpans?.length && shouldIgnoreSpan({ description: span.description, op: span.op, attributes: span.data }, ignoreSpans)) {
            reparentChildSpans(initialSpans, span);
            continue;
          }
          if (beforeSendSpan) {
            const processedSpan = beforeSendSpan(span);
            if (!processedSpan) {
              showSpanDropWarning();
              processedSpans.push(span);
            } else {
              processedSpans.push(processedSpan);
            }
          } else {
            processedSpans.push(span);
          }
        }
        const droppedSpans = processedEvent.spans.length - processedSpans.length;
        if (droppedSpans) {
          client.recordDroppedEvent("before_send", "span", droppedSpans);
        }
        processedEvent.spans = processedSpans;
      }
    }
    if (beforeSendTransaction) {
      if (processedEvent.spans) {
        const spanCountBefore = processedEvent.spans.length;
        processedEvent.sdkProcessingMetadata = {
          ...event.sdkProcessingMetadata,
          spanCountBeforeProcessing: spanCountBefore
        };
      }
      return beforeSendTransaction(processedEvent, hint);
    }
  }
  return processedEvent;
}
function isErrorEvent$1(event) {
  return event.type === void 0;
}
function isTransactionEvent(event) {
  return event.type === "transaction";
}
function estimateMetricSizeInBytes(metric) {
  let weight = 0;
  if (metric.name) {
    weight += metric.name.length * 2;
  }
  weight += 8;
  return weight + estimateAttributesSizeInBytes(metric.attributes);
}
function estimateLogSizeInBytes(log2) {
  let weight = 0;
  if (log2.message) {
    weight += log2.message.length * 2;
  }
  return weight + estimateAttributesSizeInBytes(log2.attributes);
}
function estimateAttributesSizeInBytes(attributes) {
  if (!attributes) {
    return 0;
  }
  let weight = 0;
  Object.values(attributes).forEach((value) => {
    if (Array.isArray(value)) {
      weight += value.length * estimatePrimitiveSizeInBytes(value[0]);
    } else if (isPrimitive(value)) {
      weight += estimatePrimitiveSizeInBytes(value);
    } else {
      weight += 100;
    }
  });
  return weight;
}
function estimatePrimitiveSizeInBytes(value) {
  if (typeof value === "string") {
    return value.length * 2;
  } else if (typeof value === "number") {
    return 8;
  } else if (typeof value === "boolean") {
    return 4;
  }
  return 0;
}
const SKIPPED_AI_PROVIDERS = /* @__PURE__ */ new Set();
function _INTERNAL_skipAiProviderWrapping(modules) {
  modules.forEach((module) => {
    SKIPPED_AI_PROVIDERS.add(module);
    DEBUG_BUILD && debug.log(`AI provider "${module}" wrapping will be skipped`);
  });
}
function _INTERNAL_shouldSkipAiProviderWrapping(module) {
  return SKIPPED_AI_PROVIDERS.has(module);
}
function _INTERNAL_clearAiProviderSkips() {
  SKIPPED_AI_PROVIDERS.clear();
  DEBUG_BUILD && debug.log("Cleared AI provider skip registrations");
}
function isSensitiveKey(lower, denySnippets) {
  return denySnippets.some((snippet) => lower.includes(snippet));
}
function filterKeyValueData(data, behavior, additionalDenyTerms) {
  if (behavior === false) {
    return {};
  }
  const denySnippets = additionalDenyTerms != null ? [...SENSITIVE_KEY_SNIPPETS, ...additionalDenyTerms] : SENSITIVE_KEY_SNIPPETS;
  const result = {};
  if (behavior === true) {
    for (const key of Object.keys(data)) {
      result[key] = isSensitiveKey(key.toLowerCase(), denySnippets) ? FILTERED_VALUE : data[key];
    }
    return result;
  }
  if ("deny" in behavior) {
    const lowerTerms2 = behavior.deny.map((t) => t.toLowerCase());
    for (const key of Object.keys(data)) {
      const lower = key.toLowerCase();
      const isDenied = isSensitiveKey(lower, denySnippets) || lowerTerms2.some((term) => lower.includes(term));
      result[key] = isDenied ? FILTERED_VALUE : data[key];
    }
    return result;
  }
  const lowerTerms = behavior.allow.map((t) => t.toLowerCase());
  for (const key of Object.keys(data)) {
    const lower = key.toLowerCase();
    if (isSensitiveKey(lower, denySnippets)) {
      result[key] = FILTERED_VALUE;
    } else {
      const isAllowed = lowerTerms.some((term) => lower.includes(term));
      result[key] = isAllowed ? data[key] : FILTERED_VALUE;
    }
  }
  return result;
}
function parseCookie(str) {
  const obj = {};
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.charCodeAt(0) === 34) {
        val = val.slice(1, -1);
      }
      try {
        obj[key] = val.indexOf("%") !== -1 ? decodeURIComponent(val) : val;
      } catch {
        obj[key] = val;
      }
    }
    index = endIdx + 1;
  }
  return obj;
}
const FALSY_ENV_VALUES = /* @__PURE__ */ new Set(["false", "f", "n", "no", "off", "0"]);
const TRUTHY_ENV_VALUES = /* @__PURE__ */ new Set(["true", "t", "y", "yes", "on", "1"]);
function envToBool(value, options) {
  const normalized = String(value).toLowerCase();
  if (FALSY_ENV_VALUES.has(normalized)) {
    return false;
  }
  if (TRUTHY_ENV_VALUES.has(normalized)) {
    return true;
  }
  return options?.strict ? null : Boolean(value);
}
function createCheckInEnvelope(checkIn, dynamicSamplingContext, metadata, tunnel, dsn) {
  const headers = {
    sent_at: new Date(safeDateNow()).toISOString()
  };
  if (metadata?.sdk) {
    headers.sdk = {
      name: metadata.sdk.name,
      version: metadata.sdk.version
    };
  }
  if (!!tunnel && !!dsn) {
    headers.dsn = dsnToString(dsn);
  }
  if (dynamicSamplingContext) {
    headers.trace = dynamicSamplingContext;
  }
  const item = createCheckInEnvelopeItem(checkIn);
  return createEnvelope(headers, [item]);
}
function createCheckInEnvelopeItem(checkIn) {
  const checkInHeaders = {
    type: "check_in"
  };
  return [checkInHeaders, checkIn];
}
function applySdkMetadata(options, name, names = [name], source = "npm") {
  const sdk = (options._metadata = options._metadata || {}).sdk = options._metadata.sdk || {};
  if (!sdk.name) {
    sdk.name = `sentry.javascript.${name}`;
    sdk.packages = names.map((name2) => ({
      name: `${source}:@sentry/${name2}`,
      version: SDK_VERSION
    }));
    sdk.version = SDK_VERSION;
  }
}
function getTraceData(options = {}) {
  const client = options.client || getClient();
  if (!isEnabled() || !client) {
    return {};
  }
  const carrier = getMainCarrier();
  const acs = getAsyncContextStrategy(carrier);
  if (acs.getTraceData) {
    return acs.getTraceData(options);
  }
  const scope = options.scope || getCurrentScope();
  const span = options.span || getActiveSpan();
  const sentryTrace = span ? spanToTraceHeader(span) : scopeToTraceHeader(scope);
  const dsc = span ? getDynamicSamplingContextFromSpan(span) : getDynamicSamplingContextFromScope(client, scope);
  const baggage = dynamicSamplingContextToSentryBaggageHeader(dsc);
  const isValidSentryTraceHeader = TRACEPARENT_REGEXP.test(sentryTrace);
  if (!isValidSentryTraceHeader) {
    debug.warn("Invalid sentry-trace data. Cannot generate trace data");
    return {};
  }
  const traceData = {
    "sentry-trace": sentryTrace,
    baggage
  };
  if (options.propagateTraceparent) {
    traceData.traceparent = span ? spanToTraceparentHeader(span) : scopeToTraceparentHeader(scope);
  }
  return traceData;
}
function scopeToTraceHeader(scope) {
  const { traceId, sampled, propagationSpanId } = scope.getPropagationContext();
  return generateSentryTraceHeader(traceId, propagationSpanId, sampled);
}
function scopeToTraceparentHeader(scope) {
  const { traceId, sampled, propagationSpanId } = scope.getPropagationContext();
  return generateTraceparentHeader(traceId, propagationSpanId, sampled);
}
const NOT_PROPAGATED_MESSAGE = "[Tracing] Not injecting trace data for url because it does not match tracePropagationTargets:";
function shouldPropagateTraceForUrl(url, tracePropagationTargets, decisionMap) {
  if (typeof url !== "string" || !tracePropagationTargets) {
    return true;
  }
  const cachedDecision = decisionMap?.get(url);
  if (cachedDecision !== void 0) {
    DEBUG_BUILD && !cachedDecision && debug.log(NOT_PROPAGATED_MESSAGE, url);
    return cachedDecision;
  }
  const decision = stringMatchesSomePattern(url, tracePropagationTargets);
  decisionMap?.set(url, decision);
  DEBUG_BUILD && !decision && debug.log(NOT_PROPAGATED_MESSAGE, url);
  return decision;
}
function debounce(func, wait, options) {
  let callbackReturnValue;
  let timerId;
  let maxTimerId;
  const maxWait = Math.max(options.maxWait, wait);
  const setTimeoutImpl = options?.setTimeoutImpl || setTimeout;
  function invokeFunc() {
    cancelTimers();
    callbackReturnValue = func();
    return callbackReturnValue;
  }
  function cancelTimers() {
    timerId !== void 0 && clearTimeout(timerId);
    maxTimerId !== void 0 && clearTimeout(maxTimerId);
    timerId = maxTimerId = void 0;
  }
  function flush2() {
    if (timerId !== void 0 || maxTimerId !== void 0) {
      return invokeFunc();
    }
    return callbackReturnValue;
  }
  function debounced() {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeoutImpl(invokeFunc, wait);
    if (maxWait && maxTimerId === void 0) {
      maxTimerId = setTimeoutImpl(invokeFunc, maxWait);
    }
    return callbackReturnValue;
  }
  debounced.cancel = cancelTimers;
  debounced.flush = flush2;
  return debounced;
}
const MAX_BODY_BYTE_LENGTH = 1024 * 1024;
function getMaxBodyByteLength(maxRequestBodySize) {
  if (maxRequestBodySize === "small") return 1e3;
  if (maxRequestBodySize === "medium") return 1e4;
  return MAX_BODY_BYTE_LENGTH;
}
function headersToDict(reqHeaders) {
  const headers = /* @__PURE__ */ Object.create(null);
  try {
    Object.entries(reqHeaders).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      } else if (typeof value === "number") {
        headers[key] = String(value);
      }
    });
  } catch {
  }
  return headers;
}
function httpRequestToRequestData(request) {
  const headers = request.headers || {};
  const forwardedHost = typeof headers["x-forwarded-host"] === "string" ? headers["x-forwarded-host"] : void 0;
  const host = forwardedHost || (typeof headers.host === "string" ? headers.host : void 0);
  const forwardedProto = typeof headers["x-forwarded-proto"] === "string" ? headers["x-forwarded-proto"] : void 0;
  const protocol = forwardedProto || request.protocol || (request.socket?.encrypted ? "https" : "http");
  const url = request.url || "";
  const absoluteUrl = getAbsoluteUrl({
    url,
    host,
    protocol
  });
  const data = request.body || void 0;
  const cookies = request.cookies;
  return {
    url: absoluteUrl,
    method: request.method,
    query_string: extractQueryParamsFromUrl(url),
    headers: headersToDict(headers),
    cookies,
    data
  };
}
function getAbsoluteUrl({
  url,
  protocol,
  host
}) {
  if (url?.startsWith("http")) {
    return url;
  }
  if (url && host) {
    return `${protocol}://${host}${url}`;
  }
  return void 0;
}
function httpHeadersToSpanAttributes(headers, dataCollection = false, lifecycle = "request") {
  const resolvedDataCollection = typeof dataCollection === "boolean" ? defaultPiiToCollectionOptions(dataCollection) : dataCollection;
  const headerBehavior = lifecycle === "request" ? resolvedDataCollection.httpHeaders.request : resolvedDataCollection.httpHeaders.response;
  const cookieBehavior = resolvedDataCollection.cookies;
  const prefix = `http.${lifecycle}.header.`;
  const spanAttributes = {};
  try {
    const regularHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
      if (value == null) {
        continue;
      }
      const lowerKey = key.toLowerCase();
      const isCookieHeader = lowerKey === "cookie" || lowerKey === "set-cookie";
      if (isCookieHeader) {
        if (cookieBehavior === false) {
          continue;
        }
        if (typeof value === "string" && value !== "") {
          const parsed = parseCookieHeader(value, lowerKey === "set-cookie");
          const filtered = filterKeyValueData(parsed, cookieBehavior, SENSITIVE_COOKIE_NAME_SNIPPETS);
          for (const [cookieKey, cookieValue] of Object.entries(filtered)) {
            spanAttributes[`${prefix}${normalizeAttributeKey(lowerKey)}.${normalizeAttributeKey(cookieKey)}`] = cookieValue;
          }
        } else {
          spanAttributes[`${prefix}${normalizeAttributeKey(lowerKey)}`] = FILTERED_VALUE;
        }
      } else {
        if (headerBehavior === false) {
          continue;
        }
        if (Array.isArray(value)) {
          regularHeaders[lowerKey] = value.map((v) => v != null ? String(v) : v).join(";");
        } else if (typeof value === "string") {
          regularHeaders[lowerKey] = value;
        }
      }
    }
    if (headerBehavior !== false) {
      const filtered = filterKeyValueData(regularHeaders, headerBehavior);
      for (const [headerKey, headerValue] of Object.entries(filtered)) {
        spanAttributes[`${prefix}${normalizeAttributeKey(headerKey)}`] = headerValue;
      }
    }
  } catch {
  }
  return spanAttributes;
}
function normalizeAttributeKey(key) {
  return key.replace(/-/g, "_");
}
function parseCookieHeader(value, isSetCookie) {
  const semicolonIndex = value.indexOf(";");
  const cookieString = isSetCookie && semicolonIndex !== -1 ? value.substring(0, semicolonIndex) : value;
  const cookies = isSetCookie ? [cookieString] : cookieString.split("; ");
  const result = {};
  for (const cookie of cookies) {
    const equalSignIndex = cookie.indexOf("=");
    const cookieKey = (equalSignIndex !== -1 ? cookie.substring(0, equalSignIndex) : cookie).toLowerCase();
    const cookieValue = equalSignIndex !== -1 ? cookie.substring(equalSignIndex + 1) : "";
    result[cookieKey] = cookieValue;
  }
  return result;
}
function extractQueryParamsFromUrl(url) {
  if (!url) {
    return;
  }
  try {
    const queryParams = new URL(url, "http://s.io").search.slice(1);
    return queryParams.length ? queryParams : void 0;
  } catch {
    return void 0;
  }
}
const DEFAULT_BREADCRUMBS = 100;
function addBreadcrumb(breadcrumb, hint) {
  const client = getClient();
  const isolationScope = getIsolationScope();
  if (!client) return;
  const { beforeBreadcrumb = null, maxBreadcrumbs = DEFAULT_BREADCRUMBS } = client.getOptions();
  if (maxBreadcrumbs <= 0) return;
  const timestamp = dateTimestampInSeconds();
  const mergedBreadcrumb = { timestamp, ...breadcrumb };
  const finalBreadcrumb = beforeBreadcrumb ? consoleSandbox(() => beforeBreadcrumb(mergedBreadcrumb, hint)) : mergedBreadcrumb;
  if (finalBreadcrumb === null) return;
  if (client.emit) {
    client.emit("beforeAddBreadcrumb", finalBreadcrumb, hint);
  }
  isolationScope.addBreadcrumb(finalBreadcrumb, maxBreadcrumbs);
}
let originalFunctionToString;
const INTEGRATION_NAME$6 = "FunctionToString";
const SETUP_CLIENTS = /* @__PURE__ */ new WeakMap();
const _functionToStringIntegration = (() => {
  return {
    name: INTEGRATION_NAME$6,
    setupOnce() {
      originalFunctionToString = Function.prototype.toString;
      try {
        Function.prototype.toString = function(...args) {
          const originalFunction = getOriginalFunction(this);
          const context = SETUP_CLIENTS.has(getClient()) && originalFunction !== void 0 ? originalFunction : this;
          return originalFunctionToString.apply(context, args);
        };
      } catch {
      }
    },
    setup(client) {
      SETUP_CLIENTS.set(client, true);
    }
  };
});
const functionToStringIntegration = defineIntegration(_functionToStringIntegration);
const DEFAULT_IGNORE_ERRORS = [
  /^Script error\.?$/,
  /^Javascript error: Script error\.? on line 0$/,
  /^ResizeObserver loop completed with undelivered notifications.$/,
  // The browser logs this when a ResizeObserver handler takes a bit longer. Usually this is not an actual issue though. It indicates slowness.
  /^Cannot redefine property: googletag$/,
  // This is thrown when google tag manager is used in combination with an ad blocker
  /^Can't find variable: gmo$/,
  // Error from Google Search App https://issuetracker.google.com/issues/396043331
  /^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
  // Random error that happens but not actionable or noticeable to end-users.
  /can't redefine non-configurable property "solana"/,
  // Probably a browser extension or custom browser (Brave) throwing this error
  /vv\(\)\.getRestrictions is not a function/,
  // Error thrown by GTM, seemingly not affecting end-users
  /Can't find variable: _AutofillCallbackHandler/,
  // Unactionable error in instagram webview https://developers.facebook.com/community/threads/320013549791141/
  /Object Not Found Matching Id:\d+, MethodName:simulateEvent/,
  // unactionable error from CEFSharp, a .NET library that embeds chromium in .NET apps
  /^Java exception was raised during method invocation$/
  // error from Facebook Mobile browser (https://github.com/getsentry/sentry-javascript/issues/15065)
];
const INTEGRATION_NAME$5 = "EventFilters";
const eventFiltersIntegration = defineIntegration((options = {}) => {
  let mergedOptions;
  return {
    name: INTEGRATION_NAME$5,
    setup(client) {
      const clientOptions = client.getOptions();
      mergedOptions = _mergeOptions(options, clientOptions);
    },
    processEvent(event, _hint, client) {
      if (!mergedOptions) {
        const clientOptions = client.getOptions();
        mergedOptions = _mergeOptions(options, clientOptions);
      }
      return _shouldDropEvent(event, mergedOptions) ? null : event;
    }
  };
});
const inboundFiltersIntegration = defineIntegration(((options = {}) => {
  return {
    ...eventFiltersIntegration(options),
    name: "InboundFilters"
  };
}));
function _mergeOptions(internalOptions = {}, clientOptions = {}) {
  return {
    allowUrls: [...internalOptions.allowUrls || [], ...clientOptions.allowUrls || []],
    denyUrls: [...internalOptions.denyUrls || [], ...clientOptions.denyUrls || []],
    ignoreErrors: [
      ...internalOptions.ignoreErrors || [],
      ...clientOptions.ignoreErrors || [],
      ...internalOptions.disableErrorDefaults ? [] : DEFAULT_IGNORE_ERRORS
    ],
    ignoreTransactions: [...internalOptions.ignoreTransactions || [], ...clientOptions.ignoreTransactions || []]
  };
}
function _shouldDropEvent(event, options) {
  if (!event.type) {
    if (_isIgnoredError(event, options.ignoreErrors)) {
      DEBUG_BUILD && debug.warn(
        `Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${getEventDescription(event)}`
      );
      return true;
    }
    if (_isUselessError(event)) {
      DEBUG_BUILD && debug.warn(
        `Event dropped due to not having an error message, error type or stacktrace.
Event: ${getEventDescription(
          event
        )}`
      );
      return true;
    }
    if (_isDeniedUrl(event, options.denyUrls)) {
      DEBUG_BUILD && debug.warn(
        `Event dropped due to being matched by \`denyUrls\` option.
Event: ${getEventDescription(
          event
        )}.
Url: ${_getEventFilterUrl(event)}`
      );
      return true;
    }
    if (!_isAllowedUrl(event, options.allowUrls)) {
      DEBUG_BUILD && debug.warn(
        `Event dropped due to not being matched by \`allowUrls\` option.
Event: ${getEventDescription(
          event
        )}.
Url: ${_getEventFilterUrl(event)}`
      );
      return true;
    }
  } else if (event.type === "transaction") {
    if (_isIgnoredTransaction(event, options.ignoreTransactions)) {
      DEBUG_BUILD && debug.warn(
        `Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${getEventDescription(event)}`
      );
      return true;
    }
  }
  return false;
}
function _isIgnoredError(event, ignoreErrors) {
  if (!ignoreErrors?.length) {
    return false;
  }
  return getPossibleEventMessages(event).some((message) => stringMatchesSomePattern(message, ignoreErrors));
}
function _isIgnoredTransaction(event, ignoreTransactions) {
  if (!ignoreTransactions?.length) {
    return false;
  }
  const name = event.transaction;
  return name ? stringMatchesSomePattern(name, ignoreTransactions) : false;
}
function _isDeniedUrl(event, denyUrls) {
  if (!denyUrls?.length) {
    return false;
  }
  const url = _getEventFilterUrl(event);
  return !url ? false : stringMatchesSomePattern(url, denyUrls);
}
function _isAllowedUrl(event, allowUrls) {
  if (!allowUrls?.length) {
    return true;
  }
  const url = _getEventFilterUrl(event);
  return !url ? true : stringMatchesSomePattern(url, allowUrls);
}
function _getLastValidUrl(frames = []) {
  for (let i = frames.length - 1; i >= 0; i--) {
    const frame = frames[i];
    if (frame && frame.filename !== "<anonymous>" && frame.filename !== "[native code]") {
      return frame.filename || null;
    }
  }
  return null;
}
function _getEventFilterUrl(event) {
  try {
    const rootException = [...event.exception?.values ?? []].reverse().find((value) => value.mechanism?.parent_id === void 0 && value.stacktrace?.frames?.length);
    const frames = rootException?.stacktrace?.frames;
    return frames ? _getLastValidUrl(frames) : null;
  } catch {
    DEBUG_BUILD && debug.error(`Cannot extract url for event ${getEventDescription(event)}`);
    return null;
  }
}
function _isUselessError(event) {
  if (!event.exception?.values?.length) {
    return false;
  }
  return (
    // No top-level message
    !event.message && // There are no exception values that have a stacktrace, a non-generic-Error type or value
    !event.exception.values.some((value) => value.stacktrace || value.type && value.type !== "Error" || value.value)
  );
}
function applyAggregateErrorsToEvent(exceptionFromErrorImplementation, parser, key, limit, event, hint) {
  if (!event.exception?.values || !hint || !isInstanceOf(hint.originalException, Error)) {
    return;
  }
  const originalException = event.exception.values.length > 0 ? event.exception.values[event.exception.values.length - 1] : void 0;
  if (originalException) {
    event.exception.values = aggregateExceptionsFromError(
      exceptionFromErrorImplementation,
      parser,
      limit,
      hint.originalException,
      key,
      event.exception.values,
      originalException,
      0
    );
  }
}
function aggregateExceptionsFromError(exceptionFromErrorImplementation, parser, limit, error2, key, prevExceptions, exception, exceptionId) {
  if (prevExceptions.length >= limit + 1) {
    return prevExceptions;
  }
  let newExceptions = [...prevExceptions];
  if (isInstanceOf(error2[key], Error)) {
    applyExceptionGroupFieldsForParentException(exception, exceptionId, error2);
    const newException = exceptionFromErrorImplementation(parser, error2[key]);
    const newExceptionId = newExceptions.length;
    applyExceptionGroupFieldsForChildException(newException, key, newExceptionId, exceptionId);
    newExceptions = aggregateExceptionsFromError(
      exceptionFromErrorImplementation,
      parser,
      limit,
      error2[key],
      key,
      [newException, ...newExceptions],
      newException,
      newExceptionId
    );
  }
  if (isExceptionGroup(error2)) {
    error2.errors.forEach((childError, i) => {
      if (isInstanceOf(childError, Error)) {
        applyExceptionGroupFieldsForParentException(exception, exceptionId, error2);
        const newException = exceptionFromErrorImplementation(parser, childError);
        const newExceptionId = newExceptions.length;
        applyExceptionGroupFieldsForChildException(newException, `errors[${i}]`, newExceptionId, exceptionId);
        newExceptions = aggregateExceptionsFromError(
          exceptionFromErrorImplementation,
          parser,
          limit,
          childError,
          key,
          [newException, ...newExceptions],
          newException,
          newExceptionId
        );
      }
    });
  }
  return newExceptions;
}
function isExceptionGroup(error2) {
  return Array.isArray(error2.errors);
}
function applyExceptionGroupFieldsForParentException(exception, exceptionId, error2) {
  exception.mechanism = {
    handled: true,
    type: "auto.core.linked_errors",
    ...isExceptionGroup(error2) && { is_exception_group: true },
    ...exception.mechanism,
    exception_id: exceptionId
  };
}
function applyExceptionGroupFieldsForChildException(exception, source, exceptionId, parentId) {
  exception.mechanism = {
    handled: true,
    ...exception.mechanism,
    type: "chained",
    source,
    exception_id: exceptionId,
    parent_id: parentId
  };
}
function parseStackFrames(stackParser, error2) {
  return stackParser(error2.stack || "", 1);
}
function hasSentryFetchUrlHost(error2) {
  return isError(error2) && "__sentry_fetch_url_host__" in error2 && typeof error2.__sentry_fetch_url_host__ === "string";
}
function _enhanceErrorWithSentryInfo(error2) {
  if (hasSentryFetchUrlHost(error2)) {
    return `${error2.message} (${error2.__sentry_fetch_url_host__})`;
  }
  return error2.message;
}
function exceptionFromError(stackParser, error2) {
  const exception = {
    type: error2.name || error2.constructor.name,
    value: _enhanceErrorWithSentryInfo(error2)
  };
  const frames = parseStackFrames(stackParser, error2);
  if (frames.length) {
    exception.stacktrace = { frames };
  }
  return exception;
}
function getErrorPropertyFromObject(obj) {
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      const value = obj[prop];
      if (value instanceof Error) {
        return value;
      }
    }
  }
  return void 0;
}
function getMessageForObject(exception) {
  if ("name" in exception && typeof exception.name === "string") {
    let message = `'${exception.name}' captured as exception`;
    if ("message" in exception && typeof exception.message === "string") {
      message += ` with message '${exception.message}'`;
    }
    return message;
  } else if ("message" in exception && typeof exception.message === "string") {
    return exception.message;
  }
  const keys = extractExceptionKeysForMessage(exception);
  if (isErrorEvent$2(exception)) {
    return `Event \`ErrorEvent\` captured as exception with message \`${exception.message}\``;
  }
  const className = getObjectClassName(exception);
  return `${className && className !== "Object" ? `'${className}'` : "Object"} captured as exception with keys: ${keys}`;
}
function getObjectClassName(obj) {
  try {
    const prototype = Object.getPrototypeOf(obj);
    return prototype ? prototype.constructor.name : void 0;
  } catch {
  }
}
function getException(client, mechanism, exception, hint) {
  if (isError(exception)) {
    return [exception, void 0];
  }
  mechanism.synthetic = true;
  if (isPlainObject(exception)) {
    const normalizeDepth = client?.getOptions().normalizeDepth;
    const extras = { ["__serialized__"]: normalizeToSize(exception, normalizeDepth) };
    const errorFromProp = getErrorPropertyFromObject(exception);
    if (errorFromProp) {
      return [errorFromProp, extras];
    }
    const message = getMessageForObject(exception);
    const ex2 = hint?.syntheticException || new Error(message);
    ex2.message = message;
    return [ex2, extras];
  }
  const ex = hint?.syntheticException || new Error(exception);
  ex.message = `${exception}`;
  return [ex, void 0];
}
function eventFromUnknownInput(client, stackParser, exception, hint) {
  const providedMechanism = hint?.data && hint.data.mechanism;
  const mechanism = providedMechanism || {
    handled: true,
    type: "generic"
  };
  const [ex, extras] = getException(client, mechanism, exception, hint);
  const event = {
    exception: {
      values: [exceptionFromError(stackParser, ex)]
    }
  };
  if (extras) {
    event.extra = extras;
  }
  addExceptionTypeValue(event);
  addExceptionMechanism(event, mechanism);
  return {
    ...event,
    event_id: hint?.event_id
  };
}
function eventFromMessage(stackParser, message, level = "info", hint, attachStacktrace) {
  const event = {
    event_id: hint?.event_id,
    level
  };
  if (attachStacktrace && hint?.syntheticException) {
    const frames = parseStackFrames(stackParser, hint.syntheticException);
    if (frames.length) {
      event.exception = {
        values: [
          {
            value: message,
            stacktrace: { frames }
          }
        ]
      };
      addExceptionMechanism(event, { synthetic: true });
    }
  }
  if (isParameterizedString(message)) {
    const { __sentry_template_string__, __sentry_template_values__ } = message;
    event.logentry = {
      message: __sentry_template_string__,
      params: __sentry_template_values__
    };
    return event;
  }
  event.message = message;
  return event;
}
const DEFAULT_KEY = "cause";
const DEFAULT_LIMIT = 5;
const INTEGRATION_NAME$4 = "LinkedErrors";
const _linkedErrorsIntegration = ((options = {}) => {
  const limit = options.limit || DEFAULT_LIMIT;
  const key = options.key || DEFAULT_KEY;
  return {
    name: INTEGRATION_NAME$4,
    preprocessEvent(event, hint, client) {
      const options2 = client.getOptions();
      applyAggregateErrorsToEvent(exceptionFromError, options2.stackParser, key, limit, event, hint);
    }
  };
});
const linkedErrorsIntegration = defineIntegration(_linkedErrorsIntegration);
const ipHeaderNames = [
  "X-Client-IP",
  "X-Forwarded-For",
  "Fly-Client-IP",
  "CF-Connecting-IP",
  "Fastly-Client-Ip",
  "True-Client-Ip",
  "X-Real-IP",
  "X-Cluster-Client-IP",
  "X-Forwarded",
  "Forwarded-For",
  "Forwarded",
  "X-Vercel-Forwarded-For"
];
function getClientIPAddress(headers) {
  const lowerCaseHeaders = {};
  for (const key of Object.keys(headers)) {
    lowerCaseHeaders[key.toLowerCase()] = headers[key];
  }
  const headerValues = ipHeaderNames.map((headerName) => {
    const rawValue = lowerCaseHeaders[headerName.toLowerCase()];
    const value = Array.isArray(rawValue) ? rawValue.join(";") : rawValue;
    if (headerName === "Forwarded") {
      return parseForwardedHeader(value);
    }
    return value?.split(",").map((v) => v.trim());
  });
  const flattenedHeaderValues = headerValues.reduce((acc, val) => {
    if (!val) {
      return acc;
    }
    return acc.concat(val);
  }, []);
  const ipAddress = flattenedHeaderValues.find((ip) => ip !== null && isIP(ip));
  return ipAddress || null;
}
function parseForwardedHeader(value) {
  if (!value) {
    return null;
  }
  for (const part of value.split(";")) {
    if (part.startsWith("for=")) {
      return part.slice(4);
    }
  }
  return null;
}
function isIP(str) {
  const regex = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/;
  return regex.test(str);
}
const INTEGRATION_NAME$3 = "RequestData";
const _requestDataIntegration = ((options = {}) => {
  function resolveIncludeAndDataCollection(client) {
    const dc = client.getDataCollectionOptions();
    const dataCollection = {
      ...dc,
      ...options.include?.cookies === true && dc.cookies === false && { cookies: true },
      ...options.include?.headers === true && dc.httpHeaders.request === false && {
        httpHeaders: { ...dc.httpHeaders, request: true }
      }
    };
    return {
      dataCollection,
      include: {
        cookies: dataCollection.cookies !== false,
        // Always attach body data that's already on the scope — dataCollection.httpBodies gates write-time, not read-time
        data: true,
        headers: dataCollection.httpHeaders.request !== false,
        ip: dataCollection.userInfo,
        query_string: dataCollection.queryParams !== false,
        // No dataCollection equivalent — URL is always included
        url: true,
        ...options.include
      }
    };
  }
  return {
    name: INTEGRATION_NAME$3,
    processEvent(event, _hint, client) {
      const { sdkProcessingMetadata = {} } = event;
      const { normalizedRequest, ipAddress } = sdkProcessingMetadata;
      const { include } = resolveIncludeAndDataCollection(client);
      if (normalizedRequest) {
        addNormalizedRequestDataToEvent(event, normalizedRequest, { ipAddress }, include);
      }
      return event;
    },
    processSegmentSpan(span, client) {
      const { sdkProcessingMetadata = {} } = getIsolationScope().getScopeData();
      const { normalizedRequest, ipAddress } = sdkProcessingMetadata;
      if (!normalizedRequest) {
        return;
      }
      const { include, dataCollection } = resolveIncludeAndDataCollection(client);
      addNormalizedRequestDataToSpan(span, normalizedRequest, ipAddress, include, dataCollection);
    }
  };
});
const requestDataIntegration = defineIntegration(_requestDataIntegration);
function addNormalizedRequestDataToEvent(event, req, additionalData, include) {
  event.request = {
    ...event.request,
    ...extractNormalizedRequestData(req, include)
  };
  if (include.ip) {
    const ip = req.headers && getClientIPAddress(req.headers) || additionalData.ipAddress;
    if (ip) {
      event.user = {
        ...event.user,
        ip_address: ip
      };
    }
  }
}
function addNormalizedRequestDataToSpan(span, normalizedRequest, ipAddress, include, dataCollection) {
  const requestData = extractNormalizedRequestData(normalizedRequest, include);
  const attributes = {};
  if (requestData.url) {
    attributes["url.full"] = requestData.url;
  }
  if (requestData.method) {
    attributes["http.request.method"] = requestData.method;
  }
  if (requestData.query_string) {
    attributes["url.query"] = normalizeQueryString(requestData.query_string);
  }
  safeSetSpanJSONAttributes(span, attributes);
  if (requestData.cookies && Object.keys(requestData.cookies).length > 0) {
    const cookieString = Object.entries(requestData.cookies).map(([name, value]) => `${name}=${value}`).join("; ");
    const cookieAttributes = httpHeadersToSpanAttributes({ cookie: cookieString }, dataCollection, "request");
    safeSetSpanJSONAttributes(span, cookieAttributes);
  }
  if (requestData.headers) {
    const headerAttributes = httpHeadersToSpanAttributes(requestData.headers, dataCollection, "request");
    safeSetSpanJSONAttributes(span, headerAttributes);
  }
  if (requestData.data != null) {
    const serialized = typeof requestData.data === "string" ? requestData.data : JSON.stringify(requestData.data);
    if (serialized) {
      safeSetSpanJSONAttributes(span, { "http.request.body.data": serialized });
    }
  }
  if (include.ip) {
    const ip = normalizedRequest.headers && getClientIPAddress(normalizedRequest.headers) || ipAddress || void 0;
    if (ip) {
      safeSetSpanJSONAttributes(span, { [SEMANTIC_ATTRIBUTE_USER_IP_ADDRESS]: ip });
    }
  }
}
function extractNormalizedRequestData(normalizedRequest, include) {
  const requestData = {};
  const headers = { ...normalizedRequest.headers };
  if (include.headers) {
    requestData.headers = headers;
    if (!include.cookies) {
      delete headers.cookie;
    }
    if (!include.ip) {
      const ipHeaderNamesLower = new Set(ipHeaderNames.map((name) => name.toLowerCase()));
      for (const key of Object.keys(headers)) {
        if (ipHeaderNamesLower.has(key.toLowerCase())) {
          delete headers[key];
        }
      }
    }
  }
  requestData.method = normalizedRequest.method;
  if (include.url) {
    requestData.url = normalizedRequest.url;
  }
  if (include.cookies) {
    const cookies = normalizedRequest.cookies || (headers?.cookie ? parseCookie(headers.cookie) : void 0);
    requestData.cookies = cookies || {};
  }
  if (include.query_string) {
    requestData.query_string = normalizedRequest.query_string;
  }
  if (include.data) {
    requestData.data = normalizedRequest.data;
  }
  return requestData;
}
function normalizeQueryString(queryString) {
  if (typeof queryString === "string") {
    return queryString || void 0;
  }
  const pairs = Array.isArray(queryString) ? queryString : Object.entries(queryString);
  const result = pairs.map(([key, value]) => `${key}=${value}`).join("&");
  return result || void 0;
}
const _filter = /* @__PURE__ */ new Set([]);
function addConsoleInstrumentationHandler(handler) {
  const type = "console";
  const removeHandler = addHandler(type, handler);
  maybeInstrument(type, instrumentConsole);
  return removeHandler;
}
function addConsoleInstrumentationFilter(filter) {
  for (const f of filter) {
    _filter.add(f);
  }
  return () => {
    for (const f of filter) {
      _filter.delete(f);
    }
  };
}
function instrumentConsole() {
  if (!("console" in GLOBAL_OBJ)) {
    return;
  }
  CONSOLE_LEVELS.forEach(function(level) {
    if (!(level in GLOBAL_OBJ.console)) {
      return;
    }
    fill(GLOBAL_OBJ.console, level, function(originalConsoleMethod) {
      originalConsoleMethods[level] = originalConsoleMethod;
      return function(...args) {
        const firstArg = args[0];
        const log2 = originalConsoleMethods[level];
        const isFiltered = _filter.size && typeof firstArg === "string" && stringMatchesSomePattern(firstArg, _filter);
        if (!isFiltered) {
          triggerHandlers("console", { args, level });
        }
        if (!isFiltered || DEBUG_BUILD && debug.isEnabled()) {
          log2?.apply(GLOBAL_OBJ.console, args);
        }
      };
    });
  });
}
function severityLevelFromString(level) {
  return level === "warn" ? "warning" : ["fatal", "error", "warning", "log", "info", "debug"].includes(level) ? level : "log";
}
const splitPathRe = /^(\S+:\\|\/?)([\s\S]*?)((?:\.{1,2}|[^/\\]+?|)(\.[^./\\]*|))(?:[/\\]*)$/;
function splitPath(filename) {
  const truncated = filename.length > 1024 ? `<truncated>${filename.slice(-1024)}` : filename;
  const parts = splitPathRe.exec(truncated);
  return parts ? parts.slice(1) : [];
}
function dirname(path) {
  const result = splitPath(path);
  const root = result[0] || "";
  let dir = result[1];
  if (!root && !dir) {
    return ".";
  }
  if (dir) {
    dir = dir.slice(0, dir.length - 1);
  }
  return root + dir;
}
const INTEGRATION_NAME$2 = "Console";
const consoleIntegration = defineIntegration((options = {}) => {
  const levels = new Set(options.levels || CONSOLE_LEVELS);
  return {
    name: INTEGRATION_NAME$2,
    setup(client) {
      const unsubscribe = addConsoleInstrumentationHandler(({ args, level }) => {
        if (getClient() !== client || !levels.has(level)) {
          return;
        }
        addConsoleBreadcrumb(level, args);
      });
      client.registerCleanup(unsubscribe);
      if (options.filter) {
        const unsubscribe2 = addConsoleInstrumentationFilter(options.filter);
        client.registerCleanup(unsubscribe2);
      }
    }
  };
});
function addConsoleBreadcrumb(level, args) {
  const breadcrumb = {
    category: "console",
    data: {
      arguments: args,
      logger: "console"
    },
    level: severityLevelFromString(level),
    message: formatConsoleArgs(args)
  };
  if (level === "assert") {
    if (args[0] === false) {
      const assertionArgs = args.slice(1);
      breadcrumb.message = assertionArgs.length > 0 ? `Assertion failed: ${formatConsoleArgs(assertionArgs)}` : "Assertion failed";
      breadcrumb.data.arguments = assertionArgs;
    } else {
      return;
    }
  }
  addBreadcrumb(breadcrumb, {
    input: args,
    level
  });
}
function formatConsoleArgs(values) {
  return "util" in GLOBAL_OBJ && typeof GLOBAL_OBJ.util.format === "function" ? GLOBAL_OBJ.util.format(...values) : safeJoin(values, " ");
}
const INTEGRATION_NAME$1 = "ConversationId";
const _conversationIdIntegration = (() => {
  return {
    name: INTEGRATION_NAME$1,
    setup(client) {
      client.on("spanStart", (span) => {
        const scopeData = getCurrentScope().getScopeData();
        const isolationScopeData = getIsolationScope().getScopeData();
        const conversationId = scopeData.conversationId || isolationScopeData.conversationId;
        if (conversationId) {
          const { op, data: attributes, description: name } = spanToJSON(span);
          if (!op?.startsWith("gen_ai.") && !attributes["ai.operationId"] && !name?.startsWith("ai.")) {
            return;
          }
          span.setAttribute(GEN_AI_CONVERSATION_ID_ATTRIBUTE$1, conversationId);
        }
      });
    }
  };
});
const conversationIdIntegration = defineIntegration(_conversationIdIntegration);
function captureLog(level, message, attributes, scope, severityNumber) {
  _INTERNAL_captureLog({ level, message, attributes, severityNumber }, scope);
}
function warn(message, attributes, { scope } = {}) {
  captureLog("warn", message, attributes, scope);
}
const GEN_AI_PROMPT_ATTRIBUTE = "gen_ai.prompt";
const GEN_AI_SYSTEM_ATTRIBUTE = "gen_ai.system";
const GEN_AI_REQUEST_MODEL_ATTRIBUTE = "gen_ai.request.model";
const GEN_AI_REQUEST_STREAM_ATTRIBUTE = "gen_ai.request.stream";
const GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE = "gen_ai.request.temperature";
const GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE = "gen_ai.request.max_tokens";
const GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE = "gen_ai.request.frequency_penalty";
const GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE = "gen_ai.request.presence_penalty";
const GEN_AI_REQUEST_TOP_P_ATTRIBUTE = "gen_ai.request.top_p";
const GEN_AI_REQUEST_TOP_K_ATTRIBUTE = "gen_ai.request.top_k";
const GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE = "gen_ai.request.encoding_format";
const GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE = "gen_ai.request.dimensions";
const GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE = "gen_ai.response.finish_reasons";
const GEN_AI_RESPONSE_MODEL_ATTRIBUTE = "gen_ai.response.model";
const GEN_AI_RESPONSE_ID_ATTRIBUTE = "gen_ai.response.id";
const GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE = "gen_ai.response.stop_reason";
const GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.input_tokens";
const GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.output_tokens";
const GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE = "gen_ai.usage.total_tokens";
const GEN_AI_OPERATION_NAME_ATTRIBUTE = "gen_ai.operation.name";
const GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE = "sentry.sdk_meta.gen_ai.input.messages.original_length";
const GEN_AI_INPUT_MESSAGES_ATTRIBUTE = "gen_ai.input.messages";
const GEN_AI_OUTPUT_MESSAGES_ATTRIBUTE = "gen_ai.output.messages";
const GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE = "gen_ai.system_instructions";
const GEN_AI_RESPONSE_TEXT_ATTRIBUTE = "gen_ai.response.text";
const GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE = "gen_ai.request.available_tools";
const GEN_AI_RESPONSE_STREAMING_ATTRIBUTE = "gen_ai.response.streaming";
const GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = "gen_ai.response.tool_calls";
const GEN_AI_AGENT_NAME_ATTRIBUTE = "gen_ai.agent.name";
const GEN_AI_PIPELINE_NAME_ATTRIBUTE = "gen_ai.pipeline.name";
const GEN_AI_CONVERSATION_ID_ATTRIBUTE = "gen_ai.conversation.id";
const GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.cache_creation_input_tokens";
const GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE = "gen_ai.usage.cache_read_input_tokens";
const GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE = "gen_ai.usage.input_tokens.cache_write";
const GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE = "gen_ai.usage.input_tokens.cached";
const GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE = "gen_ai.invoke_agent";
const GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE = "gen_ai.embeddings.input";
const GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE = "gen_ai.embeddings";
const GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE = "gen_ai.execute_tool";
const GEN_AI_TOOL_NAME_ATTRIBUTE = "gen_ai.tool.name";
const GEN_AI_TOOL_CALL_ID_ATTRIBUTE = "gen_ai.tool.call.id";
const GEN_AI_TOOL_TYPE_ATTRIBUTE = "gen_ai.tool.type";
const GEN_AI_TOOL_INPUT_ATTRIBUTE = "gen_ai.tool.input";
const GEN_AI_TOOL_OUTPUT_ATTRIBUTE = "gen_ai.tool.output";
const GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE = "gen_ai.tool.description";
function isContentMedia(part) {
  if (!part || typeof part !== "object") return false;
  return isContentMediaSource(part) || hasInlineData(part) || hasImageUrl(part) || hasInputAudio(part) || hasFileData(part) || hasMediaTypeData(part) || hasVercelFileData(part) || hasVercelImageData(part) || hasBlobOrBase64Type(part) || hasB64Json(part) || hasImageGenerationResult(part) || hasDataUri(part);
}
function hasImageUrl(part) {
  if (!("image_url" in part)) return false;
  if (typeof part.image_url === "string") return part.image_url.startsWith("data:");
  return hasNestedImageUrl(part);
}
function hasNestedImageUrl(part) {
  return "image_url" in part && !!part.image_url && typeof part.image_url === "object" && "url" in part.image_url && typeof part.image_url.url === "string" && part.image_url.url.startsWith("data:");
}
function isContentMediaSource(part) {
  return "type" in part && typeof part.type === "string" && "source" in part && isContentMedia(part.source);
}
function hasInlineData(part) {
  return "inlineData" in part && !!part.inlineData && typeof part.inlineData === "object" && "data" in part.inlineData && typeof part.inlineData.data === "string";
}
function hasInputAudio(part) {
  return "type" in part && part.type === "input_audio" && "input_audio" in part && !!part.input_audio && typeof part.input_audio === "object" && "data" in part.input_audio && typeof part.input_audio.data === "string";
}
function hasFileData(part) {
  return "type" in part && part.type === "file" && "file" in part && !!part.file && typeof part.file === "object" && "file_data" in part.file && typeof part.file.file_data === "string";
}
function hasMediaTypeData(part) {
  return "media_type" in part && typeof part.media_type === "string" && "data" in part;
}
function hasVercelFileData(part) {
  return "type" in part && part.type === "file" && "mediaType" in part && typeof part.mediaType === "string" && "data" in part && typeof part.data === "string" && // Only strip base64/binary data, not HTTP/HTTPS URLs which should be preserved as references
  !part.data.startsWith("http://") && !part.data.startsWith("https://");
}
function hasVercelImageData(part) {
  return "type" in part && part.type === "image" && "image" in part && typeof part.image === "string" && // Only strip base64/data URIs, not HTTP/HTTPS URLs which should be preserved as references
  !part.image.startsWith("http://") && !part.image.startsWith("https://");
}
function hasBlobOrBase64Type(part) {
  return "type" in part && (part.type === "blob" || part.type === "base64");
}
function hasB64Json(part) {
  return "b64_json" in part;
}
function hasImageGenerationResult(part) {
  return "type" in part && "result" in part && part.type === "image_generation";
}
function hasDataUri(part) {
  return "uri" in part && typeof part.uri === "string" && part.uri.startsWith("data:");
}
const REMOVED_STRING = "[Blob substitute]";
const MEDIA_FIELDS = ["image_url", "data", "content", "b64_json", "result", "uri", "image"];
function stripInlineMediaFromSingleMessage(part) {
  const strip = { ...part };
  if (isContentMedia(strip.source)) {
    strip.source = stripInlineMediaFromSingleMessage(strip.source);
  }
  if (hasInlineData(part)) {
    strip.inlineData = { ...part.inlineData, data: REMOVED_STRING };
  }
  if (hasNestedImageUrl(part)) {
    strip.image_url = { ...part.image_url, url: REMOVED_STRING };
  }
  if (hasInputAudio(part)) {
    strip.input_audio = { ...part.input_audio, data: REMOVED_STRING };
  }
  if (hasFileData(part)) {
    strip.file = { ...part.file, file_data: REMOVED_STRING };
  }
  for (const field of MEDIA_FIELDS) {
    if (typeof strip[field] === "string") strip[field] = REMOVED_STRING;
  }
  return strip;
}
const DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT = 2e4;
const utf8Bytes = (text) => {
  return new TextEncoder().encode(text).length;
};
const jsonBytes = (value) => {
  return utf8Bytes(JSON.stringify(value));
};
function truncateTextByBytes(text, maxBytes) {
  if (utf8Bytes(text) <= maxBytes) {
    return text;
  }
  let low = 0;
  let high = text.length;
  let bestFit = "";
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = text.slice(0, mid);
    const byteSize = utf8Bytes(candidate);
    if (byteSize <= maxBytes) {
      bestFit = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return bestFit;
}
function getItemText(item) {
  if (typeof item === "string") {
    return item;
  }
  if ("text" in item && typeof item.text === "string") {
    return item.text;
  }
  return "";
}
function withItemText(item, text) {
  if (typeof item === "string") {
    return text;
  }
  return { ...item, text };
}
function isContentMessage(message) {
  return message !== null && typeof message === "object" && "content" in message && typeof message.content === "string";
}
function isContentArrayMessage(message) {
  return message !== null && typeof message === "object" && "content" in message && Array.isArray(message.content);
}
function isPartsMessage(message) {
  return message !== null && typeof message === "object" && "parts" in message && Array.isArray(message.parts) && message.parts.length > 0;
}
function truncateContentMessage(message, maxBytes) {
  const emptyMessage = { ...message, content: "" };
  const overhead = jsonBytes(emptyMessage);
  const availableForContent = maxBytes - overhead;
  if (availableForContent <= 0) {
    return [];
  }
  const truncatedContent = truncateTextByBytes(message.content, availableForContent);
  return [{ ...message, content: truncatedContent }];
}
function getArrayItems(message) {
  if ("parts" in message && Array.isArray(message.parts)) {
    return { key: "parts", items: message.parts };
  }
  if ("content" in message && Array.isArray(message.content)) {
    return { key: "content", items: message.content };
  }
  return { key: null, items: [] };
}
function truncateArrayMessage(message, maxBytes) {
  const { key, items } = getArrayItems(message);
  if (key === null || items.length === 0) {
    return [];
  }
  const emptyItems = items.map((item) => withItemText(item, ""));
  const overhead = jsonBytes({ ...message, [key]: emptyItems });
  let remainingBytes = maxBytes - overhead;
  if (remainingBytes <= 0) {
    return [];
  }
  const includedItems = [];
  for (const item of items) {
    const text = getItemText(item);
    const textSize = utf8Bytes(text);
    if (textSize <= remainingBytes) {
      includedItems.push(item);
      remainingBytes -= textSize;
    } else if (includedItems.length === 0) {
      const truncated = truncateTextByBytes(text, remainingBytes);
      if (truncated) {
        includedItems.push(withItemText(item, truncated));
      }
      break;
    } else {
      break;
    }
  }
  if (includedItems.length <= 0) {
    return [];
  } else {
    return [{ ...message, [key]: includedItems }];
  }
}
function truncateSingleMessage(message, maxBytes) {
  if (!message) return [];
  if (typeof message === "string") {
    const truncated = truncateTextByBytes(message, maxBytes);
    return truncated ? [truncated] : [];
  }
  if (typeof message !== "object") {
    return [];
  }
  if (isContentMessage(message)) {
    return truncateContentMessage(message, maxBytes);
  }
  if (isContentArrayMessage(message) || isPartsMessage(message)) {
    return truncateArrayMessage(message, maxBytes);
  }
  return [];
}
function stripInlineMediaFromMessages(messages) {
  const stripped = messages.map((message) => {
    let newMessage = void 0;
    if (!!message && typeof message === "object") {
      if (isContentArrayMessage(message)) {
        newMessage = {
          ...message,
          content: stripInlineMediaFromMessages(message.content)
        };
      } else if ("content" in message && isContentMedia(message.content)) {
        newMessage = {
          ...message,
          content: stripInlineMediaFromSingleMessage(message.content)
        };
      }
      if (isPartsMessage(message)) {
        newMessage = {
          // might have to strip content AND parts
          ...newMessage ?? message,
          parts: stripInlineMediaFromMessages(message.parts)
        };
      }
      if (isContentMedia(newMessage)) {
        newMessage = stripInlineMediaFromSingleMessage(newMessage);
      } else if (isContentMedia(message)) {
        newMessage = stripInlineMediaFromSingleMessage(message);
      }
    }
    return newMessage ?? message;
  });
  return stripped;
}
function truncateMessagesByBytes(messages, maxBytes) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return messages;
  }
  const effectiveMaxBytes = maxBytes - 2;
  const lastMessage = messages[messages.length - 1];
  const stripped = stripInlineMediaFromMessages([lastMessage]);
  const strippedMessage = stripped[0];
  const messageBytes = jsonBytes(strippedMessage);
  if (messageBytes <= effectiveMaxBytes) {
    return stripped;
  }
  return truncateSingleMessage(strippedMessage, effectiveMaxBytes);
}
function truncateGenAiMessages(messages) {
  return truncateMessagesByBytes(messages, DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT);
}
function truncateGenAiStringInput(input) {
  return truncateTextByBytes(input, DEFAULT_GEN_AI_MESSAGES_BYTE_LIMIT);
}
function resolveAIRecordingOptions(options) {
  const genAI = getClient()?.getDataCollectionOptions().genAI;
  return {
    ...options,
    recordInputs: options?.recordInputs ?? genAI?.inputs ?? false,
    recordOutputs: options?.recordOutputs ?? genAI?.outputs ?? false
  };
}
function shouldEnableTruncation(enableTruncation) {
  const client = getClient();
  return enableTruncation ?? !(client && hasSpanStreamingEnabled(client));
}
function buildMethodPath(currentPath, prop) {
  return currentPath ? `${currentPath}.${prop}` : prop;
}
function setTokenUsageAttributes(span, promptTokens, completionTokens, cachedInputTokens, cachedOutputTokens) {
  if (promptTokens !== void 0) {
    span.setAttributes({
      [GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: promptTokens
    });
  }
  if (completionTokens !== void 0) {
    span.setAttributes({
      [GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: completionTokens
    });
  }
  if (promptTokens !== void 0 || completionTokens !== void 0 || cachedInputTokens !== void 0 || cachedOutputTokens !== void 0) {
    const totalTokens = (promptTokens ?? 0) + (completionTokens ?? 0) + (cachedInputTokens ?? 0) + (cachedOutputTokens ?? 0);
    span.setAttributes({
      [GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: totalTokens
    });
  }
}
function endStreamSpan(span, state, recordOutputs) {
  if (!span.isRecording()) {
    return;
  }
  const attrs = {
    [GEN_AI_RESPONSE_STREAMING_ATTRIBUTE]: true
  };
  if (state.responseId) attrs[GEN_AI_RESPONSE_ID_ATTRIBUTE] = state.responseId;
  if (state.responseModel) attrs[GEN_AI_RESPONSE_MODEL_ATTRIBUTE] = state.responseModel;
  if (state.promptTokens !== void 0) attrs[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = state.promptTokens;
  if (state.completionTokens !== void 0) attrs[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = state.completionTokens;
  if (state.totalTokens !== void 0) {
    attrs[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = state.totalTokens;
  } else if (state.promptTokens !== void 0 || state.completionTokens !== void 0 || state.cacheCreationInputTokens !== void 0 || state.cacheReadInputTokens !== void 0) {
    attrs[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = (state.promptTokens ?? 0) + (state.completionTokens ?? 0) + (state.cacheCreationInputTokens ?? 0) + (state.cacheReadInputTokens ?? 0);
  }
  if (state.finishReasons.length) {
    attrs[GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify(state.finishReasons);
  }
  if (recordOutputs && state.responseTexts.length) {
    attrs[GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = state.responseTexts.join("");
  }
  if (recordOutputs && state.toolCalls.length) {
    attrs[GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(state.toolCalls);
  }
  span.setAttributes(attrs);
  span.end();
}
function getJsonString(value) {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}
function getTruncatedJsonString(value) {
  if (typeof value === "string") {
    return truncateGenAiStringInput(value);
  }
  if (Array.isArray(value)) {
    const truncatedMessages = truncateGenAiMessages(value);
    return JSON.stringify(truncatedMessages);
  }
  return JSON.stringify(value);
}
function extractSystemInstructions(messages) {
  if (!Array.isArray(messages)) {
    return { systemInstructions: void 0, filteredMessages: messages };
  }
  const systemMessageIndex = messages.findIndex(
    (msg) => msg && typeof msg === "object" && "role" in msg && msg.role === "system"
  );
  if (systemMessageIndex === -1) {
    return { systemInstructions: void 0, filteredMessages: messages };
  }
  const systemMessage = messages[systemMessageIndex];
  const systemContent = typeof systemMessage.content === "string" ? systemMessage.content : systemMessage.content !== void 0 ? JSON.stringify(systemMessage.content) : void 0;
  if (!systemContent) {
    return { systemInstructions: void 0, filteredMessages: messages };
  }
  const systemInstructions = JSON.stringify([{ type: "text", content: systemContent }]);
  const filteredMessages = [...messages.slice(0, systemMessageIndex), ...messages.slice(systemMessageIndex + 1)];
  return { systemInstructions, filteredMessages };
}
async function createWithResponseWrapper(originalWithResponse, instrumentedPromise, mechanismType) {
  const safeOriginalWithResponse = originalWithResponse.catch((error2) => {
    captureException(error2, {
      mechanism: {
        handled: false,
        type: mechanismType
      }
    });
    throw error2;
  });
  const instrumentedResult = await instrumentedPromise;
  const originalWrapper = await safeOriginalWithResponse;
  if (originalWrapper && typeof originalWrapper === "object" && "data" in originalWrapper) {
    return {
      ...originalWrapper,
      data: instrumentedResult
    };
  }
  return instrumentedResult;
}
function wrapPromiseWithMethods(originalPromiseLike, instrumentedPromise, mechanismType) {
  if (!isThenable(originalPromiseLike)) {
    return instrumentedPromise;
  }
  return new Proxy(originalPromiseLike, {
    get(target, prop) {
      const useInstrumentedPromise = prop in Promise.prototype || prop === Symbol.toStringTag;
      const source = useInstrumentedPromise ? instrumentedPromise : target;
      const value = Reflect.get(source, prop);
      if (prop === "withResponse" && typeof value === "function") {
        return function wrappedWithResponse() {
          const originalWithResponse = value.call(target);
          return createWithResponseWrapper(originalWithResponse, instrumentedPromise, mechanismType);
        };
      }
      return typeof value === "function" ? value.bind(source) : value;
    }
  });
}
const toolCallSpanContextMap = /* @__PURE__ */ new Map();
const toolDescriptionMap = /* @__PURE__ */ new Map();
const SPAN_TO_OPERATION_NAME = /* @__PURE__ */ new Map([
  ["ai.generateText", "invoke_agent"],
  ["ai.streamText", "invoke_agent"],
  ["ai.generateObject", "invoke_agent"],
  ["ai.streamObject", "invoke_agent"],
  ["ai.generateText.doGenerate", "generate_content"],
  ["ai.streamText.doStream", "generate_content"],
  ["ai.generateObject.doGenerate", "generate_content"],
  ["ai.streamObject.doStream", "generate_content"],
  ["ai.embed.doEmbed", "embeddings"],
  ["ai.embedMany.doEmbed", "embeddings"],
  ["ai.rerank.doRerank", "rerank"],
  ["ai.toolCall", "execute_tool"]
]);
const OPERATION_NAME_ATTRIBUTE = "operation.name";
const AI_OPERATION_ID_ATTRIBUTE = "ai.operationId";
const AI_PROMPT_ATTRIBUTE = "ai.prompt";
const AI_SCHEMA_ATTRIBUTE = "ai.schema";
const AI_RESPONSE_OBJECT_ATTRIBUTE = "ai.response.object";
const AI_VALUES_ATTRIBUTE = "ai.values";
const AI_RESPONSE_TEXT_ATTRIBUTE = "ai.response.text";
const AI_RESPONSE_TOOL_CALLS_ATTRIBUTE = "ai.response.toolCalls";
const AI_RESPONSE_FINISH_REASON_ATTRIBUTE = "ai.response.finishReason";
const AI_PROMPT_MESSAGES_ATTRIBUTE = "ai.prompt.messages";
const AI_PROMPT_TOOLS_ATTRIBUTE = "ai.prompt.tools";
const AI_MODEL_ID_ATTRIBUTE = "ai.model.id";
const AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE = "ai.response.providerMetadata";
const AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE = "ai.usage.cachedInputTokens";
const AI_USAGE_INPUT_TOKEN_DETAILS_ATTRIBUTE_PREFIX = "ai.usage.inputTokenDetails.";
const AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE = "ai.telemetry.functionId";
const AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE = "ai.usage.completionTokens";
const AI_USAGE_PROMPT_TOKENS_ATTRIBUTE = "ai.usage.promptTokens";
const AI_USAGE_TOKENS_ATTRIBUTE = "ai.usage.tokens";
const AI_TOOL_CALL_NAME_ATTRIBUTE = "ai.toolCall.name";
const AI_TOOL_CALL_ID_ATTRIBUTE = "ai.toolCall.id";
const AI_TOOL_CALL_ARGS_ATTRIBUTE = "ai.toolCall.args";
const AI_TOOL_CALL_RESULT_ATTRIBUTE = "ai.toolCall.result";
function accumulateTokensForParent(span, tokenAccumulator) {
  const parentSpanId = span.parent_span_id;
  if (!parentSpanId) {
    return;
  }
  const inputTokens = span.data[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
  const outputTokens = span.data[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE];
  if (typeof inputTokens === "number" || typeof outputTokens === "number") {
    const existing = tokenAccumulator.get(parentSpanId) || { inputTokens: 0, outputTokens: 0 };
    if (typeof inputTokens === "number") {
      existing.inputTokens += inputTokens;
    }
    if (typeof outputTokens === "number") {
      existing.outputTokens += outputTokens;
    }
    tokenAccumulator.set(parentSpanId, existing);
  }
}
function applyAccumulatedTokens(spanOrTrace, tokenAccumulator) {
  const accumulated = tokenAccumulator.get(spanOrTrace.span_id);
  if (!accumulated || !spanOrTrace.data) {
    return;
  }
  if (accumulated.inputTokens > 0) {
    spanOrTrace.data[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = accumulated.inputTokens;
  }
  if (accumulated.outputTokens > 0) {
    spanOrTrace.data[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = accumulated.outputTokens;
  }
  if (accumulated.inputTokens > 0 || accumulated.outputTokens > 0) {
    spanOrTrace.data["gen_ai.usage.total_tokens"] = accumulated.inputTokens + accumulated.outputTokens;
  }
}
function buildToolDescriptionMap(spans) {
  const toolDescriptions = /* @__PURE__ */ new Map();
  for (const span of spans) {
    const availableTools = span.data[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE];
    if (typeof availableTools !== "string") {
      continue;
    }
    try {
      const tools = JSON.parse(availableTools);
      for (const tool of tools) {
        if (tool.name && tool.description && !toolDescriptions.has(tool.name)) {
          toolDescriptions.set(tool.name, tool.description);
        }
      }
    } catch {
    }
  }
  return toolDescriptions;
}
function applyToolDescriptionsAndTokens(spans, tokenAccumulator) {
  const toolDescriptions = buildToolDescriptionMap(spans);
  for (const span of spans) {
    if (span.op === "gen_ai.execute_tool") {
      const toolName = span.data[GEN_AI_TOOL_NAME_ATTRIBUTE];
      if (typeof toolName === "string") {
        const description = toolDescriptions.get(toolName);
        if (description) {
          span.data[GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = description;
        }
      }
    }
    if (span.op === "gen_ai.invoke_agent") {
      applyAccumulatedTokens(span, tokenAccumulator);
    }
  }
}
function _INTERNAL_getSpanContextForToolCallId(toolCallId) {
  return toolCallSpanContextMap.get(toolCallId);
}
function _INTERNAL_cleanupToolCallSpanContext(toolCallId) {
  toolCallSpanContextMap.delete(toolCallId);
}
function convertAvailableToolsToJsonString(tools) {
  const toolObjects = tools.map((tool) => {
    if (typeof tool === "string") {
      try {
        return JSON.parse(tool);
      } catch {
        return tool;
      }
    }
    return tool;
  });
  return JSON.stringify(toolObjects);
}
function filterMessagesArray(input) {
  return input.filter(
    (m) => !!m && typeof m === "object" && "role" in m && "content" in m
  );
}
function convertUserInputToMessagesFormat(userInput) {
  try {
    const p = JSON.parse(userInput);
    if (!!p && typeof p === "object") {
      let { messages } = p;
      const { prompt, system } = p;
      const result = [];
      if (typeof system === "string") {
        result.push({ role: "system", content: system });
      }
      if (typeof messages === "string") {
        try {
          messages = JSON.parse(messages);
        } catch {
        }
      }
      if (Array.isArray(messages)) {
        result.push(...filterMessagesArray(messages));
        return result;
      }
      if (Array.isArray(prompt)) {
        result.push(...filterMessagesArray(prompt));
        return result;
      }
      if (typeof prompt === "string") {
        result.push({ role: "user", content: prompt });
      }
      if (result.length > 0) {
        return result;
      }
    }
  } catch {
  }
  return [];
}
function requestMessagesFromPrompt(span, attributes, enableTruncation) {
  if (typeof attributes[AI_PROMPT_ATTRIBUTE] === "string" && !attributes[GEN_AI_INPUT_MESSAGES_ATTRIBUTE] && !attributes[AI_PROMPT_MESSAGES_ATTRIBUTE]) {
    const userInput = attributes[AI_PROMPT_ATTRIBUTE];
    const messages = convertUserInputToMessagesFormat(userInput);
    if (messages.length) {
      const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
      if (systemInstructions) {
        span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
      }
      const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
      const messagesJson = enableTruncation ? getTruncatedJsonString(filteredMessages) : getJsonString(filteredMessages);
      span.setAttributes({
        [AI_PROMPT_ATTRIBUTE]: messagesJson,
        [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: messagesJson,
        [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
      });
    }
  } else if (typeof attributes[AI_PROMPT_MESSAGES_ATTRIBUTE] === "string") {
    const originalMessagesJson = attributes[AI_PROMPT_MESSAGES_ATTRIBUTE];
    try {
      const messages = JSON.parse(originalMessagesJson);
      if (Array.isArray(messages)) {
        const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
        if (systemInstructions) {
          span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
        }
        const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
        const messagesJson = !enableTruncation && filteredMessages === messages ? originalMessagesJson : enableTruncation ? getTruncatedJsonString(filteredMessages) : getJsonString(filteredMessages);
        span.setAttributes({
          [AI_PROMPT_MESSAGES_ATTRIBUTE]: messagesJson,
          [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: messagesJson,
          [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
        });
      }
    } catch {
    }
  }
}
function onVercelAiSpanStart(span) {
  const { data: attributes, description: name } = spanToJSON(span);
  if (!name) {
    return;
  }
  if (attributes[AI_TOOL_CALL_NAME_ATTRIBUTE] && attributes[AI_TOOL_CALL_ID_ATTRIBUTE] && name === "ai.toolCall") {
    processToolCallSpan(span, attributes);
    return;
  }
  if (!attributes[AI_OPERATION_ID_ATTRIBUTE] && !name.startsWith("ai.")) {
    return;
  }
  const client = getClient();
  const integration = client?.getIntegrationByName("VercelAI");
  const enableTruncation = shouldEnableTruncation(integration?.options?.enableTruncation);
  processGenerateSpan(span, name, attributes, enableTruncation);
}
function vercelAiEventProcessor(event) {
  if (event.type === "transaction" && event.spans) {
    const tokenAccumulator = /* @__PURE__ */ new Map();
    for (const span of event.spans) {
      processEndedVercelAiSpan(span);
      accumulateTokensForParent(span, tokenAccumulator);
    }
    applyToolDescriptionsAndTokens(event.spans, tokenAccumulator);
    const trace = event.contexts?.trace;
    if (trace?.op === "gen_ai.invoke_agent") {
      applyAccumulatedTokens(trace, tokenAccumulator);
    }
  }
  return event;
}
function normalizeFinishReason(finishReason) {
  if (typeof finishReason !== "string") {
    return "stop";
  }
  switch (finishReason) {
    case "tool-calls":
      return "tool_call";
    case "stop":
    case "length":
    case "content_filter":
    case "error":
      return finishReason;
    default:
      return finishReason;
  }
}
function buildOutputMessages(attributes) {
  const responseText = attributes[AI_RESPONSE_TEXT_ATTRIBUTE];
  const responseToolCalls = attributes[AI_RESPONSE_TOOL_CALLS_ATTRIBUTE];
  const finishReason = attributes[AI_RESPONSE_FINISH_REASON_ATTRIBUTE];
  if (responseText == null && responseToolCalls == null) {
    return;
  }
  const parts = [];
  if (typeof responseText === "string" && responseText.length > 0) {
    parts.push({
      type: "text",
      content: responseText
    });
  }
  if (responseToolCalls != null) {
    try {
      const toolCalls = typeof responseToolCalls === "string" ? JSON.parse(responseToolCalls) : responseToolCalls;
      if (Array.isArray(toolCalls)) {
        for (const toolCall of toolCalls) {
          const args = toolCall.input ?? toolCall.args;
          parts.push({
            type: "tool_call",
            id: toolCall.toolCallId,
            name: toolCall.toolName,
            // Handle undefined args: JSON.stringify(undefined) returns undefined, not a string,
            // which would cause the property to be omitted from the final JSON output
            arguments: typeof args === "string" ? args : JSON.stringify(args ?? {})
          });
        }
        delete attributes[AI_RESPONSE_TOOL_CALLS_ATTRIBUTE];
      }
    } catch {
    }
  }
  if (parts.length > 0) {
    const outputMessage = {
      role: "assistant",
      parts,
      finish_reason: normalizeFinishReason(finishReason)
    };
    attributes[GEN_AI_OUTPUT_MESSAGES_ATTRIBUTE] = JSON.stringify([outputMessage]);
    delete attributes[AI_RESPONSE_TEXT_ATTRIBUTE];
  }
}
function processVercelAiSpanAttributes(attributes) {
  renameAttributeKey(attributes, AI_USAGE_COMPLETION_TOKENS_ATTRIBUTE, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE);
  renameAttributeKey(attributes, AI_USAGE_PROMPT_TOKENS_ATTRIBUTE, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
  renameAttributeKey(attributes, AI_USAGE_CACHED_INPUT_TOKENS_ATTRIBUTE, GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE);
  renameAttributeKey(attributes, "ai.usage.inputTokens", GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
  renameAttributeKey(attributes, "ai.usage.outputTokens", GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE);
  renameAttributeKey(attributes, AI_USAGE_TOKENS_ATTRIBUTE, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE);
  renameAttributeKey(attributes, "ai.response.avgOutputTokensPerSecond", "ai.response.avgCompletionTokensPerSecond");
  const inputTokensAreCacheInclusive = Object.keys(attributes).some(
    (key) => key.startsWith(AI_USAGE_INPUT_TOKEN_DETAILS_ATTRIBUTE_PREFIX)
  );
  if (!inputTokensAreCacheInclusive && typeof attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] === "number" && typeof attributes[GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE] === "number") {
    attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] + attributes[GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE];
  }
  if (typeof attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] === "number") {
    const outputTokens = typeof attributes[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] === "number" ? attributes[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] : 0;
    attributes[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = outputTokens + attributes[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE];
  }
  if (attributes[AI_PROMPT_TOOLS_ATTRIBUTE] && Array.isArray(attributes[AI_PROMPT_TOOLS_ATTRIBUTE])) {
    attributes[AI_PROMPT_TOOLS_ATTRIBUTE] = convertAvailableToolsToJsonString(
      attributes[AI_PROMPT_TOOLS_ATTRIBUTE]
    );
  }
  if (attributes[OPERATION_NAME_ATTRIBUTE]) {
    const rawOperationName = attributes[AI_OPERATION_ID_ATTRIBUTE] ? attributes[AI_OPERATION_ID_ATTRIBUTE] : attributes[OPERATION_NAME_ATTRIBUTE];
    const operationName = SPAN_TO_OPERATION_NAME.get(rawOperationName) ?? rawOperationName;
    attributes[GEN_AI_OPERATION_NAME_ATTRIBUTE] = operationName;
    delete attributes[OPERATION_NAME_ATTRIBUTE];
  }
  renameAttributeKey(attributes, AI_PROMPT_MESSAGES_ATTRIBUTE, GEN_AI_INPUT_MESSAGES_ATTRIBUTE);
  buildOutputMessages(attributes);
  renameAttributeKey(attributes, AI_RESPONSE_OBJECT_ATTRIBUTE, "gen_ai.response.object");
  renameAttributeKey(attributes, AI_PROMPT_TOOLS_ATTRIBUTE, "gen_ai.request.available_tools");
  renameAttributeKey(attributes, AI_TOOL_CALL_ARGS_ATTRIBUTE, GEN_AI_TOOL_INPUT_ATTRIBUTE);
  renameAttributeKey(attributes, AI_TOOL_CALL_RESULT_ATTRIBUTE, GEN_AI_TOOL_OUTPUT_ATTRIBUTE);
  renameAttributeKey(attributes, AI_SCHEMA_ATTRIBUTE, "gen_ai.request.schema");
  renameAttributeKey(attributes, AI_MODEL_ID_ATTRIBUTE, GEN_AI_REQUEST_MODEL_ATTRIBUTE);
  if (Array.isArray(attributes[AI_VALUES_ATTRIBUTE])) {
    const parsed = attributes[AI_VALUES_ATTRIBUTE].map((v) => {
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    });
    attributes[GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE] = parsed.length === 1 ? parsed[0] : JSON.stringify(parsed);
  }
  addProviderMetadataToAttributes(attributes);
  for (const key of Object.keys(attributes)) {
    if (Array.isArray(attributes[key])) {
      attributes[key] = JSON.stringify(attributes[key]);
    }
    if (key.startsWith("ai.")) {
      renameAttributeKey(attributes, key, `vercel.${key}`);
    }
  }
}
function processEndedVercelAiSpan(span) {
  const { data: attributes, origin } = span;
  if (origin !== "auto.vercelai.otel") {
    return;
  }
  if (span.status && span.status !== "ok") {
    span.status = "internal_error";
  }
  processVercelAiSpanAttributes(attributes);
}
function processVercelAiStreamedSpan(span) {
  const attributes = span.attributes;
  if (attributes?.[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN] !== "auto.vercelai.otel") {
    return;
  }
  processVercelAiSpanAttributes(attributes);
  if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP] === "gen_ai.execute_tool" && span.parent_span_id) {
    const descriptions = toolDescriptionMap.get(span.parent_span_id);
    if (descriptions) {
      const toolName = attributes[GEN_AI_TOOL_NAME_ATTRIBUTE];
      if (typeof toolName === "string") {
        const desc = descriptions.get(toolName);
        if (desc) {
          attributes[GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = desc;
        }
      }
    }
  }
  toolDescriptionMap.delete(span.span_id);
}
function renameAttributeKey(attributes, oldKey, newKey) {
  if (attributes[oldKey] != null) {
    attributes[newKey] = attributes[oldKey];
    delete attributes[oldKey];
  }
}
function processToolCallSpan(span, attributes) {
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.vercelai.otel");
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "gen_ai.execute_tool");
  span.setAttribute(GEN_AI_OPERATION_NAME_ATTRIBUTE, "execute_tool");
  renameAttributeKey(attributes, AI_TOOL_CALL_NAME_ATTRIBUTE, GEN_AI_TOOL_NAME_ATTRIBUTE);
  renameAttributeKey(attributes, AI_TOOL_CALL_ID_ATTRIBUTE, GEN_AI_TOOL_CALL_ID_ATTRIBUTE);
  const toolCallId = attributes[GEN_AI_TOOL_CALL_ID_ATTRIBUTE];
  if (typeof toolCallId === "string") {
    toolCallSpanContextMap.set(toolCallId, span.spanContext());
  }
  if (!attributes[GEN_AI_TOOL_TYPE_ATTRIBUTE]) {
    span.setAttribute(GEN_AI_TOOL_TYPE_ATTRIBUTE, "function");
  }
  const toolName = attributes[GEN_AI_TOOL_NAME_ATTRIBUTE];
  if (toolName) {
    span.updateName(`execute_tool ${toolName}`);
  }
}
function processGenerateSpan(span, name, attributes, enableTruncation) {
  span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.vercelai.otel");
  const nameWthoutAi = name.replace("ai.", "");
  span.setAttribute("ai.pipeline.name", nameWthoutAi);
  span.updateName(nameWthoutAi);
  const functionId = attributes[AI_TELEMETRY_FUNCTION_ID_ATTRIBUTE];
  if (functionId && typeof functionId === "string") {
    span.setAttribute("gen_ai.function_id", functionId);
  }
  requestMessagesFromPrompt(span, attributes, enableTruncation);
  if (attributes[AI_MODEL_ID_ATTRIBUTE] && !attributes[GEN_AI_RESPONSE_MODEL_ATTRIBUTE]) {
    span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE, attributes[AI_MODEL_ID_ATTRIBUTE]);
  }
  span.setAttribute("ai.streaming", name.includes("stream"));
  const operationName = SPAN_TO_OPERATION_NAME.get(name);
  if (operationName) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, `gen_ai.${operationName}`);
  } else if (name.startsWith("ai.stream")) {
    span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_OP, "ai.run");
  }
  if (operationName === "invoke_agent") {
    if (functionId && typeof functionId === "string") {
      span.updateName(`invoke_agent ${functionId}`);
    } else {
      span.updateName("invoke_agent");
    }
    return;
  }
  const modelId = attributes[AI_MODEL_ID_ATTRIBUTE];
  if (modelId && operationName) {
    span.updateName(`${operationName} ${modelId}`);
  }
  const client = getClient();
  if (client && hasSpanStreamingEnabled(client) && attributes[AI_PROMPT_TOOLS_ATTRIBUTE] && Array.isArray(attributes[AI_PROMPT_TOOLS_ATTRIBUTE])) {
    const descriptions = /* @__PURE__ */ new Map();
    for (const toolStr of attributes[AI_PROMPT_TOOLS_ATTRIBUTE]) {
      try {
        const parsed = typeof toolStr === "string" ? JSON.parse(toolStr) : toolStr;
        if (parsed?.name && parsed?.description) {
          descriptions.set(parsed.name, parsed.description);
        }
      } catch {
      }
    }
    if (descriptions.size > 0) {
      const parentSpanId = spanToJSON(span).parent_span_id;
      if (parentSpanId) {
        toolDescriptionMap.set(parentSpanId, descriptions);
      }
    }
  }
}
function addVercelAiProcessors(client) {
  client.on("spanStart", onVercelAiSpanStart);
  client.addEventProcessor(Object.assign(vercelAiEventProcessor, { id: "VercelAiEventProcessor" }));
  client.on("processSpan", (span) => {
    processVercelAiStreamedSpan(span);
  });
}
function addProviderMetadataToAttributes(attributes) {
  const providerMetadata = attributes[AI_RESPONSE_PROVIDER_METADATA_ATTRIBUTE];
  if (providerMetadata) {
    try {
      const providerMetadataObject = JSON.parse(providerMetadata);
      const openaiMetadata = providerMetadataObject.openai ?? providerMetadataObject.azure;
      if (openaiMetadata) {
        setAttributeIfDefined(
          attributes,
          GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE,
          openaiMetadata.cachedPromptTokens
        );
        setAttributeIfDefined(attributes, "gen_ai.usage.output_tokens.reasoning", openaiMetadata.reasoningTokens);
        setAttributeIfDefined(
          attributes,
          "gen_ai.usage.output_tokens.prediction_accepted",
          openaiMetadata.acceptedPredictionTokens
        );
        setAttributeIfDefined(
          attributes,
          "gen_ai.usage.output_tokens.prediction_rejected",
          openaiMetadata.rejectedPredictionTokens
        );
        if (!attributes["gen_ai.conversation.id"]) {
          setAttributeIfDefined(attributes, "gen_ai.conversation.id", openaiMetadata.responseId);
        }
      }
      if (providerMetadataObject.anthropic) {
        const cachedInputTokens = providerMetadataObject.anthropic.usage?.cache_read_input_tokens ?? providerMetadataObject.anthropic.cacheReadInputTokens;
        setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE, cachedInputTokens);
        const cacheWriteInputTokens = providerMetadataObject.anthropic.usage?.cache_creation_input_tokens ?? providerMetadataObject.anthropic.cacheCreationInputTokens;
        setAttributeIfDefined(attributes, GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE, cacheWriteInputTokens);
      }
      if (providerMetadataObject.bedrock?.usage) {
        setAttributeIfDefined(
          attributes,
          GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE,
          providerMetadataObject.bedrock.usage.cacheReadInputTokens
        );
        setAttributeIfDefined(
          attributes,
          GEN_AI_USAGE_INPUT_TOKENS_CACHE_WRITE_ATTRIBUTE,
          providerMetadataObject.bedrock.usage.cacheWriteInputTokens
        );
      }
      if (providerMetadataObject.deepseek) {
        setAttributeIfDefined(
          attributes,
          GEN_AI_USAGE_INPUT_TOKENS_CACHED_ATTRIBUTE,
          providerMetadataObject.deepseek.promptCacheHitTokens
        );
        setAttributeIfDefined(
          attributes,
          "gen_ai.usage.input_tokens.cache_miss",
          providerMetadataObject.deepseek.promptCacheMissTokens
        );
      }
    } catch {
    }
  }
}
function setAttributeIfDefined(attributes, key, value) {
  if (value != null) {
    attributes[key] = value;
  }
}
const OPENAI_INTEGRATION_NAME = "OpenAI";
const OPENAI_METHOD_REGISTRY = {
  "responses.create": { operation: "chat" },
  "chat.completions.create": { operation: "chat" },
  "embeddings.create": { operation: "embeddings" },
  // Conversations API - for conversation state management
  // https://platform.openai.com/docs/guides/conversation-state
  "conversations.create": { operation: "chat" }
};
const RESPONSES_TOOL_CALL_EVENT_TYPES = [
  "response.output_item.added",
  "response.function_call_arguments.delta",
  "response.function_call_arguments.done",
  "response.output_item.done"
];
const RESPONSE_EVENT_TYPES = [
  "response.created",
  "response.in_progress",
  "response.failed",
  "response.completed",
  "response.incomplete",
  "response.queued",
  "response.output_text.delta",
  ...RESPONSES_TOOL_CALL_EVENT_TYPES
];
function isResponsesApiStreamEvent(event) {
  return event !== null && typeof event === "object" && "type" in event && typeof event.type === "string" && event.type.startsWith("response.");
}
function isChatCompletionChunk(event) {
  return event !== null && typeof event === "object" && "object" in event && event.object === "chat.completion.chunk";
}
function addResponseAttributes$2(span, result, recordOutputs) {
  if (!result || typeof result !== "object") return;
  const response = result;
  const attrs = {};
  if (typeof response.id === "string") {
    attrs[GEN_AI_RESPONSE_ID_ATTRIBUTE] = response.id;
  }
  if (typeof response.model === "string") {
    attrs[GEN_AI_RESPONSE_MODEL_ATTRIBUTE] = response.model;
  }
  if (response.object === "conversation" && typeof response.id === "string") {
    attrs[GEN_AI_CONVERSATION_ID_ATTRIBUTE] = response.id;
  }
  if (response.usage && typeof response.usage === "object") {
    const usage = response.usage;
    const inputTokens = usage.prompt_tokens ?? usage.input_tokens;
    if (typeof inputTokens === "number") {
      attrs[GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE] = inputTokens;
    }
    const outputTokens = usage.completion_tokens ?? usage.output_tokens;
    if (typeof outputTokens === "number") {
      attrs[GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE] = outputTokens;
    }
    if (typeof usage.total_tokens === "number") {
      attrs[GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE] = usage.total_tokens;
    }
  }
  if (Array.isArray(response.choices)) {
    const choices = response.choices;
    const finishReasons = choices.map((choice) => choice.finish_reason).filter((reason) => typeof reason === "string");
    if (finishReasons.length > 0) {
      attrs[GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify(finishReasons);
    }
    if (recordOutputs) {
      const responseTexts = choices.map((choice) => {
        const message = choice.message;
        return message?.content || "";
      });
      attrs[GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = JSON.stringify(responseTexts);
      const toolCalls = choices.map((choice) => {
        const message = choice.message;
        return message?.tool_calls;
      }).filter((calls) => Array.isArray(calls) && calls.length > 0).flat();
      if (toolCalls.length > 0) {
        attrs[GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(toolCalls);
      }
    }
  }
  if (typeof response.status === "string") {
    if (!attrs[GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE]) {
      attrs[GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE] = JSON.stringify([response.status]);
    }
  }
  if (recordOutputs) {
    if (typeof response.output_text === "string" && !attrs[GEN_AI_RESPONSE_TEXT_ATTRIBUTE]) {
      attrs[GEN_AI_RESPONSE_TEXT_ATTRIBUTE] = response.output_text;
    }
    if (Array.isArray(response.output) && response.output.length > 0 && !attrs[GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]) {
      const functionCalls = response.output.filter(
        (item) => item?.type === "function_call"
      );
      if (functionCalls.length > 0) {
        attrs[GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE] = JSON.stringify(functionCalls);
      }
    }
  }
  span.setAttributes(attrs);
}
function extractConversationId(params) {
  if ("conversation" in params && typeof params.conversation === "string") {
    return params.conversation;
  }
  if ("previous_response_id" in params && typeof params.previous_response_id === "string") {
    return params.previous_response_id;
  }
  return void 0;
}
function extractRequestParameters(params) {
  const attributes = {
    [GEN_AI_REQUEST_MODEL_ATTRIBUTE]: params.model ?? "unknown"
  };
  if ("temperature" in params) attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = params.temperature;
  if ("top_p" in params) attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = params.top_p;
  if ("frequency_penalty" in params) attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = params.frequency_penalty;
  if ("presence_penalty" in params) attributes[GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE] = params.presence_penalty;
  if ("stream" in params) attributes[GEN_AI_REQUEST_STREAM_ATTRIBUTE] = params.stream;
  if ("encoding_format" in params) attributes[GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE] = params.encoding_format;
  if ("dimensions" in params) attributes[GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE] = params.dimensions;
  const conversationId = extractConversationId(params);
  if (conversationId) {
    attributes[GEN_AI_CONVERSATION_ID_ATTRIBUTE] = conversationId;
  }
  return attributes;
}
function processChatCompletionToolCalls(toolCalls, state) {
  for (const toolCall of toolCalls) {
    const index = toolCall.index;
    if (index === void 0 || !toolCall.function) continue;
    if (!(index in state.chatCompletionToolCalls)) {
      state.chatCompletionToolCalls[index] = {
        ...toolCall,
        function: {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments || ""
        }
      };
    } else {
      const existingToolCall = state.chatCompletionToolCalls[index];
      if (toolCall.function.arguments && existingToolCall?.function) {
        existingToolCall.function.arguments += toolCall.function.arguments;
      }
    }
  }
}
function processChatCompletionChunk(chunk, state, recordOutputs) {
  state.responseId = chunk.id ?? state.responseId;
  state.responseModel = chunk.model ?? state.responseModel;
  if (chunk.usage) {
    state.promptTokens = chunk.usage.prompt_tokens;
    state.completionTokens = chunk.usage.completion_tokens;
    state.totalTokens = chunk.usage.total_tokens;
  }
  for (const choice of chunk.choices ?? []) {
    if (recordOutputs) {
      if (choice.delta?.content) {
        state.responseTexts.push(choice.delta.content);
      }
      if (choice.delta?.tool_calls) {
        processChatCompletionToolCalls(choice.delta.tool_calls, state);
      }
    }
    if (choice.finish_reason) {
      state.finishReasons.push(choice.finish_reason);
    }
  }
}
function processResponsesApiEvent(streamEvent, state, recordOutputs, span) {
  if (!(streamEvent && typeof streamEvent === "object")) {
    state.eventTypes.push("unknown:non-object");
    return;
  }
  if (streamEvent instanceof Error) {
    span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
    captureException(streamEvent, {
      mechanism: {
        handled: false,
        type: "auto.ai.openai.stream-response"
      }
    });
    return;
  }
  if (!("type" in streamEvent)) return;
  const event = streamEvent;
  if (!RESPONSE_EVENT_TYPES.includes(event.type)) {
    state.eventTypes.push(event.type);
    return;
  }
  if (recordOutputs) {
    if (event.type === "response.output_item.done" && "item" in event) {
      state.responsesApiToolCalls.push(event.item);
    }
    if (event.type === "response.output_text.delta" && "delta" in event && event.delta) {
      state.responseTexts.push(event.delta);
      return;
    }
  }
  if ("response" in event) {
    const { response } = event;
    state.responseId = response.id ?? state.responseId;
    state.responseModel = response.model ?? state.responseModel;
    if (response.usage) {
      state.promptTokens = response.usage.input_tokens;
      state.completionTokens = response.usage.output_tokens;
      state.totalTokens = response.usage.total_tokens;
    }
    if (response.status) {
      state.finishReasons.push(response.status);
    }
    if (recordOutputs && response.output_text) {
      state.responseTexts.push(response.output_text);
    }
  }
}
async function* instrumentStream$1(stream, span, recordOutputs) {
  const state = {
    eventTypes: [],
    responseTexts: [],
    finishReasons: [],
    responseId: "",
    responseModel: "",
    promptTokens: void 0,
    completionTokens: void 0,
    totalTokens: void 0,
    chatCompletionToolCalls: {},
    responsesApiToolCalls: []
  };
  try {
    for await (const event of stream) {
      if (isChatCompletionChunk(event)) {
        processChatCompletionChunk(event, state, recordOutputs);
      } else if (isResponsesApiStreamEvent(event)) {
        processResponsesApiEvent(event, state, recordOutputs, span);
      }
      yield event;
    }
  } finally {
    const allToolCalls = [...Object.values(state.chatCompletionToolCalls), ...state.responsesApiToolCalls];
    endStreamSpan(span, { ...state, toolCalls: allToolCalls }, recordOutputs);
  }
}
function extractAvailableTools(params) {
  const tools = Array.isArray(params.tools) ? params.tools : [];
  const hasWebSearchOptions = params.web_search_options && typeof params.web_search_options === "object";
  const webSearchOptions = hasWebSearchOptions ? [{ type: "web_search_options", ...params.web_search_options }] : [];
  const availableTools = [...tools, ...webSearchOptions];
  if (availableTools.length === 0) {
    return void 0;
  }
  try {
    return JSON.stringify(availableTools);
  } catch (error2) {
    DEBUG_BUILD && debug.error("Failed to serialize OpenAI tools:", error2);
    return void 0;
  }
}
function extractRequestAttributes$2(args, operationName) {
  const attributes = {
    [GEN_AI_SYSTEM_ATTRIBUTE]: "openai",
    [GEN_AI_OPERATION_NAME_ATTRIBUTE]: operationName,
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.openai"
  };
  if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
    const params = args[0];
    const availableTools = extractAvailableTools(params);
    if (availableTools) {
      attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = availableTools;
    }
    Object.assign(attributes, extractRequestParameters(params));
  } else {
    attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = "unknown";
  }
  return attributes;
}
function addRequestAttributes(span, params, operationName, enableTruncation) {
  if (operationName === "embeddings" && "input" in params) {
    const input = params.input;
    if (input == null) {
      return;
    }
    if (typeof input === "string" && input.length === 0) {
      return;
    }
    if (Array.isArray(input) && input.length === 0) {
      return;
    }
    span.setAttribute(GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE, typeof input === "string" ? input : JSON.stringify(input));
    return;
  }
  const src = "input" in params ? params.input : "messages" in params ? params.messages : void 0;
  if (!src) {
    return;
  }
  if (Array.isArray(src) && src.length === 0) {
    return;
  }
  const { systemInstructions, filteredMessages } = extractSystemInstructions(src);
  if (systemInstructions) {
    span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
  }
  span.setAttribute(
    GEN_AI_INPUT_MESSAGES_ATTRIBUTE,
    enableTruncation ? getTruncatedJsonString(filteredMessages) : getJsonString(filteredMessages)
  );
  if (Array.isArray(filteredMessages)) {
    span.setAttribute(GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, filteredMessages.length);
  } else {
    span.setAttribute(GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, 1);
  }
}
function instrumentMethod$2(originalMethod, methodPath, instrumentedMethod, context, options) {
  return function instrumentedCall(...args) {
    const operationName = instrumentedMethod.operation || "unknown";
    const requestAttributes = extractRequestAttributes$2(args, operationName);
    const model = requestAttributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] || "unknown";
    const params = args[0];
    const isStreamRequested = params && typeof params === "object" && params.stream === true;
    const spanConfig = {
      name: `${operationName} ${model}`,
      op: `gen_ai.${operationName}`,
      attributes: requestAttributes
    };
    if (isStreamRequested) {
      let originalResult2;
      const instrumentedPromise2 = startSpanManual(spanConfig, (span) => {
        originalResult2 = originalMethod.apply(context, args);
        if (options.recordInputs && params) {
          addRequestAttributes(span, params, operationName, shouldEnableTruncation(options.enableTruncation));
        }
        return (async () => {
          try {
            const result = await originalResult2;
            return instrumentStream$1(
              result,
              span,
              options.recordOutputs ?? false
            );
          } catch (error2) {
            span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
            captureException(error2, {
              mechanism: {
                handled: false,
                type: "auto.ai.openai.stream",
                data: { function: methodPath }
              }
            });
            span.end();
            throw error2;
          }
        })();
      });
      return wrapPromiseWithMethods(originalResult2, instrumentedPromise2, "auto.ai.openai");
    }
    let originalResult;
    const instrumentedPromise = startSpan(spanConfig, (span) => {
      originalResult = originalMethod.apply(context, args);
      if (options.recordInputs && params) {
        addRequestAttributes(span, params, operationName, shouldEnableTruncation(options.enableTruncation));
      }
      return originalResult.then(
        (result) => {
          addResponseAttributes$2(span, result, options.recordOutputs);
          return result;
        },
        (error2) => {
          captureException(error2, {
            mechanism: {
              handled: false,
              type: "auto.ai.openai",
              data: { function: methodPath }
            }
          });
          throw error2;
        }
      );
    });
    return wrapPromiseWithMethods(originalResult, instrumentedPromise, "auto.ai.openai");
  };
}
function createDeepProxy$2(target, currentPath = "", options) {
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      const methodPath = buildMethodPath(currentPath, String(prop));
      const instrumentedMethod = OPENAI_METHOD_REGISTRY[methodPath];
      if (typeof value === "function" && instrumentedMethod) {
        return instrumentMethod$2(
          value,
          methodPath,
          instrumentedMethod,
          obj,
          options
        );
      }
      if (typeof value === "function") {
        return value.bind(obj);
      }
      if (value && typeof value === "object") {
        return createDeepProxy$2(value, methodPath, options);
      }
      return value;
    }
  });
}
function instrumentOpenAiClient(client, options) {
  return createDeepProxy$2(client, "", resolveAIRecordingOptions(options));
}
const ANTHROPIC_AI_INTEGRATION_NAME = "Anthropic_AI";
const ANTHROPIC_METHOD_REGISTRY = {
  "messages.create": { operation: "chat" },
  "messages.stream": { operation: "chat", streaming: true },
  "messages.countTokens": { operation: "chat" },
  "models.get": { operation: "models" },
  "completions.create": { operation: "chat" },
  "models.retrieve": { operation: "models" },
  "beta.messages.create": { operation: "chat" }
};
function setMessagesAttribute(span, messages, enableTruncation) {
  if (Array.isArray(messages) && messages.length === 0) {
    return;
  }
  const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
  if (systemInstructions) {
    span.setAttributes({
      [GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE]: systemInstructions
    });
  }
  const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 1;
  span.setAttributes({
    [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: enableTruncation ? getTruncatedJsonString(filteredMessages) : getJsonString(filteredMessages),
    [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
  });
}
const ANTHROPIC_ERROR_TYPE_TO_SPAN_STATUS = {
  invalid_request_error: "invalid_argument",
  authentication_error: "unauthenticated",
  permission_error: "permission_denied",
  not_found_error: "not_found",
  request_too_large: "failed_precondition",
  rate_limit_error: "resource_exhausted",
  api_error: "internal_error",
  overloaded_error: "unavailable"
};
function mapAnthropicErrorToStatusMessage(errorType) {
  if (!errorType) {
    return "internal_error";
  }
  return ANTHROPIC_ERROR_TYPE_TO_SPAN_STATUS[errorType] || "internal_error";
}
function handleResponseError(span, response) {
  if (response.error) {
    span.setStatus({ code: SPAN_STATUS_ERROR, message: mapAnthropicErrorToStatusMessage(response.error.type) });
    captureException(response.error, {
      mechanism: {
        handled: false,
        type: "auto.ai.anthropic.anthropic_error"
      }
    });
  }
}
function messagesFromParams(params) {
  const { system, messages, input } = params;
  const systemMessages = typeof system === "string" ? [{ role: "system", content: params.system }] : [];
  const inputParamMessages = Array.isArray(input) ? input : input != null ? [input] : void 0;
  const messagesParamMessages = Array.isArray(messages) ? messages : messages != null ? [messages] : [];
  const userMessages = inputParamMessages ?? messagesParamMessages;
  return [...systemMessages, ...userMessages];
}
function isErrorEvent(event, span) {
  if ("type" in event && typeof event.type === "string") {
    if (event.type === "error") {
      span.setStatus({ code: SPAN_STATUS_ERROR, message: mapAnthropicErrorToStatusMessage(event.error?.type) });
      captureException(event.error, {
        mechanism: {
          handled: false,
          type: "auto.ai.anthropic.anthropic_error"
        }
      });
      return true;
    }
  }
  return false;
}
function handleMessageMetadata(event, state) {
  if (event.type === "message_delta" && event.usage) {
    if ("output_tokens" in event.usage && typeof event.usage.output_tokens === "number") {
      state.completionTokens = event.usage.output_tokens;
    }
  }
  if (event.message) {
    const message = event.message;
    if (message.id) state.responseId = message.id;
    if (message.model) state.responseModel = message.model;
    if (message.stop_reason) state.finishReasons.push(message.stop_reason);
    if (message.usage) {
      if (typeof message.usage.input_tokens === "number") state.promptTokens = message.usage.input_tokens;
      if (typeof message.usage.cache_creation_input_tokens === "number")
        state.cacheCreationInputTokens = message.usage.cache_creation_input_tokens;
      if (typeof message.usage.cache_read_input_tokens === "number")
        state.cacheReadInputTokens = message.usage.cache_read_input_tokens;
    }
  }
}
function handleContentBlockStart(event, state) {
  if (event.type !== "content_block_start" || typeof event.index !== "number" || !event.content_block) return;
  if (event.content_block.type === "tool_use" || event.content_block.type === "server_tool_use") {
    state.activeToolBlocks[event.index] = {
      id: event.content_block.id,
      name: event.content_block.name,
      inputJsonParts: []
    };
  }
}
function handleContentBlockDelta(event, state, recordOutputs) {
  if (event.type !== "content_block_delta" || !event.delta) return;
  if (typeof event.index === "number" && "partial_json" in event.delta && typeof event.delta.partial_json === "string") {
    const active = state.activeToolBlocks[event.index];
    if (active) {
      active.inputJsonParts.push(event.delta.partial_json);
    }
  }
  if (recordOutputs && typeof event.delta.text === "string") {
    state.responseTexts.push(event.delta.text);
  }
}
function handleContentBlockStop(event, state) {
  if (event.type !== "content_block_stop" || typeof event.index !== "number") return;
  const active = state.activeToolBlocks[event.index];
  if (!active) return;
  const raw = active.inputJsonParts.join("");
  let parsedInput;
  try {
    parsedInput = raw ? JSON.parse(raw) : {};
  } catch {
    parsedInput = { __unparsed: raw };
  }
  state.toolCalls.push({
    type: "tool_use",
    id: active.id,
    name: active.name,
    input: parsedInput
  });
  delete state.activeToolBlocks[event.index];
}
function processEvent(event, state, recordOutputs, span) {
  if (!(event && typeof event === "object")) {
    return;
  }
  const isError2 = isErrorEvent(event, span);
  if (isError2) return;
  handleMessageMetadata(event, state);
  handleContentBlockStart(event, state);
  handleContentBlockDelta(event, state, recordOutputs);
  handleContentBlockStop(event, state);
}
async function* instrumentAsyncIterableStream(stream, span, recordOutputs) {
  const state = {
    responseTexts: [],
    finishReasons: [],
    responseId: "",
    responseModel: "",
    promptTokens: void 0,
    completionTokens: void 0,
    cacheCreationInputTokens: void 0,
    cacheReadInputTokens: void 0,
    toolCalls: [],
    activeToolBlocks: {}
  };
  try {
    for await (const event of stream) {
      processEvent(event, state, recordOutputs, span);
      yield event;
    }
  } finally {
    endStreamSpan(span, state, recordOutputs);
  }
}
function instrumentMessageStream(stream, span, recordOutputs) {
  const state = {
    responseTexts: [],
    finishReasons: [],
    responseId: "",
    responseModel: "",
    promptTokens: void 0,
    completionTokens: void 0,
    cacheCreationInputTokens: void 0,
    cacheReadInputTokens: void 0,
    toolCalls: [],
    activeToolBlocks: {}
  };
  stream.on("streamEvent", (event) => {
    processEvent(event, state, recordOutputs, span);
  });
  stream.on("message", () => {
    endStreamSpan(span, state, recordOutputs);
  });
  stream.on("error", (error2) => {
    captureException(error2, {
      mechanism: {
        handled: false,
        type: "auto.ai.anthropic.stream_error"
      }
    });
    if (span.isRecording()) {
      span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
      span.end();
    }
  });
  return stream;
}
function extractRequestAttributes$1(args, methodPath, operationName) {
  const attributes = {
    [GEN_AI_SYSTEM_ATTRIBUTE]: "anthropic",
    [GEN_AI_OPERATION_NAME_ATTRIBUTE]: operationName,
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.anthropic"
  };
  if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
    const params = args[0];
    if (params.tools && Array.isArray(params.tools)) {
      attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = JSON.stringify(params.tools);
    }
    attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = params.model ?? "unknown";
    if ("temperature" in params) attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = params.temperature;
    if ("top_p" in params) attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = params.top_p;
    if ("stream" in params) attributes[GEN_AI_REQUEST_STREAM_ATTRIBUTE] = params.stream;
    if ("top_k" in params) attributes[GEN_AI_REQUEST_TOP_K_ATTRIBUTE] = params.top_k;
    if ("frequency_penalty" in params)
      attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = params.frequency_penalty;
    if ("max_tokens" in params) attributes[GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE] = params.max_tokens;
  } else {
    if (methodPath === "models.retrieve" || methodPath === "models.get") {
      attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = args[0];
    } else {
      attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = "unknown";
    }
  }
  return attributes;
}
function addPrivateRequestAttributes$1(span, params, enableTruncation) {
  const messages = messagesFromParams(params);
  setMessagesAttribute(span, messages, enableTruncation);
  if ("prompt" in params) {
    span.setAttributes({ [GEN_AI_PROMPT_ATTRIBUTE]: JSON.stringify(params.prompt) });
  }
}
function addContentAttributes(span, response) {
  if ("content" in response) {
    if (Array.isArray(response.content)) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.content.map((item) => item.text).filter((text) => !!text).join("")
      });
      const toolCalls = [];
      for (const item of response.content) {
        if (item.type === "tool_use" || item.type === "server_tool_use") {
          toolCalls.push(item);
        }
      }
      if (toolCalls.length > 0) {
        span.setAttributes({ [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(toolCalls) });
      }
    }
  }
  if ("completion" in response) {
    span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: response.completion });
  }
  if ("input_tokens" in response) {
    span.setAttributes({ [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: JSON.stringify(response.input_tokens) });
  }
}
function addMetadataAttributes(span, response) {
  if ("id" in response && "model" in response) {
    span.setAttributes({
      [GEN_AI_RESPONSE_ID_ATTRIBUTE]: response.id,
      [GEN_AI_RESPONSE_MODEL_ATTRIBUTE]: response.model
    });
    if ("usage" in response && response.usage) {
      setTokenUsageAttributes(
        span,
        response.usage.input_tokens,
        response.usage.output_tokens,
        response.usage.cache_creation_input_tokens,
        response.usage.cache_read_input_tokens
      );
    }
  }
}
function addResponseAttributes$1(span, response, recordOutputs) {
  if (!response || typeof response !== "object") return;
  if ("type" in response && response.type === "error") {
    handleResponseError(span, response);
    return;
  }
  if (recordOutputs) {
    addContentAttributes(span, response);
  }
  addMetadataAttributes(span, response);
}
function handleStreamingError(error2, span, methodPath) {
  captureException(error2, {
    mechanism: { handled: false, type: "auto.ai.anthropic", data: { function: methodPath } }
  });
  if (span.isRecording()) {
    span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
    span.end();
  }
  throw error2;
}
function handleStreamingRequest(originalMethod, target, context, args, requestAttributes, operationName, methodPath, params, options, isStreamRequested, isStreamingMethod) {
  const model = requestAttributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] ?? "unknown";
  const spanConfig = {
    name: `${operationName} ${model}`,
    op: `gen_ai.${operationName}`,
    attributes: requestAttributes
  };
  if (isStreamRequested && !isStreamingMethod) {
    let originalResult;
    const instrumentedPromise = startSpanManual(spanConfig, (span) => {
      originalResult = originalMethod.apply(context, args);
      if (options.recordInputs && params) {
        addPrivateRequestAttributes$1(span, params, shouldEnableTruncation(options.enableTruncation));
      }
      return (async () => {
        try {
          const result = await originalResult;
          return instrumentAsyncIterableStream(
            result,
            span,
            options.recordOutputs ?? false
          );
        } catch (error2) {
          return handleStreamingError(error2, span, methodPath);
        }
      })();
    });
    return wrapPromiseWithMethods(originalResult, instrumentedPromise, "auto.ai.anthropic");
  } else {
    return startSpanManual(spanConfig, (span) => {
      try {
        if (options.recordInputs && params) {
          addPrivateRequestAttributes$1(span, params, shouldEnableTruncation(options.enableTruncation));
        }
        const messageStream = target.apply(context, args);
        return instrumentMessageStream(messageStream, span, options.recordOutputs ?? false);
      } catch (error2) {
        return handleStreamingError(error2, span, methodPath);
      }
    });
  }
}
function instrumentMethod$1(originalMethod, methodPath, instrumentedMethod, context, options) {
  return new Proxy(originalMethod, {
    apply(target, thisArg, args) {
      const operationName = instrumentedMethod.operation || "unknown";
      const requestAttributes = extractRequestAttributes$1(args, methodPath, operationName);
      const model = requestAttributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] ?? "unknown";
      const params = typeof args[0] === "object" ? args[0] : void 0;
      const isStreamRequested = Boolean(params?.stream);
      const isStreamingMethod = instrumentedMethod.streaming === true;
      if (isStreamRequested || isStreamingMethod) {
        return handleStreamingRequest(
          originalMethod,
          target,
          context,
          args,
          requestAttributes,
          operationName,
          methodPath,
          params,
          options,
          isStreamRequested,
          isStreamingMethod
        );
      }
      let originalResult;
      const instrumentedPromise = startSpan(
        {
          name: `${operationName} ${model}`,
          op: `gen_ai.${operationName}`,
          attributes: requestAttributes
        },
        (span) => {
          originalResult = target.apply(context, args);
          if (options.recordInputs && params) {
            addPrivateRequestAttributes$1(span, params, shouldEnableTruncation(options.enableTruncation));
          }
          return originalResult.then(
            (result) => {
              addResponseAttributes$1(span, result, options.recordOutputs);
              return result;
            },
            (error2) => {
              captureException(error2, {
                mechanism: {
                  handled: false,
                  type: "auto.ai.anthropic",
                  data: {
                    function: methodPath
                  }
                }
              });
              throw error2;
            }
          );
        }
      );
      return wrapPromiseWithMethods(originalResult, instrumentedPromise, "auto.ai.anthropic");
    }
  });
}
function createDeepProxy$1(target, currentPath = "", options) {
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      const methodPath = buildMethodPath(currentPath, String(prop));
      const instrumentedMethod = ANTHROPIC_METHOD_REGISTRY[methodPath];
      if (typeof value === "function" && instrumentedMethod) {
        return instrumentMethod$1(
          value,
          methodPath,
          instrumentedMethod,
          obj,
          options
        );
      }
      if (typeof value === "function") {
        return value.bind(obj);
      }
      if (value && typeof value === "object") {
        return createDeepProxy$1(value, methodPath, options);
      }
      return value;
    }
  });
}
function instrumentAnthropicAiClient(anthropicAiClient, options) {
  return createDeepProxy$1(anthropicAiClient, "", resolveAIRecordingOptions(options));
}
const GOOGLE_GENAI_INTEGRATION_NAME = "Google_GenAI";
const GOOGLE_GENAI_METHOD_REGISTRY = {
  "models.generateContent": { operation: "generate_content" },
  "models.generateContentStream": { operation: "generate_content", streaming: true },
  "models.embedContent": { operation: "embeddings" },
  "chats.create": { proxyResultPath: "chat" },
  "chat.sendMessage": { operation: "chat" },
  "chat.sendMessageStream": { operation: "chat", streaming: true }
};
const GOOGLE_GENAI_SYSTEM_NAME = "google_genai";
function isErrorChunk(chunk, span) {
  const feedback = chunk?.promptFeedback;
  if (feedback?.blockReason) {
    const message = feedback.blockReasonMessage ?? feedback.blockReason;
    span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
    captureException(`Content blocked: ${message}`, {
      mechanism: { handled: false, type: "auto.ai.google_genai" }
    });
    return true;
  }
  return false;
}
function handleResponseMetadata(chunk, state) {
  if (typeof chunk.responseId === "string") state.responseId = chunk.responseId;
  if (typeof chunk.modelVersion === "string") state.responseModel = chunk.modelVersion;
  const usage = chunk.usageMetadata;
  if (usage) {
    if (typeof usage.promptTokenCount === "number") state.promptTokens = usage.promptTokenCount;
    if (typeof usage.candidatesTokenCount === "number") state.completionTokens = usage.candidatesTokenCount;
    if (typeof usage.totalTokenCount === "number") state.totalTokens = usage.totalTokenCount;
  }
}
function handleCandidateContent(chunk, state, recordOutputs) {
  if (Array.isArray(chunk.functionCalls)) {
    state.toolCalls.push(...chunk.functionCalls);
  }
  for (const candidate of chunk.candidates ?? []) {
    if (candidate?.finishReason && !state.finishReasons.includes(candidate.finishReason)) {
      state.finishReasons.push(candidate.finishReason);
    }
    for (const part of candidate?.content?.parts ?? []) {
      if (recordOutputs && part.text) state.responseTexts.push(part.text);
      if (part.functionCall) {
        state.toolCalls.push({
          type: "function",
          id: part.functionCall.id,
          name: part.functionCall.name,
          arguments: part.functionCall.args
        });
      }
    }
  }
}
function processChunk(chunk, state, recordOutputs, span) {
  if (!chunk || isErrorChunk(chunk, span)) return;
  handleResponseMetadata(chunk, state);
  handleCandidateContent(chunk, state, recordOutputs);
}
async function* instrumentStream(stream, span, recordOutputs) {
  const state = {
    responseTexts: [],
    finishReasons: [],
    toolCalls: []
  };
  try {
    for await (const chunk of stream) {
      processChunk(chunk, state, recordOutputs, span);
      yield chunk;
    }
  } finally {
    endStreamSpan(span, state, recordOutputs);
  }
}
function contentUnionToMessages(content, role = "user") {
  if (typeof content === "string") {
    return [{ role, content }];
  }
  if (Array.isArray(content)) {
    return content.flatMap((content2) => contentUnionToMessages(content2, role));
  }
  if (typeof content !== "object" || !content) return [];
  if ("role" in content && typeof content.role === "string") {
    return [content];
  }
  if ("parts" in content) {
    return [{ ...content, role }];
  }
  return [{ role, content }];
}
function extractModel(params, context) {
  if ("model" in params && typeof params.model === "string") {
    return params.model;
  }
  if (context && typeof context === "object") {
    const contextObj = context;
    if ("model" in contextObj && typeof contextObj.model === "string") {
      return contextObj.model;
    }
    if ("modelVersion" in contextObj && typeof contextObj.modelVersion === "string") {
      return contextObj.modelVersion;
    }
  }
  return "unknown";
}
function extractConfigAttributes(config) {
  const attributes = {};
  if ("temperature" in config && typeof config.temperature === "number") {
    attributes[GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE] = config.temperature;
  }
  if ("topP" in config && typeof config.topP === "number") {
    attributes[GEN_AI_REQUEST_TOP_P_ATTRIBUTE] = config.topP;
  }
  if ("topK" in config && typeof config.topK === "number") {
    attributes[GEN_AI_REQUEST_TOP_K_ATTRIBUTE] = config.topK;
  }
  if ("maxOutputTokens" in config && typeof config.maxOutputTokens === "number") {
    attributes[GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE] = config.maxOutputTokens;
  }
  if ("frequencyPenalty" in config && typeof config.frequencyPenalty === "number") {
    attributes[GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE] = config.frequencyPenalty;
  }
  if ("presencePenalty" in config && typeof config.presencePenalty === "number") {
    attributes[GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE] = config.presencePenalty;
  }
  return attributes;
}
function extractRequestAttributes(operationName, params, context) {
  const attributes = {
    [GEN_AI_SYSTEM_ATTRIBUTE]: GOOGLE_GENAI_SYSTEM_NAME,
    [GEN_AI_OPERATION_NAME_ATTRIBUTE]: operationName,
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.google_genai"
  };
  if (params) {
    attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = extractModel(params, context);
    if ("config" in params && typeof params.config === "object" && params.config) {
      const config = params.config;
      Object.assign(attributes, extractConfigAttributes(config));
      if ("tools" in config && Array.isArray(config.tools)) {
        const functionDeclarations = config.tools.flatMap(
          (tool) => tool.functionDeclarations
        );
        attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = JSON.stringify(functionDeclarations);
      }
    }
  } else {
    attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] = extractModel({}, context);
  }
  return attributes;
}
function addPrivateRequestAttributes(span, params, isEmbeddings, enableTruncation) {
  if (isEmbeddings) {
    const contents = params.contents;
    if (contents != null) {
      span.setAttribute(
        GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE,
        typeof contents === "string" ? contents : JSON.stringify(contents)
      );
    }
    return;
  }
  const messages = [];
  if ("config" in params && params.config && typeof params.config === "object" && "systemInstruction" in params.config && params.config.systemInstruction) {
    messages.push(...contentUnionToMessages(params.config.systemInstruction, "system"));
  }
  if ("history" in params) {
    messages.push(...contentUnionToMessages(params.history, "user"));
  }
  if ("contents" in params) {
    messages.push(...contentUnionToMessages(params.contents, "user"));
  }
  if ("message" in params) {
    messages.push(...contentUnionToMessages(params.message, "user"));
  }
  if (Array.isArray(messages) && messages.length) {
    const { systemInstructions, filteredMessages } = extractSystemInstructions(messages);
    if (systemInstructions) {
      span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
    }
    const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
    span.setAttributes({
      [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength,
      [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: enableTruncation ? getTruncatedJsonString(filteredMessages) : getJsonString(filteredMessages)
    });
  }
}
function addResponseAttributes(span, response, recordOutputs) {
  if (!response || typeof response !== "object") return;
  if (response.modelVersion) {
    span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE, response.modelVersion);
  }
  if (response.usageMetadata && typeof response.usageMetadata === "object") {
    const usage = response.usageMetadata;
    if (typeof usage.promptTokenCount === "number") {
      span.setAttributes({
        [GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE]: usage.promptTokenCount
      });
    }
    if (typeof usage.candidatesTokenCount === "number") {
      span.setAttributes({
        [GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE]: usage.candidatesTokenCount
      });
    }
    if (typeof usage.totalTokenCount === "number") {
      span.setAttributes({
        [GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE]: usage.totalTokenCount
      });
    }
  }
  if (recordOutputs && Array.isArray(response.candidates) && response.candidates.length > 0) {
    const responseTexts = response.candidates.map((candidate) => {
      if (candidate.content?.parts && Array.isArray(candidate.content.parts)) {
        return candidate.content.parts.map((part) => typeof part.text === "string" ? part.text : "").filter((text) => text.length > 0).join("");
      }
      return "";
    }).filter((text) => text.length > 0);
    if (responseTexts.length > 0) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TEXT_ATTRIBUTE]: responseTexts.join("")
      });
    }
  }
  if (recordOutputs && response.functionCalls) {
    const functionCalls = response.functionCalls;
    if (Array.isArray(functionCalls) && functionCalls.length > 0) {
      span.setAttributes({
        [GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE]: JSON.stringify(functionCalls)
      });
    }
  }
}
function instrumentMethod(originalMethod, methodPath, instrumentedMethod, context, options) {
  const isEmbeddings = instrumentedMethod.operation === "embeddings";
  return new Proxy(originalMethod, {
    apply(target, _, args) {
      const operationName = instrumentedMethod.operation || "unknown";
      const params = args[0];
      const requestAttributes = extractRequestAttributes(operationName, params, context);
      const model = requestAttributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] ?? "unknown";
      if (instrumentedMethod.streaming) {
        return startSpanManual(
          {
            name: `${operationName} ${model}`,
            op: `gen_ai.${operationName}`,
            attributes: requestAttributes
          },
          async (span) => {
            try {
              if (options.recordInputs && params) {
                addPrivateRequestAttributes(
                  span,
                  params,
                  isEmbeddings,
                  shouldEnableTruncation(options.enableTruncation)
                );
              }
              const stream = await target.apply(context, args);
              return instrumentStream(stream, span, Boolean(options.recordOutputs));
            } catch (error2) {
              span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
              captureException(error2, {
                mechanism: {
                  handled: false,
                  type: "auto.ai.google_genai",
                  data: { function: methodPath }
                }
              });
              span.end();
              throw error2;
            }
          }
        );
      }
      return startSpan(
        {
          name: `${operationName} ${model}`,
          op: `gen_ai.${operationName}`,
          attributes: requestAttributes
        },
        (span) => {
          if (options.recordInputs && params) {
            addPrivateRequestAttributes(span, params, isEmbeddings, shouldEnableTruncation(options.enableTruncation));
          }
          return handleCallbackErrors(
            () => target.apply(context, args),
            (error2) => {
              captureException(error2, {
                mechanism: { handled: false, type: "auto.ai.google_genai", data: { function: methodPath } }
              });
            },
            () => {
            },
            (result) => {
              if (!isEmbeddings) {
                addResponseAttributes(span, result, options.recordOutputs);
              }
            }
          );
        }
      );
    }
  });
}
function createDeepProxy(target, currentPath = "", options) {
  return new Proxy(target, {
    get: (t, prop, receiver) => {
      const value = Reflect.get(t, prop, receiver);
      const methodPath = buildMethodPath(currentPath, String(prop));
      const instrumentedMethod = GOOGLE_GENAI_METHOD_REGISTRY[methodPath];
      if (typeof value === "function" && instrumentedMethod) {
        const wrappedMethod = instrumentedMethod.operation ? instrumentMethod(value, methodPath, instrumentedMethod, t, options) : value.bind(t);
        if (!instrumentedMethod.proxyResultPath) {
          return wrappedMethod;
        }
        return function(...args) {
          const result = wrappedMethod(...args);
          if (result && typeof result === "object") {
            return createDeepProxy(result, instrumentedMethod.proxyResultPath, options);
          }
          return result;
        };
      }
      if (typeof value === "function") {
        return value.bind(t);
      }
      if (value && typeof value === "object") {
        return createDeepProxy(value, methodPath, options);
      }
      return value;
    }
  });
}
function instrumentGoogleGenAIClient(client, options) {
  return createDeepProxy(client, "", resolveAIRecordingOptions(options));
}
const LANGCHAIN_INTEGRATION_NAME = "LangChain";
const LANGCHAIN_ORIGIN = "auto.ai.langchain";
const ROLE_MAP = {
  human: "user",
  ai: "assistant",
  assistant: "assistant",
  system: "system",
  function: "function",
  tool: "tool"
};
const setIfDefined = (target, key, value) => {
  if (value != null) target[key] = value;
};
const setNumberIfDefined = (target, key, value) => {
  const n = Number(value);
  if (!Number.isNaN(n)) target[key] = n;
};
function asString(v) {
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}
function normalizeContent(v) {
  if (Array.isArray(v)) {
    try {
      const stripped = v.map(
        (part) => part && typeof part === "object" && isContentMedia(part) ? stripInlineMediaFromSingleMessage(part) : part
      );
      return JSON.stringify(stripped);
    } catch {
      return String(v);
    }
  }
  return asString(v);
}
function normalizeMessageRole(role) {
  const normalized = role.toLowerCase();
  return ROLE_MAP[normalized] ?? normalized;
}
function normalizeRoleNameFromCtor(name) {
  if (name.includes("System")) return "system";
  if (name.includes("Human")) return "user";
  if (name.includes("AI") || name.includes("Assistant")) return "assistant";
  if (name.includes("Function")) return "function";
  if (name.includes("Tool")) return "tool";
  return "user";
}
function getInvocationParams(tags) {
  if (!tags || Array.isArray(tags)) return void 0;
  return tags.invocation_params;
}
function normalizeLangChainMessages(messages) {
  return messages.map((message) => {
    const maybeGetType = message._getType;
    if (typeof maybeGetType === "function") {
      const messageType = maybeGetType.call(message);
      return {
        role: normalizeMessageRole(messageType),
        content: normalizeContent(message.content)
      };
    }
    if (message.lc === 1 && message.kwargs) {
      const id = message.id;
      const messageType = Array.isArray(id) && id.length > 0 ? id[id.length - 1] : "";
      const role = typeof messageType === "string" ? normalizeRoleNameFromCtor(messageType) : "user";
      return {
        role: normalizeMessageRole(role),
        content: normalizeContent(message.kwargs?.content)
      };
    }
    if (message.type) {
      const role = String(message.type).toLowerCase();
      return {
        role: normalizeMessageRole(role),
        content: normalizeContent(message.content)
      };
    }
    if (message.role) {
      return {
        role: normalizeMessageRole(String(message.role)),
        content: normalizeContent(message.content)
      };
    }
    const ctor = message.constructor?.name;
    if (ctor && ctor !== "Object") {
      return {
        role: normalizeMessageRole(normalizeRoleNameFromCtor(ctor)),
        content: normalizeContent(message.content)
      };
    }
    return {
      role: "user",
      content: normalizeContent(message.content)
    };
  });
}
function extractCommonRequestAttributes(serialized, invocationParams, langSmithMetadata) {
  const attrs = {};
  const kwargs = "kwargs" in serialized ? serialized.kwargs : void 0;
  const temperature = invocationParams?.temperature ?? langSmithMetadata?.ls_temperature ?? kwargs?.temperature;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_TEMPERATURE_ATTRIBUTE, temperature);
  const maxTokens = invocationParams?.max_tokens ?? langSmithMetadata?.ls_max_tokens ?? kwargs?.max_tokens;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_MAX_TOKENS_ATTRIBUTE, maxTokens);
  const topP = invocationParams?.top_p ?? kwargs?.top_p;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_TOP_P_ATTRIBUTE, topP);
  const frequencyPenalty = invocationParams?.frequency_penalty;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_FREQUENCY_PENALTY_ATTRIBUTE, frequencyPenalty);
  const presencePenalty = invocationParams?.presence_penalty;
  setNumberIfDefined(attrs, GEN_AI_REQUEST_PRESENCE_PENALTY_ATTRIBUTE, presencePenalty);
  if (invocationParams && "stream" in invocationParams) {
    setIfDefined(attrs, GEN_AI_REQUEST_STREAM_ATTRIBUTE, Boolean(invocationParams.stream));
  }
  return attrs;
}
function baseRequestAttributes(system, modelName, serialized, invocationParams, langSmithMetadata) {
  return {
    [GEN_AI_SYSTEM_ATTRIBUTE]: asString(system ?? "langchain"),
    [GEN_AI_OPERATION_NAME_ATTRIBUTE]: "chat",
    [GEN_AI_REQUEST_MODEL_ATTRIBUTE]: asString(modelName),
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGCHAIN_ORIGIN,
    ...extractCommonRequestAttributes(serialized, invocationParams, langSmithMetadata)
  };
}
function extractLLMRequestAttributes(llm, prompts, recordInputs, enableTruncation, invocationParams, langSmithMetadata) {
  const system = langSmithMetadata?.ls_provider;
  const modelName = invocationParams?.model ?? langSmithMetadata?.ls_model_name ?? "unknown";
  const attrs = baseRequestAttributes(system, modelName, llm, invocationParams, langSmithMetadata);
  if (recordInputs && Array.isArray(prompts) && prompts.length > 0) {
    setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, prompts.length);
    const messages = prompts.map((p) => ({ role: "user", content: p }));
    setIfDefined(
      attrs,
      GEN_AI_INPUT_MESSAGES_ATTRIBUTE,
      enableTruncation ? getTruncatedJsonString(messages) : getJsonString(messages)
    );
  }
  return attrs;
}
function extractChatModelRequestAttributes(llm, langChainMessages, recordInputs, enableTruncation, invocationParams, langSmithMetadata) {
  const system = langSmithMetadata?.ls_provider ?? llm.id?.[2];
  const modelName = invocationParams?.model ?? langSmithMetadata?.ls_model_name ?? "unknown";
  const attrs = baseRequestAttributes(system, modelName, llm, invocationParams, langSmithMetadata);
  if (recordInputs && Array.isArray(langChainMessages) && langChainMessages.length > 0) {
    const normalized = normalizeLangChainMessages(langChainMessages.flat());
    const { systemInstructions, filteredMessages } = extractSystemInstructions(normalized);
    if (systemInstructions) {
      setIfDefined(attrs, GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
    }
    const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
    setIfDefined(attrs, GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE, filteredLength);
    setIfDefined(
      attrs,
      GEN_AI_INPUT_MESSAGES_ATTRIBUTE,
      enableTruncation ? getTruncatedJsonString(filteredMessages) : getJsonString(filteredMessages)
    );
  }
  return attrs;
}
function addToolCallsAttributes(generations, attrs) {
  const toolCalls = [];
  const flatGenerations = generations.flat();
  for (const gen of flatGenerations) {
    const msg = gen.message;
    const msgToolCalls = msg?.tool_calls;
    if (Array.isArray(msgToolCalls) && msgToolCalls.length > 0) {
      toolCalls.push(...msgToolCalls);
    } else {
      const content = gen.message?.content;
      if (Array.isArray(content)) {
        for (const item of content) {
          const t = item;
          if (t.type === "tool_use") toolCalls.push(t);
        }
      }
    }
  }
  if (toolCalls.length > 0) {
    setIfDefined(attrs, GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, asString(toolCalls));
  }
}
function addTokenUsageAttributes(llmOutput, attrs) {
  if (!llmOutput) return;
  const tokenUsage = llmOutput.tokenUsage;
  const anthropicUsage = llmOutput.usage;
  if (tokenUsage) {
    setNumberIfDefined(attrs, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, tokenUsage.promptTokens);
    setNumberIfDefined(attrs, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, tokenUsage.completionTokens);
    setNumberIfDefined(attrs, GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, tokenUsage.totalTokens);
  } else if (anthropicUsage) {
    setNumberIfDefined(attrs, GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.input_tokens);
    setNumberIfDefined(attrs, GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, anthropicUsage.output_tokens);
    const input = Number(anthropicUsage.input_tokens);
    const output = Number(anthropicUsage.output_tokens);
    const total = (Number.isNaN(input) ? 0 : input) + (Number.isNaN(output) ? 0 : output);
    if (total > 0) setNumberIfDefined(attrs, GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, total);
    if (anthropicUsage.cache_creation_input_tokens !== void 0)
      setNumberIfDefined(
        attrs,
        GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS_ATTRIBUTE,
        anthropicUsage.cache_creation_input_tokens
      );
    if (anthropicUsage.cache_read_input_tokens !== void 0)
      setNumberIfDefined(attrs, GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS_ATTRIBUTE, anthropicUsage.cache_read_input_tokens);
  }
}
function extractLlmResponseAttributes(llmResult, recordOutputs) {
  if (!llmResult) return;
  const attrs = {};
  if (Array.isArray(llmResult.generations)) {
    const finishReasons = llmResult.generations.flat().map((g) => {
      if (g.generationInfo?.finish_reason) {
        return g.generationInfo.finish_reason;
      }
      if (g.generation_info?.finish_reason) {
        return g.generation_info.finish_reason;
      }
      return null;
    }).filter((r) => typeof r === "string");
    if (finishReasons.length > 0) {
      setIfDefined(attrs, GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE, asString(finishReasons));
    }
    addToolCallsAttributes(llmResult.generations, attrs);
    if (recordOutputs) {
      const texts = llmResult.generations.flat().map((gen) => gen.text ?? gen.message?.content).filter((t) => typeof t === "string");
      if (texts.length > 0) {
        setIfDefined(attrs, GEN_AI_RESPONSE_TEXT_ATTRIBUTE, asString(texts));
      }
    }
  }
  addTokenUsageAttributes(llmResult.llmOutput, attrs);
  const llmOutput = llmResult.llmOutput;
  const firstGeneration = llmResult.generations?.[0]?.[0];
  const v1Message = firstGeneration?.message;
  const modelName = llmOutput?.model_name ?? llmOutput?.model ?? v1Message?.response_metadata?.model_name;
  if (modelName) setIfDefined(attrs, GEN_AI_RESPONSE_MODEL_ATTRIBUTE, modelName);
  const responseId = llmOutput?.id ?? v1Message?.id;
  if (responseId) {
    setIfDefined(attrs, GEN_AI_RESPONSE_ID_ATTRIBUTE, responseId);
  }
  const stopReason = llmOutput?.stop_reason ?? v1Message?.response_metadata?.finish_reason;
  if (stopReason) {
    setIfDefined(attrs, GEN_AI_RESPONSE_STOP_REASON_ATTRIBUTE, asString(stopReason));
  }
  return attrs;
}
function getAgentNameFromMetadata(metadata) {
  const attrs = {};
  const agentName = metadata?.lc_agent_name;
  if (typeof agentName === "string") {
    attrs[GEN_AI_AGENT_NAME_ATTRIBUTE] = agentName;
  }
  return attrs;
}
function extractToolDefinitions(extraParams) {
  const tools = extraParams?.invocation_params?.tools ?? extraParams?.options?.tools;
  if (!Array.isArray(tools) || tools.length === 0) return void 0;
  const toolDefs = tools.map((tool) => {
    const fn = tool.function;
    return {
      type: "function",
      name: tool.name ?? fn?.name ?? "",
      description: tool.description ?? fn?.description
    };
  });
  return JSON.stringify(toolDefs);
}
function isCallbackManager(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value;
  return typeof candidate.addHandler === "function" && typeof candidate.copy === "function";
}
function isSentryHandler(handler) {
  return typeof handler === "object" && handler?.name === "SentryCallbackHandler";
}
function containsSentryHandler(handlers2) {
  return handlers2.some(isSentryHandler);
}
function _INTERNAL_mergeLangChainCallbackHandler(existing, sentryHandler) {
  if (!existing) {
    return [sentryHandler];
  }
  if (isCallbackManager(existing)) {
    if (containsSentryHandler(existing.handlers ?? [])) {
      return existing;
    }
    const copied = existing.copy();
    copied.addHandler(sentryHandler, true);
    return copied;
  }
  const handlers2 = Array.isArray(existing) ? existing : [existing];
  if (containsSentryHandler(handlers2)) {
    return existing;
  }
  return [...handlers2, sentryHandler];
}
function createLangChainCallbackHandler(options = {}) {
  const { recordInputs, recordOutputs } = resolveAIRecordingOptions(options);
  const enableTruncation = shouldEnableTruncation(options.enableTruncation);
  const spanMap = /* @__PURE__ */ new Map();
  const exitSpan = (runId) => {
    const span = spanMap.get(runId);
    if (span?.isRecording()) {
      span.end();
      spanMap.delete(runId);
    }
  };
  const handler = {
    // Required LangChain BaseCallbackHandler properties
    lc_serializable: false,
    lc_namespace: ["langchain_core", "callbacks", "sentry"],
    lc_secrets: void 0,
    lc_attributes: void 0,
    lc_aliases: void 0,
    lc_serializable_keys: void 0,
    lc_id: ["langchain_core", "callbacks", "sentry"],
    lc_kwargs: {},
    name: "SentryCallbackHandler",
    // BaseCallbackHandlerInput boolean flags
    ignoreLLM: false,
    ignoreChain: false,
    ignoreAgent: false,
    ignoreRetriever: false,
    ignoreCustomEvent: false,
    raiseError: false,
    awaitHandlers: true,
    handleLLMStart(llm, prompts, runId, _parentRunId, _extraParams, tags, metadata, _runName) {
      const invocationParams = getInvocationParams(tags);
      const attributes = extractLLMRequestAttributes(
        llm,
        prompts,
        recordInputs,
        enableTruncation,
        invocationParams,
        metadata
      );
      const modelName = attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE];
      const operationName = attributes[GEN_AI_OPERATION_NAME_ATTRIBUTE];
      startSpanManual(
        {
          name: `${operationName} ${modelName}`,
          op: "gen_ai.chat",
          attributes: {
            ...getAgentNameFromMetadata(metadata),
            ...attributes,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.chat"
          }
        },
        (span) => {
          spanMap.set(runId, span);
          return span;
        }
      );
    },
    // Chat Model Start Handler
    handleChatModelStart(llm, messages, runId, _parentRunId, extraParams, tags, metadata, _runName) {
      const invocationParams = getInvocationParams(tags);
      const attributes = extractChatModelRequestAttributes(
        llm,
        messages,
        recordInputs,
        enableTruncation,
        invocationParams,
        metadata
      );
      const toolDefsJson = extractToolDefinitions(extraParams);
      if (toolDefsJson) {
        attributes[GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE] = toolDefsJson;
      }
      const modelName = attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE];
      const operationName = attributes[GEN_AI_OPERATION_NAME_ATTRIBUTE];
      startSpanManual(
        {
          name: `${operationName} ${modelName}`,
          op: "gen_ai.chat",
          attributes: {
            ...getAgentNameFromMetadata(metadata),
            ...attributes,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.chat"
          }
        },
        (span) => {
          spanMap.set(runId, span);
          return span;
        }
      );
    },
    // LLM End Handler - note: handleLLMEnd with capital LLM (used by both LLMs and chat models!)
    handleLLMEnd(output, runId, _parentRunId, _tags, _extraParams) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        const attributes = extractLlmResponseAttributes(output, recordOutputs);
        if (attributes) {
          span.setAttributes(attributes);
        }
        exitSpan(runId);
      }
    },
    // LLM Error Handler - note: handleLLMError with capital LLM
    handleLLMError(error2, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
        exitSpan(runId);
      }
      captureException(error2, {
        mechanism: {
          handled: false,
          type: `${LANGCHAIN_ORIGIN}.llm_error_handler`
        }
      });
    },
    // Chain Start Handler
    handleChainStart(chain, inputs, runId, _parentRunId, _tags, metadata, _runType, runName) {
      if (metadata?.__sentry_langgraph__) {
        return;
      }
      const chainName = runName || chain.name || "unknown_chain";
      const attributes = {
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.ai.langchain",
        "langchain.chain.name": chainName
      };
      if (recordInputs) {
        attributes["langchain.chain.inputs"] = JSON.stringify(inputs);
      }
      startSpanManual(
        {
          name: `chain ${chainName}`,
          op: "gen_ai.invoke_agent",
          attributes: {
            ...attributes,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.invoke_agent"
          }
        },
        (span) => {
          spanMap.set(runId, span);
          return span;
        }
      );
    },
    // Chain End Handler
    handleChainEnd(outputs, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        if (recordOutputs) {
          span.setAttributes({
            "langchain.chain.outputs": JSON.stringify(outputs)
          });
        }
        exitSpan(runId);
      }
    },
    // Chain Error Handler
    handleChainError(error2, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
        exitSpan(runId);
      }
      captureException(error2, {
        mechanism: {
          handled: false,
          type: `${LANGCHAIN_ORIGIN}.chain_error_handler`
        }
      });
    },
    // Tool Start Handler
    handleToolStart(tool, input, runId, _parentRunId, _tags, metadata, runName) {
      if (metadata?.__sentry_langgraph__) {
        return;
      }
      const toolName = runName || tool.name || "unknown_tool";
      const attributes = {
        ...getAgentNameFromMetadata(metadata),
        [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGCHAIN_ORIGIN,
        [GEN_AI_OPERATION_NAME_ATTRIBUTE]: "execute_tool",
        [GEN_AI_TOOL_NAME_ATTRIBUTE]: toolName
      };
      if (recordInputs) {
        attributes[GEN_AI_TOOL_INPUT_ATTRIBUTE] = input;
      }
      startSpanManual(
        {
          name: `execute_tool ${toolName}`,
          op: "gen_ai.execute_tool",
          attributes: {
            ...attributes,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.execute_tool"
          }
        },
        (span) => {
          spanMap.set(runId, span);
          return span;
        }
      );
    },
    // Tool End Handler
    handleToolEnd(output, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        if (recordOutputs) {
          const outputObj = output;
          const content = outputObj && typeof outputObj === "object" && "content" in outputObj ? outputObj.content : output;
          span.setAttributes({
            [GEN_AI_TOOL_OUTPUT_ATTRIBUTE]: typeof content === "string" ? content : JSON.stringify(content)
          });
        }
        exitSpan(runId);
      }
    },
    // Tool Error Handler
    handleToolError(error2, runId) {
      const span = spanMap.get(runId);
      if (span?.isRecording()) {
        span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
        exitSpan(runId);
      }
      captureException(error2, {
        mechanism: {
          handled: false,
          type: `${LANGCHAIN_ORIGIN}.tool_error_handler`
        }
      });
    },
    // LangChain BaseCallbackHandler required methods
    copy() {
      return handler;
    },
    toJSON() {
      return {
        lc: 1,
        type: "not_implemented",
        id: handler.lc_id
      };
    },
    toJSONNotImplemented() {
      return {
        lc: 1,
        type: "not_implemented",
        id: handler.lc_id
      };
    }
  };
  return handler;
}
const LANGGRAPH_INTEGRATION_NAME = "LangGraph";
const LANGGRAPH_ORIGIN = "auto.ai.langgraph";
function extractLLMFromParams(args) {
  const arg = args[0];
  if (typeof arg !== "object" || !arg || !("llm" in arg) || !arg.llm || typeof arg.llm !== "object") {
    return null;
  }
  const llm = arg.llm;
  if (typeof llm.modelName !== "string" && typeof llm.model !== "string") {
    return null;
  }
  return llm;
}
function extractAgentNameFromParams(args) {
  const arg = args[0];
  if (typeof arg === "object" && !!arg && "name" in arg && typeof arg.name === "string") {
    return arg.name;
  }
  return null;
}
function wrapToolsWithSpans(tools, options, agentName) {
  const SENTRY_WRAPPED = "__sentry_tool_wrapped__";
  for (const tool of tools) {
    if (!tool || typeof tool !== "object") {
      continue;
    }
    const t = tool;
    const originalInvoke = t.invoke;
    if (typeof originalInvoke !== "function" || Object.prototype.hasOwnProperty.call(t, SENTRY_WRAPPED)) {
      continue;
    }
    const toolName = typeof t.name === "string" ? t.name : "unknown_tool";
    const toolDescription = typeof t.description === "string" ? t.description : void 0;
    const wrappedInvoke = new Proxy(originalInvoke, {
      apply(target, thisArg, args) {
        const spanAttributes = {
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGGRAPH_ORIGIN,
          [SEMANTIC_ATTRIBUTE_SENTRY_OP]: GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE,
          [GEN_AI_OPERATION_NAME_ATTRIBUTE]: "execute_tool",
          [GEN_AI_TOOL_NAME_ATTRIBUTE]: toolName,
          [GEN_AI_TOOL_TYPE_ATTRIBUTE]: "function"
        };
        const callConfig = args[1];
        const callAgentName = callConfig?.metadata?.lc_agent_name ?? agentName;
        if (typeof callAgentName === "string") {
          spanAttributes[GEN_AI_AGENT_NAME_ATTRIBUTE] = callAgentName;
        }
        if (toolDescription) {
          spanAttributes[GEN_AI_TOOL_DESCRIPTION_ATTRIBUTE] = toolDescription;
        }
        const input = args[0];
        if (typeof input === "object" && !!input) {
          if ("id" in input && typeof input.id === "string") {
            spanAttributes[GEN_AI_TOOL_CALL_ID_ATTRIBUTE] = input.id;
          }
          if (options.recordInputs) {
            const toolArgs = "args" in input && typeof input.args === "object" ? input.args : input;
            try {
              spanAttributes[GEN_AI_TOOL_INPUT_ATTRIBUTE] = JSON.stringify(toolArgs);
            } catch {
            }
          }
        }
        return startSpan(
          {
            op: GEN_AI_EXECUTE_TOOL_OPERATION_ATTRIBUTE,
            name: `execute_tool ${toolName}`,
            attributes: spanAttributes
          },
          async (span) => {
            try {
              const result = await Reflect.apply(target, thisArg, args);
              if (options.recordOutputs) {
                try {
                  const resultObj = result;
                  const content = resultObj && typeof resultObj === "object" && "content" in resultObj ? resultObj.content : result;
                  span.setAttribute(
                    GEN_AI_TOOL_OUTPUT_ATTRIBUTE,
                    typeof content === "string" ? content : JSON.stringify(content)
                  );
                } catch {
                }
              }
              return result;
            } catch (error2) {
              span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
              captureException(error2, {
                mechanism: {
                  handled: false,
                  type: "auto.ai.langgraph.error"
                }
              });
              throw error2;
            }
          }
        );
      }
    });
    t.invoke = wrappedInvoke;
    Object.defineProperty(t, SENTRY_WRAPPED, { value: true, enumerable: false });
  }
  return tools;
}
function extractToolCalls(messages) {
  if (!messages || messages.length === 0) {
    return null;
  }
  const toolCalls = [];
  for (const message of messages) {
    if (message && typeof message === "object") {
      const msgToolCalls = message.tool_calls;
      if (msgToolCalls && Array.isArray(msgToolCalls)) {
        toolCalls.push(...msgToolCalls);
      }
    }
  }
  return toolCalls.length > 0 ? toolCalls : null;
}
function extractTokenUsageFromMessage(message) {
  const msg = message;
  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;
  if (msg.usage_metadata && typeof msg.usage_metadata === "object") {
    const usage = msg.usage_metadata;
    if (typeof usage.input_tokens === "number") {
      inputTokens = usage.input_tokens;
    }
    if (typeof usage.output_tokens === "number") {
      outputTokens = usage.output_tokens;
    }
    if (typeof usage.total_tokens === "number") {
      totalTokens = usage.total_tokens;
    }
    return { inputTokens, outputTokens, totalTokens };
  }
  if (msg.response_metadata && typeof msg.response_metadata === "object") {
    const metadata = msg.response_metadata;
    if (metadata.tokenUsage && typeof metadata.tokenUsage === "object") {
      const tokenUsage = metadata.tokenUsage;
      if (typeof tokenUsage.promptTokens === "number") {
        inputTokens = tokenUsage.promptTokens;
      }
      if (typeof tokenUsage.completionTokens === "number") {
        outputTokens = tokenUsage.completionTokens;
      }
      if (typeof tokenUsage.totalTokens === "number") {
        totalTokens = tokenUsage.totalTokens;
      }
    }
  }
  return { inputTokens, outputTokens, totalTokens };
}
function extractModelMetadata(span, message) {
  const msg = message;
  if (msg.response_metadata && typeof msg.response_metadata === "object") {
    const metadata = msg.response_metadata;
    if (metadata.model_name && typeof metadata.model_name === "string") {
      span.setAttribute(GEN_AI_RESPONSE_MODEL_ATTRIBUTE, metadata.model_name);
    }
    if (metadata.finish_reason && typeof metadata.finish_reason === "string") {
      span.setAttribute(GEN_AI_RESPONSE_FINISH_REASONS_ATTRIBUTE, [metadata.finish_reason]);
    }
  }
}
function extractToolsFromCompiledGraph(compiledGraph) {
  if (!compiledGraph.builder?.nodes?.tools?.runnable?.tools) {
    return null;
  }
  const tools = compiledGraph.builder?.nodes?.tools?.runnable?.tools;
  if (!tools || !Array.isArray(tools) || tools.length === 0) {
    return null;
  }
  return tools.map((tool) => ({
    name: tool.lc_kwargs?.name,
    description: tool.lc_kwargs?.description,
    schema: tool.lc_kwargs?.schema
  }));
}
function setResponseAttributes(span, inputMessages, result) {
  const resultObj = result;
  const outputMessages = resultObj?.messages;
  if (!outputMessages || !Array.isArray(outputMessages)) {
    return;
  }
  const inputCount = inputMessages?.length ?? 0;
  const newMessages = outputMessages.length > inputCount ? outputMessages.slice(inputCount) : [];
  if (newMessages.length === 0) {
    return;
  }
  const toolCalls = extractToolCalls(newMessages);
  if (toolCalls) {
    span.setAttribute(GEN_AI_RESPONSE_TOOL_CALLS_ATTRIBUTE, JSON.stringify(toolCalls));
  }
  const normalizedNewMessages = normalizeLangChainMessages(newMessages);
  span.setAttribute(GEN_AI_RESPONSE_TEXT_ATTRIBUTE, JSON.stringify(normalizedNewMessages));
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  for (const message of newMessages) {
    const tokens = extractTokenUsageFromMessage(message);
    totalInputTokens += tokens.inputTokens;
    totalOutputTokens += tokens.outputTokens;
    totalTokens += tokens.totalTokens;
    extractModelMetadata(span, message);
  }
  if (totalInputTokens > 0) {
    span.setAttribute(GEN_AI_USAGE_INPUT_TOKENS_ATTRIBUTE, totalInputTokens);
  }
  if (totalOutputTokens > 0) {
    span.setAttribute(GEN_AI_USAGE_OUTPUT_TOKENS_ATTRIBUTE, totalOutputTokens);
  }
  if (totalTokens > 0) {
    span.setAttribute(GEN_AI_USAGE_TOTAL_TOKENS_ATTRIBUTE, totalTokens);
  }
}
let _insideCreateReactAgent = false;
const SENTRY_PATCHED = "__sentry_patched__";
function instrumentStateGraphCompile(originalCompile, options) {
  if (Object.prototype.hasOwnProperty.call(originalCompile, SENTRY_PATCHED)) {
    return originalCompile;
  }
  const sentryHandler = createLangChainCallbackHandler(options);
  const wrapped = new Proxy(originalCompile, {
    apply(target, thisArg, args) {
      if (_insideCreateReactAgent) {
        return Reflect.apply(target, thisArg, args);
      }
      return startSpan(
        {
          op: "gen_ai.create_agent",
          name: "create_agent",
          attributes: {
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGGRAPH_ORIGIN,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "gen_ai.create_agent",
            [GEN_AI_OPERATION_NAME_ATTRIBUTE]: "create_agent"
          }
        },
        (span) => {
          try {
            const compiledGraph = Reflect.apply(target, thisArg, args);
            const compileOptions = args.length > 0 ? args[0] : {};
            if (compileOptions?.name && typeof compileOptions.name === "string") {
              span.setAttribute(GEN_AI_AGENT_NAME_ATTRIBUTE, compileOptions.name);
              span.updateName(`create_agent ${compileOptions.name}`);
            }
            const originalInvoke = compiledGraph.invoke;
            if (originalInvoke && typeof originalInvoke === "function") {
              compiledGraph.invoke = instrumentCompiledGraphInvoke(
                originalInvoke.bind(compiledGraph),
                compiledGraph,
                compileOptions,
                options,
                void 0,
                sentryHandler
              );
            }
            return compiledGraph;
          } catch (error2) {
            span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
            captureException(error2, {
              mechanism: {
                handled: false,
                type: "auto.ai.langgraph.error"
              }
            });
            throw error2;
          }
        }
      );
    }
  });
  Object.defineProperty(wrapped, SENTRY_PATCHED, { value: true, enumerable: false });
  return wrapped;
}
function instrumentCompiledGraphInvoke(originalInvoke, graphInstance, compileOptions, options, llm, sentryCallbackHandler) {
  return new Proxy(originalInvoke, {
    apply(target, thisArg, args) {
      const modelName = llm?.modelName ?? llm?.model;
      return startSpan(
        {
          op: "gen_ai.invoke_agent",
          name: "invoke_agent",
          attributes: {
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGGRAPH_ORIGIN,
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: GEN_AI_INVOKE_AGENT_OPERATION_ATTRIBUTE,
            [GEN_AI_OPERATION_NAME_ATTRIBUTE]: "invoke_agent"
          }
        },
        async (span) => {
          try {
            const graphName = compileOptions?.name;
            if (graphName && typeof graphName === "string") {
              span.setAttribute(GEN_AI_PIPELINE_NAME_ATTRIBUTE, graphName);
              span.setAttribute(GEN_AI_AGENT_NAME_ATTRIBUTE, graphName);
              span.updateName(`invoke_agent ${graphName}`);
            }
            if (modelName) {
              span.setAttribute(GEN_AI_REQUEST_MODEL_ATTRIBUTE, modelName);
            }
            const config = args.length > 1 ? args[1] : void 0;
            const configurable = config?.configurable;
            const threadId = configurable?.thread_id;
            if (threadId && typeof threadId === "string") {
              span.setAttribute(GEN_AI_CONVERSATION_ID_ATTRIBUTE, threadId);
            }
            if (sentryCallbackHandler) {
              const invokeConfig = args[1] ?? {};
              args[1] = invokeConfig;
              const existingMetadata = invokeConfig.metadata ?? {};
              invokeConfig.metadata = {
                ...existingMetadata,
                __sentry_langgraph__: true,
                ...typeof graphName === "string" ? { lc_agent_name: graphName } : {}
              };
              invokeConfig.callbacks = _INTERNAL_mergeLangChainCallbackHandler(
                invokeConfig.callbacks,
                sentryCallbackHandler
              );
            }
            const tools = extractToolsFromCompiledGraph(graphInstance);
            if (tools) {
              span.setAttribute(GEN_AI_REQUEST_AVAILABLE_TOOLS_ATTRIBUTE, JSON.stringify(tools));
            }
            const recordInputs = options.recordInputs;
            const recordOutputs = options.recordOutputs;
            const inputMessages = args.length > 0 ? args[0]?.messages ?? [] : [];
            if (inputMessages && recordInputs) {
              const normalizedMessages = normalizeLangChainMessages(inputMessages);
              const { systemInstructions, filteredMessages } = extractSystemInstructions(normalizedMessages);
              if (systemInstructions) {
                span.setAttribute(GEN_AI_SYSTEM_INSTRUCTIONS_ATTRIBUTE, systemInstructions);
              }
              const enableTruncation = shouldEnableTruncation(options.enableTruncation);
              const filteredLength = Array.isArray(filteredMessages) ? filteredMessages.length : 0;
              span.setAttributes({
                [GEN_AI_INPUT_MESSAGES_ATTRIBUTE]: enableTruncation ? getTruncatedJsonString(filteredMessages) : getJsonString(filteredMessages),
                [GEN_AI_INPUT_MESSAGES_ORIGINAL_LENGTH_ATTRIBUTE]: filteredLength
              });
            }
            const result = await Reflect.apply(target, thisArg, args);
            if (recordOutputs) {
              setResponseAttributes(span, inputMessages ?? null, result);
            }
            return result;
          } catch (error2) {
            span.setStatus({ code: SPAN_STATUS_ERROR, message: "internal_error" });
            captureException(error2, {
              mechanism: {
                handled: false,
                type: "auto.ai.langgraph.error"
              }
            });
            throw error2;
          }
        }
      );
    }
  });
}
function instrumentCreateReactAgent(originalCreateReactAgent, options) {
  if (Object.prototype.hasOwnProperty.call(originalCreateReactAgent, SENTRY_PATCHED)) {
    return originalCreateReactAgent;
  }
  const resolvedOptions = resolveAIRecordingOptions(options);
  const sentryHandler = createLangChainCallbackHandler(resolvedOptions);
  const wrapped = new Proxy(originalCreateReactAgent, {
    apply(target, thisArg, args) {
      const llm = extractLLMFromParams(args);
      const agentName = extractAgentNameFromParams(args);
      const params = args[0];
      if (params && Array.isArray(params.tools) && params.tools.length > 0) {
        wrapToolsWithSpans(params.tools, resolvedOptions, agentName ?? void 0);
      }
      _insideCreateReactAgent = true;
      let compiledGraph;
      try {
        compiledGraph = Reflect.apply(target, thisArg, args);
      } finally {
        _insideCreateReactAgent = false;
      }
      const originalInvoke = compiledGraph.invoke;
      if (originalInvoke && typeof originalInvoke === "function") {
        const compileOptions = {};
        if (agentName) {
          compileOptions.name = agentName;
        }
        compiledGraph.invoke = instrumentCompiledGraphInvoke(
          originalInvoke.bind(compiledGraph),
          compiledGraph,
          compileOptions,
          resolvedOptions,
          llm,
          sentryHandler
        );
      }
      return compiledGraph;
    }
  });
  Object.defineProperty(wrapped, SENTRY_PATCHED, { value: true, enumerable: false });
  return wrapped;
}
function instrumentLangGraph(stateGraph, options) {
  stateGraph.compile = instrumentStateGraphCompile(stateGraph.compile, resolveAIRecordingOptions(options));
  return stateGraph;
}
function createStreamedSpanEnvelope(serializedSpans, dsc, client) {
  const options = client.getOptions();
  const dsn = client.getDsn();
  const tunnel = options.tunnel;
  const sdk = getSdkMetadataForEnvelopeHeader(options._metadata);
  const headers = {
    sent_at: new Date(safeDateNow()).toISOString(),
    ...dscHasRequiredProps(dsc) && { trace: dsc },
    ...sdk && { sdk },
    ...!!tunnel && dsn && { dsn: dsnToString(dsn) }
  };
  const inferSetting = client.getDataCollectionOptions().userInfo ? "auto" : "never";
  const spanContainer = [
    { type: "span", item_count: serializedSpans.length, content_type: "application/vnd.sentry.items.span.v2+json" },
    {
      version: 2,
      ...isBrowser() && {
        ingest_settings: { infer_ip: inferSetting, infer_user_agent: inferSetting }
      },
      items: serializedSpans
    }
  ];
  return createEnvelope(headers, [spanContainer]);
}
function dscHasRequiredProps(dsc) {
  return !!dsc.trace_id && !!dsc.public_key;
}
function estimateSerializedSpanSizeInBytes(span) {
  let weight = 156;
  weight += span.name.length * 2;
  weight += estimateTypedAttributesSizeInBytes(span.attributes);
  if (span.links && span.links.length > 0) {
    const firstLink = span.links[0];
    const attributes = firstLink?.attributes;
    const linkWeight = 100 + (attributes ? estimateTypedAttributesSizeInBytes(attributes) : 0);
    weight += linkWeight * span.links.length;
  }
  return weight;
}
const MAX_SPANS_PER_ENVELOPE = 1e3;
const MAX_TRACE_WEIGHT_IN_BYTES = 5e6;
class SpanBuffer {
  constructor(client, options) {
    this._traceBuckets = /* @__PURE__ */ new Map();
    this._client = client;
    const { maxSpanLimit, flushInterval, maxTraceWeightInBytes } = options ?? {};
    this._maxSpanLimit = maxSpanLimit && maxSpanLimit > 0 && maxSpanLimit <= MAX_SPANS_PER_ENVELOPE ? maxSpanLimit : MAX_SPANS_PER_ENVELOPE;
    this._flushInterval = flushInterval && flushInterval > 0 ? flushInterval : 5e3;
    this._maxTraceWeight = maxTraceWeightInBytes && maxTraceWeightInBytes > 0 ? maxTraceWeightInBytes : MAX_TRACE_WEIGHT_IN_BYTES;
    this._client.on("flush", () => {
      this.drain();
    });
    this._client.on("close", () => {
      this._traceBuckets.forEach((bucket) => {
        clearTimeout(bucket.timeout);
      });
      this._traceBuckets.clear();
    });
  }
  /**
   * Add a span to the buffer.
   */
  add(spanJSON) {
    const traceId = spanJSON.trace_id;
    let bucket = this._traceBuckets.get(traceId);
    if (!bucket) {
      bucket = {
        spans: /* @__PURE__ */ new Set(),
        size: 0,
        timeout: safeUnref(
          setTimeout(() => {
            this.flush(traceId);
          }, this._flushInterval)
        )
      };
      this._traceBuckets.set(traceId, bucket);
    }
    bucket.spans.add(spanJSON);
    bucket.size += estimateSerializedSpanSizeInBytes(spanJSON);
    if (bucket.spans.size >= this._maxSpanLimit || bucket.size >= this._maxTraceWeight) {
      this.flush(traceId);
    }
  }
  /**
   * Drain and flush all buffered traces.
   */
  drain() {
    if (!this._traceBuckets.size) {
      return;
    }
    DEBUG_BUILD && debug.log(`Flushing span tree map with ${this._traceBuckets.size} traces`);
    this._traceBuckets.forEach((_, traceId) => {
      this.flush(traceId);
    });
  }
  /**
   * Flush spans of a specific trace.
   * In contrast to {@link SpanBuffer.drain}, this method does not flush all traces, but only the one with the given traceId.
   */
  flush(traceId) {
    const bucket = this._traceBuckets.get(traceId);
    if (!bucket) {
      return;
    }
    if (!bucket.spans.size) {
      this._removeTrace(traceId);
      return;
    }
    const spans = Array.from(bucket.spans);
    const segmentSpan = spans[0]?._segmentSpan;
    if (!segmentSpan) {
      DEBUG_BUILD && debug.warn("No segment span reference found on span JSON, cannot compute DSC");
      this._removeTrace(traceId);
      return;
    }
    const dsc = getDynamicSamplingContextFromSpan(segmentSpan);
    const cleanedSpans = spans.map((spanJSON) => {
      const { _segmentSpan, ...cleanSpanJSON } = spanJSON;
      return cleanSpanJSON;
    });
    const envelope = createStreamedSpanEnvelope(cleanedSpans, dsc, this._client);
    DEBUG_BUILD && debug.log(`Sending span envelope for trace ${traceId} with ${cleanedSpans.length} spans`);
    this._client.sendEnvelope(envelope).then(null, (reason) => {
      DEBUG_BUILD && debug.error("Error while sending streamed span envelope:", reason);
    });
    this._removeTrace(traceId);
  }
  _removeTrace(traceId) {
    const bucket = this._traceBuckets.get(traceId);
    if (bucket) {
      clearTimeout(bucket.timeout);
    }
    this._traceBuckets.delete(traceId);
  }
}
const spanStreamingIntegration = defineIntegration(() => {
  return {
    name: "SpanStreaming",
    setup(client) {
      const initialMessage = "SpanStreaming integration requires";
      const fallbackMsg = "Falling back to static trace lifecycle.";
      const clientOptions = client.getOptions();
      if (!hasSpanStreamingEnabled(client)) {
        clientOptions.traceLifecycle = "static";
        DEBUG_BUILD && debug.warn(`${initialMessage} \`traceLifecycle\` to be set to "stream"! ${fallbackMsg}`);
        return;
      }
      const beforeSendSpan = clientOptions.beforeSendSpan;
      if (beforeSendSpan && !isStreamedBeforeSendSpanCallback(beforeSendSpan)) {
        clientOptions.traceLifecycle = "static";
        DEBUG_BUILD && debug.warn(`${initialMessage} a beforeSendSpan callback using \`withStreamedSpan\`! ${fallbackMsg}`);
        return;
      }
      const buffer = new SpanBuffer(client);
      client.on("afterSpanEnd", (span) => {
        if (!spanIsSampled(span)) {
          return;
        }
        buffer.add(captureSpan(span, client));
      });
    }
  };
});
function getBreadcrumbLogLevelFromHttpStatusCode(statusCode) {
  if (statusCode === void 0) {
    return void 0;
  } else if (statusCode >= 400 && statusCode < 500) {
    return "warning";
  } else if (statusCode >= 500) {
    return "error";
  } else {
    return void 0;
  }
}
function replaceExports(exports, exportName, wrappedConstructor) {
  const original = exports[exportName];
  if (typeof original !== "function") {
    return;
  }
  try {
    exports[exportName] = wrappedConstructor;
  } catch {
    Object.defineProperty(exports, exportName, {
      value: wrappedConstructor,
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  if (exports.default === original) {
    try {
      exports.default = wrappedConstructor;
    } catch {
      Object.defineProperty(exports, "default", {
        value: wrappedConstructor,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  }
}
class LRUMap {
  constructor(_maxSize) {
    this._maxSize = _maxSize;
    this._cache = /* @__PURE__ */ new Map();
  }
  /** Get the current size of the cache */
  get size() {
    return this._cache.size;
  }
  /** Get an entry or undefined if it was not in the cache. Re-inserts to update the recently used order */
  get(key) {
    const value = this._cache.get(key);
    if (value === void 0) {
      return void 0;
    }
    this._cache.delete(key);
    this._cache.set(key, value);
    return value;
  }
  /** Insert an entry and evict an older entry if we've reached maxSize */
  set(key, value) {
    if (this._cache.size >= this._maxSize) {
      const nextKey = this._cache.keys().next().value;
      this._cache.delete(nextKey);
    }
    this._cache.set(key, value);
  }
  /** Remove an entry and return the entry if it was in the cache */
  remove(key) {
    const value = this._cache.get(key);
    if (value) {
      this._cache.delete(key);
    }
    return value;
  }
  /** Clear all entries */
  clear() {
    this._cache.clear();
  }
  /** Get all the keys */
  keys() {
    return Array.from(this._cache.keys());
  }
  /** Get all the values */
  values() {
    const values = [];
    this._cache.forEach((value) => values.push(value));
    return values;
  }
}
function addUserAgentToTransportHeaders(options) {
  const sdkMetadata = options._metadata?.sdk;
  const sdkUserAgent = sdkMetadata?.name && sdkMetadata?.version ? `${sdkMetadata?.name}/${sdkMetadata?.version}` : void 0;
  options.transportOptions = {
    ...options.transportOptions,
    headers: {
      ...sdkUserAgent && { "user-agent": sdkUserAgent },
      ...options.transportOptions?.headers
    }
  };
}
class ServerRuntimeClient extends Client {
  /**
   * Creates a new Edge SDK instance.
   * @param options Configuration options for this SDK.
   */
  constructor(options) {
    addUserAgentToTransportHeaders(options);
    super(options);
    this._disposeCallbacks = [];
    this._setUpMetricsProcessing();
  }
  /**
   * @inheritDoc
   */
  eventFromException(exception, hint) {
    const event = eventFromUnknownInput(this, this._options.stackParser, exception, hint);
    event.level = "error";
    return resolvedSyncPromise(event);
  }
  /**
   * @inheritDoc
   */
  eventFromMessage(message, level = "info", hint) {
    return resolvedSyncPromise(
      eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace)
    );
  }
  /**
   * @inheritDoc
   */
  captureException(exception, hint, scope) {
    setCurrentRequestSessionErroredOrCrashed(hint);
    return super.captureException(exception, hint, scope);
  }
  /**
   * @inheritDoc
   */
  captureEvent(event, hint, scope) {
    const isException = !event.type && event.exception?.values && event.exception.values.length > 0;
    if (isException) {
      setCurrentRequestSessionErroredOrCrashed(hint);
    }
    return super.captureEvent(event, hint, scope);
  }
  /**
   * Create a cron monitor check in and send it to Sentry.
   *
   * @param checkIn An object that describes a check in.
   * @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
   * to create a monitor automatically when sending a check in.
   */
  captureCheckIn(checkIn, monitorConfig, scope) {
    const id = "checkInId" in checkIn && checkIn.checkInId ? checkIn.checkInId : uuid4();
    if (!this._isEnabled()) {
      DEBUG_BUILD && debug.warn("SDK not enabled, will not capture check-in.");
      return id;
    }
    const options = this.getOptions();
    const { release, environment, tunnel } = options;
    const serializedCheckIn = {
      check_in_id: id,
      monitor_slug: checkIn.monitorSlug,
      status: checkIn.status,
      release,
      environment
    };
    if ("duration" in checkIn) {
      serializedCheckIn.duration = checkIn.duration;
    }
    if (monitorConfig) {
      serializedCheckIn.monitor_config = {
        schedule: monitorConfig.schedule,
        checkin_margin: monitorConfig.checkinMargin,
        max_runtime: monitorConfig.maxRuntime,
        timezone: monitorConfig.timezone,
        failure_issue_threshold: monitorConfig.failureIssueThreshold,
        recovery_threshold: monitorConfig.recoveryThreshold
      };
    }
    const [dynamicSamplingContext, traceContext] = _getTraceInfoFromScope(this, scope);
    if (traceContext) {
      serializedCheckIn.contexts = {
        trace: traceContext
      };
    }
    const envelope = createCheckInEnvelope(
      serializedCheckIn,
      dynamicSamplingContext,
      this.getSdkMetadata(),
      tunnel,
      this.getDsn()
    );
    DEBUG_BUILD && debug.log("Sending checkin:", checkIn.monitorSlug, checkIn.status);
    this.sendEnvelope(envelope);
    return id;
  }
  /**
   * @inheritDoc
   */
  registerCleanup(callback) {
    this._disposeCallbacks.push(callback);
  }
  /**
   * Disposes of the client and releases all resources.
   *
   * This method clears all internal state to allow the client to be garbage collected.
   * It clears hooks, event processors, integrations, transport, and other internal references.
   *
   * Call this method after flushing to allow the client to be garbage collected.
   * After calling dispose(), the client should not be used anymore.
   *
   * Subclasses should override this method to clean up their own resources and call `super.dispose()`.
   */
  dispose() {
    DEBUG_BUILD && debug.log("Disposing client...");
    for (const callback of this._disposeCallbacks) {
      try {
        callback();
      } catch {
      }
    }
    this._disposeCallbacks.length = 0;
    for (const hookName of Object.keys(this._hooks)) {
      this._hooks[hookName]?.clear();
    }
    this._hooks = {};
    this._eventProcessors.length = 0;
    this._integrations = {};
    this._outcomes = {};
    this._transport = void 0;
    this._promiseBuffer = makePromiseBuffer(DEFAULT_TRANSPORT_BUFFER_SIZE);
  }
  /**
   * @inheritDoc
   */
  _prepareEvent(event, hint, currentScope, isolationScope) {
    if (this._options.platform) {
      event.platform = event.platform || this._options.platform;
    }
    if (this._options.runtime) {
      event.contexts = {
        ...event.contexts,
        runtime: event.contexts?.runtime || this._options.runtime
      };
    }
    if (this._options.serverName) {
      event.server_name = event.server_name || this._options.serverName;
    }
    return super._prepareEvent(event, hint, currentScope, isolationScope);
  }
  /**
   * Process a server-side metric before it is captured.
   */
  _setUpMetricsProcessing() {
    this.on("processMetric", (metric) => {
      if (this._options.serverName) {
        metric.attributes = {
          "server.address": this._options.serverName,
          ...metric.attributes
        };
      }
    });
  }
}
function setCurrentRequestSessionErroredOrCrashed(eventHint) {
  const requestSession = getIsolationScope().getScopeData().sdkProcessingMetadata.requestSession;
  if (requestSession) {
    const isHandledException = eventHint?.mechanism?.handled ?? true;
    if (isHandledException && requestSession.status !== "crashed") {
      requestSession.status = "errored";
    } else if (!isHandledException) {
      requestSession.status = "crashed";
    }
  }
}
function filenameIsInApp(filename, isNative = false) {
  const isInternal = isNative || filename && // It's not internal if it's an absolute linux path
  !filename.startsWith("/") && // It's not internal if it's an absolute windows path
  !filename.match(/^[A-Z]:/) && // It's not internal if the path is starting with a dot
  !filename.startsWith(".") && // It's not internal if the frame has a protocol. In node, this is usually the case if the file got pre-processed with a bundler like webpack
  !filename.match(/^[a-zA-Z]([a-zA-Z0-9.\-+])*:\/\//);
  return !isInternal && filename !== void 0 && !filename.includes("node_modules/");
}
function node(getModule) {
  const FILENAME_MATCH = /^\s*[-]{4,}$/;
  const FULL_MATCH = /at (?:async )?(?:(.+?)\s+\()?(?:(.+):(\d+):(\d+)?|([^)]+))\)?/;
  const DATA_URI_MATCH = /at (?:async )?(.+?) \(data:(.*?),/;
  return (line) => {
    const dataUriMatch = line.match(DATA_URI_MATCH);
    if (dataUriMatch) {
      return {
        filename: `<data:${dataUriMatch[2]}>`,
        function: dataUriMatch[1]
      };
    }
    const lineMatch = line.match(FULL_MATCH);
    if (lineMatch) {
      let object;
      let method;
      let functionName;
      let typeName;
      let methodName;
      if (lineMatch[1]) {
        functionName = lineMatch[1];
        let methodStart = functionName.lastIndexOf(".");
        if (functionName[methodStart - 1] === ".") {
          methodStart--;
        }
        if (methodStart > 0) {
          object = functionName.slice(0, methodStart);
          method = functionName.slice(methodStart + 1);
          const objectEnd = object.indexOf(".Module");
          if (objectEnd > 0) {
            functionName = functionName.slice(objectEnd + 1);
            object = object.slice(0, objectEnd);
          }
        }
        typeName = void 0;
      }
      if (method) {
        typeName = object;
        methodName = method;
      }
      if (method === "<anonymous>") {
        methodName = void 0;
        functionName = void 0;
      }
      if (functionName === void 0) {
        methodName = methodName || UNKNOWN_FUNCTION;
        functionName = typeName ? `${typeName}.${methodName}` : methodName;
      }
      let filename = normalizeStackTracePath(lineMatch[2]);
      const isNative = lineMatch[5] === "native";
      if (!filename && lineMatch[5] && !isNative) {
        filename = lineMatch[5];
      }
      const maybeDecodedFilename = filename ? _safeDecodeURI(filename) : void 0;
      return {
        filename: maybeDecodedFilename ?? filename,
        module: maybeDecodedFilename && getModule?.(maybeDecodedFilename),
        function: functionName,
        lineno: _parseIntOrUndefined(lineMatch[3]),
        colno: _parseIntOrUndefined(lineMatch[4]),
        in_app: filenameIsInApp(filename || "", isNative)
      };
    }
    if (line.match(FILENAME_MATCH)) {
      return {
        filename: line
      };
    }
    return void 0;
  };
}
function nodeStackLineParser(getModule) {
  return [90, node(getModule)];
}
function _parseIntOrUndefined(input) {
  return parseInt(input || "", 10) || void 0;
}
function _safeDecodeURI(filename) {
  try {
    return decodeURI(filename);
  } catch {
    return void 0;
  }
}
const requestLayerStore = /* @__PURE__ */ new WeakMap();
const storeLayer = (req, layer) => {
  const store = requestLayerStore.get(req);
  if (!store) {
    requestLayerStore.set(req, [layer]);
  } else {
    store.push(layer);
  }
};
const getStoredLayers = (req) => {
  let store = requestLayerStore.get(req);
  if (!store) {
    store = [];
    requestLayerStore.set(req, store);
  }
  return store;
};
const ATTR_EXPRESS_NAME = "express.name";
const ATTR_HTTP_ROUTE = "http.route";
const ATTR_EXPRESS_TYPE = "express.type";
const ExpressLayerType_ROUTER = "router";
const ExpressLayerType_MIDDLEWARE = "middleware";
const ExpressLayerType_REQUEST_HANDLER = "request_handler";
const asErrorAndMessage = (error2) => error2 instanceof Error ? [error2, error2.message] : [String(error2), String(error2)];
function isRoutePattern(route) {
  return route.includes(":") || route.includes("*");
}
const getLayerMetadata = (route, layer, layerPath) => {
  if (layer.name === "router") {
    const maybeRouterPath = getRouterPath("", layer);
    const extractedRouterPath = maybeRouterPath ? maybeRouterPath : layerPath || route || "/";
    return {
      attributes: {
        [ATTR_EXPRESS_NAME]: extractedRouterPath,
        [ATTR_EXPRESS_TYPE]: ExpressLayerType_ROUTER
      },
      name: `router - ${extractedRouterPath}`
    };
  } else if (layer.name === "bound dispatch" || layer.name === "handle") {
    return {
      attributes: {
        [ATTR_EXPRESS_NAME]: (route || layerPath) ?? "request handler",
        [ATTR_EXPRESS_TYPE]: ExpressLayerType_REQUEST_HANDLER
      },
      name: `request handler${layer.path ? ` - ${route || layerPath}` : ""}`
    };
  } else {
    return {
      attributes: {
        [ATTR_EXPRESS_NAME]: layer.name,
        [ATTR_EXPRESS_TYPE]: ExpressLayerType_MIDDLEWARE
      },
      name: `middleware - ${layer.name}`
    };
  }
};
const getRouterPath = (path, layer) => {
  const stackLayer = Array.isArray(layer.handle?.stack) ? layer.handle?.stack?.[0] : void 0;
  if (stackLayer?.route?.path) {
    return `${path}${stackLayer.route.path}`;
  }
  if (stackLayer && Array.isArray(stackLayer?.handle?.stack)) {
    return getRouterPath(path, stackLayer);
  }
  return path;
};
const isLayerIgnored = (name, type, config) => {
  if (Array.isArray(config?.ignoreLayersType) && config?.ignoreLayersType?.includes(type)) {
    return true;
  }
  if (!Array.isArray(config?.ignoreLayers)) {
    return false;
  }
  try {
    return stringMatchesSomePattern(name, config.ignoreLayers, true);
  } catch {
  }
  return false;
};
function getActualMatchedRoute(req, constructedRoute) {
  const layersStore = getStoredLayers(req);
  if (layersStore.length === 0) {
    return void 0;
  }
  if (layersStore.every((path) => path === "/")) {
    return req.originalUrl === "/" ? "/" : void 0;
  }
  if (constructedRoute === "*") {
    return constructedRoute;
  }
  if (constructedRoute.includes("/") && (constructedRoute.includes(",") || constructedRoute.includes("\\") || constructedRoute.includes("*") || constructedRoute.includes("["))) {
    return constructedRoute;
  }
  const normalizedRoute = constructedRoute.startsWith("/") ? constructedRoute : `/${constructedRoute}`;
  const isValidRoute = normalizedRoute.length > 0 && (req.originalUrl === normalizedRoute || req.originalUrl.startsWith(normalizedRoute) || isRoutePattern(normalizedRoute));
  return isValidRoute ? normalizedRoute : void 0;
}
function getConstructedRoute(req) {
  const layersStore = getStoredLayers(req);
  let constructedRoute = "";
  for (const path of layersStore) {
    if (path === "/" || path === "/*") {
      continue;
    }
    constructedRoute += !constructedRoute || constructedRoute.endsWith("/") ? path : `/${path}`;
  }
  return constructedRoute.replace(/\/{2,}/g, "/");
}
const getLayerPath = (args) => {
  const firstArg = args[0];
  if (Array.isArray(firstArg)) {
    return firstArg.map((arg) => extractLayerPathSegment(arg) || "").join(",");
  }
  return extractLayerPathSegment(firstArg);
};
const extractLayerPathSegment = (arg) => typeof arg === "string" ? arg : arg instanceof RegExp || typeof arg === "number" ? String(arg) : void 0;
const isExpressWithRouterPrototype = (express) => isExpressRouterPrototype(express?.Router?.prototype);
const isExpressRouterPrototype = (routerProto) => (typeof routerProto === "object" || typeof routerProto === "function") && !!routerProto && "route" in routerProto && typeof routerProto.route === "function";
const isExpressWithoutRouterPrototype = (express) => isExpressRouterPrototype(express.Router) && !isExpressWithRouterPrototype(express);
function setSDKProcessingMetadata(request) {
  const sdkProcMeta = getIsolationScope()?.getScopeData()?.sdkProcessingMetadata;
  if (!sdkProcMeta?.normalizedRequest) {
    const normalizedRequest = httpRequestToRequestData(request);
    getIsolationScope().setSDKProcessingMetadata({ normalizedRequest });
  }
}
function patchLayer(getOptions, maybeLayer, layerPath) {
  if (!maybeLayer?.handle) {
    return;
  }
  const layer = maybeLayer;
  const layerHandleOriginal = layer.handle;
  if (getOriginalFunction(layerHandleOriginal)) {
    return;
  }
  if (layerHandleOriginal.length === 4) {
    return;
  }
  function layerHandlePatched(req, res, ...otherArgs) {
    const options = getOptions();
    setSDKProcessingMetadata(req);
    const parentSpan = getActiveSpan();
    if (!parentSpan) {
      return layerHandleOriginal.apply(this, [req, res, ...otherArgs]);
    }
    if (layerPath) {
      storeLayer(req, layerPath);
    }
    const storedLayers = getStoredLayers(req);
    const isLayerPathStored = !!layerPath;
    const constructedRoute = getConstructedRoute(req);
    const actualMatchedRoute = getActualMatchedRoute(req, constructedRoute);
    options.onRouteResolved?.(actualMatchedRoute);
    const metadata = getLayerMetadata(constructedRoute, layer, layerPath);
    const name = metadata.attributes[ATTR_EXPRESS_NAME];
    const type = metadata.attributes[ATTR_EXPRESS_TYPE];
    const attributes = Object.assign(metadata.attributes, {
      [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.express",
      [SEMANTIC_ATTRIBUTE_SENTRY_OP]: `${type}.express`
    });
    if (actualMatchedRoute) {
      attributes[ATTR_HTTP_ROUTE] = actualMatchedRoute;
    }
    if (isLayerIgnored(metadata.attributes[ATTR_EXPRESS_NAME], type, options)) {
      if (isLayerPathStored) {
        storedLayers.pop();
      }
      return layerHandleOriginal.apply(this, [req, res, ...otherArgs]);
    }
    const currentScope = getIsolationScope();
    if (currentScope !== getDefaultIsolationScope()) {
      if (type === "request_handler") {
        const method = req.method ? req.method.toUpperCase() : "GET";
        currentScope.setTransactionName(`${method} ${constructedRoute}`);
      }
    } else {
      DEBUG_BUILD && debug.warn("Isolation scope is still default isolation scope - skipping setting transactionName");
    }
    return startSpanManual({ name, attributes }, (span) => {
      let spanHasEnded = false;
      if (metadata.attributes[ATTR_EXPRESS_TYPE] === ExpressLayerType_ROUTER) {
        span.end();
        spanHasEnded = true;
      }
      const onResponseFinish = () => {
        if (!spanHasEnded) {
          spanHasEnded = true;
          span.end();
        }
      };
      for (let i = 0; i < otherArgs.length; i++) {
        const callback = otherArgs[i];
        if (typeof callback !== "function") {
          continue;
        }
        otherArgs[i] = function(...args) {
          const maybeError = args[0];
          const isError2 = !!maybeError && maybeError !== "route" && maybeError !== "router";
          if (!spanHasEnded && isError2) {
            const [_, message] = asErrorAndMessage(maybeError);
            span.setStatus({
              code: SPAN_STATUS_ERROR,
              message
            });
          }
          if (!spanHasEnded) {
            spanHasEnded = true;
            res.removeListener("finish", onResponseFinish);
            span.end();
          }
          if (!(req.route && isError2) && isLayerPathStored) {
            storedLayers.pop();
          }
          return withActiveSpan(parentSpan, () => callback.apply(this, args));
        };
        break;
      }
      try {
        return layerHandleOriginal.apply(this, [req, res, ...otherArgs]);
      } catch (anyError) {
        const [_, message] = asErrorAndMessage(anyError);
        span.setStatus({
          code: SPAN_STATUS_ERROR,
          message
        });
        throw anyError;
      } finally {
        if (!spanHasEnded) {
          res.once("finish", onResponseFinish);
        }
      }
    });
  }
  for (const key in layerHandleOriginal) {
    if (key in layerHandlePatched) {
      continue;
    }
    Object.defineProperty(layerHandlePatched, key, {
      get() {
        return layerHandleOriginal[key];
      },
      set(value) {
        layerHandleOriginal[key] = value;
      }
    });
  }
  markFunctionWrapped(layerHandlePatched, layerHandleOriginal);
  Object.defineProperty(layer, "handle", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: layerHandlePatched
  });
}
function getDefaultExport(moduleExport) {
  return !!moduleExport && typeof moduleExport === "object" && "default" in moduleExport && moduleExport.default || moduleExport;
}
function isLegacyOptions(options) {
  return !!options.express;
}
let didLegacyDeprecationWarning = false;
function deprecationWarning() {
  if (!didLegacyDeprecationWarning) {
    didLegacyDeprecationWarning = true;
    DEBUG_BUILD && debug.warn(
      "[Express] `patchExpressModule(options)` is deprecated. Use `patchExpressModule(moduleExports, getOptions)` instead."
    );
  }
}
function patchExpressModule(optionsOrExports, maybeGetOptions) {
  let getOptions;
  let moduleExports;
  if (!maybeGetOptions && isLegacyOptions(optionsOrExports)) {
    const { express: express2, ...options } = optionsOrExports;
    moduleExports = express2;
    getOptions = () => options;
    deprecationWarning();
  } else if (typeof maybeGetOptions !== "function") {
    throw new TypeError("`patchExpressModule(moduleExports, getOptions)` requires a `getOptions` callback");
  } else {
    getOptions = maybeGetOptions;
    moduleExports = optionsOrExports;
  }
  const express = getDefaultExport(moduleExports);
  const routerProto = isExpressWithRouterPrototype(express) ? express.Router.prototype : isExpressWithoutRouterPrototype(express) ? express.Router : void 0;
  if (!routerProto) {
    throw new TypeError("no valid Express route function to instrument");
  }
  const originalRouteMethod = routerProto.route;
  try {
    wrapMethod(
      routerProto,
      "route",
      function routeTrace(...args) {
        const route = originalRouteMethod.apply(this, args);
        const layer = this.stack[this.stack.length - 1];
        patchLayer(getOptions, layer, getLayerPath(args));
        return route;
      }
    );
  } catch (e) {
    DEBUG_BUILD && debug.error("Failed to patch express route method:", e);
  }
  const originalRouterUse = routerProto.use;
  try {
    wrapMethod(
      routerProto,
      "use",
      function useTrace(...args) {
        const route = originalRouterUse.apply(this, args);
        const layer = this.stack[this.stack.length - 1];
        if (!layer) {
          return route;
        }
        patchLayer(getOptions, layer, getLayerPath(args));
        return route;
      }
    );
  } catch (e) {
    DEBUG_BUILD && debug.error("Failed to patch express use method:", e);
  }
  const { application } = express;
  const originalApplicationUse = application.use;
  try {
    wrapMethod(
      application,
      "use",
      function appUseTrace(...args) {
        const route = originalApplicationUse.apply(this, args);
        const router = isExpressWithRouterPrototype(express) ? this.router : this._router;
        if (router) {
          const layer = router.stack[router.stack.length - 1];
          if (layer) {
            patchLayer(getOptions, layer, getLayerPath(args));
          }
        }
        return route;
      }
    );
  } catch (e) {
    DEBUG_BUILD && debug.error("Failed to patch express application.use method:", e);
  }
  return express;
}
const SQL_OPERATION_REGEX = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i;
const CONNECTION_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol("sentryPostgresConnectionContext");
const INSTRUMENTED_MARKER = /* @__PURE__ */ Symbol.for("sentry.instrumented.postgresjs");
const QUERY_FROM_INSTRUMENTED_SQL = /* @__PURE__ */ Symbol.for("sentry.query.from.instrumented.sql");
function instrumentPostgresJsSql(sql, options) {
  if (!sql || typeof sql !== "function") {
    DEBUG_BUILD && debug.warn("instrumentPostgresJsSql: provided value is not a valid postgres.js sql instance");
    return sql;
  }
  return _instrumentSqlInstance(sql, { requireParentSpan: true, ...options });
}
function _instrumentSqlInstance(sql, options, parentConnectionContext) {
  if (sql[INSTRUMENTED_MARKER]) {
    return sql;
  }
  const proxiedSql = new Proxy(sql, {
    apply(target, thisArg, argumentsList) {
      const query = Reflect.apply(target, thisArg, argumentsList);
      if (query && typeof query === "object" && "handle" in query) {
        _wrapSingleQueryHandle(query, proxiedSql, options);
      }
      return query;
    },
    get(target, prop) {
      const original = target[prop];
      if (typeof prop !== "string" || typeof original !== "function") {
        return original;
      }
      if (prop === "unsafe" || prop === "file") {
        return _wrapQueryMethod(original, target, proxiedSql, options);
      }
      if (prop === "begin" || prop === "reserve") {
        return _wrapCallbackMethod(original, target, proxiedSql, options);
      }
      return original;
    }
  });
  if (parentConnectionContext) {
    proxiedSql[CONNECTION_CONTEXT_SYMBOL] = parentConnectionContext;
  } else {
    _attachConnectionContext(sql, proxiedSql);
  }
  sql[INSTRUMENTED_MARKER] = true;
  proxiedSql[INSTRUMENTED_MARKER] = true;
  return proxiedSql;
}
function _wrapQueryMethod(original, target, proxiedSql, options) {
  return function(...args) {
    const query = Reflect.apply(original, target, args);
    if (query && typeof query === "object" && "handle" in query) {
      _wrapSingleQueryHandle(query, proxiedSql, options);
    }
    return query;
  };
}
function _wrapCallbackMethod(original, target, parentSqlInstance, options) {
  return function(...args) {
    const parentContext = parentSqlInstance[CONNECTION_CONTEXT_SYMBOL];
    const isCallbackBased = typeof args[args.length - 1] === "function";
    if (!isCallbackBased) {
      const result = Reflect.apply(original, target, args);
      if (result && typeof result.then === "function") {
        return result.then((sqlInstance) => {
          return _instrumentSqlInstance(sqlInstance, options, parentContext);
        });
      }
      return result;
    }
    const callback = args.length === 1 ? args[0] : args[1];
    const wrappedCallback = function(sqlInstance) {
      const instrumentedSql = _instrumentSqlInstance(sqlInstance, options, parentContext);
      return callback(instrumentedSql);
    };
    const newArgs = args.length === 1 ? [wrappedCallback] : [args[0], wrappedCallback];
    return Reflect.apply(original, target, newArgs);
  };
}
function _wrapSingleQueryHandle(query, sqlInstance, options) {
  if (query.handle?.__sentryWrapped) {
    return;
  }
  query[QUERY_FROM_INSTRUMENTED_SQL] = true;
  const originalHandle = query.handle;
  const wrappedHandle = async function(...args) {
    if (this.executed || !_shouldCreateSpans(options)) {
      return originalHandle.apply(this, args);
    }
    const fullQuery = _reconstructQuery(query.strings);
    const sanitizedSqlQuery = _sanitizeSqlQuery(fullQuery);
    return startSpanManual(
      {
        name: sanitizedSqlQuery || "postgresjs.query",
        op: "db"
      },
      (span) => {
        span.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, "auto.db.postgresjs");
        span.setAttributes({
          "db.system.name": "postgres",
          "db.query.text": sanitizedSqlQuery
        });
        const connectionContext = sqlInstance ? sqlInstance[CONNECTION_CONTEXT_SYMBOL] : void 0;
        _setConnectionAttributes(span, connectionContext);
        if (options.requestHook) {
          try {
            options.requestHook(span, sanitizedSqlQuery, connectionContext);
          } catch (e) {
            span.setAttribute("sentry.hook.error", "requestHook failed");
            DEBUG_BUILD && debug.error("Error in requestHook for PostgresJs instrumentation:", e);
          }
        }
        const queryWithCallbacks = this;
        queryWithCallbacks.resolve = new Proxy(queryWithCallbacks.resolve, {
          apply: (resolveTarget, resolveThisArg, resolveArgs) => {
            try {
              _setOperationName(span, sanitizedSqlQuery, resolveArgs?.[0]?.command);
              span.end();
            } catch (e) {
              DEBUG_BUILD && debug.error("Error ending span in resolve callback:", e);
            }
            return Reflect.apply(resolveTarget, resolveThisArg, resolveArgs);
          }
        });
        queryWithCallbacks.reject = new Proxy(queryWithCallbacks.reject, {
          apply: (rejectTarget, rejectThisArg, rejectArgs) => {
            try {
              span.setStatus({
                code: SPAN_STATUS_ERROR,
                message: rejectArgs?.[0]?.message || "unknown_error"
              });
              span.setAttribute("db.response.status_code", rejectArgs?.[0]?.code || "unknown");
              span.setAttribute("error.type", rejectArgs?.[0]?.name || "unknown");
              _setOperationName(span, sanitizedSqlQuery);
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
  wrappedHandle.__sentryWrapped = true;
  query.handle = wrappedHandle;
}
function _shouldCreateSpans(options) {
  const hasParentSpan = getActiveSpan() !== void 0;
  return hasParentSpan || !options.requireParentSpan;
}
function _reconstructQuery(strings) {
  if (!strings?.length) {
    return void 0;
  }
  if (strings.length === 1) {
    return strings[0] || void 0;
  }
  return strings.reduce((acc, str, i) => i === 0 ? str : `${acc}$${i}${str}`, "");
}
let integerLiteralRE;
function _sanitizeSqlQuery(sqlQuery) {
  if (!sqlQuery) {
    return "Unknown SQL Query";
  }
  if (!integerLiteralRE) {
    integerLiteralRE = new RegExp("(?<!\\$)-?\\b\\d+\\b", "g");
  }
  return sqlQuery.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/;\s*$/, "").replace(/\s+/g, " ").trim().replace(/\bX'[0-9A-Fa-f]*'/gi, "?").replace(/\bB'[01]*'/gi, "?").replace(/'(?:[^']|'')*'/g, "?").replace(/\b0x[0-9A-Fa-f]+/gi, "?").replace(/\b(?:TRUE|FALSE)\b/gi, "?").replace(/-?\b\d+\.?\d*[eE][+-]?\d+\b/g, "?").replace(/-?\b\d+\.\d+\b/g, "?").replace(/-?\.\d+\b/g, "?").replace(integerLiteralRE, "?").replace(/\bIN\b\s*\(\s*\?(?:\s*,\s*\?)*\s*\)/gi, "IN (?)").replace(/\bIN\b\s*\(\s*\$\d+(?:\s*,\s*\$\d+)*\s*\)/gi, "IN ($?)");
}
function _setConnectionAttributes(span, connectionContext) {
  if (!connectionContext) {
    return;
  }
  if (connectionContext.ATTR_DB_NAMESPACE) {
    span.setAttribute("db.namespace", connectionContext.ATTR_DB_NAMESPACE);
  }
  if (connectionContext.ATTR_SERVER_ADDRESS) {
    span.setAttribute("server.address", connectionContext.ATTR_SERVER_ADDRESS);
  }
  if (connectionContext.ATTR_SERVER_PORT !== void 0) {
    const portNumber = parseInt(connectionContext.ATTR_SERVER_PORT, 10);
    if (!isNaN(portNumber)) {
      span.setAttribute("server.port", portNumber);
    }
  }
}
function _setOperationName(span, sanitizedQuery, command) {
  if (command) {
    span.setAttribute("db.operation.name", command);
    return;
  }
  const operationMatch = sanitizedQuery?.match(SQL_OPERATION_REGEX);
  if (operationMatch?.[1]) {
    span.setAttribute("db.operation.name", operationMatch[1].toUpperCase());
  }
}
function _attachConnectionContext(sql, proxiedSql) {
  const sqlInstance = sql;
  if (!sqlInstance.options || typeof sqlInstance.options !== "object") {
    return;
  }
  const opts = sqlInstance.options;
  const host = opts.host?.[0] || "localhost";
  const port = opts.port?.[0] || 5432;
  const connectionContext = {
    ATTR_DB_NAMESPACE: typeof opts.database === "string" && opts.database !== "" ? opts.database : void 0,
    ATTR_SERVER_ADDRESS: host,
    ATTR_SERVER_PORT: String(port)
  };
  proxiedSql[CONNECTION_CONTEXT_SYMBOL] = connectionContext;
}
const LOG_PREFIX = "@sentry/instrumentation-http";
const HTTP_ON_CLIENT_REQUEST = "http.client.request.created";
const HTTP_ON_SERVER_REQUEST = "http.server.request.start";
function getRequestOptions(request) {
  const hostWithPort = request.host || "";
  const portInHost = /^(.*):(\d+)$/.exec(hostWithPort);
  const hostname = portInHost ? portInHost[1] : hostWithPort;
  const port = request.port ?? (portInHost ? Number(portInHost[2]) : void 0);
  return {
    method: request.method,
    port,
    protocol: request.protocol,
    host: request.host,
    hostname,
    path: request.path,
    headers: request.getHeaders()
  };
}
function getRequestUrl(requestOptions) {
  return String(getRequestUrlObject(requestOptions));
}
function getRequestUrlObject(requestOptions) {
  const protocol = requestOptions.protocol || "http:";
  const hostHeader = requestOptions.headers?.host && String(requestOptions.headers?.host);
  const hostname = hostHeader || requestOptions.hostname || requestOptions.host || "";
  const port = !requestOptions.port || requestOptions.port === 80 || requestOptions.port === 443 || /^(.*):(\d+)$/.test(hostname) ? "" : `:${requestOptions.port}`;
  const path = requestOptions.path ? requestOptions.path : "/";
  return new URL(path, `${protocol}//${hostname}${port}`);
}
function getRequestUrlFromClientRequest(request) {
  return String(getRequestUrl(getRequestOptions(request)));
}
function addOutgoingRequestBreadcrumb(request, response) {
  const url = getRequestUrlFromClientRequest(request);
  const parsedUrl = parseUrl(url);
  const statusCode = response?.statusCode;
  const level = getBreadcrumbLogLevelFromHttpStatusCode(statusCode);
  addBreadcrumb(
    {
      category: "http",
      data: {
        status_code: statusCode,
        url: getSanitizedUrlString(parsedUrl),
        "http.method": request.method || "GET",
        ...parsedUrl.search ? { "http.query": parsedUrl.search } : {},
        ...parsedUrl.hash ? { "http.fragment": parsedUrl.hash } : {}
      },
      type: "http",
      level
    },
    {
      event: "response",
      request,
      response
    }
  );
}
function getOutgoingRequestSpanData(request) {
  const url = getRequestUrlFromClientRequest(request);
  const [name, attributes] = getHttpSpanDetailsFromUrlObject(
    parseStringToURLObject(url),
    "client",
    "auto.http.client",
    request
  );
  const userAgent = request.getHeader("user-agent");
  return {
    name,
    attributes: {
      // TODO(v11): Update these to the Sentry semantic attributes for urls.
      // https://getsentry.github.io/sentry-conventions/attributes/
      [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.client",
      "otel.kind": "CLIENT",
      "http.url": url,
      "http.method": request.method,
      "http.target": request.path || "/",
      "net.peer.name": request.host,
      "http.host": request.getHeader("host"),
      ...userAgent ? { "user_agent.original": userAgent } : {},
      ...attributes
    },
    onlyIfParent: true
  };
}
function setIncomingResponseSpanData(response, span) {
  const { statusCode, statusMessage, httpVersion, socket } = response;
  const transport = httpVersion?.toUpperCase() !== "QUIC" ? "ip_tcp" : "ip_udp";
  span.setAttributes({
    "http.response.status_code": statusCode,
    "network.protocol.version": httpVersion,
    // TODO(v11): Update these to the Sentry semantic attributes for urls.
    // https://getsentry.github.io/sentry-conventions/attributes/
    "http.flavor": httpVersion,
    "network.transport": transport,
    "net.transport": transport,
    "http.status_text": statusMessage?.toUpperCase(),
    "http.status_code": statusCode,
    ...getResponseContentLengthAttributes(response),
    ...getSocketAttrs(socket)
  });
}
function getSocketAttrs(socket) {
  if (!socket) return {};
  const { remoteAddress, remotePort } = socket;
  return {
    "network.peer.address": remoteAddress,
    "network.peer.port": remotePort,
    "net.peer.ip": remoteAddress,
    "net.peer.port": remotePort
  };
}
function getResponseContentLengthAttributes(response) {
  const { headers } = response;
  const contentLengthHeader = headers["content-length"];
  const length = contentLengthHeader ? parseInt(String(contentLengthHeader), 10) : -1;
  const encoding = headers["content-encoding"];
  return length >= 0 ? encoding && encoding !== "identity" ? { "http.response_content_length": length } : { "http.response_content_length_uncompressed": length } : {};
}
function injectTracePropagationHeaders(request, propagationDecisionMap) {
  const url = getRequestUrlFromClientRequest(request);
  const clientOptions = getClient()?.getOptions();
  const { tracePropagationTargets, propagateTraceparent } = clientOptions ?? {};
  if (!shouldPropagateTraceForUrl(url, tracePropagationTargets, propagationDecisionMap)) {
    return;
  }
  const hasExistingSentryTraceHeader = !!request.getHeader("sentry-trace");
  if (hasExistingSentryTraceHeader) {
    return;
  }
  const traceData = getTraceData({ propagateTraceparent });
  if (!traceData) return;
  const { "sentry-trace": sentryTrace, baggage, traceparent } = traceData;
  if (sentryTrace) {
    try {
      request.setHeader("sentry-trace", sentryTrace);
      DEBUG_BUILD && debug.log(LOG_PREFIX, "Added sentry-trace header");
    } catch (e) {
      DEBUG_BUILD && debug.error(LOG_PREFIX, "Failed to set sentry-trace header:", isError(e) ? e.message : "Unknown error");
    }
  }
  if (traceparent && !request.getHeader("traceparent")) {
    try {
      request.setHeader("traceparent", traceparent);
      DEBUG_BUILD && debug.log(LOG_PREFIX, "Added traceparent header");
    } catch (e) {
      DEBUG_BUILD && debug.error(LOG_PREFIX, "Failed to set traceparent header:", isError(e) ? e.message : "Unknown error");
    }
  }
  if (baggage) {
    const merged = mergeBaggageHeaders(request.getHeader("baggage"), baggage);
    if (merged) {
      try {
        request.setHeader("baggage", merged);
        DEBUG_BUILD && debug.log(LOG_PREFIX, "Added baggage header");
      } catch (e) {
        DEBUG_BUILD && debug.error(LOG_PREFIX, "Failed to set baggage header:", isError(e) ? e.message : "Unknown error");
      }
    }
  }
}
const isOtelWrapped = (fn) => typeof fn.__unwrap === "function";
const warning = "Double-wrapped http.client detected. Either disable spans in Sentry.httpIntegration, or disable the OpenTelemetry HTTP instrumentation. See: https://docs.sentry.io/platforms/javascript/guides/express/opentelemetry/custom-setup/#custom-http-instrumentation";
let didDoubleWrapWarning = false;
const doubleWrapWarning = DEBUG_BUILD ? (http) => {
  if (!didDoubleWrapWarning) {
    if (isOtelWrapped(http.request) || isOtelWrapped(http.get)) {
      didDoubleWrapWarning = true;
      debug.warn(warning);
    }
  }
} : () => {
};
function getHttpClientSubscriptions(options) {
  const propagationDecisionMap = new LRUMap(100);
  const getConfig = () => getClient()?.getOptions();
  const onHttpClientRequestCreated = (data) => {
    if (getCurrentScope().getScopeData().sdkProcessingMetadata[SUPPRESS_TRACING_KEY] === true) {
      return;
    }
    const clientOptions = getConfig();
    const {
      errorMonitor = "error",
      spans: createSpans = clientOptions ? hasSpansEnabled(clientOptions) : true,
      propagateTrace = false,
      breadcrumbs = true,
      http,
      https,
      suppressOtelWarning = false
    } = options;
    const { request } = data;
    if (options.ignoreOutgoingRequests?.(getRequestUrlFromClientRequest(request), request)) {
      return;
    }
    let addedBreadcrumbs = false;
    function addBreadcrumbs(request2, response) {
      if (!addedBreadcrumbs) {
        addedBreadcrumbs = true;
        addOutgoingRequestBreadcrumb(request2, response);
      }
    }
    function breadcrumbsOnly(request2) {
      request2.on(errorMonitor, () => addBreadcrumbs(request2, void 0));
      request2.prependListener("response", (response) => {
        if (request2.listenerCount("response") <= 1) {
          response.resume();
        }
        response.on("end", () => addBreadcrumbs(request2, response));
        response.on(errorMonitor, () => addBreadcrumbs(request2, response));
      });
    }
    if (!createSpans) {
      if (breadcrumbs) {
        breadcrumbsOnly(request);
      }
      if (propagateTrace) {
        injectTracePropagationHeaders(request, propagationDecisionMap);
      }
      return;
    }
    if (!suppressOtelWarning) {
      if (http) doubleWrapWarning(http);
      if (https) doubleWrapWarning(https);
    }
    const span = startInactiveSpan(getOutgoingRequestSpanData(request));
    options.outgoingRequestHook?.(span, request);
    if (propagateTrace) {
      if (span.isRecording()) {
        withActiveSpan(span, () => {
          injectTracePropagationHeaders(request, propagationDecisionMap);
        });
      } else {
        injectTracePropagationHeaders(request, propagationDecisionMap);
      }
    }
    let spanEnded = false;
    function endSpan(status) {
      if (!spanEnded) {
        spanEnded = true;
        span.setStatus(status);
        span.end();
      }
    }
    const requestOnClose = () => endSpan({ code: SPAN_STATUS_UNSET });
    request.on("close", requestOnClose);
    request.on(errorMonitor, (error2) => {
      DEBUG_BUILD && debug.log(LOG_PREFIX, "outgoingRequest on request error()", error2);
      if (breadcrumbs) {
        addBreadcrumbs(request, void 0);
      }
      endSpan({ code: SPAN_STATUS_ERROR });
    });
    request.prependListener("response", (response) => {
      request.removeListener("close", requestOnClose);
      if (request.listenerCount("response") <= 1) {
        response.resume();
      }
      setIncomingResponseSpanData(response, span);
      options.outgoingResponseHook?.(span, response);
      let finished = false;
      function finishWithResponse(error2) {
        if (!finished) {
          finished = true;
          if (error2) {
            DEBUG_BUILD && debug.log(LOG_PREFIX, "outgoingRequest on response error()", error2);
          }
          if (breadcrumbs) {
            addBreadcrumbs(request, response);
          }
          const aborted = response.aborted && !response.complete;
          const status = error2 || typeof response.statusCode !== "number" || aborted ? { code: SPAN_STATUS_ERROR } : getSpanStatusFromHttpCode(response.statusCode);
          options.applyCustomAttributesOnSpan?.(span, request, response);
          endSpan(status);
        }
      }
      response.on("end", () => finishWithResponse());
      response.on(errorMonitor, finishWithResponse);
    });
  };
  return {
    [HTTP_ON_CLIENT_REQUEST]: onHttpClientRequestCreated
  };
}
function patchHttpRequest(httpModule, options) {
  if (!getOriginalFunction(httpModule.request)) {
    const { [HTTP_ON_CLIENT_REQUEST]: onHttpClientRequestCreated } = getHttpClientSubscriptions({
      ...options,
      http: httpModule
    });
    const originalRequest = httpModule.request;
    wrapMethod(httpModule, "request", function patchedRequest(...args) {
      const request = originalRequest.apply(this, args);
      onHttpClientRequestCreated({ request }, HTTP_ON_CLIENT_REQUEST);
      return request;
    });
  }
}
function patchHttpGet(httpModule) {
  if (!getOriginalFunction(httpModule.get)) {
    wrapMethod(httpModule, "get", function patchedGet(input, options, cb) {
      const request = httpModule.request.call(this, input, options, cb);
      request.end();
      return request;
    });
  }
}
function patchModule(httpModuleExport, options = {}) {
  const httpDefault = getDefaultExport(httpModuleExport);
  const httpModule = httpModuleExport;
  if (httpDefault !== httpModuleExport) {
    patchModule(httpDefault, options);
    for (const method of ["get", "request"]) {
      const desc = Object.getOwnPropertyDescriptor(httpDefault, method);
      if (desc) {
        Object.defineProperty(httpModule, method, desc);
      }
    }
    return httpModule;
  }
  patchHttpRequest(httpModule, options);
  patchHttpGet(httpModule);
  return httpModuleExport;
}
const patchHttpModuleClient = (httpModuleExport, options = {}) => patchModule(httpModuleExport, options);
function patchRequestToCaptureBody(req, isolationScope, maxIncomingRequestBodySize, integrationName) {
  let bodyByteLength = 0;
  const chunks = [];
  DEBUG_BUILD && debug.log(integrationName, "Patching request.on");
  const callbackMap = /* @__PURE__ */ new WeakMap();
  const maxBodySize = getMaxBodyByteLength(maxIncomingRequestBodySize);
  try {
    req.on = req.addListener = new Proxy(req.on, {
      apply: (target, thisArg, args) => {
        const [event, listener, ...restArgs] = args;
        if (event === "data") {
          DEBUG_BUILD && debug.log(integrationName, `Handling request.on("data") with maximum body size of ${maxBodySize}b`);
          const callback = new Proxy(listener, {
            apply: (target2, thisArg2, args2) => {
              try {
                const chunk = args2[0];
                const bufferifiedChunk = Buffer.from(chunk);
                if (bodyByteLength < maxBodySize) {
                  chunks.push(bufferifiedChunk);
                  bodyByteLength += bufferifiedChunk.byteLength;
                } else if (DEBUG_BUILD) {
                  debug.log(
                    integrationName,
                    `Dropping request body chunk because maximum body length of ${maxBodySize}b is exceeded.`
                  );
                }
              } catch (_err) {
                DEBUG_BUILD && debug.error(integrationName, "Encountered error while storing body chunk.");
              }
              return Reflect.apply(target2, thisArg2, args2);
            }
          });
          callbackMap.set(listener, callback);
          return Reflect.apply(target, thisArg, [event, callback, ...restArgs]);
        }
        return Reflect.apply(target, thisArg, args);
      }
    });
    req.off = req.removeListener = new Proxy(req.off, {
      apply: (target, thisArg, args) => {
        const [, listener] = args;
        const callback = callbackMap.get(listener);
        if (callback) {
          callbackMap.delete(listener);
          const modifiedArgs = args.slice();
          modifiedArgs[1] = callback;
          return Reflect.apply(target, thisArg, modifiedArgs);
        }
        return Reflect.apply(target, thisArg, args);
      }
    });
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf-8");
        if (body) {
          const bodyByteLength2 = Buffer.byteLength(body, "utf-8");
          const truncatedBody = bodyByteLength2 > maxBodySize ? `${Buffer.from(body).subarray(0, maxBodySize - 3).toString("utf-8")}...` : body;
          isolationScope.setSDKProcessingMetadata({ normalizedRequest: { data: truncatedBody } });
        }
      } catch (error2) {
        if (DEBUG_BUILD) {
          debug.error(integrationName, "Error building captured request body", error2);
        }
      }
    });
  } catch (error2) {
    if (DEBUG_BUILD) {
      debug.error(integrationName, "Error patching request to capture body", error2);
    }
  }
}
const clientToRequestSessionAggregatesMap = /* @__PURE__ */ new WeakMap();
function recordRequestSession(client, {
  requestIsolationScope,
  response,
  sessionFlushingDelayMS
}) {
  requestIsolationScope.setSDKProcessingMetadata({
    requestSession: { status: "ok" }
  });
  response.once("close", () => {
    const requestSession = requestIsolationScope.getScopeData().sdkProcessingMetadata.requestSession;
    if (client && requestSession) {
      DEBUG_BUILD && debug.log(`Recorded request session with status: ${requestSession.status}`);
      const roundedDate = new Date(safeDateNow());
      roundedDate.setSeconds(0, 0);
      const dateBucketKey = roundedDate.toISOString();
      const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
      const bucket = existingClientAggregate?.[dateBucketKey] || { exited: 0, crashed: 0, errored: 0 };
      bucket[{ ok: "exited", crashed: "crashed", errored: "errored" }[requestSession.status]]++;
      if (existingClientAggregate) {
        existingClientAggregate[dateBucketKey] = bucket;
      } else {
        DEBUG_BUILD && debug.log("Opened new request session aggregate.");
        const newClientAggregate = { [dateBucketKey]: bucket };
        clientToRequestSessionAggregatesMap.set(client, newClientAggregate);
        const flushPendingClientAggregates = () => {
          clearTimeout(timeout);
          unregisterClientFlushHook();
          clientToRequestSessionAggregatesMap.delete(client);
          const aggregatePayload = Object.entries(newClientAggregate).map(
            ([timestamp, value]) => ({
              started: timestamp,
              exited: value.exited,
              errored: value.errored,
              crashed: value.crashed
            })
          );
          client.sendSession({ aggregates: aggregatePayload });
        };
        const unregisterClientFlushHook = client.on("flush", () => {
          DEBUG_BUILD && debug.log("Sending request session aggregate due to client flush");
          flushPendingClientAggregates();
        });
        const timeout = setTimeout(() => {
          DEBUG_BUILD && debug.log("Sending request session aggregate due to flushing schedule");
          flushPendingClientAggregates();
        }, sessionFlushingDelayMS);
        safeUnref(timeout);
      }
    }
  });
}
const INTEGRATION_NAME = "Http.Server";
const SPANS_INTEGRATION_NAME = "Http.SentryServerSpans";
const lastSentryEmitMap = /* @__PURE__ */ new WeakMap();
const kRequestMark = /* @__PURE__ */ Symbol.for("sentry_http_server_instrumented");
function markRequest(request) {
  return !request[kRequestMark] && (request[kRequestMark] = true);
}
function instrumentServer(options, server) {
  const currentEmit = server.emit;
  const instrumentedEmit = lastSentryEmitMap.get(server);
  if (currentEmit === instrumentedEmit) {
    return;
  }
  const newEmit = new Proxy(currentEmit, {
    apply(target, thisArg, args) {
      const [event, ...data] = args;
      if (event !== "request") {
        return target.apply(thisArg, args);
      }
      const client = getClient();
      const [request, response] = data;
      if (!client || !markRequest(request)) {
        return target.apply(thisArg, args);
      }
      DEBUG_BUILD && debug.log(INTEGRATION_NAME, "Handling incoming request");
      const isolationScope = getIsolationScope().clone();
      isolationScope.setClient(client);
      const ipAddress = request.socket?.remoteAddress;
      const url = request.url || "/";
      const normalizedRequest = httpRequestToRequestData(request);
      const {
        maxRequestBodySize = "medium",
        ignoreRequestBody,
        sessions = true,
        sessionFlushingDelayMS = 6e4
      } = options;
      if (maxRequestBodySize !== "none" && !ignoreRequestBody?.(url, request)) {
        patchRequestToCaptureBody(request, isolationScope, maxRequestBodySize, INTEGRATION_NAME);
      }
      isolationScope.setSDKProcessingMetadata({ normalizedRequest, ipAddress });
      const httpMethod = (request.method || "GET").toUpperCase();
      const httpTargetWithoutQueryFragment = stripUrlQueryAndFragment(url);
      const bestEffortTransactionName = `${httpMethod} ${httpTargetWithoutQueryFragment}`;
      isolationScope.setTransactionName(bestEffortTransactionName);
      if (sessions) {
        recordRequestSession(client, {
          requestIsolationScope: isolationScope,
          response,
          sessionFlushingDelayMS: sessionFlushingDelayMS ?? 6e4
        });
      }
      return withIsolationScope(isolationScope, () => {
        const sentryTrace = normalizedRequest.headers?.["sentry-trace"];
        const baggage = normalizedRequest.headers?.["baggage"];
        const sentryTraceValue = Array.isArray(sentryTrace) ? sentryTrace[0] : sentryTrace;
        return continueTrace(
          {
            sentryTrace: sentryTraceValue,
            baggage: Array.isArray(baggage) ? baggage[0] : baggage
          },
          () => {
            const propagationContext = getCurrentScope().getPropagationContext();
            propagationContext.propagationSpanId = generateSpanId();
            if (!sentryTraceValue) {
              propagationContext.traceId = generateTraceId();
              propagationContext.sampleRand = safeMathRandom();
            }
            response.once("close", () => {
              isolationScope.setContext("response", {
                status_code: response.statusCode
              });
            });
            const wrap = options.wrapServerEmitRequest;
            let emitResult = false;
            if (wrap) {
              wrap(request, response, normalizedRequest, () => {
                emitResult = target.apply(thisArg, args);
              });
            } else {
              emitResult = target.apply(thisArg, args);
            }
            return emitResult;
          }
        );
      });
    }
  });
  lastSentryEmitMap.set(server, newEmit);
  server.emit = newEmit;
}
function getHttpServerSubscriptions(options) {
  const userWrap = options.wrapServerEmitRequest;
  const spanWrap = buildServerSpanWrap(options);
  const effectiveOptions = {
    ...options,
    wrapServerEmitRequest(request, response, normalizedRequest, next) {
      const clientOptions = getClient()?.getOptions();
      const createSpans = options.spans ?? (clientOptions ? hasSpansEnabled(clientOptions) : false);
      if (createSpans) {
        spanWrap(request, response, normalizedRequest, next);
      } else if (userWrap) {
        userWrap(request, response, normalizedRequest, next);
      } else {
        next();
      }
    }
  };
  const onHttpServerRequest = (data) => {
    const { server } = data;
    instrumentServer(effectiveOptions, server);
  };
  return { [HTTP_ON_SERVER_REQUEST]: onHttpServerRequest };
}
function buildServerSpanWrap(options) {
  const {
    wrapServerEmitRequest: userWrap,
    ignoreIncomingRequests,
    ignoreStaticAssets = true,
    onSpanCreated,
    errorMonitor = "error",
    onSpanEnd
  } = options;
  return (request, response, normalizedRequest, next) => {
    if (typeof __SENTRY_TRACING__ !== "undefined" && !__SENTRY_TRACING__) {
      return next();
    }
    return userWrap ? userWrap(request, response, normalizedRequest, createSpan) : createSpan();
    function createSpan() {
      const isolationScope = getIsolationScope();
      const client = isolationScope.getClient();
      if (!client) {
        return next();
      }
      if (shouldIgnoreSpansForIncomingRequest(request, {
        ignoreStaticAssets,
        ignoreIncomingRequests
      })) {
        DEBUG_BUILD && debug.log(SPANS_INTEGRATION_NAME, "Skipping span creation for incoming request", request.url);
        return next();
      }
      const fullUrl = normalizedRequest.url || request.url || "/";
      const urlObj = parseStringToURLObject(fullUrl);
      const httpTargetWithoutQueryFragment = urlObj ? urlObj.pathname : stripUrlQueryAndFragment(fullUrl);
      const method = (request.method || "GET").toUpperCase();
      const name = `${method} ${httpTargetWithoutQueryFragment}`;
      const headers = request.headers;
      const userAgent = headers["user-agent"];
      const ips = headers["x-forwarded-for"];
      const httpVersion = request.httpVersion;
      const host = headers.host;
      const hostname = host?.replace(/^(.*)(:[0-9]{1,5})/, "$1") || "localhost";
      const scheme = fullUrl.startsWith("https") ? "https" : "http";
      const { socket } = request;
      const { localAddress, localPort, remoteAddress, remotePort } = socket ?? {};
      return startSpanManual(
        {
          name,
          // SpanKind.SERVER = 1; pass this so the OTel sampler infers
          // op='http.server' rather than 'http', which it does for
          // SpanKind.INTERNAL = 0, the default
          kind: 1,
          attributes: {
            // Sentry-specific attributes
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "http.server",
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.http.server",
            [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
            // Set http.route to the URL path as a best-effort route name.
            // Framework integrations (Express, etc.) update this via onSpanEnd.
            "http.route": httpTargetWithoutQueryFragment,
            // OTel kind (explicit attribute so it appears in span data)
            "otel.kind": "SERVER",
            // Network attributes
            "net.host.ip": localAddress,
            "net.host.port": localPort,
            "net.peer.ip": remoteAddress,
            "net.peer.port": remotePort,
            "sentry.http.prefetch": isKnownPrefetchRequest(request) || void 0,
            // Old Semantic Conventions attributes for compatibility
            "http.url": fullUrl,
            "http.method": method,
            "http.target": urlObj ? `${urlObj.pathname}${urlObj.search}` : httpTargetWithoutQueryFragment,
            "http.host": host,
            "net.host.name": hostname,
            "http.client_ip": typeof ips === "string" ? ips.split(",")[0] : void 0,
            "http.user_agent": userAgent,
            "http.scheme": scheme,
            "http.flavor": httpVersion,
            "net.transport": httpVersion?.toUpperCase() === "QUIC" ? "ip_udp" : "ip_tcp",
            ...getRequestContentLengthAttribute(request),
            ...httpHeadersToSpanAttributes(normalizedRequest.headers || {}, client.getDataCollectionOptions())
          }
        },
        (span) => {
          onSpanCreated?.(span, request, response);
          let isEnded = false;
          function endSpan(status) {
            if (isEnded) {
              return;
            }
            isEnded = true;
            span.setAttributes({
              "http.status_text": response.statusMessage?.toUpperCase(),
              "http.response.status_code": response.statusCode,
              "http.status_code": response.statusCode,
              ...httpHeadersToSpanAttributes(
                headersToDict(response.headers),
                client?.getDataCollectionOptions() ?? false,
                "response"
              )
            });
            span.setStatus(status);
            onSpanEnd?.(span, request, response);
            span.end();
          }
          response.once("close", () => {
            endSpan(getSpanStatusFromHttpCode(response.statusCode));
          });
          response.once(errorMonitor, () => {
            const httpStatus = getSpanStatusFromHttpCode(response.statusCode);
            endSpan(httpStatus.code === SPAN_STATUS_ERROR ? httpStatus : { code: SPAN_STATUS_ERROR });
          });
          next();
        }
      );
    }
  };
}
function shouldIgnoreSpansForIncomingRequest(request, {
  ignoreStaticAssets,
  ignoreIncomingRequests
}) {
  const urlPath = request.url;
  const method = request.method?.toUpperCase();
  if (method === "OPTIONS" || method === "HEAD" || !urlPath) {
    return true;
  }
  if (ignoreStaticAssets && method === "GET" && isStaticAssetRequest(urlPath)) {
    return true;
  }
  if (ignoreIncomingRequests?.(urlPath, request)) {
    return true;
  }
  return false;
}
function isStaticAssetRequest(urlPath) {
  const path = stripUrlQueryAndFragment(urlPath);
  if (path.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot|webp|avif)$/)) {
    return true;
  }
  if (path.match(/^\/(robots\.txt|sitemap\.xml|manifest\.json|browserconfig\.xml)$/)) {
    return true;
  }
  return false;
}
function isKnownPrefetchRequest(req) {
  return req.headers["next-router-prefetch"] === "1";
}
function getRequestContentLengthAttribute(request) {
  const { headers } = request;
  const contentLengthHeader = headers["content-length"];
  const length = contentLengthHeader ? parseInt(String(contentLengthHeader), 10) : -1;
  const encoding = headers["content-encoding"];
  return length >= 0 ? encoding && encoding !== "identity" ? { "http.request_content_length": length } : { "http.request_content_length_uncompressed": length } : {};
}
function inferSystemFromInstance(instance) {
  const name = instance.constructor?.name ?? "";
  if (name.includes("OpenAI")) return "openai";
  if (name.includes("Google")) return "google_genai";
  if (name.includes("Mistral")) return "mistralai";
  if (name.includes("Vertex")) return "google_vertexai";
  if (name.includes("Bedrock")) return "aws_bedrock";
  if (name.includes("Ollama")) return "ollama";
  if (name.includes("Cloudflare")) return "cloudflare";
  if (name.includes("Cohere")) return "cohere";
  return "langchain";
}
function extractEmbeddingAttributes(instance) {
  const embeddingsInstance = instance ?? {};
  const attributes = {
    [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: LANGCHAIN_ORIGIN,
    [SEMANTIC_ATTRIBUTE_SENTRY_OP]: GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE,
    [GEN_AI_OPERATION_NAME_ATTRIBUTE]: "embeddings",
    [GEN_AI_REQUEST_MODEL_ATTRIBUTE]: embeddingsInstance.model ?? "unknown"
  };
  attributes[GEN_AI_SYSTEM_ATTRIBUTE] = inferSystemFromInstance(embeddingsInstance);
  if ("dimensions" in embeddingsInstance) {
    attributes[GEN_AI_REQUEST_DIMENSIONS_ATTRIBUTE] = embeddingsInstance.dimensions;
  }
  if ("encodingFormat" in embeddingsInstance) {
    attributes[GEN_AI_REQUEST_ENCODING_FORMAT_ATTRIBUTE] = embeddingsInstance.encodingFormat;
  }
  return attributes;
}
function instrumentEmbeddingMethod(originalMethod, options = {}) {
  const { recordInputs } = resolveAIRecordingOptions(options);
  return new Proxy(originalMethod, {
    apply(target, thisArg, args) {
      const attributes = extractEmbeddingAttributes(thisArg);
      const modelName = attributes[GEN_AI_REQUEST_MODEL_ATTRIBUTE] || "unknown";
      if (recordInputs) {
        const input = args[0];
        if (input != null) {
          attributes[GEN_AI_EMBEDDINGS_INPUT_ATTRIBUTE] = typeof input === "string" ? input : JSON.stringify(input);
        }
      }
      return startSpan(
        {
          name: `embeddings ${modelName}`,
          op: GEN_AI_EMBEDDINGS_OPERATION_ATTRIBUTE,
          attributes
        },
        () => {
          return Reflect.apply(target, thisArg, args).then(void 0, (error2) => {
            captureException(error2, {
              mechanism: { handled: false, type: "auto.ai.langchain" }
            });
            throw error2;
          });
        }
      );
    }
  });
}
function instrumentLangChainEmbeddings(instance, options) {
  const embeddingsInstance = instance;
  if (typeof embeddingsInstance.embedQuery === "function") {
    embeddingsInstance.embedQuery = instrumentEmbeddingMethod(
      embeddingsInstance.embedQuery,
      options
    );
  }
  if (typeof embeddingsInstance.embedDocuments === "function") {
    embeddingsInstance.embedDocuments = instrumentEmbeddingMethod(
      embeddingsInstance.embedDocuments,
      options
    );
  }
  return instance;
}
export {
  _INTERNAL_flushLogsBuffer as $,
  safeSetSpanJSONAttributes as A,
  snipLine as B,
  consoleSandbox as C,
  withActiveSpan as D,
  isMatchingPattern as E,
  startSession as F,
  GLOBAL_OBJ as G,
  HTTP_ON_SERVER_REQUEST as H,
  endSession as I,
  serializeEnvelope as J,
  suppressTracing as K,
  LRUMap as L,
  maybeInstrument as M,
  consoleIntegration as N,
  CONSOLE_LEVELS as O,
  originalConsoleMethods as P,
  markFunctionWrapped as Q,
  fill as R,
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN as S,
  triggerHandlers as T,
  createTransport as U,
  envToBool as V,
  dirname as W,
  createStackParser as X,
  nodeStackLineParser as Y,
  ServerRuntimeClient as Z,
  applySdkMetadata as _,
  addNonEnumerableProperty as a,
  SEMANTIC_ATTRIBUTE_CACHE_KEY as a$,
  _INTERNAL_clearAiProviderSkips as a0,
  hasSpansEnabled as a1,
  getCurrentScope as a2,
  stackParserFromStackParserOptions as a3,
  getIntegrationsToSetup as a4,
  spanStreamingIntegration as a5,
  propagationContextFromHeaders as a6,
  inboundFiltersIntegration as a7,
  functionToStringIntegration as a8,
  linkedErrorsIntegration as a9,
  getDynamicSamplingContextFromScope as aA,
  safeDateNow as aB,
  debounce as aC,
  timedEventsToMeasurements as aD,
  captureEvent as aE,
  shouldContinueTrace as aF,
  derefWeakRef as aG,
  getCapturedScopesOnSpan as aH,
  convertSpanLinksForEnvelope as aI,
  getStatusMessage as aJ,
  spanTimeInputToSeconds as aK,
  SEMANTIC_ATTRIBUTE_SENTRY_CUSTOM_SPAN_NAME as aL,
  makeWeakRef as aM,
  SPAN_STATUS_OK as aN,
  dynamicSamplingContextToSentryBaggageHeader as aO,
  generateTraceId as aP,
  generateSpanId as aQ,
  handleCallbackErrors as aR,
  warn as aS,
  getRequestUrlFromClientRequest as aT,
  stripDataUrlContent as aU,
  SEMANTIC_ATTRIBUTE_URL_FULL as aV,
  timestampInSeconds as aW,
  getActiveSpan as aX,
  patchExpressModule as aY,
  SEMANTIC_ATTRIBUTE_CACHE_ITEM_SIZE as aZ,
  SEMANTIC_ATTRIBUTE_CACHE_HIT as a_,
  requestDataIntegration as aa,
  conversationIdIntegration as ab,
  setAsyncContextStrategy as ac,
  spanToJSON as ad,
  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE as ae,
  spanToTraceContext as af,
  getRootSpan as ag,
  getDynamicSamplingContextFromSpan as ah,
  addChildSpanToSpan as ai,
  getDefaultIsolationScope as aj,
  getDefaultCurrentScope as ak,
  setCapturedScopesOnSpan as al,
  logSpanStart as am,
  logSpanEnd as an,
  hasSpanStreamingEnabled as ao,
  shouldIgnoreSpan as ap,
  baggageHeaderToDynamicSamplingContext as aq,
  parseSampleRate as ar,
  safeMathRandom as as,
  sampleSpan as at,
  SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE as au,
  parseBaggageHeader as av,
  SENTRY_BAGGAGE_KEY_PREFIX as aw,
  generateSentryTraceHeader as ax,
  generateTraceparentHeader as ay,
  getTraceContextFromScope as az,
  getClient as b,
  truncate as b0,
  replaceExports as b1,
  startSpanManual as b2,
  instrumentPostgresJsSql as b3,
  isThenable as b4,
  startSpan as b5,
  _INTERNAL_getSpanContextForToolCallId as b6,
  withScope as b7,
  _INTERNAL_cleanupToolCallSpanContext as b8,
  addVercelAiProcessors as b9,
  _INTERNAL_shouldSkipAiProviderWrapping as ba,
  instrumentOpenAiClient as bb,
  OPENAI_INTEGRATION_NAME as bc,
  ANTHROPIC_AI_INTEGRATION_NAME as bd,
  instrumentAnthropicAiClient as be,
  GOOGLE_GENAI_INTEGRATION_NAME as bf,
  instrumentGoogleGenAIClient as bg,
  _INTERNAL_skipAiProviderWrapping as bh,
  createLangChainCallbackHandler as bi,
  instrumentLangChainEmbeddings as bj,
  _INTERNAL_mergeLangChainCallbackHandler as bk,
  LANGCHAIN_INTEGRATION_NAME as bl,
  instrumentLangGraph as bm,
  instrumentCreateReactAgent as bn,
  LANGGRAPH_INTEGRATION_NAME as bo,
  flush as bp,
  SEMANTIC_ATTRIBUTE_SENTRY_OP as c,
  debug as d,
  getSpanStatusFromHttpCode as e,
  SPAN_STATUS_ERROR as f,
  getHttpServerSubscriptions as g,
  httpHeadersToSpanAttributes as h,
  getIsolationScope as i,
  parseSemver as j,
  SDK_VERSION as k,
  HTTP_ON_CLIENT_REQUEST as l,
  patchHttpModuleClient as m,
  getHttpClientSubscriptions as n,
  getRequestOptions as o,
  parseStringToURLObject as p,
  defineIntegration as q,
  shouldPropagateTraceForUrl as r,
  stripUrlQueryAndFragment as s,
  getTraceData as t,
  mergeBaggageHeaders as u,
  addBreadcrumb as v,
  parseUrl as w,
  getSanitizedUrlString as x,
  getBreadcrumbLogLevelFromHttpStatusCode as y,
  captureException as z
};
