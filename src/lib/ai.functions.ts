import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { fetchGitHubUser, fetchGitHubRepos } from "./github-client.server";

// ---------- GitHub Analyzer ----------

export const analyzeGithub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ username: z.string().trim().min(1).max(40) }).parse(d))
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    const username = data.username;

    const user = await fetchGitHubUser(username);
    const repos = (await fetchGitHubRepos(username, { perPage: 100, sort: "updated" })).filter(
      (r) => !r.fork,
    );

    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
    const langCounts: Record<string, number> = {};
    for (const r of repos) {
      if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1;
    }
    const topLangs = Object.entries(langCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([k, v]) => ({ name: k, count: v }));

    const topRepos = repos
      .slice()
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 8)
      .map((r) => ({ name: r.name, desc: r.description, stars: r.stargazers_count, lang: r.language }));

    const stats = {
      avatar_url: user.avatar_url,
      name: user.name,
      bio: user.bio,
      public_repos: user.public_repos,
      followers: user.followers,
      total_stars: totalStars,
      total_forks: totalForks,
      languages: topLangs,
      top_repos: topRepos,
    };

    const ai = await callAiJson<{
      score: number;
      summary: string;
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
    }>({
      messages: [
        {
          role: "system",
          content:
            "You are a senior engineering manager reviewing developer GitHub profiles. Be concise, specific, encouraging but honest.",
        },
        {
          role: "user",
          content: `Analyze this GitHub developer and return JSON.\n\nUsername: ${username}\nBio: ${user.bio ?? "n/a"}\nPublic repos: ${user.public_repos}\nFollowers: ${user.followers}\nTotal stars: ${totalStars}\nTop languages: ${topLangs.map((l) => l.name).join(", ")}\nTop repos: ${JSON.stringify(topRepos)}\n\nGive an overall score 0-100, a 2-sentence summary, 3-5 strengths, 3-5 weaknesses, and 3-5 concrete suggestions.`,
        },
      ],
      schema: {
        name: "github_analysis",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
          },
          required: ["score", "summary", "strengths", "weaknesses", "suggestions"],
        },
      },
      log: { endpoint: "analyzeGithub", userId: context.userId },
    });

    await context.supabase.from("github_analyses").insert({
      user_id: context.userId,
      github_username: username,
      score: ai.score,
      stats: stats as never,
      strengths: ai.strengths,
      weaknesses: ai.weaknesses,
      suggestions: ai.suggestions,
      summary: ai.summary,
    });

    return { stats, ...ai };
  });

// ---------- Resume scoring & suggestions ----------

export const scoreResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        resume: z.object({
          fullName: z.string().optional(),
          title: z.string().optional(),
          summary: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          location: z.string().optional(),
          skills: z.array(z.string()).default([]),
          experience: z
            .array(z.object({ role: z.string(), company: z.string(), period: z.string(), description: z.string() }))
            .default([]),
          education: z
            .array(z.object({ school: z.string(), degree: z.string(), period: z.string() }))
            .default([]),
          projects: z
            .array(z.object({ name: z.string(), description: z.string(), tech: z.string().optional() }))
            .default([]),
        }),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    return await callAiJson<{ score: number; suggestions: string[]; missingSkills: string[] }>({
      messages: [
        {
          role: "system",
          content:
            "You are an ATS resume reviewer. Score resumes on impact, keyword coverage, quantification, clarity, and ATS compatibility.",
        },
        {
          role: "user",
          content: `Review this resume and return JSON.\n${JSON.stringify(data.resume)}`,
        },
      ],
      schema: {
        name: "resume_score",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            score: { type: "integer", minimum: 0, maximum: 100 },
            suggestions: { type: "array", items: { type: "string" } },
            missingSkills: { type: "array", items: { type: "string" } },
          },
          required: ["score", "suggestions", "missingSkills"],
        },
      },
      log: { endpoint: "scoreResume", userId: context.userId },
    });
  });

// ---------- Code review ----------

export const reviewCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        code: z.string().min(1).max(20000),
        language: z.string().default("javascript"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    const feedback = await callAiJson<{
      overall: string;
      bugs: string[];
      security: string[];
      performance: string[];
      cleanCode: string[];
      bestPractices: string[];
    }>({
      messages: [
        {
          role: "system",
          content:
            "You are a senior code reviewer. Be specific, cite line numbers when useful, focus on actionable issues.",
        },
        {
          role: "user",
          content: `Review this ${data.language} code and return JSON:\n\n\`\`\`${data.language}\n${data.code}\n\`\`\``,
        },
      ],
      schema: {
        name: "code_review",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            overall: { type: "string" },
            bugs: { type: "array", items: { type: "string" } },
            security: { type: "array", items: { type: "string" } },
            performance: { type: "array", items: { type: "string" } },
            cleanCode: { type: "array", items: { type: "string" } },
            bestPractices: { type: "array", items: { type: "string" } },
          },
          required: ["overall", "bugs", "security", "performance", "cleanCode", "bestPractices"],
        },
      },
      log: { endpoint: "reviewCode", userId: context.userId },
    });

    await context.supabase.from("code_reviews").insert({
      user_id: context.userId,
      language: data.language,
      code: data.code,
      feedback: feedback as never,
    });

    return feedback;
  });

// ---------- Interview questions ----------

export const generateInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        role: z.string().min(1),
        category: z.string().min(1),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        count: z.number().int().min(3).max(15).default(8),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    const result = await callAiJson<{
      questions: Array<{ question: string; answer: string; explanation: string }>;
    }>({
      messages: [
        {
          role: "system",
          content: "You are an interview coach. Generate realistic, well-structured questions with model answers.",
        },
        {
          role: "user",
          content: `Generate ${data.count} ${data.difficulty} ${data.category} interview questions for a ${data.role} role. Each item has question, model answer (4-7 sentences), and a short explanation of what interviewers look for.`,
        },
      ],
      schema: {
        name: "interview",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                  explanation: { type: "string" },
                },
                required: ["question", "answer", "explanation"],
              },
            },
          },
          required: ["questions"],
        },
      },
      log: { endpoint: "generateInterview", userId: context.userId },
    });

    await context.supabase.from("interview_sessions").insert({
      user_id: context.userId,
      role: data.role,
      category: data.category,
      questions: result.questions as never,
    });

    return result;
  });

// ---------- Roadmap ----------

export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ path: z.string().min(1), level: z.string().default("beginner") }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    const roadmap = await callAiJson<{
      timeline: string;
      phases: Array<{
        title: string;
        duration: string;
        skills: string[];
        projects: string[];
        resources: string[];
      }>;
      certifications: string[];
    }>({
      messages: [
        {
          role: "system",
          content: "You are a career mentor for developers. Create realistic, actionable learning roadmaps.",
        },
        {
          role: "user",
          content: `Generate a ${data.path} career roadmap starting from ${data.level}. Return JSON with: estimated timeline, 4-6 phases (title, duration, key skills, suggested projects, recommended resources), and 3-5 useful certifications.`,
        },
      ],
      schema: {
        name: "roadmap",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            timeline: { type: "string" },
            phases: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  duration: { type: "string" },
                  skills: { type: "array", items: { type: "string" } },
                  projects: { type: "array", items: { type: "string" } },
                  resources: { type: "array", items: { type: "string" } },
                },
                required: ["title", "duration", "skills", "projects", "resources"],
              },
            },
            certifications: { type: "array", items: { type: "string" } },
          },
          required: ["timeline", "phases", "certifications"],
        },
      },
      log: { endpoint: "generateRoadmap", userId: context.userId },
    });

    await context.supabase.from("roadmaps").insert({
      user_id: context.userId,
      path: data.path,
      roadmap: roadmap as never,
    });

    return roadmap;
  });

// ---------- Dashboard summary ----------

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, gh, resume, reviews, interviews, devScores, ghResumes, mockInterviews] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase
        .from("github_analyses")
        .select("score, github_username, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      context.supabase
        .from("resumes")
        .select("score, title, updated_at")
        .eq("user_id", context.userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      context.supabase.from("code_reviews").select("id", { count: "exact", head: true }).eq("user_id", context.userId),
      context.supabase
        .from("interview_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", context.userId),
      context.supabase
        .from("developer_scores")
        .select("overall_score, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(2),
      context.supabase
        .from("github_resumes")
        .select("developer_type, resume_data, badges, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      context.supabase
        .from("mock_interviews")
        .select("overall_score, job_role, created_at")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(2),
    ]);

    const p = profile.data;
    const profileFields = [p?.name, p?.bio, p?.github_username, p?.skills?.length ? "skills" : null];
    const profileCompletion = Math.round(
      (profileFields.filter(Boolean).length / profileFields.length) * 100,
    );
    
    let devScoreTrend = 0;
    if (devScores.data && devScores.data.length >= 2) {
      devScoreTrend = devScores.data[0].overall_score - devScores.data[1].overall_score;
    }

    let mockInterviewTrend = 0;
    if (mockInterviews.data && mockInterviews.data.length >= 2) {
      mockInterviewTrend = mockInterviews.data[0].overall_score - mockInterviews.data[1].overall_score;
    }

    return {
      profile: p,
      profileCompletion,
      githubScore: gh.data?.score ?? 0,
      githubUsername: gh.data?.github_username ?? null,
      resumeScore: resume.data?.score ?? 0,
      portfolioScore: profileCompletion,
      interviewReady: Math.min(100, (interviews.count ?? 0) * 20),
      codeReviewCount: reviews.count ?? 0,
      interviewCount: interviews.count ?? 0,
      devScore: devScores.data?.[0]?.overall_score ?? 0,
      devScoreTrend,
      devScoreUpdated: devScores.data?.[0]?.created_at ?? null,
      githubResume: ghResumes.data ?? null,
      mockInterview: mockInterviews.data?.[0] ?? null,
      mockInterviewTrend,
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        name: z.string().max(80).optional(),
        bio: z.string().max(500).optional(),
        github_username: z.string().max(40).optional(),
        experience_level: z.string().max(40).optional(),
        skills: z.array(z.string().max(40)).max(40).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Job Match Analyzer ----------

export const analyzeJobMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        resumeText: z.string().min(10),
        resumeFileName: z.string().min(1),
        jobDescription: z.string().min(10),
        jobRole: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    const ai = await callAiJson<{
      atsScore: number;
      hiringProbability: number;
      interviewReadiness: number;
      matchingSkills: string[];
      missingSkills: string[];
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
      summary: string;
      recommendedProjects: string[];
      recommendedSkills: string[];
    }>({
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical recruiter and ATS software analyzer. Compare the user's resume text against the job description. Be highly critical and provide an actionable, realistic assessment.",
        },
        {
          role: "user",
          content: `Analyze this resume against the job description and return JSON.\n\nJob Role: ${data.jobRole}\n\nJob Description:\n${data.jobDescription}\n\nResume Text:\n${data.resumeText}`,
        },
      ],
      schema: {
        name: "job_match",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            atsScore: { type: "integer", minimum: 0, maximum: 100 },
            hiringProbability: { type: "integer", minimum: 0, maximum: 100 },
            interviewReadiness: { type: "integer", minimum: 0, maximum: 100 },
            matchingSkills: { type: "array", items: { type: "string" } },
            missingSkills: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
            recommendedProjects: { type: "array", items: { type: "string" } },
            recommendedSkills: { type: "array", items: { type: "string" } },
          },
          required: [
            "atsScore",
            "hiringProbability",
            "interviewReadiness",
            "matchingSkills",
            "missingSkills",
            "strengths",
            "weaknesses",
            "suggestions",
            "summary",
            "recommendedProjects",
            "recommendedSkills",
          ],
        },
      },
      log: { endpoint: "analyzeJobMatch", userId: context.userId },
    });

    const analysis = {
      matchingSkills: ai.matchingSkills,
      missingSkills: ai.missingSkills,
      strengths: ai.strengths,
      weaknesses: ai.weaknesses,
      suggestions: ai.suggestions,
      recommendedProjects: ai.recommendedProjects,
      recommendedSkills: ai.recommendedSkills,
    };

    const inserted = await context.supabase.from("job_matches").insert({
      user_id: context.userId,
      job_role: data.jobRole,
      job_description: data.jobDescription,
      resume_file_name: data.resumeFileName,
      resume_text: data.resumeText,
      ats_score: ai.atsScore,
      hiring_probability: ai.hiringProbability,
      interview_readiness: ai.interviewReadiness,
      ai_summary: ai.summary,
      analysis: analysis as any,
    }).select().single();

    return { id: inserted.data?.id, ...ai };
  });

export const getJobMatchesHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("job_matches")
      .select("id, job_role, ats_score, resume_file_name, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
      
    if (error) throw new Error(error.message);
    return data;
  });

// ---------- Developer Health Score ----------

export const generateDeveloperScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    const supabase = context.supabase;
    const userId = context.userId;

    // Fetch latest data
    const [ghRes, resumeRes, jobMatchRes, interviewRes, profileRes] = await Promise.all([
      supabase.from("github_analyses").select("score, stats").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("resumes").select("score, content").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("job_matches").select("ats_score, analysis, job_role").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("interview_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);

    const gh = ghRes.data;
    const resume = resumeRes.data;
    const jobMatch = jobMatchRes.data;
    const interviewCount = interviewRes.count ?? 0;
    const profile = profileRes.data;

    const githubScore = gh?.score ?? 0;
    const resumeScore = resume?.score ?? 0;
    const jobMatchScore = jobMatch?.ats_score ?? 0;
    
    // Interview score logic: use best_interview_score from profile if available, otherwise fallback to interview count
    const mockInterviewScore = profile?.best_interview_score ?? 0;
    const interviewScore = mockInterviewScore > 0 ? mockInterviewScore : Math.min(100, interviewCount * 20);

    const profileFields = [profile?.name, profile?.bio, profile?.github_username, profile?.skills?.length ? "skills" : null];
    const profileScore = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

    // Weighted Overall Score
    // GitHub: 25%, Resume: 20%, Job Match: 25%, Interview: 20%, Profile: 10%
    const overallScore = Math.round(
      githubScore * 0.25 + resumeScore * 0.20 + jobMatchScore * 0.25 + interviewScore * 0.20 + profileScore * 0.10
    );

    const ai = await callAiJson<{
      overallScore: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      suggestedProjects: string[];
      certifications: string[];
      jobRoles: string[];
      insights: {
        why: string;
        biggestStrength: string;
        biggestWeakness: string;
        fastestImprovement: string;
      };
    }>({
      messages: [
        {
          role: "system",
          content: "You are an elite career coach. Analyze the developer's component scores and profile to generate actionable insights, recommendations, and suggested next steps.",
        },
        {
          role: "user",
          content: `Generate Developer Health Score Insights.
Overall Score: ${overallScore}
Component Scores:
- GitHub: ${githubScore}/100
- Resume: ${resumeScore}/100
- Job Match: ${jobMatchScore}/100 (Last role: ${jobMatch?.job_role ?? "N/A"})
- Interview Readiness: ${interviewScore}/100
- Profile Completion: ${profileScore}/100

Profile details: ${JSON.stringify(profile)}

Return JSON with exactly these fields:
"overallScore" (should be ${overallScore}),
"strengths" (list of 3-5 strings),
"weaknesses" (list of 3-5 strings),
"recommendations" (list of 3-5 strings),
"suggestedProjects" (list of 3 project ideas, string format),
"certifications" (list of 3 recommended certs),
"jobRoles" (list of 3 target roles),
"insights": { "why": "...", "biggestStrength": "...", "biggestWeakness": "...", "fastestImprovement": "..." }
`,
        },
      ],
      schema: {
        name: "developer_score",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            overallScore: { type: "integer" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            suggestedProjects: { type: "array", items: { type: "string" } },
            certifications: { type: "array", items: { type: "string" } },
            jobRoles: { type: "array", items: { type: "string" } },
            insights: {
              type: "object",
              additionalProperties: false,
              properties: {
                why: { type: "string" },
                biggestStrength: { type: "string" },
                biggestWeakness: { type: "string" },
                fastestImprovement: { type: "string" },
              },
              required: ["why", "biggestStrength", "biggestWeakness", "fastestImprovement"],
            },
          },
          required: [
            "overallScore", "strengths", "weaknesses", "recommendations", "suggestedProjects", "certifications", "jobRoles", "insights"
          ],
        },
      },
      log: { endpoint: "generateDeveloperScore", userId },
    });

    const inserted = await supabase.from("developer_scores").insert({
      user_id: userId,
      overall_score: overallScore,
      github_score: githubScore,
      resume_score: resumeScore,
      job_match_score: jobMatchScore,
      interview_score: interviewScore,
      profile_score: profileScore,
      strengths: ai.strengths,
      weaknesses: ai.weaknesses,
      recommendations: ai.recommendations,
      suggested_projects: ai.suggestedProjects,
      certifications: ai.certifications,
      job_roles: ai.jobRoles,
      ai_insights: ai.insights,
    }).select().single();

    return inserted.data;
  });

export const getDeveloperScoresHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("developer_scores")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
      
    if (error) throw new Error(error.message);
    return data;
  });

// ---------- Resume CRUD ----------

export const saveResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().optional(),
        title: z.string().min(1),
        content: z.any(),
        score: z.number().default(0),
        ai_suggestions: z.array(z.string()).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { data: updated, error } = await context.supabase
        .from("resumes")
        .update({
          title: data.title,
          content: data.content as never,
          score: data.score,
          ai_suggestions: data.ai_suggestions,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .eq("user_id", context.userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    } else {
      const { data: inserted, error } = await context.supabase
        .from("resumes")
        .insert({
          user_id: context.userId,
          title: data.title,
          content: data.content as never,
          score: data.score,
          ai_suggestions: data.ai_suggestions,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return inserted;
    }
  });

export const getResumes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("resumes")
      .select("*")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const deleteResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("resumes")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

// ---------- Cover Letter ----------

export const generateCoverLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        resume: z.any(),
        jobRole: z.string().optional(),
        company: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    return await callAiJson<{ coverLetter: string }>({
      messages: [
        {
          role: "system",
          content: "You are an expert career coach writing highly compelling, ATS-friendly cover letters.",
        },
        {
          role: "user",
          content: `Write a cover letter for ${data.jobRole || "a Software Engineer"} position at ${data.company || "a tech company"}.
Based on this resume data:
${JSON.stringify(data.resume)}

Output a JSON with the key "coverLetter" containing the full text of the cover letter.`,
        },
      ],
      schema: {
        name: "cover_letter",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: { coverLetter: { type: "string" } },
          required: ["coverLetter"],
        },
      },
      log: { endpoint: "generateCoverLetter", userId: context.userId },
    });
  });

// ---------- GitHub Resume Generator ----------

export const generateGithubResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ username: z.string().trim().min(1).max(40) }).parse(d))
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    const username = data.username;

    const repos = (await fetchGitHubRepos(username, { perPage: 30, sort: "pushed" })).filter(
      (r) => !r.fork,
    );

    // Deep analysis parameters (simulate deep scraping by sending top repo descriptions and topics)
    const topReposDeep = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10)
      .map(r => ({
        name: r.name,
        desc: r.description,
        lang: r.language,
        topics: r.topics || [],
        stars: r.stargazers_count,
        watchers: r.watchers_count
      }));

    const langCounts: Record<string, number> = {};
    for (const r of repos) {
      if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1;
    }

    const ai = await callAiJson<{
      developerType: string;
      specialization: string;
      experienceLevel: string;
      professionalSummary: string;
      skills: string[];
      projects: Array<{name: string, description: string, tech: string}>;
      achievements: string[];
      githubHighlights: string[];
      recommendedRoles: string[];
      recommendedProjects: string[];
      recommendedCertifications: string[];
      missingSkills: string[];
      atsScore: number;
      completenessScore: number;
      badges: string[];
    }>({
      messages: [
        {
          role: "system",
          content: "You are an elite Tech Recruiter & AI Resume writer. Analyze GitHub repos (names, descriptions, topics) to deeply infer tech stack, specialization, complexity, architecture skills. Generate a professional JSON output. Add developer badges (e.g., 'React Expert').",
        },
        {
          role: "user",
          content: `Generate a resume and insights for GitHub user: ${username}
Top Languages: ${JSON.stringify(langCounts)}
Top Repositories & Topics: ${JSON.stringify(topReposDeep)}

Infer framework usage, specialization, and complexity from the repo descriptions and topics.`,
        },
      ],
      schema: {
        name: "github_resume",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            developerType: { type: "string" },
            specialization: { type: "string" },
            experienceLevel: { type: "string" },
            professionalSummary: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  tech: { type: "string" },
                },
                required: ["name", "description", "tech"],
                additionalProperties: false,
              }
            },
            achievements: { type: "array", items: { type: "string" } },
            githubHighlights: { type: "array", items: { type: "string" } },
            recommendedRoles: { type: "array", items: { type: "string" } },
            recommendedProjects: { type: "array", items: { type: "string" } },
            recommendedCertifications: { type: "array", items: { type: "string" } },
            missingSkills: { type: "array", items: { type: "string" } },
            atsScore: { type: "integer" },
            completenessScore: { type: "integer" },
            badges: { type: "array", items: { type: "string" } },
          },
          required: [
            "developerType", "specialization", "experienceLevel", "professionalSummary",
            "skills", "projects", "achievements", "githubHighlights", "recommendedRoles",
            "recommendedProjects", "recommendedCertifications", "missingSkills", "atsScore",
            "completenessScore", "badges"
          ],
        },
      },
      log: { endpoint: "generateGithubResume", userId: context.userId },
    });

    const profileStrength = Math.round(Math.min(100, (repos.length * 2) + (topReposDeep.reduce((a,b)=>a+b.stars, 0) * 5) + ai.completenessScore * 0.3));

    const resumeData = {
      fullName: username,
      title: ai.developerType,
      email: "",
      phone: "",
      location: "",
      summary: ai.professionalSummary,
      skills: ai.skills,
      experience: [],
      education: [],
      projects: ai.projects,
    };

    const insights = {
      recommendedRoles: ai.recommendedRoles,
      recommendedProjects: ai.recommendedProjects,
      recommendedCertifications: ai.recommendedCertifications,
      missingSkills: ai.missingSkills,
      atsScore: ai.atsScore,
      completenessScore: ai.completenessScore,
      achievements: ai.achievements,
      githubHighlights: ai.githubHighlights,
      specialization: ai.specialization,
      experienceLevel: ai.experienceLevel,
    };

    const inserted = await context.supabase.from("github_resumes").insert({
      user_id: context.userId,
      github_username: username,
      developer_type: ai.developerType,
      profile_strength: profileStrength,
      badges: ai.badges as never,
      resume_data: resumeData as never,
      insights: insights as never,
    }).select().single();

    return { id: inserted.data?.id, profileStrength, resumeData, insights, developerType: ai.developerType, badges: ai.badges };
  });

// ---------- Mock Interview Simulator ----------

export const generateMockInterviewQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        jobRole: z.string(),
        experienceLevel: z.string(),
        interviewType: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    const supabase = context.supabase;
    const userId = context.userId;

    // Fetch context (github, resume)
    const [ghRes, resumeRes] = await Promise.all([
      supabase.from("github_analyses").select("summary, strengths").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("resumes").select("content").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const promptContext = `
Role: ${data.jobRole}
Level: ${data.experienceLevel}
Type: ${data.interviewType}
Candidate GitHub Summary: ${ghRes.data?.summary || "N/A"}
Candidate Resume Skills: ${JSON.stringify((resumeRes.data?.content as any)?.skills || [])}
`;

    const ai = await callAiJson<{ questions: { question: string; expected_answer: string; type: string }[] }>({
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer. Generate 5 highly tailored interview questions based on the candidate's profile, requested role, and interview type. Include expected answers.",
        },
        {
          role: "user",
          content: promptContext,
        },
      ],
      schema: {
        name: "mock_interview_questions",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  expected_answer: { type: "string" },
                  type: { type: "string" },
                },
                required: ["question", "expected_answer", "type"],
                additionalProperties: false,
              },
            },
          },
          required: ["questions"],
        },
      },
      log: { endpoint: "generateMockInterviewQuestions", userId },
    });

    const { data: inserted, error } = await supabase
      .from("mock_interviews")
      .insert({
        user_id: userId,
        job_role: data.jobRole,
        experience_level: data.experienceLevel,
        interview_type: data.interviewType,
        questions: ai.questions as never,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return inserted;
  });

export const evaluateMockInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        interviewId: z.string(),
        answers: z.array(z.string()),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { callAiJson } = await import("./ai-gateway.server");
    const supabase = context.supabase;
    const userId = context.userId;

    const { data: interview } = await supabase.from("mock_interviews").select("*").eq("id", data.interviewId).single();
    if (!interview) throw new Error("Interview not found");

    const qs = interview.questions as any[];
    const qas = qs.map((q, i) => ({
      question: q.question,
      expected: q.expected_answer,
      user_answer: data.answers[i] || "",
    }));

    const ai = await callAiJson<{
      overallScore: number;
      technicalScore: number;
      communicationScore: number;
      problemSolvingScore: number;
      confidenceScore: number;
      completenessScore: number;
      strengths: string[];
      weaknesses: string[];
      improvements: string[];
      recommendedTopics: string[];
      nextSteps: string[];
      evaluations: { feedback: string; score: number }[];
    }>({
      messages: [
        {
          role: "system",
          content: "You are an expert interviewer evaluating a candidate's answers. Grade strictly but fairly.",
        },
        {
          role: "user",
          content: `Evaluate these answers: ${JSON.stringify(qas)}\n\nGenerate detailed feedback and the required scores.`,
        },
      ],
      schema: {
        name: "mock_interview_evaluation",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            overallScore: { type: "integer" },
            technicalScore: { type: "integer" },
            communicationScore: { type: "integer" },
            problemSolvingScore: { type: "integer" },
            confidenceScore: { type: "integer" },
            completenessScore: { type: "integer" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            recommendedTopics: { type: "array", items: { type: "string" } },
            nextSteps: { type: "array", items: { type: "string" } },
            evaluations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  feedback: { type: "string" },
                  score: { type: "integer" },
                },
                required: ["feedback", "score"],
                additionalProperties: false,
              },
            },
          },
          required: [
            "overallScore", "technicalScore", "communicationScore", "problemSolvingScore",              "confidenceScore",
              "completenessScore", "strengths", "weaknesses", 
            "improvements", "recommendedTopics", "nextSteps", "evaluations"
          ],
        },
      },
      log: { endpoint: "evaluateMockInterview", userId },
    });

    const detailedAnswers = qas.map((qa, i) => ({
      question_index: i,
      user_answer: qa.user_answer,
      ai_feedback: ai.evaluations[i]?.feedback || "No feedback generated.",
      ai_score: ai.evaluations[i]?.score || 0,
    }));

    const report = {
      overallScore: ai.overallScore,
      technicalScore: ai.technicalScore,
      communicationScore: ai.communicationScore,
      problemSolvingScore: ai.problemSolvingScore,
      confidenceScore: ai.confidenceScore,
      completenessScore: ai.completenessScore,
      strengths: ai.strengths,
      weaknesses: ai.weaknesses,
      improvements: ai.improvements,
      recommendedTopics: ai.recommendedTopics,
      nextSteps: ai.nextSteps,
    };

    // Update interview record
    await supabase.from("mock_interviews").update({
      answers: detailedAnswers as never,
      overall_score: ai.overallScore,
      report: report as never,
      status: "completed",
    }).eq("id", data.interviewId);

    // Update Profile Stats and Gamification
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (profile) {
      let badges = [...(profile.badges || [])];
      if (ai.overallScore >= 50 && !badges.includes("Interview Beginner")) badges.push("Interview Beginner");
      if (ai.overallScore >= 75 && !badges.includes("Interview Ready")) badges.push("Interview Ready");
      if (ai.communicationScore >= 85 && !badges.includes("Strong Communicator")) badges.push("Strong Communicator");
      if (ai.problemSolvingScore >= 85 && !badges.includes("Problem Solver")) badges.push("Problem Solver");
      if (ai.completenessScore >= 85 && !badges.includes("Industry Ready")) badges.push("Industry Ready");

      const newTotal = (profile.total_interviews || 0) + 1;
      const newStreak = (profile.interview_streak || 0) + 1;
      const newBest = Math.max(profile.best_interview_score || 0, ai.overallScore);

      await supabase.from("profiles").update({
        badges,
        total_interviews: newTotal,
        interview_streak: newStreak,
        best_interview_score: newBest,
      }).eq("id", userId);
    }

    // Trigger Developer Score Update in background
    generateDeveloperScore({ data: undefined }).catch(console.error);

    return { success: true, report, detailedAnswers };
  });
