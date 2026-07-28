import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link, u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { g as getDashboard } from "./ai.functions-CrNXurDM.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import { x as Cpu, e as Activity, y as GitBranch, F as FileText, R as Rocket, z as Brain, r as Trophy, g as Star, Z as Zap, a9 as Medal, aa as FileBadge, A as ArrowRight, M as MessageSquare, V as ChartColumn, S as Sparkles, B as Briefcase, k as TrendingUp, G as Github, ab as TrendingDown, ac as Minus, n as ChevronRight } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, a as RadarChart, P as PolarGrid, b as PolarAngleAxis, c as Radar, T as Tooltip } from "../_libs/recharts.mjs";
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
import "./router-BcNxq6Cj.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
function useCountUp(target, duration = 1200) {
  const [count, setCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}
function BackgroundOrbs() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full bg-indigo-600/10 dark:bg-indigo-600/8 blur-3xl animate-pulse" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-violet-600/10 dark:bg-violet-600/6 blur-3xl", style: {
      animation: "pulse 4s ease-in-out 1s infinite"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-40 left-1/3 w-[350px] h-[350px] rounded-full bg-purple-600/10 dark:bg-purple-600/6 blur-3xl", style: {
      animation: "pulse 5s ease-in-out 2s infinite"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-[0.05] dark:opacity-[0.025]", style: {
      backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
      backgroundSize: "60px 60px"
    } })
  ] });
}
function DevScoreRing({
  score,
  trend
}) {
  const animScore = useCountUp(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - animScore / 100 * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#6366f1" : score >= 25 ? "#f59e0b" : "#ef4444";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "140", height: "140", className: "-rotate-90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "70", cy: "70", r: radius, fill: "none", className: "stroke-slate-200 dark:stroke-white/5", strokeWidth: "10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "70", cy: "70", r: radius, fill: "none", stroke: color, strokeWidth: "10", strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: offset, style: {
          transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)",
          filter: `drop-shadow(0 0 8px ${color}80)`
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl font-black", style: {
          color
        }, children: animScore }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 uppercase tracking-widest font-bold", children: "Score" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 uppercase tracking-widest font-bold mb-1", children: "Career Health" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-slate-900 dark:text-white", children: "Developer Score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 dark:text-slate-500 text-sm mt-1", children: "Your comprehensive career readiness rating" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold", style: {
        backgroundColor: trend > 0 ? "rgba(16,185,129,0.1)" : trend < 0 ? "rgba(239,68,68,0.1)" : "rgba(100,116,139,0.1)",
        color: trend > 0 ? "#10b981" : trend < 0 ? "#ef4444" : "#64748b",
        border: `1px solid ${trend > 0 ? "rgba(16,185,129,0.2)" : trend < 0 ? "rgba(239,68,68,0.2)" : "rgba(100,116,139,0.2)"}`
      }, children: [
        trend > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5" }) : trend < 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3.5 w-3.5" }),
        Math.abs(trend),
        " pts this week"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/developer-score", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-300 relative overflow-hidden", style: {
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        boxShadow: "0 0 20px rgba(99,102,241,0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative", children: "View Full Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 relative transition-transform group-hover:translate-x-0.5" })
      ] }) })
    ] })
  ] });
}
function MetricCard({
  label,
  value,
  loading,
  icon: Icon,
  color = "#6366f1"
}) {
  const animated = useCountUp(value);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 overflow-hidden group hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-500 shadow-sm dark:shadow-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", style: {
      background: `radial-gradient(circle at 50% 0%, ${color}10 0%, transparent 60%)`
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500", style: {
      background: `linear-gradient(90deg, transparent, ${color}60, transparent)`
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-xl flex items-center justify-center", style: {
          backgroundColor: `${color}18`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4.5 w-4.5", style: {
          color
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600", children: label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl font-black text-slate-900 dark:text-white", children: loading ? "—" : animated }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 dark:text-slate-600 text-sm font-semibold", children: "/100" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all duration-1000 ease-out", style: {
        width: `${animated}%`,
        background: `linear-gradient(90deg, ${color}80, ${color})`,
        boxShadow: `0 0 8px ${color}60`
      } }) })
    ] })
  ] });
}
function CustomTooltip({
  active,
  payload
}) {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#0f0f1e]/95 backdrop-blur-xl px-3 py-2 text-sm shadow-xl dark:shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: payload[0]?.payload?.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-indigo-600 dark:text-indigo-400 font-semibold", children: [
      payload[0]?.value,
      " / 100"
    ] })
  ] });
}
function GlassPanel({
  children,
  className = "",
  glow
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm dark:shadow-none ${className}`, style: {
    boxShadow: glow ? `0 0 40px ${glow}` : void 0
  }, children });
}
function SectionHeader({
  icon: Icon,
  label,
  accent = "#6366f1"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 rounded-lg flex items-center justify-center", style: {
      backgroundColor: `${accent}20`
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5", style: {
      color: accent
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500", children: label })
  ] });
}
const ACTION_COLORS = {
  "/mock-interview": {
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.2)"
  },
  "/github-resume": {
    color: "#10b981",
    glow: "rgba(16,185,129,0.2)"
  },
  "/developer-score": {
    color: "#6366f1",
    glow: "rgba(99,102,241,0.2)"
  },
  "/github": {
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.2)"
  },
  "/resume": {
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.2)"
  },
  "/interview": {
    color: "#ec4899",
    glow: "rgba(236,72,153,0.2)"
  }
};
function ActionCard({
  to,
  icon: Icon,
  title,
  desc
}) {
  const router = useRouter();
  const {
    color,
    glow
  } = ACTION_COLORS[to] ?? {
    color: "#6366f1",
    glow: "rgba(99,102,241,0.2)"
  };
  const [hovered, setHovered] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, onClick: () => router.invalidate(), onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 overflow-hidden cursor-pointer h-full shadow-sm dark:shadow-none", style: {
    transition: "all 0.4s cubic-bezier(0.34,1.2,0.64,1)",
    borderColor: hovered ? `${color}30` : void 0,
    transform: hovered ? "translateY(-3px)" : "none",
    boxShadow: hovered ? `0 16px 40px ${glow}` : void 0
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 transition-opacity duration-500", style: {
      background: `radial-gradient(circle at 30% 30%, ${color}10 0%, transparent 60%)`,
      opacity: hovered ? 1 : 0
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px transition-opacity duration-500", style: {
      background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
      opacity: hovered ? 1 : 0
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300", style: {
        backgroundColor: `${color}18`,
        boxShadow: hovered ? `0 0 16px ${color}40` : "none"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 transition-transform duration-300", style: {
        color,
        transform: hovered ? "scale(1.15) rotate(5deg)" : "scale(1)"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-sm", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500 dark:text-slate-600 leading-relaxed", children: desc })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 flex-shrink-0 mt-0.5 transition-all duration-300", style: {
          color: hovered ? color : "#64748b",
          transform: hovered ? "translateX(2px)" : "none"
        } })
      ] })
    ] })
  ] }) });
}
function DataRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/[0.04] last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-slate-500 dark:text-slate-600 font-semibold uppercase tracking-wider", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "text-sm font-bold text-slate-700 dark:text-slate-300", children: value })
  ] });
}
function InsightRow({
  icon: Icon,
  label,
  value,
  color = "#6366f1"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0", style: {
      backgroundColor: `${color}18`
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5", style: {
      color
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-600 font-bold", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-slate-800 dark:text-slate-300 truncate mt-0.5", children: value })
    ] })
  ] });
}
function Dashboard() {
  const fetcher = useServerFn(getDashboard);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetcher()
  });
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);
  const scores = [{
    name: "Profile",
    value: data?.profileCompletion ?? 0
  }, {
    name: "GitHub",
    value: data?.githubScore ?? 0
  }, {
    name: "Resume",
    value: data?.resumeScore ?? 0
  }, {
    name: "Portfolio",
    value: data?.portfolioScore ?? 0
  }, {
    name: "Interview",
    value: data?.interviewReady ?? 0
  }];
  const firstName = data?.profile?.name?.split(" ")[0] ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 min-h-screen text-slate-900 dark:text-foreground", style: {
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(12px)",
    transition: "all 0.6s cubic-bezier(0.34,1.2,0.64,1)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BackgroundOrbs, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest", children: "Live Dashboard" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-slate-900 dark:text-white tracking-tight", children: firstName ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Welcome back,",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent", children: firstName }),
          " ",
          "👋"
        ] }) : "Your Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-slate-600 dark:text-slate-500 text-sm", children: "Here's how your developer career is shaping up today." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] shadow-sm dark:shadow-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { className: "h-4 w-4 text-violet-500 dark:text-violet-400 animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-slate-500 dark:text-slate-400", children: "AI powered" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(GlassPanel, { className: "p-8", glow: "rgba(99,102,241,0.06)", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DevScoreRing, { score: data?.devScore ?? 0, trend: data?.devScoreTrend ?? 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 max-w-xl", children: scores.map((s, i) => {
          const colors = ["#6366f1", "#10b981", "#f59e0b", "#38bdf8", "#8b5cf6"];
          const icons = [Activity, GitBranch, FileText, Rocket, Brain];
          const Icon = icons[i];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200 dark:border-white/[0.05] bg-slate-50 dark:bg-white/[0.02] px-4 py-3 group hover:border-slate-300 dark:hover:border-white/[0.1] transition-all duration-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5", style: {
                color: colors[i]
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600", children: s.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black", style: {
                color: colors[i]
              }, children: s.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 dark:text-slate-700 text-xs", children: "/100" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 rounded-full bg-slate-200 dark:bg-white/[0.05] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all duration-1000", style: {
              width: `${s.value}%`,
              background: colors[i],
              boxShadow: `0 0 6px ${colors[i]}80`
            } }) })
          ] }, s.name);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCard, { label: "Profile", value: data?.profileCompletion ?? 0, loading: isLoading, icon: Activity, color: "#6366f1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(GlassPanel, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Trophy, label: "Interview Stats", accent: "#f59e0b" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500 dark:text-slate-600 uppercase tracking-widest font-bold mb-1", children: "Best Score" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-black text-slate-900 dark:text-white flex items-end gap-1", children: [
              data?.profile?.best_interview_score ?? 0,
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 mb-1" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500 dark:text-slate-600 uppercase tracking-widest font-bold mb-1", children: "Streak" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-black text-slate-900 dark:text-white flex items-end gap-1", children: [
              data?.profile?.interview_streak ?? 0,
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400 mb-1" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-100 dark:border-white/[0.04] pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500 dark:text-slate-600 uppercase tracking-widest font-bold mb-2", children: "Badges" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: (data?.profile?.badges || []).length > 0 ? (data?.profile?.badges || []).slice(-3).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight", style: {
            backgroundColor: "rgba(245,158,11,0.1)",
            color: "#f59e0b",
            border: "1px solid rgba(245,158,11,0.2)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { className: "h-3 w-3" }),
            b
          ] }, b)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500 dark:text-slate-700", children: "Take a mock interview to earn badges" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(GlassPanel, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: FileBadge, label: "GitHub Resume", accent: "#10b981" }),
        data?.githubResume ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-black text-slate-900 dark:text-white leading-tight", children: data.githubResume.developer_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: (data.githubResume.badges || []).slice(0, 3).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase", style: {
            backgroundColor: "rgba(16,185,129,0.1)",
            color: "#10b981",
            border: "1px solid rgba(16,185,129,0.2)"
          }, children: b }, b)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-slate-500 dark:text-slate-600 mt-2", children: [
            "Generated ",
            new Date(data.githubResume.created_at).toLocaleDateString()
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-600 leading-relaxed", children: "No resume yet. Run the AI generator to extract your GitHub experience." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/github-resume", className: "flex items-center gap-1.5 mt-4 text-xs font-bold transition-colors", style: {
          color: "#10b981"
        }, children: [
          (data?.githubResume?.insights || []).length > 0 ? "Insights available" : "No insights yet",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(GlassPanel, { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: MessageSquare, label: "Latest Interview", accent: "#8b5cf6" }),
        data?.mockInterview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-slate-900 dark:text-white", children: data.mockInterview.job_role }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl font-black", style: {
            color: "#8b5cf6"
          }, children: [
            data.mockInterview.overall_score,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 dark:text-slate-600 text-lg font-bold", children: "/100" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.05] overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: {
            width: `${data.mockInterview.overall_score}%`,
            background: "#8b5cf6"
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500 dark:text-slate-600", children: new Date(data.mockInterview.created_at).toLocaleDateString() })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-600 leading-relaxed", children: "No interviews yet. Test your skills with a real-world scenario." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/mock-interview", className: "flex items-center gap-1.5 mt-4 text-xs font-bold transition-colors", style: {
          color: "#8b5cf6"
        }, children: [
          data?.mockInterview ? "Take Another" : "Start Simulator",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(GlassPanel, { className: "p-6 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: ChartColumn, label: "Career Radar", accent: "#6366f1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-72", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(RadarChart, { data: scores, outerRadius: "75%", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PolarGrid, { className: "stroke-slate-200 dark:stroke-white/5", gridType: "polygon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PolarAngleAxis, { dataKey: "name", tick: {
            fill: "#64748b",
            fontSize: 12,
            fontWeight: 700
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Radar, { dataKey: "value", stroke: "#6366f1", fill: "#6366f1", fillOpacity: 0.15, strokeWidth: 2, dot: {
            fill: "#6366f1",
            r: 4,
            strokeWidth: 0
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(GlassPanel, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { icon: Activity, label: "Activity", accent: "#38bdf8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "space-y-0 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Code reviews", value: data?.codeReviewCount ?? 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Interview sessions", value: data?.interviewCount ?? 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "GitHub", value: data?.githubUsername ?? data?.profile?.github_username ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: "Experience", value: data?.profile?.experience_level ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-100 dark:border-white/[0.04] pt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-violet-500 dark:text-violet-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-600", children: "AI Insights" })
          ] }),
          data?.githubResume ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 divide-y divide-slate-100 dark:divide-white/[0.04]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InsightRow, { icon: Star, label: "Top Skill", value: data.githubResume.resume_data?.skills?.[0] ?? "N/A", color: "#f59e0b" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InsightRow, { icon: Briefcase, label: "Best Project", value: (data.githubResume.resume_data?.projects || []).length > 0 ? `${(data.githubResume.resume_data?.projects || []).length} projects highlighted` : "N/A", color: "#10b981" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InsightRow, { icon: TrendingUp, label: "Learn Next", value: data.githubResume?.insights?.missingSkills?.[0] ?? "N/A", color: "#6366f1" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200 dark:border-white/[0.05] bg-slate-50 dark:bg-white/[0.02] p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-600", children: "Generate a GitHub Resume to unlock deep AI insights" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/github-resume", className: "text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mt-1 inline-block", children: "Get started →" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-slate-900 dark:text-white", children: "Quick Actions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-white/[0.06] to-transparent" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500 dark:text-slate-600 font-semibold uppercase tracking-widest", children: "6 tools" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { to: "/mock-interview", icon: MessageSquare, title: "Mock Interview", desc: "Full AI interview simulator with scoring." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { to: "/github-resume", icon: FileBadge, title: "GitHub Resume", desc: "AI-generate a resume from your repos." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { to: "/developer-score", icon: Activity, title: "Developer Score", desc: "View your full career readiness analytics." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { to: "/github", icon: Github, title: "Analyze GitHub", desc: "Full AI breakdown of your public work." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { to: "/resume", icon: FileText, title: "Build Resume", desc: "ATS-friendly resumes with live scoring." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { to: "/interview", icon: MessageSquare, title: "Interview Hub", desc: "Practice quick tailored questions." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      ` })
  ] });
}
export {
  Dashboard as component
};
