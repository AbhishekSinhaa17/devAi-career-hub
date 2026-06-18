// Server-only rate limiter for AI endpoints.
// Queries the existing ai_usage_events table in Supabase to enforce per-user
// daily and per-minute limits. The .server.ts suffix prevents client bundling.

import { getOptionalEnv } from "./env-validation.server";
import { getRequest } from "@tanstack/react-start/server";

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  /** Seconds until the limit resets (useful for Retry-After headers). */
  retryAfterSeconds?: number;
  /** Current daily usage count. */
  dailyUsed?: number;
  /** Daily limit for this user. */
  dailyLimit?: number;
}

/**
 * Read rate-limit configuration from env with sensible defaults.
 */
function getLimits() {
  return {
    dailyFree: parseInt(getOptionalEnv("AI_RATE_LIMIT_DAILY_FREE", "20"), 10),
    dailyAuth: parseInt(getOptionalEnv("AI_RATE_LIMIT_DAILY_AUTH", "100"), 10),
    dailyIp: parseInt(getOptionalEnv("AI_RATE_LIMIT_DAILY_IP", "300"), 10),
    perMinute: parseInt(getOptionalEnv("AI_RATE_LIMIT_PER_MINUTE", "5"), 10),
    perMinuteIp: parseInt(getOptionalEnv("AI_RATE_LIMIT_PER_MINUTE_IP", "15"), 10),
  };
}

/**
 * Check whether the user is allowed to make another AI request.
 *
 * @param userId - Authenticated user ID (from auth middleware context).
 *                 If null/undefined, treated as a free/anonymous user.
 * @returns A RateLimitResult indicating whether the request is allowed.
 */
export async function checkRateLimit(userId: string | null | undefined): Promise<RateLimitResult> {
  const limits = getLimits();

  // Determine effective daily limit based on auth status
  const dailyLimit = userId ? limits.dailyAuth : limits.dailyFree;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const request = getRequest();
  let clientIp = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!clientIp) {
    clientIp = request?.headers.get("x-real-ip")?.trim() || "unknown";
  }

  // ── Per-minute check ────────────────────────────────────────────────────
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  let minuteQuery = supabaseAdmin
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", oneMinuteAgo)
    .in("status", ["success", "error"]); // don't count rate_limited rejections

  if (userId) {
    minuteQuery = minuteQuery.eq("user_id", userId);
  } else {
    minuteQuery = minuteQuery.eq("client_ip", clientIp);
  }

  const { count: minuteCount } = await minuteQuery;
  const currentMinuteCount = minuteCount ?? 0;

  if (currentMinuteCount >= limits.perMinute) {
    return {
      allowed: false,
      reason: "Too many requests. Please wait a moment before trying again.",
      retryAfterSeconds: 60,
      dailyUsed: currentMinuteCount,
      dailyLimit,
    };
  }

  // IP Per-minute Check
  const { count: ipMinuteCount } = await supabaseAdmin
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", oneMinuteAgo)
    .in("status", ["success", "error"])
    .eq("client_ip", clientIp);

  if ((ipMinuteCount ?? 0) >= limits.perMinuteIp) {
    return {
      allowed: false,
      reason: "Too many requests from this IP. Please wait a moment.",
      retryAfterSeconds: 60,
    };
  }

  // ── Daily check ─────────────────────────────────────────────────────────
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayStartISO = todayStart.toISOString();

  let dailyQuery = supabaseAdmin
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", todayStartISO)
    .in("status", ["success", "error"]);

  if (userId) {
    dailyQuery = dailyQuery.eq("user_id", userId);
  } else {
    dailyQuery = dailyQuery.eq("client_ip", clientIp);
  }

  const { count: dailyCount } = await dailyQuery;
  const currentDailyCount = dailyCount ?? 0;

  if (currentDailyCount >= dailyLimit) {
    // Calculate seconds until midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const retryAfterSeconds = Math.ceil((tomorrow.getTime() - now.getTime()) / 1000);

    return {
      allowed: false,
      reason: `Daily AI limit reached (${dailyLimit} requests/day). Please try again tomorrow.`,
      retryAfterSeconds,
      dailyUsed: currentDailyCount,
      dailyLimit,
    };
  }

  // IP Daily Check
  const { count: ipDailyCount } = await supabaseAdmin
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .gte("created_at", todayStartISO)
    .in("status", ["success", "error"])
    .eq("client_ip", clientIp);

  if ((ipDailyCount ?? 0) >= limits.dailyIp) {
    return {
      allowed: false,
      reason: `Daily AI limit reached for this IP (${limits.dailyIp} requests/day).`,
      retryAfterSeconds: 86400,
    };
  }

  return {
    allowed: true,
    dailyUsed: currentDailyCount,
    dailyLimit,
  };
}

/**
 * Log a rate-limited rejection to ai_usage_events for monitoring.
 */
export async function logRateLimitRejection(
  userId: string | null | undefined,
  endpoint: string,
  reason: string,
): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const request = getRequest();
    let clientIp = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (!clientIp) {
      clientIp = request?.headers.get("x-real-ip")?.trim() || "unknown";
    }

    await supabaseAdmin.from("ai_usage_events").insert({
      user_id: userId ?? null,
      client_ip: clientIp,
      endpoint,
      model: "rate_limited",
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      cost_usd: 0,
      status: "rate_limited",
      duration_ms: 0,
    });
  } catch (err) {
    const { logger } = await import("./logger.server");
    logger.error({ err, userId, endpoint }, "[RateLimiter] Failed to log rejection");
  }
}
