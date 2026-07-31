import { Request, Response, NextFunction } from "express";
import { callAiJson } from "../services/ai.service.js";
import { JobMatch } from "../models/JobMatch.js";
import { DeveloperScore } from "../models/DeveloperScore.js";
import { GithubAnalysis } from "../models/GithubAnalysis.js";
import { Resume } from "../models/Resume.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { User } from "../models/User.js";
import crypto from "crypto";

export async function analyzeJobMatch(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { resumeText, resumeFileName, jobDescription, jobRole } = req.body;
    
    const hashKey = crypto.createHash("md5").update(resumeText + jobDescription).digest("hex");
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const cached = await JobMatch.findOne({
      userId,
      hashKey,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });
    
    if (cached) {
      return res.json({
        id: cached._id,
        ...cached.analysis,
        atsScore: cached.atsScore,
        hiringProbability: cached.hiringProbability,
        interviewReadiness: cached.interviewReadiness,
      });
    }
    
    const rawAi = await callAiJson<any>({
      messages: [
        { role: "system", content: "You are an expert technical recruiter and ATS software analyzer. Compare the user's resume text against the job description. Be highly critical and provide an actionable, realistic assessment." },
        { role: "user", content: `Analyze this resume against the job description and return JSON.\n\nJob Role: ${jobRole}\n\nJob Description:\n${jobDescription}\n\nResume Text:\n${resumeText}` },
      ],
      schema: {
        name: "job_match",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            atsScore: { type: "integer", minimum: 0, maximum: 100 },
            hiringProbability: { type: "integer", minimum: 0, maximum: 100 },
            interviewReadiness: { type: "integer", minimum: 0, maximum: 100 },
            matchingSkills: { type: "array", items: { type: "string" } },
            missingSkills: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
            recommendedProjects: { type: "array", items: { type: "string" } },
            recommendedSkills: { type: "array", items: { type: "string" } },
          },
          required: [
            "atsScore", "hiringProbability", "interviewReadiness", "matchingSkills", "missingSkills",
            "strengths", "weaknesses", "suggestions", "summary", "recommendedProjects", "recommendedSkills"
          ],
        },
      },
      log: { endpoint: "analyzeJobMatch", userId },
    });
    
    const inserted = await JobMatch.create({
      userId,
      jobRole,
      jobDescription,
      resumeFileName,
      resumeText,
      atsScore: rawAi.atsScore,
      hiringProbability: rawAi.hiringProbability,
      interviewReadiness: rawAi.interviewReadiness,
      aiSummary: rawAi.summary,
      analysis: rawAi,
      hashKey,
    });
    
    res.json({ id: inserted._id, ...rawAi });
  } catch (error) {
    next(error);
  }
}

export async function getJobMatchesHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const matches = await JobMatch.find({ userId })
      .select("id jobRole atsScore resumeFileName createdAt")
      .sort({ createdAt: -1 });
    
    res.json(matches.map(m => ({
      id: m._id,
      job_role: m.jobRole,
      ats_score: m.atsScore,
      resume_file_name: m.resumeFileName,
      created_at: m.createdAt
    })));
  } catch (error) {
    next(error);
  }
}

export async function generateDeveloperScore(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    
    const [gh, resume, jobMatch, interviewCount, profile] = await Promise.all([
      GithubAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
      Resume.findOne({ userId }).sort({ updatedAt: -1 }),
      JobMatch.findOne({ userId }).sort({ createdAt: -1 }),
      InterviewSession.countDocuments({ userId }),
      User.findById(userId)
    ]);
    
    const githubScore = gh?.score ?? 0;
    const resumeScore = resume?.score ?? 0;
    const jobMatchScore = jobMatch?.atsScore ?? 0;
    
    const p = profile ? profile.toObject() : null;
    const mockInterviewScore = p?.bestInterviewScore ?? 0;
    const interviewScore = mockInterviewScore > 0 ? mockInterviewScore : Math.min(100, interviewCount * 20);
    
    const profileFields = [p?.name, p?.bio, p?.githubUsername, p?.skills?.length ? "skills" : null];
    const profileScore = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
    
    const overallScore = Math.round(
      githubScore * 0.25 + resumeScore * 0.2 + jobMatchScore * 0.25 + interviewScore * 0.2 + profileScore * 0.1
    );
    
    const rawAi = await callAiJson<any>({
      messages: [
        { role: "system", content: "You are an elite career coach. Analyze the developer's component scores and profile to generate actionable insights, recommendations, and suggested next steps." },
        { role: "user", content: `Generate Developer Health Score Insights.
Overall Score: ${overallScore}
Component Scores:
- GitHub: ${githubScore}/100
- Resume: ${resumeScore}/100
- Job Match: ${jobMatchScore}/100 (Last role: ${jobMatch?.jobRole ?? "N/A"})
- Interview Readiness: ${interviewScore}/100
- Profile Completion: ${profileScore}/100

Profile details: ${JSON.stringify(p)}

Return JSON with exactly these fields:
"overallScore" (should be ${overallScore}),
"strengths" (list of 3-5 strings),
"weaknesses" (list of 3-5 strings),
"recommendations" (list of 3-5 strings),
"suggestedProjects" (list of 3 project ideas, string format),
"certifications" (list of 3 recommended certs),
"jobRoles" (list of 3 target roles),
"insights": { "why": "...", "biggestStrength": "...", "biggestWeakness": "...", "fastestImprovement": "..." }
` },
      ],
      schema: {
        name: "developer_score",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            overallScore: { type: "integer" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            suggestedProjects: { type: "array", items: { type: "string" } },
            certifications: { type: "array", items: { type: "string" } },
            jobRoles: { type: "array", items: { type: "string" } },
            insights: {
              type: "object",
              additionalProperties: false,
              properties: {
                why: { type: "string" },
                biggestStrength: { type: "string" },
                biggestWeakness: { type: "string" },
                fastestImprovement: { type: "string" },
              },
              required: ["why", "biggestStrength", "biggestWeakness", "fastestImprovement"],
            },
          },
          required: [
            "overallScore", "strengths", "weaknesses", "recommendations",
            "suggestedProjects", "certifications", "jobRoles", "insights"
          ],
        },
      },
      log: { endpoint: "generateDeveloperScore", userId },
    });
    
    const inserted = await DeveloperScore.create({
      userId,
      overallScore,
      githubScore,
      resumeScore,
      jobMatchScore,
      interviewScore,
      profileScore,
      strengths: rawAi.strengths,
      weaknesses: rawAi.weaknesses,
      recommendations: rawAi.recommendations,
      suggestedProjects: rawAi.suggestedProjects,
      certifications: rawAi.certifications,
      jobRoles: rawAi.jobRoles,
      aiInsights: rawAi.insights,
    });
    
    res.json({
      ...inserted.toObject(),
      overall_score: inserted.overallScore,
      github_score: inserted.githubScore,
      resume_score: inserted.resumeScore,
      job_match_score: inserted.jobMatchScore,
      interview_score: inserted.interviewScore,
      profile_score: inserted.profileScore,
      suggested_projects: inserted.suggestedProjects,
      ai_insights: inserted.aiInsights,
      created_at: inserted.createdAt
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeveloperScoresHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const scores = await DeveloperScore.find({ userId }).sort({ createdAt: -1 });
    res.json(scores.map(s => ({
      ...s.toObject(),
      id: s._id,
      overall_score: s.overallScore,
      github_score: s.githubScore,
      resume_score: s.resumeScore,
      job_match_score: s.jobMatchScore,
      interview_score: s.interviewScore,
      profile_score: s.profileScore,
      suggested_projects: s.suggestedProjects,
      ai_insights: s.aiInsights,
      created_at: s.createdAt
    })));
  } catch (error) {
    next(error);
  }
}
