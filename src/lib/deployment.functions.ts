import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function generateDeploymentId() {
  return "dpl_" + Math.random().toString(36).substring(2, 15);
}

function generateDeploymentUrl(username: string, provider: string, portfolioId: string) {
  // We'll use our internal public portfolio renderer to ensure the user's actual data is displayed,
  // avoiding collisions with external sites that happen to have the same subdomains.
  // In a full production app with Vercel API access, this would be the actual Vercel project URL.
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

    // In a real application, we would call the Vercel/Netlify API here.
    // For this implementation, we will simulate the deployment asynchronously.

    // Simulate a build process taking some time.
    // Note: In an edge/serverless env, background tasks like this might be killed.
    // In a real app we'd use a queue or webhooks. This is just for demonstration.
    setTimeout(async () => {
      try {
        const liveUrl = generateDeploymentUrl(data.username, data.provider, data.portfolioId);
        // We cannot use context.supabase here if the context is destroyed,
        // but for a simple node simulation it might work.
        // Actually, let's just do a sync delay for the simulation if we want it to be robust,
        // or just let it update. We'll try the timeout.
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
    }, 12000); // Simulate a 12-second build process

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

    // Sanitize PII
    const safeData = {
      ...portfolioData,
      insights: undefined, // remove private AI insights
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
