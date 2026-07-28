import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { g as getPublicPortfolio } from "./deployment.functions-5Y9ujJlb.mjs";
import { R as Route$3 } from "./router-BcNxq6Cj.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/sonner.mjs";
import "../_libs/posthog-js.mjs";
import { S as Sparkles, G as Github, b as CodeXml, aK as Layers, ak as ExternalLink } from "../_libs/lucide-react.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./server-CNwFEcD6.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "crypto";
import "async_hooks";
import "util";
import "stream";
import "../_libs/isbot.mjs";
import "./api-client-CbTdHRmP.mjs";
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
function PublicPortfolio() {
  const {
    id
  } = Route$3.useParams();
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ["publicPortfolio", id],
    queryFn: () => getPublicPortfolio({
      data: {
        id
      }
    })
  });
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-[#0a0a0a] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-8 w-8 text-primary animate-pulse" }) });
  if (error || !data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-bold text-xl", children: "Portfolio Not Found" });
  const resume = data.resume_data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#0a0a0a] text-slate-200 selection:bg-primary/30 font-sans selection:text-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden border-b border-white/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-5xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-emerald-500" })
          ] }),
          "Available for opportunities"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-5xl md:text-7xl font-black tracking-tight text-white mb-6", children: [
          "Hi, I'm",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400", children: resume.fullName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl md:text-2xl text-slate-400 font-medium max-w-3xl leading-relaxed mb-10", children: resume.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-slate-500 max-w-2xl leading-relaxed", children: resume.summary }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 flex gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `https://github.com/${data.github_username}`, target: "_blank", rel: "noreferrer", className: "px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-5 w-5" }),
            " GitHub Profile"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#projects", className: "px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors", children: "View Work" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-6 py-24 space-y-32", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CodeXml, { className: "h-6 w-6 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-white", children: "Technical Skills" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-3", children: resume.skills?.map((skill, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 hover:border-primary/30 transition-all cursor-default", children: skill }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "projects", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-6 w-6 text-indigo-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-white", children: "Featured Projects" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-6", children: resume.projects?.map((proj, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-6 w-6 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors", children: proj.name || proj.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-400 leading-relaxed mb-6", children: proj.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: proj.technologies?.slice(0, 4).map((tech, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold px-3 py-1 rounded-lg bg-black/40 text-slate-300 border border-white/5", children: tech }, j)) })
        ] }, i)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "border-t border-white/10 py-12 mt-24 text-center text-slate-500 font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Built dynamically with AI" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2", children: "Powered by DevAI Career Hub" })
    ] })
  ] });
}
export {
  PublicPortfolio as component
};
