import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { reviewCode } from "@/lib/ai.functions";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bug,
  Shield,
  Zap,
  Sparkles,
  Loader2,
  FileCode,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Terminal,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/code-review")({
  head: () => ({ meta: [{ title: "AI Code Reviewer — DevAI" }] }),
  component: Page,
});

const LANGS = [
  { value: "typescript", label: "TypeScript", color: "#3178c6" },
  { value: "javascript", label: "JavaScript", color: "#f7df1e" },
  { value: "python", label: "Python", color: "#3572a5" },
  { value: "go", label: "Go", color: "#00add8" },
  { value: "rust", label: "Rust", color: "#dea584" },
  { value: "java", label: "Java", color: "#b07219" },
  { value: "c++", label: "C++", color: "#f34b7d" },
  { value: "ruby", label: "Ruby", color: "#701516" },
  { value: "php", label: "PHP", color: "#4f5d95" },
];

// ─── Tone config ──────────────────────────────────────────────────────────────
const TONE_MAP = {
  destructive: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.18)",
    icon: XCircle,
    label: "error",
  },
  warning: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.18)",
    icon: AlertTriangle,
    label: "warning",
  },
  primary: {
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.18)",
    icon: Sparkles,
    label: "info",
  },
  success: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.18)",
    icon: CheckCircle2,
    label: "pass",
  },
};

// ─── Shared panel ─────────────────────────────────────────────────────────────
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
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
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

// ─── Copy button ──────────────────────────────────────────────────────────────
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-all duration-300"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({
  score,
  label,
  color,
  size = 64,
}: {
  score: number;
  label: string;
  color: string;
  size?: number;
}) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" style={{ position: "absolute" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="5"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.2,0.64,1)",
              filter: `drop-shadow(0 0 4px ${color}80)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black" style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ─── Overall score bar ────────────────────────────────────────────────────────
function OverallBar({ value, label }: { value: number; label: string }) {
  const color =
    value >= 80 ? "#10b981" : value >= 60 ? "#6366f1" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-black" style={{ color }}>
          {value}/100
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg,${color}70,${color})`,
            boxShadow: `0 0 8px ${color}50`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Review section card ──────────────────────────────────────────────────────
function ReviewSection({
  icon: Icon,
  title,
  items,
  tone,
  className = "",
  score,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  tone: keyof typeof TONE_MAP;
  className?: string;
  score?: number;
}) {
  const [open, setOpen] = useState(true);
  const meta = TONE_MAP[tone];
  const StatusIcon = meta.icon;
  const allClear = items.length === 0;

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden ${className}`}
      style={{
        borderColor: meta.border,
        background: meta.bg,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Top accent */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg,transparent,${meta.color}50,transparent)`,
        }}
      />

      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl grid place-items-center"
            style={{
              backgroundColor: `${meta.color}15`,
              border: `1px solid ${meta.color}25`,
            }}
          >
            <Icon className="h-4.5 w-4.5" style={{ color: meta.color }} />
          </div>
          <div className="text-left">
            <div className="font-black text-sm text-foreground">{title}</div>
            <div
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: meta.color }}
            >
              {allClear ? "All clear" : `${items.length} issue${items.length > 1 ? "s" : ""}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {score !== undefined && (
            <div
              className="px-2.5 py-1 rounded-lg text-xs font-black"
              style={{
                backgroundColor: `${meta.color}15`,
                color: meta.color,
              }}
            >
              {score}/100
            </div>
          )}
          <div className="h-7 w-7 rounded-lg grid place-items-center border border-border/40 bg-muted/20">
            {open ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: meta.border }}>
          {allClear ? (
            <div className="flex items-center gap-3 mt-4">
              <div
                className="h-8 w-8 rounded-xl grid place-items-center flex-shrink-0"
                style={{
                  backgroundColor: `${meta.color}15`,
                  border: `1px solid ${meta.color}25`,
                }}
              >
                <StatusIcon className="h-4 w-4" style={{ color: meta.color }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: meta.color }}>
                No issues found — looks great!
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {items.map((it, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 group"
                  style={{
                    animation: `fadeSlideIn 0.3s ease-out ${i * 60}ms both`,
                  }}
                >
                  <div
                    className="mt-0.5 h-5 w-5 rounded-lg grid place-items-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${meta.color}15`,
                      border: `1px solid ${meta.color}20`,
                    }}
                  >
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                  </div>
                  <span className="text-sm text-foreground/85 leading-relaxed">{it}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Line number gutter ───────────────────────────────────────────────────────
function CodeEditor({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (v: string) => void;
  language: string;
}) {
  const lines = value.split("\n").length;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Sync scroll between gutter and textarea
  const syncScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="relative flex overflow-hidden rounded-xl border border-border/60 bg-[#0d0d1a] font-mono text-sm">
      {/* Gutter */}
      <div
        ref={gutterRef}
        className="select-none overflow-hidden flex-shrink-0 py-4 pr-3 pl-4 text-right pointer-events-none"
        style={{
          minWidth: "48px",
          background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          maxHeight: "320px",
          overflowY: "hidden",
        }}
      >
        {Array.from({ length: Math.max(lines, 1) }, (_, i) => (
          <div key={i} className="leading-6 text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        placeholder={`// Paste your ${language} code here…`}
        className="flex-1 resize-none bg-transparent py-4 pl-4 pr-4 text-slate-300 placeholder:text-slate-700 focus:outline-none leading-6 text-[13px]"
        style={{ minHeight: "280px", maxHeight: "480px" }}
      />

      {/* Lang badge */}
      <div
        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest pointer-events-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        {language}
      </div>
    </div>
  );
}

// ─── Loading shimmer ──────────────────────────────────────────────────────────
function ReviewSkeleton() {
  return (
    <div className="space-y-4">
      <Panel className="p-6">
        <div className="h-5 w-24 rounded-lg bg-muted/40 mb-4 animate-pulse" />
        <div className="space-y-2">
          {[1, 0.8, 0.6].map((op, i) => (
            <div
              key={i}
              className="h-3 rounded-lg bg-muted/40 animate-pulse"
              style={{ opacity: op, width: `${70 + i * 10}%` }}
            />
          ))}
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/40 bg-muted/10 p-5 h-32 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="relative h-20 w-20 rounded-3xl grid place-items-center mb-5"
        style={{
          background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))",
          border: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "0 0 40px rgba(99,102,241,0.08)",
        }}
      >
        <Code2 className="h-9 w-9 text-primary/60" />
        <div
          className="absolute inset-0 rounded-3xl animate-pulse"
          style={{
            background: "radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%)",
          }}
        />
      </div>
      <h3 className="text-xl font-black text-foreground mb-2">Paste your code to get started</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        DevAI checks for bugs, security vulnerabilities, performance issues, and best practice
        violations — instantly.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {["Bugs", "Security", "Performance", "Clean Code", "Best Practices"].map((f) => (
          <span
            key={f}
            className="px-3 py-1 rounded-full text-xs font-bold border border-border/60 bg-muted/30 text-muted-foreground"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function Page() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fn = useServerFn(reviewCode);
  const mutation = useMutation({
    mutationFn: () => fn({ data: { code, language } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const fb = mutation.data;
  const currentLang = LANGS.find((l) => l.value === language);

  // Compute summary scores from item counts (0 = 100, 10 = 0, linear)
  const toScore = (arr: string[]) => Math.max(0, Math.round(100 - arr.length * 12));

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
      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 w-fit">
          <Code2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
            AI Code Review
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Code{" "}
          <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
            Reviewer
          </span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Paste any code — DevAI checks for bugs, security flaws, performance bottlenecks, and clean
          code violations.
        </p>
      </header>

      {/* ── Editor panel ── */}
      <Panel accent="#6366f1">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-amber-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
            </div>

            <div className="h-5 w-px bg-border/60" />

            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-8 w-36 rounded-lg border-border/60 bg-muted/20 text-xs font-bold focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: l.color }}
                        />
                        {l.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-muted-foreground">
              {code.length.toLocaleString()} chars · {code.split("\n").length} lines
            </span>
            {code && <CopyButton text={code} />}
            {code && (
              <button
                onClick={() => setCode("")}
                className="text-[11px] font-bold text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Code editor with line numbers */}
        <div className="p-4">
          <CodeEditor value={code} onChange={setCode} language={language} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-5">
          <p className="text-[11px] text-muted-foreground">
            Supports {LANGS.map((l) => l.label).join(", ")}
          </p>

          <button
            disabled={!code.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="group relative h-11 px-6 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            <span className="relative flex items-center gap-2">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reviewing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Review Code
                </>
              )}
            </span>
          </button>
        </div>
      </Panel>

      {/* ── States ── */}
      {mutation.isPending && <ReviewSkeleton />}

      {!fb && !mutation.isPending && <EmptyState />}

      {/* ── Results ── */}
      {fb && !mutation.isPending && (
        <div className="space-y-6" style={{ animation: "fadeSlideIn 0.5s ease-out both" }}>
          {/* Overview */}
          <Panel accent="#6366f1" className="p-6">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 80% 50%,rgba(99,102,241,0.06) 0%,transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center">
                      <FileCode className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Overall Assessment
                    </span>
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed max-w-2xl">
                    {fb.overall}
                  </p>

                  <div className="mt-5 grid gap-2.5 max-w-md">
                    <OverallBar value={toScore(fb.bugs)} label="Bug-free score" />
                    <OverallBar value={toScore(fb.security)} label="Security score" />
                    <OverallBar value={toScore(fb.performance)} label="Performance score" />
                    <OverallBar value={toScore(fb.cleanCode)} label="Clean code score" />
                  </div>
                </div>

                {/* Mini score rings */}
                <div className="flex flex-wrap gap-4 flex-shrink-0">
                  <ScoreRing score={toScore(fb.bugs)} label="Bugs" color="#ef4444" />
                  <ScoreRing score={toScore(fb.security)} label="Security" color="#f59e0b" />
                  <ScoreRing score={toScore(fb.performance)} label="Perf" color="#6366f1" />
                  <ScoreRing score={toScore(fb.cleanCode)} label="Clean" color="#10b981" />
                </div>
              </div>
            </div>
          </Panel>

          {/* Review sections */}
          <div className="grid gap-4 md:grid-cols-2">
            <ReviewSection
              icon={Bug}
              title="Bugs & Errors"
              items={fb.bugs}
              tone="destructive"
              score={toScore(fb.bugs)}
            />
            <ReviewSection
              icon={Shield}
              title="Security"
              items={fb.security}
              tone="warning"
              score={toScore(fb.security)}
            />
            <ReviewSection
              icon={Zap}
              title="Performance"
              items={fb.performance}
              tone="primary"
              score={toScore(fb.performance)}
            />
            <ReviewSection
              icon={FileCode}
              title="Clean Code"
              items={fb.cleanCode}
              tone="success"
              score={toScore(fb.cleanCode)}
            />
          </div>

          <ReviewSection
            icon={BookOpen}
            title="Best Practices"
            items={fb.bestPractices}
            tone="primary"
          />

          {/* Re-review CTA */}
          <Panel accent="#8b5cf6" className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 grid place-items-center">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">Made changes?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Edit your code above and run the review again.
                  </p>
                </div>
              </div>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="group relative h-10 px-5 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                  boxShadow: "0 0 16px rgba(139,92,246,0.3)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <span className="relative flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Re-review
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
