import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  Github,
  FileText,
  Code2,
  MessageSquare,
  Map,
  User,
  Sparkles,
  LogOut,
  Shield,
  Briefcase,
  Activity,
  Home,
  ChevronRight,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isAdmin as isAdminFn } from "@/lib/admin.functions";
import { ThemeToggle } from "./ThemeToggle";

// ─── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  @keyframes float-orb {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(14px,-10px) scale(1.03); }
    66%      { transform:translate(-8px,8px) scale(0.98); }
  }
  @keyframes logo-enter {
    from { opacity:0; transform:translateY(-8px) scale(0.95); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes nav-item-enter {
    from { opacity:0; transform:translateX(-14px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes footer-enter {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    from { transform:translateX(-100%); }
    to   { transform:translateX(100%); }
  }
  @keyframes active-glow-pulse {
    0%,100% { opacity:0.6; }
    50%      { opacity:1; }
  }
  @keyframes mobile-slide-up {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes drawer-slide-in {
    from { opacity:0; transform:translateX(-100%); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }

  /* ── Sidebar shell ── */
  .sidebar-shell {
    background: rgba(8, 8, 16, 0.55);
    backdrop-filter: blur(28px) saturate(180%);
    border-right: 1px solid rgba(255,255,255,0.07);
  }
  :root:not(.dark) .sidebar-shell {
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(28px) saturate(180%);
    border-right: 1px solid rgba(0,0,0,0.07);
  }

  /* ── Mobile header ── */
  .mobile-header {
    background: rgba(8,8,16,0.7);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  :root:not(.dark) .mobile-header {
    background: rgba(255,255,255,0.8);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  /* ── Mobile bottom bar ── */
  .mobile-bottom {
    background: rgba(8,8,16,0.8);
    backdrop-filter: blur(24px);
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  :root:not(.dark) .mobile-bottom {
    background: rgba(255,255,255,0.9);
    border-top: 1px solid rgba(0,0,0,0.07);
  }

  /* ── Mobile drawer overlay ── */
  .drawer-overlay {
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    animation: fade-in 0.25s ease both;
  }
  .drawer-panel {
    background: rgba(8,8,16,0.95);
    backdrop-filter: blur(32px);
    border-right: 1px solid rgba(255,255,255,0.08);
    animation: drawer-slide-in 0.35s cubic-bezier(0.34,1.1,0.64,1) both;
    width: 280px;
  }
  :root:not(.dark) .drawer-panel {
    background: rgba(255,255,255,0.97);
    border-right: 1px solid rgba(0,0,0,0.08);
  }

  /* ── Logo box ── */
  .logo-box {
    background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
    border: 1px solid rgba(139,92,246,0.3);
    box-shadow: 0 0 18px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative;
    overflow: hidden;
  }
  .logo-box::after {
    content:'';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent, rgba(255,255,255,0.06), transparent);
    animation: shimmer 3s ease infinite;
  }

  /* ── Nav items ── */
  .nav-item {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    transition: background 0.25s ease, transform 0.25s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.25s ease;
  }
  .nav-item:hover {
    background: rgba(255,255,255,0.05);
    transform: translateX(3px);
  }
  :root:not(.dark) .nav-item:hover {
    background: rgba(0,0,0,0.04);
  }

  /* Active indicator bar */
  .nav-item::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%) scaleY(0);
    width: 3px; height: 60%;
    background: linear-gradient(180deg, #6366f1, #a78bfa, #34d399);
    border-radius: 0 4px 4px 0;
    transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1);
  }
  .nav-item.active::before { transform: translateY(-50%) scaleY(1); }

  /* Active background + glow */
  .nav-item.active {
    background: rgba(99,102,241,0.1);
    box-shadow: inset 0 0 24px rgba(99,102,241,0.06), 0 1px 0 rgba(99,102,241,0.08);
  }
  :root:not(.dark) .nav-item.active {
    background: rgba(99,102,241,0.08);
  }

  /* Shimmer sweep on hover */
  .nav-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
    transform: translateX(-100%);
    transition: transform 0s;
  }
  .nav-item:hover::after {
    transform: translateX(100%);
    transition: transform 0.5s ease;
  }

  /* ── Section labels ── */
  .nav-section-label {
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.2);
    padding: 0 14px;
    margin-bottom: 4px;
    margin-top: 16px;
  }
  :root:not(.dark) .nav-section-label { color: rgba(0,0,0,0.25); }

  /* ── Sign-out button ── */
  .signout-btn {
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
    color: rgba(255,255,255,0.35);
  }
  :root:not(.dark) .signout-btn {
    border-color: rgba(0,0,0,0.07);
    color: rgba(0,0,0,0.38);
  }
  .signout-btn:hover {
    background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.22);
    color: #f87171;
    transform: translateX(2px);
  }

  /* ── Semantic text ── */
  .t-heading { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .t-heading { color: rgba(0,0,0,0.88); }
  .t-sub { color: rgba(255,255,255,0.38); }
  :root:not(.dark) .t-sub { color: rgba(0,0,0,0.38); }

  /* ── Mobile nav dot indicator ── */
  .mobile-nav-dot {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #818cf8;
    box-shadow: 0 0 6px #818cf8;
  }

  /* ── Theme Adaptations ── */
  .nav-icon-badge {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
  }
  :root:not(.dark) .nav-icon-badge {
    background: rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.08);
  }
  .nav-icon-badge.active {
    background: rgba(99,102,241,0.2);
    border: 1px solid rgba(99,102,241,0.35);
  }

  .nav-icon { color: rgba(255,255,255,0.4); }
  :root:not(.dark) .nav-icon { color: rgba(0,0,0,0.45); }
  .nav-icon.active { color: #818cf8; }

  .nav-label { color: rgba(255,255,255,0.45); }
  :root:not(.dark) .nav-label { color: rgba(0,0,0,0.55); }
  .nav-label.active { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .nav-label.active { color: rgba(0,0,0,0.9); }

  .mobile-icon-badge {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
  }
  :root:not(.dark) .mobile-icon-badge {
    background: rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.08);
  }
  .mobile-icon-badge.active {
    background: rgba(99,102,241,0.2);
    border: 1px solid rgba(99,102,241,0.3);
    box-shadow: 0 0 10px rgba(99,102,241,0.25);
  }

  .mobile-icon { color: rgba(255,255,255,0.35); }
  :root:not(.dark) .mobile-icon { color: rgba(0,0,0,0.45); }
  .mobile-icon.active { color: #818cf8; }

  .mobile-label { color: rgba(255,255,255,0.3); }
  :root:not(.dark) .mobile-label { color: rgba(0,0,0,0.4); }
  .mobile-label.active { color: #818cf8; }

  .footer-badge {
    background: rgba(99,102,241,0.07);
    border: 1px solid rgba(99,102,241,0.15);
  }
  :root:not(.dark) .footer-badge {
    background: rgba(99,102,241,0.04);
    border: 1px solid rgba(99,102,241,0.1);
  }

  /* ── Menu button ── */
  .menu-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    transition: background 0.2s, border-color 0.2s;
  }
  :root:not(.dark) .menu-btn {
    background: rgba(0,0,0,0.04);
    border-color: rgba(0,0,0,0.08);
  }
  .menu-btn:hover {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.25);
  }

  /* ── Scrollbar ── */
  .sidebar-scroll::-webkit-scrollbar { width: 4px; }
  .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
  }
  :root:not(.dark) .sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
  }
`;

// ─── Nav structure ──────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/", icon: Home, label: "Home" },
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/github", icon: Github, label: "GitHub Analyzer" },
      { to: "/github-resume", icon: Github, label: "GitHub Resume" },
      { to: "/resume", icon: FileText, label: "Resume Builder" },
      { to: "/code-review", icon: Code2, label: "Code Reviewer" },
      { to: "/mock-interview", icon: MessageSquare, label: "Mock Interviews" },
      { to: "/interview", icon: MessageSquare, label: "Interview Hub" },
    ],
  },
  {
    label: "Career",
    items: [
      { to: "/roadmap", icon: Map, label: "Roadmap" },
      { to: "/job-match", icon: Briefcase, label: "Job Match" },
      { to: "/developer-score", icon: Activity, label: "Developer Score" },
      { to: "/health-score", icon: Activity, label: "Health Score" },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/profile", icon: User, label: "Profile" }],
  },
] as const;

// Flat list for mobile + admin appending
type NavItem = { to: string; icon: React.ElementType; label: string };
const NAV_FLAT: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items as unknown as NavItem[]);

// ─── Sidebar ambient orbs ───────────────────────────────────────────────────────

function SidebarOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {[
        { c: "#6366f1", s: 180, x: "-20%", y: "5%", t: "18s", d: "0s" },
        { c: "#8b5cf6", s: 140, x: "40%", y: "45%", t: "22s", d: "8s" },
        { c: "#10b981", s: 100, x: "-10%", y: "82%", t: "20s", d: "14s" },
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
            opacity: 0.07,
            animation: `float-orb ${o.t} ${o.d} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Logo ──────────────────────────────────────────────────────────────────────

function Logo({ animate }: { animate: boolean }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{ animation: animate ? "logo-enter 0.5s cubic-bezier(0.34,1.1,0.64,1) both" : "none" }}
    >
      <div className="logo-box h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0">
        <Sparkles
          className="h-4.5 w-4.5 text-indigo-400 relative z-10"
          style={{ width: 18, height: 18 }}
        />
      </div>
      <div>
        <div className="text-lg font-black tracking-tight leading-none t-heading">DevAI</div>
        <div className="text-[9px] font-black uppercase tracking-[0.15em] t-sub mt-0.5">
          Career Hub
        </div>
      </div>
    </div>
  );
}

// ─── Nav item ──────────────────────────────────────────────────────────────────

function NavLink({
  item,
  active,
  delay,
  animate,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  delay: number;
  animate: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      onClick={onClick}
      style={{
        animation: animate
          ? `nav-item-enter 0.4s ${delay}ms cubic-bezier(0.34,1.1,0.64,1) both`
          : "none",
      }}
      className={`nav-item flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold w-full ${
        active ? "active" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon badge */}
        <div className={`nav-icon-badge h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${active ? "active" : ""}`}>
          <Icon className={`nav-icon h-3.5 w-3.5 transition-colors duration-300 ${active ? "active" : ""}`} />
        </div>

        <span className={`nav-label transition-colors duration-300 text-[13px] ${active ? "active" : ""}`}>
          {item.label}
        </span>
      </div>

      {active && (
        <ChevronRight
          className="h-3 w-3 flex-shrink-0"
          style={{ color: "#818cf8", opacity: 0.6 }}
        />
      )}
    </Link>
  );
}

// ─── Sidebar nav content (shared between desktop + drawer) ─────────────────────

function SidebarNav({
  items,
  pathname,
  animate,
  onItemClick,
}: {
  items: NavItem[];
  pathname: string;
  animate: boolean;
  onItemClick?: () => void;
}) {
  // Build sections, appending admin item to Account if present
  const adminItem = items.find((i) => i.to === "/admin");

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items as unknown as NavItem[],
  }));

  // Add admin under Account if present
  const withAdmin = sections.map((s) => {
    if (s.label === "Account" && adminItem) {
      return { ...s, items: [...s.items, adminItem] };
    }
    return s;
  });

  let delay = 0;

  return (
    <div className="space-y-0.5">
      {withAdmin.map((section) => (
        <div key={section.label}>
          <div className="nav-section-label">{section.label}</div>
          {section.items.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            delay += 28;
            return (
              <NavLink
                key={item.to}
                item={item}
                active={active}
                delay={delay}
                animate={animate}
                onClick={onItemClick}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Sign-out button ────────────────────────────────────────────────────────────

function SignOutButton({ onSignOut, animate }: { onSignOut: () => void; animate: boolean }) {
  return (
    <button
      onClick={onSignOut}
      className="signout-btn flex w-full items-center gap-3 px-4 py-3 text-[13px] font-bold"
      style={{
        animation: animate ? "footer-enter 0.5s 0.4s ease both" : "none",
      }}
    >
      <div
        className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.15)",
        }}
      >
        <LogOut className="h-3.5 w-3.5 text-red-400/70" />
      </div>
      Sign out
    </button>
  );
}

// ─── Score pill in sidebar footer ──────────────────────────────────────────────

function SidebarFooterBadge({ animate }: { animate: boolean }) {
  return (
    <div
      className="footer-badge mx-2 mb-3 px-3 py-2.5 rounded-xl overflow-hidden relative"
      style={{
        animation: animate ? "footer-enter 0.5s 0.3s ease both" : "none",
      }}
    >
      {/* shimmer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)",
          animation: "shimmer 4s ease infinite",
        }}
      />
      <div className="flex items-center gap-2.5 relative">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.25))",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
        </div>
        <div>
          <div className="text-[11px] font-black t-heading leading-none">AI-Powered</div>
          <div className="text-[9px] t-sub mt-0.5 font-semibold">All features active</div>
        </div>
        <div
          className="ml-auto h-2 w-2 rounded-full flex-shrink-0"
          style={{
            background: "#34d399",
            boxShadow: "0 0 6px #34d399",
            animation: "active-glow-pulse 2s ease infinite",
          }}
        />
      </div>
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkAdmin = useServerFn(isAdminFn);
  const adminQ = useQuery({
    queryKey: ["admin-access"],
    queryFn: () => checkAdmin(),
  });

  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const adminItem: NavItem | undefined = adminQ.data?.isAdmin
    ? { to: "/admin", icon: Shield, label: "Admin" }
    : undefined;

  const allItems: NavItem[] = adminItem ? [...NAV_FLAT, adminItem] : NAV_FLAT;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  }

  // Mobile bottom bar items (first 5 most important)
  const mobileBottomItems: NavItem[] = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/github", icon: Github, label: "GitHub" },
    { to: "/developer-score", icon: Activity, label: "Score" },
    { to: "/job-match", icon: Briefcase, label: "Jobs" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      <style>{STYLES}</style>

      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar-shell sticky top-0 hidden h-screen w-64 flex-col md:flex z-40 flex-shrink-0 relative overflow-hidden">
        <SidebarOrbs />

        {/* Logo */}
        <div className="flex h-[72px] items-center justify-between px-5 flex-shrink-0 relative z-10 w-full">
          <Link to="/dashboard" className="flex items-center">
            <Logo animate={mounted} />
          </Link>
          <ThemeToggle />
        </div>

        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-[72px] h-px"
          style={{
            background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)",
          }}
        />

        {/* Nav */}
        <div className="flex-1 overflow-y-auto sidebar-scroll px-3 py-3 relative z-10">
          <SidebarNav items={allItems} pathname={pathname} animate={mounted} />
        </div>

        {/* Bottom accent line */}
        <div
          className="h-px mx-3"
          style={{
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)",
          }}
        />

        {/* Footer */}
        <div className="flex-shrink-0 py-3 relative z-10">
          <SidebarFooterBadge animate={mounted} />
          <div className="px-2">
            <SignOutButton onSignOut={signOut} animate={mounted} />
          </div>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <header className="mobile-header fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 md:hidden">
        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="menu-btn h-9 w-9 flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4 t-heading" />
        </button>

        {/* Logo center */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="logo-box h-8 w-8 rounded-xl flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 relative z-10" />
          </div>
          <span className="font-black text-base tracking-tight t-heading">DevAI</span>
        </Link>

        {/* Right slot — live dot */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: "#34d399", boxShadow: "0 0 6px #34d399" }}
            />
            <span className="text-[10px] font-black uppercase tracking-widest t-sub hidden xs:block">
              Live
            </span>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="drawer-overlay fixed inset-0 z-50 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="drawer-panel fixed inset-y-0 left-0 z-50 flex flex-col md:hidden overflow-hidden">
            <SidebarOrbs />

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-14 flex-shrink-0 relative z-10">
              <Logo animate={false} />
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="menu-btn h-8 w-8 flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4 t-heading" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px mx-4"
              style={{
                background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)",
              }}
            />

            {/* Nav */}
            <div className="flex-1 overflow-y-auto sidebar-scroll px-3 py-3 relative z-10">
              <SidebarNav
                items={allItems}
                pathname={pathname}
                animate={false}
                onItemClick={() => setDrawerOpen(false)}
              />
            </div>

            {/* Divider */}
            <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.05)" }} />

            {/* Footer */}
            <div className="flex-shrink-0 py-3 relative z-10">
              <SidebarFooterBadge animate={false} />
              <div className="px-2">
                <SignOutButton onSignOut={signOut} animate={false} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 w-full min-w-0 pt-14 pb-20 md:pt-0 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-12">{children}</div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-bottom fixed inset-x-0 bottom-0 z-40 flex justify-around px-2 py-2 md:hidden">
        {mobileBottomItems.map((item, i) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200"
              style={{
                animation: `mobile-slide-up 0.4s ${i * 50}ms ease both`,
                background: active ? "rgba(99,102,241,0.1)" : "transparent",
              }}
            >
              {/* Icon */}
              <div className={`mobile-icon-badge h-7 w-7 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? "active" : ""}`}>
                <Icon className={`mobile-icon h-3.5 w-3.5 transition-colors duration-300 ${active ? "active" : ""}`} />
              </div>

              {/* Label */}
              <span className={`mobile-label text-[9px] font-black uppercase tracking-wide transition-colors duration-300 ${active ? "active" : ""}`}>
                {item.label.split(" ")[0]}
              </span>

              {/* Active dot */}
              {active && <span className="mobile-nav-dot" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
