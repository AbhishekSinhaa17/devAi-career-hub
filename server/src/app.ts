import express from "express";
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

// We will mount routers and the global error handler here later
const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/deployment", deploymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/health-score", healthRoutes);
app.use("/api/copilot", copilotRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/vercel", vercelRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ status: "error", code: "NOT_FOUND", message: "Route not found" });
});

// Global Error Handler
app.use(errorHandler);

export default app;
