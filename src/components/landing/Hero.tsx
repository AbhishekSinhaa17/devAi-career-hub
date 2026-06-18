import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "./shared";
import {
  Check,
  Zap,
  Shield,
  ArrowRight,
  Github,
  TrendingUp,
  Sparkles,
  Code2,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Animated grid background ───────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />

      {/* dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--primary)/0.6) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_40%,hsl(var(--background)))]" />
    </div>
  );
}

// ─── Floating orbs ───────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
      <div
        className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[80px] animate-pulse"
        style={{ animationDelay: "2s" }}
      />
    </div>
  );
}

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ─── Social proof bar ────────────────────────────────────────────────────────
function SocialProof() {
  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Dave",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {avatars.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="user"
            className="h-7 w-7 rounded-full border-2 border-background bg-muted object-cover"
          />
        ))}
      </div>
      <div className="text-left">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Loved by <span className="font-semibold text-foreground">12,000+</span> developers
        </p>
      </div>
    </div>
  );
}

// ─── Badge pill ──────────────────────────────────────────────────────────────
function BadgePill() {
  return (
    <div className="group mx-auto inline-flex cursor-default items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm shadow-primary/10 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:shadow-primary/20">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <Sparkles className="h-3 w-3" />
      Powered by next-gen AI models
      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        New
      </span>
    </div>
  );
}

// ─── Hero stats strip ────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { value: 12000, suffix: "+", label: "Developers" },
    { value: 94, suffix: "%", label: "Avg ATS Score" },
    { value: 3, suffix: "x", label: "Faster Hiring" },
    { value: 50, suffix: "k+", label: "Resumes Built" },
  ];

  return (
    <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 shadow-xl sm:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="group flex flex-col items-center gap-1 bg-card/80 px-6 py-5 backdrop-blur transition-colors duration-200 hover:bg-primary/5"
        >
          <span className="gradient-text text-3xl font-bold tabular-nums">
            <AnimatedCounter target={s.value} suffix={s.suffix} />
          </span>
          <span className="text-xs text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
export function Hero({ session }: { session?: any }) {
  return (
    <section className="relative isolate min-h-[90vh] overflow-hidden">
      <GridBackground />
      <FloatingOrbs />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-10 text-center md:pt-16">
        {/* badge */}
        <Reveal>
          <BadgePill />
        </Reveal>

        {/* headline */}
        <Reveal delay={80}>
          <h1 className="mx-auto mt-8 max-w-5xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            Ship your{" "}
            <span className="relative inline-block">
              {/* glow behind text */}
              <span className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-primary via-violet-500 to-cyan-500 rounded-full" />
              <span className="gradient-text relative">developer career</span>
            </span>{" "}
            forward with{" "}
            <span className="relative">
              <span className="gradient-text">AI</span>
              {/* underline squiggle */}
              <svg
                viewBox="0 0 60 8"
                className="absolute -bottom-2 left-0 w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q15 0 30 6 Q45 12 60 6"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-[dash_2s_ease-in-out_forwards]"
                  style={{
                    strokeDasharray: 80,
                    strokeDashoffset: 0,
                  }}
                />
              </svg>
            </span>
          </h1>
        </Reveal>

        {/* sub */}
        <Reveal delay={160}>
          <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
            Analyze your GitHub, build ATS-optimized resumes, generate portfolios, crack interviews,
            and follow personalized roadmaps —{" "}
            <span className="font-medium text-foreground">
              all in one intelligent platform built for developers.
            </span>
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={240}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {session ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="group relative h-13 overflow-hidden rounded-xl px-8 text-base font-semibold shadow-2xl shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* shimmer */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button
                  size="lg"
                  className="group relative h-13 overflow-hidden rounded-xl px-8 text-base font-semibold shadow-2xl shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative flex items-center gap-2">
                    Get started free
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            )}

            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="h-13 rounded-xl border-border/60 px-8 text-base font-semibold backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore features
              </Button>
            </a>
          </div>
        </Reveal>

        {/* trust signals */}
        <Reveal delay={300}>
          <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <SocialProof />

            <div className="hidden h-8 w-px bg-border sm:block" />

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/15">
                  <Check className="h-3 w-3 text-green-500" />
                </span>
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/15">
                  <Zap className="h-3 w-3 text-yellow-500" />
                </span>
                Instant analysis
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                  <Shield className="h-3 w-3 text-primary" />
                </span>
                Your data, private
              </span>
            </div>
          </div>
        </Reveal>

        {/* stats */}
        <Reveal delay={360}>
          <StatsStrip />
        </Reveal>

        {/* product preview */}
        <Reveal delay={440}>
          <HeroPreview />
        </Reveal>
      </div>
    </section>
  );
}

// ─── Premium product preview ─────────────────────────────────────────────────
function HeroPreview() {
  const bars = [38, 62, 47, 78, 65, 92, 85];

  return (
    <div className="group relative mx-auto mt-20 max-w-5xl">
      {/* ambient glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/20 via-violet-500/10 to-transparent opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />

      {/* border glow ring */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/40 via-primary/10 to-transparent opacity-70" />

      {/* main card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-[0_32px_80px_-12px_hsl(var(--primary)/0.25)] backdrop-blur-2xl">
        {/* window chrome */}
        <div className="flex items-center gap-3 border-b border-border/40 bg-muted/20 px-5 py-3.5">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/90 shadow-sm shadow-red-400/50" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/90 shadow-sm shadow-yellow-400/50" />
            <span className="h-3 w-3 rounded-full bg-green-400/90 shadow-sm shadow-green-400/50" />
          </div>

          {/* tabs */}
          <div className="ml-2 flex gap-1 text-xs">
            {["Dashboard", "Resume", "Roadmap"].map((tab, i) => (
              <span
                key={tab}
                className={`rounded-md px-3 py-1 transition-colors ${
                  i === 0
                    ? "bg-background/80 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="ml-auto flex-1 max-w-48 rounded-md border border-border/40 bg-background/40 px-3 py-1 text-left text-xs text-muted-foreground">
            app.devai.io/dashboard
          </div>
        </div>

        {/* dashboard content */}
        <div className="p-6">
          {/* top row */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* GitHub Score chart */}
            <div className="relative overflow-hidden rounded-xl border border-border/40 bg-background/40 p-5 md:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                      <Github className="h-4 w-4 text-primary" />
                    </span>
                    GitHub Activity Score
                  </div>
                  <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-500">
                    +18% ↑
                  </span>
                </div>

                {/* chart */}
                <div className="flex items-end gap-2 pt-2">
                  {bars.map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary transition-all duration-700 ease-out"
                        style={{
                          height: `${h}px`,
                          animationDelay: `${i * 100}ms`,
                          boxShadow: i === 5 ? "0 0 12px hsl(var(--primary)/0.6)" : undefined,
                          opacity: 0.5 + i * 0.07,
                        }}
                      />
                      <span className="text-[9px] text-muted-foreground">
                        {["M", "T", "W", "T", "F", "S", "S"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ATS Score */}
            <div className="relative overflow-hidden rounded-xl border border-border/40 bg-background/40 p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Resume ATS</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    AI Optimized
                  </span>
                </div>

                {/* ring */}
                <div className="my-4 flex items-center justify-center">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="8"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40 * 0.94} ${2 * Math.PI * 40}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <span className="gradient-text text-2xl font-bold">94%</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-green-500">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+12 pts this week</span>
                </div>
              </div>
            </div>
          </div>

          {/* bottom row */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Code2,
                label: "Skills Mapped",
                value: "24",
                sub: "TypeScript, React +22",
                color: "text-cyan-500",
                bg: "bg-cyan-500/10",
              },
              {
                icon: TrendingUp,
                label: "Roadmap Progress",
                value: "68%",
                sub: "On track for Senior",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
              },
              {
                icon: Zap,
                label: "Interviews Passed",
                value: "7 / 8",
                sub: "87.5% success rate",
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
              },
            ].map(({ icon: Icon, label, value, sub, color, bg }) => (
              <div
                key={label}
                className="group/card relative overflow-hidden rounded-xl border border-border/40 bg-background/40 p-4 transition-colors duration-200 hover:border-border/70 hover:bg-background/70"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* reflection */}
      <div className="absolute -bottom-8 left-1/2 h-12 w-4/5 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl" />
    </div>
  );
}
