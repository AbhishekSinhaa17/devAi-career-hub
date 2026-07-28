import { Request, Response, NextFunction } from "express";
import pino from "pino";

const logger = pino();

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  
  if (status >= 500) {
    logger.error({ err, path: req.path }, "Unhandled Internal Server Error");
  } else {
    logger.info({ err, path: req.path }, "Client Error");
  }

  res.status(status).json({
    status: "error",
    code: err.code || "INTERNAL_ERROR",
    message: err.message || "Something went wrong",
    ...(err.errors ? { errors: err.errors } : {}),
    ...(err.retryAfterSeconds ? { retryAfterSeconds: err.retryAfterSeconds } : {})
  });
}
