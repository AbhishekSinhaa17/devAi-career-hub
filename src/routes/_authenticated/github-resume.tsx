import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { generateGithubResume, saveResume, generateCoverLetter } from "@/lib/ai.functions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  Github,
  Award,
  Sparkles,
  Save,
  Edit3,
  Download,
  FileText,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  ExternalLink,
  ArrowRight,
  Rocket,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/github-resume")({
  head: () => ({ meta: [{ title: "GitHub Resume Generator — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: GithubResumePage,
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared premium panel (theme-aware)
// ─────────────────────────────────────────────────────────────────────────────
function Panel({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden ${className}`}
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {!!accent && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

function Pill({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold"
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}20`,
        color,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon: Icon,
  title,
  desc,
  tone = "neutral",
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ElementType;
  title: string;
  desc: string;
  tone?: "neutral" | "primary" | "success";
}) {
  const styles =
    tone === "primary"
      ? {
          bg: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          shadow: "0 0 18px rgba(99,102,241,0.25)",
          iconBg: "rgba(99,102,241,0.12)",
          iconBorder: "rgba(99,102,241,0.2)",
          iconColor: "#6366f1",
          border: "rgba(99,102,241,0.22)",
        }
      : tone === "success"
        ? {
            bg: "linear-gradient(135deg, #059669, #10b981)",
            shadow: "0 0 18px rgba(16,185,129,0.22)",
            iconBg: "rgba(16,185,129,0.12)",
            iconBorder: "rgba(16,185,129,0.2)",
            iconColor: "#10b981",
            border: "rgba(16,185,129,0.22)",
          }
        : {
            bg: "transparent",
            shadow: "none",
            iconBg: "rgba(255,255,255,0.04)",
            iconBorder: "rgba(255,255,255,0.08)",
            iconColor: "var(--color-muted-foreground)",
            border: "var(--color-border)",
          };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full rounded-2xl border p-4 text-left transition-all duration-400 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        borderColor: styles.border,
        boxShadow: tone === "neutral" ? "inset 0 1px 0 rgba(255,255,255,0.04)" : styles.shadow,
        background: tone === "neutral" ? "transparent" : styles.bg,
      }}
    >
      {/* shine */}
      {tone !== "neutral" && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>
      )}

      <div className="relative z-10 flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: styles.iconBg,
            border: `1px solid ${styles.iconBorder}`,
          }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color: tone === "neutral" ? "var(--color-foreground)" : "white" }}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p
              className={`font-black text-sm ${tone === "neutral" ? "text-foreground" : "text-white"}`}
            >
              {title}
            </p>
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-300 ${tone === "neutral" ? "text-muted-foreground" : "text-white/80"} group-hover:translate-x-0.5`}
            />
          </div>
          <p
            className={`text-xs mt-1 leading-relaxed ${tone === "neutral" ? "text-muted-foreground" : "text-white/80"}`}
          >
            {desc}
          </p>
        </div>
      </div>
    </button>
  );
}

function ProgressStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 rounded-xl grid place-items-center border"
        style={{
          borderColor: done
            ? "rgba(16,185,129,0.25)"
            : active
              ? "rgba(99,102,241,0.25)"
              : "rgba(255,255,255,0.08)",
          backgroundColor: done
            ? "rgba(16,185,129,0.12)"
            : active
              ? "rgba(99,102,241,0.12)"
              : "rgba(255,255,255,0.04)",
        }}
      >
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : active ? (
          <Sparkles className="h-4 w-4 text-primary" />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        )}
      </div>
      <span
        className={`text-[11px] font-bold uppercase tracking-widest ${
          active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function GithubResumePage() {
  const [username, setUsername] = useState("");
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const genResumeFn = useServerFn(generateGithubResume);
  const saveResumeFn = useServerFn(saveResume);
  const genCoverLetterFn = useServerFn(generateCoverLetter);

  const mutation = useMutation({
    mutationFn: () => genResumeFn({ data: { username } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = mutation.data;
      if (!data) throw new Error("No resume to save");
      return saveResumeFn({
        data: {
          title: `GitHub Resume: ${data.developerType}`,
          content: data.resumeData,
          score: data.insights.atsScore,
          ai_suggestions: data.insights.missingSkills,
        },
      });
    },
    onSuccess: () => toast.success("Resume saved to your library!"),
    onError: (e: Error) => toast.error(e.message),
  });

  const coverLetterMutation = useMutation({
    mutationFn: () => {
      if (!mutation.data) throw new Error("No resume generated yet");
      return genCoverLetterFn({
        data: {
          resume: mutation.data.resumeData,
          jobRole: mutation.data.developerType,
        },
      });
    },
    onSuccess: (data) => {
      setCoverLetter(data.coverLetter);
      setIsCoverLetterOpen(true);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleEditInBuilder = () => {
    if (!mutation.data) return;
    sessionStorage.setItem("importedGithubResume", JSON.stringify(mutation.data.resumeData));
    navigate({ to: "/resume" });
  };

  const data = mutation.data;

  const atsTone = useMemo(() => {
    const score = data?.insights.atsScore ?? 0;
    if (score >= 80) return { color: "#10b981", label: "Excellent" };
    if (score >= 65) return { color: "#6366f1", label: "Good" };
    if (score >= 45) return { color: "#f59e0b", label: "Needs Work" };
    return { color: "#ef4444", label: "Weak" };
  }, [data?.insights.atsScore]);

  const steps = {
    analyze: !!data,
    save: saveMutation.isSuccess,
    export: false,
  };

  return (
    <div
      className="space-y-8 pb-12"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(10px)",
        transition: "all 0.6s cubic-bezier(0.34,1.2,0.64,1)",
      }}
    >
      {/* ── Header ── */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                GitHub → ATS Resume
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">
              GitHub Resume Generator
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Turn your open-source work into a professional, ATS-ready resume — inferred from
              repositories, READMEs, topics, and commit patterns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ProgressStep label="Analyze" active={!steps.analyze} done={steps.analyze} />
            <div className="h-px w-10 bg-border/60 hidden sm:block" />
            <ProgressStep label="Save" active={steps.analyze && !steps.save} done={steps.save} />
          </div>
        </div>
      </header>

      {/* ── Input panel ── */}
      <Panel className="p-2 max-w-2xl" accent="#6366f1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) mutation.mutate();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g. torvalds)"
              className="h-12 pl-11 rounded-xl border-0 bg-transparent focus-visible:ring-0"
              disabled={mutation.isPending}
            />
          </div>

          <button
            disabled={mutation.isPending || !username.trim()}
            type="submit"
            className="group relative h-12 px-6 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: "0 0 18px rgba(99,102,241,0.25)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            <span className="relative flex items-center gap-2">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </span>
          </button>
        </form>
      </Panel>

      {/* ── Loading state ── */}
      {mutation.isPending && (
        <Panel className="p-10" accent="#8b5cf6">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-3xl bg-primary/10 border border-primary/20 grid place-items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div
                className="absolute inset-0 rounded-3xl animate-pulse opacity-60"
                style={{
                  background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
                }}
              />
            </div>
            <div>
              <p className="font-black text-lg text-foreground">
                Analyzing repositories & inferring your tech stack…
              </p>
              <p className="text-sm text-muted-foreground max-w-md mt-1.5 leading-relaxed">
                We read README structure, topics, languages, and project signals to craft a
                professional summary and ATS-friendly bullets.
              </p>
            </div>
          </div>
        </Panel>
      )}

      {/* ── Result state ── */}
      {data && (
        <div className="space-y-8" style={{ animation: "fadeSlideIn 0.5s ease-out both" }}>
          {/* Top overview */}
          <div className="grid gap-4 lg:grid-cols-12">
            <Panel className="p-7 lg:col-span-8" accent="#6366f1">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      AI Inferred Profile
                    </div>
                    <h2 className="text-3xl font-black text-foreground">{data.developerType}</h2>
                    <p className="text-sm text-muted-foreground">
                      {data.insights.specialization} · {data.insights.experienceLevel}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Pill icon={Github} label={`github.com/${username}`} color="#64748b" />
                      <a
                        href={`https://github.com/${username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open GitHub
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl border border-border/60 bg-muted/25 px-4 py-3 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Profile Strength
                      </div>
                      <div className="mt-1 text-4xl font-black bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
                        {data.profileStrength}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Repo quality & activity
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {data.badges?.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-border/60">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Badges
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.badges.map((b: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold"
                          style={{
                            backgroundColor: "rgba(245,158,11,0.10)",
                            border: "1px solid rgba(245,158,11,0.20)",
                            color: "#f59e0b",
                          }}
                        >
                          <Award className="h-4 w-4" />
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>

            <Panel className="p-7 lg:col-span-4" accent={atsTone.color}>
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      ATS Score
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-4xl font-black" style={{ color: atsTone.color }}>
                        {data.insights.atsScore}
                      </span>
                      <span className="text-sm font-bold text-muted-foreground">/100</span>
                    </div>
                    <div className="mt-1 text-xs font-semibold" style={{ color: atsTone.color }}>
                      {atsTone.label}
                    </div>
                  </div>
                  {data.insights.atsScore >= 65 ? (
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 grid place-items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                  )}
                </div>

                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${data.insights.atsScore}%`,
                      background: `linear-gradient(90deg, ${atsTone.color}80, ${atsTone.color})`,
                      boxShadow: `0 0 10px ${atsTone.color}40`,
                    }}
                  />
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Top Missing Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.insights.missingSkills.slice(0, 8).map((s: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold"
                        style={{
                          backgroundColor: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.16)",
                          color: "rgb(239,68,68)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Recommended Roles
                  </div>
                  <ul className="space-y-1.5">
                    {data.insights.recommendedRoles.slice(0, 5).map((r: string, i: number) => (
                      <li key={i} className="text-sm text-foreground/90 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-primary" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          </div>

          {/* Main grid */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Actions sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <Panel className="p-6" accent="#6366f1">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    One-Click Actions
                  </div>
                  <div className="h-9 w-9 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center">
                    <Zap className="h-4.5 w-4.5 text-primary" />
                  </div>
                </div>

                <div className="space-y-3">
                  <ActionButton
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    icon={saveMutation.isPending ? Loader2 : Save}
                    title={saveMutation.isPending ? "Saving…" : "Save to My Resumes"}
                    desc="Store this resume in your library with its ATS score."
                    tone="neutral"
                  />

                  <ActionButton
                    onClick={() => navigate({ to: "/portfolio-deployment/$id", params: { id: data.id } })}
                    icon={Rocket}
                    title="Deploy Portfolio"
                    desc="Instantly deploy this generated portfolio to a live URL."
                    tone="success"
                  />

                  <ActionButton
                    onClick={handleEditInBuilder}
                    icon={Edit3}
                    title="Edit in Resume Builder"
                    desc="Fine-tune bullets, sections, and formatting."
                    tone="neutral"
                  />

                  <ActionButton
                    onClick={() => window.print()}
                    icon={Download}
                    title="Export PDF"
                    desc="Print-friendly layout with consistent spacing."
                    tone="neutral"
                  />

                  <ActionButton
                    onClick={() => coverLetterMutation.mutate()}
                    disabled={coverLetterMutation.isPending}
                    icon={coverLetterMutation.isPending ? Loader2 : FileText}
                    title={coverLetterMutation.isPending ? "Generating…" : "Generate Cover Letter"}
                    desc="AI letter tailored to this inferred role."
                    tone="primary"
                  />
                </div>
              </Panel>

              <Panel className="p-6" accent="#10b981">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">
                      Next: Build a full resume
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Import this draft into the builder for templates + scoring.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to="/resume"
                    className="group inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4"
                  >
                    Open Resume Builder
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Panel>
            </div>

            {/* Preview */}
            <div className="lg:col-span-8">
              <Panel className="overflow-hidden" accent="#8b5cf6">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20">
                  <div className="flex items-center gap-2 text-sm font-black text-foreground">
                    <FileText className="h-4 w-4 text-violet-500" />
                    Generated Preview
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Print-ready
                  </div>
                </div>

                {/* Preview "paper" */}
                <div className="p-4 sm:p-6 md:p-8 bg-background">
                  <div
                    className="rounded-2xl border border-border/60 overflow-hidden"
                    style={{
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div
                      className="p-8 bg-white text-zinc-900 print:shadow-none print:p-0"
                      style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
                    >
                      <div className="border-b border-zinc-200 pb-4">
                        <h1 className="text-3xl font-bold">{data.resumeData.fullName}</h1>
                        <p className="text-zinc-600 font-medium">{data.resumeData.title}</p>
                        <p className="mt-2 text-xs text-zinc-500">
                          github.com/{username} · Generated by DevAI
                        </p>
                      </div>

                      <div className="mt-5">
                        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                          Professional Summary
                        </h2>
                        <p className="text-sm leading-relaxed">{data.resumeData.summary}</p>
                      </div>

                      <div className="mt-5">
                        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                          Technical Skills
                        </h2>
                        <p className="text-sm leading-relaxed">
                          {data.resumeData.skills.join(" · ")}
                        </p>
                      </div>

                      <div className="mt-5">
                        <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                          Key Projects
                        </h2>
                        {data.resumeData.projects.map((p: any, i: number) => (
                          <div key={i} className="mb-3 last:mb-0">
                            <div className="text-sm font-semibold">
                              {p.name}{" "}
                              <span className="text-xs font-normal text-zinc-500 ml-1">
                                — {p.tech}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-700 mt-0.5 leading-relaxed">
                              {p.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      {!!data.insights.achievements?.length && (
                        <div className="mt-5">
                          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                            Achievements & Highlights
                          </h2>
                          <ul className="list-disc pl-4 space-y-1">
                            {data.insights.achievements.map((a: string, i: number) => (
                              <li key={i} className="text-xs text-zinc-700 leading-relaxed">
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Tip: Export PDF for sharing, then refine in the Resume Builder for layout
                    templates and ATS improvements.
                  </p>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      <Dialog open={isCoverLetterOpen} onOpenChange={setIsCoverLetterOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Generated Cover Letter
            </DialogTitle>
            <DialogDescription>
              AI-crafted cover letter based on your GitHub-inferred resume.
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm mt-3 p-4 rounded-xl bg-muted/40 border border-border/60">
            {coverLetter}
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
