import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { GithubAnalysis } from "../models/GithubAnalysis.js";
import { Resume } from "../models/Resume.js";
import { CodeReview } from "../models/CodeReview.js";
import { MockInterview } from "../models/MockInterview.js";
import { Roadmap } from "../models/Roadmap.js";
import { AiUsageEvent } from "../models/AiUsageEvent.js";
import { AdminAuditLog } from "../models/AdminAuditLog.js";
import mongoose from "mongoose";

export async function checkIsAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const isAdmin = req.user?.role === "admin";
    res.json({ status: "success", data: { isAdmin } });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      users, gh, resumes, reviews, interviews, roadmaps,
      recentGh, recentResumes, recentReviews, recentInterviews, recentRoadmaps
    ] = await Promise.all([
      User.countDocuments(),
      GithubAnalysis.countDocuments(),
      Resume.countDocuments(),
      CodeReview.countDocuments(),
      MockInterview.countDocuments(),
      Roadmap.countDocuments(),
      GithubAnalysis.countDocuments({ createdAt: { $gte: since } }),
      Resume.countDocuments({ createdAt: { $gte: since } }),
      CodeReview.countDocuments({ createdAt: { $gte: since } }),
      MockInterview.countDocuments({ createdAt: { $gte: since } }),
      Roadmap.countDocuments({ createdAt: { $gte: since } }),
    ]);

    const adminCount = await User.countDocuments({ role: "admin" });
    const devCount = await User.countDocuments({ role: "developer" });

    res.json({
      status: "success",
      data: {
        totals: {
          users,
          githubAnalyses: gh,
          resumes,
          codeReviews: reviews,
          interviews,
          roadmaps,
        },
        last7Days: {
          githubAnalyses: recentGh,
          resumes: recentResumes,
          codeReviews: recentReviews,
          interviews: recentInterviews,
          roadmaps: recentRoadmaps,
        },
        roleCounts: {
          admin: adminCount,
          developer: devCount,
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function listAdminUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find()
      .select("_id email name avatarUrl githubUsername experienceLevel role createdAt")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const mappedUsers = users.map(u => ({
      ...u,
      id: u._id,
      avatar_url: u.avatarUrl,
      github_username: u.githubUsername,
      experience_level: u.experienceLevel,
      created_at: u.createdAt,
      roles: [u.role], // Keep array format for frontend compatibility
    }));

    res.json({ status: "success", data: mappedUsers });
  } catch (error) {
    next(error);
  }
}

export async function listAdminAiRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const fetchRecent = async (model: any, tableName: string, selectStr: string) => {
      const data = await model.find().select(selectStr).sort({ createdAt: -1 }).limit(20).lean();
      return data.map((d: any) => ({
        ...d,
        id: d._id,
        user_id: d.userId,
        created_at: d.createdAt,
        github_username: d.githubUsername,
        _table: tableName
      }));
    };

    const [gh, resumes, reviews, interviews, roadmaps] = await Promise.all([
      fetchRecent(GithubAnalysis, "github_analyses", "_id userId githubUsername score createdAt"),
      fetchRecent(Resume, "resumes", "_id userId title score createdAt"),
      fetchRecent(CodeReview, "code_reviews", "_id userId language createdAt"),
      fetchRecent(MockInterview, "interview_sessions", "_id userId jobRole interviewType createdAt"), // Note: using jobRole / interviewType for frontend compat
      fetchRecent(Roadmap, "roadmaps", "_id userId role createdAt"), // Using role for path
    ]);

    const all = [...gh, ...resumes, ...reviews, ...interviews, ...roadmaps]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);

    // Some frontend remapping for specific fields
    const mappedAll = all.map(item => {
      if (item._table === "interview_sessions") {
        return { ...item, role: item.jobRole, category: item.interviewType };
      }
      if (item._table === "roadmaps") {
        return { ...item, path: item.role };
      }
      return item;
    });

    res.json({ status: "success", data: mappedAll });
  } catch (error) {
    next(error);
  }
}

export async function setUserAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, makeAdmin } = req.body;
    const adminId = req.user!.id;

    const newRole = makeAdmin ? "admin" : "developer";

    await User.updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $set: { role: newRole } });

    await AdminAuditLog.create({
      adminId: new mongoose.Types.ObjectId(adminId),
      action: makeAdmin ? "grant_admin" : "revoke_admin",
      targetId: new mongoose.Types.ObjectId(userId),
      metadata: { target: userId, granted: makeAdmin }
    });

    res.json({ status: "success", data: { ok: true } });
  } catch (error) {
    next(error);
  }
}

export async function getApiUsageAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const obj = req.query as { days?: string; startDate?: string; endDate?: string };
    const days = Math.min(Math.max(Number(obj.days ?? 30), 1), 365);
    const startDate = obj.startDate && /^\d{4}-\d{2}-\d{2}$/.test(obj.startDate) ? obj.startDate : undefined;
    const endDate = obj.endDate && /^\d{4}-\d{2}-\d{2}$/.test(obj.endDate) ? obj.endDate : undefined;

    let since: Date;
    let until: Date;
    let dayCount: number;

    if (startDate && endDate) {
      since = new Date(startDate + "T00:00:00.000Z");
      until = new Date(endDate + "T23:59:59.999Z");
      dayCount = Math.max(1, Math.ceil((until.getTime() - since.getTime()) / 86400000));
    } else {
      dayCount = days;
      since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      until = new Date();
    }

    const events = await AiUsageEvent.find({
      createdAt: { $gte: since, $lte: until }
    })
      .select("endpoint aiModel userId promptTokens completionTokens totalTokens costUsd status durationMs createdAt")
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    const rows = events.map(e => ({
      ...e,
      user_id: e.userId ? String(e.userId) : null,
      created_at: e.createdAt.toISOString(),
      model: e.aiModel,
      total_tokens: e.totalTokens,
      cost_usd: e.costUsd,
      duration_ms: e.durationMs,
    }));

    const perDayMap = new Map<string, { date: string; requests: number; tokens: number; cost: number; errors: number }>();
    const startBase = since;
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(startBase.getTime() + i * 86400000);
      const key = d.toISOString().slice(0, 10);
      perDayMap.set(key, { date: key, requests: 0, tokens: 0, cost: 0, errors: 0 });
    }

    for (const r of rows) {
      const key = r.created_at.slice(0, 10);
      const bucket = perDayMap.get(key);
      if (!bucket) continue;
      bucket.requests += 1;
      bucket.tokens += r.total_tokens ?? 0;
      bucket.cost += Number(r.cost_usd ?? 0);
      if (r.status !== "success") bucket.errors += 1;
    }

    const endpointMap = new Map<string, any>();
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

    const modelMap = new Map<string, any>();
    for (const r of rows) {
      const k = r.model as string;
      const e = modelMap.get(k) ?? { model: k, requests: 0, tokens: 0, cost: 0 };
      e.requests += 1;
      e.tokens += r.total_tokens ?? 0;
      e.cost += Number(r.cost_usd ?? 0);
      modelMap.set(k, e);
    }
    const byModel = [...modelMap.values()].sort((a, b) => b.cost - a.cost);

    const userMap = new Map<string, any>();
    for (const r of rows) {
      const k = r.user_id ?? "anonymous";
      const e = userMap.get(k) ?? { user_id: k, requests: 0, tokens: 0, cost: 0 };
      e.requests += 1;
      e.tokens += r.total_tokens ?? 0;
      e.cost += Number(r.cost_usd ?? 0);
      userMap.set(k, e);
    }
    const topUserIds = [...userMap.values()].sort((a, b) => b.requests - a.requests).slice(0, 10);

    const ids = topUserIds.map((u) => u.user_id).filter((id) => id !== "anonymous");
    const profiles = ids.length ? await User.find({ _id: { $in: ids } }).select("_id email name avatarUrl").lean() : [];
    
    const profileMap = new Map(profiles.map(p => [String(p._id), {
      id: p._id,
      email: p.email,
      name: p.name,
      avatar_url: p.avatarUrl
    }]));

    const topUsers = topUserIds.map((u) => ({
      ...u,
      profile: profileMap.get(u.user_id) ?? null,
    }));

    const totals = rows.reduce(
      (acc: any, r: any) => {
        acc.requests += 1;
        acc.tokens += r.total_tokens ?? 0;
        acc.cost += Number(r.cost_usd ?? 0);
        if (r.status !== "success") acc.errors += 1;
        return acc;
      },
      { requests: 0, tokens: 0, cost: 0, errors: 0 },
    );

    res.json({
      status: "success",
      data: {
        days,
        startDate,
        endDate,
        totals,
        perDay: [...perDayMap.values()],
        byEndpoint,
        byModel,
        topUsers,
      }
    });
  } catch (error) {
    next(error);
  }
}
