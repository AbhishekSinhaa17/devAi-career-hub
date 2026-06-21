import { useRef, useState } from "react";
import { Reveal } from "./shared";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Github,
  FileText,
  Code2,
  MessageSquare,
  Map as MapIcon,
  Globe,
  Sparkles,
} from "lucide-react";

export const featuresData = [
  {
    icon: Github,
    title: "GitHub Analyzer",
    desc: "AI breakdown of your repos, languages, strengths and gaps with actionable insights.",
    span: "lg:col-span-2",
    accent: "from-violet-500/20 via-purple-500/10 to-transparent",
    iconGradient: "from-violet-500/30 to-purple-600/20",
    iconColor: "text-violet-400",
    ring: "ring-violet-500/20",
    glow: "group-hover:shadow-violet-500/10",
    border: "group-hover:border-violet-500/30",
    tag: "Most used",
    href: "/github",
  },
  {
    icon: FileText,
    title: "AI Resume Builder",
    desc: "ATS-friendly resumes with real-time scoring and live suggestions.",
    span: "",
    accent: "from-blue-500/20 via-cyan-500/10 to-transparent",
    iconGradient: "from-blue-500/30 to-cyan-600/20",
    iconColor: "text-blue-400",
    ring: "ring-blue-500/20",
    glow: "group-hover:shadow-blue-500/10",
    border: "group-hover:border-blue-500/30",
    tag: null,
    href: "/resume",
  },
  {
    icon: Code2,
    title: "AI Code Reviewer",
    desc: "Catch bugs, security issues, and performance problems instantly.",
    span: "",
    accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
    iconGradient: "from-emerald-500/30 to-teal-600/20",
    iconColor: "text-emerald-400",
    ring: "ring-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
    border: "group-hover:border-emerald-500/30",
    tag: null,
    href: "/code-review",
  },
  {
    icon: MessageSquare,
    title: "Interview Hub",
    desc: "Mock interviews and practice questions tailored to your role and seniority.",
    span: "lg:col-span-2",
    accent: "from-orange-500/20 via-amber-500/10 to-transparent",
    iconGradient: "from-orange-500/30 to-amber-600/20",
    iconColor: "text-orange-400",
    ring: "ring-orange-500/20",
    glow: "group-hover:shadow-orange-500/10",
    border: "group-hover:border-orange-500/30",
    tag: "New",
    href: "/interview",
  },
  {
    icon: MapIcon,
    title: "Career Roadmaps",
    desc: "Personalized learning paths from beginner to senior engineer.",
    span: "",
    accent: "from-pink-500/20 via-rose-500/10 to-transparent",
    iconGradient: "from-pink-500/30 to-rose-600/20",
    iconColor: "text-pink-400",
    ring: "ring-pink-500/20",
    glow: "group-hover:shadow-pink-500/10",
    border: "group-hover:border-pink-500/30",
    tag: null,
    href: "/roadmap",
  },
  {
    icon: Globe,
    title: "Portfolio Builder",
    desc: "Generate a stunning developer portfolio site from your profile data.",
    span: "",
    accent: "from-indigo-500/20 via-blue-500/10 to-transparent",
    iconGradient: "from-indigo-500/30 to-blue-600/20",
    iconColor: "text-indigo-400",
    ring: "ring-indigo-500/20",
    glow: "group-hover:shadow-indigo-500/10",
    border: "group-hover:border-indigo-500/30",
    tag: null,
    href: "/profile",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-16 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[130px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Features
              </span>
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
              Everything you need
              <span className="block text-muted-foreground/50">to level up</span>
            </h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed">
              Six AI-powered tools engineered to make you a more competitive developer — from first
              commit to final offer.
            </p>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="mt-16 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((f, i) => (
            <Reveal key={f.title} delay={i * 70} className={f.span}>
              <FeatureCard {...f} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  accent,
  iconGradient,
  iconColor,
  ring,
  glow,
  border,
  tag,
  index,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  accent: string;
  iconGradient: string;
  iconColor: string;
  ring: string;
  glow: string;
  border: string;
  tag: string | null;
  index: number;
  href: string;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();

    // Spotlight CSS vars
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);

    // Subtle 3-D tilt
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / (r.width / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    setRotate({ x: -dy * 4, y: dx * 4 });
  };

  const onLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <Link
      to={href as any}
      ref={cardRef}
      onMouseMove={onMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
      }}
      className={`spotlight group relative block h-full overflow-hidden rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm cursor-pointer shadow-xl ${glow} ${border} transition-[border-color,box-shadow] duration-500 hover:shadow-2xl`}
    >
      {/* Gradient accent blob */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br ${accent} blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100`}
      />

      {/* Top line accent */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${iconColor.replace("text-", "via-")} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Number watermark */}
      <span className="pointer-events-none absolute right-5 bottom-4 text-7xl font-black text-muted/5 select-none tabular-nums">
        0{index + 1}
      </span>

      <div className="relative z-10 flex h-full flex-col p-7">
        {/* Top row */}
        <div className="flex items-start justify-between">
          {/* Icon */}
          <div
            className={`relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${iconGradient} ${ring} ring-1 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {/* Icon inner glow */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${iconGradient} opacity-0 blur-sm group-hover:opacity-60 transition-opacity duration-500`}
            />
          </div>

          {/* Tag badge */}
          {tag && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border ${ring} bg-card/80 px-2.5 py-1 text-xs font-semibold ${iconColor} backdrop-blur`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${iconColor.replace("text-", "bg-")} animate-pulse`}
              />
              {tag}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mt-6 flex-1">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        </div>

        {/* Footer CTA */}
        <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-5">
          <div
            className={`flex items-center gap-1.5 text-sm font-medium ${iconColor} translate-x-0 opacity-0 transition-all duration-300 group-hover:opacity-100`}
          >
            Explore feature
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
          {/* Decorative dots */}
          <div className="flex gap-1 opacity-20 group-hover:opacity-60 transition-opacity duration-300">
            {[...Array(3)].map((_, j) => (
              <span
                key={j}
                className={`h-1 w-1 rounded-full ${iconColor.replace("text-", "bg-")}`}
                style={{ animationDelay: `${j * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
