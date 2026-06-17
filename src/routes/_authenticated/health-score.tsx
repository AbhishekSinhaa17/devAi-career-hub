import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { getHealthScoreHistory, generateHealthScore } from "@/lib/health.functions";
import { CircularProgress } from "@/components/ui/circular-progress";
import { PageLoadingState, PageEmptyState } from "@/components/LoadingStates";
import {
  Activity,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Github,
  FileText,
  MessageSquare,
  Briefcase,
  FolderOpen,
  Zap,
  ArrowUpRight,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/health-score")({
  head: () => ({ meta: [{ title: "Developer Health Score — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: HealthScorePage,
});

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({
  value,
  duration = 1500,
  className = "",
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const radius = 88;
  const stroke = 10;
  const normalised = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalised;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circumference - (score / 100) * circumference), 200);
    return () => clearTimeout(t);
  }, [score, circumference]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return { stroke: "#10b981", glow: "#10b981" };
    if (s >= 60) return { stroke: "#6366f1", glow: "#6366f1" };
    if (s >= 40) return { stroke: "#f59e0b", glow: "#f59e0b" };
    return { stroke: "#ef4444", glow: "#ef4444" };
  };

  const colors = getScoreColor(score);

  return (
    <div className="relative flex items-center justify-center">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000"
        style={{ background: colors.glow }}
      />

      <svg width={radius * 2} height={radius * 2} className="-rotate-90 drop-shadow-2xl">
        {/* Track */}
        <circle
          cx={radius}
          cy={radius}
          r={normalised}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-200 dark:text-white/5"
        />
        {/* Progress */}
        <circle
          cx={radius}
          cy={radius}
          r={normalised}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.8s cubic-bezier(0.34,1.56,0.64,1)",
            filter: `drop-shadow(0 0 8px ${colors.glow})`,
          }}
        />
        {/* Tick marks */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * 360;
          const rad = (angle * Math.PI) / 180;
          const x1 = radius + (normalised - 14) * Math.cos(rad);
          const y1 = radius + (normalised - 14) * Math.sin(rad);
          const x2 = radius + (normalised - 10) * Math.cos(rad);
          const y2 = radius + (normalised - 10) * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth={1}
              opacity={0.1}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter
          value={score}
          className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white"
        />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mt-1">
          out of 100
        </span>
        <div
          className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: `${colors.glow}22`,
            color: colors.glow,
            border: `1px solid ${colors.glow}44`,
          }}
        >
          {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work"}
        </div>
      </div>
    </div>
  );
}

// ─── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({
  label,
  score,
  icon: Icon,
  gradient,
  weight,
  delay = 0,
}: {
  label: string;
  score: number;
  icon: any;
  gradient: string;
  weight: string;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const pct = (score / 100) * 100;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-500 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:-translate-y-0.5 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Gradient top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${gradient.split(" ")[1]?.replace("to-", "") || "#6366f1"}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="p-2.5 rounded-xl"
          style={{
            background: `${gradient.includes("blue") ? "#3b82f6" : gradient.includes("amber") ? "#f59e0b" : gradient.includes("violet") ? "#8b5cf6" : gradient.includes("pink") ? "#ec4899" : "#10b981"}18`,
          }}
        >
          <Icon
            className="h-4 w-4"
            style={{
              color: gradient.includes("blue")
                ? "#60a5fa"
                : gradient.includes("amber")
                  ? "#fbbf24"
                  : gradient.includes("violet")
                    ? "#a78bfa"
                    : gradient.includes("pink")
                      ? "#f472b6"
                      : "#34d399",
            }}
          />
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider">
          {weight}
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <AnimatedCounter value={score} duration={1200} className="text-3xl font-black text-slate-900 dark:text-white" />
        <ArrowUpRight className="h-4 w-4 text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/40 transition-colors" />
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: visible ? `${pct}%` : "0%",
            background: gradient.includes("blue")
              ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
              : gradient.includes("amber")
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : gradient.includes("violet")
                  ? "linear-gradient(90deg, #8b5cf6, #a78bfa)"
                  : gradient.includes("pink")
                    ? "linear-gradient(90deg, #ec4899, #f472b6)"
                    : "linear-gradient(90deg, #10b981, #34d399)",
            transitionDelay: `${delay + 400}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0d0d1a]/90 backdrop-blur-md shadow-2xl">
      <p className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-black text-slate-900 dark:text-white">{payload[0].value}</p>
    </div>
  );
}

// ─── Insight Item ──────────────────────────────────────────────────────────────
function InsightItem({ text, color, delay = 0 }: { text: string; color: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <li
      className={`flex items-start gap-3 text-sm leading-relaxed transition-all duration-500 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="text-slate-700 dark:text-white/60">{text}</span>
    </li>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
function HealthScorePage() {
  const fetcher = useServerFn(getHealthScoreHistory);
  const generator = useServerFn(generateHealthScore);
  const queryClient = useQueryClient();
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    })),
  );

  const { data: history, isLoading } = useQuery({
    queryKey: ["health-score"],
    queryFn: () => fetcher({ data: {} }),
  });

  const mut = useMutation({
    mutationFn: () => generator({ data: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      toast.success("Health Score updated!");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <PageLoadingState
        title="Loading Health Score..."
        subtitle="Fetching your career readiness data."
      />
    );
  }

  const latest = history?.[0];
  const handleGenerate = () => mut.mutate();

  if (!latest) {
    return (
      <PageEmptyState
        title="No Health Score Yet"
        subtitle="Generate your first Career Readiness Score based on your DevAI platform usage."
        icon={Activity}
        actionLabel={mut.isPending ? "Calculating..." : "Generate Score"}
        onAction={handleGenerate}
      />
    );
  }

  const chartData =
    history
      ?.slice()
      .reverse()
      .map((h: any) => ({
        date: format(new Date(h.created_at), "MMM d"),
        score: h.overall_score,
      })) || [];

  const breakdown = [
    {
      label: "GitHub",
      score: latest.github_score,
      icon: Github,
      gradient: "from-blue-600 to-blue-400",
      color: "#60a5fa",
      weight: "25%",
    },
    {
      label: "Resume",
      score: latest.resume_score,
      icon: FileText,
      gradient: "from-amber-600 to-amber-400",
      color: "#fbbf24",
      weight: "20%",
    },
    {
      label: "Interview",
      score: latest.interview_score,
      icon: MessageSquare,
      gradient: "from-violet-600 to-violet-400",
      color: "#a78bfa",
      weight: "25%",
    },
    {
      label: "Job Match",
      score: latest.job_match_score,
      icon: Briefcase,
      gradient: "from-pink-600 to-pink-400",
      color: "#f472b6",
      weight: "20%",
    },
    {
      label: "Portfolio",
      score: latest.portfolio_score,
      icon: FolderOpen,
      gradient: "from-emerald-600 to-emerald-400",
      color: "#34d399",
      weight: "10%",
    },
  ];

  const insightSections = [
    {
      key: "strengths",
      title: "Strengths",
      icon: CheckCircle2,
      color: "#10b981",
      bgColor: "#10b98110",
      borderColor: "#10b98122",
      data: latest.strengths as string[],
    },
    {
      key: "weaknesses",
      title: "Improve",
      icon: AlertCircle,
      color: "#ef4444",
      bgColor: "#ef444410",
      borderColor: "#ef444422",
      data: latest.weaknesses as string[],
    },
    {
      key: "recommendations",
      title: "Recommendations",
      icon: Lightbulb,
      color: "#f59e0b",
      bgColor: "#f59e0b10",
      borderColor: "#f59e0b22",
      data: latest.recommendations as string[],
    },
  ];

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-white overflow-hidden">
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-emerald-600/5 blur-[80px]" />
      </div>

      {/* ── Floating particles ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-indigo-400/20 animate-pulse"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="space-y-6 pb-10">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/8 mb-3">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.15em]">
                AI-Powered Career Intelligence
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Developer Health Score
            </h1>
            <p className="text-sm text-slate-500 dark:text-white/35 mt-1.5">
              Last analysed{" "}
              <span className="text-slate-700 dark:text-white/55">{format(new Date(latest.created_at), "PPp")}</span>
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={mut.isPending}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 font-bold text-sm rounded-2xl overflow-hidden transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-px rounded-[14px] bg-gradient-to-b from-white/15 to-transparent" />
            <RefreshCw className={`relative h-4 w-4 ${mut.isPending ? "animate-spin" : ""}`} />
            <span className="relative">{mut.isPending ? "Calculating…" : "Refresh Score"}</span>
            {!mut.isPending && <Zap className="relative h-3.5 w-3.5 text-yellow-300" />}
          </button>
        </div>

        {/* ── Hero row ── */}
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Score panel */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/[0.03] backdrop-blur-sm p-8 flex flex-col items-center justify-center min-h-[340px]">
            {/* Corner glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

            <p className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-6">
              Overall Readiness
            </p>
            <ScoreRing score={latest.overall_score} />

            {/* Trend indicator */}
            {chartData.length >= 2 && (
              <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8">
                {chartData[chartData.length - 1].score >= chartData[chartData.length - 2].score ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">
                      +
                      {chartData[chartData.length - 1].score -
                        chartData[chartData.length - 2].score}{" "}
                      pts since last check
                    </span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-xs font-bold text-red-400">
                      {chartData[chartData.length - 1].score -
                        chartData[chartData.length - 2].score}{" "}
                      pts since last check
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Chart panel */}
          <div className="lg:col-span-3 relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/[0.03] backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">
                  Score History
                </p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Career Trajectory</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400">Live</span>
              </div>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#scoreGrad)"
                    dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
                    activeDot={{
                      fill: "#6366f1",
                      stroke: "#a5b4fc",
                      strokeWidth: 3,
                      r: 6,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Metric breakdown ── */}
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-4">
            Score Breakdown
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {breakdown.map((b, i) => (
              <MetricCard
                key={b.label}
                label={b.label}
                score={b.score}
                icon={b.icon}
                gradient={b.gradient}
                weight={b.weight}
                delay={i * 80}
              />
            ))}
          </div>
        </div>

        {/* ── AI Insights ── */}
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-4">
            AI Insights
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {insightSections.map((section) => (
              <div
                key={section.key}
                className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8 backdrop-blur-sm p-6"
                style={{
                  background: section.bgColor,
                  borderColor: section.borderColor,
                }}
              >
                {/* Subtle glow top-right */}
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
                  style={{ background: section.color }}
                />

                <div className="flex items-center gap-2.5 mb-5">
                  <div className="p-2 rounded-xl" style={{ background: `${section.color}18` }}>
                    <section.icon className="h-4 w-4" style={{ color: section.color }} />
                  </div>
                  <h3
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: section.color }}
                  >
                    {section.title}
                  </h3>
                </div>

                <ul className="space-y-3.5">
                  {section.data?.map((text, i) => (
                    <InsightItem key={i} text={text} color={section.color} delay={i * 100} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
