import { Request, Response, NextFunction } from "express";
import { callAiJson } from "../services/ai.service.js";
import { Resume } from "../models/Resume.js";

export async function saveResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { id, title, content, score, ai_suggestions } = req.body;
    
    if (id) {
      const updated = await Resume.findOneAndUpdate(
        { _id: id, userId },
        { title, content, score: score || 0, aiSuggestions: ai_suggestions || [] },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "Resume not found" });
      return res.json({ ...updated.toObject(), id: updated._id, ai_suggestions: updated.aiSuggestions });
    } else {
      const inserted = await Resume.create({
        userId,
        title,
        content,
        score: score || 0,
        aiSuggestions: ai_suggestions || []
      });
      return res.json({ ...inserted.toObject(), id: inserted._id, ai_suggestions: inserted.aiSuggestions });
    }
  } catch (error) {
    next(error);
  }
}

export async function getResumes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
    const responsePayload = resumes.map(r => ({
      ...r.toObject(),
      id: r._id,
      ai_suggestions: r.aiSuggestions,
      created_at: r.createdAt,
      updated_at: r.updatedAt
    }));
    console.log("[DEBUG getResumes] First resume id:", responsePayload[0]?.id);
    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
}

export async function deleteResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params; // wait, frontend sends it in body for TanStack? 
    // In Express we will use req.params.id for DELETE
    const targetId = id || req.body.id;
    
    await Resume.deleteOne({ _id: targetId, userId });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function generateCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { resume, jobRole, company } = req.body;
    
    const rawAi = await callAiJson<any>({
      messages: [
        { role: "system", content: "You are an expert career coach writing highly compelling, ATS-friendly cover letters." },
        { role: "user", content: `Write a cover letter for ${jobRole || "a Software Engineer"} position at ${company || "a tech company"}.\nBased on this resume data:\n${JSON.stringify(resume)}\n\nOutput a JSON with the key "coverLetter" containing the full text of the cover letter.` },
      ],
      schema: {
        name: "cover_letter",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: { coverLetter: { type: "string" } },
          required: ["coverLetter"],
        },
      },
      log: { endpoint: "generateCoverLetter", userId },
    });
    
    res.json(rawAi);
  } catch (error) {
    next(error);
  }
}
