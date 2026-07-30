import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import deploymentRoutes from "./routes/deployment.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import healthRoutes from "./routes/health.routes.js";
import copilotRoutes from "./routes/copilot.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import vercelRoutes from "./routes/vercel.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { requireDbReady } from "./middlewares/dbReady.middleware.js";

// We will mount routers and the global error handler here later
const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// ─── Change #2: Connection-aware health endpoint ─────────────────────
// NOT behind requireDbReady — must always respond so Render's probe passes
const READY_STATE_MAP: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

app.get("/api/health", (req, res) => {
  const mongoState = mongoose.connection.readyState;
  res.json({
    status: "ok",
    uptime: process.uptime(),
    mongo: {
      state: READY_STATE_MAP[mongoState] ?? "unknown",
      ready: mongoState === 1,
    },
  });
});

// ─── Google OAuth redirect (no DB needed) ────────────────────────────
// The initial /api/auth/google redirect only constructs a URL and
// redirects to Google — it doesn't touch MongoDB, so it can respond
// instantly even during cold-start.
app.get("/api/auth/google", (req, res, next) => {
  // Forward to the auth router; the route handler itself is DB-free
  authRoutes(req, res, next);
});

// ─── DB-dependent routes (gated by requireDbReady) ───────────────────
app.use("/api/auth", requireDbReady, authRoutes);
app.use("/api/upload", requireDbReady, uploadRoutes);
app.use("/api/deployment", requireDbReady, deploymentRoutes);
app.use("/api/ai", requireDbReady, aiRoutes);
app.use("/api/admin", requireDbReady, adminRoutes);
app.use("/api/health-score", requireDbReady, healthRoutes);
app.use("/api/copilot", requireDbReady, copilotRoutes);
app.use("/api/analytics", requireDbReady, analyticsRoutes);
app.use("/api/vercel", requireDbReady, vercelRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Route not found" });
});

// Global Error Handler
app.use(errorHandler);

export default app;

