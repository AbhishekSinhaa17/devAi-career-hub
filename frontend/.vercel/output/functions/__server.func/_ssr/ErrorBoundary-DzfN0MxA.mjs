import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRouter, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as RefreshCw, H as House, a as Shield, q as Bot, u as TriangleAlert, v as ServerCrash, W as WifiOff } from "../_libs/lucide-react.mjs";
function categorizeError(error) {
  const msg = error.message?.toLowerCase() ?? "";
  if (msg.includes("daily ai limit") || msg.includes("rate limit")) {
    return {
      title: "AI Usage Limit Reached",
      message: error.message.includes("Daily") ? error.message : "You've made too many AI requests. Please wait a moment and try again.",
      icon: Shield,
      accentColor: "#f59e0b"
    };
  }
  if (msg.includes("ai request failed") || msg.includes("ai credits") || msg.includes("no ai providers") || msg.includes("failed to parse ai")) {
    return {
      title: "AI Service Unavailable",
      message: "Our AI service is temporarily unavailable. Please try again in a few moments.",
      icon: Bot,
      accentColor: "#8b5cf6"
    };
  }
  if (msg.includes("github")) {
    if (msg.includes("rate limit")) {
      return {
        title: "GitHub Rate Limit",
        message: "GitHub API rate limit exceeded. Please wait a few minutes and try again.",
        icon: Shield,
        accentColor: "#f59e0b"
      };
    }
    if (msg.includes("not found")) {
      return {
        title: "GitHub User Not Found",
        message: "The GitHub username you entered could not be found. Please check and try again.",
        icon: TriangleAlert,
        accentColor: "#ef4444"
      };
    }
    return {
      title: "GitHub Error",
      message: "There was a problem communicating with GitHub. Please try again.",
      icon: TriangleAlert,
      accentColor: "#ef4444"
    };
  }
  if (msg.includes("unauthorized") || msg.includes("invalid token")) {
    return {
      title: "Session Expired",
      message: "Your session has expired. Please sign in again to continue.",
      icon: Shield,
      accentColor: "#f59e0b"
    };
  }
  if (msg.includes("supabase") || msg.includes("missing supabase")) {
    return {
      title: "Service Configuration Error",
      message: "A backend service is misconfigured. Please contact support if this persists.",
      icon: ServerCrash,
      accentColor: "#ef4444"
    };
  }
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("econnrefused") || msg.includes("failed to fetch")) {
    return {
      title: "Connection Error",
      message: "Unable to reach the server. Check your internet connection and try again.",
      icon: WifiOff,
      accentColor: "#3b82f6"
    };
  }
  return {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
    icon: TriangleAlert,
    accentColor: "#ef4444"
  };
}
function RouteErrorBoundary({ error, reset }) {
  console.error("[RouteErrorBoundary]", error);
  const router = useRouter();
  const info = categorizeError(error);
  const Icon = info.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center min-h-[60vh] px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "max-w-md w-full text-center",
        style: { animation: "fadeSlideIn 0.5s ease-out both" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "mx-auto mb-6 h-20 w-20 rounded-3xl grid place-items-center",
              style: {
                background: `linear-gradient(135deg, ${info.accentColor}18, ${info.accentColor}08)`,
                border: `1px solid ${info.accentColor}30`,
                boxShadow: `0 0 40px ${info.accentColor}10`
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-10 w-10", style: { color: info.accentColor } })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black tracking-tight text-foreground mb-2", children: info.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto", children: info.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  router.invalidate();
                  reset();
                },
                className: "group relative inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm text-white overflow-hidden",
                style: {
                  background: `linear-gradient(135deg, ${info.accentColor}, ${info.accentColor}cc)`,
                  boxShadow: `0 0 20px ${info.accentColor}30`
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 relative" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative", children: "Try Again" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/",
                className: "inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm text-foreground border border-border/60 bg-card/40 backdrop-blur-sm hover:bg-accent transition-all duration-300",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-4 w-4" }),
                  "Go Home"
                ]
              }
            )
          ] }),
          false
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      ` })
  ] });
}
export {
  RouteErrorBoundary as R
};
