import rateLimit, { ipKeyGenerator } from "express-rate-limit";
// @ts-ignore
import MongoStore from "rate-limit-mongo";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

export const apiLimiterMinuteIp = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE_IP || "15", 10),
  standardHeaders: true,
  legacyHeaders: false,
  store: new MongoStore({
    uri: MONGO_URI,
    collectionName: "rateLimitsMinuteIp",
    expireTimeMs: 60 * 1000,
  }),
  handler: (req, res, next) => {
    next({ status: 429, code: "RATE_LIMITED", message: "Too many requests from this IP. Please wait a moment.", retryAfterSeconds: 60 });
  }
});

export const apiLimiterDailyAuth = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: parseInt(process.env.AI_RATE_LIMIT_DAILY_AUTH || "100", 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.user?.id || ipKeyGenerator(req, res) || "unknown";
  },
  store: new MongoStore({
    uri: MONGO_URI,
    collectionName: "rateLimitsDailyAuth",
    expireTimeMs: 24 * 60 * 60 * 1000,
  }),
  handler: (req, res, next) => {
    next({ status: 429, code: "RATE_LIMITED", message: "Daily AI limit reached. Please try again tomorrow.", retryAfterSeconds: 86400 });
  }
});
