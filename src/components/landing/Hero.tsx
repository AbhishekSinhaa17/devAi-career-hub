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
  Terminal,
  Rocket,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Aurora + Mesh background ────────────────────────────────────────────────
function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,hsl(var(--primary)/0.18),transparent_70%)]" />

      {/* animated aurora ribbons */}
      <div className="absolute -top-1/2 left-1/2 h-[140%] w-[160%] -translate-x-1/2 opacity-50">
        <div className="absolute inset-0 animate-[aurora_18s_ease-in-out_infinite] bg-[conic-gradient(from_120deg_at_50%_50%,transparent_0deg,hsl(var(--primary)/0.25)_60deg,transparent_120deg,rgba(139,92,246,0.2)_200deg,transparent_280deg,rgba(6,182,212,0.18)_340deg,transparent_360deg)] blur-[60px]" />
      </div>

      {/* dot grid with mask */}
      <div
        className="absolute inset-0 opacity-[0.3] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--primary)/0.5) 1px, transparent 1px)`,
          backgroundSize: "34px 34px",
        }}
      />

      {/* moving scan line */}
      <div className="absolute inset-x-0 top-0 h-px animate-[scan_8s_linear_infinite] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_35%,hsl(var(--background)))]" />
    </div>
  );
}

// ─── Floating orbs (parallax to pointer) ─────────────────────────────────────
function FloatingOrbs({ mx, my }: { mx: number; my: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/12 blur-[100px] animate-pulse transition-transform duration-700 ease-out"
        style={{ transform: `translate3d(${mx * 30}px, ${my * 30}px, 0)` }}
      />
      <div
        className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-500/12 blur-[120px] animate-pulse transition-transform duration-700 ease-out"
        style={{ transform: `translate3d(${mx * -40}px, ${my * 20}px, 0)`, animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[80px] animate-pulse transition-transform duration-700 ease-out"
        style={{ transform: `translate3d(${mx * 25}px, ${my * -25}px, 0)`, animationDelay: "2s" }}
      />
    </div>
  );
}

// ─── Floating particles ──────────────────────────────────────────────────────
function Particles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 53) % 100}%`,
    delay: `${(i % 6) * 1.2}s`,
    dur: `${8 + (i % 5) * 2}s`,
    size: i % 3 === 0 ? 3 : 2,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-primary/40 animate-[float-up_var(--dur)_linear_infinite]"
          style={
            {
              left: d.left,
              width: d.size,
              height: d.size,
              "--dur": d.dur,
              animationDelay: d.delay,
            } as React.CSSProperties
          }
        />
      ))}
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
      {count.toLocaleString()}
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
      <div className="flex -space-x-2.5">
        {avatars.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="user"
            className="h-8 w-8 rounded-full border-2 border-background bg-muted object-cover transition-transform duration-200 hover:z-10 hover:-translate-y-1 hover:scale-110"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/15 text-[10px] font-bold text-primary">
          12k
        </span>
      </div>
      <div className="text-left">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 animate-[pop_0.4s_ease-out_backwards]"
              style={{ animationDelay: `${i * 80}ms` }}
            />
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
    <div className="group relative mx-auto inline-flex cursor-default items-center gap-2 overflow-hidden rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm shadow-primary/10 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:shadow-primary/20">
      {/* sweep */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <Sparkles className="relative h-3 w-3 animate-pulse" />
      <span className="relative">Powered by next-gen AI models</span>
      <span className="relative rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        New
      </span>
    </div>
  );
}

// ─── Hero stats strip ────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { value: 12000, suffix: "+", label: "Developers", icon: Rocket },
    { value: 94, suffix: "%", label: "Avg ATS Score", icon: TrendingUp },
    { value: 3, suffix: "x", label: "Faster Hiring", icon: Zap },
    { value: 50, suffix: "k+", label: "Resumes Built", icon: Code2 },
  ];

  return (
    <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 shadow-xl sm:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="group relative flex flex-col items-center gap-1 bg-card/80 px-6 py-6 backdrop-blur transition-colors duration-300 hover:bg-primary/5"
        >
          <span className="absolute inset-x-6 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-500 group-hover:scale-x-100" />
          <s.icon className="mb-1 h-4 w-4 text-muted-foreground/50 transition-colors duration-300 group-hover:text-primary" />
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
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setPointer({ x, y });
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMove}
      className="relative isolate min-h-[95vh] overflow-hidden"
    >
      <AuroraBackground />
      <FloatingOrbs mx={pointer.x} my={pointer.y} />
      <Particles />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-10 text-center md:pt-16">
        {/* badge */}
        <Reveal animateOnLoad>
          <BadgePill />
        </Reveal>

        {/* headline */}
        <Reveal animateOnLoad delay={80}>
          <h1 className="mx-auto mt-8 max-w-5xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl lg:text-[5.5rem]">
            Ship your{" "}
            <span className="relative inline-block">
              <span className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-primary via-violet-500 to-cyan-500 opacity-30 blur-2xl" />
              <span className="gradient-text relative animate-[shimmer-text_4s_linear_infinite] bg-[length:200%_auto]">
                developer career
              </span>
            </span>{" "}
            forward with{" "}
            <span className="relative inline-block">
              <span className="gradient-text">AI</span>
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
                  style={{ strokeDasharray: 80, strokeDashoffset: 80 }}
                  className="animate-[draw_1.2s_ease-in-out_0.6s_forwards]"
                />
              </svg>
            </span>
          </h1>
        </Reveal>

        {/* sub */}
        <Reveal animateOnLoad delay={160}>
          <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
            Analyze your GitHub, build ATS-optimized resumes, generate portfolios, crack interviews,
            and follow personalized roadmaps —{" "}
            <span className="font-medium text-foreground">
              all in one intelligent platform built for developers.
            </span>
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal animateOnLoad delay={240}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={session ? "/dashboard" : "/signup"}>
              <Button
                size="lg"
                className="group relative h-13 overflow-hidden rounded-xl px-8 text-base font-semibold shadow-2xl shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 hover:scale-[1.03] active:scale-[0.98]"
              >
                {/* animated gradient bg */}
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-violet-500 to-primary bg-[length:200%_auto] animate-[shimmer-text_3s_linear_infinite] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* shimmer */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center gap-2">
                  {session ? "Go to Dashboard" : "Get started free"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>

            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="group h-13 rounded-xl border-border/60 px-8 text-base font-semibold backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Terminal className="mr-2 h-4 w-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
                Explore features
              </Button>
            </a>
          </div>
        </Reveal>

        {/* trust signals */}
        <Reveal animateOnLoad delay={300}>
          <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-10">
            <SocialProof />

            <div className="hidden h-8 w-px bg-border sm:block" />

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {[
                {
                  Icon: Check,
                  label: "No credit card",
                  bg: "bg-green-500/15",
                  c: "text-green-500",
                },
                {
                  Icon: Zap,
                  label: "Instant analysis",
                  bg: "bg-yellow-500/15",
                  c: "text-yellow-500",
                },
                {
                  Icon: Shield,
                  label: "Your data, private",
                  bg: "bg-primary/15",
                  c: "text-primary",
                },
              ].map(({ Icon, label, bg, c }) => (
                <span key={label} className="group flex items-center gap-1.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${bg} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className={`h-3 w-3 ${c}`} />
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* stats */}
        <Reveal animateOnLoad delay={360}>
          <StatsStrip />
        </Reveal>

        {/* product preview */}
        <Reveal animateOnLoad delay={440}>
          <HeroPreview mx={pointer.x} my={pointer.y} />
        </Reveal>
      </div>
    </section>
  );
}

// ─── Premium product preview (3D tilt) ───────────────────────────────────────
function HeroPreview({ mx, my }: { mx: number; my: number }) {
  const bars = [38, 62, 47, 78, 65, 92, 85];

  return (
    <div
      className="group relative mx-auto mt-20 max-w-5xl [perspective:2000px]"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* ambient glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/25 via-violet-500/10 to-transparent opacity-60 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />

      {/* border glow ring */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/50 via-primary/10 to-transparent opacity-70" />

      {/* main card with subtle tilt */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-[0_40px_100px_-20px_hsl(var(--primary)/0.35)] backdrop-blur-2xl transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${my * -4}deg) rotateY(${mx * 5}deg)`,
        }}
      >
        {/* window chrome */}
        <div className="flex items-center gap-3 border-b border-border/40 bg-muted/20 px-5 py-3.5">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/90 shadow-sm shadow-red-400/50 transition-transform hover:scale-125" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/90 shadow-sm shadow-yellow-400/50 transition-transform hover:scale-125" />
            <span className="h-3 w-3 rounded-full bg-green-400/90 shadow-sm shadow-green-400/50 transition-transform hover:scale-125" />
          </div>

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

          <div className="ml-auto flex max-w-48 flex-1 items-center gap-1.5 rounded-md border border-border/40 bg-background/40 px-3 py-1 text-left text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-green-500" />
            app.devai.io/dashboard
          </div>
        </div>

        {/* dashboard content */}
        <div className="p-6">
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

                <div className="flex items-end gap-2 pt-2">
                  {bars.map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full origin-bottom rounded-t-md bg-gradient-to-t from-primary/30 to-primary animate-[grow-up_0.8s_ease-out_backwards]"
                        style={{
                          height: `${h}px`,
                          animationDelay: `${i * 90}ms`,
                          boxShadow: i === 5 ? "0 0 14px hsl(var(--primary)/0.6)" : undefined,
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
                        style={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        className="animate-[ring-fill_1.4s_ease-out_0.4s_forwards]"
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
                className="group/card relative overflow-hidden rounded-xl border border-border/40 bg-background/40 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-background/70 hover:shadow-lg hover:shadow-primary/10"
              >
                <span className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-500 group-hover/card:scale-x-100" />
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} transition-transform duration-300 group-hover/card:scale-110`}
                  >
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

        {/* glossy sheen overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.06]" />
      </div>

      {/* reflection */}
      <div className="absolute -bottom-8 left-1/2 h-12 w-4/5 -translate-x-1/2 rounded-full bg-primary/15 blur-2xl" />
    </div>
  );
}
