import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as authClient } from "./router-BcNxq6Cj.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import { w as ArrowLeft, T as Terminal, x as Cpu, y as GitBranch, F as FileText, z as Brain, b as CodeXml, k as TrendingUp, R as Rocket, Z as Zap, D as Mail, E as Lock, I as EyeOff, J as Eye, K as LoaderCircle, A as ArrowRight } from "../_libs/lucide-react.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "crypto";
import "async_hooks";
import "util";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./api-client-CbTdHRmP.mjs";
import "./server-CNwFEcD6.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/axios.mjs";
import "../_libs/form-data.mjs";
import "../_libs/combined-stream.mjs";
import "../_libs/delayed-stream.mjs";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "../_libs/mime-types.mjs";
import "../_libs/mime-db.mjs";
import "../_libs/asynckit.mjs";
import "../_libs/es-set-tostringtag.mjs";
import "../_libs/get-intrinsic.mjs";
import "../_libs/es-object-atoms.mjs";
import "../_libs/es-errors.mjs";
import "../_libs/math-intrinsics.mjs";
import "../_libs/gopd.mjs";
import "../_libs/es-define-property.mjs";
import "../_libs/has-symbols.mjs";
import "../_libs/get-proto.mjs";
import "../_libs/dunder-proto.mjs";
import "../_libs/call-bind-apply-helpers.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/hasown.mjs";
import "../_libs/has-tostringtag.mjs";
import "../_libs/proxy-from-env.mjs";
import "../_libs/https-proxy-agent.mjs";
import "net";
import "tls";
import "assert";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "os";
import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";
import "events";
import "http2";
import "../_libs/follow-redirects.mjs";
import "zlib";
import "../_libs/zod.mjs";
import "../_libs/sentry__node.mjs";
import "../_libs/sentry__core.mjs";
import "../_libs/sentry__node-core.mjs";
import "../_libs/sentry__opentelemetry.mjs";
import "../_libs/@opentelemetry/semantic-conventions+[...].mjs";
import "../_libs/opentelemetry__sdk-trace-base.mjs";
import "../_libs/opentelemetry__core.mjs";
import "../_libs/opentelemetry__resources.mjs";
import "node:events";
import "node:diagnostics_channel";
import "node:child_process";
import "node:fs";
import "node:os";
import "node:path";
import "node:util";
import "node:readline";
import "../_libs/opentelemetry__instrumentation.mjs";
import "../_libs/opentelemetry__api-logs.mjs";
import "require-in-the-middle";
import "import-in-the-middle";
import "node:http";
import "node:https";
import "node:worker_threads";
import "diagnostics_channel";
import "worker_threads";
import "node:zlib";
import "node:net";
import "node:tls";
import "module";
import "../_libs/sentry__server-utils.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
function ParticleCanvas() {
  const canvasRef = reactExports.useRef(null);
  const particlesRef = reactExports.useRef([]);
  const animFrameRef = reactExports.useRef(0);
  const mouseRef = reactExports.useRef({
    x: -9999,
    y: -9999
  });
  const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#818cf8", "#c084fc", "#38bdf8"];
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const count = Math.min(120, Math.floor(window.innerWidth * window.innerHeight / 1e4));
    particlesRef.current = Array.from({
      length: count
    }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 5e-3
    }));
    const onMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };
    window.addEventListener("mousemove", onMouseMove);
    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += p.pulseSpeed;
        const pulsedOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.vx += dx / dist * force * 0.5;
          p.vy += dy / dist * force * 0.5;
        }
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulsedOpacity;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ex = p.x - q.x;
          const ey = p.y - q.y;
          const edist = Math.sqrt(ex * ex + ey * ey);
          if (edist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - edist / 100) * 0.15;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(draw);
    };
    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "absolute inset-0 w-full h-full pointer-events-none", style: {
    opacity: 0.6
  } });
}
function useTypewriter(texts, speed = 80, pause = 2e3) {
  const [displayed, setDisplayed] = reactExports.useState("");
  const [textIndex, setTextIndex] = reactExports.useState(0);
  const [charIndex, setCharIndex] = reactExports.useState(0);
  const [deleting, setDeleting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const current = texts[textIndex];
    let timeout;
    if (!deleting && charIndex <= current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex));
        setCharIndex((c) => c + 1);
      }, speed);
    } else if (!deleting && charIndex > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex));
        setCharIndex((c) => c - 1);
      }, speed / 2);
    } else {
      setDeleting(false);
      setTextIndex((t) => (t + 1) % texts.length);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed, pause]);
  return displayed;
}
const CODE_SNIPPETS = ["git commit -m 'feat: AI-powered'", "const resume = await ai.generate()", "npm run analyze --github", "interview.prepare({ ai: true })", "portfolio.deploy({ stack: 'next' })", "roadmap.generate({ goal: 'senior' })"];
function FloatingCodeLine({
  text,
  delay,
  top,
  opacity
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-0 whitespace-nowrap font-mono text-xs text-indigo-400/40 dark:text-primary/40 select-none pointer-events-none", style: {
    top,
    opacity,
    animation: `login-codeFloat ${18 + delay}s linear ${delay}s infinite`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-500/60 dark:text-emerald-400/60", children: "$ " }),
    text
  ] });
}
const FEATURES = [{
  icon: GitBranch,
  label: "GitHub Analysis",
  color: "#10b981",
  glow: "rgba(16,185,129,0.3)"
}, {
  icon: FileText,
  label: "AI Resumes",
  color: "#6366f1",
  glow: "rgba(99,102,241,0.3)"
}, {
  icon: Brain,
  label: "Mock Interviews",
  color: "#8b5cf6",
  glow: "rgba(139,92,246,0.3)"
}, {
  icon: CodeXml,
  label: "Code Reviews",
  color: "#f59e0b",
  glow: "rgba(245,158,11,0.3)"
}, {
  icon: TrendingUp,
  label: "Career Roadmap",
  color: "#ef4444",
  glow: "rgba(239,68,68,0.3)"
}, {
  icon: Rocket,
  label: "Portfolio Builder",
  color: "#38bdf8",
  glow: "rgba(56,189,248,0.3)"
}];
function FeatureCard({
  feature,
  index
}) {
  const Icon = feature.icon;
  const [hovered, setHovered] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), className: "relative rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4 cursor-default overflow-hidden transition-all duration-500 shadow-sm dark:shadow-none", style: {
    animationDelay: `${index * 80}ms`,
    boxShadow: hovered ? `0 0 24px ${feature.glow}, inset 0 0 24px ${feature.glow}` : "none",
    borderColor: hovered ? feature.color + "40" : void 0,
    transform: hovered ? "translateY(-2px)" : "translateY(0)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 transition-opacity duration-500 rounded-2xl", style: {
      background: `radial-gradient(circle at 50% 50%, ${feature.color}12 0%, transparent 70%)`,
      opacity: hovered ? 1 : 0
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 h-px transition-all duration-1000", style: {
      background: `linear-gradient(90deg, transparent, ${feature.color}80, transparent)`,
      top: hovered ? "100%" : "0%",
      opacity: hovered ? 0 : 1
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl p-2 transition-all duration-300", style: {
        backgroundColor: feature.color + "18",
        boxShadow: hovered ? `0 0 12px ${feature.glow}` : "none"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 transition-transform duration-300", style: {
        color: feature.color,
        transform: hovered ? "scale(1.2) rotate(5deg)" : "scale(1)"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold transition-colors duration-300 text-slate-800 dark:text-[#94a3b8]", style: {
        color: hovered ? feature.color : void 0
      }, children: feature.label })
    ] })
  ] });
}
function StatCounter({
  value,
  label,
  delay
}) {
  const [visible, setVisible] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, {
      threshold: 0.5
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "group text-center cursor-default", style: {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `all 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black bg-gradient-to-br from-slate-900 to-indigo-600 dark:from-white dark:to-primary/60 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-violet-500 dark:group-hover:from-primary dark:group-hover:to-violet-400 transition-all duration-500", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mt-1 group-hover:text-indigo-500 dark:group-hover:text-slate-400 transition-colors", children: label })
  ] });
}
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [mounted, setMounted] = reactExports.useState(false);
  const cardRef = reactExports.useRef(null);
  const rotateRef = reactExports.useRef({
    x: 0,
    y: 0
  });
  const typewriterText = useTypewriter(["your GitHub profile.", "ATS-friendly resumes.", "interview skills.", "your career roadmap.", "stunning portfolios."], 75, 2200);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthCode = params.get("oauth_code");
    const errorParam = params.get("error");
    if (errorParam) {
      toast.error("Google login failed. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthCode) {
      setLoading(true);
      authClient.auth.exchangeGoogleCode(oauthCode).then(({
        error
      }) => {
        if (error) {
          toast.error(error.message);
          setLoading(false);
        } else {
          toast.success("Signed in with Google!");
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate({
            to: "/dashboard"
          });
        }
      });
      return;
    }
    authClient.auth.getSession().then(({
      data
    }) => {
      if (data.session) navigate({
        to: "/dashboard"
      });
    });
  }, [navigate]);
  const handleCardMouseMove = reactExports.useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateRef.current = {
      x: -dy * 6,
      y: dx * 6
    };
    cardRef.current.style.transform = `perspective(1000px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) scale3d(1.01,1.01,1.01)`;
    cardRef.current.style.transition = "transform 0.1s ease-out";
  }, []);
  const handleCardMouseLeave = reactExports.useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    cardRef.current.style.transition = "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)";
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await authClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }
  async function handleGoogle() {
    setLoading(true);
    const {
      error
    } = await authClient.auth.signInWithOAuth({
      provider: "google"
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "login-page", className: "relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-foreground transition-colors duration-500", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] group-hover:bg-slate-100 dark:group-hover:bg-white/[0.08] transition-colors shadow-sm dark:shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden md:block", children: "Back to Home" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ParticleCanvas, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-violet-300/30 dark:from-violet-600/10 via-indigo-300/20 dark:via-indigo-600/5 to-transparent rounded-full blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-cyan-300/20 dark:from-cyan-600/8 to-transparent rounded-full blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-tl from-purple-300/20 dark:from-purple-600/8 to-transparent rounded-full blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-[0.06] dark:opacity-[0.035]", style: {
        backgroundImage: `
              linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)
            `,
        backgroundSize: "60px 60px"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 overflow-hidden", children: CODE_SNIPPETS.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingCodeLine, { text: s, delay: i * 3, top: `${10 + i * 14}%`, opacity: 0.25 }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#f8fafc_80%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,#030712_80%)]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 w-full max-w-7xl mx-auto px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-16 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex flex-col gap-10", style: {
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateX(0)" : "translateX(-32px)",
        transition: "all 0.9s cubic-bezier(0.34,1.2,0.64,1)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/5 backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-indigo-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-[0.2em]", children: "AI Developer Platform" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-6xl xl:text-7xl font-black tracking-tight leading-[1.05]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 dark:text-white", children: "AI that" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 dark:text-white", children: "understands" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent", style: {
              backgroundSize: "200% 100%",
              animation: "login-gradientShift 4s ease infinite"
            }, children: "developers." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { className: "h-4 w-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0 animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg text-slate-600 dark:text-slate-400 font-mono", children: [
              "Analyze",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-indigo-600 dark:text-indigo-300 font-semibold", children: [
                typewriterText,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-0.5 h-5 bg-indigo-500 dark:bg-indigo-400 ml-0.5 align-middle animate-blink" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 dark:text-slate-500 text-base leading-relaxed max-w-lg mt-4", children: "From GitHub insights to personalized career roadmaps — DevAI is your intelligent co-pilot through every stage of your developer journey." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 max-w-lg", children: FEATURES.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { feature: f, index: i }, f.label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-10 pt-6 border-t border-slate-200 dark:border-white/[0.05]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCounter, { value: "50K+", label: "Repos Analyzed", delay: 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-10 bg-slate-200 dark:bg-white/[0.06]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCounter, { value: "12K+", label: "Careers Boosted", delay: 100 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-10 bg-slate-200 dark:bg-white/[0.06]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCounter, { value: "4.9★", label: "Developer Rating", delay: 200 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(40px)",
        transition: "all 1s cubic-bezier(0.34,1.2,0.64,1) 150ms"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:hidden mb-8 text-center space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3 text-indigo-600 dark:text-indigo-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest", children: "DevAI" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-slate-900 dark:text-white", children: "Welcome back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 dark:text-slate-500 text-sm", children: "Your AI-powered developer journey continues" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: cardRef, onMouseMove: handleCardMouseMove, onMouseLeave: handleCardMouseLeave, className: "relative rounded-3xl overflow-hidden cursor-default bg-white dark:bg-transparent border border-slate-200 dark:border-indigo-500/20 shadow-xl dark:shadow-2xl", style: {
          boxShadow: `
                  0 32px 64px -16px rgba(0,0,0,0.05),
                  0 0 80px rgba(99,102,241,0.05)
                `
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-white hidden dark:block", style: {
            background: "linear-gradient(135deg, rgba(15,15,30,0.95) 0%, rgba(10,10,25,0.98) 100%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 dark:via-indigo-500/60 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 w-16 h-16 border-t border-l border-indigo-200 dark:border-indigo-500/30 rounded-tl-3xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-16 h-16 border-t border-r border-violet-200 dark:border-violet-500/30 rounded-tr-3xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 w-16 h-16 border-b border-l border-violet-200 dark:border-violet-500/20 rounded-bl-3xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 w-16 h-16 border-b border-r border-indigo-200 dark:border-indigo-500/20 rounded-br-3xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-indigo-100/30 dark:from-indigo-600/[0.04] via-transparent to-violet-100/30 dark:to-violet-600/[0.04] pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-8 pt-8 pb-6 border-b border-slate-100 dark:border-white/[0.04]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-white" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-black text-slate-900 dark:text-white tracking-tight", children: "DevAI" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest", children: "Secure" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-slate-900 dark:text-white mt-4", children: "Sign in" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 text-sm mt-1", children: "Continue building your developer career" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-8 py-6 space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleGoogle, disabled: loading, className: "group relative h-11 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.07] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2.5 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white overflow-hidden shadow-sm dark:shadow-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-4 w-4 flex-shrink-0 relative z-10", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10", children: "Google" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-600", children: "or email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 group/f", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-500 group-focus-within/f:text-indigo-600 dark:group-focus-within/f:text-indigo-400 transition-colors", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-600 group-focus-within/f:text-indigo-600 dark:group-focus-within/f:text-indigo-400 transition-colors pointer-events-none z-10" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@company.com", required: true, className: "h-11 pl-10 rounded-xl bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-white/[0.05] focus:ring-0 focus:shadow-lg focus:shadow-indigo-500/10 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/15 hover:bg-white dark:hover:bg-white/[0.04]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 h-px scale-x-0 group-focus-within/f:scale-x-100 transition-transform duration-300 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 group/f", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 group-focus-within/f:text-indigo-600 dark:group-focus-within/f:text-indigo-400 transition-colors", children: "Password" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-[11px] font-semibold text-indigo-600 dark:text-slate-600 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors", children: "Forgot?" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-600 group-focus-within/f:text-indigo-600 dark:group-focus-within/f:text-indigo-400 transition-colors pointer-events-none z-10" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: showPassword ? "text" : "password", minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••••", required: true, className: "h-11 pl-10 pr-11 rounded-xl bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-white/[0.05] focus:ring-0 focus:shadow-lg focus:shadow-indigo-500/10 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/15 hover:bg-white dark:hover:bg-white/[0.04]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1", children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 h-px scale-x-0 group-focus-within/f:scale-x-100 transition-transform duration-300 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: loading, className: "group/btn relative w-full h-12 mt-2 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed shadow-md", style: {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)",
                boxShadow: "0 0 32px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.15)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative flex items-center justify-center gap-2", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                  "Authenticating..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  "Sign In",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-slate-600", children: [
              "New to DevAI?",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors", children: "Create account →" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 pb-6 flex items-center justify-center gap-4", children: [{
            icon: "🔒",
            text: "256-bit SSL"
          }, {
            icon: "🛡️",
            text: "SOC 2 Ready"
          }, {
            icon: "⚡",
            text: "99.9% Uptime"
          }].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: b.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold text-slate-500 dark:text-slate-700 uppercase tracking-wider", children: b.text })
          ] }, b.text)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-300 dark:via-violet-500/40 to-transparent" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-5 text-center text-xs text-slate-500 dark:text-slate-700", children: [
          "By signing in, you agree to our",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors underline underline-offset-2", children: "Terms" }),
          " & ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors underline underline-offset-2", children: "Privacy Policy" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes login-codeFloat {
          0% { transform: translateX(-100%); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes login-gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes login-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        #login-page .animate-blink {
          animation: login-blink 1s step-end infinite;
        }
        #login-page input:-webkit-autofill,
        #login-page input:-webkit-autofill:hover,
        #login-page input:-webkit-autofill:focus {
          -webkit-box-shadow: inset 0 0 0 40px var(--color-background) !important;
          -webkit-text-fill-color: var(--color-foreground) !important;
          caret-color: var(--color-foreground) !important;
        }
      ` })
  ] });
}
export {
  LoginPage as component
};
