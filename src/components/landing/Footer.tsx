import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-2">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          DevAI © {new Date().getFullYear()}
        </div>

      </div>
    </footer>
  );
}
