import { Request, Response, NextFunction } from "express";
import { DeveloperHealthScore } from "../models/DeveloperHealthScore.js";
import { GithubAnalysis } from "../models/GithubAnalysis.js";
import { Resume } from "../models/Resume.js";
import { MockInterview } from "../models/MockInterview.js";
import { JobMatch } from "../models/JobMatch.js";
import { GithubResume } from "../models/GithubResume.js"; // Also known as Portfolio Deployment
import { callAiJson } from "../services/ai.service.js";
import mongoose from "mongoose";

export async function getHealthScoreHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    
    const data = await DeveloperHealthScore.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
      
    // Map _id to id and camelCase to snake_case for frontend compatibility
    const mappedData = data.map(item => ({
      ...item,
      id: item._id,
      user_id: item.userId,
      created_at: item.createdAt,
      github_score: item.githubScore,
      resume_score: item.resumeScore,
      interview_score: item.interviewScore,
      job_match_score: item.jobMatchScore,
      portfolio_score: item.portfolioScore,
      overall_score: item.overallScore,
    }));

    res.json({ status: "success", data: mappedData });
  } catch (error) {
    next(error);
  }
}

export async function generateHealthScore(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const [gh, resData, mock, job, port] = await Promise.all([
      GithubAnalysis.findOne({ userId: objectId }).sort({ score: -1 }).lean(),
      Resume.findOne({ userId: objectId }).sort({ score: -1 }).lean(),
      MockInterview.findOne({ userId: objectId }).sort({ overallScore: -1 }).lean(),
      JobMatch.findOne({ userId: objectId }).sort({ hiringProbability: -1 }).lean(),
      GithubResume.findOne({ userId: objectId }).sort({ profileStrength: -1 }).lean(),
    ]);

    const github_score = gh?.score || 0;
    const resume_score = resData?.score || 0;
    const interview_score = mock?.overallScore || 0;
    const job_match_score = job?.hiringProbability || 0;
    const portfolio_score = port?.profileStrength || 0;

    const overall_score = Math.round(
      github_score * 0.25 +
        resume_score * 0.2 +
        interview_score * 0.25 +
        job_match_score * 0.2 +
        portfolio_score * 0.1,
    );

    const prompt = `
      Analyze this developer's health scores and provide strengths, weaknesses, and recommendations.
      GitHub Score: ${github_score}/100 (Weight 25%)
      Resume Score: ${resume_score}/100 (Weight 20%)
      Interview Score: ${interview_score}/100 (Weight 25%)
      Job Match Score: ${job_match_score}/100 (Weight 20%)
      Portfolio Score: ${portfolio_score}/100 (Weight 10%)
      Overall Career Readiness Score: ${overall_score}/100
      
      Respond with exactly 3 to 5 concise points for strengths, 3 to 5 concise points for weaknesses, and 3 to 5 actionable recommendations.
      Format as JSON: { "strengths": string[], "weaknesses": string[], "recommendations": string[] }
    `;

    const aiRes = await callAiJson<{
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    }>({
      messages: [{ role: "user", content: prompt }],
      schema: {
        name: "HealthScoreAnalysis",
        schema: {
          type: "object",
          properties: {
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
          },
          required: ["strengths", "weaknesses", "recommendations"],
        },
      },
      log: { endpoint: "/api/health/generate", userId, clientIp: req.ip },
    });

    const newScore = await DeveloperHealthScore.create({
      userId: objectId,
      githubScore: github_score,
      resumeScore: resume_score,
      interviewScore: interview_score,
      jobMatchScore: job_match_score,
      portfolioScore: portfolio_score,
      overallScore: overall_score,
      strengths: aiRes.strengths,
      weaknesses: aiRes.weaknesses,
      recommendations: aiRes.recommendations,
    });

    res.json({ 
      status: "success", 
      data: {
        ...newScore.toJSON(),
        id: newScore._id,
        user_id: newScore.userId,
        created_at: newScore.createdAt,
        github_score: newScore.githubScore,
        resume_score: newScore.resumeScore,
        interview_score: newScore.interviewScore,
        job_match_score: newScore.jobMatchScore,
        portfolio_score: newScore.portfolioScore,
        overall_score: newScore.overallScore
      } 
    });
  } catch (error) {
    next(error);
  }
}
