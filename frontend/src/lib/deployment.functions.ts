import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";
import { serverApiClient } from "@/lib/api-client";

export const startDeployment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        portfolioId: z.string(),
        provider: z.string(),
        username: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.post("/deployment/start", input, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const getDeploymentStatus = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.get(`/deployment/status/${input.id}`, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const getDeploymentsByPortfolio = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ portfolioId: z.string() }).parse(d))
  .handler(async ({ data: input, context }) => {
    try {
      const { data } = await serverApiClient.get(`/deployment/portfolio/${input.portfolioId}`, {
        headers: { Authorization: `Bearer ${context.token}` }
      });
      return data.data;
    } catch (e) {
      return [];
    }
  });

export const getPublicPortfolio = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data: input }) => {
    const { data } = await serverApiClient.get(`/deployment/public/${input.id}`);
    return data.data;
  });

export const setPortfolioVisibility = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z.object({ portfolioId: z.string(), isPublic: z.boolean() }).parse(d),
  )
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.post("/deployment/visibility", input, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });
