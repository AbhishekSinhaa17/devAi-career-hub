import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: !!data };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [users, gh, resumes, reviews, interviews, roadmaps, roles] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("github_analyses").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("resumes").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("code_reviews").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("interview_sessions").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("roadmaps").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("user_roles").select("role"),
    ]);

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recent = await Promise.all([
      supabaseAdmin.from("github_analyses").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabaseAdmin.from("resumes").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabaseAdmin.from("code_reviews").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabaseAdmin.from("interview_sessions").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabaseAdmin.from("roadmaps").select("id", { count: "exact", head: true }).gte("created_at", since),
    ]);

    const roleCounts: Record<string, number> = {};
    (roles.data ?? []).forEach((r: any) => {
      roleCounts[r.role] = (roleCounts[r.role] ?? 0) + 1;
    });

    return {
      totals: {
        users: users.count ?? 0,
        githubAnalyses: gh.count ?? 0,
        resumes: resumes.count ?? 0,
        codeReviews: reviews.count ?? 0,
        interviews: interviews.count ?? 0,
        roadmaps: roadmaps.count ?? 0,
      },
      last7Days: {
        githubAnalyses: recent[0].count ?? 0,
        resumes: recent[1].count ?? 0,
        codeReviews: recent[2].count ?? 0,
        interviews: recent[3].count ?? 0,
        roadmaps: recent[4].count ?? 0,
      },
      roleCounts,
    };
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, name, avatar_url, github_username, experience_level, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });
    return (profiles ?? []).map((p: any) => ({
      ...p,
      roles: roleMap.get(p.id) ?? [],
    }));
  });

export const listAdminAiRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const fetchRecent = async (table: string, fields: string) => {
      const { data } = await (supabaseAdmin as any)
        .from(table)
        .select(fields)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []).map((d: any) => ({ ...d, _table: table }));
    };

    const [gh, resumes, reviews, interviews, roadmaps] = await Promise.all([
      fetchRecent("github_analyses", "id, user_id, github_username, score, created_at"),
      fetchRecent("resumes", "id, user_id, title, score, created_at"),
      fetchRecent("code_reviews", "id, user_id, language, created_at"),
      fetchRecent("interview_sessions", "id, user_id, role, category, created_at"),
      fetchRecent("roadmaps", "id, user_id, path, created_at"),
    ]);

    const all = [...gh, ...resumes, ...reviews, ...interviews, ...roadmaps]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);

    return all;
  });

export const setUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; makeAdmin: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.makeAdmin) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.userId, role: "admin" });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "admin");
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const getApiUsageAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const obj = (d ?? {}) as { days?: number; startDate?: string; endDate?: string };
    const days = Math.min(Math.max(Number(obj.days ?? 30), 1), 365);
    const startDate = obj.startDate && /^\d{4}-\d{2}-\d{2}$/.test(obj.startDate) ? obj.startDate : undefined;
    const endDate = obj.endDate && /^\d{4}-\d{2}-\d{2}$/.test(obj.endDate) ? obj.endDate : undefined;
    return { days, startDate, endDate };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let since: string;
    let until: string;
    let dayCount: number;

    if (data.startDate && data.endDate) {
      since = new Date(data.startDate + "T00:00:00.000Z").toISOString();
      const end = new Date(data.endDate + "T23:59:59.999Z");
      until = end.toISOString();
      dayCount = Math.max(1, Math.ceil((end.getTime() - new Date(since).getTime()) / 86400000) + 1);
    } else {
      dayCount = data.days;
      since = new Date(Date.now() - data.days * 24 * 60 * 60 * 1000).toISOString();
      until = new Date().toISOString();
    }

    const { data: events, error } = await supabaseAdmin
      .from("ai_usage_events")
      .select("endpoint, model, user_id, prompt_tokens, completion_tokens, total_tokens, cost_usd, status, duration_ms, created_at")
      .gte("created_at", since)
      .lte("created_at", until)
      .order("created_at", { ascending: false })
      .limit(10000);
    if (error) throw new Error(error.message);

    const rows = events ?? [];

    // Requests per day
    const perDayMap = new Map<string, { date: string; requests: number; tokens: number; cost: number; errors: number }>();
    const startBase = new Date(since);
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(startBase.getTime() + i * 86400000);
      const key = d.toISOString().slice(0, 10);
      perDayMap.set(key, { date: key, requests: 0, tokens: 0, cost: 0, errors: 0 });
    }
    for (const r of rows) {
      const key = (r.created_at as string).slice(0, 10);
      const bucket = perDayMap.get(key);
      if (!bucket) continue;
      bucket.requests += 1;
      bucket.tokens += r.total_tokens ?? 0;
      bucket.cost += Number(r.cost_usd ?? 0);
      if (r.status !== "success") bucket.errors += 1;
    }

    // By endpoint
    const endpointMap = new Map<string, { endpoint: string; requests: number; tokens: number; cost: number; avgMs: number; errors: number; _ms: number }>();
    for (const r of rows) {
      const k = r.endpoint as string;
      const e = endpointMap.get(k) ?? { endpoint: k, requests: 0, tokens: 0, cost: 0, avgMs: 0, errors: 0, _ms: 0 };
      e.requests += 1;
      e.tokens += r.total_tokens ?? 0;
      e.cost += Number(r.cost_usd ?? 0);
      e._ms += r.duration_ms ?? 0;
      if (r.status !== "success") e.errors += 1;
      endpointMap.set(k, e);
    }
    const byEndpoint = [...endpointMap.values()]
      .map((e) => ({ ...e, avgMs: e.requests ? Math.round(e._ms / e.requests) : 0 }))
      .sort((a, b) => b.requests - a.requests);

    // By model
    const modelMap = new Map<string, { model: string; requests: number; tokens: number; cost: number }>();
    for (const r of rows) {
      const k = r.model as string;
      const e = modelMap.get(k) ?? { model: k, requests: 0, tokens: 0, cost: 0 };
      e.requests += 1;
      e.tokens += r.total_tokens ?? 0;
      e.cost += Number(r.cost_usd ?? 0);
      modelMap.set(k, e);
    }
    const byModel = [...modelMap.values()].sort((a, b) => b.cost - a.cost);

    // Top users
    const userMap = new Map<string, { user_id: string; requests: number; tokens: number; cost: number }>();
    for (const r of rows) {
      const k = (r.user_id as string | null) ?? "anonymous";
      const e = userMap.get(k) ?? { user_id: k, requests: 0, tokens: 0, cost: 0 };
      e.requests += 1;
      e.tokens += r.total_tokens ?? 0;
      e.cost += Number(r.cost_usd ?? 0);
      userMap.set(k, e);
    }
    const topUserIds = [...userMap.values()].sort((a, b) => b.requests - a.requests).slice(0, 10);

    const ids = topUserIds.map((u) => u.user_id).filter((id) => id !== "anonymous");
    const { data: profiles } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, email, name, avatar_url").in("id", ids)
      : { data: [] as any[] };
    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const topUsers = topUserIds.map((u) => ({
      ...u,
      profile: profileMap.get(u.user_id) ?? null,
    }));

    const totals = rows.reduce(
      (acc, r) => {
        acc.requests += 1;
        acc.tokens += r.total_tokens ?? 0;
        acc.cost += Number(r.cost_usd ?? 0);
        if (r.status !== "success") acc.errors += 1;
        return acc;
      },
      { requests: 0, tokens: 0, cost: 0, errors: 0 },
    );

    return {
      days: data.days,
      startDate: data.startDate,
      endDate: data.endDate,
      totals,
      perDay: [...perDayMap.values()],
      byEndpoint,
      byModel,
      topUsers,
    };
  });
