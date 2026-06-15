import { createFileRoute } from "@tanstack/react-router";
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
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Aurora />
      <Nav />
      <Hero />
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
