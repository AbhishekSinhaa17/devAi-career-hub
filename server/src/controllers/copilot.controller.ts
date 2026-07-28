import { Request, Response, NextFunction } from "express";
import { CopilotConversation } from "../models/CopilotConversation.js";
import { CopilotMessage } from "../models/CopilotMessage.js";
import { GithubResume } from "../models/GithubResume.js";
import { Resume } from "../models/Resume.js";
import { JobMatch } from "../models/JobMatch.js";
import { DeveloperHealthScore } from "../models/DeveloperHealthScore.js";
import { MockInterview } from "../models/MockInterview.js";
import { PortfolioDeployment } from "../models/PortfolioDeployment.js";
import { callAi } from "../services/ai.service.js";
import mongoose from "mongoose";

async function fetchContextSnapshotFromDb(userId: string) {
  const objectId = new mongoose.Types.ObjectId(userId);
  const [ghRes, resumeRes, jobMatchRes, scoresRes, mockIntRes, portfolioRes] = await Promise.all([
    GithubResume.findOne({ userId: objectId })
      .select("developerType insights resumeData")
      .sort({ createdAt: -1 })
      .lean(),
    Resume.findOne({ userId: objectId })
      .select("title score aiSuggestions")
      .sort({ updatedAt: -1 })
      .lean(),
    JobMatch.findOne({ userId: objectId })
      .select("jobRole atsScore analysis")
      .sort({ createdAt: -1 })
      .lean(),
    DeveloperHealthScore.findOne({ userId: objectId })
      .select("overallScore")
      .sort({ createdAt: -1 })
      .lean(),
    MockInterview.findOne({ userId: objectId })
      .select("jobRole overallScore feedback")
      .sort({ createdAt: -1 })
      .lean(),
    PortfolioDeployment.findOne({ userId: objectId })
      .select("provider status deploymentUrl")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return {
    github_inferred_profile: ghRes || null,
    latest_resume: resumeRes || null,
    latest_job_match: jobMatchRes || null,
    developer_health_score: scoresRes?.overallScore || null,
    latest_mock_interview: mockIntRes || null,
    portfolio_deployment: portfolioRes || null,
  };
}

export async function getContextSnapshot(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const snapshot = await fetchContextSnapshotFromDb(userId);
    res.json({ status: "success", data: snapshot });
  } catch (error) {
    next(error);
  }
}

export async function startConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { title } = req.body;
    
    const snapshot = await fetchContextSnapshotFromDb(userId);

    const convData = await CopilotConversation.create({
      userId: new mongoose.Types.ObjectId(userId),
      title: title || "Career Discussion",
      contextSnapshot: snapshot,
    });

    res.json({ 
      status: "success", 
      data: {
        ...convData.toJSON(),
        id: convData._id,
        user_id: convData.userId,
        created_at: convData.createdAt,
        context_snapshot: convData.contextSnapshot,
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    
    const data = await CopilotConversation.find({ userId: new mongoose.Types.ObjectId(userId) })
      .select("_id title createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const mappedData = data.map(conv => ({
      id: conv._id,
      title: conv.title,
      created_at: conv.createdAt,
    }));

    res.json({ status: "success", data: mappedData });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    
    const msgs = await CopilotMessage.find({ 
      conversationId: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId)
    })
      .select("_id role content createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const mappedData = msgs.map(m => ({
      id: m._id,
      role: m.role,
      content: m.content,
      created_at: m.createdAt,
    }));

    res.json({ status: "success", data: mappedData });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { message } = req.body;
    
    const conv = await CopilotConversation.findOne({
      _id: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId)
    }).lean();

    if (!conv) {
      return next({ status: 404, code: "NOT_FOUND", message: "Conversation not found" });
    }

    await CopilotMessage.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId),
      role: "user",
      content: message,
    });

    const pastMsgs = await CopilotMessage.find({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId)
    })
      .select("role content createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const history = pastMsgs.reverse().map(m => ({
      role: m.role,
      content: m.content,
    }));

    const systemPrompt = `You are the DevAI Career Copilot, an expert software engineering mentor and career coach.
You have access to the user's latest platform data. Use it to provide highly personalized, specific, and actionable advice.
DO NOT give generic advice if the data provides specific context. Always reference their actual skills, scores, and projects when relevant.

USER DATA SNAPSHOT:
${JSON.stringify(conv.contextSnapshot, null, 2)}
`;

    const aiMessages = [{ role: "system", content: systemPrompt }, ...history];

    const responseText = await callAi({
      messages: aiMessages as any,
      log: { endpoint: "/api/copilot/chat", userId, clientIp: req.ip },
    });

    const savedMsg = await CopilotMessage.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId),
      role: "assistant",
      content: responseText,
    });

    res.json({ 
      status: "success", 
      data: {
        id: savedMsg._id,
        role: savedMsg.role,
        content: savedMsg.content,
        created_at: savedMsg.createdAt,
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    
    const result = await CopilotConversation.deleteOne({
      _id: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return next({ status: 404, code: "NOT_FOUND", message: "Conversation not found" });
    }
    
    // Also delete associated messages
    await CopilotMessage.deleteMany({
      conversationId: new mongoose.Types.ObjectId(conversationId)
    });

    res.json({ status: "success", data: { success: true } });
  } catch (error) {
    next(error);
  }
}
