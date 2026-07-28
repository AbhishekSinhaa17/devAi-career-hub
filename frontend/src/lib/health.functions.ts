import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";
import { serverApiClient } from "@/lib/api-client";

export const getHealthScoreHistory = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({}).parse(d ?? {}))
  .handler(async ({ context }) => {
    const { data } = await serverApiClient.get("/health-score/history", {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data; // backend returns { status: "success", data: [...] }
  });

export const generateHealthScore = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({}).parse(d ?? {}))
  .handler(async ({ context }) => {
    const { data } = await serverApiClient.post("/health-score/generate", {}, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data; // backend returns { status: "success", data: {...} }
  });
