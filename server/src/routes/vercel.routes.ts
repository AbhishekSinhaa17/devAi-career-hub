import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { triggerVercelDeployment, checkVercelStatus } from "../controllers/vercel.controller.js";

const router = Router();

const triggerSchema = z.object({
  portfolioId: z.string(),
});

const statusSchema = z.object({
  id: z.string(),
});

router.post("/deploy", requireAuth, validate(triggerSchema), triggerVercelDeployment);
router.get("/status/:id", requireAuth, validate(statusSchema, "params"), checkVercelStatus);

export default router;
