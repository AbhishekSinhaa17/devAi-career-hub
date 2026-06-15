import { Reveal } from "./shared";
import { Plus } from "lucide-react";

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
  ];
  return (
    <section id="faq" className="py-28">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-sm font-medium text-primary">FAQ</span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
              Frequently asked
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 space-y-3">
          {items.map((it, i) => (
            <Reveal key={it.q} delay={i * 70}>
              <details className="group rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur transition-colors hover:border-primary/30 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {it.q}
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-muted/60 transition-transform duration-300 group-open:rotate-45">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
