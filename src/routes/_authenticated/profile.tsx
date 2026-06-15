import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getDashboard, updateProfile } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — DevAI" }] }),
  component: Page,
});

function Page() {
  const fetcher = useServerFn(getDashboard);
  const updater = useServerFn(updateProfile);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetcher() });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [level, setLevel] = useState("junior");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (data?.profile) {
      setName(data.profile.name ?? "");
      setBio(data.profile.bio ?? "");
      setGithub(data.profile.github_username ?? "");
      setLevel(data.profile.experience_level ?? "junior");
      setSkills(data.profile.skills ?? []);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => updater({ data: { name, bio, github_username: github, experience_level: level, skills } }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">Personalize DevAI&apos;s suggestions for you.</p>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        className="glass-card space-y-5 rounded-xl p-6"
      >
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>GitHub username</Label>
          <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="e.g. octocat" />
        </div>
        <div className="space-y-1.5">
          <Label>Experience level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["junior", "mid", "senior", "staff"].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Bio</Label>
          <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Skills</Label>
          <div className="flex gap-2">
            <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Add a skill" />
            <Button type="button" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {skills.map((s) => (
              <button key={s} type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="group rounded-full border border-border bg-card px-3 py-1 text-xs hover:border-destructive/60">
                {s} <span className="text-muted-foreground group-hover:text-destructive">×</span>
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={mutation.isPending} className="w-full gap-2">
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save profile
        </Button>
      </form>
    </div>
  );
}
