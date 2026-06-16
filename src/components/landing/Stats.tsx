import { Reveal } from "./shared";
import { TrendingUp, Users, Star, Zap, CheckCircle2, Activity } from "lucide-react";

const stats = [
  {
      v: "50K+",
      l: "Repos analyzed",
      icon: Activity,
      color: "#10b981",
      desc: "From open source to private",
    },
    {
      v: "12K+",
      l: "Resumes scored",
      icon: CheckCircle2,
      color: "#3b82f6",
      desc: "ATS optimization verified",
    },
    {
      v: "4.9/5",
      l: "Dev rating",
      icon: Star,
      color: "#eab308",
      desc: "Community driven feedback",
    },
    { v: "<3s", l: "AI latency", icon: Zap, color: "#ef4444", desc: "Real-time performance" },
  ];

export function Stats() {
  return (
    <section className="relative py-12 overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px]" />

        {/* Grid overlay for tech feel */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
          style={{ maskImage: "linear-gradient(to bottom, transparent, black, transparent)" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase rounded-full bg-primary/10 border border-primary/20">
              In Numbers
            </span>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Powered by real data</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;ve processed thousands of artifacts to train our models, ensuring accuracy
              across every stage of your career journey.
            </p>
          </div>
        </Reveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-px md:grid-cols-4 bg-border/20 border border-border/30 rounded-2xl overflow-hidden backdrop-blur-xl bg-card/30">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 100}>
              <StatCard stat={s} index={i} total={stats.length} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  stat,
  index,
  total,
}: {
  stat: (typeof stats)[0];
  index: number;
  total: number;
}) {
  const { v, l, icon: Icon, color, desc } = stat;

  // Calculate position for decorative connections
  const isTop = index < total / 2;
  const isRightHalf = index % 2 !== 0;

  return (
    <div className="group relative flex min-h-[200px] flex-col justify-between p-8 transition-all duration-500 hover:bg-card/50">
      {/* Connectors (only show on md screens) */}
      {index > 0 && isTop && (
        <div className="absolute top-1/2 left-[-1px] z-0 h-px w-8 -translate-y-1/2 border-t border-dashed border-border/50 group-hover:border-primary/30" />
      )}
      {isRightHalf && isTop && (
        <div className="absolute left-1/2 top-0 z-0 h-8 w-px -translate-x-1/2 border-l border-dashed border-border/50 group-hover:border-primary/30" />
      )}

      <div className="flex flex-col gap-4">
        {/* Icon Container */}
        <div
          className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card ring-1 ring-inset shadow-sm transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110`}
          style={{ borderColor: `${color}33`, backgroundColor: `${color}10` }}
        >
          <Icon className={`h-5 w-5`} style={{ color: color }} />
          {/* Icon Glow */}
          <div
            className="absolute inset-0 scale-125 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-50"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Big Number */}
        <div className="relative">
          <h3 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
            {v}
          </h3>
          {/* Shimmer effect on load */}
          <div
            className="absolute -left-4 -top-4 h-16 w-8 bg-gradient-to-b from-white/5 via-white/10 to-transparent opacity-0 blur-xl transition-opacity duration-500 [transform:rotate(-25deg)] group-hover:opacity-30"
            style={{
              left: index % 2 === 0 ? "-1rem" : "auto",
              right: index % 2 !== 0 ? "-1rem" : "auto",
            }}
          />
        </div>

        {/* Label */}
        <div className="space-y-1">
          <span className="block text-sm font-medium uppercase tracking-widest text-foreground/90">
            {l}
          </span>
          <span className="block text-xs text-muted-foreground/60">{desc}</span>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-700 group-hover:w-full" />

      {/* Hover highlight background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
