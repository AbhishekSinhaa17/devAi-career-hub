import { useEffect, useRef, useState } from "react";

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora-blob aurora-1" />
      <div className="aurora-blob aurora-2" />
      <div className="aurora-blob aurora-3" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_75%)]" />
      <div className="grid-overlay absolute inset-0 opacity-[0.04]" />
    </div>
  );
}

export function StyleInjector() {
  return (
    <style>{`
      .gradient-text {
        background: linear-gradient(120deg, var(--primary), var(--chart-2));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .grid-overlay {
        background-image:
          linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px);
        background-size: 48px 48px;
      }
      .aurora-blob {
        position: absolute;
        border-radius: 9999px;
        filter: blur(90px);
        opacity: 0.5;
      }
      .aurora-1 {
        width: 480px; height: 480px;
        background: hsl(var(--primary) / 0.5);
        top: -120px; left: -80px;
        animation: drift1 18s ease-in-out infinite;
      }
      .aurora-2 {
        width: 420px; height: 420px;
        background: hsl(var(--chart-2) / 0.45);
        top: 10%; right: -100px;
        animation: drift2 22s ease-in-out infinite;
      }
      .aurora-3 {
        width: 520px; height: 520px;
        background: hsl(var(--primary) / 0.3);
        bottom: -160px; left: 30%;
        animation: drift3 26s ease-in-out infinite;
      }
      .aurora-cta {
        width: 400px; height: 400px;
        background: hsl(var(--primary) / 0.35);
        top: -100px; left: 50%;
        transform: translateX(-50%);
        animation: pulse-slow 8s ease-in-out infinite;
      }
      @keyframes drift1 {
        0%,100% { transform: translate(0,0) scale(1); }
        50% { transform: translate(60px,40px) scale(1.1); }
      }
      @keyframes drift2 {
        0%,100% { transform: translate(0,0) scale(1); }
        50% { transform: translate(-50px,60px) scale(1.15); }
      }
      @keyframes drift3 {
        0%,100% { transform: translate(0,0) scale(1); }
        50% { transform: translate(40px,-50px) scale(1.08); }
      }
      @keyframes pulse-slow {
        0%,100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
        50% { opacity: 0.5; transform: translateX(-50%) scale(1.1); }
      }
      .spotlight::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(420px circle at var(--mx) var(--my), hsl(var(--primary) / 0.12), transparent 45%);
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 0;
      }
      .spotlight:hover::before { opacity: 1; }
      .float-card { animation: floaty 6s ease-in-out infinite; }
      @keyframes floaty {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .bar {
        animation: grow 0.8s ease-out both;
        transform-origin: bottom;
      }
      @keyframes grow {
        from { transform: scaleY(0); opacity: 0; }
        to { transform: scaleY(1); opacity: 1; }
      }
      .marquee { animation: scroll 30s linear infinite; }
      @keyframes scroll {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      .shine {
        background: linear-gradient(120deg, transparent 30%, hsl(0 0% 100% / 0.4) 50%, transparent 70%);
        transform: translateX(-100%);
        animation: shine 4s ease-in-out infinite;
      }
      @keyframes shine {
        0%, 60% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @media (prefers-reduced-motion: reduce) {
        .aurora-blob, .float-card, .bar, .marquee, .shine { animation: none !important; }
      }
    `}</style>
  );
}
