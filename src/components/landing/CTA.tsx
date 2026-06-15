import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "./shared";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="px-6 py-20">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/60 to-chart-2/10 px-8 py-16 text-center backdrop-blur-xl">
          <div className="aurora-blob aurora-cta" />
          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Ready to accelerate your developer career?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join thousands of developers using DevAI to land their next role.
            </p>
            <Link to="/auth" className="mt-8 inline-block">
              <Button
                size="lg"
                className="group h-12 gap-2 px-8 text-base shadow-xl shadow-primary/25"
              >
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
