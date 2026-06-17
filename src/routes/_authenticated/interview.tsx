import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { generateInterview, generateDeveloperScore } from "@/lib/ai.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Loader2,
  Sparkles,
  MessageSquare,
  Brain,
  Target,
  BarChart3,
  BookOpen,
  Code2,
  Users,
  Settings,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  SlidersHorizontal,
  ListOrdered,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageLoadingState, PageEmptyState } from "@/components/LoadingStates";

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({ meta: [{ title: "Interview Hub — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: Page,
});

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "JavaScript", icon: Code2, color: "#f7df1e" },
  { value: "React", icon: Code2, color: "#61dafb" },
  { value: "Node.js", icon: Settings, color: "#339933" },
  { value: "MongoDB", icon: BarChart3, color: "#47a248" },
  { value: "SQL", icon: BarChart3, color: "#4479a1" },
  { value: "DSA", icon: Brain, color: "#6366f1" },
  { value: "System Design", icon: Target, color: "#8b5cf6" },
  { value: "Behavioral", icon: Users, color: "#f59e0b" },
];

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Easy",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.35)",
  },
  {
    value: "medium",
    label: "Medium",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.35)",
  },
  {
    value: "hard",
    label: "Hard",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.35)",
  },
] as const;

const COUNTS = [3, 5, 8, 10];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function diffMeta(value: string) {
  return DIFFICULTIES.find((d) => d.value === value) ?? DIFFICULTIES[1];
}

function catMeta(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[0];
}

// ─── Shared Panel ──────────────────────────────────────────────────────────────

function Panel({
  children,
  className = "",
  accentColor,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden ${className}`}
      style={style}
    >
      {accentColor && (
        <div
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}70, transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

// ─── Config field ──────────────────────────────────────────────────────────────

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
      </Label>
    </div>
  );
}

// ─── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/60 bg-muted/30 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-all"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Difficulty tabs ───────────────────────────────────────────────────────────

function DifficultyTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      {DIFFICULTIES.map((d) => {
        const active = value === d.value;
        return (
          <button
            key={d.value}
            onClick={() => onChange(d.value)}
            className="flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all duration-200"
            style={
              active
                ? {
                    background: d.bg,
                    borderColor: d.border,
                    color: d.color,
                  }
                : {}
            }
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Question card ─────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  difficulty,
  category,
}: {
  question: { question: string; answer: string; explanation: string };
  index: number;
  difficulty: string;
  category: string;
}) {
  const diff = diffMeta(difficulty);
  const cat = catMeta(category);

  return (
    <AccordionItem value={`q-${index}`} className="border-0">
      <Panel
        accentColor={diff.color}
        style={{ animationDelay: `${index * 70}ms` }}
        className="animate-[card-in_0.4s_cubic-bezier(.34,1.2,.64,1)_both] overflow-hidden"
      >
        <AccordionTrigger className="px-5 py-4 text-left hover:no-underline group/trig [&>svg]:hidden">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Number badge */}
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5 transition-transform group-hover/trig:scale-105"
              style={{
                background: `linear-gradient(135deg, ${diff.color}90, ${diff.color})`,
                boxShadow: `0 2px 8px ${diff.color}30`,
              }}
            >
              {index + 1}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <cat.icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  {category} · {diff.label}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {question.question}
              </p>
            </div>

            {/* Chevron */}
            <div className="text-muted-foreground mt-1 transition-transform duration-300 group-data-[state=open]/trig:rotate-180">
              ↓
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-5 pb-5 pt-0">
          <div className="space-y-4 border-t border-border/40 pt-4">
            {/* Model answer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    Model answer
                  </span>
                </div>
                <CopyButton text={question.answer} />
              </div>
              <div className="rounded-xl p-4 text-sm text-foreground/85 leading-relaxed bg-emerald-500/[0.06] border border-emerald-500/[0.15]">
                {question.answer}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
                  What interviewers look for
                </span>
              </div>
              <div className="rounded-xl p-4 text-sm text-foreground/85 leading-relaxed bg-violet-500/[0.06] border border-violet-500/[0.15]">
                {question.explanation}
              </div>
            </div>
          </div>
        </AccordionContent>
      </Panel>
    </AccordionItem>
  );
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────

function QuestionSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Panel key={i} className="p-5 animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-muted/50 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-2.5 w-24 rounded bg-muted/40" />
              <div className="h-4 rounded bg-muted/50" style={{ width: `${55 + i * 9}%` }} />
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <PageEmptyState
      title="Configure your interview prep"
      subtitle="Select your role, category, and difficulty to generate targeted questions with model answers."
      icon={MessageSquare}
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {["AI Questions", "Model Answers", "Expert Tips", "Copy-Friendly"].map((f) => (
          <span
            key={f}
            className="px-3 py-1 rounded-full text-[11px] font-semibold border border-border/60 bg-muted/30 text-muted-foreground"
          >
            {f}
          </span>
        ))}
      </div>
    </PageEmptyState>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

function Page() {
  const [role, setRole] = useState("Full Stack Developer");
  const [category, setCategory] = useState("React");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]["value"]>("medium");
  const [count, setCount] = useState(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fn = useServerFn(generateInterview);
  const genDevScoreFn = useServerFn(generateDeveloperScore);

  const mutation = useMutation({
    mutationFn: () => fn({ data: { role, category, difficulty, count } }),
    onSuccess: () => {
      genDevScoreFn({ data: undefined }).catch(console.error);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const data = mutation.data;
  const diff = diffMeta(difficulty);

  return (
    <>
      <style>{`
        @keyframes card-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="space-y-7 pb-12"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(10px)",
          transition: "all 0.55s cubic-bezier(0.34,1.2,0.64,1)",
        }}
      >
        {/* ── Header ── */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 w-fit">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Interview preparation hub
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Interview{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
              Hub
            </span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Generate role-specific questions with expert model answers and detailed interviewer
            insights to ace your next technical interview.
          </p>
        </header>

        {/* ── Config panel ── */}
        <Panel accentColor="#6366f1" className="p-6">
          {/* Panel header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-black text-foreground">Interview parameters</span>
          </div>

          {/* Fields row */}
          <div className="grid gap-4 sm:grid-cols-3 mb-5">
            {/* Role */}
            <div>
              <FieldLabel icon={Target}>Role</FieldLabel>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="h-10 rounded-xl border-border/60 bg-background/60 focus:border-primary/60 font-semibold text-sm transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <FieldLabel icon={BookOpen}>Category</FieldLabel>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/60 focus:border-primary/60 font-semibold text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                        {c.value}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Count */}
            <div>
              <FieldLabel icon={ListOrdered}>Questions</FieldLabel>
              <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
                <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background/60 focus:border-primary/60 font-semibold text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} questions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-5">
            <FieldLabel icon={BarChart3}>Difficulty</FieldLabel>
            <DifficultyTabs value={difficulty} onChange={(v) => setDifficulty(v as any)} />
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-end gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              {mutation.isPending
                ? "Generating with AI…"
                : data
                  ? `${data.questions.length} questions ready`
                  : "Ready to generate"}
            </span>

            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="group relative h-10 px-5 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-opacity hover:opacity-90 active:scale-[.98]"
              style={{
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                boxShadow: "0 1px 2px rgba(0,0,0,.2)",
              }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate questions
                </>
              )}
            </button>
          </div>
        </Panel>

        {/* ── Loading ── */}
        {mutation.isPending && <QuestionSkeleton count={count} />}
        {/* ── Empty ── */}
        {!data && !mutation.isPending && <EmptyState />}

        {/* ── Loading ── */}
        {mutation.isPending && (
          <PageLoadingState
            title="Generating Questions..."
            subtitle="Creating targeted interview questions based on your selections."
          />
        )}

        {/* ── Results ── */}
        {data && !mutation.isPending && (
          <div className="space-y-5" style={{ animation: "fade-up 0.5s ease both" }}>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-black text-foreground">Generated questions</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
              <div
                className="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest"
                style={{
                  borderColor: "rgba(99,102,241,.3)",
                  background: "rgba(99,102,241,.08)",
                  color: "#818cf8",
                }}
              >
                {data.questions.length} questions
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
              {data.questions.map((q: any, i: number) => (
                <QuestionCard
                  key={i}
                  question={q}
                  index={i}
                  difficulty={difficulty}
                  category={category}
                />
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </>
  );
}
