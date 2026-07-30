import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "node:http";
import app from "./app.js";
import pino from "pino";

dotenv.config();

const logger = pino();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.error("MONGO_URI is missing in environment variables.");
  process.exit(1);
}

// Exported so middleware can check if the DB is ready before handling requests
export let dbReady = false;

// ─── Change #1: Mongoose connection pooling ──────────────────────────
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI!, {
      maxPoolSize: 5,             // max concurrent connections (free-tier friendly)
      minPoolSize: 1,             // keep at least 1 warm connection
      socketTimeoutMS: 45_000,    // close sockets after 45s of inactivity
      serverSelectionTimeoutMS: 10_000, // fail fast if no server found in 10s
    });
    dbReady = true;
    logger.info("Connected to MongoDB successfully");
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    // Don't exit — the server stays up so health checks pass and
    // the DB-readiness middleware will return 503 on DB-dependent routes.
  }
}

// ─── Change #4: Keep-alive self-ping (prevents Render spin-down) ─────
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

function startKeepAlive() {
  const enabled = process.env.ENABLE_KEEP_ALIVE?.toLowerCase() === "true";
  if (!enabled) {
    logger.info("Keep-alive cron is DISABLED (set ENABLE_KEEP_ALIVE=true to enable)");
    return;
  }

  const FOURTEEN_MINUTES = 14 * 60 * 1000;
  const selfUrl = `http://localhost:${PORT}/api/health`;

  keepAliveInterval = setInterval(() => {
    http
      .get(selfUrl, (res) => {
        logger.debug({ statusCode: res.statusCode }, "Keep-alive ping sent");
        res.resume(); // drain response to free memory
      })
      .on("error", (err) => {
        logger.warn({ err }, "Keep-alive ping failed");
      });
  }, FOURTEEN_MINUTES);

  // Don't let the interval keep the process alive during shutdown
  keepAliveInterval.unref();
  logger.info("Keep-alive cron ENABLED — pinging /api/health every 14 minutes");
}

// ─── Change #3: Graceful shutdown ────────────────────────────────────
function setupGracefulShutdown(server: http.Server) {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);

    // Stop accepting new connections
    server.close(() => {
      logger.info("HTTP server closed");
    });

    // Clear keep-alive interval
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
    }

    // Close mongoose connection
    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
    } catch (err) {
      logger.error({ err }, "Error closing MongoDB connection");
    }

    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

// ─── Start ───────────────────────────────────────────────────────────
function startServer() {
  // 1. Start the HTTP listener FIRST so Render's health-check probe
  //    gets a response immediately, even during a cold start.
  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);

    // 2. Connect to MongoDB AFTER the listener is up (non-blocking).
    connectToDatabase();

    // 3. Start keep-alive cron if enabled.
    startKeepAlive();
  });

  // 4. Wire up graceful shutdown handlers.
  setupGracefulShutdown(server);
}

startServer();

