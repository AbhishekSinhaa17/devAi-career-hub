import { Request, Response, NextFunction } from "express";
import { callAiJson } from "../services/ai.service.js";
import { fetchGitHubRepos } from "../services/github.service.js";
import { GithubResume } from "../models/GithubResume.js";
import { MockInterview } from "../models/MockInterview.js";
import { GithubAnalysis } from "../models/GithubAnalysis.js";
import { Resume } from "../models/Resume.js";
import { User } from "../models/User.js";

export async function generateGithubResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { username } = req.body;
    
    const repos = (await fetchGitHubRepos(username, { perPage: 30, sort: "pushed" })).filter(r => !r.fork);
    const topReposDeep = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10)
      .map((r) => ({
        name: r.name,
        desc: r.description ? r.description.slice(0, 500) : "",
        lang: r.language,
        topics: r.topics || [],
        stars: r.stargazers_count,
        watchers: r.watchers_count,
      }));

    const langCounts: Record<string, number> = {};
    for (const r of repos) {
      if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1;
    }

    const rawAi = await callAiJson<any>({
      messages: [
        {
          role: "system",
          content: "You are an elite Tech Recruiter & AI Resume writer. Analyze GitHub repos (names, descriptions, topics) to deeply infer tech stack, specialization, complexity, architecture skills. Generate a professional JSON output. Add developer badges (e.g., 'React Expert').",
        },
        {
          role: "user",
          content: `Generate a resume and insights for GitHub user: ${username}\nTop Languages: ${JSON.stringify(langCounts)}\nTop Repositories & Topics: ${JSON.stringify(topReposDeep)}\n\nInfer framework usage, specialization, and complexity from the repo descriptions and topics.`,
        },
      ],
      schema: {
        name: "github_resume",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            developerType: { type: "string" },
            specialization: { type: "string" },
            experienceLevel: { type: "string" },
            professionalSummary: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: { name: { type: "string" }, description: { type: "string" }, tech: { type: "string" } },
                required: ["name", "description", "tech"],
              },
            },
            achievements: { type: "array", items: { type: "string" } },
            githubHighlights: { type: "array", items: { type: "string" } },
            recommendedRoles: { type: "array", items: { type: "string" } },
            recommendedProjects: { type: "array", items: { type: "string" } },
            recommendedCertifications: { type: "array", items: { type: "string" } },
            missingSkills: { type: "array", items: { type: "string" } },
            atsScore: { type: "integer" },
            completenessScore: { type: "integer" },
            badges: { type: "array", items: { type: "string" } },
          },
          required: [
            "developerType", "specialization", "experienceLevel", "professionalSummary",
            "skills", "projects", "achievements", "githubHighlights", "recommendedRoles",
            "recommendedProjects", "recommendedCertifications", "missingSkills",
            "atsScore", "completenessScore", "badges",
          ],
        },
      },
      log: { endpoint: "generateGithubResume", userId },
    });

    const profileStrength = Math.round(
      Math.min(100, repos.length * 2 + topReposDeep.reduce((a, b) => a + b.stars, 0) * 5 + rawAi.completenessScore * 0.3)
    );

    const resumeData = {
      fullName: username,
      title: rawAi.developerType,
      email: "", phone: "", location: "",
      summary: rawAi.professionalSummary,
      skills: rawAi.skills,
      experience: [], education: [],
      projects: rawAi.projects,
    };

    const insights = {
      recommendedRoles: rawAi.recommendedRoles,
      recommendedProjects: rawAi.recommendedProjects,
      recommendedCertifications: rawAi.recommendedCertifications,
      missingSkills: rawAi.missingSkills,
      atsScore: rawAi.atsScore,
      completenessScore: rawAi.completenessScore,
      achievements: rawAi.achievements,
      githubHighlights: rawAi.githubHighlights,
      specialization: rawAi.specialization,
      experienceLevel: rawAi.experienceLevel,
    };

    const inserted = await GithubResume.create({
      userId,
      githubUsername: username,
      developerType: rawAi.developerType,
      profileStrength,
      badges: rawAi.badges,
      resumeData,
      insights,
    });

    res.json({
      id: inserted._id,
      profileStrength,
      resumeData,
      insights,
      developerType: rawAi.developerType,
      badges: rawAi.badges,
    });
  } catch (error) {
    next(error);
  }
}

export async function generateMockInterviewQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { jobRole, experienceLevel, interviewType } = req.body;
    
    const [ghRes, resumeRes] = await Promise.all([
      GithubAnalysis.findOne({ userId }).sort({ createdAt: -1 }),
      Resume.findOne({ userId }).sort({ updatedAt: -1 })
    ]);
    
    const promptContext = `
Role: ${jobRole}
Level: ${experienceLevel}
Type: ${interviewType}
Candidate GitHub Summary: ${ghRes?.summary || "N/A"}
Candidate Resume Skills: ${JSON.stringify((resumeRes?.content as any)?.skills || [])}
`;

    const rawAi = await callAiJson<any>({
      messages: [
        { role: "system", content: "You are an expert technical interviewer. Generate 5 highly tailored interview questions based on the candidate's profile, requested role, and interview type. Include expected answers." },
        { role: "user", content: promptContext },
      ],
      schema: {
        name: "mock_interview_questions",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: { question: { type: "string" }, expected_answer: { type: "string" }, type: { type: "string" } },
                required: ["question", "expected_answer", "type"],
              },
            },
          },
          required: ["questions"],
        },
      },
      log: { endpoint: "generateMockInterviewQuestions", userId },
    });
    
    const inserted = await MockInterview.create({
      userId,
      jobRole,
      experienceLevel,
      interviewType,
      questions: rawAi.questions,
    });
    
    res.json(inserted);
  } catch (error) {
    next(error);
  }
}

export async function evaluateMockInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { interviewId, answers } = req.body;
    
    const interview = await MockInterview.findOne({ _id: interviewId, userId });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    
    const qs = interview.questions;
    const qas = qs.map((q, i) => ({
      question: q.question,
      expected: q.expectedAnswer || (q as any).expected_answer,
      user_answer: answers[i] || "",
    }));
    
    const rawAi = await callAiJson<any>({
      messages: [
        { role: "system", content: "You are an expert interviewer evaluating a candidate's answers. Grade strictly but fairly." },
        { role: "user", content: `Evaluate these answers: ${JSON.stringify(qas)}\n\nGenerate detailed feedback and the required scores.` },
      ],
      schema: {
        name: "mock_interview_evaluation",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            overallScore: { type: "integer" },
            technicalScore: { type: "integer" },
            communicationScore: { type: "integer" },
            problemSolvingScore: { type: "integer" },
            confidenceScore: { type: "integer" },
            completenessScore: { type: "integer" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            recommendedTopics: { type: "array", items: { type: "string" } },
            nextSteps: { type: "array", items: { type: "string" } },
            evaluations: {
              type: "array",
              items: {
                type: "object",
                properties: { feedback: { type: "string" }, score: { type: "integer" } },
                required: ["feedback", "score"],
              },
            },
          },
          required: [
            "overallScore", "technicalScore", "communicationScore", "problemSolvingScore",
            "confidenceScore", "completenessScore", "strengths", "weaknesses", "improvements",
            "recommendedTopics", "nextSteps", "evaluations",
          ],
        },
      },
      log: { endpoint: "evaluateMockInterview", userId },
    });
    
    const detailedAnswers = qas.map((qa, i) => ({
      questionIndex: i,
      userAnswer: qa.user_answer,
      aiFeedback: rawAi.evaluations[i]?.feedback || "No feedback generated.",
      aiScore: rawAi.evaluations[i]?.score || 0,
    }));
    
    const report = {
      overallScore: rawAi.overallScore,
      technicalScore: rawAi.technicalScore,
      communicationScore: rawAi.communicationScore,
      problemSolvingScore: rawAi.problemSolvingScore,
      confidenceScore: rawAi.confidenceScore,
      completenessScore: rawAi.completenessScore,
      strengths: rawAi.strengths,
      weaknesses: rawAi.weaknesses,
      improvements: rawAi.improvements,
      recommendedTopics: rawAi.recommendedTopics,
      nextSteps: rawAi.nextSteps,
    };
    
    interview.answers = detailedAnswers;
    interview.overallScore = rawAi.overallScore;
    interview.report = report;
    interview.status = "completed";
    await interview.save();
    
    const profile = await User.findById(userId);
    if (profile) {
      const badges = [...(profile.badges || [])];
      if (rawAi.overallScore >= 50 && !badges.includes("Interview Beginner")) badges.push("Interview Beginner");
      if (rawAi.overallScore >= 75 && !badges.includes("Interview Ready")) badges.push("Interview Ready");
      if (rawAi.communicationScore >= 85 && !badges.includes("Strong Communicator")) badges.push("Strong Communicator");
      if (rawAi.problemSolvingScore >= 85 && !badges.includes("Problem Solver")) badges.push("Problem Solver");
      if (rawAi.completenessScore >= 85 && !badges.includes("Industry Ready")) badges.push("Industry Ready");

      const newTotal = (profile.totalInterviews || 0) + 1;
      const newStreak = (profile.interviewStreak || 0) + 1;
      const newBest = Math.max(profile.bestInterviewScore || 0, rawAi.overallScore);

      profile.badges = badges;
      profile.totalInterviews = newTotal;
      profile.interviewStreak = newStreak;
      profile.bestInterviewScore = newBest;
      await profile.save();
    }
    
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
}
