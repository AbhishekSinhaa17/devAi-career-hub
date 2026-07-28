import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { c as createSsrRpc } from "./router-BcNxq6Cj.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth } from "./api-client-CbTdHRmP.mjs";
import { P as PageLoadingState, a as PageEmptyState } from "./LoadingStates-BgPUCkwf.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import "../_libs/seroval.mjs";
import { e as Activity, aq as Download, F as FileText, Q as Users, x as Cpu, V as ChartColumn, Z as Zap, k as TrendingUp, aL as Calendar } from "../_libs/lucide-react.mjs";
import { g as PieChart, R as ResponsiveContainer, h as Pie, f as Cell, T as Tooltip, L as Legend, B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, e as Bar } from "../_libs/recharts.mjs";
import { o as objectType, n as numberType } from "../_libs/zod.mjs";
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
const getGlobalAnalytics = createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => objectType({
  days: numberType().min(7).max(90).default(30)
}).parse(d ?? {})).handler(createSsrRpc("2022a366447b6cb21e812d34e5718e37c340a5a6ed7e30d0a51b4c50b36f2a54"));
const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#3b82f6"];
function AdminAnalyticsPage() {
  const fetchAnalytics = useServerFn(getGlobalAnalytics);
  const [days, setDays] = reactExports.useState(30);
  const dashboardRef = reactExports.useRef(null);
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => fetchAnalytics({
      data: {
        days
      }
    })
  });
  const exportCSV = () => {
    if (!data) return;
    const headers = ["Feature", "Total Usage", "Last 30 Days", "Prev 30 Days", "Growth %", "Percentage %"];
    const rows = data.features.map((f) => [f.name, f.count, f.last30Days, f.prev30Days, f.growth.toFixed(1), f.percentage.toFixed(1)]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `devai-analytics-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportPDF = () => {
    window.print();
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageLoadingState, { title: "Loading Analytics...", subtitle: "Crunching numbers across the platform." });
  }
  if (error || !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageEmptyState, { title: "Failed to load analytics", subtitle: error?.message || "An unknown error occurred while fetching platform data.", icon: Activity });
  }
  const pieData = data.features.map((f) => ({
    name: f.name,
    value: f.count
  })).filter((f) => f.value > 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 min-h-screen text-slate-900 dark:text-foreground print:text-black", ref: dashboardRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/20 bg-pink-500/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest", children: "Platform Analytics" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-slate-900 dark:text-white tracking-tight", children: "Analytics Overview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
          "Last updated: ",
          new Date(data.lastUpdated).toLocaleString()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 print:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center bg-muted/50 p-1 rounded-xl border border-border/40", children: [7, 30, 90].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDays(d), className: `px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${days === d ? "bg-white dark:bg-[#1a1a2e] text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: [
          d,
          "D"
        ] }, d)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: exportCSV, className: "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-border/40 hover:bg-muted/50 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
          " CSV"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: exportPDF, className: "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
          " PDF Report"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", children: [{
      label: "Total Users",
      value: data.kpis.totalUsers,
      icon: Users,
      color: "text-blue-500"
    }, {
      label: `Active (${days}d)`,
      value: data.kpis.activeUsers7d,
      icon: Activity,
      color: "text-green-500"
    }, {
      label: "Total AI Req",
      value: data.kpis.totalAiRequests,
      icon: Cpu,
      color: "text-indigo-500"
    }, {
      label: "Avg Req/User",
      value: data.kpis.avgAiRequestsPerUser.toFixed(1),
      icon: ChartColumn,
      color: "text-purple-500"
    }, {
      label: "Most Used",
      value: data.kpis.mostUsedFeature,
      icon: Zap,
      color: "text-amber-500"
    }, {
      label: "Fastest Growth",
      value: data.kpis.fastestGrowingFeature,
      icon: TrendingUp,
      color: "text-pink-500"
    }, {
      label: "Avg Health Score",
      value: data.kpis.avgHealthScore?.toString() || "0",
      icon: Activity,
      color: "text-emerald-500"
    }].map((kpi, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 rounded-lg bg-muted/50 ${kpi.color}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(kpi.icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider", children: kpi.label })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-black truncate", children: kpi.value })
    ] }, idx)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 p-6 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold mb-6 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-indigo-500" }),
          " Feature Performance Breakdown"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs text-muted-foreground uppercase bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 rounded-tl-xl", children: "Feature" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Total Usage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: "px-4 py-3", children: [
              "Last ",
              days,
              "d"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "% Share" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 rounded-tr-xl", children: "Growth" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: data.features.map((f, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/20 hover:bg-muted/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 font-semibold", children: f.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4", children: f.count.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4", children: f.last30Days.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-indigo-500", style: {
                width: `${f.percentage}%`
              } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                f.percentage.toFixed(1),
                "%"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4", children: f.growth > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-500 font-bold", children: [
              "+",
              f.growth.toFixed(1),
              "%"
            ] }) : f.growth < 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-500 font-bold", children: [
              f.growth.toFixed(1),
              "%"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "0%" }) })
          ] }, idx)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold mb-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PieChart, { className: "h-5 w-5 text-pink-500" }),
          " Usage Distribution"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-[300px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data: pieData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 90, paddingAngle: 5, dataKey: "value", children: pieData.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            backgroundColor: "rgba(13, 13, 26, 0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#fff"
          }, itemStyle: {
            color: "#fff"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { verticalAlign: "bottom", height: 36, iconType: "circle" })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold mb-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-5 w-5 text-blue-500" }),
        " Daily Activity Trend (",
        days,
        " Days)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[350px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: data.dailyActivity, margin: {
        top: 10,
        right: 10,
        left: -20,
        bottom: 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(150,150,150,0.1)", vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: {
          fontSize: 11,
          fill: "currentColor",
          opacity: 0.5
        }, axisLine: false, tickLine: false, tickFormatter: (val) => {
          const d = new Date(val);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
          fontSize: 11,
          fill: "currentColor",
          opacity: 0.5
        }, axisLine: false, tickLine: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { cursor: {
          fill: "rgba(150,150,150,0.05)"
        }, contentStyle: {
          backgroundColor: "rgba(13, 13, 26, 0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          color: "#fff"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "total", name: "AI Requests", fill: "#6366f1", radius: [4, 4, 0, 0] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold mb-6 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5 text-emerald-500" }),
          " Health Score Distribution"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-[300px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: data.healthDistribution, margin: {
          top: 10,
          right: 10,
          left: -20,
          bottom: 0
        }, layout: "vertical", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(150,150,150,0.1)", horizontal: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", axisLine: false, tickLine: false, tick: {
            fontSize: 11,
            fill: "currentColor",
            opacity: 0.5
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { dataKey: "range", type: "category", axisLine: false, tickLine: false, tick: {
            fontSize: 11,
            fill: "currentColor",
            opacity: 0.5
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { cursor: {
            fill: "rgba(150,150,150,0.05)"
          }, contentStyle: {
            backgroundColor: "rgba(13, 13, 26, 0.9)",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", name: "Users", fill: "#10b981", radius: [0, 4, 4, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold mb-6 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-amber-500" }),
          " Top Performing Developers"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          data.topPerformers?.map((u, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-black grid place-items-center text-xs", children: [
                "#",
                idx + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-sm", children: [
                  "User ",
                  u.userId.split("-")[0]
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
                  "ID: ",
                  u.userId
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-xl text-emerald-500", children: u.score })
          ] }, u.userId)),
          (!data.topPerformers || data.topPerformers.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No health scores generated yet." })
        ] })
      ] })
    ] })
  ] });
}
export {
  AdminAnalyticsPage as component
};
