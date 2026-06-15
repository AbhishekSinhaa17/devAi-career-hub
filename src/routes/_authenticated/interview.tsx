import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { generateInterview, generateDeveloperScore } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({ meta: [{ title: "Interview Hub — DevAI" }] }),
  component: Page,
});

const CATEGORIES = ["JavaScript", "React", "Node.js", "MongoDB", "SQL", "DSA", "System Design", "Behavioral"];
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

function Page() {
  const [role, setRole] = useState("Full Stack Developer");
  const [category, setCategory] = useState("React");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("medium");
  const fn = useServerFn(generateInterview);
  const genDevScoreFn = useServerFn(generateDeveloperScore);
  const mutation = useMutation({
    mutationFn: () => fn({ data: { role, category, difficulty, count: 5 } }),
    onSuccess: () => {
      genDevScoreFn({ data: undefined }).catch(console.error);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Interview Hub</h1>
        <p className="mt-1 text-muted-foreground">Generate role-specific questions with model answers and interviewer notes.</p>
      </header>

      <div className="glass-card grid gap-4 rounded-xl p-5 md:grid-cols-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label>Role</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate questions
          </Button>
        </div>
      </div>

      {mutation.data && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 pb-3">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">{mutation.data.questions.length} questions for a {role}</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {mutation.data.questions.map((q, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger className="text-left">{i + 1}. {q.question}</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Model answer</div>
                    <p className="mt-1 text-sm">{q.answer}</p>
                  </div>
                  <div className="rounded-md border border-border bg-muted/40 p-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">What they look for</div>
                    <p className="mt-1 text-sm text-foreground/90">{q.explanation}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
