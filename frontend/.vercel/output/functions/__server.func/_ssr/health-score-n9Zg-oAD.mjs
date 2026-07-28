import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { c as createSsrRpc } from "./router-BcNxq6Cj.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth } from "./api-client-CbTdHRmP.mjs";
import { P as PageLoadingState, a as PageEmptyState } from "./LoadingStates-BgPUCkwf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import "../_libs/seroval.mjs";
import { e as Activity, G as Github, F as FileText, M as MessageSquare, B as Briefcase, ai as FolderOpen, f as CircleCheck, ah as CircleAlert, ag as Lightbulb, S as Sparkles, t as RefreshCw, Z as Zap, a3 as ChevronUp, a4 as ChevronDown, k as TrendingUp, i as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { f as format } from "../_libs/date-fns.mjs";
import { R as ResponsiveContainer, A as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, d as Area } from "../_libs/recharts.mjs";
import { o as objectType } from "../_libs/zod.mjs";
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
import "../_libs/sentry__node.mjs";
import "../_libs/sentry__core.mjs";
import "../_libs/sentry__node-core.mjs";
import "../_libs/sentry__opentelemetry.mjs";
import "../_libs/@opentelemetry/semantic-conventions+[...].mjs";
import "../_libs/opentelemetry__sdk-trace-base.mjs";
import "../_libs/opentelemetry__core.mjs";
import "../_libs/opentelemetry__resources.mjs";
import "node:async_hooks";
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
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
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
const getHealthScoreHistory = createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => objectType({}).parse(d ?? {})).handler(createSsrRpc("7bf2392bb02ebdc447e0695910b88a0348eb4cf720f927650480f68bade850ba"));
const generateHealthScore = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({}).parse(d ?? {})).handler(createSsrRpc("50a4b35d1bf5a89b05030680c829673b6515c79336e4fb2d0a699e2aa448f775"));
function AnimatedCounter({
  value,
  duration = 1500,
  className = ""
}) {
  const [display, setDisplay] = reactExports.useState(0);
  const startTime = reactExports.useRef(null);
  const frameRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    startTime.current = null;
    const animate = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: display });
}
function ScoreRing({
  score
}) {
  const radius = 88;
  const stroke = 10;
  const normalised = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalised;
  const [offset, setOffset] = reactExports.useState(circumference);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setOffset(circumference - score / 100 * circumference), 200);
    return () => clearTimeout(t);
  }, [score, circumference]);
  const getScoreColor = (s) => {
    if (s >= 80) return {
      stroke: "#10b981",
      glow: "#10b981"
    };
    if (s >= 60) return {
      stroke: "#6366f1",
      glow: "#6366f1"
    };
    if (s >= 40) return {
      stroke: "#f59e0b",
      glow: "#f59e0b"
    };
    return {
      stroke: "#ef4444",
      glow: "#ef4444"
    };
  };
  const colors = getScoreColor(score);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-1000", style: {
      background: colors.glow
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: radius * 2, height: radius * 2, className: "-rotate-90 drop-shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: radius, cy: radius, r: normalised, fill: "none", stroke: "currentColor", strokeWidth: stroke, className: "text-slate-200 dark:text-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: radius, cy: radius, r: normalised, fill: "none", stroke: colors.stroke, strokeWidth: stroke, strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: offset, style: {
        transition: "stroke-dashoffset 1.8s cubic-bezier(0.34,1.56,0.64,1)",
        filter: `drop-shadow(0 0 8px ${colors.glow})`
      } }),
      Array.from({
        length: 20
      }).map((_, i) => {
        const angle = i / 20 * 360;
        const rad = angle * Math.PI / 180;
        const x1 = radius + (normalised - 14) * Math.cos(rad);
        const y1 = radius + (normalised - 14) * Math.sin(rad);
        const x2 = radius + (normalised - 10) * Math.cos(rad);
        const y2 = radius + (normalised - 10) * Math.sin(rad);
        return /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1, y1, x2, y2, stroke: "currentColor", strokeWidth: 1, opacity: 0.15, className: "text-slate-900 dark:text-white" }, i);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: score, className: "text-6xl font-black tracking-tighter text-slate-900 dark:text-white" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mt-1", children: "out of 100" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", style: {
        background: `${colors.glow}22`,
        color: colors.glow,
        border: `1px solid ${colors.glow}44`
      }, children: score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work" })
    ] })
  ] });
}
function MetricCard({
  label,
  score,
  icon: Icon,
  gradient,
  weight,
  delay = 0
}) {
  const [visible, setVisible] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const pct = score / 100 * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-500 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:-translate-y-0.5 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`, style: {
    transitionDelay: `${delay}ms`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-px opacity-60", style: {
      background: `linear-gradient(90deg, transparent, ${gradient.split(" ")[1]?.replace("to-", "") || "#6366f1"}, transparent)`
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2.5 rounded-xl", style: {
        background: `${gradient.includes("blue") ? "#3b82f6" : gradient.includes("amber") ? "#f59e0b" : gradient.includes("violet") ? "#8b5cf6" : gradient.includes("pink") ? "#ec4899" : "#10b981"}18`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4", style: {
        color: gradient.includes("blue") ? "#60a5fa" : gradient.includes("amber") ? "#fbbf24" : gradient.includes("violet") ? "#a78bfa" : gradient.includes("pink") ? "#f472b6" : "#34d399"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider", children: weight })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedCounter, { value: score, duration: 1200, className: "text-3xl font-black text-slate-900 dark:text-white" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4 text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/40 transition-colors" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-1 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all duration-1000 ease-out", style: {
      width: visible ? `${pct}%` : "0%",
      background: gradient.includes("blue") ? "linear-gradient(90deg, #3b82f6, #60a5fa)" : gradient.includes("amber") ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : gradient.includes("violet") ? "linear-gradient(90deg, #8b5cf6, #a78bfa)" : gradient.includes("pink") ? "linear-gradient(90deg, #ec4899, #f472b6)" : "linear-gradient(90deg, #10b981, #34d399)",
      transitionDelay: `${delay + 400}ms`
    } }) })
  ] });
}
function CustomTooltip({
  active,
  payload,
  label
}) {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0d0d1a]/90 backdrop-blur-md shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-black text-slate-900 dark:text-white", children: payload[0].value })
  ] });
}
function InsightItem({
  text,
  color,
  delay = 0
}) {
  const [visible, setVisible] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `flex items-start gap-3 text-sm leading-relaxed transition-all duration-500 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`, style: {
    transitionDelay: `${delay}ms`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0", style: {
      background: color,
      boxShadow: `0 0 6px ${color}`
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-700 dark:text-white/60", children: text })
  ] });
}
function HealthScorePage() {
  const fetcher = useServerFn(getHealthScoreHistory);
  const generator = useServerFn(generateHealthScore);
  const queryClient = useQueryClient();
  const [particles] = reactExports.useState(() => Array.from({
    length: 20
  }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4
  })));
  const {
    data: history,
    isLoading
  } = useQuery({
    queryKey: ["health-score"],
    queryFn: () => fetcher({
      data: {}
    })
  });
  const mut = useMutation({
    mutationFn: () => generator({
      data: {}
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["health-score"]
      });
      toast.success("Health Score updated!");
    },
    onError: (e) => toast.error(e.message)
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageLoadingState, { title: "Loading Health Score...", subtitle: "Fetching your career readiness data." });
  }
  const latest = history?.[0];
  const handleGenerate = () => mut.mutate();
  if (!latest) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageEmptyState, { title: "No Health Score Yet", subtitle: "Generate your first Career Readiness Score based on your DevAI platform usage.", icon: Activity, actionLabel: mut.isPending ? "Calculating..." : "Generate Score", onAction: handleGenerate });
  }
  const chartData = history?.slice().reverse().map((h) => ({
    date: format(new Date(h.created_at), "MMM d"),
    score: h.overall_score
  })) || [];
  const breakdown = [{
    label: "GitHub",
    score: latest.github_score,
    icon: Github,
    gradient: "from-blue-600 to-blue-400",
    color: "#60a5fa",
    weight: "25%"
  }, {
    label: "Resume",
    score: latest.resume_score,
    icon: FileText,
    gradient: "from-amber-600 to-amber-400",
    color: "#fbbf24",
    weight: "20%"
  }, {
    label: "Interview",
    score: latest.interview_score,
    icon: MessageSquare,
    gradient: "from-violet-600 to-violet-400",
    color: "#a78bfa",
    weight: "25%"
  }, {
    label: "Job Match",
    score: latest.job_match_score,
    icon: Briefcase,
    gradient: "from-pink-600 to-pink-400",
    color: "#f472b6",
    weight: "20%"
  }, {
    label: "Portfolio",
    score: latest.portfolio_score,
    icon: FolderOpen,
    gradient: "from-emerald-600 to-emerald-400",
    color: "#34d399",
    weight: "10%"
  }];
  const insightSections = [{
    key: "strengths",
    title: "Strengths",
    icon: CircleCheck,
    color: "#10b981",
    bgColor: "#10b98110",
    borderColor: "#10b98122",
    data: latest.strengths
  }, {
    key: "weaknesses",
    title: "Improve",
    icon: CircleAlert,
    color: "#ef4444",
    bgColor: "#ef444410",
    borderColor: "#ef444422",
    data: latest.weaknesses
  }, {
    key: "recommendations",
    title: "Recommendations",
    icon: Lightbulb,
    color: "#f59e0b",
    bgColor: "#f59e0b10",
    borderColor: "#f59e0b22",
    data: latest.recommendations
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen text-slate-900 dark:text-white overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 -z-10 pointer-events-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-emerald-600/5 blur-[80px]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 -z-10 pointer-events-none overflow-hidden", children: particles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute rounded-full bg-indigo-400/20 animate-pulse", style: {
      left: `${p.x}%`,
      top: `${p.y}%`,
      width: p.size,
      height: p.size,
      animationDuration: `${p.duration}s`,
      animationDelay: `${p.delay}s`
    } }, p.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 pb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/8 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3 text-indigo-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-indigo-400 uppercase tracking-[0.15em]", children: "AI-Powered Career Intelligence" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black tracking-tight text-slate-900 dark:text-white", children: "Developer Health Score" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-500 dark:text-white/35 mt-1.5", children: [
            "Last analysed",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-700 dark:text-white/55", children: format(new Date(latest.created_at), "PPp") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleGenerate, disabled: mut.isPending, className: "group relative inline-flex items-center gap-2.5 px-6 py-3 font-bold text-sm rounded-2xl overflow-hidden transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-px rounded-[14px] bg-gradient-to-b from-white/15 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `relative h-4 w-4 ${mut.isPending ? "animate-spin" : ""}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative", children: mut.isPending ? "Calculating…" : "Refresh Score" }),
          !mut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "relative h-3.5 w-3.5 text-yellow-300" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-5 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/[0.03] backdrop-blur-sm p-8 flex flex-col items-center justify-center min-h-[340px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-6", children: "Overall Readiness" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreRing, { score: latest.overall_score }),
          chartData.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8", children: chartData[chartData.length - 1].score >= chartData[chartData.length - 2].score ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3.5 w-3.5 text-emerald-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-emerald-400", children: [
              "+",
              chartData[chartData.length - 1].score - chartData[chartData.length - 2].score,
              " ",
              "pts since last check"
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5 text-red-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-red-400", children: [
              chartData[chartData.length - 1].score - chartData[chartData.length - 2].score,
              " ",
              "pts since last check"
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-3 relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/[0.03] backdrop-blur-sm p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]", children: "Score History" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-slate-900 dark:text-white mt-0.5", children: "Career Trajectory" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5 text-indigo-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-indigo-400", children: "Live" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[220px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: chartData, margin: {
            top: 5,
            right: 5,
            left: -20,
            bottom: 0
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "scoreGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#6366f1", stopOpacity: 0.4 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#6366f1", stopOpacity: 0 })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-border)", vertical: false, opacity: 0.3 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: {
              fill: "var(--color-muted-foreground)",
              fontSize: 11,
              fontWeight: 600
            }, axisLine: false, tickLine: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [0, 100], tick: {
              fill: "var(--color-muted-foreground)",
              fontSize: 11,
              fontWeight: 600
            }, axisLine: false, tickLine: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "score", stroke: "#6366f1", strokeWidth: 2.5, fill: "url(#scoreGrad)", dot: {
              fill: "#6366f1",
              strokeWidth: 0,
              r: 4
            }, activeDot: {
              fill: "#6366f1",
              stroke: "#a5b4fc",
              strokeWidth: 3,
              r: 6
            } })
          ] }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-4", children: "Score Breakdown" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4", children: breakdown.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(MetricCard, { label: b.label, score: b.score, icon: b.icon, gradient: b.gradient, weight: b.weight, delay: i * 80 }, b.label)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-4", children: "AI Insights" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-4", children: insightSections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/8 backdrop-blur-sm p-6", style: {
          background: section.bgColor,
          borderColor: section.borderColor
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none", style: {
            background: section.color
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-xl", style: {
              background: `${section.color}18`
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(section.icon, { className: "h-4 w-4", style: {
              color: section.color
            } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold uppercase tracking-wider", style: {
              color: section.color
            }, children: section.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3.5", children: section.data?.map((text, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(InsightItem, { text, color: section.color, delay: i * 100 }, i)) })
        ] }, section.key)) })
      ] })
    ] })
  ] });
}
export {
  HealthScorePage as component
};
