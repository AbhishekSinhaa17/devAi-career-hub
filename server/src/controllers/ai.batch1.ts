import { Request, Response, NextFunction } from "express";
import { callAiJson } from "../services/ai.service.js";
import { CodeReview } from "../models/CodeReview.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { Roadmap } from "../models/Roadmap.js";
import { User } from "../models/User.js";

export async function scoreResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { resume } = req.body;
    const rawAi = await callAiJson<any>({
      messages: [
        { role: "system", content: "You are an ATS resume reviewer. Score resumes on impact, keyword coverage, quantification, clarity, and ATS compatibility." },
        { role: "user", content: `Review this resume and return JSON.\n${JSON.stringify(resume)}` },
      ],
      schema: {
        name: "resume_score",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            suggestions: { type: "array", items: { type: "string" } },
            missingSkills: { type: "array", items: { type: "string" } },
          },
          required: ["score", "suggestions", "missingSkills"],
        },
      },
      log: { endpoint: "scoreResume", userId },
    });
    res.json(rawAi);
  } catch (error) {
    next(error);
  }
}

export async function reviewCode(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { code, language } = req.body;
    const rawAi = await callAiJson<any>({
      messages: [
        { role: "system", content: "You are a senior code reviewer. Be specific, cite line numbers when useful, focus on actionable issues." },
        { role: "user", content: `Review this ${language} code and return JSON:\n\n\`\`\`${language}\n${code}\n\`\`\`` },
      ],
      schema: {
        name: "code_review",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            overall: { type: "string" },
            bugs: { type: "array", items: { type: "string" } },
            security: { type: "array", items: { type: "string" } },
            performance: { type: "array", items: { type: "string" } },
            cleanCode: { type: "array", items: { type: "string" } },
            bestPractices: { type: "array", items: { type: "string" } },
          },
          required: ["overall", "bugs", "security", "performance", "cleanCode", "bestPractices"],
        },
      },
      log: { endpoint: "reviewCode", userId },
    });
    
    await CodeReview.create({
      userId,
      language,
      code,
      feedback: rawAi,
    });
    res.json(rawAi);
  } catch (error) {
    next(error);
  }
}

export async function generateInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { role, category, difficulty, count } = req.body;
    const numQuestions = count || 5;
    const rawAi = await callAiJson<any>({
      messages: [
        { role: "system", content: `You are an expert technical interviewer. Generate ${numQuestions} highly relevant, challenging interview questions based on the role, difficulty, and category. Return ONLY JSON.` },
        { role: "user", content: `Generate ${numQuestions} interview questions for a ${role} focusing on ${category} at ${difficulty} difficulty.` },
      ],
      schema: {
        name: "interview_questions",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                  explanation: { type: "string" },
                },
                required: ["question", "answer", "explanation"],
              },
            },
          },
          required: ["questions"],
        },
      },
      log: { endpoint: "generateInterview", userId },
    });
    
    const session = await InterviewSession.create({
      userId,
      role,
      category,
      questions: rawAi.questions,
    });
    res.json({ id: session._id, ...rawAi });
  } catch (error) {
    next(error);
  }
}

export async function generateRoadmap(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { path, level } = req.body;
    const rawAi = await callAiJson<any>({
      messages: [
        { role: "system", content: "You are an expert career counselor for software engineers. Generate a detailed, step-by-step career roadmap in JSON format." },
        { role: "user", content: `Create a career roadmap for a ${level} aiming to become a ${path}.` },
      ],
      schema: {
        name: "career_roadmap",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            timeline: { type: "string" },
            phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  duration: { type: "string" },
                  skills: { type: "array", items: { type: "string" } },
                  projects: { type: "array", items: { type: "string" } },
                  resources: { type: "array", items: { type: "string" } },
                },
                required: ["title", "duration", "skills", "projects", "resources"],
              },
            },
            certifications: { type: "array", items: { type: "string" } },
          },
          required: ["timeline", "phases", "certifications"],
        },
      },
      log: { endpoint: "generateRoadmap", userId },
    });
    
    await Roadmap.create({
      userId,
      path,
      content: rawAi,
    });
    res.json(rawAi);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const updates = req.body;
    if (updates.github_username) {
      updates.githubUsername = updates.github_username;
      delete updates.github_username;
    }
    const updated = await User.findByIdAndUpdate(userId, updates, { new: true });
    res.json({ success: true, profile: updated });
  } catch (error) {
    next(error);
  }
}
