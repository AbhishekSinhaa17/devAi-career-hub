import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next({ status: 401, code: "UNAUTHORIZED", message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    req.user = payload;
    next();
  } catch (error) {
    next({ status: 401, code: "UNAUTHORIZED", message: "Token is invalid or expired" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user?.role !== "admin") {
      return next({ status: 403, code: "FORBIDDEN", message: "Admin privileges required" });
    }
    next();
  });
}
