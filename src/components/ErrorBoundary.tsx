import { useRouter, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  WifiOff,
  Shield,
  Bot,
  ServerCrash,
} from "lucide-react";

// ─── Error categorization ─────────────────────────────────────────────────────

interface ErrorInfo {
  title: string;
  message: string;
  icon: React.ElementType;
  accentColor: string;
}

/**
 * Classify an error into a user-friendly category based on the message.
 * Full error details are logged internally — only friendly text is shown.
 */
function categorizeError(error: Error): ErrorInfo {
  const msg = error.message?.toLowerCase() ?? "";

  // AI rate limiting
  if (msg.includes("daily ai limit") || msg.includes("rate limit")) {
    return {
      title: "AI Usage Limit Reached",
      message:
        error.message.includes("Daily")
          ? error.message
          : "You've made too many AI requests. Please wait a moment and try again.",
      icon: Shield,
      accentColor: "#f59e0b",
    };
  }

  // AI provider errors
  if (
    msg.includes("ai request failed") ||
    msg.includes("ai credits") ||
    msg.includes("no ai providers") ||
    msg.includes("failed to parse ai")
  ) {
    return {
      title: "AI Service Unavailable",
      message:
        "Our AI service is temporarily unavailable. Please try again in a few moments.",
      icon: Bot,
      accentColor: "#8b5cf6",
    };
  }

  // GitHub errors
  if (msg.includes("github")) {
    if (msg.includes("rate limit")) {
      return {
        title: "GitHub Rate Limit",
        message:
          "GitHub API rate limit exceeded. Please wait a few minutes and try again.",
        icon: Shield,
        accentColor: "#f59e0b",
      };
    }
    if (msg.includes("not found")) {
      return {
        title: "GitHub User Not Found",
        message: "The GitHub username you entered could not be found. Please check and try again.",
        icon: AlertTriangle,
        accentColor: "#ef4444",
      };
    }
    return {
      title: "GitHub Error",
      message:
        "There was a problem communicating with GitHub. Please try again.",
      icon: AlertTriangle,
      accentColor: "#ef4444",
    };
  }

  // Supabase / auth errors
  if (msg.includes("unauthorized") || msg.includes("invalid token")) {
    return {
      title: "Session Expired",
      message:
        "Your session has expired. Please sign in again to continue.",
      icon: Shield,
      accentColor: "#f59e0b",
    };
  }

  if (msg.includes("supabase") || msg.includes("missing supabase")) {
    return {
      title: "Service Configuration Error",
      message:
        "A backend service is misconfigured. Please contact support if this persists.",
      icon: ServerCrash,
      accentColor: "#ef4444",
    };
  }

  // Network errors
  if (
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("econnrefused") ||
    msg.includes("failed to fetch")
  ) {
    return {
      title: "Connection Error",
      message:
        "Unable to reach the server. Check your internet connection and try again.",
      icon: WifiOff,
      accentColor: "#3b82f6",
    };
  }

  // Generic fallback
  return {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
    icon: AlertTriangle,
    accentColor: "#ef4444",
  };
}

// ─── Route-level error component ──────────────────────────────────────────────

/**
 * Reusable error boundary component for TanStack Router `errorComponent`.
 *
 * Usage in route definitions:
 *   import { RouteErrorBoundary } from "@/components/ErrorBoundary";
 *   export const Route = createFileRoute("/_authenticated/my-page")({
 *     errorComponent: RouteErrorBoundary,
 *     component: Page,
 *   });
 */
export function RouteErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // Log full error internally (never exposed to user in production)
  console.error("[RouteErrorBoundary]", error);

  const router = useRouter();
  const info = categorizeError(error);
  const Icon = info.icon;

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div
        className="max-w-md w-full text-center"
        style={{ animation: "fadeSlideIn 0.5s ease-out both" }}
      >
        {/* Icon */}
        <div
          className="mx-auto mb-6 h-20 w-20 rounded-3xl grid place-items-center"
          style={{
            background: `linear-gradient(135deg, ${info.accentColor}18, ${info.accentColor}08)`,
            border: `1px solid ${info.accentColor}30`,
            boxShadow: `0 0 40px ${info.accentColor}10`,
          }}
        >
          <Icon
            className="h-10 w-10"
            style={{ color: info.accentColor }}
          />
        </div>

        {/* Text */}
        <h2 className="text-xl font-black tracking-tight text-foreground mb-2">
          {info.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
          {info.message}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="group relative inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm text-white overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${info.accentColor}, ${info.accentColor}cc)`,
              boxShadow: `0 0 20px ${info.accentColor}30`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            <RefreshCw className="h-4 w-4 relative" />
            <span className="relative">Try Again</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm text-foreground border border-border/60 bg-card/40 backdrop-blur-sm hover:bg-accent transition-all duration-300"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>

        {/* Dev-only error details */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Developer details
            </summary>
            <pre className="mt-2 p-3 rounded-xl bg-muted/20 border border-border/40 text-[11px] text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap break-all">
              {error.stack ?? error.message}
            </pre>
          </details>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
