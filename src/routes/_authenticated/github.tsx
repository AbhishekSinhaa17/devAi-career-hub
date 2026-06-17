import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { analyzeGithub, generateDeveloperScore } from "@/lib/ai.functions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PageLoadingState, PageEmptyState } from "@/components/LoadingStates";
import {
  Github,
  Loader2,
  Sparkles,
  Star,
  GitFork,
  BookOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Code2,
  Zap,
  Search,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

export const Route = createFileRoute("/_authenticated/github")({
  head: () => ({ meta: [{ title: "GitHub Analyzer — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: Page,
});

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const animated = useCountUp(score);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const color =
    score >= 75 ? "#10b981" : score >= 50 ? "#6366f1" : score >= 25 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-border/40"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.2,0.64,1)",
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black" style={{ color }}>
          {animated}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Score
        </span>
      </div>
    </div>
  );
}

// ─── Custom bar tooltip ───────────────────────────────────────────────────────
function CustomBarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl px-3 py-2 shadow-2xl text-sm">
      <p className="font-bold text-foreground">{payload[0]?.payload?.name}</p>
      <p className="text-primary font-semibold">{payload[0]?.value} repos</p>
    </div>
  );
}

// ─── Glass panel ──────────────────────────────────────────────────────────────
function Panel({
  children,
  className = "",
  accentColor,
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden ${className}`}
      style={{
        boxShadow: accentColor
          ? `0 0 0 1px ${accentColor}15, inset 0 1px 0 rgba(255,255,255,0.05)`
          : "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {accentColor && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
const STAT_META = [
  { icon: BookOpen, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  { icon: Star, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  { icon: GitFork, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  { icon: Users, color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  const animated = useCountUp(value);
  const [hovered, setHovered] = useState(false);

  return (
    <Panel
      className="p-5 group cursor-default transition-all duration-400"
      accentColor={hovered ? color : undefined}
    >
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}08 0%, transparent 60%)`,
        }}
      />
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative z-10"
      >
        <div
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-all duration-300 group-hover:scale-110"
          style={{ backgroundColor: bg }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="text-3xl font-black tracking-tight" style={{ color }}>
          {animated.toLocaleString()}
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
          {label}
        </div>
      </div>
    </Panel>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────
const INSIGHT_META = {
  success: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    dotBg: "rgba(16,185,129,0.2)",
  },
  warning: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    dotBg: "rgba(245,158,11,0.2)",
  },
  primary: {
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    dotBg: "rgba(99,102,241,0.2)",
  },
};

function InsightCard({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  tone: "success" | "warning" | "primary";
}) {
  const meta = INSIGHT_META[tone];
  return (
    <Panel className="p-6" accentColor={meta.color}>
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: meta.bg, border: `1px solid ${meta.border}` }}
          >
            <Icon className="h-4 w-4" style={{ color: meta.color }} />
          </div>
          <span className="font-black text-sm tracking-tight text-foreground">{title}</span>
        </div>

        {/* Items */}
        <ul className="space-y-3">
          {items.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-3 group/item"
              style={{
                animation: `fadeSlideIn 0.4s ease-out ${i * 80}ms both`,
              }}
            >
              <div
                className="mt-1.5 h-5 w-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover/item:scale-110"
                style={{ backgroundColor: meta.dotBg }}
              >
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
              </div>
              <span className="text-sm text-foreground/80 leading-relaxed">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

// ─── Language bar colors ──────────────────────────────────────────────────────
const LANG_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ec4899",
  "#38bdf8",
  "#a855f7",
];

// ─── Empty / loading state ────────────────────────────────────────────────────
// ─── Main Page ────────────────────────────────────────────────────────────────
function Page() {
  const [username, setUsername] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fn = useServerFn(analyzeGithub);
  const genDevScoreFn = useServerFn(generateDeveloperScore);

  const mutation = useMutation({
    mutationFn: (u: string) => fn({ data: { username: u } }),
    onSuccess: () => {
      genDevScoreFn({ data: undefined }).catch(console.error);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const data = mutation.data;

  return (
    <div
      className="space-y-8"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(12px)",
        transition: "all 0.6s cubic-bezier(0.34,1.2,0.64,1)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
              <Github className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
                AI Analysis
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            GitHub{" "}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
              Analyzer
            </span>
          </h1>
          <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
            Enter any GitHub username — DevAI fetches the profile and writes an honest AI-powered
            review.
          </p>
        </div>

        {data && (
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card/40 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-all duration-300"
          >
            <ExternalLink className="h-4 w-4" />
            Open on GitHub
          </a>
        )}
      </div>

      {/* ── Search bar ── */}
      <Panel className="p-1.5" accentColor="#6366f1">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) mutation.mutate(username.trim());
          }}
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              className="h-12 pl-11 rounded-xl border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50 font-medium text-sm"
              placeholder="e.g. torvalds, gaearon, sindresorhus…"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending || !username.trim()}
            className="group relative h-12 px-6 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            <span className="relative flex items-center gap-2">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze
                </>
              )}
            </span>
          </button>
        </form>
      </Panel>

      {/* ── Results ── */}
      {!data && mutation.isPending && (
        <PageLoadingState
          title="Analyzing profile…"
          subtitle="We're fetching repositories, computing stats, and generating AI insights."
        />
      )}
      {!data && !mutation.isPending && (
        <PageEmptyState
          title="Enter a GitHub username"
          subtitle="DevAI will fetch the profile, analyze repositories, and write an honest AI review."
          icon={Github}
        >
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mr-1">
              Try:
            </span>
            {["torvalds", "gaearon", "sindresorhus", "tj"].map((ex) => (
              <span
                key={ex}
                className="px-3 py-1 rounded-full text-xs font-bold border border-border/60 bg-muted/40 text-muted-foreground cursor-pointer hover:bg-muted"
                onClick={() => setUsername(ex)}
              >
                {ex}
              </span>
            ))}
          </div>
        </PageEmptyState>
      )}

      {data && (
        <div className="space-y-6" style={{ animation: "fadeSlideIn 0.5s ease-out both" }}>
          {/* ── Profile hero ── */}
          <Panel className="p-6 md:p-8" accentColor="#6366f1">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10 flex flex-wrap items-center gap-6">
              {/* Avatar */}
              {data.stats.avatar_url && (
                <div className="relative flex-shrink-0">
                  <img
                    src={data.stats.avatar_url}
                    alt=""
                    className="h-20 w-20 rounded-2xl object-cover"
                    style={{
                      border: "2px solid rgba(99,102,241,0.3)",
                      boxShadow: "0 0 24px rgba(99,102,241,0.2)",
                    }}
                  />
                  <div
                    className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: "#6366f1",
                      boxShadow: "0 0 10px rgba(99,102,241,0.5)",
                    }}
                  >
                    <Github className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-foreground">
                    {data.stats.name ?? username}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20 bg-primary/5 text-primary">
                    @{username}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {data.summary}
                </p>

                {/* Tag pills */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { icon: Code2, label: `${data.stats.public_repos} repos`, color: "#6366f1" },
                    { icon: Users, label: `${data.stats.followers} followers`, color: "#10b981" },
                    { icon: TrendingUp, label: "AI Analyzed", color: "#8b5cf6" },
                  ].map((tag) => (
                    <div
                      key={tag.label}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                      style={{
                        backgroundColor: `${tag.color}10`,
                        border: `1px solid ${tag.color}20`,
                        color: tag.color,
                      }}
                    >
                      <tag.icon className="h-3 w-3" />
                      {tag.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Score ring */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <ScoreRing score={data.score} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Dev Score
                </span>
              </div>
            </div>
          </Panel>

          {/* ── Stats ── */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: "Public Repos", value: data.stats.public_repos },
              { label: "Total Stars", value: data.stats.total_stars },
              { label: "Total Forks", value: data.stats.total_forks },
              { label: "Followers", value: data.stats.followers },
            ].map((s, i) => (
              <StatCard
                key={s.label}
                icon={STAT_META[i].icon}
                label={s.label}
                value={s.value}
                color={STAT_META[i].color}
                bg={STAT_META[i].bg}
              />
            ))}
          </div>

          {/* ── Languages chart ── */}
          <Panel className="p-6" accentColor="#8b5cf6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-sm">Top Languages</h3>
                  <p className="text-[11px] text-muted-foreground">By repository count</p>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end max-w-xs">
                {data.stats.languages.slice(0, 4).map((l: any, i: number) => (
                  <div key={l.name} className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: LANG_COLORS[i] }}
                    />
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {l.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.stats.languages}
                  barSize={32}
                  style={{ animation: "fadeSlideIn 0.6s ease-out both" }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="transparent"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="transparent"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: "rgba(99,102,241,0.05)" }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {data.stats.languages.map((_: any, i: number) => (
                      <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* ── Insights ── */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-black text-foreground">AI Insights</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  AI Generated
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InsightCard
                icon={CheckCircle2}
                title="Strengths"
                items={data.strengths}
                tone="success"
              />
              <InsightCard
                icon={AlertTriangle}
                title="Weaknesses"
                items={data.weaknesses}
                tone="warning"
              />
              <InsightCard
                icon={Lightbulb}
                title="Suggestions"
                items={data.suggestions}
                tone="primary"
              />
            </div>
          </div>

          {/* ── CTA ── */}
          <Panel className="p-6 md:p-8" accentColor="#10b981">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-black text-foreground">Turn this into a resume</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Generate an ATS-optimized resume from this GitHub analysis.
                  </p>
                </div>
              </div>
              <a
                href="/github-resume"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white flex-shrink-0 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  boxShadow: "0 0 20px rgba(16,185,129,0.25)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <span className="relative">Generate GitHub Resume</span>
                <ArrowRight className="h-4 w-4 relative transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </Panel>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
