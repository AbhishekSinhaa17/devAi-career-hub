import { z } from "zod";

const isProd = (typeof process !== "undefined" && process.env.NODE_ENV === "production") || 
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PROD);

const envSchema = z.object({
  VITE_API_URL: z.string().url().default(
    isProd ? "https://devai-career-hub-1.onrender.com/api" : "http://localhost:5000/api"
  ),
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),
  VITE_GOOGLE_CALLBACK_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().optional(),
});

export const env = envSchema.parse({
  VITE_API_URL: process.env.VITE_API_URL || import.meta.env?.VITE_API_URL,
  VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || import.meta.env?.VITE_GOOGLE_CLIENT_ID,
  VITE_GOOGLE_CALLBACK_URL: process.env.VITE_GOOGLE_CALLBACK_URL || import.meta.env?.VITE_GOOGLE_CALLBACK_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  VITE_POSTHOG_KEY: process.env.VITE_POSTHOG_KEY || import.meta.env?.VITE_POSTHOG_KEY,
  VITE_POSTHOG_HOST: process.env.VITE_POSTHOG_HOST || import.meta.env?.VITE_POSTHOG_HOST,
});

