import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function generateDeploymentId() {
  return "dpl_" + Math.random().toString(36).substring(2, 15);
}

function generateDeploymentUrl(username: string, provider: string, portfolioId: string) {
  return `/p/${portfolioId}`;
}

export const startDeployment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        portfolioId: z.string().uuid(),
        provider: z.string(),
        username: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const deploymentId = generateDeploymentId();

    const { data: deploymentData, error } = await context.supabase
      .from("portfolio_deployments")
      .insert({
        user_id: context.userId,
        portfolio_id: data.portfolioId,
        provider: data.provider,
        deployment_id: deploymentId,
        status: "building",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      throw new Error("Failed to start deployment");
    }

    setTimeout(async () => {
      try {
        const liveUrl = generateDeploymentUrl(data.username, data.provider, data.portfolioId);

        await context.supabase
          .from("portfolio_deployments")
          .update({
            status: "success",
            deployment_url: liveUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", deploymentData.id);
      } catch (err) {
        const { logger } = await import("./logger.server");
        logger.error({ err, userId: context.userId }, "Background deployment error");
      }
    }, 12000);

    return deploymentData;
  });

export const getDeploymentStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: deploymentData, error } = await context.supabase
      .from("portfolio_deployments")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();

    if (error) {
      throw new Error("Deployment not found");
    }

    return deploymentData;
  });

export const getDeploymentsByPortfolio = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ portfolioId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: deploymentsData, error } = await context.supabase
      .from("portfolio_deployments")
      .select("*")
      .eq("portfolio_id", data.portfolioId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return deploymentsData;
  });

export const getPublicPortfolio = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: portfolioData, error } = await supabaseAdmin
      .from("github_resumes")
      .select("*")
      .eq("id", data.id)
      .eq("is_public", true)
      .single();

    if (error) throw new Error("Portfolio not found or is not public");

    const safeData = {
      ...portfolioData,
      insights: undefined,
    };

    if (safeData.resume_data && typeof safeData.resume_data === "object") {
      const resume = safeData.resume_data as any;
      if (resume.personalInfo) {
        resume.personalInfo.email = undefined;
        resume.personalInfo.phone = undefined;
      }
    }

    return safeData;
  });

export const setPortfolioVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ portfolioId: z.string().uuid(), isPublic: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("github_resumes")
      .update({ is_public: data.isPublic })
      .eq("id", data.portfolioId)
      .eq("user_id", context.userId);

    if (error) throw new Error("Failed to update visibility");
    return { success: true };
  });
