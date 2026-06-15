import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { generateMockInterviewQuestions, evaluateMockInterview } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Clock, CheckCircle2, AlertCircle, PlayCircle, Mic, Star, Target, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mock-interview")({
  head: () => ({ meta: [{ title: "Mock Interview Simulator — DevAI" }] }),
  component: MockInterviewPage,
});

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "React Developer", "Node.js Developer", "Software Engineer"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TYPES = ["Technical Interview", "HR Interview", "Mixed Interview"];
const TIMERS = [
  { label: "Untimed (Default)", value: 0 },
  { label: "2 Minutes", value: 120 },
  { label: "5 Minutes", value: 300 },
  { label: "10 Minutes", value: 600 },
];

function MockInterviewPage() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState(ROLES[2]);
  const [level, setLevel] = useState(LEVELS[1]);
  const [type, setType] = useState(TYPES[0]);
  const [timerOpt, setTimerOpt] = useState(0);

  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const [report, setReport] = useState<any | null>(null);
  const [detailedFeedback, setDetailedFeedback] = useState<any[]>([]);
  const [status, setStatus] = useState<"setup" | "generating" | "interview" | "evaluating" | "report">("setup");

  const genQuestionsFn = useServerFn(generateMockInterviewQuestions);
  const evalInterviewFn = useServerFn(evaluateMockInterview);

  const genMutation = useMutation({
    mutationFn: () => genQuestionsFn({ data: { jobRole: role, experienceLevel: level, interviewType: type } }),
    onMutate: () => setStatus("generating"),
    onSuccess: (data) => {
      setInterviewId(data.id);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setCurrentQ(0);
      setStatus("interview");
      if (timerOpt > 0) setTimeRemaining(timerOpt);
      else setTimeRemaining(null);
    },
    onError: (e: Error) => {
      setStatus("setup");
      toast.error(e.message);
    },
  });

  const evalMutation = useMutation({
    mutationFn: () => evalInterviewFn({ data: { interviewId: interviewId!, answers } }),
    onMutate: () => setStatus("evaluating"),
    onSuccess: (data) => {
      setReport(data.report);
      setDetailedFeedback(data.detailedAnswers);
      setStatus("report");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => {
      setStatus("interview");
      toast.error(e.message);
    },
  });

  // Timer logic
  useEffect(() => {
    if (status !== "interview" || timeRemaining === null) return;
    if (timeRemaining <= 0) {
      toast.info("Time's up! Auto-submitting interview...");
      evalMutation.mutate();
      return;
    }
    const iv = setInterval(() => setTimeRemaining(t => (t ? t - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [timeRemaining, status, evalMutation]);

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
    else evalMutation.mutate();
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Mock Interview Simulator</h1>
          <p className="mt-1 text-muted-foreground">Experience a full interactive interview with AI evaluation and scoring.</p>
        </div>
        {status === "report" && (
          <Button onClick={() => setStatus("setup")} variant="outline">Start New Interview</Button>
        )}
      </header>

      {status === "setup" && (
        <div className="glass-card max-w-3xl rounded-xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Job Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interview Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Limit</Label>
              <Select value={timerOpt.toString()} onValueChange={(v) => setTimerOpt(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIMERS.map(t => <SelectItem key={t.value} value={t.value.toString()}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground flex items-start gap-3">
            <Mic className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p>Future Update: Voice Interview preparation is heavily factored into our architecture. Right now, type your answers out fully as if speaking to an interviewer.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button size="lg" onClick={() => genMutation.mutate()} className="gap-2 w-full md:w-auto">
              <PlayCircle className="h-5 w-5" /> Start Interview
            </Button>
          </div>
        </div>
      )}

      {status === "generating" && (
        <div className="flex h-64 flex-col items-center justify-center p-8 text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="animate-pulse font-medium text-lg">Preparing your interview...</p>
          <p className="text-muted-foreground text-sm max-w-sm">
            Our AI is reading your GitHub and Resume data to generate highly tailored questions.
          </p>
        </div>
      )}

      {status === "interview" && questions.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                Question {currentQ + 1} of {questions.length}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{questions[currentQ].type}</div>
            </div>
            {timeRemaining !== null && (
              <div className={`flex items-center gap-2 font-mono text-lg ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                <Clock className="h-5 w-5" /> {formatTime(timeRemaining)}
              </div>
            )}
          </div>

          <div className="glass-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-medium leading-relaxed">{questions[currentQ].question}</h2>
            
            <div className="space-y-3">
              <Label className="text-muted-foreground">Your Answer</Label>
              <Textarea 
                value={answers[currentQ]} 
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[currentQ] = e.target.value;
                  setAnswers(newAnswers);
                }}
                placeholder="Type your answer here..."
                className="min-h-[250px] resize-y text-base p-4 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={currentQ === 0}>Previous</Button>
            <Button onClick={handleNext} className="gap-2">
              {currentQ === questions.length - 1 ? "Submit Interview" : "Next Question"} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {status === "evaluating" && (
        <div className="flex h-64 flex-col items-center justify-center p-8 text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="animate-pulse font-medium text-lg">Evaluating your performance...</p>
          <p className="text-muted-foreground text-sm max-w-sm">
            Analyzing technical accuracy, communication style, and problem-solving skills.
          </p>
        </div>
      )}

      {status === "report" && report && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="glass-card rounded-xl p-8 border-t-4 border-t-primary bg-gradient-to-br from-background to-primary/5">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-1 flex flex-col items-center justify-center text-center border-r border-border/50 pr-4">
                <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Overall Score</div>
                <div className="text-7xl font-bold tracking-tighter gradient-text">{report.overallScore}</div>
                <div className="text-sm text-muted-foreground mt-2">Excellent Performance</div>
              </div>
              <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-6">
                <ScoreMetric label="Technical Knowledge" value={report.technicalScore} />
                <ScoreMetric label="Communication" value={report.communicationScore} />
                <ScoreMetric label="Problem Solving" value={report.problemSolvingScore} />
                <ScoreMetric label="Confidence" value={report.confidenceScore} />
                <ScoreMetric label="Industry Readiness" value={report.industryReadiness} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-green-500" /> Key Strengths</h3>
              <ul className="space-y-2">
                {report.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> <span className="text-muted-foreground">{s}</span></li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-6 rounded-xl space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" /> Areas to Improve</h3>
              <ul className="space-y-2">
                {report.weaknesses.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" /> <span className="text-muted-foreground">{s}</span></li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-6 rounded-xl space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Next Steps</h3>
              <ul className="space-y-2">
                {report.nextSteps.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /> <span className="text-muted-foreground">{s}</span></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Detailed Question Review</h2>
            <div className="space-y-4">
              {detailedFeedback.map((df, i) => (
                <div key={i} className="glass-card rounded-xl p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-medium text-lg leading-snug">Q{i+1}: {questions[i].question}</h3>
                    <div className="text-lg font-bold text-primary shrink-0">{df.ai_score}/100</div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Your Answer</div>
                      <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-3 rounded-md">{df.user_answer || "No answer provided."}</p>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">AI Feedback</div>
                      <p className="text-sm text-foreground/80 leading-relaxed bg-primary/5 p-3 rounded-md border border-primary/10">{df.ai_feedback}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function ScoreMetric({ label, value }: { label: string, value: number }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">{label}</div>
      <div className="flex items-end gap-2">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground mb-1">/100</div>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full mt-2 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
