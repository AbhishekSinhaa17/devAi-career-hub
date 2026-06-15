import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getAdminOverview,
  listAdminUsers,
  listAdminAiRequests,
  setUserAdmin,
  isAdmin as isAdminFn,
} from "@/lib/admin.functions";
import { Users, Github, FileText, Code2, MessageSquare, Map as MapIcon, ShieldAlert, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — DevAI" }] }),
  component: AdminPage,
});

function AdminPage() {
  const checkAdmin = useServerFn(isAdminFn);
  const overviewFn = useServerFn(getAdminOverview);
  const usersFn = useServerFn(listAdminUsers);
  const aiFn = useServerFn(listAdminAiRequests);
  const toggleAdmin = useServerFn(setUserAdmin);
  const qc = useQueryClient();

  const access = useQuery({ queryKey: ["admin-access"], queryFn: () => checkAdmin() });

  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn(),
    enabled: access.data?.isAdmin === true,
  });
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => usersFn(),
    enabled: access.data?.isAdmin === true,
  });
  const ai = useQuery({
    queryKey: ["admin-ai"],
    queryFn: () => aiFn(),
    enabled: access.data?.isAdmin === true,
  });

  const mut = useMutation({
    mutationFn: (vars: { userId: string; makeAdmin: boolean }) => toggleAdmin({ data: vars }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  if (access.isLoading) {
    return <div className="text-sm text-muted-foreground">Checking access…</div>;
  }

  if (!access.data?.isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <h2 className="text-lg font-semibold">Admins only</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  const t = overview.data?.totals;
  const w = overview.data?.last7Days;

  const stats = [
    { label: "Users", value: t?.users ?? 0, icon: Users },
    { label: "GitHub Analyses", value: t?.githubAnalyses ?? 0, sub: `${w?.githubAnalyses ?? 0} / 7d`, icon: Github },
    { label: "Resumes", value: t?.resumes ?? 0, sub: `${w?.resumes ?? 0} / 7d`, icon: FileText },
    { label: "Code Reviews", value: t?.codeReviews ?? 0, sub: `${w?.codeReviews ?? 0} / 7d`, icon: Code2 },
    { label: "Interviews", value: t?.interviews ?? 0, sub: `${w?.interviews ?? 0} / 7d`, icon: MessageSquare },
    { label: "Roadmaps", value: t?.roadmaps ?? 0, sub: `${w?.roadmaps ?? 0} / 7d`, icon: MapIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor platform usage, users, and AI activity.
          </p>
        </div>
        <a
          href="/admin/usage"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent"
        >
          <Activity className="h-3.5 w-3.5" /> API usage analytics
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
            {s.sub && <div className="text-xs text-muted-foreground">{s.sub}</div>}
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold">Users</h2>
            <p className="text-xs text-muted-foreground">Latest 200 signups · grant or revoke admin</p>
          </div>
          <span className="text-xs text-muted-foreground">{users.data?.length ?? 0} shown</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-2">Name</th>
                <th className="px-5 py-2">Email</th>
                <th className="px-5 py-2">Level</th>
                <th className="px-5 py-2">Roles</th>
                <th className="px-5 py-2">Joined</th>
                <th className="px-5 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(users.data ?? []).map((u: any) => {
                const isAdm = u.roles.includes("admin");
                return (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-5 py-2">{u.name ?? "—"}</td>
                    <td className="px-5 py-2 text-muted-foreground">{u.email ?? "—"}</td>
                    <td className="px-5 py-2 text-muted-foreground">{u.experience_level}</td>
                    <td className="px-5 py-2">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r: string) => (
                          <span
                            key={r}
                            className={`rounded px-1.5 py-0.5 text-[10px] ${
                              r === "admin"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-2 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-2 text-right">
                      <Button
                        size="sm"
                        variant={isAdm ? "outline" : "default"}
                        disabled={mut.isPending}
                        onClick={() =>
                          mut.mutate({ userId: u.id, makeAdmin: !isAdm })
                        }
                      >
                        {isAdm ? "Revoke admin" : "Make admin"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {users.isLoading && (
                <tr><td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">Loading…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Recent AI requests</h2>
          </div>
          <span className="text-xs text-muted-foreground">{ai.data?.length ?? 0} events</span>
        </header>
        <ul className="divide-y divide-border">
          {(ai.data ?? []).map((r: any) => (
            <li key={`${r._table}-${r.id}`} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <div className="flex items-center gap-3">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {r._table.replace("_", " ")}
                </span>
                <span className="text-muted-foreground">
                  {r.github_username || r.title || r.role || r.path || r.language || r.id.slice(0, 8)}
                </span>
                {typeof r.score === "number" && (
                  <span className="text-xs text-primary">score {r.score}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {ai.isLoading && (
            <li className="px-5 py-6 text-center text-sm text-muted-foreground">Loading…</li>
          )}
        </ul>
      </section>
    </div>
  );
}
