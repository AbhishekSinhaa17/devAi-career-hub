import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { format } from "date-fns";
import { getApiUsageAnalytics, isAdmin as isAdminFn } from "@/lib/admin.functions";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Zap, DollarSign, AlertTriangle, ShieldAlert, ArrowLeft, CalendarIcon, Download, FileJson, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/usage")({
  head: () => ({ meta: [{ title: "API Usage — DevAI Admin" }] }),
  component: UsagePage,
});

const PRESETS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function fmtUSD(n: number) {
  return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;
}
function fmtInt(n: number) {
  return n.toLocaleString();
}

function UsagePage() {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [days, setDays] = useState(30);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const chartsRef = useRef<HTMLDivElement>(null);
  const [pngBusy, setPngBusy] = useState(false);

  const checkAdmin = useServerFn(isAdminFn);
  const analyticsFn = useServerFn(getApiUsageAnalytics);
  const access = useQuery({ queryKey: ["admin-access"], queryFn: () => checkAdmin() });

  const queryKey =
    mode === "preset"
      ? (["admin-usage", "preset", days] as const)
      : (["admin-usage", "custom", startDate?.toISOString(), endDate?.toISOString()] as const);

  const q = useQuery({
    queryKey,
    queryFn: () => {
      if (mode === "preset") {
        return analyticsFn({ data: { days } });
      }
      const s = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
      const e = endDate ? format(endDate, "yyyy-MM-dd") : undefined;
      return analyticsFn({ data: { startDate: s, endDate: e } });
    },
    enabled: access.data?.isAdmin === true,
  });

  if (access.isLoading) return <div className="text-sm text-muted-foreground">Checking access…</div>;
  if (!access.data?.isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-destructive" />
        <h2 className="text-lg font-semibold">Admins only</h2>
      </div>
    );
  }

  const d = q.data;
  const isCustomActive = mode === "custom";

  const exportCsv = () => {
    if (!d) return;
    const rows: string[][] = [];
    rows.push(["DevAI — API Usage Analytics"]);
    rows.push(["Period", mode === "preset" ? `${d.days} days` : `${d.startDate} to ${d.endDate}`]);
    rows.push(["Generated", new Date().toISOString()]);
    rows.push([]);
    rows.push(["Summary"]);
    rows.push(["Requests", String(d.totals.requests)]);
    rows.push(["Tokens", String(d.totals.tokens)]);
    rows.push(["Est. Cost USD", String(d.totals.cost.toFixed(6))]);
    rows.push(["Errors", String(d.totals.errors)]);
    rows.push([]);
    rows.push(["Date", "Requests", "Tokens", "Cost USD", "Errors"]);
    for (const day of d.perDay) {
      rows.push([day.date, String(day.requests), String(day.tokens), String(day.cost.toFixed(6)), String(day.errors)]);
    }
    rows.push([]);
    rows.push(["Endpoint", "Requests", "Tokens", "Cost USD", "Avg Latency (ms)", "Errors"]);
    for (const e of d.byEndpoint) {
      rows.push([e.endpoint, String(e.requests), String(e.tokens), String(e.cost.toFixed(6)), String(e.avgMs), String(e.errors)]);
    }
    rows.push([]);
    rows.push(["Model", "Requests", "Tokens", "Cost USD"]);
    for (const m of d.byModel) {
      rows.push([m.model, String(m.requests), String(m.tokens), String(m.cost.toFixed(6))]);
    }
    rows.push([]);
    rows.push(["User", "Email", "Requests", "Tokens", "Cost USD"]);
    for (const u of d.topUsers) {
      rows.push([
        u.profile?.name ?? u.user_id,
        u.profile?.email ?? "",
        String(u.requests),
        String(u.tokens),
        String(u.cost.toFixed(6)),
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const suffix = mode === "preset" ? `${d.days}d` : `${d.startDate}_${d.endDate}`;
    a.href = url;
    a.download = `devai-usage-${suffix}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    if (!d) return;
    const payload = {
      meta: {
        period: mode === "preset" ? `${d.days} days` : `${d.startDate} to ${d.endDate}`,
        generatedAt: new Date().toISOString(),
      },
      summary: d.totals,
      perDay: d.perDay,
      byEndpoint: d.byEndpoint,
      byModel: d.byModel,
      topUsers: d.topUsers.map((u: any) => ({
        userId: u.user_id,
        name: u.profile?.name ?? u.user_id,
        email: u.profile?.email ?? "",
        requests: u.requests,
        tokens: u.tokens,
        cost: u.cost,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const suffix = mode === "preset" ? `${d.days}d` : `${d.startDate}_${d.endDate}`;
    a.href = url;
    a.download = `devai-usage-${suffix}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportPng = async () => {
    if (!chartsRef.current || !d) return;
    setPngBusy(true);
    try {
      const bg = getComputedStyle(document.body).backgroundColor || "#0a0a0a";
      const dataUrl = await toPng(chartsRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: bg,
      });
      const a = document.createElement("a");
      const suffix = mode === "preset" ? `${d.days}d` : `${d.startDate}_${d.endDate}`;
      a.href = dataUrl;
      a.download = `devai-usage-charts-${suffix}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("PNG export failed", e);
    } finally {
      setPngBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Admin
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">API Usage Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI requests, tokens, and estimated cost across all endpoints.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {PRESETS.map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  setMode("preset");
                  setDays(r.value);
                }}
                className={cn(
                  "rounded-md px-3 py-1 text-xs transition-colors",
                  mode === "preset" && days === r.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => setMode("custom")}
              className={cn(
                "rounded-md px-3 py-1 text-xs transition-colors",
                isCustomActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Custom
            </button>
          </div>

          {isCustomActive && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal text-xs",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-xs text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal text-xs",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Button
                size="sm"
                disabled={!startDate || !endDate || q.isFetching}
                onClick={() => q.refetch()}
                className="text-xs"
              >
                Apply
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={!d || q.isLoading}
            onClick={exportCsv}
            className="text-xs"
          >
            <Download className="mr-1 h-3 w-3" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!d || q.isLoading}
            onClick={exportJson}
            className="text-xs"
          >
            <FileJson className="mr-1 h-3 w-3" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!d || q.isLoading || pngBusy}
            onClick={exportPng}
            className="text-xs"
          >
            <ImageIcon className="mr-1 h-3 w-3" />
            {pngBusy ? "Rendering…" : "Export PNG"}
          </Button>
        </div>
      </div>

      {isCustomActive && d?.startDate && d?.endDate && (
        <div className="text-xs text-muted-foreground">
          Showing data from {d.startDate} to {d.endDate}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Requests" value={fmtInt(d?.totals.requests ?? 0)} icon={Activity} />
        <StatCard label="Tokens" value={fmtInt(d?.totals.tokens ?? 0)} icon={Zap} />
        <StatCard label="Est. cost" value={fmtUSD(d?.totals.cost ?? 0)} icon={DollarSign} />
        <StatCard
          label="Errors"
          value={fmtInt(d?.totals.errors ?? 0)}
          icon={AlertTriangle}
          tone={d && d.totals.errors > 0 ? "warn" : "default"}
        />
      </div>

      <div ref={chartsRef} className="space-y-6 bg-background p-2">
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Requests per day</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={d?.perDay ?? []}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="requests" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Tokens per day</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d?.perDay ?? []}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="tokens" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Estimated cost per day</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d?.perDay ?? []}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => fmtUSD(v)}
                />
                <Bar dataKey="cost" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">By endpoint</h2>
          <p className="text-xs text-muted-foreground">Tokens, cost, and latency per AI endpoint</p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-2">Endpoint</th>
                <th className="px-5 py-2 text-right">Requests</th>
                <th className="px-5 py-2 text-right">Tokens</th>
                <th className="px-5 py-2 text-right">Cost</th>
                <th className="px-5 py-2 text-right">Avg latency</th>
                <th className="px-5 py-2 text-right">Errors</th>
              </tr>
            </thead>
            <tbody>
              {(d?.byEndpoint ?? []).map((e) => (
                <tr key={e.endpoint} className="border-t border-border">
                  <td className="px-5 py-2 font-medium">{e.endpoint}</td>
                  <td className="px-5 py-2 text-right">{fmtInt(e.requests)}</td>
                  <td className="px-5 py-2 text-right">{fmtInt(e.tokens)}</td>
                  <td className="px-5 py-2 text-right">{fmtUSD(e.cost)}</td>
                  <td className="px-5 py-2 text-right text-muted-foreground">{e.avgMs}ms</td>
                  <td className="px-5 py-2 text-right">
                    {e.errors > 0 ? <span className="text-destructive">{e.errors}</span> : "—"}
                  </td>
                </tr>
              ))}
              {!q.isLoading && !(d?.byEndpoint?.length) && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">No usage yet in this range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card">
          <header className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">By model</h2>
          </header>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-2">Model</th>
                <th className="px-5 py-2 text-right">Requests</th>
                <th className="px-5 py-2 text-right">Tokens</th>
                <th className="px-5 py-2 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {(d?.byModel ?? []).map((m) => (
                <tr key={m.model} className="border-t border-border">
                  <td className="px-5 py-2 font-mono text-xs">{m.model}</td>
                  <td className="px-5 py-2 text-right">{fmtInt(m.requests)}</td>
                  <td className="px-5 py-2 text-right">{fmtInt(m.tokens)}</td>
                  <td className="px-5 py-2 text-right">{fmtUSD(m.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <header className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Top users</h2>
            <p className="text-xs text-muted-foreground">By AI request volume</p>
          </header>
          <ul className="divide-y divide-border">
            {(d?.topUsers ?? []).map((u: any) => (
              <li key={u.user_id} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  {u.profile?.avatar_url ? (
                    <img src={u.profile.avatar_url} alt="" className="h-7 w-7 rounded-full" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-muted" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm">{u.profile?.name ?? u.profile?.email ?? "Unknown"}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.profile?.email ?? u.user_id}</div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-medium text-foreground">{fmtInt(u.requests)} req</div>
                  <div className="text-muted-foreground">{fmtInt(u.tokens)} tok · {fmtUSD(u.cost)}</div>
                </div>
              </li>
            ))}
            {!q.isLoading && !(d?.topUsers?.length) && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">No users yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: any;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${tone === "warn" ? "text-destructive" : "text-muted-foreground"}`} />
      </div>
      <div className={`mt-2 text-2xl font-semibold ${tone === "warn" ? "text-destructive" : ""}`}>{value}</div>
    </div>
  );
}
