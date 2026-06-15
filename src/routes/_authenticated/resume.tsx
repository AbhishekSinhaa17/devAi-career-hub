import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { scoreResume, generateDeveloperScore, saveResume, getResumes, deleteResume } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Plus, Trash2, Printer, FileText, Save, History, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume Builder — DevAI" }] }),
  component: Page,
});

interface Experience { role: string; company: string; period: string; description: string }
interface Education { school: string; degree: string; period: string }
interface Project { name: string; description: string; tech?: string }

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
  fullName: "", title: "", email: "", phone: "", location: "", summary: "",
  skills: [], experience: [{ role: "", company: "", period: "", description: "" }],
  education: [{ school: "", degree: "", period: "" }],
  projects: [{ name: "", description: "", tech: "" }],
};

function Page() {
  const [r, setR] = useState<Resume>(empty);
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [skillInput, setSkillInput] = useState("");
  const queryClient = useQueryClient();

  const fn = useServerFn(scoreResume);
  const genDevScoreFn = useServerFn(generateDeveloperScore);
  const saveFn = useServerFn(saveResume);
  const getResumesFn = useServerFn(getResumes);
  const deleteFn = useServerFn(deleteResume);

  const { data: historyResumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => getResumesFn(),
  });

  // Handle Import from GitHub Resume
  useEffect(() => {
    const importedStr = sessionStorage.getItem("importedGithubResume");
    if (importedStr) {
      try {
        const importedData = JSON.parse(importedStr);
        setR({ ...empty, ...importedData });
        setCurrentId(undefined);
        toast.success("GitHub Resume loaded! You can now edit and save it.");
      } catch (e) {
        console.error("Failed to parse imported resume");
      }
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
    mutationFn: () => saveFn({ data: {
      id: currentId,
      title: r.fullName ? `${r.fullName}'s Resume` : "Untitled Resume",
      content: r,
      score: mutation.data?.score || 0,
      ai_suggestions: mutation.data?.missingSkills || [],
    }}),
    onSuccess: (savedData) => {
      setCurrentId(savedData.id);
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume saved successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted");
      if (currentId === deleteMutation.variables) {
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Resume Builder</h1>
          <p className="mt-1 text-muted-foreground">Fill in your info — preview updates live, AI scores your resume.</p>
        </div>
        <div className="flex gap-2">
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2"><History className="h-4 w-4" /> History</Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Saved Resumes</SheetTitle>
                <SheetDescription>Load or manage your previously saved resumes.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {historyResumes?.map(hr => (
                  <div key={hr.id} className="p-4 rounded-xl border bg-card space-y-3">
                    <div>
                      <h4 className="font-semibold">{hr.title}</h4>
                      <p className="text-xs text-muted-foreground">Last updated: {new Date(hr.updated_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => loadResume(hr)} size="sm" variant="secondary" className="w-full gap-1"><FolderOpen className="h-3.5 w-3.5" /> Load</Button>
                      <Button onClick={() => deleteMutation.mutate(hr.id)} disabled={deleteMutation.isPending && deleteMutation.variables === hr.id} size="sm" variant="destructive" className="px-2"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
                {historyResumes?.length === 0 && <p className="text-sm text-muted-foreground">No saved resumes found.</p>}
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="outline" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2"><Save className="h-4 w-4" /> Save</Button>
          <Button variant="outline" onClick={() => window.print()} className="gap-2"><Printer className="h-4 w-4" /> PDF</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Score with AI
          </Button>
        </div>
      </header>

      {mutation.data && (
        <div className="glass-card rounded-xl p-5 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">ATS score</div>
              <div className="text-4xl font-semibold gradient-text">{mutation.data.score}/100</div>
            </div>
            {mutation.data.missingSkills.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Consider adding: </span>
                {mutation.data.missingSkills.slice(0, 6).map((s) => <span key={s} className="ml-1 rounded-full border border-border px-2 py-0.5 text-xs">{s}</span>)}
              </div>
            )}
          </div>
          <ul className="mt-4 space-y-1.5 text-sm">
            {mutation.data.suggestions.map((s, i) => <li key={i} className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />{s}</li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-4 print:hidden">
          <div className="glass-card rounded-xl p-5 space-y-3">
            <h2 className="font-semibold">Basics</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Full name" v={r.fullName} on={(v) => update("fullName", v)} />
              <Field label="Title" v={r.title} on={(v) => update("title", v)} />
              <Field label="Email" v={r.email} on={(v) => update("email", v)} />
              <Field label="Phone" v={r.phone} on={(v) => update("phone", v)} />
              <Field label="Location" v={r.location} on={(v) => update("location", v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Professional summary</Label>
              <Textarea rows={3} value={r.summary} onChange={(e) => update("summary", e.target.value)} />
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 space-y-3">
            <h2 className="font-semibold">Skills</h2>
            <div className="flex gap-2">
              <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Add a skill and press Enter" />
              <Button onClick={addSkill} type="button"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.skills.map((s) => (
                <button key={s} onClick={() => update("skills", r.skills.filter((x) => x !== s))} className="group rounded-full border border-border bg-card px-3 py-1 text-xs hover:border-destructive/60">
                  {s} <span className="text-muted-foreground group-hover:text-destructive">×</span>
                </button>
              ))}
            </div>
          </div>

          <ListSection title="Experience" items={r.experience} onChange={(v) => update("experience", v)} empty={{ role: "", company: "", period: "", description: "" }} render={(item, i, set) => (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Role" v={item.role} on={(v) => set({ ...item, role: v })} />
                <Field label="Company" v={item.company} on={(v) => set({ ...item, company: v })} />
                <Field label="Period" v={item.period} on={(v) => set({ ...item, period: v })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} value={item.description} onChange={(e) => set({ ...item, description: e.target.value })} />
              </div>
            </>
          )} />

          <ListSection title="Education" items={r.education} onChange={(v) => update("education", v)} empty={{ school: "", degree: "", period: "" }} render={(item, i, set) => (
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="School" v={item.school} on={(v) => set({ ...item, school: v })} />
              <Field label="Degree" v={item.degree} on={(v) => set({ ...item, degree: v })} />
              <Field label="Period" v={item.period} on={(v) => set({ ...item, period: v })} />
            </div>
          )} />

          <ListSection title="Projects" items={r.projects} onChange={(v) => update("projects", v)} empty={{ name: "", description: "", tech: "" }} render={(item, i, set) => (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Name" v={item.name} on={(v) => set({ ...item, name: v })} />
                <Field label="Tech" v={item.tech ?? ""} on={(v) => set({ ...item, tech: v })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={2} value={item.description} onChange={(e) => set({ ...item, description: e.target.value })} />
              </div>
            </>
          )} />
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <ResumePreview r={r} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}

function ListSection<T>({ title, items, onChange, empty, render }: { title: string; items: T[]; onChange: (v: T[]) => void; empty: T; render: (item: T, i: number, set: (v: T) => void) => React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Button size="sm" variant="outline" onClick={() => onChange([...items, empty])}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-border p-3 space-y-3">
            {render(it, i, (v) => onChange(items.map((x, idx) => (idx === i ? v : x))))}
            <Button size="sm" variant="ghost" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive gap-1"><Trash2 className="h-3.5 w-3.5" /> Remove</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResumePreview({ r }: { r: Resume }) {
  return (
    <div className="rounded-xl bg-white p-8 text-zinc-900 shadow-2xl print:shadow-none print:rounded-none" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="border-b border-zinc-300 pb-4">
        <h1 className="text-3xl font-bold">{r.fullName || "Your Name"}</h1>
        <p className="text-zinc-600">{r.title || "Your Title"}</p>
        <p className="mt-2 text-xs text-zinc-500">
          {[r.email, r.phone, r.location].filter(Boolean).join(" · ")}
        </p>
      </div>
      {r.summary && <Section title="Summary"><p className="text-sm">{r.summary}</p></Section>}
      {r.skills.length > 0 && (
        <Section title="Skills">
          <p className="text-sm">{r.skills.join(" · ")}</p>
        </Section>
      )}
      {r.experience.some((e) => e.role || e.company) && (
        <Section title="Experience">
          {r.experience.map((e, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex justify-between text-sm font-semibold">{e.role} <span className="font-normal text-zinc-500">{e.period}</span></div>
              <div className="text-sm text-zinc-700">{e.company}</div>
              {e.description && <p className="mt-1 text-xs text-zinc-700">{e.description}</p>}
            </div>
          ))}
        </Section>
      )}
      {r.projects.some((p) => p.name) && (
        <Section title="Projects">
          {r.projects.map((p, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="text-sm font-semibold">{p.name} {p.tech && <span className="text-xs font-normal text-zinc-500">— {p.tech}</span>}</div>
              {p.description && <p className="text-xs text-zinc-700">{p.description}</p>}
            </div>
          ))}
        </Section>
      )}
      {r.education.some((e) => e.school) && (
        <Section title="Education">
          {r.education.map((e, i) => (
            <div key={i} className="mb-2 last:mb-0 text-sm">
              <div className="flex justify-between font-semibold">{e.school} <span className="font-normal text-zinc-500">{e.period}</span></div>
              <div className="text-zinc-700">{e.degree}</div>
            </div>
          ))}
        </Section>
      )}
      {!r.fullName && (
        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-400">
          <FileText className="h-3.5 w-3.5" /> Live preview will update as you type.
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">{title}</h2>
      {children}
    </div>
  );
}
