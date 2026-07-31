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

const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

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

app.get("/api/auth/google", (req, res, next) => {
  authRoutes(req, res, next);
});

app.use("/api/auth", requireDbReady, authRoutes);
app.use("/api/upload", requireDbReady, uploadRoutes);
app.use("/api/deployment", requireDbReady, deploymentRoutes);
app.use("/api/ai", requireDbReady, aiRoutes);
app.use("/api/admin", requireDbReady, adminRoutes);
app.use("/api/health-score", requireDbReady, healthRoutes);
app.use("/api/copilot", requireDbReady, copilotRoutes);
app.use("/api/analytics", requireDbReady, analyticsRoutes);
app.use("/api/vercel", requireDbReady, vercelRoutes);

app.use((req, res, next) => {
  res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Route not found" });
});

app.use(errorHandler);

export default app;

