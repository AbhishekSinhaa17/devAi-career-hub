import { Request, Response, NextFunction } from "express";
import { PortfolioDeployment } from "../models/PortfolioDeployment.js";
import { GithubResume } from "../models/GithubResume.js";

function generateDeploymentId() {
  return "dpl_" + Math.random().toString(36).substring(2, 15);
}

function generateDeploymentUrl(username: string, provider: string, portfolioId: string) {
  return `/p/${portfolioId}`;
}

export async function startDeployment(req: Request, res: Response, next: NextFunction) {
  try {
    const { portfolioId, provider, username } = req.body;
    const userId = req.user!.id;

    const deploymentId = generateDeploymentId();

    const deploymentData = await PortfolioDeployment.create({
      userId,
      portfolioId,
      provider,
      deploymentId,
      status: "building",
    });

    // Simulate background deployment processing
    setTimeout(async () => {
      try {
        const liveUrl = generateDeploymentUrl(username, provider, portfolioId);
        await PortfolioDeployment.findByIdAndUpdate(deploymentData._id, {
          status: "success",
          deploymentUrl: liveUrl,
          updatedAt: new Date(),
        });
      } catch (err) {
        console.error("Background deployment error", err);
      }
    }, 12000);

    const mappedData = {
      ...deploymentData.toJSON(),
      id: deploymentData._id,
      user_id: deploymentData.userId,
      portfolio_id: deploymentData.portfolioId,
      deployment_id: deploymentData.deploymentId,
      deployment_url: deploymentData.deploymentUrl,
      created_at: deploymentData.createdAt,
      updated_at: deploymentData.updatedAt
    };

    res.status(201).json({ status: "success", data: mappedData });
  } catch (error) {
    next(error);
  }
}

export async function getDeploymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const deploymentData = await PortfolioDeployment.findOne({ _id: id, userId });
    
    if (!deploymentData) {
      return next({ status: 404, code: "NOT_FOUND", message: "Deployment not found" });
    }

    const mappedData = {
      ...deploymentData.toJSON(),
      id: deploymentData._id,
      user_id: deploymentData.userId,
      portfolio_id: deploymentData.portfolioId,
      deployment_id: deploymentData.deploymentId,
      deployment_url: deploymentData.deploymentUrl,
      created_at: deploymentData.createdAt,
      updated_at: deploymentData.updatedAt
    };

    res.json({ status: "success", data: mappedData });
  } catch (error) {
    next(error);
  }
}

export async function getDeploymentsByPortfolio(req: Request, res: Response, next: NextFunction) {
  try {
    const { portfolioId } = req.params;
    const userId = req.user!.id;

    const deploymentsData = await PortfolioDeployment.find({ portfolioId, userId }).sort({ createdAt: -1 });

    const mappedData = deploymentsData.map(d => ({
      ...d.toJSON(),
      id: d._id,
      user_id: d.userId,
      portfolio_id: d.portfolioId,
      deployment_id: d.deploymentId,
      deployment_url: d.deploymentUrl,
      created_at: d.createdAt,
      updated_at: d.updatedAt
    }));

    res.json({ status: "success", data: mappedData });
  } catch (error) {
    next(error);
  }
}

export async function getPublicPortfolio(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const portfolioData = await GithubResume.findOne({ _id: id, isPublic: true }).lean();
    
    if (!portfolioData) {
      return next({ status: 404, code: "NOT_FOUND", message: "Portfolio not found or is not public" });
    }

    const safeData: any = {
      ...portfolioData,
      insights: undefined,
    };

    if (safeData.resumeData && typeof safeData.resumeData === "object") {
      const resume = safeData.resumeData as any;
      if (resume.personalInfo) {
        resume.personalInfo.email = undefined;
        resume.personalInfo.phone = undefined;
      }
    }

    const mappedData = {
      ...safeData,
      id: safeData._id,
      user_id: safeData.userId,
      github_username: safeData.githubUsername,
      developer_type: safeData.developerType,
      profile_strength: safeData.profileStrength,
      resume_data: safeData.resumeData,
      is_public: safeData.isPublic,
      created_at: safeData.createdAt,
      updated_at: safeData.updatedAt
    };

    res.json({ status: "success", data: mappedData });
  } catch (error) {
    next(error);
  }
}

export async function setPortfolioVisibility(req: Request, res: Response, next: NextFunction) {
  try {
    const { portfolioId, isPublic } = req.body;
    const userId = req.user!.id;

    const result = await GithubResume.findOneAndUpdate(
      { _id: portfolioId, userId },
      { isPublic },
      { new: true }
    );

    if (!result) {
      return next({ status: 404, code: "NOT_FOUND", message: "Failed to update visibility or portfolio not found" });
    }

    res.json({ status: "success", data: { success: true } });
  } catch (error) {
    next(error);
  }
}
