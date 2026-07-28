import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";
import { serverApiClient } from "@/lib/api-client";

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    try {
      const { data } = await serverApiClient.get("/admin/is-admin", {
        headers: { Authorization: `Bearer ${context.token}` }
      });
      return data.data;
    } catch (e) {
      return { isAdmin: false };
    }
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data } = await serverApiClient.get("/admin/overview", {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data } = await serverApiClient.get("/admin/users", {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const listAdminAiRequests = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data } = await serverApiClient.get("/admin/ai-requests", {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const setUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) => 
    z.object({ userId: z.string(), makeAdmin: z.boolean() }).parse(d)
  )
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.post("/admin/set-admin", input, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const getApiUsageAnalytics = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((d: unknown) => {
    const obj = (d ?? {}) as { days?: number; startDate?: string; endDate?: string };
    const days = Math.min(Math.max(Number(obj.days ?? 30), 1), 365);
    const startDate = obj.startDate && /^\d{4}-\d{2}-\d{2}$/.test(obj.startDate) ? obj.startDate : undefined;
    const endDate = obj.endDate && /^\d{4}-\d{2}-\d{2}$/.test(obj.endDate) ? obj.endDate : undefined;
    return { days, startDate, endDate };
  })
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.get("/admin/api-usage", {
      params: input,
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });
