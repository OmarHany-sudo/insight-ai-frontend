"use client";

"use client";

import { Navigation } from "@/components/marketing/Navigation";
import { Footer } from "@/components/marketing/Footer";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function CareersPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-brand-primary">
      <Navigation />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
            {t.marketing.careers.titlePrefix} <span className="text-brand-accent">{t.marketing.careers.titleAccent}</span> {t.marketing.careers.titleSuffix}
          </h1>
          <p className="text-xl text-foreground/60 leading-relaxed mb-16 max-w-2xl mx-auto">
            {t.marketing.careers.subtitle}
          </p>
          
          <div className="space-y-4 text-left">
            {t.marketing.careers.jobs.map((job, i) => (
              <div key={i} className="p-6 rounded-2xl border border-brand-border bg-brand-surface/30 glass flex items-center justify-between hover:border-brand-accent/50 transition-all cursor-pointer group">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-brand-accent transition-colors">{job.title}</h3>
                  <p className="text-xs text-foreground/40 mt-1 uppercase tracking-widest font-bold">{job.location} • {job.type}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-foreground/20 group-hover:text-brand-accent transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
