import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

/**
 * Returns 503 Service Unavailable when MongoDB is not yet connected.
 * Used to gate DB-dependent routes during cold-start while the server
 * is already listening but Mongoose is still establishing its connection.
 *
 * Routes that don't touch the DB (e.g. health check, OAuth redirect to
 * Google) should NOT use this middleware.
 */
export function requireDbReady(req: Request, res: Response, next: NextFunction) {
  // mongoose.connection.readyState:
  //   0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  res.status(503)
    .set("Retry-After", "3")
    .json({
      status: "error",
      code: "SERVICE_UNAVAILABLE",
      message: "Database is not ready yet. Please retry shortly.",
      retryAfterSeconds: 3,
    });
}
