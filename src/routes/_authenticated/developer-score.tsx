import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { getDeveloperScoresHistory, generateDeveloperScore } from "@/lib/ai.functions";
import { CircularProgress } from "@/components/ui/circular-progress";
import { PageLoadingState, PageEmptyState } from "@/components/LoadingStates";
import {
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Zap,
  Target,
  Star,
  BarChart3,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/developer-score")({
  head: () => ({ meta: [{ title: "Developer Health Score — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: DeveloperScore,
});

// ─── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  @keyframes float-orb {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(22px,-16px) scale(1.04); }
    66%      { transform:translate(-12px,12px) scale(0.97); }
  }
  @keyframes shimmer {
    from { transform:translateX(-100%); }
    to   { transform:translateX(100%); }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes card-enter {
    from { opacity:0; transform:translateY(14px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes tag-pop {
    from { opacity:0; transform:scale(0.75) translateY(4px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes spin-slow {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes pulse-ring {
    0%   { transform:scale(1);   opacity:0.5; }
    100% { transform:scale(1.7); opacity:0; }
  }
  @keyframes score-pop {
    from { opacity:0; transform:scale(0.7); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes bar-fill {
    from { width:0%; }
  }
  @keyframes celebration-slide {
    from { opacity:0; transform:translateY(-12px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes counter {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* Glass panel — dark default, light override */
  .glass-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(14px);
  }
  :root:not(.dark) .glass-panel {
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(0,0,0,0.08);
    backdrop-filter: blur(14px);
  }

  /* Semantic text */
  .t-heading { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .t-heading { color: rgba(0,0,0,0.88); }
  .t-sub { color: rgba(255,255,255,0.42); }
  :root:not(.dark) .t-sub { color: rgba(0,0,0,0.42); }
  .t-body { color: rgba(255,255,255,0.62); }
  :root:not(.dark) .t-body { color: rgba(0,0,0,0.62); }

  /* Dividers */
  .divider-line { background: rgba(255,255,255,0.06); }
  :root:not(.dark) .divider-line { background: rgba(0,0,0,0.07); }

  /* Row hover */
  .item-row:hover { background: rgba(255,255,255,0.03); }
  :root:not(.dark) .item-row:hover { background: rgba(0,0,0,0.02); }

  /* Radar / Chart theming */
  .recharts-polar-grid-concentric-polygon,
  .recharts-polar-grid-angle line { stroke: rgba(255,255,255,0.08) !important; }
  :root:not(.dark) .recharts-polar-grid-concentric-polygon,
  :root:not(.dark) .recharts-polar-grid-angle line { stroke: rgba(0,0,0,0.09) !important; }

  .btn-primary-glow {
    box-shadow: 0 0 22px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.2);
    transition: box-shadow 0.3s, transform 0.15s;
  }
  .btn-primary-glow:hover:not(:disabled) {
    box-shadow: 0 0 36px rgba(99,102,241,0.55), 0 6px 20px rgba(0,0,0,0.3);
  }
  .btn-primary-glow:active:not(:disabled) { transform:scale(0.97); }

  .btn-ghost {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  :root:not(.dark) .btn-ghost {
    background: rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.1);
  }
  .btn-ghost:hover:not(:disabled) {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.18);
  }
  :root:not(.dark) .btn-ghost:hover:not(:disabled) {
    background: rgba(0,0,0,0.07);
    border-color: rgba(0,0,0,0.18);
  }
  .btn-ghost:active:not(:disabled) { transform:scale(0.97); }
  .btn-ghost:disabled { opacity:0.4; cursor:not-allowed; }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getLevel(score: number) {
  if (score <= 40) return { label: "Beginner", color: "#60a5fa", glow: "#3b82f640" };
  if (score <= 60) return { label: "Developing", color: "#fbbf24", glow: "#f59e0b40" };
  if (score <= 80) return { label: "Job Ready", color: "#34d399", glow: "#10b98140" };
  return { label: "Industry Ready", color: "#a78bfa", glow: "#8b5cf640" };
}

// ─── Shared primitives ─────────────────────────────────────────────────────────

function AccentLine({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg,transparent,${color}70,transparent)` }}
    />
  );
}

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden>
      {[
        { c: "#6366f1", s: 520, x: "4%", y: "4%", d: "0s", t: "18s" },
        { c: "#8b5cf6", s: 360, x: "74%", y: "8%", d: "7s", t: "22s" },
        { c: "#10b981", s: 280, x: "82%", y: "66%", d: "14s", t: "20s" },
        { c: "#f59e0b", s: 220, x: "2%", y: "73%", d: "3s", t: "25s" },
      ].map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.s,
            height: o.s,
            left: o.x,
            top: o.y,
            background: `radial-gradient(circle,${o.c},transparent 70%)`,
            opacity: 0.055,
            animation: `float-orb ${o.t} ${o.d} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Sub-score bar card ────────────────────────────────────────────────────────

function SubScoreBar({
  label,
  value,
  color,
  icon: Icon,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <div className="space-y-2" style={{ animation: `fade-up 0.4s ${delay}ms ease both` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className="h-5 w-5 rounded-md flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <Icon className="h-3 w-3" style={{ color }} />
          </div>
          <span className="text-[11px] font-bold t-sub uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-xs font-black" style={{ color }}>
          {value}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg,${color}80,${color})`,
            animation: `bar-fill 1s ${delay + 200}ms ease both`,
            boxShadow: `0 0 6px ${color}50`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Insight pill ──────────────────────────────────────────────────────────────

function InsightBlock({
  icon: Icon,
  label,
  text,
  color,
  bg,
  border,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  text: string;
  color: string;
  bg: string;
  border: string;
  delay: number;
}) {
  return (
    <div
      className="relative rounded-2xl p-4 space-y-2 overflow-hidden"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        animation: `card-enter 0.4s ${delay}ms ease both`,
      }}
    >
      <div
        className="absolute -right-4 -top-4 h-14 w-14 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle,${color},transparent 70%)` }}
      />
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${border}` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>
          {label}
        </span>
      </div>
      <p className="text-xs t-body leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Tag ──────────────────────────────────────────────────────────────────────

function Tag({
  label,
  color,
  bg,
  border,
  delay,
}: {
  label: string;
  color: string;
  bg: string;
  border: string;
  delay: number;
}) {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-default transition-all duration-200"
      style={{
        color,
        background: bg,
        border: `1px solid ${border}`,
        animation: `tag-pop 0.35s ${delay}ms cubic-bezier(0.34,1.2,0.64,1) both`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${border}`;
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
      }}
    >
      {label}
    </span>
  );
}

// ─── List item ─────────────────────────────────────────────────────────────────

function ListItem({
  text,
  index,
  dot,
  delay,
}: {
  text: string;
  index: number;
  dot: string;
  delay: number;
}) {
  return (
    <div
      className="item-row flex items-start gap-3 p-3 rounded-xl transition-colors duration-200"
      style={{
        border: "1px solid rgba(255,255,255,0.04)",
        animation: `fade-in 0.3s ${delay}ms ease both`,
      }}
    >
      <div
        className="mt-0.5 h-5 w-5 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black"
        style={{ background: `${dot}18`, border: `1px solid ${dot}30`, color: dot }}
      >
        {index + 1}
      </div>
      <span className="text-xs t-body leading-relaxed">{text}</span>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

function DeveloperScore() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const queryClient = useQueryClient();
  const getHistoryFn = useServerFn(getDeveloperScoresHistory);
  const genDevScoreFn = useServerFn(generateDeveloperScore);

  const { data: history, isLoading } = useQuery({
    queryKey: ["developer-scores"],
    queryFn: () => getHistoryFn(),
  });

  const mutation = useMutation({
    mutationFn: () => genDevScoreFn({ data: undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["developer-scores"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Health score updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const currentScore = history?.[0];
  const prevScore = history?.[1];
  const hasScore = !!currentScore;
  const isGenerating = mutation.isPending;

  useEffect(() => {
    if (!isLoading && !hasScore && !isGenerating) mutation.mutate();
  }, [isLoading, hasScore, isGenerating]);

  const trendDiff = prevScore ? (currentScore?.overall_score ?? 0) - prevScore.overall_score : 0;

  // ── Derived data ────────────────────────────────────────────────────────────

  const level = hasScore ? getLevel(currentScore!.overall_score) : null;

  const radarData = hasScore
    ? [
        { name: "Profile", value: currentScore!.profile_score },
        { name: "GitHub", value: currentScore!.github_score },
        { name: "Resume", value: currentScore!.resume_score },
        { name: "Job Match", value: currentScore!.job_match_score },
        { name: "Interview", value: currentScore!.interview_score },
      ]
    : [];

  const trendData = [...(history ?? [])].reverse().map((s) => ({
    date: format(new Date(s.created_at), "MMM d"),
    score: s.overall_score,
  }));

  const aiInsights = currentScore?.ai_insights as {
    why: string;
    biggestStrength: string;
    biggestWeakness: string;
    fastestImprovement: string;
  } | null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{STYLES}</style>
      <BackgroundOrbs />

      <div
        className="space-y-8 pb-16"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(14px)",
          transition: "all 0.55s cubic-bezier(0.34,1.1,0.64,1)",
        }}
      >
        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div style={{ animation: "fade-up 0.5s 0.05s ease both" }}>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit mb-3"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              <Activity className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Career Analytics
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none t-heading">
              Developer
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg,#818cf8 0%,#a78bfa 45%,#34d399 100%)",
                }}
              >
                Health Score
              </span>
            </h1>
            <p className="text-sm t-sub mt-2 max-w-md leading-relaxed">
              A real-time, AI-powered snapshot of your career readiness across every dimension.
            </p>
          </div>

          {hasScore && (
            <button
              onClick={() => mutation.mutate()}
              disabled={isGenerating}
              className="btn-ghost flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-sm t-body disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ animation: "fade-in 0.5s 0.3s ease both" }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              Recalculate
            </button>
          )}
        </header>

        {/* ── States ── */}
        {isLoading && (
          <PageLoadingState
            title="Analyzing your profile…"
            subtitle="Crunching GitHub, Resume, Interviews & Job Matches"
          />
        )}
        {!isLoading && !hasScore && !isGenerating && (
          <PageEmptyState
            title="No score yet"
            subtitle="Generate your first Developer Health Score to unlock career insights."
            onAction={() => mutation.mutate()}
            actionLabel="Generate Score"
          />
        )}
        {!isLoading && !hasScore && isGenerating && (
          <PageLoadingState
            title="Analyzing your profile…"
            subtitle="Crunching GitHub, Resume, Interviews & Job Matches"
          />
        )}

        {/* ── Main content ── */}
        {hasScore && (
          <>
            {/* Celebration banner */}
            {trendDiff >= 10 && (
              <div
                className="relative rounded-2xl p-5 overflow-hidden flex items-center gap-4"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  animation: "celebration-slide 0.5s cubic-bezier(0.34,1.1,0.64,1) both",
                }}
              >
                <AccentLine color="#10b981" />
                <div
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15 pointer-events-none"
                  style={{ background: "radial-gradient(circle,#10b981,transparent 70%)" }}
                />
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(16,185,129,0.15)",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  <Award className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-emerald-400">Incredible Progress!</div>
                  <p className="text-xs t-body mt-0.5">
                    Your score improved by{" "}
                    <span className="font-bold text-emerald-400">+{trendDiff} points</span>. You
                    earned the <span className="font-bold text-emerald-400">Growth Mindset</span>{" "}
                    badge!
                  </p>
                </div>
              </div>
            )}

            {/* ── Hero row: Score + Sub-scores + Level ── */}
            <div
              className="grid gap-5 lg:grid-cols-3"
              style={{ animation: "fade-up 0.5s 0.1s ease both" }}
            >
              {/* Main score */}
              <div
                className="glass-panel relative rounded-2xl p-6 flex flex-col items-center justify-center text-center overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.15s ease both" }}
              >
                <AccentLine color={level!.color} />
                <div
                  className="absolute inset-0 pointer-events-none opacity-10"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%,${level!.color},transparent 70%)`,
                  }}
                />

                {/* Level badge */}
                <div
                  className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                  style={{
                    background: `${level!.color}15`,
                    border: `1px solid ${level!.color}35`,
                    color: level!.color,
                    boxShadow: `0 0 12px ${level!.glow}`,
                  }}
                >
                  {level!.label}
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest t-sub mb-5">
                  DevAI Score
                </div>

                {/* Circular progress */}
                <div
                  className="mb-5"
                  style={{ animation: "score-pop 0.6s 0.3s cubic-bezier(0.34,1.2,0.64,1) both" }}
                >
                  <CircularProgress
                    value={currentScore!.overall_score}
                    size={160}
                    strokeWidth={12}
                  />
                </div>

                {/* Trend badge */}
                {prevScore && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300"
                    style={{
                      background:
                        trendDiff > 0
                          ? "rgba(16,185,129,0.1)"
                          : trendDiff < 0
                            ? "rgba(239,68,68,0.1)"
                            : "rgba(255,255,255,0.05)",
                      border:
                        trendDiff > 0
                          ? "1px solid rgba(16,185,129,0.25)"
                          : trendDiff < 0
                            ? "1px solid rgba(239,68,68,0.25)"
                            : "1px solid rgba(255,255,255,0.1)",
                      color:
                        trendDiff > 0
                          ? "#34d399"
                          : trendDiff < 0
                            ? "#f87171"
                            : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {trendDiff > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : trendDiff < 0 ? (
                      <TrendingDown className="h-3.5 w-3.5" />
                    ) : (
                      <Minus className="h-3.5 w-3.5" />
                    )}
                    {trendDiff > 0 ? "+" : ""}
                    {trendDiff} pts from last scan
                  </div>
                )}
              </div>

              {/* Sub-scores */}
              <div
                className="glass-panel relative rounded-2xl p-6 space-y-5 overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.2s ease both" }}
              >
                <AccentLine color="#6366f1" />
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-7 w-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                    }}
                  >
                    <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <span className="text-xs font-black t-heading">Competency Breakdown</span>
                </div>
                <SubScoreBar
                  label="Profile"
                  value={currentScore!.profile_score}
                  color="#6366f1"
                  icon={Star}
                  delay={0}
                />
                <SubScoreBar
                  label="GitHub"
                  value={currentScore!.github_score}
                  color="#8b5cf6"
                  icon={Activity}
                  delay={60}
                />
                <SubScoreBar
                  label="Resume"
                  value={currentScore!.resume_score}
                  color="#10b981"
                  icon={CheckCircle2}
                  delay={120}
                />
                <SubScoreBar
                  label="Job Match"
                  value={currentScore!.job_match_score}
                  color="#f59e0b"
                  icon={Target}
                  delay={180}
                />
                <SubScoreBar
                  label="Interview"
                  value={currentScore!.interview_score}
                  color="#f472b6"
                  icon={Zap}
                  delay={240}
                />
              </div>

              {/* Radar */}
              <div
                className="glass-panel relative rounded-2xl p-6 flex flex-col overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.25s ease both" }}
              >
                <AccentLine color="#8b5cf6" />
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="h-7 w-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(139,92,246,0.15)",
                      border: "1px solid rgba(139,92,246,0.3)",
                    }}
                  >
                    <Activity className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="text-xs font-black t-heading">Competency Map</span>
                </div>
                <div className="flex-1 min-h-[210px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis
                        dataKey="name"
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700 }}
                      />
                      <Radar
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(15,15,20,0.95)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ── AI Insights ── */}
            {aiInsights && (
              <div
                className="glass-panel relative rounded-2xl p-6 overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.3s ease both" }}
              >
                <AccentLine color="#fbbf24" />
                <div
                  className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full opacity-10 pointer-events-none"
                  style={{ background: "radial-gradient(circle,#fbbf24,transparent 70%)" }}
                />
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="h-8 w-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(245,158,11,0.15)",
                      border: "1px solid rgba(245,158,11,0.3)",
                    }}
                  >
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-black t-heading">AI Career Insights</div>
                    <div className="text-[11px] t-sub mt-0.5">
                      Personalized analysis of your profile
                    </div>
                  </div>
                </div>

                {/* Why box */}
                <div
                  className="relative rounded-xl p-4 mb-4 overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest t-sub mb-2">
                    Why this score?
                  </div>
                  <p className="text-xs t-body leading-relaxed">{aiInsights.why}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <InsightBlock
                    icon={CheckCircle2}
                    label="Biggest Strength"
                    text={aiInsights.biggestStrength}
                    color="#34d399"
                    bg="rgba(16,185,129,0.07)"
                    border="rgba(16,185,129,0.2)"
                    delay={0}
                  />
                  <InsightBlock
                    icon={AlertCircle}
                    label="Biggest Weakness"
                    text={aiInsights.biggestWeakness}
                    color="#f87171"
                    bg="rgba(239,68,68,0.07)"
                    border="rgba(239,68,68,0.2)"
                    delay={60}
                  />
                  <InsightBlock
                    icon={TrendingUp}
                    label="Fastest Improvement"
                    text={aiInsights.fastestImprovement}
                    color="#818cf8"
                    bg="rgba(99,102,241,0.07)"
                    border="rgba(99,102,241,0.2)"
                    delay={120}
                  />
                </div>
              </div>
            )}

            {/* ── Strengths + Weaknesses ── */}
            <div className="grid gap-5 md:grid-cols-2">
              <div
                className="glass-panel relative rounded-2xl p-6 overflow-hidden"
                style={{
                  borderTop: "2px solid #10b981",
                  animation: "card-enter 0.5s 0.35s ease both",
                }}
              >
                <AccentLine color="#10b981" />
                <div
                  className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 pointer-events-none"
                  style={{ background: "radial-gradient(circle,#10b981,transparent 70%)" }}
                />
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="h-7 w-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-black t-heading">Core Strengths</span>
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      color: "#34d399",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    {(currentScore!.strengths as string[])?.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(currentScore!.strengths as string[])?.map((s, i) => (
                    <Tag
                      key={i}
                      label={s}
                      color="#34d399"
                      bg="rgba(16,185,129,0.08)"
                      border="rgba(16,185,129,0.22)"
                      delay={i * 35}
                    />
                  ))}
                </div>
              </div>

              <div
                className="glass-panel relative rounded-2xl p-6 overflow-hidden"
                style={{
                  borderTop: "2px solid #ef4444",
                  animation: "card-enter 0.5s 0.42s ease both",
                }}
              >
                <AccentLine color="#ef4444" />
                <div
                  className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 pointer-events-none"
                  style={{ background: "radial-gradient(circle,#ef4444,transparent 70%)" }}
                />
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="h-7 w-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                    }}
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  </div>
                  <span className="text-xs font-black t-heading">Improvement Areas</span>
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#f87171",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    {(currentScore!.weaknesses as string[])?.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(currentScore!.weaknesses as string[])?.map((w, i) => (
                    <Tag
                      key={i}
                      label={w}
                      color="#f87171"
                      bg="rgba(239,68,68,0.08)"
                      border="rgba(239,68,68,0.22)"
                      delay={i * 35}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Recommendations ── */}
            <div
              className="glass-panel relative rounded-2xl p-6 overflow-hidden"
              style={{ animation: "card-enter 0.5s 0.48s ease both" }}
            >
              <AccentLine color="#6366f1" />
              <div
                className="absolute -right-12 -bottom-12 h-36 w-36 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }}
              />
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  <Target className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-black t-heading">Strategic Recommendations</div>
                  <div className="text-[11px] t-sub mt-0.5">Prioritized actions to level up</div>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {(currentScore!.recommendations as string[])?.map((r, i) => (
                  <ListItem key={i} text={r} index={i} dot="#6366f1" delay={i * 45} />
                ))}
              </div>
            </div>

            {/* ── Projects / Certs / Roles ── */}
            <div className="grid gap-5 md:grid-cols-3">
              {/* Projects */}
              <div
                className="glass-panel relative rounded-2xl p-5 overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.52s ease both" }}
              >
                <AccentLine color="#8b5cf6" />
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="h-7 w-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(139,92,246,0.15)",
                      border: "1px solid rgba(139,92,246,0.3)",
                    }}
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="text-xs font-black t-heading">Suggested Projects</span>
                </div>
                <div className="space-y-2">
                  {(currentScore!.suggested_projects as string[])?.map((p, i) => (
                    <div
                      key={i}
                      className="item-row rounded-xl p-3 text-xs t-body leading-relaxed transition-colors duration-200"
                      style={{
                        border: "1px solid rgba(139,92,246,0.12)",
                        background: "rgba(139,92,246,0.05)",
                        animation: `fade-in 0.3s ${i * 50}ms ease both`,
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Certs */}
              <div
                className="glass-panel relative rounded-2xl p-5 overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.58s ease both" }}
              >
                <AccentLine color="#f59e0b" />
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="h-7 w-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(245,158,11,0.15)",
                      border: "1px solid rgba(245,158,11,0.3)",
                    }}
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <span className="text-xs font-black t-heading">Recommended Certs</span>
                </div>
                <div className="space-y-2">
                  {(currentScore!.certifications as string[])?.map((c, i) => (
                    <div
                      key={i}
                      className="item-row rounded-xl p-3 text-xs t-body leading-relaxed transition-colors duration-200"
                      style={{
                        border: "1px solid rgba(245,158,11,0.12)",
                        background: "rgba(245,158,11,0.05)",
                        animation: `fade-in 0.3s ${i * 50}ms ease both`,
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Job roles */}
              <div
                className="glass-panel relative rounded-2xl p-5 overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.64s ease both" }}
              >
                <AccentLine color="#10b981" />
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="h-7 w-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-black t-heading">Target Job Roles</span>
                </div>
                <div className="flex flex-col gap-2">
                  {(currentScore!.job_roles as string[])?.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 cursor-default"
                      style={{
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.18)",
                        color: "#34d399",
                        animation: `tag-pop 0.4s ${i * 55}ms cubic-bezier(0.34,1.2,0.64,1) both`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.14)";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 0 12px rgba(16,185,129,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.08)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#34d399", boxShadow: "0 0 5px #34d399" }}
                      />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Trend chart ── */}
            {trendData.length > 1 && (
              <div
                className="glass-panel relative rounded-2xl p-6 overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.7s ease both" }}
              >
                <AccentLine color="#6366f1" />
                <div
                  className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full opacity-10 pointer-events-none"
                  style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }}
                />
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="h-8 w-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                    }}
                  >
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm font-black t-heading">Score Progress Over Time</div>
                    <div className="text-[11px] t-sub mt-0.5">{trendData.length} data points</div>
                  </div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.25)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        fontWeight={700}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="rgba(255,255,255,0.25)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        fontWeight={700}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10,10,18,0.95)",
                          border: "1px solid rgba(99,102,241,0.3)",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#818cf8",
                        }}
                        cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#scoreGrad)"
                        dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
                        activeDot={{ fill: "#818cf8", r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
