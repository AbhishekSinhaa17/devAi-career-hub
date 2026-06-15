import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/ai.functions";
import {
  Github,
  FileText,
  Code2,
  MessageSquare,
  Map as MapIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Activity,
  Award,
  Briefcase,
  Star,
  FileBadge,
  Zap,
  Medal,
  Trophy,
} from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DevAI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const fetcher = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetcher(),
  });

  const scores = [
    { name: "Profile", value: data?.profileCompletion ?? 0 },
    { name: "GitHub", value: data?.githubScore ?? 0 },
    { name: "Resume", value: data?.resumeScore ?? 0 },
    { name: "Portfolio", value: data?.portfolioScore ?? 0 },
    { name: "Interview", value: data?.interviewReady ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back{data?.profile?.name ? `, ${data.profile.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s how your developer career is shaping up.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-xl p-6 md:col-span-2 lg:col-span-4 flex flex-col md:flex-row items-center justify-between gap-6 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Developer Health Score</h2>
            <p className="text-muted-foreground mt-1 text-sm">Your comprehensive career readiness rating across all metrics.</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Current Score</div>
              <div className="text-5xl font-bold tracking-tighter gradient-text">{data?.devScore ?? 0}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Trend</div>
              <div className={`flex items-center justify-center gap-1 font-medium ${(data?.devScoreTrend ?? 0) > 0 ? "text-green-500" : (data?.devScoreTrend ?? 0) < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                {(data?.devScoreTrend ?? 0) > 0 ? <TrendingUp className="h-4 w-4" /> : (data?.devScoreTrend ?? 0) < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                {Math.abs(data?.devScoreTrend ?? 0)} pts
              </div>
            </div>
            <Link to="/developer-score">
              <Button variant="default" className="gap-2 rounded-full">View Details <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>

        <ScoreCard label="Profile completion" value={data?.profileCompletion ?? 0} loading={isLoading} hint="Fill out your profile" />
        
        {/* Mock Interview Gamification */}
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-primary flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-4">
              <Trophy className="h-4 w-4 text-primary" /> Mock Interview Stats
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Best Score</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {data?.profile?.best_interview_score ?? 0} <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Streak</div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {data?.profile?.interview_streak ?? 0} <Zap className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Latest Badges</div>
              <div className="flex flex-wrap gap-1">
                {(data?.profile?.badges || []).length > 0 ? (
                   (data?.profile?.badges || []).slice(-2).map((b: string) => (
                    <span key={b} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold tracking-tight uppercase flex items-center gap-1">
                      <Medal className="h-3 w-3" /> {b}
                    </span>
                   ))
                ) : (
                  <span className="text-xs text-muted-foreground">Take a mock interview to earn badges.</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* GitHub Resume Widget */}
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-primary flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
              <FileBadge className="h-4 w-4" /> GitHub Resume
            </div>
            {data?.githubResume ? (
              <div className="space-y-1">
                <div className="font-semibold text-lg">{data.githubResume.developer_type}</div>
                <div className="text-sm text-muted-foreground flex gap-1 flex-wrap">
                  {data.githubResume.badges?.slice(0,2).map((b: string) => (
                    <span key={b} className="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary text-[10px] font-bold tracking-tight uppercase">{b}</span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Generated {new Date(data.githubResume.created_at).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No resume generated yet. Run the AI generator to extract your GitHub experience.
              </div>
            )}
          </div>
          <Link to="/github-resume" className="text-xs font-medium text-primary hover:underline mt-4 flex items-center gap-1">
            {data?.githubResume ? "View & Export" : "Generate Now"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Latest Mock Interview Widget */}
        <div className="glass-card rounded-xl p-5 border-l-4 border-l-primary flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
              <MessageSquare className="h-4 w-4" /> Latest Mock Interview
            </div>
            {data?.mockInterview ? (
              <div className="space-y-1">
                <div className="font-semibold text-lg">{data.mockInterview.job_role}</div>
                <div className="text-3xl font-bold tracking-tighter gradient-text mt-1">{data.mockInterview.overall_score}/100</div>
                <div className="text-xs text-muted-foreground mt-2">
                  Taken {new Date(data.mockInterview.created_at).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No mock interviews taken yet. Test your skills in a real-world scenario.
              </div>
            )}
          </div>
          <Link to="/mock-interview" className="text-xs font-medium text-primary hover:underline mt-4 flex items-center gap-1">
            {data?.mockInterview ? "Take Another" : "Start Simulator"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Career radar</h2>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={scores} outerRadius="80%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} />
                <Radar dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold">Activity & Insights</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Code reviews" value={data?.codeReviewCount ?? 0} />
            <Row label="Interview sessions" value={data?.interviewCount ?? 0} />
            <Row label="GitHub user" value={data?.githubUsername ?? data?.profile?.github_username ?? "—"} />
            <Row label="Experience" value={data?.profile?.experience_level ?? "—"} />
          </dl>

          <div className="mt-6 border-t border-border pt-4 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">AI Insights</h3>
            {data?.githubResume ? (
              <>
                <InsightRow icon={Star} label="Top Skill" value={data.githubResume.resume_data?.skills?.[0] || "N/A"} />
                <InsightRow icon={Briefcase} label="Impressive Project" value={data.githubResume.resume_data?.projects?.[0]?.name || "N/A"} />
                <InsightRow icon={Activity} label="Recommended Next" value={data.githubResume.insights?.missingSkills?.[0] || "N/A"} />
              </>
            ) : (
              <div className="text-xs text-muted-foreground">Generate a GitHub Resume to see deep insights.</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard to="/mock-interview" icon={MessageSquare} title="Mock Interview" desc="Full interview simulator with AI." />
          <ActionCard to="/github-resume" icon={FileBadge} title="GitHub Resume" desc="AI-generate a resume from your repos." />
          <ActionCard to="/developer-score" icon={Activity} title="Developer Score" desc="View your full career readiness analytics." />
          <ActionCard to="/github" icon={Github} title="Analyze GitHub" desc="Get a full AI breakdown of your public work." />
          <ActionCard to="/resume" icon={FileText} title="Build a resume" desc="ATS-friendly resumes with live scoring." />
          <ActionCard to="/interview" icon={MessageSquare} title="Interview Hub" desc="Practice quick tailored questions." />
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, value, loading, hint }: { label: string; value: number; loading: boolean; hint: string }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight">{loading ? "…" : value}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2 transition-all" style={{ width: `${value}%` }} />
      </div>
      {value === 0 && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function InsightRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-7 w-7 place-items-center rounded bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium leading-none mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, desc }: { to: string; icon: typeof Github; title: string; desc: string }) {
  const router = useRouter();
  return (
    <Link to={to} className="glass-card group flex flex-col rounded-xl p-5 transition hover:border-primary/40" onClick={() => router.invalidate()}>
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
