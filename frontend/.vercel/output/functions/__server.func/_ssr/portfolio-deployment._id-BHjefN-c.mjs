import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { a as getDeploymentsByPortfolio } from "./deployment.functions-5Y9ujJlb.mjs";
import { b as Route, c as createSsrRpc } from "./router-BcNxq6Cj.mjs";
import { c as createServerFn } from "./server-CNwFEcD6.mjs";
import { r as requireAuth } from "./api-client-CbTdHRmP.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as ReactConfetti } from "../_libs/react-confetti.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import "../_libs/seroval.mjs";
import { w as ArrowLeft, d as Globe, aP as Server, f as CircleCheck, N as CircleX, K as LoaderCircle, R as Rocket, a2 as Copy, ak as ExternalLink, aQ as Share2, T as Terminal } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
import "../_libs/tween-functions.mjs";
const triggerVercelDeployment = createServerFn({
  method: "POST"
}).middleware([requireAuth]).validator((d) => objectType({
  portfolioId: stringType()
}).parse(d)).handler(createSsrRpc("10b53256417ca5acf8ee381b702d6ffe14a55a67f79627612d72711d3f1b875a"));
const checkVercelStatus = createServerFn({
  method: "GET"
}).middleware([requireAuth]).validator((d) => objectType({
  id: stringType()
}).parse(d)).handler(createSsrRpc("22b912e9e556868f399e9dc96ec6a559ffa6e5ac7e6ca5c71dc65e879851471e"));
function PortfolioDeploymentPage() {
  const {
    id
  } = Route.useParams();
  const search = Route.useSearch();
  search.username || "dev";
  const [activeDeploymentId, setActiveDeploymentId] = reactExports.useState(null);
  const [showConfetti, setShowConfetti] = reactExports.useState(false);
  const [logs, setLogs] = reactExports.useState([]);
  const startFn = useServerFn(triggerVercelDeployment);
  const statusFn = useServerFn(checkVercelStatus);
  const historyFn = useServerFn(getDeploymentsByPortfolio);
  const queryClient = useQueryClient();
  const {
    data: history,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ["deployments", id],
    queryFn: () => historyFn({
      data: {
        portfolioId: id
      }
    })
  });
  const {
    data: deploymentStatus
  } = useQuery({
    queryKey: ["deployment-status", activeDeploymentId],
    queryFn: () => statusFn({
      data: {
        id: activeDeploymentId
      }
    }),
    enabled: !!activeDeploymentId,
    refetchInterval: (query) => {
      if (query.state.data?.status === "success" || query.state.data?.status === "failed") {
        return false;
      }
      return 2e3;
    }
  });
  const deployMut = useMutation({
    mutationFn: (provider) => {
      if (provider !== "Vercel") throw new Error("Only Vercel deployment is supported in this implementation");
      return startFn({
        data: {
          portfolioId: id
        }
      });
    },
    onSuccess: (data) => {
      setActiveDeploymentId(data.id);
      setLogs(["Initializing deployment...", "Provisioning resources...", "Cloning repository..."]);
      refetchHistory();
    },
    onError: (e) => toast.error("Failed to start deployment: " + e.message)
  });
  reactExports.useEffect(() => {
    if (deploymentStatus?.status === "building" && activeDeploymentId) {
      setLogs(["Project created on Vercel.", "Uploading React+Vite portfolio files...", "Building static optimized assets via Vite...", "Awaiting DNS propagation and health check..."]);
    }
  }, [deploymentStatus?.status, activeDeploymentId]);
  reactExports.useEffect(() => {
    if (deploymentStatus?.status === "success" && activeDeploymentId) {
      setLogs((prev) => [...prev, "Deployment successful! URL is live."]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8e3);
      refetchHistory();
      queryClient.invalidateQueries({
        queryKey: ["deployments"]
      });
    } else if (deploymentStatus?.status === "failed" && activeDeploymentId) {
      setLogs((prev) => [...prev, "Deployment failed! Check build output."]);
      refetchHistory();
      queryClient.invalidateQueries({
        queryKey: ["deployments"]
      });
    }
  }, [deploymentStatus?.status, activeDeploymentId, refetchHistory, queryClient]);
  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };
  const handleDeploy = (provider) => {
    deployMut.mutate(provider);
  };
  const latestDeployment = deploymentStatus || history?.[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto space-y-8 pb-10", children: [
    showConfetti && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReactConfetti, { width: window.innerWidth, height: window.innerHeight, recycle: false, numberOfPieces: 500 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/github-resume", className: "h-10 w-10 rounded-full border bg-card hover:bg-muted flex items-center justify-center transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-foreground tracking-tight", children: "Deploy Portfolio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Publish your generated AI portfolio to the world." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card/40 backdrop-blur-sm p-6 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-foreground", children: "Select Provider" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDeploy("Vercel"), disabled: deployMut.isPending || latestDeployment?.status === "building", className: "w-full relative rounded-xl border p-4 flex items-center justify-between text-left hover:border-foreground/50 transition-colors disabled:opacity-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 bg-black dark:bg-white rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 76 65", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-white dark:text-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M37.5274 0L75.0548 65H0L37.5274 0Z", fill: "currentColor" }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: "Vercel" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Global Edge Network" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5 text-muted-foreground" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDeploy("Netlify"), disabled: deployMut.isPending || latestDeployment?.status === "building", className: "w-full relative rounded-xl border p-4 flex items-center justify-between text-left hover:border-foreground/50 transition-colors disabled:opacity-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 bg-[#00C7B7] rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "h-5 w-5 text-white" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: "Netlify" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "High Performance CDN" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5 text-muted-foreground" })
            ] })
          ] })
        ] }),
        history && history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card/40 backdrop-blur-sm p-6 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold text-foreground uppercase tracking-widest", children: "History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: history.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-muted/30 border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              h.status === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }) : h.status === "failed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-red-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 text-primary animate-spin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-foreground", children: h.provider }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: new Date(h.created_at).toLocaleString() })
              ] })
            ] }),
            h.status === "success" && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: h.deployment_url, target: "_blank", rel: "noreferrer", className: "text-xs text-primary hover:underline", children: "View" })
          ] }, h.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2 space-y-6", children: latestDeployment ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        latestDeployment.status === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-6", style: {
          animation: "fadeSlideIn 0.5s ease-out"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "h-10 w-10 text-emerald-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-foreground", children: "Your Portfolio is Live!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-2", children: [
              "Deployed successfully to ",
              latestDeployment.provider,
              "."
            ] })
          ] }),
          latestDeployment.build_duration && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block bg-muted/50 border rounded-xl px-4 py-2 mt-4 text-sm font-semibold text-foreground/80", children: [
            "Deployment Time:",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
              Math.round(latestDeployment.build_duration / 1e3),
              " seconds"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 bg-background border rounded-lg text-sm font-mono text-muted-foreground break-all max-w-sm flex-1 text-left", children: latestDeployment.deployment_url }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => copyUrl(latestDeployment.deployment_url || ""), className: "p-2 border bg-card hover:bg-muted rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-5 w-5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic max-w-sm mx-auto", children: "Deployment completed. It may take a few moments for DNS propagation to fully resolve the URL." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-4 pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: latestDeployment.deployment_url || void 0, target: "_blank", rel: "noreferrer", className: "px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
              " Open Live Site"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "px-6 py-2.5 bg-card border font-bold rounded-xl flex items-center gap-2 hover:bg-muted transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" }),
              " Share"
            ] })
          ] })
        ] }),
        latestDeployment.status === "building" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card/40 backdrop-blur-sm p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 text-primary animate-spin" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold text-foreground", children: [
                "Deploying to ",
                latestDeployment.provider,
                "..."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Please do not close this page." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-[#0d0d1a] border border-white/10 p-4 font-mono text-xs overflow-hidden relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-white/10 pb-3 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "h-4 w-4 text-white/50" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/50", children: "Build Output" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-white/80 h-[240px] overflow-y-auto", children: [
              logs.map((log, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", style: {
                animation: "fadeSlideIn 0.3s ease-out"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-400 flex-shrink-0", children: "›" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: log })
              ] }, idx)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-400 flex-shrink-0", children: "›" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-3 bg-white/60 animate-pulse mt-0.5" })
              ] })
            ] })
          ] })
        ] }),
        latestDeployment.status === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-8 w-8 text-red-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black text-foreground", children: "Deployment Failed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2", children: "An error occurred while building the project. Please try again." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDeploy(latestDeployment.provider), className: "px-6 py-2.5 bg-background border font-bold rounded-xl inline-flex items-center gap-2 hover:bg-muted transition-colors mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "h-4 w-4" }),
            " Retry Deployment"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full rounded-2xl border border-dashed bg-card/20 flex flex-col items-center justify-center text-center p-12 min-h-[400px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "h-8 w-8 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "Ready to Launch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2 max-w-sm mx-auto", children: "Select a provider from the left to instantly deploy your portfolio site and get a live URL." })
      ] }) })
    ] })
  ] });
}
export {
  PortfolioDeploymentPage as component
};
