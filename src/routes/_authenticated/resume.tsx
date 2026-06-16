import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import {
  scoreResume,
  generateDeveloperScore,
  saveResume,
  getResumes,
  deleteResume,
} from "@/lib/ai.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  FileText,
  Save,
  History,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  Brain,
  TrendingUp,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume Builder — DevAI" }] }),
  component: Page,
});

interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}
interface Education {
  school: string;
  degree: string;
  period: string;
}
interface Project {
  name: string;
  description: string;
  tech?: string;
}
interface Resume {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
}

const empty: Resume = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: [],
  experience: [{ role: "", company: "", period: "", description: "" }],
  education: [{ school: "", degree: "", period: "" }],
  projects: [{ name: "", description: "", tech: "" }],
};

// ─── Shared Panel ─────────────────────────────────────────────────────────────
function Panel({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden ${className}`}
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
    >
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg,transparent,${accent}60,transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

// ─── Section Accordion ────────────────────────────────────────────────────────
function EditorSection({
  title,
  icon: Icon,
  accent = "#6366f1",
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  accent?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Panel accent={accent}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 group"
      >
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-xl grid place-items-center"
            style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}25` }}
          >
            <Icon className="h-4 w-4" style={{ color: accent }} />
          </div>
          <span className="font-black text-sm text-foreground">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/40">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </Panel>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label,
  v,
  on,
  placeholder,
}: {
  label: string;
  v: string;
  on: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5 group/f">
      <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within/f:text-primary transition-colors">
        {label}
      </Label>
      <div className="relative">
        <Input
          value={v}
          onChange={(e) => on(e.target.value)}
          placeholder={placeholder ?? label}
          className="rounded-xl border-border/60 bg-background/60 focus:border-primary/60 focus:bg-background transition-all duration-300 text-sm"
        />
        <div className="absolute bottom-0 inset-x-0 h-px scale-x-0 group-focus-within/f:scale-x-100 transition-transform duration-300 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full" />
      </div>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Work" : "Weak";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
      <span className="text-xs font-bold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

// ─── List Section ─────────────────────────────────────────────────────────────
function ListSection<T extends object>({
  title,
  icon: Icon,
  accent,
  items,
  onChange,
  empty: emptyItem,
  render,
}: {
  title: string;
  icon: React.ElementType;
  accent: string;
  items: T[];
  onChange: (v: T[]) => void;
  empty: T;
  render: (item: T, i: number, set: (v: T) => void) => React.ReactNode;
}) {
  return (
    <EditorSection title={title} icon={Icon} accent={accent} defaultOpen={false}>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-background/40 p-4 space-y-3"
            style={{ animation: "fadeSlideIn 0.3s ease-out both" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                #{i + 1}
              </span>
              <button
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="h-6 w-6 rounded-lg grid place-items-center border border-border/60 bg-muted/20 hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive text-muted-foreground transition-all duration-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {render(it, i, (v) => onChange(items.map((x, idx) => (idx === i ? v : x))))}
          </div>
        ))}
        <button
          onClick={() => onChange([...items, emptyItem])}
          className="w-full rounded-xl border border-dashed border-border/60 py-3 text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add {title.replace(/s$/, "")}
        </button>
      </div>
    </EditorSection>
  );
}

// ─── Skill Tag ────────────────────────────────────────────────────────────────
function SkillTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-primary/20 bg-primary/8 text-primary hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive transition-all duration-300 cursor-default">
      {label}
      <button onClick={onRemove} className="opacity-60 group-hover:opacity-100">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Resume Preview ───────────────────────────────────────────────────────────
function ResumePreview({ r }: { r: Resume }) {
  const hasContent = r.fullName || r.title || r.summary;
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none"
      style={{
        background: "white",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      {/* Preview chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-100 border-b border-zinc-200 print:hidden">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 text-center text-[11px] font-semibold text-zinc-500">
          Live Preview
        </div>
        <Printer
          className="h-3.5 w-3.5 text-zinc-400 cursor-pointer hover:text-zinc-700 transition-colors"
          onClick={() => window.print()}
        />
      </div>

      {/* Paper */}
      <div
        className="p-8 bg-white text-zinc-900 print:p-6"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", minHeight: "700px" }}
      >
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-10 w-10 text-zinc-300 mb-3" />
            <p className="text-zinc-400 text-sm font-medium">
              Start filling in the form to see your resume preview
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b-2 border-zinc-800 pb-4 mb-4">
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                {r.fullName || "Your Name"}
              </h1>
              {r.title && <p className="text-base font-semibold text-zinc-600 mt-1">{r.title}</p>}
              {(r.email || r.phone || r.location) && (
                <p className="mt-2 text-xs text-zinc-500 flex flex-wrap gap-x-3">
                  {[r.email, r.phone, r.location].filter(Boolean).map((v, i) => (
                    <span key={i}>{v}</span>
                  ))}
                </p>
              )}
            </div>

            {r.summary && (
              <PreviewSection title="Professional Summary">
                <p className="text-sm leading-relaxed text-zinc-700">{r.summary}</p>
              </PreviewSection>
            )}

            {r.skills.length > 0 && (
              <PreviewSection title="Technical Skills">
                <p className="text-sm text-zinc-700 leading-relaxed">{r.skills.join(" · ")}</p>
              </PreviewSection>
            )}

            {r.experience.some((e) => e.role || e.company) && (
              <PreviewSection title="Experience">
                {r.experience.map((e, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-bold text-zinc-900">{e.role}</span>
                        {e.company && (
                          <span className="text-sm text-zinc-600 ml-2">· {e.company}</span>
                        )}
                      </div>
                      {e.period && (
                        <span className="text-xs text-zinc-500 flex-shrink-0 mt-0.5">
                          {e.period}
                        </span>
                      )}
                    </div>
                    {e.description && (
                      <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                        {e.description}
                      </p>
                    )}
                  </div>
                ))}
              </PreviewSection>
            )}

            {r.projects.some((p) => p.name) && (
              <PreviewSection title="Projects">
                {r.projects.map((p, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <span className="text-sm font-bold text-zinc-900">{p.name}</span>
                    {p.tech && <span className="text-xs text-zinc-500 ml-2">— {p.tech}</span>}
                    {p.description && (
                      <p className="mt-1 text-xs text-zinc-600 leading-relaxed">{p.description}</p>
                    )}
                  </div>
                ))}
              </PreviewSection>
            )}

            {r.education.some((e) => e.school) && (
              <PreviewSection title="Education">
                {r.education.map((e, i) => (
                  <div key={i} className="mb-2 last:mb-0">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-bold text-zinc-900">{e.school}</span>
                      {e.period && <span className="text-xs text-zinc-500">{e.period}</span>}
                    </div>
                    {e.degree && <p className="text-sm text-zinc-600">{e.degree}</p>}
                  </div>
                ))}
              </PreviewSection>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 pb-1 border-b border-zinc-200">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function Page() {
  const [r, setR] = useState<Resume>(empty);
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [skillInput, setSkillInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fn = useServerFn(scoreResume);
  const genDevScoreFn = useServerFn(generateDeveloperScore);
  const saveFn = useServerFn(saveResume);
  const getResumesFn = useServerFn(getResumes);
  const deleteFn = useServerFn(deleteResume);

  const { data: historyResumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => getResumesFn(),
  });

  useEffect(() => {
    const importedStr = sessionStorage.getItem("importedGithubResume");
    if (importedStr) {
      try {
        const importedData = JSON.parse(importedStr);
        setR({ ...empty, ...importedData });
        setCurrentId(undefined);
        toast.success("GitHub Resume loaded! Edit and save.");
      } catch {}
      sessionStorage.removeItem("importedGithubResume");
    }
  }, []);

  const mutation = useMutation({
    mutationFn: () => fn({ data: { resume: r } }),
    onSuccess: () => {
      genDevScoreFn({ data: undefined }).catch(console.error);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          id: currentId,
          title: r.fullName ? `${r.fullName}'s Resume` : "Untitled Resume",
          content: r,
          score: mutation.data?.score || 0,
          ai_suggestions: mutation.data?.missingSkills || [],
        },
      }),
    onSuccess: (saved: any) => {
      setCurrentId(saved.id);
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume saved successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted");
      if (currentId === id) {
        setCurrentId(undefined);
        setR(empty);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function update<K extends keyof Resume>(key: K, value: Resume[K]) {
    setR((p) => ({ ...p, [key]: value }));
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !r.skills.includes(s)) update("skills", [...r.skills, s]);
    setSkillInput("");
  }

  function loadResume(savedItem: any) {
    setR(savedItem.content);
    setCurrentId(savedItem.id);
    toast.success("Resume loaded");
  }

  const aiScore = mutation.data?.score ?? 0;

  return (
    <div
      className="space-y-8 pb-12"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateY(10px)",
        transition: "all 0.6s cubic-bezier(0.34,1.2,0.64,1)",
      }}
    >
      {/* ── Header ── */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-3">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                ATS Resume Builder
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Resume{" "}
              <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
                Builder
              </span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Build your resume, score it with AI, and export — all in one place.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 print:hidden">
            {/* History sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border/60 bg-card/40 text-sm font-bold text-foreground hover:bg-card/80 hover:border-border transition-all duration-300">
                  <History className="h-4 w-4 text-muted-foreground" />
                  History
                </button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="font-black">Saved Resumes</SheetTitle>
                  <SheetDescription>Load or manage previously saved resumes.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {historyResumes?.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
                      <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No saved resumes yet</p>
                    </div>
                  )}
                  {historyResumes?.map((hr: any) => (
                    <div
                      key={hr.id}
                      className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3"
                    >
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{hr.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(hr.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadResume(hr)}
                          className="flex-1 h-9 rounded-xl border border-primary/25 bg-primary/8 text-xs font-bold text-primary hover:bg-primary/15 transition-colors flex items-center justify-center gap-2"
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                          Load
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(hr.id)}
                          disabled={deleteMutation.isPending && deleteMutation.variables === hr.id}
                          className="h-9 w-9 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/15 transition-colors grid place-items-center disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border/60 bg-card/40 text-sm font-bold text-foreground hover:bg-card/80 hover:border-border transition-all duration-300 disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4 text-muted-foreground" />
              )}
              Save
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border/60 bg-card/40 text-sm font-bold text-foreground hover:bg-card/80 hover:border-border transition-all duration-300"
            >
              <Printer className="h-4 w-4 text-muted-foreground" />
              PDF
            </button>

            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="group relative inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white overflow-hidden disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                boxShadow: "0 0 20px rgba(99,102,241,0.3)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <span className="relative flex items-center gap-2">
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Score with AI
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── AI Score panel ── */}
      {mutation.data && (
        <Panel
          accent={aiScore >= 80 ? "#10b981" : aiScore >= 60 ? "#6366f1" : "#f59e0b"}
          className="print:hidden"
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse at 80% 50%, ${aiScore >= 80 ? "rgba(16,185,129" : aiScore >= 60 ? "rgba(99,102,241" : "rgba(245,158,11"},0.06) 0%, transparent 60%)`,
            }}
          />
          <div className="relative z-10 p-6">
            <div className="flex flex-wrap items-start gap-6 mb-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  ATS Score
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-5xl font-black"
                    style={{
                      color: aiScore >= 80 ? "#10b981" : aiScore >= 60 ? "#6366f1" : "#f59e0b",
                    }}
                  >
                    {aiScore}
                  </span>
                  <span className="text-lg text-muted-foreground font-bold">/100</span>
                </div>
                <div className="mt-2 w-48">
                  <ScoreBar score={aiScore} />
                </div>
              </div>

              {mutation.data.missingSkills?.length > 0 && (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Consider Adding
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mutation.data.missingSkills.slice(0, 8).map((s: string) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold"
                        style={{
                          backgroundColor: "rgba(245,158,11,0.08)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          color: "#f59e0b",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {mutation.data.suggestions?.length > 0 && (
              <div className="border-t border-border/40 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    AI Suggestions
                  </span>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {mutation.data.suggestions.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* ── Main grid ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-3 print:hidden">
          {/* Basics */}
          <EditorSection title="Personal Info" icon={User} accent="#6366f1">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Full Name"
                v={r.fullName}
                on={(v) => update("fullName", v)}
                placeholder="Jane Smith"
              />
              <Field
                label="Title"
                v={r.title}
                on={(v) => update("title", v)}
                placeholder="Senior Software Engineer"
              />
              <Field
                label="Email"
                v={r.email}
                on={(v) => update("email", v)}
                placeholder="jane@company.com"
              />
              <Field
                label="Phone"
                v={r.phone}
                on={(v) => update("phone", v)}
                placeholder="+1 555 000 0000"
              />
              <Field
                label="Location"
                v={r.location}
                on={(v) => update("location", v)}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-1.5 group/f mt-1">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within/f:text-primary transition-colors">
                Professional Summary
              </Label>
              <Textarea
                rows={3}
                value={r.summary}
                onChange={(e) => update("summary", e.target.value)}
                placeholder="A brief, impactful summary of your experience and goals…"
                className="rounded-xl border-border/60 bg-background/60 resize-none focus:border-primary/60 transition-all"
              />
            </div>
          </EditorSection>

          {/* Skills */}
          <EditorSection title="Skills" icon={Award} accent="#10b981" defaultOpen={false}>
            <div className="flex gap-2">
              <div className="relative flex-1 group/f">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill and press Enter…"
                  className="rounded-xl border-border/60 bg-background/60 focus:border-primary/60 transition-all"
                />
                <div className="absolute bottom-0 inset-x-0 h-px scale-x-0 group-focus-within/f:scale-x-100 transition-transform duration-300 bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full" />
              </div>
              <button
                onClick={addSkill}
                className="h-10 w-10 rounded-xl grid place-items-center border border-primary/25 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {r.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {r.skills.map((s) => (
                  <SkillTag
                    key={s}
                    label={s}
                    onRemove={() =>
                      update(
                        "skills",
                        r.skills.filter((x) => x !== s),
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                No skills added yet. Type a skill above and press Enter.
              </p>
            )}
          </EditorSection>

          {/* Experience */}
          <ListSection
            title="Experience"
            icon={Briefcase}
            accent="#8b5cf6"
            items={r.experience}
            onChange={(v) => update("experience", v)}
            empty={{ role: "", company: "", period: "", description: "" }}
            render={(item, _i, set) => (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Role"
                    v={item.role}
                    on={(v) => set({ ...item, role: v })}
                    placeholder="Senior Engineer"
                  />
                  <Field
                    label="Company"
                    v={item.company}
                    on={(v) => set({ ...item, company: v })}
                    placeholder="Acme Corp"
                  />
                  <Field
                    label="Period"
                    v={item.period}
                    on={(v) => set({ ...item, period: v })}
                    placeholder="Jan 2022 – Present"
                  />
                </div>
                <div className="space-y-1.5 group/f">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within/f:text-primary transition-colors">
                    Description
                  </Label>
                  <Textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) => set({ ...item, description: e.target.value })}
                    placeholder="Key achievements and responsibilities…"
                    className="rounded-xl border-border/60 bg-background/60 resize-none focus:border-primary/60 transition-all"
                  />
                </div>
              </>
            )}
          />

          {/* Education */}
          <ListSection
            title="Education"
            icon={GraduationCap}
            accent="#f59e0b"
            items={r.education}
            onChange={(v) => update("education", v)}
            empty={{ school: "", degree: "", period: "" }}
            render={(item, _i, set) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="School"
                  v={item.school}
                  on={(v) => set({ ...item, school: v })}
                  placeholder="MIT"
                />
                <Field
                  label="Degree"
                  v={item.degree}
                  on={(v) => set({ ...item, degree: v })}
                  placeholder="BSc Computer Science"
                />
                <Field
                  label="Period"
                  v={item.period}
                  on={(v) => set({ ...item, period: v })}
                  placeholder="2018 – 2022"
                />
              </div>
            )}
          />

          {/* Projects */}
          <ListSection
            title="Projects"
            icon={Code2}
            accent="#38bdf8"
            items={r.projects}
            onChange={(v) => update("projects", v)}
            empty={{ name: "", description: "", tech: "" }}
            render={(item, _i, set) => (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Name"
                    v={item.name}
                    on={(v) => set({ ...item, name: v })}
                    placeholder="DevAI CLI"
                  />
                  <Field
                    label="Tech"
                    v={item.tech ?? ""}
                    on={(v) => set({ ...item, tech: v })}
                    placeholder="TypeScript, Node.js"
                  />
                </div>
                <div className="space-y-1.5 group/f">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-focus-within/f:text-primary transition-colors">
                    Description
                  </Label>
                  <Textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => set({ ...item, description: e.target.value })}
                    placeholder="What it does and the impact it made…"
                    className="rounded-xl border-border/60 bg-background/60 resize-none focus:border-primary/60 transition-all"
                  />
                </div>
              </>
            )}
          />
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:h-fit space-y-4">
          <ResumePreview r={r} />

          {/* Quick tips */}
          <Panel accent="#6366f1" className="print:hidden">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Quick Tips
                </span>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Use action verbs: Built, Led, Improved, Reduced…",
                  "Quantify achievements with numbers where possible",
                  "Mirror keywords from the job description for ATS",
                  "Keep to one page for under 5 years of experience",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
