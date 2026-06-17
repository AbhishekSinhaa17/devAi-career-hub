import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { generateRoadmap } from "@/lib/ai.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Sparkles,
  Award,
  Clock,
  Wrench,
  Folder,
  BookMarked,
  Map,
  SlidersHorizontal,
  Target,
  TrendingUp,
  ChevronDown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Career Roadmap — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: Page,
});

const PATHS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Analyst",
  "Mobile Developer",
  "ML Engineer",
];

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const PHASE_PALETTES = [
  { from: "#6366f1", to: "#818cf8", glow: "#6366f140" },
  { from: "#8b5cf6", to: "#a78bfa", glow: "#8b5cf640" },
  { from: "#10b981", to: "#34d399", glow: "#10b98140" },
  { from: "#f59e0b", to: "#fbbf24", glow: "#f59e0b40" },
  { from: "#ef4444", to: "#f87171", glow: "#ef444440" },
];

// ─── CSS injected once ─────────────────────────────────────────────────────────

const STYLES = `
  @keyframes float-orb {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(30px, -20px) scale(1.05); }
    66%       { transform: translate(-15px, 15px) scale(0.97); }
  }
  @keyframes shimmer {
    from { transform: translateX(-100%); }
    to   { transform: translateX(100%); }
  }
  @keyframes phase-slide {
    from { opacity: 0; transform: translateX(-20px) scale(0.98); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);    opacity: 0.6; }
    100% { transform: scale(1.8);  opacity: 0; }
  }
  @keyframes scan-line {
    from { top: 0%; }
    to   { top: 100%; }
  }
  @keyframes progress-fill {
    from { width: 0%; }
    to   { width: 100%; }
  }
  @keyframes number-pop {
    0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
    70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes border-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes card-enter {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes tag-pop {
    from { opacity: 0; transform: scale(0.8) translateY(5px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .phase-card:hover .phase-glow { opacity: 1; }
  .phase-card:hover .phase-inner { transform: translateX(2px); }
  .phase-inner { transition: transform 0.3s ease; }

  .btn-generate::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .btn-generate:hover::before { opacity: 1; }

  .skeleton-wave {
    background: linear-gradient(90deg, transparent 0%, var(--card) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease infinite;
  }

  .glass {
    background: var(--card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
  }
  .glass-strong {
    background: var(--card);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.10);
  }
`;

// ─── Floating background orbs ──────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden>
      {[
        { color: "#6366f1", size: 600, x: "10%", y: "5%", delay: "0s", dur: "18s" },
        { color: "#8b5cf6", size: 400, x: "70%", y: "15%", delay: "6s", dur: "22s" },
        { color: "#10b981", size: 300, x: "85%", y: "60%", delay: "12s", dur: "20s" },
        { color: "#f59e0b", size: 250, x: "5%", y: "75%", delay: "4s", dur: "25s" },
      ].map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-[0.06]"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            animation: `float-orb ${orb.dur} ${orb.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated grid background ─────────────────────────────────────────────────

function GridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.015]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function RoadmapSkeleton() {
  return (
    <div className="space-y-4 mt-2">
      {/* Scanning bar */}
      <div className="relative h-0.5 rounded-full overflow-hidden bg-white/5">
        <div
          className="absolute inset-y-0 w-1/3 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, #6366f1, transparent)",
            animation: "shimmer 1.4s ease infinite",
          }}
        />
      </div>

      {[1, 2, 3, 4].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid rgba(255,255,255,0.07)",
            animation: `fade-in 0.4s ${i * 80}ms ease both`,
          }}
        >
          <div className="skeleton-wave absolute inset-0" />
          <div className="flex items-center gap-4 mb-4">
            <div className="h-8 w-8 rounded-full bg-white/[0.07]" />
            <div className="h-3 rounded-lg bg-white/[0.07]" style={{ width: `${50 + i * 8}%` }} />
            <div className="ml-auto h-6 w-20 rounded-full bg-white/[0.05]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-2 rounded bg-white/[0.06] w-1/2" />
                {[1, 2, 3].map((k) => (
                  <div
                    key={k}
                    className="h-2 rounded bg-white/[0.04]"
                    style={{ width: `${60 + k * 10}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Block (skills / projects / resources) ────────────────────────────────────

function Block({
  icon: Icon,
  label,
  items,
  accentColor,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  items: string[];
  accentColor: string;
  delay?: number;
}) {
  return (
    <div style={{ animation: `fade-up 0.4s ${delay}ms ease both` }}>
      <div className="flex items-center gap-1.5 mb-3">
        <div
          className="h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
        >
          <Icon className="h-3 w-3" style={{ color: accentColor }} />
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: `${accentColor}cc` }}
        >
          {label}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground group/item"
            style={{ animation: `fade-in 0.3s ${delay + i * 40}ms ease both` }}
          >
            <span
              className="mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0 transition-transform group-hover/item:scale-125"
              style={{ background: `${accentColor}60`, boxShadow: `0 0 4px ${accentColor}40` }}
            />
            <span className="group-hover/item:text-foreground/70 transition-colors duration-200">
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Phase card ───────────────────────────────────────────────────────────────

function PhaseCard({
  phase,
  index,
  isLast,
  total,
}: {
  phase: {
    title: string;
    duration: string;
    skills: string[];
    projects: string[];
    resources: string[];
  };
  index: number;
  isLast: boolean;
  total: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const palette = PHASE_PALETTES[index % PHASE_PALETTES.length];

  return (
    <div
      className="flex gap-5 phase-card"
      style={{ animation: `phase-slide 0.5s cubic-bezier(0.34,1.1,0.64,1) ${index * 100}ms both` }}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        {/* Number bubble */}
        <div className="relative flex-shrink-0">
          {/* Pulse ring */}
          {index === 0 && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: palette.from,
                animation: "pulse-ring 2s ease-out infinite",
              }}
            />
          )}
          <div
            className="relative h-9 w-9 rounded-full flex items-center justify-center text-xs font-black text-foreground z-10 cursor-default"
            style={{
              background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
              boxShadow: `0 0 20px ${palette.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
              animation: `number-pop 0.5s cubic-bezier(0.34,1.2,0.64,1) ${index * 100 + 200}ms both`,
            }}
          >
            {index + 1}
          </div>
        </div>

        {/* Progress line */}
        {!isLast && (
          <div
            className="w-px mt-2 flex-1 min-h-8 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-full rounded-full"
              style={{
                height: "100%",
                background: `linear-gradient(to bottom, ${palette.from}80, transparent)`,
                animation: `progress-fill 0.6s ${index * 100 + 400}ms ease both`,
                transformOrigin: "top",
              }}
            />
          </div>
        )}
      </div>

      {/* Card */}
      <div
        className="flex-1 min-w-0 mb-4 rounded-2xl overflow-hidden relative group/card cursor-pointer"
        style={{
          background: "var(--card)",
          border: `1px solid var(--border)`,
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
        onClick={() => setExpanded((v) => !v)}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${palette.from}50`;
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${palette.glow}`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${palette.from}80, transparent)`,
          }}
        />

        {/* Glow overlay */}
        <div
          className="phase-glow absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 50%, ${palette.glow}, transparent 70%)`,
          }}
        />

        {/* Header */}
        <div className="phase-inner relative flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-1.5 w-6 rounded-full flex-shrink-0"
              style={{ background: `linear-gradient(90deg, ${palette.from}, ${palette.to})` }}
            />
            <span className="text-sm font-bold text-foreground/90 truncate">{phase.title}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: `${palette.from}15`,
                border: `1px solid ${palette.from}30`,
                color: palette.to,
              }}
            >
              <Clock className="h-3 w-3" />
              {phase.duration}
            </div>
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center transition-transform duration-300"
              style={{
                background: "var(--card)",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/80" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative px-5">
          <div className="h-px w-full" style={{ background: "var(--card)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${((index + 1) / total) * 100}%`,
                background: `linear-gradient(90deg, ${palette.from}, ${palette.to})`,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* Body */}
        {expanded && (
          <div
            className="phase-inner relative grid gap-5 sm:grid-cols-3 px-5 py-5"
            style={{ animation: "fade-up 0.3s ease both" }}
          >
            <Block
              icon={Wrench}
              label="Skills"
              items={phase.skills}
              accentColor={palette.from}
              delay={0}
            />
            <Block
              icon={Folder}
              label="Projects"
              items={phase.projects}
              accentColor={palette.to}
              delay={60}
            />
            <Block
              icon={BookMarked}
              label="Resources"
              items={phase.resources}
              accentColor="#34d399"
              delay={120}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Meta stat card ───────────────────────────────────────────────────────────

function MetaCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="relative rounded-2xl p-4 overflow-hidden group/meta"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        animation: `card-enter 0.5s ${delay}ms cubic-bezier(0.34,1.1,0.64,1) both`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px ${color}20`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* bg glow */}
      <div
        className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 transition-opacity duration-500 group-hover/meta:opacity-40"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />

      <div className="flex items-center gap-2 mb-2">
        <div
          className="h-6 w-6 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </span>
      </div>
      <div className="text-sm font-bold text-foreground/90 leading-tight">{value}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function Page() {
  const [path, setPath] = useState("Full Stack Developer");
  const [level, setLevel] = useState("beginner");
  const [mounted, setMounted] = useState(false);
  const progressRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const fn = useServerFn(generateRoadmap);
  const mutation = useMutation({
    mutationFn: () => fn({ data: { path, level } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rm = mutation.data;

  return (
    <>
      <style>{STYLES}</style>
      <BackgroundOrbs />

      <div
        className="space-y-8 pb-16 relative"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(16px)",
          transition: "all 0.6s cubic-bezier(0.34,1.1,0.64,1)",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="relative space-y-4 pt-2">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              animation: "fade-up 0.5s 0.1s ease both",
            }}
          >
            <Zap className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              AI-Powered Career Roadmap
            </span>
          </div>

          {/* Title */}
          <div style={{ animation: "fade-up 0.5s 0.15s ease both" }}>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
              <span className="text-foreground/90">Plan your</span>
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #34d399 100%)",
                }}
              >
                dream career
              </span>
            </h1>
          </div>

          <p
            className="text-sm text-muted-foreground/80 max-w-md leading-relaxed"
            style={{ animation: "fade-up 0.5s 0.2s ease both" }}
          >
            Generate a personalized step-by-step roadmap with curated skills, hands-on projects, and
            top resources — tailored to where you are and where you want to go.
          </p>
        </header>

        {/* ── Config Panel ─────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            animation: "fade-up 0.5s 0.25s ease both",
          }}
        >
          <GridBackground />

          {/* Top border glow */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, #6366f180, #8b5cf680, transparent)",
            }}
          />

          {/* Corner glow */}
          <div
            className="absolute -top-20 -left-20 h-40 w-40 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
          />

          <div className="relative p-6">
            {/* Panel header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-black text-foreground/90">Configure your roadmap</div>
                <div className="text-[11px] text-muted-foreground/60 mt-0.5">
                  Choose your target role and current level
                </div>
              </div>
            </div>

            {/* Selects */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              {/* Target path */}
              <div>
                <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2.5">
                  <Target className="h-3 w-3" />
                  Target path
                </Label>
                <Select value={path} onValueChange={setPath}>
                  <SelectTrigger
                    className="h-11 rounded-xl font-semibold text-sm text-foreground/80"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PATHS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div>
                <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2.5">
                  <TrendingUp className="h-3 w-3" />
                  Current level
                </Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger
                    className="h-11 rounded-xl font-semibold text-sm text-foreground/80"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between gap-4">
              {/* Status pill */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold"
                style={{
                  background: mutation.isPending
                    ? "rgba(99,102,241,0.1)"
                    : rm
                      ? "rgba(16,185,129,0.1)"
                      : "var(--card)",
                  border: mutation.isPending
                    ? "1px solid rgba(99,102,241,0.25)"
                    : rm
                      ? "1px solid rgba(16,185,129,0.25)"
                      : "1px solid var(--border)",
                  color: mutation.isPending ? "#818cf8" : rm ? "#34d399" : "var(--border)",
                  transition: "all 0.4s ease",
                }}
              >
                {mutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                {rm && !mutation.isPending && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }}
                  />
                )}
                {mutation.isPending
                  ? "Generating with AI…"
                  : rm
                    ? `${rm.phases.length} phases ready`
                    : "Configure and generate"}
              </div>

              {/* CTA button */}
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="btn-generate relative h-11 px-6 rounded-xl font-black text-sm text-foreground overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 group/btn"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #6366f1 100%)",
                  boxShadow: mutation.isPending
                    ? "none"
                    : "0 0 24px rgba(99,102,241,0.4), 0 4px 12px rgba(0,0,0,0.3)",
                  transition: "box-shadow 0.3s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!mutation.isPending)
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 40px rgba(99,102,241,0.6), 0 6px 20px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 24px rgba(99,102,241,0.4), 0 4px 12px rgba(0,0,0,0.3)";
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                {/* Shimmer */}
                <div
                  className="absolute inset-0 -skew-x-12 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%)",
                    animation: mutation.isPending ? "none" : "shimmer 2.5s ease infinite",
                  }}
                />
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin relative z-10" />
                    <span className="relative z-10">Generating…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 relative z-10 group-hover/btn:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Generate Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Loading ──────────────────────────────────────────────── */}
        {mutation.isPending && <RoadmapSkeleton />}

        {/* ── Results ──────────────────────────────────────────────── */}
        {rm && !mutation.isPending && (
          <div className="space-y-8" style={{ animation: "fade-up 0.5s ease both" }}>
            {/* Meta stats */}
            <div className="grid grid-cols-3 gap-3">
              <MetaCard
                label="Estimated timeline"
                value={rm.timeline}
                icon={Clock}
                color="#6366f1"
                delay={0}
              />
              <MetaCard label="Target role" value={path} icon={Target} color="#8b5cf6" delay={80} />
              <MetaCard
                label="Starting level"
                value={level.charAt(0).toUpperCase() + level.slice(1)}
                icon={TrendingUp}
                color="#10b981"
                delay={160}
              />
            </div>

            {/* Section header */}
            <div
              className="flex items-center gap-4"
              style={{ animation: "fade-up 0.4s 0.1s ease both" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  <Map className="h-4 w-4 text-indigo-400" />
                </div>
                <h2 className="text-base font-black text-foreground/90">Learning phases</h2>
              </div>
              <div className="flex-1 h-px" style={{ background: "var(--card)" }} />
              <div
                className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#818cf8",
                }}
              >
                {rm.phases.length} phases
              </div>
            </div>

            {/* Phase list */}
            <div>
              {rm.phases.map((phase: any, i: number) => (
                <PhaseCard
                  key={i}
                  phase={phase}
                  index={i}
                  isLast={i === rm.phases.length - 1}
                  total={rm.phases.length}
                />
              ))}
            </div>

            {/* Certifications */}
            <div
              className="relative rounded-2xl p-6 overflow-hidden"
              style={{
                background: "var(--card)",
                border: "1px solid rgba(251,191,36,0.15)",
                animation: `fade-up 0.5s ${rm.phases.length * 80 + 100}ms ease both`,
              }}
            >
              {/* Glow */}
              <div
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }}
              />
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)",
                }}
              />

              <div className="relative">
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="h-8 w-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(245,158,11,0.15)",
                      border: "1px solid rgba(245,158,11,0.3)",
                    }}
                  >
                    <Award className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-foreground/90">
                      Recommended certifications
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Industry-recognized credentials to boost your profile
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {rm.certifications.map((c: string, i: number) => (
                    <span
                      key={c}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground/90 transition-all duration-200 cursor-default hover:text-foreground/90 hover:border-amber-400/40"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        animation: `tag-pop 0.4s ${i * 50}ms cubic-bezier(0.34,1.2,0.64,1) both`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLSpanElement).style.background =
                          "rgba(245,158,11,0.08)";
                        (e.currentTarget as HTMLSpanElement).style.boxShadow =
                          "0 0 12px rgba(245,158,11,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLSpanElement).style.background =
                          "var(--card)";
                        (e.currentTarget as HTMLSpanElement).style.boxShadow = "none";
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
