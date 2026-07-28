import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { s as setUserAdmin, i as isAdmin, g as getAdminOverview, l as listAdminUsers, a as listAdminAiRequests } from "./admin.functions-DCmYzDHL.mjs";
import { B as Button } from "./button-DA2gxxPy.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import { O as ShieldAlert, Q as Users, G as Github, F as FileText, b as CodeXml, M as MessageSquare, c as Map, V as ChartColumn, e as Activity } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
function AdminPage() {
  const checkAdmin = useServerFn(isAdmin);
  const overviewFn = useServerFn(getAdminOverview);
  const usersFn = useServerFn(listAdminUsers);
  const aiFn = useServerFn(listAdminAiRequests);
  const toggleAdmin = useServerFn(setUserAdmin);
  const qc = useQueryClient();
  const access = useQuery({
    queryKey: ["admin-access"],
    queryFn: () => checkAdmin()
  });
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn(),
    enabled: access.data?.isAdmin === true
  });
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => usersFn(),
    enabled: access.data?.isAdmin === true
  });
  const ai = useQuery({
    queryKey: ["admin-ai"],
    queryFn: () => aiFn(),
    enabled: access.data?.isAdmin === true
  });
  const mut = useMutation({
    mutationFn: (vars) => toggleAdmin({
      data: vars
    }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({
        queryKey: ["admin-users"]
      });
      qc.invalidateQueries({
        queryKey: ["admin-overview"]
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  if (access.isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Checking access…" });
  }
  if (!access.data?.isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mx-auto mb-3 h-8 w-8 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Admins only" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "You don't have permission to view this page." })
    ] });
  }
  const t = overview.data?.totals;
  const w = overview.data?.last7Days;
  const stats = [{
    label: "Users",
    value: t?.users ?? 0,
    icon: Users
  }, {
    label: "GitHub Analyses",
    value: t?.githubAnalyses ?? 0,
    sub: `${w?.githubAnalyses ?? 0} / 7d`,
    icon: Github
  }, {
    label: "Resumes",
    value: t?.resumes ?? 0,
    sub: `${w?.resumes ?? 0} / 7d`,
    icon: FileText
  }, {
    label: "Code Reviews",
    value: t?.codeReviews ?? 0,
    sub: `${w?.codeReviews ?? 0} / 7d`,
    icon: CodeXml
  }, {
    label: "Interviews",
    value: t?.interviews ?? 0,
    sub: `${w?.interviews ?? 0} / 7d`,
    icon: MessageSquare
  }, {
    label: "Roadmaps",
    value: t?.roadmaps ?? 0,
    sub: `${w?.roadmaps ?? 0} / 7d`,
    icon: Map
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-semibold tracking-tight", children: "Admin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Monitor platform usage, users, and AI activity." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/admin/analytics", className: "inline-flex items-center gap-2 rounded-md border border-border bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-3.5 w-3.5" }),
          " Platform analytics"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/admin/usage", className: "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-3.5 w-3.5" }),
          " API usage"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6", children: stats.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: s.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-4 w-4 text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-2xl font-semibold", children: s.value }),
      s.sub && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.sub })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between border-b border-border px-5 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Users" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Latest 200 signups · grant or revoke admin" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          users.data?.length ?? 0,
          " shown"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-left text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-2", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-2", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-2", children: "Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-2", children: "Roles" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-2", children: "Joined" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-2 text-right", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          (users.data ?? []).map((u) => {
            const isAdm = u.roles.includes("admin");
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-2", children: u.name ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-2 text-muted-foreground", children: u.email ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-2 text-muted-foreground", children: u.experience_level }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: u.roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded px-1.5 py-0.5 text-[10px] ${r === "admin" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`, children: r }, r)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-2 text-muted-foreground", children: new Date(u.created_at).toLocaleDateString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: isAdm ? "outline" : "default", disabled: mut.isPending, onClick: () => mut.mutate({
                userId: u.id,
                makeAdmin: !isAdm
              }), children: isAdm ? "Revoke admin" : "Make admin" }) })
            ] }, u.id);
          }),
          users.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-5 py-6 text-center text-muted-foreground", children: "Loading…" }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between border-b border-border px-5 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: "Recent AI requests" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          ai.data?.length ?? 0,
          " events"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "divide-y divide-border", children: [
        (ai.data ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between px-5 py-2.5 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground", children: r._table.replace("_", " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: r.github_username || r.title || r.role || r.path || r.language || r.id.slice(0, 8) }),
            typeof r.score === "number" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-primary", children: [
              "score ",
              r.score
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: new Date(r.created_at).toLocaleString() })
        ] }, `${r._table}-${r.id}`)),
        ai.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-5 py-6 text-center text-sm text-muted-foreground", children: "Loading…" })
      ] })
    ] })
  ] });
}
export {
  AdminPage as component
};
