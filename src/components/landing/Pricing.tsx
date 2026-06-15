import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "./shared";
import { Check, Sparkles, Zap, Users } from "lucide-react";

export function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Everything you need to get started on your journey.",
      icon: Zap,
      features: ["GitHub analysis", "1 resume", "10 code reviews / mo", "Roadmap generator"],
      cta: "Start for free",
      featured: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      desc: "The complete toolkit for developers actively job-hunting.",
      icon: Sparkles,
      features: [
        "Unlimited resumes & scoring",
        "Unlimited code reviews",
        "Mock interviews",
        "Portfolio builder",
        "Priority AI",
      ],
      cta: "Get Pro",
      featured: true,
    },
    {
      name: "Team",
      price: "$32",
      period: "per month",
      desc: "Built for bootcamps, cohorts, and small engineering teams.",
      icon: Users,
      features: ["Team analytics", "Shared interview banks", "Admin dashboard", "SSO ready"],
      cta: "Contact sales",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium tracking-wide text-primary uppercase">
                Pricing
              </span>
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
              Invest in your career
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Start free, no credit card required. Upgrade when you&apos;re ready to accelerate.
            </p>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="mt-16 grid items-stretch gap-4 md:grid-cols-3">
          {tiers.map((t, i) => {
            const Icon = t.icon;
            return (
              <Reveal key={t.name} delay={i * 90}>
                {t.featured ? (
                  /* Featured card */
                  <div className="relative h-full rounded-3xl p-px bg-gradient-to-b from-primary via-primary/60 to-primary/20 shadow-2xl shadow-primary/20">
                    {/* Glow */}
                    <div className="pointer-events-none absolute inset-0 rounded-3xl bg-primary/10 blur-xl" />

                    <div className="relative h-full rounded-[23px] bg-card p-8 flex flex-col">
                      {/* Popular badge */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                          <Sparkles className="h-3 w-3" />
                          Most Popular
                        </span>
                      </div>

                      {/* Icon */}
                      <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>

                      {/* Tier info */}
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                        {t.name}
                      </p>
                      <div className="mt-3 flex items-end gap-1.5">
                        <span className="text-6xl font-bold tracking-tighter">{t.price}</span>
                        <div className="mb-2 flex flex-col leading-tight">
                          <span className="text-xs text-muted-foreground">/mo</span>
                          <span className="text-xs text-muted-foreground">{t.period}</span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>

                      {/* Divider */}
                      <div className="my-7 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                      {/* Features */}
                      <ul className="space-y-3.5 flex-1">
                        {t.features.map((f) => (
                          <li key={f} className="flex items-center gap-3 text-sm">
                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 ring-1 ring-primary/25">
                              <Check className="h-3 w-3 text-primary" />
                            </span>
                            <span className="font-medium">{f}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Link to="/signup" className="mt-8 block">
                        <Button
                          className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                          size="lg"
                        >
                          {t.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Standard card */
                  <div className="group relative h-full rounded-3xl border border-border/50 bg-card/40 p-8 backdrop-blur-sm flex flex-col transition-all duration-500 hover:border-primary/20 hover:bg-card/70 hover:shadow-xl hover:shadow-black/5">
                    {/* Subtle top highlight on hover */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all duration-500 group-hover:via-primary/30" />

                    {/* Icon */}
                    <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/50 transition-colors duration-300 group-hover:border-primary/20 group-hover:bg-primary/5">
                      <Icon className="h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                    </div>

                    {/* Tier info */}
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t.name}
                    </p>
                    <div className="mt-3 flex items-end gap-1.5">
                      <span className="text-6xl font-bold tracking-tighter">{t.price}</span>
                      <div className="mb-2 flex flex-col leading-tight">
                        <span className="text-xs text-muted-foreground">/mo</span>
                        <span className="text-xs text-muted-foreground">{t.period}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>

                    {/* Divider */}
                    <div className="my-7 h-px bg-border/60" />

                    {/* Features */}
                    <ul className="space-y-3.5 flex-1">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-muted ring-1 ring-border/60">
                            <Check className="h-3 w-3 text-muted-foreground" />
                          </span>
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link to="/signup" className="mt-8 block">
                      <Button
                        variant="outline"
                        className="w-full h-12 rounded-xl text-sm font-semibold border-border/60 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary"
                        size="lg"
                      >
                        {t.cta}
                      </Button>
                    </Link>
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>

        {/* Footer note */}
        <Reveal delay={300}>
          <p className="mt-10 text-center text-sm text-muted-foreground/70">
            All plans include a 14-day money-back guarantee.{" "}
            <Link
              to="/signup"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
            >
              View full plan comparison →
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
