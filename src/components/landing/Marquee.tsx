export function Marquee() {
  const langs = [
    "TypeScript",
    "Python",
    "Rust",
    "Go",
    "React",
    "Node.js",
    "Java",
    "Kotlin",
    "Swift",
    "C++",
    "Ruby",
    "PHP",
  ];
  return (
    <section className="border-y border-border/40 bg-muted/20 py-6">
      <div className="relative overflow-hidden">
        <div className="marquee flex w-max gap-12 whitespace-nowrap text-sm font-medium text-muted-foreground">
          {[...langs, ...langs].map((l, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
