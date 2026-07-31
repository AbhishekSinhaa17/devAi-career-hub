import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getHealthScoreHistory, generateHealthScore } from "../controllers/health.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/history", getHealthScoreHistory);
router.post("/generate", generateHealthScore);

export default router;
