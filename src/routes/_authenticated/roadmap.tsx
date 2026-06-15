import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { generateRoadmap } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Award, Clock, Wrench, Folder, BookMarked } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/roadmap")({
  head: () => ({ meta: [{ title: "Career Roadmap — DevAI" }] }),
  component: Page,
});

const PATHS = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer", "Data Analyst", "Mobile Developer", "ML Engineer"];
const LEVELS = ["beginner", "intermediate", "advanced"];

function Page() {
  const [path, setPath] = useState("Full Stack Developer");
  const [level, setLevel] = useState("beginner");
  const fn = useServerFn(generateRoadmap);
  const mutation = useMutation({
    mutationFn: () => fn({ data: { path, level } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rm = mutation.data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Career Roadmap</h1>
        <p className="mt-1 text-muted-foreground">Get a personalized step-by-step path to your dream role.</p>
      </header>

      <div className="glass-card grid gap-4 rounded-xl p-5 md:grid-cols-3">
        <div className="space-y-1.5 md:col-span-2">
          <Label>Target path</Label>
          <Select value={path} onValueChange={setPath}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PATHS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Current level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 flex justify-end">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate roadmap
          </Button>
        </div>
      </div>

      {rm && (
        <div className="space-y-5">
          <div className="glass-card flex items-center gap-3 rounded-xl p-5">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Estimated timeline</div>
              <div className="text-lg font-semibold">{rm.timeline}</div>
            </div>
          </div>

          <ol className="relative ml-3 space-y-5 border-l border-border pl-6">
            {rm.phases.map((p, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</span>
                <div className="glass-card rounded-xl p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">{p.duration}</span>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <Block icon={Wrench} label="Skills" items={p.skills} />
                    <Block icon={Folder} label="Projects" items={p.projects} />
                    <Block icon={BookMarked} label="Resources" items={p.resources} />
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 font-medium text-primary"><Award className="h-4 w-4" /> Recommended certifications</div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {rm.certifications.map((c) => (
                <li key={c} className="rounded-full border border-border bg-card/60 px-3 py-1 text-sm">{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Block({ icon: Icon, label, items }: { icon: typeof Award; label: string; items: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((it, i) => <li key={i} className="text-foreground/90">• {it}</li>)}
      </ul>
    </div>
  );
}
