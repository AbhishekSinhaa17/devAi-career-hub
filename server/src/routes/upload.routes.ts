import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getPresignedUrl } from "../controllers/upload.controller.js";

const router = Router();

const presignedUrlSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  prefix: z.string().optional().default("uploads"),
});

router.post("/presigned-url", requireAuth, validate(presignedUrlSchema), getPresignedUrl);

export default router;
