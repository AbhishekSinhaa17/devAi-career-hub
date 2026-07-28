import { c as createServerRpc } from "./createServerRpc-CHDPIlgp.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth, s as serverApiClient } from "./api-client-CbTdHRmP.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "./index.mjs";
import { o as objectType, a as arrayType, s as stringType, n as numberType, e as enumType, b as anyType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "crypto";
import "async_hooks";
import "util";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/axios.mjs";
import "../_libs/form-data.mjs";
import "../_libs/combined-stream.mjs";
import "../_libs/delayed-stream.mjs";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "../_libs/mime-types.mjs";
import "../_libs/mime-db.mjs";
import "../_libs/asynckit.mjs";
import "../_libs/es-set-tostringtag.mjs";
import "../_libs/get-intrinsic.mjs";
import "../_libs/es-object-atoms.mjs";
import "../_libs/es-errors.mjs";
import "../_libs/math-intrinsics.mjs";
import "../_libs/gopd.mjs";
import "../_libs/es-define-property.mjs";
import "../_libs/has-symbols.mjs";
import "../_libs/get-proto.mjs";
import "../_libs/dunder-proto.mjs";
import "../_libs/call-bind-apply-helpers.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/hasown.mjs";
import "../_libs/has-tostringtag.mjs";
import "../_libs/proxy-from-env.mjs";
import "../_libs/https-proxy-agent.mjs";
import "net";
import "tls";
import "assert";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "os";
import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";
import "events";
import "http2";
import "../_libs/follow-redirects.mjs";
import "zlib";
import "../_libs/sentry__node.mjs";
import "../_libs/sentry__core.mjs";
import "../_libs/sentry__node-core.mjs";
import "../_libs/sentry__opentelemetry.mjs";
import "../_libs/@opentelemetry/semantic-conventions+[...].mjs";
import "../_libs/opentelemetry__sdk-trace-base.mjs";
import "../_libs/opentelemetry__core.mjs";
import "../_libs/opentelemetry__resources.mjs";
import "node:events";
import "node:diagnostics_channel";
import "node:child_process";
import "node:fs";
import "node:os";
import "node:path";
import "node:util";
import "node:readline";
import "../_libs/opentelemetry__instrumentation.mjs";
import "../_libs/opentelemetry__api-logs.mjs";
import "require-in-the-middle";
import "import-in-the-middle";
import "node:http";
import "node:https";
import "node:worker_threads";
import "diagnostics_channel";
import "worker_threads";
import "node:zlib";
import "node:net";
import "node:tls";
import "module";
import "../_libs/sentry__server-utils.mjs";
const GITHUB_API_BASE = "https://api.github.com";
const USER_AGENT = "DevAI";
function getHeaders() {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github+json"
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
class GitHubApiError extends Error {
  constructor(message, status, isRateLimited) {
    super(message);
    this.status = status;
    this.isRateLimited = isRateLimited;
    this.name = "GitHubApiError";
  }
  status;
  isRateLimited;
}
async function githubGet(path, retries = 2) {
  const url = path.startsWith("http") ? path : `${GITHUB_API_BASE}${path}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: getHeaders() });
    if (res.ok) {
      return res.json();
    }
    const isRateLimited = res.status === 403 || res.status === 429;
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (isRateLimited && remaining === "0") {
      const resetEpoch = Number(res.headers.get("x-ratelimit-reset") ?? 0);
      const resetDate = new Date(resetEpoch * 1e3);
      const hasToken = !!process.env.GITHUB_TOKEN;
      throw new GitHubApiError(
        `GitHub API rate limit exceeded. Resets at ${resetDate.toISOString()}.${hasToken ? "" : " Consider adding GITHUB_TOKEN for higher limits."}`,
        res.status,
        true
      );
    }
    if (res.status >= 500 && attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 1e3 * Math.pow(2, attempt)));
      continue;
    }
    if (isRateLimited && attempt < retries) {
      const retryAfter = res.headers.get("retry-after");
      const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1e3));
      continue;
    }
    if (res.status === 404) {
      throw new GitHubApiError("GitHub user not found", 404, false);
    }
    throw new GitHubApiError(
      `GitHub API error: ${res.status} ${res.statusText}`,
      res.status,
      false
    );
  }
  throw new Error("Unreachable");
}
function fetchGitHubUser(username) {
  return githubGet(`/users/${username}`);
}
async function fetchGitHubRepos(username, opts = {}) {
  const perPage = opts.perPage ?? 100;
  const sort = opts.sort ?? "updated";
  const repos = await githubGet(
    `/users/${username}/repos?per_page=${perPage}&sort=${sort}`
  );
  return repos;
}
const GithubAnalysisSchema = objectType({
  score: numberType(),
  summary: stringType(),
  strengths: arrayType(stringType()),
  weaknesses: arrayType(stringType()),
  suggestions: arrayType(stringType())
});
const analyzeGithub_createServerFn_handler = createServerRpc({
  id: "47641c932ba217ef5fca5122e8bf3d43cf8d5df13656a5f8336615082312033d",
  name: "analyzeGithub",
  filename: "src/lib/ai.functions.ts"
}, (opts) => analyzeGithub.__executeServer(opts));
const analyzeGithub = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  username: stringType().trim().min(1).max(40)
}).parse(d)).handler(analyzeGithub_createServerFn_handler, async ({
  data,
  context
}) => {
  const username = data.username.toLowerCase();
  const {
    data: cached
  } = await serverApiClient.get(`/ai/github-analysis/cache/${username}`, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  if (cached) {
    return {
      stats: cached.stats,
      score: cached.score,
      summary: cached.summary,
      strengths: cached.strengths,
      weaknesses: cached.weaknesses,
      suggestions: cached.suggestions
    };
  }
  const {
    callAiJson
  } = await import("./ai-gateway.server-Cvn9mVCm.mjs");
  const user = await fetchGitHubUser(username);
  const repos = (await fetchGitHubRepos(username, {
    perPage: 100,
    sort: "updated"
  })).filter((r) => !r.fork);
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const langCounts = {};
  for (const r of repos) {
    if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1;
  }
  const topLangs = Object.entries(langCounts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([k, v]) => ({
    name: k,
    count: v
  }));
  const topRepos = repos.slice().sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 8).map((r) => ({
    name: r.name,
    desc: r.description ? r.description.slice(0, 500) : "",
    stars: r.stargazers_count,
    lang: r.language
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
    top_repos: topRepos
  };
  const rawAi = await callAiJson({
    messages: [{
      role: "system",
      content: "You are a senior engineering manager reviewing developer GitHub profiles. Be concise, specific, encouraging but honest."
    }, {
      role: "user",
      content: `Analyze this GitHub developer and return JSON.

Username: ${username}
Bio: ${user.bio ?? "n/a"}
Public repos: ${user.public_repos}
Followers: ${user.followers}
Total stars: ${totalStars}
Top languages: ${topLangs.map((l) => l.name).join(", ")}
Top repos: ${JSON.stringify(topRepos)}

Give an overall score 0-100, a 2-sentence summary, 3-5 strengths, 3-5 weaknesses, and 3-5 concrete suggestions.`
    }],
    schema: {
      name: "github_analysis",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          score: {
            type: "integer",
            minimum: 0,
            maximum: 100
          },
          summary: {
            type: "string"
          },
          strengths: {
            type: "array",
            items: {
              type: "string"
            }
          },
          weaknesses: {
            type: "array",
            items: {
              type: "string"
            }
          },
          suggestions: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        required: ["score", "summary", "strengths", "weaknesses", "suggestions"]
      }
    },
    log: {
      endpoint: "analyzeGithub",
      userId: context.userId
    },
    token: context.token
  });
  const ai = GithubAnalysisSchema.parse(rawAi);
  await serverApiClient.post("/ai/github-analysis", {
    github_username: username,
    score: ai.score,
    stats,
    strengths: ai.strengths,
    weaknesses: ai.weaknesses,
    suggestions: ai.suggestions,
    summary: ai.summary
  }, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return {
    stats,
    ...ai
  };
});
const scoreResume_createServerFn_handler = createServerRpc({
  id: "bffe9790aad4411c37d40c4c229a9c09f299a4b4c24ba3f3971c4b4f93e84d05",
  name: "scoreResume",
  filename: "src/lib/ai.functions.ts"
}, (opts) => scoreResume.__executeServer(opts));
const scoreResume = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  resume: objectType({
    fullName: stringType().optional(),
    title: stringType().optional(),
    summary: stringType().optional(),
    email: stringType().optional(),
    phone: stringType().optional(),
    location: stringType().optional(),
    skills: arrayType(stringType()).default([]),
    experience: arrayType(objectType({
      role: stringType(),
      company: stringType(),
      period: stringType(),
      description: stringType()
    })).default([]),
    education: arrayType(objectType({
      school: stringType(),
      degree: stringType(),
      period: stringType()
    })).default([]),
    projects: arrayType(objectType({
      name: stringType(),
      description: stringType(),
      tech: stringType().optional()
    })).default([])
  })
}).parse(d)).handler(scoreResume_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/resume/score", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const reviewCode_createServerFn_handler = createServerRpc({
  id: "7571c70091bf5a1254baaa71a5cb527ffca922f831e46074d1fe89f24a16119c",
  name: "reviewCode",
  filename: "src/lib/ai.functions.ts"
}, (opts) => reviewCode.__executeServer(opts));
const reviewCode = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  code: stringType().min(1, "Code cannot be empty.").max(8e3, "Code is too large. Maximum allowed size is 8,000 characters for optimal AI review."),
  language: stringType().default("javascript")
}).parse(d)).handler(reviewCode_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/code-review", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const generateInterview_createServerFn_handler = createServerRpc({
  id: "65aacc8bce50188e3837642f9feebe1923c698a3266c3dd91a004e3262e725b9",
  name: "generateInterview",
  filename: "src/lib/ai.functions.ts"
}, (opts) => generateInterview.__executeServer(opts));
const generateInterview = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  role: stringType().min(1),
  category: stringType().min(1),
  difficulty: enumType(["easy", "medium", "hard"]).default("medium"),
  count: numberType().int().min(3).max(15).default(8)
}).parse(d)).handler(generateInterview_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/interview/generate", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const generateRoadmap_createServerFn_handler = createServerRpc({
  id: "b6facfec805a4d13e6faff31af888082ec42bbac733da5852134732c7b3f5fe6",
  name: "generateRoadmap",
  filename: "src/lib/ai.functions.ts"
}, (opts) => generateRoadmap.__executeServer(opts));
const generateRoadmap = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  path: stringType().min(1),
  level: stringType().default("beginner")
}).parse(d)).handler(generateRoadmap_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/roadmap/generate", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const getDashboard_createServerFn_handler = createServerRpc({
  id: "7fb8173ca1f57f5d2d8d576140c8db8c7928d04056d33643215c9e00700e52d3",
  name: "getDashboard",
  filename: "src/lib/ai.functions.ts"
}, (opts) => getDashboard.__executeServer(opts));
const getDashboard = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(getDashboard_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await serverApiClient.get("/ai/dashboard", {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return data;
});
const updateProfile_createServerFn_handler = createServerRpc({
  id: "7f0927474030ec22be8d6debf00b369199198eb0d4da54f8fac7d5d2e043ea5b",
  name: "updateProfile",
  filename: "src/lib/ai.functions.ts"
}, (opts) => updateProfile.__executeServer(opts));
const updateProfile = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  name: stringType().max(80).optional(),
  bio: stringType().max(500).optional(),
  github_username: stringType().max(40).optional(),
  experience_level: stringType().max(40).optional(),
  skills: arrayType(stringType().max(40)).max(40).optional()
}).parse(d)).handler(updateProfile_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/profile", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const analyzeJobMatch_createServerFn_handler = createServerRpc({
  id: "4f719bf470fe4d6011b10c38f2570579acc81a57b3219af0194501b523a5ecd9",
  name: "analyzeJobMatch",
  filename: "src/lib/ai.functions.ts"
}, (opts) => analyzeJobMatch.__executeServer(opts));
const analyzeJobMatch = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  resumeText: stringType().min(10, "Resume text is too short.").max(8e3, "Resume text is too large. Maximum allowed size is 8,000 characters."),
  resumeFileName: stringType().min(1),
  jobDescription: stringType().min(10, "Job description is too short.").max(8e3, "Job description is too large. Maximum allowed size is 8,000 characters."),
  jobRole: stringType().min(1)
}).parse(d)).handler(analyzeJobMatch_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/job-match", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const getJobMatchesHistory_createServerFn_handler = createServerRpc({
  id: "ad63b59828c6aef86eefa13d68eeb14566c06101ad588a138eff6bdd3fba3926",
  name: "getJobMatchesHistory",
  filename: "src/lib/ai.functions.ts"
}, (opts) => getJobMatchesHistory.__executeServer(opts));
const getJobMatchesHistory = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(getJobMatchesHistory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.get("/ai/job-match", {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const generateDeveloperScore_createServerFn_handler = createServerRpc({
  id: "495859b218ab78fa3c3519320283b9dfeba18687e8a9511ea8e79c1e02ca9aa8",
  name: "generateDeveloperScore",
  filename: "src/lib/ai.functions.ts"
}, (opts) => generateDeveloperScore.__executeServer(opts));
const generateDeveloperScore = createServerFn({
  method: "POST"
}).middleware([requireAuth]).handler(generateDeveloperScore_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/developer-score", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const getDeveloperScoresHistory_createServerFn_handler = createServerRpc({
  id: "753cddb32a8cd2f2c2767a24698f0f1f657ed8796c449c8f678aa09f8ab5ba7e",
  name: "getDeveloperScoresHistory",
  filename: "src/lib/ai.functions.ts"
}, (opts) => getDeveloperScoresHistory.__executeServer(opts));
const getDeveloperScoresHistory = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(getDeveloperScoresHistory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.get("/ai/developer-score", {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const saveResume_createServerFn_handler = createServerRpc({
  id: "e52e8df4c791b71d29d58263130980b39ec6070b3db05a4c18578793e1d38fe1",
  name: "saveResume",
  filename: "src/lib/ai.functions.ts"
}, (opts) => saveResume.__executeServer(opts));
const saveResume = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  id: stringType().optional(),
  title: stringType().min(1),
  content: anyType(),
  score: numberType().default(0),
  ai_suggestions: arrayType(stringType()).default([])
}).parse(d)).handler(saveResume_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/resume", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const getResumes_createServerFn_handler = createServerRpc({
  id: "0d4ffeeb06bc7ecbec8efd18f3ff8f0f57058121d7d6b711daa715741c4ff937",
  name: "getResumes",
  filename: "src/lib/ai.functions.ts"
}, (opts) => getResumes.__executeServer(opts));
const getResumes = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(getResumes_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.get("/ai/resume", {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const deleteResume_createServerFn_handler = createServerRpc({
  id: "9b30295beb640857d74cfad4b2372c0c660353324125cb88ef80fe8b5b7705f9",
  name: "deleteResume",
  filename: "src/lib/ai.functions.ts"
}, (opts) => deleteResume.__executeServer(opts));
const deleteResume = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  id: stringType()
}).parse(d)).handler(deleteResume_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.delete("/ai/resume/" + data.id, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const generateCoverLetter_createServerFn_handler = createServerRpc({
  id: "63bee33169032bb1bcb61d61b987856ecbbf5347b46c6b8f0d635468eb359d30",
  name: "generateCoverLetter",
  filename: "src/lib/ai.functions.ts"
}, (opts) => generateCoverLetter.__executeServer(opts));
const generateCoverLetter = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  resume: anyType(),
  jobRole: stringType().optional(),
  company: stringType().optional()
}).parse(d)).handler(generateCoverLetter_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/cover-letter", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const generateGithubResume_createServerFn_handler = createServerRpc({
  id: "369e6e0d19e450da6b751616ca828372c20a5d4d1aa7c72c701a3ccf373a4726",
  name: "generateGithubResume",
  filename: "src/lib/ai.functions.ts"
}, (opts) => generateGithubResume.__executeServer(opts));
const generateGithubResume = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  username: stringType().trim().min(1).max(40)
}).parse(d)).handler(generateGithubResume_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/github-resume", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const generateMockInterviewQuestions_createServerFn_handler = createServerRpc({
  id: "1e995ef5fdbeb1fd9d883bd50985a7696c614b5408af656c7d84d4f1d52bf46a",
  name: "generateMockInterviewQuestions",
  filename: "src/lib/ai.functions.ts"
}, (opts) => generateMockInterviewQuestions.__executeServer(opts));
const generateMockInterviewQuestions = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  jobRole: stringType(),
  experienceLevel: stringType(),
  interviewType: stringType()
}).parse(d)).handler(generateMockInterviewQuestions_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/mock-interview/questions", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
const evaluateMockInterview_createServerFn_handler = createServerRpc({
  id: "8f2d49c91462eca5aa690f6daf00d15a2502df60fca05cd738811f6cc33135d6",
  name: "evaluateMockInterview",
  filename: "src/lib/ai.functions.ts"
}, (opts) => evaluateMockInterview.__executeServer(opts));
const evaluateMockInterview = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  interviewId: stringType(),
  answers: arrayType(stringType())
}).parse(d)).handler(evaluateMockInterview_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: res
  } = await serverApiClient.post("/ai/mock-interview/evaluate", data, {
    headers: {
      Authorization: `Bearer ${context.token}`
    }
  });
  return res;
});
export {
  analyzeGithub_createServerFn_handler,
  analyzeJobMatch_createServerFn_handler,
  deleteResume_createServerFn_handler,
  evaluateMockInterview_createServerFn_handler,
  generateCoverLetter_createServerFn_handler,
  generateDeveloperScore_createServerFn_handler,
  generateGithubResume_createServerFn_handler,
  generateInterview_createServerFn_handler,
  generateMockInterviewQuestions_createServerFn_handler,
  generateRoadmap_createServerFn_handler,
  getDashboard_createServerFn_handler,
  getDeveloperScoresHistory_createServerFn_handler,
  getJobMatchesHistory_createServerFn_handler,
  getResumes_createServerFn_handler,
  reviewCode_createServerFn_handler,
  saveResume_createServerFn_handler,
  scoreResume_createServerFn_handler,
  updateProfile_createServerFn_handler
};
