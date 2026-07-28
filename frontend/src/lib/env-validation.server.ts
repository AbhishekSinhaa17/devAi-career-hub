import process from "node:process";

interface EnvVarDef {
  required: boolean;
  description: string;
  defaultValue?: string;
}

const ENV_SCHEMA: Record<string, EnvVarDef> = {
  SUPABASE_URL: {
    required: true,
    description: "Supabase project URL",
  },
  SUPABASE_PUBLISHABLE_KEY: {
    required: true,
    description: "Supabase publishable (anon) key",
  },

  GEMINI_API_KEY: {
    required: false,
    description: "Google Gemini API key",
  },
  GROQ_API_KEY: {
    required: false,
    description: "Groq API key",
  },

  GITHUB_TOKEN: {
    required: false,
    description: "GitHub personal access token (raises rate limit to 5,000/hr)",
  },

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

  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      "[DevAI] GITHUB_TOKEN not set — GitHub API limited to 60 requests/hour. " +
        "Set GITHUB_TOKEN in .env for 5,000/hr.",
    );
  }
}
