import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "./shared";
import { Check, Zap, Shield, ArrowRight, Github, TrendingUp } from "lucide-react";

export function Hero() {
  return (
    <section className="relative">
      <div className="relative mx-auto max-w-5xl px-6 pt-6 pb-28 text-center md:pt-8">
        <Reveal>
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Powered by next-gen AI models
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mx-auto mt-7 max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Ship your{" "}
            <span className="gradient-text relative whitespace-nowrap">developer career</span>{" "}
            forward with AI
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            Analyze your GitHub, build ATS resumes, generate portfolios, crack interviews, and
            follow personalized roadmaps — all in one intelligent platform built for developers.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <Button
                size="lg"
                className="group h-12 gap-2 px-7 text-base shadow-xl shadow-primary/25"
              >
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-12 px-7 text-base backdrop-blur">
                Explore features
              </Button>
            </a>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-warning" /> Instant analysis
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" /> Your data, private
            </span>
          </div>
        </Reveal>

        {/* floating product preview */}
        <Reveal delay={400}>
          <HeroPreview />
        </Reveal>
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="float-card relative mx-auto mt-16 max-w-4xl">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/30 to-transparent opacity-60 blur-sm" />
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl backdrop-blur-xl">
        {/* window bar */}
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <span className="h-3 w-3 rounded-full bg-green-400/80" />
          </div>
          <div className="ml-3 flex-1 rounded-md bg-background/60 px-3 py-1 text-left text-xs text-muted-foreground">
            app.devai.io/dashboard
          </div>
        </div>
        {/* fake dashboard */}
        <div className="grid gap-4 p-6 md:grid-cols-3">
          <div className="glass-card rounded-xl p-4 text-left md:col-span-2">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Github className="h-4 w-4 text-primary" /> GitHub Score
            </div>
            <div className="flex items-end gap-1.5">
              {[40, 65, 50, 80, 70, 95, 88].map((h, i) => (
                <div
                  key={i}
                  className="bar flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
                  style={{ height: `${h}px`, animationDelay: `${i * 90}ms` }}
                />
              ))}
            </div>
          </div>
          <div className="glass-card flex flex-col justify-between rounded-xl p-4 text-left">
            <div className="text-sm font-medium">Resume ATS</div>
            <div className="gradient-text text-4xl font-bold">94%</div>
            <div className="flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" /> +12 this week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
