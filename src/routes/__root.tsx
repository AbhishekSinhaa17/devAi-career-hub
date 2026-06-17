import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import * as Sentry from "@sentry/react";
import posthog from "posthog-js";

if (typeof document !== "undefined") {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [],
      tracesSampleRate: 1.0,
    });
  }
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
    });
  }
}

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That route doesn&apos;t exist in DevAI.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DevAI — AI-Powered Developer Career Platform" },
      { name: "description", content: "Analyze your GitHub, build ATS resumes, generate portfolios, get AI code reviews, and ace interviews with DevAI." },
      { property: "og:title", content: "DevAI — AI-Powered Developer Career Platform" },
      { property: "og:description", content: "Your AI career copilot — GitHub analysis, ATS resumes, code reviews, mock interviews, and personalized roadmaps." },
      { property: "og:image", content: "https://devai-career-hub.vercel.app/og-image.png" },
      { property: "og:url", content: "https://devai-career-hub.vercel.app" },
      { name: "twitter:image", content: "https://devai-career-hub.vercel.app/og-image.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

function AppToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme as "light" | "dark" | "system"} />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      
      if (event === "SIGNED_IN" && session?.user) {
        if (import.meta.env.VITE_POSTHOG_KEY) {
          posthog.identify(session.user.id, { email: session.user.email });
        }
        if (import.meta.env.VITE_SENTRY_DSN) {
          Sentry.setUser({ id: session.user.id, email: session.user.email });
        }
      } else if (event === "SIGNED_OUT") {
        queryClient.invalidateQueries();
        if (import.meta.env.VITE_POSTHOG_KEY) posthog.reset();
        if (import.meta.env.VITE_SENTRY_DSN) Sentry.setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <ThemeProvider defaultTheme="system" storageKey="devai-theme">
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <AppToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
