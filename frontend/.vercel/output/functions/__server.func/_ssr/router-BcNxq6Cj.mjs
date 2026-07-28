import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { S as redirect } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { a as apiClient, r as requireAuth } from "./api-client-CbTdHRmP.mjs";
import { e as env } from "./index.mjs";
import "../_libs/posthog-js.mjs";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "./server-CNwFEcD6.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "crypto";
import "async_hooks";
import "util";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
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
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const listeners = /* @__PURE__ */ new Set();
if (typeof window !== "undefined") {
  window.addEventListener("devai_auth_change", () => {
    notifyListeners("SIGNED_OUT", null);
  });
}
function notifyListeners(event, session) {
  listeners.forEach((listener) => listener(event, session));
}
function setTokenCookie(token) {
  document.cookie = `devai_jwt=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}
function clearTokenCookie() {
  document.cookie = "devai_jwt=; path=/; max-age=0; SameSite=Lax";
}
function storeAuth(token, user) {
  localStorage.setItem("devai_jwt", token);
  localStorage.setItem("devai_user", JSON.stringify(user));
  setTokenCookie(token);
}
function clearAuth() {
  localStorage.removeItem("devai_jwt");
  localStorage.removeItem("devai_user");
  clearTokenCookie();
}
const authClient = {
  auth: {
    async getSession() {
      const token = localStorage.getItem("devai_jwt");
      const userStr = localStorage.getItem("devai_user");
      if (!token || !userStr) {
        return { data: { session: null }, error: null };
      }
      try {
        const user = JSON.parse(userStr);
        return { data: { session: { user, access_token: token } }, error: null };
      } catch (e) {
        return { data: { session: null }, error: null };
      }
    },
    async getUser() {
      const { data: { session } } = await this.getSession();
      return { data: { user: session?.user || null }, error: null };
    },
    onAuthStateChange(callback) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              listeners.delete(callback);
            }
          }
        }
      };
    },
    async signInWithPassword({ email, password }) {
      try {
        const res = await apiClient.post("/auth/login", { email, password });
        const { token, user } = res.data.data || res.data;
        storeAuth(token, user);
        notifyListeners("SIGNED_IN", { user });
        return { data: { user, session: { access_token: token } }, error: null };
      } catch (error) {
        return { data: null, error: new Error(error.response?.data?.message || "Login failed") };
      }
    },
    async signUp({ email, password, options }) {
      try {
        const res = await apiClient.post("/auth/register", {
          email,
          password,
          full_name: options?.data?.full_name
        });
        const { token, user } = res.data.data || res.data;
        storeAuth(token, user);
        notifyListeners("SIGNED_IN", { user });
        return { data: { user, session: { access_token: token } }, error: null };
      } catch (error) {
        return { data: null, error: new Error(error.response?.data?.message || "Registration failed") };
      }
    },
    async signInWithOAuth({ provider }) {
      if (provider === "google") {
        const backendUrl = env.VITE_API_URL;
        window.location.href = `${backendUrl}/auth/google`;
        return { data: { url: `${backendUrl}/auth/google` }, error: null };
      }
      return { data: null, error: new Error(`${provider} OAuth is not supported.`) };
    },
    async exchangeGoogleCode(code) {
      try {
        const res = await apiClient.post("/auth/google/exchange", { code });
        const { token, user } = res.data.data || res.data;
        storeAuth(token, user);
        notifyListeners("SIGNED_IN", { user });
        return { data: { user, session: { access_token: token } }, error: null };
      } catch (error) {
        return { data: null, error: new Error(error.response?.data?.message || "Google OAuth exchange failed") };
      }
    },
    async signOut() {
      clearAuth();
      notifyListeners("SIGNED_OUT", null);
      return { error: null };
    }
  }
};
const appCss = "/assets/styles-DbEm9f2n.css";
const initialState = {
  theme: "system",
  setTheme: () => null
};
const ThemeProviderContext = reactExports.createContext(initialState);
function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [theme, setTheme] = reactExports.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKey) || defaultTheme;
    }
    return defaultTheme;
  });
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);
  const value = {
    theme,
    setTheme: (theme2) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, theme2);
      }
      setTheme(theme2);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProviderContext.Provider, { ...props, value, children });
}
const useTheme = () => {
  const context = reactExports.useContext(ThemeProviderContext);
  if (context === void 0) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold gradient-text", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "That route doesn't exist in DevAI." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Back home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$o = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DevAI — AI-Powered Developer Career Platform" },
      {
        name: "description",
        content: "Analyze your GitHub, build ATS resumes, generate portfolios, get AI code reviews, and ace interviews with DevAI."
      },
      { property: "og:title", content: "DevAI — AI-Powered Developer Career Platform" },
      {
        property: "og:description",
        content: "Your AI career copilot — GitHub analysis, ATS resumes, code reviews, mock interviews, and personalized roadmaps."
      },
      { property: "og:image", content: "https://YOUR_VERCEL_URL/og-image.png" },
      { property: "og:url", content: "https://YOUR_VERCEL_URL" },
      { name: "twitter:image", content: "https://YOUR_VERCEL_URL/og-image.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { suppressHydrationWarning: true, children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function AppToaster() {
  const { theme } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { theme });
}
function RootComponent() {
  const { queryClient } = Route$o.useRouteContext();
  const router2 = useRouter();
  reactExports.useEffect(() => {
    const {
      data: { subscription }
    } = authClient.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router2.invalidate();
      if (event === "SIGNED_IN" && session?.user) ;
      else if (event === "SIGNED_OUT") {
        queryClient.invalidateQueries();
      }
    });
    return () => subscription.unsubscribe();
  }, [router2, queryClient]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { defaultTheme: "system", storageKey: "devai-theme", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppToaster, {})
  ] }) });
}
const $$splitComponentImporter$n = () => import("./index-CnkGG74j.mjs");
const Route$n = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "DevAI — Your AI-Powered Developer Career Assistant"
    }, {
      name: "description",
      content: "Analyze GitHub. Build ATS Resumes. Create Portfolios. Crack Interviews. All powered by AI."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./route-B-tAROHW.mjs");
const $$splitErrorComponentImporter$h = () => import("./route-BPlchySI.mjs");
const Route$m = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const {
      data,
      error
    } = await authClient.auth.getUser();
    if (error || !data || !data.user) throw redirect({
      to: "/login"
    });
    return {
      user: data.user
    };
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$h, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./login-De7w5gxv.mjs");
const Route$l = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Sign in — DevAI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./signup-BruH6j05.mjs");
const Route$k = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Create Account — DevAI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./admin-B6LnlLxL.mjs");
const $$splitErrorComponentImporter$g = () => import("./admin-BPlchySI.mjs");
const Route$j = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{
      title: "Admin — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$g, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./checkout-DpJ0M8H0.mjs");
const Route$i = createFileRoute("/_authenticated/checkout")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./code-review-5WQaBhoS.mjs");
const $$splitErrorComponentImporter$f = () => import("./code-review-BPlchySI.mjs");
const Route$h = createFileRoute("/_authenticated/code-review")({
  head: () => ({
    meta: [{
      title: "AI Code Reviewer — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$f, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./copilot-DohWDuVt.mjs");
const Route$g = createFileRoute("/_authenticated/copilot")({
  head: () => ({
    meta: [{
      title: "AI Career Copilot — DevAI"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./dashboard-CuA1haU6.mjs");
const $$splitErrorComponentImporter$e = () => import("./dashboard-BPlchySI.mjs");
const Route$f = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$e, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./developer-score-KAVc8d6m.mjs");
const $$splitErrorComponentImporter$d = () => import("./developer-score-BPlchySI.mjs");
const Route$e = createFileRoute("/_authenticated/developer-score")({
  head: () => ({
    meta: [{
      title: "Developer Health Score — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$d, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./github-BYl7uROL.mjs");
const $$splitErrorComponentImporter$c = () => import("./github-BPlchySI.mjs");
const Route$d = createFileRoute("/_authenticated/github")({
  head: () => ({
    meta: [{
      title: "GitHub Analyzer — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$c, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./github-resume-dawcEMRB.mjs");
const $$splitErrorComponentImporter$b = () => import("./github-resume-BPlchySI.mjs");
const Route$c = createFileRoute("/_authenticated/github-resume")({
  head: () => ({
    meta: [{
      title: "GitHub Resume Generator — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$b, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./health-score-n9Zg-oAD.mjs");
const $$splitErrorComponentImporter$a = () => import("./health-score-BPlchySI.mjs");
const Route$b = createFileRoute("/_authenticated/health-score")({
  head: () => ({
    meta: [{
      title: "Developer Health Score — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$a, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./interview-B_gXpBCd.mjs");
const $$splitErrorComponentImporter$9 = () => import("./interview-BPlchySI.mjs");
const Route$a = createFileRoute("/_authenticated/interview")({
  head: () => ({
    meta: [{
      title: "Interview Hub — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$9, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./job-match-DS3TUkru.mjs");
const $$splitErrorComponentImporter$8 = () => import("./job-match-BPlchySI.mjs");
const Route$9 = createFileRoute("/_authenticated/job-match")({
  head: () => ({
    meta: [{
      title: "Job Match Analyzer — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$8, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const $$splitComponentImporter$8 = () => import("./leaderboard-COs98s62.mjs");
const $$splitErrorComponentImporter$7 = () => import("./leaderboard-BPlchySI.mjs");
const fetchLeaderboard = createServerFn({
  method: "GET"
}).middleware([requireAuth]).handler(createSsrRpc("7f63a85a3610a9cfcfe6a1e7f7d533b18795ff6325aa0c265fb5306abff255b5"));
const Route$8 = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [{
      title: "Global Leaderboard — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$7, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./mock-interview-oL-DCXUu.mjs");
const $$splitErrorComponentImporter$6 = () => import("./mock-interview-BPlchySI.mjs");
const Route$7 = createFileRoute("/_authenticated/mock-interview")({
  head: () => ({
    meta: [{
      title: "Mock Interview Simulator — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$6, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./profile-CuvMiTqJ.mjs");
const $$splitErrorComponentImporter$5 = () => import("./profile-BPlchySI.mjs");
const Route$6 = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{
      title: "Profile — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$5, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./resume-vb0x8XH0.mjs");
const $$splitErrorComponentImporter$4 = () => import("./resume-BPlchySI.mjs");
const Route$5 = createFileRoute("/_authenticated/resume")({
  head: () => ({
    meta: [{
      title: "Resume Builder — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$4, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./roadmap-1p-LsIDH.mjs");
const $$splitErrorComponentImporter$3 = () => import("./roadmap-BPlchySI.mjs");
const Route$4 = createFileRoute("/_authenticated/roadmap")({
  head: () => ({
    meta: [{
      title: "Career Roadmap — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$3, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./p._id-BuUJz3dZ.mjs");
const Route$3 = createFileRoute("/p/$id")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin.analytics-HNv22pEb.mjs");
const $$splitErrorComponentImporter$2 = () => import("./admin.analytics-BPlchySI.mjs");
const Route$2 = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({
    meta: [{
      title: "Platform Analytics — DevAI Admin"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$2, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin.usage-yNsmi0vZ.mjs");
const $$splitErrorComponentImporter$1 = () => import("./admin.usage-BPlchySI.mjs");
const Route$1 = createFileRoute("/_authenticated/admin/usage")({
  head: () => ({
    meta: [{
      title: "API Usage — DevAI Admin"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./portfolio-deployment._id-BHjefN-c.mjs");
const $$splitErrorComponentImporter = () => import("./portfolio-deployment._id-BPlchySI.mjs");
const Route = createFileRoute("/_authenticated/portfolio-deployment/$id")({
  head: () => ({
    meta: [{
      title: "Deploy Portfolio — DevAI"
    }]
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route$n.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$o
});
const AuthenticatedRouteRoute = Route$m.update({
  id: "/_authenticated",
  getParentRoute: () => Route$o
});
const LoginRoute = Route$l.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$o
});
const SignupRoute = Route$k.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$o
});
const AuthenticatedAdminRoute = Route$j.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCheckoutRoute = Route$i.update({
  id: "/checkout",
  path: "/checkout",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCodeReviewRoute = Route$h.update({
  id: "/code-review",
  path: "/code-review",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedCopilotRoute = Route$g.update({
  id: "/copilot",
  path: "/copilot",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDashboardRoute = Route$f.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDeveloperScoreRoute = Route$e.update({
  id: "/developer-score",
  path: "/developer-score",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedGithubRoute = Route$d.update({
  id: "/github",
  path: "/github",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedGithubResumeRoute = Route$c.update({
  id: "/github-resume",
  path: "/github-resume",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedHealthScoreRoute = Route$b.update({
  id: "/health-score",
  path: "/health-score",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedInterviewRoute = Route$a.update({
  id: "/interview",
  path: "/interview",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedJobMatchRoute = Route$9.update({
  id: "/job-match",
  path: "/job-match",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedLeaderboardRoute = Route$8.update({
  id: "/leaderboard",
  path: "/leaderboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedMockInterviewRoute = Route$7.update({
  id: "/mock-interview",
  path: "/mock-interview",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedProfileRoute = Route$6.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedResumeRoute = Route$5.update({
  id: "/resume",
  path: "/resume",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedRoadmapRoute = Route$4.update({
  id: "/roadmap",
  path: "/roadmap",
  getParentRoute: () => AuthenticatedRouteRoute
});
const PIdRoute = Route$3.update({
  id: "/p/$id",
  path: "/p/$id",
  getParentRoute: () => Route$o
});
const AuthenticatedAdminAnalyticsRoute = Route$2.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AuthenticatedAdminRoute
});
const AuthenticatedAdminUsageRoute = Route$1.update({
  id: "/usage",
  path: "/usage",
  getParentRoute: () => AuthenticatedAdminRoute
});
const AuthenticatedPortfolioDeploymentIdRoute = Route.update({
  id: "/portfolio-deployment/$id",
  path: "/portfolio-deployment/$id",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedAdminRouteChildren = {
  AuthenticatedAdminAnalyticsRoute,
  AuthenticatedAdminUsageRoute
};
const AuthenticatedAdminRouteWithChildren = AuthenticatedAdminRoute._addFileChildren(AuthenticatedAdminRouteChildren);
const AuthenticatedRouteRouteChildren = {
  AuthenticatedAdminRoute: AuthenticatedAdminRouteWithChildren,
  AuthenticatedCheckoutRoute,
  AuthenticatedCodeReviewRoute,
  AuthenticatedCopilotRoute,
  AuthenticatedDashboardRoute,
  AuthenticatedDeveloperScoreRoute,
  AuthenticatedGithubRoute,
  AuthenticatedGithubResumeRoute,
  AuthenticatedHealthScoreRoute,
  AuthenticatedInterviewRoute,
  AuthenticatedJobMatchRoute,
  AuthenticatedLeaderboardRoute,
  AuthenticatedMockInterviewRoute,
  AuthenticatedProfileRoute,
  AuthenticatedResumeRoute,
  AuthenticatedRoadmapRoute,
  AuthenticatedPortfolioDeploymentIdRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  LoginRoute,
  SignupRoute,
  PIdRoute
};
const routeTree = Route$o._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$3 as R,
  authClient as a,
  Route as b,
  createSsrRpc as c,
  fetchLeaderboard as f,
  router as r,
  useTheme as u
};
