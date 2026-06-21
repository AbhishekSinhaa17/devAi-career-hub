import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
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
import {
  Activity,
  Zap,
  DollarSign,
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  CalendarIcon,
  Download,
  FileJson,
  Image as ImageIcon,
  TrendingUp,
  Users,
  Cpu,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/usage")({
  head: () => ({ meta: [{ title: "API Usage — DevAI Admin" }] }),
  errorComponent: RouteErrorBoundary,
  component: UsagePage,
});

const STYLES = `
  @keyframes float-orb {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(22px,-16px) scale(1.04); }
    66%      { transform:translate(-12px,12px) scale(0.97); }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes card-enter {
    from { opacity:0; transform:translateY(12px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes shimmer {
    from { transform:translateX(-100%); }
    to   { transform:translateX(100%); }
  }
  @keyframes bar-fill {
    from { width:0%; }
  }
  @keyframes number-pop {
    from { opacity:0; transform:scale(0.7) translateY(6px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes row-enter {
    from { opacity:0; transform:translateX(-6px); }
    to   { opacity:1; transform:translateX(0); }
  }

  /* Glass */
  .glass-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(14px);
  }
  :root:not(.dark) .glass-panel {
    background: rgba(255,255,255,0.75);
    border: 1px solid rgba(0,0,0,0.08);
  }

  /* Text tokens */
  .t-heading { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .t-heading { color: rgba(0,0,0,0.88); }
  .t-sub { color: rgba(255,255,255,0.40); }
  :root:not(.dark) .t-sub { color: rgba(0,0,0,0.40); }
  .t-body { color: rgba(255,255,255,0.65); }
  :root:not(.dark) .t-body { color: rgba(0,0,0,0.65); }

  /* Dividers / borders */
  .soft-border { border-color: rgba(255,255,255,0.07); }
  :root:not(.dark) .soft-border { border-color: rgba(0,0,0,0.07); }
  .divider-line { background: rgba(255,255,255,0.06); }
  :root:not(.dark) .divider-line { background: rgba(0,0,0,0.06); }

  /* Table rows */
  .table-row-hover:hover { background: rgba(255,255,255,0.025); }
  :root:not(.dark) .table-row-hover:hover { background: rgba(0,0,0,0.02); }

  /* Preset pill buttons */
  .preset-btn {
    padding: 5px 14px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,0.35);
    transition: background 0.2s, color 0.2s;
    cursor: pointer;
  }
  :root:not(.dark) .preset-btn { color: rgba(0,0,0,0.38); }
  .preset-btn:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.06); }
  :root:not(.dark) .preset-btn:hover { color: rgba(0,0,0,0.7); background: rgba(0,0,0,0.05); }
  .preset-btn-active {
    background: linear-gradient(135deg,#4f46e5,#7c3aed) !important;
    color: #fff !important;
    box-shadow: 0 0 14px rgba(99,102,241,0.35);
  }

  /* Export buttons */
  .export-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 700;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.55);
    transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s, transform 0.15s;
    cursor: pointer;
  }
  :root:not(.dark) .export-btn {
    background: rgba(0,0,0,0.03);
    border-color: rgba(0,0,0,0.1);
    color: rgba(0,0,0,0.5);
  }
  .export-btn:hover:not(:disabled) {
    background: rgba(99,102,241,0.1);
    border-color: rgba(99,102,241,0.3);
    color: #818cf8;
    box-shadow: 0 0 10px rgba(99,102,241,0.15);
  }
  .export-btn:active:not(:disabled) { transform:scale(0.97); }
  .export-btn:disabled { opacity:0.35; cursor:not-allowed; }

  /* Chart tooltip */
  .chart-tooltip {
    background: rgba(10,10,18,0.95) !important;
    border: 1px solid rgba(99,102,241,0.25) !important;
    border-radius: 10px !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    color: rgba(255,255,255,0.85) !important;
  }
  :root:not(.dark) .chart-tooltip {
    background: rgba(255,255,255,0.98) !important;
    border-color: rgba(99,102,241,0.2) !important;
    color: rgba(0,0,0,0.8) !important;
  }
`;

const PRESETS = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
];

function fmtUSD(n: number) {
  return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;
}
function fmtInt(n: number) {
  return n.toLocaleString();
}

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden>
      {[
        { c: "#6366f1", s: 500, x: "4%", y: "4%", d: "0s", t: "18s" },
        { c: "#8b5cf6", s: 340, x: "75%", y: "8%", d: "7s", t: "22s" },
        { c: "#10b981", s: 260, x: "82%", y: "66%", d: "14s", t: "20s" },
        { c: "#f59e0b", s: 200, x: "2%", y: "74%", d: "3s", t: "25s" },
      ].map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.s,
            height: o.s,
            left: o.x,
            top: o.y,
            background: `radial-gradient(circle,${o.c},transparent 70%)`,
            opacity: 0.05,
            animation: `float-orb ${o.t} ${o.d} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

function AccentLine({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg,transparent,${color}70,transparent)` }}
    />
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  glow,
  delay,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  glow: string;
  delay: number;
  tone?: "default" | "warn";
}) {
  const c = tone === "warn" ? "#f87171" : color;
  const g = tone === "warn" ? "#ef444440" : glow;

  return (
    <div
      className="glass-panel relative rounded-2xl p-5 overflow-hidden"
      style={{ animation: `card-enter 0.5s ${delay}ms cubic-bezier(0.34,1.1,0.64,1) both` }}
    >
      <AccentLine color={c} />
      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 pointer-events-none"
        style={{ background: `radial-gradient(circle,${c},transparent 70%)` }}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest t-sub">{label}</span>
        <div
          className="h-7 w-7 rounded-xl flex items-center justify-center"
          style={{ background: `${c}18`, border: `1px solid ${c}30` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: c }} />
        </div>
      </div>

      <div
        className="text-2xl font-black t-heading"
        style={{
          animation: `number-pop 0.5s ${delay + 150}ms ease both`,
          color: tone === "warn" && value !== "0" ? c : undefined,
        }}
      >
        {value}
      </div>

      {}
      <div
        className="mt-3 h-0.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: "60%",
            background: `linear-gradient(90deg,${c}60,${c})`,
            animation: `bar-fill 1s ${delay + 300}ms ease both`,
          }}
        />
      </div>
    </div>
  );
}

function ChartPanel({
  title,
  subtitle,
  children,
  accentColor,
  delay,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accentColor: string;
  delay: number;
  className?: string;
}) {
  return (
    <div
      className={`glass-panel relative rounded-2xl overflow-hidden ${className}`}
      style={{ animation: `card-enter 0.5s ${delay}ms ease both` }}
    >
      <AccentLine color={accentColor} />
      <div
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: `radial-gradient(circle,${accentColor},transparent 70%)` }}
      />
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-6 rounded-full"
            style={{ background: `linear-gradient(90deg,${accentColor}80,${accentColor})` }}
          />
          <span className="text-xs font-black t-heading">{title}</span>
        </div>
        {subtitle && <p className="text-[11px] t-sub mt-0.5 ml-8">{subtitle}</p>}
      </div>
      <div className="relative p-5">{children}</div>
    </div>
  );
}

function TablePanel({
  title,
  subtitle,
  accentColor,
  delay,
  children,
}: {
  title: string;
  subtitle?: string;
  accentColor: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="glass-panel relative rounded-2xl overflow-hidden"
      style={{ animation: `card-enter 0.5s ${delay}ms ease both` }}
    >
      <AccentLine color={accentColor} />
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-6 rounded-full"
            style={{ background: `linear-gradient(90deg,${accentColor}80,${accentColor})` }}
          />
          <span className="text-xs font-black t-heading">{title}</span>
        </div>
        {subtitle && <p className="text-[11px] t-sub mt-0.5 ml-8">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(10,10,18,0.95)",
  border: "1px solid rgba(99,102,241,0.25)",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
};

function UsagePage() {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [days, setDays] = useState(30);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [pngBusy, setPngBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const checkAdmin = useServerFn(isAdminFn);
  const analyticsFn = useServerFn(getApiUsageAnalytics);

  const access = useQuery({
    queryKey: ["admin-access"],
    queryFn: () => checkAdmin(),
  });

  const queryKey =
    mode === "preset"
      ? (["admin-usage", "preset", days] as const)
      : (["admin-usage", "custom", startDate?.toISOString(), endDate?.toISOString()] as const);

  const q = useQuery({
    queryKey,
    queryFn: () => {
      if (mode === "preset") return analyticsFn({ data: { days } });
      const s = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
      const e = endDate ? format(endDate, "yyyy-MM-dd") : undefined;
      return analyticsFn({ data: { startDate: s, endDate: e } });
    },
    enabled: access.data?.isAdmin === true,
  });

  if (access.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-xs t-sub animate-pulse">Checking access…</div>
      </div>
    );
  }

  if (!access.data?.isAdmin) {
    return (
      <div className="mx-auto max-w-sm glass-panel rounded-2xl p-10 text-center space-y-4">
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <ShieldAlert className="h-7 w-7 text-red-400" />
        </div>
        <div>
          <h2 className="text-base font-black t-heading">Admins only</h2>
          <p className="text-xs t-sub mt-1">You don't have permission to view this page.</p>
        </div>
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
    for (const day of d.perDay)
      rows.push([
        day.date,
        String(day.requests),
        String(day.tokens),
        String(day.cost.toFixed(6)),
        String(day.errors),
      ]);
    rows.push([]);
    rows.push(["Endpoint", "Requests", "Tokens", "Cost USD", "Avg Latency (ms)", "Errors"]);
    for (const e of d.byEndpoint)
      rows.push([
        e.endpoint,
        String(e.requests),
        String(e.tokens),
        String(e.cost.toFixed(6)),
        String(e.avgMs),
        String(e.errors),
      ]);
    rows.push([]);
    rows.push(["Model", "Requests", "Tokens", "Cost USD"]);
    for (const m of d.byModel)
      rows.push([m.model, String(m.requests), String(m.tokens), String(m.cost.toFixed(6))]);
    rows.push([]);
    rows.push(["User", "Email", "Requests", "Tokens", "Cost USD"]);
    for (const u of d.topUsers)
      rows.push([
        u.profile?.name ?? u.user_id,
        u.profile?.email ?? "",
        String(u.requests),
        String(u.tokens),
        String(u.cost.toFixed(6)),
      ]);

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const suf = mode === "preset" ? `${d.days}d` : `${d.startDate}_${d.endDate}`;
    a.href = url;
    a.download = `devai-usage-${suf}.csv`;
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
    const suf = mode === "preset" ? `${d.days}d` : `${d.startDate}_${d.endDate}`;
    a.href = url;
    a.download = `devai-usage-${suf}.json`;
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
      const suf = mode === "preset" ? `${d.days}d` : `${d.startDate}_${d.endDate}`;
      a.href = dataUrl;
      a.download = `devai-usage-charts-${suf}.png`;
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
    <>
      <style>{STYLES}</style>
      <BackgroundOrbs />

      <div
        className="space-y-8 pb-16"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(14px)",
          transition: "all 0.55s cubic-bezier(0.34,1.1,0.64,1)",
        }}
      >
        {}
        <header className="space-y-4 pt-1">
          {}
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold t-sub hover:text-indigo-400 transition-colors"
            style={{ animation: "fade-in 0.4s ease both" }}
          >
            <ArrowLeft className="h-3 w-3" />
            Admin
          </Link>

          <div style={{ animation: "fade-up 0.5s 0.05s ease both" }}>
            {}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit mb-3"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              <BarChart3 className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Admin · API Analytics
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none t-heading">
              Usage
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg,#818cf8 0%,#a78bfa 45%,#34d399 100%)",
                }}
              >
                analytics
              </span>
            </h1>
            <p className="text-sm t-sub mt-2 max-w-md leading-relaxed">
              AI requests, token consumption, and estimated costs across all endpoints.
            </p>
          </div>
        </header>

        {}
        <div
          className="flex flex-wrap items-center gap-3"
          style={{ animation: "fade-up 0.5s 0.15s ease both" }}
        >
          {}
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {PRESETS.map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  setMode("preset");
                  setDays(r.value);
                }}
                className={`preset-btn ${mode === "preset" && days === r.value ? "preset-btn-active" : ""}`}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => setMode("custom")}
              className={`preset-btn ${isCustomActive ? "preset-btn-active" : ""}`}
            >
              Custom
            </button>
          </div>

          {}
          {isCustomActive && (
            <div
              className="flex items-center gap-2"
              style={{ animation: "fade-in 0.3s ease both" }}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 rounded-lg text-[11px] font-bold border-white/10 bg-white/[0.04]",
                      !startDate && "text-white/30",
                    )}
                  >
                    <CalendarIcon className="mr-1.5 h-3 w-3" />
                    {startDate ? format(startDate, "MMM d, yyyy") : "Start"}
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

              <span className="text-[11px] t-sub">→</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 rounded-lg text-[11px] font-bold border-white/10 bg-white/[0.04]",
                      !endDate && "text-white/30",
                    )}
                  >
                    <CalendarIcon className="mr-1.5 h-3 w-3" />
                    {endDate ? format(endDate, "MMM d, yyyy") : "End"}
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

              <button
                disabled={!startDate || !endDate || q.isFetching}
                onClick={() => q.refetch()}
                className="preset-btn preset-btn-active disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ padding: "5px 16px" }}
              >
                Apply
              </button>
            </div>
          )}

          {}
          <div className="h-6 w-px divider-line" />

          {}
          <button className="export-btn" disabled={!d || q.isLoading} onClick={exportCsv}>
            <Download className="h-3 w-3" /> CSV
          </button>
          <button className="export-btn" disabled={!d || q.isLoading} onClick={exportJson}>
            <FileJson className="h-3 w-3" /> JSON
          </button>
          <button
            className="export-btn"
            disabled={!d || q.isLoading || pngBusy}
            onClick={exportPng}
          >
            <ImageIcon className="h-3 w-3" />
            {pngBusy ? "Rendering…" : "PNG"}
          </button>
        </div>

        {}
        {isCustomActive && d?.startDate && d?.endDate && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold t-sub"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              animation: "fade-in 0.3s ease both",
            }}
          >
            <CalendarIcon className="h-3 w-3" />
            {d.startDate} → {d.endDate}
          </div>
        )}

        {}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Requests"
            value={fmtInt(d?.totals.requests ?? 0)}
            icon={Activity}
            color="#6366f1"
            glow="#6366f140"
            delay={0}
          />
          <StatCard
            label="Tokens"
            value={fmtInt(d?.totals.tokens ?? 0)}
            icon={Zap}
            color="#8b5cf6"
            glow="#8b5cf640"
            delay={60}
          />
          <StatCard
            label="Est. cost"
            value={fmtUSD(d?.totals.cost ?? 0)}
            icon={DollarSign}
            color="#10b981"
            glow="#10b98140"
            delay={120}
          />
          <StatCard
            label="Errors"
            value={fmtInt(d?.totals.errors ?? 0)}
            icon={AlertTriangle}
            color="#f87171"
            glow="#ef444440"
            delay={180}
            tone={d && d.totals.errors > 0 ? "warn" : "default"}
          />
        </div>

        {}
        <div ref={chartsRef} className="space-y-5">
          {}
          <ChartPanel title="Requests per day" accentColor="#6366f1" delay={240}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d?.perDay ?? []}>
                  <defs>
                    <linearGradient id="g-req" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.22)"
                    fontSize={11}
                    fontWeight={700}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.22)"
                    fontSize={11}
                    fontWeight={700}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#g-req)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#818cf8" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartPanel>

          {}
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartPanel title="Tokens per day" accentColor="#8b5cf6" delay={300}>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d?.perDay ?? []}>
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.05)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.22)"
                      fontSize={11}
                      fontWeight={700}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.22)"
                      fontSize={11}
                      fontWeight={700}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="tokens" fill="#8b5cf6" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <ChartPanel title="Estimated cost per day" accentColor="#10b981" delay={360}>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d?.perDay ?? []}>
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.05)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.22)"
                      fontSize={11}
                      fontWeight={700}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.22)"
                      fontSize={11}
                      fontWeight={700}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                    />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtUSD(v)} />
                    <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>
          </div>
        </div>

        {}
        <TablePanel
          title="By endpoint"
          subtitle="Tokens, cost, and latency per AI endpoint"
          accentColor="#6366f1"
          delay={400}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Endpoint", "Requests", "Tokens", "Cost", "Avg latency", "Errors"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest t-sub ${i > 0 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(d?.byEndpoint ?? []).map((e, i) => (
                  <tr
                    key={e.endpoint}
                    className="table-row-hover border-b border-white/[0.04] transition-colors duration-150"
                    style={{ animation: `row-enter 0.35s ${i * 40}ms ease both` }}
                  >
                    <td className="px-5 py-3 text-xs font-bold t-heading font-mono">
                      {e.endpoint}
                    </td>
                    <td className="px-5 py-3 text-right text-xs t-body">{fmtInt(e.requests)}</td>
                    <td className="px-5 py-3 text-right text-xs t-body">{fmtInt(e.tokens)}</td>
                    <td
                      className="px-5 py-3 text-right text-xs font-bold"
                      style={{ color: "#34d399" }}
                    >
                      {fmtUSD(e.cost)}
                    </td>
                    <td className="px-5 py-3 text-right text-xs t-sub">{e.avgMs}ms</td>
                    <td className="px-5 py-3 text-right text-xs font-bold">
                      {e.errors > 0 ? (
                        <span style={{ color: "#f87171" }}>{e.errors}</span>
                      ) : (
                        <span className="t-sub">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!q.isLoading && !d?.byEndpoint?.length && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-xs t-sub">
                      No usage data for this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TablePanel>

        {}
        <div className="grid gap-5 lg:grid-cols-2">
          {}
          <TablePanel title="By model" accentColor="#8b5cf6" delay={460}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Model", "Requests", "Tokens", "Cost"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest t-sub ${i > 0 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(d?.byModel ?? []).map((m, i) => (
                    <tr
                      key={m.model}
                      className="table-row-hover border-b border-white/[0.04] transition-colors duration-150"
                      style={{ animation: `row-enter 0.35s ${i * 40}ms ease both` }}
                    >
                      <td className="px-5 py-3 text-[11px] font-mono font-bold t-heading">
                        {m.model}
                      </td>
                      <td className="px-5 py-3 text-right text-xs t-body">{fmtInt(m.requests)}</td>
                      <td className="px-5 py-3 text-right text-xs t-body">{fmtInt(m.tokens)}</td>
                      <td
                        className="px-5 py-3 text-right text-xs font-bold"
                        style={{ color: "#34d399" }}
                      >
                        {fmtUSD(m.cost)}
                      </td>
                    </tr>
                  ))}
                  {!q.isLoading && !d?.byModel?.length && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-xs t-sub">
                        No model data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TablePanel>

          {}
          <TablePanel
            title="Top users"
            subtitle="By AI request volume"
            accentColor="#f59e0b"
            delay={500}
          >
            <ul>
              {(d?.topUsers ?? []).map((u: any, i: number) => (
                <li
                  key={u.user_id}
                  className="table-row-hover flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04] transition-colors duration-150"
                  style={{ animation: `row-enter 0.35s ${i * 40}ms ease both` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {}
                    {u.profile?.avatar_url ? (
                      <img
                        src={u.profile.avatar_url}
                        alt="User avatar"
                        className="h-8 w-8 rounded-full flex-shrink-0"
                        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                    ) : (
                      <div
                        className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black"
                        style={{
                          background: `linear-gradient(135deg,#6366f1,#8b5cf6)`,
                          color: "#fff",
                        }}
                      >
                        {(u.profile?.name ?? u.user_id ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold t-heading">
                        {u.profile?.name ?? u.profile?.email ?? "Unknown"}
                      </div>
                      <div className="truncate text-[11px] t-sub">
                        {u.profile?.email ?? u.user_id}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-xs font-black" style={{ color: "#818cf8" }}>
                      {fmtInt(u.requests)} req
                    </div>
                    <div className="text-[11px] t-sub">
                      {fmtInt(u.tokens)} tok · {fmtUSD(u.cost)}
                    </div>
                  </div>
                </li>
              ))}
              {!q.isLoading && !d?.topUsers?.length && (
                <li className="px-5 py-10 text-center text-xs t-sub">No user data yet.</li>
              )}
            </ul>
          </TablePanel>
        </div>
      </div>
    </>
  );
}
