import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generatePortfolioFiles } from "./vercel.templates";

const VERCEL_API_URL = "https://api.vercel.com";

function getVercelToken() {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN is missing in environment variables.");
  return token;
}

export const triggerVercelDeployment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      portfolioId: z.string().uuid(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    // 1. Fetch the user's actual portfolio data
    const { data: portfolioData, error: portfolioError } = await context.supabase
      .from("github_resumes")
      .select("*")
      .eq("id", data.portfolioId)
      .single();

    if (portfolioError || !portfolioData) {
      throw new Error("Failed to load portfolio data for deployment.");
    }

    // Combine username for template
    const resumeData = {
      ...portfolioData.resume_data,
      github_username: portfolioData.github_username,
    };

    // 2. Generate actual React+Vite files dynamically
    const files = generatePortfolioFiles(resumeData);
    const projectName = \`portfolio-\${portfolioData.github_username.toLowerCase().replace(/[^a-z0-9]/g, "-")}\`;

    // 3. Trigger actual Vercel deployment
    const token = getVercelToken();
    const response = await fetch(\`\${VERCEL_API_URL}/v13/deployments\`, {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${token}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        projectSettings: {
          framework: "vite",
        },
        files: files,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Vercel Deployment Error:", errText);
      throw new Error(\`Vercel API Error: \${response.statusText}. Please check logs.\`);
    }

    const vercelData = await response.json();

    // 4. Record the real deployment in Supabase
    const { data: deploymentData, error: dbError } = await context.supabase
      .from("portfolio_deployments")
      .insert({
        user_id: context.userId,
        portfolio_id: data.portfolioId,
        provider: "Vercel",
        deployment_id: vercelData.id,
        status: "building",
        deployment_url: \`https://\${vercelData.url}\`,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error("Failed to record deployment in database.");
    }

    return deploymentData;
  });

export const checkVercelStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    // 1. Get deployment record
    const { data: deploymentData, error: dbError } = await context.supabase
      .from("portfolio_deployments")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .single();

    if (dbError || !deploymentData) {
      throw new Error("Deployment not found");
    }

    // Only ping Vercel if it's still building
    if (deploymentData.status === "building" && deploymentData.deployment_id) {
      try {
        const token = getVercelToken();
        const response = await fetch(\`\${VERCEL_API_URL}/v13/deployments/\${deploymentData.deployment_id}\`, {
          headers: {
            Authorization: \`Bearer \${token}\`,
          },
        });

        if (response.ok) {
          const vData = await response.json();
          let newStatus = "building";
          
          if (vData.readyState === "READY") {
            try {
              const liveUrl = \`https://\${vData.url}\`;
              const checkRes = await fetch(liveUrl);
              if (checkRes.ok) {
                newStatus = "success";
              }
              // If not ok or errors out, remain 'building' until DNS propagates and URL is reachable
            } catch (err) {
              // Ignore fetch errors during propagation
            }
          }
          else if (vData.readyState === "ERROR" || vData.readyState === "CANCELED") newStatus = "failed";

          // If status changed, update DB
          if (newStatus !== "building") {
            const updates: any = {
              status: newStatus,
              updated_at: new Date().toISOString(),
            };
            if (newStatus === "success") {
              updates.deployed_at = new Date().toISOString();
            }
            // Capture building duration if available
            if (vData.buildingAt && vData.readyAt) {
              updates.build_duration = vData.readyAt - vData.buildingAt;
            }

            const { data: updated } = await context.supabase
              .from("portfolio_deployments")
              .update(updates)
              .eq("id", deploymentData.id)
              .select()
              .single();
              
            return updated || deploymentData;
          }
        }
      } catch (err) {
        console.error("Failed to check Vercel status:", err);
      }
    }

    return deploymentData;
  });
