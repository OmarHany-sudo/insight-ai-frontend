"use client";

import { Navigation } from "@/components/marketing/Navigation";
import { Footer } from "@/components/marketing/Footer";
import { useTranslation } from "@/hooks/useTranslation";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-brand-primary">
      <Navigation />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gradient">
            {t.marketing.about.title}
          </h1>
          <p className="text-xl text-foreground/60 leading-relaxed mb-12">
            {t.marketing.about.subtitle}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left mt-20">
            <div className="p-8 rounded-3xl border border-brand-border bg-brand-surface/30 glass">
              <h3 className="text-2xl font-bold mb-4 text-brand-accent">Transparency</h3>
              <p className="text-foreground/60">We believe in making AI decision-making visible. No more black boxes—know exactly why engines recommend your brand.</p>
            </div>
            <div className="p-8 rounded-3xl border border-brand-border bg-brand-surface/30 glass">
              <h3 className="text-2xl font-bold mb-4 text-brand-accent">Innovation</h3>
              <p className="text-foreground/60">Leading the charge in GEO (Generative Engine Optimization) with proprietary metrics and real-time tracking.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
