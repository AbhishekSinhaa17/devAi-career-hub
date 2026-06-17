import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export interface FeatureMetric {
  name: string;
  count: number;
  last30Days: number;
  prev30Days: number;
  growth: number;
  percentage: number;
}

export interface DailyActivity {
  date: string;
  total: number;
  [feature: string]: number | string; // dynamic for stacked bar charts
}

export interface AnalyticsResponse {
  kpis: {
    totalUsers: number;
    activeUsers7d: number;
    totalAiRequests: number;
    avgAiRequestsPerUser: number;
    mostUsedFeature: string;
    fastestGrowingFeature: string;
  };
  features: FeatureMetric[];
  dailyActivity: DailyActivity[];
  lastUpdated: string;
}

export const getGlobalAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ days: z.number().min(7).max(90).default(30) }).parse(d ?? {}),
  )
  .handler(async ({ data: { days }, context }): Promise<AnalyticsResponse> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);

    const periodPrevStart = new Date(periodStart);
    periodPrevStart.setDate(periodPrevStart.getDate() - days);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Helper for parallel count queries
    const countTable = async (table: string, from?: Date, to?: Date) => {
      let q = supabaseAdmin.from(table as any).select("id", { count: "exact", head: true });
      if (from) q = q.gte("created_at", from.toISOString());
      if (to) q = q.lt("created_at", to.toISOString());
      const { count } = await q;
      return count ?? 0;
    };

    const countUsers = async () => {
      // Supabase auth.users can't be queried directly like this in some setups,
      // but we have a `profiles` table which mirrors users.
      const { count } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true });
      return count ?? 0;
    };

    const countActiveUsers = async () => {
      // Users who generated an AI event in the last 7 days
      // We must fetch distinct user_ids since we can't easily do COUNT(DISTINCT user_id) in JS
      const { data } = await supabaseAdmin
        .from("ai_usage_events")
        .select("user_id")
        .gte("created_at", sevenDaysAgo.toISOString())
        .not("user_id", "is", null);
      if (!data) return 0;
      const uniqueUsers = new Set(data.map((d) => d.user_id));
      return uniqueUsers.size;
    };

    const fetchDailyActivity = async () => {
      // Fetch events for the chart
      const { data } = await supabaseAdmin
        .from("ai_usage_events")
        .select("created_at, endpoint")
        .gte("created_at", periodStart.toISOString());
      
      const activityMap: Record<string, DailyActivity> = {};
      
      // Initialize all dates in the range to ensure zero-days are shown
      for (let i = 0; i <= days; i++) {
        const d = new Date(periodStart);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        activityMap[dateStr] = { date: dateStr, total: 0 };
      }

      if (data) {
        data.forEach((event) => {
          const dateStr = event.created_at.split("T")[0];
          if (!activityMap[dateStr]) {
            activityMap[dateStr] = { date: dateStr, total: 0 };
          }
          activityMap[dateStr].total += 1;
          
          const endpoint = event.endpoint.replace("/api/ai/", "") || "other";
          if (typeof activityMap[dateStr][endpoint] === "number") {
             (activityMap[dateStr][endpoint] as number) += 1;
          } else {
             activityMap[dateStr][endpoint] = 1;
          }
        });
      }

      return Object.values(activityMap).sort((a, b) => a.date.localeCompare(b.date));
    };

    const featureTables = [
      { name: "GitHub Analyzer", table: "github_analyses" },
      { name: "Resume Builder", table: "resumes" },
      { name: "Portfolio Gen", table: "github_resumes" },
      { name: "Code Review", table: "code_reviews" },
      { name: "Mock Interview", table: "mock_interviews" },
      { name: "Career Roadmap", table: "roadmaps" },
    ];

    // Execute massive parallel fetch for performance
    const [
      totalUsers,
      activeUsers7d,
      totalAiRequests,
      dailyActivity,
      ...featureResults
    ] = await Promise.all([
      countUsers(),
      countActiveUsers(),
      countTable("ai_usage_events"),
      fetchDailyActivity(),
      ...featureTables.map(async (ft) => {
        const [total, last30, prev30] = await Promise.all([
          countTable(ft.table),
          countTable(ft.table, periodStart, now),
          countTable(ft.table, periodPrevStart, periodStart),
        ]);
        return { name: ft.name, total, last30, prev30 };
      }),
    ]);

    // Process feature metrics
    const totalFeatureUsage = featureResults.reduce((acc, f) => acc + f.total, 0);
    
    let fastestGrowingFeature = "None";
    let highestGrowth = -Infinity;
    let mostUsedFeature = "None";
    let highestUsage = -1;

    const features: FeatureMetric[] = featureResults.map((f) => {
      const percentage = totalFeatureUsage > 0 ? (f.total / totalFeatureUsage) * 100 : 0;
      let growth = 0;
      if (f.prev30 === 0 && f.last30 > 0) {
        growth = 100; // Infinity formally, but 100% is cleaner
      } else if (f.prev30 > 0) {
        growth = ((f.last30 - f.prev30) / f.prev30) * 100;
      }

      if (growth > highestGrowth && f.last30 > 0) {
        highestGrowth = growth;
        fastestGrowingFeature = f.name;
      }

      if (f.total > highestUsage) {
        highestUsage = f.total;
        mostUsedFeature = f.name;
      }

      return {
        name: f.name,
        count: f.total,
        last30Days: f.last30,
        prev30Days: f.prev30,
        growth,
        percentage,
      };
    });

    return {
      kpis: {
        totalUsers,
        activeUsers7d,
        totalAiRequests,
        avgAiRequestsPerUser: totalUsers > 0 ? totalAiRequests / totalUsers : 0,
        mostUsedFeature,
        fastestGrowingFeature,
      },
      features,
      dailyActivity,
      lastUpdated: new Date().toISOString(),
    };
  });
