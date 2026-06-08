"use client";

import { Navigation } from "@/components/marketing/Navigation";
import { Footer } from "@/components/marketing/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-primary">
      <Navigation />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto prose prose-invert prose-brand">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-foreground/60 text-sm mb-12">Last updated: May 14, 2026</p>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold mb-4 text-brand-accent uppercase tracking-widest text-sm">1. Agreement to Terms</h2>
              <p className="text-foreground/60 leading-relaxed">
                By accessing or using Insight AI, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-brand-accent uppercase tracking-widest text-sm">2. Use License</h2>
              <p className="text-foreground/60 leading-relaxed">
                Permission is granted to temporarily use our services for personal or commercial brand tracking and analytics purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-brand-accent uppercase tracking-widest text-sm">3. Disclaimer</h2>
              <p className="text-foreground/60 leading-relaxed">
                The materials on Insight AI's website are provided on an 'as is' basis. Insight AI makes no warranties, expressed or implied.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
