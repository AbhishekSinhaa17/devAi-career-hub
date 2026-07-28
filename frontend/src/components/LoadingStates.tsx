import { Activity, Zap, LucideIcon } from "lucide-react";
import React from "react";

const STYLES = `
  @keyframes spin-slow {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes pulse-ring {
    0%   { transform:scale(1);   opacity:0.5; }
    100% { transform:scale(1.7); opacity:0; }
  }
`;

export function PageLoadingState({
  title = "Loading...",
  subtitle = "Please wait a moment.",
  icon: Icon = Activity,
}: {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
}) {
  return (
    <div
      className="flex h-96 min-h-[300px] flex-col items-center justify-center gap-5 text-center"
      role="status"
      aria-live="polite"
    >
      <style>{STYLES}</style>
      <div className="relative">
        <div
          className="h-16 w-16 rounded-full"
          style={{
            border: "2px solid rgba(99,102,241,0.15)",
            borderTop: "2px solid #6366f1",
            animation: "spin-slow 1s linear infinite",
          }}
        />
        <div
          className="absolute inset-2 rounded-full"
          style={{
            border: "2px solid rgba(99,102,241,0.08)",
            borderBottom: "2px solid #8b5cf6",
            animation: "spin-slow 1.5s linear infinite reverse",
          }}
        />
        <Icon className="absolute inset-0 m-auto h-5 w-5 text-indigo-400" />
      </div>
      <div>
        <p className="text-base font-black text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

export function PageEmptyState({
  title = "No data found",
  subtitle = "Get started by creating something new.",
  icon: Icon = Activity,
  actionLabel = "Generate",
  actionIcon: ActionIcon = Zap,
  onAction,
  children,
}: {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="flex h-96 min-h-[300px] flex-col items-center justify-center gap-6 text-center"
      role="status"
      aria-live="polite"
    >
      <style>{STYLES}</style>
      <div
        className="relative h-20 w-20 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            border: "1px solid rgba(99,102,241,0.3)",
            animation: "pulse-ring 2s ease-out infinite",
          }}
        />
        <Icon className="h-8 w-8 text-indigo-400" />
      </div>
      <div>
        <h2 className="text-xl font-black text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm leading-relaxed">{subtitle}</p>
      </div>
      {children}
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 h-11 px-6 rounded-xl font-black text-sm text-white"
          style={{
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            boxShadow: "0 0 22px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.2)",
            transition: "box-shadow 0.3s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 36px rgba(99,102,241,0.55), 0 6px 20px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 22px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.2)";
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(0.97)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        >
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
