import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { getDeveloperScoresHistory, generateDeveloperScore } from "@/lib/ai.functions";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Button } from "@/components/ui/button";
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
  FolderOpen
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
  component: DeveloperScore,
});

function DeveloperScore() {
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

  // Auto trigger generation if no score
  useEffect(() => {
    if (!isLoading && !hasScore && !isGenerating) {
      mutation.mutate();
    }
  }, [isLoading, hasScore, isGenerating, mutation]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading analytics...</div>;
  }

  if (!hasScore && !isGenerating) {
    return (
      <div className="flex h-96 flex-col items-center justify-center p-8 text-center">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
        <h2 className="text-xl font-medium mb-2">No score available yet</h2>
        <p className="text-muted-foreground mb-6">Generate your first Developer Health Score to see your insights.</p>
        <Button onClick={() => mutation.mutate()} className="gap-2 rounded-full">
          Generate Score <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (isGenerating && !hasScore) {
    return (
      <div className="flex h-96 flex-col items-center justify-center p-8 text-center space-y-4">
        <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="animate-pulse font-medium text-lg">Analyzing your developer profile...</p>
        <p className="text-muted-foreground text-sm max-w-sm">
          We are analyzing your GitHub, Resume, Mock Interviews, and Job Matches to generate your comprehensive Health Score.
        </p>
      </div>
    );
  }

  const getLevel = (score: number) => {
    if (score <= 40) return { label: "Beginner", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    if (score <= 60) return { label: "Developing", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    if (score <= 80) return { label: "Job Ready", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" };
    return { label: "Industry Ready", color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" };
  };

  const level = getLevel(currentScore!.overall_score);
  const trendDiff = prevScore ? currentScore!.overall_score - prevScore.overall_score : 0;
  const isCelebration = trendDiff >= 10;

  const radarData = [
    { name: "Profile", value: currentScore!.profile_score },
    { name: "GitHub", value: currentScore!.github_score },
    { name: "Resume", value: currentScore!.resume_score },
    { name: "Job Match", value: currentScore!.job_match_score },
    { name: "Interview", value: currentScore!.interview_score },
  ];

  const trendData = [...(history || [])].reverse().map(s => ({
    date: format(new Date(s.created_at), "MMM d"),
    score: s.overall_score,
  }));

  const aiInsights = currentScore!.ai_insights as {
    why: string;
    biggestStrength: string;
    biggestWeakness: string;
    fastestImprovement: string;
  } | null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Developer Health Score</h1>
          <p className="mt-1 text-muted-foreground">Comprehensive analytics on your career readiness.</p>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={isGenerating} variant="outline" className="gap-2 rounded-full">
          <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} /> 
          Recalculate
        </Button>
      </div>

      {isCelebration && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-4 text-green-700 dark:text-green-400">
          <Award className="h-8 w-8 text-green-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Incredible Progress!</h3>
            <p className="text-sm">Your health score improved by {trendDiff} points. You earned the Growth Mindset badge!</p>
          </div>
        </div>
      )}

      {/* Top Cards: Score, Radar, Quick Insights */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Score Card */}
        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${level.bg} ${level.color} ${level.border}`}>
            {level.label}
          </div>
          <h2 className="font-semibold text-muted-foreground mb-6">DevAI Score</h2>
          <CircularProgress value={currentScore!.overall_score} size={160} strokeWidth={12} className="mb-6" />
          
          {prevScore && (
            <div className={`flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-full text-sm ${trendDiff > 0 ? "bg-green-500/10 text-green-500" : trendDiff < 0 ? "bg-red-500/10 text-red-500" : "bg-secondary text-muted-foreground"}`}>
              {trendDiff > 0 ? <TrendingUp className="h-4 w-4" /> : trendDiff < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              {trendDiff > 0 ? "+" : ""}{trendDiff} points from last scan
            </div>
          )}
        </div>

        {/* Radar Chart */}
        <div className="glass-card rounded-xl p-6 flex flex-col">
          <h2 className="font-semibold mb-4">Competency Map</h2>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                <Radar dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Career Insights */}
        <div className="glass-card rounded-xl p-6 flex flex-col bg-gradient-to-br from-background to-primary/5">
          <h2 className="font-semibold flex items-center gap-2 mb-4"><Lightbulb className="h-5 w-5 text-primary" /> AI Career Insights</h2>
          {aiInsights ? (
            <div className="space-y-4 text-sm flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <span className="font-medium text-foreground block mb-1">Why this score?</span>
                <span className="text-muted-foreground">{aiInsights.why}</span>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-green-800 dark:text-green-300">
                <span className="font-semibold block mb-1 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Biggest Strength</span>
                {aiInsights.biggestStrength}
              </div>
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-800 dark:text-red-300">
                <span className="font-semibold block mb-1 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> Biggest Weakness</span>
                {aiInsights.biggestWeakness}
              </div>
              <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-primary">
                <span className="font-semibold block mb-1 flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Fastest Improvement</span>
                {aiInsights.fastestImprovement}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm italic">No insights available for this score.</div>
          )}
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Core Strengths</h2>
          <div className="flex flex-wrap gap-2">
            {(currentScore!.strengths as string[])?.map((s, i) => (
              <span key={i} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-md border border-border">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-500" /> Improvement Areas</h2>
          <div className="flex flex-wrap gap-2">
            {(currentScore!.weaknesses as string[])?.map((w, i) => (
              <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-700 dark:text-red-400 text-sm rounded-md border border-red-500/20">
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-semibold mb-4">Strategic Recommendations</h2>
        <ul className="space-y-3">
          {(currentScore!.recommendations as string[])?.map((r, i) => (
            <li key={i} className="flex gap-3 text-sm items-start">
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary text-xs font-bold mt-0.5">{i + 1}</div>
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actionable Next Steps */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary" /> Suggested Projects</h2>
          <ul className="space-y-3">
            {(currentScore!.suggested_projects as string[])?.map((p, i) => (
              <li key={i} className="text-sm p-3 bg-secondary/50 rounded-lg border border-border/50">{p}</li>
            ))}
          </ul>
        </div>
        
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Recommended Certs</h2>
          <ul className="space-y-3">
            {(currentScore!.certifications as string[])?.map((c, i) => (
              <li key={i} className="text-sm p-3 bg-secondary/50 rounded-lg border border-border/50">{c}</li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Target Job Roles</h2>
          <div className="flex flex-col gap-2">
            {(currentScore!.job_roles as string[])?.map((r, i) => (
              <span key={i} className="px-3 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg border border-primary/20">
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* History Trend */}
      {trendData.length > 1 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold mb-4">Score Progress Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
