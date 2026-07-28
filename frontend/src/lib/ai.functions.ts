import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "./auth-middleware";
import { fetchGitHubUser, fetchGitHubRepos } from "./github-client.server";
import { serverApiClient } from "./api-client";

export const GithubAnalysisSchema = z.object({
  score: z.number(),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type GithubAnalysisResponse = z.infer<typeof GithubAnalysisSchema>;

export interface GithubStats {
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  total_stars: number;
  total_forks: number;
  languages: Array<{ name: string; count: number }>;
  top_repos: Array<{ name: string; desc: string; stars: number; lang: string | null }>;
}

export const analyzeGithub = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ username: z.string().trim().min(1).max(40) }).parse(d))
  .handler(async ({ data, context }) => {
    const username = data.username.toLowerCase();

    const { data: cached } = await serverApiClient.get(`/ai/github-analysis/cache/${username}`, {
      headers: { Authorization: `Bearer ${context.token}` }
    });

    if (cached) {
      return {
        stats: cached.stats as unknown as GithubStats,
        score: cached.score,
        summary: cached.summary,
        strengths: cached.strengths,
        weaknesses: cached.weaknesses,
        suggestions: cached.suggestions,
      };
    }

    const { callAiJson } = await import("./ai-gateway.server");
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
      .map((r) => ({
        name: r.name,
        desc: r.description ? r.description.slice(0, 500) : "",
        stars: r.stargazers_count,
        lang: r.language,
      }));

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

    const rawAi = await callAiJson<unknown>({
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
      token: context.token,
    });

    const ai = GithubAnalysisSchema.parse(rawAi);

    await serverApiClient.post("/ai/github-analysis", {
      github_username: username,
      score: ai.score,
      stats,
      strengths: ai.strengths,
      weaknesses: ai.weaknesses,
      suggestions: ai.suggestions,
      summary: ai.summary,
    }, {
      headers: { Authorization: `Bearer ${context.token}` }
    });

    return { stats: stats as unknown as GithubStats, ...ai };
  });

export const ResumeScoreSchema = z.object({
  score: z.number(),
  suggestions: z.array(z.string()),
  missingSkills: z.array(z.string()),
});

export type ResumeScoreResponse = z.infer<typeof ResumeScoreSchema>;

export const scoreResume = createServerFn({ method: "POST" })
  .middleware([requireAuth])
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
            .array(
              z.object({
                role: z.string(),
                company: z.string(),
                period: z.string(),
                description: z.string(),
              }),
            )
            .default([]),
          education: z
            .array(z.object({ school: z.string(), degree: z.string(), period: z.string() }))
            .default([]),
          projects: z
            .array(
              z.object({ name: z.string(), description: z.string(), tech: z.string().optional() }),
            )
            .default([]),
        }),
      })
      .parse(d),
  )
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/resume/score", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const CodeReviewSchema = z.object({
  overall: z.string(),
  bugs: z.array(z.string()),
  security: z.array(z.string()),
  performance: z.array(z.string()),
  cleanCode: z.array(z.string()),
  bestPractices: z.array(z.string()),
});

export type CodeReviewResponse = z.infer<typeof CodeReviewSchema>;

export const reviewCode = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        code: z
          .string()
          .min(1, "Code cannot be empty.")
          .max(
            8000,
            "Code is too large. Maximum allowed size is 8,000 characters for optimal AI review.",
          ),
        language: z.string().default("javascript"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/code-review", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const generateInterview = createServerFn({ method: "POST" })
  .middleware([requireAuth])
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
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/interview/generate", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const RoadmapSchema = z.object({
  timeline: z.string(),
  phases: z.array(
    z.object({
      title: z.string(),
      duration: z.string(),
      skills: z.array(z.string()),
      projects: z.array(z.string()),
      resources: z.array(z.string()),
    }),
  ),
  certifications: z.array(z.string()),
});

export type RoadmapResponse = z.infer<typeof RoadmapSchema>;

export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z.object({ path: z.string().min(1), level: z.string().default("beginner") }).parse(d),
  )
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/roadmap/generate", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data } = await serverApiClient.get("/ai/dashboard", {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireAuth])
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
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/profile", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const JobMatchSchema = z.object({
  atsScore: z.number(),
  hiringProbability: z.number(),
  interviewReadiness: z.number(),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  summary: z.string(),
  recommendedProjects: z.array(z.string()),
  recommendedSkills: z.array(z.string()),
});

export type JobMatchResponse = z.infer<typeof JobMatchSchema>;

export const analyzeJobMatch = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        resumeText: z
          .string()
          .min(10, "Resume text is too short.")
          .max(8000, "Resume text is too large. Maximum allowed size is 8,000 characters."),
        resumeFileName: z.string().min(1),
        jobDescription: z
          .string()
          .min(10, "Job description is too short.")
          .max(8000, "Job description is too large. Maximum allowed size is 8,000 characters."),
        jobRole: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/job-match", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const getJobMatchesHistory = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.get("/ai/job-match",
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const DeveloperScoreSchema = z.object({
  overallScore: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  suggestedProjects: z.array(z.string()),
  certifications: z.array(z.string()),
  jobRoles: z.array(z.string()),
  insights: z.object({
    why: z.string(),
    biggestStrength: z.string(),
    biggestWeakness: z.string(),
    fastestImprovement: z.string(),
  }),
});

export type DeveloperScoreResponse = z.infer<typeof DeveloperScoreSchema>;

export const generateDeveloperScore = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/developer-score", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const getDeveloperScoresHistory = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.get("/ai/developer-score",
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const saveResume = createServerFn({ method: "POST" })
  .middleware([requireAuth])
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
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/resume", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const getResumes = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.get("/ai/resume",
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const deleteResume = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.delete("/ai/resume" + "/" + data.id,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const generateCoverLetter = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        resume: z.any(),
        jobRole: z.string().optional(),
        company: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/cover-letter", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const GithubResumeSchema = z.object({
  developerType: z.string(),
  specialization: z.string(),
  experienceLevel: z.string(),
  professionalSummary: z.string(),
  skills: z.array(z.string()),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      tech: z.string(),
    }),
  ),
  achievements: z.array(z.string()),
  githubHighlights: z.array(z.string()),
  recommendedRoles: z.array(z.string()),
  recommendedProjects: z.array(z.string()),
  recommendedCertifications: z.array(z.string()),
  missingSkills: z.array(z.string()),
  atsScore: z.number(),
  completenessScore: z.number(),
  badges: z.array(z.string()),
});

export type GithubResumeResponse = z.infer<typeof GithubResumeSchema>;

export const generateGithubResume = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ username: z.string().trim().min(1).max(40) }).parse(d))
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/github-resume", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const MockInterviewQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      expected_answer: z.string(),
      type: z.string(),
    }),
  ),
});

export type MockInterviewQuestionsResponse = z.infer<typeof MockInterviewQuestionsSchema>;

export const generateMockInterviewQuestions = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        jobRole: z.string(),
        experienceLevel: z.string(),
        interviewType: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/mock-interview/questions", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });

export const MockInterviewEvaluationSchema = z.object({
  overallScore: z.number(),
  technicalScore: z.number(),
  communicationScore: z.number(),
  problemSolvingScore: z.number(),
  confidenceScore: z.number(),
  completenessScore: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvements: z.array(z.string()),
  recommendedTopics: z.array(z.string()),
  nextSteps: z.array(z.string()),
  evaluations: z.array(
    z.object({
      feedback: z.string(),
      score: z.number(),
    }),
  ),
});

export type MockInterviewEvaluationResponse = z.infer<typeof MockInterviewEvaluationSchema>;

export const evaluateMockInterview = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        interviewId: z.string(),
        answers: z.array(z.string()),
      })
      .parse(d),
  )
  .handler(async ({ data, context }: any) => {
    const { data: res } = await serverApiClient.post("/ai/mock-interview/evaluate", data,
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return res;
  });
