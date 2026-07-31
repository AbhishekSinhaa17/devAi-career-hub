import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";
import { serverApiClient } from "@/lib/api-client";

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
  [feature: string]: number | string;
}

export interface AnalyticsResponse {
  kpis: {
    totalUsers: number;
    activeUsers7d: number;
    totalAiRequests: number;
    avgAiRequestsPerUser: number;
    mostUsedFeature: string;
    fastestGrowingFeature: string;
    avgHealthScore?: number;
  };
  healthDistribution?: { range: string; count: number }[];
  topPerformers?: { userId: string; score: number }[];
  features: FeatureMetric[];
  dailyActivity: DailyActivity[];
  lastUpdated: string;
}

export const getGlobalAnalytics = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z.object({ days: z.number().min(7).max(90).default(30) }).parse(d ?? {}),
  )
  .handler(async ({ data: { days }, context }): Promise<AnalyticsResponse> => {
    const { data } = await serverApiClient.get("/analytics/global", {
      params: { days },
      headers: { Authorization: `Bearer ${context.token}` }
    });
    
    return data.data as AnalyticsResponse;
  });
