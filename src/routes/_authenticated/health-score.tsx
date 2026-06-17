import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
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
  FolderOpen
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/health-score")({
  head: () => ({ meta: [{ title: "Developer Health Score — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: HealthScorePage,
});

function HealthScorePage() {
  const fetcher = useServerFn(getHealthScoreHistory);
  const generator = useServerFn(generateHealthScore);
  const queryClient = useQueryClient();

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
    return <PageLoadingState title="Loading Health Score..." subtitle="Fetching your career readiness data." />;
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

  const chartData = history?.slice().reverse().map((h: any) => ({
    date: format(new Date(h.created_at), "MMM d"),
    score: h.overall_score,
  })) || [];

  const breakdown = [
    { label: "GitHub", score: latest.github_score, icon: Github, color: "text-blue-500", weight: "25%" },
    { label: "Resume", score: latest.resume_score, icon: FileText, color: "text-amber-500", weight: "20%" },
    { label: "Interview", score: latest.interview_score, icon: MessageSquare, color: "text-violet-500", weight: "25%" },
    { label: "Job Match", score: latest.job_match_score, icon: Briefcase, color: "text-pink-500", weight: "20%" },
    { label: "Portfolio", score: latest.portfolio_score, icon: FolderOpen, color: "text-emerald-500", weight: "10%" },
  ];

  return (
    <div className="space-y-8 min-h-screen text-slate-900 dark:text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Career Readiness
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Developer Health Score</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {format(new Date(latest.created_at), "PPp")}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={mut.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${mut.isPending ? "animate-spin" : ""}`} />
          {mut.isPending ? "Calculating..." : "Update Score"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Score Circular Progress */}
        <div className="lg:col-span-1 p-8 rounded-3xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold mb-6 text-center">Overall Readiness</h3>
          <div className="w-48 h-48 relative">
            <CircularProgress value={latest.overall_score} size={192} strokeWidth={16} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black">{latest.overall_score}</span>
              <span className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">Out of 100</span>
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {breakdown.map((b, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-muted/50 ${b.color}`}>
                  <b.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{b.weight} Weight</span>
              </div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase">{b.label}</h4>
              <p className="text-3xl font-black mt-1">{b.score}</p>
            </div>
          ))}
          
          <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm flex flex-col justify-center">
            <h4 className="text-xs font-bold text-indigo-500 uppercase mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Historical Trend
            </h4>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Area type="monotone" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" /> Top Strengths
          </h3>
          <ul className="space-y-3">
            {(latest.strengths as string[])?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-emerald-500 mt-1">•</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" /> Areas to Improve
          </h3>
          <ul className="space-y-3">
            {(latest.weaknesses as string[])?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
            <Lightbulb className="h-5 w-5" /> AI Recommendations
          </h3>
          <ul className="space-y-3">
            {(latest.recommendations as string[])?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-1">•</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
