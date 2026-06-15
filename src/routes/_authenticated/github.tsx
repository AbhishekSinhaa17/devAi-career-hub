import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { analyzeGithub, generateDeveloperScore } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Github, Loader2, Sparkles, Star, GitFork, BookOpen, Users, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/github")({
  head: () => ({ meta: [{ title: "GitHub Analyzer — DevAI" }] }),
  component: Page,
});

function Page() {
  const [username, setUsername] = useState("");
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
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">GitHub Analyzer</h1>
        <p className="mt-1 text-muted-foreground">Enter a GitHub username — DevAI fetches the profile and writes an honest review.</p>
      </header>

      <form
        className="glass-card flex flex-wrap items-center gap-3 rounded-xl p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (username.trim()) mutation.mutate(username.trim());
        }}
      >
        <div className="relative flex-1 min-w-[240px]">
          <Github className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="e.g. torvalds" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <Button type="submit" disabled={mutation.isPending || !username.trim()} className="gap-2">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Analyze
        </Button>
      </form>

      {data && (
        <div className="space-y-6">
          <div className="glass-card flex flex-wrap items-center gap-5 rounded-xl p-6">
            {data.stats.avatar_url && (
              <img src={data.stats.avatar_url} alt="" className="h-16 w-16 rounded-full border border-border" />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{data.stats.name ?? username}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{data.summary}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-semibold gradient-text">{data.score}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Score</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Stat icon={BookOpen} label="Public repos" value={data.stats.public_repos} />
            <Stat icon={Star} label="Total stars" value={data.stats.total_stars} />
            <Stat icon={GitFork} label="Total forks" value={data.stats.total_forks} />
            <Stat icon={Users} label="Followers" value={data.stats.followers} />
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold">Top languages</h3>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stats.languages}>
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InsightCard icon={CheckCircle2} title="Strengths" items={data.strengths} tone="success" />
            <InsightCard icon={AlertTriangle} title="Weaknesses" items={data.weaknesses} tone="warning" />
            <InsightCard icon={Lightbulb} title="Suggestions" items={data.suggestions} tone="primary" />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: number }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, items, tone }: { icon: typeof Star; title: string; items: string[]; tone: "success" | "warning" | "primary" }) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <div className="glass-card rounded-xl p-5">
      <div className={`flex items-center gap-2 font-medium ${toneCls}`}>
        <Icon className="h-4 w-4" /> {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-foreground/90">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${toneCls.replace("text-", "bg-")}`} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
