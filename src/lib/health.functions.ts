import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAiJson } from "./ai-gateway.server";

export const getHealthScoreHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({}).parse(d ?? {}))
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("developer_health_scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  });

export const generateHealthScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({}).parse(d ?? {}))
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Fetch highest scores for each feature
    const [gh, res, mock, job, port] = await Promise.all([
      supabase.from("github_analyses").select("score").eq("user_id", userId).order("score", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("resumes").select("score").eq("user_id", userId).order("score", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("mock_interviews").select("overall_score").eq("user_id", userId).order("overall_score", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("job_matches").select("hiring_probability").eq("user_id", userId).order("hiring_probability", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("github_resumes").select("profile_strength").eq("user_id", userId).order("profile_strength", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const github_score = gh.data?.score || 0;
    const resume_score = res.data?.score || 0;
    const interview_score = mock.data?.overall_score || 0;
    const job_match_score = job.data?.hiring_probability || 0;
    const portfolio_score = port.data?.profile_strength || 0;

    // Weightage
    const overall_score = Math.round(
      (github_score * 0.25) +
      (resume_score * 0.20) +
      (interview_score * 0.25) +
      (job_match_score * 0.20) +
      (portfolio_score * 0.10)
    );

    // AI Generation
    const prompt = `
      Analyze this developer's health scores and provide strengths, weaknesses, and recommendations.
      GitHub Score: ${github_score}/100 (Weight 25%)
      Resume Score: ${resume_score}/100 (Weight 20%)
      Interview Score: ${interview_score}/100 (Weight 25%)
      Job Match Score: ${job_match_score}/100 (Weight 20%)
      Portfolio Score: ${portfolio_score}/100 (Weight 10%)
      Overall Career Readiness Score: ${overall_score}/100
      
      Respond with exactly 3 to 5 concise points for strengths, 3 to 5 concise points for weaknesses, and 3 to 5 actionable recommendations.
      Format as JSON: { "strengths": string[], "weaknesses": string[], "recommendations": string[] }
    `;

    const aiRes = await callAiJson<{ strengths: string[]; weaknesses: string[]; recommendations: string[] }>({
      messages: [{ role: "user", content: prompt }],
      log: { endpoint: "/api/ai/health", userId },
      userId,
    });

    const newScore = {
      user_id: userId,
      github_score,
      resume_score,
      interview_score,
      job_match_score,
      portfolio_score,
      overall_score,
      strengths: aiRes.strengths,
      weaknesses: aiRes.weaknesses,
      recommendations: aiRes.recommendations,
    };

    const { data: inserted, error } = await supabase
      .from("developer_health_scores")
      .insert(newScore)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return inserted;
  });
