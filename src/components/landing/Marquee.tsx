import SiTypescript from "@icons-pack/react-simple-icons/icons/SiTypescript.mjs";
import SiPython from "@icons-pack/react-simple-icons/icons/SiPython.mjs";
import SiRust from "@icons-pack/react-simple-icons/icons/SiRust.mjs";
import SiGo from "@icons-pack/react-simple-icons/icons/SiGo.mjs";
import SiReact from "@icons-pack/react-simple-icons/icons/SiReact.mjs";
import SiNodedotjs from "@icons-pack/react-simple-icons/icons/SiNodedotjs.mjs";
import SiOpenjdk from "@icons-pack/react-simple-icons/icons/SiOpenjdk.mjs";
import SiKotlin from "@icons-pack/react-simple-icons/icons/SiKotlin.mjs";
import SiSwift from "@icons-pack/react-simple-icons/icons/SiSwift.mjs";
import SiCplusplus from "@icons-pack/react-simple-icons/icons/SiCplusplus.mjs";
import SiRuby from "@icons-pack/react-simple-icons/icons/SiRuby.mjs";
import SiPhp from "@icons-pack/react-simple-icons/icons/SiPhp.mjs";

const langs = [
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "Python", icon: SiPython, color: "#3776AB" },
  { name: "Rust", icon: SiRust, color: "#CE422B" },
  { name: "Go", icon: SiGo, color: "#00ADD8" },
  { name: "React", icon: SiReact, color: "#61DAFB" },
  { name: "Node.js", icon: SiNodedotjs, color: "#5FA04E" },
  { name: "Java", icon: SiOpenjdk, color: "#ED8B00" },
  { name: "Kotlin", icon: SiKotlin, color: "#7F52FF" },
  { name: "Swift", icon: SiSwift, color: "#F05138" },
  { name: "C++", icon: SiCplusplus, color: "#00599C" },
  { name: "Ruby", icon: SiRuby, color: "#CC342D" },
  { name: "PHP", icon: SiPhp, color: "#777BB4" },
];

export function Marquee() {
  const repeated = [...langs, ...langs, ...langs];

  return (
    <section className="relative border-y border-border/30 py-0 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-muted/10 to-background" />

      {/* Top + bottom edge lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Left + right fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

      {/* Label */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <span className="rounded-full border border-border/50 bg-background/90 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 backdrop-blur-sm whitespace-nowrap shadow-sm">
          Supports all stacks
        </span>
      </div>

      {/* Track */}
      <div className="relative flex overflow-hidden py-5 [--duration:40s]">
        {/* Row 1 — left to right */}
        <div className="marquee flex w-max shrink-0 gap-0">
          {repeated.map((lang, i) => (
            <LangPill key={`a-${i}`} lang={lang} />
          ))}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="marquee flex w-max shrink-0 gap-0" aria-hidden>
          {repeated.map((lang, i) => (
            <LangPill key={`b-${i}`} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LangPill({
  lang,
}: {
  lang: {
    name: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
  };
}) {
  const Icon = lang.icon;
  return (
    <span className="group mx-3 inline-flex cursor-default items-center gap-2.5 rounded-full border border-border/30 bg-card/40 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-border/70 hover:bg-card/80 hover:text-foreground hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5">
      {/* Icon with brand color on hover */}
      <span className="relative grid h-5 w-5 shrink-0 place-items-center">
        <Icon
          className="h-4 w-4 transition-all duration-300 group-hover:scale-110"
          style={{ color: lang.color, opacity: 0.7 }}
        />
        {/* Glow behind icon on hover */}
        <span
          className="absolute inset-0 rounded-full opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-40"
          style={{ backgroundColor: lang.color }}
        />
      </span>
      {lang.name}
    </span>
  );
}
