import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getGlobalAnalytics } from "@/lib/analytics.functions";
import { useState, useRef } from "react";
import {
  PageLoadingState,
  PageEmptyState,
} from "@/components/LoadingStates";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Download,
  FileText,
  Users,
  Activity,
  Cpu,
  TrendingUp,
  Zap,
  BarChart3,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Platform Analytics — DevAI Admin" }] }),
  errorComponent: RouteErrorBoundary,
  component: AdminAnalyticsPage,
});

// Vibrant colors for charts
const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#3b82f6"];

function AdminAnalyticsPage() {
  const fetchAnalytics = useServerFn(getGlobalAnalytics);
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => fetchAnalytics({ data: { days } }),
  });

  const exportCSV = () => {
    if (!data) return;
    const headers = ["Feature", "Total Usage", "Last 30 Days", "Prev 30 Days", "Growth %", "Percentage %"];
    const rows = data.features.map((f: any) => [
      f.name,
      f.count,
      f.last30Days,
      f.prev30Days,
      f.growth.toFixed(1),
      f.percentage.toFixed(1)
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((e: any) => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `devai-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <PageLoadingState
        title="Loading Analytics..."
        subtitle="Crunching numbers across the platform."
      />
    );
  }

  if (error || !data) {
    return (
      <PageEmptyState
        title="Failed to load analytics"
        subtitle={error?.message || "An unknown error occurred while fetching platform data."}
        icon={Activity}
      />
    );
  }

  // Memoize data for pie chart
  const pieData = data.features.map((f: any) => ({
    name: f.name,
    value: f.count,
  })).filter((f: any) => f.value > 0);

  return (
    <div className="space-y-8 min-h-screen text-slate-900 dark:text-foreground print:text-black" ref={dashboardRef}>
      
      {/* ── Header & Controls ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/20 bg-pink-500/5">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest">
                Platform Analytics
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          {/* Days Filter */}
          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/40">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d as 7 | 30 | 90)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  days === d
                    ? "bg-white dark:bg-[#1a1a2e] text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-border/40 hover:bg-muted/50 transition-colors"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <FileText className="h-4 w-4" /> PDF Report
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Users", value: data.kpis.totalUsers, icon: Users, color: "text-blue-500" },
          { label: `Active (${days}d)`, value: data.kpis.activeUsers7d, icon: Activity, color: "text-green-500" },
          { label: "Total AI Req", value: data.kpis.totalAiRequests, icon: Cpu, color: "text-indigo-500" },
          { label: "Avg Req/User", value: data.kpis.avgAiRequestsPerUser.toFixed(1), icon: BarChart3, color: "text-purple-500" },
          { label: "Most Used", value: data.kpis.mostUsedFeature, icon: Zap, color: "text-amber-500" },
          { label: "Fastest Growth", value: data.kpis.fastestGrowingFeature, icon: TrendingUp, color: "text-pink-500" },
        ].map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-muted/50 ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</h3>
            </div>
            <p className="text-2xl font-black truncate">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Feature Usage Distribution ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" /> Feature Performance Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Feature</th>
                  <th className="px-4 py-3">Total Usage</th>
                  <th className="px-4 py-3">Last {days}d</th>
                  <th className="px-4 py-3">% Share</th>
                  <th className="px-4 py-3 rounded-tr-xl">Growth</th>
                </tr>
              </thead>
              <tbody>
                {data.features.map((f: any, idx: number) => (
                  <tr key={idx} className="border-b border-border/20 hover:bg-muted/10">
                    <td className="px-4 py-4 font-semibold">{f.name}</td>
                    <td className="px-4 py-4">{f.count.toLocaleString()}</td>
                    <td className="px-4 py-4">{f.last30Days.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${f.percentage}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{f.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {f.growth > 0 ? (
                        <span className="text-green-500 font-bold">+{f.growth.toFixed(1)}%</span>
                      ) : f.growth < 0 ? (
                        <span className="text-red-500 font-bold">{f.growth.toFixed(1)}%</span>
                      ) : (
                        <span className="text-muted-foreground">0%</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300 flex flex-col">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-pink-500" /> Usage Distribution
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(13, 13, 26, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Daily Activity Trend ── */}
      <div className="p-6 rounded-2xl border border-border/40 bg-white/50 dark:bg-[#0d0d1a]/50 backdrop-blur-sm print:border-gray-300">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" /> Daily Activity Trend ({days} Days)
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(150,150,150,0.05)" }}
                contentStyle={{
                  backgroundColor: "rgba(13, 13, 26, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="total" name="AI Requests" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
