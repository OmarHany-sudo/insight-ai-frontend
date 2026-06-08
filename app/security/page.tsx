"use client";

import { Navigation } from "@/components/marketing/Navigation";
import { Footer } from "@/components/marketing/Footer";
import { ShieldCheck, Lock, Eye } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-primary">
      <Navigation />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              Enterprise-Grade <span className="text-brand-accent">Security</span>.
            </h1>
            <p className="text-xl text-foreground/60 leading-relaxed max-w-2xl mx-auto">
              Your brand data is your competitive advantage. We protect it with the highest industry standards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="p-8 rounded-3xl border border-brand-border bg-brand-surface/30 glass">
              <Lock className="w-8 h-8 text-brand-accent mb-6" />
              <h3 className="text-xl font-bold mb-4">Encryption</h3>
              <p className="text-foreground/50 text-sm leading-relaxed">
                All data is encrypted at rest using AES-256 and in transit via TLS 1.3.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-brand-border bg-brand-surface/30 glass">
              <ShieldCheck className="w-8 h-8 text-brand-accent mb-6" />
              <h3 className="text-xl font-bold mb-4">SOC2 Type II</h3>
              <p className="text-foreground/50 text-sm leading-relaxed">
                We maintain rigorous compliance standards to ensure your data is handled responsibly.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-brand-border bg-brand-surface/30 glass">
              <Eye className="w-8 h-8 text-brand-accent mb-6" />
              <h3 className="text-xl font-bold mb-4">Transparency</h3>
              <p className="text-foreground/50 text-sm leading-relaxed">
                Regular third-party audits and continuous monitoring across all our infrastructure.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
