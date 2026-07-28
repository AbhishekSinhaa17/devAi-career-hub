import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient, authClient as supabase } from "@/lib/auth-client";
import { AppShell } from "@/components/AppShell";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data || !data.user) throw redirect({ to: "/login" });
    return { user: data.user };
  },
  errorComponent: RouteErrorBoundary,
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
