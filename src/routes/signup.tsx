import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Github,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Code2,
  GitBranch,
  FileText,
  Brain,
  Rocket,
  TrendingUp,
  Terminal,
  Zap,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create Account — DevAI" }] }),
  component: SignupPage,
});

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(texts: string[], speed = 80, pause = 2200) {
  const [displayed, setDisplayed] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIndex <= current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex));
        setCharIndex((c) => c + 1);
      }, speed);
    } else if (!deleting && charIndex > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex));
        setCharIndex((c) => c - 1);
      }, speed / 2);
    } else {
      setDeleting(false);
      setTextIndex((t) => (t + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed, pause]);

  return displayed;
}

// ─── Password Strength ────────────────────────────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  checks: { label: string; pass: boolean }[];
} {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const levels = [
    { label: "Too weak", color: "#ef4444" },
    { label: "Weak", color: "#f97316" },
    { label: "Fair", color: "#eab308" },
    { label: "Strong", color: "#22c55e" },
    { label: "Very strong", color: "#10b981" },
  ];
  return { score, checks, ...levels[score] };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, color, checks } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Bar */}
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{
              backgroundColor: i < score ? color : "var(--color-border)",
              boxShadow: i < score ? `0 0 6px ${color}80` : "none",
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold" style={{ color }}>
          {label}
        </span>
      </div>
      {/* Checks */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.pass ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="h-3 w-3 text-slate-400 dark:text-slate-600 flex-shrink-0" />
            )}
            <span
              className={`text-[10px] font-medium transition-colors ${c.pass ? "text-slate-700 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"}`}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Floating Code Lines ──────────────────────────────────────────────────────
const CODE_SNIPPETS = [
  "const career = await ai.accelerate(you)",
  "git push origin feature/new-job",
  "resume.generate({ ats: true, ai: true })",
  "portfolio.deploy({ impressHR: true })",
  "interview.practice({ rounds: Infinity })",
  "roadmap.create({ goal: 'staff-engineer' })",
];

function FloatingCodeLine({ text, delay, top }: { text: string; delay: number; top: string }) {
  return (
    <div
      className="absolute left-0 whitespace-nowrap font-mono text-xs text-emerald-600/40 dark:text-emerald-400/30 select-none pointer-events-none"
      style={{
        top,
        animation: `signup-codeFloat ${20 + delay}s linear ${delay}s infinite`,
      }}
    >
      <span className="text-teal-500/60 dark:text-teal-400/50">$ </span>
      {text}
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: GitBranch,
    label: "GitHub Analysis",
    color: "#10b981",
    glow: "rgba(16,185,129,0.3)",
    desc: "Deep profile insights",
  },
  {
    icon: FileText,
    label: "AI Resumes",
    color: "#0ea5e9",
    glow: "rgba(14,165,233,0.3)",
    desc: "ATS-optimized in seconds",
  },
  {
    icon: Brain,
    label: "Mock Interviews",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.3)",
    desc: "Practice with AI panels",
  },
  {
    icon: Code2,
    label: "Code Reviews",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    desc: "Instant AI feedback",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[0]; index: number }) {
  const Icon = feature.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#030712]/40 backdrop-blur-sm p-3.5 cursor-default overflow-hidden shadow-sm dark:shadow-none"
      style={{
        transition: "all 0.4s cubic-bezier(0.34,1.2,0.64,1)",
        boxShadow: hovered ? `0 0 20px ${feature.glow}, inset 0 0 20px ${feature.glow}` : "none",
        borderColor: hovered ? feature.color + "40" : undefined,
        transform: hovered ? "translateY(-3px) scale(1.02)" : "none",
      }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${feature.color}15 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />
      <div className="relative z-10 flex items-start gap-3">
        <div
          className="rounded-xl p-2 flex-shrink-0 mt-0.5 transition-all duration-300"
          style={{
            backgroundColor: feature.color + "20",
            boxShadow: hovered ? `0 0 14px ${feature.glow}` : "none",
          }}
        >
          <Icon
            className="h-4 w-4"
            style={{
              color: feature.color,
              transform: hovered ? "scale(1.2) rotate(8deg)" : "scale(1)",
              transition: "transform 0.3s ease",
            }}
          />
        </div>
        <div>
          <p
            className="text-sm font-bold transition-colors duration-300 text-slate-900 dark:text-[#e2e8f0]"
            style={{ color: hovered ? feature.color : undefined }}
          >
            {feature.label}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{feature.desc}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);

  const typewriterText = useTypewriter(
    [
      "your dream job.",
      "interview confidence.",
      "a standout portfolio.",
      "your career roadmap.",
      "ATS-perfect resumes.",
    ],
    75,
    2200,
  );

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: name },
        },
      });
      if (error) throw error;
      setSuccess(true);
      toast.success("Welcome to DevAI! Check your email to confirm.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    navigate({ to: "/dashboard" });
  }


  return (
    <div
      id="signup-page"
      className="flex min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-foreground transition-colors duration-500"
    >
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white transition-colors group"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] group-hover:bg-slate-100 dark:group-hover:bg-white/[0.08] transition-colors shadow-sm dark:shadow-none">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden md:block">
          Back to Home
        </span>
      </Link>

      {/* ── Left side: Auth Form ── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10">
        <div
          className="w-full max-w-[400px] mx-auto"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(-20px)",
            transition: "all 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-10">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Zap className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              DevAI
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Create an account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              Start building your developer career for free.
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                <Mail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Check your email</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[300px] mx-auto">
                We've sent a magic link to{" "}
                <span className="text-slate-900 dark:text-white font-semibold">{email}</span>. Click
                it to activate your account.
              </p>
            </div>
          ) : (
            <>
              {/* OAuth */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="group relative h-11 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2.5 font-semibold text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white overflow-hidden shadow-sm dark:shadow-none"
                >
                  <svg className="h-4 w-4 flex-shrink-0 relative z-10" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="relative z-10">Google</span>
                </button>

              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">
                  or continue with email
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 group/f">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-600 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors pointer-events-none" />
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-white/[0.04] focus:ring-0 focus:shadow-lg focus:shadow-emerald-500/10 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/15"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 group/f">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-600 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors pointer-events-none" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-white/[0.04] focus:ring-0 focus:shadow-lg focus:shadow-emerald-500/10 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/15"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 group/f">
                  <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-600 group-focus-within/f:text-emerald-600 dark:group-focus-within/f:text-emerald-400 transition-colors pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-11 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white dark:focus:bg-white/[0.04] focus:ring-0 focus:shadow-lg focus:shadow-emerald-500/10 transition-all duration-300 hover:border-slate-300 dark:hover:border-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && <PasswordStrengthMeter password={password} />}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || password.length < 6}
                    className="group/btn relative w-full h-12 rounded-xl font-bold text-sm text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
                      boxShadow:
                        "0 0 24px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right side: Promotional Content ── */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-center px-16 xl:px-24 border-l border-slate-200 dark:border-white/[0.05] overflow-hidden bg-slate-50 dark:bg-[#03080c] transition-colors duration-500">
        {/* Abstract animated backgrounds */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Floating Code */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {CODE_SNIPPETS.map((s, i) => (
            <FloatingCodeLine key={i} text={s} delay={i * 4} top={`${15 + i * 15}%`} />
          ))}
        </div>

        <div
          className="relative z-10 w-full max-w-lg"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(40px)",
            transition: "all 1s cubic-bezier(0.34,1.2,0.64,1) 200ms",
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 backdrop-blur-xl mb-6">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-[0.2em]">
              Join 12,000+ Developers
            </span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] mb-4">
            <span className="text-slate-900 dark:text-white">Build</span>
            <br />
            <span className="text-slate-900 dark:text-white">the career</span>
            <br />
            <span
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent"
              style={{
                backgroundSize: "200% 100%",
                animation: "signup-gradientShift 4s ease infinite",
              }}
            >
              you deserve.
            </span>
          </h1>

          {/* Typewriter */}
          <div className="flex items-center gap-3 mb-10">
            <Terminal className="h-5 w-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 animate-pulse" />
            <p className="text-xl text-slate-600 dark:text-slate-300 font-mono">
              Land{" "}
              <span className="text-emerald-600 dark:text-emerald-300 font-semibold">
                {typewriterText}
                <span className="inline-block w-0.5 h-5 bg-emerald-500 dark:bg-emerald-400 ml-0.5 align-middle animate-blink" />
              </span>
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.label} feature={f} index={i} />
            ))}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 pt-6 border-t border-slate-200 dark:border-white/[0.08]">
            {[
              { icon: "🔒", text: "256-bit SSL" },
              { icon: "✨", text: "Free Forever" },
              { icon: "⚡", text: "Instant Setup" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2">
                <span className="text-sm">{b.icon}</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes signup-codeFloat {
          0% { transform: translateX(-50px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(600px); opacity: 0; }
        }
        @keyframes signup-gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes signup-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        #signup-page .animate-blink {
          animation: signup-blink 1s step-end infinite;
        }
        #signup-page input:-webkit-autofill,
        #signup-page input:-webkit-autofill:hover,
        #signup-page input:-webkit-autofill:focus {
          -webkit-box-shadow: inset 0 0 0 40px var(--color-background) !important;
          -webkit-text-fill-color: var(--color-foreground) !important;
          caret-color: var(--color-foreground) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
