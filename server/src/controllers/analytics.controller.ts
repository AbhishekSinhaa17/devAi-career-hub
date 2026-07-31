import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { AiUsageEvent } from "../models/AiUsageEvent.js";
import { GithubAnalysis } from "../models/GithubAnalysis.js";
import { Resume } from "../models/Resume.js";
import { GithubResume } from "../models/GithubResume.js";
import { CodeReview } from "../models/CodeReview.js";
import { MockInterview } from "../models/MockInterview.js";
import { Roadmap } from "../models/Roadmap.js";
import { DeveloperHealthScore } from "../models/DeveloperHealthScore.js";
import { PortfolioDeployment } from "../models/PortfolioDeployment.js";
import { CopilotConversation } from "../models/CopilotConversation.js";

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

export async function getGlobalAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string, 10) || 30;

    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);

    const periodPrevStart = new Date(periodStart);
    periodPrevStart.setDate(periodPrevStart.getDate() - days);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const countTable = async (model: any, from?: Date, to?: Date) => {
      let query: any = {};
      if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = from;
        if (to) query.createdAt.$lt = to;
      }
      return model.countDocuments(query);
    };

    const countUsers = () => countTable(User);

    const countActiveUsers = async () => {
      const uniqueUsers = await AiUsageEvent.distinct("userId", {
        createdAt: { $gte: sevenDaysAgo },
        userId: { $exists: true, $ne: null }
      });
      return uniqueUsers.length;
    };

    const fetchDailyActivity = async () => {
      const data = await AiUsageEvent.find({
        createdAt: { $gte: periodStart }
      }).select("createdAt endpoint").lean();

      const activityMap: Record<string, DailyActivity> = {};

      for (let i = 0; i <= days; i++) {
        const d = new Date(periodStart);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        activityMap[dateStr] = { date: dateStr, total: 0 };
      }

      data.forEach((event: any) => {
        const dateStr = new Date(event.createdAt).toISOString().split("T")[0];
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

      return Object.values(activityMap).sort((a, b) => a.date.localeCompare(b.date));
    };

    const featureModels = [
      { name: "GitHub Analyzer", model: GithubAnalysis },
      { name: "Resume Builder", model: Resume },
      { name: "Portfolio Gen", model: GithubResume },
      { name: "Code Review", model: CodeReview },
      { name: "Mock Interview", model: MockInterview },
      { name: "Career Roadmap", model: Roadmap },
      { name: "Health Score", model: DeveloperHealthScore },
      { name: "Portfolio Deploy", model: PortfolioDeployment },
      { name: "AI Copilot", model: CopilotConversation },
    ];

    const fetchHealthMetrics = async () => {
      const data = await DeveloperHealthScore.find().select("userId overallScore").lean();
      
      if (!data || data.length === 0) {
        return { avg: 0, dist: [], top: [] };
      }

      let sum = 0;
      const ranges = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
      const userScores: Record<string, number> = {};

      data.forEach((d: any) => {
        sum += d.overallScore;
        if (d.overallScore <= 20) ranges["0-20"]++;
        else if (d.overallScore <= 40) ranges["21-40"]++;
        else if (d.overallScore <= 60) ranges["41-60"]++;
        else if (d.overallScore <= 80) ranges["61-80"]++;
        else ranges["81-100"]++;

        const userIdStr = String(d.userId);
        if (!userScores[userIdStr] || userScores[userIdStr] < d.overallScore) {
          userScores[userIdStr] = d.overallScore;
        }
      });

      const top = Object.entries(userScores)
        .map(([userId, score]) => ({ userId, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      const dist = Object.entries(ranges).map(([range, count]) => ({ range, count }));

      return { avg: Math.round(sum / data.length), dist, top };
    };

    const [
      totalUsers,
      activeUsers7d,
      totalAiRequests,
      dailyActivity,
      healthMetrics,
      ...featureResults
    ] = await Promise.all([
      countUsers(),
      countActiveUsers(),
      countTable(AiUsageEvent),
      fetchDailyActivity(),
      fetchHealthMetrics(),
      ...featureModels.map(async (ft) => {
        const [total, last30, prev30] = await Promise.all([
          countTable(ft.model),
          countTable(ft.model, periodStart, now),
          countTable(ft.model, periodPrevStart, periodStart),
        ]);
        return { name: ft.name, total, last30, prev30 };
      }),
    ]);

    const totalFeatureUsage = featureResults.reduce((acc, f) => acc + f.total, 0);

    let fastestGrowingFeature = "None";
    let highestGrowth = -Infinity;
    let mostUsedFeature = "None";
    let highestUsage = -1;

    const features: FeatureMetric[] = featureResults.map((f) => {
      const percentage = totalFeatureUsage > 0 ? (f.total / totalFeatureUsage) * 100 : 0;
      let growth = 0;
      if (f.prev30 === 0 && f.last30 > 0) {
        growth = 100;
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

    res.json({
      status: "success",
      data: {
        kpis: {
          totalUsers,
          activeUsers7d,
          totalAiRequests,
          avgAiRequestsPerUser: totalUsers > 0 ? totalAiRequests / totalUsers : 0,
          mostUsedFeature,
          fastestGrowingFeature,
          avgHealthScore: healthMetrics.avg,
        },
        features,
        dailyActivity,
        healthDistribution: healthMetrics.dist,
        topPerformers: healthMetrics.top,
        lastUpdated: new Date().toISOString(),
      }
    });

  } catch (error) {
    next(error);
  }
}
