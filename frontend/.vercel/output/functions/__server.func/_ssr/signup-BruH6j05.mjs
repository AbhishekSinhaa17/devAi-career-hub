import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as authClient } from "./router-BcNxq6Cj.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import { w as ArrowLeft, Z as Zap, D as Mail, U as User, E as Lock, I as EyeOff, J as Eye, K as LoaderCircle, A as ArrowRight, S as Sparkles, T as Terminal, y as GitBranch, F as FileText, z as Brain, b as CodeXml, f as CircleCheck, N as CircleX } from "../_libs/lucide-react.mjs";
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
function useTypewriter(texts, speed = 80, pause = 2200) {
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
function getPasswordStrength(password) {
  const checks = [{
    label: "At least 8 characters",
    pass: password.length >= 8
  }, {
    label: "Uppercase letter",
    pass: /[A-Z]/.test(password)
  }, {
    label: "Number",
    pass: /[0-9]/.test(password)
  }, {
    label: "Special character",
    pass: /[^A-Za-z0-9]/.test(password)
  }];
  const score = checks.filter((c) => c.pass).length;
  const levels = [{
    label: "Too weak",
    color: "#ef4444"
  }, {
    label: "Weak",
    color: "#f97316"
  }, {
    label: "Fair",
    color: "#eab308"
  }, {
    label: "Strong",
    color: "#22c55e"
  }, {
    label: "Very strong",
    color: "#10b981"
  }];
  return {
    score,
    checks,
    ...levels[score]
  };
}
function PasswordStrengthMeter({
  password
}) {
  const {
    score,
    label,
    color,
    checks
  } = getPasswordStrength(password);
  if (!password) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: Array.from({
      length: 4
    }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 flex-1 rounded-full transition-all duration-500", style: {
      backgroundColor: i < score ? color : "var(--color-border)",
      boxShadow: i < score ? `0 0 6px ${color}80` : "none"
    } }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold", style: {
      color
    }, children: label }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1", children: checks.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
      c.pass ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-emerald-500 dark:text-emerald-400 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 text-slate-400 dark:text-slate-600 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] font-medium transition-colors ${c.pass ? "text-slate-700 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"}`, children: c.label })
    ] }, c.label)) })
  ] });
}
const CODE_SNIPPETS = ["const career = await ai.accelerate(you)", "git push origin feature/new-job", "resume.generate({ ats: true, ai: true })", "portfolio.deploy({ impressHR: true })", "interview.practice({ rounds: Infinity })", "roadmap.create({ goal: 'staff-engineer' })"];
function FloatingCodeLine({
  text,
  delay,
  top
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-0 whitespace-nowrap font-mono text-xs text-emerald-600/40 dark:text-emerald-400/30 select-none pointer-events-none", style: {
    top,
    animation: `signup-codeFloat ${20 + delay}s linear ${delay}s infinite`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-teal-500/60 dark:text-teal-400/50", children: "$ " }),
    text
  ] });
}
const FEATURES = [{
  icon: GitBranch,
  label: "GitHub Analysis",
  color: "#10b981",
  glow: "rgba(16,185,129,0.3)",
  desc: "Deep profile insights"
}, {
  icon: FileText,
  label: "AI Resumes",
  color: "#0ea5e9",
  glow: "rgba(14,165,233,0.3)",
  desc: "ATS-optimized in seconds"
}, {
  icon: Brain,
  label: "Mock Interviews",
  color: "#8b5cf6",
  glow: "rgba(139,92,246,0.3)",
  desc: "Practice with AI panels"
}, {
  icon: CodeXml,
  label: "Code Reviews",
  color: "#f59e0b",
  glow: "rgba(245,158,11,0.3)",
  desc: "Instant AI feedback"
}];
function FeatureCard({
  feature,
  index
}) {
  const Icon = feature.icon;
  const [hovered, setHovered] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), className: "relative rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#030712]/40 backdrop-blur-sm p-3.5 cursor-default overflow-hidden shadow-sm dark:shadow-none", style: {
    transition: "all 0.4s cubic-bezier(0.34,1.2,0.64,1)",
    boxShadow: hovered ? `0 0 20px ${feature.glow}, inset 0 0 20px ${feature.glow}` : "none",
    borderColor: hovered ? feature.color + "40" : void 0,
    transform: hovered ? "translateY(-3px) scale(1.02)" : "none"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 transition-opacity duration-500 rounded-2xl", style: {
      background: `radial-gradient(circle at 50% 50%, ${feature.color}15 0%, transparent 70%)`,
      opacity: hovered ? 1 : 0
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl p-2 flex-shrink-0 mt-0.5 transition-all duration-300", style: {
        backgroundColor: feature.color + "20",
        boxShadow: hovered ? `0 0 14px ${feature.glow}` : "none"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4", style: {
        color: feature.color,
        transform: hovered ? "scale(1.2) rotate(8deg)" : "scale(1)",
        transition: "transform 0.3s ease"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold transition-colors duration-300 text-slate-900 dark:text-[#e2e8f0]", style: {
          color: hovered ? feature.color : void 0
        }, children: feature.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500 dark:text-slate-400 mt-0.5", children: feature.desc })
      ] })
    ] })
  ] });
}
function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [mounted, setMounted] = reactExports.useState(false);
  const [success, setSuccess] = reactExports.useState(false);
  const typewriterText = useTypewriter(["your dream job.", "interview confidence.", "a standout portfolio.", "your career roadmap.", "ATS-perfect resumes."], 75, 2200);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);
  reactExports.useEffect(() => {
    authClient.auth.getSession().then(({
      data
    }) => {
      if (data.session) navigate({
        to: "/dashboard"
      });
    });
  }, [navigate]);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await authClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name
          }
        }
      });
      if (error) throw error;
      setSuccess(true);
      toast.success("Welcome to DevAI! Check your email to confirm.");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "signup-page", className: "flex min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-foreground transition-colors duration-500", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] group-hover:bg-slate-100 dark:group-hover:bg-white/[0.08] transition-colors shadow-sm dark:shadow-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden md:block", children: "Back to Home" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-[400px] mx-auto", style: {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateX(0)" : "translateX(-20px)",
      transition: "all 0.8s cubic-bezier(0.34,1.56,0.64,1)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 mb-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-white" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-black text-slate-900 dark:text-white tracking-tight", children: "DevAI" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-slate-900 dark:text-white", children: "Create an account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 dark:text-slate-400 text-sm mt-2", children: "Start building your developer career for free." })
      ] }),
      success ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4 py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-8 w-8 text-emerald-600 dark:text-emerald-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Check your email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-slate-500 dark:text-slate-400 text-sm max-w-[300px] mx-auto", children: [
          "We've sent a magic link to",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 dark:text-white font-semibold", children: email }),
          ". Click it to activate your account."
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleGoogle, disabled: loading, className: "group relative h-11 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2.5 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white overflow-hidden shadow-sm dark:shadow-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-4 w-4 flex-shrink-0 relative z-10", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10", children: "Google" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500", children: "or continue with email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 group/f", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors", children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-600 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors pointer-events-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "Jane Doe", required: true, className: "h-11 pl-10 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-white/[0.04] focus:ring-0 focus:shadow-lg focus:shadow-emerald-500/10 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/15" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 group/f", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-600 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors pointer-events-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", required: true, className: "h-11 pl-10 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-white/[0.04] focus:ring-0 focus:shadow-lg focus:shadow-emerald-500/10 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/15" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 group/f", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-600 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors pointer-events-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", required: true, className: "h-11 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-white/[0.04] focus:ring-0 focus:shadow-lg focus:shadow-emerald-500/10 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/15" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1", children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) })
            ] }),
            password && /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordStrengthMeter, { password })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: loading || password.length < 6, className: "group/btn relative w-full h-12 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed shadow-md", style: {
            background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
            boxShadow: "0 0 24px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative flex items-center justify-center gap-2", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Create Account",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" })
            ] }) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-8 text-center text-sm text-slate-500", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors", children: "Sign in →" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex w-[55%] relative flex-col justify-center px-16 xl:px-24 border-l border-slate-200 dark:border-white/[0.05] overflow-hidden bg-slate-50 dark:bg-[#03080c] transition-colors duration-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-[0.05] dark:opacity-[0.03]", style: {
        backgroundImage: `linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)`,
        backgroundSize: "64px 64px"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: CODE_SNIPPETS.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingCodeLine, { text: s, delay: i * 4, top: `${15 + i * 15}%` }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-lg", style: {
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(40px)",
        transition: "all 1s cubic-bezier(0.34,1.2,0.64,1) 200ms"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 backdrop-blur-xl mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-[0.2em]", children: "Join 12,000+ Developers" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 dark:text-white", children: "Build" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 dark:text-white", children: "the career" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent", style: {
            backgroundSize: "200% 100%",
            animation: "signup-gradientShift 4s ease infinite"
          }, children: "you deserve." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "h-5 w-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl text-slate-600 dark:text-slate-300 font-mono", children: [
            "Land",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-600 dark:text-emerald-300 font-semibold", children: [
              typewriterText,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-0.5 h-5 bg-emerald-500 dark:bg-emerald-400 ml-0.5 align-middle animate-blink" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 mb-10", children: FEATURES.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { feature: f, index: i }, f.label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-6 pt-6 border-t border-slate-200 dark:border-white/[0.08]", children: [{
          icon: "🔒",
          text: "256-bit SSL"
        }, {
          icon: "✨",
          text: "Free Forever"
        }, {
          icon: "⚡",
          text: "Instant Setup"
        }].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: b.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider", children: b.text })
        ] }, b.text)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes signup-codeFloat {
          0% { transform: translateX(-50px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(600px); opacity: 0; }
        }
        @keyframes signup-gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes signup-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        #signup-page .animate-blink {
          animation: signup-blink 1s step-end infinite;
        }
        #signup-page input:-webkit-autofill,
        #signup-page input:-webkit-autofill:hover,
        #signup-page input:-webkit-autofill:focus {
          -webkit-box-shadow: inset 0 0 0 40px var(--color-background) !important;
          -webkit-text-fill-color: var(--color-foreground) !important;
          caret-color: var(--color-foreground) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      ` })
  ] });
}
export {
  SignupPage as component
};
