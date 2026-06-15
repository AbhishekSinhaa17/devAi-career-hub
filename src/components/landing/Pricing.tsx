import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "./shared";
import { Check } from "lucide-react";

export function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      desc: "Everything to get started",
      features: ["GitHub analysis", "1 resume", "10 code reviews / mo", "Roadmap generator"],
    },
    {
      name: "Pro",
      price: "$12",
      desc: "For developers actively job-hunting",
      features: [
        "Unlimited resumes & scoring",
        "Unlimited code reviews",
        "Mock interviews",
        "Portfolio builder",
        "Priority AI",
      ],
      featured: true,
    },
    {
      name: "Team",
      price: "$32",
      desc: "Bootcamps and small teams",
      features: ["Team analytics", "Shared interview banks", "Admin dashboard", "SSO ready"],
    },
  ];
  return (
    <section id="pricing" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-sm font-medium text-primary">Pricing</span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid items-start gap-5 md:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <div
                className={`relative h-full overflow-hidden rounded-2xl border bg-card/50 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 ${
                  t.featured
                    ? "border-primary/50 shadow-2xl shadow-primary/15 md:scale-105"
                    : "border-border/60 hover:border-primary/30"
                }`}
              >
                {t.featured && (
                  <>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <span className="absolute right-5 top-5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                      Popular
                    </span>
                  </>
                )}
                <h3 className="font-semibold">{t.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">{t.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                <ul className="mt-7 space-y-3 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                        <Check className="h-3 w-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="mt-8 block">
                  <Button variant={t.featured ? "default" : "outline"} className="w-full" size="lg">
                    Get started
                  </Button>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
