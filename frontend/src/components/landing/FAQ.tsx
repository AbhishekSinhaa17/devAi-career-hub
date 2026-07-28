import { Reveal } from "./shared";
import { Plus, MessageCircleQuestion, ArrowUpRight } from "lucide-react";

export function FAQ() {
  const items = [
    {
      q: "Is DevAI free?",
      a: "Yes — core features are free forever. Pro unlocks unlimited usage, mock interviews, and the portfolio builder.",
    },
    {
      q: "Which AI models do you use?",
      a: "We use a gateway of state-of-the-art models, automatically routing your task to the best model for the job.",
    },
    {
      q: "Do you store my code?",
      a: "Code submitted for review is stored encrypted in your private account. You can delete it anytime.",
    },
    {
      q: "Can I export my resume?",
      a: "Yes — export ATS-friendly PDF and HTML directly from the builder with a single click.",
    },
    {
      q: "Does it work with private repos?",
      a: "Absolutely. Grant read-only access and DevAI analyzes private repositories without ever exposing your source.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes — plans are month-to-month with no lock-in. Cancel or downgrade in one click from your billing settings.",
    },
  ];

  return (
    <section id="faq" className="relative py-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        {}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <MessageCircleQuestion className="h-3.5 w-3.5" /> FAQ
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Questions?
              <br />
              <span className="gradient-text">Answered.</span>
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              Everything you need to know about DevAI. Can&apos;t find what you&apos;re looking for?
            </p>
            <a
              href="mailto:support@devai.io"
              className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              Get in touch
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        </div>

        {}
        <div className="space-y-3">
          {items.map((it, i) => (
            <Reveal key={it.q} delay={i * 60}>
              <details className="faq-item group overflow-hidden rounded-xl border border-border/60 bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary/40 open:border-primary/40 open:bg-card/70 open:shadow-lg open:shadow-primary/5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium">
                  <span className="transition-colors group-open:text-primary">{it.q}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted/60 text-muted-foreground transition-all duration-300 group-hover:bg-primary/15 group-open:rotate-45 group-open:bg-primary/15 group-open:text-primary">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <div className="faq-body grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {it.a}
                    </p>
                  </div>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
