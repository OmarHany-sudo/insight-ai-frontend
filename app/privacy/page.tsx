"use client";

import { Navigation } from "@/components/marketing/Navigation";
import { Footer } from "@/components/marketing/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-primary">
      <Navigation />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto prose prose-invert prose-brand">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-foreground/60 text-sm mb-12">Last updated: May 14, 2026</p>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold mb-4 text-brand-accent uppercase tracking-widest text-sm">1. Information We Collect</h2>
              <p className="text-foreground/60 leading-relaxed">
                We collect information you provide directly to us when you create an account, update your profile, or use our analytics services. This includes your name, email address, and billing information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-brand-accent uppercase tracking-widest text-sm">2. How We Use Information</h2>
              <p className="text-foreground/60 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, including the generation of AI search visibility analytics and brand tracking reports.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 text-brand-accent uppercase tracking-widest text-sm">3. Data Security</h2>
              <p className="text-foreground/60 leading-relaxed">
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
