import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { reviewCode } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bug, Shield, Zap, Sparkles, Loader2, FileCode, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/code-review")({
  head: () => ({ meta: [{ title: "AI Code Reviewer — DevAI" }] }),
  component: Page,
});

const LANGS = ["javascript", "typescript", "python", "go", "rust", "java", "c++", "ruby", "php"];

function Page() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const fn = useServerFn(reviewCode);
  const mutation = useMutation({
    mutationFn: () => fn({ data: { code, language } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const fb = mutation.data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">AI Code Reviewer</h1>
        <p className="mt-1 text-muted-foreground">Paste code below — DevAI checks for bugs, security, performance, and clean code.</p>
      </header>

      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-3 pb-3">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{code.length.toLocaleString()} chars</span>
        </div>
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste your code here…"
          className="min-h-[260px] font-mono text-sm"
        />
        <div className="mt-3 flex justify-end">
          <Button disabled={!code.trim() || mutation.isPending} onClick={() => mutation.mutate()} className="gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Review code
          </Button>
        </div>
      </div>

      {fb && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold">Overall</h3>
            <p className="mt-2 text-sm text-muted-foreground">{fb.overall}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Section icon={Bug} title="Bugs" items={fb.bugs} tone="destructive" />
            <Section icon={Shield} title="Security" items={fb.security} tone="warning" />
            <Section icon={Zap} title="Performance" items={fb.performance} tone="primary" />
            <Section icon={FileCode} title="Clean code" items={fb.cleanCode} tone="success" />
            <Section icon={BookOpen} title="Best practices" items={fb.bestPractices} tone="primary" className="md:col-span-2" />
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, items, tone, className }: { icon: typeof Bug; title: string; items: string[]; tone: string; className?: string }) {
  const toneCls = tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-primary";
  return (
    <div className={`glass-card rounded-xl p-5 ${className ?? ""}`}>
      <div className={`flex items-center gap-2 font-medium ${toneCls}`}><Icon className="h-4 w-4" /> {title}</div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No issues found here.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${toneCls.replace("text-", "bg-")}`} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
