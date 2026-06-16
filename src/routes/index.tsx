import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Aurora, StyleInjector } from "@/components/landing/shared";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Features } from "@/components/landing/Features";
import { Stats } from "@/components/landing/Stats";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevAI — Your AI-Powered Developer Career Assistant" },
      {
        name: "description",
        content:
          "Analyze GitHub. Build ATS Resumes. Create Portfolios. Crack Interviews. All powered by AI.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Aurora />
      <Nav session={session} />
      <Hero session={session} />
      <Marquee />
      <Features />
      <Stats />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
      <StyleInjector />
    </div>
  );
}
