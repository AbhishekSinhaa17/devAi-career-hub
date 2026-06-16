import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
import { analyzeJobMatch, getJobMatchesHistory, generateDeveloperScore } from "@/lib/ai.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Sparkles,
  UploadCloud,
  FileText,
  Target,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  TrendingUp,
  Zap,
  History,
  ChevronRight,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

export const Route = createFileRoute("/_authenticated/job-match")({
  head: () => ({ meta: [{ title: "Job Match Analyzer — DevAI" }] }),
  component: Page,
});

// ─── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  @keyframes float-orb {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(25px,-18px) scale(1.04); }
    66%      { transform: translate(-12px,14px) scale(0.97); }
  }
  @keyframes shimmer {
    from { transform: translateX(-100%); }
    to   { transform: translateX(100%); }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes card-enter {
    from { opacity:0; transform:translateY(14px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes score-count {
    from { opacity:0; transform:scale(0.6) translateY(10px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes ring-fill {
    from { stroke-dashoffset: 251; }
  }
  @keyframes tag-pop {
    from { opacity:0; transform:scale(0.75) translateY(4px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { transform:scale(1);   opacity:0.5; }
    100% { transform:scale(1.7); opacity:0; }
  }
  @keyframes upload-bounce {
    0%,100% { transform:translateY(0); }
    50%      { transform:translateY(-6px); }
  }
  @keyframes border-glow {
    0%,100% { opacity:0.5; }
    50%      { opacity:1; }
  }
  @keyframes progress-bar {
    from { width:0%; }
  }
  @keyframes row-enter {
    from { opacity:0; transform:translateX(-8px); }
    to   { opacity:1; transform:translateX(0); }
  }

  .btn-primary-glow {
    box-shadow: 0 0 24px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.2);
    transition: box-shadow 0.3s, transform 0.15s, opacity 0.2s;
  }
  .btn-primary-glow:hover:not(:disabled) {
    box-shadow: 0 0 40px rgba(99,102,241,0.55), 0 6px 20px rgba(0,0,0,0.3);
  }
  .btn-primary-glow:active:not(:disabled) { transform:scale(0.97); }

  .glass-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
  }
  .dark .glass-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
  }
  /* light mode override */
  :root:not(.dark) .glass-panel {
    background: rgba(255,255,255,0.7);
    border: 1px solid rgba(0,0,0,0.08);
  }

  .score-ring-track { stroke: rgba(255,255,255,0.08); }
  :root:not(.dark) .score-ring-track { stroke: rgba(0,0,0,0.08); }

  .upload-dashed-dark {
    border: 2px dashed rgba(255,255,255,0.12);
  }
  :root:not(.dark) .upload-dashed-dark {
    border: 2px dashed rgba(0,0,0,0.15);
  }
  .upload-dashed-active {
    border: 2px dashed rgba(99,102,241,0.5) !important;
    background: rgba(99,102,241,0.04);
  }

  .history-row:hover { background: rgba(255,255,255,0.03); }
  :root:not(.dark) .history-row:hover { background: rgba(0,0,0,0.02); }

  .text-heading { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .text-heading { color: rgba(0,0,0,0.88); }
  .text-sub { color: rgba(255,255,255,0.45); }
  :root:not(.dark) .text-sub { color: rgba(0,0,0,0.45); }
  .text-body { color: rgba(255,255,255,0.65); }
  :root:not(.dark) .text-body { color: rgba(0,0,0,0.65); }

  .divider { background: rgba(255,255,255,0.06); }
  :root:not(.dark) .divider { background: rgba(0,0,0,0.07); }
`;

// ─── Background orbs ───────────────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden>
      {[
        { c: "#6366f1", s: 500, x: "5%", y: "5%", d: "0s", t: "18s" },
        { c: "#8b5cf6", s: 350, x: "75%", y: "10%", d: "7s", t: "22s" },
        { c: "#10b981", s: 280, x: "80%", y: "65%", d: "14s", t: "20s" },
        { c: "#f59e0b", s: 220, x: "2%", y: "72%", d: "3s", t: "25s" },
      ].map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.s,
            height: o.s,
            left: o.x,
            top: o.y,
            background: `radial-gradient(circle, ${o.c}, transparent 70%)`,
            opacity: 0.055,
            animation: `float-orb ${o.t} ${o.d} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Accent top-border line ────────────────────────────────────────────────────

function AccentLine({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg,transparent,${color}70,transparent)` }}
    />
  );
}

// ─── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({
  score,
  color,
  size = 80,
  delay = 0,
}: {
  score: number;
  color: string;
  size?: number;
  delay?: number;
}) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="block">
      <circle cx="40" cy="40" r={r} fill="none" strokeWidth="6" className="score-ring-track" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        strokeWidth="6"
        stroke={color}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
        style={{
          animation: `ring-fill 1s ${delay}ms cubic-bezier(0.34,1.1,0.64,1) both`,
          filter: `drop-shadow(0 0 6px ${color}60)`,
          transition: "stroke-dashoffset 0.8s ease",
        }}
      />
      <text
        x="40"
        y="44"
        textAnchor="middle"
        fontSize="15"
        fontWeight="800"
        fill={color}
        style={{ animation: `score-count 0.5s ${delay + 200}ms ease both` }}
      >
        {score}
      </text>
    </svg>
  );
}

// ─── Score card ────────────────────────────────────────────────────────────────

function ScoreCard({
  title,
  score,
  subtitle,
  color,
  icon: Icon,
  delay,
}: {
  title: string;
  score: number;
  subtitle: string;
  color: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <div
      className="glass-panel relative rounded-2xl p-5 flex flex-col items-center gap-3 overflow-hidden"
      style={{ animation: `card-enter 0.5s ${delay}ms cubic-bezier(0.34,1.1,0.64,1) both` }}
    >
      <AccentLine color={color} />
      <div
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 pointer-events-none"
        style={{ background: `radial-gradient(circle,${color},transparent 70%)` }}
      />

      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sub">
        <Icon className="h-3 w-3" style={{ color }} />
        {title}
      </div>

      <ScoreRing score={score} color={color} delay={delay} />

      <div className="text-[11px] text-sub font-medium">{subtitle}</div>

      {/* mini bar */}
      <div
        className="w-full h-1 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg,${color}80,${color})`,
            animation: `progress-bar 1s ${delay + 300}ms ease both`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Skill tag ─────────────────────────────────────────────────────────────────

function SkillTag({
  label,
  color,
  bg,
  border,
  delay,
}: {
  label: string;
  color: string;
  bg: string;
  border: string;
  delay: number;
}) {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-default transition-all duration-200"
      style={{
        color,
        background: bg,
        border: `1px solid ${border}`,
        animation: `tag-pop 0.4s ${delay}ms cubic-bezier(0.34,1.2,0.64,1) both`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 12px ${border}`;
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
      }}
    >
      {label}
    </span>
  );
}

// ─── List panel ────────────────────────────────────────────────────────────────

function ListPanel({
  icon: Icon,
  title,
  items,
  dot,
  accent,
  topBorder,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  dot: string;
  accent: string;
  topBorder: string;
  delay: number;
}) {
  return (
    <div
      className="glass-panel relative rounded-2xl p-5 space-y-4 overflow-hidden"
      style={{
        borderTop: `2px solid ${topBorder}`,
        animation: `card-enter 0.5s ${delay}ms cubic-bezier(0.34,1.1,0.64,1) both`,
      }}
    >
      <div
        className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle,${topBorder},transparent 70%)` }}
      />
      <div className="flex items-center gap-2">
        <div
          className="h-7 w-7 rounded-xl flex items-center justify-center"
          style={{ background: `${topBorder}18`, border: `1px solid ${topBorder}30` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: topBorder }} />
        </div>
        <span className="text-sm font-black text-heading">{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((s, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-xs text-body leading-relaxed"
            style={{ animation: `fade-in 0.3s ${delay + i * 40}ms ease both` }}
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ background: dot, boxShadow: `0 0 4px ${dot}60` }}
            />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

function Page() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const queryClient = useQueryClient();
  const analyzeFn = useServerFn(analyzeJobMatch);
  const getHistoryFn = useServerFn(getJobMatchesHistory);
  const genDevScoreFn = useServerFn(generateDeveloperScore);

  const historyQ = useQuery({
    queryKey: ["job-matches-history"],
    queryFn: () => getHistoryFn(),
  });

  const mutation = useMutation({
    mutationFn: () =>
      analyzeFn({
        data: {
          resumeText,
          resumeFileName: resumeFile?.name ?? "Resume",
          jobRole,
          jobDescription,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-matches-history"] });
      genDevScoreFn({ data: undefined }).catch(console.error);
      toast.success("Analysis complete!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function extractPdf(file: File) {
    setResumeFile(file);
    setIsExtracting(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      setResumeText(text);
      toast.success("Resume extracted!");
    } catch {
      toast.error("Failed to extract PDF text.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("PDF only.");
      return;
    }
    await extractPdf(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("PDF only.");
      return;
    }
    extractPdf(file);
  }

  function handleAnalyze() {
    if (!resumeText) return toast.error("Upload a resume first.");
    if (!jobRole.trim()) return toast.error("Enter the target job role.");
    if (!jobDescription.trim()) return toast.error("Paste the job description.");
    mutation.mutate();
  }

  function handleReset() {
    setResumeFile(null);
    setResumeText("");
    setJobRole("");
    setJobDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    mutation.reset();
  }

  const result = mutation.data;
  const skillMatch = result
    ? Math.round(
        (result.matchingSkills.length /
          Math.max(result.matchingSkills.length + result.missingSkills.length, 1)) *
          100,
      )
    : 0;

  const canAnalyze =
    !mutation.isPending && !isExtracting && !!resumeFile && !!jobRole && !!jobDescription;

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
        {/* ── Header ── */}
        <header className="space-y-4 pt-1">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              animation: "fade-up 0.5s 0.05s ease both",
            }}
          >
            <Zap className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              AI Job Match Analyzer
            </span>
          </div>

          <div style={{ animation: "fade-up 0.5s 0.1s ease both" }}>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-heading">
              Find your
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg,#818cf8 0%,#a78bfa 45%,#34d399 100%)",
                }}
              >
                perfect match
              </span>
            </h1>
          </div>

          <p
            className="text-sm text-sub max-w-md leading-relaxed"
            style={{ animation: "fade-up 0.5s 0.15s ease both" }}
          >
            Upload your resume and paste a job description to instantly see your ATS score, skill
            gaps, and actionable improvements.
          </p>
        </header>

        {/* ── Input panels ── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Resume upload */}
          <div
            className="glass-panel relative rounded-2xl p-6 space-y-5 overflow-hidden"
            style={{ animation: "card-enter 0.5s 0.2s cubic-bezier(0.34,1.1,0.64,1) both" }}
          >
            <AccentLine color="#6366f1" />
            <div
              className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }}
            />

            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                <FileText className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-black text-heading">Your Resume</div>
                <div className="text-[11px] text-sub mt-0.5">PDF format only</div>
              </div>
            </div>

            {/* Drop zone */}
            <div
              className={`relative rounded-2xl transition-all duration-300 cursor-pointer ${dragOver ? "upload-dashed-active" : "upload-dashed-dark"} ${resumeFile ? "upload-dashed-active" : ""}`}
              style={{ minHeight: 180 }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />

              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                {resumeFile ? (
                  <>
                    <div
                      className="relative h-14 w-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.3)",
                      }}
                    >
                      {/* pulse */}
                      <div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          border: "1px solid rgba(99,102,241,0.4)",
                          animation: "pulse-ring 2s ease-out infinite",
                        }}
                      />
                      {isExtracting ? (
                        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                      ) : (
                        <FileText className="h-6 w-6 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-heading">{resumeFile.name}</p>
                      {isExtracting ? (
                        <p className="text-xs text-indigo-400 mt-1 animate-pulse">
                          Extracting text…
                        </p>
                      ) : (
                        <p className="text-xs text-sub mt-1">Click to replace</p>
                      )}
                    </div>
                    {!isExtracting && (
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: "rgba(16,185,129,0.1)",
                          border: "1px solid rgba(16,185,129,0.25)",
                          color: "#34d399",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }}
                        />
                        Ready
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        animation: dragOver
                          ? "upload-bounce 0.6s ease infinite"
                          : "upload-bounce 2s ease infinite",
                      }}
                    >
                      <UploadCloud className="h-6 w-6 text-sub" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-heading">Drop your PDF here</p>
                      <p className="text-xs text-sub mt-1">or click to browse files</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Job details */}
          <div
            className="glass-panel relative rounded-2xl p-6 space-y-5 overflow-hidden"
            style={{ animation: "card-enter 0.5s 0.28s cubic-bezier(0.34,1.1,0.64,1) both" }}
          >
            <AccentLine color="#8b5cf6" />
            <div
              className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }}
            />

            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                }}
              >
                <Briefcase className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <div className="text-sm font-black text-heading">Job Details</div>
                <div className="text-[11px] text-sub mt-0.5">Target role & description</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-sub flex items-center gap-1.5">
                  <Target className="h-3 w-3" />
                  Target Job Role
                </Label>
                <Input
                  placeholder="e.g. Senior Frontend Developer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="h-10 rounded-xl text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-sub flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  Job Description
                </Label>
                <Textarea
                  placeholder="Paste the full job description here…"
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="rounded-xl text-sm resize-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA row ── */}
        <div
          className="flex items-center justify-between gap-4 flex-wrap"
          style={{ animation: "fade-up 0.5s 0.35s ease both" }}
        >
          {/* Status pill */}
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-400"
            style={{
              background: mutation.isPending
                ? "rgba(99,102,241,0.1)"
                : result
                  ? "rgba(16,185,129,0.1)"
                  : "rgba(255,255,255,0.04)",
              border: mutation.isPending
                ? "1px solid rgba(99,102,241,0.3)"
                : result
                  ? "1px solid rgba(16,185,129,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
              color: mutation.isPending ? "#818cf8" : result ? "#34d399" : "rgba(255,255,255,0.35)",
            }}
          >
            {mutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            {result && !mutation.isPending && (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }}
              />
            )}
            {mutation.isPending
              ? "Analyzing with AI…"
              : result
                ? "Analysis ready"
                : "Configure inputs above"}
          </div>

          <div className="flex items-center gap-3">
            {result && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-all duration-200 text-sub hover:text-heading"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Start Over
              </button>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="btn-primary-glow relative flex items-center gap-2.5 h-11 px-6 rounded-xl font-black text-sm text-white overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none group/btn"
              style={{
                background: "linear-gradient(135deg,#4f46e5,#7c3aed 60%,#6366f1)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none -skew-x-12"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",
                  animation: canAnalyze ? "shimmer 2.5s ease infinite" : "none",
                }}
              />
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin relative z-10" />
                  <span className="relative z-10">Analyzing…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 relative z-10 group-hover/btn:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Analyze Job Match</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Results ── */}
        {result && !mutation.isPending && (
          <div className="space-y-6" style={{ animation: "fade-up 0.5s ease both" }}>
            {/* Summary banner */}
            <div
              className="glass-panel relative rounded-2xl p-6 overflow-hidden"
              style={{ animation: "card-enter 0.5s ease both" }}
            >
              <AccentLine color="#818cf8" />
              <div
                className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }}
              />
              <div className="relative text-center space-y-2 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div
                    className="h-8 w-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.3)",
                    }}
                  >
                    <Award className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-black text-heading">Match Analysis</span>
                </div>
                <p className="text-sm text-body leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Score cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <ScoreCard
                title="ATS Score"
                score={result.atsScore}
                subtitle="Resume parsing"
                color="#6366f1"
                icon={Zap}
                delay={0}
              />
              <ScoreCard
                title="Hire Probability"
                score={result.hiringProbability}
                subtitle="Overall fit"
                color="#8b5cf6"
                icon={TrendingUp}
                delay={80}
              />
              <ScoreCard
                title="Interview Ready"
                score={result.interviewReadiness}
                subtitle="Preparedness"
                color="#10b981"
                icon={CheckCircle2}
                delay={160}
              />
              <ScoreCard
                title="Skill Match"
                score={skillMatch}
                subtitle="Keywords found"
                color="#f59e0b"
                icon={Target}
                delay={240}
              />
            </div>

            {/* Strengths / Weaknesses */}
            <div className="grid gap-5 md:grid-cols-2">
              <ListPanel
                icon={CheckCircle2}
                title="Key Strengths"
                items={result.strengths}
                dot="#10b981"
                accent="#10b981"
                topBorder="#10b981"
                delay={80}
              />
              <ListPanel
                icon={AlertCircle}
                title="Critical Weaknesses"
                items={result.weaknesses}
                dot="#ef4444"
                accent="#ef4444"
                topBorder="#ef4444"
                delay={160}
              />
            </div>

            {/* Skills */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Matched */}
              <div
                className="glass-panel relative rounded-2xl p-5 space-y-4 overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.24s ease both" }}
              >
                <AccentLine color="#10b981" />
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-black text-heading">Matched Skills</span>
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      color: "#34d399",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    {result.matchingSkills.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills.length > 0 ? (
                    result.matchingSkills.map((s, i) => (
                      <SkillTag
                        key={s}
                        label={s}
                        color="#34d399"
                        bg="rgba(16,185,129,0.1)"
                        border="rgba(16,185,129,0.25)"
                        delay={i * 35}
                      />
                    ))
                  ) : (
                    <span className="text-xs text-sub">No matching skills found.</span>
                  )}
                </div>
              </div>

              {/* Missing */}
              <div
                className="glass-panel relative rounded-2xl p-5 space-y-4 overflow-hidden"
                style={{ animation: "card-enter 0.5s 0.32s ease both" }}
              >
                <AccentLine color="#f59e0b" />
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(245,158,11,0.15)",
                      border: "1px solid rgba(245,158,11,0.3)",
                    }}
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <span className="text-xs font-black text-heading">Missing Skills</span>
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(245,158,11,0.1)",
                      color: "#fbbf24",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}
                  >
                    {result.missingSkills.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.length > 0 ? (
                    result.missingSkills.map((s, i) => (
                      <SkillTag
                        key={s}
                        label={s}
                        color="#fbbf24"
                        bg="rgba(245,158,11,0.1)"
                        border="rgba(245,158,11,0.25)"
                        delay={i * 35}
                      />
                    ))
                  ) : (
                    <span className="text-xs text-sub">No missing skills — great match!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div
              className="glass-panel relative rounded-2xl p-6 space-y-5 overflow-hidden"
              style={{ animation: "card-enter 0.5s 0.4s ease both" }}
            >
              <AccentLine color="#6366f1" />
              <div
                className="absolute -right-12 -bottom-12 h-32 w-32 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }}
              />
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  <Target className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-heading">Actionable Suggestions</div>
                  <div className="text-[11px] text-sub mt-0.5">
                    Steps to improve your match score
                  </div>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {result.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl transition-colors duration-200"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      animation: `fade-in 0.3s ${i * 50}ms ease both`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.25)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                    }}
                  >
                    <div
                      className="mt-0.5 h-5 w-5 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                      style={{
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        color: "#818cf8",
                      }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs text-body leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── History ── */}
        <div className="space-y-4" style={{ animation: "fade-up 0.5s 0.4s ease both" }}>
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <History className="h-4 w-4 text-sub" />
            </div>
            <h2 className="text-base font-black text-heading">Analysis History</h2>
            <div className="flex-1 h-px divider" />
            {historyQ.data && (
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                {historyQ.data.length} records
              </span>
            )}
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            {/* Table header */}
            <div
              className="grid grid-cols-4 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-sub"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span>Date</span>
              <span>Job Role</span>
              <span>Resume</span>
              <span>ATS Score</span>
            </div>

            {historyQ.isLoading ? (
              <div className="px-5 py-8 text-center text-sm text-sub animate-pulse">
                Loading history…
              </div>
            ) : !historyQ.data?.length ? (
              <div className="px-5 py-10 flex flex-col items-center gap-2 text-center">
                <History className="h-8 w-8 text-sub opacity-40" />
                <p className="text-sm text-sub">No past analyses yet.</p>
              </div>
            ) : (
              historyQ.data.map((item, i) => {
                const score = item.ats_score;
                const scoreColor = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";
                const scoreBg =
                  score >= 80
                    ? "rgba(16,185,129,0.1)"
                    : score >= 60
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(239,68,68,0.1)";

                return (
                  <div
                    key={item.id}
                    className="history-row grid grid-cols-4 items-center px-5 py-4 transition-colors duration-200 cursor-default"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      animation: `row-enter 0.4s ${i * 50}ms ease both`,
                    }}
                  >
                    <span className="text-xs text-sub">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-semibold text-heading truncate pr-2">
                      {item.job_role}
                    </span>
                    <span className="text-xs text-sub truncate pr-2">{item.resume_file_name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{
                          background: scoreBg,
                          color: scoreColor,
                          border: `1px solid ${scoreColor}30`,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: scoreColor }}
                        />
                        {score}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-sub opacity-40" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
