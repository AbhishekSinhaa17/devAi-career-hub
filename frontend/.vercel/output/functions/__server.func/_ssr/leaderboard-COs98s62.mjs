import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { P as PageLoadingState } from "./LoadingStates-BgPUCkwf.mjs";
import { f as fetchLeaderboard } from "./router-BcNxq6Cj.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import { r as Trophy, S as Sparkles, k as TrendingUp, g as Star, a9 as Medal, ax as Crown, G as Github, F as FileText, U as User } from "../_libs/lucide-react.mjs";
import "../_libs/@opentelemetry/api.mjs";
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
import "../_libs/tanstack__query-core.mjs";
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
const RANK_CONFIG = {
  1: {
    label: "Gold",
    color: "#f59e0b",
    glow: "#f59e0b",
    bg: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-400/30 dark:border-amber-500/25",
    badge: "bg-amber-400 dark:bg-amber-500",
    icon: Crown,
    podiumH: "h-28",
    avatarRing: "ring-amber-400 dark:ring-amber-500"
  },
  2: {
    label: "Silver",
    color: "#94a3b8",
    glow: "#94a3b8",
    bg: "from-slate-400/10 to-slate-500/5",
    border: "border-slate-400/30 dark:border-slate-500/25",
    badge: "bg-slate-400 dark:bg-slate-500",
    icon: Medal,
    podiumH: "h-20",
    avatarRing: "ring-slate-400 dark:ring-slate-500"
  },
  3: {
    label: "Bronze",
    color: "#b45309",
    glow: "#d97706",
    bg: "from-orange-700/10 to-orange-800/5",
    border: "border-orange-700/30 dark:border-orange-600/25",
    badge: "bg-orange-700 dark:bg-orange-600",
    icon: Star,
    podiumH: "h-14",
    avatarRing: "ring-orange-600 dark:ring-orange-600"
  }
};
function getScoreColor(score) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-indigo-600 dark:text-indigo-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}
function getScoreBarColor(score) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-indigo-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}
function Avatar({
  url,
  name,
  size = "md",
  ringClass = ""
}) {
  const dims = size === "lg" ? "h-20 w-20" : size === "md" ? "h-12 w-12" : "h-9 w-9";
  const iconDims = size === "lg" ? "h-9 w-9" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const initials = name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${dims} rounded-2xl overflow-hidden flex-shrink-0 ring-2 ${ringClass || "ring-slate-200 dark:ring-white/10"}
        bg-slate-100 dark:bg-white/5 flex items-center justify-center shadow-md`, children: url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: name || "avatar", className: "w-full h-full object-cover" }) : initials ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-black text-slate-500 dark:text-slate-400 ${size === "lg" ? "text-xl" : "text-sm"}`, children: initials }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: `${iconDims} text-slate-400 dark:text-slate-600` }) });
}
function ScoreBar({
  value,
  color,
  delay = 0
}) {
  const [width, setWidth] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 300);
    return () => clearTimeout(t);
  }, [value, delay]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded-full transition-all duration-1000 ease-out ${color}`, style: {
    width: `${width}%`
  } }) });
}
function AnimatedNumber({
  value,
  delay = 0
}) {
  const [display, setDisplay] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const start = Date.now() + delay;
    let raf;
    const duration = 1200;
    const tick = () => {
      const now = Date.now();
      if (now < start) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, delay]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: display });
}
function PodiumCard({
  data,
  rank,
  delay = 0
}) {
  const cfg = RANK_CONFIG[rank];
  const RankIcon = cfg.icon;
  const [visible, setVisible] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group relative flex flex-col items-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full ${cfg.badge} flex items-center justify-center shadow-lg z-20 transition-all duration-300 group-hover:-translate-y-1.5`, style: {
      boxShadow: `0 0 16px ${cfg.glow}60`
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RankIcon, { className: "h-4 w-4 text-white" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative w-full rounded-3xl border ${cfg.border} overflow-hidden
          bg-gradient-to-b ${cfg.bg}
          bg-white/60 dark:bg-white/[0.03]
          backdrop-blur-sm shadow-xl
          transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl
          p-6 flex flex-col items-center text-center`, style: {
      boxShadow: `0 8px 40px ${cfg.glow}15, 0 2px 8px rgba(0,0,0,0.06)`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 right-0 h-px", style: {
        background: `linear-gradient(90deg, transparent, ${cfg.color}60, transparent)`
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { url: data.avatar_url, name: data.name, size: "lg", ringClass: `ring-2 ${cfg.avatarRing}` }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-slate-900 dark:text-white text-sm leading-tight mb-0.5 line-clamp-1 w-full", children: data.name || data.github_username || "Anonymous" }),
      data.github_username && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-3 w-3" }),
        "@",
        data.github_username
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-black mb-1", style: {
        color: cfg.color
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { value: data.overall_score || 0, delay: delay + 200 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase font-bold tracking-[0.18em] text-slate-400 dark:text-slate-600 mb-4", children: "Overall Score" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full space-y-2.5 pt-4 border-t border-slate-200/60 dark:border-white/6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-slate-500 dark:text-slate-500 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-3 w-3" }),
            " GitHub"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-700 dark:text-slate-300", children: data.github_score || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreBar, { value: data.github_score || 0, color: getScoreBarColor(data.github_score || 0), delay }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-slate-500 dark:text-slate-500 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }),
            " Resume"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-700 dark:text-slate-300", children: data.resume_score || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreBar, { value: data.resume_score || 0, color: getScoreBarColor(data.resume_score || 0), delay: delay + 100 })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-full ${cfg.podiumH} rounded-b-2xl mt-0 flex items-center justify-center`, style: {
      background: `linear-gradient(to bottom, ${cfg.color}18, ${cfg.color}08)`,
      borderLeft: `1px solid ${cfg.color}20`,
      borderRight: `1px solid ${cfg.color}20`,
      borderBottom: `1px solid ${cfg.color}20`
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-5xl font-black opacity-20", style: {
      color: cfg.color
    }, children: rank }) })
  ] });
}
function LeaderboardRow({
  user,
  rank,
  delay = 0
}) {
  const [visible, setVisible] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const scoreColor = getScoreColor(user.overall_score || 0);
  const barColor = getScoreBarColor(user.overall_score || 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group relative flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-500
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
        bg-white dark:bg-white/[0.025]
        border-slate-200/80 dark:border-white/6
        hover:border-indigo-200 dark:hover:border-indigo-500/20
        hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10
        hover:-translate-y-px
        shadow-sm dark:shadow-none`, style: {
    transitionDelay: `${delay}ms`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/[0.02] dark:group-hover:from-indigo-500/[0.04] transition-all duration-300 pointer-events-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 flex-shrink-0 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-black text-slate-300 dark:text-white/15 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors duration-300", children: rank }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { url: user.avatar_url, name: user.name, size: "sm" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-slate-800 dark:text-slate-100 truncate", children: user.name || user.github_username || "Anonymous Developer" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-600", children: [
        user.github_username && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-3 w-3" }),
          "@",
          user.github_username
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }),
          user.resume_score || 0
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-3 w-3" }),
          user.github_score || 0
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 hidden sm:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreBar, { value: user.overall_score || 0, color: barColor, delay }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 text-right", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-black ${scoreColor}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedNumber, { value: user.overall_score || 0, delay }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-600", children: "pts" })
    ] })
  ] });
}
function LeaderboardPage() {
  const getLeaderboard = useServerFn(fetchLeaderboard);
  const {
    data: leaderboard,
    isLoading
  } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getLeaderboard()
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PageLoadingState, { title: "Loading Leaderboard", subtitle: "Fetching the top developers worldwide..." });
  }
  const top3 = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];
  const podiumOrder = [top3[1] ? {
    data: top3[1],
    rank: 2,
    delay: 100
  } : null, top3[0] ? {
    data: top3[0],
    rank: 1,
    delay: 0
  } : null, top3[2] ? {
    data: top3[2],
    rank: 3,
    delay: 200
  } : null].filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none -z-10 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/4 dark:bg-indigo-500/6 blur-[120px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-32 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-500/3 dark:bg-amber-500/5 blur-[80px]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-10 animate-in fade-in duration-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4 max-w-xl mx-auto pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-300/50 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5 text-amber-600 dark:text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-[0.15em]", children: "Global Rankings" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white", children: [
          "Developer",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent", children: "Leaderboard" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "absolute -top-2 -right-6 h-4 w-4 text-violet-500 dark:text-violet-400 animate-pulse" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 dark:text-slate-500 text-sm leading-relaxed max-w-sm mx-auto", children: "Top developers ranked by overall health score across GitHub, resumes, and interviews." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-emerald-600 dark:text-emerald-400", children: [
            "Live rankings · ",
            leaderboard?.length || 0,
            " developers"
          ] })
        ] })
      ] }),
      top3.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-4 items-end", children: podiumOrder.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PodiumCard, { data: p.data, rank: p.rank, delay: p.delay }, p.rank)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px mt-0 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/8 to-transparent" })
      ] }),
      leaderboard && leaderboard.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl mx-auto grid grid-cols-3 gap-4", children: [{
        label: "Top Score",
        value: leaderboard[0]?.overall_score || 0,
        icon: Trophy,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/8 border-amber-200/60 dark:border-amber-500/15"
      }, {
        label: "Avg Score",
        value: Math.round(leaderboard.reduce((a, b) => a + (b.overall_score || 0), 0) / leaderboard.length),
        icon: TrendingUp,
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-500/8 border-indigo-200/60 dark:border-indigo-500/15"
      }, {
        label: "Developers",
        value: leaderboard.length,
        icon: Star,
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-500/8 border-violet-200/60 dark:border-violet-500/15"
      }].map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${stat.bg} shadow-sm dark:shadow-none`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(stat.icon, { className: `h-5 w-5 flex-shrink-0 ${stat.color}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-black text-slate-800 dark:text-white", children: stat.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600", children: stat.label })
        ] })
      ] }, stat.label)) }),
      rest.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em]", children: "Rankings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px bg-slate-100 dark:bg-white/5" })
        ] }),
        rest.map((user, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(LeaderboardRow, { user, rank: idx + 4, delay: idx * 60 }, `${user.user_id}-${idx}`))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-slate-400 dark:text-slate-700 animate-in fade-in duration-700", children: "Rankings update in real-time as developers improve their scores." })
    ] })
  ] });
}
export {
  LeaderboardPage as component
};
