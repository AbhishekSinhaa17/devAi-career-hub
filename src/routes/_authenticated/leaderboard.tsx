import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { useQuery } from "@tanstack/react-query";
import { PageLoadingState } from "@/components/LoadingStates";
import { useState, useEffect } from "react";
import {
  Trophy,
  Github,
  FileText,
  User,
  Crown,
  Medal,
  Star,
  TrendingUp,
  Sparkles,
  ArrowUp,
} from "lucide-react";

export const fetchLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: scores, error: scoresError } = await context.supabase
      .from("developer_scores")
      .select("user_id, overall_score, resume_score, github_score")
      .order("overall_score", { ascending: false })
      .limit(20);

    if (scoresError) throw new Error(scoresError.message);
    if (!scores || scores.length === 0) return [];

    const userIds = scores.map((s) => s.user_id);
    const { data: profiles, error: profilesError } = await context.supabase
      .from("profiles")
      .select("id, name, avatar_url, github_username")
      .in("id", userIds);

    if (profilesError) throw new Error(profilesError.message);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    return scores.map((score) => {
      const profile = profileMap.get(score.user_id);
      return {
        ...score,
        name: profile?.name || null,
        avatar_url: profile?.avatar_url || null,
        github_username: profile?.github_username || null,
      };
    });
  });

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({ meta: [{ title: "Global Leaderboard — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: LeaderboardPage,
});

// ── Helpers ─────────────────────────────────────────────────────────────────
const RANK_CONFIG = {
  1: {
    label: "Gold",
    color: "#f59e0b",
    glow: "#f59e0b",
    bg: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-400/30 dark:border-amber-500/25",
    badge: "bg-amber-400 dark:bg-amber-500",
    icon: Crown,
    podiumH: "h-28",
    avatarRing: "ring-amber-400 dark:ring-amber-500",
  },
  2: {
    label: "Silver",
    color: "#94a3b8",
    glow: "#94a3b8",
    bg: "from-slate-400/10 to-slate-500/5",
    border: "border-slate-400/30 dark:border-slate-500/25",
    badge: "bg-slate-400 dark:bg-slate-500",
    icon: Medal,
    podiumH: "h-20",
    avatarRing: "ring-slate-400 dark:ring-slate-500",
  },
  3: {
    label: "Bronze",
    color: "#b45309",
    glow: "#d97706",
    bg: "from-orange-700/10 to-orange-800/5",
    border: "border-orange-700/30 dark:border-orange-600/25",
    badge: "bg-orange-700 dark:bg-orange-600",
    icon: Star,
    podiumH: "h-14",
    avatarRing: "ring-orange-600 dark:ring-orange-600",
  },
} as const;

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-indigo-600 dark:text-indigo-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBarColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-indigo-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  url,
  name,
  size = "md",
  ringClass = "",
}: {
  url?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  ringClass?: string;
}) {
  const dims = size === "lg" ? "h-20 w-20" : size === "md" ? "h-12 w-12" : "h-9 w-9";
  const iconDims = size === "lg" ? "h-9 w-9" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const initials = name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${dims} rounded-2xl overflow-hidden flex-shrink-0 ring-2 ${ringClass || "ring-slate-200 dark:ring-white/10"}
        bg-slate-100 dark:bg-white/5 flex items-center justify-center shadow-md`}
    >
      {url ? (
        <img src={url} alt={name || "avatar"} className="w-full h-full object-cover" />
      ) : initials ? (
        <span
          className={`font-black text-slate-500 dark:text-slate-400 ${size === "lg" ? "text-xl" : "text-sm"}`}
        >
          {initials}
        </span>
      ) : (
        <User className={`${iconDims} text-slate-400 dark:text-slate-600`} />
      )}
    </div>
  );
}

// ── Animated score bar ────────────────────────────────────────────────────────
function ScoreBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 300);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ── Animated number ───────────────────────────────────────────────────────────
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now() + delay;
    let raf: number;
    const duration = 1200;
    const tick = () => {
      const now = Date.now();
      if (now < start) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, delay]);
  return <>{display}</>;
}

// ── Podium card ───────────────────────────────────────────────────────────────
function PodiumCard({ data, rank, delay = 0 }: { data: any; rank: 1 | 2 | 3; delay?: number }) {
  const cfg = RANK_CONFIG[rank];
  const RankIcon = cfg.icon;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`group relative flex flex-col items-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {/* Rank badge */}
      <div
        className={`absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full ${cfg.badge} flex items-center justify-center shadow-lg z-20 transition-all duration-300 group-hover:-translate-y-1.5`}
        style={{ boxShadow: `0 0 16px ${cfg.glow}60` }}
      >
        <RankIcon className="h-4 w-4 text-white" />
      </div>

      {/* Card */}
      <div
        className={`relative w-full rounded-3xl border ${cfg.border} overflow-hidden
          bg-gradient-to-b ${cfg.bg}
          bg-white/60 dark:bg-white/[0.03]
          backdrop-blur-sm shadow-xl
          transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl
          p-6 flex flex-col items-center text-center`}
        style={{
          boxShadow: `0 8px 40px ${cfg.glow}15, 0 2px 8px rgba(0,0,0,0.06)`,
        }}
      >
        {/* Glow top strip */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${cfg.color}60, transparent)`,
          }}
        />

        {/* Avatar */}
        <div className="mt-4 mb-4">
          <Avatar
            url={data.avatar_url}
            name={data.name}
            size="lg"
            ringClass={`ring-2 ${cfg.avatarRing}`}
          />
        </div>

        {/* Name */}
        <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-0.5 line-clamp-1 w-full">
          {data.name || data.github_username || "Anonymous"}
        </h3>
        {data.github_username && (
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-4">
            <Github className="h-3 w-3" />@{data.github_username}
          </p>
        )}

        {/* Score */}
        <div className="text-4xl font-black mb-1" style={{ color: cfg.color }}>
          <AnimatedNumber value={data.overall_score || 0} delay={delay + 200} />
        </div>
        <p className="text-[10px] uppercase font-bold tracking-[0.18em] text-slate-400 dark:text-slate-600 mb-4">
          Overall Score
        </p>

        {/* Sub scores */}
        <div className="w-full space-y-2.5 pt-4 border-t border-slate-200/60 dark:border-white/6">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500 font-medium">
              <Github className="h-3 w-3" /> GitHub
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {data.github_score || 0}
            </span>
          </div>
          <ScoreBar
            value={data.github_score || 0}
            color={getScoreBarColor(data.github_score || 0)}
            delay={delay}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500 font-medium">
              <FileText className="h-3 w-3" /> Resume
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {data.resume_score || 0}
            </span>
          </div>
          <ScoreBar
            value={data.resume_score || 0}
            color={getScoreBarColor(data.resume_score || 0)}
            delay={delay + 100}
          />
        </div>
      </div>

      {/* Podium base */}
      <div
        className={`w-full ${cfg.podiumH} rounded-b-2xl mt-0 flex items-center justify-center`}
        style={{
          background: `linear-gradient(to bottom, ${cfg.color}18, ${cfg.color}08)`,
          borderLeft: `1px solid ${cfg.color}20`,
          borderRight: `1px solid ${cfg.color}20`,
          borderBottom: `1px solid ${cfg.color}20`,
        }}
      >
        <span className="text-5xl font-black opacity-20" style={{ color: cfg.color }}>
          {rank}
        </span>
      </div>
    </div>
  );
}

// ── Row (rank 4+) ─────────────────────────────────────────────────────────────
function LeaderboardRow({ user, rank, delay = 0 }: { user: any; rank: number; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const scoreColor = getScoreColor(user.overall_score || 0);
  const barColor = getScoreBarColor(user.overall_score || 0);

  return (
    <div
      className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-500
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
        bg-white dark:bg-white/[0.025]
        border-slate-200/80 dark:border-white/6
        hover:border-indigo-200 dark:hover:border-indigo-500/20
        hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10
        hover:-translate-y-px
        shadow-sm dark:shadow-none`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/[0.02] dark:group-hover:from-indigo-500/[0.04] transition-all duration-300 pointer-events-none" />

      {/* Rank */}
      <div className="w-10 flex-shrink-0 text-center">
        <span className="text-lg font-black text-slate-300 dark:text-white/15 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors duration-300">
          {rank}
        </span>
      </div>

      {/* Avatar */}
      <Avatar url={user.avatar_url} name={user.name} size="sm" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {user.name || user.github_username || "Anonymous Developer"}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-600">
          {user.github_username && (
            <span className="flex items-center gap-1 font-medium">
              <Github className="h-3 w-3" />@{user.github_username}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {user.resume_score || 0}
          </span>
          <span className="flex items-center gap-1">
            <Github className="h-3 w-3" />
            {user.github_score || 0}
          </span>
        </div>
        {/* Score bar */}
        <div className="mt-2 hidden sm:block">
          <ScoreBar value={user.overall_score || 0} color={barColor} delay={delay} />
        </div>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right">
        <div className={`text-2xl font-black ${scoreColor}`}>
          <AnimatedNumber value={user.overall_score || 0} delay={delay} />
        </div>
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-600">
          pts
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function LeaderboardPage() {
  const getLeaderboard = useServerFn(fetchLeaderboard);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getLeaderboard(),
  });

  if (isLoading) {
    return (
      <PageLoadingState
        title="Loading Leaderboard"
        subtitle="Fetching the top developers worldwide..."
      />
    );
  }

  const top3 = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [
    top3[1] ? { data: top3[1], rank: 2 as const, delay: 100 } : null,
    top3[0] ? { data: top3[0], rank: 1 as const, delay: 0 } : null,
    top3[2] ? { data: top3[2], rank: 3 as const, delay: 200 } : null,
  ].filter(Boolean) as { data: any; rank: 1 | 2 | 3; delay: number }[];

  return (
    <div className="pb-12">
      {/* ── Ambient backgrounds ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/4 dark:bg-indigo-500/6 blur-[120px]" />
        <div className="absolute top-32 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-500/3 dark:bg-amber-500/5 blur-[80px]" />
      </div>

      <div className="space-y-10 animate-in fade-in duration-500">
        {/* ── Header ── */}
        <div className="text-center space-y-4 max-w-xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-300/50 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/8">
            <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-[0.15em]">
              Global Rankings
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Developer{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                Leaderboard
              </span>
              <Sparkles className="absolute -top-2 -right-6 h-4 w-4 text-violet-500 dark:text-violet-400 animate-pulse" />
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            Top developers ranked by overall health score across GitHub, resumes, and interviews.
          </p>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Live rankings · {leaderboard?.length || 0} developers
            </span>
          </div>
        </div>

        {/* ── Podium ── */}
        {top3.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-4 items-end">
              {podiumOrder.map((p) => (
                <PodiumCard key={p.rank} data={p.data} rank={p.rank} delay={p.delay} />
              ))}
            </div>

            {/* Podium ground line */}
            <div className="h-px mt-0 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/8 to-transparent" />
          </div>
        )}

        {/* ── Stats strip ── */}
        {leaderboard && leaderboard.length > 0 && (
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
            {[
              {
                label: "Top Score",
                value: leaderboard[0]?.overall_score || 0,
                icon: Trophy,
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-50 dark:bg-amber-500/8 border-amber-200/60 dark:border-amber-500/15",
              },
              {
                label: "Avg Score",
                value: Math.round(
                  leaderboard.reduce((a: number, b: any) => a + (b.overall_score || 0), 0) /
                    leaderboard.length,
                ),
                icon: TrendingUp,
                color: "text-indigo-600 dark:text-indigo-400",
                bg: "bg-indigo-50 dark:bg-indigo-500/8 border-indigo-200/60 dark:border-indigo-500/15",
              },
              {
                label: "Developers",
                value: leaderboard.length,
                icon: Star,
                color: "text-violet-600 dark:text-violet-400",
                bg: "bg-violet-50 dark:bg-violet-500/8 border-violet-200/60 dark:border-violet-500/15",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${stat.bg} shadow-sm dark:shadow-none`}
              >
                <stat.icon className={`h-5 w-5 flex-shrink-0 ${stat.color}`} />
                <div>
                  <p className="text-xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Rest of ranks ── */}
        {rest.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-2.5">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em]">
                Rankings
              </p>
              <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
            </div>
            {rest.map((user: any, idx: number) => (
              <LeaderboardRow key={user.user_id} user={user} rank={idx + 4} delay={idx * 60} />
            ))}
          </div>
        )}

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-700 animate-in fade-in duration-700">
          Rankings update in real-time as developers improve their scores.
        </p>
      </div>
    </div>
  );
}
