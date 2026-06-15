import { Reveal } from "./shared";

export function Stats() {
  const stats = [
    { v: "50K+", l: "Repos analyzed" },
    { v: "12K+", l: "Resumes scored" },
    { v: "4.9/5", l: "Developer rating" },
    { v: "<3s", l: "Avg AI response" },
  ];
  return (
    <section className="border-y border-border/40 bg-muted/20 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 80}>
            <div className="text-center">
              <div className="gradient-text text-4xl font-bold tracking-tight md:text-5xl">
                {s.v}
              </div>
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                {s.l}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
