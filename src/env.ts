import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("Must be a valid Supabase URL"),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "Supabase Publishable Key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().optional(),
});

/**
 * Validate process.env on startup.
 * Throws a detailed error if any required environment variable is missing or invalid.
 */
export const env = envSchema.parse({
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  VITE_POSTHOG_KEY: process.env.VITE_POSTHOG_KEY || import.meta.env?.VITE_POSTHOG_KEY,
  VITE_POSTHOG_HOST: process.env.VITE_POSTHOG_HOST || import.meta.env?.VITE_POSTHOG_HOST,
});
