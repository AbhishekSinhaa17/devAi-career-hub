import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { getGlobalAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

// Only admins can access global analytics
router.use(requireAdmin);

router.get("/global", getGlobalAnalytics);

export default router;
