});

export const env = envSchema.parse({
  VITE_API_URL: process.env.VITE_API_URL || import.meta.env?.VITE_API_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  VITE_POSTHOG_KEY: process.env.VITE_POSTHOG_KEY || import.meta.env?.VITE_POSTHOG_KEY,
  VITE_POSTHOG_HOST: process.env.VITE_POSTHOG_HOST || import.meta.env?.VITE_POSTHOG_HOST,
});
