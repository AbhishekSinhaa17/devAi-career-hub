import { Request, Response, NextFunction } from "express";
import { GithubResume } from "../models/GithubResume.js";
import { PortfolioDeployment } from "../models/PortfolioDeployment.js";
import { generatePortfolioFiles } from "../utils/vercel.templates.js";
import mongoose from "mongoose";

const VERCEL_API_URL = "https://api.vercel.com";

function getVercelToken() {
  const token = process.env.DEPLOY_VERCEL_TOKEN;
  if (!token) throw new Error("DEPLOY_VERCEL_TOKEN is missing in environment variables.");
  return token;
}

export async function triggerVercelDeployment(req: Request, res: Response, next: NextFunction) {
  try {
    const { portfolioId } = req.body;
    const userId = req.user!.id;

    const portfolioData = await GithubResume.findById(portfolioId).lean();

    if (!portfolioData) {
      return next({ status: 404, code: "NOT_FOUND", message: "Failed to load portfolio data for deployment." });
    }

    const resumeData = {
      ...(typeof portfolioData.resumeData === "object" && portfolioData.resumeData !== null
        ? portfolioData.resumeData
        : {}),
      github_username: portfolioData.githubUsername,
    };

    const files = generatePortfolioFiles(resumeData);
    const projectName = `portfolio-${portfolioData.githubUsername.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    const token = getVercelToken();
    const response = await fetch(`${VERCEL_API_URL}/v13/deployments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        projectSettings: {
          framework: "vite",
        },
        files: files,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Vercel Deployment Error:", errText);
      throw new Error(`Vercel API Error: ${response.statusText}. Please check logs.`);
    }

    const vercelData = await response.json();

    const deploymentData = await PortfolioDeployment.create({
      userId: new mongoose.Types.ObjectId(userId),
      portfolioId: new mongoose.Types.ObjectId(portfolioId),
      provider: "Vercel",
      deploymentId: vercelData.id,
      status: "building",
      deploymentUrl: `https://${vercelData.url}`,
    });

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

export async function checkVercelStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const deploymentData = await PortfolioDeployment.findOne({ _id: id, userId });

    if (!deploymentData) {
      return next({ status: 404, code: "NOT_FOUND", message: "Deployment not found" });
    }

    if (deploymentData.status === "building" && deploymentData.deploymentId) {
      try {
        const token = getVercelToken();
        const response = await fetch(
          `${VERCEL_API_URL}/v13/deployments/${deploymentData.deploymentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const vData = await response.json();
          let newStatus = "building";

          if (vData.readyState === "READY" || vData.readyState === "READY_FOR_DEPLOY") {
            newStatus = "success";
          } else if (vData.readyState === "ERROR" || vData.readyState === "CANCELED") {
            newStatus = "failed";
          }

          if (newStatus !== "building") {
            const updates: any = {
              status: newStatus,
              updatedAt: new Date(),
            };
            
            if (newStatus === "success") {
              updates.deployedAt = new Date();
            }

            if (vData.buildingAt && vData.readyAt) {
              updates.buildDuration = vData.readyAt - vData.buildingAt;
            }

            const updated = await PortfolioDeployment.findByIdAndUpdate(
              deploymentData._id,
              updates,
              { new: true }
            );

            if (updated) {
              const mappedData = {
                ...updated.toJSON(),
                id: updated._id,
                user_id: updated.userId,
                portfolio_id: updated.portfolioId,
                deployment_id: updated.deploymentId,
                deployment_url: updated.deploymentUrl,
                created_at: updated.createdAt,
                updated_at: updated.updatedAt,
                build_duration: updated.buildDuration,
                deployed_at: updated.deployedAt
              };
              return res.json({ status: "success", data: mappedData });
            }
          }
        }
      } catch (err) {
        console.error("Failed to check Vercel status:", err);
      }
    }

    const mappedData = {
      ...deploymentData.toJSON(),
      id: deploymentData._id,
      user_id: deploymentData.userId,
      portfolio_id: deploymentData.portfolioId,
      deployment_id: deploymentData.deploymentId,
      deployment_url: deploymentData.deploymentUrl,
      created_at: deploymentData.createdAt,
      updated_at: deploymentData.updatedAt,
      build_duration: deploymentData.buildDuration,
      deployed_at: deploymentData.deployedAt
    };

    res.json({ status: "success", data: mappedData });
  } catch (error) {
    next(error);
  }
}
