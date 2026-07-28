import { Request, Response, NextFunction } from "express";
import { GithubAnalysis } from "../models/GithubAnalysis.js";
import { Resume } from "../models/Resume.js";
import { User } from "../models/User.js";
import { CodeReview } from "../models/CodeReview.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { DeveloperScore } from "../models/DeveloperScore.js";
import { GithubResume } from "../models/GithubResume.js";
import { MockInterview } from "../models/MockInterview.js";
import { callAiJson } from "../services/ai.service.js";

export async function getGithubAnalysisCache(req: Request, res: Response) {
  try {
    const { username } = req.params;
    const userId = (req as any).user.id;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const cached = await GithubAnalysis.findOne({
      userId,
      githubUsername: { $regex: new RegExp(`^${username}$`, "i") },
      createdAt: { $gte: oneDayAgo },
    }).sort({ createdAt: -1 });

    res.json(cached ? {
      ...cached.toObject(),
      id: cached._id,
      github_username: cached.githubUsername,
      user_id: cached.userId,
      created_at: cached.createdAt,
    } : null);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cache" });
  }
}

export async function saveGithubAnalysis(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const {
      github_username,
      score,
      stats,
      strengths,
      weaknesses,
      suggestions,
      summary,
    } = req.body;

    const analysis = new GithubAnalysis({
      userId,
      githubUsername: github_username,
      score,
      stats,
      strengths,
      weaknesses,
      suggestions,
      summary,
    });
    
    await analysis.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save analysis" });
  }
}

export async function getDashboard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const [
      profile,
      gh,
      resume,
      reviewsCount,
      interviewsCount,
      devScores,
      ghResumes,
      mockInterviews
    ] = await Promise.all([
      User.findById(userId),
      GithubAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
      Resume.findOne({ userId }).sort({ updatedAt: -1 }),
      CodeReview.countDocuments({ userId }),
      InterviewSession.countDocuments({ userId }),
      DeveloperScore.find({ userId }).sort({ createdAt: -1 }).limit(2),
      GithubResume.findOne({ userId }).sort({ createdAt: -1 }),
      MockInterview.find({ userId }).sort({ createdAt: -1 }).limit(2)
    ]);

    const p = profile ? profile.toObject() : null;
    const profileFields = [
      p?.name,
      p?.bio,
      p?.githubUsername,
      p?.skills?.length ? "skills" : null,
    ];
    const profileCompletion = Math.round(
      (profileFields.filter(Boolean).length / profileFields.length) * 100,
    );

    let devScoreTrend = 0;
    if (devScores && devScores.length >= 2) {
      devScoreTrend = devScores[0].overallScore - devScores[1].overallScore;
    }

    let mockInterviewTrend = 0;
    if (mockInterviews && mockInterviews.length >= 2) {
      mockInterviewTrend = mockInterviews[0].overallScore - mockInterviews[1].overallScore;
    }

    res.json({
      profile: p,
      profileCompletion,
      githubScore: gh?.score ?? 0,
      githubUsername: gh?.githubUsername ?? null,
      resumeScore: resume?.score ?? 0,
      portfolioScore: profileCompletion,
      interviewReady: Math.min(100, interviewsCount * 20),
      codeReviewCount: reviewsCount,
      interviewCount: interviewsCount,
      devScore: devScores?.[0]?.overallScore ?? 0,
      devScoreTrend,
      devScoreUpdated: devScores?.[0]?.createdAt ?? null,
      githubResume: ghResumes ? {
        developer_type: ghResumes.developerType,
        resume_data: ghResumes.resumeData,
        badges: ghResumes.badges,
        created_at: ghResumes.createdAt
      } : null,
      mockInterview: mockInterviews?.[0] ? {
        overall_score: mockInterviews[0].overallScore,
        job_role: mockInterviews[0].jobRole,
        created_at: mockInterviews[0].createdAt
      } : null,
      mockInterviewTrend,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
}

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const scores = await DeveloperScore.find()
      .populate("userId", "name githubUsername")
      .sort({ overallScore: -1 })
      .limit(50);
      
    // Transform to match the old supabase return shape
    const data = scores.map(s => {
      const user = (s as any).userId;
      return {
        id: s._id,
        user_id: user?._id || s.userId,
        overall_score: s.overallScore,
        created_at: s.createdAt,
        name: user?.name,
        github_username: user?.githubUsername,
      };
    });
    
    res.json({ data });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
}

export async function upgradeToPro(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { is_pro, pro_expires_at } = req.body;
    await User.findByIdAndUpdate(userId, {
      isPro: is_pro,
      proExpiresAt: pro_expires_at
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to upgrade" });
  }
}

export async function generateJson(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const body = req.body;
    
    if (body.log) {
      body.log.userId = userId;
      body.log.clientIp = req.ip;
    }
    
    const result = await callAiJson(body);
    res.json({ result });
  } catch (error) {
    next(error);
  }
}
