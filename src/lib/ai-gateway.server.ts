// Server-only helper for calling AI endpoints.
// Loaded only inside createServerFn handlers via dynamic import.

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
}

async function logUsage(ctx: LogContext, usage: AiUsage, status: string) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ai_usage_events").insert({
      user_id: ctx.userId,
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
    console.error("logUsage failed", err);
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

  // Try Gemini first
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const model = (opts.model && opts.model.includes("gemini")) ? opts.model : DEFAULT_GEMINI_MODEL;
      return await executeProviderCall(GEMINI_ENDPOINT, geminiKey, model, opts);
    } catch (err) {
      console.warn("Gemini call failed, falling back to Groq", err);
      lastError = err;
    }
  }

  // Fallback to Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const model = DEFAULT_GROQ_MODEL;
      return await executeProviderCall(GROQ_ENDPOINT, groqKey, model, opts);
    } catch (err) {
      console.warn("Groq call failed", err);
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  throw new Error("No AI providers configured (missing GEMINI_API_KEY or GROQ_API_KEY)");
}

export async function callAi(opts: {
  messages: AiMessage[];
  model?: string;
  jsonSchema?: { name: string; schema: Record<string, unknown> };
  temperature?: number;
  log?: LogContext;
}): Promise<string> {
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
  try {
    const { text, usage } = await rawCall({ ...opts, jsonSchema: opts.schema });
    if (opts.log) await logUsage(opts.log, usage, "success");
    try {
      return JSON.parse(text) as T;
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]) as T;
      throw new Error("Failed to parse AI JSON response");
    }
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
