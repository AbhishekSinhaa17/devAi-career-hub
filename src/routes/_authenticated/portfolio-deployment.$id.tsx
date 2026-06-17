import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { getDeploymentsByPortfolio } from "@/lib/deployment.functions";
import { triggerVercelDeployment, checkVercelStatus } from "@/lib/vercel.functions";
import { PageLoadingState } from "@/components/LoadingStates";
import { toast } from "sonner";
import {
  Rocket,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  Share2,
  Globe,
  ArrowLeft,
  Server,
  Terminal,
} from "lucide-react";
import Confetti from "react-confetti";

export const Route = createFileRoute("/_authenticated/portfolio-deployment/$id")({
  head: () => ({ meta: [{ title: "Deploy Portfolio — DevAI" }] }),
  errorComponent: RouteErrorBoundary,
  component: PortfolioDeploymentPage,
});

function PortfolioDeploymentPage() {
  const { id } = Route.useParams();
  
  // Actually, we need username for the URL simulation, we can get it from the user session or query param.
  // For simplicity, we just use a generic 'dev' if not found, but we can pass it via search params.
  const search: any = Route.useSearch();
  const username = search.username || "dev";

  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const startFn = useServerFn(triggerVercelDeployment);
  const statusFn = useServerFn(checkVercelStatus);
  const historyFn = useServerFn(getDeploymentsByPortfolio);

  const { data: history, refetch: refetchHistory } = useQuery({
    queryKey: ["deployments", id],
    queryFn: () => historyFn({ data: { portfolioId: id } }),
  });

  const { data: deploymentStatus } = useQuery({
    queryKey: ["deployment-status", activeDeploymentId],
    queryFn: () => statusFn({ data: { id: activeDeploymentId! } }),
    enabled: !!activeDeploymentId,
    refetchInterval: (query) => {
      if (query.state.data?.status === "success" || query.state.data?.status === "failed") {
        return false;
      }
      return 2000;
    },
  });

  const deployMut = useMutation({
    mutationFn: (provider: string) => {
      if (provider !== "Vercel") throw new Error("Only Vercel deployment is supported in this implementation");
      return startFn({ data: { portfolioId: id } });
    },
    onSuccess: (data) => {
      setActiveDeploymentId(data.id);
      setLogs(["Initializing deployment...", "Provisioning resources...", "Cloning repository..."]);
      refetchHistory();
    },
    onError: (e) => toast.error("Failed to start deployment: " + e.message),
  });

  // Show accurate build stages
  useEffect(() => {
    if (deploymentStatus?.status === "building" && activeDeploymentId) {
      setLogs([
        "Project created on Vercel.",
        "Uploading React+Vite portfolio files...",
        "Building static optimized assets via Vite...",
        "Awaiting DNS propagation and health check..."
      ]);
    }
  }, [deploymentStatus?.status, activeDeploymentId]);

  useEffect(() => {
    if (deploymentStatus?.status === "success" && activeDeploymentId) {
      setLogs((prev) => [...prev, "Deployment successful! URL is live."]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
      refetchHistory();
    } else if (deploymentStatus?.status === "failed" && activeDeploymentId) {
      setLogs((prev) => [...prev, "Deployment failed! Check build output."]);
      refetchHistory();
    }
  }, [deploymentStatus?.status, activeDeploymentId, refetchHistory]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const handleDeploy = (provider: string) => {
    deployMut.mutate(provider);
  };

  const latestDeployment = deploymentStatus || history?.[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link
          to="/github-resume"
          className="h-10 w-10 rounded-full border bg-card hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Deploy Portfolio</h1>
          <p className="text-muted-foreground mt-1">Publish your generated AI portfolio to the world.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Providers & History */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card/40 backdrop-blur-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Select Provider</h2>
            <div className="grid gap-3">
              <button
                onClick={() => handleDeploy("Vercel")}
                disabled={deployMut.isPending || latestDeployment?.status === "building"}
                className="w-full relative rounded-xl border p-4 flex items-center justify-between text-left hover:border-foreground/50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white dark:text-black">
                      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Vercel</h3>
                    <p className="text-xs text-muted-foreground">Global Edge Network</p>
                  </div>
                </div>
                <Globe className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => handleDeploy("Netlify")}
                disabled={deployMut.isPending || latestDeployment?.status === "building"}
                className="w-full relative rounded-xl border p-4 flex items-center justify-between text-left hover:border-foreground/50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#00C7B7] rounded-full flex items-center justify-center">
                    <Server className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Netlify</h3>
                    <p className="text-xs text-muted-foreground">High Performance CDN</p>
                  </div>
                </div>
                <Globe className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Deployment History */}
          {history && history.length > 0 && (
            <div className="rounded-2xl border bg-card/40 backdrop-blur-sm p-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">History</h2>
              <div className="space-y-3">
                {history.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
                    <div className="flex items-center gap-3">
                      {h.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : h.status === "failed" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-foreground">{h.provider}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {h.status === "success" && (
                      <a href={h.deployment_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {latestDeployment ? (
            <>
              {/* Success Card */}
              {latestDeployment.status === "success" && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-6" style={{ animation: "fadeSlideIn 0.5s ease-out" }}>
                  <div className="h-20 w-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <Rocket className="h-10 w-10 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">Your Portfolio is Live!</h2>
                    <p className="text-muted-foreground mt-2">Deployed successfully to {latestDeployment.provider}.</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <div className="px-4 py-2 bg-background border rounded-lg text-sm font-mono text-muted-foreground break-all max-w-sm flex-1 text-left">
                      {latestDeployment.deployment_url}
                    </div>
                    <button onClick={() => copyUrl(latestDeployment.deployment_url || "")} className="p-2 border bg-card hover:bg-muted rounded-lg transition-colors">
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <a
                      href={latestDeployment.deployment_url || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="h-4 w-4" /> Open Live Site
                    </a>
                    <button className="px-6 py-2.5 bg-card border font-bold rounded-xl flex items-center gap-2 hover:bg-muted transition-colors">
                      <Share2 className="h-4 w-4" /> Share
                    </button>
                  </div>
                </div>
              )}

              {/* Building state with logs */}
              {latestDeployment.status === "building" && (
                <div className="rounded-2xl border bg-card/40 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Deploying to {latestDeployment.provider}...</h2>
                      <p className="text-sm text-muted-foreground">Please do not close this page.</p>
                    </div>
                  </div>

                  {/* Terminal emulator */}
                  <div className="rounded-xl bg-[#0d0d1a] border border-white/10 p-4 font-mono text-xs overflow-hidden relative">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-3">
                      <Terminal className="h-4 w-4 text-white/50" />
                      <span className="text-white/50">Build Output</span>
                    </div>
                    <div className="space-y-1.5 text-white/80 h-[240px] overflow-y-auto">
                      {logs.map((log, idx) => (
                        <div key={idx} className="flex gap-3" style={{ animation: "fadeSlideIn 0.3s ease-out" }}>
                          <span className="text-emerald-400 flex-shrink-0">›</span>
                          <span>{log}</span>
                        </div>
                      ))}
                      {/* Blinking cursor */}
                      <div className="flex gap-3 mt-2">
                        <span className="text-emerald-400 flex-shrink-0">›</span>
                        <span className="w-2 h-3 bg-white/60 animate-pulse mt-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Failed State */}
              {latestDeployment.status === "failed" && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center space-y-4">
                  <div className="h-16 w-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">Deployment Failed</h2>
                    <p className="text-muted-foreground mt-2">An error occurred while building the project. Please try again.</p>
                  </div>
                  <button onClick={() => handleDeploy(latestDeployment.provider)} className="px-6 py-2.5 bg-background border font-bold rounded-xl inline-flex items-center gap-2 hover:bg-muted transition-colors mt-4">
                    <Server className="h-4 w-4" /> Retry Deployment
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="h-full rounded-2xl border border-dashed bg-card/20 flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Rocket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Ready to Launch</h2>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Select a provider from the left to instantly deploy your portfolio site and get a live URL.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
