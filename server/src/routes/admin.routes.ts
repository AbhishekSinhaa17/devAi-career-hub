import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import { 
  checkIsAdmin, 
  getAdminOverview, 
  listAdminUsers, 
  listAdminAiRequests, 
  setUserAdmin, 
  getApiUsageAnalytics 
} from "../controllers/admin.controller.js";

const router = Router();

// /is-admin just checks role, so it only requires auth
router.get("/is-admin", requireAuth, checkIsAdmin);

// The rest of the routes require admin privileges
router.use(requireAdmin);

router.get("/overview", getAdminOverview);
router.get("/users", listAdminUsers);
router.get("/ai-requests", listAdminAiRequests);
router.post("/set-admin", setUserAdmin);
router.get("/api-usage", getApiUsageAnalytics);

export default router;
