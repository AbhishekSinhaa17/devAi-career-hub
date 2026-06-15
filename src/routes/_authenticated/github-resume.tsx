import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { generateGithubResume, saveResume, generateCoverLetter } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Github, Award, Sparkles, Save, Edit3, Download, FileText, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/github-resume")({
  head: () => ({ meta: [{ title: "GitHub Resume Generator — DevAI" }] }),
  component: GithubResumePage,
});

function GithubResumePage() {
  const [username, setUsername] = useState("");
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const navigate = useNavigate();

  const genResumeFn = useServerFn(generateGithubResume);
  const saveResumeFn = useServerFn(saveResume);
  const genCoverLetterFn = useServerFn(generateCoverLetter);

  const mutation = useMutation({
    mutationFn: () => genResumeFn({ data: { username } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = mutation.data;
      if (!data) throw new Error("No resume to save");
      return saveResumeFn({
        data: {
          title: `GitHub Resume: ${data.developerType}`,
          content: data.resumeData,
          score: data.insights.atsScore,
          ai_suggestions: data.insights.missingSkills,
        }
      });
    },
    onSuccess: () => toast.success("Resume saved to your library!"),
    onError: (e: Error) => toast.error(e.message),
  });

  const coverLetterMutation = useMutation({
    mutationFn: () => {
      if (!mutation.data) throw new Error("No resume generated yet");
      return genCoverLetterFn({
        data: {
          resume: mutation.data.resumeData,
          jobRole: mutation.data.developerType,
        }
      });
    },
    onSuccess: (data) => {
      setCoverLetter(data.coverLetter);
      setIsCoverLetterOpen(true);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleEditInBuilder = () => {
    if (!mutation.data) return;
    sessionStorage.setItem("importedGithubResume", JSON.stringify(mutation.data.resumeData));
    navigate({ to: "/resume" });
  };

  const data = mutation.data;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">GitHub Resume Generator</h1>
          <p className="mt-1 text-muted-foreground">Turn your open-source work into a professional, ATS-ready resume.</p>
        </div>
      </header>

      <div className="glass-card rounded-xl p-6 max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim()) mutation.mutate();
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="pl-9"
              disabled={mutation.isPending}
            />
          </div>
          <Button disabled={mutation.isPending || !username.trim()} type="submit" className="gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate
          </Button>
        </form>
      </div>

      {mutation.isPending && (
        <div className="flex h-64 flex-col items-center justify-center p-8 text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="animate-pulse font-medium text-lg">Analyzing Repositories & Inferring Tech Stack...</p>
          <p className="text-muted-foreground text-sm max-w-sm">
            We are deeply reading your code structure, READMEs, and topics to craft a professional summary.
          </p>
        </div>
      )}

      {data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Top Overview & Badges */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="glass-card rounded-xl p-6 flex items-center justify-between col-span-1 md:col-span-2 relative overflow-hidden bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
              <div className="space-y-2 relative z-10">
                <div className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                  <Github className="h-4 w-4" /> AI Inferred Profile
                </div>
                <h2 className="text-3xl font-bold">{data.developerType}</h2>
                <p className="text-muted-foreground max-w-md">{data.insights.specialization} · {data.insights.experienceLevel}</p>
                
                {data.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-2">
                    {data.badges.map((b, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-background border border-border shadow-sm text-foreground">
                        <Award className="h-3.5 w-3.5 text-amber-500" /> {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Profile Strength</h3>
              <div className="text-5xl font-bold gradient-text">{data.profileStrength}</div>
              <p className="text-xs text-muted-foreground mt-2">Based on repo quality & activity</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Sidebar Insights */}
            <div className="lg:col-span-4 space-y-6">
              {/* Actions */}
              <div className="glass-card rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">One Click Actions</h3>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full justify-start gap-2" variant="outline">
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save to My Resumes
                </Button>
                <Button onClick={handleEditInBuilder} className="w-full justify-start gap-2" variant="outline">
                  <Edit3 className="h-4 w-4" /> Edit in Resume Builder
                </Button>
                <Button onClick={() => window.print()} className="w-full justify-start gap-2" variant="outline">
                  <Download className="h-4 w-4" /> Export PDF
                </Button>
                <Button onClick={() => coverLetterMutation.mutate()} disabled={coverLetterMutation.isPending} className="w-full justify-start gap-2" variant="default">
                  {coverLetterMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Generate Cover Letter
                </Button>
              </div>

              {/* Insights */}
              <div className="glass-card rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">AI Career Insights</h3>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">ATS Score</div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-semibold text-green-500">{data.insights.atsScore}/100</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Top Missing Skills</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {data.insights.missingSkills.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-md border border-red-500/20">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Recommended Roles</div>
                  <ul className="space-y-1">
                    {data.insights.recommendedRoles.map((r, i) => (
                      <li key={i} className="text-sm flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-primary" /> {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Resume Preview */}
            <div className="lg:col-span-8">
              <div className="glass-card rounded-xl p-1 overflow-hidden">
                <div className="bg-muted/50 p-3 border-b flex items-center justify-between">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Generated Preview
                  </div>
                </div>
                <div className="p-8 bg-white text-zinc-900 shadow-inner rounded-b-lg print:shadow-none print:p-0" style={{ fontFamily: "Inter, sans-serif" }}>
                  <div className="border-b border-zinc-300 pb-4">
                    <h1 className="text-3xl font-bold">{data.resumeData.fullName}</h1>
                    <p className="text-zinc-600 font-medium">{data.resumeData.title}</p>
                    <p className="mt-2 text-xs text-zinc-500">github.com/{username} · Generated by DevAI</p>
                  </div>
                  
                  <div className="mt-4">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Professional Summary</h2>
                    <p className="text-sm">{data.resumeData.summary}</p>
                  </div>

                  <div className="mt-4">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Technical Skills</h2>
                    <p className="text-sm leading-relaxed">{data.resumeData.skills.join(" · ")}</p>
                  </div>

                  <div className="mt-4">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Key Projects</h2>
                    {data.resumeData.projects.map((p, i) => (
                      <div key={i} className="mb-3 last:mb-0">
                        <div className="text-sm font-semibold">{p.name} <span className="text-xs font-normal text-zinc-500 ml-1">— {p.tech}</span></div>
                        <p className="text-xs text-zinc-700 mt-0.5">{p.description}</p>
                      </div>
                    ))}
                  </div>

                  {data.insights.achievements.length > 0 && (
                    <div className="mt-4">
                      <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Achievements & Highlights</h2>
                      <ul className="list-disc pl-4 space-y-1">
                        {data.insights.achievements.map((a, i) => (
                          <li key={i} className="text-xs text-zinc-700">{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      <Dialog open={isCoverLetterOpen} onOpenChange={setIsCoverLetterOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generated Cover Letter</DialogTitle>
            <DialogDescription>AI-crafted cover letter based on your GitHub profile.</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm mt-4 p-4 bg-muted rounded-lg border">
            {coverLetter}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
