import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  Github,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Code2,
  Zap,
  Shield,
  Brain,
  GitBranch,
  FileText,
  Cpu,
  Lightbulb,
  Rocket,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create Account — DevAI" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    if (!cardRef.current) return;
    const cardRect = cardRef.current.getBoundingClientRect();
    const cardCenterX = cardRect.width / 2;
    const cardCenterY = cardRect.height / 2;
    const rotateX = (e.clientY - cardRect.top - cardCenterY) / 40;
    const rotateY = (e.clientX - cardRect.left - cardCenterX) / -40;

    cardRef.current.style.transition = "transform 0.1s ease-out";
    cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out";
      cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
  };

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
      toast.success("Welcome to DevAI! Check your email to confirm.");
      setEmail("");
      setPassword("");
      setName("");
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
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) {
      toast.error(error.message ?? "Google sign-in failed");
      setLoading(false);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    navigate({ to: "/dashboard" });
  }

  async function handleGithub() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });
    if (error) {
      toast.error(error.message ?? "GitHub sign-in failed");
      setLoading(false);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
  }

  const features = [
    { icon: GitBranch, title: "GitHub Analysis", color: "#10b981" },
    { icon: FileText, title: "AI Resumes", color: "#3b82f6" },
    { icon: Brain, title: "Mock Interviews", color: "#8b5cf6" },
    { icon: Code2, title: "Code Reviews", color: "#f59e0b" },
    { icon: TrendingUp, title: "Career Paths", color: "#ef4444" },
    { icon: Rocket, title: "Portfolio Builder", color: "#06b6d4" },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Enhanced animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_0%,rgba(99,102,241,0.1)_25%,transparent_50%,rgba(168,85,247,0.1)_75%,transparent_100%)] bg-[length:400%_400%] animate-gradient-shift" />

        {/* Floating orbs with different colors */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-primary/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-40 w-96 h-96 bg-gradient-to-tl from-blue-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000" />

        {/* Grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02] dark:opacity-[0.05]" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Spotlight that follows mouse */}
        <div
          className="absolute rounded-full transition-all duration-200 ease-out pointer-events-none"
          style={{
            width: "300px",
            height: "300px",
            left: `${mousePos.x - 150}px`,
            top: `${mousePos.y - 150}px`,
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.1) 30%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 1,
          }}
        />
      </div>

      {/* Main layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl px-4 py-8 items-center">
        {/* Left side - Features showcase */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          {/* Animated header */}
          <div className="space-y-6">
            <div className="inline-block">
              <div className="relative inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm hover:border-primary/60 hover:bg-primary/10 transition-all duration-500 group cursor-default">
                <Sparkles className="h-4 w-4 text-primary animate-spin group-hover:animate-bounce" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  AI-Powered Developer Platform
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4 group">
                <span className="inline-block animate-slide-up text-foreground">Unlock your</span>
                <br />
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient animate-slide-up animation-delay-100">
                  full potential
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md animate-fade-in animation-delay-200">
                Get AI-powered insights into your code, build stunning resumes, and master your next
                interview.
              </p>
            </div>
          </div>

          {/* Feature grid with hover effects */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md p-4 hover:border-primary/30 hover:bg-card/80 transition-all duration-500 overflow-hidden cursor-default animate-slide-up"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  {/* Feature glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${feature.color}15 0%, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div
                      className="inline-block p-2 rounded-lg mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        backgroundColor: `${feature.color}20`,
                      }}
                    >
                      <Icon
                        className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
                        style={{ color: feature.color }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </p>
                  </div>

                  {/* Border gradient animation */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}40 0%, transparent 100%)`,
                      borderRadius: "1rem",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40">
            {[
              { label: "50K+", desc: "Repos Analyzed" },
              { label: "12K+", desc: "Careers Transformed" },
              { label: "4.9/5", desc: "Developer Rating" },
            ].map((stat, i) => (
              <div key={i} className="group cursor-default">
                <div className="text-2xl font-black text-primary group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-500 transition-all duration-500">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest font-semibold mt-1">
                  {stat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth card */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 space-y-4 text-center">
            <div className="inline-block mx-auto">
              <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase">DevAI</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Start your career journey</h1>
            <p className="text-muted-foreground text-sm">Create an account to unlock AI-powered tools.</p>
          </div>

          {/* Card container */}
          <div
            ref={cardRef}
            className="group relative rounded-3xl border border-border/40 bg-background/60 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden"
            style={{
              boxShadow: `0 25px 50px -12px rgba(99, 102, 241, 0.15)`,
            }}
          >
            {/* Card inner glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Animated top border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* OAuth buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleGoogle}
                  disabled={loading}
                  variant="outline"
                  className="h-12 w-full rounded-xl bg-foreground/5 border-border/50 hover:bg-foreground/10 hover:border-primary/40 text-foreground font-semibold transition-all duration-300 group/btn hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <svg
                    className="h-5 w-5 transition-transform group-hover/btn:rotate-12"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      opacity="0.8"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      opacity="0.8"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      opacity="0.8"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      opacity="0.8"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </Button>

                <Button
                  onClick={handleGithub}
                  disabled={loading}
                  variant="outline"
                  className="h-12 w-full rounded-xl bg-foreground/5 border-border/50 hover:bg-foreground/10 hover:border-primary/40 text-foreground font-semibold transition-all duration-300 group/btn hover:shadow-lg hover:shadow-slate-500/20"
                >
                  <Github className="h-5 w-5 transition-transform group-hover/btn:rotate-12" />
                  <span className="ml-2">GitHub</span>
                </Button>
              </div>

              {/* Divider with animation */}
              <div className="relative flex items-center gap-3 py-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Continue with email
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field */}
                <div className="space-y-2.5 group/field">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-foreground/80 transition-colors group-focus-within/field:text-primary">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60 transition-all duration-300 group-focus-within/field:text-primary group-focus-within/field:scale-110" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Doe"
                      required
                      className="h-12 w-full rounded-xl bg-foreground/5 border-border/50 placeholder:text-muted-foreground/50 pl-12 text-foreground font-medium transition-all duration-300 focus:bg-foreground/10 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/30 focus:outline-none hover:bg-foreground/10 hover:border-border/80"
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className="space-y-2.5 group/field">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-foreground/80 transition-colors group-focus-within/field:text-primary">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60 transition-all duration-300 group-focus-within/field:text-primary group-focus-within/field:scale-110" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your@email.com"
                      required
                      className="h-12 w-full rounded-xl bg-foreground/5 border-border/50 placeholder:text-muted-foreground/50 pl-12 text-foreground font-medium transition-all duration-300 focus:bg-foreground/10 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/30 focus:outline-none hover:bg-foreground/10 hover:border-border/80"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2.5 group/field">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-foreground/80 transition-colors group-focus-within/field:text-primary">
                      Password
                    </Label>
                    <Link
                      to="/"
                      className="text-xs font-medium text-primary/80 hover:text-primary transition-all duration-300 hover:underline underline-offset-2"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60 transition-all duration-300 group-focus-within/field:text-primary group-focus-within/field:scale-110" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      required
                      className="h-12 w-full rounded-xl bg-foreground/5 border-border/50 placeholder:text-muted-foreground/50 pl-12 pr-12 text-foreground font-medium transition-all duration-300 focus:bg-foreground/10 focus:border-primary/60 focus:shadow-lg focus:shadow-primary/30 focus:outline-none hover:bg-foreground/10 hover:border-border/80"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-all duration-300 p-1 hover:scale-110"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full mt-6 rounded-xl font-bold text-lg relative overflow-hidden bg-gradient-to-r from-primary via-purple-500 to-pink-500 shadow-2xl shadow-primary/50 hover:shadow-primary/70 transition-all duration-300 active:scale-[0.98] group/submit"
                >
                  {/* Button shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/submit:translate-x-full transition-transform duration-500" />

                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover/submit:translate-x-1 group-hover/submit:scale-110" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              {/* Sign in link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-primary hover:text-primary/80 transition-all duration-300 hover:underline underline-offset-2"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Shield, label: "Secure" },
              { icon: Zap, label: "Fast" },
              { icon: Brain, label: "Smart" },
            ].map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div
                  key={i}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-foreground/5 hover:bg-foreground/10 hover:border-primary/40 p-3 transition-all duration-300 cursor-default"
                >
                  <Icon className="h-5 w-5 text-primary transition-transform group-hover:scale-125 group-hover:rotate-12" />
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground/60">
            By signing up, you agree to our{" "}
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
            >
              Privacy
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-gradient-shift {
          animation: gradient-shift 8s ease infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: inset 0 0 0 30px rgba(255, 255, 255, 0.05) !important;
          -webkit-text-fill-color: white !important;
          caret-color: white !important;
        }
      `}</style>
    </div>
  );
}
