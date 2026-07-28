import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { a as getDeveloperScoresHistory, b as generateDeveloperScore } from "./ai.functions-CrNXurDM.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { P as PageLoadingState, a as PageEmptyState } from "./LoadingStates-BgPUCkwf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as toPng } from "../_libs/html-to-image.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import { f as format } from "../_libs/date-fns.mjs";
import { e as Activity, ad as Share, t as RefreshCw, ae as Award, k as TrendingUp, ab as TrendingDown, ac as Minus, V as ChartColumn, g as Star, f as CircleCheck, af as Target, Z as Zap, ag as Lightbulb, ah as CircleAlert, ai as FolderOpen, aj as GraduationCap, B as Briefcase } from "../_libs/lucide-react.mjs";
import { R as ResponsiveContainer, a as RadarChart, P as PolarGrid, b as PolarAngleAxis, c as Radar, T as Tooltip, A as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, d as Area } from "../_libs/recharts.mjs";
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
function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  showValue = true,
  className,
  ...props
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - value / max * circumference;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn("relative flex items-center justify-center", className),
      style: { width: size, height: size },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            width: size,
            height: size,
            viewBox: `0 0 ${size} ${size}`,
            className: "transform -rotate-90",
            ...props,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "progress-gradient", x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "hsl(var(--primary))" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "hsl(var(--chart-2))" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "circle",
                {
                  cx: size / 2,
                  cy: size / 2,
                  r: radius,
                  stroke: "hsl(var(--secondary))",
                  strokeWidth,
                  fill: "none",
                  className: "transition-all duration-300 ease-in-out"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "circle",
                {
                  cx: size / 2,
                  cy: size / 2,
                  r: radius,
                  stroke: "url(#progress-gradient)",
                  strokeWidth,
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                  strokeLinecap: "round",
                  fill: "none",
                  className: "transition-all duration-1000 ease-out"
                }
              )
            ]
          }
        ),
        showValue && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold tracking-tighter gradient-text", children: value }) })
      ]
    }
  );
}
const STYLES = `
  @keyframes float-orb {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(22px,-16px) scale(1.04); }
    66%      { transform:translate(-12px,12px) scale(0.97); }
  }
  @keyframes shimmer {
    from { transform:translateX(-100%); }
    to   { transform:translateX(100%); }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes card-enter {
    from { opacity:0; transform:translateY(14px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes tag-pop {
    from { opacity:0; transform:scale(0.75) translateY(4px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes spin-slow {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes pulse-ring {
    0%   { transform:scale(1);   opacity:0.5; }
    100% { transform:scale(1.7); opacity:0; }
  }
  @keyframes score-pop {
    from { opacity:0; transform:scale(0.7); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes bar-fill {
    from { width:0%; }
  }
  @keyframes celebration-slide {
    from { opacity:0; transform:translateY(-12px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes counter {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* Glass panel — dark default, light override */
  .glass-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(14px);
  }
  :root:not(.dark) .glass-panel {
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(0,0,0,0.08);
    backdrop-filter: blur(14px);
  }

  /* Semantic text */
  .t-heading { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .t-heading { color: rgba(0,0,0,0.88); }
  .t-sub { color: rgba(255,255,255,0.42); }
  :root:not(.dark) .t-sub { color: rgba(0,0,0,0.42); }
  .t-body { color: rgba(255,255,255,0.62); }
  :root:not(.dark) .t-body { color: rgba(0,0,0,0.62); }

  /* Dividers */
  .divider-line { background: rgba(255,255,255,0.06); }
  :root:not(.dark) .divider-line { background: rgba(0,0,0,0.07); }

  /* Row hover */
  .item-row:hover { background: rgba(255,255,255,0.03); }
  :root:not(.dark) .item-row:hover { background: rgba(0,0,0,0.02); }

  /* Radar / Chart theming */
  .recharts-polar-grid-concentric-polygon,
  .recharts-polar-grid-angle line { stroke: rgba(255,255,255,0.08) !important; }
  :root:not(.dark) .recharts-polar-grid-concentric-polygon,
  :root:not(.dark) .recharts-polar-grid-angle line { stroke: rgba(0,0,0,0.09) !important; }

  .btn-primary-glow {
    box-shadow: 0 0 22px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.2);
    transition: box-shadow 0.3s, transform 0.15s;
  }
  .btn-primary-glow:hover:not(:disabled) {
    box-shadow: 0 0 36px rgba(99,102,241,0.55), 0 6px 20px rgba(0,0,0,0.3);
  }
  .btn-primary-glow:active:not(:disabled) { transform:scale(0.97); }

  .btn-ghost {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  :root:not(.dark) .btn-ghost {
    background: rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.1);
  }
  .btn-ghost:hover:not(:disabled) {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.18);
  }
  :root:not(.dark) .btn-ghost:hover:not(:disabled) {
    background: rgba(0,0,0,0.07);
    border-color: rgba(0,0,0,0.18);
  }
  .btn-ghost:active:not(:disabled) { transform:scale(0.97); }
  .btn-ghost:disabled { opacity:0.4; cursor:not-allowed; }
`;
function getLevel(score) {
  if (score <= 40) return {
    label: "Beginner",
    color: "#60a5fa",
    glow: "#3b82f640"
  };
  if (score <= 60) return {
    label: "Developing",
    color: "#fbbf24",
    glow: "#f59e0b40"
  };
  if (score <= 80) return {
    label: "Job Ready",
    color: "#34d399",
    glow: "#10b98140"
  };
  return {
    label: "Industry Ready",
    color: "#a78bfa",
    glow: "#8b5cf640"
  };
}
function AccentLine({
  color
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px pointer-events-none", style: {
    background: `linear-gradient(90deg,transparent,${color}70,transparent)`
  } });
}
function BackgroundOrbs() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none fixed inset-0 overflow-hidden -z-10", "aria-hidden": true, children: [{
    c: "#6366f1",
    s: 520,
    x: "4%",
    y: "4%",
    d: "0s",
    t: "18s"
  }, {
    c: "#8b5cf6",
    s: 360,
    x: "74%",
    y: "8%",
    d: "7s",
    t: "22s"
  }, {
    c: "#10b981",
    s: 280,
    x: "82%",
    y: "66%",
    d: "14s",
    t: "20s"
  }, {
    c: "#f59e0b",
    s: 220,
    x: "2%",
    y: "73%",
    d: "3s",
    t: "25s"
  }].map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute rounded-full", style: {
    width: o.s,
    height: o.s,
    left: o.x,
    top: o.y,
    background: `radial-gradient(circle,${o.c},transparent 70%)`,
    opacity: 0.055,
    animation: `float-orb ${o.t} ${o.d} ease-in-out infinite`
  } }, i)) });
}
function SubScoreBar({
  label,
  value,
  color,
  icon: Icon,
  delay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", style: {
    animation: `fade-up 0.4s ${delay}ms ease both`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 rounded-md flex items-center justify-center", style: {
          background: `${color}18`,
          border: `1px solid ${color}30`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3", style: {
          color
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold t-sub uppercase tracking-widest", children: label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black", style: {
        color
      }, children: value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full overflow-hidden", style: {
      background: "rgba(255,255,255,0.06)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: {
      width: `${value}%`,
      background: `linear-gradient(90deg,${color}80,${color})`,
      animation: `bar-fill 1s ${delay + 200}ms ease both`,
      boxShadow: `0 0 6px ${color}50`
    } }) })
  ] });
}
function InsightBlock({
  icon: Icon,
  label,
  text,
  color,
  bg,
  border,
  delay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl p-4 space-y-2 overflow-hidden", style: {
    background: bg,
    border: `1px solid ${border}`,
    animation: `card-enter 0.4s ${delay}ms ease both`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-4 -top-4 h-14 w-14 rounded-full opacity-20 pointer-events-none", style: {
      background: `radial-gradient(circle,${color},transparent 70%)`
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0", style: {
        background: `${color}18`,
        border: `1px solid ${border}`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5", style: {
        color
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest", style: {
        color
      }, children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs t-body leading-relaxed", children: text })
  ] });
}
function Tag({
  label,
  color,
  bg,
  border,
  delay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-default transition-all duration-200", style: {
    color,
    background: bg,
    border: `1px solid ${border}`,
    animation: `tag-pop 0.35s ${delay}ms cubic-bezier(0.34,1.2,0.64,1) both`
  }, onMouseEnter: (e) => {
    e.currentTarget.style.boxShadow = `0 0 10px ${border}`;
    e.currentTarget.style.transform = "scale(1.05)";
  }, onMouseLeave: (e) => {
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.transform = "scale(1)";
  }, children: label });
}
function ListItem({
  text,
  index,
  dot,
  delay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "item-row flex items-start gap-3 p-3 rounded-xl transition-colors duration-200", style: {
    border: "1px solid rgba(255,255,255,0.04)",
    animation: `fade-in 0.3s ${delay}ms ease both`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 h-5 w-5 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black", style: {
      background: `${dot}18`,
      border: `1px solid ${dot}30`,
      color: dot
    }, children: index + 1 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs t-body leading-relaxed", children: text })
  ] });
}
function DeveloperScore() {
  const [mounted, setMounted] = reactExports.useState(false);
  const scoreCardRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);
  const queryClient = useQueryClient();
  const getHistoryFn = useServerFn(getDeveloperScoresHistory);
  const genDevScoreFn = useServerFn(generateDeveloperScore);
  const {
    data: history,
    isLoading
  } = useQuery({
    queryKey: ["developer-scores"],
    queryFn: () => getHistoryFn()
  });
  const mutation = useMutation({
    mutationFn: () => genDevScoreFn({
      data: void 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["developer-scores"]
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"]
      });
      toast.success("Health score updated!");
    },
    onError: (e) => toast.error(e.message)
  });
  const currentScore = history?.[0];
  const prevScore = history?.[1];
  const hasScore = !!currentScore;
  const isGenerating = mutation.isPending;
  reactExports.useEffect(() => {
    if (!isLoading && !hasScore && !isGenerating) mutation.mutate();
  }, [isLoading, hasScore, isGenerating]);
  const trendDiff = prevScore ? (currentScore?.overall_score ?? 0) - prevScore.overall_score : 0;
  const level = hasScore ? getLevel(currentScore.overall_score) : null;
  const radarData = hasScore ? [{
    name: "Profile",
    value: currentScore.profile_score
  }, {
    name: "GitHub",
    value: currentScore.github_score
  }, {
    name: "Resume",
    value: currentScore.resume_score
  }, {
    name: "Job Match",
    value: currentScore.job_match_score
  }, {
    name: "Interview",
    value: currentScore.interview_score
  }] : [];
  const trendData = [...history ?? []].reverse().map((s) => ({
    date: format(new Date(s.created_at), "MMM d"),
    score: s.overall_score
  }));
  const aiInsights = currentScore?.ai_insights;
  const handleShare = async () => {
    if (!scoreCardRef.current) return;
    try {
      const dataUrl = await toPng(scoreCardRef.current, {
        cacheBust: true,
        skipFonts: true,
        filter: (node) => {
          if (node.tagName === "LINK" && node.rel === "stylesheet") {
            const href = node.href || "";
            if (href.startsWith("http") && !href.startsWith(window.location.origin)) {
              return false;
            }
          }
          return true;
        }
      });
      const link = document.createElement("a");
      link.download = "my-devai-score.png";
      link.href = dataUrl;
      link.click();
      toast.success("Score card downloaded!");
    } catch (err) {
      toast.error("Failed to generate image.");
      console.error(err);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: STYLES }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BackgroundOrbs, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 pb-16", style: {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "none" : "translateY(14px)",
      transition: "all 0.55s cubic-bezier(0.34,1.1,0.64,1)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          animation: "fade-up 0.5s 0.05s ease both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit mb-3", style: {
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3 w-3 text-indigo-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-indigo-400", children: "Career Analytics" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl sm:text-5xl font-black tracking-tight leading-none t-heading", children: [
            "Developer",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-clip-text text-transparent", style: {
              backgroundImage: "linear-gradient(135deg,#818cf8 0%,#a78bfa 45%,#34d399 100%)"
            }, children: "Health Score" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm t-sub mt-2 max-w-md leading-relaxed", children: "A real-time, AI-powered snapshot of your career readiness across every dimension." })
        ] }),
        hasScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", style: {
          animation: "fade-in 0.5s 0.3s ease both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleShare, className: "btn-ghost flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-sm t-body transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "h-3.5 w-3.5" }),
            "Share"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => mutation.mutate(), disabled: isGenerating, className: "btn-ghost flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-sm t-body disabled:opacity-40 disabled:cursor-not-allowed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}` }),
            "Recalculate"
          ] })
        ] })
      ] }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(PageLoadingState, { title: "Analyzing your profile…", subtitle: "Crunching GitHub, Resume, Interviews & Job Matches" }),
      !isLoading && !hasScore && !isGenerating && /* @__PURE__ */ jsxRuntimeExports.jsx(PageEmptyState, { title: "No score yet", subtitle: "Generate your first Developer Health Score to unlock career insights.", onAction: () => mutation.mutate(), actionLabel: "Generate Score" }),
      !isLoading && !hasScore && isGenerating && /* @__PURE__ */ jsxRuntimeExports.jsx(PageLoadingState, { title: "Analyzing your profile…", subtitle: "Crunching GitHub, Resume, Interviews & Job Matches" }),
      hasScore && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        trendDiff >= 10 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl p-5 overflow-hidden flex items-center gap-4", style: {
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.25)",
          animation: "celebration-slide 0.5s cubic-bezier(0.34,1.1,0.64,1) both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#10b981" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15 pointer-events-none", style: {
            background: "radial-gradient(circle,#10b981,transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0", style: {
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-6 w-6 text-emerald-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black text-emerald-400", children: "Incredible Progress!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs t-body mt-0.5", children: [
              "Your score improved by",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-emerald-400", children: [
                "+",
                trendDiff,
                " points"
              ] }),
              ". You earned the ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-emerald-400", children: "Growth Mindset" }),
              " ",
              "badge!"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 lg:grid-cols-3", style: {
          animation: "fade-up 0.5s 0.1s ease both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 flex flex-col items-center justify-center text-center overflow-hidden", style: {
            animation: "card-enter 0.5s 0.15s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: level.color }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none opacity-10", style: {
              background: `radial-gradient(ellipse at 50% 0%,${level.color},transparent 70%)`
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", style: {
              background: `${level.color}15`,
              border: `1px solid ${level.color}35`,
              color: level.color,
              boxShadow: `0 0 12px ${level.glow}`
            }, children: level.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black uppercase tracking-widest t-sub mb-5", children: "DevAI Score" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5", style: {
              animation: "score-pop 0.6s 0.3s cubic-bezier(0.34,1.2,0.64,1) both"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { value: currentScore.overall_score, size: 160, strokeWidth: 12 }) }),
            prevScore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300", style: {
              background: trendDiff > 0 ? "rgba(16,185,129,0.1)" : trendDiff < 0 ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
              border: trendDiff > 0 ? "1px solid rgba(16,185,129,0.25)" : trendDiff < 0 ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.1)",
              color: trendDiff > 0 ? "#34d399" : trendDiff < 0 ? "#f87171" : "rgba(255,255,255,0.35)"
            }, children: [
              trendDiff > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5" }) : trendDiff < 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3.5 w-3.5" }),
              trendDiff > 0 ? "+" : "",
              trendDiff,
              " pts from last scan"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 space-y-5 overflow-hidden", style: {
            animation: "card-enter 0.5s 0.2s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#6366f1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-xl flex items-center justify-center", style: {
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-3.5 w-3.5 text-indigo-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black t-heading", children: "Competency Breakdown" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SubScoreBar, { label: "Profile", value: currentScore.profile_score, color: "#6366f1", icon: Star, delay: 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SubScoreBar, { label: "GitHub", value: currentScore.github_score, color: "#8b5cf6", icon: Activity, delay: 60 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SubScoreBar, { label: "Resume", value: currentScore.resume_score, color: "#10b981", icon: CircleCheck, delay: 120 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SubScoreBar, { label: "Job Match", value: currentScore.job_match_score, color: "#f59e0b", icon: Target, delay: 180 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SubScoreBar, { label: "Interview", value: currentScore.interview_score, color: "#f472b6", icon: Zap, delay: 240 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 flex flex-col overflow-hidden", style: {
            animation: "card-enter 0.5s 0.25s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#8b5cf6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-xl flex items-center justify-center", style: {
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3.5 w-3.5 text-violet-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black t-heading", children: "Competency Map" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-[210px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(RadarChart, { data: radarData, outerRadius: "70%", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PolarGrid, { stroke: "rgba(255,255,255,0.08)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PolarAngleAxis, { dataKey: "name", tick: {
                fill: "rgba(255,255,255,0.4)",
                fontSize: 11,
                fontWeight: 700
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radar, { dataKey: "value", stroke: "#8b5cf6", fill: "#8b5cf6", fillOpacity: 0.2, strokeWidth: 2 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
                background: "rgba(15,15,20,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700
              } })
            ] }) }) })
          ] })
        ] }),
        aiInsights && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 overflow-hidden", style: {
          animation: "card-enter 0.5s 0.3s ease both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#fbbf24" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-16 -bottom-16 h-48 w-48 rounded-full opacity-10 pointer-events-none", style: {
            background: "radial-gradient(circle,#fbbf24,transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center", style: {
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4 text-amber-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black t-heading", children: "AI Career Insights" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] t-sub mt-0.5", children: "Personalized analysis of your profile" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl p-4 mb-4 overflow-hidden", style: {
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black uppercase tracking-widest t-sub mb-2", children: "Why this score?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs t-body leading-relaxed", children: aiInsights.why })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InsightBlock, { icon: CircleCheck, label: "Biggest Strength", text: aiInsights.biggestStrength, color: "#34d399", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.2)", delay: 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InsightBlock, { icon: CircleAlert, label: "Biggest Weakness", text: aiInsights.biggestWeakness, color: "#f87171", bg: "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.2)", delay: 60 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InsightBlock, { icon: TrendingUp, label: "Fastest Improvement", text: aiInsights.fastestImprovement, color: "#818cf8", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.2)", delay: 120 })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 overflow-hidden", style: {
            borderTop: "2px solid #10b981",
            animation: "card-enter 0.5s 0.35s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#10b981" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 pointer-events-none", style: {
              background: "radial-gradient(circle,#10b981,transparent 70%)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-xl flex items-center justify-center", style: {
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black t-heading", children: "Core Strengths" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full", style: {
                background: "rgba(16,185,129,0.1)",
                color: "#34d399",
                border: "1px solid rgba(16,185,129,0.2)"
              }, children: currentScore.strengths?.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: currentScore.strengths?.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { label: s, color: "#34d399", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.22)", delay: i * 35 }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 overflow-hidden", style: {
            borderTop: "2px solid #ef4444",
            animation: "card-enter 0.5s 0.42s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#ef4444" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 pointer-events-none", style: {
              background: "radial-gradient(circle,#ef4444,transparent 70%)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-xl flex items-center justify-center", style: {
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 text-red-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black t-heading", children: "Improvement Areas" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full", style: {
                background: "rgba(239,68,68,0.1)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.2)"
              }, children: currentScore.weaknesses?.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: currentScore.weaknesses?.map((w, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { label: w, color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)", delay: i * 35 }, i)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 overflow-hidden", style: {
          animation: "card-enter 0.5s 0.48s ease both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#6366f1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-12 -bottom-12 h-36 w-36 rounded-full opacity-10 pointer-events-none", style: {
            background: "radial-gradient(circle,#6366f1,transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center", style: {
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 text-indigo-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black t-heading", children: "Strategic Recommendations" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] t-sub mt-0.5", children: "Prioritized actions to level up" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2.5 sm:grid-cols-2", children: currentScore.recommendations?.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(ListItem, { text: r, index: i, dot: "#6366f1", delay: i * 45 }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-5 overflow-hidden", style: {
            animation: "card-enter 0.5s 0.52s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#8b5cf6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-xl flex items-center justify-center", style: {
                background: "rgba(139,92,246,0.15)",
                border: "1px solid rgba(139,92,246,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "h-3.5 w-3.5 text-violet-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black t-heading", children: "Suggested Projects" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: currentScore.suggested_projects?.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "item-row rounded-xl p-3 text-xs t-body leading-relaxed transition-colors duration-200", style: {
              border: "1px solid rgba(139,92,246,0.12)",
              background: "rgba(139,92,246,0.05)",
              animation: `fade-in 0.3s ${i * 50}ms ease both`
            }, children: p }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-5 overflow-hidden", style: {
            animation: "card-enter 0.5s 0.58s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#f59e0b" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-xl flex items-center justify-center", style: {
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "h-3.5 w-3.5 text-amber-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black t-heading", children: "Recommended Certs" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: currentScore.certifications?.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "item-row rounded-xl p-3 text-xs t-body leading-relaxed transition-colors duration-200", style: {
              border: "1px solid rgba(245,158,11,0.12)",
              background: "rgba(245,158,11,0.05)",
              animation: `fade-in 0.3s ${i * 50}ms ease both`
            }, children: c }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-5 overflow-hidden", style: {
            animation: "card-enter 0.5s 0.64s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#10b981" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-xl flex items-center justify-center", style: {
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-3.5 w-3.5 text-emerald-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black t-heading", children: "Target Job Roles" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: currentScore.job_roles?.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 cursor-default", style: {
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.18)",
              color: "#34d399",
              animation: `tag-pop 0.4s ${i * 55}ms cubic-bezier(0.34,1.2,0.64,1) both`
            }, onMouseEnter: (e) => {
              e.currentTarget.style.background = "rgba(16,185,129,0.14)";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(16,185,129,0.15)";
            }, onMouseLeave: (e) => {
              e.currentTarget.style.background = "rgba(16,185,129,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full flex-shrink-0", style: {
                background: "#34d399",
                boxShadow: "0 0 5px #34d399"
              } }),
              r
            ] }, i)) })
          ] })
        ] }),
        trendData.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 overflow-hidden", style: {
          animation: "card-enter 0.5s 0.7s ease both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#6366f1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-16 -bottom-16 h-48 w-48 rounded-full opacity-10 pointer-events-none", style: {
            background: "radial-gradient(circle,#6366f1,transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center", style: {
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-indigo-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black t-heading", children: "Score Progress Over Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] t-sub mt-0.5", children: [
                trendData.length,
                " data points"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: trendData, margin: {
            top: 10,
            right: 10,
            left: -20,
            bottom: 0
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "scoreGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "5%", stopColor: "#6366f1", stopOpacity: 0.35 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "95%", stopColor: "#6366f1", stopOpacity: 0 })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)", vertical: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", stroke: "rgba(255,255,255,0.25)", fontSize: 11, tickLine: false, axisLine: false, fontWeight: 700 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [0, 100], stroke: "rgba(255,255,255,0.25)", fontSize: 11, tickLine: false, axisLine: false, fontWeight: 700 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
              background: "rgba(10,10,18,0.95)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 800,
              color: "#818cf8"
            }, cursor: {
              stroke: "rgba(99,102,241,0.3)",
              strokeWidth: 1
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "score", stroke: "#6366f1", strokeWidth: 3, fillOpacity: 1, fill: "url(#scoreGrad)", dot: {
              fill: "#6366f1",
              strokeWidth: 0,
              r: 4
            }, activeDot: {
              fill: "#818cf8",
              r: 6
            } })
          ] }) }) })
        ] })
      ] })
    ] }),
    hasScore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      position: "absolute",
      left: "-9999px",
      top: "-9999px",
      pointerEvents: "none"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: scoreCardRef, style: {
      width: 800,
      background: "#0a0a0a",
      color: "white",
      padding: "40px",
      display: "flex",
      flexDirection: "column",
      gap: "40px",
      fontFamily: "sans-serif",
      overflow: "hidden",
      position: "relative"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        position: "absolute",
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
        borderRadius: "50%",
        zIndex: 0
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        position: "relative",
        zIndex: 10
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          fontSize: "14px",
          fontWeight: "bold",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "#818cf8",
          marginBottom: "8px"
        }, children: "DevAI Developer Score" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          fontSize: "72px",
          fontWeight: 900,
          lineHeight: 1,
          background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 45%, #34d399 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }, children: currentScore.overall_score })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
        position: "relative",
        zIndex: 10,
        display: "flex",
        gap: "20px"
      }, children: [{
        label: "GitHub",
        val: currentScore.github_score,
        c: "#8b5cf6"
      }, {
        label: "Resume",
        val: currentScore.resume_score,
        c: "#10b981"
      }, {
        label: "Interview",
        val: currentScore.interview_score,
        c: "#f472b6"
      }, {
        label: "Job Match",
        val: currentScore.job_match_score,
        c: "#f59e0b"
      }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        flex: 1,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "16px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          fontSize: "12px",
          color: "rgba(255,255,255,0.6)",
          fontWeight: "bold",
          textTransform: "uppercase",
          marginBottom: "8px"
        }, children: s.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          fontSize: "28px",
          fontWeight: 900,
          color: s.c
        }, children: s.val })
      ] }, s.label)) }),
      aiInsights && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        position: "relative",
        zIndex: 10,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "24px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          fontSize: "14px",
          fontWeight: "bold",
          color: "#fbbf24",
          marginBottom: "16px",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }, children: "AI Evaluation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              fontSize: "11px",
              fontWeight: "bold",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              marginBottom: "4px"
            }, children: "Why this score?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
              fontSize: "14px",
              lineHeight: 1.5,
              margin: 0,
              color: "rgba(255,255,255,0.9)"
            }, children: aiInsights.why })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              fontSize: "11px",
              fontWeight: "bold",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              marginBottom: "4px"
            }, children: "Fastest Way to Improve" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
              fontSize: "14px",
              lineHeight: 1.5,
              margin: 0,
              color: "rgba(255,255,255,0.9)"
            }, children: aiInsights.fastestImprovement })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              fontSize: "11px",
              fontWeight: "bold",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              marginBottom: "4px"
            }, children: "Biggest Strength" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
              fontSize: "14px",
              lineHeight: 1.5,
              margin: 0,
              color: "rgba(255,255,255,0.9)"
            }, children: aiInsights.biggestStrength })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              fontSize: "11px",
              fontWeight: "bold",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              marginBottom: "4px"
            }, children: "Biggest Weakness" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
              fontSize: "14px",
              lineHeight: 1.5,
              margin: 0,
              color: "rgba(255,255,255,0.9)"
            }, children: aiInsights.biggestWeakness })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        position: "relative",
        zIndex: 10,
        marginTop: "auto",
        paddingTop: "24px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        fontWeight: "bold",
        color: "rgba(255,255,255,0.4)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { style: {
          width: 16,
          height: 16,
          color: "#818cf8"
        } }),
        "devai.app"
      ] })
    ] }) })
  ] });
}
export {
  DeveloperScore as component
};
