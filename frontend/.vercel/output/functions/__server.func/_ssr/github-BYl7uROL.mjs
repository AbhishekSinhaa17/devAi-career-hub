import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { c as analyzeGithub, b as generateDeveloperScore } from "./ai.functions-CrNXurDM.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as PageLoadingState, a as PageEmptyState } from "./LoadingStates-BgPUCkwf.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import { G as Github, ak as ExternalLink, al as Search, K as LoaderCircle, S as Sparkles, b as CodeXml, Q as Users, k as TrendingUp, a1 as BookOpen, g as Star, am as GitFork, V as ChartColumn, f as CircleCheck, u as TriangleAlert, ag as Lightbulb, Z as Zap, A as ArrowRight } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, B as BarChart, X as XAxis, Y as YAxis, T as Tooltip, e as Bar, f as Cell } from "../_libs/recharts.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
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
function useCountUp(target, duration = 1e3) {
  const [count, setCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!target) return;
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
function ScoreRing({
  score
}) {
  const animated = useCountUp(score);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - animated / 100 * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#6366f1" : score >= 25 ? "#f59e0b" : "#ef4444";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "120", height: "120", className: "-rotate-90", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "60", cy: "60", r: radius, fill: "none", stroke: "currentColor", strokeWidth: "8", className: "text-border/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "60", cy: "60", r: radius, fill: "none", stroke: color, strokeWidth: "8", strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: offset, style: {
        transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.2,0.64,1)",
        filter: `drop-shadow(0 0 6px ${color}80)`
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-black", style: {
        color
      }, children: animated }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-bold uppercase tracking-widest text-muted-foreground", children: "Score" })
    ] })
  ] });
}
function CustomBarTooltip({
  active,
  payload
}) {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl px-3 py-2 shadow-2xl text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-foreground", children: payload[0]?.payload?.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-primary font-semibold", children: [
      payload[0]?.value,
      " repos"
    ] })
  ] });
}
function Panel({
  children,
  className = "",
  accentColor
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden ${className}`, style: {
    boxShadow: accentColor ? `0 0 0 1px ${accentColor}15, inset 0 1px 0 rgba(255,255,255,0.05)` : "inset 0 1px 0 rgba(255,255,255,0.05)"
  }, children: [
    accentColor && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px", style: {
      background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`
    } }),
    children
  ] });
}
const STAT_META = [{
  icon: BookOpen,
  color: "#6366f1",
  bg: "rgba(99,102,241,0.1)"
}, {
  icon: Star,
  color: "#f59e0b",
  bg: "rgba(245,158,11,0.1)"
}, {
  icon: GitFork,
  color: "#10b981",
  bg: "rgba(16,185,129,0.1)"
}, {
  icon: Users,
  color: "#38bdf8",
  bg: "rgba(56,189,248,0.1)"
}];
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg
}) {
  const animated = useCountUp(value);
  const [hovered, setHovered] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { className: "p-5 group cursor-default transition-all duration-400", accentColor: hovered ? color : void 0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100", style: {
      background: `radial-gradient(circle at 30% 30%, ${color}08 0%, transparent 60%)`
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), className: "relative z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-all duration-300 group-hover:scale-110", style: {
        backgroundColor: bg
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5", style: {
        color
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black tracking-tight", style: {
        color
      }, children: animated.toLocaleString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1", children: label })
    ] })
  ] });
}
const INSIGHT_META = {
  success: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    dotBg: "rgba(16,185,129,0.2)"
  },
  warning: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    dotBg: "rgba(245,158,11,0.2)"
  },
  primary: {
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
    dotBg: "rgba(99,102,241,0.2)"
  }
};
function InsightCard({
  icon: Icon,
  title,
  items,
  tone
}) {
  const meta = INSIGHT_META[tone];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { className: "p-6", accentColor: meta.color, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center", style: {
        backgroundColor: meta.bg,
        border: `1px solid ${meta.border}`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4", style: {
        color: meta.color
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-sm tracking-tight text-foreground", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: items.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 group/item", style: {
      animation: `fadeSlideIn 0.4s ease-out ${i * 80}ms both`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 h-5 w-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover/item:scale-110", style: {
        backgroundColor: meta.dotBg
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-1.5 rounded-full", style: {
        backgroundColor: meta.color
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground/80 leading-relaxed", children: s })
    ] }, i)) })
  ] }) });
}
const LANG_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#38bdf8", "#a855f7"];
function Page() {
  const [username, setUsername] = reactExports.useState("");
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);
  const fn = useServerFn(analyzeGithub);
  const genDevScoreFn = useServerFn(generateDeveloperScore);
  const mutation = useMutation({
    mutationFn: (u) => fn({
      data: {
        username: u
      }
    }),
    onSuccess: () => {
      genDevScoreFn({
        data: void 0
      }).catch(console.error);
    },
    onError: (e) => toast.error(e.message)
  });
  const data = mutation.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", style: {
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(12px)",
    transition: "all 0.6s cubic-bezier(0.34,1.2,0.64,1)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-primary uppercase tracking-widest", children: "AI Analysis" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-black tracking-tight text-foreground", children: [
          "GitHub",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent", children: "Analyzer" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-muted-foreground text-sm leading-relaxed", children: "Enter any GitHub username — DevAI fetches the profile and writes an honest AI-powered review." })
      ] }),
      data && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `https://github.com/${username}`, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card/40 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-all duration-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
        "Open on GitHub"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { className: "p-1.5", accentColor: "#6366f1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "flex items-center gap-2", onSubmit: (e) => {
      e.preventDefault();
      if (username.trim()) mutation.mutate(username.trim());
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-12 pl-11 rounded-xl border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50 font-medium text-sm", placeholder: "e.g. torvalds, gaearon, sindresorhus…", value: username, onChange: (e) => setUsername(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: mutation.isPending || !username.trim(), className: "group relative h-12 px-6 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0", style: {
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        boxShadow: "0 0 20px rgba(99,102,241,0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative flex items-center gap-2", children: mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          "Analyzing…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
          "Analyze"
        ] }) })
      ] })
    ] }) }),
    !data && mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(PageLoadingState, { title: "Analyzing profile…", subtitle: "We're fetching repositories, computing stats, and generating AI insights." }),
    !data && !mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(PageEmptyState, { title: "Enter a GitHub username", subtitle: "DevAI will fetch the profile, analyze repositories, and write an honest AI review.", icon: Github, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 justify-center mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-semibold uppercase tracking-widest mr-1", children: "Try:" }),
      ["torvalds", "gaearon", "sindresorhus", "tj"].map((ex) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-full text-xs font-bold border border-border/60 bg-muted/40 text-muted-foreground cursor-pointer hover:bg-muted", onClick: () => setUsername(ex), children: ex }, ex))
    ] }) }),
    data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", style: {
      animation: "fadeSlideIn 0.5s ease-out both"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { className: "p-6 md:p-8", accentColor: "#6366f1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-30", style: {
          background: "radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-wrap items-center gap-6", children: [
          data.stats.avatar_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: data.stats.avatar_url, alt: `${username}'s avatar`, className: "h-20 w-20 rounded-2xl object-cover", style: {
              border: "2px solid rgba(99,102,241,0.3)",
              boxShadow: "0 0 24px rgba(99,102,241,0.2)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-lg flex items-center justify-center", style: {
              backgroundColor: "#6366f1",
              boxShadow: "0 0 10px rgba(99,102,241,0.5)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-3.5 w-3.5 text-white" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-foreground", children: data.stats.name ?? username }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20 bg-primary/5 text-primary", children: [
                "@",
                username
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl", children: data.summary }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: [{
              icon: CodeXml,
              label: `${data.stats.public_repos} repos`,
              color: "#6366f1"
            }, {
              icon: Users,
              label: `${data.stats.followers} followers`,
              color: "#10b981"
            }, {
              icon: TrendingUp,
              label: "AI Analyzed",
              color: "#8b5cf6"
            }].map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold", style: {
              backgroundColor: `${tag.color}10`,
              border: `1px solid ${tag.color}20`,
              color: tag.color
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(tag.icon, { className: "h-3 w-3" }),
              tag.label
            ] }, tag.label)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreRing, { score: data.score }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: "Dev Score" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 md:grid-cols-4", children: [{
        label: "Public Repos",
        value: data.stats.public_repos
      }, {
        label: "Total Stars",
        value: data.stats.total_stars
      }, {
        label: "Total Forks",
        value: data.stats.total_forks
      }, {
        label: "Followers",
        value: data.stats.followers
      }].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: STAT_META[i].icon, label: s.label, value: s.value, color: STAT_META[i].color, bg: STAT_META[i].bg }, s.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { className: "p-6", accentColor: "#8b5cf6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 text-violet-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-foreground text-sm", children: "Top Languages" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "By repository count" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap justify-end max-w-xs", children: data.stats.languages.slice(0, 4).map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full", style: {
              backgroundColor: LANG_COLORS[i]
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-semibold", children: l.name })
          ] }, l.name)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: data.stats.languages, barSize: 32, style: {
          animation: "fadeSlideIn 0.6s ease-out both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", stroke: "transparent", tick: {
            fill: "var(--muted-foreground)",
            fontSize: 11,
            fontWeight: 600
          }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { stroke: "transparent", tick: {
            fill: "var(--muted-foreground)",
            fontSize: 10
          }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomBarTooltip, {}), cursor: {
            fill: "rgba(99,102,241,0.05)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", radius: [8, 8, 0, 0], children: data.stats.languages.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: LANG_COLORS[i % LANG_COLORS.length] }, i)) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-foreground", children: "AI Insights" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-gradient-to-r from-border/60 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-primary uppercase tracking-widest", children: "AI Generated" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InsightCard, { icon: CircleCheck, title: "Strengths", items: data.strengths, tone: "success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(InsightCard, { icon: TriangleAlert, title: "Weaknesses", items: data.weaknesses, tone: "warning" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(InsightCard, { icon: Lightbulb, title: "Suggestions", items: data.suggestions, tone: "primary" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { className: "p-6 md:p-8", accentColor: "#10b981", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-40", style: {
          background: "radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-6 w-6 text-emerald-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-foreground", children: "Turn this into a resume" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Generate an ATS-optimized resume from this GitHub analysis." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/github-resume", className: "group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white flex-shrink-0 relative overflow-hidden", style: {
            background: "linear-gradient(135deg, #059669, #10b981)",
            boxShadow: "0 0 20px rgba(16,185,129,0.25)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative", children: "Generate GitHub Resume" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 relative transition-transform group-hover:translate-x-0.5" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      ` })
  ] });
}
export {
  Page as component
};
