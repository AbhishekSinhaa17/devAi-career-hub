import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/ai.functions";
import {
  Github,
  FileText,
  Code2,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Activity,
  Briefcase,
  Star,
  FileBadge,
  Zap,
  Medal,
  Trophy,
  Sparkles,
  GitBranch,
  Brain,
  Rocket,
  BarChart3,
  ChevronRight,
  Cpu,
} from "lucide-react";
import {
  Bar,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: Dashboard,
});

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
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

// ─── Glowing orb background ───────────────────────────────────────────────────
function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full bg-indigo-600/10 dark:bg-indigo-600/8 blur-3xl animate-pulse" />
      <div
        className="absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-violet-600/10 dark:bg-violet-600/6 blur-3xl"
        style={{ animation: "pulse 4s ease-in-out 1s infinite" }}
      />
      <div
        className="absolute -bottom-40 left-1/3 w-[350px] h-[350px] rounded-full bg-purple-600/10 dark:bg-purple-600/6 blur-3xl"
        style={{ animation: "pulse 5s ease-in-out 2s infinite" }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ─── Dev Score Ring ───────────────────────────────────────────────────────────
function DevScoreRing({ score, trend }: { score: number; trend: number }) {
  const animScore = useCountUp(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animScore / 100) * circumference;

  const color =
    score >= 75 ? "#10b981" : score >= 50 ? "#6366f1" : score >= 25 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-8">
      {/* Ring */}
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" className="-rotate-90">
          {/* Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            className="stroke-slate-200 dark:stroke-white/5"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)",
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-black" style={{ color }}>
            {animScore}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Score
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">
            Career Health
          </p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Developer Score</h2>
          <p className="text-slate-600 dark:text-slate-500 text-sm mt-1">
            Your comprehensive career readiness rating
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor:
                trend > 0
                  ? "rgba(16,185,129,0.1)"
                  : trend < 0
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(100,116,139,0.1)", // Light mode friendly neutral
              color: trend > 0 ? "#10b981" : trend < 0 ? "#ef4444" : "#64748b",
              border: `1px solid ${trend > 0 ? "rgba(16,185,129,0.2)" : trend < 0 ? "rgba(239,68,68,0.2)" : "rgba(100,116,139,0.2)"}`,
            }}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend)} pts this week
          </div>
        </div>
        <Link to="/developer-score">
          <button
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-300 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            <span className="relative">View Full Report</span>
            <ArrowRight className="h-4 w-4 relative transition-transform group-hover:translate-x-0.5" />
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── Metric Bar Card ──────────────────────────────────────────────────────────
function MetricCard({
  label,
  value,
  loading,
  icon: Icon,
  color = "#6366f1",
}: {
  label: string;
  value: number;
  loading: boolean;
  icon: React.ElementType;
  color?: string;
}) {
  const animated = useCountUp(value);

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 overflow-hidden group hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-500 shadow-sm dark:shadow-none">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${color}10 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="h-4.5 w-4.5" style={{ color }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600">
            {label}
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-4xl font-black text-slate-900 dark:text-white">
            {loading ? "—" : animated}
          </span>
          <span className="text-slate-500 dark:text-slate-600 text-sm font-semibold">/100</span>
        </div>

        {/* Progress track */}
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${animated}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
              boxShadow: `0 0 8px ${color}60`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Radar chart custom tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#0f0f1e]/95 backdrop-blur-xl px-3 py-2 text-sm shadow-xl dark:shadow-2xl">
      <p className="font-bold text-slate-900 dark:text-white">{payload[0]?.payload?.name}</p>
      <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
        {payload[0]?.value} / 100
      </p>
    </div>
  );
}

// ─── Glass Panel ──────────────────────────────────────────────────────────────
function GlassPanel({
  children,
  className = "",
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm dark:shadow-none ${className}`}
      style={{
        boxShadow: glow ? `0 0 40px ${glow}` : undefined,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  label,
  accent = "#6366f1",
}: {
  icon: React.ElementType;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div
        className="h-6 w-6 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${accent}20` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
    </div>
  );
}

// ─── Action Card ──────────────────────────────────────────────────────────────
const ACTION_COLORS: Record<string, { color: string; glow: string }> = {
  "/mock-interview": { color: "#8b5cf6", glow: "rgba(139,92,246,0.2)" },
  "/github-resume": { color: "#10b981", glow: "rgba(16,185,129,0.2)" },
  "/developer-score": { color: "#6366f1", glow: "rgba(99,102,241,0.2)" },
  "/github": { color: "#f59e0b", glow: "rgba(245,158,11,0.2)" },
  "/resume": { color: "#3b82f6", glow: "rgba(59,130,246,0.2)" },
  "/interview": { color: "#ec4899", glow: "rgba(236,72,153,0.2)" },
};

function ActionCard({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  const router = useRouter();
  const { color, glow } = ACTION_COLORS[to] ?? {
    color: "#6366f1",
    glow: "rgba(99,102,241,0.2)",
  };
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={to}
      onClick={() => router.invalidate()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 overflow-hidden cursor-pointer h-full shadow-sm dark:shadow-none"
        style={{
          transition: "all 0.4s cubic-bezier(0.34,1.2,0.64,1)",
          borderColor: hovered ? `${color}30` : undefined,
          transform: hovered ? "translateY(-3px)" : "none",
          boxShadow: hovered ? `0 16px 40px ${glow}` : undefined,
        }}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}10 0%, transparent 60%)`,
            opacity: hovered ? 1 : 0,
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        <div className="relative z-10">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
            style={{
              backgroundColor: `${color}18`,
              boxShadow: hovered ? `0 0 16px ${color}40` : "none",
            }}
          >
            <Icon
              className="h-5 w-5 transition-transform duration-300"
              style={{
                color,
                transform: hovered ? "scale(1.15) rotate(5deg)" : "scale(1)",
              }}
            />
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-600 leading-relaxed">
                {desc}
              </p>
            </div>
            <ChevronRight
              className="h-4 w-4 flex-shrink-0 mt-0.5 transition-all duration-300"
              style={{
                color: hovered ? color : "#64748b",
                transform: hovered ? "translateX(2px)" : "none",
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Row components ───────────────────────────────────────────────────────────
function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/[0.04] last:border-0">
      <dt className="text-xs text-slate-500 dark:text-slate-600 font-semibold uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-sm font-bold text-slate-700 dark:text-slate-300">{value}</dd>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  label,
  value,
  color = "#6366f1",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-600 font-bold">
          {label}
        </div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-300 truncate mt-0.5">
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const fetcher = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetcher(),
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const scores = [
    { name: "Profile", value: data?.profileCompletion ?? 0 },
    { name: "GitHub", value: data?.githubScore ?? 0 },
    { name: "Resume", value: data?.resumeScore ?? 0 },
    { name: "Portfolio", value: data?.portfolioScore ?? 0 },
    { name: "Interview", value: data?.interviewReady ?? 0 },
  ];

  const firstName = data?.profile?.name?.split(" ")[0] ?? null;

  return (
    <div
      className="space-y-8 min-h-screen text-slate-900 dark:text-foreground"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(12px)",
        transition: "all 0.6s cubic-bezier(0.34,1.2,0.64,1)",
      }}
    >
      <BackgroundOrbs />

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Live Dashboard
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {firstName ? (
              <>
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  {firstName}
                </span>{" "}
                👋
              </>
            ) : (
              "Your Dashboard"
            )}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-500 text-sm">
            Here's how your developer career is shaping up today.
          </p>
        </div>

        {/* AI pulse badge */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none">
          <Cpu className="h-4 w-4 text-violet-500 dark:text-violet-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            AI powered
          </span>
        </div>
      </div>

      {/* ── Hero: Dev Score ── */}
      <GlassPanel className="p-8" glow="rgba(99,102,241,0.06)">
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <DevScoreRing score={data?.devScore ?? 0} trend={data?.devScoreTrend ?? 0} />

          {/* Metric pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 max-w-xl">
            {scores.map((s, i) => {
              const colors = ["#6366f1", "#10b981", "#f59e0b", "#38bdf8", "#8b5cf6"];
              const icons = [Activity, GitBranch, FileText, Rocket, Brain];
              const Icon = icons[i];
              return (
                <div
                  key={s.name}
                  className="rounded-xl border border-slate-200 dark:border-white/[0.05] bg-slate-50 dark:bg-white/[0.02] px-4 py-3 group hover:border-slate-300 dark:hover:border-white/[0.1] transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-3.5 w-3.5" style={{ color: colors[i] }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600">
                      {s.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-black" style={{ color: colors[i] }}>
                      {s.value}
                    </span>
                    <span className="text-slate-500 dark:text-slate-700 text-xs">/100</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-200 dark:bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${s.value}%`,
                        background: colors[i],
                        boxShadow: `0 0 6px ${colors[i]}80`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassPanel>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Completion */}
        <MetricCard
          label="Profile"
          value={data?.profileCompletion ?? 0}
          loading={isLoading}
          icon={Activity}
          color="#6366f1"
        />

        {/* Mock Interview Gamification */}
        <GlassPanel className="p-5">
          <SectionHeader icon={Trophy} label="Interview Stats" accent="#f59e0b" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-600 uppercase tracking-widest font-bold mb-1">
                Best Score
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white flex items-end gap-1">
                {data?.profile?.best_interview_score ?? 0}
                <Star className="h-4 w-4 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 mb-1" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-600 uppercase tracking-widest font-bold mb-1">
                Streak
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white flex items-end gap-1">
                {data?.profile?.interview_streak ?? 0}
                <Zap className="h-4 w-4 text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400 mb-1" />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-white/[0.04] pt-3">
            <div className="text-[10px] text-slate-500 dark:text-slate-600 uppercase tracking-widest font-bold mb-2">
              Badges
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(data?.profile?.badges || []).length > 0 ? (
                (data?.profile?.badges || []).slice(-3).map((b: string) => (
                  <span
                    key={b}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight"
                    style={{
                      backgroundColor: "rgba(245,158,11,0.1)",
                      color: "#f59e0b",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}
                  >
                    <Medal className="h-3 w-3" />
                    {b}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-700">
                  Take a mock interview to earn badges
                </span>
              )}
            </div>
          </div>
        </GlassPanel>

        {/* GitHub Resume */}
        <GlassPanel className="p-5">
          <SectionHeader icon={FileBadge} label="GitHub Resume" accent="#10b981" />
          {data?.githubResume ? (
            <div className="space-y-2">
              <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {data.githubResume.developer_type}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {((data.githubResume.badges as string[]) || []).slice(0, 3).map((b: string) => (
                  <span
                    key={b}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: "rgba(16,185,129,0.1)",
                      color: "#10b981",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-600 mt-2">
                Generated {new Date(data.githubResume.created_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-600 leading-relaxed">
              No resume yet. Run the AI generator to extract your GitHub experience.
            </p>
          )}
          <Link
            to="/github-resume"
            className="flex items-center gap-1.5 mt-4 text-xs font-bold transition-colors"
            style={{ color: "#10b981" }}
          >
            {((data?.githubResume as any)?.insights || []).length > 0
              ? "Insights available"
              : "No insights yet"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </GlassPanel>

        {/* Latest Mock Interview */}
        <GlassPanel className="p-5">
          <SectionHeader icon={MessageSquare} label="Latest Interview" accent="#8b5cf6" />
          {data?.mockInterview ? (
            <div className="space-y-2">
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {data.mockInterview.job_role}
              </div>
              <div className="text-4xl font-black" style={{ color: "#8b5cf6" }}>
                {data.mockInterview.overall_score}
                <span className="text-slate-400 dark:text-slate-600 text-lg font-bold">/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.mockInterview.overall_score}%`,
                    background: "#8b5cf6",
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-600">
                {new Date(data.mockInterview.created_at).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-600 leading-relaxed">
              No interviews yet. Test your skills with a real-world scenario.
            </p>
          )}
          <Link
            to="/mock-interview"
            className="flex items-center gap-1.5 mt-4 text-xs font-bold transition-colors"
            style={{ color: "#8b5cf6" }}
          >
            {data?.mockInterview ? "Take Another" : "Start Simulator"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </GlassPanel>
      </div>

      {/* ── Radar + Insights ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Radar */}
        <GlassPanel className="p-6 lg:col-span-2">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          <SectionHeader icon={BarChart3} label="Career Radar" accent="#6366f1" />

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={scores} outerRadius="75%">
                <PolarGrid className="stroke-slate-200 dark:stroke-white/5" gridType="polygon" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
                <Radar
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Activity + Insights */}
        <GlassPanel className="p-6">
          <SectionHeader icon={Activity} label="Activity" accent="#38bdf8" />

          <dl className="space-y-0 mb-6">
            <DataRow label="Code reviews" value={data?.codeReviewCount ?? 0} />
            <DataRow label="Interview sessions" value={data?.interviewCount ?? 0} />
            <DataRow
              label="GitHub"
              value={data?.githubUsername ?? data?.profile?.github_username ?? "—"}
            />
            <DataRow label="Experience" value={data?.profile?.experience_level ?? "—"} />
          </dl>

          <div className="border-t border-slate-100 dark:border-white/[0.04] pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-600">
                AI Insights
              </span>
            </div>

            {data?.githubResume ? (
              <div className="space-y-1 divide-y divide-slate-100 dark:divide-white/[0.04]">
                <InsightRow
                  icon={Star}
                  label="Top Skill"
                  value={(data.githubResume.resume_data as any)?.skills?.[0] ?? "N/A"}
                  color="#f59e0b"
                />
                <InsightRow
                  icon={Briefcase}
                  label="Best Project"
                  value={
                    ((data.githubResume.resume_data as any)?.projects || []).length > 0
                      ? `${((data.githubResume.resume_data as any)?.projects || []).length} projects highlighted`
                      : "N/A"
                  }
                  color="#10b981"
                />
                <InsightRow
                  icon={TrendingUp}
                  label="Learn Next"
                  value={(data.githubResume as any)?.insights?.missingSkills?.[0] ?? "N/A"}
                  color="#6366f1"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-white/[0.05] bg-slate-50 dark:bg-white/[0.02] p-3 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-600">
                  Generate a GitHub Resume to unlock deep AI insights
                </p>
                <Link
                  to="/github-resume"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mt-1 inline-block"
                >
                  Get started →
                </Link>
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Quick Actions</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-white/[0.06] to-transparent" />
          <span className="text-xs text-slate-500 dark:text-slate-600 font-semibold uppercase tracking-widest">
            6 tools
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            to="/mock-interview"
            icon={MessageSquare}
            title="Mock Interview"
            desc="Full AI interview simulator with scoring."
          />
          <ActionCard
            to="/github-resume"
            icon={FileBadge}
            title="GitHub Resume"
            desc="AI-generate a resume from your repos."
          />
          <ActionCard
            to="/developer-score"
            icon={Activity}
            title="Developer Score"
            desc="View your full career readiness analytics."
          />
          <ActionCard
            to="/github"
            icon={Github}
            title="Analyze GitHub"
            desc="Full AI breakdown of your public work."
          />
          <ActionCard
            to="/resume"
            icon={FileText}
            title="Build Resume"
            desc="ATS-friendly resumes with live scoring."
          />
          <ActionCard
            to="/interview"
            icon={MessageSquare}
            title="Interview Hub"
            desc="Practice quick tailored questions."
          />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
