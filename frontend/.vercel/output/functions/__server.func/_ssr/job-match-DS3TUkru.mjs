import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQueryClient, a as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { h as analyzeJobMatch, i as getJobMatchesHistory, b as generateDeveloperScore } from "./ai.functions-CrNXurDM.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import { Z as Zap, F as FileText, K as LoaderCircle, au as CloudUpload, B as Briefcase, af as Target, av as RefreshCcw, S as Sparkles, ae as Award, k as TrendingUp, f as CircleCheck, ah as CircleAlert, aw as History, n as ChevronRight } from "../_libs/lucide-react.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "crypto";
import "async_hooks";
import "util";
import "stream";
import "../_libs/isbot.mjs";
import "./router-BcNxq6Cj.mjs";
import "./api-client-CbTdHRmP.mjs";
import "./server-CNwFEcD6.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/axios.mjs";
import "../_libs/form-data.mjs";
import "../_libs/combined-stream.mjs";
import "../_libs/delayed-stream.mjs";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "../_libs/mime-types.mjs";
import "../_libs/mime-db.mjs";
import "../_libs/asynckit.mjs";
import "../_libs/es-set-tostringtag.mjs";
import "../_libs/get-intrinsic.mjs";
import "../_libs/es-object-atoms.mjs";
import "../_libs/es-errors.mjs";
import "../_libs/math-intrinsics.mjs";
import "../_libs/gopd.mjs";
import "../_libs/es-define-property.mjs";
import "../_libs/has-symbols.mjs";
import "../_libs/get-proto.mjs";
import "../_libs/dunder-proto.mjs";
import "../_libs/call-bind-apply-helpers.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/hasown.mjs";
import "../_libs/has-tostringtag.mjs";
import "../_libs/proxy-from-env.mjs";
import "../_libs/https-proxy-agent.mjs";
import "net";
import "tls";
import "assert";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "os";
import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";
import "events";
import "http2";
import "../_libs/follow-redirects.mjs";
import "zlib";
import "../_libs/zod.mjs";
import "../_libs/sentry__node.mjs";
import "../_libs/sentry__core.mjs";
import "../_libs/sentry__node-core.mjs";
import "../_libs/sentry__opentelemetry.mjs";
import "../_libs/@opentelemetry/semantic-conventions+[...].mjs";
import "../_libs/opentelemetry__sdk-trace-base.mjs";
import "../_libs/opentelemetry__core.mjs";
import "../_libs/opentelemetry__resources.mjs";
import "node:events";
import "node:diagnostics_channel";
import "node:child_process";
import "node:fs";
import "node:os";
import "node:path";
import "node:util";
import "node:readline";
import "../_libs/opentelemetry__instrumentation.mjs";
import "../_libs/opentelemetry__api-logs.mjs";
import "require-in-the-middle";
import "import-in-the-middle";
import "node:http";
import "node:https";
import "node:worker_threads";
import "diagnostics_channel";
import "worker_threads";
import "node:zlib";
import "node:net";
import "node:tls";
import "module";
import "../_libs/sentry__server-utils.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
const pdfjsWorker = "/assets/pdf.worker-CPbhI6B3.mjs";
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
function BackgroundOrbs() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none fixed inset-0 overflow-hidden -z-10", "aria-hidden": true, children: [{
    c: "#6366f1",
    s: 500,
    x: "5%",
    y: "5%",
    d: "0s",
    t: "18s"
  }, {
    c: "#8b5cf6",
    s: 350,
    x: "75%",
    y: "10%",
    d: "7s",
    t: "22s"
  }, {
    c: "#10b981",
    s: 280,
    x: "80%",
    y: "65%",
    d: "14s",
    t: "20s"
  }, {
    c: "#f59e0b",
    s: 220,
    x: "2%",
    y: "72%",
    d: "3s",
    t: "25s"
  }].map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute rounded-full", style: {
    width: o.s,
    height: o.s,
    left: o.x,
    top: o.y,
    background: `radial-gradient(circle, ${o.c}, transparent 70%)`,
    opacity: 0.055,
    animation: `float-orb ${o.t} ${o.d} ease-in-out infinite`
  } }, i)) });
}
function AccentLine({
  color
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px pointer-events-none", style: {
    background: `linear-gradient(90deg,transparent,${color}70,transparent)`
  } });
}
function ScoreRing({
  score,
  color,
  size = 80,
  delay = 0
}) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - score / 100 * circ;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, viewBox: "0 0 80 80", className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "40", cy: "40", r, fill: "none", strokeWidth: "6", className: "score-ring-track" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "40", cy: "40", r, fill: "none", strokeWidth: "6", stroke: color, strokeLinecap: "round", strokeDasharray: circ, strokeDashoffset: offset, transform: "rotate(-90 40 40)", style: {
      animation: `ring-fill 1s ${delay}ms cubic-bezier(0.34,1.1,0.64,1) both`,
      filter: `drop-shadow(0 0 6px ${color}60)`,
      transition: "stroke-dashoffset 0.8s ease"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "40", y: "44", textAnchor: "middle", fontSize: "15", fontWeight: "800", fill: color, style: {
      animation: `score-count 0.5s ${delay + 200}ms ease both`
    }, children: score })
  ] });
}
function ScoreCard({
  title,
  score,
  subtitle,
  color,
  icon: Icon,
  delay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-5 flex flex-col items-center gap-3 overflow-hidden", style: {
    animation: `card-enter 0.5s ${delay}ms cubic-bezier(0.34,1.1,0.64,1) both`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 pointer-events-none", style: {
      background: `radial-gradient(circle,${color},transparent 70%)`
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sub", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3", style: {
        color
      } }),
      title
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreRing, { score, color, delay }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-sub font-medium", children: subtitle }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1 rounded-full overflow-hidden", style: {
      background: "rgba(255,255,255,0.06)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: {
      width: `${score}%`,
      background: `linear-gradient(90deg,${color}80,${color})`,
      animation: `progress-bar 1s ${delay + 300}ms ease both`
    } }) })
  ] });
}
function SkillTag({
  label,
  color,
  bg,
  border,
  delay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold cursor-default transition-all duration-200", style: {
    color,
    background: bg,
    border: `1px solid ${border}`,
    animation: `tag-pop 0.4s ${delay}ms cubic-bezier(0.34,1.2,0.64,1) both`
  }, onMouseEnter: (e) => {
    e.currentTarget.style.boxShadow = `0 0 12px ${border}`;
    e.currentTarget.style.transform = "scale(1.05)";
  }, onMouseLeave: (e) => {
    e.currentTarget.style.boxShadow = "none";
    e.currentTarget.style.transform = "scale(1)";
  }, children: label });
}
function ListPanel({
  icon: Icon,
  title,
  items,
  dot,
  accent,
  topBorder,
  delay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-5 space-y-4 overflow-hidden", style: {
    borderTop: `2px solid ${topBorder}`,
    animation: `card-enter 0.5s ${delay}ms cubic-bezier(0.34,1.1,0.64,1) both`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-8 -bottom-8 h-24 w-24 rounded-full opacity-10 pointer-events-none", style: {
      background: `radial-gradient(circle,${topBorder},transparent 70%)`
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 w-7 rounded-xl flex items-center justify-center", style: {
        background: `${topBorder}18`,
        border: `1px solid ${topBorder}30`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5", style: {
        color: topBorder
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-heading", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: items.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2.5 text-xs text-body leading-relaxed", style: {
      animation: `fade-in 0.3s ${delay + i * 40}ms ease both`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0", style: {
        background: dot,
        boxShadow: `0 0 4px ${dot}60`
      } }),
      s
    ] }, i)) })
  ] });
}
function Page() {
  const [resumeFile, setResumeFile] = reactExports.useState(null);
  const [resumeText, setResumeText] = reactExports.useState("");
  const [jobRole, setJobRole] = reactExports.useState("");
  const [jobDescription, setJobDescription] = reactExports.useState("");
  const [isExtracting, setIsExtracting] = reactExports.useState(false);
  const [mounted, setMounted] = reactExports.useState(false);
  const [dragOver, setDragOver] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);
  const queryClient = useQueryClient();
  const analyzeFn = useServerFn(analyzeJobMatch);
  const getHistoryFn = useServerFn(getJobMatchesHistory);
  const genDevScoreFn = useServerFn(generateDeveloperScore);
  const historyQ = useQuery({
    queryKey: ["job-matches-history"],
    queryFn: () => getHistoryFn()
  });
  const mutation = useMutation({
    mutationFn: () => analyzeFn({
      data: {
        resumeText,
        resumeFileName: resumeFile?.name ?? "Resume",
        jobRole,
        jobDescription
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["job-matches-history"]
      });
      genDevScoreFn({
        data: void 0
      }).catch(console.error);
      toast.success("Analysis complete!");
    },
    onError: (e) => toast.error(e.message)
  });
  async function extractPdf(file) {
    setResumeFile(file);
    setIsExtracting(true);
    try {
      const pdfjsLib = await import("../_libs/pdfjs-dist.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer
      }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }
      setResumeText(text);
      toast.success("Resume extracted!");
    } catch {
      toast.error("Failed to extract PDF text.");
    } finally {
      setIsExtracting(false);
    }
  }
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("PDF only.");
      return;
    }
    await extractPdf(file);
  }
  function handleDrop(e) {
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
  const skillMatch = result ? Math.round(result.matchingSkills.length / Math.max(result.matchingSkills.length + result.missingSkills.length, 1) * 100) : 0;
  const canAnalyze = !mutation.isPending && !isExtracting && !!resumeFile && !!jobRole && !!jobDescription;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: STYLES }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BackgroundOrbs, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 pb-16", style: {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "none" : "translateY(14px)",
      transition: "all 0.55s cubic-bezier(0.34,1.1,0.64,1)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "space-y-4 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit", style: {
          background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.25)",
          animation: "fade-up 0.5s 0.05s ease both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3 text-indigo-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-indigo-400", children: "AI Job Match Analyzer" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          animation: "fade-up 0.5s 0.1s ease both"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl sm:text-5xl font-black tracking-tight leading-none text-heading", children: [
          "Find your",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-clip-text text-transparent", style: {
            backgroundImage: "linear-gradient(135deg,#818cf8 0%,#a78bfa 45%,#34d399 100%)"
          }, children: "perfect match" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-sub max-w-md leading-relaxed", style: {
          animation: "fade-up 0.5s 0.15s ease both"
        }, children: "Upload your resume and paste a job description to instantly see your ATS score, skill gaps, and actionable improvements." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 space-y-5 overflow-hidden", style: {
          animation: "card-enter 0.5s 0.2s cubic-bezier(0.34,1.1,0.64,1) both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#6366f1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-10 pointer-events-none", style: {
            background: "radial-gradient(circle,#6366f1,transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0", style: {
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-indigo-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black text-heading", children: "Your Resume" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-sub mt-0.5", children: "PDF format only" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative rounded-2xl transition-all duration-300 cursor-pointer ${dragOver ? "upload-dashed-active" : "upload-dashed-dark"} ${resumeFile ? "upload-dashed-active" : ""}`, style: {
            minHeight: 180
          }, onClick: () => fileInputRef.current?.click(), onDragOver: (e) => {
            e.preventDefault();
            setDragOver(true);
          }, onDragLeave: () => setDragOver(false), onDrop: handleDrop, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "application/pdf", className: "hidden", ref: fileInputRef, onChange: handleFileUpload }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center justify-center gap-3 p-8 text-center", children: resumeFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-14 w-14 rounded-2xl flex items-center justify-center", style: {
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-2xl", style: {
                  border: "1px solid rgba(99,102,241,0.4)",
                  animation: "pulse-ring 2s ease-out infinite"
                } }),
                isExtracting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 text-indigo-400 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-6 w-6 text-indigo-400" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-heading", children: resumeFile.name }),
                isExtracting ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-indigo-400 mt-1 animate-pulse", children: "Extracting text…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-sub mt-1", children: "Click to replace" })
              ] }),
              !isExtracting && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold", style: {
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#34d399"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full", style: {
                  background: "#34d399",
                  boxShadow: "0 0 6px #34d399"
                } }),
                "Ready"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-2xl flex items-center justify-center", style: {
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                animation: dragOver ? "upload-bounce 0.6s ease infinite" : "upload-bounce 2s ease infinite"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "h-6 w-6 text-sub" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-heading", children: "Drop your PDF here" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-sub mt-1", children: "or click to browse files" })
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 space-y-5 overflow-hidden", style: {
          animation: "card-enter 0.5s 0.28s cubic-bezier(0.34,1.1,0.64,1) both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#8b5cf6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-10 pointer-events-none", style: {
            background: "radial-gradient(circle,#8b5cf6,transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0", style: {
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-4 w-4 text-violet-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black text-heading", children: "Job Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-sub mt-0.5", children: "Target role & description" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-[10px] font-bold uppercase tracking-widest text-sub flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-3 w-3" }),
                "Target Job Role"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Senior Frontend Developer", value: jobRole, onChange: (e) => setJobRole(e.target.value), className: "h-10 rounded-xl text-sm font-semibold", style: {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)"
              } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-[10px] font-bold uppercase tracking-widest text-sub flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }),
                "Job Description"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Paste the full job description here…", rows: 6, value: jobDescription, onChange: (e) => setJobDescription(e.target.value), className: "rounded-xl text-sm resize-none", style: {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)"
              } })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", style: {
        animation: "fade-up 0.5s 0.35s ease both"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-400", style: {
          background: mutation.isPending ? "rgba(99,102,241,0.1)" : result ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
          border: mutation.isPending ? "1px solid rgba(99,102,241,0.3)" : result ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)",
          color: mutation.isPending ? "#818cf8" : result ? "#34d399" : "rgba(255,255,255,0.35)"
        }, children: [
          mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
          result && !mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full", style: {
            background: "#34d399",
            boxShadow: "0 0 6px #34d399"
          } }),
          mutation.isPending ? "Analyzing with AI…" : result ? "Analysis ready" : "Configure inputs above"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          result && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleReset, className: "flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition-all duration-200 text-sub hover:text-heading", style: {
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)"
          }, onMouseEnter: (e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          }, onMouseLeave: (e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCcw, { className: "h-3.5 w-3.5" }),
            "Start Over"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleAnalyze, disabled: !canAnalyze, className: "btn-primary-glow relative flex items-center gap-2.5 h-11 px-6 rounded-xl font-black text-sm text-white overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none group/btn", style: {
            background: "linear-gradient(135deg,#4f46e5,#7c3aed 60%,#6366f1)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none -skew-x-12", style: {
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",
              animation: canAnalyze ? "shimmer 2.5s ease infinite" : "none"
            } }),
            mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin relative z-10" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10", children: "Analyzing…" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 relative z-10 group-hover/btn:rotate-12 transition-transform duration-300" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10", children: "Analyze Job Match" })
            ] })
          ] })
        ] })
      ] }),
      result && !mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", style: {
        animation: "fade-up 0.5s ease both"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 overflow-hidden", style: {
          animation: "card-enter 0.5s ease both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#818cf8" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-16 -bottom-16 h-48 w-48 rounded-full opacity-10 pointer-events-none", style: {
            background: "radial-gradient(circle,#6366f1,transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative text-center space-y-2 max-w-2xl mx-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center", style: {
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4 text-indigo-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-heading", children: "Match Analysis" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-body leading-relaxed", children: result.summary })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 grid-cols-2 lg:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { title: "ATS Score", score: result.atsScore, subtitle: "Resume parsing", color: "#6366f1", icon: Zap, delay: 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { title: "Hire Probability", score: result.hiringProbability, subtitle: "Overall fit", color: "#8b5cf6", icon: TrendingUp, delay: 80 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { title: "Interview Ready", score: result.interviewReadiness, subtitle: "Preparedness", color: "#10b981", icon: CircleCheck, delay: 160 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { title: "Skill Match", score: skillMatch, subtitle: "Keywords found", color: "#f59e0b", icon: Target, delay: 240 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListPanel, { icon: CircleCheck, title: "Key Strengths", items: result.strengths, dot: "#10b981", accent: "#10b981", topBorder: "#10b981", delay: 80 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListPanel, { icon: CircleAlert, title: "Critical Weaknesses", items: result.weaknesses, dot: "#ef4444", accent: "#ef4444", topBorder: "#ef4444", delay: 160 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-5 space-y-4 overflow-hidden", style: {
            animation: "card-enter 0.5s 0.24s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#10b981" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 rounded-lg flex items-center justify-center", style: {
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black text-heading", children: "Matched Skills" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full", style: {
                background: "rgba(16,185,129,0.1)",
                color: "#34d399",
                border: "1px solid rgba(16,185,129,0.2)"
              }, children: result.matchingSkills.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: result.matchingSkills.length > 0 ? result.matchingSkills.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkillTag, { label: s, color: "#34d399", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", delay: i * 35 }, s)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-sub", children: "No matching skills found." }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-5 space-y-4 overflow-hidden", style: {
            animation: "card-enter 0.5s 0.32s ease both"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#f59e0b" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 rounded-lg flex items-center justify-center", style: {
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)"
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 text-amber-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black text-heading", children: "Missing Skills" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full", style: {
                background: "rgba(245,158,11,0.1)",
                color: "#fbbf24",
                border: "1px solid rgba(245,158,11,0.2)"
              }, children: result.missingSkills.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: result.missingSkills.length > 0 ? result.missingSkills.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkillTag, { label: s, color: "#fbbf24", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", delay: i * 35 }, s)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-sub", children: "No missing skills — great match!" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel relative rounded-2xl p-6 space-y-5 overflow-hidden", style: {
          animation: "card-enter 0.5s 0.4s ease both"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccentLine, { color: "#6366f1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-12 -bottom-12 h-32 w-32 rounded-full opacity-10 pointer-events-none", style: {
            background: "radial-gradient(circle,#6366f1,transparent 70%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center", style: {
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 text-indigo-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black text-heading", children: "Actionable Suggestions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-sub mt-0.5", children: "Steps to improve your match score" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2.5 sm:grid-cols-2", children: result.suggestions.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-xl transition-colors duration-200", style: {
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            animation: `fade-in 0.3s ${i * 50}ms ease both`
          }, onMouseEnter: (e) => {
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)";
            e.currentTarget.style.background = "rgba(99,102,241,0.05)";
          }, onMouseLeave: (e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 h-5 w-5 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black", style: {
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#818cf8"
            }, children: i + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-body leading-relaxed", children: s })
          ] }, i)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", style: {
        animation: "fade-up 0.5s 0.4s ease both"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-xl flex items-center justify-center", style: {
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4 text-sub" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-black text-heading", children: "Analysis History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-px divider" }),
          historyQ.data && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold px-2.5 py-1 rounded-full", style: {
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.35)"
          }, children: [
            historyQ.data.length,
            " records"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel rounded-2xl overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-sub", style: {
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.06)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Job Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Resume" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "ATS Score" })
          ] }),
          historyQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-8 text-center text-sm text-sub animate-pulse", children: "Loading history…" }) : !historyQ.data?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-10 flex flex-col items-center gap-2 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-8 w-8 text-sub opacity-40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-sub", children: "No past analyses yet." })
          ] }) : historyQ.data.map((item, i) => {
            const score = item.ats_score;
            const scoreColor = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";
            const scoreBg = score >= 80 ? "rgba(16,185,129,0.1)" : score >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "history-row grid grid-cols-4 items-center px-5 py-4 transition-colors duration-200 cursor-default", style: {
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              animation: `row-enter 0.4s ${i * 50}ms ease both`
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-sub", children: new Date(item.created_at).toLocaleDateString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-heading truncate pr-2", children: item.job_role }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-sub truncate pr-2", children: item.resume_file_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold", style: {
                  background: scoreBg,
                  color: scoreColor,
                  border: `1px solid ${scoreColor}30`
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full", style: {
                    background: scoreColor
                  } }),
                  score
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5 text-sub opacity-40" })
              ] })
            ] }, item.id);
          })
        ] })
      ] })
    ] })
  ] });
}
export {
  Page as component
};
