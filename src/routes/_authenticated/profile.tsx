import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getDashboard, updateProfile } from "@/lib/ai.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  User,
  Github,
  TrendingUp,
  FileText,
  Wrench,
  Sparkles,
  X,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — DevAI" }] }),
  component: Page,
});

// ─── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  @keyframes float-orb {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(22px,-16px) scale(1.04); }
    66%      { transform:translate(-12px,12px) scale(0.97); }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes card-enter {
    from { opacity:0; transform:translateY(12px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes shimmer {
    from { transform:translateX(-100%); }
    to   { transform:translateX(100%); }
  }
  @keyframes skill-pop {
    from { opacity:0; transform:scale(0.7) translateY(4px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes success-pop {
    0%   { transform:scale(0.6); opacity:0; }
    70%  { transform:scale(1.15); opacity:1; }
    100% { transform:scale(1); opacity:1; }
  }

  /* Glass panel */
  .glass-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(14px);
  }
  :root:not(.dark) .glass-panel {
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(0,0,0,0.08);
  }

  /* Semantic text */
  .t-heading { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .t-heading { color: rgba(0,0,0,0.88); }
  .t-sub { color: rgba(255,255,255,0.42); }
  :root:not(.dark) .t-sub { color: rgba(0,0,0,0.42); }
  .t-body { color: rgba(255,255,255,0.65); }
  :root:not(.dark) .t-body { color: rgba(0,0,0,0.65); }

  /* Field inputs */
  .field-input {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: rgba(255,255,255,0.88) !important;
    transition: border-color 0.25s, box-shadow 0.25s !important;
    border-radius: 12px !important;
  }
  :root:not(.dark) .field-input {
    background: rgba(0,0,0,0.03) !important;
    border: 1px solid rgba(0,0,0,0.1) !important;
    color: rgba(0,0,0,0.88) !important;
  }
  .field-input:focus {
    border-color: rgba(99,102,241,0.55) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
    outline: none !important;
  }
  .field-input::placeholder { color: rgba(255,255,255,0.22) !important; }
  :root:not(.dark) .field-input::placeholder { color: rgba(0,0,0,0.28) !important; }

  /* Select trigger */
  .select-trigger-custom {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: rgba(255,255,255,0.88) !important;
    border-radius: 12px !important;
    transition: border-color 0.25s !important;
  }
  :root:not(.dark) .select-trigger-custom {
    background: rgba(0,0,0,0.03) !important;
    border: 1px solid rgba(0,0,0,0.1) !important;
    color: rgba(0,0,0,0.88) !important;
  }
  .select-trigger-custom:focus, .select-trigger-custom[data-state=open] {
    border-color: rgba(99,102,241,0.5) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
  }

  /* Skill chip */
  .skill-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.22);
    color: #818cf8;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  }
  :root:not(.dark) .skill-chip {
    background: rgba(99,102,241,0.08);
    border-color: rgba(99,102,241,0.2);
  }
  .skill-chip:hover {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.3);
    color: #f87171;
    box-shadow: 0 0 10px rgba(239,68,68,0.15);
    transform: scale(1.04);
  }
  .skill-chip .chip-x {
    opacity: 0.5;
    transition: opacity 0.2s;
  }
  .skill-chip:hover .chip-x { opacity: 1; }

  /* CTA button */
  .btn-cta {
    background: linear-gradient(135deg,#4f46e5,#7c3aed 60%,#6366f1);
    box-shadow: 0 0 22px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.2);
    transition: box-shadow 0.3s, transform 0.15s, opacity 0.2s;
    color: #fff;
    font-weight: 800;
    border-radius: 12px;
    border: none;
    position: relative;
    overflow: hidden;
  }
  .btn-cta:hover:not(:disabled) {
    box-shadow: 0 0 36px rgba(99,102,241,0.55), 0 6px 20px rgba(0,0,0,0.3);
  }
  .btn-cta:active:not(:disabled) { transform:scale(0.97); }
  .btn-cta:disabled { opacity:0.45; cursor:not-allowed; }

  /* Add skill button */
  .btn-add {
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.25);
    color: #818cf8;
    border-radius: 12px;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    font-weight: 700;
  }
  .btn-add:hover {
    background: rgba(99,102,241,0.2);
    border-color: rgba(99,102,241,0.4);
    box-shadow: 0 0 12px rgba(99,102,241,0.2);
  }
  .btn-add:active { transform:scale(0.96); }

  .divider-line { background: rgba(255,255,255,0.06); }
  :root:not(.dark) .divider-line { background: rgba(0,0,0,0.07); }
`;

// ─── Background orbs ───────────────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden>
      {[
        { c: "#6366f1", s: 480, x: "5%", y: "5%", d: "0s", t: "18s" },
        { c: "#8b5cf6", s: 320, x: "75%", y: "10%", d: "7s", t: "22s" },
        { c: "#10b981", s: 260, x: "80%", y: "68%", d: "14s", t: "20s" },
      ].map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.s,
            height: o.s,
            left: o.x,
            top: o.y,
            background: `radial-gradient(circle,${o.c},transparent 70%)`,
            opacity: 0.055,
            animation: `float-orb ${o.t} ${o.d} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Accent line ───────────────────────────────────────────────────────────────

function AccentLine({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg,transparent,${color}70,transparent)` }}
    />
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  icon: Icon,
  label,
  hint,
  children,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  hint?: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <div className="space-y-2" style={{ animation: `fade-up 0.45s ${delay}ms ease both` }}>
      <Label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest t-sub">
        <Icon className="h-3 w-3" />
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] t-sub leading-relaxed">{hint}</p>}
    </div>
  );
}

// ─── Level config ──────────────────────────────────────────────────────────────

const LEVELS = [
  { value: "junior", label: "Junior", color: "#60a5fa" },
  { value: "mid", label: "Mid", color: "#34d399" },
  { value: "senior", label: "Senior", color: "#a78bfa" },
  { value: "staff", label: "Staff", color: "#fbbf24" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

function Page() {
  const fetcher = useServerFn(getDashboard);
  const updater = useServerFn(updateProfile);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetcher(),
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [level, setLevel] = useState("junior");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [justSaved, setJustSaved] = useState(false);

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
    mutationFn: () =>
      updater({
        data: { name, bio, github_username: github, experience_level: level, skills },
      }),
    onSuccess: () => {
      toast.success("Profile updated!");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2200);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput("");
  }

  const currentLevel = LEVELS.find((l) => l.value === level) ?? LEVELS[0];

  return (
    <>
      <style>{STYLES}</style>
      <BackgroundOrbs />

      <div className="mx-auto max-w-2xl space-y-8 pb-16">
        {/* ── Header ── */}
        <header className="space-y-4 pt-1">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              animation: "fade-up 0.5s 0.05s ease both",
            }}
          >
            <Zap className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              Developer Profile
            </span>
          </div>

          <div style={{ animation: "fade-up 0.5s 0.1s ease both" }}>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none t-heading">
              Your
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg,#818cf8 0%,#a78bfa 45%,#34d399 100%)",
                }}
              >
                profile
              </span>
            </h1>
          </div>

          <p
            className="text-sm t-sub max-w-sm leading-relaxed"
            style={{ animation: "fade-up 0.5s 0.15s ease both" }}
          >
            Personalize DevAI's suggestions, roadmaps, and health scores for your exact situation.
          </p>
        </header>

        {/* ── Form card ── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="glass-panel relative rounded-2xl overflow-hidden"
          style={{ animation: "card-enter 0.5s 0.2s cubic-bezier(0.34,1.1,0.64,1) both" }}
        >
          <AccentLine color="#6366f1" />

          {/* Corner glow */}
          <div
            className="absolute -top-16 -left-16 h-40 w-40 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }}
          />
          <div
            className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }}
          />

          {/* Form header */}
          <div className="relative flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <User className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-black t-heading">Personal details</div>
              <div className="text-[11px] t-sub mt-0.5">Used to tailor every AI recommendation</div>
            </div>

            {/* Saved indicator */}
            {justSaved && (
              <div
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  color: "#34d399",
                  animation: "success-pop 0.4s ease both",
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved!
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="relative px-6 py-6 space-y-6">
            {/* Name */}
            <Field icon={User} label="Display name" delay={60}>
              <Input
                className="field-input h-11"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            {/* GitHub */}
            <Field
              icon={Github}
              label="GitHub username"
              hint="Used to pull repository activity into your health score."
              delay={100}
            >
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold t-sub select-none">
                  github.com/
                </span>
                <Input
                  className="field-input h-11 pl-[90px]"
                  placeholder="octocat"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
            </Field>

            {/* Divider */}
            <div className="h-px divider-line" />

            {/* Experience level */}
            <Field icon={TrendingUp} label="Experience level" delay={140}>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="select-trigger-custom h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                        {l.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Level visual bar */}
              <div className="flex gap-1.5 mt-2" style={{ animation: "fade-in 0.4s ease both" }}>
                {LEVELS.map((l, i) => {
                  const idx = LEVELS.findIndex((x) => x.value === level);
                  const active = i <= idx;
                  return (
                    <div
                      key={l.value}
                      className="h-1 flex-1 rounded-full transition-all duration-500"
                      style={{
                        background: active ? currentLevel.color : "rgba(255,255,255,0.08)",
                        boxShadow: active ? `0 0 6px ${currentLevel.color}60` : "none",
                      }}
                    />
                  );
                })}
                <span
                  className="text-[10px] font-black ml-1 transition-colors duration-300"
                  style={{ color: currentLevel.color }}
                >
                  {currentLevel.label}
                </span>
              </div>
            </Field>

            {/* Bio */}
            <Field
              icon={FileText}
              label="Bio"
              hint="A short summary of your background, goals, and experience."
              delay={180}
            >
              <Textarea
                className="field-input resize-none"
                rows={4}
                placeholder="I'm a frontend developer with 3 years of experience, focused on React and TypeScript…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Field>

            {/* Divider */}
            <div className="h-px divider-line" />

            {/* Skills */}
            <Field
              icon={Wrench}
              label="Skills"
              hint="Press Enter or click + to add. Click a skill to remove it."
              delay={220}
            >
              {/* Input row */}
              <div className="flex gap-2">
                <Input
                  className="field-input h-11 flex-1"
                  placeholder="e.g. React, TypeScript, Docker…"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-add h-11 w-11 flex items-center justify-center flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Chips */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
                      className="skill-chip"
                      style={{
                        animation: `skill-pop 0.35s ${i * 30}ms cubic-bezier(0.34,1.2,0.64,1) both`,
                      }}
                      title="Click to remove"
                    >
                      {s}
                      <X className="chip-x h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}

              {skills.length === 0 && (
                <p
                  className="text-[11px] t-sub italic pt-1"
                  style={{ animation: "fade-in 0.3s ease both" }}
                >
                  No skills added yet.
                </p>
              )}

              {/* Skill count */}
              {skills.length > 0 && (
                <div className="flex items-center justify-end">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      color: "#818cf8",
                    }}
                  >
                    {skills.length} skill{skills.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </Field>
          </div>

          {/* Footer / Submit */}
          <div
            className="relative px-6 pb-6"
            style={{ animation: "fade-up 0.45s 0.36s ease both" }}
          >
            <div className="h-px divider-line mb-5" />
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-cta w-full h-12 flex items-center justify-center gap-2.5 text-sm"
            >
              {/* shimmer sweep */}
              <div
                className="absolute inset-0 pointer-events-none -skew-x-12"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",
                  animation: mutation.isPending ? "none" : "shimmer 2.5s ease infinite",
                }}
              />

              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin relative z-10" />
                  <span className="relative z-10">Saving profile…</span>
                </>
              ) : justSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Profile saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Save profile</span>
                </>
              )}
            </button>

            <p
              className="text-center text-[11px] t-sub mt-3 leading-relaxed"
              style={{ animation: "fade-in 0.5s 0.5s ease both" }}
            >
              Your profile data powers the AI roadmap, health score, and job match features.
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
