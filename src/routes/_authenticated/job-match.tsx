import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import { analyzeJobMatch, getJobMatchesHistory, generateDeveloperScore } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, UploadCloud, FileText, Target, Briefcase, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
// Fix for pdfjs-dist worker in vite
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

export const Route = createFileRoute("/_authenticated/job-match")({
  head: () => ({ meta: [{ title: "Job Match Analyzer — DevAI" }] }),
  component: Page,
});

function Page() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }

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
      toast.success("Resume text extracted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to extract text from PDF.");
    } finally {
      setIsExtracting(false);
    }
  }

  function handleAnalyze() {
    if (!resumeText) return toast.error("Please upload a resume.");
    if (!jobRole.trim()) return toast.error("Please enter a job role.");
    if (!jobDescription.trim()) return toast.error("Please paste the job description.");
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

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Job Match Analyzer</h1>
          <p className="mt-1 text-muted-foreground">See how well your resume matches a specific job description.</p>
        </div>
      </header>

      {/* Input Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Resume
          </h2>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${resumeFile ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"}`}
          >
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            {resumeFile ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 mx-auto text-primary" />
                <p className="text-sm font-medium">{resumeFile.name}</p>
                {isExtracting ? (
                  <p className="text-xs text-muted-foreground animate-pulse">Extracting text...</p>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="mt-2">
                    Change PDF
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Upload your Resume</p>
                  <p className="text-xs text-muted-foreground">PDF files only</p>
                </div>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> Job Details
          </h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Target Job Role</Label>
              <Input
                placeholder="e.g. Senior Frontend Developer"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Job Description</Label>
              <Textarea
                placeholder="Paste the full job description here..."
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {result && (
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Start Over
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={mutation.isPending || isExtracting || !resumeFile || !jobRole || !jobDescription}
          className="gap-2"
        >
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {mutation.isPending ? "Analyzing Match..." : "Analyze Job Match"}
        </Button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="glass-card rounded-xl p-5 md:p-8 text-center space-y-2">
            <h2 className="text-xl font-semibold">Match Analysis</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{result.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <ScoreCard title="ATS Score" score={result.atsScore} subtitle="Resume parsing" />
            <ScoreCard title="Hiring Probability" score={result.hiringProbability} subtitle="Overall fit" />
            <ScoreCard title="Interview Readiness" score={result.interviewReadiness} subtitle="Preparedness" />
            <ScoreCard title="Skill Match" score={Math.round((result.matchingSkills.length / (result.matchingSkills.length + result.missingSkills.length || 1)) * 100)} subtitle="Keywords found" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card rounded-xl p-5 space-y-4 border-t-4 border-t-green-500">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" /> Key Strengths
              </h3>
              <ul className="space-y-2 text-sm">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />{s}</li>
                ))}
              </ul>
            </div>
            
            <div className="glass-card rounded-xl p-5 space-y-4 border-t-4 border-t-destructive">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" /> Critical Weaknesses
              </h3>
              <ul className="space-y-2 text-sm">
                {result.weaknesses.map((s, i) => (
                  <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />{s}</li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-primary">Matched Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.length > 0 ? result.matchingSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20">{s}</span>
                )) : <span className="text-sm text-muted-foreground">No matching skills found.</span>}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-orange-500">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.length > 0 ? result.missingSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-500 text-xs font-medium border border-orange-500/20">{s}</span>
                )) : <span className="text-sm text-muted-foreground">No missing skills!</span>}
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-5 space-y-4 md:col-span-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Actionable Suggestions
              </h3>
              <ul className="space-y-2 text-sm">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="pt-8">
        <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Job Role</th>
                  <th className="px-6 py-3">Resume Name</th>
                  <th className="px-6 py-3">ATS Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {historyQ.isLoading ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">Loading history...</td></tr>
                ) : historyQ.data?.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">No past analyses found.</td></tr>
                ) : (
                  historyQ.data?.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium">{item.job_role}</td>
                      <td className="px-6 py-4 text-muted-foreground">{item.resume_file_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.ats_score >= 80 ? 'bg-green-500/10 text-green-500' : item.ats_score >= 60 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                          {item.ats_score}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ title, score, subtitle }: { title: string; score: number; subtitle: string }) {
  return (
    <div className="glass-card rounded-xl p-5 text-center flex flex-col justify-center gap-1">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="text-4xl font-semibold gradient-text py-1">{score}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}
