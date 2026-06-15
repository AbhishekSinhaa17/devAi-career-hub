import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  Github,
  FileText,
  Code2,
  MessageSquare,
  Map,
  User,
  Sparkles,
  LogOut,
  Shield,
  Briefcase,
  Activity,
} from "lucide-react";
import { type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isAdmin as isAdminFn } from "@/lib/admin.functions";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/github", icon: Github, label: "GitHub Analyzer" },
  { to: "/github-resume", icon: Github, label: "GitHub Resume Generator" },
  { to: "/resume", icon: FileText, label: "Resume Builder" },
  { to: "/code-review", icon: Code2, label: "Code Reviewer" },
  { to: "/mock-interview", icon: MessageSquare, label: "Mock Interview Simulator" },
  { to: "/interview", icon: MessageSquare, label: "Interview Hub" },
  { to: "/roadmap", icon: Map, label: "Roadmap" },
  { to: "/job-match", icon: Briefcase, label: "Job Match Analyzer" },
  { to: "/developer-score", icon: Activity, label: "Developer Score" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;


export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkAdmin = useServerFn(isAdminFn);
  const adminQ = useQuery({ queryKey: ["admin-access"], queryFn: () => checkAdmin() });
  const items = adminQ.data?.isAdmin
    ? [...nav, { to: "/admin", icon: Shield, label: "Admin" } as const]
    : nav;


  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-border bg-sidebar md:flex">
        <Link to="/dashboard" className="flex h-16 items-center gap-2 border-b border-border px-5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-2">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">DevAI</span>
        </Link>
        <nav className="flex-1 space-y-0.5 p-3">
          {items.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold">DevAI</span>
        </Link>
        <Button onClick={signOut} variant="ghost" size="icon"><LogOut className="h-4 w-4" /></Button>
      </header>

      <main className="flex-1 pt-14 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">{children}</div>
        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-background/95 px-2 py-1.5 backdrop-blur md:hidden">
          {items.slice(0, 6).map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                <n.icon className="h-4 w-4" />
                {n.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
