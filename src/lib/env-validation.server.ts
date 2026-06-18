// Server-only environment variable validation.
// The .server.ts suffix prevents Vite from bundling this into the client.
//
// Usage:
//   import { getRequiredEnv, validateEnv } from "@/lib/env-validation.server";
//   const key = getRequiredEnv("GEMINI_API_KEY");

import process from "node:process";

/** Env var definitions with optional default and whether they are required. */
interface EnvVarDef {
  /** If true, the app will refuse to start without this var. */
  required: boolean;
  /** Human-readable description shown in error messages. */
  description: string;
  /** Default value when the var is optional and missing. */
  defaultValue?: string;
}

const ENV_SCHEMA: Record<string, EnvVarDef> = {
  // Supabase (server)
  SUPABASE_URL: {
    required: true,
    description: "Supabase project URL",
  },
  SUPABASE_PUBLISHABLE_KEY: {
    required: true,
    description: "Supabase publishable (anon) key",
  },

  // AI providers — at least one is required, validated separately
  GEMINI_API_KEY: {
    required: false,
    description: "Google Gemini API key",
  },
  GROQ_API_KEY: {
    required: false,
    description: "Groq API key",
  },

  // GitHub (optional — increases rate limit)
  GITHUB_TOKEN: {
    required: false,
    description: "GitHub personal access token (raises rate limit to 5,000/hr)",
  },

  // Rate-limit overrides (optional)
  AI_RATE_LIMIT_DAILY_FREE: {
    required: false,
    description: "Max AI requests per day for free users",
    defaultValue: "20",
  },
  AI_RATE_LIMIT_DAILY_AUTH: {
    required: false,
    description: "Max AI requests per day for authenticated users",
    defaultValue: "100",
  },
  AI_RATE_LIMIT_PER_MINUTE: {
    required: false,
    description: "Max AI requests per minute per user",
    defaultValue: "5",
  },
};

/**
 * Read an environment variable, throwing a clear error if it is required and
 * missing. For optional vars, returns the default or undefined.
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (value) return value;

  const def = ENV_SCHEMA[name];
  if (def?.defaultValue !== undefined) return def.defaultValue;

  if (def?.required) {
    throw new Error(
      `Missing required environment variable: ${name}` +
        (def.description ? ` (${def.description})` : "") +
        `. Set it in your .env file. See .env.example for reference.`,
    );
  }

  return "";
}

/**
 * Read an optional environment variable. Returns the value, the default from
 * the schema, or the provided fallback.
 */
export function getOptionalEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  if (value) return value;
  const def = ENV_SCHEMA[name];
  return def?.defaultValue ?? fallback;
}

/**
 * Run at startup to validate all required env vars and at least one AI
 * provider key. Returns a list of problems. An empty array means everything
 * is configured.
 */
export function validateEnv(): string[] {
  const problems: string[] = [];

  for (const [name, def] of Object.entries(ENV_SCHEMA)) {
    if (def.required && !process.env[name]) {
      problems.push(`Missing required env var: ${name} — ${def.description}`);
    }
  }

  // At least one AI provider must be configured
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    problems.push("No AI provider configured. Set at least one of: GEMINI_API_KEY, GROQ_API_KEY");
  }

  return problems;
}

/**
 * Call once at server startup. Logs warnings/errors and throws if critical
 * vars are missing.
 */
let _validated = false;
export function ensureEnvValid(): void {
  if (_validated) return;
  _validated = true;

  const problems = validateEnv();
  if (problems.length > 0) {
    const msg = [
      "",
      "═══════════════════════════════════════════════════════════",
      " DevAI — Environment Configuration Errors",
      "═══════════════════════════════════════════════════════════",
      ...problems.map((p) => ` ✗ ${p}`),
      "",
      " See .env.example for the full list of required variables.",
      "═══════════════════════════════════════════════════════════",
      "",
    ].join("\n");

    console.error(msg);
    throw new Error(`Server startup aborted: ${problems.length} env var(s) missing.`);
  }

  // Optional warnings
  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      "[DevAI] GITHUB_TOKEN not set — GitHub API limited to 60 requests/hour. " +
        "Set GITHUB_TOKEN in .env for 5,000/hr.",
    );
  }
}
