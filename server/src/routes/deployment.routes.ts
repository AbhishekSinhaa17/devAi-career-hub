import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  startDeployment,
  getDeploymentStatus,
  getDeploymentsByPortfolio,
  getPublicPortfolio,
  setPortfolioVisibility,
} from "../controllers/deployment.controller.js";

const router = Router();

const startSchema = z.object({
  portfolioId: z.string(),
  provider: z.string(),
  username: z.string(),
});

const statusSchema = z.object({
  id: z.string(),
});

const byPortfolioSchema = z.object({
  portfolioId: z.string(),
});

const publicPortfolioSchema = z.object({
  id: z.string(),
});

const visibilitySchema = z.object({
  portfolioId: z.string(),
  isPublic: z.boolean(),
});

router.post("/start", requireAuth, validate(startSchema), startDeployment);
router.get("/status/:id", requireAuth, validate(statusSchema, "params"), getDeploymentStatus);
router.get("/portfolio/:portfolioId", requireAuth, validate(byPortfolioSchema, "params"), getDeploymentsByPortfolio);
router.get("/public/:id", validate(publicPortfolioSchema, "params"), getPublicPortfolio);
router.post("/visibility", requireAuth, validate(visibilitySchema), setPortfolioVisibility);

export default router;
