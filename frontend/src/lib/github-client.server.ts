const GITHUB_API_BASE = "https://api.github.com";
const USER_AGENT = "DevAI";

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github+json",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly isRateLimited: boolean,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

async function githubGet<T>(path: string, retries = 2): Promise<T> {
  const url = path.startsWith("http") ? path : `${GITHUB_API_BASE}${path}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: getHeaders() });

    if (res.ok) {
      return res.json() as Promise<T>;
    }

    const isRateLimited = res.status === 403 || res.status === 429;
    const remaining = res.headers.get("x-ratelimit-remaining");

    if (isRateLimited && remaining === "0") {
      const resetEpoch = Number(res.headers.get("x-ratelimit-reset") ?? 0);
      const resetDate = new Date(resetEpoch * 1000);
      const hasToken = !!process.env.GITHUB_TOKEN;
      throw new GitHubApiError(
        `GitHub API rate limit exceeded. Resets at ${resetDate.toISOString()}.${
          hasToken ? "" : " Consider adding GITHUB_TOKEN for higher limits."
        }`,
        res.status,
        true,
      );
    }

    if (res.status >= 500 && attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      continue;
    }

    if (isRateLimited && attempt < retries) {
      const retryAfter = res.headers.get("retry-after");
      const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      continue;
    }

    if (res.status === 404) {
      throw new GitHubApiError("GitHub user not found", 404, false);
    }

    throw new GitHubApiError(
      `GitHub API error: ${res.status} ${res.statusText}`,
      res.status,
      false,
    );
  }

  throw new Error("Unreachable");
}

export interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  bio: string | null;
  name: string | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  updated_at: string;
  topics?: string[];
  watchers_count?: number;
}

export function fetchGitHubUser(username: string): Promise<GitHubUser> {
  return githubGet<GitHubUser>(`/users/${username}`);
}

export async function fetchGitHubRepos(
  username: string,
  opts: { perPage?: number; sort?: "updated" | "pushed" } = {},
): Promise<GitHubRepo[]> {
  const perPage = opts.perPage ?? 100;
  const sort = opts.sort ?? "updated";
  const repos = await githubGet<GitHubRepo[]>(
    `/users/${username}/repos?per_page=${perPage}&sort=${sort}`,
  );
  return repos;
}
