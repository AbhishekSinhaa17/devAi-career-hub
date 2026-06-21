import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "./shared";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <>
      <section className="px-6 py-12">
        <Reveal>
          <div className="cta-glow relative mx-auto max-w-5xl rounded-[2rem] p-px">
            <div className="relative overflow-hidden rounded-[calc(2rem-1px)] border border-primary/20 bg-gradient-to-br from-primary/15 via-card/70 to-chart-2/10 px-8 py-20 text-center backdrop-blur-xl">
              {}
              <div className="aurora-blob aurora-cta" />
              <div className="cta-dots pointer-events-none absolute inset-0 opacity-[0.4]" />
              <div className="cta-shine pointer-events-none absolute inset-0" />

              <div className="relative z-10">
                <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" /> Start in seconds
                </span>

                <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-5xl">
                  Ready to accelerate your <span className="gradient-text">developer career?</span>
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground md:text-lg">
                  Join thousands of developers using DevAI to analyze, build, and land their next
                  role.
                </p>

                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="group h-12 gap-2 px-8 text-base shadow-xl shadow-primary/25"
                    >
                      Get started free
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  <a href="#pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 px-8 text-base backdrop-blur"
                    >
                      View pricing
                    </Button>
                  </a>
                </div>

                {}
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <div className="flex -space-x-2.5">
                    {[
                      "from-primary to-chart-2",
                      "from-chart-2 to-primary",
                      "from-primary/80 to-chart-3",
                      "from-chart-3 to-primary",
                      "from-chart-2 to-chart-3",
                    ].map((g, i) => (
                      <div
                        key={i}
                        className={`h-9 w-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-card`}
                      />
                    ))}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">12,000+</span> developers
                    onboard
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success" />
                    No credit card
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success" />
                    Free forever plan
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success" />
                    Cancel anytime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <style>{`
        .cta-glow::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: conic-gradient(
            from 0deg,
            hsl(var(--primary) / 0.6),
            hsl(var(--chart-2) / 0.4),
            transparent 40%,
            transparent 60%,
            hsl(var(--primary) / 0.6)
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: spin-border 8s linear infinite;
        }

        @keyframes spin-border {
          to {
            transform: rotate(360deg);
          }
        }

        .cta-dots {
          background-image: radial-gradient(
            hsl(var(--primary) / 0.25) 1px,
            transparent 1px
          );
          background-size: 22px 22px;
          -webkit-mask: radial-gradient(
            circle at center,
            #000,
            transparent 70%
          );
          mask: radial-gradient(
            circle at center,
            #000,
            transparent 70%
          );
        }

        .cta-shine {
          background: linear-gradient(
            120deg,
            transparent 35%,
            hsl(0 0% 100% / 0.06) 50%,
            transparent 65%
          );
          transform: translateX(-100%);
          animation: cta-shine 6s ease-in-out infinite;
        }

        @keyframes cta-shine {
          0%, 70% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-glow::before,
          .cta-shine {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
