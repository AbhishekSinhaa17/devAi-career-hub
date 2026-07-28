import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";
import { serverApiClient } from "@/lib/api-client";

export const triggerVercelDeployment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        portfolioId: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.post("/vercel/deploy", input, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const checkVercelStatus = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.get(`/vercel/status/${input.id}`, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });
