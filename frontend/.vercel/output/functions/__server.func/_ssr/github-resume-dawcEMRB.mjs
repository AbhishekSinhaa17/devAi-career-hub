import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { d as generateGithubResume, s as saveResume, e as generateCoverLetter } from "./ai.functions-CrNXurDM.mjs";
import { s as setPortfolioVisibility } from "./deployment.functions-5Y9ujJlb.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { D as Dialog$1, b as DialogPortal$1, c as DialogContent$1, d as DialogClose, e as DialogTitle$1, f as DialogDescription$1, g as DialogOverlay$1 } from "../_libs/radix-ui__react-dialog.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import "../_libs/seroval.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import { an as WandSparkles, G as Github, K as LoaderCircle, S as Sparkles, ak as ExternalLink, ae as Award, f as CircleCheck, u as TriangleAlert, n as ChevronRight, Z as Zap, ao as Save, R as Rocket, ap as PenLine, aq as Download, F as FileText, A as ArrowRight, X } from "../_libs/lucide-react.mjs";
import "../_libs/@opentelemetry/api.mjs";
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
import "../_libs/tanstack__query-core.mjs";
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
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-effect-event+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const Dialog = Dialog$1;
const DialogPortal = DialogPortal$1;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogOverlay$1,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogOverlay$1.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent$1,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogClose, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogContent$1.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogTitle$1,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogTitle$1.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  DialogDescription$1,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogDescription$1.displayName;
function Panel({
  children,
  className = "",
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden ${className}`, style: {
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
  }, children: [
    !!accent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-px", style: {
      background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`
    } }),
    children
  ] });
}
function Pill({
  icon: Icon,
  label,
  color
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold", style: {
    backgroundColor: `${color}10`,
    border: `1px solid ${color}20`,
    color
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
    label
  ] });
}
function ActionButton({
  onClick,
  disabled,
  icon: Icon,
  title,
  desc,
  tone = "neutral"
}) {
  const styles = tone === "primary" ? {
    bg: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    shadow: "0 0 18px rgba(99,102,241,0.25)",
    iconBg: "rgba(99,102,241,0.12)",
    iconBorder: "rgba(99,102,241,0.2)",
    border: "rgba(99,102,241,0.22)"
  } : tone === "success" ? {
    bg: "linear-gradient(135deg, #059669, #10b981)",
    shadow: "0 0 18px rgba(16,185,129,0.22)",
    iconBg: "rgba(16,185,129,0.12)",
    iconBorder: "rgba(16,185,129,0.2)",
    border: "rgba(16,185,129,0.22)"
  } : {
    bg: "transparent",
    shadow: "none",
    iconBg: "rgba(255,255,255,0.04)",
    iconBorder: "rgba(255,255,255,0.08)",
    border: "var(--color-border)"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick, disabled, className: "group relative w-full rounded-2xl border p-4 text-left transition-all duration-400 disabled:opacity-60 disabled:cursor-not-allowed", style: {
    borderColor: styles.border,
    boxShadow: tone === "neutral" ? "inset 0 1px 0 rgba(255,255,255,0.04)" : styles.shadow,
    background: tone === "neutral" ? "transparent" : styles.bg
  }, children: [
    tone !== "neutral" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0", style: {
        backgroundColor: styles.iconBg,
        border: `1px solid ${styles.iconBorder}`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5", style: {
        color: tone === "neutral" ? "var(--color-foreground)" : "white"
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-black text-sm ${tone === "neutral" ? "text-foreground" : "text-white"}`, children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: `h-4 w-4 transition-transform duration-300 ${tone === "neutral" ? "text-muted-foreground" : "text-white/80"} group-hover:translate-x-0.5` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs mt-1 leading-relaxed ${tone === "neutral" ? "text-muted-foreground" : "text-white/80"}`, children: desc })
      ] })
    ] })
  ] });
}
function ProgressStep({
  label,
  active,
  done
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-6 rounded-xl grid place-items-center border", style: {
      borderColor: done ? "rgba(16,185,129,0.25)" : active ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.08)",
      backgroundColor: done ? "rgba(16,185,129,0.12)" : active ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)"
    }, children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }) : active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-muted-foreground/50" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] font-bold uppercase tracking-widest ${active ? "text-foreground" : "text-muted-foreground"}`, children: label })
  ] });
}
function GithubResumePage() {
  const [username, setUsername] = reactExports.useState("");
  const [coverLetter, setCoverLetter] = reactExports.useState(null);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = reactExports.useState(false);
  const [mounted, setMounted] = reactExports.useState(false);
  const [isPublic, setIsPublic] = reactExports.useState(false);
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);
  const genResumeFn = useServerFn(generateGithubResume);
  const saveResumeFn = useServerFn(saveResume);
  const genCoverLetterFn = useServerFn(generateCoverLetter);
  const setVisibilityFn = useServerFn(setPortfolioVisibility);
  const mutation = useMutation({
    mutationFn: () => genResumeFn({
      data: {
        username
      }
    }),
    onError: (e) => toast.error(e.message)
  });
  const saveMutation = useMutation({
    mutationFn: () => {
      const data2 = mutation.data;
      if (!data2) throw new Error("No resume to save");
      return saveResumeFn({
        data: {
          title: `GitHub Resume: ${data2.developerType}`,
          content: data2.resumeData,
          score: data2.insights.atsScore,
          ai_suggestions: data2.insights.missingSkills
        }
      });
    },
    onSuccess: () => toast.success("Resume saved to your library!"),
    onError: (e) => toast.error(e.message)
  });
  const coverLetterMutation = useMutation({
    mutationFn: () => {
      if (!mutation.data) throw new Error("No resume generated yet");
      return genCoverLetterFn({
        data: {
          resume: mutation.data.resumeData,
          jobRole: mutation.data.developerType
        }
      });
    },
    onSuccess: (data2) => {
      setCoverLetter(data2.coverLetter);
      setIsCoverLetterOpen(true);
    },
    onError: (e) => toast.error(e.message)
  });
  const visibilityMutation = useMutation({
    mutationFn: () => {
      if (!mutation.data?.id) throw new Error("No portfolio ID");
      return setVisibilityFn({
        data: {
          portfolioId: mutation.data.id,
          isPublic: !isPublic
        }
      });
    },
    onSuccess: () => {
      setIsPublic(!isPublic);
      toast.success(isPublic ? "Portfolio is now private" : "Portfolio is now public");
    },
    onError: (e) => toast.error(e.message)
  });
  const handleEditInBuilder = () => {
    if (!mutation.data) return;
    sessionStorage.setItem("importedGithubResume", JSON.stringify(mutation.data.resumeData));
    navigate({
      to: "/resume"
    });
  };
  const data = mutation.data;
  const atsTone = reactExports.useMemo(() => {
    const score = data?.insights.atsScore ?? 0;
    if (score >= 80) return {
      color: "#10b981",
      label: "Excellent"
    };
    if (score >= 65) return {
      color: "#6366f1",
      label: "Good"
    };
    if (score >= 45) return {
      color: "#f59e0b",
      label: "Needs Work"
    };
    return {
      color: "#ef4444",
      label: "Weak"
    };
  }, [data?.insights.atsScore]);
  const steps = {
    analyze: !!data,
    save: saveMutation.isSuccess
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 pb-12", style: {
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(10px)",
    transition: "all 0.6s cubic-bezier(0.34,1.2,0.64,1)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "flex flex-col gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-widest text-primary", children: "GitHub → ATS Resume" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-3xl font-black tracking-tight text-foreground", children: "GitHub Resume Generator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-muted-foreground max-w-2xl leading-relaxed", children: "Turn your open-source work into a professional, ATS-ready resume — inferred from repositories, READMEs, topics, and commit patterns." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressStep, { label: "Analyze", active: !steps.analyze, done: steps.analyze }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-10 bg-border/60 hidden sm:block" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressStep, { label: "Save", active: steps.analyze && !steps.save, done: steps.save })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { className: "p-2 max-w-2xl", accent: "#6366f1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      if (username.trim()) mutation.mutate();
    }, className: "flex flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: username, onChange: (e) => setUsername(e.target.value), placeholder: "Enter GitHub username (e.g. torvalds)", className: "h-12 pl-11 rounded-xl border-0 bg-transparent focus-visible:ring-0", disabled: mutation.isPending })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: mutation.isPending || !username.trim(), type: "submit", className: "group relative h-12 px-6 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed", style: {
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        boxShadow: "0 0 18px rgba(99,102,241,0.25)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative flex items-center gap-2", children: mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          "Generating…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
          "Generate"
        ] }) })
      ] })
    ] }) }),
    mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { className: "p-10", accent: "#8b5cf6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center text-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-3xl bg-primary/10 border border-primary/20 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-3xl animate-pulse opacity-60", style: {
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)"
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-black text-lg text-foreground", children: "Analyzing repositories & inferring your tech stack…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-md mt-1.5 leading-relaxed", children: "We read README structure, topics, languages, and project signals to craft a professional summary and ATS-friendly bullets." })
      ] })
    ] }) }),
    data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", style: {
      animation: "fadeSlideIn 0.5s ease-out both"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { className: "p-7 lg:col-span-8", accent: "#6366f1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-40", style: {
            background: "radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-6 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "h-4 w-4" }),
                  "AI Inferred Profile"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-foreground", children: data.developerType }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                  data.insights.specialization,
                  " · ",
                  data.insights.experienceLevel
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { icon: Github, label: `github.com/${username}`, color: "#64748b" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `https://github.com/${username}`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground transition-colors", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
                    "Open GitHub"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-muted/25 px-4 py-3 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: "Profile Strength" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-4xl font-black bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent", children: data.profileStrength }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-1", children: "Repo quality & activity" })
              ] }) })
            ] }),
            data.badges?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 pt-5 border-t border-border/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2", children: "Badges" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: data.badges.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold", style: {
                backgroundColor: "rgba(245,158,11,0.10)",
                border: "1px solid rgba(245,158,11,0.20)",
                color: "#f59e0b"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }),
                b
              ] }, i)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { className: "p-7 lg:col-span-4", accent: atsTone.color, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground", children: "ATS Score" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-baseline gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl font-black", style: {
                  color: atsTone.color
                }, children: data.insights.atsScore }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-muted-foreground", children: "/100" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs font-semibold", style: {
                color: atsTone.color
              }, children: atsTone.label })
            ] }),
            data.insights.atsScore >= 65 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-emerald-500" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-amber-500" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-muted/50 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all duration-700", style: {
            width: `${data.insights.atsScore}%`,
            background: `linear-gradient(90deg, ${atsTone.color}80, ${atsTone.color})`,
            boxShadow: `0 0 10px ${atsTone.color}40`
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2", children: "Top Missing Skills" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: data.insights.missingSkills.slice(0, 8).map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded-lg text-[11px] font-bold", style: {
              backgroundColor: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.16)",
              color: "rgb(239,68,68)"
            }, children: s }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2", children: "Recommended Roles" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: data.insights.recommendedRoles.slice(0, 5).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-foreground/90 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-primary" }),
              r
            ] }, i)) })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { className: "p-6", accent: "#6366f1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground", children: "One-Click Actions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4.5 w-4.5 text-primary" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { onClick: () => saveMutation.mutate(), disabled: saveMutation.isPending, icon: saveMutation.isPending ? LoaderCircle : Save, title: saveMutation.isPending ? "Saving…" : "Save to My Resumes", desc: "Store this resume in your library with its ATS score.", tone: "neutral" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { onClick: () => navigate({
                to: "/portfolio-deployment/$id",
                params: {
                  id: data.id || ""
                }
              }), icon: Rocket, title: "Deploy Portfolio", desc: "Instantly deploy this generated portfolio to a live URL.", tone: "success" }),
              data.id && /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { onClick: () => visibilityMutation.mutate(), disabled: visibilityMutation.isPending, icon: isPublic ? ExternalLink : Save, title: visibilityMutation.isPending ? "Updating…" : isPublic ? "Make Private" : "Make Public", desc: isPublic ? "Currently accessible via UUID link." : "Allow sharing via UUID link.", tone: isPublic ? "primary" : "neutral" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { onClick: handleEditInBuilder, icon: PenLine, title: "Edit in Resume Builder", desc: "Fine-tune bullets, sections, and formatting.", tone: "neutral" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { onClick: () => window.print(), icon: Download, title: "Export PDF", desc: "Print-friendly layout with consistent spacing.", tone: "neutral" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { onClick: () => coverLetterMutation.mutate(), disabled: coverLetterMutation.isPending, icon: coverLetterMutation.isPending ? LoaderCircle : FileText, title: coverLetterMutation.isPending ? "Generating…" : "Generate Cover Letter", desc: "AI letter tailored to this inferred role.", tone: "primary" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { className: "p-6", accent: "#10b981", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-emerald-500" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-black text-foreground", children: "Next: Build a full resume" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Import this draft into the builder for templates + scoring." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/resume", className: "group inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4", children: [
              "Open Resume Builder",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { className: "overflow-hidden", accent: "#8b5cf6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-black text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-violet-500" }),
              "Generated Preview"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground", children: "Print-ready" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 md:p-8 bg-background", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/60 overflow-hidden", style: {
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 bg-white text-zinc-900 print:shadow-none print:p-0", style: {
              fontFamily: "Inter, ui-sans-serif, system-ui"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-zinc-200 pb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: data.resumeData.fullName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-600 font-medium", children: data.resumeData.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-zinc-500", children: [
                  "github.com/",
                  username,
                  " · Generated by DevAI"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500", children: "Professional Summary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: data.resumeData.summary })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500", children: "Technical Skills" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: data.resumeData.skills.join(" · ") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500", children: "Key Projects" }),
                data.resumeData.projects.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 last:mb-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
                    p.name,
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-normal text-zinc-500 ml-1", children: [
                      "— ",
                      p.tech
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-700 mt-0.5 leading-relaxed", children: p.description })
                ] }, i))
              ] }),
              !!data.insights.achievements?.length && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500", children: "Achievements & Highlights" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc pl-4 space-y-1", children: data.insights.achievements.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-xs text-zinc-700 leading-relaxed", children: a }, i)) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: "Tip: Export PDF for sharing, then refine in the Resume Builder for layout templates and ATS improvements." })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isCoverLetterOpen, onOpenChange: setIsCoverLetterOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-primary" }),
          "Generated Cover Letter"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "AI-crafted cover letter based on your GitHub-inferred resume." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap text-sm mt-3 p-4 rounded-xl bg-muted/40 border border-border/60", children: coverLetter })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` })
  ] });
}
export {
  GithubResumePage as component
};
