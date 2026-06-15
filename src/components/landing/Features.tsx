import { useRef } from "react";
import { Reveal } from "./shared";
import { ArrowRight, Github, FileText, Code2, MessageSquare, Map as MapIcon, Globe } from "lucide-react";

export const featuresData = [
  {
    icon: Github,
    title: "GitHub Analyzer",
    desc: "AI breakdown of your repos, languages, strengths and gaps with actionable insights.",
    span: "lg:col-span-2",
  },
  {
    icon: FileText,
    title: "AI Resume Builder",
    desc: "ATS-friendly resumes with real-time scoring and live suggestions.",
    span: "",
  },
  {
    icon: Code2,
    title: "AI Code Reviewer",
    desc: "Catch bugs, security issues, and performance problems instantly.",
    span: "",
  },
  {
    icon: MessageSquare,
    title: "Interview Hub",
    desc: "Mock interviews and practice questions tailored to your role and seniority.",
    span: "lg:col-span-2",
  },
  {
    icon: MapIcon,
    title: "Career Roadmaps",
    desc: "Personalized learning paths from beginner to senior engineer.",
    span: "",
  },
  {
    icon: Globe,
    title: "Portfolio Builder",
    desc: "Generate a stunning developer portfolio site from your profile data.",
    span: "",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-medium text-primary">Features</span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
              Everything you need to level up
            </h2>
            <p className="mt-4 text-muted-foreground">
              Six AI-powered tools designed to make you a more competitive developer.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((f, i) => (
            <Reveal key={f.title} delay={i * 70} className={f.span}>
              <FeatureCard {...f} />
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="spotlight group relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
    >
      <div className="relative z-10">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-2">
          Learn more <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
