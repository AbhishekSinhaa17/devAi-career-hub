import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { 
  getContextSnapshot, 
  startConversation, 
  getHistory, 
  getMessages, 
  sendMessage, 
  deleteConversation 
} from "../controllers/copilot.controller.js";
import { apiLimiterMinuteIp, apiLimiterDailyAuth } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/snapshot", getContextSnapshot);
router.post("/conversation", startConversation);
router.get("/conversations", getHistory);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", apiLimiterMinuteIp, apiLimiterDailyAuth, sendMessage);
router.delete("/conversations/:conversationId", deleteConversation);

export default router;
