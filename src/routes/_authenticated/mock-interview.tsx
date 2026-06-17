import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { generateMockInterviewQuestions, evaluateMockInterview } from "@/lib/ai.functions";
import { PageLoadingState } from "@/components/LoadingStates";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Mic,
  Star,
  Target,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Brain,
  MessageSquare,
  Zap,
  BarChart3,
  RefreshCw,
  Shield,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mock-interview")({
  head: () => ({ meta: [{ title: "Mock Interview Simulator — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: MockInterviewPage,
});

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Software Engineer",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TYPES = ["Technical Interview", "HR Interview", "Mixed Interview"];
const TIMERS = [
  { label: "Untimed", value: 0 },
  { label: "2 Minutes", value: 120 },
  { label: "5 Minutes", value: 300 },
  { label: "10 Minutes", value: 600 },
];

// ─── Shared Panel ─────────────────────────────────────────────────────────────
function Panel({
  children,
  className = "",
  accent,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
  glow?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden ${className}`}
      style={{
        boxShadow: glow
          ? `inset 0 1px 0 rgba(255,255,255,0.04), 0 0 40px ${glow}`
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg,transparent,${accent}60,transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

// ─── Select field ─────────────────────────────────────────────────────────────
function ConfigSelect({
  label,
  icon: Icon,
  accent,
  value,
  onValueChange,
  options,
}: {
  label: string;
  icon: React.ElementType;
  accent: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-2 group/f">
      <div className="flex items-center gap-2">
        <div
          className="h-5 w-5 rounded-md grid place-items-center"
          style={{ backgroundColor: `${accent}18` }}
        >
          <Icon className="h-3 w-3" style={{ color: accent }} />
        </div>
        <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within/f:text-foreground transition-colors">
          {label}
        </Label>
      </div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-11 rounded-xl border-border/60 bg-background/60 focus:border-primary/60 transition-all font-semibold text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = size / 2 - strokeWidth;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)",
            filter: `drop-shadow(0 0 8px ${color}80)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-black leading-none"
          style={{
            color,
            fontSize: size > 100 ? "2rem" : "1.25rem",
          }}
        >
          {score}
        </span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
          /100
        </span>
      </div>
    </div>
  );
}

// ─── Score metric bar ─────────────────────────────────────────────────────────
function ScoreMetric({
  label,
  value,
  icon: Icon,
  color = "#6366f1",
}: {
  label: string;
  value: number;
  icon?: React.ElementType;
  color?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        </div>
        <span className="text-sm font-black" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg,${color}60,${color})`,
            boxShadow: `0 0 6px ${color}50`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({
  total,
  current,
  answers,
}: {
  total: number;
  current: number;
  answers: string[];
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? "24px" : "8px",
            height: "8px",
            backgroundColor:
              i === current ? "#6366f1" : answers[i]?.trim() ? "#10b981" : "rgba(255,255,255,0.1)",
            boxShadow:
              i === current
                ? "0 0 8px rgba(99,102,241,0.6)"
                : answers[i]?.trim()
                  ? "0 0 6px rgba(16,185,129,0.4)"
                  : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Timer display ────────────────────────────────────────────────────────────
function TimerDisplay({ seconds }: { seconds: number }) {
  const isUrgent = seconds < 60;
  const pct = Math.min(100, (seconds / 600) * 100);
  const color = isUrgent ? "#ef4444" : seconds < 120 ? "#f59e0b" : "#10b981";

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300"
      style={{
        borderColor: isUrgent ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)",
        backgroundColor: isUrgent ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
      }}
    >
      <Clock
        className="h-4 w-4"
        style={{
          color,
          animation: isUrgent ? "pulse 1s ease-in-out infinite" : "none",
        }}
      />
      <span className="font-mono text-lg font-black" style={{ color }}>
        {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function MockInterviewPage() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState(ROLES[2]);
  const [level, setLevel] = useState(LEVELS[1]);
  const [type, setType] = useState(TYPES[0]);
  const [timerOpt, setTimerOpt] = useState(0);

  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [detailedFeedback, setDetailedFeedback] = useState<any[]>([]);
  const [status, setStatus] = useState<
    "setup" | "generating" | "interview" | "evaluating" | "report"
  >("setup");
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const genQuestionsFn = useServerFn(generateMockInterviewQuestions);
  const evalInterviewFn = useServerFn(evaluateMockInterview);

  const genMutation = useMutation({
    mutationFn: () =>
      genQuestionsFn({
        data: { jobRole: role, experienceLevel: level, interviewType: type },
      }),
    onMutate: () => setStatus("generating"),
    onSuccess: (data) => {
      setInterviewId(data.id);
      setQuestions(data.questions as any[]);
      setAnswers(new Array((data.questions as any[]).length).fill(""));
      setCurrentQ(0);
      setStatus("interview");
      if (timerOpt > 0) setTimeRemaining(timerOpt);
      else setTimeRemaining(null);
    },
    onError: (e: Error) => {
      setStatus("setup");
      toast.error(e.message);
    },
  });

  const evalMutation = useMutation({
    mutationFn: () => evalInterviewFn({ data: { interviewId: interviewId!, answers } }),
    onMutate: () => setStatus("evaluating"),
    onSuccess: (data) => {
      setReport(data.report);
      setDetailedFeedback(data.detailedAnswers);
      setStatus("report");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => {
      setStatus("interview");
      toast.error(e.message);
    },
  });

  useEffect(() => {
    if (status !== "interview" || timeRemaining === null) return;
    if (timeRemaining <= 0) {
      toast.info("Time's up! Submitting…");
      evalMutation.mutate();
      return;
    }
    const iv = setInterval(() => setTimeRemaining((t) => (t ? t - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [timeRemaining, status]);

  // Auto-focus textarea when question changes
  useEffect(() => {
    if (status === "interview") {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [currentQ, status]);

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
    else evalMutation.mutate();
  };
  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const answeredCount = answers.filter((a) => a.trim()).length;
  const overallScore = report?.overallScore ?? 0;

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
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-3">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
              AI Interview Simulator
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Mock{" "}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
              Interview
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-xl leading-relaxed">
            Experience a full AI-powered interview with real-time scoring, detailed feedback, and
            performance analytics.
          </p>
        </div>

        {status === "report" && (
          <button
            onClick={() => {
              setStatus("setup");
              setReport(null);
              setDetailedFeedback([]);
              setQuestions([]);
              setAnswers([]);
            }}
            className="group inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-border/60 bg-card/40 text-sm font-bold text-foreground hover:bg-card/80 transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
            New Interview
          </button>
        )}
      </header>

      {/* ──────────────────────── SETUP ──────────────────────── */}
      {status === "setup" && (
        <div
          className="max-w-3xl space-y-6"
          style={{ animation: "fadeSlideIn 0.5s ease-out both" }}
        >
          <Panel accent="#6366f1" className="p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <ConfigSelect
                label="Job Role"
                icon={Target}
                accent="#6366f1"
                value={role}
                onValueChange={setRole}
                options={ROLES.map((r) => ({ label: r, value: r }))}
              />
              <ConfigSelect
                label="Experience Level"
                icon={TrendingUp}
                accent="#10b981"
                value={level}
                onValueChange={setLevel}
                options={LEVELS.map((l) => ({ label: l, value: l }))}
              />
              <ConfigSelect
                label="Interview Type"
                icon={MessageSquare}
                accent="#8b5cf6"
                value={type}
                onValueChange={setType}
                options={TYPES.map((t) => ({ label: t, value: t }))}
              />
              <ConfigSelect
                label="Time Limit"
                icon={Clock}
                accent="#f59e0b"
                value={timerOpt.toString()}
                onValueChange={(v) => setTimerOpt(parseInt(v))}
                options={TIMERS.map((t) => ({
                  label: t.label,
                  value: t.value.toString(),
                }))}
              />
            </div>

            {/* Info strip */}
            <div
              className="mt-6 flex items-start gap-3 p-4 rounded-xl border"
              style={{
                borderColor: "rgba(99,102,241,0.2)",
                backgroundColor: "rgba(99,102,241,0.05)",
              }}
            >
              <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center flex-shrink-0">
                <Mic className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">Voice interviews coming soon.</span>{" "}
                Type your answers fully as if speaking aloud. AI evaluates technical accuracy,
                communication clarity, and problem-solving depth.
              </p>
            </div>

            {/* Feature pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: Brain, label: "AI Scoring", color: "#6366f1" },
                { icon: BarChart3, label: "Analytics", color: "#10b981" },
                { icon: Shield, label: "Feedback", color: "#8b5cf6" },
                { icon: Trophy, label: "Badges", color: "#f59e0b" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold"
                  style={{
                    backgroundColor: `${f.color}10`,
                    border: `1px solid ${f.color}20`,
                    color: f.color,
                  }}
                >
                  <f.icon className="h-3 w-3" />
                  {f.label}
                </div>
              ))}
            </div>
          </Panel>

          <button
            onClick={() => genMutation.mutate()}
            className="group relative w-full h-14 rounded-2xl font-black text-base text-white overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#4f46e5,#7c3aed,#9333ea)",
              boxShadow: "0 0 32px rgba(99,102,241,0.4)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="relative flex items-center justify-center gap-3">
              <PlayCircle className="h-6 w-6" />
              Start Interview
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      )}

      {/* ──────────────────────── GENERATING ──────────────────────── */}
      {status === "generating" && (
        <PageLoadingState
          title="Analyzing Profile..."
          subtitle="Building a custom interview based on your skills and experience."
        />
      )}

      {/* ──────────────────────── INTERVIEW ──────────────────────── */}
      {status === "interview" && questions.length > 0 && (
        <div
          className="max-w-4xl mx-auto space-y-5"
          style={{ animation: "fadeSlideIn 0.4s ease-out both" }}
        >
          {/* Top bar */}
          <Panel className="px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <ProgressDots total={questions.length} current={currentQ} answers={answers} />
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-lg grid place-items-center"
                    style={{ backgroundColor: "rgba(99,102,241,0.12)" }}
                  >
                    <Brain className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {questions[currentQ].type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  {answeredCount}/{questions.length} answered
                </span>
                {timeRemaining !== null && <TimerDisplay seconds={timeRemaining} />}
              </div>
            </div>
          </Panel>

          {/* Question card */}
          <Panel accent="#6366f1" className="p-8" glow="rgba(99,102,241,0.04)">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at 80% 20%,rgba(99,102,241,0.06) 0%,transparent 60%)",
              }}
            />

            <div className="relative z-10 space-y-6">
              {/* Q label */}
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-xl grid place-items-center font-black text-sm text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                    boxShadow: "0 0 14px rgba(99,102,241,0.4)",
                  }}
                >
                  {currentQ + 1}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Question {currentQ + 1} of {questions.length}
                </span>
              </div>

              {/* Question text */}
              <h2 className="text-xl font-black text-foreground leading-relaxed">
                {questions[currentQ].question}
              </h2>

              {/* Answer area */}
              <div className="space-y-2 group/f">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within/f:text-primary transition-colors">
                  Your Answer
                </Label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={answers[currentQ]}
                    onChange={(e) => {
                      const next = [...answers];
                      next[currentQ] = e.target.value;
                      setAnswers(next);
                    }}
                    placeholder="Type your answer here — be as detailed as you would in a real interview…"
                    className="w-full rounded-xl border border-border/60 bg-background/60 p-5 text-sm text-foreground placeholder:text-muted-foreground/50 leading-relaxed resize-y focus:outline-none focus:border-primary/60 focus:bg-background transition-all duration-300 font-medium"
                    style={{ minHeight: "220px" }}
                  />
                  <div className="absolute bottom-0 inset-x-0 h-px scale-x-0 group-focus-within/f:scale-x-100 transition-transform duration-300 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full" />

                  {/* Char count */}
                  <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/60 font-mono">
                    {answers[currentQ]?.length ?? 0} chars
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentQ === 0}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border/60 bg-card/40 text-sm font-bold text-foreground hover:bg-card/80 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="group relative h-11 px-6 rounded-xl font-bold text-sm text-white overflow-hidden"
              style={{
                background:
                  currentQ === questions.length - 1
                    ? "linear-gradient(135deg,#059669,#10b981)"
                    : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                boxShadow:
                  currentQ === questions.length - 1
                    ? "0 0 20px rgba(16,185,129,0.3)"
                    : "0 0 20px rgba(99,102,241,0.3)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <span className="relative flex items-center gap-2">
                {currentQ === questions.length - 1 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Submit Interview
                  </>
                ) : (
                  <>
                    Next Question
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────── EVALUATING ──────────────────────── */}
      {status === "evaluating" && (
        <PageLoadingState
          title="Evaluating Answer..."
          subtitle="Analyzing technical depth, clarity, and completeness."
        />
      )}

      {/* ──────────────────────── REPORT ──────────────────────── */}
      {status === "report" && report && (
        <div className="space-y-8" style={{ animation: "fadeSlideIn 0.5s ease-out both" }}>
          {/* Score hero */}
          <Panel accent="#6366f1" glow="rgba(99,102,241,0.06)" className="p-8">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 80% 50%,rgba(99,102,241,0.08) 0%,transparent 60%)",
              }}
            />
            <div className="relative z-10 flex flex-wrap items-center gap-10">
              {/* Ring */}
              <div className="flex flex-col items-center gap-3">
                <ScoreRing score={overallScore} size={140} strokeWidth={12} />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
                    Overall Score
                  </div>
                  <div
                    className="text-center text-xs font-bold mt-0.5"
                    style={{
                      color:
                        overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#6366f1" : "#f59e0b",
                    }}
                  >
                    {overallScore >= 80
                      ? "Excellent"
                      : overallScore >= 60
                        ? "Good"
                        : overallScore >= 40
                          ? "Needs Work"
                          : "Keep Practicing"}
                  </div>
                </div>
              </div>

              {/* Metric bars */}
              <div className="flex-1 grid gap-4 sm:grid-cols-2">
                <ScoreMetric
                  label="Technical"
                  value={report.technicalScore}
                  icon={Brain}
                  color="#6366f1"
                />
                <ScoreMetric
                  label="Communication"
                  value={report.communicationScore}
                  icon={MessageSquare}
                  color="#10b981"
                />
                <ScoreMetric
                  label="Problem Solving"
                  value={report.problemSolvingScore}
                  icon={Zap}
                  color="#8b5cf6"
                />
                <ScoreMetric
                  label="Confidence"
                  value={report.confidenceScore}
                  icon={Shield}
                  color="#f59e0b"
                />
                <ScoreMetric
                  label="Industry Readiness"
                  value={report.industryReadiness}
                  icon={TrendingUp}
                  color="#38bdf8"
                />
              </div>
            </div>
          </Panel>

          {/* Strengths / Weaknesses / Next steps */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Strengths */}
            <Panel accent="#10b981" className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
                  <Star className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="font-black text-sm text-foreground">Key Strengths</span>
              </div>
              <ul className="space-y-3">
                {report.strengths.map((s: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5"
                    style={{ animation: `fadeSlideIn 0.3s ease-out ${i * 80}ms both` }}
                  >
                    <div className="mt-0.5 h-5 w-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 grid place-items-center flex-shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <span className="text-sm text-foreground/80 leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Weaknesses */}
            <Panel accent="#f59e0b" className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 grid place-items-center">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <span className="font-black text-sm text-foreground">Areas to Improve</span>
              </div>
              <ul className="space-y-3">
                {report.weaknesses.map((s: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5"
                    style={{ animation: `fadeSlideIn 0.3s ease-out ${i * 80}ms both` }}
                  >
                    <div className="mt-0.5 h-5 w-5 rounded-lg bg-amber-500/10 border border-amber-500/20 grid place-items-center flex-shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    </div>
                    <span className="text-sm text-foreground/80 leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Next steps */}
            <Panel accent="#6366f1" className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <span className="font-black text-sm text-foreground">Next Steps</span>
              </div>
              <ul className="space-y-3">
                {report.nextSteps.map((s: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5"
                    style={{ animation: `fadeSlideIn 0.3s ease-out ${i * 80}ms both` }}
                  >
                    <div className="mt-0.5 h-5 w-5 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center flex-shrink-0">
                      <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80 leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Detailed Q&A review */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-black text-foreground">Detailed Question Review</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" />
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                {questions.length} questions
              </span>
            </div>

            <div className="space-y-4">
              {detailedFeedback.map((df, i) => {
                const score = df.ai_score ?? 0;
                const scoreColor =
                  score >= 80
                    ? "#10b981"
                    : score >= 60
                      ? "#6366f1"
                      : score >= 40
                        ? "#f59e0b"
                        : "#ef4444";
                return (
                  <div key={i} style={{ animation: `fadeSlideIn 0.4s ease-out ${i * 60}ms both` }}>
                    <Panel
                      accent={scoreColor}
                      className="overflow-hidden"
                    >
                      {/* Q header */}
                      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border/40">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className="h-7 w-7 rounded-xl grid place-items-center font-black text-xs text-white flex-shrink-0 mt-0.5"
                          style={{
                            background: `linear-gradient(135deg,${scoreColor}80,${scoreColor})`,
                          }}
                        >
                          {i + 1}
                        </div>
                        <h3 className="font-bold text-sm text-foreground leading-relaxed">
                          {questions[i]?.question}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className="px-3 py-1 rounded-xl text-xs font-black"
                          style={{
                            backgroundColor: `${scoreColor}12`,
                            border: `1px solid ${scoreColor}25`,
                            color: scoreColor,
                          }}
                        >
                          {score}/100
                        </div>
                      </div>
                    </div>

                    {/* Answer comparison */}
                    <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/40">
                      <div className="p-6">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                          Your Answer
                        </div>
                        <div className="rounded-xl border border-border/40 bg-muted/20 p-4 text-sm text-foreground/75 leading-relaxed">
                          {df.user_answer || (
                            <span className="italic text-muted-foreground">
                              No answer provided.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-primary" />
                          AI Feedback
                        </div>
                        <div
                          className="rounded-xl p-4 text-sm text-foreground/80 leading-relaxed"
                          style={{
                            backgroundColor: `${scoreColor}06`,
                            border: `1px solid ${scoreColor}15`,
                          }}
                        >
                          {df.ai_feedback}
                        </div>
                      </div>
                    </div>
                  </Panel>
                </div>
                );
              })}
            </div>
          </div>

          {/* CTA to retry */}
          <Panel accent="#8b5cf6" className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 grid place-items-center">
                  <Trophy className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <p className="font-black text-foreground">Ready to improve your score?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Use the feedback above and attempt another round.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setStatus("setup");
                  setReport(null);
                  setDetailedFeedback([]);
                  setQuestions([]);
                  setAnswers([]);
                }}
                className="group relative h-11 px-6 rounded-xl font-bold text-sm text-white overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  boxShadow: "0 0 20px rgba(139,92,246,0.3)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <span className="relative flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </span>
              </button>
            </div>
          </Panel>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
