import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate.middleware.js";
import { register, login, requestPasswordReset, resetPassword, getMe, googleAuth, googleAuthCallback, exchangeGoogleCode } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/request-reset", validate(requestResetSchema), requestPasswordReset);
router.post("/reset-password", validate(resetSchema), resetPassword);
router.get("/me", requireAuth, getMe);

// Google OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);
router.post("/google/exchange", exchangeGoogleCode);

export default router;
