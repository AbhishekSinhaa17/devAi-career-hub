// Server-only helper for calling AI endpoints.
// Loaded only inside createServerFn handlers via dynamic import.

import { getRequiredEnv } from "./env-validation.server";
import { checkRateLimit, logRateLimitRejection } from "./rate-limiter.server";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

// Approximate USD cost per 1K tokens (input, output). Used for analytics estimates.
const MODEL_PRICING: Record<string, { in: number; out: number }> = {
  "gemini-2.5-flash": { in: 0.000075, out: 0.0003 },
  "llama-3.3-70b-versatile": { in: 0.00059, out: 0.00079 },
  "gpt-4o": { in: 0.005, out: 0.015 },
  "gpt-4o-mini": { in: 0.00015, out: 0.0006 },
};

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiUsage {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  duration_ms: number;
}

export interface LogContext {
  endpoint: string;
  userId: string | null;
  clientIp?: string | null;
}

async function logUsage(ctx: LogContext, usage: AiUsage, status: string) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ai_usage_events").insert({
      user_id: ctx.userId,
      client_ip: ctx.clientIp ?? null,
      endpoint: ctx.endpoint,
      model: usage.model,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      cost_usd: usage.cost_usd,
      status,
      duration_ms: usage.duration_ms,
    });
  } catch (err) {
    const { logger } = await import("./logger.server");
    logger.error({ err, endpoint: ctx.endpoint }, "logUsage failed");
  }
}

async function executeProviderCall(
  endpoint: string,
  key: string,
  model: string,
  opts: {
    messages: AiMessage[];
    jsonSchema?: { name: string; schema: Record<string, unknown> };
    temperature?: number;
    signal?: AbortSignal;
  }
): Promise<{ text: string; usage: AiUsage }> {
  const body: Record<string, unknown> = { model, messages: opts.messages };
  if (opts.temperature !== undefined) body.temperature = opts.temperature;
  if (opts.jsonSchema) {
    if (endpoint.includes("groq")) {
      body.response_format = { type: "json_object" };
      // Ensure Groq knows the schema by appending it to the first message if needed,
      // or we just trust the system prompt already has enough context.
      // Appending to the last message safely:
      if (Array.isArray(body.messages) && body.messages.length > 0) {
        body.messages[body.messages.length - 1] = {
          ...body.messages[body.messages.length - 1],
          content: body.messages[body.messages.length - 1].content + `\n\nOutput strictly valid JSON matching this schema: ${JSON.stringify(opts.jsonSchema.schema)}`
        };
      }
    } else {
      body.response_format = {
        type: "json_schema",
        json_schema: { name: opts.jsonSchema.name, schema: opts.jsonSchema.schema, strict: true },
      };
    }
  }

  const start = Date.now();
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI rate limit hit — please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace → Usage.");
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  const duration_ms = Date.now() - start;
  const prompt_tokens = data.usage?.prompt_tokens ?? 0;
  const completion_tokens = data.usage?.completion_tokens ?? 0;
  const total_tokens = data.usage?.total_tokens ?? prompt_tokens + completion_tokens;
  const price = MODEL_PRICING[model] ?? { in: 0, out: 0 };
  const cost_usd = (prompt_tokens / 1000) * price.in + (completion_tokens / 1000) * price.out;
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    usage: { model, prompt_tokens, completion_tokens, total_tokens, cost_usd, duration_ms },
  };
}

async function rawCall(opts: {
  messages: AiMessage[];
  model?: string;
  jsonSchema?: { name: string; schema: Record<string, unknown> };
  temperature?: number;
}): Promise<{ text: string; usage: AiUsage }> {
  let lastError: unknown;
  const maxRetries = 2;
  const baseDelay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const fetchOpts = { ...opts, signal: controller.signal };

      const { env } = await import("@/env");
      const { logger } = await import("./logger.server");
      const reqId = crypto.randomUUID();
      const reqLogger = logger.child({ reqId, endpoint: opts.log?.endpoint });

      // Try Gemini first
      const geminiKey = env.GEMINI_API_KEY;
      if (geminiKey) {
        try {
          const model = (opts.model && opts.model.includes("gemini")) ? opts.model : DEFAULT_GEMINI_MODEL;
          const res = await executeProviderCall(GEMINI_ENDPOINT, geminiKey, model, fetchOpts);
          clearTimeout(timeoutId);
          return res;
        } catch (err: any) {
          if (err.name !== "AbortError") reqLogger.warn({ err }, "Gemini call failed, falling back to Groq");
          lastError = err;
        }
      }

      // Fallback to Groq
      const groqKey = env.GROQ_API_KEY;
      if (groqKey) {
        try {
          const model = DEFAULT_GROQ_MODEL;
          const res = await executeProviderCall(GROQ_ENDPOINT, groqKey, model, fetchOpts);
          clearTimeout(timeoutId);
          return res;
        } catch (err: any) {
          if (err.name !== "AbortError") reqLogger.warn({ err }, "Groq call failed");
          lastError = err;
        }
      }

      clearTimeout(timeoutId);
      if (lastError && (lastError as any).message?.includes("AI validation") || (lastError as any).message?.includes("AI rate limit hit")) {
        throw lastError; // Don't retry validation errors or immediate 429s (handled by provider)
      }
      
      throw lastError || new Error("No AI providers configured");

    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries && err.name !== "AbortError" && !err.message?.includes("AI validation")) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
      } else if (attempt === maxRetries || err.name === "AbortError") {
        if (err.name === "AbortError") {
          throw new Error("AI request timed out after 15 seconds. Please try again.");
        }
        throw err;
      }
    }
  }

  throw lastError;
}

/**
 * Enforce rate limits before making an AI call.
 * Throws a user-friendly error if the limit is exceeded.
 */
async function enforceRateLimit(log?: LogContext): Promise<void> {
  if (!log) return; // No context = internal call, skip rate limiting

  const result = await checkRateLimit(log.userId);
  if (!result.allowed) {
    // Log the rejection for monitoring
    await logRateLimitRejection(log.userId, log.endpoint, result.reason ?? "Rate limited");
    throw new Error(result.reason ?? "Rate limit exceeded. Please try again later.");
  }
}

export async function callAi(opts: {
  messages: AiMessage[];
  model?: string;
  jsonSchema?: { name: string; schema: Record<string, unknown> };
  temperature?: number;
  log?: LogContext;
}): Promise<string> {
  const { getRequest } = await import("@tanstack/react-start/server");
  if (opts.log && !opts.log.clientIp) {
    const req = getRequest();
    opts.log.clientIp = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req?.headers.get("x-real-ip")?.trim() || "unknown";
  }

  // Enforce rate limits before calling the AI provider
  await enforceRateLimit(opts.log);

  try {
    const { text, usage } = await rawCall(opts);
    if (opts.log) await logUsage(opts.log, usage, "success");
    return text;
  } catch (err) {
    if (opts.log) {
      await logUsage(
        opts.log,
        { model: opts.model ?? DEFAULT_GEMINI_MODEL, prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, cost_usd: 0, duration_ms: 0 },
        "error",
      );
    }
    throw err;
  }
}

export async function callAiJson<T>(opts: {
  messages: AiMessage[];
  model?: string;
  schema: { name: string; schema: Record<string, unknown> };
  log?: LogContext;
}): Promise<T> {
  const { getRequest } = await import("@tanstack/react-start/server");
  if (opts.log && !opts.log.clientIp) {
    const req = getRequest();
    opts.log.clientIp = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req?.headers.get("x-real-ip")?.trim() || "unknown";
  }

  // Enforce rate limits before calling the AI provider
  await enforceRateLimit(opts.log);

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { text, usage } = await rawCall({ ...opts, jsonSchema: opts.schema });
      if (opts.log && attempt === 1) await logUsage(opts.log, usage, "success");
      
      try {
        return JSON.parse(text) as T;
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]) as T;
        throw new Error("AI returned malformed JSON");
      }
    } catch (err: any) {
      const { logger } = await import("./logger.server");
      logger.warn({ err, attempt, endpoint: opts.log?.endpoint }, "JSON parsing or AI call failed");
      lastErr = err;
      if (err.message !== "AI returned malformed JSON" || attempt === 2) {
        break; // Don't retry if it's not a JSON error, or if we're out of retries
      }
    }
  }

  if (opts.log) {
    await logUsage(
      opts.log,
      { model: opts.model ?? DEFAULT_GEMINI_MODEL, prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, cost_usd: 0, duration_ms: 0 },
      "error",
    );
  }
  
  // Return a generic error to the client instead of crashing hard with raw malformed JSON
  throw new Error("AI provider returned invalid data. Please try again.");
}
